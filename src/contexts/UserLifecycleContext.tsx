/**
 * User Lifecycle Context
 * 
 * Global provider that manages user state machine, auto-repair, and observability.
 * Must wrap the entire app to ensure consistent state across all components.
 */

import { createContext, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { useUserLifecycle, UserLifecycleState } from '@/hooks/use-user-lifecycle';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessContext } from '@/contexts/BusinessContext';
import { logger, eventBus } from '@/lib/user-lifecycle/observability';
import { supabase } from '@/integrations/supabase/client';

// Safe hook that doesn't throw if BusinessProvider is missing
function useOptionalBusiness() {
  const context = useContext(BusinessContext);
  return context ?? { currentBusiness: null, businesses: [], loading: true, setCurrentBusiness: () => {}, refreshBusinesses: async () => {} };
}

// ============================================
// CONTEXT
// ============================================

const UserLifecycleContext = createContext<UserLifecycleState | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface UserLifecycleProviderProps {
  children: ReactNode;
}

export function UserLifecycleProvider({ children }: UserLifecycleProviderProps) {
  const { user } = useAuth();
  const { currentBusiness } = useOptionalBusiness();
  const lifecycle = useUserLifecycle();
  const lastStateRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date>(new Date());

  // Track state changes
  useEffect(() => {
    if (lifecycle.state && lifecycle.state !== lastStateRef.current) {
      const previousState = lastStateRef.current;
      lastStateRef.current = lifecycle.state;

      // Track state transition using logger
      if (previousState && currentBusiness?.id && user?.id) {
        logger.state.transitioned(
          currentBusiness.id,
          user.id,
          previousState,
          lifecycle.state,
          'auto'
        );
      }

      // Auto-repair if needed
      if (lifecycle.needsRepair) {
        console.warn('[UserLifecycle] State needs repair, triggering auto-repair...');
        lifecycle.forceRepair().catch(err => {
          if (currentBusiness?.id) {
            logger.repair.failed(currentBusiness.id, 'auto_repair', err.message);
          }
        });
      }
    }
  }, [lifecycle.state, lifecycle.needsRepair, lifecycle.forceRepair, user?.id, currentBusiness?.id]);

  // Track session start
  useEffect(() => {
    if (user?.id && currentBusiness?.id) {
      eventBus.emit({
        category: 'auth',
        severity: 'info',
        action: 'session_started',
        userId: user.id,
        businessId: currentBusiness.id,
        payload: {
          userState: lifecycle.state,
          isPro: lifecycle.canUsePro,
          sessionStart: sessionStartRef.current.toISOString(),
        },
      });
    }
  }, [user?.id, currentBusiness?.id, lifecycle.state, lifecycle.canUsePro]);

  // Periodic state audit (every 5 minutes)
  useEffect(() => {
    if (!user?.id) return;

    const auditInterval = setInterval(async () => {
      try {
        const { error } = await supabase.functions.invoke('audit-user-state', {
          body: { userId: user.id, autoRepair: true },
        });

        if (error) {
          console.error('[UserLifecycle] Audit failed:', error);
        }
      } catch (err) {
        // Silent fail - don't disrupt user experience
        console.error('[UserLifecycle] Audit error:', err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(auditInterval);
  }, [user?.id]);

  // Track page visibility for session tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!user?.id) return;
      
      eventBus.emit({
        category: 'performance',
        severity: 'debug',
        action: document.hidden ? 'session_paused' : 'session_resumed',
        userId: user.id,
        businessId: currentBusiness?.id,
        payload: {
          reason: document.hidden ? 'tab_hidden' : 'tab_visible',
          timestamp: new Date().toISOString(),
        },
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, currentBusiness?.id]);

  return (
    <UserLifecycleContext.Provider value={lifecycle}>
      {children}
    </UserLifecycleContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useUserLifecycleContext(): UserLifecycleState {
  const context = useContext(UserLifecycleContext);
  
  if (!context) {
    throw new Error('useUserLifecycleContext must be used within UserLifecycleProvider');
  }
  
  return context;
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Check if user can access Pro features
 */
export function useCanUsePro(): boolean {
  const { canUsePro } = useUserLifecycleContext();
  return canUsePro;
}

/**
 * Check if paywall should be shown
 */
export function useShouldShowPaywall(): boolean {
  const { showPaywall } = useUserLifecycleContext();
  return showPaywall;
}

/**
 * Get user state for conditional rendering
 */
export function useUserState() {
  const { state, stateMetadata, loading } = useUserLifecycleContext();
  return { state, metadata: stateMetadata, loading };
}

/**
 * Track user action with lifecycle context
 */
export function useTrackAction() {
  const { state, canUsePro } = useUserLifecycleContext();
  const { user } = useAuth();
  const { currentBusiness } = useOptionalBusiness();

  return useCallback((actionType: string, data?: Record<string, any>) => {
    eventBus.emit({
      category: 'content_generation',
      severity: 'info',
      action: actionType,
      userId: user?.id,
      businessId: currentBusiness?.id,
      payload: {
        userState: state,
        isPro: canUsePro,
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }, [state, canUsePro, user?.id, currentBusiness?.id]);
}
