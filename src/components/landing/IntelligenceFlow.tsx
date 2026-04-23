import { memo, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import vistaceoIcon from "@/assets/brand/icon-vistaceo-new.webp";

/**
 * IntelligenceFlow — Hero VISTACEO · Etapa 1 (Static Premium)
 *
 * Escena hero escultórica white-premium. NO es un diagrama.
 * Composición de objetos 3D-style construidos con SVG + gradientes radiales/cónicos:
 *
 *   Foreground   → entidad protagónica (gota ascendente "ventas") + base reflectante
 *   Midground    → MOTOR CENTRAL monumental (lente de cristal con anillos concéntricos
 *                  y el isotipo VISTACEO embebido como corazón)
 *                  + 3 entidades escultóricas flotando alrededor
 *   Background   → ecos suaves desenfocados, halo ambiental, partículas mínimas
 *   Right rail   → 3 outputs cristalizados (placas de cristal grueso)
 *
 * Esta etapa NO incluye animación compleja — sólo respiración mínima ambiental.
 */

/* ═══════════════════════════════════════════════════════════════════
   DEFS — Materiales premium (glass, cerámica, halos, luz)
   ═══════════════════════════════════════════════════════════════════ */
const SceneDefs = memo(() => (
  <defs>
    {/* Halo ambiental detrás del motor */}
    <radialGradient id="ambientHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#E9E4FF" stopOpacity="0.55" />
      <stop offset="45%" stopColor="#DCE9FF" stopOpacity="0.28" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>

    {/* Lente exterior del motor — vidrio frío translúcido */}
    <radialGradient id="coreLens" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="35%" stopColor="#F4F1FF" stopOpacity="0.92" />
      <stop offset="75%" stopColor="#E1E8FF" stopOpacity="0.78" />
      <stop offset="100%" stopColor="#C9D2F2" stopOpacity="0.55" />
    </radialGradient>

    {/* Anillo cerámico interior */}
    <radialGradient id="ceramicRing" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="60%" stopColor="#F0EEFB" />
      <stop offset="100%" stopColor="#D7DDF2" />
    </radialGradient>

    {/* Bisel iluminado celeste-violeta */}
    <linearGradient id="bevelEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2692DC" stopOpacity="0.85" />
      <stop offset="50%" stopColor="#A99EFF" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#746CE6" stopOpacity="0.85" />
    </linearGradient>

    {/* Highlight especular — toque de luz superior */}
    <radialGradient id="specularTop" cx="50%" cy="0%" r="60%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
      <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>

    {/* Sombra de contacto bajo objetos flotantes */}
    <radialGradient id="contactShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#7A8CB8" stopOpacity="0.32" />
      <stop offset="100%" stopColor="#7A8CB8" stopOpacity="0" />
    </radialGradient>

    {/* Material de entidades — glass blanco perlado */}
    <radialGradient id="entityGlass" cx="35%" cy="25%" r="80%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="55%" stopColor="#F2EEFF" stopOpacity="0.88" />
      <stop offset="100%" stopColor="#C7D0EF" stopOpacity="0.7" />
    </radialGradient>

    {/* Glow violeta sutil para outputs */}
    <radialGradient id="outputGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#A99EFF" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#A99EFF" stopOpacity="0" />
    </radialGradient>

    {/* Filtro: blur suave para ecos de background */}
    <filter id="echoBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" />
    </filter>

    {/* Filtro: glow premium */}
    <filter id="premiumGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
));
SceneDefs.displayName = "SceneDefs";

/* ═══════════════════════════════════════════════════════════════════
   MOTOR CENTRAL — Lente monumental (protagonista de la escena)
   ═══════════════════════════════════════════════════════════════════ */
const CoreEngine = memo(({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
  return (
    <g>
      {/* Halo ambiental exterior masivo */}
      <circle cx={cx} cy={cy} r={r * 2.1} fill="url(#ambientHalo)" />

      {/* Sombra de contacto */}
      <ellipse cx={cx} cy={cy + r * 0.95} rx={r * 1.05} ry={r * 0.18} fill="url(#contactShadow)" />

      {/* Anillo orbital exterior (delgado, decorativo refinado) */}
      <circle cx={cx} cy={cy} r={r * 1.45} fill="none" stroke="url(#bevelEdge)" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 6" />

      {/* Anillo orbital medio */}
      <circle cx={cx} cy={cy} r={r * 1.22} fill="none" stroke="#C7D0EF" strokeWidth="0.8" strokeOpacity="0.5" />

      {/* Carcasa exterior — lente de cristal */}
      <circle cx={cx} cy={cy} r={r} fill="url(#coreLens)" />
      {/* Bisel iluminado */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#bevelEdge)" strokeWidth="2" strokeOpacity="0.9" />
      {/* Sutil sombra interior */}
      <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />

      {/* Anillo cerámico interno */}
      <circle cx={cx} cy={cy} r={r * 0.78} fill="url(#ceramicRing)" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke="#D7DDF2" strokeWidth="0.6" />

      {/* Núcleo más profundo — disco interno */}
      <circle cx={cx} cy={cy} r={r * 0.58} fill="#FFFFFF" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="url(#specularTop)" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="none" stroke="url(#bevelEdge)" strokeWidth="1.2" strokeOpacity="0.5" />

      {/* Highlight especular superior (reflejo de estudio) */}
      <ellipse cx={cx} cy={cy - r * 0.55} rx={r * 0.55} ry={r * 0.14} fill="#FFFFFF" opacity="0.7" />
      <ellipse cx={cx - r * 0.18} cy={cy - r * 0.4} rx={r * 0.08} ry={r * 0.04} fill="#FFFFFF" opacity="0.95" />

      {/* Marcas de instrumento — 8 ticks elegantes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r1 = r * 0.85;
        const r2 = r * 0.92;
        const x1 = cx + Math.cos(a) * r1;
        const y1 = cy + Math.sin(a) * r1;
        const x2 = cx + Math.cos(a) * r2;
        const y2 = cy + Math.sin(a) * r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9AA6CF" strokeWidth="1" strokeOpacity="0.55" strokeLinecap="round" />;
      })}
    </g>
  );
});
CoreEngine.displayName = "CoreEngine";

/* ═══════════════════════════════════════════════════════════════════
   ENTIDADES ESCULTÓRICAS — cada una con morfología propia
   ═══════════════════════════════════════════════════════════════════ */

// Gota ascendente — VENTAS (foreground, protagonista)
const SalesEntity = memo(({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const w = 70 * scale;
  const h = 110 * scale;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={h * 0.55} rx={w * 0.7} ry={w * 0.18} fill="url(#contactShadow)" />
      <path
        d={`M 0 ${-h * 0.5} C ${w * 0.55} ${-h * 0.3}, ${w * 0.55} ${h * 0.2}, 0 ${h * 0.45} C ${-w * 0.55} ${h * 0.2}, ${-w * 0.55} ${-h * 0.3}, 0 ${-h * 0.5} Z`}
        fill="url(#entityGlass)"
        stroke="url(#bevelEdge)"
        strokeWidth="1.2"
        strokeOpacity="0.7"
      />
      {/* Highlight interno */}
      <ellipse cx={-w * 0.2} cy={-h * 0.2} rx={w * 0.18} ry={h * 0.22} fill="#FFFFFF" opacity="0.8" />
      <ellipse cx={-w * 0.25} cy={-h * 0.28} rx={w * 0.06} ry={h * 0.06} fill="#FFFFFF" opacity="1" />
      {/* Núcleo interno luminoso */}
      <circle cx={0} cy={h * 0.05} r={w * 0.18} fill="url(#outputGlow)" />
      <circle cx={0} cy={h * 0.05} r={w * 0.08} fill="#FFFFFF" opacity="0.9" />
    </g>
  );
});
SalesEntity.displayName = "SalesEntity";

// Prisma asimétrico — RIESGO/ANOMALÍA
const RiskEntity = memo(({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const s = 56 * scale;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={s * 0.7} rx={s * 0.6} ry={s * 0.12} fill="url(#contactShadow)" />
      <polygon
        points={`0,${-s * 0.7} ${s * 0.62},${-s * 0.1} ${s * 0.42},${s * 0.55} ${-s * 0.5},${s * 0.45} ${-s * 0.6},${-s * 0.2}`}
        fill="url(#entityGlass)"
        stroke="url(#bevelEdge)"
        strokeWidth="1.2"
        strokeOpacity="0.75"
      />
      {/* Faceta interna (sugiere 3D) */}
      <polygon
        points={`0,${-s * 0.7} ${s * 0.62},${-s * 0.1} 0,${s * 0.1}`}
        fill="#FFFFFF"
        opacity="0.45"
      />
      <polygon
        points={`0,${-s * 0.7} ${-s * 0.6},${-s * 0.2} 0,${s * 0.1}`}
        fill="#A99EFF"
        opacity="0.18"
      />
      <circle cx={s * 0.05} cy={s * 0.05} r={s * 0.1} fill="#FFFFFF" opacity="0.85" />
    </g>
  );
});
RiskEntity.displayName = "RiskEntity";

// Cápsula doble orgánica — RESEÑAS
const ReviewEntity = memo(({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const s = 50 * scale;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={s * 0.85} rx={s * 0.85} ry={s * 0.13} fill="url(#contactShadow)" />
      {/* Burbuja grande */}
      <circle cx={-s * 0.2} cy={-s * 0.05} r={s * 0.55} fill="url(#entityGlass)" stroke="url(#bevelEdge)" strokeWidth="1.1" strokeOpacity="0.7" />
      {/* Burbuja secundaria */}
      <circle cx={s * 0.45} cy={s * 0.25} r={s * 0.32} fill="url(#entityGlass)" stroke="url(#bevelEdge)" strokeWidth="1" strokeOpacity="0.65" />
      {/* Highlights */}
      <ellipse cx={-s * 0.38} cy={-s * 0.28} rx={s * 0.13} ry={s * 0.16} fill="#FFFFFF" opacity="0.85" />
      <ellipse cx={s * 0.35} cy={s * 0.13} rx={s * 0.07} ry={s * 0.09} fill="#FFFFFF" opacity="0.8" />
    </g>
  );
});
ReviewEntity.displayName = "ReviewEntity";

// Doble plano paralelo — COMPETENCIA
const CompetitorEntity = memo(({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const w = 70 * scale;
  const h = 50 * scale;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={h * 0.85} rx={w * 0.55} ry={h * 0.13} fill="url(#contactShadow)" />
      {/* Plano trasero */}
      <rect x={-w * 0.35} y={-h * 0.35} width={w * 0.7} height={h * 0.75} rx={8} fill="url(#entityGlass)" stroke="url(#bevelEdge)" strokeWidth="1" strokeOpacity="0.55" opacity="0.75" />
      {/* Plano frontal (offset) */}
      <rect x={-w * 0.45} y={-h * 0.5} width={w * 0.7} height={h * 0.75} rx={8} fill="url(#entityGlass)" stroke="url(#bevelEdge)" strokeWidth="1.2" strokeOpacity="0.75" />
      {/* Highlight */}
      <rect x={-w * 0.4} y={-h * 0.45} width={w * 0.18} height={h * 0.1} rx={3} fill="#FFFFFF" opacity="0.7" />
      {/* Línea de comparación */}
      <line x1={-w * 0.32} y1={-h * 0.1} x2={w * 0.12} y2={-h * 0.1} stroke="#A99EFF" strokeWidth="1" strokeOpacity="0.6" />
      <line x1={-w * 0.32} y1={h * 0.05} x2={w * 0.05} y2={h * 0.05} stroke="#2692DC" strokeWidth="1" strokeOpacity="0.55" />
    </g>
  );
});
CompetitorEntity.displayName = "CompetitorEntity";

// Cinta ondulada — TENDENCIA
const TrendEntity = memo(({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const w = 95 * scale;
  const h = 38 * scale;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={h * 0.95} rx={w * 0.45} ry={h * 0.18} fill="url(#contactShadow)" />
      <path
        d={`M ${-w * 0.5} ${h * 0.1} C ${-w * 0.25} ${-h * 0.6}, ${w * 0.05} ${h * 0.6}, ${w * 0.5} ${-h * 0.2} L ${w * 0.5} ${h * 0.15} C ${w * 0.05} ${h * 0.95}, ${-w * 0.25} ${-h * 0.25}, ${-w * 0.5} ${h * 0.45} Z`}
        fill="url(#entityGlass)"
        stroke="url(#bevelEdge)"
        strokeWidth="1.2"
        strokeOpacity="0.7"
      />
      {/* Highlight runner */}
      <path
        d={`M ${-w * 0.5} ${-h * 0.05} C ${-w * 0.25} ${-h * 0.7}, ${w * 0.05} ${h * 0.45}, ${w * 0.5} ${-h * 0.3}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeOpacity="0.65"
        strokeLinecap="round"
      />
    </g>
  );
});
TrendEntity.displayName = "TrendEntity";

// Eco background (entidad desenfocada)
const EchoEntity = memo(({ x, y, r }: { x: number; y: number; r: number }) => (
  <g filter="url(#echoBlur)" opacity="0.55">
    <circle cx={x} cy={y} r={r} fill="url(#entityGlass)" />
  </g>
));
EchoEntity.displayName = "EchoEntity";

/* ═══════════════════════════════════════════════════════════════════
   OUTPUTS CRISTALIZADOS — Artefactos premium (right rail)
   ═══════════════════════════════════════════════════════════════════ */
type OutputKind = "opportunity" | "insight" | "radar" | "prediction" | "risk";

const OUTPUT_META: Record<OutputKind, { label: string; sub: string; accent: string }> = {
  opportunity: { label: "Oportunidad activa", sub: "+18% potencial", accent: "#2692DC" },
  insight: { label: "Insight crítico", sub: "Patrón detectado", accent: "#746CE6" },
  radar: { label: "Radar competitivo", sub: "3 movimientos", accent: "#2692DC" },
  prediction: { label: "Predicción semanal", sub: "Próx. 7 días", accent: "#746CE6" },
  risk: { label: "Riesgo priorizado", sub: "Atención alta", accent: "#A99EFF" },
};

const CrystalOutput = memo(({
  kind, top, delay = 0,
}: { kind: OutputKind; top: string; delay?: number }) => {
  const meta = OUTPUT_META[kind];
  return (
    <div
      className="absolute right-0 select-none"
      style={{
        top,
        animation: `vc-float 7s ease-in-out ${delay}s infinite`,
        willChange: "transform",
      }}
    >
      <div className="relative">
        {/* Glow detrás de la card */}
        <div
          className="absolute -inset-3 rounded-2xl blur-2xl opacity-60"
          style={{ background: `radial-gradient(circle, ${meta.accent}33, transparent 70%)` }}
        />
        {/* Placa de cristal */}
        <div
          className="relative rounded-2xl px-4 py-3 min-w-[200px] backdrop-blur-xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(244,241,255,0.78) 100%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(180,190,220,0.25) inset, 0 18px 40px -12px rgba(74,86,140,0.28), 0 4px 12px -4px rgba(74,86,140,0.18)",
            border: "1px solid rgba(255,255,255,0.9)",
          }}
        >
          {/* Highlight superior (especular) */}
          <div
            className="absolute inset-x-3 top-0 h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)" }}
          />
          <div className="flex items-center gap-2.5">
            {/* Indicador material */}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: meta.accent,
                boxShadow: `0 0 10px ${meta.accent}, 0 0 0 3px ${meta.accent}22`,
              }}
            />
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold tracking-tight" style={{ color: "#1A1F36" }}>
                {meta.label}
              </span>
              <span className="text-[10.5px] text-[#6E7591] font-medium">{meta.sub}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
CrystalOutput.displayName = "CrystalOutput";

/* ═══════════════════════════════════════════════════════════════════
   ESCENA HERO PRINCIPAL — Etapa 2 (respiración + parallax + orbits)
   ═══════════════════════════════════════════════════════════════════ */
const IntelligenceFlow = memo(() => {
  const VB_W = 900;
  const VB_H = 700;
  const CORE = { x: 440, y: 340, r: 130 };

  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Pause when off-screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Subtle cursor parallax (desktop only)
  useEffect(() => {
    if (reduceMotion || !inView) return;
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      target = { x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) };
    };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      setParallax({ x: cur.x, y: cur.y });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion, inView]);

  const animsActive = inView && !reduceMotion;

  // Layer offsets — depth-based parallax intensity
  const layer = (depth: number) => ({
    transform: `translate3d(${parallax.x * depth}px, ${parallax.y * depth}px, 0)`,
    transition: "transform 120ms linear",
    willChange: "transform",
  });

  return (
    <div ref={wrapRef} className="relative w-full h-full min-h-[560px] overflow-hidden">
      {/* Atmósfera ambiental */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(220,233,255,0.55) 0%, transparent 70%), radial-gradient(40% 40% at 70% 30%, rgba(233,228,255,0.45) 0%, transparent 75%)",
        }}
      />

      {/* SVG escena */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="relative w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={animsActive ? { transform: `translate3d(${parallax.x * 6}px, ${parallax.y * 6}px, 0)`, transition: "transform 180ms linear" } : undefined}
      >
        <SceneDefs />

        {/* BACKGROUND — drift más lento */}
        <g style={{ transformOrigin: "center", animation: animsActive ? "vc-bg-drift 24s ease-in-out infinite" : undefined }}>
          <EchoEntity x={140} y={130} r={48} />
          <EchoEntity x={780} y={150} r={36} />
          <EchoEntity x={760} y={580} r={42} />
          <EchoEntity x={120} y={560} r={32} />
        </g>

        {/* Anillo orbital lejano (rotación lenta inversa) */}
        <g
          style={{
            transformOrigin: `${CORE.x}px ${CORE.y}px`,
            animation: animsActive ? "vc-spin-rev 90s linear infinite" : undefined,
          }}
        >
          <circle cx={CORE.x} cy={CORE.y} r={CORE.r * 2.4} fill="none" stroke="#C7D0EF" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="1 8" />
        </g>

        {/* MOTOR — respiración + anillo dasheado rotando */}
        <g style={{ transformOrigin: `${CORE.x}px ${CORE.y}px`, animation: animsActive ? "vc-breathe 6s ease-in-out infinite" : undefined }}>
          {/* anillo dasheado interno girando dentro del motor */}
          <g style={{ transformOrigin: `${CORE.x}px ${CORE.y}px`, animation: animsActive ? "vc-spin 60s linear infinite" : undefined }}>
            <CoreEngine cx={CORE.x} cy={CORE.y} r={CORE.r} />
          </g>
        </g>

        {/* MIDGROUND — entidades, cada una con su propio bob */}
        <g style={{ transformOrigin: "210px 195px", animation: animsActive ? "vc-bob-a 7s ease-in-out infinite" : undefined }}>
          <ReviewEntity x={210} y={195} scale={1.05} />
        </g>
        <g style={{ transformOrigin: "680px 210px", animation: animsActive ? "vc-bob-b 8.5s ease-in-out infinite" : undefined }}>
          <CompetitorEntity x={680} y={210} scale={1} />
        </g>
        <g style={{ transformOrigin: "700px 460px", animation: animsActive ? "vc-bob-c 9.5s ease-in-out infinite" : undefined }}>
          <TrendEntity x={700} y={460} scale={0.95} />
        </g>
        <g style={{ transformOrigin: "195px 465px", animation: animsActive ? "vc-bob-d 8s ease-in-out infinite" : undefined }}>
          <RiskEntity x={195} y={465} scale={1.05} />
        </g>

        {/* FOREGROUND — protagonista (respira más amplio) */}
        <g style={{ transformOrigin: "385px 605px", animation: animsActive ? "vc-bob-fg 6.5s ease-in-out infinite" : undefined }}>
          <SalesEntity x={385} y={605} scale={1.15} />
        </g>

        {/* Reflejo base */}
        <ellipse cx={CORE.x} cy={680} rx={420} ry={14} fill="url(#contactShadow)" opacity="0.5" />
      </svg>

      {/* Isotipo VISTACEO — respiración + halo pulse */}
      <div
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          left: `${(CORE.x / VB_W) * 100}%`,
          top: `${(CORE.y / VB_H) * 100}%`,
          transform: `translate(-50%, -50%) translate3d(${parallax.x * 4}px, ${parallax.y * 4}px, 0)`,
          width: `${((CORE.r * 0.7) / VB_W) * 100}%`,
          transition: "transform 180ms linear",
        }}
      >
        <div className="relative w-full aspect-square" style={animsActive ? { animation: "vc-breathe 6s ease-in-out infinite" } : undefined}>
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: "radial-gradient(circle, rgba(169,158,255,0.45), transparent 65%)",
              animation: animsActive ? "vc-halo-pulse 5s ease-in-out infinite" : undefined,
            }}
          />
          <img
            src={vistaceoIcon}
            alt=""
            className="relative w-full h-full object-contain"
            style={{ filter: "drop-shadow(0 6px 14px rgba(74,86,140,0.25)) drop-shadow(0 0 10px rgba(169,158,255,0.35))" }}
            draggable={false}
          />
        </div>
      </div>

      {/* OUTPUTS — right rail, parallax leve (foreground) */}
      <div
        className="absolute right-2 sm:right-4 top-0 h-full pointer-events-none hidden md:block"
        style={animsActive ? layer(10) : undefined}
      >
        <CrystalOutput kind="opportunity" top="14%" delay={0} />
        <CrystalOutput kind="insight" top="44%" delay={1.4} />
        <CrystalOutput kind="prediction" top="74%" delay={2.6} />
      </div>

      {/* OUTPUTS mobile */}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-3 md:hidden pointer-events-none">
        <CrystalOutput kind="opportunity" top="0" delay={0} />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes vc-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-6px) translateX(-2px); }
        }
        @keyframes vc-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.018); }
        }
        @keyframes vc-halo-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes vc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes vc-spin-rev {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes vc-bg-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, -3px); }
        }
        @keyframes vc-bob-a {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-3px, -8px); }
        }
        @keyframes vc-bob-b {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, -6px); }
        }
        @keyframes vc-bob-c {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(3px, 7px); }
        }
        @keyframes vc-bob-d {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-4px, 6px); }
        }
        @keyframes vc-bob-fg {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, -10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="vc-float"], [style*="vc-breathe"], [style*="vc-halo-pulse"],
          [style*="vc-spin"], [style*="vc-spin-rev"], [style*="vc-bg-drift"],
          [style*="vc-bob-a"], [style*="vc-bob-b"], [style*="vc-bob-c"],
          [style*="vc-bob-d"], [style*="vc-bob-fg"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
});
IntelligenceFlow.displayName = "IntelligenceFlow";

export default IntelligenceFlow;
