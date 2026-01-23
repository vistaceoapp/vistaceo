import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  BarChart3,
  Globe,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface InsightMetricsData {
  totalInsights: number;
  insightsApplied: number;
  insightsDismissed: number;
  insightsByType: Record<string, number>;
  topCategories: { category: string; count: number }[];
  weeklyTrend: number; // percentage change from last week
  monthlyTotal: number;
}

interface InsightMetricsWidgetProps {
  className?: string;
}

export const InsightMetricsWidget = ({ className }: InsightMetricsWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const [metrics, setMetrics] = useState<InsightMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [currentBusiness]);

  const fetchMetrics = async () => {
    if (!currentBusiness) return;
    setLoading(true);

    try {
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch learning items this week
      const [
        thisWeekItems,
        lastWeekItems,
        monthItems,
        appliedSignals,
        dismissedSignals,
      ] = await Promise.all([
        supabase
          .from("learning_items")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .gte("created_at", thisWeekStart.toISOString()),
        supabase
          .from("learning_items")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("created_at", lastWeekStart.toISOString())
          .lt("created_at", thisWeekStart.toISOString()),
        supabase
          .from("learning_items")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("signals")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("signal_type", "research_converted")
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("signals")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("signal_type", "research_dismissed")
          .gte("created_at", monthStart.toISOString()),
      ]);

      const items = thisWeekItems.data || [];
      const insightsByType: Record<string, number> = {};
      
      // Translations for item types
      const typeTranslations: Record<string, string> = {
        trend: "Tendencia",
        benchmark: "Referencia",
        platform: "Plataforma",
        competitive: "Competencia",
        product: "Producto",
        macro: "Macro",
        opportunity: "Oportunidad",
        general: "General",
        consumo: "Consumo",
        operacion_externa: "Operación",
      };
      
      items.forEach((item) => {
        const rawType = item.item_type || "general";
        const translatedType = typeTranslations[rawType] || rawType;
        insightsByType[translatedType] = (insightsByType[translatedType] || 0) + 1;
      });

      const topCategories = Object.entries(insightsByType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([category, count]) => ({ category, count }));

      const lastWeekCount = lastWeekItems.count || 0;
      const thisWeekCount = items.length;
      const weeklyTrend = lastWeekCount > 0 
        ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
        : thisWeekCount > 0 ? 100 : 0;

      setMetrics({
        totalInsights: thisWeekCount,
        insightsApplied: appliedSignals.count || 0,
        insightsDismissed: dismissedSignals.count || 0,
        insightsByType,
        topCategories,
        weeklyTrend,
        monthlyTotal: monthItems.count || 0,
      });
    } catch (error) {
      console.error("Error fetching insight metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "tendencia":
        return "📈";
      case "mercado":
        return "🏪";
      case "competencia":
        return "🎯";
      case "plataforma":
        return "📱";
      case "tecnologia":
        return "💻";
      case "consumidor":
        return "👥";
      default:
        return "💡";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "tendencia":
        return "bg-accent/10 text-accent border-accent/20";
      case "mercado":
        return "bg-success/10 text-success border-success/20";
      case "competencia":
        return "bg-warning/10 text-warning border-warning/20";
      case "plataforma":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <GlassCard className={cn("p-4 animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!metrics) {
    return (
      <GlassCard className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold text-foreground">Métricas I+D</h4>
        </div>
        <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
      </GlassCard>
    );
  }

  const conversionRate = metrics.monthlyTotal > 0
    ? Math.round((metrics.insightsApplied / metrics.monthlyTotal) * 100)
    : 0;

  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold text-foreground">Métricas I+D</h4>
        </div>
        <Badge variant="outline" className="text-[10px]">
          <Calendar className="w-3 h-3 mr-1" />
          Esta semana
        </Badge>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Lightbulb className="w-4 h-4 text-accent" />
          </div>
          <span className="text-xl font-bold text-foreground">{metrics.totalInsights}</span>
          <p className="text-[10px] text-muted-foreground">Nuevos</p>
        </div>

        <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <span className="text-xl font-bold text-foreground">{metrics.insightsApplied}</span>
          <p className="text-[10px] text-muted-foreground">Aplicados</p>
        </div>

        <div className="p-3 rounded-xl bg-muted border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">{metrics.monthlyTotal}</span>
          <p className="text-[10px] text-muted-foreground">Este mes</p>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Tasa de aplicación</span>
          <span className="font-semibold text-foreground">{conversionRate}%</span>
        </div>
        <Progress value={conversionRate} className="h-2" />
      </div>

      {/* Weekly Trend */}
      {metrics.weeklyTrend !== 0 && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 mb-3">
          <span className="text-xs text-muted-foreground">vs semana anterior</span>
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            metrics.weeklyTrend > 0 ? "text-success" : "text-destructive"
          )}>
            <TrendingUp className={cn(
              "w-3 h-3",
              metrics.weeklyTrend < 0 && "rotate-180"
            )} />
            {metrics.weeklyTrend > 0 ? "+" : ""}{metrics.weeklyTrend}%
          </div>
        </div>
      )}

      {/* Top Categories */}
      {metrics.topCategories.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground mb-2">Categorías principales</p>
          <div className="flex flex-wrap gap-1.5">
            {metrics.topCategories.map((cat) => (
              <Badge
                key={cat.category}
                variant="outline"
                className={cn("text-[10px]", getCategoryColor(cat.category))}
              >
                <span className="mr-1">{getCategoryIcon(cat.category)}</span>
                {cat.category} ({cat.count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default InsightMetricsWidget;
