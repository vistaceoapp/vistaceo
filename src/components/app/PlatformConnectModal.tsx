import { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
  },
  facebook: {
    name: "Facebook Page",
    description: "Conecta tu página de Facebook para monitorear reseñas y mensajes.",
    oauthSupported: true,
  },
  web: {
    name: "Tu Web / Ecommerce",
    description: "Agrega un script de tracking a tu sitio web para monitorear visitas, conversiones y comportamiento.",
    oauthSupported: false,
  },
  youtube: {
    name: "YouTube",
    description: "Conecta tu canal de YouTube para analizar suscriptores, vistas y engagement.",
    oauthSupported: true,
  },
  tiktok: {
    name: "TikTok",
    description: "Conecta tu cuenta de TikTok para analizar seguidores y engagement de videos.",
    oauthSupported: true,
    comingSoon: true,
  },
};

export const PlatformConnectModal = ({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: PlatformConnectModalProps) => {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [trackingScript, setTrackingScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  if (!platform) return null;

  const info = platformInfo[platform];

  const handleOAuthConnect = async () => {
    if (!currentBusiness || !user) return;
    
    setLoading(true);
    setSetupError(null);

    try {
      let functionName = "";
      
      if (platform === "google" || platform === "youtube") {
        functionName = "google-oauth-start";
      } else if (platform === "instagram" || platform === "facebook") {
        functionName = "meta-oauth-start";
      } else if (platform === "tiktok") {
        functionName = "tiktok-oauth-start";
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
        // Facebook/Instagram bloquean ser cargados dentro de iframes (X-Frame-Options),
        // así que abrimos el OAuth en una pestaña nueva.
        const opened = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!opened) {
          // Fallback si el navegador bloquea popups
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
          ) : platform === "web" ? (
            <>
              {!trackingScript ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">URL de tu sitio web</Label>
                    <Input
                      id="website"
                      placeholder="https://tusitio.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>¿Qué trackearemos?</strong>
                      <br />• Visitas y páginas vistas
                      <br />• Clics y formularios
                      <br />• Carritos y compras (ecommerce)
                      <br />• Comentarios y engagement
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleWebAnalyticsSetup}
                    disabled={loading || !websiteUrl}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando script...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Generar script de tracking
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center">
                    <Check className="w-6 h-6 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium text-success">¡Script generado!</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Tu script de tracking</Label>
                    <div className="relative">
                      <pre className="bg-secondary rounded-lg p-3 text-xs overflow-x-auto max-h-32">
                        {trackingScript}
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={copyScript}
                      >
                        {copied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Instrucciones:</strong>
                      <br />1. Copia el script de arriba
                      <br />2. Pégalo antes de {"</head>"} en tu sitio
                      <br />3. Los datos comenzarán a aparecer en 24h
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    Listo
                  </Button>
                </div>
              )}
            </>
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
