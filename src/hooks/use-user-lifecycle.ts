/**
 * User Lifecycle Hook
 * 
 * Provides the current user state, handles transitions, and triggers auto-repair.
 */

import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessContext } from '@/contexts/BusinessContext';
import { useSubscription } from '@/hooks/use-subscription';
import {
  UserState,
  StateTransitionEvent,
  UserStateData,
  calculateUserState,
  validateTransition,
  attemptAutoRepair,
  STATE_METADATA,
  TransitionResult,
} from '@/lib/user-lifecycle/state-machine';

// ============================================
// TYPES
// ============================================

export interface UserLifecycleState {
  // Current state
  state: UserState;
  previousState: UserState | null;
  stateMetadata: typeof STATE_METADATA[UserState];
  
  // Capabilities
  canUsePro: boolean;
  showPaywall: boolean;
  isFullySetup: boolean;
  needsRepair: boolean;
  
  // State data
  data: UserStateData | null;
  
  // Transition helpers
  transition: (event: StateTransitionEvent) => Promise<TransitionResult>;
  forceRepair: () => Promise<void>;
  
  // Loading state
  loading: boolean;
  error: string | null;
}

// ============================================
// HOOK
// ============================================

// Safe hook that doesn't throw if BusinessProvider is missing
function useOptionalBusiness() {
  const context = useContext(BusinessContext);
  return context ?? { currentBusiness: null, businesses: [], loading: true, setCurrentBusiness: () => {}, refreshBusinesses: async () => {} };
}

export function useUserLifecycle(): UserLifecycleState {
  const { user, loading: authLoading } = useAuth();
  const businessContext = useOptionalBusiness();
  const currentBusiness = businessContext.currentBusiness;
  const businessLoading = businessContext.loading;
  const { isPro, expiresAt, planId } = useSubscription();

  const [state, setState] = useState<UserState>('new_user');
  const [previousState, setPreviousState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateData, setStateData] = useState<UserStateData | null>(null);

  // Calculate state from data
  const calculateAndSetState = useCallback(async () => {
    if (!user) {
      setState('new_user');
      setStateData(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_login_at, last_active_at')
        .eq('id', user.id)
        .maybeSingle();

      // Admin: server-side source of truth (user_roles)
      const { data: adminRole, error: adminErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminErr) {
        console.warn('[UserLifecycle] Could not read user role:', adminErr.message);
      }

      const isAdmin = !!adminRole;

      // Get subscription data (latest)
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, expires_at, plan_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const subscription = subscriptions?.[0];

      // Build state data
      const data: UserStateData = {
        userId: user.id,
        hasProfile: !!profile,
        hasCompletedSetup: currentBusiness?.setup_completed ?? false,
        hasBusiness: !!currentBusiness,
        isAdmin,
        subscription: subscription ? {
          status: subscription.status as UserStateData['subscription']['status'],
          expiresAt: subscription.expires_at ? new Date(subscription.expires_at) : null,
          isPro: isPro,
        } : undefined,
        lastActivityAt: profile?.last_login_at ? new Date(profile.last_login_at) : undefined,
      };

      setStateData(data);

      // Calculate state
      const calculatedState = calculateUserState(data);
      
      // Check if needs repair
      if (calculatedState !== state && state !== 'new_user') {
        setPreviousState(state);
      }

      setState(calculatedState);
      setError(null);
    } catch (err) {
      console.error('[UserLifecycle] Error calculating state:', err);
      setError('Error calculating user state');
    } finally {
      setLoading(false);
    }
  }, [user, currentBusiness, isPro, state]);

  // Initial load and refresh on auth/business changes
  useEffect(() => {
    if (!authLoading && !businessLoading) {
      calculateAndSetState();
    }
  }, [authLoading, businessLoading, user?.id, currentBusiness?.id, isPro]);

  // Transition function
  const transition = useCallback(async (
    event: StateTransitionEvent
  ): Promise<TransitionResult> => {
    const result = validateTransition(state, event);

    if (!result.valid) {
      console.warn('[UserLifecycle] Invalid transition:', result.error);
      
      // Log the failed transition attempt
      await logStateEvent(user?.id, state, event, false, result.error);
      
      return result;
    }

    // Log successful transition
    await logStateEvent(user?.id, state, event, true);

    // Update state
    setPreviousState(state);
    setState(result.newState!);

    return result;
  }, [state, user?.id]);

  // Force repair function
  const forceRepair = useCallback(async () => {
    if (!stateData) return;

    const repairResult = attemptAutoRepair(stateData, state);
    
    if (repairResult) {
      console.log('[UserLifecycle] Auto-repair applied:', repairResult.action);
      
      // Log repair
      await logStateEvent(
        user?.id, 
        state, 
        'state_repaired', 
        true, 
        repairResult.action
      );

      setPreviousState(state);
      setState(repairResult.newState);
    }
  }, [stateData, state, user?.id]);

  // Derived values
  const stateMetadata = STATE_METADATA[state];
  const canUsePro = stateMetadata.canUsePro;
  const showPaywall = stateMetadata.showPaywall;
  const isFullySetup = currentBusiness?.setup_completed ?? false;
  const needsRepair = state === 'needs_repair';

  return {
    state,
    previousState,
    stateMetadata,
    canUsePro,
    showPaywall,
    isFullySetup,
    needsRepair,
    data: stateData,
    transition,
    forceRepair,
    loading: loading || authLoading || businessLoading,
    error,
  };
}

// ============================================
// LOGGING HELPER
// ============================================

async function logStateEvent(
  userId: string | undefined,
  fromState: UserState,
  event: StateTransitionEvent,
  success: boolean,
  details?: string
): Promise<void> {
  if (!userId) return;

  try {
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      event_type: 'state_transition',
      event_data: {
        from_state: fromState,
        event,
        success,
        details,
        timestamp: new Date().toISOString(),
      },
      page_path: window.location.pathname,
    });
  } catch (err) {
    console.error('[UserLifecycle] Failed to log state event:', err);
  }
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Check if user can access a Pro feature
 */
export function useCanAccessProFeature(feature: string): boolean {
  const { canUsePro } = useUserLifecycle();
  return canUsePro;
}

/**
 * Get user's onboarding progress
 */
export function useOnboardingProgress(): {
  isComplete: boolean;
  currentStep: 'signup' | 'setup' | 'first_action' | 'complete';
  progress: number;
} {
  const { state, isFullySetup } = useUserLifecycle();

  const stepMap: Record<UserState, 'signup' | 'setup' | 'first_action' | 'complete'> = {
    new_user: 'signup',
    setup_incomplete: 'setup',
    setup_complete_free: 'first_action',
    free_active: 'complete',
    paywall_viewed: 'complete',
    checkout_started: 'complete',
    payment_pending: 'complete',
    payment_failed: 'complete',
    pro_active: 'complete',
    pro_grace_period: 'complete',
    pro_canceled: 'complete',
    pro_expired: 'complete',
    needs_repair: 'setup',
    admin: 'complete',
  };

  const progressMap: Record<string, number> = {
    signup: 25,
    setup: 50,
    first_action: 75,
    complete: 100,
  };

  const currentStep = stepMap[state] || 'signup';

  return {
    isComplete: currentStep === 'complete',
    currentStep,
    progress: progressMap[currentStep] || 0,
  };
}
