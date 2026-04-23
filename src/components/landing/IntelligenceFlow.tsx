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
    {/* Halo ambiental — luz de estudio estratificada */}
    <radialGradient id="ambientHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#EDE7FF" stopOpacity="0.7" />
      <stop offset="35%" stopColor="#DCE9FF" stopOpacity="0.4" />
      <stop offset="70%" stopColor="#F2EEFF" stopOpacity="0.15" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>

    {/* Lente exterior — vidrio frosted con refracción */}
    <radialGradient id="coreLens" cx="38%" cy="30%" r="78%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="22%" stopColor="#FAF7FF" stopOpacity="0.96" />
      <stop offset="48%" stopColor="#EDE9FB" stopOpacity="0.88" />
      <stop offset="78%" stopColor="#DDE3F7" stopOpacity="0.74" />
      <stop offset="100%" stopColor="#B8C2E8" stopOpacity="0.5" />
    </radialGradient>

    {/* Refracción interior — sutil tinte iridiscente */}
    <radialGradient id="coreRefraction" cx="62%" cy="68%" r="55%">
      <stop offset="0%" stopColor="#C8DCFF" stopOpacity="0.45" />
      <stop offset="50%" stopColor="#E3D9FF" stopOpacity="0.22" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>

    {/* Cerámica satinada interior */}
    <radialGradient id="ceramicRing" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="45%" stopColor="#F6F3FE" />
      <stop offset="80%" stopColor="#E6E9F5" />
      <stop offset="100%" stopColor="#CDD3E8" />
    </radialGradient>

    {/* Bisel iluminado — gradiente VISTACEO refinado */}
    <linearGradient id="bevelEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2692DC" stopOpacity="0.9" />
      <stop offset="50%" stopColor="#A99EFF" stopOpacity="0.78" />
      <stop offset="100%" stopColor="#5C53D4" stopOpacity="0.9" />
    </linearGradient>

    {/* Rim light — luz de borde */}
    <linearGradient id="rimLight" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
      <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </linearGradient>

    {/* Highlight especular superior */}
    <radialGradient id="specularTop" cx="50%" cy="0%" r="65%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>

    {/* Sombra de contacto — gris-azulado profundo */}
    <radialGradient id="contactShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#5A6A98" stopOpacity="0.4" />
      <stop offset="60%" stopColor="#7A8CB8" stopOpacity="0.18" />
      <stop offset="100%" stopColor="#7A8CB8" stopOpacity="0" />
    </radialGradient>

    {/* Material de entidades — glass blanco perlado refinado */}
    <radialGradient id="entityGlass" cx="32%" cy="22%" r="85%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="35%" stopColor="#F8F5FF" stopOpacity="0.95" />
      <stop offset="70%" stopColor="#E8EBF7" stopOpacity="0.85" />
      <stop offset="100%" stopColor="#B8C4E5" stopOpacity="0.65" />
    </radialGradient>

    {/* Faceta interior — sugiere refracción */}
    <linearGradient id="entityFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
      <stop offset="100%" stopColor="#D8DFF2" stopOpacity="0.1" />
    </linearGradient>

    {/* Glow violeta sutil */}
    <radialGradient id="outputGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#A99EFF" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#A99EFF" stopOpacity="0" />
    </radialGradient>

    {/* Glow celeste para entradas */}
    <radialGradient id="inputGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#2692DC" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#2692DC" stopOpacity="0" />
    </radialGradient>

    {/* Floor reflection — reflejo del piso */}
    <linearGradient id="floorReflect" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </linearGradient>

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

    {/* Filtro: soft inner shadow para profundidad de cerámica */}
    <filter id="innerSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" />
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
      {/* Halo ambiental exterior masivo (key light) */}
      <circle cx={cx} cy={cy} r={r * 2.3} fill="url(#ambientHalo)" />

      {/* Sombra de contacto profunda */}
      <ellipse cx={cx} cy={cy + r * 0.98} rx={r * 1.15} ry={r * 0.2} fill="url(#contactShadow)" />
      <ellipse cx={cx} cy={cy + r * 1.02} rx={r * 0.7} ry={r * 0.09} fill="#5A6A98" opacity="0.18" />

      {/* Anillo orbital exterior — punteado fino */}
      <circle cx={cx} cy={cy} r={r * 1.55} fill="none" stroke="url(#bevelEdge)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 7" />

      {/* Anillo orbital medio — sólido translúcido */}
      <circle cx={cx} cy={cy} r={r * 1.28} fill="none" stroke="#B8C2E5" strokeWidth="0.8" strokeOpacity="0.45" />
      <circle cx={cx} cy={cy} r={r * 1.18} fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.7" />

      {/* CARCASA EXTERIOR — vidrio frosted con refracción */}
      <circle cx={cx} cy={cy} r={r} fill="url(#coreLens)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#coreRefraction)" />

      {/* Bisel iluminado exterior */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#bevelEdge)" strokeWidth="2.2" strokeOpacity="0.92" />
      {/* Rim light interior — anillo blanco fino */}
      <circle cx={cx} cy={cy} r={r - 1.5} fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.85" />
      {/* Sombra interior sutil para profundidad */}
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="#9AA6CF" strokeWidth="0.6" strokeOpacity="0.35" />

      {/* Anillo cerámico interno satinado */}
      <circle cx={cx} cy={cy} r={r * 0.78} fill="url(#ceramicRing)" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke="#C7D0EA" strokeWidth="0.6" strokeOpacity="0.7" />
      <circle cx={cx} cy={cy} r={r * 0.78 - 1} fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.75" />

      {/* Lente interna profunda — vidrio puro */}
      <circle cx={cx} cy={cy} r={r * 0.58} fill="#FFFFFF" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="url(#coreRefraction)" opacity="0.6" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="url(#specularTop)" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="none" stroke="url(#bevelEdge)" strokeWidth="1.4" strokeOpacity="0.55" />
      <circle cx={cx} cy={cy} r={r * 0.58 - 1} fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.7" />

      {/* HIGHLIGHTS ESPECULARES — luz de estudio */}
      {/* Highlight superior amplio */}
      <ellipse cx={cx} cy={cy - r * 0.6} rx={r * 0.6} ry={r * 0.16} fill="#FFFFFF" opacity="0.78" />
      {/* Punto de luz nítido */}
      <ellipse cx={cx - r * 0.22} cy={cy - r * 0.45} rx={r * 0.09} ry={r * 0.045} fill="#FFFFFF" opacity="1" />
      {/* Reflejo lateral sutil */}
      <ellipse cx={cx + r * 0.55} cy={cy + r * 0.1} rx={r * 0.06} ry={r * 0.25} fill="#FFFFFF" opacity="0.35" transform={`rotate(-15 ${cx + r * 0.55} ${cy + r * 0.1})`} />
      {/* Reflejo inferior — bounce light */}
      <ellipse cx={cx} cy={cy + r * 0.55} rx={r * 0.4} ry={r * 0.08} fill="#A99EFF" opacity="0.18" />

      {/* Marcas de instrumento — 12 ticks finos elegantes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r1 = r * 0.86;
        const r2 = r * 0.93;
        const x1 = cx + Math.cos(a) * r1;
        const y1 = cy + Math.sin(a) * r1;
        const x2 = cx + Math.cos(a) * r2;
        const y2 = cy + Math.sin(a) * r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8896C2" strokeWidth={i % 3 === 0 ? 1.2 : 0.7} strokeOpacity={i % 3 === 0 ? 0.7 : 0.4} strokeLinecap="round" />;
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
type OutputKind = "opportunity" | "insight" | "radar" | "prediction" | "risk" | "mission";

const OUTPUT_META: Record<OutputKind, { label: string; sub: string; accent: string }> = {
  opportunity: { label: "Oportunidad activa", sub: "+18% potencial", accent: "#2692DC" },
  insight: { label: "Insight nuevo", sub: "Patrón detectado", accent: "#746CE6" },
  radar: { label: "Radar competitivo", sub: "3 movimientos", accent: "#2692DC" },
  prediction: { label: "Predicción semanal", sub: "Próx. 7 días", accent: "#746CE6" },
  risk: { label: "Riesgo priorizado", sub: "Atención alta", accent: "#A99EFF" },
  mission: { label: "Misión sugerida", sub: "Acción inmediata", accent: "#746CE6" },
};

const CrystalOutput = memo(({
  kind, top, visible,
}: { kind: OutputKind; top: string; visible: boolean }) => {
  const meta = OUTPUT_META[kind];
  return (
    <div
      className="absolute right-0 select-none"
      style={{
        top,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0) scale(1)" : "translateX(36px) scale(0.92)",
        transition: "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform, opacity",
      }}
    >
      <div className="relative" style={{ animation: visible ? "vc-float 8s ease-in-out infinite" : undefined }}>
        {/* Halo de glow accent */}
        <div
          className="absolute -inset-4 rounded-[22px] blur-2xl opacity-70"
          style={{ background: `radial-gradient(60% 60% at 30% 30%, ${meta.accent}38, transparent 70%)` }}
        />
        {/* Sombra de contacto bajo el artefacto */}
        <div
          className="absolute -bottom-3 left-3 right-3 h-3 rounded-full blur-md opacity-60"
          style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(74,86,140,0.35), transparent 70%)" }}
        />

        {/* PLACA DE CRISTAL — artefacto premium */}
        <div
          className="relative rounded-[18px] pl-3 pr-4 py-3 min-w-[218px] backdrop-blur-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,245,255,0.88) 50%, rgba(232,235,247,0.82) 100%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,1) inset, 0 -1px 0 rgba(160,172,205,0.35) inset, 0 0 0 1px rgba(255,255,255,0.7) inset, 0 22px 48px -14px rgba(60,72,120,0.32), 0 8px 18px -6px rgba(60,72,120,0.22), 0 2px 4px -1px rgba(60,72,120,0.12)",
            border: "1px solid rgba(255,255,255,0.92)",
          }}
        >
          {/* Top edge — luz especular superior */}
          <div
            className="absolute inset-x-4 top-0 h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,1) 50%, transparent 100%)" }}
          />
          {/* Iridiscencia interior — refracción sutil */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              background: `radial-gradient(80% 50% at 0% 0%, ${meta.accent}14, transparent 60%)`,
            }}
          />
          {/* Specular highlight diagonal */}
          <div
            className="absolute -top-4 -left-2 w-24 h-12 rotate-[-18deg] opacity-60 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(8px)",
            }}
          />

          <div className="relative flex items-center gap-3">
            {/* Indicador cristalizado — pequeña gema con bisel */}
            <div className="relative shrink-0" style={{ width: 14, height: 14 }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 25%, #FFFFFF 0%, ${meta.accent} 60%, ${meta.accent} 100%)`,
                  boxShadow: `0 0 14px ${meta.accent}, 0 0 0 3px ${meta.accent}1f, inset 0 1px 0 rgba(255,255,255,0.7)`,
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  top: 2,
                  left: 3,
                  width: 4,
                  height: 4,
                  background: "rgba(255,255,255,0.95)",
                  filter: "blur(0.4px)",
                }}
              />
            </div>

            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[13px] font-semibold tracking-tight truncate" style={{ color: "#161B33", letterSpacing: "-0.01em" }}>
                {meta.label}
              </span>
              <span className="text-[10.5px] font-medium tracking-wide" style={{ color: "#6F7799" }}>
                {meta.sub}
              </span>
            </div>
          </div>

          {/* Bottom rim — sutil sombra de espesor */}
          <div
            className="absolute inset-x-3 bottom-0 h-px rounded-full opacity-70"
            style={{ background: "linear-gradient(90deg, transparent, rgba(140,150,185,0.5), transparent)" }}
          />
        </div>
      </div>
    </div>
  );
});
CrystalOutput.displayName = "CrystalOutput";

/* ═══════════════════════════════════════════════════════════════════
   TRANSFORMATION SCRIPT — narrativa semántica del loop
   ═══════════════════════════════════════════════════════════════════ */
type EntityKind = "sales" | "risk" | "review" | "competitor" | "trend";

interface Beat {
  /** kind of incoming signal */
  entity: EntityKind;
  /** which output it crystallizes into (semantic transformation) */
  output: OutputKind;
  /** which output slot (0-2) it lands into in the right rail */
  slot: 0 | 1 | 2;
  /** entry origin point (vbox coords) */
  from: { x: number; y: number };
}

// 5 transformaciones secuenciales — cada una toma ~3.6s (loop ≈ 18s)
const BEATS: Beat[] = [
  { entity: "sales",      output: "opportunity", slot: 0, from: { x: 80,  y: 600 } }, // FG izquierda-abajo
  { entity: "review",     output: "insight",     slot: 1, from: { x: 120, y: 180 } }, // top-izquierda
  { entity: "risk",       output: "mission",     slot: 2, from: { x: 60,  y: 440 } }, // middle-izquierda
  { entity: "competitor", output: "radar",       slot: 0, from: { x: 200, y: 680 } }, // bottom-izquierda
  { entity: "trend",      output: "prediction",  slot: 1, from: { x: 60,  y: 300 } }, // upper-izquierda
];

const BEAT_MS = 3600;
const LOOP_MS = BEATS.length * BEAT_MS;

// Renderiza la entidad correcta para cada kind, centrada en (0,0)
const EntityByKind = memo(({ kind, scale = 1 }: { kind: EntityKind; scale?: number }) => {
  switch (kind) {
    case "sales":      return <SalesEntity x={0} y={0} scale={scale} />;
    case "risk":       return <RiskEntity x={0} y={0} scale={scale} />;
    case "review":     return <ReviewEntity x={0} y={0} scale={scale} />;
    case "competitor": return <CompetitorEntity x={0} y={0} scale={scale} />;
    case "trend":      return <TrendEntity x={0} y={0} scale={scale} />;
  }
});
EntityByKind.displayName = "EntityByKind";

/* ═══════════════════════════════════════════════════════════════════
   TRAVELER — entidad que recorre el arco entrada → núcleo → cristalización
   ═══════════════════════════════════════════════════════════════════ */
interface TravelerProps {
  beat: Beat;
  core: { x: number; y: number; r: number };
  /** progress 0 → 1 across the beat */
  t: number;
}

// Curva cuadrática suave entre origen y núcleo, con punto de control offset
const arcPoint = (from: { x: number; y: number }, to: { x: number; y: number }, t: number) => {
  // control point: arch upward/sideways for elegance
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // perpendicular offset for arc curvature
  const cx = mx + -dy * 0.18;
  const cy = my + dx * 0.18;
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
    y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
  };
};

const Traveler = memo(({ beat, core, t }: TravelerProps) => {
  // Phase mapping:
  //  0.00 – 0.55  → travel from origin to core (approach)
  //  0.55 – 0.72  → crystallize inside core (compress + spin + fade)
  //  0.72 – 1.00  → emerge as light streak toward output slot
  const approach = Math.min(1, t / 0.55);
  const inCore = t >= 0.55 && t < 0.72;
  const fadeOut = t >= 0.65 ? Math.min(1, (t - 0.65) / 0.15) : 0;

  // eased approach (cubic ease-in-out)
  const e = approach < 0.5 ? 4 * approach ** 3 : 1 - Math.pow(-2 * approach + 2, 3) / 2;
  const pos = arcPoint(beat.from, { x: core.x, y: core.y }, e);

  // scale shrinks as it nears core (perspective hint)
  const baseScale = 1 - 0.35 * approach;
  // crystallization spin
  const spin = inCore ? (t - 0.55) * 360 * 4 : 0;
  // crystallization compression
  const crystalScale = inCore ? 1 - (t - 0.55) * 4 : baseScale;
  const opacity = 1 - fadeOut;

  return (
    <g
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${spin}deg) scale(${Math.max(0.05, crystalScale)})`,
        transformOrigin: "0 0",
        opacity,
        transition: "none",
      }}
    >
      <EntityByKind kind={beat.entity} scale={1} />
    </g>
  );
});
Traveler.displayName = "Traveler";

/* Pulso de cristalización en el núcleo cuando el viajero llega */
const CrystallizeBurst = memo(({ core, t, accent }: { core: { x: number; y: number; r: number }; t: number; accent: string }) => {
  // active during 0.55 – 0.85
  if (t < 0.55 || t > 0.95) return null;
  const local = (t - 0.55) / 0.4; // 0 → 1
  const ringR = core.r * (0.5 + local * 1.6);
  const opacity = (1 - local) * 0.7;
  return (
    <g pointerEvents="none">
      <circle cx={core.x} cy={core.y} r={ringR} fill="none" stroke={accent} strokeOpacity={opacity} strokeWidth={2} />
      <circle cx={core.x} cy={core.y} r={ringR * 0.65} fill="none" stroke={accent} strokeOpacity={opacity * 0.6} strokeWidth={1} />
      <circle cx={core.x} cy={core.y} r={core.r * (0.85 - local * 0.1)} fill={accent} opacity={opacity * 0.18} />
    </g>
  );
});
CrystallizeBurst.displayName = "CrystallizeBurst";

/* Beam de salida hacia el slot del right rail */
const EmergenceBeam = memo(({ core, t, slotY }: { core: { x: number; y: number }; t: number; slotY: number }) => {
  if (t < 0.7 || t > 0.95) return null;
  const local = (t - 0.7) / 0.25;
  const x2 = 900 + 30; // off-canvas to right rail
  const y2 = slotY;
  // emerging streak: a tiny crystal traveling out
  const px = core.x + (x2 - core.x) * local;
  const py = core.y + (y2 - core.y) * local;
  const op = 1 - local;
  return (
    <g pointerEvents="none">
      <line x1={core.x} y1={core.y} x2={px} y2={py} stroke="#A99EFF" strokeOpacity={op * 0.4} strokeWidth={1.2} />
      <circle cx={px} cy={py} r={5 + local * 4} fill="#FFFFFF" opacity={op * 0.95} />
      <circle cx={px} cy={py} r={10 + local * 8} fill="#A99EFF" opacity={op * 0.25} />
    </g>
  );
});
EmergenceBeam.displayName = "EmergenceBeam";

/* ═══════════════════════════════════════════════════════════════════
   ESCENA HERO PRINCIPAL — Etapa 3 (transformación semántica)
   ═══════════════════════════════════════════════════════════════════ */
const IntelligenceFlow = memo(() => {
  // Wider canvas — full hero width, core sits to the right of center
  const VB_W = 1600;
  const VB_H = 760;
  const CORE = { x: 1080, y: 380, r: 130 };

  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Loop time (ms within LOOP_MS)
  const [loopT, setLoopT] = useState(0);
  // Persistent visibility of each output slot
  const [slots, setSlots] = useState<(OutputKind | null)[]>([null, null, null]);

  // Mobile detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // In-view observer
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Parallax
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

  // Master loop clock
  useEffect(() => {
    if (!inView || reduceMotion) {
      // If reduced motion, prefill slots so user still sees outputs
      if (reduceMotion) setSlots([BEATS[0].output, BEATS[1].output, BEATS[2].output]);
      return;
    }
    let raf = 0;
    let start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) % LOOP_MS;
      setLoopT(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion]);

  // Update slots whenever a beat reaches the materialization point (~t=0.78)
  const lastMaterialized = useRef<number>(-1);
  useEffect(() => {
    if (reduceMotion) return;
    const beatIdx = Math.floor(loopT / BEAT_MS);
    const beatT = (loopT % BEAT_MS) / BEAT_MS;
    if (beatT >= 0.78 && lastMaterialized.current !== beatIdx) {
      const beat = BEATS[beatIdx];
      lastMaterialized.current = beatIdx;
      setSlots(prev => {
        const next = [...prev] as (OutputKind | null)[];
        next[beat.slot] = beat.output;
        return next;
      });
    }
    // Reset tracker on loop wrap
    if (beatIdx === 0 && beatT < 0.05) lastMaterialized.current = -1;
  }, [loopT, reduceMotion]);

  const animsActive = inView && !reduceMotion;

  // Determine current beat & its progress
  const beatIdx = Math.floor(loopT / BEAT_MS);
  const beatT = (loopT % BEAT_MS) / BEAT_MS;
  const currentBeat = BEATS[beatIdx] ?? BEATS[0];

  // Slot Y positions (for emergence beam targeting)
  const SLOT_Y = [VB_H * 0.18, VB_H * 0.48, VB_H * 0.78];

  return (
    <div ref={wrapRef} className="relative w-full h-full min-h-[560px] overflow-hidden">
      {/* Atmósfera — luz de estudio premium estratificada */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 45% at 48% 42%, rgba(220,233,255,0.65) 0%, transparent 70%), radial-gradient(38% 38% at 70% 28%, rgba(237,231,255,0.55) 0%, transparent 75%), radial-gradient(45% 35% at 30% 75%, rgba(248,245,255,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Vignette ultra-sutil para enfocar el ojo en el núcleo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, transparent 50%, rgba(200,210,235,0.18) 100%)",
        }}
      />

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="relative w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={animsActive ? { transform: `translate3d(${parallax.x * 6}px, ${parallax.y * 6}px, 0)`, transition: "transform 180ms linear" } : undefined}
      >
        <SceneDefs />

        {/* BACKGROUND — ecos atmosféricos (reducidos en mobile) */}
        <g style={{ transformOrigin: "center", animation: animsActive ? "vc-bg-drift 24s ease-in-out infinite" : undefined }}>
          <EchoEntity x={140} y={130} r={48} />
          <EchoEntity x={780} y={150} r={36} />
          {!isMobile && <EchoEntity x={760} y={580} r={42} />}
          {!isMobile && <EchoEntity x={120} y={560} r={32} />}
        </g>

        {/* Anillo orbital lejano */}
        <g style={{ transformOrigin: `${CORE.x}px ${CORE.y}px`, animation: animsActive ? "vc-spin-rev 90s linear infinite" : undefined }}>
          <circle cx={CORE.x} cy={CORE.y} r={CORE.r * 2.4} fill="none" stroke="#B8C2E5" strokeWidth="0.6" strokeOpacity="0.32" strokeDasharray="1 9" />
          {!isMobile && <circle cx={CORE.x} cy={CORE.y} r={CORE.r * 2.05} fill="none" stroke="#C7D0EF" strokeWidth="0.5" strokeOpacity="0.22" strokeDasharray="0.5 6" />}
        </g>

        {/* MOTOR — respiración + spin sutil */}
        <g style={{ transformOrigin: `${CORE.x}px ${CORE.y}px`, animation: animsActive ? "vc-breathe 6s ease-in-out infinite" : undefined }}>
          <g style={{ transformOrigin: `${CORE.x}px ${CORE.y}px`, animation: animsActive ? "vc-spin 60s linear infinite" : undefined }}>
            <CoreEngine cx={CORE.x} cy={CORE.y} r={CORE.r} />
          </g>
        </g>

        {/* TRAVELER actual — única entidad en escena (foco) */}
        <Traveler beat={currentBeat} core={CORE} t={beatT} />

        {/* Pulso de cristalización en el núcleo */}
        <CrystallizeBurst core={CORE} t={beatT} accent={OUTPUT_META[currentBeat.output].accent} />

        {/* Beam de emergencia hacia el slot destino */}
        <EmergenceBeam core={CORE} t={beatT} slotY={SLOT_Y[currentBeat.slot]} />

        {/* PISO REFLECTANTE — sutil pero esencial para sensación de objeto */}
        <ellipse cx={CORE.x} cy={CORE.y + CORE.r + 24} rx={CORE.r * 1.2} ry={10} fill="url(#contactShadow)" opacity="0.55" />
        <ellipse cx={CORE.x} cy={CORE.y + CORE.r + 60} rx={CORE.r * 0.85} ry={CORE.r * 0.45} fill="url(#floorReflect)" opacity="0.18" />
        <ellipse cx={CORE.x} cy={680} rx={420} ry={14} fill="url(#contactShadow)" opacity="0.4" />
      </svg>

      {/* Isotipo VISTACEO — pulsa más fuerte cuando hay cristalización */}
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
              opacity: beatT >= 0.55 && beatT <= 0.85 ? 1 : 0.85,
              transition: "opacity 200ms linear",
            }}
          />
          <img
            src={vistaceoIcon}
            alt=""
            className="relative w-full h-full object-contain"
            style={{
              filter: `drop-shadow(0 6px 14px rgba(74,86,140,0.25)) drop-shadow(0 0 ${beatT >= 0.55 && beatT <= 0.85 ? 18 : 10}px rgba(169,158,255,${beatT >= 0.55 && beatT <= 0.85 ? 0.6 : 0.35}))`,
              transition: "filter 250ms ease-out",
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* OUTPUTS — right rail (controlados por el loop) */}
      <div
        className="absolute right-2 sm:right-4 top-0 h-full pointer-events-none hidden md:block"
        style={animsActive ? { transform: `translate3d(${parallax.x * 10}px, ${parallax.y * 10}px, 0)`, transition: "transform 120ms linear", willChange: "transform" } : undefined}
      >
        {slots[0] && <CrystalOutput kind={slots[0]} top="14%" visible={true} />}
        {slots[1] && <CrystalOutput kind={slots[1]} top="44%" visible={true} />}
        {slots[2] && <CrystalOutput kind={slots[2]} top="74%" visible={true} />}
      </div>

      {/* OUTPUTS mobile — muestra el último materializado */}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-3 md:hidden pointer-events-none">
        {slots.find(Boolean) && <CrystalOutput kind={slots.find(Boolean) as OutputKind} top="0" visible={true} />}
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
        @media (prefers-reduced-motion: reduce) {
          [style*="vc-float"], [style*="vc-breathe"], [style*="vc-halo-pulse"],
          [style*="vc-spin"], [style*="vc-spin-rev"], [style*="vc-bg-drift"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
});
IntelligenceFlow.displayName = "IntelligenceFlow";

export default IntelligenceFlow;
