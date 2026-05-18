import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, MessageCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getHealthStyle } from "@/lib/health-score-utils";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  isMobile?: boolean;
}

/**
 * Premium hero del Dashboard — primer impacto "wow" al ingresar.
 * Combina: saludo + identidad del negocio + Salud + visión estratégica corta + CTA "Contale más".
 * Diseño Apple/Linear: glass premium, gradient sutil, números grandes, motion mínima.
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
  const certainty = data.certaintyPct;
  const delta = score !== null && data.previousScore !== null ? score - data.previousScore : null;

  // Visión estratégica corta — generada dinámicamente desde datos reales
  const visionLine = useMemo(() => {
    if (!currentBusiness) return "Estamos analizando tu negocio en tiempo real.";
    if (score === null) {
      return `Sumá datos de ${currentBusiness.name} para activar tu diagnóstico ejecutivo.`;
    }
    if (score >= 70) return `${currentBusiness.name} está en zona saludable. Hora de capitalizar oportunidades.`;
    if (score >= 50) return `${currentBusiness.name} muestra base estable, con palancas claras para crecer.`;
    return `${currentBusiness.name} tiene oportunidades críticas que podemos resolver hoy.`;
  }, [currentBusiness, score]);

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
      {/* Orb decorativo */}
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
        {/* Saludo */}
        <div className="flex items-start justify-between gap-4 mb-6">
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

          {/* Health pill — grande, visual */}
          {score !== null && (
            <div
              className={cn(
                "shrink-0 flex flex-col items-center justify-center rounded-2xl px-4 py-3 border",
                healthStyle.bgColor,
                healthStyle.borderColor
              )}
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
            </div>
          )}
        </div>

        {/* Visión estratégica */}
        <p
          className={cn(
            "text-foreground/85 leading-relaxed mb-5",
            isMobile ? "text-[15px]" : "text-lg"
          )}
        >
          {visionLine}
        </p>

        {/* Línea de certeza + chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="font-medium">Certeza {certainty}%</span>
          </div>
          {data.dataCompleteness.signalsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 text-accent" />
              <span className="font-medium">{data.dataCompleteness.signalsCount} señales</span>
            </div>
          )}
          {!data.dataCompleteness.hasBrain && (
            <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              Cerebro en aprendizaje
            </div>
          )}
        </div>

        {/* CTAs premium */}
        <div className={cn("flex gap-2.5", isMobile ? "flex-col" : "flex-row")}>
          <Button
            size={isMobile ? "default" : "lg"}
            onClick={() => navigate("/app/chat?intent=tell_more")}
            className={cn(
              "group relative overflow-hidden",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground",
              "hover:shadow-[0_10px_30px_-8px_hsl(var(--primary)/0.55)]",
              "transition-all duration-300",
              !isMobile && "flex-1"
            )}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contale más a la IA sobre tu negocio
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"
            />
          </Button>
          <Button
            size={isMobile ? "default" : "lg"}
            variant="outline"
            onClick={() => navigate("/app/analytics")}
            className="border-border/60 hover:bg-muted/50"
          >
            Ver oportunidades
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
