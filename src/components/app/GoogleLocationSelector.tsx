import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, MapPin, Store, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GoogleLocation {
  id: string;
  name: string;
  address: string;
  accountId: string;
  accountName: string;
}

interface GoogleLocationSelectorProps {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelected: () => void;
}

export const GoogleLocationSelector = ({
  businessId,
  open,
  onOpenChange,
  onLocationSelected,
}: GoogleLocationSelectorProps) => {
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && businessId) {
      fetchLocations();
    }
  }, [open, businessId]);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("google-business-locations", {
        body: { businessId }
      });

      if (error) {
        // supabase-js throws for non-2xx; we want friendlier UX for quota errors.
        const anyErr = error as any;
        const status = anyErr?.context?.status ?? anyErr?.status;
        if (status === 429) {
          setError(
            "Google está aplicando/limitando la cuota de la API (429). Esperá 5–10 minutos y reintentá."
          );
          return;
        }

        throw error;
      }

      if (data?.error) {
        setError(data.error);
        if (data.message) {
          toast({
            title: "Información",
            description: data.message,
          });
        }
        return;
      }

      setLocations(data?.locations || []);

      if (data?.locations?.length === 0) {
        setError("No se encontraron negocios en tu cuenta de Google Business Profile.");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      const anyErr = error as any;
      const status = anyErr?.context?.status ?? anyErr?.status;
      if (status === 429) {
        setError(
          "Google está aplicando/limitando la cuota de la API (429). Esperá 5–10 minutos y reintentá."
        );
      } else {
        setError("Error al obtener los negocios. Intenta reconectar tu cuenta de Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = async (location: GoogleLocation) => {
    setSelecting(location.id);

    try {
      const { data, error } = await supabase.functions.invoke("google-select-location", {
        body: {
          businessId,
          locationId: location.id,
          locationName: location.name,
          locationAddress: location.address,
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Negocio conectado",
        description: `${location.name} conectado correctamente. Sincronizando reseñas...`,
      });

      // Trigger initial sync
      syncReviews();

      onLocationSelected();
      onOpenChange(false);
    } catch (error) {
      console.error("Error selecting location:", error);
      toast({
        title: "Error",
        description: "No se pudo conectar el negocio. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSelecting(null);
    }
  };

  const syncReviews = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("google-sync-reviews", {
        body: { businessId }
      });

      if (error) {
        console.error("Sync error:", error);
        return;
      }

      if (data?.synced > 0) {
        toast({
          title: "🔄 Reseñas sincronizadas",
          description: `${data.synced} reseñas importadas de ${data.location}`,
        });
      }
    } catch (error) {
      console.error("Error syncing reviews:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Selecciona tu negocio
          </DialogTitle>
          <DialogDescription>
            Elige el negocio de Google Business Profile que quieres conectar para sincronizar reseñas.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Buscando tus negocios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchLocations}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron negocios.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Asegúrate de tener un negocio verificado en Google Business Profile.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  disabled={selecting !== null}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selecting === location.id && "border-primary bg-primary/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {location.name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {location.address || "Sin dirección"}
                      </p>
                    </div>
                    {selecting === location.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground/30" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
