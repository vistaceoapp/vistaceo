import { memo } from "react";
import { motion } from "framer-motion";
import { Brain, Calendar, Zap, TrendingUp, Target, Radar } from "lucide-react";

/**
 * CapabilitiesShowcase
 * 6 mini-cards con micro-animaciones SVG inspiradas en Voxr.
 * UI/UX alineado a la landing minimalista (blanco, Inter, azul #2692DC).
 */

const BRAND = "#2692DC";

const Card = ({
  icon: Icon,
  title,
  desc,
  visual,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  visual: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className="group relative rounded-2xl bg-white border border-[#ececec] p-6 md:p-7 overflow-hidden hover:border-[#d4d4d4] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-all duration-300"
  >
    {/* Visual area */}
    <div className="relative h-36 md:h-40 mb-5 rounded-xl bg-gradient-to-br from-[#f7f9fc] to-white border border-[#f0f0f0] overflow-hidden">
      {visual}
    </div>

    {/* Text */}
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4" style={{ color: BRAND }} aria-hidden="true" />
      <h3 className="text-base md:text-[17px] font-semibold text-[#1a1a1a] tracking-tight">{title}</h3>
    </div>
    <p className="text-[13.5px] text-[#666] leading-relaxed">{desc}</p>
  </motion.div>
);

/* ─── Visuals ────────────────────────────────────────────────── */

// 1. Radar de oportunidades — línea punteada con dot que viaja al cerebro
const RadarVisual = () => (
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="cap-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.2" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <path d="M20 110 L80 110 L80 70 L140 70" fill="none" stroke={BRAND} strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 4" />
    <path d="M20 30 L80 30 L80 70 L140 70" fill="none" stroke={BRAND} strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 4" />
    <path d="M140 70 L210 70" fill="none" stroke="url(#cap-line)" strokeWidth="2" />

    {[[20, 30], [20, 110], [80, 30], [80, 70], [80, 110]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3" fill={BRAND} fillOpacity="0.5" />
    ))}

    <circle cx="210" cy="70" r="22" fill={BRAND} fillOpacity="0.1" />
    <motion.circle
      cx="210" cy="70" r="22"
      fill="none" stroke={BRAND} strokeOpacity="0.5" strokeWidth="1.5"
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      style={{ transformOrigin: "210px 70px" }}
    />
    <circle cx="210" cy="70" r="14" fill={BRAND} />
    <Brain x="200" y="60" width="20" height="20" stroke="white" strokeWidth="2" />

    <motion.circle
      r="4"
      fill={BRAND}
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      style={{ offsetPath: "path('M20 110 L80 110 L80 70 L140 70 L210 70')" } as any}
    />
  </svg>
);

// 2. Timeline de misiones con check
const MissionsVisual = () => (
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true">
    <line x1="40" y1="70" x2="240" y2="70" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="80" cy="70" r="14" fill="#f3f4f6" stroke="#e5e5e5" strokeWidth="1.5" />
    <text x="80" y="74" textAnchor="middle" fontSize="11" fill="#999" fontWeight="600">1</text>
    <motion.g
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6, duration: 0.4 }}
      style={{ transformOrigin: "140px 70px" }}
    >
      <circle cx="140" cy="70" r="18" fill={BRAND} fillOpacity="0.12" />
      <circle cx="140" cy="70" r="14" fill={BRAND} />
      <path d="M133 70 L138 75 L147 65" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
    <circle cx="200" cy="70" r="14" fill="#f3f4f6" stroke="#e5e5e5" strokeWidth="1.5" />
    <text x="200" y="74" textAnchor="middle" fontSize="11" fill="#999" fontWeight="600">3</text>
  </svg>
);

// 3. Speed / IA — rayo con destello
const SpeedVisual = () => (
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true">
    <motion.line
      x1="40" y1="70" x2="240" y2="70"
      stroke={BRAND} strokeWidth="2" strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    />
    <motion.g
      animate={{ x: [0, 6, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="200" cy="70" r="22" fill={BRAND} fillOpacity="0.12" />
      <circle cx="200" cy="70" r="14" fill={BRAND} />
      <path d="M203 60 L194 73 L201 73 L197 80 L206 67 L199 67 Z" fill="white" />
    </motion.g>
  </svg>
);

// 4. Anticipación estratégica — orbe predictivo con escenarios futuros
const ForecastVisual = () => (
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true">
    <defs>
      <radialGradient id="cap-orb" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="40%" stopColor={BRAND} stopOpacity="0.45" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0.95" />
      </radialGradient>
      <linearGradient id="cap-future" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.8" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Ondas de predicción que se expanden */}
    {[0, 0.6, 1.2].map((delay, i) => (
      <motion.circle
        key={i}
        cx="90" cy="78" r="28"
        fill="none" stroke={BRAND} strokeWidth="1.2"
        initial={{ scale: 0.6, opacity: 0.6 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay }}
        style={{ transformOrigin: "90px 78px" }}
      />
    ))}

    {/* Orbe / bola de cristal */}
    <circle cx="90" cy="78" r="28" fill="url(#cap-orb)" />
    <circle cx="90" cy="78" r="28" fill="none" stroke={BRAND} strokeOpacity="0.4" strokeWidth="1" />
    {/* Reflejo */}
    <ellipse cx="82" cy="68" rx="8" ry="5" fill="white" fillOpacity="0.5" />
    {/* Base */}
    <ellipse cx="90" cy="110" rx="22" ry="3" fill={BRAND} fillOpacity="0.15" />

    {/* Línea de tiempo hacia el futuro */}
    <line x1="130" y1="78" x2="260" y2="78" stroke="url(#cap-future)" strokeWidth="1.5" strokeDasharray="3 4" />

    {/* 3 escenarios proyectados */}
    {[
      { x: 165, y: 50, label: "+18%", delay: 0.3 },
      { x: 205, y: 78, label: "Pico", delay: 0.6 },
      { x: 245, y: 100, label: "Riesgo", delay: 0.9 },
    ].map((s, i) => (
      <motion.g
        key={i}
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: s.delay, duration: 0.4, ease: "easeOut" }}
        style={{ transformOrigin: `${s.x}px ${s.y}px` }}
      >
        <circle cx={s.x} cy={s.y} r="4" fill={BRAND} />
        <circle cx={s.x} cy={s.y} r="9" fill="none" stroke={BRAND} strokeOpacity="0.3" strokeWidth="1" />
        <rect x={s.x - 18} y={s.y - 22} width="36" height="13" rx="6" fill="white" stroke={BRAND} strokeOpacity="0.25" strokeWidth="0.8" />
        <text x={s.x} y={s.y - 13} textAnchor="middle" fontSize="8" fontWeight="600" fill={BRAND}>{s.label}</text>
      </motion.g>
    ))}

    {/* Destello dentro del orbe */}
    <motion.circle
      cx="90" cy="78" r="3"
      fill="white"
      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.4, 0.8] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "90px 78px" }}
    />
  </svg>
);

// 5. Analytics — curva animada con dot pulsante
const AnalyticsVisual = () => (
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="cap-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.3" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
      </linearGradient>
    </defs>
    <motion.path
      d="M20 100 Q70 90 100 70 T180 50 T260 35"
      fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: "easeOut" }}
    />
    <motion.path
      d="M20 100 Q70 90 100 70 T180 50 T260 35 L260 130 L20 130 Z"
      fill="url(#cap-area)"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1.2, duration: 0.6 }}
    />
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1.3, duration: 0.4 }}
      style={{ transformOrigin: "260px 35px" }}
    >
      <circle cx="260" cy="35" r="10" fill={BRAND} fillOpacity="0.2" />
      <circle cx="260" cy="35" r="5" fill={BRAND} stroke="white" strokeWidth="2" />
    </motion.g>
  </svg>
);

// 6. Competencia — lista de ítems con check rotando al primero
const CompetitorsVisual = () => {
  const rows = [
    { label: "La Brigada · Palermo", flag: "AR" },
    { label: "Don Julio · Recoleta", flag: "AR" },
    { label: "Parrilla Norte · Vicente L.", flag: "AR" },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="w-full max-w-[240px] space-y-1.5">
        {rows.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i, duration: 0.4 }}
            className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[11px]"
            style={
              i === 0
                ? { borderColor: `${BRAND}55`, backgroundColor: `${BRAND}0d` }
                : { borderColor: "#ececec", backgroundColor: "#fafafa" }
            }
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={
                  i === 0
                    ? { borderColor: BRAND, backgroundColor: BRAND }
                    : { borderColor: "#d4d4d4", backgroundColor: "white" }
                }
              >
                {i === 0 && (
                  <svg viewBox="0 0 12 12" className="w-2 h-2">
                    <path d="M2 6 L5 9 L10 3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="truncate font-medium" style={{ color: i === 0 ? BRAND : "#1a1a1a" }}>
                {r.label}
              </span>
            </div>
            <span className="text-[10px] text-[#999] font-mono">{r.flag}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─── Section ────────────────────────────────────────────────── */

const items = [
  {
    icon: Radar,
    title: "Radar inteligente",
    desc: "Detecta oportunidades y riesgos antes que tu competencia. Cada señal llega procesada al cerebro de tu negocio.",
    visual: <RadarVisual />,
  },
  {
    icon: Target,
    title: "Misiones guiadas",
    desc: "Planes paso a paso con seguimiento real. La IA prioriza qué hacer hoy para mover la aguja.",
    visual: <MissionsVisual />,
  },
  {
    icon: Zap,
    title: "Velocidad ejecutiva",
    desc: "Insights en segundos, no en reuniones. Decisiones más rápidas, sin perder profundidad estratégica.",
    visual: <SpeedVisual />,
  },
  {
    icon: Calendar,
    title: "Anticipación estratégica",
    desc: "Predice lo que va a pasar y te prepara para aprovecharlo. Adelantate a oportunidades y riesgos antes que tu competencia.",
    visual: <ForecastVisual />,
  },
  {
    icon: TrendingUp,
    title: "Analítica viva",
    desc: "Métricas que se actualizan en tiempo real con explicación causal. Entendé qué movió el resultado.",
    visual: <AnalyticsVisual />,
  },
  {
    icon: Brain,
    title: "Inteligencia competitiva",
    desc: "Conocé a tu competencia local: precios, reputación y movimientos. Posicionate con ventaja.",
    visual: <CompetitorsVisual />,
  },
];

export const CapabilitiesShowcase = memo(() => {
  return (
    <section id="capacidades" className="py-20 md:py-28 bg-white relative overflow-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14 md:mb-16"
        >
          <span
            className="inline-block text-[11px] font-semibold tracking-[0.12em] uppercase mb-4 px-3 py-1 rounded-full border"
            style={{ color: BRAND, borderColor: `${BRAND}33`, backgroundColor: `${BRAND}0d` }}
          >
            Capacidades
          </span>
          <h2 className="text-[32px] md:text-[44px] font-semibold text-[#1a1a1a] mb-4 leading-[1.1] tracking-tight">
            Una inteligencia,{" "}
            <span style={{ color: BRAND }}>seis superpoderes</span>
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#666] leading-relaxed">
            Cada módulo trabaja sincronizado. El cerebro de tu negocio aprende de todos al mismo tiempo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
          {items.map((it, i) => (
            <Card key={it.title} {...it} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </section>
  );
});

CapabilitiesShowcase.displayName = "CapabilitiesShowcase";
export default CapabilitiesShowcase;
