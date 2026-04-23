import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Radar, Eye, Target, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

/**
 * IntelligenceFlow — Escena protagonista del hero VISTACEO.
 *
 * "Río ejecutivo": señales de caos del negocio (ventas, caja, clientes…)
 * fluyen por una trayectoria curva premium, convergen en un núcleo de
 * inteligencia y se transforman en outputs ejecutivos (Insight, Riesgo…).
 *
 * Optimizada para 60fps:
 *  - Parallax via transform directo (sin React state en mousemove)
 *  - IntersectionObserver: pausa cuando no es visible
 *  - Detección mobile: menos chips, menos partículas, sin SVG filter blur
 *  - GPU-friendly: solo transform/opacity, will-change selectivo
 *  - Respeta prefers-reduced-motion
 */

const CHAOS_CHIPS_DESKTOP = [
  { label: "ventas", x: 4, y: 18 },
  { label: "caja", x: 2, y: 38 },
  { label: "clientes", x: 6, y: 58 },
  { label: "competencia", x: 3, y: 78 },
  { label: "tendencias", x: 8, y: 28 },
];

const CHAOS_CHIPS_MOBILE = [
  { label: "ventas", x: 4, y: 22 },
  { label: "clientes", x: 2, y: 50 },
  { label: "competencia", x: 6, y: 76 },
];

const OUTPUT_CARDS = [
  { icon: Lightbulb, label: "Insight", title: "Mediodía rinde +23%", color: "primary", x: 72, y: 14, delay: 2.2 },
  { icon: Target, label: "Prioridad", title: "Activar recompra", color: "accent", x: 78, y: 32, delay: 2.5 },
  { icon: AlertTriangle, label: "Riesgo", title: "Margen en 5 días", color: "warning", x: 70, y: 52, delay: 2.8 },
  { icon: TrendingUp, label: "Oportunidad", title: "Delivery premium", color: "primary", x: 80, y: 70, delay: 3.1 },
  { icon: Eye, label: "Predicción", title: "Demanda alta jue.", color: "accent", x: 68, y: 86, delay: 3.4 },
];

const FLOW_PATH = "M 30 220 C 140 80, 280 360, 420 220 S 660 100, 770 200";

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  accent: { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/20" },
  warning: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
};

export const IntelligenceFlow = memo(() => {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile once (avoids running expensive layers on small screens)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pause animations when offscreen (saves battery + frees GPU)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Parallax: write directly to transform (no React re-render)
  // Disabled on mobile + reduced-motion + when offscreen
  useEffect(() => {
    if (reduce || isMobile || !isVisible) return;
    const node = parallaxRef.current;
    if (!node) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      // Smooth lerp towards target
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      node.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 8;
      ty = (e.clientY / window.innerHeight - 0.5) * 8;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce, isMobile, isVisible]);

  const chips = isMobile ? CHAOS_CHIPS_MOBILE : CHAOS_CHIPS_DESKTOP;
  const particleCount = isMobile ? 2 : 4;
  const particleDelays = particleCount === 2 ? [0, 2.2] : [0, 1.1, 2.2, 3.3];
  // Pause heavy loops when offscreen — animations only "play" when visible
  const animPlayState = isVisible ? "running" : "paused";

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4] xl:aspect-[6/5] select-none"
      aria-hidden="true"
    >
      {/* Static white-premium backdrop — pure CSS, no animation */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
        {/* Glows: lighter blur on mobile */}
        <div
          className={`absolute -top-20 -left-20 w-[60%] h-[60%] rounded-full bg-primary/15 ${
            isMobile ? "blur-[60px]" : "blur-[100px]"
          }`}
        />
        <div
          className={`absolute -bottom-16 -right-10 w-[55%] h-[55%] rounded-full bg-accent/12 ${
            isMobile ? "blur-[60px]" : "blur-[110px]"
          }`}
        />
        {/* Grid texture only on desktop (cheap but pointless on small screens) */}
        {!isMobile && (
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        )}
        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-foreground/5" />
      </div>

      {/* Parallax layer — transform written directly via ref */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: reduce || isMobile ? undefined : "transform" }}
      >
        {/* SVG: trajectory + flowing particles */}
        <svg
          viewBox="0 0 800 440"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ animationPlayState: animPlayState }}
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
            animate={{ pathLength: 1, opacity: reduce ? 0.7 : 0.85 }}
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

          {/* Flowing particles — fewer on mobile, no SVG filter (too costly) */}
          {!reduce &&
            isVisible &&
            particleDelays.map((delay, i) => (
              <circle
                key={i}
                r={i % 2 === 0 ? 3 : 2.2}
                fill={i % 2 === 0 ? "hsl(204 72% 50%)" : "hsl(244 68% 66%)"}
                opacity="0.9"
              >
                <animateMotion dur="5s" repeatCount="indefinite" begin={`${delay}s`} path={FLOW_PATH} rotate="auto" />
                <animate attributeName="opacity" values="0;0.95;0.95;0" dur="5s" repeatCount="indefinite" begin={`${delay}s`} />
              </circle>
            ))}

          {/* Core / Constellation node */}
          <g transform="translate(540 200)">
            {!reduce && (
              <motion.circle
                r="48"
                fill="url(#coreGrad)"
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: [0.85, 1.1, 0.95], opacity: [0.4, 0.75, 0.5] } : { scale: 0.95, opacity: 0.5 }}
                transition={{ duration: 4, repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay: 1.6 }}
              />
            )}
            <motion.circle
              r="14"
              fill="white"
              stroke="hsl(204 72% 50%)"
              strokeWidth="1.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
            />
            {/* Tiny sparks orbiting — desktop only, fewer */}
            {!reduce && !isMobile && isVisible &&
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

        {/* Chaos chips — fewer on mobile */}
        {chips.map((chip, i) => (
          <motion.div
            key={chip.label}
            className={`absolute ${isMobile ? "" : "backdrop-blur"}`}
            style={{ left: `${chip.x}%`, top: `${chip.y}%`, willChange: reduce ? undefined : "transform, opacity" }}
            initial={{ opacity: 0, x: -30, scale: 0.6 }}
            animate={
              reduce || !isVisible
                ? { opacity: 0.7, x: 0, scale: 1 }
                : {
                    opacity: [0, 0.95, 0.95, 0],
                    x: [-30, 0, 120, 240],
                    scale: [0.6, 1, 0.95, 0.4],
                  }
            }
            transition={
              reduce || !isVisible
                ? { duration: 0.5, delay: 0.3 + i * 0.06 }
                : {
                    duration: 5,
                    delay: 0.6 + i * 0.5,
                    repeat: Infinity,
                    repeatDelay: isMobile ? 2.5 : 1.5,
                    ease: "easeInOut",
                  }
            }
          >
            <div className="px-2.5 py-1 rounded-full bg-white/85 border border-foreground/10 shadow-sm">
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide">{chip.label}</span>
            </div>
          </motion.div>
        ))}

        {/* Output executive cards */}
        {OUTPUT_CARDS.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          const enableFloat = !reduce && !isMobile && isVisible;
          return (
            <motion.div
              key={card.label}
              className="absolute"
              style={{ left: `${card.x}%`, top: `${card.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.4, x: -120 }}
              animate={
                reduce
                  ? { opacity: 1, scale: 1, x: 0 }
                  : enableFloat
                    ? { opacity: 1, scale: 1, x: 0, y: [0, -4, 0, 4, 0] }
                    : { opacity: 1, scale: 1, x: 0 }
              }
              transition={
                reduce
                  ? { duration: 0.4, delay: 0.5 + card.delay * 0.1 }
                  : {
                      opacity: { duration: 0.6, delay: card.delay },
                      scale: { duration: 0.6, delay: card.delay, ease: [0.34, 1.56, 0.64, 1] },
                      x: { duration: 0.7, delay: card.delay, ease: "easeOut" },
                      ...(enableFloat && {
                        y: { duration: 6, delay: card.delay + 1, repeat: Infinity, ease: "easeInOut" },
                      }),
                    }
              }
            >
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-foreground/10 shadow-[0_8px_30px_-12px_hsl(220_40%_30%/0.18)] ring-1 ${c.ring} ${
                  isMobile ? "" : "backdrop-blur-md"
                }`}
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

        {/* VISTACEO sparkle marker near the core */}
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
      </div>

      {/* Bottom caption */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-medium text-muted-foreground/80 whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded-full bg-white/70 border border-foreground/5 ${isMobile ? "" : "backdrop-blur-sm"}`}>
          señales del negocio
        </span>
        <span className="text-foreground/40">→</span>
        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-foreground">
          decisiones ejecutivas
        </span>
      </div>
    </div>
  );
});

IntelligenceFlow.displayName = "IntelligenceFlow";
export default IntelligenceFlow;
