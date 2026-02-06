/**
 * Repair Engine
 * 
 * Auto-repair functions for common inconsistencies.
 * Every repair is logged for audit trail.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// REPAIR TYPES
// ============================================

export interface RepairResult {
  success: boolean;
  repairType: string;
  businessId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  error?: string;
  timestamp: Date;
}

export interface RepairJob {
  id: string;
  businessId: string;
  repairType: RepairType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  result?: RepairResult;
  createdAt: Date;
}

export type RepairType = 
  | 'subscription_sync'
  | 'brain_init'
  | 'setup_completion'
  | 'duplicate_cleanup'
  | 'orphan_cleanup'
  | 'rate_limit_reset';

// ============================================
// REPAIR FUNCTIONS
// ============================================

/**
 * Sync subscription status with business settings
 */
export async function repairSubscriptionSync(businessId: string): Promise<RepairResult> {
  const timestamp = new Date();
  
  try {
    // Get current business settings
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, settings')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      throw new Error(`Business not found: ${businessError?.message}`);
    }

    const currentSettings = (business.settings as Record<string, unknown>) || {};

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    // Determine correct plan status
    const shouldBePro = !!subscription;
    const currentPlan = currentSettings.plan as string || 'free';
    const needsRepair = (shouldBePro && currentPlan !== 'pro') || 
                        (!shouldBePro && currentPlan === 'pro');

    if (!needsRepair) {
      return {
        success: true,
        repairType: 'subscription_sync',
        businessId,
        before: { plan: currentPlan },
        after: { plan: currentPlan },
        timestamp,
      };
    }

    // Apply repair
    const newSettings = {
      ...currentSettings,
      plan: shouldBePro ? 'pro' : 'free',
      plan_id: subscription?.plan_id || 'free',
      plan_expires_at: subscription?.expires_at || null,
      payment_provider: subscription?.payment_provider || null,
      last_synced_at: timestamp.toISOString(),
    };

    const { error: updateError } = await supabase
      .from('businesses')
      .update({ settings: newSettings })
      .eq('id', businessId);

    if (updateError) {
      throw new Error(`Failed to update settings: ${updateError.message}`);
    }

    console.log(`[RepairEngine] subscription_sync completed for ${businessId}:`, {
      before: currentPlan,
      after: shouldBePro ? 'pro' : 'free',
    });

    return {
      success: true,
      repairType: 'subscription_sync',
      businessId,
      before: { plan: currentPlan },
      after: { plan: shouldBePro ? 'pro' : 'free' },
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[RepairEngine] subscription_sync failed for ${businessId}:`, error);

    return {
      success: false,
      repairType: 'subscription_sync',
      businessId,
      before: {},
      after: {},
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Initialize brain for business if missing
 */
export async function repairBrainInit(businessId: string): Promise<RepairResult> {
  const timestamp = new Date();

  try {
    // Check if brain exists
    const { data: existingBrain } = await supabase
      .from('business_brains')
      .select('id')
      .eq('business_id', businessId)
      .single();

    if (existingBrain) {
      return {
        success: true,
        repairType: 'brain_init',
        businessId,
        before: { brainExists: true },
        after: { brainExists: true },
        timestamp,
      };
    }

    // Get business info for initialization
    const { data: business } = await supabase
      .from('businesses')
      .select('category, country')
      .eq('id', businessId)
      .single();

    // Create brain
    const { error: insertError } = await supabase
      .from('business_brains')
      .insert({
        business_id: businessId,
        primary_business_type: business?.category || 'restaurant',
        current_focus: 'ventas',
        factual_memory: {},
        dynamic_memory: {},
        decisions_memory: { missions_created: 0, missions_completed: 0, feedback_given: 0 },
        preferences_memory: { language: 'es', currency: 'ARS' },
        locale_profile: {
          voice: business?.country === 'AR' ? 'voseo' : 'tuteo',
          formality: 'pro',
        },
      });

    if (insertError) {
      throw new Error(`Failed to create brain: ${insertError.message}`);
    }

    console.log(`[RepairEngine] brain_init completed for ${businessId}`);

    return {
      success: true,
      repairType: 'brain_init',
      businessId,
      before: { brainExists: false },
      after: { brainExists: true },
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[RepairEngine] brain_init failed for ${businessId}:`, error);

    return {
      success: false,
      repairType: 'brain_init',
      businessId,
      before: {},
      after: {},
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Clean up duplicate opportunities/missions
 */
export async function repairDuplicateCleanup(
  businessId: string,
  contentType: 'opportunity' | 'mission'
): Promise<RepairResult> {
  const timestamp = new Date();

  try {
    let duplicatesRemoved = 0;

    if (contentType === 'opportunity') {
      // Find duplicates by concept_hash
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, concept_hash, created_at')
        .eq('business_id', businessId)
        .is('dismissed_at', null)
        .order('created_at', { ascending: true });

      if (opportunities) {
        const seenHashes = new Map<string, string>();
        const toDelete: string[] = [];

        for (const opp of opportunities) {
          if (opp.concept_hash) {
            if (seenHashes.has(opp.concept_hash)) {
              toDelete.push(opp.id);
            } else {
              seenHashes.set(opp.concept_hash, opp.id);
            }
          }
        }

        if (toDelete.length > 0) {
          // Soft delete by setting dismissed_at
          await supabase
            .from('opportunities')
            .update({ dismissed_at: timestamp.toISOString() })
            .in('id', toDelete);

          duplicatesRemoved = toDelete.length;
        }
      }
    } else if (contentType === 'mission') {
      // Find duplicate missions by title similarity
      const { data: missions } = await supabase
        .from('daily_actions')
        .select('id, title, created_at')
        .eq('business_id', businessId)
        .in('status', ['pending', 'snoozed'])
        .order('created_at', { ascending: true });

      if (missions) {
        const seenTitles = new Map<string, string>();
        const toCancel: string[] = [];

        for (const mission of missions) {
          const normalizedTitle = mission.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Check for similar titles
          let isDuplicate = false;
          for (const [existingTitle] of seenTitles) {
            if (similarity(normalizedTitle, existingTitle) > 0.8) {
              isDuplicate = true;
              toCancel.push(mission.id);
              break;
            }
          }

          if (!isDuplicate) {
            seenTitles.set(normalizedTitle, mission.id);
          }
        }

        if (toCancel.length > 0) {
          await supabase
            .from('daily_actions')
            .update({ status: 'skipped' })
            .in('id', toCancel);

          duplicatesRemoved = toCancel.length;
        }
      }
    }

    console.log(`[RepairEngine] duplicate_cleanup completed for ${businessId}:`, {
      contentType,
      duplicatesRemoved,
    });

    return {
      success: true,
      repairType: 'duplicate_cleanup',
      businessId,
      before: { duplicates: duplicatesRemoved },
      after: { duplicates: 0 },
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[RepairEngine] duplicate_cleanup failed for ${businessId}:`, error);

    return {
      success: false,
      repairType: 'duplicate_cleanup',
      businessId,
      before: {},
      after: {},
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Fix setup completion status
 */
export async function repairSetupCompletion(businessId: string): Promise<RepairResult> {
  const timestamp = new Date();

  try {
    // Get setup progress
    const { data: progress } = await supabase
      .from('business_setup_progress')
      .select('*')
      .eq('business_id', businessId)
      .single();

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('setup_completed')
      .eq('id', businessId)
      .single();

    if (!business) {
      throw new Error('Business not found');
    }

    // Determine if setup should be complete
    const pmoStatus = (progress?.pmo_status as Record<string, boolean>) || {};
    const requiredFields = ['identity', 'model', 'sales'];
    const isActuallyComplete = requiredFields.every(field => pmoStatus[field] === true);

    const needsRepair = business.setup_completed !== isActuallyComplete;

    if (!needsRepair) {
      return {
        success: true,
        repairType: 'setup_completion',
        businessId,
        before: { setup_completed: business.setup_completed },
        after: { setup_completed: business.setup_completed },
        timestamp,
      };
    }

    // Apply repair
    await supabase
      .from('businesses')
      .update({ setup_completed: isActuallyComplete })
      .eq('id', businessId);

    if (isActuallyComplete && progress) {
      await supabase
        .from('business_setup_progress')
        .update({ completed_at: timestamp.toISOString() })
        .eq('business_id', businessId);
    }

    console.log(`[RepairEngine] setup_completion completed for ${businessId}:`, {
      before: business.setup_completed,
      after: isActuallyComplete,
    });

    return {
      success: true,
      repairType: 'setup_completion',
      businessId,
      before: { setup_completed: business.setup_completed },
      after: { setup_completed: isActuallyComplete },
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[RepairEngine] setup_completion failed for ${businessId}:`, error);

    return {
      success: false,
      repairType: 'setup_completion',
      businessId,
      before: {},
      after: {},
      error: errorMessage,
      timestamp,
    };
  }
}

// ============================================
// BATCH REPAIR
// ============================================

export async function runAllRepairs(businessId: string): Promise<RepairResult[]> {
  const results: RepairResult[] = [];

  // Run repairs in order of priority
  results.push(await repairSubscriptionSync(businessId));
  results.push(await repairBrainInit(businessId));
  results.push(await repairSetupCompletion(businessId));
  results.push(await repairDuplicateCleanup(businessId, 'opportunity'));
  results.push(await repairDuplicateCleanup(businessId, 'mission'));

  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.warn(`[RepairEngine] ${failures.length} repairs failed for ${businessId}`);
  }

  return results;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function similarity(s1: string, s2: string): number {
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const costs: number[] = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }
  
  return (longer.length - costs[longer.length]) / longer.length;
}
