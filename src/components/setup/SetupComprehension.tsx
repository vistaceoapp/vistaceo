// Franja de comprensión del setup.
// Muestra —solo con datos reales ya respondidos— qué entendió el sistema.
// Regla: nada genérico. Si no hay hechos concretos, no se renderiza nada.
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check } from 'lucide-react';
import { useMemo } from 'react';
import { CATEGORY_LABELS } from '@/lib/gastroQuestionsEngine';

interface QuestionLike {
  id: string;
  category: string;
  type: string;
  unit?: string;
  options?: { id: string; label: { es: string; 'pt-BR': string } }[];
}

interface SetupComprehensionProps {
  businessName?: string;
  questions: QuestionLike[];
  answers: Record<string, unknown>;
  lang: 'es' | 'pt-BR';
}

interface Fact {
  category: string;
  label: string;
}

const MAX_CHIPS = 4;
const MIN_FACTS_TO_SHOW = 2;
const MIN_FACTS_FOR_CONCLUSION = 4;
const MIN_CATEGORIES_FOR_CONCLUSION = 3;

function labelForOption(q: QuestionLike, value: string, lang: 'es' | 'pt-BR'): string | null {
  const opt = q.options?.find(o => o.id === value);
  if (!opt) return null;
  const text = opt.label?.[lang] || opt.label?.es || '';
  return text.trim() || null;
}

export function buildComprehensionFacts(
  questions: QuestionLike[],
  answers: Record<string, unknown>,
  lang: 'es' | 'pt-BR'
): Fact[] {
  const facts: Fact[] = [];
  for (const q of questions) {
    const raw = answers?.[q.id];
    if (raw === null || raw === undefined) continue;

    if (Array.isArray(raw)) {
      const labels = raw
        .map(v => labelForOption(q, String(v), lang))
        .filter((v): v is string => !!v);
      if (labels.length) facts.push({ category: q.category, label: labels.slice(0, 2).join(' + ') });
      continue;
    }

    if (typeof raw === 'number' && Number.isFinite(raw)) {
      facts.push({ category: q.category, label: `${raw.toLocaleString('es')}${q.unit ? ` ${q.unit}` : ''}` });
      continue;
    }

    const str = String(raw).trim();
    if (!str) continue;
    const mapped = labelForOption(q, str, lang);
    if (mapped) {
      facts.push({ category: q.category, label: mapped });
    } else if (q.type === 'text' && str.length >= 4) {
      facts.push({ category: q.category, label: str.length > 42 ? `${str.slice(0, 42)}…` : str });
    }
  }
  return facts;
}

export const SetupComprehension = ({ businessName, questions, answers, lang }: SetupComprehensionProps) => {
  const facts = useMemo(
    () => buildComprehensionFacts(questions, answers, lang),
    [questions, answers, lang]
  );

  if (facts.length < MIN_FACTS_TO_SHOW) return null;

  const chips = facts.slice(-MAX_CHIPS);
  const categories = Array.from(new Set(facts.map(f => f.category)));
  const understands =
    facts.length >= MIN_FACTS_FOR_CONCLUSION && categories.length >= MIN_CATEGORIES_FOR_CONCLUSION;

  const areaNames = categories
    .slice(-3)
    .map(c => (CATEGORY_LABELS as Record<string, { es: string; 'pt-BR': string }>)?.[c]?.[lang]
      || (CATEGORY_LABELS as Record<string, { es: string }>)?.[c]?.es
      || c);

  const subject = businessName?.trim() || (lang === 'pt-BR' ? 'seu negócio' : 'tu negocio');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 space-y-2"
    >
      <div className="flex items-center gap-2">
        <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-medium text-foreground/80">
          {understands
            ? (lang === 'pt-BR'
                ? `Já entendo ${subject}: ${areaNames.join(' · ')}`
                : `Ya entiendo ${subject}: ${areaNames.join(' · ')}`)
            : (lang === 'pt-BR' ? 'Registrando o que você responde' : 'Registrando lo que respondés')}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence initial={false}>
          {chips.map((f, i) => (
            <motion.span
              key={`${f.category}-${f.label}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-foreground/80"
            >
              <Check className="w-2.5 h-2.5 text-primary" />
              {f.label}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {understands && (
        <p className="text-[10px] leading-snug text-muted-foreground">
          {lang === 'pt-BR'
            ? 'Com isso já posso montar sua primeira missão com dados reais.'
            : 'Con esto ya puedo armar tu primera misión con datos reales.'}
        </p>
      )}
    </motion.div>
  );
};
