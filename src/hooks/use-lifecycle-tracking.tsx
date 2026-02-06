/**
 * Lifecycle Tracking Hook
 * 
 * Provides easy-to-use tracking functions that integrate with the
 * observability system and user lifecycle state.
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { eventBus, logger, EventCategory } from '@/lib/user-lifecycle/observability';

// ============================================
// TYPES
// ============================================

type TrackableAction = 
  // Navigation
  | 'page_view'
  | 'tab_switch'
  // Radar
  | 'radar_opened'
  | 'opportunity_viewed'
  | 'opportunity_converted'
  | 'opportunity_dismissed'
  | 'research_generated'
  // Missions
  | 'mission_started'
  | 'mission_step_completed'
  | 'mission_completed'
  | 'mission_paused'
  // Chat
  | 'chat_message_sent'
  | 'chat_insight_learned'
  // Analytics
  | 'metric_entered'
  | 'prediction_viewed'
  // Payments
  | 'paywall_shown'
  | 'checkout_started'
  | 'payment_completed'
  // Generic
  | 'button_clicked'
  | 'feature_used';

interface TrackOptions {
  /** Additional data to include with the event */
  data?: Record<string, any>;
  /** Whether this is a Pro feature usage */
  isProFeature?: boolean;
  /** Custom event category */
  category?: EventCategory;
}

interface PerformanceTraceRef {
  startTime: number;
}

// ============================================
// HOOK
// ============================================

export function useLifecycleTracking() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const activeTracesRef = useRef<Map<string, PerformanceTraceRef>>(new Map());

  // Cleanup traces on unmount
  useEffect(() => {
    return () => {
      activeTracesRef.current.clear();
    };
  }, []);

  /**
   * Track a user action
   */
  const track = useCallback((
    action: TrackableAction,
    options: TrackOptions = {}
  ) => {
    const { data = {}, isProFeature = false, category = 'content_generation' } = options;

    eventBus.emit({
      category,
      severity: 'info',
      action,
      userId: user?.id,
      businessId: currentBusiness?.id,
      payload: {
        isProFeature,
        ...data,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
      },
    });
  }, [user?.id, currentBusiness?.id]);

  /**
   * Track a page view
   */
  const trackPageView = useCallback((pageName: string, data?: Record<string, any>) => {
    track('page_view', {
      data: {
        page: pageName,
        referrer: document.referrer,
        ...data,
      },
      category: 'performance',
    });
  }, [track]);

  /**
   * Track an error
   */
  const trackError = useCallback((
    code: string,
    message: string,
    context?: Record<string, any>
  ) => {
    eventBus.emit({
      category: 'audit',
      severity: 'error',
      action: 'error_occurred',
      userId: user?.id,
      businessId: currentBusiness?.id,
      payload: {
        url: window.location.pathname,
        ...context,
      },
      error: {
        code,
        message,
      },
    });
  }, [user?.id, currentBusiness?.id]);

  /**
   * Start a performance trace (returns a function to end it)
   */
  const startTrace = useCallback((name: string): (() => void) => {
    const traceId = `${name}_${Date.now()}`;
    activeTracesRef.current.set(traceId, { startTime: performance.now() });

    return () => {
      const trace = activeTracesRef.current.get(traceId);
      if (trace) {
        const duration = performance.now() - trace.startTime;
        logger.performance.apiCall(name, Math.round(duration), 200);
        activeTracesRef.current.delete(traceId);
      }
    };
  }, []);

  /**
   * Track a feature gate hit (when user tries to access Pro feature)
   */
  const trackFeatureGate = useCallback((
    feature: string,
    allowed: boolean,
    redirected?: boolean
  ) => {
    track('feature_used', {
      data: {
        feature,
        allowed,
        redirected: redirected ?? !allowed,
      },
      isProFeature: true,
      category: 'audit',
    });
  }, [track]);

  /**
   * Track conversion funnel step
   */
  const trackFunnelStep = useCallback((
    funnel: 'onboarding' | 'checkout' | 'activation',
    step: string,
    stepNumber: number,
    totalSteps: number,
    data?: Record<string, any>
  ) => {
    eventBus.emit({
      category: 'state_transition',
      severity: 'info',
      action: 'funnel_step',
      userId: user?.id,
      businessId: currentBusiness?.id,
      payload: {
        funnel,
        step,
        stepNumber,
        totalSteps,
        progress: Math.round((stepNumber / totalSteps) * 100),
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }, [user?.id, currentBusiness?.id]);

  return {
    track,
    trackPageView,
    trackError,
    startTrace,
    trackFeatureGate,
    trackFunnelStep,
  };
}

// ============================================
// HELPERS
// ============================================

function deriveCategory(action: TrackableAction): EventCategory {
  if (action.startsWith('radar_') || action.startsWith('opportunity_') || action.startsWith('research_')) {
    return 'content_generation';
  }
  if (action.startsWith('mission_')) {
    return 'content_generation';
  }
  if (action.startsWith('chat_')) {
    return 'content_generation';
  }
  if (action.startsWith('metric_') || action.startsWith('prediction_')) {
    return 'audit';
  }
  if (action.startsWith('paywall_') || action.startsWith('checkout_') || action.startsWith('payment_')) {
    return 'payment';
  }
  if (action === 'page_view' || action === 'tab_switch') {
    return 'performance';
  }
  return 'content_generation';
}

// ============================================
// COMPONENT WRAPPER
// ============================================

/**
 * HOC that automatically tracks page views
 */
export function withPageTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName: string
): React.FC<P> {
  return function TrackedPage(props: P) {
    const { trackPageView } = useLifecycleTracking();

    useEffect(() => {
      trackPageView(pageName);
    }, [trackPageView]);

    return React.createElement(WrappedComponent, props);
  };
}
