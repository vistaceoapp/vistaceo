import { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Loader2,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Brain,
  Globe,
  Eye,
  Users,
  Play
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
import { PlatformReputationCard, PlatformType } from "./PlatformReputationCard";
import { PlatformConnectModal } from "./PlatformConnectModal";
import { GoogleReviewsCard } from "./GoogleReviewsCard";
import { GoogleLocationSelector } from "./GoogleLocationSelector";
import { SocialProfileInput } from "./SocialProfileInput";

interface ReputationAnalysis {
  overall_score: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
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
}

interface PlatformIntegration {
  platform: "google" | "instagram" | "facebook";
  connected: boolean;
  status?: string; // "connected", "error", "pending"
  metadata?: Record<string, any>;
  lastSync?: string;
  reviewCount?: number;
  avgRating?: number;
}

// Plataformas principales: Google Reviews + Meta (Instagram/Facebook)
// Web Analytics removido temporalmente
const MAIN_PLATFORMS: Array<PlatformIntegration["platform"]> = ["google", "instagram", "facebook"];

// Helper para verificar si está conectado (puede ser "connected", "active" o "scraped")
const isConnectedStatus = (status: string) => status === "connected" || status === "active" || status === "scraped";

interface ReputationAnalyticsPanelProps {
  className?: string;
}

export const ReputationAnalyticsPanel = ({ className }: ReputationAnalyticsPanelProps) => {
  const { currentBusiness } = useBusiness();
  const [analysis, setAnalysis] = useState<ReputationAnalysis | null>(null);
  const [platforms, setPlatforms] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);

  const handleConnectPlatform = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    setConnectModalOpen(true);
  };

  const handleConnectionSuccess = () => {
    fetchPlatforms();
    setConnectModalOpen(false);
  };

  const fetchPlatforms = useCallback(async () => {
    if (!currentBusiness) return;
    
    try {
      // Fetch integrations
      const { data: integrations } = await supabase
        .from("business_integrations")
        .select("integration_type, status, metadata, last_sync_at")
        .eq("business_id", currentBusiness.id);
      
      // Fetch reviews for Google
      const { data: reviews } = await supabase
        .from("external_data")
        .select("content")
        .eq("business_id", currentBusiness.id)
        .eq("data_type", "review");
      
      // Calculate review stats from external_data
      let reviewCount = 0;
      let avgRating = 0;
      if (reviews && reviews.length > 0) {
        reviewCount = reviews.length;
        const totalRating = reviews.reduce((sum, r) => {
          const content = r.content as Record<string, any>;
          return sum + (Number(content?.rating) || 0);
        }, 0);
        avgRating = Math.round((totalRating / reviewCount) * 10) / 10;
      }
      
      const platformMap: Record<string, PlatformIntegration> = {
        google: { platform: "google", connected: false },
        instagram: { platform: "instagram", connected: false },
        facebook: { platform: "facebook", connected: false },
      };

      if (integrations) {
        for (const integration of integrations) {
          const meta = integration.metadata as Record<string, any>;
          
          if (integration.integration_type === "google_business" || integration.integration_type === "google_reviews") {
            platformMap.google = {
              platform: "google",
              connected: isConnectedStatus(integration.status),
              status: integration.status,
              metadata: meta,
              lastSync: integration.last_sync_at,
              reviewCount,
              avgRating: avgRating || meta?.rating || currentBusiness?.avg_rating || 0,
            };
          } else if (integration.integration_type === "instagram") {
            platformMap.instagram = {
              platform: "instagram",
              connected: isConnectedStatus(integration.status),
              status: integration.status,
              metadata: meta,
              lastSync: integration.last_sync_at,
            };
          } else if (integration.integration_type === "facebook") {
            platformMap.facebook = {
              platform: "facebook",
              connected: isConnectedStatus(integration.status),
              status: integration.status,
              metadata: meta,
              lastSync: integration.last_sync_at,
            };
          }
          // Web Analytics removido temporalmente
        }
      }
      
      setPlatforms(Object.values(platformMap));
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  }, [currentBusiness]);

  const fetchAnalysis = useCallback(async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      // First check if we have cached analysis in brain
      const { data: brain } = await supabase
        .from("business_brains")
        .select("dynamic_memory")
        .eq("business_id", currentBusiness.id)
        .single();

      const dynamicMemory = brain?.dynamic_memory as Record<string, any> | null;
      const cachedAnalysis = dynamicMemory?.reputation_analysis as ReputationAnalysis | null;

      if (cachedAnalysis) {
        setAnalysis(cachedAnalysis);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness]);

  useEffect(() => {
    fetchAnalysis();
    fetchPlatforms();
  }, [fetchAnalysis, fetchPlatforms]);

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
        toast({
          title: "✨ Análisis completado",
          description: `Score de reputación: ${data.analysis.overall_score}/100`,
        });
      }
    } catch (error) {
      console.error("Error running analysis:", error);
      toast({
        title: "Error",
        description: "No se pudo completar el análisis",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muy bueno";
    if (score >= 70) return "Bueno";
    if (score >= 60) return "Regular";
    if (score >= 40) return "Mejorable";
    return "Crítico";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-success" />;
      case "declining": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "improving": return "Mejorando";
      case "declining": return "Declinando";
      default: return "Estable";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Hace minutos";
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="h-48 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  // Build platform data for cards
  const getPlatformData = (platform: PlatformIntegration) => {
    const data: any = {
      platform: platform.platform,
      connected: platform.connected,
      status: platform.status,
      errorMessage: platform.status === "error" ? getErrorMessage(platform) : undefined,
      metrics: {
        mainScore: 0,
        mainLabel: "",
        secondary: [],
        trend: "stable" as const,
        lastSync: platform.lastSync ? formatTimeAgo(platform.lastSync) : undefined,
      }
    };

    if (platform.platform === "google") {
      // Use real data from external_data reviews
      data.metrics.mainScore = platform.avgRating || currentBusiness?.avg_rating || 0;
      data.metrics.secondary = [
        { label: "Cuenta", value: platform.metadata?.account_email || "-", icon: <Users className="w-3 h-3" /> },
        { label: "Reseñas", value: platform.reviewCount || 0, icon: <MessageSquare className="w-3 h-3" /> },
        { label: "Respondidas", value: `${analysis?.response_rate || 0}%`, icon: <ThumbsUp className="w-3 h-3" /> },
      ];
    } else if (platform.platform === "instagram" && platform.metadata) {
      data.metrics.mainScore = platform.metadata.followers_count || 0;
      data.metrics.secondary = [
        { label: "Posts", value: platform.metadata.media_count || 0, icon: <BarChart3 className="w-3 h-3" /> },
        { label: "Engagement", value: `${platform.metadata.engagement_rate || 0}%`, icon: <TrendingUp className="w-3 h-3" /> },
      ];
    } else if (platform.platform === "facebook" && platform.metadata) {
      data.metrics.mainScore = platform.metadata.rating || 0;
      data.metrics.secondary = [
        { label: "Seguidores", value: formatNumber(platform.metadata.followers_count || 0), icon: <Users className="w-3 h-3" /> },
        { label: "Reseñas", value: platform.metadata.review_count || 0, icon: <MessageSquare className="w-3 h-3" /> },
      ];
    }
    // Web Analytics removido temporalmente
    return data;
  };

  const getErrorMessage = (platform: PlatformIntegration): string => {
    const meta = platform.metadata;
    if (meta?.error === "no_pages_found") {
      return "No se encontraron Páginas de Facebook vinculadas";
    }
    return "Error de conexión";
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Filter platforms by category (solo plataformas principales)
  const mainPlatforms = platforms.filter(p => MAIN_PLATFORMS.includes(p.platform));

  // No analysis yet - show platforms + CTA
  if (!analysis) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Main Platforms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Plataformas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainPlatforms.map((platform) => {
                // Use specialized card for Google
                if (platform.platform === "google") {
                  return (
                    <GoogleReviewsCard
                      key="google"
                      connected={platform.connected}
                      metadata={platform.metadata}
                      reviewCount={platform.reviewCount || 0}
                      avgRating={platform.avgRating || 0}
                      responseRate={analysis?.response_rate || 0}
                      lastSync={platform.lastSync}
                      onConnect={() => handleConnectPlatform("google")}
                      onChangeLocation={() => setLocationSelectorOpen(true)}
                      onSyncComplete={fetchPlatforms}
                      businessId={currentBusiness?.id || ""}
                    />
                  );
                }
                // For Instagram/Facebook - use SocialProfileInput when not connected
                if ((platform.platform === "instagram" || platform.platform === "facebook") && !platform.connected) {
                  return (
                    <SocialProfileInput
                      key={platform.platform}
                      platform={platform.platform}
                      businessId={currentBusiness?.id || ""}
                      onSuccess={() => fetchPlatforms()}
                      existingData={platform.metadata ? {
                        profile_url: platform.metadata.profile_url,
                        followers: platform.metadata.followers || platform.metadata.followers_count,
                        posts: platform.metadata.posts || platform.metadata.media_count,
                        username: platform.metadata.username,
                      } : undefined}
                    />
                  );
                }
                return (
                  <PlatformReputationCard
                    key={platform.platform}
                    data={getPlatformData(platform)}
                    onConnect={() => handleConnectPlatform(platform.platform)}
                  />
                );
              })}
            </div>

            {/* Connect Modal */}
            <PlatformConnectModal
              open={connectModalOpen}
              onOpenChange={setConnectModalOpen}
              platform={selectedPlatform}
              onSuccess={handleConnectionSuccess}
            />
            
            {/* Google Location Selector */}
            <GoogleLocationSelector
              businessId={currentBusiness?.id || ""}
              open={locationSelectorOpen}
              onOpenChange={setLocationSelectorOpen}
              onLocationSelected={() => {
                setLocationSelectorOpen(false);
                fetchPlatforms();
              }}
            />
          </CardContent>
        </Card>

        {/* CTA to run analysis */}
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Análisis de Reputación IA</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Analiza todas tus reseñas con inteligencia artificial para descubrir patrones, 
              palabras clave y oportunidades de mejora.
            </p>
            <Button 
              onClick={runAnalysis} 
              disabled={analyzing}
              className="gradient-primary"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ejecutar primer análisis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const starLabels: Record<string, string> = {
    "FIVE": "5★",
    "FOUR": "4★",
    "THREE": "3★",
    "TWO": "2★",
    "ONE": "1★"
  };

  const totalStars = Object.values(analysis.star_distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <Tabs defaultValue="general" className={cn("space-y-6", className)}>
      <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
        <TabsTrigger value="general" className="gap-2">
          <Globe className="w-4 h-4" />
          Vista General
        </TabsTrigger>
        <TabsTrigger value="plataformas" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          Por Plataforma
        </TabsTrigger>
      </TabsList>

      {/* Tab: Vista General */}
      <TabsContent value="general" className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Score Ring */}
              <div className="relative">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(analysis.overall_score / 100) * 251.2} 251.2`}
                    className={getScoreColor(analysis.overall_score)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-2xl font-bold", getScoreColor(analysis.overall_score))}>
                    {analysis.overall_score}
                  </span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-foreground">Score de Reputación</h3>
                  <Badge variant="outline" className={cn("text-xs", getScoreColor(analysis.overall_score))}>
                    {getScoreLabel(analysis.overall_score)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getTrendIcon(analysis.trend)}
                  <span>{getTrendLabel(analysis.trend)}</span>
                  <span>•</span>
                  <span>{analysis.analyzed_reviews_count} reseñas analizadas</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Último análisis: {formatTimeAgo(analysis.last_analysis)}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sentiment Breakdown */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-muted-foreground">Positivas</span>
          </div>
          <div className="text-2xl font-bold text-success">{analysis.sentiment_breakdown.positive}%</div>
          <Progress value={analysis.sentiment_breakdown.positive} className="h-1.5 mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-muted-foreground">Negativas</span>
          </div>
          <div className="text-2xl font-bold text-destructive">{analysis.sentiment_breakdown.negative}%</div>
          <Progress value={analysis.sentiment_breakdown.negative} className="h-1.5 mt-2 [&>div]:bg-destructive" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Tasa respuesta</span>
          </div>
          <div className="text-2xl font-bold text-primary">{analysis.response_rate}%</div>
          <Progress value={analysis.response_rate} className="h-1.5 mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium text-muted-foreground">5 estrellas</span>
          </div>
          <div className="text-2xl font-bold text-warning">
            {Math.round((analysis.star_distribution["FIVE"] || 0) / totalStars * 100)}%
          </div>
          <Progress 
            value={(analysis.star_distribution["FIVE"] || 0) / totalStars * 100} 
            className="h-1.5 mt-2 [&>div]:bg-warning" 
          />
        </Card>
      </div>

      {/* Star Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Distribución de estrellas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["FIVE", "FOUR", "THREE", "TWO", "ONE"].map((star) => {
              const count = analysis.star_distribution[star] || 0;
              const percentage = (count / totalStars) * 100;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-8">{starLabels[star]}</span>
                  <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        star === "FIVE" && "bg-success",
                        star === "FOUR" && "bg-success/70",
                        star === "THREE" && "bg-warning",
                        star === "TWO" && "bg-warning/70",
                        star === "ONE" && "bg-destructive",
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Positive Words */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-success" />
              Palabras positivas más usadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.top_positive_words.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.top_positive_words.slice(0, 10).map((word, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="bg-success/10 text-success border-success/30 text-sm py-1 px-3"
                  >
                    {word.word}
                    <span className="ml-1.5 text-xs opacity-70">×{word.count}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay suficientes datos</p>
            )}
          </CardContent>
        </Card>

        {/* Negative Words */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-destructive" />
              Palabras negativas a monitorear
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.top_negative_words.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.top_negative_words.slice(0, 10).map((word, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="bg-destructive/10 text-destructive border-destructive/30 text-sm py-1 px-3"
                  >
                    {word.word}
                    <span className="ml-1.5 text-xs opacity-70">×{word.count}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                🎉 Sin palabras negativas detectadas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Themes */}
      {analysis.key_themes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              Temas principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.key_themes.map((theme, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-3 rounded-xl border flex items-center gap-3",
                    theme.sentiment === "positive" && "bg-success/5 border-success/20",
                    theme.sentiment === "negative" && "bg-destructive/5 border-destructive/20",
                    theme.sentiment === "neutral" && "bg-secondary border-border"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    theme.sentiment === "positive" && "bg-success",
                    theme.sentiment === "negative" && "bg-destructive",
                    theme.sentiment === "neutral" && "bg-muted-foreground"
                  )} />
                  <span className="text-sm font-medium text-foreground flex-1">{theme.theme}</span>
                  <span className="text-xs text-muted-foreground">{theme.frequency}×</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Highlights and Issues */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Highlights */}
        {analysis.highlights.length > 0 && (
          <Card className="bg-success/5 border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-success">
                <Zap className="w-4 h-4" />
                Tus puntos fuertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-success mt-1">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Urgent Issues */}
        {analysis.urgent_issues.length > 0 && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Problemas a resolver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.urgent_issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-destructive mt-1">!</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Recomendaciones IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      </TabsContent>

      {/* Tab: Por Plataforma */}
      <TabsContent value="plataformas" className="space-y-6">
        {/* Main Platforms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Plataformas principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainPlatforms.map((platform) => {
                // Use specialized card for Google in plataformas tab too
                if (platform.platform === "google") {
                  return (
                    <GoogleReviewsCard
                      key="google"
                      connected={platform.connected}
                      metadata={platform.metadata}
                      reviewCount={platform.reviewCount || 0}
                      avgRating={platform.avgRating || 0}
                      responseRate={analysis?.response_rate || 0}
                      lastSync={platform.lastSync}
                      onConnect={() => handleConnectPlatform("google")}
                      onChangeLocation={() => setLocationSelectorOpen(true)}
                      onSyncComplete={fetchPlatforms}
                      businessId={currentBusiness?.id || ""}
                    />
                  );
                }
                return (
                  <PlatformReputationCard
                    key={platform.platform}
                    data={getPlatformData(platform)}
                    onConnect={() => handleConnectPlatform(platform.platform)}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {platforms.filter(p => p.connected).length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Sin plataformas conectadas</h3>
              <p className="text-sm text-muted-foreground">
                Conecta tus plataformas para ver análisis detallado por cada una
              </p>
            </CardContent>
          </Card>
        )}

        {/* Connect Modal */}
        <PlatformConnectModal
          open={connectModalOpen}
          onOpenChange={setConnectModalOpen}
          platform={selectedPlatform}
          onSuccess={handleConnectionSuccess}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ReputationAnalyticsPanel;
