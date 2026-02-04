import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import paypalLogo from "@/assets/payment/paypal-logo.png";

interface StickyPayPalButtonProps {
  /** Ref to the main payment button/section to observe */
  mainButtonRef: React.RefObject<HTMLDivElement>;
  /** Price text to display */
  priceText: string;
  /** Currency */
  currency: string;
  /** Whether this is yearly plan */
  isYearly: boolean;
  /** Handler to scroll back to main payment section */
  onScrollToPayment: () => void;
}

export const StickyPayPalButton = ({
  mainButtonRef,
  priceText,
  currency,
  isYearly,
  onScrollToPayment,
}: StickyPayPalButtonProps) => {
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
                  <span className="text-lg font-bold text-foreground">USD ${priceText}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 text-success" />
                  <span>Pago seguro</span>
                  {isYearly && (
                    <span className="text-success font-medium">• 2 meses gratis</span>
                  )}
                </div>
              </div>

              {/* Scroll to payment button */}
              <button
                onClick={onScrollToPayment}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 rounded-xl",
                  "bg-[#0070ba] hover:bg-[#003087] transition-colors",
                  "text-white font-semibold shadow-lg"
                )}
              >
                <img
                  src={paypalLogo}
                  alt="PayPal"
                  className="h-5 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="hidden sm:inline">Ir a pagar</span>
                <CreditCard className="w-4 h-4 sm:hidden" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
