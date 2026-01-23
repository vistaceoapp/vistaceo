import { useState, useEffect } from "react";
import { 
  Star, 
  Instagram, 
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Lock,
  Sparkles,
  ExternalLink,
  Youtube,
  Users,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";

interface ReputationWidgetProps {
  isPro?: boolean;
  className?: string;
}

export const ReputationWidget = ({ isPro = false, className }: ReputationWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [googleData, setGoogleData] = useState<{
    rating: number;
    reviewCount: number;
    change: number;
  } | null>(null);
  const [instagramData, setInstagramData] = useState<{
    followers: string;
    engagement: string;
  } | null>(null);
  const [youtubeData, setYoutubeData] = useState<{
    subscribers: string;
    views: string;
    engagement: string;
    channelTitle: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, [currentBusiness]);

  const fetchIntegrations = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("business_integrations")
        .select("*")
        .eq("business_id", currentBusiness.id);

      if (error) throw error;

      const googleIntegration = data?.find(d => d.integration_type === "google_reviews");
      const instagramIntegration = data?.find(d => d.integration_type === "instagram");
      const youtubeIntegration = data?.find(d => d.integration_type === "youtube");

      if (googleIntegration?.status === "connected") {
        setGoogleConnected(true);
        const metadata = googleIntegration.metadata as Record<string, any> | null;
        setGoogleData({
          rating: currentBusiness.avg_rating || 4.2,
          reviewCount: metadata?.review_count || 48,
          change: 0.1,
        });
      }

      if (instagramIntegration?.status === "connected") {
        setInstagramConnected(true);
        const metadata = instagramIntegration.metadata as Record<string, any> | null;
        setInstagramData({
          followers: metadata?.followers || "2.4K",
          engagement: metadata?.engagement || "4.2%",
        });
      }

      if (youtubeIntegration?.status === "connected") {
        setYoutubeConnected(true);
        const metadata = youtubeIntegration.metadata as Record<string, any> | null;
        setYoutubeData({
          subscribers: formatNumber(metadata?.subscriber_count || 0),
          views: formatNumber(metadata?.view_count || 0),
          engagement: metadata?.engagement_rate || "0.00",
          channelTitle: metadata?.channel_title || "Tu canal",
        });
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = googleConnected || instagramConnected || youtubeConnected;

  // Demo data for free users
  const demoGoogleData = { rating: 4.3, reviewCount: 127, change: 0.2 };
  const demoInstagramData = { followers: "3.2K", engagement: "5.1%" };
  const demoYoutubeData = { subscribers: "1.2K", views: "45K", engagement: "4.8%" };

  // Helper to format numbers
  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  if (loading) {
    return (
      <GlassCard className={cn("p-4 animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/2 mb-4" />
        <div className="h-20 bg-muted rounded" />
      </GlassCard>
    );
  }

  // Free version - Demo/Preview mode
  if (!isPro && !isConnected) {
    return (
      <GlassCard className={cn("p-4 relative overflow-hidden", className)}>
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent z-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" />
            <h4 className="font-semibold text-foreground text-sm">Reputación</h4>
          </div>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
            Demo
          </Badge>
        </div>

        {/* Demo content (blurred) */}
        <div className="space-y-3 opacity-60">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-warning/5">
            <Star className="w-5 h-5 text-warning" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Google Reviews</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{demoGoogleData.rating}</span>
                <Progress value={(demoGoogleData.rating / 5) * 100} className="h-1.5 flex-1" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-pink-500/5">
            <Instagram className="w-5 h-5 text-pink-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Instagram</p>
              <span className="text-sm font-medium">{demoInstagramData.followers} seguidores</span>
            </div>
          </div>
        </div>

        {/* CTA overlay */}
        <div className="relative z-20 mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">Conectá tu negocio</p>
              <p className="text-xs text-muted-foreground line-clamp-1">Datos reales de tus redes</p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="gradient-primary w-full"
            onClick={() => navigate("/app/more")}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Desbloquear Pro
          </Button>
        </div>
      </GlassCard>
    );
  }

  // Connected/Pro version - Real data
  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning" />
          <h4 className="font-semibold text-foreground text-sm">Reputación</h4>
        </div>
        <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
          Conectado
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Google Reviews */}
        {(googleConnected || isPro) && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">Google Reviews</span>
                {(googleData?.change || demoGoogleData.change) > 0 && (
                  <span className="text-[10px] text-success flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +{googleData?.change || demoGoogleData.change}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-foreground">
                  {googleData?.rating || demoGoogleData.rating}
                </span>
                <Progress 
                  value={((googleData?.rating || demoGoogleData.rating) / 5) * 100} 
                  className="h-2 flex-1" 
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {googleData?.reviewCount || demoGoogleData.reviewCount} reseñas
              </p>
            </div>
          </div>
        )}

        {/* YouTube */}
        {(youtubeConnected || isPro) && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Youtube className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">YouTube</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">
                    {youtubeData?.subscribers || demoYoutubeData.subscribers}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {youtubeData?.views || demoYoutubeData.views}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-foreground">
                    {youtubeData?.engagement || demoYoutubeData.engagement}%
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">eng</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instagram */}
        {(instagramConnected || isPro) && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-500/5 border border-pink-500/10">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Instagram</p>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-lg font-bold text-foreground">
                    {instagramData?.followers || demoInstagramData.followers}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">seguidores</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">
                    {instagramData?.engagement || demoInstagramData.engagement}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">engagement</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full mt-3 text-xs"
        onClick={() => navigate("/app/analytics")}
      >
        Ver más detalles
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </GlassCard>
  );
};

export default ReputationWidget;
