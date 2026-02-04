import { motion } from "framer-motion";
import { Crown, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProUpgradeBannerProps {
  variant?: "minimal" | "compact" | "full";
  className?: string;
}

export const ProUpgradeBanner = ({ 
  variant = "compact",
  className 
}: ProUpgradeBannerProps) => {
  const navigate = useNavigate();

  if (variant === "minimal") {
    return (
      <button
        onClick={() => navigate("/checkout")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
          "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30",
          "text-amber-500 hover:from-amber-500/30 hover:to-orange-500/30",
          className
        )}
      >
        <Crown className="w-3 h-3" />
        Pro
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative p-4 rounded-2xl overflow-hidden",
          "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10",
          "border border-amber-500/20",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Desbloquea todo el poder de VistaCEO
              </p>
              <p className="text-xs text-muted-foreground">
                Analytics, predicciones, voz y más
              </p>
            </div>
          </div>
          
          <Button 
            size="sm"
            className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            onClick={() => navigate("/checkout")}
          >
            Ver Pro
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-6 rounded-3xl overflow-hidden",
        "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10",
        "border border-amber-500/20",
        className
      )}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 animate-shimmer"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
      
      <div className="relative">
        <div className="flex items-start gap-4 mb-4">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            <Crown className="w-7 h-7 text-white" />
          </motion.div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Actualiza a VistaCEO Pro
            </h3>
            <p className="text-sm text-muted-foreground">
              Desbloquea el cerebro completo: analytics avanzado, predicciones IA, 
              conversaciones por voz, y mucho más.
            </p>
          </div>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["Misiones ilimitadas", "Analytics IA", "Voz y fotos", "Radar completo"].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          className="w-full group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          onClick={() => navigate("/checkout")}
        >
          <Zap className="w-4 h-4 mr-2" />
          Desbloquear Pro — 7 días de garantía
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};
