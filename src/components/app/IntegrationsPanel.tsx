import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Link2, 
  Star, 
  Instagram, 
  Facebook, 
  CreditCard, 
  Truck, 
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Loader2,
  Zap,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface Integration {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: any;
  category: "reviews" | "social" | "payments" | "delivery" | "analytics";
  status: "pending" | "connected" | "error" | "disconnected";
  color: string;
  comingSoon?: boolean;
  oauthEnabled?: boolean;
  accountEmail?: string;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: "google_reviews",
    type: "google_reviews",
    name: "Google Reviews",
    description: "Monitorea tus reseñas y responde a clientes",
    icon: Star,
    category: "reviews",
    status: "pending",
    color: "text-warning",
    oauthEnabled: true,
  },
  {
    id: "instagram",
    type: "instagram",
    name: "Instagram Business",
    description: "Analiza engagement y menciones",
    icon: Instagram,
    category: "social",
    status: "pending",
    color: "text-pink-500",
    comingSoon: true,
  },
  {
    id: "facebook",
    type: "facebook",
    name: "Facebook Page",
    description: "Reseñas y mensajes de clientes",
    icon: Facebook,
    category: "social",
    status: "pending",
    color: "text-blue-500",
    comingSoon: true,
  },
  {
    id: "whatsapp",
    type: "whatsapp",
    name: "WhatsApp Business",
    description: "Analiza conversaciones con clientes",
    icon: MessageCircle,
    category: "social",
    status: "pending",
    color: "text-success",
    comingSoon: true,
  },
  {
    id: "mercadopago",
    type: "mercadopago",
    name: "MercadoPago",
    description: "Ventas, cobros y métricas financieras",
    icon: CreditCard,
    category: "payments",
    status: "pending",
    color: "text-blue-400",
    comingSoon: true,
  },
  {
    id: "rappi",
    type: "rappi",
    name: "Rappi",
    description: "Pedidos, reseñas y performance",
    icon: Truck,
    category: "delivery",
    status: "pending",
    color: "text-orange-500",
    comingSoon: true,
  },
  {
    id: "pedidosya",
    type: "pedidosya",
    name: "PedidosYa",
    description: "Métricas de delivery y satisfacción",
    icon: Truck,
    category: "delivery",
    status: "pending",
    color: "text-red-500",
    comingSoon: true,
  },
  {
    id: "google_analytics",
    type: "google_analytics",
    name: "Google Analytics",
    description: "Tráfico web y comportamiento",
    icon: TrendingUp,
    category: "analytics",
    status: "pending",
    color: "text-orange-400",
    comingSoon: true,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  reviews: "Reseñas",
  social: "Redes Sociales",
  payments: "Pagos",
  delivery: "Delivery",
  analytics: "Analytics",
};

interface IntegrationsPanelProps {
  variant?: "compact" | "full";
}

export const IntegrationsPanel = ({ variant = "full" }: IntegrationsPanelProps) => {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth");
    const provider = searchParams.get("provider");
    
    if (oauthStatus && provider) {
      if (oauthStatus === "success") {
        toast({
          title: `✅ ${provider === "google" ? "Google Reviews" : provider} conectado`,
          description: "El sistema comenzará a sincronizar datos automáticamente.",
        });
        fetchIntegrations();
      } else if (oauthStatus === "error") {
        toast({
          title: "Error de conexión",
          description: `No se pudo conectar ${provider}. Intenta nuevamente.`,
          variant: "destructive",
        });
      }
      // Clear the URL params
      searchParams.delete("oauth");
      searchParams.delete("provider");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

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

      // Merge with available integrations
      const updatedIntegrations = AVAILABLE_INTEGRATIONS.map(integration => {
        const existing = data?.find(d => d.integration_type === integration.type);
        const metadata = existing?.metadata as { account_email?: string } | null;
        return {
          ...integration,
          status: (existing?.status || "pending") as Integration["status"],
          accountEmail: metadata?.account_email,
        };
      });

      setIntegrations(updatedIntegrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integration: Integration) => {
    if (!currentBusiness || !user || integration.comingSoon) return;
    
    setConnecting(integration.type);

    try {
      // For Google Reviews, use real OAuth
      if (integration.type === "google_reviews" && integration.oauthEnabled) {
        const { data, error } = await supabase.functions.invoke("google-oauth-start", {
          body: { 
            businessId: currentBusiness.id,
            userId: user.id
          }
        });

        if (error) throw error;

        if (data?.url) {
          // Redirect to Google OAuth
          window.location.href = data.url;
          return;
        }
      }

      // For other integrations (simulation for now)
      const { error } = await supabase
        .from("business_integrations")
        .upsert({
          business_id: currentBusiness.id,
          integration_type: integration.type,
          status: "connected",
          metadata: { connected_at: new Date().toISOString() },
        }, {
          onConflict: "business_id,integration_type"
        });

      if (error) throw error;

      toast({
        title: `✅ ${integration.name} conectado`,
        description: "El sistema comenzará a sincronizar datos automáticamente.",
      });

      fetchIntegrations();
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar la integración. Verifica tu configuración.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!currentBusiness) return;
    
    try {
      const { error } = await supabase
        .from("business_integrations")
        .update({ status: "disconnected", credentials: null })
        .eq("business_id", currentBusiness.id)
        .eq("integration_type", integration.type);

      if (error) throw error;

      toast({
        title: `${integration.name} desconectado`,
        description: "La integración ha sido desconectada.",
      });

      fetchIntegrations();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Error",
        description: "No se pudo desconectar la integración",
        variant: "destructive",
      });
    }
  };

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const totalCount = integrations.filter(i => !i.comingSoon).length;
  const connectionProgress = totalCount > 0 ? (connectedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="dashboard-card p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Integraciones</h4>
            <p className="text-xs text-muted-foreground">{connectedCount}/{totalCount} conectadas</p>
          </div>
        </div>
        <Progress value={connectionProgress} className="h-1.5 mb-3" />
        <div className="flex flex-wrap gap-2">
          {integrations.slice(0, 4).map(integration => {
            const Icon = integration.icon;
            return (
              <div 
                key={integration.id}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  integration.status === "connected" 
                    ? "bg-success/10 border border-success/30" 
                    : "bg-secondary border border-border opacity-50"
                )}
              >
                <Icon className={cn("w-4 h-4", integration.color)} />
              </div>
            );
          })}
          {integrations.length > 4 && (
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
              +{integrations.length - 4}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Group by category
  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = [];
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div className="dashboard-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 blur-lg bg-accent/30 rounded-full animate-pulse" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center relative shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Conecta tu negocio</h3>
            <p className="text-sm text-muted-foreground">
              Mientras más conectes, más inteligente seré
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{connectedCount}</span>
          <span className="text-sm text-muted-foreground">/{totalCount}</span>
          <p className="text-xs text-muted-foreground">conectadas</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 bg-secondary/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Poder del cerebro</span>
          <span className="text-sm text-primary font-semibold">{Math.round(connectionProgress)}%</span>
        </div>
        <Progress value={connectionProgress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {connectedCount === 0 
            ? "🔌 Conecta tu primera integración para empezar"
            : connectedCount < 3
            ? "🚀 ¡Buen comienzo! Conecta más para análisis profundo"
            : "🧠 ¡Excelente! Tengo acceso a mucha información valiosa"}
        </p>
      </div>

      {/* Integrations by category */}
      <div className="space-y-6">
        {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              {CATEGORY_LABELS[category]}
            </h4>
            <div className="space-y-2">
              {categoryIntegrations.map(integration => {
                const Icon = integration.icon;
                const isConnected = integration.status === "connected";
                const isConnecting = connecting === integration.type;

                return (
                  <div 
                    key={integration.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      isConnected 
                        ? "bg-success/5 border-success/30" 
                        : integration.comingSoon
                        ? "bg-secondary/30 border-border opacity-60"
                        : "bg-secondary/50 border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      isConnected ? "bg-success/10" : "bg-card"
                    )}>
                      <Icon className={cn("w-6 h-6", integration.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-foreground">{integration.name}</h5>
                        {isConnected && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                        {integration.comingSoon && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Próximamente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {isConnected && integration.accountEmail 
                          ? `Conectado: ${integration.accountEmail}`
                          : integration.description}
                      </p>
                    </div>

                    {!integration.comingSoon && (
                      <div className="flex items-center gap-2">
                        {isConnected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnect(integration)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Desconectar
                          </Button>
                        )}
                        <Button
                          variant={isConnected ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleConnect(integration)}
                          disabled={isConnecting}
                          className={cn(
                            isConnected && "text-success border-success/30 hover:bg-success/10"
                          )}
                        >
                          {isConnecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isConnected ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Reconectar
                            </>
                          ) : (
                            <>
                              {integration.oauthEnabled && <ExternalLink className="w-4 h-4 mr-1" />}
                              {!integration.oauthEnabled && <Link2 className="w-4 h-4 mr-1" />}
                              Conectar
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground mb-2">
          ¿No ves tu herramienta?
        </p>
        <Button variant="ghost" size="sm" className="text-primary">
          <MessageCircle className="w-4 h-4 mr-2" />
          Solicitar integración
        </Button>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
