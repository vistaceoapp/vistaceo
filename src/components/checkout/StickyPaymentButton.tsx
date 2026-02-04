import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ArrowRight, Loader2, Lock, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import mercadopagoLogo from "@/assets/payment/mercadopago-logo.png";

interface StickyPaymentButtonProps {
  /** Ref to the main payment button/section to observe */
  mainButtonRef: React.RefObject<HTMLDivElement>;
  /** Whether the payment is being processed */
  isLoading: boolean;
  /** Click handler */
  onClick: () => void;
  /** Button text */
  buttonText: string;
  /** Price text to display */
  priceText: string;
  /** Currency */
  currency: string;
  /** Whether this is yearly plan */
  isYearly: boolean;
  /** Provider name */
  provider: "mercadopago" | "paypal";
}

export const StickyPaymentButton = ({
  mainButtonRef,
  isLoading,
  onClick,
  buttonText,
  priceText,
  currency,
  isYearly,
  provider,
}: StickyPaymentButtonProps) => {
  const [showSticky, setShowSticky] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!mainButtonRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when main button is NOT visible
        setShowSticky(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-100px 0px 0px 0px",
        threshold: 0,
      }
    );

    observerRef.current.observe(mainButtonRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [mainButtonRef]);

  return (
    <AnimatePresence>
      {showSticky && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-background/98 backdrop-blur-2xl",
            "border-t border-primary/20",
            "shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.2)]"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />
          
          <div className="container max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Price info - mobile optimized */}
              <div className="flex-shrink-0 min-w-0">
                <div className="flex items-center gap-2">
                  {/* MercadoPago logo - mobile */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#00A5E0]/10 flex items-center justify-center flex-shrink-0 sm:hidden">
                    <img 
                      src={mercadopagoLogo} 
                      alt="MP"
                      className="h-5 w-5 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-bold text-foreground">{priceText}</span>
                      <span className="text-xs text-muted-foreground">{currency}/mes</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Lock className="w-3 h-3 text-success flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Pago seguro</span>
                      {isYearly && (
                        <Badge variant="secondary" className="bg-success/10 text-success text-[9px] sm:text-[10px] py-0 px-1.5 hidden xs:inline-flex">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                          2 meses gratis
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button - fully responsive */}
              <Button
                size="lg"
                className={cn(
                  "gradient-primary shadow-lg shadow-primary/25 flex-shrink-0",
                  "h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-semibold",
                  "transition-all duration-200 active:scale-[0.98]"
                )}
                onClick={onClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden xs:inline">Procesando...</span>
                    <span className="xs:hidden">...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">{buttonText}</span>
                    <span className="sm:hidden">Pagar ahora</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to track visibility of main payment section
export const usePaymentButtonVisibility = () => {
  const [isMainVisible, setIsMainVisible] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-100px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(mainRef.current);
    return () => observer.disconnect();
  }, []);

  return { mainRef, isMainVisible, showSticky: !isMainVisible };
};
