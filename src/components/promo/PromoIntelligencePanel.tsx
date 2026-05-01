import { Sparkles, Target, ListChecks, MessagesSquare, TrendingUp, AlertCircle } from "lucide-react";

// "Tu primer resultado" — premium intelligence card for the hero.
// Pure presentational, no fake numbers/users/companies.
export const PromoIntelligencePanel = () => {
  const rows = [
    { icon: Sparkles, label: "Diagnóstico inicial", hint: "listo en minutos" },
    { icon: Target, label: "Prioridades de la semana", hint: "qué mover primero" },
    { icon: ListChecks, label: "3 misiones concretas", hint: "para empezar hoy" },
    { icon: MessagesSquare, label: "Chat CEO 24/7", hint: "decidí mejor" },
  ];

  const bubbles = [
    { icon: TrendingUp, text: "Oportunidad comercial detectada", delay: "0s", pos: "left-[-32px] top-[36px]" },
    { icon: AlertCircle, text: "Prioridad alta para hoy", delay: "1.6s", pos: "right-[-28px] top-[200px]" },
    { icon: Sparkles, text: "Nueva misión sugerida", delay: "3.2s", pos: "left-[-24px] bottom-[40px]" },
  ];

  return (
    <div className="relative w-full max-w-[460px] mx-auto lg:mx-0">
      {/* Soft gradient halo */}
      <div
        className="absolute -inset-6 rounded-[40px] opacity-60 blur-2xl -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 30%, rgba(38,146,220,0.18) 0%, rgba(116,108,230,0.14) 60%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Main card */}
      <div className="relative rounded-[24px] bg-white border border-[#e8ebf2] shadow-[0_24px_60px_-24px_rgba(38,40,80,0.18)] p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2692DC] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2692DC]" />
            </span>
            <span className="text-[12px] font-semibold tracking-wide text-[#5b6271] uppercase">
              Tu primer resultado
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#8a91a3]">VISTACEO</span>
        </div>

        {/* Rows */}
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <li
                key={row.label}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#f7f9fc] border border-[#eef1f6]"
              >
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg, #2692DC 0%, #746CE6 100%)",
                  }}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-[#1a1d27] leading-tight">
                    {row.label}
                  </p>
                  <p className="text-[12px] text-[#6b7283] mt-0.5">{row.hint}</p>
                </div>
                <span className="text-[#9aa1b3] text-xs">→</span>
              </li>
            );
          })}
        </ul>

        {/* Footer micro-copy */}
        <div className="mt-5 pt-4 border-t border-[#eef1f6] flex items-center justify-between">
          <span className="text-[11.5px] text-[#7a8194]">Generado para tu negocio</span>
          <span className="text-[11.5px] font-medium text-[#2692DC]">100% gratis</span>
        </div>
      </div>

      {/* Floating bubbles — subtle, anchored to outer edges to avoid overlapping the rows */}
      <div className="hidden lg:block pointer-events-none">
        {bubbles.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className={`absolute ${b.pos} promo-float`}
              style={{ animationDelay: b.delay }}
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#e8ebf2] shadow-[0_8px_24px_-8px_rgba(38,40,80,0.15)] text-[11.5px] font-medium text-[#1a1d27] whitespace-nowrap">
                <Icon className="w-3.5 h-3.5 text-[#2692DC]" />
                {b.text}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes promoFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.95; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        .promo-float {
          animation: promoFloat 4.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
