/**
 * Audit User State - Edge Function
 * 
 * Validates user state consistency and performs auto-repair if needed.
 * Called periodically or on-demand to ensure Zero-Failure state management.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// STATE DEFINITIONS (mirrored from client)
// ============================================

type UserState =
  | 'new_user'
  | 'setup_incomplete'
  | 'setup_complete_free'
  | 'free_active'
  | 'paywall_viewed'
  | 'checkout_started'
  | 'payment_pending'
  | 'payment_failed'
  | 'pro_active'
  | 'pro_grace_period'
  | 'pro_canceled'
  | 'pro_expired'
  | 'needs_repair'
  | 'admin';

interface AuditResult {
  userId: string;
  currentState: UserState;
  expectedState: UserState;
  isConsistent: boolean;
  repairApplied: boolean;
  repairAction?: string;
  issues: string[];
  data: Record<string, any>;
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { userId, autoRepair = true, batchMode = false } = body;

    // Single user audit
    if (userId && !batchMode) {
      const result = await auditSingleUser(supabase, userId, autoRepair);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch audit (all users with activity in last 7 days)
    if (batchMode) {
      const results = await auditBatchUsers(supabase, autoRepair);
      
      return new Response(JSON.stringify({
        totalAudited: results.length,
        inconsistencies: results.filter(r => !r.isConsistent).length,
        repaired: results.filter(r => r.repairApplied).length,
        results: results.filter(r => !r.isConsistent), // Only return inconsistent ones
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "userId or batchMode required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Audit user state error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============================================
// AUDIT FUNCTIONS
// ============================================

async function auditSingleUser(
  supabase: any,
  userId: string,
  autoRepair: boolean
): Promise<AuditResult> {
  const issues: string[] = [];

  // 1. Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    return {
      userId,
      currentState: 'new_user',
      expectedState: 'new_user',
      isConsistent: true,
      repairApplied: false,
      issues: ['No profile found'],
      data: {},
    };
  }

  // 2. Get business
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, setup_completed, settings, created_at')
    .eq('owner_id', userId);

  const business = businesses?.[0];

  // 3. Get subscription
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  const subscription = subscriptions?.[0];

  // 4. Check admin role
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  const isAdmin = !!adminRole;

  // 5. Calculate expected state
  const expectedState = calculateExpectedState({
    hasProfile: true,
    hasBusiness: !!business,
    setupCompleted: business?.setup_completed ?? false,
    isAdmin,
    subscription,
    businessSettings: business?.settings,
  });

  // 6. Get stored state (from settings or profile)
  const storedPlan = (business?.settings as any)?.plan;
  const currentState = determineCurrentState(storedPlan, expectedState, subscription);

  // 7. Check consistency
  const isConsistent = currentState === expectedState;

  // 8. Collect issues
  if (!isConsistent) {
    issues.push(`State mismatch: stored=${currentState}, expected=${expectedState}`);
  }

  // Check subscription vs settings consistency
  if (subscription?.status === 'active' && storedPlan !== 'pro') {
    issues.push('Subscription active but settings.plan is not pro');
  }

  if (storedPlan === 'pro' && (!subscription || subscription.status !== 'active')) {
    issues.push('Settings.plan is pro but no active subscription');
  }

  // Check expiry
  if (subscription?.expires_at) {
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    
    if (expiresAt < now && subscription.status === 'active') {
      issues.push('Subscription expired but status still active');
    }
  }

  // 9. Auto-repair if enabled
  let repairApplied = false;
  let repairAction: string | undefined;

  if (autoRepair && !isConsistent && business) {
    const repair = await applyRepair(supabase, userId, business.id, expectedState, subscription);
    repairApplied = repair.applied;
    repairAction = repair.action;
  }

  // 10. Log audit
  await logAudit(supabase, userId, {
    currentState,
    expectedState,
    isConsistent,
    repairApplied,
    repairAction,
    issues,
  });

  return {
    userId,
    currentState,
    expectedState,
    isConsistent,
    repairApplied,
    repairAction,
    issues,
    data: {
      hasBusiness: !!business,
      setupCompleted: business?.setup_completed,
      subscriptionStatus: subscription?.status,
      subscriptionExpiresAt: subscription?.expires_at,
      storedPlan,
      isAdmin,
    },
  };
}

async function auditBatchUsers(
  supabase: any,
  autoRepair: boolean
): Promise<AuditResult[]> {
  // Get users active in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('last_active_at', sevenDaysAgo.toISOString());

  if (!activeUsers?.length) {
    return [];
  }

  const results: AuditResult[] = [];

  for (const user of activeUsers) {
    const result = await auditSingleUser(supabase, user.id, autoRepair);
    results.push(result);
  }

  return results;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateExpectedState(data: {
  hasProfile: boolean;
  hasBusiness: boolean;
  setupCompleted: boolean;
  isAdmin: boolean;
  subscription: any;
  businessSettings: any;
}): UserState {
  if (data.isAdmin) return 'admin';
  if (!data.hasBusiness) return 'new_user';
  if (!data.setupCompleted) return 'setup_incomplete';

  const sub = data.subscription;
  if (!sub) return 'free_active';

  const now = new Date();
  const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;

  if (sub.status === 'active') {
    if (expiresAt && expiresAt < now) {
      // Expired but marked active - grace period or needs repair
      const gracePeriodEnd = new Date(expiresAt);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
      
      if (now <= gracePeriodEnd) return 'pro_grace_period';
      return 'pro_expired';
    }
    return 'pro_active';
  }

  if (sub.status === 'canceled') {
    if (expiresAt && expiresAt > now) return 'pro_canceled';
    return 'pro_expired';
  }

  if (sub.status === 'pending') return 'payment_pending';
  if (sub.status === 'failed') return 'payment_failed';

  return 'free_active';
}

function determineCurrentState(
  storedPlan: string | undefined,
  expectedState: UserState,
  subscription: any
): UserState {
  // If no stored plan, use expected
  if (!storedPlan) return expectedState;

  // Map stored plan to state
  if (storedPlan === 'pro') {
    if (subscription?.status === 'active') return 'pro_active';
    if (subscription?.status === 'canceled') return 'pro_canceled';
    return 'needs_repair'; // pro plan but no valid subscription
  }

  if (storedPlan === 'free') {
    return expectedState;
  }

  return expectedState;
}

async function applyRepair(
  supabase: any,
  userId: string,
  businessId: string,
  targetState: UserState,
  subscription: any
): Promise<{ applied: boolean; action: string }> {
  try {
    const updates: any = {};

    if (targetState === 'pro_active' && subscription?.status === 'active') {
      updates.plan = 'pro';
      updates.plan_id = subscription.plan_id;
      updates.plan_expires_at = subscription.expires_at;
    } else if (targetState === 'pro_expired' || targetState === 'free_active') {
      updates.plan = 'free';
      updates.plan_id = null;
      updates.plan_expires_at = null;
    }

    if (Object.keys(updates).length > 0) {
      // Get current settings
      const { data: business } = await supabase
        .from('businesses')
        .select('settings')
        .eq('id', businessId)
        .single();

      const currentSettings = business?.settings || {};
      const newSettings = { ...currentSettings, ...updates };

      await supabase
        .from('businesses')
        .update({ settings: newSettings })
        .eq('id', businessId);

      return {
        applied: true,
        action: `Updated settings: ${JSON.stringify(updates)}`,
      };
    }

    return { applied: false, action: 'No repair needed' };
  } catch (error) {
    console.error('Repair failed:', error);
    return { applied: false, action: `Repair failed: ${error}` };
  }
}

async function logAudit(
  supabase: any,
  userId: string,
  auditData: any
): Promise<void> {
  try {
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      event_type: 'state_audit',
      event_data: {
        ...auditData,
        audited_at: new Date().toISOString(),
      },
      page_path: '/system/audit',
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
