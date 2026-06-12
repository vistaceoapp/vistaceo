import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Global "brain learning" feedback.
 * Mount once near the root. Fire from anywhere:
 *   notifyBrainLearned("Aprendido: tipo de negocio")
 *
 * Diseño: minimal, no bloquea interacción (pointer-events-none),
 * responsive (bottom on mobile, bottom-right on desktop), 1.6s.
 */

type LearnedDetail = { label?: string };

const EVENT_NAME = "vistaceo:brain-learned";

export function notifyBrainLearned(label?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LearnedDetail>(EVENT_NAME, { detail: { label } }));
}

interface PulseItem {
  id: number;
  label: string;
}

let _id = 0;

export const BrainLearningPulse = () => {
  const [items, setItems] = useState<PulseItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<LearnedDetail>).detail || {};
      const id = ++_id;
      const label = (detail.label || "Aprendido").slice(0, 80);
      setItems(prev => [...prev.slice(-2), { id, label }]);
      window.setTimeout(() => remove(id), 1700);
    };
    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, [remove]);

  if (typeof document === "undefined") return null;
  if (items.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-none fixed z-[60] flex flex-col gap-2",
        "bottom-4 left-1/2 -translate-x-1/2",
        "sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 sm:items-end"
      )}
    >
      {items.map(item => (
        <BrainPulseChip key={item.id} label={item.label} />
      ))}

      <style>{`
        @keyframes vista-brain-in {
          0%   { opacity: 0; transform: translateY(8px) scale(.96); }
          15%  { opacity: 1; transform: translateY(0) scale(1); }
          85%  { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-4px) scale(.98); }
        }
        @keyframes vista-brain-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(116,108,230,0)); }
          50%      { transform: scale(1.12); filter: drop-shadow(0 0 6px rgba(116,108,230,.55)); }
        }
        @keyframes vista-brain-spark {
          0%   { opacity: 0; transform: translate(0,0) scale(.4); }
          40%  { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1); }
        }
        @keyframes vista-brain-ring {
          0%   { opacity: .55; transform: scale(.6); }
          100% { opacity: 0;   transform: scale(1.8); }
        }
      `}</style>
    </div>,
    document.body
  );
};

const BrainPulseChip = ({ label }: { label: string }) => {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 px-3.5 py-2 rounded-full",
        "bg-background/85 backdrop-blur-md border border-border/60",
        "shadow-[0_8px_24px_-8px_rgba(38,146,220,0.35)]"
      )}
      style={{
        animation: "vista-brain-in 1.7s ease-out forwards",
      }}
    >
      {/* Brain con pulso + halo */}
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(38,146,220,.35), rgba(116,108,230,.0) 70%)",
            animation: "vista-brain-ring 1.4s ease-out infinite",
          }}
        />
        <span
          className="relative inline-flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #2692DC, #746CE6)",
            animation: "vista-brain-pulse 1.2s ease-in-out infinite",
          }}
        >
          <Brain className="h-4 w-4 text-white" strokeWidth={2.2} />
        </span>

        {/* Sparks entrando al cerebro */}
        {[
          { dx: "-10px", dy: "-8px", delay: "0s" },
          { dx: "10px", dy: "-6px", delay: ".15s" },
          { dx: "-8px", dy: "10px", delay: ".3s" },
        ].map((s, i) => (
          <Sparkles
            key={i}
            className="absolute h-2.5 w-2.5 text-[#2692DC]"
            style={{
              // @ts-ignore CSS custom props
              "--dx": s.dx,
              "--dy": s.dy,
              animation: `vista-brain-spark 1s ease-out ${s.delay} forwards`,
            }}
          />
        ))}
      </span>

      <span className="text-xs sm:text-sm font-medium leading-tight">
        <span className="bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent">
          Aprendiendo…
        </span>
        <span className="ml-1.5 text-foreground/80 line-clamp-1 max-w-[60vw] sm:max-w-[260px] inline-block align-bottom">
          {label}
        </span>
      </span>
    </div>
  );
};

export default BrainLearningPulse;
