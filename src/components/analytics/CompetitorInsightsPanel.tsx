import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, Star, Users, RefreshCw, TrendingUp, TrendingDown,
  Minus, ExternalLink, Building2, Eye, Sparkles, AlertTriangle,
  ChevronRight, Target, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "@/components/app/GlassCard";
import { toast } from "@/hooks/use-toast";

interface Competitor {
  id: string;
  name: string;
  address: string | null;
  rating: number | null;
  review_count: number | null;
  distance_km: number | null;
  price_level: number | null;
  google_place_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface CompetitorAnalysis {
  marketPosition: "leader" | "competitive" | "lagging" | "unknown";
  avgMarketRating: number;
  avgReviewCount: number;
  ratingDiff: number;
  reviewCountDiff: number;
  nearestCompetitor: Competitor | null;
  strongestCompetitor: Competitor | null;
  insights: string[];
}

export const CompetitorInsightsPanel = () => {
  const { currentBusiness } = useBusiness();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchCompetitors = useCallback(async () => {
    if (!currentBusiness) return;
    
    try {
      const { data, error } = await supabase
        .from("business_competitors")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("distance_km", { ascending: true })
        .limit(10);

      if (error) throw error;
      
      const comps = (data || []) as Competitor[];
      setCompetitors(comps);
      
      if (comps.length > 0) {
        analyzeCompetition(comps);
      }
    } catch (error) {
      console.error("Error fetching competitors:", error);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness]);

  const analyzeCompetition = (comps: Competitor[]) => {
    const withRating = comps.filter(c => c.rating != null);
    const withReviews = comps.filter(c => c.review_count != null);
    
    const avgRating = withRating.length > 0 
      ? withRating.reduce((sum, c) => sum + (c.rating || 0), 0) / withRating.length 
      : 0;
    const avgReviews = withReviews.length > 0
      ? withReviews.reduce((sum, c) => sum + (c.review_count || 0), 0) / withReviews.length
      : 0;
    
    const myRating = currentBusiness?.avg_rating || 0;
    const ratingDiff = myRating - avgRating;
    
    const nearest = comps.reduce<Competitor | null>((best, c) => {
      if (!best || (c.distance_km || 999) < (best.distance_km || 999)) return c;
      return best;
    }, null);
    
    const strongest = withRating.reduce<Competitor | null>((best, c) => {
      if (!best || (c.rating || 0) > (best.rating || 0)) return c;
      return best;
    }, null);

    let position: CompetitorAnalysis["marketPosition"] = "unknown";
    if (myRating > 0 && avgRating > 0) {
      if (ratingDiff > 0.3) position = "leader";
      else if (ratingDiff > -0.2) position = "competitive";
      else position = "lagging";
    }

    const insights: string[] = [];
    if (position === "leader") {
      insights.push(`Tu rating (${myRating.toFixed(1)}) supera la media de tu zona (${avgRating.toFixed(1)}). ¡Estás liderando!`);
    } else if (position === "lagging") {
      insights.push(`Tu rating (${myRating.toFixed(1)}) está por debajo de la media (${avgRating.toFixed(1)}). Focalizá en mejorar la experiencia del cliente.`);
    } else if (position === "competitive") {
      insights.push(`Tu rating (${myRating.toFixed(1)}) es competitivo con la media (${avgRating.toFixed(1)}). Pequeñas mejoras pueden diferenciarte.`);
    }
    
    if (strongest && strongest.rating && myRating > 0) {
      if (strongest.rating > myRating) {
        insights.push(`${strongest.name} lidera con ${strongest.rating.toFixed(1)}⭐. Estudiá qué los diferencia.`);
      }
    }
    
    if (nearest && nearest.distance_km) {
      insights.push(`Tu competidor más cercano (${nearest.name}) está a ${nearest.distance_km.toFixed(1)} km.`);
    }
    
    if (comps.length >= 5) {
      insights.push(`Hay ${comps.length} competidores detectados en tu zona. Es un mercado ${comps.length > 8 ? "muy competitivo" : "moderadamente competitivo"}.`);
    }

    setAnalysis({
      marketPosition: position,
      avgMarketRating: avgRating,
      avgReviewCount: avgReviews,
      ratingDiff,
      reviewCountDiff: 0,
      nearestCompetitor: nearest,
      strongestCompetitor: strongest,
      insights,
    });
  };

  const scanCompetitors = async () => {
    if (!currentBusiness) return;
    setScanning(true);

    try {
      const { data, error } = await supabase.functions.invoke("scan-competitors", {
        body: { businessId: currentBusiness.id }
      });

      if (error) throw error;

      toast({
        title: "Escaneo completado",
        description: `Se encontraron ${data?.competitorsFound || 0} competidores en tu zona`,
      });

      await fetchCompetitors();
    } catch (error) {
      console.error("Error scanning competitors:", error);
      toast({
        title: "Error",
        description: "No se pudo escanear competidores. Verificá que tu negocio tenga ubicación configurada.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const getPositionConfig = (position: CompetitorAnalysis["marketPosition"]) => {
    switch (position) {
      case "leader": return { label: "Líder", color: "text-success", bg: "bg-success/10", border: "border-success/20", icon: TrendingUp };
      case "competitive": return { label: "Competitivo", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: Minus };
      case "lagging": return { label: "Por mejorar", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", icon: TrendingDown };
      default: return { label: "Sin datos", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border", icon: Eye };
    }
  };

  const getPriceLevelLabel = (level: number | null) => {
    if (level === null) return null;
    return ["$", "$$", "$$$", "$$$$"][level - 1] || null;
  };

  if (loading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-32 bg-muted rounded" />
      </GlassCard>
    );
  }

  // No competitors yet - show scan CTA
  if (competitors.length === 0) {
    return (
      <GlassCard className="p-8 border-dashed border-2 border-primary/20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Análisis de Competencia
          </h3>
          <p className="text-muted-foreground mb-2 max-w-md mx-auto">
            Descubrí quiénes son tus competidores cercanos, cómo se comparan 
            en ratings y reseñas, y encontrá oportunidades para destacarte.
          </p>
          {!currentBusiness?.google_place_id && !currentBusiness?.address ? (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-warning text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Vinculá tu negocio con Google Maps primero para detectar competidores.</span>
              </div>
            </div>
          ) : (
            <Button onClick={scanCompetitors} disabled={scanning} size="lg" className="gradient-primary">
              {scanning ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {scanning ? "Escaneando zona..." : "Escanear competidores"}
            </Button>
          )}
        </div>
      </GlassCard>
    );
  }

  const posConfig = analysis ? getPositionConfig(analysis.marketPosition) : null;
  const PositionIcon = posConfig?.icon || Eye;

  return (
    <div className="space-y-6">
      {/* Market Position Header */}
      {analysis && (
        <GlassCard className="p-0 overflow-hidden">
          <div className={cn("h-2", posConfig?.bg)} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">Posición Competitiva</h2>
                <Badge variant="outline" className="text-xs">
                  {competitors.length} competidores
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={scanCompetitors} disabled={scanning}>
                <RefreshCw className={cn("w-4 h-4 mr-2", scanning && "animate-spin")} />
                Actualizar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Market Position */}
              <div className={cn("p-4 rounded-xl border", posConfig?.bg, posConfig?.border)}>
                <div className="flex items-center gap-2 mb-2">
                  <PositionIcon className={cn("w-5 h-5", posConfig?.color)} />
                  <span className={cn("text-sm font-semibold", posConfig?.color)}>{posConfig?.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis.marketPosition === "leader" && "Tu negocio tiene mejor valoración que la competencia"}
                  {analysis.marketPosition === "competitive" && "Estás a la par con el mercado local"}
                  {analysis.marketPosition === "lagging" && "Hay margen de mejora vs la competencia"}
                  {analysis.marketPosition === "unknown" && "Vinculá Google Maps para compararte"}
                </p>
              </div>

              {/* Avg Market Rating */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-foreground">Rating del Mercado</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {analysis.avgMarketRating > 0 ? analysis.avgMarketRating.toFixed(1) : "—"}
                  </span>
                  {analysis.ratingDiff !== 0 && currentBusiness?.avg_rating && (
                    <span className={cn(
                      "text-xs font-medium flex items-center gap-0.5",
                      analysis.ratingDiff > 0 ? "text-success" : "text-destructive"
                    )}>
                      {analysis.ratingDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {analysis.ratingDiff > 0 ? "+" : ""}{analysis.ratingDiff.toFixed(1)} vs tuyo
                    </span>
                  )}
                </div>
              </div>

              {/* Market Density */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Densidad de Mercado</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{competitors.length}</span>
                  <span className="text-xs text-muted-foreground">en tu zona</span>
                </div>
                {analysis.nearestCompetitor?.distance_km && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Más cercano: {analysis.nearestCompetitor.distance_km.toFixed(1)} km
                  </p>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Insights */}
      {analysis && analysis.insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              Insights Competitivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitors List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Competidores Detectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competitors.map((comp) => (
              <div 
                key={comp.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm truncate">{comp.name}</h4>
                  {comp.address && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {comp.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {comp.rating != null && (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                        <span className="text-sm font-bold text-foreground">{comp.rating.toFixed(1)}</span>
                      </div>
                      {comp.review_count != null && (
                        <span className="text-[10px] text-muted-foreground">{comp.review_count} reseñas</span>
                      )}
                    </div>
                  )}
                  {comp.distance_km != null && (
                    <Badge variant="secondary" className="text-[10px]">
                      {comp.distance_km.toFixed(1)} km
                    </Badge>
                  )}
                  {getPriceLevelLabel(comp.price_level) && (
                    <Badge variant="outline" className="text-[10px]">
                      {getPriceLevelLabel(comp.price_level)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorInsightsPanel;
