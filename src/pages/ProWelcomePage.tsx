import { motion } from "framer-motion";
import { Crown, Sparkles, ArrowRight, Check, Zap, Brain, Target, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const ProWelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "¡Bienvenido a Pro! · VistaCEO";
    try {
      (window as any).dataLayer?.push({ event: "pro_purchase_complete" });
      (window as any).gtag?.("event", "conversion", { send_to: "pro_purchase" });
    } catch {}
  }, []);

  const features = [
    { icon: Brain, title: "Inteligencia Ejecutiva ilimitada", desc: "Análisis profundos sin restricciones" },
    { icon: Target, title: "Misiones estratégicas Pro", desc: "Planes accionables hechos a tu negocio" },
    { icon: TrendingUp, title: "Predicciones avanzadas", desc: "Anticipá tendencias con tu Gemelo Causal" },
    { icon: Zap, title: "Radar de oportunidades 24/7", desc: "Detección continua de palancas de crecimiento" },
  ];

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient gradient backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1400px] h-[1400px] rounded-full blur-[200px] bg-gradient-to-br from-primary via-accent to-primary"
          />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-15 bg-accent" />
          <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 bg-primary" />
        </div>

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Floating sparkles */}
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl"
          >
            {/* Crown badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.9, delay: 0.15 }}
              className="flex justify-center mb-7"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-3xl blur-2xl bg-gradient-to-br from-primary to-accent"
                />
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl border border-primary/30"
                >
                  <Crown className="w-12 h-12 text-primary-foreground" strokeWidth={2} />
                </motion.div>
              </div>
            </motion.div>

            {/* Pro chip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center mb-7"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">
                  Plan Pro Activado
                </span>
              </div>
            </motion.div>

            {/* Headline — fixed: no clipping, balanced wrap, responsive padding */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[2rem] xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center text-foreground mb-5 tracking-tight leading-[1.05] px-2"
              style={{ textWrap: "balance" as any }}
            >
              ¡Bienvenido a la{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent pb-2 inline-block">
                  inteligencia ejecutiva
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-60"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="text-base sm:text-lg md:text-xl text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
              style={{ textWrap: "balance" as any }}
            >
              Tu pago se procesó con éxito. Acabás de desbloquear el CEO digital impulsado por IA que trabaja 24/7 por tu negocio.
            </motion.p>

            {/* Features grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid sm:grid-cols-2 gap-3 mb-10"
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="group relative p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                        <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button
                size="lg"
                onClick={() => navigate("/app")}
                className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/20 group"
              >
                Entrar a la plataforma
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto h-14 px-6 text-base text-muted-foreground hover:text-foreground"
              >
                Volver al inicio
              </Button>
            </motion.div>

            {/* Trust footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.45 }}
              className="mt-12 pt-8 border-t border-border/50 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span>Pago verificado y seguro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-success" />
                <span>Recibo enviado por email</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span>Acceso inmediato a todas las funciones</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProWelcomePage;
