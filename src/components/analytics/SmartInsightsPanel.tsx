import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Lightbulb,
  Zap,
  Star,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";

interface Insight {
  id: string;
  type: "opportunity" | "warning" | "achievement" | "trend";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  metric?: string;
  change?: number;
  actionable?: boolean;
}

interface KPI {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: any;
  color: string;
}

export const SmartInsightsPanel = () => {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagementScore, setEngagementScore] = useState(0);

  useEffect(() => {
    if (currentBusiness && brain) {
      generateSmartInsights();
    }
  }, [currentBusiness, brain]);

  const generateSmartInsights = async () => {
    if (!currentBusiness) return;
    setLoading(true);

    try {
      // Fetch all relevant data in parallel
      const [missionsRes, checkinsRes, alertsRes, insightsRes] = await Promise.all([
        supabase
          .from("missions")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("checkins")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("alerts")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from("business_insights")
          .select("*")
          .eq("business_id", currentBusiness.id),
      ]);

      const missions = missionsRes.data || [];
      const checkins = checkinsRes.data || [];
      const alerts = alertsRes.data || [];
      const businessInsights = insightsRes.data || [];

      // Calculate KPIs
      const completedMissions = missions.filter(m => m.status === "completed").length;
      const activeMissions = missions.filter(m => m.status === "active").length;
      const missionCompletionRate = missions.length > 0 
        ? Math.round((completedMissions / missions.length) * 100) 
        : 0;

      const avgTraffic = checkins.length > 0
        ? Math.round(checkins.reduce((sum, c) => sum + (c.traffic_level || 0), 0) / checkins.length * 20)
        : 0;

      const positiveAlerts = alerts.filter(a => a.alert_type === "positive").length;
      const negativeAlerts = alerts.filter(a => a.alert_type === "negative").length;
      const alertSentiment = alerts.length > 0 
        ? Math.round((positiveAlerts / alerts.length) * 100) 
        : 50;

      // Calculate engagement score based on Brain signals
      // CRITICAL: Score can NEVER be 100% - max is 95% for established businesses
      const brainSignals = brain?.total_signals || 0;
      const mvcCompletion = brain?.mvc_completion_pct || 0;
      // Base calculation with natural ceiling at 95
      let rawEngagement = Math.round((brainSignals / 100) * 35 + mvcCompletion * 0.55);
      // Apply logarithmic dampening to prevent reaching 100%
      const engagement = Math.min(95, Math.max(0, rawEngagement));
      setEngagementScore(engagement);

      // Generate KPIs
      const generatedKpis: KPI[] = [
        {
          label: "Tasa de Ejecución",
          value: `${missionCompletionRate}%`,
          change: missionCompletionRate > 50 ? 12 : -5,
          trend: missionCompletionRate > 50 ? "up" : "down",
          icon: Target,
          color: "primary"
        },
        {
          label: "Tráfico Promedio",
          value: `${avgTraffic}%`,
          change: avgTraffic > 60 ? 8 : -3,
          trend: avgTraffic > 60 ? "up" : "neutral",
          icon: Users,
          color: "accent"
        },
        {
          label: "Sentimiento General",
          value: `${alertSentiment}%`,
          change: alertSentiment - 50,
          trend: alertSentiment > 60 ? "up" : alertSentiment < 40 ? "down" : "neutral",
          icon: Star,
          color: alertSentiment > 60 ? "success" : "warning"
        },
        {
          label: "Score de Compromiso",
          value: `${engagement}`,
          change: 15,
          trend: "up",
          icon: Zap,
          color: "success"
        }
      ];
      setKpis(generatedKpis);

      // Generate Smart Insights
      const generatedInsights: Insight[] = [];

      // Mission-based insights
      if (activeMissions > 3) {
        generatedInsights.push({
          id: "too-many-missions",
          type: "warning",
          title: "Muchas misiones activas",
          description: `Tenés ${activeMissions} misiones en paralelo. Enfocarse en 2-3 aumenta la probabilidad de completarlas.`,
          impact: "medium",
          actionable: true
        });
      }

      if (completedMissions >= 5) {
        generatedInsights.push({
          id: "mission-champion",
          type: "achievement",
          title: "Ejecutor consistente",
          description: `Completaste ${completedMissions} misiones. Tu tasa de ejecución está en el top 20% de negocios similares.`,
          impact: "high",
          metric: `${missionCompletionRate}%`
        });
      }

      // Traffic insights
      if (checkins.length >= 7) {
        const recentTraffic = checkins.slice(0, 7);
        const avgRecent = recentTraffic.reduce((sum, c) => sum + (c.traffic_level || 0), 0) / recentTraffic.length;
        const previousTraffic = checkins.slice(7, 14);
        const avgPrevious = previousTraffic.length > 0 
          ? previousTraffic.reduce((sum, c) => sum + (c.traffic_level || 0), 0) / previousTraffic.length 
          : avgRecent;
        
        const trafficChange = avgPrevious > 0 ? ((avgRecent - avgPrevious) / avgPrevious) * 100 : 0;

        if (trafficChange > 15) {
          generatedInsights.push({
            id: "traffic-up",
            type: "trend",
            title: "Tráfico en aumento",
            description: "El flujo de clientes aumentó significativamente esta semana. Asegurate de tener stock y personal suficiente.",
            impact: "high",
            change: Math.round(trafficChange)
          });
        } else if (trafficChange < -15) {
          generatedInsights.push({
            id: "traffic-down",
            type: "warning",
            title: "Caída de tráfico detectada",
            description: "El flujo de clientes bajó esta semana. Revisá si hay factores externos (clima, competencia) o internos afectando.",
            impact: "high",
            change: Math.round(trafficChange),
            actionable: true
          });
        }
      }

      // Alert-based insights
      if (negativeAlerts >= 3) {
        generatedInsights.push({
          id: "negative-pattern",
          type: "warning",
          title: "Patrón de alertas negativas",
          description: `Registraste ${negativeAlerts} situaciones problemáticas este mes. Revisá si hay un problema sistémico.`,
          impact: "high",
          actionable: true
        });
      }

      if (positiveAlerts >= 3) {
        generatedInsights.push({
          id: "positive-pattern",
          type: "achievement",
          title: "Racha positiva",
          description: `${positiveAlerts} eventos positivos este mes. Identificá qué estás haciendo bien y replicalo.`,
          impact: "medium"
        });
      }

      // Brain-based insights
      if (mvcCompletion < 40) {
        generatedInsights.push({
          id: "brain-incomplete",
          type: "opportunity",
          title: "Potenciá tu CEO virtual",
          description: "Mientras más información me des, mejores serán mis recomendaciones. Respondé más preguntas en el chat.",
          impact: "high",
          metric: `${Math.round(mvcCompletion)}% completado`,
          actionable: true
        });
      }

      // Business type specific insights
      const businessType = brain?.primary_business_type || currentBusiness.category;
      if (businessType?.includes("restaurant") || businessType?.includes("cafe") || businessType?.includes("bar")) {
        if (checkins.length > 0) {
          const weekendCheckins = checkins.filter(c => {
            const day = new Date(c.created_at).getDay();
            return day === 0 || day === 6;
          });
          const weekdayCheckins = checkins.filter(c => {
            const day = new Date(c.created_at).getDay();
            return day !== 0 && day !== 6;
          });

          if (weekendCheckins.length > 0 && weekdayCheckins.length > 0) {
            const avgWeekend = weekendCheckins.reduce((sum, c) => sum + (c.traffic_level || 0), 0) / weekendCheckins.length;
            const avgWeekday = weekdayCheckins.reduce((sum, c) => sum + (c.traffic_level || 0), 0) / weekdayCheckins.length;

            if (avgWeekend > avgWeekday * 1.5) {
              generatedInsights.push({
                id: "weekend-peak",
                type: "trend",
                title: "Pico en fines de semana",
                description: "Tu negocio tiene 50% más tráfico los fines de semana. Considerá promociones entre semana para equilibrar.",
                impact: "medium",
                actionable: true
              });
            }
          }
        }
      }

      // Ensure we have at least some insights
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          id: "getting-started",
          type: "opportunity",
          title: "Empezá a alimentar el sistema",
          description: "Hacé check-ins diarios, completá misiones y usá el chat para desbloquear insights personalizados.",
          impact: "high",
          actionable: true
        });
      }

      setInsights(generatedInsights.slice(0, 6));
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity": return Lightbulb;
      case "warning": return AlertTriangle;
      case "achievement": return Star;
      case "trend": return TrendingUp;
    }
  };

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity": return "text-primary bg-primary/10 border-primary/20";
      case "warning": return "text-warning bg-warning/10 border-warning/20";
      case "achievement": return "text-success bg-success/10 border-success/20";
      case "trend": return "text-accent bg-accent/10 border-accent/20";
    }
  };

  const getImpactBadge = (impact: Insight["impact"]) => {
    switch (impact) {
      case "high": return <Badge className="bg-primary/20 text-primary text-[10px]">Alto impacto</Badge>;
      case "medium": return <Badge variant="secondary" className="text-[10px]">Impacto medio</Badge>;
      case "low": return <Badge variant="outline" className="text-[10px]">Bajo impacto</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-48 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engagement Score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Score de Inteligencia</h3>
                <p className="text-sm text-muted-foreground">Qué tan bien te conozco</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {engagementScore}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
          </div>
          <Progress value={engagementScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {engagementScore < 25 && "Estoy aprendiendo sobre tu negocio. Seguí interactuando para mejorar."}
            {engagementScore >= 25 && engagementScore < 50 && "Tengo una base sólida. Las recomendaciones van a mejorar."}
            {engagementScore >= 50 && engagementScore < 75 && "Conozco bien tu negocio. Las predicciones son confiables."}
            {engagementScore >= 75 && "Nivel experto alcanzado. Máxima precisión en recomendaciones."}
          </p>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    kpi.color === "primary" && "bg-primary/10",
                    kpi.color === "accent" && "bg-accent/10",
                    kpi.color === "success" && "bg-success/10",
                    kpi.color === "warning" && "bg-warning/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      kpi.color === "primary" && "text-primary",
                      kpi.color === "accent" && "text-accent",
                      kpi.color === "success" && "text-success",
                      kpi.color === "warning" && "text-warning"
                    )} />
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : kpi.trend === "down" ? (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    ) : null}
                    <span className={cn(
                      "text-xs font-medium",
                      kpi.trend === "up" && "text-success",
                      kpi.trend === "down" && "text-destructive",
                      kpi.trend === "neutral" && "text-muted-foreground"
                    )}>
                      {kpi.change > 0 ? "+" : ""}{kpi.change}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Smart Insights */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Insights Inteligentes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={generateSmartInsights}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.type);
              
              return (
                <div 
                  key={insight.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:shadow-md",
                    colorClass
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      insight.type === "opportunity" && "bg-primary/20",
                      insight.type === "warning" && "bg-warning/20",
                      insight.type === "achievement" && "bg-success/20",
                      insight.type === "trend" && "bg-accent/20"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-foreground text-sm">{insight.title}</h4>
                        {getImpactBadge(insight.impact)}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                      {(insight.metric || insight.change !== undefined) && (
                        <div className="flex items-center gap-2 mt-2">
                          {insight.metric && (
                            <Badge variant="outline" className="text-[10px]">
                              {insight.metric}
                            </Badge>
                          )}
                          {insight.change !== undefined && (
                            <span className={cn(
                              "text-xs font-medium flex items-center gap-1",
                              insight.change > 0 ? "text-success" : "text-destructive"
                            )}>
                              {insight.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {insight.change > 0 ? "+" : ""}{insight.change}%
                            </span>
                          )}
                        </div>
                      )}
                      {insight.actionable && (
                        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs px-2">
                          Ver acción <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
