import { useState, useEffect } from "react";
import { 
  Star, MapPin, RefreshCw, Loader2, 
  CheckCircle2, Crown, AlertCircle, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useSubscription } from "@/hooks/use-subscription";
import { toast } from "@/hooks/use-toast";

/**
 * Replaces GoogleBusinessProfileSection.
 * Uses ONLY Google Places API (public data) - no OAuth required.
 * Pro users get full data automatically. Free users see locked state.
 */
export const GooglePlacesReputationSection = () => {
  const { currentBusiness } = useBusiness();
  const { isPro } = useSubscription();
  const [integration, setIntegration] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchIntegration();
  }, [currentBusiness]);

  const fetchIntegration = async () => {
    if (!currentBusiness) { setLoading(false); return; }
    try {
      const { data } = await supabase
        .from("business_integrations")
        .select("id, status, metadata, last_sync_at")
        .eq("business_id", currentBusiness.id)
        .eq("integration_type", "google_places")
        .maybeSingle();
      setIntegration(data);
    } catch (e) {
      console.error("Error fetching integration:", e);
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
      toast({
        title: "✅ Datos sincronizados",
        description: `${data?.synced || 0} reseñas importadas desde Google Maps`,
      });
      fetchIntegration();
    } catch {
      toast({ title: "Error", description: "No se pudieron sincronizar los datos", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const meta = integration?.metadata as Record<string, any> | null;
  const hasGooglePlace = !!currentBusiness?.google_place_id;
  const isActive = integration?.status === "active";

  const formatTimeAgo = (d?: string | null) => {
    if (!d) return "Nunca";
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return "Ahora";
    if (diff < 60) return `Hace ${diff}m`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
    return `Hace ${Math.floor(diff / 1440)} días`;
  };

  if (loading) {
    return (
      <GlassCard className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </GlassCard>
    );
  }

  // Not Pro - locked
  if (!isPro) {
    return (
      <GlassCard className="p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">Función Pro</p>
            <p className="text-xs text-muted-foreground mt-1">
              Desbloqueá análisis completo de reputación desde Google Maps
            </p>
          </div>
        </div>
        <div className="opacity-30">
          <div className="flex items-center gap-3">
            <GoogleIcon />
            <div>
              <p className="font-medium text-foreground">Google Maps</p>
              <p className="text-xs text-muted-foreground">Reseñas y datos públicos</p>
            </div>
          </div>
        </div>
        {hasGooglePlace && currentBusiness?.avg_rating && (
          <div className="mt-3 p-3 rounded-lg bg-secondary/50 relative z-0">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-foreground font-medium">Datos básicos disponibles</span>
              <Badge variant="outline" className="text-[10px]">Free</Badge>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 text-warning fill-warning" />
              <span>{currentBusiness.avg_rating} estrellas</span>
            </div>
          </div>
        )}
      </GlassCard>
    );
  }

  // Pro - no google_place_id configured
  if (!hasGooglePlace) {
    return (
      <GlassCard className="p-4 border-warning/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <GoogleIcon />
          </div>
          <div>
            <p className="font-semibold text-foreground">Google Maps</p>
            <p className="text-xs text-warning font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Agregá tu negocio en Configuraciones
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Buscá tu negocio en Google Maps desde la sección de Configuraciones para activar el análisis automático de reputación.
        </p>
      </GlassCard>
    );
  }

  // Pro - has google_place_id - show data
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <GoogleIcon />
          </div>
          <div>
            <p className="font-semibold text-foreground">Google Maps</p>
            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
              Activo
            </Badge>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
          <Crown className="w-2.5 h-2.5 mr-0.5" /> PRO
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        {meta?.place_name && (
          <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-secondary/50">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-foreground font-medium">{meta.place_name}</span>
          </div>
        )}
        {meta?.rating && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span>{meta.rating} estrellas · {meta.review_count || 0} reseñas</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span>Datos públicos de Google Maps</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          <span>Última sync: {formatTimeAgo(integration?.last_sync_at)}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleSync} disabled={syncing}>
        {syncing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
        {syncing ? "Sincronizando..." : "Sincronizar datos"}
      </Button>
    </GlassCard>
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

export default GooglePlacesReputationSection;
