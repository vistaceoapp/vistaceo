import { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  RefreshCw,
  MessageCircle,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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

// Map backend dimension keys to Spanish UI labels
const DIMENSION_CONFIG: Record<string, { 
  label: string; 
  icon: string; 
  description: string;
  tips: string[];
}> = {
  // Backend keys from analyze-health-score
  reputation: { 
    label: "Reputación", 
    icon: "⭐",
    description: "Reviews, ratings y percepción de marca online",
    tips: ["Responder reviews", "Solicitar feedback", "Mejorar presencia online"]
  },
  profitability: { 
    label: "Rentabilidad", 
    icon: "💰",
    description: "Márgenes, food cost y rentabilidad por producto",
    tips: ["Revisar food cost", "Optimizar pricing", "Ingeniería de menú"]
  },
  finances: { 
    label: "Finanzas", 
    icon: "📊",
    description: "Control de costos, flujo de caja y gestión financiera",
    tips: ["Control de gastos", "Negociar proveedores", "Proyección de ventas"]
  },
  efficiency: { 
    label: "Eficiencia", 
    icon: "⚙️",
    description: "Operación, tiempos de servicio y gestión de recursos",
    tips: ["Reducir tiempos", "Optimizar procesos", "Control de mermas"]
  },
  traffic: { 
    label: "Tráfico", 
    icon: "👥",
    description: "Flujo de clientes, canales y horarios pico",
    tips: ["Diversificar canales", "Promociones en horas valle", "Fidelización"]
  },
  team: { 
    label: "Equipo", 
    icon: "🤝",
    description: "Personal, productividad y gestión del equipo",
    tips: ["Capacitaciones", "Incentivos", "Mejora clima laboral"]
  },
  growth: { 
    label: "Crecimiento", 
    icon: "📈",
    description: "Oportunidades de expansión y desarrollo",
    tips: ["Nuevos productos", "Expansión geográfica", "Alianzas"]
  },
  // Legacy Spanish keys for backwards compatibility
  ventas: { 
    label: "Ventas", 
    icon: "💰",
    description: "Facturación, ticket promedio y frecuencia de compra",
    tips: ["Optimizar ticket promedio", "Aumentar frecuencia de visita", "Mejorar conversión"]
  },
  operaciones: { 
    label: "Operación", 
    icon: "⚙️",
    description: "Eficiencia operativa, tiempos de servicio y gestión de stock",
    tips: ["Reducir tiempos de espera", "Optimizar turnos", "Control de mermas"]
  },
  reputacion: { 
    label: "Reputación", 
    icon: "⭐",
    description: "Reviews, ratings y percepción de marca online",
    tips: ["Responder reviews", "Solicitar feedback", "Mejorar presencia online"]
  },
  marketing: { 
    label: "Marketing", 
    icon: "📣",
    description: "Visibilidad, redes sociales y campañas promocionales",
    tips: ["Publicar contenido regular", "Promociones segmentadas", "Colaboraciones locales"]
  },
  clientes: { 
    label: "Clientes", 
    icon: "👥",
    description: "Satisfacción, fidelización y segmentación",
    tips: ["Programa de fidelidad", "Personalizar experiencia", "Encuestas de satisfacción"]
  },
  finanzas: { 
    label: "Finanzas", 
    icon: "📊",
    description: "Márgenes, costos y rentabilidad general",
    tips: ["Revisar food cost", "Negociar proveedores", "Optimizar pricing"]
  },
  equipo: { 
    label: "Equipo", 
    icon: "🤝",
    description: "Productividad, rotación y capacitación del personal",
    tips: ["Capacitaciones regulares", "Incentivos por desempeño", "Mejora clima laboral"]
  },
  servicio: { 
    label: "Servicio", 
    icon: "✨",
    description: "Calidad de atención y experiencia del cliente",
    tips: ["Protocolos de atención", "Mystery shopper", "Feedback continuo"]
  },
};

const getScoreInfo = (score: number) => {
  if (score < 40) return { 
    label: "Crítico", 
    color: "text-destructive", 
    bgColor: "bg-destructive/10",
    description: "Requiere atención urgente"
  };
  if (score < 60) return { 
    label: "En riesgo", 
    color: "text-amber-500", 
    bgColor: "bg-amber-500/10",
    description: "Hay oportunidades de mejora importantes"
  };
  if (score < 75) return { 
    label: "Mejorable", 
    color: "text-primary", 
    bgColor: "bg-primary/10",
    description: "Buen progreso, sigue mejorando"
  };
  if (score < 90) return { 
    label: "Bien", 
    color: "text-success", 
    bgColor: "bg-success/10",
    description: "Tu negocio está funcionando muy bien"
  };
  return { 
    label: "Excelente", 
    color: "text-success", 
    bgColor: "bg-success/10",
    description: "¡Felicitaciones! Rendimiento excepcional"
  };
};

const getTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("snapshots")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSnapshots((data || []) as unknown as Snapshot[]);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [currentBusiness]);

  const generateDiagnostic = async () => {
    if (!currentBusiness) return;
    setGenerating(true);

    try {
      // Fetch setup data and brain for real analysis
      const [setupRes, brainRes, integrationsRes] = await Promise.all([
        supabase
          .from("business_setup_progress")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .single(),
        supabase
          .from("business_brains")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .single(),
        supabase
          .from("business_integrations")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .eq("status", "active"),
      ]);

      const setupData = (setupRes.data?.setup_data || {}) as Record<string, unknown>;
      const brain = brainRes.data;
      
      // Build comprehensive setup data for analysis
      const analysisData = {
        businessName: currentBusiness.name,
        countryCode: currentBusiness.country,
        businessTypeId: currentBusiness.category,
        setupMode: setupRes.data?.current_step === 'complete' ? 'complete' : 'quick',
        answers: (setupData.answers as Record<string, unknown>) || {},
        googleAddress: currentBusiness.address,
        integrationsProfiled: {
          delivery: currentBusiness.delivery_platforms || [],
          reservations: currentBusiness.reservation_platforms || [],
        },
      };

      // Get Google data if available
      const googleData = currentBusiness.google_place_id ? {
        placeId: currentBusiness.google_place_id,
        rating: currentBusiness.avg_rating,
        reviewCount: (brain?.factual_memory as any)?.google_review_count,
      } : null;

      // Call the real health score analysis function
      const { data, error } = await supabase.functions.invoke("analyze-health-score", {
        body: { 
          businessId: currentBusiness.id,
          setupData: analysisData,
          googleData,
        }
      });

      if (error) throw error;

      toast({
        title: "Diagnóstico actualizado",
        description: "Se generó un nuevo análisis basado en los datos reales de tu negocio",
      });

      fetchSnapshots();
    } catch (error) {
      console.error("Error generating diagnostic:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el diagnóstico. Intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAskAboutDimension = (dimension: string, score: number) => {
    const config = DIMENSION_CONFIG[dimension];
    const prompt = `Explicame en detalle por qué mi ${config?.label || dimension} está en ${score}% y qué puedo hacer para mejorarlo`;
    navigate(`/app/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-6 animate-pulse">
          <div className="h-48 bg-muted/30 rounded-xl" />
        </GlassCard>
      </div>
    );
  }

  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];

  if (!latestSnapshot) {
    return (
      <GlassCard className="p-8 border-dashed border-2 border-primary/20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Análisis de Salud del Negocio
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Generá tu primer diagnóstico para obtener un análisis detallado de cada área de tu negocio con explicaciones y recomendaciones personalizadas.
          </p>
          <Button onClick={generateDiagnostic} disabled={generating} size="lg" className="gradient-primary">
            <Sparkles className={cn("w-5 h-5 mr-2", generating && "animate-spin")} />
            {generating ? "Analizando..." : "Generar diagnóstico completo"}
          </Button>
        </div>
      </GlassCard>
    );
  }

  const scoreInfo = getScoreInfo(latestSnapshot.total_score);
  const rawDimensions = latestSnapshot.dimensions_json || {};
  const previousDimensions = previousSnapshot?.dimensions_json || {};
  const explanations = latestSnapshot.explanation_json || {};
  
  // Filter only valid dimensions that are in DIMENSION_CONFIG and have numeric values
  const validDimensionKeys = Object.keys(DIMENSION_CONFIG);
  const dimensions = Object.entries(rawDimensions)
    .filter(([key, value]) => validDimensionKeys.includes(key) && typeof value === 'number')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value as number }), {} as Record<string, number>);
  
  const sortedDimensions = Object.entries(dimensions).sort(([, a], [, b]) => b - a);

  // If no valid dimensions, show default ones with 0 values
  const displayDimensions = sortedDimensions.length > 0 
    ? sortedDimensions 
    : validDimensionKeys.slice(0, 6).map(key => [key, 0] as [string, number]);

  // Prepare radar chart data
  const radarData = displayDimensions.map(([key, value]) => ({
    dimension: DIMENSION_CONFIG[key]?.label || key,
    value: typeof value === 'number' ? value : 0,
    fullMark: 100,
  }));

  // Trend data for evolution chart
  const trendData = snapshots.slice(0, 7).reverse().map(s => ({
    date: new Date(s.created_at).toLocaleDateString("es", { day: "numeric", month: "short" }),
    score: s.total_score,
  }));

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <GlassCard className="p-0 overflow-hidden">
        <div className={cn("h-2", scoreInfo.bgColor.replace("/10", ""))} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">Salud General del Negocio</h2>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {getTimeAgo(latestSnapshot.created_at)}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateDiagnostic}
              disabled={generating}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", generating && "animate-spin")} />
              Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/20 border border-border">
              <div className={cn(
                "text-7xl font-bold mb-2",
                scoreInfo.color
              )}>
                {latestSnapshot.total_score}
              </div>
              <Badge className={cn("text-sm", scoreInfo.bgColor, scoreInfo.color)}>
                {scoreInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                {scoreInfo.description}
              </p>
              
              {/* Trend indicator */}
              {previousSnapshot && (
                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-background/50">
                  {latestSnapshot.total_score > previousSnapshot.total_score ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm text-success font-medium">
                        +{latestSnapshot.total_score - previousSnapshot.total_score} pts
                      </span>
                    </>
                  ) : latestSnapshot.total_score < previousSnapshot.total_score ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive font-medium">
                        {latestSnapshot.total_score - previousSnapshot.total_score} pts
                      </span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Sin cambios</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">vs anterior</span>
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Dimension Details with Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayDimensions.map(([key, value]) => {
          const config = DIMENSION_CONFIG[key];
          if (!config) return null; // Skip unknown dimensions
          
          const numericValue = typeof value === 'number' ? value : 0;
          const prevValue = previousDimensions[key];
          const explanation = explanations[key];
          const dimScoreInfo = getScoreInfo(numericValue);
          const trend = typeof prevValue === 'number' 
            ? numericValue > prevValue ? "up" : numericValue < prevValue ? "down" : "stable"
            : null;

          return (
            <GlassCard key={key} className="p-0 overflow-hidden">
              <div className={cn("h-1", dimScoreInfo.bgColor.replace("/10", ""))} />
              <Accordion type="single" collapsible>
                <AccordionItem value={key} className="border-none">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl">
                        {config?.icon || "📊"}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{config?.label || key}</span>
                          {trend && (
                            <span className="flex items-center">
                              {trend === "up" && <TrendingUp className="w-3 h-3 text-success" />}
                              {trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{config?.description}</p>
                      </div>
                      <div className="text-right mr-4">
                        <div className={cn("text-2xl font-bold", dimScoreInfo.color)}>
                          {numericValue}
                        </div>
                        <Badge variant="outline" className={cn("text-[10px]", dimScoreInfo.color)}>
                          {dimScoreInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="space-y-4">
                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progreso</span>
                          <span>{numericValue}/100</span>
                        </div>
                        <Progress value={numericValue} className="h-2" />
                      </div>

                      {/* Explanation */}
                      {explanation && typeof explanation === 'object' && 'reason' in explanation && typeof explanation.reason === 'string' && (
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lightbulb className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">¿Por qué está así?</p>
                              <p className="text-sm text-muted-foreground">{explanation.reason}</p>
                              {explanation.actions && Array.isArray(explanation.actions) && explanation.actions.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-foreground mb-2">Acciones sugeridas:</p>
                                  <ul className="space-y-1">
                                    {explanation.actions.map((action: string, i: number) => (
                                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-success" />
                                        {action}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {config?.tips && (
                        <div className="grid grid-cols-3 gap-2">
                          {config.tips.map((tip, i) => (
                            <div key={i} className="p-2 rounded-lg bg-muted/50 text-center">
                              <span className="text-[10px] text-muted-foreground">{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ask AI Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-primary"
                        onClick={() => handleAskAboutDimension(key, numericValue)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Preguntarle al asistente sobre esto
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </GlassCard>
          );
        })}
      </div>

      {/* Evolution Chart */}
      {trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolución de Salud
            </CardTitle>
            <CardDescription>Tendencia de tu score en el tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <h3 className="font-semibold text-foreground">Fortalezas</h3>
          </div>
          <div className="space-y-2">
            {(latestSnapshot.strengths || []).map((strength, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{strength}</span>
              </div>
            ))}
            {(!latestSnapshot.strengths || latestSnapshot.strengths.length === 0) && (
              <p className="text-sm text-muted-foreground">Aún no hay fortalezas identificadas</p>
            )}
          </div>
        </GlassCard>

        {/* Weaknesses */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground">Áreas de mejora</h3>
          </div>
          <div className="space-y-2">
            {(latestSnapshot.weaknesses || []).map((weakness, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{weakness}</span>
              </div>
            ))}
            {(!latestSnapshot.weaknesses || latestSnapshot.weaknesses.length === 0) && (
              <p className="text-sm text-muted-foreground">No hay áreas de mejora identificadas</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* CTA to Chat */}
      <GlassCard className="p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <MessageCircle className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">¿Querés profundizar en algún área?</h3>
            <p className="text-sm text-muted-foreground">
              Preguntale al asistente para obtener recomendaciones personalizadas
            </p>
          </div>
          <Button 
            onClick={() => navigate("/app/chat")}
            className="gradient-primary"
          >
            Consultar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
