import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Users2,
  Activity,
  Sparkles,
  Lightbulb,
  Target,
  ShieldAlert,
  Radar,
  LineChart,
  Flame,
} from "lucide-react";
import vistaceoIcon from "@/assets/brand/icon-vistaceo-new.webp";

/**
 * IntelligenceFlow — Hero VISTACEO. White-premium / cinematic.
 *
 * Narrativa:
 *   Señales heterogéneas (ventas · riesgo · reseñas · competencia · tendencia · anomalía)
 *   recorren una pista curva premium → entran al núcleo (logo VISTACEO) → cristalizan
 *   en outputs ejecutivos: Insight · Oportunidad · Riesgo · Misión · Predicción · Radar.
 *
 * Calidad:
 *   - SVG procedural (sin assets pesados)
 *   - GPU-only transforms, rAF parallax, IntersectionObserver pause
 *   - prefers-reduced-motion respetado
 *   - Mobile: menos entidades, sin parallax, blurs reducidos
 *   - Loop ~20s, sin cortes, escalonado
 */

/* ────────────────────────────────────────────────────────────────────────── */
/* Pista curva principal + carriles (viewBox 1000 × 620)                      */
/* ────────────────────────────────────────────────────────────────────────── */
const TRACK_MAIN = "M -40 470 C 180 470, 280 360, 420 320 S 700 290, 870 200";
const TRACK_LANE_A = "M -40 540 C 220 540, 360 460, 480 380 S 740 360, 900 300";
const TRACK_LANE_B = "M -40 380 C 200 380, 320 280, 460 250 S 720 220, 880 130";

const CORE = { x: 560, y: 290, r: 64 };

/* ────────────────────────────────────────────────────────────────────────── */
/* Familia de entidades de señal                                              */
/* ────────────────────────────────────────────────────────────────────────── */
type SignalKind =
  | "sales"
  | "risk"
  | "review"
  | "competitor"
  | "trend"
  | "opportunity"
  | "anomaly";

type Signal = {
  id: string;
  kind: SignalKind;
  label: string;
  icon: typeof TrendingUp;
  path: string;
  duration: number; // segundos para recorrer
  begin: number; // delay de entrada
};

type OutputKind =
  | "insight"
  | "insight_critical"
  | "opportunity"
  | "risk"
  | "mission"
  | "prediction"
  | "radar"
  | "growth";

type OutputDef = {
  id: string;
  kind: OutputKind;
  label: string;
  icon: typeof Lightbulb;
  x: number; // % del contenedor
  y: number;
  appearAt: number; // segundo del loop
};

const SIGNALS_DESKTOP: Signal[] = [
  { id: "s1", kind: "sales", label: "Ventas hoy", icon: TrendingUp, path: TRACK_MAIN, duration: 6.4, begin: 0.2 },
  { id: "s2", kind: "risk", label: "Margen", icon: AlertTriangle, path: TRACK_LANE_A, duration: 7.0, begin: 1.6 },
  { id: "s3", kind: "review", label: "Reseña nueva", icon: MessageSquare, path: TRACK_LANE_B, duration: 6.6, begin: 3.0 },
  { id: "s4", kind: "competitor", label: "Competencia", icon: Users2, path: TRACK_MAIN, duration: 6.4, begin: 4.4 },
  { id: "s5", kind: "trend", label: "Tendencia", icon: Activity, path: TRACK_LANE_B, duration: 6.6, begin: 5.8 },
  { id: "s6", kind: "anomaly", label: "Anomalía", icon: Sparkles, path: TRACK_LANE_A, duration: 7.0, begin: 7.4 },
];

const SIGNALS_MOBILE: Signal[] = [
  { id: "m1", kind: "sales", label: "Ventas", icon: TrendingUp, path: TRACK_MAIN, duration: 6.0, begin: 0.2 },
  { id: "m2", kind: "review", label: "Reseña", icon: MessageSquare, path: TRACK_LANE_B, duration: 6.0, begin: 2.4 },
  { id: "m3", kind: "competitor", label: "Competencia", icon: Users2, path: TRACK_MAIN, duration: 6.0, begin: 4.6 },
];

const OUTPUTS_DESKTOP: OutputDef[] = [
  { id: "o1", kind: "growth", label: "Señal de crecimiento", icon: TrendingUp, x: 88, y: 18, appearAt: 1.6 },
  { id: "o2", kind: "opportunity", label: "Oportunidad activa", icon: Target, x: 92, y: 38, appearAt: 2.6 },
  { id: "o3", kind: "insight_critical", label: "Insight crítico", icon: Lightbulb, x: 86, y: 58, appearAt: 3.6 },
  { id: "o4", kind: "radar", label: "Radar competitivo", icon: Radar, x: 93, y: 76, appearAt: 4.6 },
  { id: "o5", kind: "prediction", label: "Predicción semanal", icon: LineChart, x: 82, y: 90, appearAt: 5.6 },
  { id: "o6", kind: "risk", label: "Riesgo priorizado", icon: ShieldAlert, x: 71, y: 8, appearAt: 6.6 },
];

const OUTPUTS_MOBILE: OutputDef[] = [
  { id: "om1", kind: "opportunity", label: "Oportunidad", icon: Target, x: 86, y: 22, appearAt: 1.8 },
  { id: "om2", kind: "insight_critical", label: "Insight", icon: Lightbulb, x: 90, y: 56, appearAt: 3.4 },
  { id: "om3", kind: "radar", label: "Radar", icon: Radar, x: 84, y: 86, appearAt: 5.0 },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* Tokens de color (HSL via CSS vars del design system)                       */
/* ────────────────────────────────────────────────────────────────────────── */
const SIGNAL_TOKENS: Record<SignalKind, { hue: string; ring: string; fill: string; glow: string }> = {
  sales:       { hue: "primary", ring: "ring-primary/25", fill: "from-primary/15 to-primary/0", glow: "hsl(var(--primary))" },
  risk:        { hue: "accent",  ring: "ring-accent/30",  fill: "from-accent/15 to-accent/0",   glow: "hsl(var(--accent))" },
  review:      { hue: "primary", ring: "ring-primary/20", fill: "from-primary/12 to-accent/5",  glow: "hsl(var(--primary))" },
  competitor:  { hue: "accent",  ring: "ring-accent/25",  fill: "from-accent/12 to-primary/5",  glow: "hsl(var(--accent))" },
  trend:       { hue: "primary", ring: "ring-primary/20", fill: "from-primary/10 to-accent/8",  glow: "hsl(var(--primary))" },
  opportunity: { hue: "primary", ring: "ring-primary/30", fill: "from-primary/20 to-accent/8",  glow: "hsl(var(--primary))" },
  anomaly:     { hue: "accent",  ring: "ring-accent/30",  fill: "from-accent/15 to-primary/8",  glow: "hsl(var(--accent))" },
};

const OUTPUT_TOKENS: Record<
  OutputKind,
  { textVar: string; ringVar: string; bgVar: string }
> = {
  insight:          { textVar: "text-primary",  ringVar: "ring-primary/15", bgVar: "bg-primary/8" },
  insight_critical: { textVar: "text-accent",   ringVar: "ring-accent/20",  bgVar: "bg-accent/8" },
  opportunity:      { textVar: "text-primary",  ringVar: "ring-primary/20", bgVar: "bg-primary/10" },
  risk:             { textVar: "text-accent",   ringVar: "ring-accent/25",  bgVar: "bg-accent/10" },
  mission:          { textVar: "text-primary",  ringVar: "ring-primary/15", bgVar: "bg-primary/8" },
  prediction:       { textVar: "text-accent",   ringVar: "ring-accent/15",  bgVar: "bg-accent/8" },
  radar:            { textVar: "text-primary",  ringVar: "ring-primary/20", bgVar: "bg-primary/10" },
  growth:           { textVar: "text-primary",  ringVar: "ring-primary/25", bgVar: "bg-primary/12" },
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Componente                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */
export const IntelligenceFlow = memo(() => {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  /* Mobile detection */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Pause off-screen */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* rAF parallax (sólo desktop) */
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
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
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

  /* Loop de outputs (entran/atenúan, sin saltos) */
  const LOOP = isMobile ? 14 : 20;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] lg:min-h-[560px] select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* ─── Atmósfera ambiental (white-premium) ─── */}
      <div className={`absolute -top-[10%] left-[10%] w-[70%] h-[70%] rounded-full bg-primary/[0.10] ${isMobile ? "blur-[60px]" : "blur-[140px]"}`} />
      <div className={`absolute bottom-[-5%] right-[-5%] w-[55%] h-[55%] rounded-full bg-accent/[0.10] ${isMobile ? "blur-[55px]" : "blur-[130px]"}`} />
      <div className={`absolute top-[40%] left-[30%] w-[35%] h-[35%] rounded-full bg-accent/[0.05] ${isMobile ? "blur-[40px]" : "blur-[110px]"}`} />

      {/* Grid radial sutil */}
      {!isMobile && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-radial-gradient(circle at 60% 50%, transparent 0, transparent 44px, hsl(var(--foreground) / 0.025) 45px, transparent 46px)",
            maskImage: "radial-gradient(ellipse at 60% 50%, #000 10%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 60% 50%, #000 10%, transparent 70%)",
          }}
        />
      )}

      {/* ─── Stage parallax ─── */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: reduce || isMobile ? undefined : "transform" }}
      >
        <svg
          viewBox="0 0 1000 620"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Cerámica premium para la pista */}
            <linearGradient id="trackCeramic" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="hsl(220 30% 96%)" stopOpacity="0" />
              <stop offset="20%" stopColor="hsl(220 30% 96%)" stopOpacity="1" />
              <stop offset="80%" stopColor="hsl(244 60% 96%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(244 60% 96%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trackEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="hsl(204 72% 50%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(204 72% 50%)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="laneEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="hsl(244 68% 66%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(244 68% 66%)" stopOpacity="0.30" />
              <stop offset="100%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="hsl(244 68% 66%)" stopOpacity="0.55" />
              <stop offset="55%" stopColor="hsl(204 72% 50%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="entityShine" cx="35%" cy="35%" r="60%">
              <stop offset="0%"  stopColor="white" stopOpacity="0.95" />
              <stop offset="40%" stopColor="white" stopOpacity="0.35" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            {/* Sombra de contacto */}
            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="3" result="off" />
              <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ─── Halo ancho de la pista (volumen) ─── */}
          <path d={TRACK_LANE_B} stroke="url(#laneEdge)" strokeWidth="22" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d={TRACK_LANE_A} stroke="url(#laneEdge)" strokeWidth="22" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d={TRACK_MAIN}   stroke="url(#trackEdge)" strokeWidth="38" fill="none" strokeLinecap="round" opacity="0.7" />

          {/* Pista cerámica principal (grosor real) */}
          <motion.path
            d={TRACK_MAIN}
            stroke="url(#trackCeramic)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
          {/* Línea fina de borde luminoso */}
          <motion.path
            d={TRACK_MAIN}
            stroke="url(#trackEdge)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />

          {/* Carriles secundarios */}
          {[TRACK_LANE_A, TRACK_LANE_B].map((d, i) => (
            <motion.path
              key={`lane-${i}`}
              d={d}
              stroke="hsl(244 68% 66%)"
              strokeWidth="0.8"
              strokeDasharray="2 9"
              fill="none"
              strokeLinecap="round"
              opacity="0.35"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: "easeInOut", delay: 0.5 + i * 0.15 }}
            />
          ))}

          {/* Checkpoints sobre la pista (estaciones de transformación) */}
          {[
            { x: 280, y: 400 },
            { x: 420, y: 320 },
          ].map((p, i) => (
            <g key={`cp-${i}`} transform={`translate(${p.x} ${p.y})`}>
              <circle r="11" fill="white" stroke="hsl(244 68% 66% / 0.35)" strokeWidth="1" filter="url(#softShadow)" />
              <circle r="3" fill="hsl(244 68% 66%)" opacity="0.85" />
              {!reduce && isVisible && (
                <motion.circle
                  r="11"
                  fill="none"
                  stroke="hsl(244 68% 66%)"
                  strokeWidth="1"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: 1 + i * 0.6 }}
                />
              )}
            </g>
          ))}

          {/* Halo del núcleo (detrás del logo HTML) */}
          <g transform={`translate(${CORE.x} ${CORE.y})`}>
            <circle r="120" fill="url(#coreHalo)" />
            {!reduce && isVisible && [0, 1.4, 2.8].map((d, i) => (
              <motion.circle
                key={`pulse-${i}`}
                r={CORE.r}
                fill="none"
                stroke="hsl(244 68% 66%)"
                strokeWidth="1"
                initial={{ scale: 0.65, opacity: 0 }}
                animate={{ scale: [0.7, 1.7], opacity: [0.65, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 1.2 + d }}
              />
            ))}
          </g>

          {/* ─── ENTIDADES de señal (recorriendo la pista) ─── */}
          {!reduce && isVisible &&
            signals.map((s) => (
              <SignalEntity key={s.id} signal={s} />
            ))}
        </svg>

        {/* ─── NÚCLEO: Logo VISTACEO en disco de cristal ─── */}
        <motion.div
          className="absolute"
          style={{
            left: `${(CORE.x / 1000) * 100}%`,
            top: `${(CORE.y / 620) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="relative" style={{ width: isMobile ? 110 : 138, height: isMobile ? 110 : 138 }}>
            {!reduce && isVisible && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "1px dashed hsl(var(--primary) / 0.32)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
              />
            )}
            {!reduce && isVisible && (
              <motion.div
                className="absolute"
                style={{ inset: 14, borderRadius: 9999, border: "1px solid hsl(var(--accent) / 0.22)" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                <span
                  className="absolute w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent))]"
                  style={{ top: -4, left: "50%", marginLeft: -4 }}
                />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                  style={{ bottom: -3, left: "50%", marginLeft: -3 }}
                />
              </motion.div>
            )}
            <div
              className="absolute rounded-full bg-white flex items-center justify-center overflow-hidden"
              style={{
                inset: 28,
                boxShadow:
                  "0 28px 70px -16px hsl(var(--accent) / 0.45), 0 10px 28px -10px hsl(var(--primary) / 0.35), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 10px rgba(0,0,0,0.04)",
                border: "1px solid rgba(255,255,255,0.95)",
              }}
            >
              {!reduce && isVisible && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.18) 60deg, transparent 120deg, transparent 240deg, hsl(var(--accent) / 0.18) 300deg, transparent 360deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                />
              )}
              <img
                src={vistaceoIcon}
                alt=""
                className="relative z-10 w-[58%] h-[58%] object-contain"
                style={{ filter: "drop-shadow(0 2px 6px hsl(var(--accent) / 0.28))" }}
                draggable={false}
              />
            </div>
          </div>
        </motion.div>

        {/* ─── OUTPUTS ejecutivos (cristalizados a la derecha) ─── */}
        {outputs.map((o) => (
          <OutputCard key={o.id} output={o} reduce={!!reduce} loop={LOOP} isMobile={isMobile} />
        ))}

        {/* Scan-line cinemático */}
        {!reduce && !isMobile && isVisible && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: "32%",
              top: "12%",
              width: "42%",
              height: "76%",
              background: "linear-gradient(105deg, transparent 0%, hsl(var(--accent) / 0.10) 50%, transparent 100%)",
              filter: "blur(12px)",
            }}
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: [0, 1, 0], x: [-220, 120, 380] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5, repeatDelay: 2 }}
          />
        )}
      </div>
    </div>
  );
});

IntelligenceFlow.displayName = "IntelligenceFlow";
export default IntelligenceFlow;

/* ════════════════════════════════════════════════════════════════════════ */
/* SignalEntity — micro escultura translúcida que recorre un path SVG       */
/* ════════════════════════════════════════════════════════════════════════ */
const SignalEntity = memo(({ signal }: { signal: Signal }) => {
  const tok = SIGNAL_TOKENS[signal.kind];

  /* Morfología distintiva por tipo (forma del cuerpo) */
  const body = useMemo(() => {
    switch (signal.kind) {
      case "sales":      return <ellipse rx="14" ry="9"  fill={tok.glow} fillOpacity="0.18" stroke={tok.glow} strokeOpacity="0.55" />;
      case "risk":       return <polygon points="-12,8 0,-12 12,8" fill={tok.glow} fillOpacity="0.18" stroke={tok.glow} strokeOpacity="0.55" />;
      case "review":     return <g><circle cx="-6" cy="0" r="7" fill={tok.glow} fillOpacity="0.18" stroke={tok.glow} strokeOpacity="0.55" /><circle cx="6" cy="0" r="7" fill={tok.glow} fillOpacity="0.18" stroke={tok.glow} strokeOpacity="0.55" /></g>;
      case "competitor": return <g><rect x="-13" y="-7" width="12" height="14" rx="3" fill={tok.glow} fillOpacity="0.16" stroke={tok.glow} strokeOpacity="0.55" /><rect x="1" y="-7" width="12" height="14" rx="3" fill={tok.glow} fillOpacity="0.16" stroke={tok.glow} strokeOpacity="0.55" /></g>;
      case "trend":      return <path d="M -14 4 Q -7 -10, 0 0 T 14 -4" fill="none" stroke={tok.glow} strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" />;
      case "opportunity":return <polygon points="0,-12 11,0 0,12 -11,0" fill={tok.glow} fillOpacity="0.2" stroke={tok.glow} strokeOpacity="0.6" />;
      case "anomaly":    return <path d="M -10 -6 L 6 -10 L 12 6 L -4 12 Z" fill={tok.glow} fillOpacity="0.18" stroke={tok.glow} strokeOpacity="0.55" />;
    }
  }, [signal.kind, tok.glow]);

  return (
    <g>
      {/* halo de contacto bajo la entidad */}
      <g>
        <circle r="18" fill={tok.glow} fillOpacity="0.10">
          <animateMotion dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} path={signal.path} />
        </circle>
      </g>

      {/* cuerpo principal */}
      <g filter="url(#softShadow)">
        <g>
          {body}
          {/* shine */}
          <circle r="6" cx="-3" cy="-3" fill="url(#entityShine)" />
          <animateMotion dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} path={signal.path} rotate="auto" />
        </g>
      </g>

      {/* etiqueta flotante (arriba del cuerpo) */}
      <g>
        <g transform="translate(0,-26)">
          <rect x="-34" y="-9" width="68" height="18" rx="9" fill="white" stroke="hsl(var(--foreground) / 0.06)" />
          <circle cx="-22" cy="0" r="2.4" fill={tok.glow} />
          <text x="-14" y="3.4" fontSize="9.5" fontFamily="ui-sans-serif, system-ui" fontWeight="600" fill="hsl(var(--foreground))">
            {signal.label}
          </text>
        </g>
        <animateMotion dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} path={signal.path} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.18;0.7;1" dur={`${signal.duration}s`} repeatCount="indefinite" begin={`${signal.begin}s`} />
      </g>
    </g>
  );
});
SignalEntity.displayName = "SignalEntity";

/* ════════════════════════════════════════════════════════════════════════ */
/* OutputCard — pieza ejecutiva cristalizada                                */
/* ════════════════════════════════════════════════════════════════════════ */
const OutputCard = memo(
  ({ output, reduce, loop, isMobile }: { output: OutputDef; reduce: boolean; loop: number; isMobile: boolean }) => {
    const tok = OUTPUT_TOKENS[output.kind];
    const Icon = output.icon;
    const enableFloat = !reduce && !isMobile;

    return (
      <motion.div
        className="absolute"
        style={{ left: `${output.x}%`, top: `${output.y}%`, transform: "translate(-50%, -50%)" }}
        initial={{ opacity: 0, scale: 0.55, x: -50 }}
        animate={
          reduce
            ? { opacity: 1, scale: 1, x: 0 }
            : enableFloat
            ? { opacity: [0, 1, 1, 0.85, 1], scale: [0.55, 1, 1, 1, 1], x: [-50, 0, 0, 0, 0], y: [0, 0, -3, 3, 0] }
            : { opacity: [0, 1, 1], scale: [0.6, 1, 1], x: [-30, 0, 0] }
        }
        transition={
          reduce
            ? { duration: 0.5, delay: 0.4 + output.appearAt * 0.1 }
            : enableFloat
            ? { duration: loop, times: [0, output.appearAt / loop, 0.55, 0.78, 1], repeat: Infinity, ease: "easeInOut", delay: 0.5 }
            : { duration: loop, times: [0, output.appearAt / loop, 1], repeat: Infinity, ease: "easeOut", delay: 0.4 }
        }
      >
        <div
          className={`relative flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-foreground/[0.05] shadow-[0_28px_60px_-24px_rgba(15,23,42,0.22),0_4px_14px_-6px_rgba(15,23,42,0.08)] ring-1 ${tok.ringVar}`}
        >
          {!reduce && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${tok.bgVar} opacity-70`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${tok.bgVar.replace("/8", "").replace("/10", "").replace("/12", "")} ${tok.textVar.replace("text-", "bg-")}`} />
            </span>
          )}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tok.bgVar}`}>
            <Icon className={`w-4 h-4 ${tok.textVar}`} strokeWidth={2.2} />
          </div>
          <div className="text-left">
            <div className={`text-[8.5px] font-bold uppercase tracking-[0.14em] ${tok.textVar}`}>
              {output.label}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
OutputCard.displayName = "OutputCard";
