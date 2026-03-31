import { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, TrendingDown, Star, MessageSquare,
  ThumbsUp, ThumbsDown, AlertTriangle, Sparkles, RefreshCw,
  Loader2, Zap, Target, BarChart3, Brain, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { GooglePlacesInlineEditor } from "./GooglePlacesInlineEditor";
import { useNavigate } from "react-router-dom";

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

export const ReputationAnalyticsPanel = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [analysis, setAnalysis] = useState<ReputationAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

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

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

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
        toast({ title: "Análisis completado", description: `Score: ${data.analysis.overall_score}/100` });
      }
    } catch (e) {
      console.error("Error:", e);
      toast({ title: "Error", description: "No se pudo completar el análisis", variant: "destructive" });
    } finally { setAnalyzing(false); }
  };

  const getScoreColor = (s: number) => s >= 96 ? "text-health-excellent" : s >= 85 ? "text-health-veryGood" : s >= 70 ? "text-health-good" : s >= 50 ? "text-health-regular" : s >= 30 ? "text-health-critical" : "text-health-veryCritical";
  const getScoreLabel = (s: number) => s >= 96 ? "Excelente" : s >= 85 ? "Muy bueno" : s >= 70 ? "Bueno" : s >= 50 ? "Regular" : s >= 30 ? "Crítico" : "Muy crítico";
  const getTrendIcon = (t: string) => t === "improving" ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : t === "declining" ? <TrendingDown className="w-3.5 h-3.5 text-destructive" /> : null;
  const getTrendLabel = (t: string) => t === "improving" ? "Mejorando" : t === "declining" ? "Declinando" : "Estable";
  const formatTimeAgo = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1) return "Hace minutos";
    if (h < 24) return `Hace ${h}h`;
    const days = Math.floor(h / 24);
    return days === 1 ? "Ayer" : `Hace ${days} días`;
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-48 bg-muted/20 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-3"><div className="h-24 bg-muted/20 rounded-2xl animate-pulse" /><div className="h-24 bg-muted/20 rounded-2xl animate-pulse" /></div>
    </div>
  );

  const hasGooglePlace = !!currentBusiness?.google_place_id;
  const isBrainBased = analysis?.source === "brain_based";

  // No analysis yet
  if (!analysis) {
    return (
      <div className={cn("space-y-5", className)}>
        {/* Google connection */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Google Maps</h3>
              <p className="text-[11px] text-muted-foreground">
                {hasGooglePlace ? "Vinculado · Análisis automático cada 24h" : "Vinculá tu negocio para análisis de reseñas reales"}
              </p>
            </div>
          </div>
          <GooglePlacesInlineEditor onPlaceChanged={fetchAnalysis} />
        </div>

        {/* CTA */}
        <div className="rounded-2xl border-2 border-dashed border-border/50 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Análisis de Reputación</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {hasGooglePlace
              ? "Analizá tus reseñas con IA para descubrir patrones y oportunidades."
              : "Generá un análisis basado en la información de tu negocio."}
          </p>
          <Button onClick={runAnalysis} disabled={analyzing} className="gap-2">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? "Analizando..." : hasGooglePlace ? "Ejecutar análisis" : "Análisis con IA"}
          </Button>
        </div>
      </div>
    );
  }

  // Analysis exists
  const starLabels: Record<string, string> = { "FIVE": "5★", "FOUR": "4★", "THREE": "3★", "TWO": "2★", "ONE": "1★" };
  const totalStars = Object.values(analysis.star_distribution).reduce((a, b) => a + b, 0) || 1;
  const hasStarData = totalStars > 1 || Object.values(analysis.star_distribution).some(v => v > 0);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Google editor - compact */}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <GooglePlacesInlineEditor onPlaceChanged={fetchAnalysis} />
      </div>

      {/* Source badge */}
      {isBrainBased && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-foreground font-medium">Análisis basado en IA</span>
          <span className="text-xs text-muted-foreground">· Vinculá Google Maps para mayor precisión</span>
        </div>
      )}

      {/* Score Card */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Reputación</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Último análisis: {formatTimeAgo(analysis.last_analysis)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={runAnalysis} disabled={analyzing} className="gap-1.5 text-xs rounded-xl h-8">
              <RefreshCw className={cn("w-3 h-3", analyzing && "animate-spin")} />
              Actualizar
            </Button>
          </div>

          <div className="flex items-center gap-6 mb-5">
            {/* Score circle */}
            <div className={cn(
              "w-24 h-24 rounded-full flex flex-col items-center justify-center border-[3px] flex-shrink-0",
              analysis.overall_score >= 60 ? "border-success/60" : analysis.overall_score >= 40 ? "border-warning/60" : "border-destructive/60"
            )}>
              <span className={cn("text-3xl font-bold tracking-tight", getScoreColor(analysis.overall_score))}>{analysis.overall_score}</span>
              <span className={cn("text-[10px] font-medium", getScoreColor(analysis.overall_score))}>{getScoreLabel(analysis.overall_score)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon(analysis.trend)}
                <span className="text-xs text-muted-foreground">{getTrendLabel(analysis.trend)}</span>
                {analysis.analyzed_reviews_count > 0 && (
                  <span className="text-xs text-muted-foreground">· {analysis.analyzed_reviews_count} reseñas</span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{analysis.ai_summary}</p>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-success/5 border border-success/10 text-center">
              <div className="text-xl font-bold text-success">{analysis.sentiment_breakdown.positive}%</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Positivas</div>
            </div>
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-center">
              <div className="text-xl font-bold text-destructive">{analysis.sentiment_breakdown.negative}%</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Negativas</div>
            </div>
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <div className="text-xl font-bold text-primary">{analysis.response_rate}%</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Respuesta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Star Distribution */}
      {hasStarData && analysis.analyzed_reviews_count > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Distribución de estrellas</h3>
          </div>
          <div className="space-y-2.5">
            {["FIVE", "FOUR", "THREE", "TWO", "ONE"].map((star) => {
              const count = analysis.star_distribution[star] || 0;
              const pct = (count / totalStars) * 100;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-foreground w-6">{starLabels[star]}</span>
                  <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500",
                      star === "FIVE" && "bg-success", star === "FOUR" && "bg-success/70",
                      star === "THREE" && "bg-warning", star === "TWO" && "bg-warning/70",
                      star === "ONE" && "bg-destructive")} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keywords */}
      {(analysis.top_positive_words.length > 0 || analysis.top_negative_words.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.top_positive_words.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-4 h-4 text-success" />
                <h3 className="text-sm font-semibold text-foreground">Lo que más valoran</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.top_positive_words.slice(0, 8).map((w, i) => (
                  <span key={i} className="text-[11px] bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-lg">
                    {w.word} <span className="opacity-60">×{w.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.top_negative_words.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">A mejorar</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.top_negative_words.slice(0, 8).map((w, i) => (
                  <span key={i} className="text-[11px] bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 rounded-lg">
                    {w.word} <span className="opacity-60">×{w.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Themes */}
      {analysis.key_themes.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Temas principales</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {analysis.key_themes.map((t, i) => (
              <div key={i} className={cn("flex items-center gap-2.5 p-3 rounded-xl border",
                t.sentiment === "positive" && "bg-success/5 border-success/10",
                t.sentiment === "negative" && "bg-destructive/5 border-destructive/10",
                t.sentiment === "neutral" && "bg-muted/20 border-border/30")}>
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                  t.sentiment === "positive" && "bg-success",
                  t.sentiment === "negative" && "bg-destructive",
                  t.sentiment === "neutral" && "bg-muted-foreground")} />
                <span className="text-xs font-medium text-foreground flex-1 truncate">{t.theme}</span>
                <span className="text-[10px] text-muted-foreground">{t.frequency}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights & Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysis.highlights.length > 0 && (
          <div className="rounded-2xl border border-success/20 bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-success" />
              <h3 className="text-sm font-semibold text-foreground">Puntos fuertes</h3>
            </div>
            <div className="space-y-1.5">
              {analysis.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-success/5">
                  <span className="text-success text-xs mt-0.5">✓</span>
                  <span className="text-xs text-foreground leading-relaxed">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {analysis.urgent_issues.length > 0 && (
          <div className="rounded-2xl border border-destructive/20 bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">Problemas a resolver</h3>
            </div>
            <div className="space-y-1.5">
              {analysis.urgent_issues.map((u, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/5">
                  <span className="text-destructive text-xs mt-0.5">!</span>
                  <span className="text-xs text-foreground leading-relaxed">{u}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recomendaciones</h3>
          </div>
          <div className="space-y-2">
            {analysis.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/30">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-xs text-foreground leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl border border-border/40 bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">¿Cómo mejorar tu reputación?</h3>
            <p className="text-xs text-muted-foreground">Preguntale al asistente para un plan personalizado</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/app/chat?prompt=" + encodeURIComponent("Cómo puedo mejorar mi reputación online basándome en mis reseñas?"))} className="gap-1.5 text-xs rounded-xl flex-shrink-0">
            Consultar <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReputationAnalyticsPanel;
