/**
 * Migración legacy de negocios existentes hacia el sistema nuevo.
 *
 * - No borra datos reales del usuario (setup, chat, perfil, integraciones).
 * - Solo archiva o marca para regeneración el contenido generado por IA
 *   que no cumple los nuevos quality gates (misiones pobres, oportunidades
 *   sin evidencia, predicciones inventadas, insights genéricos).
 * - Recalcula contadores del brain y normaliza la clasificación.
 *
 * Dos modos:
 *   - dryRun: no escribe, devuelve plan detallado.
 *   - apply: aplica cambios seguros con `migration_version = 'v2-2026-06'`.
 *
 * Requiere sesión admin (usa el cliente Supabase normal; las RLS deciden).
 */

import { supabase } from '@/integrations/supabase/client';
import { emitBrainEvent } from './brain-event-ledger';

export const MIGRATION_VERSION = 'v2-2026-06';

type LegacyAction =
  | 'preserve'
  | 'archive'
  | 'mark_needs_regeneration'
  | 'mark_uncertain'
  | 'recalculate'
  | 'manual_review';

interface PlanItem {
  table: string;
  id: string;
  business_id: string;
  reason: string;
  action: LegacyAction;
}

export interface MigrationPlan {
  businessesScanned: number;
  brainsRecalculate: PlanItem[];
  classificationUncertain: PlanItem[];
  missionsToArchive: PlanItem[];
  opportunitiesToArchive: PlanItem[];
  predictionsToRegenerate: PlanItem[];
  insightsToRegenerate: PlanItem[];
  preserved: { table: string; count: number }[];
}

function isMissionPoor(m: Record<string, unknown>): string | null {
  const title = String(m.title ?? '').trim();
  const steps = Array.isArray(m.steps) ? (m.steps as unknown[]) : [];
  if (title.length < 8) return 'title_too_short';
  if (steps.length === 0) return 'no_steps';
  if (/object Object|undefined|null/i.test(title)) return 'leaky_title';
  return null;
}

function isOpportunityPoor(o: Record<string, unknown>): string | null {
  const title = String(o.title ?? '').trim();
  const evidence = o.evidence ?? (o as { rationale?: unknown }).rationale;
  if (title.length < 8) return 'title_too_short';
  if (!evidence) return 'no_evidence';
  if (/market_signal|Q_AI|\[object Object\]/.test(JSON.stringify(o))) return 'leaky_payload';
  return null;
}

function isPredictionStale(p: Record<string, unknown>): string | null {
  const created = p.created_at ? new Date(String(p.created_at)).getTime() : 0;
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  if (ageDays > 30) return 'older_than_30d';
  const evidence = (p as { evidence?: unknown }).evidence;
  if (!evidence || (Array.isArray(evidence) && evidence.length === 0)) return 'no_evidence';
  return null;
}

function isInsightPoor(i: Record<string, unknown>): string | null {
  const content = String((i as { content?: unknown; summary?: unknown }).content ?? (i as { summary?: unknown }).summary ?? '');
  if (content.trim().length < 40) return 'too_short';
  if (/object Object|undefined|null/i.test(content)) return 'leaky_content';
  return null;
}

export async function migrateLegacyBusinessesToNewIntelligence(opts: {
  dryRun: boolean;
  limit?: number;
}): Promise<MigrationPlan> {
  const limit = opts.limit ?? 200;
  const plan: MigrationPlan = {
    businessesScanned: 0,
    brainsRecalculate: [],
    classificationUncertain: [],
    missionsToArchive: [],
    opportunitiesToArchive: [],
    predictionsToRegenerate: [],
    insightsToRegenerate: [],
    preserved: [],
  };

  const { data: businesses, error: bErr } = await supabase
    .from('businesses')
    .select('id, name, category')
    .limit(limit);
  if (bErr) throw bErr;
  plan.businessesScanned = businesses?.length ?? 0;

  for (const b of businesses ?? []) {
    const bId = b.id as string;

    // Brain: clasificación
    const { data: brain } = await supabase
      .from('business_brains')
      .select('id, business_id, primary_business_type, classification_status, total_signals, confidence_score')
      .eq('business_id', bId)
      .maybeSingle();

    if (brain) {
      plan.brainsRecalculate.push({
        table: 'business_brains', id: String(brain.id), business_id: bId,
        reason: 'recalculate_counters_and_confidence', action: 'recalculate',
      });
      const t = String(brain.primary_business_type ?? '').toLowerCase();
      const status = (brain as { classification_status?: string }).classification_status;
      if ((!t || t === 'b2b' || t === 'b2c') && status !== 'confirmed') {
        plan.classificationUncertain.push({
          table: 'business_brains', id: String(brain.id), business_id: bId,
          reason: 'generic_or_missing_business_type', action: 'mark_uncertain',
        });
      }
    }

    // Misiones
    const { data: missions } = await supabase
      .from('missions').select('*').eq('business_id', bId).limit(100);
    for (const m of missions ?? []) {
      const reason = isMissionPoor(m as unknown as Record<string, unknown>);
      if (reason) plan.missionsToArchive.push({ table: 'missions', id: String(m.id), business_id: bId, reason, action: 'mark_needs_regeneration' });
    }

    // Oportunidades
    const { data: opps } = await supabase
      .from('opportunities').select('*').eq('business_id', bId).limit(100);
    for (const o of opps ?? []) {
      const reason = isOpportunityPoor(o as unknown as Record<string, unknown>);
      if (reason) plan.opportunitiesToArchive.push({ table: 'opportunities', id: String(o.id), business_id: bId, reason, action: 'mark_needs_regeneration' });
    }

    // Predicciones
    const { data: preds } = await supabase
      .from('predictions').select('*').eq('business_id', bId).limit(50);
    for (const p of preds ?? []) {
      const reason = isPredictionStale(p as unknown as Record<string, unknown>);
      if (reason) plan.predictionsToRegenerate.push({ table: 'predictions', id: String(p.id), business_id: bId, reason, action: 'mark_needs_regeneration' });
    }

    // Insights
    const { data: insights } = await supabase
      .from('business_insights').select('*').eq('business_id', bId).limit(50);
    for (const i of insights ?? []) {
      const reason = isInsightPoor(i as unknown as Record<string, unknown>);
      if (reason) plan.insightsToRegenerate.push({ table: 'business_insights', id: String(i.id), business_id: bId, reason, action: 'mark_needs_regeneration' });
    }
  }

  if (opts.dryRun) return plan;

  // APPLY — solo escrituras seguras (no borrar datos reales).
  for (const item of plan.brainsRecalculate) {
    await supabase.rpc('recalculate_brain_signal_counters' as never, { _business_id: item.business_id } as never);
  }

  for (const item of plan.classificationUncertain) {
    await supabase.from('business_brains').update({
      classification_status: 'uncertain',
      classification_confidence: 0,
      classification_source: 'legacy_migration',
      classification_fallback_reason: item.reason,
      migration_version: MIGRATION_VERSION,
    } as never).eq('id', item.id);
    await emitBrainEvent({
      eventType: 'classification_uncertain', businessId: item.business_id,
      sourceModule: 'admin', metadata: { reason: item.reason, migration: MIGRATION_VERSION },
    });
  }

  const markLegacy = async (table: 'missions' | 'opportunities' | 'predictions' | 'business_insights', items: PlanItem[]) => {
    for (const item of items) {
      await supabase.from(table).update({
        legacy_status: 'legacy_archived',
        repair_status: 'needs_regeneration',
        archived_reason: item.reason,
        migration_version: MIGRATION_VERSION,
      } as never).eq('id', item.id);
    }
  };

  await markLegacy('missions', plan.missionsToArchive);
  await markLegacy('opportunities', plan.opportunitiesToArchive);
  await markLegacy('predictions', plan.predictionsToRegenerate);
  await markLegacy('business_insights', plan.insightsToRegenerate);

  // Emitir un evento de migración por business afectado.
  const touchedBusinesses = new Set<string>([
    ...plan.brainsRecalculate.map(i => i.business_id),
    ...plan.classificationUncertain.map(i => i.business_id),
    ...plan.missionsToArchive.map(i => i.business_id),
    ...plan.opportunitiesToArchive.map(i => i.business_id),
    ...plan.predictionsToRegenerate.map(i => i.business_id),
    ...plan.insightsToRegenerate.map(i => i.business_id),
  ]);
  for (const businessId of touchedBusinesses) {
    await emitBrainEvent({
      eventType: 'business_brain_migrated',
      businessId,
      sourceModule: 'admin',
      metadata: { migration: MIGRATION_VERSION },
    });
  }

  return plan;
}
