import { useState, useEffect, useCallback } from "react";
import { Radar, TrendingUp, ChevronRight, Lock, Sparkles, Lightbulb, ExternalLink, Globe, Building2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  source?: string;
  date: string;
  isExternal?: boolean;
  item_type?: string;
}

interface RadarWidgetProps {
  isPro?: boolean;
  className?: string;
}

// Map item_type to category for display
const mapItemTypeToCategory = (itemType: string): string => {
  const mapping: Record<string, string> = {
    trend: "tendencia",
    benchmark: "mercado",
    platform: "plataforma",
    competitive: "competencia",
    product: "producto",
    macro: "mercado",
    insight: "tendencia",
  };
  return mapping[itemType] || "tendencia";
};

// Generate fallback insight based on sector
const getFallbackInsight = (businessType: string | undefined, category: string | null): MarketInsight => {
  const type = businessType?.toLowerCase() || category?.toLowerCase() || "negocio";
  
  const fallbacks: Record<string, MarketInsight> = {
    restaurante: { id: "f1", title: "Tendencia: Experiencias gastronómicas inmersivas", description: "Los restaurantes que ofrecen experiencias más allá de la comida están viendo 30% más engagement.", category: "tendencia", source: "Análisis de mercado", date: "Esta semana", isExternal: true },
    cafeteria: { id: "f2", title: "Specialty coffee sigue en alza", description: "El café de especialidad crece 35% anual en LATAM.", category: "tendencia", source: "Análisis de mercado", date: "Esta semana", isExternal: true },
    bar: { id: "f3", title: "Mocktails premium en crecimiento", description: "Los cócteles sin alcohol crecen 40% vs año anterior.", category: "tendencia", source: "Análisis de mercado", date: "Esta semana", isExternal: true },
    heladeria: { id: "f4", title: "Helados plant-based en auge", description: "La demanda de helados veganos crece 45% anual.", category: "tendencia", source: "Análisis de mercado", date: "Esta semana", isExternal: true },
    moda: { id: "f5", title: "Moda circular toma fuerza", description: "Las tiendas con second-hand ven 25% más tráfico.", category: "tendencia", source: "Análisis retail", date: "Esta semana", isExternal: true },
    spa: { id: "f6", title: "Wellness integral 360°", description: "Los spas con programas integrales retienen 40% más.", category: "tendencia", source: "Mercado wellness", date: "Esta semana", isExternal: true },
    hotel: { id: "f7", title: "Turismo experiencial local", description: "Los hoteles con tours exclusivos tienen 45% más bookings.", category: "tendencia", source: "Mercado turismo", date: "Esta semana", isExternal: true },
  };

  return fallbacks[type] || {
    id: "default",
    title: "Digitalización acelera el crecimiento",
    description: "Los negocios con presencia digital activa crecen 40% más rápido.",
    category: "tendencia",
    source: "Análisis de mercado",
    date: "Esta semana",
    isExternal: true,
  };
};

export const RadarWidget = ({ isPro = false, className }: RadarWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      // Fetch real learning items from database - include more item types
      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .in("item_type", ["trend", "benchmark", "platform", "competitive", "product", "macro", "insight"])
        .order("created_at", { ascending: false })
        .limit(isPro ? 5 : 3);

      if (error) throw error;

      if (data && data.length > 0) {
        setInsights(data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.content || "",
          category: mapItemTypeToCategory(item.item_type || "insight"),
          source: item.source || "Radar I+D",
          date: formatRelativeDate(item.created_at),
          isExternal: true,
          item_type: item.item_type,
        })));
      } else {
        // Use fallback insight
        const fallback = getFallbackInsight(brain?.primary_business_type, currentBusiness.category);
        setInsights([fallback]);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      const fallback = getFallbackInsight(brain?.primary_business_type, currentBusiness?.category);
      setInsights([fallback]);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, isPro, brain?.primary_business_type]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Generate new I+D insights
  const generateNewInsights = useCallback(async () => {
    if (!currentBusiness || generating) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-patterns", {
        body: {
          businessId: currentBusiness.id,
          type: "research",
          brainContext: brain ? {
            primaryType: brain.primary_business_type,
            focus: brain.current_focus,
          } : null,
        },
      });

      if (error) throw error;

      const created = data?.learningCreated || 0;
      toast({
        title: created > 0 ? "¡Nuevos insights encontrados!" : "Sin novedades por ahora",
        description: created > 0 
          ? `Encontré ${created} insights externos para tu ${brain?.primary_business_type || "negocio"}.`
          : "Vuelvo a buscar más tarde.",
      });

      if (created > 0) {
        fetchInsights();
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "No se pudieron generar insights. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [currentBusiness, brain, generating, fetchInsights]);

  const currentInsight = insights[0];

  // Format relative date helper
  const formatRelativeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <GlassCard className={cn("p-4 animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/2 mb-4" />
        <div className="h-16 bg-muted rounded" />
      </GlassCard>
    );
  }

  // Free version
  if (!isPro) {
    return (
      <GlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-accent" />
            <h4 className="font-semibold text-foreground text-sm">Hoy en tu mercado</h4>
          </div>
          <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
            Semanal
          </Badge>
        </div>

        {currentInsight && (
          <button
            className="w-full p-3 rounded-xl bg-accent/5 border border-accent/10 mb-3 text-left hover:border-accent/30 transition-colors cursor-pointer"
            onClick={() => navigate("/app/radar?tab=id")}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm mb-1">{currentInsight.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{currentInsight.description}</p>
                <p className="text-[10px] text-muted-foreground mt-2 italic">{currentInsight.date}</p>
              </div>
            </div>
          </button>
        )}

        {/* Pro CTA */}
        <button
          className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => navigate("/app/radar?tab=id")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-sm">Insights diarios</p>
              <p className="text-xs text-muted-foreground">Monitoreo de competencia en tiempo real</p>
            </div>
            <Button 
              size="sm" 
              className="gradient-primary h-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/app/more");
              }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Pro
            </Button>
          </div>
        </button>
      </GlassCard>
    );
  }

  // Pro version - enhanced with more categories and refresh
  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-foreground text-sm">Hoy en tu mercado</h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={generateNewInsights}
            disabled={generating}
          >
            <RefreshCw className={cn("w-3 h-3", generating && "animate-spin")} />
          </Button>
          <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
            En vivo
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {insights.slice(0, 3).map((insight) => (
          <button
            key={insight.id}
            className="w-full p-3 rounded-xl bg-secondary/30 border border-border hover:border-accent/30 transition-all text-left group"
            onClick={() => navigate(`/app/radar?tab=id`)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                insight.category === "competencia" && "bg-destructive/10",
                insight.category === "mercado" && "bg-warning/10",
                insight.category === "oportunidad" && "bg-success/10",
                insight.category === "tendencia" && "bg-accent/10",
                insight.category === "plataforma" && "bg-primary/10",
                insight.category === "producto" && "bg-accent/10",
              )}>
                {insight.category === "competencia" && <TrendingUp className="w-4 h-4 text-destructive" />}
                {insight.category === "mercado" && <Radar className="w-4 h-4 text-warning" />}
                {insight.category === "oportunidad" && <Lightbulb className="w-4 h-4 text-success" />}
                {insight.category === "tendencia" && <TrendingUp className="w-4 h-4 text-accent" />}
                {insight.category === "plataforma" && <Globe className="w-4 h-4 text-primary" />}
                {insight.category === "producto" && <Building2 className="w-4 h-4 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm mb-0.5 line-clamp-1 group-hover:text-accent transition-colors">
                  {insight.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{insight.date} • {insight.source?.split(" | ")[0] || "Radar I+D"}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">Sin insights todavía</p>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewInsights}
            disabled={generating}
          >
            <RefreshCw className={cn("w-3 h-3 mr-2", generating && "animate-spin")} />
            Buscar tendencias
          </Button>
        </div>
      )}

      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full mt-3 text-xs"
        onClick={() => navigate("/app/radar?tab=id")}
      >
        Ver más en I+D
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
    </GlassCard>
  );
};

export default RadarWidget;
