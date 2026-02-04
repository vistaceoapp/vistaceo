import { useEffect, useMemo, useRef, useState } from "react";
import { loadScript } from "@paypal/paypal-js";
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
  const [isReady, setIsReady] = useState(false);
  const [isLoadingSdk, setIsLoadingSdk] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const paypalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const requestBody = useMemo(
    () => ({
      userId,
      planId,
      country,
      email: userEmail || undefined,
      localAmount,
      localCurrency,
    }),
    [userId, planId, country, userEmail, localAmount, localCurrency]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setIsLoadingSdk(true);

        const { data, error } = await supabase.functions.invoke("paypal-client-config", {
          body: { country },
        });

        if (error) {
          console.error("[PayPalSmartButtons] paypal-client-config error:", error);
          const details = (error as any)?.context?.response
            ? await (error as any).context.response.text().catch(() => "")
            : "";
          throw new Error(details || (error as any)?.message || "No se pudo cargar PayPal.");
        }

        const clientId = data?.clientId as string | undefined;
        const locale = data?.locale as string | undefined;
        if (!clientId) throw new Error("PayPal no está configurado (clientId faltante).");

        const paypal = await loadScript({
          clientId,
          currency: "USD",
          intent: "capture",
          components: "buttons",
          locale: locale || "es_ES",
        });

        if (!paypal) throw new Error("No se pudo cargar el SDK de PayPal.");
        if (cancelled) return;

        const createOrder = async () => {
          const { data: orderData, error: orderErr } = await supabase.functions.invoke(
            "paypal-create-order",
            { body: requestBody }
          );

          if (orderErr) {
            console.error("[PayPalSmartButtons] paypal-create-order error:", orderErr);
            const details = (orderErr as any)?.context?.response
              ? await (orderErr as any).context.response.text().catch(() => "")
              : "";
            throw new Error(details || (orderErr as any)?.message || "No se pudo iniciar el pago.");
          }

          const orderId = orderData?.orderId as string | undefined;
          if (!orderId) throw new Error(orderData?.error || "No se recibió orderId de PayPal.");
          return orderId;
        };

        const onApprove = async (_data: any, actions: any) => {
          setIsProcessing(true);
          try {
            const captureResult = await actions.order.capture();
            const status = captureResult?.status;

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
        };

        const onError = (err: any) => {
          console.error("[PayPalSmartButtons] PayPal Buttons error:", err);
          toast.error("No se pudo iniciar el pago con PayPal. Probá de nuevo.");
          setIsProcessing(false);
        };

        // Render PayPal button
        if (paypalRef.current) {
          paypalRef.current.innerHTML = "";
          paypal
            .Buttons({
              fundingSource: paypal.FUNDING.PAYPAL,
              style: { layout: "vertical", shape: "rect", label: "paypal" },
              createOrder,
              onApprove,
              onError,
              onCancel: () => setIsProcessing(false),
              onClick: () => setIsProcessing(false),
            })
            .render(paypalRef.current);
        }

        // Render Card button (guest card payment)
        if (cardRef.current) {
          cardRef.current.innerHTML = "";
          paypal
            .Buttons({
              fundingSource: paypal.FUNDING.CARD,
              style: { layout: "vertical", shape: "rect", label: "pay" },
              createOrder,
              onApprove,
              onError,
              onCancel: () => setIsProcessing(false),
              onClick: () => setIsProcessing(false),
            })
            .render(cardRef.current);
        }

        if (!cancelled) {
          setIsReady(true);
          setIsLoadingSdk(false);
        }
      } catch (e) {
        console.error("[PayPalSmartButtons] init error:", e);
        const msg = e instanceof Error ? e.message : "";
        toast.error(msg ? `No se pudo cargar el pago: ${msg}` : "No se pudo cargar el pago.");
        if (!cancelled) setIsLoadingSdk(false);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [country, onSuccessRedirectUrl, requestBody]);

  return (
    <Card className="border-border/50 bg-secondary/20">
      <CardContent className="p-4 space-y-3">
        {isLoadingSdk ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando opciones de pago…</span>
          </div>
        ) : !isReady ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No pudimos cargar PayPal en este momento.
          </div>
        ) : (
          <div className="space-y-3">
            <div ref={paypalRef} />
            <div ref={cardRef} />
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Confirmando pago…</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
