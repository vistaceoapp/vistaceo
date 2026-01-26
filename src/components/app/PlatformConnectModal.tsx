import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ExternalLink, 
  Globe, 
  Copy, 
  Check,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MetaRequirementsGuide } from "./MetaRequirementsGuide";
import type { PlatformType } from "./PlatformReputationCard";

interface PlatformConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PlatformType | null;
  onSuccess?: () => void;
}

const platformInfo: Record<PlatformType, {
  name: string;
  description: string;
  oauthSupported: boolean;
  comingSoon?: boolean;
  requiresMetaGuide?: boolean;
}> = {
  google: {
    name: "Google Reviews",
    description: "Conecta tu perfil de Google Business para monitorear reseñas y respuestas.",
    oauthSupported: true,
  },
  instagram: {
    name: "Instagram Business",
    description: "Conecta tu cuenta de Instagram Business para analizar engagement y menciones.",
    oauthSupported: true,
    requiresMetaGuide: true,
  },
  facebook: {
    name: "Facebook Page",
    description: "Conecta tu página de Facebook para monitorear reseñas y mensajes.",
    oauthSupported: true,
    requiresMetaGuide: true,
  },
  // Web Analytics removido temporalmente
};

export const PlatformConnectModal = ({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: PlatformConnectModalProps) => {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [trackingScript, setTrackingScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [showMetaGuide, setShowMetaGuide] = useState(true);
  const [noPagesError, setNoPagesError] = useState(false);

  // Check for OAuth error in URL params
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth");
    const reason = searchParams.get("reason");
    const provider = searchParams.get("provider");

    if (oauthStatus === "error" && provider === "meta" && reason === "no_pages") {
      setNoPagesError(true);
      setShowMetaGuide(true);
    }
  }, [searchParams]);

  // Reset state when modal opens/closes or platform changes
  useEffect(() => {
    if (open && platform) {
      const info = platformInfo[platform];
      setShowMetaGuide(info?.requiresMetaGuide ?? false);
      setSetupError(null);
      setNoPagesError(false);
    }
  }, [open, platform]);

  if (!platform) return null;

  const info = platformInfo[platform];

  const handleOAuthConnect = async () => {
    if (!currentBusiness || !user) return;
    
    setLoading(true);
    setSetupError(null);

    try {
      let functionName = "";
      
      if (platform === "google") {
        functionName = "google-oauth-start";
      } else if (platform === "instagram" || platform === "facebook") {
        functionName = "meta-oauth-start";
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          businessId: currentBusiness.id,
          userId: user.id,
          platform,
        }
      });

      if (error) throw error;

      if (data?.needsSetup) {
        setSetupError(data.setupInstructions?.join("\n") || "Configuración requerida");
        return;
      }

      if (data?.url) {
        // Facebook/Instagram block being loaded inside iframes (X-Frame-Options),
        // so we open OAuth in a new tab.
        const opened = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!opened) {
          // Fallback if browser blocks popups
          window.location.assign(data.url);
        } else {
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error("Error starting OAuth:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la conexión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWebAnalyticsSetup = async () => {
    if (!currentBusiness || !websiteUrl) return;
    
    setLoading(true);
    setSetupError(null);

    try {
      const { data, error } = await supabase.functions.invoke("setup-web-analytics", {
        body: { 
          businessId: currentBusiness.id,
          websiteUrl,
        }
      });

      if (error) throw error;

      if (data?.trackingScript) {
        setTrackingScript(data.trackingScript);
        toast({
          title: "✅ Web Analytics configurado",
          description: "Copia el script y pégalo en tu sitio web.",
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error setting up web analytics:", error);
      toast({
        title: "Error",
        description: "No se pudo configurar el tracking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyScript = () => {
    if (trackingScript) {
      navigator.clipboard.writeText(trackingScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Script copiado",
        description: "Pégalo antes de </head> en tu sitio web",
      });
    }
  };

  const renderMetaContent = () => {
    // Show error state if no pages were found
    if (noPagesError) {
      return (
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive text-sm">No encontramos Páginas de Facebook</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu cuenta de Facebook no tiene ninguna Página vinculada. Necesitás una Página de Facebook 
                  para conectar {platform === "instagram" ? "Instagram" : "Facebook"}.
                </p>
              </div>
            </div>
          </div>

          <MetaRequirementsGuide 
            variant={platform === "facebook" ? "facebook" : platform === "instagram" ? "instagram" : "both"}
            onReady={() => {
              setNoPagesError(false);
              handleOAuthConnect();
            }}
          />
        </div>
      );
    }

    // Show requirements guide before OAuth
    if (showMetaGuide) {
      return (
        <MetaRequirementsGuide 
          variant={platform === "facebook" ? "facebook" : platform === "instagram" ? "instagram" : "both"}
          onReady={() => {
            setShowMetaGuide(false);
          }}
        />
      );
    }

    // Show OAuth connect button
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => setShowMetaGuide(true)}
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Ver requisitos
        </Button>

        <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
          <Check className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="font-medium text-success text-sm">¡Requisitos verificados!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ahora conectá tu cuenta de {info.name}
          </p>
        </div>

        <Button 
          className="w-full" 
          onClick={handleOAuthConnect}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Conectar con {info.name}
            </>
          )}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          Solo accedemos a métricas públicas. Nunca publicamos en tu nombre.
        </p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Conectar {info.name}
          </DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {info.comingSoon ? (
            <div className="text-center py-8">
              <Badge variant="secondary" className="mb-4">Próximamente</Badge>
              <p className="text-sm text-muted-foreground">
                Estamos trabajando para agregar esta integración pronto.
              </p>
            </div>
          ) : info.requiresMetaGuide ? (
            renderMetaContent()
          ) : (
            <>
              {setupError ? (
                <div className="space-y-4">
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                    <div className="flex gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-warning">Configuración requerida</p>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {setupError}
                    </pre>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSetupError(null)}
                  >
                    Volver
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Al hacer clic en "Conectar", serás redirigido a {info.name} para autorizar el acceso.
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleOAuthConnect}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Conectar con {info.name}
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground">
                    Solo accedemos a métricas públicas. Nunca publicamos en tu nombre.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformConnectModal;
