/**
 * repairExistingAIContent — auditoría y reparación de contenido IA ya guardado.
 *
 * Para cada tabla relevante:
 *  - detecta leaks (markdown roto, JSON visible, [object Object], market_signal,
 *    Q_AI visible, URLs crudas, null/undefined, factual_memory visible).
 *  - si es sanitizable, reescribe localmente (sanitizeAIOutput).
 *  - si no, marca needs_repair en metadata.
 *  - emite BrainEvent `repair_event` con resumen.
 *
 * NUNCA borra datos del usuario.
 */
import { supabase } from '@/integrations/supabase/client';
import { sanitizeAIOutput, containsForbidden } from '@/lib/aiOutputSanitizer';
import { emitBrainEvent } from '@/lib/brain-event-ledger';

export interface RepairSummary {
  scanned: number;
  sanitized: number;
  markedNeedsRepair: number;
  perTable: Record<string, { scanned: number; sanitized: number; flagged: number }>;
}

interface RepairTarget {
  table: string;
  textFields: string[];
  module: 'mission' | 'opportunity' | 'prediction' | 'analytics' | 'chat' | 'dashboard';
}

const TARGETS: RepairTarget[] = [
  { table: 'missions',         textFields: ['title', 'description'],         module: 'mission' },
  { table: 'opportunities',    textFields: ['title', 'description'],         module: 'opportunity' },
  { table: 'learning_items',   textFields: ['title', 'content'],             module: 'opportunity' },
  { table: 'predictions',      textFields: ['title', 'description'],         module: 'prediction' },
  { table: 'business_daily_summaries', textFields: ['summary_text'],         module: 'dashboard' },
  { table: 'chat_messages',    textFields: ['content'],                      module: 'chat' },
];

function pickSanitizationMode(field: string): 'label' | 'prose' | 'structured' {
  if (field === 'title') return 'label';
  return 'prose';
}

export async function repairExistingAIContent(businessId: string): Promise<RepairSummary> {
  const summary: RepairSummary = {
    scanned: 0, sanitized: 0, markedNeedsRepair: 0,
    perTable: {},
  };

  for (const target of TARGETS) {
    const perTable = { scanned: 0, sanitized: 0, flagged: 0 };
    try {
      const { data: rows, error } = await supabase
        .from(target.table as never)
        .select(['id', ...target.textFields].join(','))
        .eq('business_id', businessId)
        .limit(500);
      if (error || !rows) {
        summary.perTable[target.table] = perTable;
        continue;
      }

      for (const row of rows as Array<Record<string, unknown>>) {
        perTable.scanned++;
        summary.scanned++;

        const patch: Record<string, unknown> = {};
        let needsRepair = false;
        let sanitizedAny = false;

        for (const f of target.textFields) {
          const original = (row[f] as string | null | undefined) ?? '';
          if (!original) continue;
          const cleaned = sanitizeAIOutput(String(original), { mode: pickSanitizationMode(f) });
          if (cleaned !== original) {
            patch[f] = cleaned;
            sanitizedAny = true;
          }
          // If sanitized version STILL contains forbidden tokens, mark for repair.
          if (containsForbidden(cleaned)) needsRepair = true;
          // Empty/[object Object]/null literals → mark for repair.
          if (/\[object Object\]|undefined|null/i.test(cleaned.trim()) || cleaned.trim().length < 4) {
            needsRepair = true;
          }
        }

        if (sanitizedAny) {
          perTable.sanitized++;
          summary.sanitized++;
        }
        if (needsRepair) {
          patch['metadata'] = { ...(row as { metadata?: unknown }).metadata as object, needs_repair: true, repaired_at: new Date().toISOString() };
          perTable.flagged++;
          summary.markedNeedsRepair++;
        }

        if (sanitizedAny || needsRepair) {
          await supabase
            .from(target.table as never)
            .update(patch as never)
            .eq('id', row.id as string);
        }
      }
    } catch (e) {
      console.warn(`[repairExistingAIContent] ${target.table} failed:`, e);
    }
    summary.perTable[target.table] = perTable;
  }

  await emitBrainEvent({
    eventType: 'repair_event',
    businessId,
    sourceModule: 'system',
    metadata: { summary },
  }).catch(() => {});

  return summary;
}
