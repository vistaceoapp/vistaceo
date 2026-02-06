/**
 * User Lifecycle State Machine - Zero-Failure Framework
 * 
 * Defines all valid user states and transitions with audit logging.
 * Every state change MUST go through validateTransition() to ensure consistency.
 */

// ============================================
// STATE DEFINITIONS
// ============================================

export type UserState =
  | 'new_user'              // Just signed up, no setup started
  | 'setup_incomplete'      // Started setup but not finished
  | 'setup_complete_free'   // Finished setup, on free plan
  | 'free_active'           // Free user actively using the app
  | 'paywall_viewed'        // User has seen upgrade prompt
  | 'checkout_started'      // User initiated checkout
  | 'payment_pending'       // Payment in progress (webhook awaited)
  | 'payment_failed'        // Payment attempt failed
  | 'pro_active'            // Active Pro subscription
  | 'pro_grace_period'      // Pro expired but in grace period (7 days)
  | 'pro_canceled'          // User canceled but still has access until expires_at
  | 'pro_expired'           // Pro subscription fully expired
  | 'needs_repair'          // Inconsistent state, requires auto-repair
  | 'admin';                // Admin user (special privileges)

export type StateTransitionEvent =
  | 'signup_completed'
  | 'setup_started'
  | 'setup_completed'
  | 'first_action_taken'
  | 'paywall_shown'
  | 'checkout_initiated'
  | 'payment_webhook_received'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_canceled'
  | 'subscription_expired'
  | 'grace_period_started'
  | 'grace_period_ended'
  | 'admin_granted'
  | 'state_repaired';

// ============================================
// VALID TRANSITIONS MAP
// ============================================

export const VALID_TRANSITIONS: Record<UserState, Partial<Record<StateTransitionEvent, UserState>>> = {
  new_user: {
    setup_started: 'setup_incomplete',
    admin_granted: 'admin',
  },
  setup_incomplete: {
    setup_completed: 'setup_complete_free',
    payment_succeeded: 'pro_active', // Can pay during setup
    admin_granted: 'admin',
  },
  setup_complete_free: {
    first_action_taken: 'free_active',
    paywall_shown: 'paywall_viewed',
    checkout_initiated: 'checkout_started',
    payment_succeeded: 'pro_active',
    admin_granted: 'admin',
  },
  free_active: {
    paywall_shown: 'paywall_viewed',
    checkout_initiated: 'checkout_started',
    payment_succeeded: 'pro_active',
    admin_granted: 'admin',
  },
  paywall_viewed: {
    checkout_initiated: 'checkout_started',
    payment_succeeded: 'pro_active',
    first_action_taken: 'free_active', // Dismissed paywall
    admin_granted: 'admin',
  },
  checkout_started: {
    payment_webhook_received: 'payment_pending',
    payment_succeeded: 'pro_active',
    payment_failed: 'payment_failed',
    first_action_taken: 'free_active', // Abandoned checkout
    admin_granted: 'admin',
  },
  payment_pending: {
    payment_succeeded: 'pro_active',
    payment_failed: 'payment_failed',
    admin_granted: 'admin',
  },
  payment_failed: {
    checkout_initiated: 'checkout_started',
    first_action_taken: 'free_active',
    payment_succeeded: 'pro_active',
    admin_granted: 'admin',
  },
  pro_active: {
    subscription_canceled: 'pro_canceled',
    subscription_expired: 'pro_expired',
    grace_period_started: 'pro_grace_period',
    admin_granted: 'admin',
  },
  pro_grace_period: {
    payment_succeeded: 'pro_active',
    grace_period_ended: 'pro_expired',
    admin_granted: 'admin',
  },
  pro_canceled: {
    subscription_expired: 'pro_expired',
    payment_succeeded: 'pro_active', // Re-subscribed
    admin_granted: 'admin',
  },
  pro_expired: {
    checkout_initiated: 'checkout_started',
    payment_succeeded: 'pro_active',
    first_action_taken: 'free_active',
    admin_granted: 'admin',
  },
  needs_repair: {
    state_repaired: 'free_active', // Default repair target
    payment_succeeded: 'pro_active',
    admin_granted: 'admin',
  },
  admin: {
    // Admins can't transition out except manually
  },
};

// ============================================
// TRANSITION VALIDATION
// ============================================

export interface TransitionResult {
  valid: boolean;
  newState: UserState | null;
  error?: string;
  repairSuggestion?: UserState;
}

export function validateTransition(
  currentState: UserState,
  event: StateTransitionEvent
): TransitionResult {
  const transitions = VALID_TRANSITIONS[currentState];
  
  if (!transitions) {
    return {
      valid: false,
      newState: null,
      error: `Unknown state: ${currentState}`,
      repairSuggestion: 'needs_repair',
    };
  }

  const newState = transitions[event];
  
  if (!newState) {
    return {
      valid: false,
      newState: null,
      error: `Invalid transition: ${currentState} → [${event}] not allowed`,
      repairSuggestion: 'needs_repair',
    };
  }

  return {
    valid: true,
    newState,
  };
}

// ============================================
// STATE CALCULATION FROM DATA
// ============================================

export interface UserStateData {
  userId: string;
  hasProfile: boolean;
  hasCompletedSetup: boolean;
  hasBusiness: boolean;
  isAdmin: boolean;
  subscription?: {
    status: 'active' | 'canceled' | 'expired' | 'pending' | null;
    expiresAt: Date | null;
    isPro: boolean;
  };
  lastActivityAt?: Date;
  hasSeenPaywall?: boolean;
  checkoutStartedAt?: Date;
}

export function calculateUserState(data: UserStateData): UserState {
  // Admin check first
  if (data.isAdmin) {
    return 'admin';
  }

  // No profile = brand new
  if (!data.hasProfile || !data.hasBusiness) {
    return 'new_user';
  }

  // Setup incomplete
  if (!data.hasCompletedSetup) {
    return 'setup_incomplete';
  }

  // Check subscription status
  if (data.subscription?.isPro) {
    const now = new Date();
    const expiresAt = data.subscription.expiresAt;

    if (data.subscription.status === 'active') {
      if (expiresAt && expiresAt < now) {
        // Expired but status still says active - needs repair
        return 'needs_repair';
      }
      return 'pro_active';
    }

    if (data.subscription.status === 'canceled') {
      if (expiresAt && expiresAt > now) {
        return 'pro_canceled'; // Still has access
      }
      return 'pro_expired';
    }

    if (data.subscription.status === 'pending') {
      return 'payment_pending';
    }

    // Grace period: expired within 7 days
    if (expiresAt) {
      const gracePeriodEnd = new Date(expiresAt);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
      
      if (now <= gracePeriodEnd && now > expiresAt) {
        return 'pro_grace_period';
      }
    }

    if (data.subscription.status === 'expired') {
      return 'pro_expired';
    }
  }

  // Free user path
  if (data.checkoutStartedAt) {
    const checkoutAge = Date.now() - data.checkoutStartedAt.getTime();
    const MAX_CHECKOUT_AGE = 30 * 60 * 1000; // 30 minutes
    
    if (checkoutAge < MAX_CHECKOUT_AGE) {
      return 'checkout_started';
    }
  }

  if (data.hasSeenPaywall) {
    return 'paywall_viewed';
  }

  if (data.lastActivityAt) {
    return 'free_active';
  }

  return 'setup_complete_free';
}

// ============================================
// REPAIR RULES
// ============================================

export interface RepairRule {
  condition: (data: UserStateData, currentState: UserState) => boolean;
  targetState: UserState;
  action: string;
}

export const REPAIR_RULES: RepairRule[] = [
  {
    condition: (data) => data.subscription?.isPro === true && data.subscription?.status === 'active',
    targetState: 'pro_active',
    action: 'Force pro_active: subscription is active',
  },
  {
    condition: (data) => !data.hasCompletedSetup && data.hasBusiness,
    targetState: 'setup_incomplete',
    action: 'Force setup_incomplete: has business but setup not done',
  },
  {
    condition: (data) => !data.hasBusiness && data.hasProfile,
    targetState: 'new_user',
    action: 'Force new_user: has profile but no business',
  },
  {
    condition: (data) => {
      if (!data.subscription?.expiresAt) return false;
      const now = new Date();
      const expires = new Date(data.subscription.expiresAt);
      return expires < now && data.subscription.status === 'active';
    },
    targetState: 'pro_expired',
    action: 'Force pro_expired: subscription expired but status was active',
  },
];

export function attemptAutoRepair(
  data: UserStateData,
  currentState: UserState
): { repaired: boolean; newState: UserState; action: string } | null {
  for (const rule of REPAIR_RULES) {
    if (rule.condition(data, currentState)) {
      return {
        repaired: true,
        newState: rule.targetState,
        action: rule.action,
      };
    }
  }
  
  // Default repair: calculate from data
  const calculatedState = calculateUserState(data);
  if (calculatedState !== currentState && currentState === 'needs_repair') {
    return {
      repaired: true,
      newState: calculatedState,
      action: `Auto-calculated state from data: ${calculatedState}`,
    };
  }

  return null;
}

// ============================================
// STATE METADATA
// ============================================

export const STATE_METADATA: Record<UserState, {
  label: string;
  description: string;
  canUsePro: boolean;
  showPaywall: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}> = {
  new_user: {
    label: 'Usuario nuevo',
    description: 'Acaba de registrarse',
    canUsePro: false,
    showPaywall: false,
    priority: 'high',
  },
  setup_incomplete: {
    label: 'Setup incompleto',
    description: 'Configuración inicial pendiente',
    canUsePro: false,
    showPaywall: false,
    priority: 'high',
  },
  setup_complete_free: {
    label: 'Free (nuevo)',
    description: 'Terminó setup, plan gratuito',
    canUsePro: false,
    showPaywall: true,
    priority: 'medium',
  },
  free_active: {
    label: 'Free activo',
    description: 'Usuario free usando la app',
    canUsePro: false,
    showPaywall: true,
    priority: 'medium',
  },
  paywall_viewed: {
    label: 'Vio paywall',
    description: 'Ha visto la oferta Pro',
    canUsePro: false,
    showPaywall: true,
    priority: 'medium',
  },
  checkout_started: {
    label: 'En checkout',
    description: 'Iniciando proceso de pago',
    canUsePro: false,
    showPaywall: false,
    priority: 'high',
  },
  payment_pending: {
    label: 'Pago pendiente',
    description: 'Esperando confirmación de pago',
    canUsePro: false,
    showPaywall: false,
    priority: 'critical',
  },
  payment_failed: {
    label: 'Pago fallido',
    description: 'El último intento de pago falló',
    canUsePro: false,
    showPaywall: true,
    priority: 'high',
  },
  pro_active: {
    label: 'Pro activo',
    description: 'Suscripción Pro activa',
    canUsePro: true,
    showPaywall: false,
    priority: 'low',
  },
  pro_grace_period: {
    label: 'Pro (gracia)',
    description: 'Pro expirado, en período de gracia',
    canUsePro: true,
    showPaywall: true,
    priority: 'high',
  },
  pro_canceled: {
    label: 'Pro cancelado',
    description: 'Canceló pero tiene acceso hasta vencimiento',
    canUsePro: true,
    showPaywall: true,
    priority: 'medium',
  },
  pro_expired: {
    label: 'Pro expirado',
    description: 'Suscripción Pro vencida',
    canUsePro: false,
    showPaywall: true,
    priority: 'high',
  },
  needs_repair: {
    label: 'Necesita reparación',
    description: 'Estado inconsistente detectado',
    canUsePro: false,
    showPaywall: false,
    priority: 'critical',
  },
  admin: {
    label: 'Administrador',
    description: 'Usuario con permisos de admin',
    canUsePro: true,
    showPaywall: false,
    priority: 'low',
  },
};
