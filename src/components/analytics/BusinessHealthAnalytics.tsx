import { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown,
  Target, RefreshCw, MessageCircle, Sparkles,
  AlertTriangle, CheckCircle2, Info,
  Lightbulb, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreStyle } from '@/lib/dashboardCards';
import { supabase } from "@/integrations/supabase/client";
import { buildContextPack } from "@/lib/context-pack-builder";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { sanitizeAIOutput, sanitizeSignals, isLeakedLabel } from "@/lib/aiOutputSanitizer";
import {
import { invokeEdgeFunctionSafe } from '@/lib/edge-function-caller';
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

interface Snapshot {
  id: string;
  total_score: number;
  dimensions_json: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  top_actions: { text: string; priority: string }[];
  explanation_json?: Record<string, { reason: string; actions: string[] }>;
  created_at: string;
  source: string;
}

const DIMENSION_CONFIG: Record<string, { 
  label: string; icon: string; description: string; tips: string[];
  detailedDescription?: string; keyMetrics?: string[]; dataSource?: string[]; impactAreas?: string[];
}> = {
  reputation: { 
    label: "Reputación", icon: "⭐",
    description: "Reviews, ratings y percepción de marca",
    detailedDescription: "La reputación online es clave para atraer nuevos clientes. Se basa en calificaciones, cantidad de reseñas y sentimiento.",
    keyMetrics: ["Rating promedio", "Cantidad de reseñas", "Tasa de respuesta", "Sentimiento"],
    dataSource: ["Google Business", "Redes sociales"],
    impactAreas: ["Nuevos clientes", "Confianza", "Visibilidad"],
    tips: ["Responder reviews en menos de 24hs", "Solicitar feedback post-servicio", "Agradecer reseñas positivas"]
  },
  profitability: { 
    label: "Rentabilidad", icon: "💰",
    description: "Márgenes y rentabilidad por producto",
    detailedDescription: "Mide qué tan eficiente sos convirtiendo ventas en ganancia.",
    keyMetrics: ["Food cost %", "Margen bruto", "Mix de productos rentables"],
    dataSource: ["Menú con costos", "Ventas por producto"],
    impactAreas: ["Ganancia neta", "Precio óptimo"],
    tips: ["Revisar food cost mensualmente", "Optimizar recetas top", "Eliminar platos no rentables"]
  },
  finances: { 
    label: "Finanzas", icon: "📊",
    description: "Control de costos, flujo de caja y gestión",
    detailedDescription: "Evalúa la salud financiera general: control de costos fijos, flujo de caja y capacidad de inversión.",
    keyMetrics: ["Ingresos mensuales", "Costos fijos", "Punto de equilibrio"],
    dataSource: ["Ventas declaradas", "Costos operativos"],
    impactAreas: ["Estabilidad", "Capacidad de inversión"],
    tips: ["Mantener reserva de 3 meses", "Revisar costos fijos trimestralmente", "Diversificar ingresos"]
  },
  efficiency: { 
    label: "Eficiencia", icon: "⚙️",
    description: "Operación, tiempos y gestión de recursos",
    detailedDescription: "Mide qué tan bien usás tus recursos: tiempos, rotación y control de mermas.",
    keyMetrics: ["Tiempo de servicio", "Rotación", "% de merma"],
    dataSource: ["Check-ins operativos", "Control de inventario"],
    impactAreas: ["Costos operativos", "Experiencia del cliente"],
    tips: ["Estandarizar procesos", "Medir tiempos", "Implementar control de mermas"]
  },
  traffic: { 
    label: "Tráfico", icon: "👥",
    description: "Flujo de clientes, canales y horarios pico",
    detailedDescription: "Analiza el volumen y distribución de clientes por canal y horario.",
    keyMetrics: ["Clientes por día", "Mix de canales", "Ocupación por horario"],
    dataSource: ["POS/Ventas", "Delivery apps", "Reservas"],
    impactAreas: ["Ingresos totales", "Planificación de staff"],
    tips: ["Promociones en horas valle", "Diversificar canales", "Programa de fidelización"]
  },
  team: { 
    label: "Equipo", icon: "🤝",
    description: "Personal, productividad y gestión",
    detailedDescription: "Evalúa capacidad y eficiencia del equipo: productividad, capacitación y clima laboral.",
    keyMetrics: ["Ventas por empleado", "Rotación", "Satisfacción del equipo"],
    dataSource: ["Estructura declarada", "Staff por turno"],
    impactAreas: ["Calidad de servicio", "Costos laborales"],
    tips: ["Capacitación mensual", "Incentivos por desempeño", "Reuniones de feedback"]
  },
  growth: { 
    label: "Crecimiento", icon: "📈",
    description: "Oportunidades de expansión y desarrollo",
    detailedDescription: "Identifica potencial de crecimiento: tendencias, oportunidades y capacidad de escalar.",
    keyMetrics: ["Tendencia de ventas", "Participación de mercado", "Capacidad ociosa"],
    dataSource: ["Radar de mercado", "Análisis competitivo"],
    impactAreas: ["Expansión", "Ventaja competitiva"],
    tips: ["Monitorear competencia", "Evaluar nuevos productos", "Identificar nichos"]
  },
  // Legacy keys
  ventas: { label: "Ventas", icon: "💰", description: "Facturación y ticket promedio", tips: ["Optimizar ticket promedio"] },
  operaciones: { label: "Operación", icon: "⚙️", description: "Eficiencia operativa", tips: ["Reducir tiempos de espera"] },
  reputacion: { label: "Reputación", icon: "⭐", description: "Reviews y percepción", tips: ["Responder reviews"] },
  marketing: { label: "Marketing", icon: "📣", description: "Visibilidad y redes", tips: ["Publicar contenido regular"] },
  clientes: { label: "Clientes", icon: "👥", description: "Satisfacción y fidelización", tips: ["Programa de fidelidad"] },
  finanzas: { label: "Finanzas", icon: "📊", description: "Márgenes y costos", tips: ["Revisar food cost"] },
  equipo: { label: "Equipo", icon: "🤝", description: "Productividad del personal", tips: ["Capacitaciones regulares"] },
  servicio: { label: "Servicio", icon: "✨", description: "Calidad de atención", tips: ["Protocolos de atención"] },
};

const getTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} días`;
};

export const BusinessHealthAnalytics = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchSnapshots = async () => {
    if (!currentBusiness) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("snapshots").select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      setSnapshots((data || []) as unknown as Snapshot[]);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSnapshots(); }, [currentBusiness]);

  const generateDiagnostic = async () => {
    if (!currentBusiness) return;
    setGenerating(true);
    try {
      const [setupRes, brainRes, integrationsRes, signalsRes] = await Promise.all([
        supabase.from("business_setup_progress").select("*").eq("business_id", currentBusiness.id).maybeSingle(),
        supabase.from("business_brains").select("*").eq("business_id", currentBusiness.id).maybeSingle(),
        supabase.from("business_integrations").select("*").eq("business_id", currentBusiness.id),
        supabase.from("signals").select("*").eq("business_id", currentBusiness.id).order("created_at", { ascending: false }).limit(50),
      ]);
      const setupData = (setupRes.data?.setup_data || {}) as Record<string, unknown>;
      const gastroData = (setupData.gastroData as Record<string, unknown>) || {};
      const analysisSetupData = {
        businessName: currentBusiness.name, countryCode: currentBusiness.country,
        businessTypeId: currentBusiness.category, businessTypeLabel: setupData.businessTypeLabel,
        setupMode: setupData.mode || 'quick', answers: gastroData,
        googleAddress: currentBusiness.address,
        integrationsProfiled: { delivery: currentBusiness.delivery_platforms || [], reservations: currentBusiness.reservation_platforms || [] },
      };
      const googleData = currentBusiness.google_place_id ? {
        placeId: currentBusiness.google_place_id, rating: currentBusiness.avg_rating,
        reviewCount: (brainRes.data?.factual_memory as any)?.google_review_count,
      } : null;

      const cpHA = await buildContextPack('analytics', currentBusiness.id).catch(() => null);
      const { data, error } = await invokeEdgeFunctionSafe("analyze-health-score", {
        body: { businessId: currentBusiness.id, module: 'analytics', contextPack: cpHA, outputContract: 'health_score_v1', setupData: analysisSetupData, googleData, brainData: brainRes.data || null, integrationsData: integrationsRes.data || [], signalsData: signalsRes.data || [] }
      });
      if (error) throw error;
      toast({ title: "Diagnóstico actualizado", description: `Score: ${data.analysis?.totalScore || 0} | Certeza: ${data.analysis?.certaintyPct || 0}%` });
      fetchSnapshots();
    } catch (error) {
      console.error("Error generating diagnostic:", error);
      toast({ title: "Error", description: "No se pudo generar el diagnóstico.", variant: "destructive" });
    } finally { setGenerating(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-muted/20 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-muted/20 rounded-2xl animate-pulse" />
          <div className="h-24 bg-muted/20 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];

  if (!latestSnapshot) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border/50 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Target className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Diagnóstico de Salud</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Generá tu primer análisis detallado con explicaciones y recomendaciones personalizadas.
        </p>
        <Button onClick={generateDiagnostic} disabled={generating} className="gap-2">
          <Sparkles className={cn("w-4 h-4", generating && "animate-spin")} />
          {generating ? "Analizando..." : "Generar diagnóstico"}
        </Button>
      </div>
    );
  }

  const scoreStyle = getScoreStyle(latestSnapshot.total_score);
  const rawDimensions = latestSnapshot.dimensions_json || {};
  const previousDimensions = previousSnapshot?.dimensions_json || {};
  const explanations = latestSnapshot.explanation_json || {};
  
  const validDimensionKeys = Object.keys(DIMENSION_CONFIG);
  const dimensions = Object.entries(rawDimensions)
    .filter(([key, value]) => validDimensionKeys.includes(key) && typeof value === 'number')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value as number }), {} as Record<string, number>);
  
  const sortedDimensions = Object.entries(dimensions).sort(([, a], [, b]) => b - a);
  const displayDimensions = sortedDimensions.length > 0 
    ? sortedDimensions 
    : validDimensionKeys.slice(0, 6).map(key => [key, 0] as [string, number]);

  const radarData = displayDimensions.map(([key, value]) => ({
    dimension: DIMENSION_CONFIG[key]?.label || key,
    value: typeof value === 'number' ? value : 0,
    fullMark: 100,
  }));

  const trendData = snapshots.slice(0, 7).reverse().map(s => ({
    date: new Date(s.created_at).toLocaleDateString("es", { day: "numeric", month: "short" }),
    score: s.total_score,
  }));

  const diff = previousSnapshot ? latestSnapshot.total_score - previousSnapshot.total_score : 0;

  return (
    <div className="space-y-5">
      {/* Main Score Card */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Salud General</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Último análisis: {getTimeAgo(latestSnapshot.created_at)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={generateDiagnostic} disabled={generating} className="gap-1.5 text-xs rounded-xl h-8">
              <RefreshCw className={cn("w-3 h-3", generating && "animate-spin")} />
              Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score */}
            <div className="flex flex-col items-center justify-center">
              <div className={cn(
                "w-28 h-28 rounded-full flex flex-col items-center justify-center",
                "border-[3px] transition-all",
                scoreStyle.borderColor
              )}>
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-4xl font-bold tracking-tight', scoreStyle.textColor)}>
                    {latestSnapshot.total_score}
                  </span>
                  {previousSnapshot && diff !== 0 && (
                    <span>
                      {diff > 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                    </span>
                  )}
                </div>
                <span className={cn('text-[10px] font-medium', scoreStyle.textColor)}>
                  {scoreStyle.label}
                </span>
              </div>
              
              {previousSnapshot && diff !== 0 && (
                <p className={cn("text-xs font-medium mt-3", diff > 0 ? "text-success" : "text-destructive")}>
                  {diff > 0 ? '+' : ''}{diff} pts vs anterior
                </p>
              )}
            </div>

            {/* Radar */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                  <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {displayDimensions.map(([key, value]) => {
          const config = DIMENSION_CONFIG[key];
          if (!config) return null;
          const numericValue = typeof value === 'number' ? value : 0;
          const prevValue = previousDimensions[key];
          const explanation = explanations[key];
          const dimStyle = getScoreStyle(numericValue);
          const trend = typeof prevValue === 'number' 
            ? numericValue > prevValue ? "up" : numericValue < prevValue ? "down" : null
            : null;

          return (
            <div key={key} className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <Accordion type="single" collapsible>
                <AccordionItem value={key} className="border-none">
                  <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl">{config.icon}</span>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{config.label}</span>
                          {trend && (
                            trend === "up" ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-destructive" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{config.description}</p>
                      </div>
                      <div className="text-right mr-3">
                        <span className={cn("text-xl font-bold tabular-nums", dimStyle.textColor)}>
                          {numericValue}
                        </span>
                        <p className={cn("text-[10px] font-medium", dimStyle.textColor)}>{dimStyle.label}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Progreso</span>
                          <span>{numericValue}/100</span>
                        </div>
                        <Progress value={numericValue} className="h-1.5" />
                      </div>

                      {config.detailedDescription && (
                        <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-xl bg-muted/20">
                          {config.detailedDescription}
                        </p>
                      )}

                      {/* Key Metrics & Data Sources */}
                      {(config.keyMetrics || config.dataSource) && (
                        <div className="grid grid-cols-2 gap-2">
                          {config.keyMetrics && (
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Target className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[11px] font-medium text-foreground">Métricas clave</span>
                              </div>
                              <ul className="space-y-0.5">
                                {config.keyMetrics.map((m, i) => (
                                  <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-primary/50" />{m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {config.dataSource && (
                            <div className="p-3 rounded-xl bg-muted/20 border border-border/30">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-[11px] font-medium text-foreground">Fuentes</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {config.dataSource.map((s, i) => (
                                  <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Explanation */}
                      {explanation && typeof explanation === 'object' && 'reason' in explanation && typeof explanation.reason === 'string' && (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-[11px] font-medium text-foreground mb-1">Análisis IA</p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{sanitizeAIOutput(explanation.reason)}</p>
                              {explanation.actions && Array.isArray(explanation.actions) && explanation.actions.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {explanation.actions.map((action: string, i: number) => (
                                    <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                      <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />{sanitizeAIOutput(action)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {config.tips && config.tips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {config.tips.map((tip, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg border border-border/30">
                              {tip}
                            </span>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="ghost" size="sm"
                        className="w-full gap-2 text-xs text-primary hover:text-primary h-8"
                        onClick={() => {
                          const prompt = `Explicame en detalle por qué mi ${config.label} está en ${numericValue}% y qué puedo hacer para mejorarlo`;
                          navigate(`/app/chat?prompt=${encodeURIComponent(prompt)}`);
                        }}
                      >
                        <MessageCircle className="w-3 h-3" />
                        Preguntar sobre {config.label}
                        <ArrowRight className="w-3 h-3 ml-auto" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          );
        })}
      </div>

      {/* Evolution Chart */}
      {trendData.length > 1 && (
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Evolución</h3>
            <span className="text-[11px] text-muted-foreground">Tendencia de tu score</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h3 className="text-sm font-semibold text-foreground">Fortalezas</h3>
          </div>
          <div className="space-y-1.5">
            {(() => {
              const cleaned = sanitizeSignals(latestSnapshot.strengths || [])
                .map(s => String(s).replace(/\(Q_[A-Z_]+\d*\)/g, '').replace(/Q_[A-Z]{2,}_\d+/g, '').trim())
                .filter(s => s.length > 3 && !isLeakedLabel(s));
              if (cleaned.length === 0) {
                return <p className="text-xs text-muted-foreground">Aún no identificadas</p>;
              }
              return cleaned.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-success/5 border border-success/10">
                  <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-foreground leading-relaxed">{s}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Áreas de mejora</h3>
          </div>
          <div className="space-y-1.5">
            {(() => {
              const cleaned = sanitizeSignals(latestSnapshot.weaknesses || [])
                .map(w => String(w).replace(/\(Q_[A-Z_]+\d*\)/g, '').replace(/Q_[A-Z]{2,}_\d+/g, '').trim())
                .filter(w => w.length > 3 && !isLeakedLabel(w));
              if (cleaned.length === 0) {
                return <p className="text-xs text-muted-foreground">No identificadas</p>;
              }
              return cleaned.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-warning/5 border border-warning/10">
                  <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-foreground leading-relaxed">{w}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">¿Querés profundizar?</h3>
            <p className="text-xs text-muted-foreground">Preguntale al asistente para recomendaciones personalizadas</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/app/chat")} className="gap-1.5 text-xs rounded-xl flex-shrink-0">
            Consultar <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
