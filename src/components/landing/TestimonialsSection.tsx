import { Star, Quote } from "lucide-react";
import { GlowingCard } from "./GlowingCard";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "María García",
    role: "Dueña de Café Aroma",
    location: "Buenos Aires, AR",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "Antes perdía horas viendo reportes sin saber qué hacer. VistaCEO me dice exactamente qué priorizar cada mañana. Mi ticket promedio subió 18%.",
    rating: 5,
    highlight: "+18% ticket",
  },
  {
    name: "Carlos Mendoza",
    role: "Gerente de Tacos El Rey",
    location: "Ciudad de México, MX",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "Lo mejor es que funciona sin tener que conectar nada. Solo respondo 3 preguntas rápidas y ya tengo mi acción del día. Increíble.",
    rating: 5,
    highlight: "Sin setup",
  },
  {
    name: "Ana Silva",
    role: "Propietaria de Doce Sabor",
    location: "São Paulo, BR",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "O radar de oportunidades me mostró que perdía clientes por tiempo de espera. Ajusté los turnos y recuperé las reseñas de 5 estrellas.",
    rating: 5,
    highlight: "5★ reviews",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Lo que dicen nuestros{" "}
            <span className="text-gradient-primary">usuarios</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlowingCard className="p-8 h-full">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                    />
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/30">
                    {testimonial.highlight}
                  </span>
                </div>
              </GlowingCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
