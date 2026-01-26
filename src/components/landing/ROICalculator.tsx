import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";

export const ROICalculator = () => {
  const navigate = useNavigate();
  const [monthlyRevenue, setMonthlyRevenue] = useState([100000]);
  const [improvement] = useState(0.32); // 32% average improvement
  
  const potentialGain = monthlyRevenue[0] * improvement;
  const yearlyGain = potentialGain * 12;
  const proPrice = 29500; // ARS monthly
  const roi = ((potentialGain - proPrice) / proPrice) * 100;

  // Format numbers with locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-secondary/30">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">Calculadora de ROI</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
            ¿Cuánto podrías ganar con{" "}
            <span className="text-gradient-primary">VistaCEO Pro</span>?
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Basado en el crecimiento promedio de +32% de nuestros usuarios Pro.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card border border-border rounded-3xl p-8 lg:p-12 shadow-xl">
            {/* Slider section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-foreground">
                  Tu facturación mensual
                </label>
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(monthlyRevenue[0])}
                </div>
              </div>
              
              <Slider
                value={monthlyRevenue}
                onValueChange={setMonthlyRevenue}
                min={50000}
                max={5000000}
                step={50000}
                className="py-4"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$50k</span>
                <span>$5M</span>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div
                key={potentialGain}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-success/10 border border-success/20 rounded-2xl p-6 text-center"
              >
                <TrendingUp className="w-8 h-8 text-success mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-2">Ganancia mensual estimada</div>
                <div className="text-2xl font-bold text-success">
                  +{formatNumber(potentialGain)}
                </div>
              </motion.div>

              <motion.div
                key={yearlyGain}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center"
              >
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-2">Impacto anual</div>
                <div className="text-2xl font-bold text-primary">
                  +{formatNumber(yearlyGain)}
                </div>
              </motion.div>

              <motion.div
                key={roi}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center"
              >
                <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-2">ROI estimado</div>
                <div className="text-2xl font-bold text-accent">
                  {roi.toFixed(0)}x
                </div>
              </motion.div>
            </div>

            {/* Insight */}
            <div className="bg-secondary/50 border border-border rounded-xl p-6 mb-8 text-center">
              <p className="text-foreground">
                Por cada <span className="font-semibold text-primary">{formatNumber(proPrice)}/mes</span> que invertís en Pro,
                podrías recuperar hasta <span className="font-semibold text-success">{formatNumber(potentialGain)}</span> en mejoras.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => navigate("/auth?plan=pro_monthly")}
              >
                Comenzar a crecer hoy
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
