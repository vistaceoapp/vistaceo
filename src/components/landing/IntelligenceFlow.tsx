import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Lightbulb,
  ShieldAlert,
  Radar,
  LineChart,
} from "lucide-react";
import vistaceoIcon from "@/assets/brand/icon-vistaceo-new.webp";

/**
 * IntelligenceFlow — Hero VISTACEO
 *
 * Cinematic white-premium hero scene:
 *  · Foreground: thick 3D ceramic highway entering from bottom-left, with edge light + contact shadow
 *  · Midground: transformation core — monumental concentric glass disc holding the brand mark
 *  · Background: soft echo lanes + ambient atmospherics
 *
 * Sculpted signal entities (sales / risk / review / competitor / trend / anomaly)
 * travel along the highway, reach the core, and crystallize into executive outputs
 * (Insight crítico · Oportunidad activa · Riesgo priorizado · Radar · Predicción).
 *
 * Performance:
 *  · Pure SVG procedural (no heavy assets)
 *  · IntersectionObserver pause off-screen
 *  · prefers-reduced-motion respected
 *  · Mobile: simplified path + fewer entities/outputs
 *  · rAF parallax (desktop only)
 */

/* ──────────────────────────────────────────────────────────────────────────
   GEOMETRY (viewBox 1100 × 720 — wide cinematic frame)
   ────────────────────────────────────────────────────────────────────────── */

// Foreground "highway" — enters from bottom-left, sweeps up to the core
const HIGHWAY = "M -80 720 C 160 700, 280 600, 380 520 S 560 360, 640 360";
// Background echo lane (top)
const ECHO_TOP = "M -60 220 C 200 220, 360 240, 520 320 S 680 380, 760 380";
// Background echo lane (bottom)
const ECHO_BOTTOM = "M -60 600 C 220 600, 360 540, 480 480 S 600 420, 700 400";

// Monumental core position
const CORE = { x: 700, y: 380 };

/* ──────────────────────────────────────────────────────────────────────────
   SIGNAL ENTITIES (sculptural family, distinct morphology per kind)
   ────────────────────────────────────────────────────────────────────────── */

type SignalKind = "sales" | "risk" | "review" | "competitor" | "trend" | "anomaly";

type Signal = {
  id: string;
  kind: SignalKind;
  label: string;
  duration: number;
  begin: number;
  // Pre-impact path fragment (entity travels along this)
  path: string;
};

const SIGNALS_DESKTOP: Signal[] = [
  { id: "s1", kind: "sales",      label: "Ventas",      path: HIGHWAY,     duration: 7.2, begin: 0.4 },
  { id: "s2", kind: "review",     label: "Reseña",      path: ECHO_TOP,    duration: 7.6, begin: 2.1 },
  { id: "s3", kind: "risk",       label: "Margen",      path: HIGHWAY,     duration: 7.2, begin: 3.8 },
  { id: "s4", kind: "competitor", label: "Competencia", path: ECHO_BOTTOM, duration: 7.6, begin: 5.4 },
  { id: "s5", kind: "trend",      label: "Tendencia",   path: ECHO_TOP,    duration: 7.6, begin: 7.0 },
  { id: "s6", kind: "anomaly",    label: "Anomalía",    path: HIGHWAY,     duration: 7.2, begin: 8.6 },
];

const SIGNALS_MOBILE: Signal[] = [
  { id: "m1", kind: "sales",      label: "Ventas",      path: HIGHWAY, duration: 6.6, begin: 0.4 },
  { id: "m2", kind: "review",     label: "Reseña",      path: HIGHWAY, duration: 6.6, begin: 3.0 },
  { id: "m3", kind: "competitor", label: "Competencia", path: HIGHWAY, duration: 6.6, begin: 5.6 },
];

/* ──────────────────────────────────────────────────────────────────────────
   EXECUTIVE OUTPUTS (crystallized artefacts on the right side)
   ────────────────────────────────────────────────────────────────────────── */

type OutputKind = "opportunity" | "insight_critical" | "risk" | "radar" | "prediction";

type OutputDef = {
  id: string;
  kind: OutputKind;
  label: string;
  detail: string;
  icon: typeof Target;
  x: number;
  y: number;
  appearAt: number;
  size: "lg" | "md";
};

const OUTPUTS_DESKTOP: OutputDef[] = [
  { id: "o1", kind: "opportunity",      label: "Oportunidad activa",  detail: "Mediodía rinde +23%",   icon: Target,      x: 88, y: 18, appearAt: 2.4, size: "lg" },
  { id: "o2", kind: "insight_critical", label: "Insight crítico",     detail: "Recompra dormida",      icon: Lightbulb,   x: 92, y: 50, appearAt: 4.2, size: "lg" },
  { id: "o3", kind: "radar",            label: "Radar competitivo",   detail: "Nueva oferta cercana",  icon: Radar,       x: 84, y: 80, appearAt: 6.0, size: "md" },
  { id: "o4", kind: "risk",             label: "Riesgo priorizado",   detail: "Margen en 5 días",      icon: ShieldAlert, x: 70, y: 8,  appearAt: 7.6, size: "md" },
  { id: "o5", kind: "prediction",       label: "Predicción semanal",  detail: "+18% delivery",         icon: LineChart,   x: 76, y: 92, appearAt: 9.0, size: "md" },
];

const OUTPUTS_MOBILE: OutputDef[] = [
  { id: "om1", kind: "opportunity",      label: "Oportunidad", detail: "Mediodía +23%", icon: Target,    x: 84, y: 22, appearAt: 2.0, size: "md" },
  { id: "om2", kind: "insight_critical", label: "Insight",     detail: "Recompra",      icon: Lightbulb, x: 88, y: 60, appearAt: 4.4, size: "md" },
  { id: "om3", kind: "radar",            label: "Radar",       detail: "Competencia",   icon: Radar,     x: 82, y: 88, appearAt: 6.6, size: "md" },
];

/* ──────────────────────────────────────────────────────────────────────────
   COLOR TOKENS
   ────────────────────────────────────────────────────────────────────────── */

const SIGNAL_GLOW: Record<SignalKind, string> = {
  sales:      "hsl(204 80% 56%)",
  risk:       "hsl(258 70% 64%)",
  review:     "hsl(204 80% 56%)",
  competitor: "hsl(258 70% 64%)",
  trend:      "hsl(204 80% 56%)",
  anomaly:    "hsl(258 70% 64%)",
};

const OUTPUT_TONE: Record<
  OutputKind,
  { ring: string; accent: string; chip: string; iconBg: string; iconText: string }
> = {
  opportunity:      { ring: "ring-primary/20", accent: "from-primary/12 via-white to-white", chip: "text-primary",  iconBg: "bg-primary/10", iconText: "text-primary"  },
  insight_critical: { ring: "ring-accent/25",  accent: "from-accent/14 via-white to-white",  chip: "text-accent",   iconBg: "bg-accent/10",  iconText: "text-accent"   },
  risk:             { ring: "ring-accent/25",  accent: "from-accent/12 via-white to-white",  chip: "text-accent",   iconBg: "bg-accent/10",  iconText: "text-accent"   },
  radar:            { ring: "ring-primary/20", accent: "from-primary/10 via-white to-white", chip: "text-primary",  iconBg: "bg-primary/10", iconText: "text-primary"  },
  prediction:       { ring: "ring-accent/20",  accent: "from-accent/10 via-white to-white",  chip: "text-accent",   iconBg: "bg-accent/10",  iconText: "text-accent"   },
};

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */

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
    const obs = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0.05 });
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
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(tick);
      else raf = 0;
    };

    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce, isMobile, isVisible]);

  const signals = isMobile ? SIGNALS_MOBILE : SIGNALS_DESKTOP;
  const outputs = isMobile ? OUTPUTS_MOBILE : OUTPUTS_DESKTOP;
  const LOOP = isMobile ? 12 : 12;
  const CORE_DIAM = isMobile ? 150 : 230;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[440px] lg:min-h-[600px] select-none pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ─── Atmospheric ambient (white-premium) ─── */}
      <div className={`absolute -top-[8%] left-[18%] w-[68%] h-[68%] rounded-full bg-primary/[0.10] ${isMobile ? "blur-[60px]" : "blur-[150px]"}`} />
      <div className={`absolute bottom-[-8%] right-[-6%] w-[60%] h-[60%] rounded-full bg-accent/[0.10] ${isMobile ? "blur-[55px]" : "blur-[140px]"}`} />

      {/* Soft radial grid behind the core (depth) */}
      {!isMobile && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-radial-gradient(circle at 64% 53%, transparent 0, transparent 48px, hsl(var(--foreground) / 0.022) 49px, transparent 50px)",
            maskImage: "radial-gradient(ellipse at 64% 53%, #000 8%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 64% 53%, #000 8%, transparent 70%)",
          }}
        />
      )}

      {/* ─── PARALLAX STAGE ─── */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: reduce || isMobile ? undefined : "transform" }}
      >
        <svg
          viewBox="0 0 1100 720"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Highway "ceramic" — thick, layered, premium white surface */}
            <linearGradient id="hwBase" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="hsl(220 24% 92%)" />
              <stop offset="40%" stopColor="hsl(220 24% 97%)" />
              <stop offset="100%" stopColor="hsl(244 40% 96%)" />
            </linearGradient>
            <linearGradient id="hwHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.95" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hwEdgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="hsl(204 80% 56%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(204 80% 56%)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(258 70% 64%)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="echoEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="hsl(244 60% 70%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(244 60% 70%)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(244 60% 70%)" stopOpacity="0" />
            </linearGradient>

            {/* Core radial halos */}
            <radialGradient id="coreOuter" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="hsl(258 70% 64%)" stopOpacity="0.55" />
              <stop offset="60%" stopColor="hsl(204 80% 56%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(204 80% 56%)" stopOpacity="0" />
            </radialGradient>

            {/* Entity sculptural shine */}
            <radialGradient id="entShine" cx="32%" cy="30%" r="65%">
              <stop offset="0%"  stopColor="white" stopOpacity="0.95" />
              <stop offset="45%" stopColor="white" stopOpacity="0.30" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Drop shadow filter (contact shadow) */}
            <filter id="contactShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
              <feOffset dx="0" dy="10" result="off" />
              <feComponentTransfer><feFuncA type="linear" slope="0.20" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            <filter id="entityShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="4" result="off" />
              <feComponentTransfer><feFuncA type="linear" slope="0.22" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ─── BACKGROUND echo lanes (subtle activity) ─── */}
          <g opacity="0.65">
            <path d={ECHO_TOP}    stroke="url(#echoEdge)" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d={ECHO_BOTTOM} stroke="url(#echoEdge)" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d={ECHO_TOP}    stroke="hsl(244 60% 70%)" strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="2 10" fill="none" />
            <path d={ECHO_BOTTOM} stroke="hsl(244 60% 70%)" strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="2 10" fill="none" />
          </g>

          {/* ─── FOREGROUND highway (3D ceramic body) ─── */}
          {/* 1. wide soft outer glow */}
          <path d={HIGHWAY} stroke="url(#hwEdgeGlow)" strokeWidth="68" strokeOpacity="0.35" fill="none" strokeLinecap="round" />
          {/* 2. contact shadow (under the highway) */}
          <g filter="url(#contactShadow)">
            <path d={HIGHWAY} stroke="hsl(220 18% 88%)" strokeWidth="40" fill="none" strokeLinecap="round" opacity="0.95" />
          </g>
          {/* 3. base ceramic body — thickness */}
          <path d={HIGHWAY} stroke="url(#hwBase)" strokeWidth="40" fill="none" strokeLinecap="round" />
          {/* 4. top highlight line — gives the "satin" 3D feel */}
          <path d={HIGHWAY} stroke="url(#hwHighlight)" strokeWidth="6" strokeOpacity="0.85" fill="none" strokeLinecap="round" />
          {/* 5. inner luminous edge */}
          <path d={HIGHWAY} stroke="url(#hwEdgeGlow)" strokeWidth="2.2" strokeOpacity="0.95" fill="none" strokeLinecap="round" />

          {/* Highway transformation checkpoint (premium ring station near the core) */}
          <g transform="translate(560 380)">
            <circle r="22" fill="white" stroke="hsl(244 60% 70% / 0.30)" strokeWidth="1" filter="url(#contactShadow)" />
            <circle r="22" fill="none" stroke="url(#hwEdgeGlow)" strokeWidth="1.4" />
            <circle r="6" fill="hsl(258 70% 64%)" opacity="0.85" />
            {!reduce && isVisible && (
              <motion.circle
                r="22"
                fill="none"
                stroke="hsl(258 70% 64%)"
                strokeWidth="1.2"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut", delay: 1 }}
              />
            )}
          </g>

          {/* ─── CORE outer halo (in SVG, behind HTML core) ─── */}
          <g transform={`translate(${CORE.x} ${CORE.y})`}>
            <circle r={isMobile ? 130 : 200} fill="url(#coreOuter)" />
            {!reduce && isVisible && [0, 1.6, 3.2].map((d, i) => (
              <motion.circle
                key={`pulse-${i}`}
                r={isMobile ? 70 : 110}
                fill="none"
                stroke="hsl(258 70% 64%)"
                strokeWidth="1"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.65, 1.5], opacity: [0.55, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeOut", delay: 1.4 + d }}
              />
            ))}
          </g>

          {/* ─── SIGNAL ENTITIES (sculptural, large, distinct) ─── */}
          {!reduce && isVisible && signals.map((s) => (
            <SignalSculpture key={s.id} signal={s} />
          ))}
        </svg>

        {/* ─── MONUMENTAL CORE (HTML, layered glass disc with brand mark) ─── */}
        <motion.div
          className="absolute"
          style={{
            left: `${(CORE.x / 1100) * 100}%`,
            top: `${(CORE.y / 720) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, scale: 0.45 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="relative" style={{ width: CORE_DIAM, height: CORE_DIAM }}>
            {/* Layer 1 — outer dashed ring (slow rotation) */}
            {!reduce && isVisible && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "1px dashed hsl(var(--primary) / 0.32)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Layer 2 — solid mid ring with orbit dots */}
            {!reduce && isVisible && (
              <motion.div
                className="absolute"
                style={{
                  inset: CORE_DIAM * 0.10,
                  borderRadius: 9999,
                  border: "1px solid hsl(var(--accent) / 0.30)",
                  boxShadow: "inset 0 0 24px hsl(var(--accent) / 0.06)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              >
                <span
                  className="absolute w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_14px_hsl(var(--accent))]"
                  style={{ top: -5, left: "50%", marginLeft: -5 }}
                />
                <span
                  className="absolute w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                  style={{ bottom: -4, left: "50%", marginLeft: -4 }}
                />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-accent/70 shadow-[0_0_10px_hsl(var(--accent))]"
                  style={{ top: "50%", left: -3, marginTop: -3 }}
                />
              </motion.div>
            )}

            {/* Layer 3 — secondary fine ring (counter-rotating tick marks) */}
            {!reduce && isVisible && (
              <motion.div
                className="absolute"
                style={{
                  inset: CORE_DIAM * 0.18,
                  borderRadius: 9999,
                  border: "1px solid hsl(var(--primary) / 0.18)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * 360;
                  return (
                    <span
                      key={i}
                      className="absolute bg-primary/40"
                      style={{
                        width: 1,
                        height: i % 3 === 0 ? 6 : 3,
                        top: 0,
                        left: "50%",
                        transformOrigin: `0 ${CORE_DIAM * 0.32}px`,
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                      }}
                    />
                  );
                })}
              </motion.div>
            )}

            {/* Layer 4 — main glass disc (the "lens" holding the brand mark) */}
            <div
              className="absolute rounded-full overflow-hidden flex items-center justify-center"
              style={{
                inset: CORE_DIAM * 0.27,
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 35%, rgba(245,245,255,0.88) 100%)",
                boxShadow:
                  "0 40px 90px -22px hsl(var(--accent) / 0.55), 0 18px 40px -14px hsl(var(--primary) / 0.40), inset 0 2px 0 rgba(255,255,255,1), inset 0 -3px 14px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.85)",
              }}
            >
              {/* Conic shimmer */}
              {!reduce && isVisible && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.22) 60deg, transparent 120deg, transparent 240deg, hsl(var(--accent) / 0.22) 300deg, transparent 360deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                />
              )}
              {/* Inner specular highlight (top-left) */}
              <span
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: "8% 40% 60% 8%",
                  background:
                    "radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
                  filter: "blur(6px)",
                }}
              />
              {/* Brand mark */}
              <img
                src={vistaceoIcon}
                alt=""
                className="relative z-10 object-contain"
                style={{
                  width: "58%",
                  height: "58%",
                  filter: "drop-shadow(0 3px 10px hsl(var(--accent) / 0.35))",
                }}
                draggable={false}
              />
              {/* Bottom inner shadow (gives depth) */}
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 110%, rgba(116,108,230,0.18) 0%, transparent 55%)",
                }}
              />
            </div>

            {/* Soft pulse glow under disc */}
            {!reduce && isVisible && (
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: CORE_DIAM * 0.20,
                  background: "radial-gradient(circle, hsl(var(--accent) / 0.32) 0%, transparent 65%)",
                  filter: "blur(14px)",
                }}
                animate={{ opacity: [0.55, 0.95, 0.55], scale: [0.95, 1.10, 0.95] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              />
            )}
          </div>
        </motion.div>

        {/* ─── EXECUTIVE OUTPUTS (cristalized cards, fewer + larger + premium) ─── */}
        {outputs.map((o) => (
          <OutputArtefact key={o.id} output={o} reduce={!!reduce} loop={LOOP} isMobile={isMobile} />
        ))}

        {/* ─── KEY TRANSFORMATIONS (the "wow" moments — 2 cinematic beats) ─── */}
        {!reduce && !isMobile && isVisible && (
          <>
            <TransformBurst x={CORE.x} y={CORE.y} delay={2.2} hue="hsl(204 80% 56%)" loop={LOOP} />
            <TransformBurst x={CORE.x} y={CORE.y} delay={6.8} hue="hsl(258 70% 64%)" loop={LOOP} />
          </>
        )}

        {/* Cinematic scan-line sweeping diagonally */}
        {!reduce && !isMobile && isVisible && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: "30%",
              top: "10%",
              width: "48%",
              height: "82%",
              background: "linear-gradient(108deg, transparent 0%, hsl(var(--accent) / 0.12) 50%, transparent 100%)",
              filter: "blur(14px)",
            }}
            initial={{ opacity: 0, x: -240 }}
            animate={{ opacity: [0, 1, 0], x: [-240, 140, 420] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 3, repeatDelay: 2.2 }}
          />
        )}
      </div>
    </div>
  );
});

IntelligenceFlow.displayName = "IntelligenceFlow";
export default IntelligenceFlow;

/* ════════════════════════════════════════════════════════════════════════ */
/* SignalSculpture — large translucent 3D-ish entity with distinct morphology */
/* ════════════════════════════════════════════════════════════════════════ */

const SignalSculpture = memo(({ signal }: { signal: Signal }) => {
  const glow = SIGNAL_GLOW[signal.kind];

  return (
    <g>
      {/* CONTACT shadow under entity */}
      <g>
        <ellipse rx="22" ry="6" fill={glow} fillOpacity="0.16">
          <animateMotion dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} path={signal.path} />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.18;0.7;1" dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} />
        </ellipse>
      </g>

      {/* SCULPTURAL BODY — distinct per kind */}
      <g filter="url(#entityShadow)">
        <g>
          {renderSculpture(signal.kind, glow)}
          <animateMotion dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} path={signal.path} rotate="auto" />
          <animate attributeName="opacity" values="0;1;1;0.35;0" keyTimes="0;0.16;0.62;0.78;1" dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} />
        </g>
      </g>

      {/* FLOATING LABEL above the sculpture */}
      <g>
        <g transform="translate(0,-44)">
          <rect
            x="-44" y="-12" width="88" height="22" rx="11"
            fill="white"
            stroke="hsl(var(--foreground) / 0.06)"
            filter="url(#entityShadow)"
          />
          <circle cx="-31" cy="0" r="3" fill={glow} />
          <text
            x="-22" y="3.8"
            fontSize="11" fontFamily="ui-sans-serif, system-ui"
            fontWeight="600" fill="hsl(var(--foreground))"
            letterSpacing="0.2"
          >
            {signal.label}
          </text>
        </g>
        <animateMotion dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} path={signal.path} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.20;0.62;0.78" dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} />
      </g>
    </g>
  );
});
SignalSculpture.displayName = "SignalSculpture";

/* Distinct sculptural morphology per signal kind */
function renderSculpture(kind: SignalKind, glow: string) {
  const fillBase = { fill: glow, fillOpacity: 0.18 };
  const stroke = { stroke: glow, strokeOpacity: 0.7, strokeWidth: 1.6 };

  switch (kind) {
    case "sales":
      // Ascending elongated drop — confident upward volume
      return (
        <g>
          <path d="M 0 -22 C 13 -10, 13 8, 0 22 C -13 8, -13 -10, 0 -22 Z" {...fillBase} {...stroke} />
          <path d="M 0 -22 C 8 -14, 9 -2, 4 8" stroke="white" strokeOpacity="0.85" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <ellipse cx="-3" cy="-6" rx="6" ry="9" fill="url(#entShine)" />
        </g>
      );
    case "risk":
      // Tense diagonal prism — restrained, sharper
      return (
        <g>
          <path d="M -16 12 L -2 -18 L 18 -2 L 6 18 Z" {...fillBase} {...stroke} />
          <path d="M -2 -18 L 18 -2" stroke="white" strokeOpacity="0.7" strokeWidth="1.2" />
          <ellipse cx="-2" cy="-4" rx="5" ry="7" fill="url(#entShine)" />
          <circle cx="0" cy="0" r="3.2" fill={glow} fillOpacity="0.55" />
        </g>
      );
    case "review":
      // Two fused organic bubbles — conversational
      return (
        <g>
          <ellipse cx="-9" cy="-2" rx="13" ry="11" {...fillBase} {...stroke} />
          <ellipse cx="9" cy="3" rx="11" ry="9" {...fillBase} {...stroke} />
          <ellipse cx="-12" cy="-6" rx="6" ry="5" fill="url(#entShine)" />
          <ellipse cx="6" cy="0" rx="4" ry="3" fill="url(#entShine)" />
        </g>
      );
    case "competitor":
      // Two parallel translucent panels — comparison
      return (
        <g>
          <rect x="-18" y="-14" width="14" height="28" rx="3.5" {...fillBase} {...stroke} />
          <rect x="4"   y="-16" width="14" height="32" rx="3.5" {...fillBase} {...stroke} />
          <rect x="-16" y="-12" width="6" height="14" fill="url(#entShine)" />
          <rect x="6"   y="-14" width="6" height="14" fill="url(#entShine)" />
        </g>
      );
    case "trend":
      // Solid wave ribbon — fluid current
      return (
        <g>
          <path
            d="M -22 6 Q -11 -16, 0 0 T 22 -8"
            fill="none"
            stroke={glow} strokeOpacity="0.75" strokeWidth="6" strokeLinecap="round"
          />
          <path
            d="M -22 6 Q -11 -16, 0 0 T 22 -8"
            fill="none"
            stroke="white" strokeOpacity="0.65" strokeWidth="1.6" strokeLinecap="round"
          />
        </g>
      );
    case "anomaly":
      // Asymmetric elegant shape — singular, off-axis
      return (
        <g>
          <path d="M -14 -8 L 8 -16 L 18 4 L 10 18 L -10 14 Z" {...fillBase} {...stroke} />
          <path d="M -14 -8 L 8 -16 L 18 4" stroke="white" strokeOpacity="0.7" strokeWidth="1.2" fill="none" />
          <circle cx="2" cy="-2" r="3" fill={glow} fillOpacity="0.6" />
          <ellipse cx="-4" cy="-6" rx="5" ry="6" fill="url(#entShine)" />
        </g>
      );
  }
}

/* ════════════════════════════════════════════════════════════════════════ */
/* OutputArtefact — premium crystallized executive card                     */
/* ════════════════════════════════════════════════════════════════════════ */

const OutputArtefact = memo(
  ({ output, reduce, loop, isMobile }: { output: OutputDef; reduce: boolean; loop: number; isMobile: boolean }) => {
    const tone = OUTPUT_TONE[output.kind];
    const Icon = output.icon;
    const enableFloat = !reduce && !isMobile;
    const sizeLg = output.size === "lg";

    return (
      <motion.div
        className="absolute"
        style={{ left: `${output.x}%`, top: `${output.y}%`, transform: "translate(-50%, -50%)" }}
        initial={{ opacity: 0, scale: 0.55, x: -60 }}
        animate={
          reduce
            ? { opacity: 1, scale: 1, x: 0 }
            : enableFloat
            ? {
                opacity: [0, 1, 1, 0.9, 1],
                scale: [0.55, 1, 1, 1, 1],
                x: [-60, 0, 0, 0, 0],
                y: [0, 0, -4, 4, 0],
              }
            : { opacity: [0, 1, 1], scale: [0.6, 1, 1], x: [-30, 0, 0] }
        }
        transition={
          reduce
            ? { duration: 0.5, delay: 0.4 + output.appearAt * 0.08 }
            : enableFloat
            ? {
                duration: loop,
                times: [0, output.appearAt / loop, 0.55, 0.78, 1],
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }
            : { duration: loop, times: [0, output.appearAt / loop, 1], repeat: Infinity, ease: "easeOut", delay: 0.4 }
        }
      >
        <div
          className={`relative flex items-center gap-3 rounded-2xl bg-gradient-to-br ${tone.accent} backdrop-blur-md ring-1 ${tone.ring}`}
          style={{
            paddingLeft: sizeLg ? 12 : 10,
            paddingRight: sizeLg ? 18 : 14,
            paddingTop: sizeLg ? 11 : 9,
            paddingBottom: sizeLg ? 11 : 9,
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow:
              "0 30px 60px -22px rgba(15,23,42,0.28), 0 10px 24px -10px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,1)",
          }}
        >
          {/* live status dot */}
          {!reduce && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-70 ${tone.iconBg} animate-ping`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${tone.iconBg}`}>
                <span className={`absolute inset-0.5 rounded-full ${tone.iconText.replace("text-", "bg-")}`} />
              </span>
            </span>
          )}

          {/* premium icon plate */}
          <div
            className={`flex items-center justify-center rounded-xl ${tone.iconBg}`}
            style={{
              width: sizeLg ? 38 : 32,
              height: sizeLg ? 38 : 32,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.04)",
            }}
          >
            <Icon className={`${tone.iconText}`} style={{ width: sizeLg ? 18 : 16, height: sizeLg ? 18 : 16 }} strokeWidth={2.2} />
          </div>

          <div className="text-left">
            <div className={`font-bold uppercase tracking-[0.14em] ${tone.chip}`} style={{ fontSize: sizeLg ? 9.5 : 8.5 }}>
              {output.label}
            </div>
            <div className="font-semibold text-foreground whitespace-nowrap leading-tight" style={{ fontSize: sizeLg ? 13 : 11.5 }}>
              {output.detail}
            </div>
          </div>

          {/* Subtle inner top highlight */}
          <span
            className="absolute top-0 left-3 right-3 h-px rounded-full pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)" }}
          />
        </div>
      </motion.div>
    );
  }
);
OutputArtefact.displayName = "OutputArtefact";

/* ════════════════════════════════════════════════════════════════════════ */
/* TransformBurst — the "wow" moment at the core (signal → executive output) */
/* ════════════════════════════════════════════════════════════════════════ */

const TransformBurst = memo(
  ({ x, y, delay, hue, loop }: { x: number; y: number; delay: number; hue: string; loop: number }) => {
    return (
      <svg
        viewBox="0 0 1100 720"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${x} ${y})`}>
          {/* Expanding refraction ring */}
          <motion.circle
            r="20"
            fill="none"
            stroke={hue}
            strokeWidth="1.4"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 4.2], opacity: [0.85, 0] }}
            transition={{
              duration: 2.6,
              times: [0, 1],
              ease: [0.22, 1, 0.36, 1],
              delay,
              repeat: Infinity,
              repeatDelay: loop - 2.6,
            }}
          />
          {/* Inner flash */}
          <motion.circle
            r="60"
            fill={hue}
            fillOpacity="0.18"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.4, 1.6], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 1.4,
              times: [0, 0.4, 1],
              ease: "easeOut",
              delay,
              repeat: Infinity,
              repeatDelay: loop - 1.4,
            }}
          />
          {/* Crystallization shards radiating out (4 fragments) */}
          {[0, 90, 180, 270].map((a, i) => (
            <motion.line
              key={i}
              x1="0" y1="0" x2="0" y2="-46"
              stroke={hue}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeOpacity="0.85"
              transform={`rotate(${a + 22})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.6,
                times: [0, 0.4, 1],
                ease: "easeOut",
                delay: delay + 0.05 * i,
                repeat: Infinity,
                repeatDelay: loop - 1.6,
              }}
            />
          ))}
        </g>
      </svg>
    );
  }
);
TransformBurst.displayName = "TransformBurst";
