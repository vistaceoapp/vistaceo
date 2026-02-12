import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb,
  Zap, Star, Users, DollarSign, Clock, ArrowUpRight, ArrowDownRight,
  Sparkles, RefreshCw, ChevronRight, BarChart3, Flame, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";

interface Insight {
  id: string;
  type: "opportunity" | "warning" | "achievement" | "trend" | "action";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  metric?: string;
  change?: number;
  actionable?: boolean;
  actionRoute?: string;
  actionLabel?: string;
}

interface KPI {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

export const SmartInsightsPanel = () => {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagementScore, setEngagementScore] = useState(0);

  const generateSmartInsights = useCallback(async () => {
    if (!currentBusiness) return;
    setLoading(true);

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all relevant data in parallel - using REAL tables
      const [actionsRes, pulseRes, opportunitiesRes, predictionsRes, insightsRes, snapshotsRes] = await Promise.all([
        supabase.from("daily_actions").select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false }).limit(50),
        supabase.from("pulse_checkins").select("*")
          .eq("business_id", currentBusiness.id)
          .gte("created_at", thirtyDaysAgo)
          .order("applies_to_date", { ascending: false }),
        supabase.from("opportunities").select("*")
          .eq("business_id", currentBusiness.id)
          .is("dismissed_at", null)
          .order("created_at", { ascending: false }).limit(20),
        supabase.from("predictions").select("*")
          .eq("business_id", currentBusiness.id)
          .eq("status", "active")
          .order("created_at", { ascending: false }).limit(10),
        supabase.from("business_insights").select("*")
          .eq("business_id", currentBusiness.id),
        supabase.from("snapshots").select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false }).limit(5),
      ]);

      const actions = actionsRes.data || [];
      const pulseCheckins = pulseRes.data || [];
      const opportunities = opportunitiesRes.data || [];
      const predictions = predictionsRes.data || [];
      const businessInsights = insightsRes.data || [];
      const snapshots = snapshotsRes.data || [];

      // ========== REAL KPI CALCULATIONS ==========
      const completedActions = actions.filter(a => a.status === "completed").length;
      const activeActions = actions.filter(a => a.status === "pending").length;
      const totalActions = actions.length;
      const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

      // Pulse score trend (real data from pulse_checkins)
      const recentPulse = pulseCheckins.filter(p => p.created_at >= sevenDaysAgo);
      const olderPulse = pulseCheckins.filter(p => p.created_at < sevenDaysAgo && p.created_at >= thirtyDaysAgo);
      const avgRecentPulse = recentPulse.length > 0
        ? recentPulse.reduce((sum, p) => sum + (p.pulse_score_1_5 || 3), 0) / recentPulse.length
        : 0;
      const avgOlderPulse = olderPulse.length > 0
        ? olderPulse.reduce((sum, p) => sum + (p.pulse_score_1_5 || 3), 0) / olderPulse.length
        : avgRecentPulse;
      const pulseChange = avgOlderPulse > 0 ? Math.round(((avgRecentPulse - avgOlderPulse) / avgOlderPulse) * 100) : 0;
      const pulseDisplay = recentPulse.length > 0 ? `${(avgRecentPulse * 20).toFixed(0)}%` : "—";

      // Health score from latest snapshot
      const latestSnapshot = snapshots[0];
      const healthScore = latestSnapshot?.total_score || 0;
      const previousSnapshot = snapshots[1];
      const healthChange = previousSnapshot ? healthScore - (previousSnapshot.total_score || 0) : 0;

      // Opportunities count
      const activeOpportunities = opportunities.filter(o => !o.is_converted).length;
      const convertedOpportunities = opportunities.filter(o => o.is_converted).length;

      // Brain engagement score (capped at 95)
      const brainSignals = brain?.total_signals || 0;
      const mvcCompletion = brain?.mvc_completion_pct || 0;
      const rawEngagement = Math.round((brainSignals / 100) * 35 + mvcCompletion * 0.55);
      const engagement = Math.min(95, Math.max(0, rawEngagement));
      setEngagementScore(engagement);

      // Parse brain factual memory for business-specific context
      const factual = (brain as any)?.factual_memory as Record<string, unknown> || {};
      const businessName = currentBusiness.name;
      const businessType = brain?.primary_business_type || String(currentBusiness.category || 'negocio');

      // ========== GENERATE KPIs ==========
      const generatedKpis: KPI[] = [
        {
          label: "Tasa de Ejecución",
          value: totalActions > 0 ? `${completionRate}%` : "—",
          change: completionRate > 50 ? Math.min(completionRate - 50, 30) : completionRate > 0 ? completionRate - 50 : 0,
          trend: completionRate > 50 ? "up" : completionRate > 0 ? "down" : "neutral",
          icon: Target,
          color: "primary"
        },
        {
          label: "Pulso del Negocio",
          value: pulseDisplay,
          change: pulseChange,
          trend: pulseChange > 5 ? "up" : pulseChange < -5 ? "down" : "neutral",
          icon: Flame,
          color: avgRecentPulse >= 3.5 ? "success" : avgRecentPulse >= 2.5 ? "accent" : "warning"
        },
        {
          label: "Salud General",
          value: healthScore > 0 ? `${healthScore}` : "—",
          change: healthChange,
          trend: healthChange > 0 ? "up" : healthChange < 0 ? "down" : "neutral",
          icon: ShieldCheck,
          color: healthScore >= 70 ? "success" : healthScore >= 50 ? "accent" : "warning"
        },
        {
          label: "Oportunidades",
          value: `${activeOpportunities}`,
          change: convertedOpportunities,
          trend: activeOpportunities > 0 ? "up" : "neutral",
          icon: Lightbulb,
          color: "primary"
        }
      ];
      setKpis(generatedKpis);

      // ========== GENERATE SMART INSIGHTS (personalized) ==========
      const generatedInsights: Insight[] = [];

      // 1. Mission overload
      if (activeActions > 5) {
        generatedInsights.push({
          id: "action-overload",
          type: "warning",
          title: `${activeActions} misiones activas en ${businessName}`,
          description: `Tener tantas tareas abiertas reduce la efectividad. Priorizá 2-3 misiones clave y completalas antes de sumar nuevas.`,
          impact: "high",
          actionable: true,
          actionRoute: "/app/missions",
          actionLabel: "Ver misiones"
        });
      } else if (activeActions === 0 && totalActions > 0) {
        generatedInsights.push({
          id: "no-active-actions",
          type: "opportunity",
          title: "Sin misiones activas",
          description: `Completaste todas tus tareas pendientes. Revisá el Radar para detectar nuevas oportunidades para ${businessName}.`,
          impact: "medium",
          actionable: true,
          actionRoute: "/app/radar",
          actionLabel: "Ir al Radar"
        });
      }

      // 2. Execution rate insight
      if (completionRate > 70 && completedActions >= 5) {
        generatedInsights.push({
          id: "execution-star",
          type: "achievement",
          title: "Ejecutor de alto rendimiento",
          description: `Tu tasa de ejecución del ${completionRate}% en ${businessName} está por encima del promedio. Seguí así.`,
          impact: "high",
          metric: `${completedActions} completadas`
        });
      } else if (completionRate < 30 && totalActions >= 3) {
        generatedInsights.push({
          id: "execution-low",
          type: "warning",
          title: "Ejecución por debajo del objetivo",
          description: `Solo completaste el ${completionRate}% de tus misiones. Enfocate en terminar las más importantes primero.`,
          impact: "high",
          actionable: true,
          actionRoute: "/app/missions",
          actionLabel: "Revisar misiones"
        });
      }

      // 3. Pulse-based insights (REAL revenue/traffic data)
      if (recentPulse.length >= 3) {
        const goodDays = recentPulse.filter(p => (p.pulse_score_1_5 || 0) >= 4).length;
        const badDays = recentPulse.filter(p => (p.pulse_score_1_5 || 0) <= 2).length;
        
        if (goodDays > recentPulse.length * 0.6) {
          generatedInsights.push({
            id: "pulse-strong",
            type: "achievement",
            title: "Semana fuerte para " + businessName,
            description: `${goodDays} de ${recentPulse.length} días recientes fueron buenos o excelentes. Identificá qué está funcionando y replicalo.`,
            impact: "high",
            change: pulseChange
          });
        } else if (badDays > recentPulse.length * 0.5) {
          generatedInsights.push({
            id: "pulse-weak",
            type: "warning",
            title: "Período débil detectado",
            description: `${badDays} de ${recentPulse.length} días recientes fueron flojos. Revisá si hay factores externos o internos afectando.`,
            impact: "high",
            change: pulseChange,
            actionable: true,
            actionRoute: "/app",
            actionLabel: "Analizar"
          });
        }

        // Revenue trend if available
        const recentWithRevenue = recentPulse.filter(p => p.revenue_local && p.revenue_local > 0);
        if (recentWithRevenue.length >= 3) {
          const avgRevenue = recentWithRevenue.reduce((sum, p) => sum + (p.revenue_local || 0), 0) / recentWithRevenue.length;
          const currency = recentWithRevenue[0]?.currency_local || currentBusiness.currency || 'ARS';
          generatedInsights.push({
            id: "revenue-avg",
            type: "trend",
            title: `Facturación promedio: ${currency} ${Math.round(avgRevenue).toLocaleString()}`,
            description: `Basado en ${recentWithRevenue.length} registros recientes de ${businessName}. Usá esta referencia para evaluar días buenos vs malos.`,
            impact: "medium",
            metric: `${recentWithRevenue.length} registros`
          });
        }
      } else if (pulseCheckins.length === 0) {
        generatedInsights.push({
          id: "no-pulse",
          type: "action",
          title: "Empezá a registrar tu pulso diario",
          description: `Hacé check-ins diarios de ${businessName} para desbloquear análisis de tendencias, predicciones y alertas personalizadas.`,
          impact: "high",
          actionable: true,
          actionRoute: "/app",
          actionLabel: "Hacer check-in"
        });
      }

      // 4. Opportunities insights
      if (activeOpportunities > 5) {
        const highImpact = opportunities.filter(o => !o.is_converted && (o.impact_score || 0) >= 7);
        generatedInsights.push({
          id: "opp-many",
          type: "opportunity",
          title: `${activeOpportunities} oportunidades sin explorar`,
          description: highImpact.length > 0
            ? `Tenés ${highImpact.length} de alto impacto. Convertí al menos una en misión esta semana.`
            : `Revisá tu Radar y priorizá las de mayor impacto para ${businessName}.`,
          impact: "medium",
          actionable: true,
          actionRoute: "/app/radar",
          actionLabel: "Ver Radar"
        });
      }

      // 5. Predictions insights (Pro feature)
      if (predictions.length > 0) {
        const breakpoints = predictions.filter(p => p.is_breakpoint);
        if (breakpoints.length > 0) {
          generatedInsights.push({
            id: "pred-breakpoint",
            type: "warning",
            title: `${breakpoints.length} punto${breakpoints.length > 1 ? 's' : ''} crítico${breakpoints.length > 1 ? 's' : ''} detectado${breakpoints.length > 1 ? 's' : ''}`,
            description: `El motor de predicciones identificó ${breakpoints.length > 1 ? 'situaciones' : 'una situación'} que requiere${breakpoints.length > 1 ? 'n' : ''} atención inmediata en ${businessName}.`,
            impact: "high",
            actionable: true,
            actionRoute: "/app/predictions",
            actionLabel: "Ver predicciones"
          });
        } else {
          const highConfidence = predictions.filter(p => p.probability >= 0.7);
          if (highConfidence.length > 0) {
            generatedInsights.push({
              id: "pred-high-conf",
              type: "trend",
              title: `${highConfidence.length} predicción${highConfidence.length > 1 ? 'es' : ''} de alta confianza`,
              description: `"${highConfidence[0].title}" tiene ${Math.round(highConfidence[0].probability * 100)}% de probabilidad. Revisá las acciones recomendadas.`,
              impact: "medium",
              actionable: true,
              actionRoute: "/app/predictions",
              actionLabel: "Explorar"
            });
          }
        }
      }

      // 6. Brain completeness insight
      if (mvcCompletion < 40) {
        const answeredCategories = Object.keys(factual).length;
        generatedInsights.push({
          id: "brain-incomplete",
          type: "opportunity",
          title: "Potenciá tu CEO virtual",
          description: `Tengo ${Math.round(mvcCompletion)}% de datos sobre ${businessName}. Mientras más info me des (${answeredCategories > 0 ? `ya respondiste ${answeredCategories} categorías` : 'empezá por el chat'}), mejores serán mis predicciones y recomendaciones.`,
          impact: "high",
          metric: `${Math.round(mvcCompletion)}% completado`,
          actionable: true,
          actionRoute: "/app/chat",
          actionLabel: "Ir al chat"
        });
      } else if (mvcCompletion >= 70) {
        generatedInsights.push({
          id: "brain-strong",
          type: "achievement",
          title: "Perfil de negocio robusto",
          description: `Conozco bien ${businessName} (${Math.round(mvcCompletion)}%). Tus recomendaciones y predicciones tienen máxima precisión.`,
          impact: "medium",
          metric: `${Math.round(mvcCompletion)}% completado`
        });
      }

      // 7. Health dimensions insight (from latest snapshot)
      if (latestSnapshot?.dimensions_json) {
        const dims = latestSnapshot.dimensions_json as Record<string, number>;
        const weakDims = Object.entries(dims)
          .filter(([_, score]) => typeof score === 'number' && score < 50)
          .sort(([, a], [, b]) => (a as number) - (b as number));
        
        if (weakDims.length > 0) {
          const weakestName = weakDims[0][0];
          const weakestScore = weakDims[0][1] as number;
          generatedInsights.push({
            id: "health-weak-dim",
            type: "warning",
            title: `${weakestName} necesita atención`,
            description: `Tu dimensión "${weakestName}" tiene un score de ${weakestScore}/100. Es el área más débil de ${businessName} y vale la pena trabajarla.`,
            impact: "high",
            metric: `${weakestScore}/100`,
            actionable: true,
            actionRoute: "/app/analytics",
            actionLabel: "Ver diagnóstico"
          });
        }
      }

      // 8. Consistency insight
      if (pulseCheckins.length > 0) {
        const daysWithCheckins = new Set(pulseCheckins.map(p => p.applies_to_date)).size;
        const daysSinceFirst = Math.ceil((now.getTime() - new Date(pulseCheckins[pulseCheckins.length - 1].created_at).getTime()) / (24 * 60 * 60 * 1000));
        const consistency = daysSinceFirst > 0 ? Math.round((daysWithCheckins / Math.min(daysSinceFirst, 30)) * 100) : 0;
        
        if (consistency > 70) {
          generatedInsights.push({
            id: "consistency-high",
            type: "achievement",
            title: "Consistencia ejemplar",
            description: `Registraste datos ${daysWithCheckins} de ${Math.min(daysSinceFirst, 30)} días. La constancia es clave para que el sistema aprenda de ${businessName}.`,
            impact: "medium",
            metric: `${consistency}% consistencia`
          });
        } else if (consistency < 30 && daysWithCheckins >= 2) {
          generatedInsights.push({
            id: "consistency-low",
            type: "action",
            title: "Más datos = mejores insights",
            description: `Solo registraste ${daysWithCheckins} días del último mes. Hacé check-ins más frecuentes para insights realmente precisos.`,
            impact: "medium",
            actionable: true,
            actionRoute: "/app",
            actionLabel: "Hacer check-in"
          });
        }
      }

      // Fallback
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          id: "getting-started",
          type: "opportunity",
          title: "Empezá a alimentar el sistema",
          description: `Hacé check-ins diarios de ${businessName}, completá misiones y usá el chat para desbloquear insights personalizados.`,
          impact: "high",
          actionable: true,
          actionRoute: "/app",
          actionLabel: "Ir al Dashboard"
        });
      }

      // Sort: high impact first, then warnings, then opportunities
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const typeOrder = { warning: 0, action: 1, opportunity: 2, trend: 3, achievement: 4 };
      generatedInsights.sort((a, b) => {
        const pDiff = priorityOrder[a.impact] - priorityOrder[b.impact];
        if (pDiff !== 0) return pDiff;
        return typeOrder[a.type] - typeOrder[b.type];
      });

      setInsights(generatedInsights.slice(0, 8));
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, brain]);

  useEffect(() => {
    if (currentBusiness && brain) {
      generateSmartInsights();
    }
  }, [currentBusiness, brain, generateSmartInsights]);

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity": return Lightbulb;
      case "warning": return AlertTriangle;
      case "achievement": return Star;
      case "trend": return TrendingUp;
      case "action": return Zap;
    }
  };

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity": return "text-primary bg-primary/10 border-primary/20";
      case "warning": return "text-warning bg-warning/10 border-warning/20";
      case "achievement": return "text-success bg-success/10 border-success/20";
      case "trend": return "text-accent bg-accent/10 border-accent/20";
      case "action": return "text-primary bg-primary/10 border-primary/20";
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
              <CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6"><div className="h-48 bg-muted rounded" /></CardContent>
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
                <p className="text-sm text-muted-foreground">Qué tan bien conozco {currentBusiness?.name}</p>
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
            {engagementScore < 25 && "Estoy aprendiendo sobre tu negocio. Seguí interactuando para mejorar mis recomendaciones."}
            {engagementScore >= 25 && engagementScore < 50 && "Tengo una base sólida. Las recomendaciones ya son útiles y van a seguir mejorando."}
            {engagementScore >= 50 && engagementScore < 75 && "Conozco bien tu negocio. Predicciones y análisis son confiables."}
            {engagementScore >= 75 && "Nivel experto alcanzado. Máxima precisión en recomendaciones y predicciones."}
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
                  {kpi.change !== 0 && (
                    <div className="flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : kpi.trend === "down" ? (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      ) : null}
                      {kpi.trend !== "neutral" && (
                        <span className={cn(
                          "text-xs font-medium",
                          kpi.trend === "up" && "text-success",
                          kpi.trend === "down" && "text-destructive",
                        )}>
                          {kpi.change > 0 ? "+" : ""}{kpi.change}%
                        </span>
                      )}
                    </div>
                  )}
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
                      insight.type === "trend" && "bg-accent/20",
                      insight.type === "action" && "bg-primary/20"
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
                            <Badge variant="outline" className="text-[10px]">{insight.metric}</Badge>
                          )}
                          {insight.change !== undefined && insight.change !== 0 && (
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 h-7 text-xs px-2"
                          onClick={() => insight.actionRoute && navigate(insight.actionRoute)}
                        >
                          {insight.actionLabel || "Ver acción"} <ChevronRight className="w-3 h-3 ml-1" />
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
