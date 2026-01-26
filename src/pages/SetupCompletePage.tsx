import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { 
  CheckCircle2, 
  Rocket, 
  Sparkles, 
  TrendingUp, 
  Target,
  ChevronRight,
  PartyPopper,
  Crown,
  Zap
} from "lucide-react";
import confetti from "canvas-confetti";

const SetupCompletePage = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check for pending plan
  const pendingPlan = localStorage.getItem("pendingPlan");
  const pendingPlanTimestamp = localStorage.getItem("pendingPlanTimestamp");
  const hasPendingPlan = pendingPlan && pendingPlanTimestamp && 
    (Date.now() - parseInt(pendingPlanTimestamp)) < 24 * 60 * 60 * 1000; // 24 hours

  useEffect(() => {
    // Trigger confetti celebration with Pro colors if pending plan
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = hasPendingPlan 
      ? ['#F59E0B', '#F97316', '#FBBF24', '#8B5CF6', '#10B981']
      : ['#8B5CF6', '#A855F7', '#D946EF', '#10B981', '#F59E0B'];

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 50);

    // Show content after initial animation
    setTimeout(() => setShowContent(true), 500);

    // Auto-redirect countdown for pending plan
    if (hasPendingPlan) {
      setCountdown(5);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev && prev <= 1) {
            clearInterval(countdownInterval);
            navigate("/app/upgrade", { replace: true });
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => {
        clearInterval(interval);
        clearInterval(countdownInterval);
      };
    }

    return () => clearInterval(interval);
  }, [hasPendingPlan, navigate]);

  const handleStart = () => {
    if (hasPendingPlan) {
      navigate("/app/upgrade", { replace: true });
    } else {
      navigate("/app", { replace: true });
    }
  };

  const features = [
    {
      icon: Target,
      title: "1 acción diaria",
      description: "Enfocada en lo que más impacta tu negocio",
    },
    {
      icon: TrendingUp,
      title: "Dashboard inteligente",
      description: "Salud de tu negocio en tiempo real",
    },
    {
      icon: Sparkles,
      title: "IA personalizada",
      description: "Aprende de tu negocio cada día",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        className="relative z-10 max-w-lg w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="w-14 h-14 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        {/* Celebration header */}
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Pro plan pending message */}
            {hasPendingPlan && (
              <div className="mb-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-500">
                  ¡Un paso más para activar Pro!
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-4">
              <PartyPopper className="w-6 h-6 text-warning" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                ¡Configuración completada!
              </span>
              <PartyPopper className="w-6 h-6 text-warning" />
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-3">
              {hasPendingPlan ? "¡Excelente! Tu negocio está listo" : "¡Listo! Tu negocio está configurado"}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              {hasPendingPlan 
                ? "Solo falta activar tu plan Pro para desbloquear todo el poder de VistaCEO."
                : "Tu CEO digital ya está analizando tu negocio y preparando recomendaciones personalizadas."
              }
            </p>

            {/* Countdown for Pro redirect */}
            {hasPendingPlan && countdown !== null && (
              <div className="mb-6 text-sm text-muted-foreground">
                Redirigiendo a pago en <span className="font-bold text-amber-500">{countdown}</span> segundos...
              </div>
            )}
          </motion.div>
        )}

        {/* Features preview */}
        {showContent && (
          <motion.div 
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Button */}
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button 
              size="lg" 
              onClick={handleStart}
              className={`w-full h-14 text-lg font-semibold gap-2 group ${
                hasPendingPlan 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
                  : ""
              }`}
            >
              {hasPendingPlan ? (
                <>
                  <Zap className="w-5 h-5" />
                  Activar Pro ahora
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                  Empezar a usar Vistaceo
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              {hasPendingPlan 
                ? "7 días de garantía. Si no ves valor, te devolvemos el 100%."
                : "Tu dashboard está listo y esperándote"
              }
            </p>
          </motion.div>
        )}

        {/* Logo footer */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <VistaceoLogo size={40} variant="icon" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SetupCompletePage;
