import { Star } from "lucide-react";

const testimonials = [
  {
    name: "María García",
    role: "Dueña de Café Aroma",
    location: "Buenos Aires, AR",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "Antes perdía horas viendo reportes sin saber qué hacer. UCEO me dice exactamente qué priorizar cada mañana. Mi ticket promedio subió 18%.",
    rating: 5,
  },
  {
    name: "Carlos Mendoza",
    role: "Gerente de Tacos El Rey",
    location: "Ciudad de México, MX",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "Lo mejor es que funciona sin tener que conectar nada. Solo respondo 3 preguntas rápidas y ya tengo mi acción del día.",
    rating: 5,
  },
  {
    name: "Ana Silva",
    role: "Propietaria de Doce Sabor",
    location: "São Paulo, BR",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "O radar de oportunidades me mostró que perdía clientes por tiempo de espera. Ajusté los turnos y recuperé las reseñas de 5 estrellas.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 sm:py-32 bg-card/20 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Lo que dicen nuestros{" "}
            <span className="text-gradient-primary">usuarios</span>
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 neon-border-hover"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
