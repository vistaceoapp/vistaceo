import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "¿La cuenta es gratis?",
    a: "Sí. Podés crear tu cuenta gratis y empezar sin tarjeta.",
  },
  {
    q: "¿Necesito cargar muchos datos?",
    a: "No. Primero te pedimos lo mínimo para entender tu negocio y darte un primer diagnóstico.",
  },
  {
    q: "¿Qué me entrega VISTACEO?",
    a: "Prioridades, misiones accionables, análisis y un chat CEO con IA para ayudarte a decidir mejor.",
  },
  {
    q: "¿Sirve para mi tipo de negocio?",
    a: "Sí. Está pensado para negocios, servicios, comercios, agencias, clínicas, restaurantes, profesionales y emprendimientos.",
  },
];

export const PromoFAQ = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQ.map((item, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="border-b border-[#eef0f4] last:border-b-0"
        >
          <AccordionTrigger className="text-left text-[15px] sm:text-[16px] font-semibold text-[#1a1d27] hover:no-underline py-5">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-[14.5px] text-[#5b6271] leading-relaxed pb-5">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
