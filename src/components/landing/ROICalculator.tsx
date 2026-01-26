import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calculator, Sparkles, ArrowRight, Zap, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";

export const ROICalculator = () => {
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState(500000);
  const [isAR, setIsAR] = useState(false);
  
  // Detect country
  useEffect(() => {
    const lang = navigator.language || "en";
    setIsAR(lang.includes("AR") || lang === "es-AR");
  }, []);

  const growthRate = 0.32; // 32% average growth
  const monthlyGain = Math.round(revenue * growthRate);
  const yearlyGain = monthlyGain * 12;
  const proPriceMontly = isAR ? 29500 : 29;
  const roi = Math.round(monthlyGain / proPriceMontly);

  const formatCurrency = (value: number) => {
    const symbol = "$";
    if (isAR) {
      return `${symbol} ${new Intl.NumberFormat('es-AR').format(value)}`;
    }
    return `${symbol} ${new Intl.NumberFormat('en-US').format(value)}`;
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-secondary/30">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(var(--success) / 0.3), transparent 70%)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success mb-6">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Calculadora de ROI</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              ¿Cuánto podrías ganar con{" "}
              <span className="text-gradient-primary">VistaCEO Pro</span>?
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Basado en el crecimiento promedio de <span className="text-success font-semibold">+32%</span> de nuestros usuarios Pro.
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-success/20 via-primary/20 to-success/20 rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative bg-card border border-border rounded-3xl p-8 lg:p-12 shadow-2xl">
              {/* Slider section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-medium text-foreground">
                    Tu facturación mensual
                  </label>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(revenue)}
                  </div>
                </div>
                
                <Slider
                  value={[revenue]}
                  onValueChange={(value) => setRevenue(value[0])}
                  min={isAR ? 100000 : 1000}
                  max={isAR ? 10000000 : 100000}
                  step={isAR ? 50000 : 500}
                  className="mb-4"
                />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(isAR ? 100000 : 1000)}</span>
                  <span>{formatCurrency(isAR ? 10000000 : 100000)}</span>
                </div>
              </div>

              {/* Results grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {/* Monthly gain */}
                <motion.div
                  key={monthlyGain}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="relative overflow-hidden bg-success/10 border border-success/20 rounded-2xl p-6"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-success/10 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-success text-sm font-medium mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Ganancia mensual
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-foreground">
                      +{formatCurrency(monthlyGain)}
                    </div>
                  </div>
                </motion.div>

                {/* Yearly impact */}
                <motion.div
                  key={yearlyGain}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="relative overflow-hidden bg-primary/10 border border-primary/20 rounded-2xl p-6"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                      <Zap className="w-4 h-4" />
                      Impacto anual
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-foreground">
                      +{formatCurrency(yearlyGain)}
                    </div>
                  </div>
                </motion.div>

                {/* ROI */}
                <motion.div
                  key={roi}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-accent/10 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                      <DollarSign className="w-4 h-4" />
                      ROI estimado
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-foreground">
                      {roi}x
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Explanation */}
              <div className="bg-secondary/50 border border-border rounded-xl p-6 mb-8">
                <p className="text-muted-foreground text-center">
                  Por cada{" "}
                  <span className="text-foreground font-semibold">
                    {formatCurrency(proPriceMontly)}/mes
                  </span>{" "}
                  que invertís en Pro, podrías recuperar hasta{" "}
                  <span className="text-success font-semibold">
                    {formatCurrency(monthlyGain)}
                  </span>{" "}
                  en mejoras.
                </p>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="group"
                  onClick={() => navigate("/auth?plan=pro_yearly")}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Comenzar a crecer hoy
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
