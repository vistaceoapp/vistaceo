import { useState, useEffect } from "react";
import { 
  Star, 
  Instagram, 
  Facebook, 
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface SocialRating {
  id: string;
  type: "google_reviews" | "instagram" | "facebook" | "tiktok";
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  connected: boolean;
  rating?: number;
  maxRating?: number;
  change?: number;
  changeLabel?: string;
  metrics?: {
    label: string;
    value: string;
  }[];
  lastUpdated?: string;
}

const SOCIAL_PLATFORMS: SocialRating[] = [
  {
    id: "google_reviews",
    type: "google_reviews",
    name: "Google Reviews",
    icon: Star,
    color: "text-warning",
    bgColor: "bg-warning/10",
    connected: false,
  },
  {
    id: "instagram",
    type: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    connected: false,
  },
  {
    id: "facebook",
    type: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    connected: false,
  },
];

// Helper to format large numbers
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

interface SocialRatingsPanelProps {
  variant?: "compact" | "full";
}

export const SocialRatingsPanel = ({ variant = "full" }: SocialRatingsPanelProps) => {
  const { currentBusiness } = useBusiness();
  const [platforms, setPlatforms] = useState<SocialRating[]>(SOCIAL_PLATFORMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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

      // Update platforms with integration data
      const updatedPlatforms = SOCIAL_PLATFORMS.map(platform => {
        const integration = data?.find(d => d.integration_type === platform.type);
        const metadata = integration?.metadata as Record<string, any> | null;
        
        if (integration?.status === "connected") {
          // Google Reviews
          if (platform.type === "google_reviews") {
            return {
              ...platform,
              connected: true,
              rating: currentBusiness.avg_rating || metadata?.average_rating || 4.2,
              maxRating: 5,
              change: 0.1,
              changeLabel: "vs mes anterior",
              metrics: [
                { label: "Reseñas", value: metadata?.review_count?.toString() || "0" },
                { label: "Respondidas", value: metadata?.response_rate || "0%" },
              ],
              lastUpdated: integration.last_sync_at || "Pendiente",
            };
          }
          
          // Instagram
          if (platform.type === "instagram") {
            return {
              ...platform,
              connected: true,
              metrics: [
                { label: "Seguidores", value: formatNumber(metadata?.followers_count) || "0" },
                { label: "Engagement", value: metadata?.engagement_rate || "0%" },
              ],
              lastUpdated: integration.last_sync_at || "Pendiente",
            };
          }
          
          // Facebook
          if (platform.type === "facebook") {
            return {
              ...platform,
              connected: true,
              rating: metadata?.overall_star_rating || undefined,
              maxRating: metadata?.overall_star_rating ? 5 : undefined,
              metrics: [
                { label: "Seguidores", value: formatNumber(metadata?.followers_count || metadata?.fan_count) || "0" },
                { label: "Rating", value: metadata?.overall_star_rating ? `${metadata.overall_star_rating}/5` : "N/A" },
              ],
              lastUpdated: integration.last_sync_at || "Pendiente",
            };
          }
          
          return {
            ...platform,
            connected: true,
            lastUpdated: integration.last_sync_at || "Pendiente",
          };
        }
        return platform;
      });

      setPlatforms(updatedPlatforms);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!currentBusiness) return;
    setSyncing(true);
    
    try {
      await supabase.functions.invoke("google-sync-reviews", {
        body: { businessId: currentBusiness.id }
      });
      
      toast({
        title: "Datos actualizados",
        description: "Se sincronizaron los últimos datos de tus redes.",
      });
      
      fetchIntegrations();
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setSyncing(false);
    }
  };

  const connectedPlatforms = platforms.filter(p => p.connected);
  const currentPlatform = connectedPlatforms[currentIndex] || platforms[0];

  const goNext = () => {
    if (connectedPlatforms.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % connectedPlatforms.length);
    }
  };

  const goPrev = () => {
    if (connectedPlatforms.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + connectedPlatforms.length) % connectedPlatforms.length);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/2 mb-4" />
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  // No connected platforms
  if (connectedPlatforms.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Ratings</h4>
            <p className="text-xs text-muted-foreground">Sin conexiones</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          Conecta Google Reviews u otras redes para ver tus ratings aquí.
        </p>
      </div>
    );
  }

  const Icon = currentPlatform.icon;

  // Compact variant for sidebar
  if (variant === "compact") {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", currentPlatform.bgColor)}>
              <Icon className={cn("w-5 h-5", currentPlatform.color)} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">{currentPlatform.name}</h4>
              {currentPlatform.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-foreground">{currentPlatform.rating}</span>
                  <span className="text-xs text-muted-foreground">/ {currentPlatform.maxRating}</span>
                  {currentPlatform.change !== undefined && (
                    <span className={cn(
                      "text-xs flex items-center gap-0.5 ml-1",
                      currentPlatform.change > 0 ? "text-success" : currentPlatform.change < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {currentPlatform.change > 0 ? <TrendingUp className="w-3 h-3" /> : currentPlatform.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {currentPlatform.change > 0 ? "+" : ""}{currentPlatform.change}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {connectedPlatforms.length > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Rating bar for Google */}
        {currentPlatform.rating && currentPlatform.maxRating && (
          <div className="mb-3">
            <Progress 
              value={(currentPlatform.rating / currentPlatform.maxRating) * 100} 
              className="h-2" 
            />
          </div>
        )}

        {/* Metrics */}
        {currentPlatform.metrics && (
          <div className="grid grid-cols-2 gap-2">
            {currentPlatform.metrics.map((metric, idx) => (
              <div key={idx} className="bg-secondary/50 rounded-lg p-2 text-center">
                <div className="text-sm font-semibold text-foreground">{metric.value}</div>
                <div className="text-[10px] text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation dots */}
        {connectedPlatforms.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {connectedPlatforms.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  idx === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}

        {/* Sync button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-xs"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-2" />
          )}
          Actualizar
        </Button>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Ratings de tu negocio</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {connectedPlatforms.map((platform) => {
          const PlatformIcon = platform.icon;
          return (
            <div 
              key={platform.id}
              className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", platform.bgColor)}>
                <PlatformIcon className={cn("w-6 h-6", platform.color)} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{platform.name}</span>
                  {platform.change !== undefined && (
                    <span className={cn(
                      "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                      platform.change > 0 ? "text-success bg-success/10" : platform.change < 0 ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-muted"
                    )}>
                      {platform.change > 0 ? <TrendingUp className="w-3 h-3" /> : platform.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {platform.change > 0 ? "+" : ""}{platform.change}
                    </span>
                  )}
                </div>
                
                {platform.metrics && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {platform.metrics.map((metric, idx) => (
                      <span key={idx}>{metric.label}: <span className="text-foreground font-medium">{metric.value}</span></span>
                    ))}
                  </div>
                )}
              </div>

              {platform.rating && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{platform.rating}</div>
                  <div className="text-xs text-muted-foreground">/ {platform.maxRating}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialRatingsPanel;
