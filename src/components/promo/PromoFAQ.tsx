import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "¿La cuenta es realmente gratis?",
    a: "Sí. Podés crear tu cuenta y empezar sin tarjeta. El plan gratuito incluye diagnóstico, misiones y chat CEO.",
  },
  {
    q: "¿Necesito cargar muchos datos al registrarme?",
    a: "No. Primero te pedimos lo mínimo para entender tu negocio. En 2 minutos tenés tu primer resultado.",
  },
  {
    q: "¿Qué pasa después de crear la cuenta?",
    a: "VISTACEO te hace 3 preguntas rápidas y en minutos te entrega un diagnóstico, prioridades y misiones concretas para tu negocio.",
  },
  {
    q: "¿Sirve para mi negocio, servicio o profesión?",
    a: "Sí. Funciona para negocios, servicios y profesionales independientes de cualquier rubro: comercios, agencias, consultorios, estudios, emprendimientos y profesiones liberales.",
  },
];

export const PromoFAQ = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQ.map((item, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="border-b border-[#E2E8F0] last:border-b-0"
        >
          <AccordionTrigger className="text-left text-[15.5px] sm:text-[16.5px] font-semibold text-[#0F172A] hover:no-underline py-5">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-[14.5px] text-[#475569] leading-relaxed pb-5 pl-1">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
