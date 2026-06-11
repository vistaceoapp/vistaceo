/**
 * Brain Event Ledger — emisor centralizado de eventos del Business Brain.
 *
 * Cada interacción relevante (setup answer, chat msg, mission step, etc.)
 * emite un evento. Los eventos sirven para:
 *  - trazabilidad (admin_audit_log)
 *  - listar qué módulos deben recalcularse
 *  - alimentar diagnóstico de calidad
 *
 * No persiste en una tabla nueva — usa `admin_audit_log` con
 * `action_type = 'brain_event:<eventType>'`. Si en el futuro existe una
 * tabla dedicada `brain_event_ledger`, este módulo es el único punto a
 * modificar.
 */
import { supabase } from '@/integrations/supabase/client';

export type BrainEventType =
  | 'setup_answered'
  | 'setup_unknown_selected'
  | 'setup_clarification_written'
  | 'setup_completed'
  | 'business_info_updated'
  | 'dashboard_generated'
  | 'focus_changed'
  | 'health_recalculated'
  | 'knowledge_question_answered'
  | 'radar_generated'
  | 'opportunity_generated'
  | 'opportunity_seen'
  | 'opportunity_saved'
  | 'opportunity_applied'
  | 'opportunity_dismissed'
  | 'opportunity_rejected'
  | 'mission_created'
  | 'mission_step_completed'
  | 'mission_paused'
  | 'mission_skipped'
  | 'mission_regenerated'
  | 'mission_rejected'
  | 'chat_message_sent'
  | 'chat_learning_extracted'
  | 'prediction_generated'
  | 'prediction_calibrated'
  | 'analytics_updated'
  | 'admin_note_added'
  | 'admin_viewed_user'
  | 'user_correction_received'
  | 'quality_gate_failed'
  | 'edge_function_failed'
  | 'fallback_used'
  | 'repair_event'
  | 'guardian_critical_issue';

export type ModuleName =
  | 'dashboard'
  | 'chat'
  | 'radar'
  | 'missions'
  | 'analytics'
  | 'predictions'
  | 'setup'
  | 'admin';

export type RecalcModule =
  | 'dashboard'
  | 'radar'
  | 'missions'
  | 'analytics'
  | 'predictions'
  | 'chat'
  | 'health';

export interface BrainEvent {
  eventType: BrainEventType;
  businessId: string;
  userId?: string | null;
  sourceModule: ModuleName | 'system';
  rawInput?: unknown;
  normalizedInput?: unknown;
  brainFieldsUpdated?: string[];
  confidenceDelta?: number;
  modulesToRecalculate?: RecalcModule[];
  quality?: {
    passed?: boolean;
    score?: number;
    failedReason?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

/**
 * Tabla de recálculo por tipo de evento.
 * No recalcular todo siempre — pero asegurar que nada quede desactualizado.
 */
const RECALC_MAP: Record<BrainEventType, RecalcModule[]> = {
  setup_answered: ['dashboard', 'health', 'radar', 'predictions', 'analytics'],
  setup_unknown_selected: ['analytics'],
  setup_clarification_written: ['dashboard', 'health', 'radar', 'predictions', 'analytics'],
  setup_completed: ['dashboard', 'health', 'radar', 'missions', 'predictions', 'analytics'],
  business_info_updated: ['dashboard', 'radar', 'missions', 'analytics'],
  dashboard_generated: [],
  focus_changed: ['dashboard', 'radar', 'missions'],
  health_recalculated: ['dashboard', 'analytics'],
  knowledge_question_answered: ['dashboard', 'health', 'analytics'],
  radar_generated: ['dashboard'],
  opportunity_generated: ['radar'],
  opportunity_seen: [],
  opportunity_saved: ['dashboard', 'radar'],
  opportunity_applied: ['missions', 'dashboard', 'analytics'],
  opportunity_dismissed: ['radar', 'dashboard'],
  opportunity_rejected: ['radar', 'dashboard'],
  mission_created: ['dashboard', 'missions', 'analytics'],
  mission_step_completed: ['dashboard', 'analytics', 'predictions', 'health'],
  mission_paused: ['dashboard', 'missions'],
  mission_skipped: ['dashboard', 'missions'],
  mission_regenerated: ['missions', 'dashboard'],
  mission_rejected: ['missions', 'dashboard'],
  chat_message_sent: [],
  chat_learning_extracted: ['dashboard', 'radar', 'missions', 'predictions', 'analytics'],
  prediction_generated: ['dashboard'],
  prediction_calibrated: ['predictions', 'analytics', 'dashboard'],
  analytics_updated: ['dashboard'],
  admin_note_added: [],
  admin_viewed_user: [],
  user_correction_received: ['dashboard', 'radar', 'missions', 'predictions', 'analytics', 'health'],
  quality_gate_failed: [],
  edge_function_failed: [],
  fallback_used: [],
  repair_event: [],
  guardian_critical_issue: [],
};

export function getModulesToRecalculate(eventType: BrainEventType): RecalcModule[] {
  return RECALC_MAP[eventType] ?? [];
}

/**
 * Emite un evento del Brain. No bloquea la UI: si falla la persistencia,
 * se loguea en consola y se sigue.
 */
export async function emitBrainEvent(event: BrainEvent): Promise<void> {
  const modules = event.modulesToRecalculate ?? getModulesToRecalculate(event.eventType);
  const payload = {
    event_type: event.eventType,
    business_id: event.businessId,
    user_id: event.userId ?? null,
    source_module: event.sourceModule,
    raw_input: event.rawInput ?? null,
    normalized_input: event.normalizedInput ?? null,
    brain_fields_updated: event.brainFieldsUpdated ?? [],
    confidence_delta: event.confidenceDelta ?? 0,
    modules_to_recalculate: modules,
    quality_result: event.quality ?? null,
    metadata: event.metadata ?? null,
    created_at: event.createdAt ?? new Date().toISOString(),
  };

  try {
    await supabase.from('admin_audit_log').insert({
      action_type: `brain_event:${event.eventType}`,
      target_business_id: event.businessId,
      target_user_id: event.userId ?? null,
      action_data: payload as never,
    } as never);

    // Dispara recálculo client-side notificando vía CustomEvent (los hooks
    // que escuchan pueden invalidar cachés sin acoplamiento directo).
    if (typeof window !== 'undefined' && modules.length > 0) {
      window.dispatchEvent(
        new CustomEvent('vistaceo:brain-event', {
          detail: { event: event.eventType, modules, businessId: event.businessId },
        })
      );
    }
  } catch (err) {
    console.warn('[BrainEventLedger] persist failed', event.eventType, err);
  }
}

/**
 * Helper: dispara recálculo de módulos sin pasar por la red.
 * Los hooks que escuchan `vistaceo:brain-event` pueden invalidar query caches.
 */
export function recalculateModulesAfterBrainEvent(event: BrainEvent): RecalcModule[] {
  const modules = event.modulesToRecalculate ?? getModulesToRecalculate(event.eventType);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vistaceo:brain-event', {
        detail: { event: event.eventType, modules, businessId: event.businessId },
      })
    );
  }
  return modules;
}
