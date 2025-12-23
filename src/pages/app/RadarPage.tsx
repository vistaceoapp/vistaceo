import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Radar as RadarIcon, TrendingUp, AlertTriangle, Lightbulb, X, Zap, Eye, Sparkles, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const getSourceIcon = (source: string | null) => {
    switch (source) {
      case "reviews": return "⭐";
      case "sales": return "💰";
      case "social": return "📱";
      case "operations": return "⚙️";
      case "ai": return "🤖";
      default: return "💡";
    }
  };

  const getSourceLabel = (source: string | null) => {
    switch (source) {
      case "reviews": return "Reseñas";
      case "sales": return "Ventas";
      case "social": return "Redes";
      case "operations": return "Operaciones";
      case "ai": return "IA";
      default: return "Insight";
    }
  };

  const dismissOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Oportunidad descartada" });
      setSelectedOpportunity(null);
      fetchOpportunities();
    } catch (error) {
      console.error("Error dismissing opportunity:", error);
    }
  };

  const convertToMission = async (opportunity: Opportunity) => {
    if (!currentBusiness) return;
    setActionLoading(true);

    try {
      const { data: missionData, error: missionError } = await supabase
        .from("missions")
        .insert({
          business_id: currentBusiness.id,
          title: opportunity.title,
          description: opportunity.description,
          area: opportunity.source || "general",
          impact_score: opportunity.impact_score,
          effort_score: opportunity.effort_score,
          status: "active",
          steps: [
            { text: "Analizar el problema en detalle", done: false },
            { text: "Definir plan de acción", done: false },
            { text: "Implementar la solución", done: false },
            { text: "Medir resultados", done: false },
          ],
        })
        .select()
        .single();

      if (missionError) throw missionError;

      const { error: updateError } = await supabase
        .from("opportunities")
        .update({ 
          is_converted: true,
          converted_to_mission_id: missionData.id,
        })
        .eq("id", opportunity.id);

      if (updateError) throw updateError;

      toast({
        title: "🚀 ¡Misión creada!",
        description: "La oportunidad se convirtió en una misión activa.",
      });

      setSelectedOpportunity(null);
      navigate("/app/missions");
    } catch (error) {
      console.error("Error converting to mission:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la misión",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const generateOpportunities = async () => {
    if (!currentBusiness) return;
    setActionLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("uceo-chat", {
        body: {
          messages: [{ 
            role: "user", 
            content: `Analiza mi negocio y dame 2 oportunidades de mejora específicas. Responde SOLO con un JSON array con objetos que tengan: title (máx 60 chars), description (máx 150 chars), source (reviews/sales/social/operations), impact_score (1-10), effort_score (1-10).` 
          }],
          businessContext: {
            name: currentBusiness.name,
            category: currentBusiness.category,
            country: currentBusiness.country,
          }
        }
      });

      if (error) throw error;

      let opportunitiesData = [];
      try {
        const jsonMatch = data.message.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          opportunitiesData = JSON.parse(jsonMatch[0]);
        }
      } catch {
        opportunitiesData = [
          {
            title: "Mejorar respuesta a reseñas negativas",
            description: "Hay reseñas sin responder que afectan tu reputación online.",
            source: "reviews",
            impact_score: 7,
            effort_score: 3,
          }
        ];
      }

      for (const opp of opportunitiesData) {
        await supabase.from("opportunities").insert({
          business_id: currentBusiness.id,
          title: opp.title,
          description: opp.description,
          source: opp.source,
          impact_score: opp.impact_score || 5,
          effort_score: opp.effort_score || 5,
        });
      }

      toast({
        title: "✨ Análisis completado",
        description: `UCEO detectó ${opportunitiesData.length} nuevas oportunidades.`,
      });

      fetchOpportunities();
    } catch (error) {
      console.error("Error generating opportunities:", error);
      toast({
        title: "Error",
        description: "No se pudo analizar el negocio",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const highImpactCount = opportunities.filter(o => o.impact_score >= 7).length;
  const urgentCount = opportunities.filter(o => o.impact_score >= 8 && o.effort_score <= 4).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-card/50 rounded-xl animate-pulse w-1/2" />
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="h-20 animate-pulse" />
          <GlassCard className="h-20 animate-pulse" />
          <GlassCard className="h-20 animate-pulse" />
        </div>
        <GlassCard className="h-32 animate-pulse" />
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-3xl bg-accent/30 rounded-full animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <RadarIcon className="w-10 h-10 text-accent-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Radar de Oportunidades
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Configura tu negocio para descubrir oportunidades ocultas con IA.
        </p>
        <Button variant="hero" size="lg" onClick={() => navigate("/onboarding")}>
          <Sparkles className="w-5 h-5 mr-2" />
          Configurar negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RadarIcon className="w-6 h-6 text-accent" />
            Radar
          </h1>
          <p className="text-muted-foreground">Oportunidades detectadas por UCEO</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateOpportunities}
          disabled={actionLoading}
          className="hover:border-accent/50 hover:bg-accent/10"
        >
          <RadarIcon className={cn(
            "w-4 h-4 mr-2",
            actionLoading && "animate-spin"
          )} />
          {actionLoading ? "Analizando..." : "Escanear"}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <GlassCard interactive className="p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground">{opportunities.length}</div>
          <div className="text-xs text-muted-foreground">Detectadas</div>
        </GlassCard>
        
        <GlassCard interactive className="p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
            <Lightbulb className="w-5 h-5 text-warning" />
          </div>
          <div className="text-2xl font-bold text-foreground">{highImpactCount}</div>
          <div className="text-xs text-muted-foreground">Alto impacto</div>
        </GlassCard>
        
        <GlassCard interactive className="p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-foreground">{urgentCount}</div>
          <div className="text-xs text-muted-foreground">Quick wins</div>
        </GlassCard>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <GlassCard className="p-8 text-center animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-2xl bg-accent/30 rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
              <RadarIcon className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            No hay oportunidades detectadas
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Haz clic en "Escanear" para que UCEO analice tu negocio y encuentre áreas de mejora.
          </p>
          <Button 
            variant="hero"
            onClick={generateOpportunities}
            disabled={actionLoading}
            className="shadow-lg shadow-primary/30"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {actionLoading ? "Analizando..." : "Analizar con IA"}
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
          {opportunities.map((opportunity, idx) => (
            <GlassCard
              key={opportunity.id}
              variant={opportunity.impact_score >= 8 ? "accent" : "default"}
              interactive
              className="p-5 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => setSelectedOpportunity(opportunity)}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl",
                  opportunity.impact_score >= 8 ? "bg-warning/20" : "bg-accent/20"
                )}>
                  {getSourceIcon(opportunity.source)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                      {getSourceLabel(opportunity.source)}
                    </span>
                    {opportunity.impact_score >= 8 && (
                      <span className="text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20 animate-pulse">
                        🔥 Alto impacto
                      </span>
                    )}
                    {opportunity.impact_score >= 7 && opportunity.effort_score <= 4 && (
                      <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                        ⚡ Quick win
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-foreground text-lg leading-tight">
                    {opportunity.title}
                  </h3>
                  
                  {opportunity.description && (
                    <p className="text-muted-foreground line-clamp-2 mt-1 text-sm">
                      {opportunity.description}
                    </p>
                  )}

                  {/* Impact Matrix */}
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Impacto</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-2 h-2 rounded-full transition-colors",
                              i < Math.ceil(opportunity.impact_score / 2)
                                ? "bg-success shadow-sm shadow-success/50"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Esfuerzo</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-2 h-2 rounded-full transition-colors",
                              i < Math.ceil(opportunity.effort_score / 2)
                                ? "bg-warning shadow-sm shadow-warning/50"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Eye className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Opportunity Detail Dialog */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getSourceIcon(selectedOpportunity.source)}</span>
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    {getSourceLabel(selectedOpportunity.source)}
                  </span>
                </div>
                <DialogTitle className="text-xl">{selectedOpportunity.title}</DialogTitle>
                <DialogDescription>
                  {selectedOpportunity.description}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <GlassCard className="p-4 text-center bg-success/5 border-success/20">
                  <div className="text-3xl font-bold text-success">{selectedOpportunity.impact_score}/10</div>
                  <div className="text-xs text-muted-foreground mt-1">Impacto potencial</div>
                </GlassCard>
                <GlassCard className="p-4 text-center bg-warning/5 border-warning/20">
                  <div className="text-3xl font-bold text-warning">{selectedOpportunity.effort_score}/10</div>
                  <div className="text-xs text-muted-foreground mt-1">Esfuerzo requerido</div>
                </GlassCard>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => dismissOpportunity(selectedOpportunity.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Descartar
                </Button>
                <Button 
                  className="flex-1 gradient-primary shadow-lg shadow-primary/30"
                  onClick={() => convertToMission(selectedOpportunity)}
                  disabled={actionLoading}
                >
                  <Target className="w-4 h-4 mr-2" />
                  {actionLoading ? "Creando..." : "Crear misión"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RadarPage;
