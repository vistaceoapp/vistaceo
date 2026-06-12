import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { Brain, Sparkles, Target, TrendingUp, Lightbulb, CheckCircle2 } from "lucide-react";

/**
 * Splash post-setup: prepara el dashboard premium del usuario Free
 * - Invoca `seed-initial-insights` (genera 1 misión + 2 oportunidades + 2 tendencias)
 * - Muestra animación con fases narradas mientras espera
 * - Idempotente: si ya hay contenido suficiente, redirige instantáneo
 * - Mínimo 4s en pantalla para dar sensación de calidad y máximo 45s para no trabarse
 */

interface Phase {
  icon: typeof Brain;
  label: string;
  detail: string;
}

const PHASES: Phase[] = [
  {
    icon: Brain,
    label: "Analizando tu negocio",
    detail: "Leyendo cada respuesta de tu configuración y armando tu identidad estratégica.",
  },
  {
    icon: TrendingUp,
    label: "Detectando oportunidades únicas",
    detail: "Cruzando tu sector, ubicación y modelo para encontrar las 2 oportunidades de mayor impacto.",
  },
  {
    icon: Lightbulb,
    label: "Cazando tendencias relevantes",
    detail: "Filtrando 180+ fuentes para traerte 2 tendencias que realmente te tocan.",
  },
  {
    icon: Target,
    label: "Diseñando tu primera misión",
    detail: "Construyendo el plan de 5-7 pasos perfecto para arrancar esta semana.",
  },
  {
    icon: Sparkles,
    label: "Dejando todo listo",
    detail: "Cacheando para que tu dashboard cargue al instante para siempre.",
  },
];

const PreparingDashboardPage = () => {
  const navigate = useNavigate();
  const { currentBusiness, loading: businessLoading } = useBusiness();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const startedAt = useRef(Date.now());
  const triggered = useRef(false);

  // Rotador de fases (cada 3.5s)
  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIdx((i) => (i < PHASES.length - 1 ? i + 1 : i));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Lanzar bootstrap UNA sola vez
  useEffect(() => {
    if (triggered.current) return;
    if (businessLoading || !currentBusiness?.id) return;
    triggered.current = true;

    const businessId = currentBusiness.id;
    const MIN_SHOW_MS = 4500;
    const TIMEOUT_MS = 45000;

    const goToDashboard = async () => {
      const elapsed = Date.now() - startedAt.current;
      const wait = Math.max(0, MIN_SHOW_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));
      setDone(true);
      setTimeout(() => navigate("/app", { replace: true }), 900);
    };

    (async () => {
      try {
        // Idempotencia ROBUSTA: marcador explícito en businesses.settings.seeding_completed_at
        // (lo escribe seed-initial-insights al terminar). No depende de conteos frágiles.
        const { data: bizRow } = await supabase
          .from("businesses")
          .select("settings")
          .eq("id", businessId)
          .maybeSingle();
        const settings = (bizRow?.settings as Record<string, unknown> | null) ?? {};
        if (settings.seeding_completed_at) {
          await goToDashboard();
          return;
        }

        // Lanzar seed con timeout (no bloquea si tarda)
        const seedPromise = supabase.functions.invoke("seed-initial-insights", {
          body: { businessId },
        });
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve({ error: { message: "timeout" } }), TIMEOUT_MS),
        );
        await Promise.race([seedPromise, timeoutPromise]);
      } catch (err) {
        console.warn("[PreparingDashboard] seed failed (non-blocking):", err);
      }
      await goToDashboard();
    })();
  }, [businessLoading, currentBusiness?.id, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full bg-primary/15 blur-[160px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-accent/15 blur-[140px] animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl text-center"
      >
        {/* Logo + halo premium */}
        <div className="relative inline-flex mb-10">
          <div className="absolute inset-0 -m-10 rounded-full bg-gradient-to-br from-primary/25 to-accent/25 blur-3xl animate-pulse" />
          {done ? (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
            >
              <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <div className="relative w-28 h-28 rounded-3xl bg-card border border-border/60 flex items-center justify-center shadow-xl">
              <VistaceoLogo size={72} variant="icon" />
            </div>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
          {done ? "Tu dashboard está listo" : "Preparando tu dashboard"}
        </h1>
        <p className="text-base text-muted-foreground mb-12 max-w-md mx-auto">
          {done
            ? "Llevamos cada detalle al máximo. Entrá y descubrilo."
            : "Estamos pensando como tu CEO. Generamos contenido único, no plantillas."}
        </p>

        {/* Fase activa */}
        <div className="min-h-[140px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-card/80 backdrop-blur border border-border/60 flex items-center justify-center shadow-sm">
                {(() => {
                  const Icon = PHASES[phaseIdx].icon;
                  return <Icon className="w-6 h-6 text-primary" />;
                })()}
              </div>
              <p className="text-lg font-semibold text-foreground">{PHASES[phaseIdx].label}</p>
              <p className="text-sm text-muted-foreground max-w-md">{PHASES[phaseIdx].detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {PHASES.map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full bg-muted overflow-hidden"
              animate={{ width: i === phaseIdx ? 36 : 10 }}
              transition={{ duration: 0.4 }}
            >
              {i <= phaseIdx && (
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: i === phaseIdx ? 3.4 : 0.2, ease: "easeOut" }}
                />
              )}
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground/70">
          Esto pasa una sola vez. Después, tu dashboard cargará al instante.
        </p>
      </motion.div>
    </div>
  );
};

export default PreparingDashboardPage;
