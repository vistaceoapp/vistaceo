import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronUp, CreditCard, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
            "border-t border-[#0070ba]/30",
            "shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.2)]"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Gradient top border - PayPal colors */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0070ba]/50 via-[#003087]/50 to-[#0070ba]/50" />
          
          <div className="container max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Price info - mobile optimized */}
              <div className="flex-shrink-0 min-w-0">
                <div className="flex items-center gap-2">
                  {/* PayPal logo - mobile */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#0070ba]/10 flex items-center justify-center flex-shrink-0 sm:hidden">
                    <img 
                      src={paypalLogo} 
                      alt="PP"
                      className="h-5 w-5 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-bold text-foreground">USD ${priceText}</span>
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

              {/* Scroll to payment button - PayPal branded */}
              <button
                onClick={onScrollToPayment}
                className={cn(
                  "flex items-center gap-2 sm:gap-3",
                  "h-11 sm:h-12 px-4 sm:px-6 rounded-xl",
                  "bg-[#0070ba] hover:bg-[#003087] active:scale-[0.98]",
                  "text-white font-semibold text-sm sm:text-base",
                  "shadow-lg shadow-[#0070ba]/25",
                  "transition-all duration-200"
                )}
              >
                <img
                  src={paypalLogo}
                  alt="PayPal"
                  className="h-4 sm:h-5 w-auto object-contain brightness-0 invert"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="hidden sm:inline">Ir al pago</span>
                <span className="sm:hidden">Pagar</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
