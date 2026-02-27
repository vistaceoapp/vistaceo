import { useState, useEffect } from "react";
import { 
  Star, 
  TrendingUp,
  ChevronRight,
  Lock,
  Sparkles,
  MapPin,
  RefreshCw,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface ReputationWidgetProps {
  isPro?: boolean;
  className?: string;
}

export const ReputationWidget = ({ isPro = false, className }: ReputationWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [googleData, setGoogleData] = useState<{
    rating: number;
    reviewCount: number;
    placeName?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const hasGooglePlace = !!currentBusiness?.google_place_id;

  useEffect(() => {
    fetchData();
  }, [currentBusiness]);

  const fetchData = async () => {
    if (!currentBusiness) { setLoading(false); return; }

    try {
      // Get data from business_integrations (google_places type)
      const { data: integration } = await supabase
        .from("business_integrations")
        .select("metadata, last_sync_at")
        .eq("business_id", currentBusiness.id)
        .eq("integration_type", "google_places")
        .maybeSingle();

      const meta = integration?.metadata as Record<string, any> | null;

      setGoogleData({
        rating: currentBusiness.avg_rating || meta?.rating || 0,
        reviewCount: meta?.review_count || 0,
        placeName: meta?.place_name,
      });
    } catch (error) {
      console.error("Error fetching reputation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!currentBusiness || syncing) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-sync-public-reviews", {
        body: { businessId: currentBusiness.id }
      });
      if (error) throw error;
      toast({ title: "✅ Datos actualizados", description: `${data?.synced || 0} reseñas desde Google Maps` });
      fetchData();
    } catch {
      toast({ title: "Error", description: "No se pudieron sincronizar", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className={cn("p-4 animate-pulse", className)}>
        <div className="h-20 bg-muted rounded" />
      </GlassCard>
    );
  }

  // Free version - locked
  if (!isPro) {
    return (
      <GlassCard className={cn("p-4 relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent z-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" />
            <h4 className="font-semibold text-foreground text-sm">Reputación</h4>
          </div>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
            Pro
          </Badge>
        </div>

        <div className="space-y-3 opacity-60">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-warning/5">
            <Star className="w-5 h-5 text-warning" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Google Maps</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{currentBusiness?.avg_rating || 4.3}</span>
                <Progress value={((currentBusiness?.avg_rating || 4.3) / 5) * 100} className="h-1.5 flex-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">Análisis completo de reputación</p>
              <p className="text-xs text-muted-foreground line-clamp-1">Reseñas, sentimiento y más</p>
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

  // Pro version - show real data
  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning" />
          <h4 className="font-semibold text-foreground text-sm">Reputación</h4>
        </div>
        {hasGooglePlace ? (
          <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
            Activo
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            Sin Google Maps
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Google Maps</span>
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
              {googleData?.placeName && ` · ${googleData.placeName}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 text-xs"
          onClick={() => navigate("/app/analytics?tab=reputacion")}
        >
          Ver más detalles
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        {hasGooglePlace && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </Button>
        )}
      </div>
    </GlassCard>
  );
};

export default ReputationWidget;
