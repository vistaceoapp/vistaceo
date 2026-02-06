/**
 * Observability Module
 * 
 * Structured logging, error tracking, and alerting for Zero-Failure system.
 */

// ============================================
// EVENT TYPES
// ============================================

export type EventSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type EventCategory = 
  | 'audit'
  | 'repair'
  | 'state_transition'
  | 'content_generation'
  | 'payment'
  | 'auth'
  | 'integration'
  | 'performance';

export interface SystemEvent {
  id: string;
  timestamp: Date;
  category: EventCategory;
  severity: EventSeverity;
  action: string;
  businessId?: string;
  userId?: string;
  payload: Record<string, unknown>;
  duration_ms?: number;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    source: string;
    version: string;
    environment: string;
  };
}

// ============================================
// EVENT EMITTER
// ============================================

type EventHandler = (event: SystemEvent) => void;

class EventBus {
  private handlers: Map<EventCategory | '*', Set<EventHandler>> = new Map();
  private eventBuffer: SystemEvent[] = [];
  private maxBufferSize = 100;

  on(category: EventCategory | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(category)) {
      this.handlers.set(category, new Set());
    }
    this.handlers.get(category)!.add(handler);
    
    return () => {
      this.handlers.get(category)?.delete(handler);
    };
  }

  emit(event: Omit<SystemEvent, 'id' | 'timestamp' | 'metadata'>): void {
    const fullEvent: SystemEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      metadata: {
        source: 'vistaceo-client',
        version: '1.0.0',
        environment: import.meta.env.MODE || 'development',
      },
    };

    // Add to buffer
    this.eventBuffer.push(fullEvent);
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift();
    }

    // Notify handlers
    this.handlers.get(event.category)?.forEach(h => h(fullEvent));
    this.handlers.get('*')?.forEach(h => h(fullEvent));

    // Log based on severity
    this.logEvent(fullEvent);
  }

  getRecentEvents(count: number = 50): SystemEvent[] {
    return this.eventBuffer.slice(-count);
  }

  private logEvent(event: SystemEvent): void {
    const prefix = `[${event.category.toUpperCase()}]`;
    const message = `${prefix} ${event.action}`;

    switch (event.severity) {
      case 'debug':
        console.debug(message, event.payload);
        break;
      case 'info':
        console.info(message, event.payload);
        break;
      case 'warn':
        console.warn(message, event.payload);
        break;
      case 'error':
      case 'critical':
        console.error(message, event.payload, event.error);
        break;
    }
  }
}

export const eventBus = new EventBus();

// ============================================
// CONVENIENCE LOGGERS
// ============================================

export const logger = {
  audit: {
    contentAudited: (businessId: string, contentType: string, passed: boolean, scores: Record<string, number>) => {
      eventBus.emit({
        category: 'audit',
        severity: passed ? 'info' : 'warn',
        action: 'content_audited',
        businessId,
        payload: { contentType, passed, scores },
      });
    },

    rateLimitHit: (businessId: string, contentType: string, limit: number, current: number) => {
      eventBus.emit({
        category: 'audit',
        severity: 'warn',
        action: 'rate_limit_hit',
        businessId,
        payload: { contentType, limit, current },
      });
    },

    duplicateDetected: (businessId: string, contentType: string, originalId: string, similarity: number) => {
      eventBus.emit({
        category: 'audit',
        severity: 'info',
        action: 'duplicate_detected',
        businessId,
        payload: { contentType, originalId, similarity },
      });
    },
  },

  repair: {
    started: (businessId: string, repairType: string) => {
      eventBus.emit({
        category: 'repair',
        severity: 'info',
        action: 'repair_started',
        businessId,
        payload: { repairType },
      });
    },

    completed: (businessId: string, repairType: string, success: boolean, changes: Record<string, unknown>) => {
      eventBus.emit({
        category: 'repair',
        severity: success ? 'info' : 'error',
        action: 'repair_completed',
        businessId,
        payload: { repairType, success, changes },
      });
    },

    failed: (businessId: string, repairType: string, error: string) => {
      eventBus.emit({
        category: 'repair',
        severity: 'error',
        action: 'repair_failed',
        businessId,
        payload: { repairType },
        error: { code: 'REPAIR_FAILED', message: error },
      });
    },
  },

  state: {
    transitioned: (businessId: string, userId: string, from: string, to: string, event: string) => {
      eventBus.emit({
        category: 'state_transition',
        severity: 'info',
        action: 'state_transitioned',
        businessId,
        userId,
        payload: { from, to, event },
      });
    },

    invalidTransition: (businessId: string, from: string, attemptedEvent: string) => {
      eventBus.emit({
        category: 'state_transition',
        severity: 'warn',
        action: 'invalid_transition_attempted',
        businessId,
        payload: { from, attemptedEvent },
      });
    },

    repairTriggered: (businessId: string, reason: string) => {
      eventBus.emit({
        category: 'state_transition',
        severity: 'warn',
        action: 'repair_triggered',
        businessId,
        payload: { reason },
      });
    },
  },

  content: {
    generated: (businessId: string, contentType: string, count: number, source: string) => {
      eventBus.emit({
        category: 'content_generation',
        severity: 'info',
        action: 'content_generated',
        businessId,
        payload: { contentType, count, source },
      });
    },

    rejected: (businessId: string, contentType: string, reason: string, scores: Record<string, number>) => {
      eventBus.emit({
        category: 'content_generation',
        severity: 'info',
        action: 'content_rejected',
        businessId,
        payload: { contentType, reason, scores },
      });
    },

    published: (businessId: string, contentType: string, id: string) => {
      eventBus.emit({
        category: 'content_generation',
        severity: 'info',
        action: 'content_published',
        businessId,
        payload: { contentType, id },
      });
    },
  },

  payment: {
    initiated: (businessId: string, provider: string, planId: string) => {
      eventBus.emit({
        category: 'payment',
        severity: 'info',
        action: 'payment_initiated',
        businessId,
        payload: { provider, planId },
      });
    },

    succeeded: (businessId: string, provider: string, planId: string, paymentId: string) => {
      eventBus.emit({
        category: 'payment',
        severity: 'info',
        action: 'payment_succeeded',
        businessId,
        payload: { provider, planId, paymentId },
      });
    },

    failed: (businessId: string, provider: string, error: string) => {
      eventBus.emit({
        category: 'payment',
        severity: 'error',
        action: 'payment_failed',
        businessId,
        payload: { provider },
        error: { code: 'PAYMENT_FAILED', message: error },
      });
    },

    webhookReceived: (provider: string, eventType: string, paymentId?: string) => {
      eventBus.emit({
        category: 'payment',
        severity: 'info',
        action: 'webhook_received',
        payload: { provider, eventType, paymentId },
      });
    },

    webhookDuplicate: (provider: string, paymentId: string) => {
      eventBus.emit({
        category: 'payment',
        severity: 'warn',
        action: 'webhook_duplicate',
        payload: { provider, paymentId },
      });
    },
  },

  performance: {
    apiCall: (endpoint: string, duration_ms: number, status: number) => {
      eventBus.emit({
        category: 'performance',
        severity: duration_ms > 3000 ? 'warn' : 'debug',
        action: 'api_call',
        duration_ms,
        payload: { endpoint, status },
      });
    },

    slowQuery: (query: string, duration_ms: number) => {
      eventBus.emit({
        category: 'performance',
        severity: 'warn',
        action: 'slow_query',
        duration_ms,
        payload: { query: query.slice(0, 100) },
      });
    },
  },
};

// ============================================
// ALERT THRESHOLDS
// ============================================

export interface AlertRule {
  id: string;
  name: string;
  condition: (events: SystemEvent[]) => boolean;
  threshold: {
    count: number;
    window_ms: number;
  };
  severity: EventSeverity;
  action: 'log' | 'notify' | 'auto_repair';
}

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'high_error_rate',
    name: 'High Error Rate',
    condition: (events) => {
      const errors = events.filter(e => e.severity === 'error' || e.severity === 'critical');
      return errors.length >= 10;
    },
    threshold: { count: 10, window_ms: 60000 },
    severity: 'critical',
    action: 'notify',
  },
  {
    id: 'repair_failures',
    name: 'Multiple Repair Failures',
    condition: (events) => {
      const failures = events.filter(e => 
        e.category === 'repair' && e.action === 'repair_failed'
      );
      return failures.length >= 3;
    },
    threshold: { count: 3, window_ms: 300000 },
    severity: 'error',
    action: 'notify',
  },
  {
    id: 'payment_failures',
    name: 'Payment Failures Spike',
    condition: (events) => {
      const failures = events.filter(e => 
        e.category === 'payment' && e.action === 'payment_failed'
      );
      return failures.length >= 5;
    },
    threshold: { count: 5, window_ms: 300000 },
    severity: 'critical',
    action: 'notify',
  },
  {
    id: 'content_rejection_rate',
    name: 'High Content Rejection Rate',
    condition: (events) => {
      const rejected = events.filter(e => 
        e.category === 'content_generation' && e.action === 'content_rejected'
      );
      return rejected.length >= 20;
    },
    threshold: { count: 20, window_ms: 3600000 },
    severity: 'warn',
    action: 'log',
  },
];

// ============================================
// METRICS AGGREGATION
// ============================================

export interface SystemMetrics {
  period: { start: Date; end: Date };
  events: {
    total: number;
    byCategory: Record<EventCategory, number>;
    bySeverity: Record<EventSeverity, number>;
  };
  repairs: {
    total: number;
    successful: number;
    failed: number;
  };
  content: {
    generated: number;
    published: number;
    rejected: number;
  };
  payments: {
    initiated: number;
    succeeded: number;
    failed: number;
  };
}

export function aggregateMetrics(events: SystemEvent[]): SystemMetrics {
  const now = new Date();
  const periodStart = events.length > 0 ? events[0].timestamp : now;

  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  let repairsTotal = 0, repairsSuccessful = 0, repairsFailed = 0;
  let contentGenerated = 0, contentPublished = 0, contentRejected = 0;
  let paymentsInitiated = 0, paymentsSucceeded = 0, paymentsFailed = 0;

  for (const event of events) {
    byCategory[event.category] = (byCategory[event.category] || 0) + 1;
    bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;

    if (event.category === 'repair') {
      if (event.action === 'repair_completed') {
        repairsTotal++;
        if (event.payload.success) repairsSuccessful++;
        else repairsFailed++;
      }
    }

    if (event.category === 'content_generation') {
      if (event.action === 'content_generated') contentGenerated += (event.payload.count as number) || 1;
      if (event.action === 'content_published') contentPublished++;
      if (event.action === 'content_rejected') contentRejected++;
    }

    if (event.category === 'payment') {
      if (event.action === 'payment_initiated') paymentsInitiated++;
      if (event.action === 'payment_succeeded') paymentsSucceeded++;
      if (event.action === 'payment_failed') paymentsFailed++;
    }
  }

  return {
    period: { start: periodStart, end: now },
    events: {
      total: events.length,
      byCategory: byCategory as Record<EventCategory, number>,
      bySeverity: bySeverity as Record<EventSeverity, number>,
    },
    repairs: {
      total: repairsTotal,
      successful: repairsSuccessful,
      failed: repairsFailed,
    },
    content: {
      generated: contentGenerated,
      published: contentPublished,
      rejected: contentRejected,
    },
    payments: {
      initiated: paymentsInitiated,
      succeeded: paymentsSucceeded,
      failed: paymentsFailed,
    },
  };
}
