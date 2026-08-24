// AnchorDirective: convierte los anclajes reales del negocio en una directiva
// de sistema obligatoria. Se inyecta en los prompts de Radar (I+D / oportunidades)
// y Misiones para forzar salidas hyper específicas a ESE negocio.

import type { HyperAnchors } from "./hyper-personalization-gate.ts";

const LABELS: Array<[keyof HyperAnchors, string]> = [
  ["businessName", "Negocio"],
  ["sector", "Actividad"],
  ["subSector", "Subrubro"],
  ["niche", "Nicho"],
  ["businessModel", "Modelo de ingresos"],
  ["stage", "Etapa"],
  ["country", "País"],
  ["region", "Provincia/Región"],
  ["city", "Ciudad"],
  ["geoScope", "Alcance geográfico"],
  ["customer", "Cliente"],
  ["customerSegment", "Segmento"],
  ["channel", "Canal principal"],
  ["offer", "Oferta principal"],
  ["valueProp", "Propuesta de valor"],
  ["differentiator", "Diferencial"],
  ["priceRange", "Rango de precios"],
  ["ticketSize", "Ticket promedio"],
  ["salesCycle", "Ciclo de venta"],
  ["seasonality", "Estacionalidad"],
  ["teamSize", "Tamaño de equipo"],
  ["mainFriction", "Fricción principal"],
  ["mainGoal", "Objetivo principal"],
  ["currency", "Moneda"],
];

/**
 * Devuelve un bloque de sistema con los anclajes reales y reglas duras.
 * Si no hay anclajes suficientes, exige humildad en vez de invención.
 */
export function buildAnchorDirective(
  anchors: HyperAnchors,
  kind: "radar" | "opportunity" | "mission" | "chat" | "prediction" = "mission",
): string {
  const rows: string[] = [];
  for (const [key, label] of LABELS) {
    const v = anchors[key];
    if (typeof v === "string" && v.trim()) rows.push(`- ${label}: ${v.trim()}`);
  }
  if (anchors.competitors?.length) {
    rows.push(`- Competidores conocidos: ${anchors.competitors.slice(0, 5).join(", ")}`);
  }

  const strength = rows.length;
  const header = `## ANCLAJES REALES DE ESTE NEGOCIO (única fuente de verdad)`;

  if (strength === 0) {
    return `${header}
No hay anclajes confirmados todavía. Reglas:
- No inventes datos, cifras, nombres ni competidores.
- Escribí en modo hipótesis explícita ("con la información actual...").
- Priorizá acciones de descubrimiento que generen datos verificables.`;
  }

  const kindRule = kind === "chat"
    ? `Cada respuesta debe apoyarse en al menos 2 anclajes reales de arriba y evitar consejos que servirían para cualquier negocio.`
    : kind === "prediction"
    ? `Cada escenario debe derivarse causalmente de al menos 2 anclajes reales y de la evidencia entregada, con ventana temporal y acción concreta.`
    : kind === "radar"
    ? `Cada insight debe explicar el vínculo causal con al menos 2 anclajes distintos y descartar lo que no aplique a este caso.`
    : kind === "opportunity"
    ? `Cada oportunidad debe nombrar el canal, el cliente y la oferta reales de arriba, y explicar por qué NO es genérica.`
    : `Cada paso debe operar sobre la oferta, el canal y el cliente reales de arriba, con números en ${anchors.currency ?? "la moneda local"} cuando corresponda.`;

  return `${header}
${rows.join("\n")}

REGLAS DURAS (no negociables):
1. Usá al menos 3 de estos anclajes de forma literal y concreta en la salida.
2. ${kindRule}
3. Prohibido texto que serviría igual para otro negocio del mismo rubro. Si algo suena intercambiable, reescribilo con el detalle específico.
4. Prohibido inventar métricas, precios, clientes o competidores que no estén arriba o en la evidencia entregada.
5. Si falta un dato clave para ser preciso, decilo en una línea y proponé cómo obtenerlo — nunca lo rellenes con supuestos.
6. Adaptá ejemplos, montos y estacionalidad al contexto de ${anchors.city ?? anchors.region ?? anchors.country ?? "su mercado"}.`;
}
