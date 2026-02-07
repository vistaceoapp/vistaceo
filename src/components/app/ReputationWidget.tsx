import { useState, useEffect } from "react";
import { 
  Star, 
  TrendingUp,
  ChevronRight,
  Lock,
  Sparkles
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
  const [googleData, setGoogleData] = useState<{
    rating: number;
    reviewCount: number;
    change: number;
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
      // Only fetch Google integration (Instagram/Facebook removed)
      const { data, error } = await supabase
        .from("business_integrations")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .in("integration_type", ["google_reviews", "google_business"]);

      if (error) throw error;

      const googleIntegration = data?.find(d => 
        d.integration_type === "google_reviews" || d.integration_type === "google_business"
      );

      // Also check if business has google_place_id from setup
      const hasGoogleFromSetup = !!currentBusiness.google_place_id;

      if (googleIntegration?.status === "connected" || hasGoogleFromSetup) {
        setGoogleConnected(true);
        const metadata = googleIntegration?.metadata as Record<string, any> | null;
        setGoogleData({
          rating: currentBusiness.avg_rating || metadata?.rating || 0,
          reviewCount: metadata?.review_count || 0,
          change: metadata?.rating_change || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = googleConnected;

  // Demo data for free users - only Google
  const demoGoogleData = { rating: 4.3, reviewCount: 127, change: 0.2 };

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

        {/* Demo content (blurred) - Only Google */}
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
        </div>

        {/* CTA overlay */}
        <div className="relative z-20 mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">Conectá tu negocio</p>
              <p className="text-xs text-muted-foreground line-clamp-1">Datos reales de Google</p>
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

  // Connected/Pro version - Real data (ONLY Google)
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
        {/* Google Reviews - Only platform shown */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Google Reviews</span>
              {(googleData?.change || 0) > 0 && (
                <span className="text-[10px] text-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +{googleData?.change || 0}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-foreground">
                {googleData?.rating || currentBusiness?.avg_rating || 0}
              </span>
              <Progress 
                value={((googleData?.rating || currentBusiness?.avg_rating || 0) / 5) * 100} 
                className="h-2 flex-1" 
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {googleData?.reviewCount || 0} reseñas
            </p>
          </div>
        </div>
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
