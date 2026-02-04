import { useState, useCallback, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js";
import { Loader2, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import paypalLogo from "@/assets/payment/paypal-logo.png";

type PlanId = "pro_monthly" | "pro_yearly";

interface PayPalSmartButtonsProps {
  userId: string;
  userEmail?: string | null;
  planId: PlanId;
  country: string;
  localAmount: number;
  localCurrency: string;
  onSuccessRedirectUrl: string;
}

export const PayPalSmartButtons = ({
  userId,
  userEmail,
  planId,
  country,
  localAmount,
  localCurrency,
  onSuccessRedirectUrl,
}: PayPalSmartButtonsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>("es_ES");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const usdAmount = planId === "pro_yearly" ? 290 : 29;

  // Fetch client ID on mount
  useEffect(() => {
    let cancelled = false;
    
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase.functions.invoke("paypal-client-config", {
          body: { country },
        });

        if (cancelled) return;

        if (error) {
          console.error("[PayPalSmartButtons] config error:", error);
          throw new Error("No se pudo cargar la configuración de PayPal.");
        }

        if (!data?.clientId) {
          throw new Error("PayPal no está configurado.");
        }

        setClientId(data.clientId);
        setLocale(data.locale || "es_ES");
      } catch (e) {
        if (cancelled) return;
        console.error("[PayPalSmartButtons] init error:", e);
        const msg = e instanceof Error ? e.message : "Error desconocido";
        setErrorMsg(msg);
        toast.error(`No se pudo cargar PayPal: ${msg}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchConfig();
    
    return () => { cancelled = true; };
  }, [country]);

  const createOrder = useCallback(async () => {
    console.log("[PayPalSmartButtons] Creating order...");
    
    const { data, error } = await supabase.functions.invoke("paypal-create-order", {
      body: {
        userId,
        planId,
        country,
        email: userEmail || undefined,
        localAmount,
        localCurrency,
      },
    });

    if (error) {
      console.error("[PayPalSmartButtons] create order error:", error);
      throw new Error("No se pudo crear la orden de pago.");
    }

    if (!data?.orderId) {
      throw new Error(data?.error || "No se recibió orderId.");
    }

    console.log("[PayPalSmartButtons] Order created:", data.orderId);
    return data.orderId;
  }, [userId, planId, country, userEmail, localAmount, localCurrency]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onApprove = useCallback(async (data: any, actions: any) => {
    setIsProcessing(true);
    try {
      console.log("[PayPalSmartButtons] Capturing payment...", data?.orderID);
      const captureResult = await actions?.order?.capture?.();
      const status = captureResult?.status;
      console.log("[PayPalSmartButtons] Capture result:", status);

      if (status !== "COMPLETED") {
        throw new Error(`Pago no completado (estado: ${status || "desconocido"}).`);
      }

      window.location.href = onSuccessRedirectUrl;
    } catch (e) {
      console.error("[PayPalSmartButtons] capture error:", e);
      const msg = e instanceof Error ? e.message : "";
      toast.error(msg ? `No se pudo completar el pago: ${msg}` : "No se pudo completar el pago.");
      setIsProcessing(false);
    }
  }, [onSuccessRedirectUrl]);

  const onError = useCallback((err: Record<string, unknown>) => {
    console.error("[PayPalSmartButtons] PayPal error:", err);
    toast.error("Error al procesar el pago. Intentá de nuevo.");
    setIsProcessing(false);
  }, []);

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8 sm:py-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Preparando tu pago</p>
              <p className="text-sm text-muted-foreground">Cargando opciones seguras…</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientId || errorMsg) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center space-y-3 py-6">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-foreground">No pudimos cargar PayPal</p>
              <p className="text-sm text-muted-foreground mt-1">Intentá recargar la página</p>
            </div>
            {errorMsg && (
              <p className="text-xs text-destructive/80 bg-destructive/10 px-3 py-1.5 rounded-lg inline-block">
                {errorMsg}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden">
      <CardContent className="p-0">
        {/* Header with price */}
        <div className="p-4 sm:p-5 border-b border-border/50 bg-background/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0070ba]/10 flex items-center justify-center flex-shrink-0">
                <img 
                  src={paypalLogo} 
                  alt="PayPal" 
                  className="h-5 sm:h-6 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm sm:text-base">Pago seguro con PayPal</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Tarjeta o cuenta PayPal</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl sm:text-2xl font-bold text-primary">USD ${usdAmount}</p>
              {planId === "pro_yearly" && (
                <Badge variant="secondary" className="bg-success/10 text-success text-[10px] sm:text-xs mt-0.5">
                  2 meses gratis
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* PayPal Buttons */}
        <div className="p-4 sm:p-5 space-y-3">
          <PayPalScriptProvider
            options={{
              clientId,
              currency: "USD",
              intent: "capture",
              locale: locale as "es_ES" | "es_MX",
            }}
          >
            {/* PayPal Button */}
            <div className="paypal-button-wrapper">
              <PayPalButtons
                fundingSource={FUNDING.PAYPAL}
                style={{ 
                  layout: "vertical", 
                  shape: "rect", 
                  label: "paypal", 
                  height: 50,
                  tagline: false 
                }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                onCancel={() => setIsProcessing(false)}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground font-medium">o pagá con tarjeta</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Card Button (Guest checkout) */}
            <div className="paypal-button-wrapper">
              <PayPalButtons
                fundingSource={FUNDING.CARD}
                style={{ 
                  layout: "vertical", 
                  shape: "rect", 
                  label: "pay", 
                  height: 50 
                }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                onCancel={() => setIsProcessing(false)}
              />
            </div>
          </PayPalScriptProvider>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2 bg-primary/5 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="font-medium">Confirmando tu pago…</span>
            </div>
          )}
        </div>

        {/* Trust badges footer */}
        <div className="px-4 sm:px-5 py-3 bg-secondary/30 border-t border-border/30">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success" />
              <span>SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success" />
              <span>Protección al comprador</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span>Todas las tarjetas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
