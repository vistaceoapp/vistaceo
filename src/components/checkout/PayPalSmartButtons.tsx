import { useState, useCallback, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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
      <Card className="border-border/50 bg-secondary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando opciones de pago…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientId || errorMsg) {
    return (
      <Card className="border-border/50 bg-secondary/20">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground py-4 text-center space-y-2">
            <p>No pudimos cargar PayPal en este momento.</p>
            {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-secondary/20">
      <CardContent className="p-4 space-y-3">
        <PayPalScriptProvider
          options={{
            clientId,
            currency: "USD",
            intent: "capture",
            locale: locale as "es_ES" | "es_MX",
          }}
        >
          {/* PayPal Button */}
          <PayPalButtons
            fundingSource={FUNDING.PAYPAL}
            style={{ layout: "vertical", shape: "rect", label: "paypal", height: 48 }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            onCancel={() => setIsProcessing(false)}
          />

          {/* Card Button (Guest checkout) */}
          <PayPalButtons
            fundingSource={FUNDING.CARD}
            style={{ layout: "vertical", shape: "rect", label: "pay", height: 48 }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            onCancel={() => setIsProcessing(false)}
          />
        </PayPalScriptProvider>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Confirmando pago…</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
