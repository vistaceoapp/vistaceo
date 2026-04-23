import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Eye, Target, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

/**
 * IntelligenceFlow — Escena ambient del hero VISTACEO.
 *
 * Sin cuadro contenedor: la escena vive integrada en el hero,
 * con glows etéreos, una trayectoria curva de señales y outputs
 * ejecutivos que aparecen flotando sobre el fondo blanco.
 *
 * Optimizada para 60fps:
 *  - Parallax via transform directo (sin React state en mousemove)
 *  - IntersectionObserver: pausa cuando no es visible
 *  - Detección mobile: menos chips, menos partículas, sin backdrop-blur
 *  - GPU-friendly: solo transform/opacity
 *  - Respeta prefers-reduced-motion
 */

const CHAOS_CHIPS_DESKTOP = [
  { label: "ventas", x: 2, y: 14 },
  { label: "caja", x: 0, y: 36 },
  { label: "clientes", x: 4, y: 58 },
  { label: "competencia", x: 1, y: 80 },
  { label: "tendencias", x: 6, y: 26 },
];

const CHAOS_CHIPS_MOBILE = [
  { label: "ventas", x: 2, y: 18 },
  { label: "clientes", x: 0, y: 50 },
  { label: "competencia", x: 4, y: 78 },
];

const OUTPUT_CARDS = [
  { icon: Lightbulb, label: "Insight", title: "Mediodía rinde +23%", color: "primary", x: 78, y: 10, delay: 2.2 },
  { icon: Target, label: "Prioridad", title: "Activar recompra", color: "accent", x: 86, y: 30, delay: 2.5 },
  { icon: AlertTriangle, label: "Riesgo", title: "Margen en 5 días", color: "warning", x: 74, y: 52, delay: 2.8 },
  { icon: TrendingUp, label: "Oportunidad", title: "Delivery premium", color: "primary", x: 88, y: 72, delay: 3.1 },
  { icon: Eye, label: "Predicción", title: "Demanda alta jue.", color: "accent", x: 76, y: 90, delay: 3.4 },
];

const FLOW_PATH = "M 20 220 C 160 70, 300 360, 440 210 S 680 90, 800 200";

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/15" },
  accent: { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/15" },
  warning: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/15" },
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
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
      tx = (e.clientX / window.innerWidth - 0.5) * 10;
      ty = (e.clientY / window.innerHeight - 0.5) * 10;
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[440px] lg:min-h-[560px] select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Ambient glows — sin contenedor, fundidos al hero blanco */}
      <div
        className={`absolute -top-32 right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/[0.10] ${
          isMobile ? "blur-[70px]" : "blur-[140px]"
        }`}
      />
      <div
        className={`absolute -bottom-24 right-[10%] w-[55%] h-[55%] rounded-full bg-accent/[0.10] ${
          isMobile ? "blur-[60px]" : "blur-[130px]"
        }`}
      />
      <div
        className={`absolute top-[20%] left-[5%] w-[40%] h-[40%] rounded-full bg-primary/[0.06] ${
          isMobile ? "blur-[50px]" : "blur-[110px]"
        }`}
      />

      {/* Parallax layer */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: reduce || isMobile ? undefined : "transform" }}
      >
        <svg
          viewBox="0 0 820 440"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
              <stop offset="35%" stopColor="hsl(204 72% 50%)" stopOpacity="0.5" />
              <stop offset="65%" stopColor="hsl(244 68% 66%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="flowGradSoft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(204 72% 50%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(244 68% 66%)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(204 72% 60%)" stopOpacity="0.7" />
              <stop offset="50%" stopColor="hsl(244 68% 66%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(244 68% 66%)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Wide soft halo */}
          <path
            d={FLOW_PATH}
            stroke="url(#flowGradSoft)"
            strokeWidth="42"
            fill="none"
            strokeLinecap="round"
          />

          {/* Main trajectory */}
          <motion.path
            d={FLOW_PATH}
            stroke="url(#flowGrad)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: reduce ? 0.6 : 0.8 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {/* Dashed echo */}
          <motion.path
            d={FLOW_PATH}
            stroke="hsl(244 68% 66%)"
            strokeWidth="0.7"
            strokeDasharray="2 9"
            fill="none"
            opacity="0.28"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Particles */}
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

          {/* Core node */}
          <g transform="translate(560 200)">
            {!reduce && (
              <motion.circle
                r="56"
                fill="url(#coreGrad)"
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: [0.85, 1.12, 0.95], opacity: [0.35, 0.65, 0.45] } : { scale: 0.95, opacity: 0.45 }}
                transition={{ duration: 4, repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay: 1.6 }}
              />
            )}
            <motion.circle
              r="13"
              fill="white"
              stroke="hsl(204 72% 50%)"
              strokeWidth="1.4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
            />
            {!reduce && !isMobile && isVisible &&
              [0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={Math.cos((i * Math.PI * 2) / 3) * 28}
                  cy={Math.sin((i * Math.PI * 2) / 3) * 28}
                  r="2"
                  fill="hsl(244 68% 66%)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.25, 0.9, 0.25] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: 1.8 + i * 0.3 }}
                />
              ))}
          </g>
        </svg>

        {/* Chaos chips */}
        {chips.map((chip, i) => (
          <motion.div
            key={chip.label}
            className="absolute"
            style={{ left: `${chip.x}%`, top: `${chip.y}%`, willChange: reduce ? undefined : "transform, opacity" }}
            initial={{ opacity: 0, x: -30, scale: 0.6 }}
            animate={
              reduce || !isVisible
                ? { opacity: 0.7, x: 0, scale: 1 }
                : {
                    opacity: [0, 0.9, 0.9, 0],
                    x: [-30, 0, 140, 280],
                    scale: [0.6, 1, 0.95, 0.4],
                  }
            }
            transition={
              reduce || !isVisible
                ? { duration: 0.5, delay: 0.3 + i * 0.06 }
                : {
                    duration: 5.2,
                    delay: 0.6 + i * 0.5,
                    repeat: Infinity,
                    repeatDelay: isMobile ? 2.5 : 1.4,
                    ease: "easeInOut",
                  }
            }
          >
            <div className="px-2.5 py-1 rounded-full bg-white/70 border border-foreground/[0.06] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide">{chip.label}</span>
            </div>
          </motion.div>
        ))}

        {/* Output cards */}
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
                    ? { opacity: 1, scale: 1, x: 0, y: [0, -5, 0, 5, 0] }
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 border border-foreground/[0.06] shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18),0_4px_12px_-4px_rgba(15,23,42,0.06)] ring-1 ${c.ring}`}
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

        {/* VISTACEO marker near the core */}
        <motion.div
          className="absolute"
          style={{ left: "70%", top: "45.4%" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.4)]">
            <Sparkles className="w-2.5 h-2.5" />
            <span className="text-[8px] font-bold tracking-widest">VISTACEO</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

IntelligenceFlow.displayName = "IntelligenceFlow";
export default IntelligenceFlow;
