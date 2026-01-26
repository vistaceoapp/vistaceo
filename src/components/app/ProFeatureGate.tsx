import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";

interface ProFeatureGateProps {
  children: ReactNode;
  feature: string;
  title?: string;
  description?: string;
}

export const ProFeatureGate = ({ 
  children, 
  feature,
  title = "Función Pro",
  description = "Desbloquea esta función con VistaCEO Pro"
}: ProFeatureGateProps) => {
  const navigate = useNavigate();
  const { isPro } = useSubscription();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl"
      >
        <div className="text-center p-6 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6">
            {description}
          </p>
          
          <Button 
            className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            onClick={() => navigate("/app/upgrade")}
          >
            <Crown className="w-4 h-4 mr-2" />
            Desbloquear con Pro
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
