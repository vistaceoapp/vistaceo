import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Radar,
  Target,
  Zap,
  ArrowUpRight,
  ArrowRight,
  Crosshair,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { buildSignupHref } from "@/lib/promo/utm";

/**
 * PromoIntelligencePanel — Inteligencia ejecutiva en vivo
 *
 * Panel premium tipo "tu CEO de IA está analizando tu negocio".
 * Usa vocabulario de la app: Radar, Misión, Predicción, Competencia, Insight.
 */
export const PromoIntelligencePanel = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const isLight = variant === "light";
  return (
    <div className={`relative w-full max-w-[460px] mx-auto lg:mx-0 lbi-float ${isLight ? "lbi-light" : ""}`}>
      {/* Soft outer glow */}
      <div
        className="absolute -inset-10 rounded-[44px] opacity-70 blur-3xl -z-10"
        style={{
          background: isLight
            ? "radial-gradient(50% 50% at 30% 25%, rgba(116,108,230,0.30) 0%, rgba(38,146,220,0.14) 60%, transparent 100%)"
            : "radial-gradient(50% 50% at 30% 25%, rgba(108,99,255,0.4) 0%, rgba(0,196,180,0.18) 60%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Liquid orbs (light variant only) */}
      {isLight && (
        <>
          <div className="lbi-orb lbi-orb-1" aria-hidden />
          <div className="lbi-orb lbi-orb-2" aria-hidden />
          <div className="lbi-orb lbi-orb-3" aria-hidden />
        </>
      )}

      <div
        className="relative rounded-[22px] p-5 sm:p-6"
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.92) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          border: isLight ? "1px solid rgba(15,23,42,0.08)" : "1px solid rgba(255,255,255,0.13)",
          boxShadow: isLight
            ? "0 30px 80px -20px rgba(38,60,120,0.22), 0 8px 24px -12px rgba(116,108,230,0.18), inset 0 1px 0 rgba(255,255,255,0.7)"
            : "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* ====== HEADER: Analizando tu negocio ====== */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6C63FF, #00C4B4)",
                boxShadow: "0 6px 18px rgba(108,99,255,0.4)",
              }}
            >
              <Sparkles className="w-4 h-4 text-white lbi-keep-white" strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold text-white tracking-wide truncate">
                Analizando tu negocio
              </div>
              <div className="text-[10.5px] text-white/55 truncate">
                7 señales detectadas hoy
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#00C4B4]/10 border border-[#00C4B4]/30 flex-shrink-0">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#00C4B4] opacity-75 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#00C4B4]" />
            </span>
            <span className="text-[10px] font-bold text-[#5DEAD4] tracking-wider">
              EN VIVO
            </span>
          </div>
        </div>

        {/* ====== HERO INSIGHT — Oportunidad crítica ====== */}
        <div
          data-tone="success"
          className="lbi-stagger lbi-hero-insight relative rounded-2xl p-3.5 mb-2.5 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,196,180,0.18) 0%, rgba(108,99,255,0.14) 100%)",
            border: "1px solid rgba(0,196,180,0.35)",
            animationDelay: "0.1s",
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider"
              style={{
                background: "rgba(0,196,180,0.2)",
                color: "#5DEAD4",
                border: "1px solid rgba(0,196,180,0.35)",
              }}
            >
              <Target className="w-3 h-3" />
              Oportunidad crítica
            </span>
            <span className="text-[10px] font-bold text-white/55">
              Insight #1
            </span>
          </div>
          <div className="text-[13.5px] text-white font-semibold leading-snug">
            Tu margen puede subir hasta{" "}
            <span className="text-[#5DEAD4]">+18%</span>
          </div>
          <div className="mt-1 text-[11px] text-white/65 leading-snug">
            No vendiendo más, sino corrigiendo el proceso que hoy te hace perder
            rentabilidad.
          </div>
        </div>

        {/* ====== GRID DE MÓDULOS ====== */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. RADAR — Competencia detectada */}
          <ModuleCard
            className="col-span-2"
            delay="0.25s"
            tone="warning"
            icon={<Crosshair className="w-3 h-3" />}
            label="Radar de competencia"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12px] text-white leading-snug font-medium min-w-0">
                Tu competencia vende más en tu hora pico
              </div>
              <div className="text-[12px] font-bold text-[#FFB454] flex-shrink-0">
                +23%
              </div>
            </div>
            <div className="mt-2 h-1 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full lbi-bar-fill rounded-full"
                style={{
                  width: "78%",
                  background: "linear-gradient(90deg, #F59E0B, #FFB454)",
                  animationDelay: "0.6s",
                }}
              />
            </div>
          </ModuleCard>

          {/* 2. PREDICCIÓN — Tendencia */}
          <ModuleCard delay="0.4s" tone="primary" label="Predicción de mercado">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11.5px] text-white/85 leading-tight">
                  Búsquedas en tu zona
                </div>
                <div className="mt-0.5 flex items-center gap-0.5 text-[11px] font-bold text-[#5DEAD4]">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  +24% esta semana
                </div>
              </div>
              <Sparkline />
            </div>
          </ModuleCard>

          {/* 3. INSIGHT — Tu negocio vs sector */}
          <ModuleCard delay="0.55s" tone="primary" label="Tu negocio vs sector">
            <div className="space-y-1.5 mt-1">
              <CompareBar label="Vos" value={62} color="#6C63FF" delay="0.7s" />
              <CompareBar
                label="Sector"
                value={84}
                color="#00C4B4"
                delay="0.85s"
              />
            </div>
            <div className="mt-1.5 text-[10px] text-white/55">
              Brecha: <span className="text-white/80 font-semibold">22 pts</span>
            </div>
          </ModuleCard>

          {/* 4. ALERTA — Web perdiendo clientes */}
          <ModuleCard
            delay="0.7s"
            tone="warning"
            icon={<Eye className="w-3 h-3" />}
            label="Tu web pierde clientes"
          >
            <div className="text-[11.5px] text-white/85 leading-snug">
              Hasta{" "}
              <span className="text-[#FBBF24] font-bold">31%</span> se va sin
              consultar
            </div>
            <div className="mt-1 text-[10px] text-white/55 leading-snug">
              Faltan: CTA visible, oferta clara, prueba social.
            </div>
          </ModuleCard>

          {/* 5. RESEÑAS — Patrón detectado */}
          <ModuleCard delay="0.85s" tone="neutral" label="Reseñas Google">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[12px] font-bold text-white">4.2</span>
              <span className="text-[10px] text-white/50">/5</span>
            </div>
            <div className="text-[11px] text-white/85 leading-snug">
              Palabra repetida 18×:
            </div>
            <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#FCA5A5] bg-[#EF4444]/15 border border-[#EF4444]/25">
              "demora"
            </span>
          </ModuleCard>

          {/* 6. MISIÓN — col-span-2 */}
          <ModuleCard
            className="col-span-2"
            delay="1s"
            tone="success"
            icon={<Target className="w-3 h-3" />}
            label="Misión prioritaria"
            badge="Hoy"
          >
            <div className="text-[12.5px] text-white leading-snug font-medium">
              Activar respuesta rápida por WhatsApp
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              <MiniStat label="Tu respuesta" value="2h 40m" tone="bad" />
              <MiniStat label="Ideal" value="< 5 min" tone="good" />
              <MiniStat label="Pérdida" value="-27%" tone="bad" />
            </div>
          </ModuleCard>

          {/* 7. CHAT CEO — col-span-2 */}
          <div
            data-tone="primary"
            className="col-span-2 lbi-stagger lbi-chat-ceo flex items-start gap-2.5 p-3 rounded-xl"
            style={{
              background: "rgba(108,99,255,0.14)",
              border: "1px solid rgba(108,99,255,0.3)",
              animationDelay: "1.15s",
            }}
          >
            <span
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white lbi-keep-white"
              style={{
                background: "linear-gradient(135deg, #6C63FF, #00C4B4)",
                boxShadow: "0 4px 12px rgba(108,99,255,0.4)",
              }}
            >
              IA
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-white/60 mb-0.5">
                Chat CEO
              </div>
              <div className="text-[12px] text-white/90 leading-snug">
                Ya encontré dónde se está escapando la plata y qué cambiaría
                primero
                <span className="inline-flex items-center gap-0.5 ml-1 align-middle">
                  <Dot delay="0s" />
                  <Dot delay="0.2s" />
                  <Dot delay="0.4s" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ====== CTA FINAL ====== */}
        <Link
          to={buildSignupHref()}
          className="lbi-stagger lbi-cta mt-5 group flex items-center justify-center gap-2 w-full h-12 rounded-xl text-[14px] font-bold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #6C63FF 0%, #00C4B4 100%)",
            boxShadow: "0 12px 32px rgba(108,99,255,0.45)",
            animationDelay: "1.3s",
          }}
        >
          <Zap className="w-4 h-4" />
          Ver mi análisis gratis
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p
          className="lbi-stagger text-center mt-2 text-[10.5px] text-white/50"
          style={{ animationDelay: "1.4s" }}
        >
          Gratis · Sin tarjeta · En minutos
        </p>
      </div>

      <style>{`
        @keyframes lbiFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .lbi-float { animation: lbiFloat 5s ease-in-out infinite; }

        @keyframes lbiStagger {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lbi-stagger {
          opacity: 0;
          animation: lbiStagger 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes lbiBarFill {
          from { width: 0% !important; }
        }
        .lbi-bar-fill {
          animation: lbiBarFill 1.1s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        @keyframes lbiSpark {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        .lbi-spark-line {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: lbiSpark 1.6s ease-out 0.7s forwards;
        }

        @keyframes lbiDot {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
        .lbi-dot { animation: lbiDot 1.4s ease-in-out infinite; }

        .lbi-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(108,99,255,0.55) !important;
        }

        /* ===== LIGHT VARIANT — solid opaque cards, WCAG AA ===== */
        /* CTA gradient text stays white */
        .lbi-light .lbi-cta,
        .lbi-light .lbi-cta * { color: #ffffff !important; }

        /* Outer panel: solid white, no blur */
        .lbi-light > .relative.rounded-\\[22px\\] {
          padding: 12px !important;
          border-radius: 24px !important;
          background: #FFFFFF !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border: 1px solid #E5E7EB !important;
          box-shadow:
            0 24px 60px rgba(38,60,120,0.10),
            0 6px 18px rgba(0,0,0,0.05) !important;
        }
        /* Header divider */
        .lbi-light > .relative.rounded-\\[22px\\] > .flex.items-center.justify-between.mb-4 {
          margin-bottom: 10px !important;
          padding-bottom: 10px !important;
          border-bottom-color: #E5E7EB !important;
        }
        /* Header title (top "Analizando tu negocio") */
        .lbi-light > .relative.rounded-\\[22px\\] > div:first-child .text-white:not(.lbi-keep-white) { color: #111827 !important; }
        .lbi-light > .relative.rounded-\\[22px\\] > div:first-child [class*="text-white\\/"] { color: #4B5563 !important; }

        /* Live pill: solid teal */
        .lbi-light .bg-\\[\\#00C4B4\\]\\/10 { background: #047857 !important; }
        .lbi-light .border-\\[\\#00C4B4\\]\\/30 { border-color: #047857 !important; }
        .lbi-light .text-\\[\\#5DEAD4\\] { color: #ECFDF5 !important; }

        /* Grid spacing */
        .lbi-light .grid.grid-cols-2 { gap: 6px !important; }

        /* All cards: reset radius/padding, no blur */
        .lbi-light .lbi-stagger {
          border-radius: 14px !important;
          padding: 10px 12px !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
        }
        .lbi-light .lbi-stagger .mb-1\\.5 { margin-bottom: 4px !important; }
        .lbi-light .lbi-stagger .mt-2 { margin-top: 6px !important; }
        .lbi-light .lbi-stagger .mt-1\\.5 { margin-top: 4px !important; }
        .lbi-light .lbi-stagger .mt-1 { margin-top: 3px !important; }

        /* ===== TONE: SUCCESS (teal) — bg #E1F5EE, border #9FE1CB, text #064E3B ===== */
        .lbi-light .lbi-stagger[data-tone="success"],
        .lbi-light .lbi-hero-insight {
          background: #E1F5EE !important;
          border: 1px solid #9FE1CB !important;
        }
        .lbi-light .lbi-stagger[data-tone="success"] *:not(.lbi-keep-white):not(.lbi-cta):not(svg):not(path):not(circle):not(stop),
        .lbi-light .lbi-hero-insight *:not(.lbi-keep-white):not(svg):not(path):not(circle):not(stop) {
          color: #064E3B !important;
        }
        /* Chip in success card: solid teal-700 with mint text */
        .lbi-light .lbi-stagger[data-tone="success"] > div:first-child > span:first-child,
        .lbi-light .lbi-hero-insight > div:first-child > span:first-child {
          background: #047857 !important;
          color: #ECFDF5 !important;
          border: 1px solid #047857 !important;
        }
        .lbi-light .lbi-stagger[data-tone="success"] > div:first-child > span:first-child * ,
        .lbi-light .lbi-hero-insight > div:first-child > span:first-child * {
          color: #ECFDF5 !important;
        }

        /* ===== TONE: WARNING (amber) — bg #FAEEDA, border #F4D7A1, text #78350F ===== */
        .lbi-light .lbi-stagger[data-tone="warning"] {
          background: #FAEEDA !important;
          border: 1px solid #F4D7A1 !important;
        }
        .lbi-light .lbi-stagger[data-tone="warning"] *:not(.lbi-keep-white):not(svg):not(path):not(circle):not(stop) {
          color: #78350F !important;
        }
        .lbi-light .lbi-stagger[data-tone="warning"] > div:first-child > span:first-child {
          background: #B45309 !important;
          color: #FFFBEB !important;
          border: 1px solid #B45309 !important;
        }
        .lbi-light .lbi-stagger[data-tone="warning"] > div:first-child > span:first-child * {
          color: #FFFBEB !important;
        }

        /* ===== TONE: PRIMARY (blue/purple) — bg #E6F1FB, border #B6D4F0, text #1E3A8A ===== */
        .lbi-light .lbi-stagger[data-tone="primary"],
        .lbi-light .lbi-chat-ceo {
          background: #E6F1FB !important;
          border: 1px solid #B6D4F0 !important;
        }
        .lbi-light .lbi-stagger[data-tone="primary"] *:not(.lbi-keep-white):not(svg):not(path):not(circle):not(stop),
        .lbi-light .lbi-chat-ceo *:not(.lbi-keep-white):not(svg):not(path):not(circle):not(stop) {
          color: #1E3A8A !important;
        }
        .lbi-light .lbi-stagger[data-tone="primary"] > div:first-child > span:first-child {
          background: #1D4ED8 !important;
          color: #EFF6FF !important;
          border: 1px solid #1D4ED8 !important;
        }
        .lbi-light .lbi-stagger[data-tone="primary"] > div:first-child > span:first-child * {
          color: #EFF6FF !important;
        }

        /* ===== TONE: NEUTRAL — bg #F8F9FA, border #E5E7EB, text #111827 ===== */
        .lbi-light .lbi-stagger[data-tone="neutral"] {
          background: #F8F9FA !important;
          border: 1px solid #E5E7EB !important;
        }
        .lbi-light .lbi-stagger[data-tone="neutral"] *:not(.lbi-keep-white):not(svg):not(path):not(circle):not(stop) {
          color: #111827 !important;
        }
        .lbi-light .lbi-stagger[data-tone="neutral"] > div:first-child > span:first-child {
          background: #374151 !important;
          color: #F9FAFB !important;
          border: 1px solid #374151 !important;
        }
        .lbi-light .lbi-stagger[data-tone="neutral"] > div:first-child > span:first-child * {
          color: #F9FAFB !important;
        }
        /* "demora" pill in reseñas: solid coral */
        .lbi-light .lbi-stagger[data-tone="neutral"] .bg-\\[\\#EF4444\\]\\/15 {
          background: #B91C1C !important;
          border-color: #B91C1C !important;
          color: #FEF2F2 !important;
        }
        .lbi-light .lbi-stagger[data-tone="neutral"] .text-\\[\\#FCA5A5\\] { color: #FEF2F2 !important; }

        /* MiniStat boxes inside success card: solid white pills */
        .lbi-light .lbi-stagger[data-tone="success"] .bg-white\\/5 {
          background: #FFFFFF !important;
          border: 1px solid #9FE1CB !important;
        }
        .lbi-light .lbi-stagger[data-tone="success"] .text-\\[\\#5DEAD4\\] { color: #047857 !important; }
        .lbi-light .lbi-stagger[data-tone="success"] .text-\\[\\#FCA5A5\\] { color: #B91C1C !important; }

        /* Bar tracks: solid muted neutral */
        .lbi-light .bg-white\\/8,
        .lbi-light .bg-white\\/5 { background: rgba(15,23,42,0.08) !important; }

        /* Highlight numbers (override colored hex inline) */
        .lbi-light .lbi-hero-insight .text-\\[\\#5DEAD4\\] { color: #047857 !important; }
        .lbi-light .lbi-stagger[data-tone="warning"] .text-\\[\\#FFB454\\],
        .lbi-light .lbi-stagger[data-tone="warning"] .text-\\[\\#FBBF24\\] { color: #78350F !important; }
        .lbi-light .lbi-stagger[data-tone="primary"] .text-\\[\\#5DEAD4\\],
        .lbi-light .lbi-stagger[data-tone="primary"] .text-\\[\\#A99FFF\\] { color: #1D4ED8 !important; }

        /* CTA compact */
        .lbi-light .lbi-cta {
          height: 44px !important;
          margin-top: 10px !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18), 0 8px 24px rgba(80,67,148,0.30) !important;
          background: linear-gradient(135deg, #017E8E 0%, #504394 100%) !important;
        }
        .lbi-light .lbi-cta + p {
          margin-top: 6px !important;
          color: #4B5563 !important;
        }
      `}</style>
    </div>
  );
};

/* ============ Sub-componentes ============ */

interface ModuleCardProps {
  children: React.ReactNode;
  label: string;
  tone?: "primary" | "success" | "warning" | "neutral";
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
  delay?: string;
}

const TONE_STYLES: Record<
  string,
  {
    border: string;
    bg: string;
    chipBg: string;
    chipText: string;
    chipBorder: string;
  }
> = {
  primary: {
    border: "rgba(108,99,255,0.22)",
    bg: "rgba(108,99,255,0.06)",
    chipBg: "rgba(108,99,255,0.18)",
    chipText: "#A99FFF",
    chipBorder: "rgba(108,99,255,0.3)",
  },
  success: {
    border: "rgba(0,196,180,0.28)",
    bg: "rgba(0,196,180,0.07)",
    chipBg: "rgba(0,196,180,0.15)",
    chipText: "#5DEAD4",
    chipBorder: "rgba(0,196,180,0.3)",
  },
  warning: {
    border: "rgba(245,158,11,0.28)",
    bg: "rgba(245,158,11,0.06)",
    chipBg: "rgba(245,158,11,0.15)",
    chipText: "#FBBF24",
    chipBorder: "rgba(245,158,11,0.3)",
  },
  neutral: {
    border: "rgba(255,255,255,0.1)",
    bg: "rgba(255,255,255,0.03)",
    chipBg: "rgba(255,255,255,0.08)",
    chipText: "rgba(255,255,255,0.7)",
    chipBorder: "rgba(255,255,255,0.12)",
  },
};

const ModuleCard = ({
  children,
  label,
  tone = "neutral",
  icon,
  badge,
  className = "",
  delay = "0s",
}: ModuleCardProps) => {
  const t = TONE_STYLES[tone];
  return (
    <div
      data-tone={tone}
      className={`lbi-stagger rounded-xl p-2.5 ${className}`}
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        animationDelay: delay,
      }}
    >
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold min-w-0"
          style={{
            background: t.chipBg,
            color: t.chipText,
            border: `1px solid ${t.chipBorder}`,
          }}
        >
          {icon}
          <span className="truncate">{label}</span>
        </span>
        {badge && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white lbi-keep-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #6C63FF, #00C4B4)",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

const Sparkline = () => (
  <svg width="64" height="28" viewBox="0 0 64 28" fill="none">
    <defs>
      <linearGradient id="spark-grad" x1="0" y1="0" x2="64" y2="0">
        <stop offset="0%" stopColor="#6C63FF" />
        <stop offset="100%" stopColor="#00C4B4" />
      </linearGradient>
      <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="28">
        <stop offset="0%" stopColor="#00C4B4" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#00C4B4" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M2 22 L12 18 L22 20 L32 14 L42 10 L52 8 L62 4 L62 28 L2 28 Z"
      fill="url(#spark-fill)"
    />
    <path
      className="lbi-spark-line"
      d="M2 22 L12 18 L22 20 L32 14 L42 10 L52 8 L62 4"
      stroke="url(#spark-grad)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="62" cy="4" r="2" fill="#00C4B4">
      <animate
        attributeName="opacity"
        values="0.4;1;0.4"
        dur="1.6s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const CompareBar = ({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: string;
}) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[9.5px] text-white/55 w-9 flex-shrink-0">
      {label}
    </span>
    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
      <div
        className="h-full rounded-full lbi-bar-fill"
        style={{
          width: `${value}%`,
          background: color,
          animationDelay: delay,
        }}
      />
    </div>
    <span className="text-[9.5px] font-semibold text-white/80 w-7 text-right">
      {value}
    </span>
  </div>
);

const MiniStat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "bad";
}) => (
  <div className="rounded-lg px-1.5 py-1 bg-white/5 border border-white/8">
    <div className="text-[8.5px] text-white/50 leading-tight uppercase tracking-wide">
      {label}
    </div>
    <div
      className={`text-[10.5px] font-bold leading-tight ${
        tone === "good" ? "text-[#5DEAD4]" : "text-[#FCA5A5]"
      }`}
    >
      {value}
    </div>
  </div>
);

const Dot = ({ delay }: { delay: string }) => (
  <span
    className="lbi-dot inline-block w-1 h-1 rounded-full bg-white/70"
    style={{ animationDelay: delay }}
  />
);
