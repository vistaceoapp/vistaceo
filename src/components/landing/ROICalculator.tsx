import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Calculator, Sparkles, ArrowRight, Zap, DollarSign, CheckCircle2, Rocket, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useCountryDetection } from "@/hooks/use-country-detection";

export const ROICalculator = () => {
  const navigate = useNavigate();
  const { country, formatCurrencyShort, monthlyPrice, isDetecting, formatPrice } = useCountryDetection();
  
  // Set initial values based on currency
  const getInitialValues = () => {
    switch (country.currency) {
      case "ARS": return { min: 500000, max: 50000000, initial: 2500000, step: 100000 };
      case "MXN": return { min: 50000, max: 5000000, initial: 250000, step: 10000 };
      case "CLP": return { min: 5000000, max: 500000000, initial: 25000000, step: 1000000 };
      case "COP": return { min: 10000000, max: 1000000000, initial: 50000000, step: 5000000 };
      case "BRL": return { min: 10000, max: 1000000, initial: 50000, step: 1000 };
      case "EUR": return { min: 5000, max: 500000, initial: 25000, step: 500 };
      default: return { min: 5000, max: 500000, initial: 25000, step: 500 };
    }
  };

  const [values, setValues] = useState(getInitialValues());
  const [revenue, setRevenue] = useState(values.initial);
  
  // Update values when country changes
  useEffect(() => {
    if (!isDetecting) {
      const newValues = getInitialValues();
      setValues(newValues);
      setRevenue(newValues.initial);
    }
  }, [country.currency, isDetecting]);

  const growthRate = 0.32; // 32% average growth
  const monthlyGain = Math.round(revenue * growthRate);
  const yearlyGain = monthlyGain * 12;
  const investmentRecoveryMonths = monthlyGain > monthlyPrice ? (monthlyPrice / monthlyGain * 30).toFixed(0) : "∞";
  const netMonthlyGain = monthlyGain - monthlyPrice;
  const roi = monthlyPrice > 0 ? Math.round(netMonthlyGain / monthlyPrice) : 0;

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-success/5 to-background" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--success) / 0.3), transparent 70%)' }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success mb-6">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Calculadora de impacto</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/20">{country.flag}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              ¿Cuánto podrías{" "}
              <span className="text-success">ganar</span>{" "}
              con VistaCEO Pro?
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nuestros usuarios Pro ven un promedio de{" "}
              <span className="text-success font-semibold">+32% de mejora</span>{" "}
              en sus métricas principales dentro de los primeros 3 meses.
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Animated glow */}
            <motion.div 
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-1 bg-gradient-to-r from-success/30 via-primary/30 to-success/30 rounded-3xl blur-xl" 
            />
            
            <div className="relative bg-card/95 backdrop-blur-sm border border-border rounded-3xl p-6 lg:p-10 shadow-2xl">
              {/* Slider section */}
              <div className="mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                  <label className="text-lg font-medium text-foreground">
                    Tu facturación mensual actual
                  </label>
                  <motion.div 
                    key={revenue}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-3xl sm:text-4xl font-bold text-foreground"
                  >
                    {formatCurrencyShort(revenue)}
                  </motion.div>
                </div>
                
                <Slider
                  value={[revenue]}
                  onValueChange={(value) => setRevenue(value[0])}
                  min={values.min}
                  max={values.max}
                  step={values.step}
                  className="mb-4"
                />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatCurrencyShort(values.min)}</span>
                  <span>{formatCurrencyShort(values.max)}</span>
                </div>
              </div>

              {/* Results - Main highlight */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Investment */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative bg-secondary/50 border border-border rounded-2xl p-6 text-center"
                >
                  <div className="text-sm text-muted-foreground mb-2">Inversión en Pro</div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatCurrencyShort(monthlyPrice)}/mes
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Lo recuperás en ~{investmentRecoveryMonths} días
                  </div>
                </motion.div>

                {/* Growth potential - HERO */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden bg-gradient-to-br from-success/20 via-success/10 to-transparent border-2 border-success/30 rounded-2xl p-6 text-center lg:scale-110 lg:-my-2 z-10 shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-success/20 blur-3xl" />
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-success/10 blur-2xl" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 text-success text-sm font-medium mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Crecimiento potencial mensual
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={monthlyGain}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="text-4xl lg:text-5xl font-bold text-success mb-2"
                      >
                        +{formatCurrencyShort(monthlyGain)}
                      </motion.div>
                    </AnimatePresence>
                    <div className="text-sm text-foreground font-medium">
                      ≈ +32% sobre tu facturación
                    </div>
                  </div>
                </motion.div>

                {/* Net gain */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="relative bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center"
                >
                  <div className="text-sm text-muted-foreground mb-2">Ganancia neta mensual</div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    +{formatCurrencyShort(netMonthlyGain)}
                  </div>
                  <div className="text-xs text-success font-medium">
                    {roi}x retorno sobre inversión
                  </div>
                </motion.div>
              </div>

              {/* Annual projection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border rounded-xl p-6 mb-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Proyección anual</div>
                      <div className="text-2xl font-bold text-foreground">
                        +{formatCurrencyShort(yearlyGain)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Acciones diarias",
                      "Misiones ilimitadas",
                      "Chat con IA",
                      "Analytics avanzado",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Value explanation */}
              <div className="text-center mb-8 p-4 bg-secondary/30 rounded-xl border border-border">
                <p className="text-foreground">
                  Invertís{" "}
                  <span className="font-semibold text-primary">
                    {formatCurrencyShort(monthlyPrice)}/mes
                  </span>
                  {" "}→ Recuperás la inversión en{" "}
                  <span className="font-semibold text-success">~{investmentRecoveryMonths} días</span>
                  {" "}→ El resto del mes es{" "}
                  <span className="font-semibold text-success">ganancia neta: +{formatCurrencyShort(netMonthlyGain)}</span>
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="group w-full sm:w-auto"
                  onClick={() => navigate("/auth?plan=pro_yearly")}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Empezar a crecer hoy
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="xl"
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/auth")}
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Probar gratis primero
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Garantía de 7 días • Cancelás cuando quieras • Sin compromisos
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
