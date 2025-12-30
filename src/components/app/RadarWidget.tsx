import { useState, useEffect } from "react";
import { Radar, TrendingUp, ChevronRight, Lock, Sparkles, Lightbulb, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  source?: string;
  date: string;
}

interface RadarWidgetProps {
  isPro?: boolean;
  className?: string;
}

// Demo insights for free users
const DEMO_INSIGHTS: MarketInsight[] = [
  {
    id: "demo-1",
    title: "Tendencia: Opciones sin gluten en alza",
    description: "Los restaurantes que agregaron opciones sin gluten vieron un aumento del 23% en nuevos clientes este mes.",
    category: "tendencias",
    source: "Análisis del mercado",
    date: "Esta semana",
  },
];

const PRO_INSIGHTS: MarketInsight[] = [
  {
    id: "pro-1",
    title: "Tu competencia bajó precios en delivery",
    description: "2 de tus competidores directos redujeron sus precios de delivery un 15% esta semana.",
    category: "competencia",
    source: "Monitoreo automático",
    date: "Hoy",
  },
  {
    id: "pro-2",
    title: "Nuevo local abrió a 500m",
    description: "Se detectó la apertura de un nuevo restaurante similar en tu zona de influencia.",
    category: "mercado",
    source: "Google Maps",
    date: "Ayer",
  },
  {
    id: "pro-3",
    title: "Demanda alta para brunch este fin de semana",
    description: "Las búsquedas de 'brunch' en tu zona aumentaron 40% vs semana pasada.",
    category: "oportunidad",
    source: "Tendencias locales",
    date: "Hoy",
  },
];

export const RadarWidget = ({ isPro = false, className }: RadarWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [currentBusiness, isPro]);

  const fetchInsights = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      // In a real implementation, fetch from learning_items or a dedicated insights table
      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .eq("item_type", "trend")
        .order("created_at", { ascending: false })
        .limit(isPro ? 3 : 1);

      if (error) throw error;

      if (data && data.length > 0) {
        setInsights(data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.content || "",
          category: "tendencia",
          source: item.source || "Análisis del mercado",
          date: new Date(item.created_at).toLocaleDateString("es", { weekday: "long" }),
        })));
      } else {
        // Use demo/pro insights based on plan
        setInsights(isPro ? PRO_INSIGHTS : DEMO_INSIGHTS);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsights(isPro ? PRO_INSIGHTS : DEMO_INSIGHTS);
    } finally {
      setLoading(false);
    }
  };

  const currentInsight = insights[0];

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
          <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 mb-3">
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
          </div>
        )}

        {/* Pro CTA */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Insights diarios</p>
              <p className="text-xs text-muted-foreground">Monitoreo de competencia en tiempo real</p>
            </div>
            <Button 
              size="sm" 
              className="gradient-primary h-8"
              onClick={() => navigate("/app/more")}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Pro
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Pro version
  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-foreground text-sm">Hoy en tu mercado</h4>
        </div>
        <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
          En vivo
        </Badge>
      </div>

      <div className="space-y-2">
        {insights.slice(0, 3).map((insight, idx) => (
          <button
            key={insight.id}
            className="w-full p-3 rounded-xl bg-secondary/30 border border-border hover:border-accent/30 transition-all text-left group"
            onClick={() => navigate(`/app/radar`)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                insight.category === "competencia" && "bg-destructive/10",
                insight.category === "mercado" && "bg-warning/10",
                insight.category === "oportunidad" && "bg-success/10",
                insight.category === "tendencia" && "bg-accent/10",
              )}>
                {insight.category === "competencia" && <TrendingUp className="w-4 h-4 text-destructive" />}
                {insight.category === "mercado" && <Radar className="w-4 h-4 text-warning" />}
                {insight.category === "oportunidad" && <Lightbulb className="w-4 h-4 text-success" />}
                {insight.category === "tendencia" && <TrendingUp className="w-4 h-4 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm mb-0.5 line-clamp-1 group-hover:text-accent transition-colors">
                  {insight.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{insight.date} • {insight.source}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </button>
        ))}
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full mt-3 text-xs"
        onClick={() => navigate("/app/radar")}
      >
        Ver más en I+D
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
    </GlassCard>
  );
};

export default RadarWidget;
