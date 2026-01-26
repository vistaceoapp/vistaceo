import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote: "VistaCEO me ayudó a aumentar mis ventas un 40% en 3 meses. Es como tener un consultor 24/7.",
    name: "María González",
    role: "Dueña de Restaurante",
    avatar: "👩‍🍳",
    rating: 5,
  },
  {
    quote: "Cada mañana sé exactamente qué hacer. Las acciones son claras y los resultados son reales.",
    name: "Carlos Rodríguez",
    role: "CEO de Agencia Digital",
    avatar: "👨‍💼",
    rating: 5,
  },
  {
    quote: "Detectó oportunidades que yo jamás hubiera visto. Recuperé la inversión en la primera semana.",
    name: "Ana Martínez",
    role: "Directora de Clínica",
    avatar: "👩‍⚕️",
    rating: 5,
  },
];

export const FloatingTestimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="relative max-w-md mx-auto"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
      
      <div className="relative bg-card/90 backdrop-blur-md border border-border rounded-2xl p-5 shadow-2xl">
        {/* Quote mark */}
        <div className="absolute -top-3 left-6 text-4xl text-primary/30 font-serif">"</div>
        
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center text-2xl shrink-0"
          >
            {current.avatar}
          </motion.div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm text-foreground leading-relaxed mb-3"
              >
                {current.quote}
              </motion.p>
            </AnimatePresence>

            {/* Stars */}
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-warning text-warning" />
              ))}
            </div>

            {/* Name */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="font-semibold text-foreground text-sm">{current.name}</p>
                <p className="text-xs text-muted-foreground">{current.role}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
