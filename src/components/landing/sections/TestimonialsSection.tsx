import { useEffect, useRef, memo } from "react";
import { Star, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Import testimonial images - optimized WebP at 700px (card display ~400px, 2x retina)
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg?w=700&format=webp";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg?w=700&format=webp";
import dentalImg from "@/assets/testimonials/clinica-dental.jpg?w=700&format=webp";
import hotelImg from "@/assets/testimonials/hotel-boutique.jpg?w=700&format=webp";
import cafeImg from "@/assets/testimonials/cafeteria.jpg?w=700&format=webp";
import legalImg from "@/assets/testimonials/estudio-juridico.jpg?w=700&format=webp";

const testimonials = [
  {
    name: "Martín Rodríguez",
    business: "Parrilla Don Martín",
    location: "Buenos Aires, Argentina",
    type: "Restaurante / Parrilla",
    avatar: "MR",
    image: parrillaImg,
    quote: "En 3 meses aumenté mis ventas un 28%. VistaCEO me mostró que mis sábados tenían 23% menos tráfico que la competencia.",
    metrics: { growth: "+28%", missions: 12, health: 78, months: 3 },
    gradient: "from-orange-500 to-red-500"
  },
  {
    name: "Carolina Méndez",
    business: "Boutique Carmela",
    location: "Ciudad de México, México",
    type: "Retail / Moda",
    avatar: "CM",
    image: boutiqueImg,
    quote: "Las misiones son increíbles. Cada una tiene pasos claros y puedo medir el impacto. Es como tener un consultor 24/7.",
    metrics: { growth: "+45%", missions: 18, health: 85, months: 4 },
    gradient: "from-pink-500 to-purple-500"
  },
  {
    name: "Dr. Diego Fernández",
    business: "Clínica Sonrisas",
    location: "Santiago, Chile",
    type: "Salud / Odontología",
    avatar: "DF",
    image: dentalImg,
    quote: "Descubrí que perdía el 40% de mis pacientes por mal seguimiento. Ahora retengo el 92%.",
    metrics: { growth: "+52%", missions: 24, health: 92, months: 5 },
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    name: "Lucía Fernández",
    business: "Hotel Casa Serena",
    location: "Montevideo, Uruguay",
    type: "Hotelería / Boutique",
    avatar: "LF",
    image: hotelImg,
    quote: "El radar me alertó que mi competencia bajó precios. Ajusté mi estrategia y mantuve ocupación al 85%.",
    metrics: { growth: "+38%", missions: 15, health: 88, months: 6 },
    gradient: "from-amber-500 to-orange-500"
  },
  {
    name: "Roberto Guzmán",
    business: "Café Origen",
    location: "Bogotá, Colombia",
    type: "Cafetería / Specialty",
    avatar: "RG",
    image: cafeImg,
    quote: "Pasé de vender 80 cafés por día a 200. El sistema me mostró que mi ticket era 40% menor al de la zona.",
    metrics: { growth: "+150%", missions: 21, health: 94, months: 4 },
    gradient: "from-yellow-600 to-amber-600"
  },
  {
    name: "Dra. Patricia Morales",
    business: "Estudio Morales & Asoc.",
    location: "Lima, Perú",
    type: "Servicios Legales",
    avatar: "PM",
    image: legalImg,
    quote: "Las analíticas me mostraron que mis clientes más rentables venían de referidos. Dupliqué mi programa.",
    metrics: { growth: "+65%", missions: 16, health: 91, months: 5 },
    gradient: "from-blue-500 to-indigo-500"
  },
];

const TestimonialCard = memo(({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="animate-on-scroll group"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="h-full rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden hover:-translate-y-2">
        {/* Business image */}
        <div className="relative h-40 overflow-hidden">
          <img 
            src={testimonial.image} 
            alt={testimonial.business}
            width={400}
            height={160}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          <Badge className="absolute top-3 right-3 bg-success/90 text-success-foreground border-0 font-bold shadow-lg">
            {testimonial.metrics.growth}
          </Badge>
          
          <Badge variant="secondary" className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm text-xs">
            {testimonial.type}
          </Badge>
        </div>
        
        <div className="p-5">
          {/* Stars */}
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-4 h-4 fill-accent text-accent" aria-hidden="true" />
            ))}
          </div>

          {/* Quote */}
          <p className="text-foreground text-sm mb-4 leading-relaxed line-clamp-3">"{testimonial.quote}"</p>

          {/* Author */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br shrink-0",
              testimonial.gradient
            )}>
              {testimonial.avatar}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground text-sm truncate">{testimonial.name}</div>
              <div className="text-xs text-muted-foreground truncate">{testimonial.business}</div>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex gap-3 mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              <span>{testimonial.metrics.months} meses</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{testimonial.metrics.missions} misiones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
TestimonialCard.displayName = "TestimonialCard";

export const TestimonialsSection = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="casos-de-éxito" className="py-20 md:py-32 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div ref={headerRef} className="text-center mb-12 md:mb-16 animate-on-scroll">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
            <Award className="w-4 h-4 mr-2" aria-hidden="true" />
            Casos de Éxito
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Negocios reales, <span className="text-gradient-primary">resultados reales</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dueños de negocios de toda Latinoamérica están creciendo con VistaCEO.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";
export default TestimonialsSection;
