import { useEffect, useRef, memo } from "react";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "¿Qué tipo de negocios pueden usar VistaCEO?",
    answer: "VistaCEO está diseñado para cualquier negocio con operaciones en LATAM: restaurantes, retail, servicios profesionales, salud, hotelería, educación y más. El sistema se adapta a más de 180 tipos de negocio diferentes."
  },
  {
    question: "¿Cuánto tiempo toma ver resultados?",
    answer: "La mayoría de usuarios reportan mejoras visibles en las primeras 2-4 semanas. El sistema aprende de tu negocio cada día, así que los resultados se aceleran con el tiempo."
  },
  {
    question: "¿Necesito conocimientos técnicos?",
    answer: "No, para nada. VistaCEO está diseñado para dueños de negocios, no para técnicos. La interfaz es simple y el mentor IA te guía paso a paso."
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Absolutamente. Usamos encriptación de nivel bancario, nunca vendemos datos a terceros, y cumplimos con regulaciones de privacidad internacionales. Tus datos son tuyos."
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer: "Sí, puedes cancelar tu suscripción en cualquier momento sin penalidades. Además, ofrecemos garantía de devolución de 7 días si no estás satisfecho."
  },
  {
    question: "¿Cómo funciona la prueba gratuita?",
    answer: "El plan gratuito es permanente, no es una prueba limitada. Tenés acceso al dashboard básico, 3 misiones semanales y el chat con mentor IA de forma indefinida."
  },
];

export const FAQSection = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    itemsRef.current.forEach(item => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" className="py-20 md:py-32 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4">
        <div ref={headerRef} className="text-center mb-12 md:mb-16 animate-on-scroll">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
            <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" />
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Preguntas <span className="text-gradient-primary">frecuentes</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              ref={el => itemsRef.current[i] = el}
              className="bg-card rounded-xl border border-border p-6 animate-on-scroll transition-all duration-300 hover:border-primary/30 hover:shadow-md"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";
export default FAQSection;
