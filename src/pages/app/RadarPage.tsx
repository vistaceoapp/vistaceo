import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Radar as RadarIcon, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  evidence: unknown;
  impact_score: number;
  effort_score: number;
  is_converted: boolean;
}

const RadarPage = () => {
  const { currentBusiness } = useBusiness();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) {
      fetchOpportunities();
    } else {
      setLoading(false);
    }
  }, [currentBusiness]);

  const fetchOpportunities = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .is("dismissed_at", null)
        .eq("is_converted", false)
        .order("impact_score", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "reviews": return "⭐";
      case "sales": return "💰";
      case "social": return "📱";
      case "operations": return "⚙️";
      default: return "💡";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-secondary rounded w-1/2" />
        <div className="h-32 bg-card rounded-2xl" />
        <div className="h-32 bg-card rounded-2xl" />
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
          <RadarIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Radar de Oportunidades
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Configura tu negocio para descubrir oportunidades ocultas.
        </p>
        <Button variant="hero" onClick={() => window.location.href = "/onboarding"}>
          Configurar negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Radar</h1>
        <p className="text-muted-foreground">Oportunidades detectadas por UCEO</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">{opportunities.length}</div>
          <div className="text-[10px] text-muted-foreground">Oportunidades</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Lightbulb className="w-5 h-5 text-warning mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">3</div>
          <div className="text-[10px] text-muted-foreground">Alto impacto</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">1</div>
          <div className="text-[10px] text-muted-foreground">Urgentes</div>
        </div>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <RadarIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Escaneando tu negocio...
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            UCEO está analizando tus datos para encontrar oportunidades. 
            Conecta más integraciones para mejores resultados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 text-xl">
                  {getSourceIcon(opportunity.source)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full capitalize">
                      {opportunity.source || "Insight"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {opportunity.title}
                  </h3>
                  {opportunity.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {opportunity.description}
                    </p>
                  )}

                  {/* Evidence */}
                  {opportunity.evidence && (opportunity.evidence as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(opportunity.evidence as string[]).slice(0, 2).map((item, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Impact Matrix */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Impacto:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-2 h-2 rounded-full",
                              i < Math.ceil(opportunity.impact_score / 2)
                                ? "bg-primary"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Esfuerzo:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-2 h-2 rounded-full",
                              i < Math.ceil(opportunity.effort_score / 2)
                                ? "bg-warning"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  Convertir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sample Opportunities for empty state */}
      {opportunities.length === 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Ejemplos de lo que detectamos</h2>
          <div className="grid gap-4">
            {[
              { title: "Clientes mencionan espera larga", source: "reviews", impact: 8 },
              { title: "Ventas bajan los martes", source: "sales", impact: 6 },
              { title: "Competidor lanzó promoción", source: "social", impact: 7 },
            ].map((example, idx) => (
              <div
                key={idx}
                className="bg-card/50 border border-dashed border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                    {getSourceIcon(example.source)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-muted-foreground">{example.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      Impacto potencial: {example.impact}/10
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarPage;
