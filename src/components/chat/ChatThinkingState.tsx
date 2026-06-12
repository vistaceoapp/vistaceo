import { CEOAvatar } from "./CEOAvatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ChatThinkingStateProps {
  compact?: boolean;
}

// Etapas reales que el sistema ejecuta — progresivas, no loop.
// Cada etapa avanza por tiempo estimado para sentir trabajo real, no animación vacía.
const stages = [
  { label: "Leyendo el brain de tu negocio…", duration: 1200 },
  { label: "Cruzando misiones, oportunidades y métricas…", duration: 1600 },
  { label: "Conectando contexto del sector y país…", duration: 1800 },
  { label: "Pensando la respuesta más precisa…", duration: 2200 },
  { label: "Validando que sea hiper personalizada…", duration: 1800 },
  { label: "Cerrando con el próximo paso accionable…", duration: 2000 },
];

const totalDuration = stages.reduce((a, s) => a + s.duration, 0);

export const ChatThinkingState = ({ compact = false }: ChatThinkingStateProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setElapsed(Date.now() - startedAt), 120);
    return () => clearInterval(t);
  }, [startedAt]);

  // Stage actual basada en tiempo transcurrido
  let acc = 0;
  let activeIdx = 0;
  for (let i = 0; i < stages.length; i++) {
    acc += stages[i].duration;
    if (elapsed < acc) { activeIdx = i; break; }
    activeIdx = i;
  }
  // Progreso suave: avanza hasta 92% en totalDuration, luego se queda esperando
  const rawPct = Math.min(elapsed / totalDuration, 1) * 92;
  const seconds = Math.floor(elapsed / 1000);

  const currentLabel = stages[activeIdx]?.label ?? stages[stages.length - 1].label;
  const hint = seconds >= 6
    ? "Estoy puliendo en segundo plano para entregarte algo realmente bueno."
    : "Tomo lo justo para que sea preciso y personal.";

  return (
    <div className={cn("flex items-start gap-3 animate-fade-in", compact && "gap-2")}>
      <CEOAvatar size={compact ? "xs" : "sm"} isThinking />

      <div
        className={cn(
          "flex flex-col gap-2 rounded-2xl rounded-tl-md min-w-0",
          "bg-card/90 backdrop-blur-sm border border-border/60 shadow-sm",
          compact ? "px-3 py-2.5 max-w-[260px]" : "px-4 py-3 max-w-[420px]",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex gap-1 flex-shrink-0">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/70"
                style={{
                  animation: "thinking-dot 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>
          <span
            className={cn(
              "font-medium bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent transition-opacity duration-300 truncate",
              compact ? "text-xs" : "text-[13px]",
            )}
            key={activeIdx}
          >
            {currentLabel}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground/70 tabular-nums flex-shrink-0">
            {seconds}s
          </span>
        </div>

        {/* Línea de tiempo de progreso */}
        <div className="h-[3px] w-full rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2692DC] to-[#746CE6] transition-[width] duration-300 ease-out"
            style={{ width: `${rawPct}%` }}
          />
        </div>

        <span className="text-[10.5px] text-muted-foreground/80 leading-snug">
          {hint}
        </span>
      </div>

      <style>{`
        @keyframes thinking-dot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.25); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
