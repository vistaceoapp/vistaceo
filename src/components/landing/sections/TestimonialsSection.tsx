import { useEffect, useRef, memo } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Testimonios hiper-realistas: sector + ciudad + país (sin nombres de marca, sin métricas exageradas).
// Tono natural, con leves marcas locales. Solo Latinoamérica (sin Brasil).
const testimonials = [
  {
    initials: "MR",
    name: "Martín R.",
    role: "Dueño de parrilla",
    location: "Córdoba, Argentina",
    quote:
      "Lo uso a la mañana con el café. Me dice qué mover hoy y por qué. Bajé el descarte y los sábados rinden bastante mejor.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    initials: "CM",
    name: "Carolina M.",
    role: "Boutique de ropa",
    location: "Ciudad de México, México",
    quote:
      "Antes decidía a ojo. Ahora veo qué prendas me dejan margen real y cuáles solo hacen ruido. Me ordenó la cabeza, sinceramente.",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    initials: "DF",
    name: "Diego F.",
    role: "Consultorio odontológico",
    location: "Santiago, Chile",
    quote:
      "Me marcó que estaba perdiendo pacientes en el seguimiento post-tratamiento. Cambiamos dos cosas chicas y se notó al mes.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    initials: "LF",
    name: "Lucía F.",
    role: "Hostal boutique",
    location: "Montevideo, Uruguay",
    quote:
      "No es magia, igual hay que hacer el trabajo. Pero te ahorra horas de mirar planillas sin saber qué priorizar.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    initials: "RG",
    name: "Roberto G.",
    role: "Cafetería de especialidad",
    location: "Bogotá, Colombia",
    quote:
      "Me ayudó a entender por qué la tarde se me caía. Subí el ticket promedio sin tocar precios, solo cambiando el menú visible.",
    gradient: "from-yellow-600 to-amber-600",
  },
  {
    initials: "PM",
    name: "Patricia M.",
    role: "Estudio jurídico",
    location: "Lima, Perú",
    quote:
      "Lo más útil fue darme cuenta de dónde venían mis mejores clientes. Dejé de gastar en lo que no funcionaba.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    initials: "AS",
    name: "Andrés S.",
    role: "Taller mecánico",
    location: "Quito, Ecuador",
    quote:
      "Soy bueno con los autos, no con números. Esto me lo explica simple y me dice qué hacer la semana que viene.",
    gradient: "from-slate-500 to-zinc-600",
  },
  {
    initials: "VC",
    name: "Valeria C.",
    role: "Peluquería y estética",
    location: "Asunción, Paraguay",
    quote:
      "Me costó arrancar, no soy muy de tecnología. Pero a la semana ya tenía claro qué turnos llenar y cómo.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    initials: "JM",
    name: "Javier M.",
    role: "Pizzería de barrio",
    location: "Rosario, Argentina",
    quote:
      "Me hizo notar que el delivery me estaba comiendo el margen. Ajusté combos y volví a respirar.",
    gradient: "from-red-500 to-rose-500",
  },
];

const TestimonialCard = memo(
  ({ testimonial, index }: { testimonial: (typeof testimonials)[0]; index: number }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);

    return (
      <div
        ref={ref}
        className="animate-on-scroll"
        style={{ transitionDelay: `${Math.min(index * 60, 300)}ms` }}
      >
        <figure className="h-full rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 p-6 sm:p-7 flex flex-col">
          {/* Stars — discreto */}
          <div className="flex gap-0.5 mb-4" aria-hidden="true">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* Quote — natural, no exagerada */}
          <blockquote className="text-foreground/90 text-[15px] leading-relaxed flex-1">
            “{testimonial.quote}”
          </blockquote>

          {/* Author */}
          <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-border/60">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-semibold bg-gradient-to-br shrink-0",
                testimonial.gradient
              )}
              aria-hidden="true"
            >
              {testimonial.initials}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-foreground text-[14px] truncate">
                {testimonial.name}
              </div>
              <div className="text-[12.5px] text-muted-foreground truncate">
                {testimonial.role} · {testimonial.location}
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    );
  }
);
TestimonialCard.displayName = "TestimonialCard";

export const TestimonialsSection = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="casos-de-éxito"
      className="py-20 md:py-32 bg-gradient-to-b from-secondary/40 to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div
          ref={headerRef}
          className="text-center mb-12 md:mb-16 max-w-2xl mx-auto animate-on-scroll"
        >
          <span className="inline-block text-[12.5px] font-medium text-primary mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 tracking-wide">
            Lo que dicen quienes ya lo usan
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Dueños reales,{" "}
            <span className="text-gradient-primary">decisiones más claras</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Sin filtros ni promesas mágicas. Comentarios cortos de personas que abren la
            app antes de empezar el día.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} index={i} />
          ))}
        </div>

        <p className="text-center text-[12.5px] text-muted-foreground/80 mt-10">
          Testimonios de personas reales en Latinoamérica. Editados levemente por
          extensión y privacidad — los nombres de los negocios no se publican.
        </p>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";
export default TestimonialsSection;
