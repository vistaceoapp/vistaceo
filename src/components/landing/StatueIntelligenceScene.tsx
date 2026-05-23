import { memo } from "react";
import { TrendingUp, AlertTriangle, Radar, Star, Target, FlaskConical, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import figuraVistaceo from "@/assets/figura-vistaceo.png";

const INSIGHTS = [
  {
    icon: TrendingUp,
    label: "Oportunidad crítica",
    title: "Ticket promedio +18%",
    detail: "Activar combo premium en horario pico",
    color: "#2692DC",
    position: "top-[2%] left-[-6%]",
    delay: "0s",
  },
  {
    icon: AlertTriangle,
    label: "Punto débil detectado",
    title: "Conversión web 2,1%",
    detail: "Checkout pierde 38% de visitas",
    color: "#E0457B",
    position: "top-[20%] right-[-8%]",
    delay: "0.7s",
  },
  {
    icon: Radar,
    label: "Radar de competencia",
    title: "Rival lanzó suscripción",
    detail: "Respuesta sugerida en 48 hs",
    color: "#F59E0B",
    position: "top-[46%] left-[-10%]",
    delay: "1.3s",
  },
  {
    icon: Star,
    label: "Reseñas",
    title: "4,91 ★ esta semana",
    detail: "+12 reseñas nuevas verificadas",
    color: "#746CE6",
    position: "top-[54%] right-[-6%]",
    delay: "1.9s",
  },
  {
    icon: Target,
    label: "Misión prioritaria",
    title: "Recuperar 47 clientes",
    detail: "Campaña lista para activar hoy",
    color: "#2692DC",
    position: "bottom-[8%] left-[-4%]",
    delay: "2.5s",
  },
  {
    icon: FlaskConical,
    label: "I + D",
    title: "Probar canal TikTok Ads",
    detail: "Audiencia coincide en 84%",
    color: "#746CE6",
    position: "bottom-[2%] right-[-8%]",
    delay: "3.1s",
  },
];

export const StatueIntelligenceScene = memo(() => {
  return (
    <div className="relative w-full aspect-[4/5] max-w-[560px] mx-auto">
      {/* Ambient brand glow */}
      <div
        className="absolute inset-0 rounded-[40%] blur-[110px] opacity-70 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(38,146,220,0.32) 0%, rgba(116,108,230,0.22) 45%, transparent 75%)",
        }}
        aria-hidden
      />
      {/* Pedestal halo */}
      <div
        className="absolute inset-x-[20%] bottom-[4%] h-[12%] rounded-full blur-2xl opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(116,108,230,0.55), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Soft orbital ring (decorative) */}
      <div
        className="absolute inset-[8%] rounded-full pointer-events-none opacity-50"
        style={{
          background:
            "conic-gradient(from 120deg, transparent 0%, rgba(38,146,220,0.35) 25%, transparent 50%, rgba(116,108,230,0.30) 75%, transparent 100%)",
          WebkitMask:
            "radial-gradient(circle, transparent 62%, black 63%, black 64%, transparent 65%)",
          mask: "radial-gradient(circle, transparent 62%, black 63%, black 64%, transparent 65%)",
        }}
        aria-hidden
      />

      {/* Protagonist */}
      <img
        src={figuraVistaceo}
        alt="VISTACEO: cerebro estratégico que piensa tu negocio 24/7"
        className="relative z-10 w-[80%] mx-auto block select-none pointer-events-none"
        style={{
          filter:
            "drop-shadow(0 30px 40px rgba(38,146,220,0.28)) drop-shadow(0 10px 18px rgba(116,108,230,0.20))",
          animation: "statueFloat 7s ease-in-out infinite",
        }}
        loading="eager"
        decoding="async"
      />

      {/* Floating insight microcards */}
      {INSIGHTS.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={cn(
              "absolute z-20 w-[218px] rounded-2xl hidden md:block",
              card.position
            )}
            style={{
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.65)",
              boxShadow:
                "0 18px 50px -18px rgba(38,146,220,0.30), 0 4px 12px -4px rgba(0,0,0,0.06)",
              animation: `cardFloat 8s ease-in-out ${card.delay} infinite, fadeUp 0.8s ease-out ${card.delay} both`,
            }}
          >
            <div className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                    style={{ backgroundColor: card.color }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: card.color }}
                  />
                </span>
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.09em]"
                  style={{ color: card.color }}
                >
                  {card.label}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div
                  className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${card.color}14`, color: card.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#0a0a0a] leading-tight">
                    {card.title}
                  </p>
                  <p className="text-[10.5px] text-[#666] mt-0.5 leading-snug line-clamp-2">
                    {card.detail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Mobile-only "thinking" chip */}
      <div
        className="md:hidden absolute top-3 right-2 z-20 rounded-full px-3 py-1.5 flex items-center gap-1.5"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 8px 20px -6px rgba(38,146,220,0.25)",
        }}
      >
        <Brain className="w-3 h-3" style={{ color: "#2692DC" }} />
        <span className="text-[10px] font-medium text-[#0a0a0a]">
          Pensando tu negocio…
        </span>
      </div>

      <style>{`
        @keyframes statueFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});
StatueIntelligenceScene.displayName = "StatueIntelligenceScene";

export default StatueIntelligenceScene;
