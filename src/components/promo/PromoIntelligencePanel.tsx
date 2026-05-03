import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Star,
  Package,
  Zap,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { buildSignupHref } from "@/lib/promo/utm";

/**
 * PromoIntelligencePanel — Live Business Intelligence
 *
 * Panel visual premium tipo "inteligencia ejecutiva en vivo".
 * 7 micro-módulos: alerta, tendencia (sparkline), comparativo (barras),
 * reseñas, producto, oportunidad, chat CEO + CTA final.
 */
export const PromoIntelligencePanel = () => {
  return (
    <div className="relative w-full max-w-[440px] mx-auto lg:mx-0 lbi-float">
      {/* Soft outer glow */}
      <div
        className="absolute -inset-10 rounded-[44px] opacity-70 blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(50% 50% at 30% 25%, rgba(108,99,255,0.4) 0%, rgba(0,196,180,0.18) 60%, transparent 100%)",
        }}
        aria-hidden
      />

      <div
        className="relative rounded-[22px] p-5 sm:p-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* ====== HEADER: En vivo ====== */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6C63FF, #00C4B4)",
                boxShadow: "0 6px 18px rgba(108,99,255,0.4)",
              }}
            >
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
            </span>
            <div>
              <div className="text-[12px] font-semibold text-white tracking-wide">
                Analizando tu negocio
              </div>
              <div className="text-[10.5px] text-white/50">
                Inteligencia ejecutiva en vivo
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#00C4B4]/10 border border-[#00C4B4]/30">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#00C4B4] opacity-75 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#00C4B4]" />
            </span>
            <span className="text-[10px] font-bold text-[#5DEAD4] tracking-wider">
              EN VIVO
            </span>
          </div>
        </div>

        {/* ====== GRID DE MÓDULOS ====== */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. ALERTA — col-span-2 */}
          <ModuleCard
            className="col-span-2"
            delay="0.15s"
            tone="warning"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            label="Alerta detectada"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12.5px] text-white leading-snug font-medium">
                Consultas fuera de horario
              </div>
              <div className="text-[11px] font-bold text-[#FFB454]">+38%</div>
            </div>
            {/* Mini bar */}
            <div className="mt-2 h-1 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full lbi-bar-fill rounded-full"
                style={{
                  width: "78%",
                  background:
                    "linear-gradient(90deg, #F59E0B, #FFB454)",
                  animationDelay: "0.6s",
                }}
              />
            </div>
          </ModuleCard>

          {/* 2. TENDENCIA con sparkline */}
          <ModuleCard delay="0.3s" tone="primary" label="Tendencia del sector">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11.5px] text-white/85 leading-tight">
                  Búsqueda en alza
                </div>
                <div className="mt-0.5 flex items-center gap-0.5 text-[10.5px] font-bold text-[#5DEAD4]">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  +24%
                </div>
              </div>
              <Sparkline />
            </div>
          </ModuleCard>

          {/* 3. COMPARATIVO — barras */}
          <ModuleCard delay="0.45s" tone="primary" label="Tu negocio vs sector">
            <div className="space-y-1.5 mt-1">
              <CompareBar label="Vos" value={62} color="#6C63FF" delay="0.7s" />
              <CompareBar
                label="Sector"
                value={84}
                color="#00C4B4"
                delay="0.85s"
              />
            </div>
          </ModuleCard>

          {/* 4. RESEÑAS */}
          <ModuleCard delay="0.6s" tone="neutral" label="Reseñas Google">
            <div className="flex items-center gap-1 mb-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < 4 ? "text-[#FBBF24] fill-[#FBBF24]" : "text-white/20"
                  }`}
                />
              ))}
              <span className="ml-1 text-[10px] text-white/60">4.2</span>
            </div>
            <div className="text-[11px] text-white/85 leading-snug">
              Palabra repetida:
            </div>
            <span
              className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#FCA5A5] bg-[#EF4444]/15 border border-[#EF4444]/25"
            >
              "demora"
            </span>
          </ModuleCard>

          {/* 5. PRODUCTO */}
          <ModuleCard delay="0.75s" tone="neutral" label="Producto estrella">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Package className="w-3 h-3 text-white/60" />
              <span className="text-[11px] text-white/85 font-medium">
                Plato del día
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/60">Más vendido</span>
                <span className="font-semibold text-[#5DEAD4]">#1</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/60">Margen</span>
                <span className="font-semibold text-[#FCA5A5]">Bajo</span>
              </div>
            </div>
          </ModuleCard>

          {/* 6. OPORTUNIDAD — col-span-2 */}
          <ModuleCard
            className="col-span-2"
            delay="0.9s"
            tone="success"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="Oportunidad detectada"
            badge="Nuevo"
          >
            <div className="text-[12.5px] text-white leading-snug font-medium">
              Nueva tendencia en tu rubro
            </div>
            <div className="mt-0.5 text-[11px] text-white/60 leading-snug">
              Margen estimado +18% si actúas esta semana.
            </div>
          </ModuleCard>

          {/* 7. CHAT CEO — col-span-2 */}
          <div
            className="col-span-2 lbi-stagger flex items-start gap-2.5 p-3 rounded-xl"
            style={{
              background: "rgba(108,99,255,0.14)",
              border: "1px solid rgba(108,99,255,0.3)",
              animationDelay: "1.05s",
            }}
          >
            <span
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
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
                Ya encontré el primer cambio para mejorar tus ventas
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
            animationDelay: "1.2s",
          }}
        >
          <Zap className="w-4 h-4" />
          Ver mi análisis gratis
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="lbi-stagger text-center mt-2 text-[10.5px] text-white/50" style={{ animationDelay: "1.3s" }}>
          Gratis · Sin tarjeta · En minutos
        </p>
      </div>

      {/* ====== Animaciones ====== */}
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

const TONE_STYLES: Record<string, { border: string; bg: string; chipBg: string; chipText: string; chipBorder: string }> = {
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
      className={`lbi-stagger rounded-xl p-2.5 ${className}`}
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        animationDelay: delay,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold"
          style={{
            background: t.chipBg,
            color: t.chipText,
            border: `1px solid ${t.chipBorder}`,
          }}
        >
          {icon}
          {label}
        </span>
        {badge && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
            style={{ background: "linear-gradient(135deg, #6C63FF, #00C4B4)" }}
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
    <span className="text-[9.5px] text-white/55 w-9 flex-shrink-0">{label}</span>
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

const Dot = ({ delay }: { delay: string }) => (
  <span
    className="lbi-dot inline-block w-1 h-1 rounded-full bg-white/70"
    style={{ animationDelay: delay }}
  />
);
