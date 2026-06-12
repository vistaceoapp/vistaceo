import { useEffect, useState } from "react";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  missionTitle?: string;
  businessName?: string;
}

const THINKING_STEPS = [
  { text: "Leyendo el contexto completo de tu negocio", icon: Brain, ms: 3000 },
  { text: "Analizando señales reales de tu operación", icon: TrendingUp, ms: 3500 },
  { text: "Comparando con benchmarks de tu sector", icon: BarChart3, ms: 3500 },
  { text: "Priorizando pasos con mejor relación impacto/esfuerzo", icon: Target, ms: 4000 },
  { text: "Calculando probabilidad de éxito y riesgos", icon: Zap, ms: 3500 },
  { text: "Redactando ejemplos listos para ejecutar", icon: Sparkles, ms: 4500 },
  { text: "Validando coherencia con tu modelo de negocio", icon: CheckCircle2, ms: 3000 },
  { text: "Afinando los detalles finales", icon: Brain, ms: 3000 },
];

export const MissionThinkingState = ({ missionTitle, businessName }: Props) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Avanza el paso "activo" en intervalos realistas; nunca pasa del último.
  useEffect(() => {
    if (activeIdx >= THINKING_STEPS.length - 1) return;
    const t = setTimeout(() => setActiveIdx((i) => Math.min(i + 1, THINKING_STEPS.length - 1)), THINKING_STEPS[activeIdx].ms);
    return () => clearTimeout(t);
  }, [activeIdx]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Progreso ponderado por los tiempos de cada paso (solo visual).
  const totalMs = THINKING_STEPS.reduce((a, s) => a + s.ms, 0);
  const completedMs = THINKING_STEPS.slice(0, activeIdx).reduce((a, s) => a + s.ms, 0);
  const pct = Math.min(95, Math.round(((completedMs + THINKING_STEPS[activeIdx].ms * 0.6) / totalMs) * 100));

  return (
    <div className="space-y-5">
      {/* Header con título de la misión */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent animate-pulse" />
            <div className="absolute inset-[2px] rounded-[10px] bg-card flex items-center justify-center">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div className="absolute -inset-1 rounded-2xl border-2 border-primary/20 animate-ping" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">Pensando</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {elapsed}s
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
              {missionTitle || "Diseñando tu plan personalizado"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Calidad sobre velocidad: estoy construyendo un plan profundo
              {businessName ? ` para ${businessName}` : ""}.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* Timeline de razonamiento en vivo */}
      <section className="bg-card border border-border rounded-2xl p-4 sm:p-5">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Razonamiento en tiempo real
        </h3>
        <ol className="space-y-2.5">
          {THINKING_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = idx < activeIdx;
            const active = idx === activeIdx;
            const pending = idx > activeIdx;
            return (
              <li
                key={idx}
                className={cn(
                  "flex items-start gap-3 transition-all duration-500",
                  pending && "opacity-35"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                    done && "bg-success/15 text-success",
                    active && "bg-primary/15 text-primary",
                    pending && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : active ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm leading-tight pt-1",
                    done && "text-muted-foreground line-through decoration-1",
                    active && "text-foreground font-medium",
                    pending && "text-muted-foreground"
                  )}
                >
                  {s.text}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="text-[11px] text-center text-muted-foreground px-4">
        Mantengo el modelo en máxima calidad. Suele tardar 15-25s y queda guardado para siempre.
      </p>
    </div>
  );
};
