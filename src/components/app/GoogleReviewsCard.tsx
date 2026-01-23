import { useState } from "react";
import { 
  RefreshCw, 
  MapPin, 
  Settings2, 
  MessageSquare, 
  ThumbsUp, 
  Star,
  Loader2,
  Check,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GoogleReviewsCardProps {
  connected: boolean;
  metadata?: Record<string, any>;
  reviewCount: number;
  avgRating: number;
  responseRate: number;
  lastSync?: string;
  onConnect: () => void;
  onChangeLocation: () => void;
  onSyncComplete?: () => void;
  businessId: string;
  className?: string;
}

export const GoogleReviewsCard = ({
  connected,
  metadata,
  reviewCount,
  avgRating,
  responseRate,
  lastSync,
  onConnect,
  onChangeLocation,
  onSyncComplete,
  businessId,
  className,
}: GoogleReviewsCardProps) => {
  const [syncing, setSyncing] = useState(false);

  const handleResync = async () => {
    if (!businessId || syncing) return;
    
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-sync-reviews", {
        body: { businessId }
      });

      if (error) throw error;

      toast({
        title: "✅ Sincronización completada",
        description: `${data?.synced || 0} reseñas sincronizadas`,
      });
      
      onSyncComplete?.();
    } catch (error) {
      console.error("Error syncing reviews:", error);
      toast({
        title: "Error",
        description: "No se pudieron sincronizar las reseñas",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Nunca";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
  };

  // Not connected state
  if (!connected) {
    return (
      <Card className={cn(
        "relative overflow-hidden border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer group",
        className
      )} onClick={onConnect}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
              <GoogleIcon />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Google Reviews</p>
              <p className="text-xs text-muted-foreground/70">No conectado</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Conectar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const locationName = metadata?.google_location_name || metadata?.location_name || metadata?.locationName;
  const accountEmail = metadata?.account_email;
  const hasLocation = !!locationName || !!metadata?.google_location_id;

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30",
      className
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <GoogleIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Google Reviews</p>
              <p className="text-[10px] text-muted-foreground">
                Sync: {formatTimeAgo(lastSync)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] bg-background/50">
            <Check className="w-2.5 h-2.5 mr-0.5" />
            Activo
          </Badge>
        </div>

        {/* Location & Account Info */}
        <div className="mb-3 p-2 rounded-lg bg-background/50 border border-border/50 space-y-1">
          {hasLocation ? (
            <>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium truncate">{locationName || "Ubicación conectada"}</span>
              </div>
              {accountEmail && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground truncate">{accountEmail}</span>
                </div>
              )}
            </>
          ) : (
            <button 
              onClick={onChangeLocation}
              className="flex items-center gap-2 text-xs w-full hover:bg-primary/5 rounded p-1 -m-1 transition-colors"
            >
              <AlertCircle className="w-3 h-3 text-warning flex-shrink-0" />
              <span className="text-warning font-medium">Selecciona tu negocio de Google</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </button>
          )}
        </div>

        {/* Main Score - Rating */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {avgRating > 0 ? avgRating.toFixed(1) : "-"}
            </span>
            <span className="text-sm text-muted-foreground">/ 5</span>
            <Star className="w-4 h-4 text-warning fill-warning ml-1" />
          </div>
          {avgRating > 0 && (
            <Progress value={(avgRating / 5) * 100} className="h-1.5 mt-2" />
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Reseñas:</span>
            <span className="font-medium text-foreground">{reviewCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <ThumbsUp className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Respondidas:</span>
            <span className="font-medium text-foreground">{responseRate}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={handleResync}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            {syncing ? "Sincronizando..." : "Re-sincronizar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={onChangeLocation}
          >
            <Settings2 className="w-3 h-3 mr-1" />
            Cambiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default GoogleReviewsCard;
