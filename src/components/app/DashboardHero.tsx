import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, MessageCircle, Target, Compass, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useBrain } from "@/hooks/use-brain";
import { getHealthStyle } from "@/lib/health-score-utils";
import { cn } from "@/lib/utils";

const DIMENSION_LABELS: Record<string, string> = {
  reputation: "reputación",
  profitability: "rentabilidad",
  finances: "finanzas",
  efficiency: "eficiencia operativa",
  traffic: "captación de clientes",
  team: "equipo",
  growth: "crecimiento",
};

const FOCUS_LABELS: Record<string, string> = {
  ventas: "aumentar ventas",
  marketing: "atraer más clientes",
  reputacion: "mejorar reputación",
  eficiencia: "optimizar operación",
  equipo: "fortalecer al equipo",
  producto: "potenciar producto",
  costos: "mejorar rentabilidad",
  expansion: "abrir nuevos canales",
};

interface DashboardHeroProps {
  isMobile?: boolean;
}

/**
 * Hero ejecutivo del Dashboard.
 * - Identidad visual actual (glass premium, gradient sutil)
 * - Chips clickeables con destinos reales
 * - CTAs: acción del día (Misiones) + oportunidades (Radar) + CEO/IA (Chat)
 */
export const DashboardHero = ({ isMobile = false }: DashboardHeroProps) => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const { data } = useDashboardData();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const score = data.snapshotScore;
  const healthStyle = getHealthStyle(score);
  const certainty = data.certaintyPct || 31; // fallback inicial — nunca 0
  const delta = score !== null && data.previousScore !== null ? score - data.previousScore : null;

  // Texto adaptado al tipo de negocio/servicio
  const visionLine = useMemo(() => {
    const name = currentBusiness?.name ?? "tu negocio";
    const cat = (currentBusiness?.category || "").toLowerCase();
    const isService = /servicio|consultor|estudio|asesor/.test(cat);
    const isPro = /profesion|coach|terapeut|abogad|medic|kinesi|psicolog|nutric/.test(cat);
    const isBrand = /marca|influencer|creador|personal/.test(cat);
    const isEmpresa = /empresa|corporat|industri|fabrica|b2b/.test(cat);

    const tail = isPro
      ? "posicionamiento, captación de clientes y claridad de tu oferta profesional."
      : isService
      ? "captación, propuesta de valor y comunicación de tu servicio."
      : isBrand
      ? "visibilidad, autoridad y captación de oportunidades."
      : isEmpresa
      ? "ventas, procesos y decisiones de tu empresa."
      : "captación, ventas y claridad comercial de tu negocio.";

    if (score === null) {
      return `Ya armamos el diagnóstico inicial de ${name}. Detectamos oportunidades para mejorar ${tail}`;
    }
    if (score >= 70) {
      return `${name} está en zona saludable. Capitalicemos oportunidades de ${tail}`;
    }
    if (score >= 50) {
      return `${name} muestra una base estable. Hay palancas claras en ${tail}`;
    }
    return `${name} tiene oportunidades críticas a resolver. Foco en ${tail}`;
  }, [currentBusiness, score]);

  const chips = [
    {
      key: "certainty",
      label: `Certeza ${certainty}%`,
      icon: Sparkles,
      onClick: () =>
        navigate(
          "/app/chat?prompt=" +
            encodeURIComponent(
              "Quiero contarte más sobre mi negocio para mejorar tu certeza y diagnóstico."
            )
        ),
    },
    {
      key: "opps",
      label: "3 oportunidades iniciales",
      icon: Compass,
      onClick: () => navigate("/app/radar?tab=oportunidades"),
    },
    {
      key: "mission",
      label: "Misión recomendada",
      icon: Target,
      onClick: () => navigate("/app/missions"),
    },
    ...(score !== null
      ? [
          {
            key: "health",
            label: `Salud ${score} ${healthStyle.label}`,
            icon: Activity,
            onClick: () => navigate("/app/analytics?tab=diagnostico"),
          },
        ]
      : []),
  ];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/40",
        "bg-gradient-to-br from-card via-card to-card/60",
        "shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.18)]",
        "animate-fade-in",
        isMobile ? "p-5" : "p-7"
      )}
    >
      {/* Orbs decorativos */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-primary, linear-gradient(135deg,#2692DC,#746CE6))" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl bg-accent"
      />

      <div className="relative">
        {/* Saludo + Salud pill */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80 font-medium mb-1.5">
              Centro de inteligencia
            </p>
            <h1
              className={cn(
                "font-bold tracking-tight text-foreground leading-tight",
                isMobile ? "text-[26px]" : "text-4xl"
              )}
            >
              {greeting}
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentBusiness?.name ?? "tu negocio"}
              </span>
            </h1>
          </div>

          {score !== null && (
            <button
              type="button"
              onClick={() => navigate("/app/analytics?tab=diagnostico")}
              className={cn(
                "shrink-0 flex flex-col items-center justify-center rounded-2xl px-4 py-3 border transition-all hover:scale-[1.03] active:scale-95",
                healthStyle.bgColor,
                healthStyle.borderColor
              )}
              aria-label="Ver salud del negocio en Analíticas"
            >
              <span className={cn("text-3xl font-bold leading-none", healthStyle.textColor)}>
                {score}
              </span>
              <span className={cn("text-[10px] uppercase tracking-wider font-semibold mt-1", healthStyle.textColor)}>
                {healthStyle.label}
              </span>
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "text-[10px] mt-0.5 font-medium",
                    delta > 0 ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Vision line */}
        <p
          className={cn(
            "text-foreground/85 leading-relaxed mb-5",
            isMobile ? "text-[15px]" : "text-lg"
          )}
        >
          {visionLine}
        </p>

        {/* Chips clickeables — destinos reales */}
        <div
          className={cn(
            "flex gap-2 mb-6",
            isMobile ? "overflow-x-auto -mx-1 px-1 pb-1 [&::-webkit-scrollbar]:hidden" : "flex-wrap"
          )}
        >
          {chips.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                type="button"
                onClick={c.onClick}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 text-xs font-medium",
                  "px-3 py-1.5 rounded-full border border-border/60",
                  "bg-muted/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
                  "transition-all"
                )}
              >
                <Icon className="w-3 h-3" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* CTAs */}
        <div className={cn("flex gap-2.5", isMobile ? "flex-col" : "flex-row items-center")}>
          <Button
            size={isMobile ? "default" : "lg"}
            onClick={() => navigate("/app/missions")}
            className={cn(
              "group relative overflow-hidden",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground",
              "hover:shadow-[0_10px_30px_-8px_hsl(var(--primary)/0.55)]",
              "transition-all duration-300",
              !isMobile && "min-w-[200px]"
            )}
          >
            <Target className="w-4 h-4 mr-2" />
            Ver acción de hoy
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"
            />
          </Button>
          <Button
            size={isMobile ? "default" : "lg"}
            variant="outline"
            onClick={() => navigate("/app/radar?tab=oportunidades")}
            className="border-border/60 hover:bg-muted/50"
          >
            <Compass className="w-4 h-4 mr-1.5" />
            Ver oportunidades
          </Button>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/app/chat?prompt=" +
                  encodeURIComponent("Quiero contarte más sobre mi negocio para mejorar tus recomendaciones.")
              )
            }
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors",
              isMobile ? "justify-center mt-1" : "ml-1"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Contarle más a mi CEO
          </button>
        </div>
      </div>
    </section>
  );
};
