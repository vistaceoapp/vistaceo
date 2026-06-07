// Brain Core — Capa de Lenguaje Profesional Contextual por país y actividad.
// No es una biblioteca de plantillas. Es una biblioteca semántica que
// sugiere términos candidatos para que el generador pueda elegirlos solo
// si el brain confirma su uso. Si no hay evidencia, se usa lenguaje universal.

export type DomainKey =
  | "legal"
  | "salud_estetica"
  | "gastronomia"
  | "ecommerce"
  | "educacion"
  | "b2b_industrial"
  | "real_estate"
  | "turismo_hoteleria"
  | "servicios_profesionales"
  | "comercio_local"
  | "generico";

export interface DomainProfile {
  key: DomainKey;
  label: string; // visible humano
  candidateTerms: string[];
  forbiddenAssumptions: string[]; // qué NO asumir
  usageRule: string; // cuándo se permite usar terminología específica
}

export const DOMAIN_LIBRARY: Record<DomainKey, DomainProfile> = {
  legal: {
    key: "legal",
    label: "servicios legales",
    candidateTerms: [
      "consulta inicial", "caso", "expediente", "honorarios", "audiencia",
      "contrato", "reclamo", "mediación", "asesoramiento preventivo",
      "propuesta de honorarios", "seguimiento del caso", "cliente particular",
      "cliente empresa",
    ],
    forbiddenAssumptions: [
      "asumir especialidad penal/laboral/civil sin evidencia",
      "dar asesoramiento jurídico sustantivo",
      "mezclar términos procesales de países distintos",
    ],
    usageRule:
      "Usar solo si el brain confirma servicio legal + país. Si hay duda, usar lenguaje universal profesional (consulta, propuesta, seguimiento).",
  },
  salud_estetica: {
    key: "salud_estetica",
    label: "salud y estética",
    candidateTerms: [
      "turno", "tratamiento", "consulta", "paciente", "seguimiento",
      "confianza", "reserva", "agenda", "recompra",
    ],
    forbiddenAssumptions: [
      "prometer resultados clínicos",
      "dar consejo médico",
    ],
    usageRule:
      "Usar para mejorar agenda, recompra y comunicación. Nunca consejo clínico.",
  },
  gastronomia: {
    key: "gastronomia",
    label: "gastronomía",
    candidateTerms: [
      "ticket promedio", "mesas", "reservas", "delivery", "horario flojo",
      "recompra", "reseñas", "experiencia",
    ],
    forbiddenAssumptions: ["asumir restaurante vs cafetería vs bar vs foodtruck"],
    usageRule: "Validar formato, canal y momento de consumo antes de usar.",
  },
  ecommerce: {
    key: "ecommerce",
    label: "ecommerce",
    candidateTerms: [
      "carrito", "checkout", "catálogo", "stock", "envío", "cambio",
      "ticket", "recompra",
    ],
    forbiddenAssumptions: ["recomendar carrito si no vende online"],
    usageRule: "Usar solo si existe venta digital real confirmada.",
  },
  educacion: {
    key: "educacion",
    label: "educación",
    candidateTerms: [
      "inscripción", "alumnos", "cursada", "certificación", "permanencia",
      "empleabilidad", "comunidad",
    ],
    forbiddenAssumptions: ["tratar todo como curso online"],
    usageRule: "Validar modalidad, público, duración y objetivo del alumno.",
  },
  b2b_industrial: {
    key: "b2b_industrial",
    label: "B2B / industrial",
    candidateTerms: [
      "cotización", "proveedor", "cuenta", "plazo", "especificación técnica",
      "recompra", "capacidad", "entrega", "decisor", "seguimiento comercial",
    ],
    forbiddenAssumptions: ["dar consejos de redes sociales como primera acción"],
    usageRule: "Priorizar confianza, proceso comercial, cuentas y seguimiento.",
  },
  real_estate: {
    key: "real_estate",
    label: "real estate",
    candidateTerms: [
      "propiedad", "tasación", "captación", "visitas", "reserva",
      "comprador", "propietario", "operación",
    ],
    forbiddenAssumptions: ["usar términos no locales", "prometer ventas"],
    usageRule: "Adaptar al país y tipo de operación.",
  },
  turismo_hoteleria: {
    key: "turismo_hoteleria",
    label: "turismo y hotelería",
    candidateTerms: [
      "reserva", "temporada", "ocupación", "experiencia", "paquete",
      "reseña", "canal de reserva",
    ],
    forbiddenAssumptions: ["ignorar estacionalidad"],
    usageRule: "Conectar con temporada, canal y experiencia.",
  },
  servicios_profesionales: {
    key: "servicios_profesionales",
    label: "servicios profesionales",
    candidateTerms: [
      "consulta", "propuesta", "alcance", "honorarios", "seguimiento",
      "cliente recurrente",
    ],
    forbiddenAssumptions: ["asumir especialidad concreta sin evidencia"],
    usageRule: "Usar lenguaje universal profesional. Especializar solo con evidencia.",
  },
  comercio_local: {
    key: "comercio_local",
    label: "comercio local",
    candidateTerms: [
      "ticket promedio", "clientes recurrentes", "horario pico",
      "reseñas", "barrio", "recompra",
    ],
    forbiddenAssumptions: ["asumir rubro específico"],
    usageRule: "Validar formato y frecuencia de compra antes de especializar.",
  },
  generico: {
    key: "generico",
    label: "negocio",
    candidateTerms: ["cliente", "venta", "propuesta", "seguimiento", "recompra"],
    forbiddenAssumptions: ["asumir actividad sin evidencia"],
    usageRule: "Usar lenguaje universal hasta que el brain confirme un dominio.",
  },
};

const KEYWORD_MAP: Array<{ re: RegExp; key: DomainKey }> = [
  { re: /\b(abogad[ao]|estudio jur[ií]dico|legal|notari[ao]|escribano|derecho)\b/i, key: "legal" },
  { re: /\b(cl[ií]nica|est[eé]tica|spa|dermat|odontolog|kinesio|nutricion|psicolog|m[eé]dico|paciente)\b/i, key: "salud_estetica" },
  { re: /\b(restaurante|caf[eé]|bar|gastronom|panader|food ?truck|deli|pizzer)\b/i, key: "gastronomia" },
  { re: /\b(ecommerce|tienda online|shopify|woocommerce|tienda virtual|venta online)\b/i, key: "ecommerce" },
  { re: /\b(curso|academia|escuela|instituto|educaci[oó]n|capacitaci[oó]n|alumn[ao]s|profesor)\b/i, key: "educacion" },
  { re: /\b(b2b|industrial|f[aá]brica|mayorista|proveedor|cotizaci[oó]n|cuentas? clave)\b/i, key: "b2b_industrial" },
  { re: /\b(inmobiliari[ao]|propiedades|bienes ra[ií]ces|real estate|tasaci[oó]n)\b/i, key: "real_estate" },
  { re: /\b(hotel|hospedaje|hosteler[ií]a|turismo|airbnb|alojamiento|hostal)\b/i, key: "turismo_hoteleria" },
  { re: /\b(consultor|coach|agencia|estudio|profesional independiente|freelance|contador|arquitect|dise[nñ]ador)\b/i, key: "servicios_profesionales" },
  { re: /\b(local|barrio|comercio|kiosco|almac[eé]n|peluquer[ií]a|barber[ií]a|tienda f[ií]sica)\b/i, key: "comercio_local" },
];

export interface BrainSummary {
  activity?: string | null;
  offer?: string | null;
  customer?: string | null;
  channel?: string | null;
  country?: string | null;
}

export function detectDomain(brain: BrainSummary): DomainKey {
  const haystack = [brain.activity, brain.offer, brain.customer, brain.channel]
    .filter(Boolean)
    .join(" • ")
    .toLowerCase();
  if (!haystack) return "generico";
  for (const { re, key } of KEYWORD_MAP) {
    if (re.test(haystack)) return key;
  }
  return "generico";
}

export interface TerminologyContext {
  domain: DomainProfile;
  country: string | null;
  allowSpecificTerms: boolean; // true solo si hay evidencia mínima
  promptFragment: string;
}

export function buildTerminologyContext(brain: BrainSummary): TerminologyContext {
  const domainKey = detectDomain(brain);
  const domain = DOMAIN_LIBRARY[domainKey];
  const hasEvidence = Boolean(brain.activity && brain.activity.trim().length > 4);
  const allowSpecificTerms = hasEvidence && domainKey !== "generico";

  const country = brain.country?.trim() || null;

  const lines = [
    `DOMINIO DETECTADO: ${domain.label}${country ? ` · país: ${country}` : ""}.`,
    allowSpecificTerms
      ? `Términos profesionales permitidos solo si suman precisión: ${domain.candidateTerms.join(", ")}.`
      : `No hay suficiente evidencia para usar jerga sectorial. Usar lenguaje universal profesional.`,
    `Riesgos de mala personalización: ${domain.forbiddenAssumptions.join("; ")}.`,
    `Regla de uso: ${domain.usageRule}`,
    `Si un término puede estar mal usado por país o especialidad, NO lo uses. Reemplazá por lenguaje universal (consulta, propuesta, seguimiento, cliente, venta).`,
    `Nunca fuerces jerga decorativa. Cada término técnico tiene que conectar con una acción, diagnóstico, pregunta o métrica concreta.`,
  ];

  return {
    domain,
    country,
    allowSpecificTerms,
    promptFragment: `\nLENGUAJE PROFESIONAL CONTEXTUAL:\n${lines.map((l) => `- ${l}`).join("\n")}\n`,
  };
}
