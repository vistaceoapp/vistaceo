import { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, TrendingDown, Minus, Star, MessageSquare,
  ThumbsUp, ThumbsDown, AlertTriangle, Sparkles, RefreshCw,
  Loader2, Zap, Target, BarChart3, PieChart, Brain, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { GoogleReviewsCard } from "./GoogleReviewsCard";
import { GooglePlacesInlineEditor } from "./GooglePlacesInlineEditor";

interface ReputationAnalysis {
  overall_score: number;
  sentiment_breakdown: { positive: number; neutral: number; negative: number };
  star_distribution: Record<string, number>;
  top_positive_words: Array<{ word: string; count: number; sentiment: number }>;
  top_negative_words: Array<{ word: string; count: number; sentiment: number }>;
  key_themes: Array<{ theme: string; sentiment: "positive" | "negative" | "neutral"; frequency: number }>;
  urgent_issues: string[];
  highlights: string[];
  response_rate: number;
  trend: "improving" | "stable" | "declining";
  ai_summary: string;
  recommendations: string[];
  analyzed_reviews_count: number;
  last_analysis: string;
  source?: "google_reviews" | "brain_based" | "mixed";
}

interface PlatformIntegration {
  platform: "google";
  connected: boolean;
  status?: string;
  metadata?: Record<string, any>;
  lastSync?: string;
  reviewCount?: number;
  avgRating?: number;
}

interface ReputationAnalyticsPanelProps {
  className?: string;
}

export const ReputationAnalyticsPanel = ({ className }: ReputationAnalyticsPanelProps) => {
  const { currentBusiness } = useBusiness();
  const [analysis, setAnalysis] = useState<ReputationAnalysis | null>(null);
  const [platforms, setPlatforms] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    if (!currentBusiness) return;
    try {
      const { data: integrations } = await supabase
        .from("business_integrations")
        .select("integration_type, status, metadata, last_sync_at")
        .eq("business_id", currentBusiness.id);
      
      const { data: reviews } = await supabase
        .from("external_data")
        .select("content")
        .eq("business_id", currentBusiness.id)
        .in("data_type", ["review", "google_review", "google_places_review"]);
      
      let reviewCount = 0, avgRating = 0;
      if (reviews?.length) {
        reviewCount = reviews.length;
        const total = reviews.reduce((s, r) => s + (Number((r.content as any)?.rating) || 0), 0);
        avgRating = Math.round((total / reviewCount) * 10) / 10;
      }
      
      const hasGoogle = !!currentBusiness.google_place_id;
      const platform: PlatformIntegration = { 
        platform: "google", connected: hasGoogle,
        status: hasGoogle ? "connected" : undefined,
        avgRating: currentBusiness.avg_rating || 0,
      };

      if (integrations) {
        for (const int of integrations) {
          if (["google_business", "google_reviews", "google_places"].includes(int.integration_type)) {
            platform.connected = hasGoogle || int.status === "active";
            platform.status = hasGoogle ? "connected" : int.status;
            platform.metadata = int.metadata as any;
            platform.lastSync = int.last_sync_at;
            platform.reviewCount = reviewCount;
            platform.avgRating = avgRating || (int.metadata as any)?.rating || currentBusiness.avg_rating || 0;
          }
        }
      }
      setPlatforms([platform]);
    } catch (e) { console.error("Error fetching platforms:", e); }
  }, [currentBusiness]);

  const fetchAnalysis = useCallback(async () => {
    if (!currentBusiness) { setLoading(false); return; }
    try {
      const { data: brain } = await supabase
        .from("business_brains")
        .select("dynamic_memory")
        .eq("business_id", currentBusiness.id)
        .maybeSingle();

      const cached = (brain?.dynamic_memory as any)?.reputation_analysis as ReputationAnalysis | null;
      if (cached) setAnalysis(cached);
    } catch (e) { console.error("Error fetching analysis:", e); }
    finally { setLoading(false); }
  }, [currentBusiness]);

  useEffect(() => { fetchAnalysis(); fetchPlatforms(); }, [fetchAnalysis, fetchPlatforms]);

  const runAnalysis = async () => {
    if (!currentBusiness || analyzing) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-reputation", {
        body: { businessId: currentBusiness.id, forceRefresh: true }
      });
      if (error) throw error;
      if (data?.analysis) {
        setAnalysis(data.analysis);
        fetchPlatforms();
        toast({ title: "✨ Análisis completado", description: `Score: ${data.analysis.overall_score}/100` });
      }
    } catch (e) {
      console.error("Error:", e);
      toast({ title: "Error", description: "No se pudo completar el análisis", variant: "destructive" });
    } finally { setAnalyzing(false); }
  };

  const getScoreColor = (s: number) => s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-destructive";
  const getScoreLabel = (s: number) => s >= 90 ? "Excelente" : s >= 80 ? "Muy bueno" : s >= 70 ? "Bueno" : s >= 60 ? "Regular" : s >= 40 ? "Mejorable" : "Crítico";
  const getTrendIcon = (t: string) => t === "improving" ? <TrendingUp className="w-4 h-4 text-success" /> : t === "declining" ? <TrendingDown className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4 text-muted-foreground" />;
  const getTrendLabel = (t: string) => t === "improving" ? "Mejorando" : t === "declining" ? "Declinando" : "Estable";
  const formatTimeAgo = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1) return "Hace minutos";
    if (h < 24) return `Hace ${h}h`;
    const days = Math.floor(h / 24);
    return days === 1 ? "Ayer" : `Hace ${days} días`;
  };

  if (loading) return <Card className={cn("animate-pulse", className)}><CardContent className="p-6"><div className="h-48 bg-muted rounded-xl" /></CardContent></Card>;

  const hasGooglePlace = !!currentBusiness?.google_place_id;
  const googlePlatform = platforms[0];

  // ─── NO ANALYSIS YET ───
  if (!analysis) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Google connection editor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Reputación Online
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {hasGooglePlace ? "Google Maps vinculado · Análisis automático cada 24h" : "Conectá Google Maps o ejecutá análisis basado en Brain"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <GooglePlacesInlineEditor onPlaceChanged={() => { fetchPlatforms(); fetchAnalysis(); }} />

            {hasGooglePlace && googlePlatform && (
              <GoogleReviewsCard
                key="google"
                connected={googlePlatform.connected}
                metadata={googlePlatform.metadata}
                reviewCount={googlePlatform.reviewCount || 0}
                avgRating={googlePlatform.avgRating || 0}
                responseRate={0}
                lastSync={googlePlatform.lastSync}
                onSyncComplete={fetchPlatforms}
                businessId={currentBusiness?.id || ""}
              />
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Análisis de Reputación IA</h3>
            <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto">
              {hasGooglePlace 
                ? "Analizá todas tus reseñas con IA para descubrir patrones, palabras clave y oportunidades."
                : "Generá un análisis de reputación basado en la información de tu Brain. Para mayor precisión, vinculá Google Maps."}
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              {hasGooglePlace ? "Se ejecuta automáticamente 1 vez al día." : "El Brain usa la información de tu negocio para generar insights."}
            </p>
            <Button onClick={runAnalysis} disabled={analyzing} className="gradient-primary">
              {analyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analizando...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />{hasGooglePlace ? "Ejecutar análisis" : "Análisis con Brain"}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── ANALYSIS EXISTS ───
  const starLabels: Record<string, string> = { "FIVE": "5★", "FOUR": "4★", "THREE": "3★", "TWO": "2★", "ONE": "1★" };
  const totalStars = Object.values(analysis.star_distribution).reduce((a, b) => a + b, 0) || 1;
  const isBrainBased = analysis.source === "brain_based";
  const hasStarData = totalStars > 1 || Object.values(analysis.star_distribution).some(v => v > 0);

  return (
    <Tabs defaultValue="general" className={cn("space-y-6", className)}>
      <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
        <TabsTrigger value="general" className="gap-2"><Globe className="w-4 h-4" />Vista General</TabsTrigger>
        <TabsTrigger value="plataformas" className="gap-2"><BarChart3 className="w-4 h-4" />Por Plataforma</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        {/* Google editor always visible */}
        <GooglePlacesInlineEditor onPlaceChanged={() => { fetchPlatforms(); fetchAnalysis(); }} />

        {/* Source badge */}
        {isBrainBased && (
          <Card className="p-3 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Análisis basado en Brain</span>
              <span className="text-xs text-muted-foreground">· Vinculá Google Maps para análisis con reseñas reales</span>
            </div>
          </Card>
        )}

        {/* Score Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(analysis.overall_score / 100) * 251.2} 251.2`}
                      className={getScoreColor(analysis.overall_score)} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-2xl font-bold", getScoreColor(analysis.overall_score))}>{analysis.overall_score}</span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground">Score de Reputación</h3>
                    <Badge variant="outline" className={cn("text-xs", getScoreColor(analysis.overall_score))}>{getScoreLabel(analysis.overall_score)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getTrendIcon(analysis.trend)}
                    <span>{getTrendLabel(analysis.trend)}</span>
                    {analysis.analyzed_reviews_count > 0 && <><span>•</span><span>{analysis.analyzed_reviews_count} reseñas analizadas</span></>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Último análisis: {formatTimeAgo(analysis.last_analysis)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>

            {/* AI Summary */}
            <div className="mt-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{analysis.ai_summary}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Metrics Grid - only show with review data */}
        {(analysis.analyzed_reviews_count > 0 || !isBrainBased) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3"><ThumbsUp className="w-4 h-4 text-success" /><span className="text-xs font-medium text-muted-foreground">Positivas</span></div>
              <div className="text-2xl font-bold text-success">{analysis.sentiment_breakdown.positive}%</div>
              <Progress value={analysis.sentiment_breakdown.positive} className="h-1.5 mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3"><ThumbsDown className="w-4 h-4 text-destructive" /><span className="text-xs font-medium text-muted-foreground">Negativas</span></div>
              <div className="text-2xl font-bold text-destructive">{analysis.sentiment_breakdown.negative}%</div>
              <Progress value={analysis.sentiment_breakdown.negative} className="h-1.5 mt-2 [&>div]:bg-destructive" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Tasa respuesta</span></div>
              <div className="text-2xl font-bold text-primary">{analysis.response_rate}%</div>
              <Progress value={analysis.response_rate} className="h-1.5 mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-warning" /><span className="text-xs font-medium text-muted-foreground">5 estrellas</span></div>
              <div className="text-2xl font-bold text-warning">{hasStarData ? Math.round((analysis.star_distribution["FIVE"] || 0) / totalStars * 100) : 0}%</div>
              <Progress value={hasStarData ? (analysis.star_distribution["FIVE"] || 0) / totalStars * 100 : 0} className="h-1.5 mt-2 [&>div]:bg-warning" />
            </Card>
          </div>
        )}

        {/* Star Distribution - only with review data */}
        {hasStarData && analysis.analyzed_reviews_count > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Distribución de estrellas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["FIVE", "FOUR", "THREE", "TWO", "ONE"].map((star) => {
                  const count = analysis.star_distribution[star] || 0;
                  const pct = (count / totalStars) * 100;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground w-8">{starLabels[star]}</span>
                      <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500",
                          star === "FIVE" && "bg-success", star === "FOUR" && "bg-success/70",
                          star === "THREE" && "bg-warning", star === "TWO" && "bg-warning/70",
                          star === "ONE" && "bg-destructive")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Positive/Negative Words */}
        <div className="grid md:grid-cols-2 gap-6">
          {analysis.top_positive_words.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-success" />Palabras positivas más usadas</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.top_positive_words.slice(0, 10).map((w, i) => (
                    <Badge key={i} variant="outline" className="bg-success/10 text-success border-success/30 text-sm py-1 px-3">
                      {w.word}<span className="ml-1.5 text-xs opacity-70">×{w.count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {analysis.top_negative_words.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ThumbsDown className="w-4 h-4 text-destructive" />Palabras negativas a monitorear</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.top_negative_words.slice(0, 10).map((w, i) => (
                    <Badge key={i} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-sm py-1 px-3">
                      {w.word}<span className="ml-1.5 text-xs opacity-70">×{w.count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Themes */}
        {analysis.key_themes.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><PieChart className="w-4 h-4 text-accent" />Temas principales</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.key_themes.map((t, i) => (
                  <div key={i} className={cn("p-3 rounded-xl border flex items-center gap-3",
                    t.sentiment === "positive" && "bg-success/5 border-success/20",
                    t.sentiment === "negative" && "bg-destructive/5 border-destructive/20",
                    t.sentiment === "neutral" && "bg-secondary border-border")}>
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                      t.sentiment === "positive" && "bg-success",
                      t.sentiment === "negative" && "bg-destructive",
                      t.sentiment === "neutral" && "bg-muted-foreground")} />
                    <span className="text-sm font-medium text-foreground flex-1">{t.theme}</span>
                    <span className="text-xs text-muted-foreground">{t.frequency}×</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Highlights & Issues */}
        <div className="grid md:grid-cols-2 gap-6">
          {analysis.highlights.length > 0 && (
            <Card className="bg-success/5 border-success/20">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-success"><Zap className="w-4 h-4" />Tus puntos fuertes</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.highlights.map((h, i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground"><span className="text-success mt-1">✓</span><span>{h}</span></li>)}
                </ul>
              </CardContent>
            </Card>
          )}
          {analysis.urgent_issues.length > 0 && (
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="w-4 h-4" />Problemas a resolver</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.urgent_issues.map((u, i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground"><span className="text-destructive mt-1">!</span><span>{u}</span></li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Recomendaciones IA</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Tab: Por Plataforma */}
      <TabsContent value="plataformas" className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4 text-primary" />Google Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GooglePlacesInlineEditor onPlaceChanged={() => { fetchPlatforms(); fetchAnalysis(); }} />
            {googlePlatform && (
              <GoogleReviewsCard
                key="google"
                connected={googlePlatform.connected}
                metadata={googlePlatform.metadata}
                reviewCount={googlePlatform.reviewCount || 0}
                avgRating={googlePlatform.avgRating || 0}
                responseRate={analysis?.response_rate || 0}
                lastSync={googlePlatform.lastSync}
                onSyncComplete={fetchPlatforms}
                businessId={currentBusiness?.id || ""}
              />
            )}
          </CardContent>
        </Card>

        {!hasGooglePlace && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Sin Google Maps vinculado</h3>
              <p className="text-sm text-muted-foreground">
                Vinculá tu negocio en Google Maps para ver reseñas y análisis detallado
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ReputationAnalyticsPanel;
