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
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
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
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <line x1="40" y1="70" x2="240" y2="70" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="80" cy="70" r="14" fill="#f3f4f6" stroke="#e5e5e5" strokeWidth="1.5" />
    <text x="80" y="74" textAnchor="middle" fontSize="11" fill="#999" fontWeight="600">1</text>
    <motion.g
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
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
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <motion.line
      x1="40" y1="70" x2="240" y2="70"
      stroke={BRAND} strokeWidth="2" strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
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

// 4. Anticipación estratégica — "Hoy" vs predicción futura con curva ascendente
const ForecastVisual = () => (
  <svg viewBox="0 0 280 140" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="cap-forecast-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.25" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Ejes sutiles */}
    <line x1="20" y1="115" x2="260" y2="115" stroke="#e5e5e5" strokeWidth="1" />

    {/* Divisor Hoy / Futuro */}
    <line x1="120" y1="25" x2="120" y2="115" stroke={BRAND} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
    <text x="70" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#999" letterSpacing="0.5">HOY</text>
    <text x="195" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill={BRAND} letterSpacing="0.5">PREDICCIÓN</text>

    {/* Curva pasada (sólida) */}
    <motion.path
      d="M20 95 Q50 92 75 85 T120 75"
      fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    />

    {/* Curva futura (predicha, ascendente) */}
    <motion.path
      d="M120 75 Q160 65 195 50 T260 32"
      fill="none" stroke={BRAND} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
    />

    {/* Área bajo curva futura */}
    <motion.path
      d="M120 75 Q160 65 195 50 T260 32 L260 115 L120 115 Z"
      fill="url(#cap-forecast-area)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.6 }}
    />

    {/* Punto "ahora" */}
    <circle cx="120" cy="75" r="4" fill="white" stroke={BRAND} strokeWidth="2" />

    {/* Pin de oportunidad */}
    <motion.g
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.4 }}
    >
      <circle cx="195" cy="50" r="4" fill={BRAND} />
      <circle cx="195" cy="50" r="9" fill="none" stroke={BRAND} strokeOpacity="0.35" strokeWidth="1" />
      <rect x="172" y="28" width="46" height="14" rx="7" fill="white" stroke={BRAND} strokeOpacity="0.3" strokeWidth="0.8" />
      <text x="195" y="38" textAnchor="middle" fontSize="9" fontWeight="700" fill={BRAND}>+18% ↑</text>
    </motion.g>

    {/* Pin de riesgo */}
    <motion.g
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.1, duration: 0.4 }}
    >
      <circle cx="245" cy="38" r="3.5" fill="#f59e0b" />
      <rect x="225" y="92" width="40" height="14" rx="7" fill="white" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="245" y="102" textAnchor="middle" fontSize="9" fontWeight="700" fill="#d97706">Riesgo</text>
    </motion.g>

    {/* Pulso en el punto presente */}
    <motion.circle
      cx="120" cy="75" r="6"
      fill="none" stroke={BRAND} strokeWidth="1.5"
      initial={{ scale: 1, opacity: 0.7 }}
      animate={{ scale: 2.2, opacity: 0 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      style={{ transformOrigin: "120px 75px" }}
    />
  </svg>
);

// 5. Analytics — mini dashboard con KPI +23%, barras y sparkline
const AnalyticsVisual = () => {
  const bars = [38, 52, 44, 68, 58, 82, 74];
  return (
    <div className="absolute inset-0 p-3 md:p-4 flex flex-col gap-2">
      {/* KPI row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-[#999] font-medium">Ventas · 7d</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] md:text-[16px] font-semibold text-[#1a1a1a] tabular-nums">$48.2k</span>
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums"
              style={{ color: BRAND, backgroundColor: `${BRAND}15` }}
            >
              +23%
            </motion.span>
          </div>
        </div>
        {/* Mini sparkline */}
        <svg viewBox="0 0 80 28" className="w-[70px] h-[26px] shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="cap-spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity="0.3" />
              <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M2 22 L14 18 L26 20 L38 12 L50 14 L62 6 L78 4 L78 28 L2 28 Z" fill="url(#cap-spark)" />
          <path d="M2 22 L14 18 L26 20 L38 12 L50 14 L62 6 L78 4" fill="none" stroke={BRAND} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="78" cy="4" r="2" fill={BRAND} />
        </svg>
      </div>

      {/* Bars */}
      <div className="flex-1 flex items-end gap-[5px] md:gap-1.5 min-h-0">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: "easeOut" }}
            className="flex-1 rounded-sm"
            style={{
              backgroundColor: i === bars.length - 1 ? BRAND : `${BRAND}33`,
            }}
          />
        ))}
      </div>

      {/* Causal label */}
      <div className="flex items-center gap-1.5 text-[9.5px] text-[#666]">
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: BRAND }} />
        <span className="truncate">Promo fin de semana → +18% ticket</span>
      </div>
    </div>
  );
};


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
            animate={{ opacity: 1, x: 0 }}
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
          className="text-center max-w-2xl md:max-w-4xl mx-auto mb-14 md:mb-16"
        >
          <span
            className="inline-block text-[11px] font-semibold tracking-[0.12em] uppercase mb-4 px-3 py-1 rounded-full border"
            style={{ color: BRAND, borderColor: `${BRAND}33`, backgroundColor: `${BRAND}0d` }}
          >
            Capacidades
          </span>
          <h2 className="text-[32px] md:text-[44px] font-semibold text-[#1a1a1a] mb-4 leading-[1.1] tracking-tight">
            Una inteligencia,{" "}
            <span style={{ color: BRAND }}>múltiples superpoderes</span>
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#666] leading-relaxed md:whitespace-nowrap">
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
