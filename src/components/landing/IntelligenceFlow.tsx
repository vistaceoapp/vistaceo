import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Target, AlertTriangle, Lightbulb, Sparkles, Zap } from "lucide-react";

/**
 * IntelligenceFlow — Escena cinematográfica del hero VISTACEO.
 *
 * Narrativa visual:
 *  1. Señales caóticas (datos crudos) entran desde la izquierda
 *  2. Convergen en ríos curvos hacia el núcleo VISTACEO
 *  3. El núcleo "respira" y emite outputs ejecutivos legibles
 *  4. Los outputs flotan a la derecha como decisiones accionables
 *
 * Optimizada 60fps:
 *  - Parallax via rAF + transform directo
 *  - IntersectionObserver pausa cuando off-screen
 *  - Mobile: menos partículas, sin parallax, blurs reducidos
 *  - GPU-only: transform/opacity
 *  - Respeta prefers-reduced-motion
 */

const SIGNAL_CHIPS_DESKTOP = [
  { label: "ventas hoy", x: 1, y: 12, hue: "primary" },
  { label: "ticket promedio", x: -2, y: 30, hue: "accent" },
  { label: "reseñas nuevas", x: 3, y: 48, hue: "primary" },
  { label: "competencia", x: 0, y: 66, hue: "accent" },
  { label: "tendencia semanal", x: 4, y: 82, hue: "primary" },
  { label: "margen", x: -1, y: 22, hue: "accent" },
];

const SIGNAL_CHIPS_MOBILE = [
  { label: "ventas", x: 2, y: 16, hue: "primary" },
  { label: "clientes", x: 0, y: 46, hue: "accent" },
  { label: "competencia", x: 4, y: 76, hue: "primary" },
];

const OUTPUT_CARDS = [
  {
    icon: Lightbulb,
    label: "Insight",
    title: "Mediodía rinde +23%",
    detail: "Reasigná staff",
    color: "primary",
    x: 80,
    y: 8,
    delay: 2.4,
  },
  {
    icon: Target,
    label: "Acción prioritaria",
    title: "Activá recompra",
    detail: "142 clientes inactivos",
    color: "accent",
    x: 88,
    y: 30,
    delay: 2.7,
  },
  {
    icon: AlertTriangle,
    label: "Riesgo detectado",
    title: "Margen cae en 5 días",
    detail: "Revisá costos",
    color: "warning",
    x: 76,
    y: 54,
    delay: 3.0,
  },
  {
    icon: TrendingUp,
    label: "Oportunidad",
    title: "Delivery premium",
    detail: "+18% proyectado",
    color: "primary",
    x: 90,
    y: 76,
    delay: 3.3,
  },
];

// Tres rivers que convergen al núcleo (~560,220) y tres que salen
const RIVER_IN_PATHS = [
  "M -20 80 C 140 100, 280 180, 540 220",
  "M -20 220 C 160 230, 320 220, 540 220",
  "M -20 360 C 140 340, 300 260, 540 220",
];
const RIVER_OUT_PATHS = [
  "M 580 220 C 700 180, 760 120, 860 90",
  "M 580 220 C 720 220, 800 230, 860 240",
  "M 580 220 C 700 270, 760 330, 860 360",
];

const colorMap: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/15", dot: "bg-primary" },
  accent: { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/15", dot: "bg-accent" },
  warning: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/15", dot: "bg-warning" },
};

export const IntelligenceFlow = memo(() => {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || isMobile || !isVisible) return;
    const node = parallaxRef.current;
    if (!node) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      node.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 12;
      ty = (e.clientY / window.innerHeight - 0.5) * 12;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce, isMobile, isVisible]);

  const chips = isMobile ? SIGNAL_CHIPS_MOBILE : SIGNAL_CHIPS_DESKTOP;
  const inParticles = isMobile ? [0, 1.6] : [0, 0.8, 1.6, 2.4];
  const outParticles = isMobile ? [3.2] : [3.2, 4.0, 4.8];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] lg:min-h-[600px] select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* ─── Ambient glows ─── */}
      <div
        className={`absolute top-[8%] left-[42%] w-[55%] h-[55%] rounded-full bg-primary/[0.13] ${
          isMobile ? "blur-[60px]" : "blur-[150px]"
        }`}
      />
      <div
        className={`absolute bottom-[5%] right-[5%] w-[50%] h-[50%] rounded-full bg-accent/[0.12] ${
          isMobile ? "blur-[55px]" : "blur-[140px]"
        }`}
      />
      <div
        className={`absolute top-[30%] left-[2%] w-[35%] h-[35%] rounded-full bg-primary/[0.05] ${
          isMobile ? "blur-[45px]" : "blur-[110px]"
        }`}
      />

      {/* ─── Parallax stage ─── */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: reduce || isMobile ? undefined : "transform" }}
      >
        <svg
          viewBox="0 0 880 440"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* River gradient: faint → bright → faint */}
            <linearGradient id="riverIn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
              <stop offset="40%" stopColor="hsl(204 72% 50%)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="riverOut" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(244 68% 66%)" stopOpacity="0.85" />
              <stop offset="60%" stopColor="hsl(244 68% 66%)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="riverHalo" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(244 68% 66%)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </linearGradient>
            {/* Core radial */}
            <radialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(244 68% 66%)" stopOpacity="0.55" />
              <stop offset="55%" stopColor="hsl(204 72% 50%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="coreSphere" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="hsl(244 80% 96%)" />
              <stop offset="100%" stopColor="hsl(244 60% 88%)" />
            </radialGradient>
          </defs>

          {/* Wide soft halos (rivers IN) */}
          {RIVER_IN_PATHS.map((d, i) => (
            <path key={`hi-${i}`} d={d} stroke="url(#riverHalo)" strokeWidth="34" fill="none" strokeLinecap="round" />
          ))}
          {/* Wide soft halos (rivers OUT) */}
          {RIVER_OUT_PATHS.map((d, i) => (
            <path key={`ho-${i}`} d={d} stroke="url(#riverHalo)" strokeWidth="30" fill="none" strokeLinecap="round" />
          ))}

          {/* Main rivers IN */}
          {RIVER_IN_PATHS.map((d, i) => (
            <motion.path
              key={`ri-${i}`}
              d={d}
              stroke="url(#riverIn)"
              strokeWidth={i === 1 ? 1.6 : 1.2}
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: reduce ? 0.55 : 0.82 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.12 }}
            />
          ))}

          {/* Main rivers OUT */}
          {RIVER_OUT_PATHS.map((d, i) => (
            <motion.path
              key={`ro-${i}`}
              d={d}
              stroke="url(#riverOut)"
              strokeWidth={i === 1 ? 1.6 : 1.2}
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: reduce ? 0.55 : 0.82 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 1.6 + i * 0.1 }}
            />
          ))}

          {/* Dashed echoes */}
          {!reduce &&
            RIVER_IN_PATHS.map((d, i) => (
              <motion.path
                key={`di-${i}`}
                d={d}
                stroke="hsl(244 68% 66%)"
                strokeWidth="0.6"
                strokeDasharray="2 8"
                fill="none"
                opacity="0.22"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.4, ease: "easeInOut", delay: 0.4 + i * 0.1 }}
              />
            ))}

          {/* Particles flowing IN */}
          {!reduce &&
            isVisible &&
            inParticles.map((delay, i) => {
              const path = RIVER_IN_PATHS[i % RIVER_IN_PATHS.length];
              const isPrim = i % 2 === 0;
              return (
                <circle
                  key={`pi-${i}`}
                  r={isPrim ? 2.8 : 2.2}
                  fill={isPrim ? "hsl(204 72% 50%)" : "hsl(244 68% 66%)"}
                  opacity="0"
                >
                  <animateMotion dur="4.5s" repeatCount="indefinite" begin={`${1.8 + delay}s`} path={path} rotate="auto" />
                  <animate
                    attributeName="opacity"
                    values="0;0.95;0.95;0"
                    dur="4.5s"
                    repeatCount="indefinite"
                    begin={`${1.8 + delay}s`}
                  />
                </circle>
              );
            })}

          {/* Particles flowing OUT */}
          {!reduce &&
            isVisible &&
            outParticles.map((delay, i) => {
              const path = RIVER_OUT_PATHS[i % RIVER_OUT_PATHS.length];
              return (
                <circle key={`po-${i}`} r="2.4" fill="hsl(244 68% 66%)" opacity="0">
                  <animateMotion dur="3.8s" repeatCount="indefinite" begin={`${delay}s`} path={path} rotate="auto" />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="3.8s"
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  />
                </circle>
              );
            })}

          {/* ─── CORE NODE: VISTACEO ─── */}
          <g transform="translate(560 220)">
            {/* Outer breathing halo */}
            {!reduce && (
              <motion.circle
                r="78"
                fill="url(#coreHalo)"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={
                  isVisible
                    ? { scale: [0.92, 1.15, 0.92], opacity: [0.4, 0.75, 0.4] }
                    : { scale: 1, opacity: 0.5 }
                }
                transition={{ duration: 4.5, repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay: 1.4 }}
              />
            )}
            {/* Mid pulse ring */}
            {!reduce && isVisible && (
              <motion.circle
                r="40"
                fill="none"
                stroke="hsl(244 68% 66%)"
                strokeWidth="1"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.85, 1.4, 1.4], opacity: [0.6, 0, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
              />
            )}
            {/* Static thin ring */}
            <motion.circle
              r="32"
              fill="none"
              stroke="hsl(244 68% 66%)"
              strokeWidth="0.8"
              opacity="0.35"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.35 }}
              transition={{ duration: 0.7, delay: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
            />
            {/* Core sphere */}
            <motion.circle
              r="22"
              fill="url(#coreSphere)"
              stroke="hsl(244 68% 66%)"
              strokeWidth="1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.7, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ filter: "drop-shadow(0 8px 20px hsl(244 68% 66% / 0.35))" }}
            />
            {/* Inner glow dot */}
            <motion.circle
              r="6"
              fill="hsl(244 68% 66%)"
              initial={{ opacity: 0 }}
              animate={isVisible && !reduce ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.8 }}
              transition={{ duration: 2.4, repeat: isVisible && !reduce ? Infinity : 0, ease: "easeInOut", delay: 1.8 }}
            />
            {/* Orbital satellites */}
            {!reduce && !isMobile && isVisible &&
              [0, 1, 2, 3].map((i) => {
                const angle = (i * Math.PI * 2) / 4;
                return (
                  <motion.circle
                    key={`sat-${i}`}
                    cx={Math.cos(angle) * 32}
                    cy={Math.sin(angle) * 32}
                    r="1.8"
                    fill="hsl(204 72% 50%)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: 2 + i * 0.25 }}
                  />
                );
              })}
          </g>
        </svg>

        {/* ─── VISTACEO label (HTML, perfectly readable) ─── */}
        <motion.div
          className="absolute"
          style={{ left: "63.6%", top: "59%", transform: "translateX(-50%)" }}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.9, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground text-background shadow-[0_10px_30px_-8px_hsl(var(--foreground)/0.35)] ring-1 ring-foreground/10">
            <Sparkles className="w-3 h-3" strokeWidth={2.2} />
            <span className="text-[9px] font-bold tracking-[0.18em]">VISTACEO</span>
          </div>
        </motion.div>

        {/* ─── Signal chips (raw data flowing IN) ─── */}
        {chips.map((chip, i) => {
          const tone = chip.hue === "primary" ? "text-primary/80" : "text-accent/80";
          const dotTone = chip.hue === "primary" ? "bg-primary" : "bg-accent";
          return (
            <motion.div
              key={chip.label}
              className="absolute"
              style={{ left: `${chip.x}%`, top: `${chip.y}%`, willChange: reduce ? undefined : "transform, opacity" }}
              initial={{ opacity: 0, x: -40, scale: 0.6 }}
              animate={
                reduce || !isVisible
                  ? { opacity: 0.7, x: 0, scale: 1 }
                  : {
                      opacity: [0, 0.95, 0.95, 0],
                      x: [-40, 20, 200, 380],
                      scale: [0.55, 1, 0.92, 0.35],
                    }
              }
              transition={
                reduce || !isVisible
                  ? { duration: 0.5, delay: 0.3 + i * 0.06 }
                  : {
                      duration: 5.4,
                      delay: 0.4 + i * 0.42,
                      repeat: Infinity,
                      repeatDelay: isMobile ? 2.2 : 1.2,
                      ease: [0.45, 0, 0.55, 1],
                    }
              }
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-sm border border-foreground/[0.06] shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]">
                <span className={`w-1 h-1 rounded-full ${dotTone}`} />
                <span className={`text-[10px] font-medium tracking-wide ${tone}`}>{chip.label}</span>
              </div>
            </motion.div>
          );
        })}

        {/* ─── Output cards (executive decisions flowing OUT) ─── */}
        {OUTPUT_CARDS.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          const enableFloat = !reduce && !isMobile && isVisible;
          return (
            <motion.div
              key={card.label}
              className="absolute"
              style={{ left: `${card.x}%`, top: `${card.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.5, x: -80 }}
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
                      opacity: { duration: 0.7, delay: card.delay },
                      scale: { duration: 0.7, delay: card.delay, ease: [0.34, 1.56, 0.64, 1] },
                      x: { duration: 0.8, delay: card.delay, ease: [0.22, 1, 0.36, 1] },
                      ...(enableFloat && {
                        y: { duration: 7, delay: card.delay + 1, repeat: Infinity, ease: "easeInOut" },
                      }),
                    }
              }
            >
              <div
                className={`relative flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-foreground/[0.05] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.22),0_4px_14px_-6px_rgba(15,23,42,0.08)] ring-1 ${c.ring}`}
              >
                {/* live indicator */}
                {!reduce && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-60`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
                  </span>
                )}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg}`}>
                  <Icon className={`w-4 h-4 ${c.text}`} strokeWidth={2.2} />
                </div>
                <div className="text-left">
                  <div className={`text-[8.5px] font-bold uppercase tracking-[0.12em] ${c.text}`}>{card.label}</div>
                  <div className="text-[12px] font-semibold text-foreground whitespace-nowrap leading-tight">
                    {card.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground whitespace-nowrap leading-tight mt-0.5">
                    {card.detail}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* ─── Subtle scan-line sweeping the core (cinematic touch) ─── */}
        {!reduce && !isMobile && isVisible && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "30%",
              width: "30%",
              height: "40%",
              background: "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.08), transparent)",
              filter: "blur(8px)",
            }}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: [0, 1, 0], x: [-100, 100, 250] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3, repeatDelay: 2 }}
          />
        )}
      </div>
    </div>
  );
});

IntelligenceFlow.displayName = "IntelligenceFlow";
export default IntelligenceFlow;
