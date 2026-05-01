import { Sparkles, Target, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { buildSignupHref } from "@/lib/promo/utm";

// Glassmorphism "first result" card for the dark hero.
export const PromoIntelligencePanel = () => {
  return (
    <div className="relative w-full max-w-[400px] mx-auto lg:mx-0 promo-float">
      {/* Soft outer glow */}
      <div
        className="absolute -inset-8 rounded-[40px] opacity-70 blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(50% 50% at 30% 30%, rgba(108,99,255,0.35) 0%, rgba(0,196,180,0.18) 60%, transparent 100%)",
        }}
        aria-hidden
      />

      <div
        className="relative rounded-[20px] p-6"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          transform: "rotate(-2deg)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6C63FF, #00C4B4)" }}
            >
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
            </span>
            <span className="text-[12.5px] font-medium text-white/60">
              Tu primer resultado · Gratis
            </span>
          </div>
        </div>

        {/* Item 1 */}
        <div className="promo-stagger" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold text-[#00C4B4] bg-[#00C4B4]/15 border border-[#00C4B4]/25">
            Diagnóstico listo
          </span>
          <p className="mt-1.5 text-[13.5px] text-white/85 leading-snug">
            Detectamos 3 oportunidades en tu negocio.
          </p>
        </div>

        <div className="h-px my-4 bg-white/8" />

        {/* Item 2 */}
        <div className="promo-stagger" style={{ animationDelay: "0.5s" }}>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold text-[#A99FFF] bg-[#6C63FF]/18 border border-[#6C63FF]/30">
            Misión prioritaria
          </span>
          <p className="mt-1.5 text-[13.5px] text-white/85 leading-snug">
            Mejorá tu tasa de conversión esta semana.
          </p>
        </div>

        <div className="h-px my-4 bg-white/8" />

        {/* Item 3 */}
        <div className="promo-stagger" style={{ animationDelay: "0.8s" }}>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold text-[#5DEAD4] bg-[#00C4B4]/15 border border-[#00C4B4]/25">
            <MessageSquare className="w-2.5 h-2.5" /> Chat CEO activo
          </span>
          <p className="mt-1.5 text-[13.5px] text-white/85 leading-snug">
            Tu asistente ejecutivo está listo para responder.
          </p>
        </div>

        {/* Toast notification */}
        <div
          className="mt-5 flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] promo-stagger"
          style={{
            background: "rgba(108,99,255,0.18)",
            border: "1px solid rgba(108,99,255,0.28)",
            animationDelay: "1.1s",
          }}
        >
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6C63FF, #00C4B4)" }}
          >
            IA
          </span>
          <p className="text-[12px] text-white/90 leading-tight flex-1">
            Nueva señal detectada: <span className="font-semibold">alta intención de compra.</span>
          </p>
          <Zap className="w-3.5 h-3.5 text-[#00C4B4] flex-shrink-0" />
        </div>

        {/* Inner CTA */}
        <Link
          to={buildSignupHref()}
          className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#00C4B4] hover:text-[#5DEAD4] transition-colors"
        >
          Obtener el mío gratis →
        </Link>
      </div>

      <style>{`
        @keyframes promoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .promo-float { animation: promoFloat 4s ease-in-out infinite; }
        @keyframes promoStagger {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .promo-stagger {
          opacity: 0;
          animation: promoStagger 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
        }
      `}</style>
    </div>
  );
};
