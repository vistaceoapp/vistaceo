import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Check } from "lucide-react";

interface LearnedFact {
  field: string;
  value: string;
}

interface Props {
  isThinking?: boolean;
  summary?: string;
  facts?: LearnedFact[];
  precision?: number; // 0-100
  className?: string;
}

const FIELD_LABELS: Record<string, string> = {
  business_model: "Modelo",
  pricing: "Precio",
  customer_segment: "Cliente",
  channels: "Canales",
  team_size: "Equipo",
  current_revenue: "Ingresos",
  main_challenge: "Desafío",
  goal_90d: "Objetivo 90d",
  competitive_advantage: "Diferencial",
  geo_focus: "Zona",
  tools_used: "Herramientas",
  free_observation: "Contexto",
};

export function BrainLearningCard({ isThinking, summary, facts = [], precision = 0, className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-4 sm:p-5 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Brain className="w-4.5 h-4.5 text-primary" />
          {isThinking && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isThinking ? "CEO está aprendiendo…" : "CEO aprendió"}
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Precisión {Math.round(precision)}%
          </p>
        </div>
      </div>

      {/* Barra precisión */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, precision))}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {summary && (
          <motion.p
            key={summary}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-foreground leading-relaxed mb-3 flex items-start gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <span>{summary}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {facts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {facts.slice(0, 8).map((f, i) => (
            <motion.span
              key={`${f.field}-${i}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
            >
              <Check className="w-2.5 h-2.5" />
              {FIELD_LABELS[f.field] || f.field}
            </motion.span>
          ))}
        </div>
      )}

      {!summary && !facts.length && !isThinking && (
        <p className="text-xs text-muted-foreground italic">
          Escribí algo arriba y tu CEO empezará a aprender en vivo.
        </p>
      )}
    </motion.div>
  );
}
