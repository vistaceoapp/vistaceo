import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, ArrowRight, TrendingUp, FlaskConical, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/app/GlassCard";
import { OpportunityCard } from "@/components/app/OpportunityCard";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { sanitizeAIOutput } from "@/lib/aiOutputSanitizer";

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  evidence: unknown;
  impact_score: number;
  effort_score: number;
  is_converted: boolean;
  created_at: string;
}

interface LearningItem {
  id: string;
  title: string;
  content: string | null;
  item_type: string | null;
  source: string | null;
  created_at: string;
}

/**
 * Dashboard widget: muestra EXACTAMENTE las mismas oportunidades y tendencias
 * que el Radar (mismas tablas, misma data). Clic → abre ese mismo ítem en Radar.
 */
export const OpportunitiesPreview = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [trends, setTrends] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentBusiness) return;
      setLoading(true);
      try {
        const [oppsRes, learnRes] = await Promise.all([
          supabase
            .from("opportunities")
            .select("*")
            .eq("business_id", currentBusiness.id)
            .is("dismissed_at", null)
            .eq("is_converted", false)
            .order("created_at", { ascending: false })
            .limit(2),
          supabase
            .from("learning_items")
            .select("*")
            .eq("business_id", currentBusiness.id)
            .in("item_type", ["trend", "macro", "insight", "benchmark", "platform", "competitive", "product"])
            .order("created_at", { ascending: false })
            .limit(2),
        ]);
        setOpportunities((oppsRes.data || []) as Opportunity[]);
        setTrends((learnRes.data || []) as LearningItem[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentBusiness?.id]);

  if (loading) {
    return <GlassCard className="p-5 h-64 animate-pulse" />;
  }

  const hasContent = opportunities.length > 0 || trends.length > 0;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Compass className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Radar de oportunidades</h3>
            <p className="text-xs text-muted-foreground">
              Las mismas tarjetas que ves en Radar — tocá para abrir el detalle.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs hidden sm:inline-flex"
          onClick={() => navigate("/app/radar")}
        >
          Ver todo el radar
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {!hasContent && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Lightbulb className="w-6 h-6 text-accent" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Tu radar se está calentando</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-[280px] mx-auto">
            En unos minutos vas a ver oportunidades y tendencias 100% personalizadas para tu negocio.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate("/app/radar")}>
            Ir al Radar
          </Button>
        </div>
      )}

      {hasContent && (
        <div className="grid gap-3 sm:grid-cols-2">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              compact
              onClick={() => navigate(`/app/radar?tab=oportunidades&opportunity=${opp.id}`)}
            />
          ))}

          {trends.map((t) => {
            const isResearch = ["product", "platform", "benchmark", "competitive"].includes(t.item_type || "");
            const Icon = isResearch ? FlaskConical : TrendingUp;
            const tone = isResearch ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-accent/10 text-accent";
            const label = isResearch ? "I+D del sector" : "Tendencia";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  navigate(`/app/radar?tab=${isResearch ? "id" : "oportunidades"}&item=${t.id}`)
                }
                className={cn(
                  "group text-left rounded-xl bg-card border border-border p-4",
                  "hover:border-primary/30 hover:shadow-lg transition-all"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg", tone)}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {label}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {sanitizeAIOutput(t.title)}
                </p>
                {t.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                    {sanitizeAIOutput(t.content)}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

export default OpportunitiesPreview;
