import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Clock, Flame, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/app/GlassCard";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { sanitizeAIOutput } from "@/lib/aiOutputSanitizer";

/**
 * Acción recomendada de hoy.
 * - Siempre presente, nunca vacío.
 * - Si hay misión en curso → "Continuar misión".
 * - Si hay misión sugerida pendiente → "Empezar misión".
 * - Fallback inteligente según tipo de negocio.
 * - Destino siempre real: /app/missions
 */
export const TodayActionCard = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [mission, setMission] = useState<{
    title: string;
    description: string;
    minutes: number;
    impact: "Alto" | "Medio" | "Bajo";
    cta: string;
    isInProgress: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentBusiness) return;
      try {
        const { data } = await supabase
          .from("daily_actions")
          .select("title, description, status, created_at")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false })
          .limit(5);

        const inProgress = data?.find((d: any) => d.status === "in_progress");
        const pending = data?.find((d: any) => d.status === "pending" || d.status === "suggested");
        const top = inProgress || pending;

        if (top) {
          setMission({
            title: sanitizeAIOutput((top as any).title || "Misión recomendada"),
            description: sanitizeAIOutput((top as any).description || ""),
            minutes: 12,
            impact: "Alto",
            cta: inProgress ? "Continuar misión" : "Empezar misión",
            isInProgress: !!inProgress,
          });
        } else {
          setMission(getFallbackMission(currentBusiness?.category));
        }
      } catch {
        setMission(getFallbackMission(currentBusiness?.category));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentBusiness?.id]);

  if (loading) {
    return <GlassCard className="p-5 h-40 animate-pulse" />;
  }
  if (!mission) return null;

  return (
    <GlassCard className="p-5 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-primary, linear-gradient(135deg,#2692DC,#746CE6))" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Acción recomendada para hoy
            </p>
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {mission.title}
            </h3>
          </div>
        </div>

        {mission.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {mission.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground">
            <Clock className="w-3 h-3" /> {mission.minutes} min
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className="w-3 h-3" /> Impacto {mission.impact}
          </span>
          {!mission.isInProgress && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-3 h-3" /> Recomendada por IA
            </span>
          )}
        </div>

        <Button
          onClick={() => navigate("/app/missions")}
          className={cn(
            "group bg-gradient-to-r from-primary to-accent text-primary-foreground",
            "hover:shadow-[0_10px_24px_-8px_hsl(var(--primary)/0.5)] transition-all"
          )}
        >
          {mission.cta}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </GlassCard>
  );
};

function getFallbackMission(category?: string) {
  const cat = (category || "").toLowerCase();
  const isService = /servicio|consultor|estudio|asesor/.test(cat);
  const isPro = /profesion|coach|abogad|medic|kinesi|psicolog|nutric/.test(cat);

  const title = isPro
    ? "Definí una oferta clara para captar nuevos pacientes/clientes esta semana"
    : isService
    ? "Creá una propuesta simple para atraer clientes nuevos esta semana"
    : "Creá una oferta simple para atraer clientes nuevos esta semana";

  return {
    title,
    description:
      "Con la información actual, tu mayor oportunidad parece estar en mejorar la claridad de tu propuesta y captar más personas interesadas.",
    minutes: 12,
    impact: "Alto" as const,
    cta: "Empezar misión",
    isInProgress: false,
  };
}

export default TodayActionCard;
