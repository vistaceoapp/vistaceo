import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';

type EventType = 
  | 'login'
  | 'logout'
  | 'page_view'
  | 'mission_start'
  | 'mission_complete'
  | 'mission_pause'
  | 'chat_message'
  | 'radar_view'
  | 'checkin'
  | 'prediction_view'
  | 'subscription_start'
  | 'feature_use';

interface TrackEventOptions {
  eventType: EventType;
  eventData?: Record<string, unknown>;
  pagePath?: string;
}

export function useActivityTracker() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const sessionIdRef = useRef<string>('');

  // Generate session ID on mount
  useEffect(() => {
    const existing = sessionStorage.getItem('va_session');
    if (existing) {
      sessionIdRef.current = existing;
    } else {
      const newSession = `s_${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`;
      sessionStorage.setItem('va_session', newSession);
      sessionIdRef.current = newSession;
    }
  }, []);

  const trackEvent = useCallback(async (options: TrackEventOptions) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.functions.invoke('track-user-activity', {
        body: {
          event_type: options.eventType,
          event_data: options.eventData || {},
          page_path: options.pagePath || window.location.pathname,
          session_id: sessionIdRef.current,
          business_id: currentBusiness?.id,
        },
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.debug('[Activity Tracker] Failed to track event:', error);
    }
  }, [user, currentBusiness?.id]);

  // Track page views
  const trackPageView = useCallback((pagePath?: string) => {
    trackEvent({ eventType: 'page_view', pagePath });
  }, [trackEvent]);

  // Track mission events
  const trackMissionStart = useCallback((missionId: string, missionTitle: string) => {
    trackEvent({ 
      eventType: 'mission_start', 
      eventData: { missionId, missionTitle } 
    });
  }, [trackEvent]);

  const trackMissionComplete = useCallback((missionId: string, missionTitle: string) => {
    trackEvent({ 
      eventType: 'mission_complete', 
      eventData: { missionId, missionTitle } 
    });
  }, [trackEvent]);

  // Track chat
  const trackChatMessage = useCallback(() => {
    trackEvent({ eventType: 'chat_message' });
  }, [trackEvent]);

  // Track radar view
  const trackRadarView = useCallback(() => {
    trackEvent({ eventType: 'radar_view' });
  }, [trackEvent]);

  // Track checkin
  const trackCheckin = useCallback((checkinType: string) => {
    trackEvent({ 
      eventType: 'checkin', 
      eventData: { checkinType } 
    });
  }, [trackEvent]);

  // Track login
  const trackLogin = useCallback(() => {
    trackEvent({ eventType: 'login' });
  }, [trackEvent]);

  // Track feature usage
  const trackFeatureUse = useCallback((featureName: string, details?: Record<string, unknown>) => {
    trackEvent({ 
      eventType: 'feature_use', 
      eventData: { featureName, ...details } 
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackMissionStart,
    trackMissionComplete,
    trackChatMessage,
    trackRadarView,
    trackCheckin,
    trackLogin,
    trackFeatureUse,
  };
}
