import { memo, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Radar, Eye, Target, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

/**
 * IntelligenceFlow — Escena protagonista del hero VISTACEO.
 *
 * Concepto: "Río ejecutivo". Chips de caos (ventas, caja, clientes, competencia…)
 * entran desde la izquierda, viajan por una trayectoria curva premium,
 * convergen en un núcleo de inteligencia central y se transforman en
 * outputs ejecutivos (Insight, Prioridad, Riesgo, Oportunidad, Acción, Predicción).
 *
 * White premium · 2.5D · GPU-friendly · respeta prefers-reduced-motion.
 */

const CHAOS_CHIPS = [
  { label: "ventas", x: 4, y: 18 },
  { label: "caja", x: 2, y: 38 },
  { label: "clientes", x: 6, y: 58 },
  { label: "competencia", x: 3, y: 78 },
  { label: "operaciones", x: 8, y: 28 },
  { label: "tareas", x: 10, y: 68 },
  { label: "tendencias", x: 5, y: 88 },
  { label: "riesgos", x: 12, y: 48 },
];

const OUTPUT_CARDS = [
  { icon: Lightbulb, label: "Insight", title: "Mediodía rinde +23%", color: "primary", x: 72, y: 14, delay: 2.2 },
  { icon: Target, label: "Prioridad", title: "Activar recompra", color: "accent", x: 78, y: 32, delay: 2.5 },
  { icon: AlertTriangle, label: "Riesgo", title: "Margen en 5 días", color: "warning", x: 70, y: 52, delay: 2.8 },
  { icon: TrendingUp, label: "Oportunidad", title: "Delivery premium", color: "primary", x: 80, y: 70, delay: 3.1 },
  { icon: Eye, label: "Predicción", title: "Demanda alta jue.", color: "accent", x: 68, y: 86, delay: 3.4 },
];

// SVG path for the curved trajectory (left to right, gentle S curve)
const FLOW_PATH = "M 30 220 C 140 80, 280 360, 420 220 S 660 100, 770 200";

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  accent: { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/20" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-600", ring: "ring-amber-500/20" },
};

export const IntelligenceFlow = memo(() => {
  const reduce = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Subtle parallax (desktop only, very slight)
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 8;
        const y = (e.clientY / window.innerHeight - 0.5) * 8;
        setMouse({ x, y });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <div
      className="relative w-full aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4] xl:aspect-[6/5] select-none"
      style={{ perspective: "1200px" }}
      aria-hidden="true"
    >
      {/* Soft white-premium backdrop with refined gradients */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
        {/* Base white wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
        {/* Lavender/blue glow top-left */}
        <div className="absolute -top-20 -left-20 w-[60%] h-[60%] rounded-full bg-primary/15 blur-[100px]" />
        {/* Violet glow bottom-right */}
        <div className="absolute -bottom-16 -right-10 w-[55%] h-[55%] rounded-full bg-accent/12 blur-[110px]" />
        {/* Fine grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Inner ring */}
        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-foreground/5" />
      </div>

      {/* Parallax layer */}
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { x: mouse.x, y: mouse.y }}
        transition={{ type: "spring", stiffness: 60, damping: 18, mass: 0.6 }}
      >
        {/* SVG: trajectory + flowing particles */}
        <svg
          viewBox="0 0 800 440"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
              <stop offset="35%" stopColor="hsl(204 72% 50%)" stopOpacity="0.55" />
              <stop offset="65%" stopColor="hsl(244 68% 66%)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="flowGradSoft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(244 68% 66%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(204 72% 60%)" stopOpacity="0.85" />
              <stop offset="50%" stopColor="hsl(244 68% 66%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </radialGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Wide soft halo under the path */}
          <path
            d={FLOW_PATH}
            stroke="url(#flowGradSoft)"
            strokeWidth="38"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Main trajectory line */}
          <motion.path
            d={FLOW_PATH}
            stroke="url(#flowGrad)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={reduce ? { pathLength: 1, opacity: 0.7 } : { pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {/* Dashed echo line for depth */}
          <motion.path
            d={FLOW_PATH}
            stroke="hsl(244 68% 66%)"
            strokeWidth="0.8"
            strokeDasharray="2 8"
            fill="none"
            opacity="0.35"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Flowing particles along the path */}
          {!reduce &&
            [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4].map((delay, i) => (
              <circle key={i} r={i % 2 === 0 ? 3 : 2} fill={i % 2 === 0 ? "hsl(204 72% 50%)" : "hsl(244 68% 66%)"} filter="url(#softGlow)">
                <animateMotion dur="4.5s" repeatCount="indefinite" begin={`${delay}s`} path={FLOW_PATH} rotate="auto" />
                <animate attributeName="opacity" values="0;1;1;0" dur="4.5s" repeatCount="indefinite" begin={`${delay}s`} />
              </circle>
            ))}

          {/* Core / Constellation node (center-right ish) */}
          <g transform="translate(540 200)">
            {/* Outer pulse */}
            {!reduce && (
              <motion.circle
                r="48"
                fill="url(#coreGrad)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0.8, 1.15, 0.95], opacity: [0.4, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
              />
            )}
            {/* Inner solid core */}
            <motion.circle
              r="14"
              fill="white"
              stroke="hsl(204 72% 50%)"
              strokeWidth="1.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
              filter="url(#softGlow)"
            />
            {/* Tiny sparks orbiting */}
            {!reduce &&
              [0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={Math.cos((i * Math.PI * 2) / 3) * 26}
                  cy={Math.sin((i * Math.PI * 2) / 3) * 26}
                  r="2.2"
                  fill="hsl(244 68% 66%)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: 1.8 + i * 0.3 }}
                />
              ))}
          </g>
        </svg>

        {/* Chaos chips entering from the left */}
        {CHAOS_CHIPS.map((chip, i) => (
          <motion.div
            key={chip.label}
            className="absolute"
            style={{ left: `${chip.x}%`, top: `${chip.y}%` }}
            initial={{ opacity: 0, x: -30, scale: 0.6 }}
            animate={
              reduce
                ? { opacity: 0.7, x: 0, scale: 1 }
                : {
                    opacity: [0, 0.95, 0.95, 0],
                    x: [-30, 0, 120, 240],
                    scale: [0.6, 1, 0.95, 0.4],
                  }
            }
            transition={
              reduce
                ? { duration: 0.5, delay: 0.3 + i * 0.06 }
                : {
                    duration: 4.5,
                    delay: 0.6 + i * 0.35,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    ease: "easeInOut",
                  }
            }
          >
            <div className="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur border border-foreground/10 shadow-sm">
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide">{chip.label}</span>
            </div>
          </motion.div>
        ))}

        {/* Output executive cards — emerge from the core, settle on the right */}
        {OUTPUT_CARDS.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <motion.div
              key={card.label}
              className="absolute"
              style={{ left: `${card.x}%`, top: `${card.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.4, x: -120 }}
              animate={
                reduce
                  ? { opacity: 1, scale: 1, x: 0 }
                  : {
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      y: [0, -4, 0, 4, 0],
                    }
              }
              transition={
                reduce
                  ? { duration: 0.4, delay: 0.5 + card.delay * 0.1 }
                  : {
                      opacity: { duration: 0.6, delay: card.delay },
                      scale: { duration: 0.6, delay: card.delay, ease: [0.34, 1.56, 0.64, 1] },
                      x: { duration: 0.7, delay: card.delay, ease: "easeOut" },
                      y: { duration: 6, delay: card.delay + 1, repeat: Infinity, ease: "easeInOut" },
                    }
              }
            >
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-foreground/8 shadow-[0_8px_30px_-12px_hsl(220_40%_30%/0.18)] ring-1 ${c.ring}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                </div>
                <div className="text-left">
                  <div className={`text-[8px] font-semibold uppercase tracking-wider ${c.text}`}>{card.label}</div>
                  <div className="text-[11px] font-medium text-foreground whitespace-nowrap">{card.title}</div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Floating "VISTACEO" sparkle marker near the core */}
        <motion.div
          className="absolute"
          style={{ left: "67.5%", top: "45.4%" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20">
            <Sparkles className="w-2.5 h-2.5" />
            <span className="text-[8px] font-bold tracking-widest">VISTACEO</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom caption — labels the transformation */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-medium text-muted-foreground/80 whitespace-nowrap">
        <span className="px-2 py-0.5 rounded-full bg-white/70 border border-foreground/5 backdrop-blur-sm">señales del negocio</span>
        <span className="text-foreground/40">→</span>
        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-foreground">decisiones ejecutivas</span>
      </div>
    </div>
  );
});

IntelligenceFlow.displayName = "IntelligenceFlow";
export default IntelligenceFlow;
