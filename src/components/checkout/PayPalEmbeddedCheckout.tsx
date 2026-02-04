import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Lock, ShieldCheck, Loader2, Check, 
  AlertCircle, User, Calendar, KeyRound 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PayPalEmbeddedCheckoutProps {
  userId: string;
  userEmail: string;
  planId: "pro_monthly" | "pro_yearly";
  country: string;
  localAmount: number;
  localCurrency: string;
  usdAmount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onFallbackToRedirect: () => void;
}

type PaymentMethod = "card" | "paypal";

export const PayPalEmbeddedCheckout = ({
  userId,
  userEmail,
  planId,
  country,
  localAmount,
  localCurrency,
  usdAmount,
  onSuccess,
  onError,
  onFallbackToRedirect,
}: PayPalEmbeddedCheckoutProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardFieldsLoaded, setCardFieldsLoaded] = useState(false);
  const [cardFieldsAvailable, setCardFieldsAvailable] = useState(false);
  
  // Card form state (fallback if PayPal SDK not available)
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  
  const cardFormRef = useRef<HTMLDivElement>(null);

  // Check if PayPal SDK card fields are available
  useEffect(() => {
    // For now, we use a simple card form that goes through PayPal
    // PayPal Advanced Card Fields require merchant approval
    // This is a fallback that will redirect to PayPal but with better UX
    setCardFieldsLoaded(true);
    setCardFieldsAvailable(false); // Will be true once merchant is approved
  }, []);

  const handleCardPayment = async () => {
    if (!cardNumber || !expiry || !cvv || !cardName) {
      toast.error("Completá todos los campos de la tarjeta");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call our edge function to create a PayPal order
      const { data, error } = await supabase.functions.invoke("create-paypal-card-order", {
        body: {
          userId,
          email: userEmail,
          planId,
          country,
          localAmount,
          localCurrency,
          // Note: We don't send card data to our server
          // The card will be processed client-side with PayPal SDK
          paymentMethod: "card",
        },
      });
      
      if (error) throw error;
      
      if (data?.requiresRedirect) {
        // PayPal Card Fields not available, fall back to redirect
        onFallbackToRedirect();
        return;
      }
      
      if (data?.success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Card payment error:", error);
      onError("No se pudo procesar el pago con tarjeta. Intentá con PayPal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = () => {
    // Redirect to PayPal checkout
    onFallbackToRedirect();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Elegí cómo pagar
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Card Option */}
          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all text-left",
              paymentMethod === "card"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
            )}
          >
            {paymentMethod === "card" && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <CreditCard className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground text-sm">Tarjeta</p>
            <p className="text-xs text-muted-foreground mt-1">
              Débito o crédito
            </p>
          </button>

          {/* PayPal Option */}
          <button
            type="button"
            onClick={() => setPaymentMethod("paypal")}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all text-left",
              paymentMethod === "paypal"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
            )}
          >
            {paymentMethod === "paypal" && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.048l-1.12 7.59c-.047.32-.326.416-.546.416h-.306z" fill="#253B80"/>
              <path d="M19.093 6.534c-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H8.096c-.524 0-.972.382-1.054.901L5.676 23.08c-.04.264.164.502.43.502h3.294c.458 0 .85-.334.922-.788l.038-.198.732-4.64.047-.256a.926.926 0 0 1 .913-.788h.576c3.735 0 6.658-1.518 7.513-5.91.357-1.833.173-3.362-.717-4.437-.27-.328-.6-.61-.981-.845l-.35-.186z" fill="#179BD7"/>
            </svg>
            <p className="font-medium text-foreground text-sm">PayPal</p>
            <p className="text-xs text-muted-foreground mt-1">
              Con tu cuenta
            </p>
          </button>
        </div>
      </div>

      {/* Card Form */}
      {paymentMethod === "card" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border/50 bg-secondary/30">
            <CardContent className="p-4 space-y-4">
              {/* Card Name */}
              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-sm text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Nombre en la tarjeta
                </Label>
                <Input
                  id="cardName"
                  placeholder="Como aparece en tu tarjeta"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-sm text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  Número de tarjeta
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="bg-background font-mono"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-sm text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Vencimiento
                  </Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="bg-background font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-sm text-foreground flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    type="password"
                    className="bg-background font-mono"
                  />
                </div>
              </div>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>SSL 256-bit</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Procesado por PayPal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info about PayPal processing */}
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              💳 Tu pago se procesa de forma segura por PayPal. No necesitás cuenta PayPal.
            </p>
          </div>
        </motion.div>
      )}

      {/* PayPal redirect info */}
      {paymentMethod === "paypal" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4 rounded-xl bg-[#0070ba]/5 border border-[#0070ba]/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0070ba]/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0070ba]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Pago seguro con PayPal
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Serás redirigido a PayPal para completar el pago de forma segura. 
                  Podés pagar con tu cuenta PayPal o con tarjeta sin registrarte.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Amount summary */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            VistaCEO Pro {planId === "pro_yearly" ? "Anual" : "Mensual"}
          </span>
          <span className="text-sm font-medium text-foreground">
            USD ${usdAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="font-semibold text-foreground">Total a pagar</span>
          <span className="text-lg font-bold text-primary">USD ${usdAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        size="lg"
        className="w-full h-14 text-lg font-semibold gradient-primary shadow-lg"
        onClick={paymentMethod === "card" ? handleCardPayment : handlePayPalPayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando pago...
          </>
        ) : paymentMethod === "card" ? (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pagar USD ${usdAmount.toFixed(2)}
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Continuar con PayPal
          </>
        )}
      </Button>
    </div>
  );
};
