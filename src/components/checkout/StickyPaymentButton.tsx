import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ArrowRight, Loader2, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        rootMargin: "-100px 0px 0px 0px", // Start showing a bit before button leaves viewport
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
            "bg-background/95 backdrop-blur-xl border-t border-border/50",
            "shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]",
            "safe-area-inset-bottom"
          )}
        >
          <div className="container max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Price info - compact */}
              <div className="flex-shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-foreground">{priceText}</span>
                  <span className="text-xs text-muted-foreground">{currency}/mes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 text-success" />
                  <span>Pago seguro</span>
                  {isYearly && (
                    <span className="text-success font-medium">• 2 meses gratis</span>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="gradient-primary shadow-lg flex-shrink-0 h-12 px-6"
                onClick={onClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Procesando...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{buttonText}</span>
                    <span className="sm:hidden">Pagar</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
