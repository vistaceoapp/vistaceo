/**
 * Catálogo sectorial de VISTACEO.
 *
 * Define para cada familia/categoría de negocio:
 *   - dayparts típicos
 *   - rangos de ticket promedio referenciales
 *   - signals semilla que se insertan al crear el negocio (Brain seed)
 *   - "signature line" contextual por daypart (hero del Dashboard)
 *
 * No reemplaza datos reales del usuario: las signals que provienen de este
 * catálogo se marcan con `source: "sector_baseline"` para que el sistema sepa
 * que son referencia sectorial y no observaciones del negocio.
 */

export type DayPart = "early_morning" | "morning" | "midday" | "afternoon" | "evening" | "late_night";

export interface SectorSeedSignal {
  signal_type: string;
  importance: number; // 1-10
  confidence: "low" | "medium" | "high";
  content: Record<string, unknown>;
  raw_text: string;
}

export interface SectorBaseline {
  key: string; // matches business.category enum value
  family: "gastronomia" | "retail" | "servicios" | "digital" | "salud" | "educacion" | "otros";
  displayName: string;
  peakDayparts: DayPart[];
  typicalTicketRange: { min: number; max: number; currencyHint?: string };
  /** Frases hero por daypart en voz neutra (sin tuteo/voseo, válidas en LATAM y ES) */
  signature: Partial<Record<DayPart, string>>;
  seedSignals: SectorSeedSignal[];
}

export const DEFAULT_SECTOR_KEY = "_default";

export const SECTOR_BASELINES: Record<string, SectorBaseline> = {
  cafeteria: {
    key: "cafeteria",
    family: "gastronomia",
    displayName: "Cafetería",
    peakDayparts: ["early_morning", "morning", "afternoon"],
    typicalTicketRange: { min: 1800, max: 5200 },
    signature: {
      early_morning: "Pico de cafetería: 7–9 h. La velocidad de servicio define el ticket promedio.",
      morning: "Mañana activa. Cafés + medialunas concentran ~60% del ticket.",
      midday: "Mediodía: oportunidad de combos almuerzo ligero.",
      afternoon: "Tarde de cafetería: tortas y café de especialidad, ticket más alto.",
      evening: "Caída natural de tráfico. Hora ideal para tareas de back-office.",
      late_night: "Fuera de horario típico. Revisar cierre de caja y stock.",
    },
    seedSignals: [
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "ticket_promedio_referencia_ars", min: 1800, max: 5200 },
        raw_text: "Ticket promedio referencia para cafeterías de especialidad en AR: $1.800–$5.200.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "recurrencia_clientes_pct", min: 35, max: 55 },
        raw_text: "Clientes recurrentes típicos en cafeterías de barrio: 35–55%.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 7,
        confidence: "high",
        content: { metric: "dayparts_pico", value: ["early_morning", "morning", "afternoon"] },
        raw_text: "Tres ventanas pico: 7–9 h, 10–12 h y 16–18 h.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 5,
        confidence: "medium",
        content: { metric: "food_cost_pct", min: 28, max: 38 },
        raw_text: "Food cost objetivo en cafetería: 28–38%.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 5,
        confidence: "medium",
        content: { metric: "mix_pasteleria_pct", min: 25, max: 45 },
        raw_text: "Pastelería suele aportar 25–45% del ticket.",
      },
      {
        signal_type: "sector_lever",
        importance: 7,
        confidence: "medium",
        content: { lever: "programa_fidelizacion", impact: "alto" },
        raw_text: "Programa de fidelización digital sube recurrencia 8–15 puntos en 90 días.",
      },
      {
        signal_type: "sector_risk",
        importance: 6,
        confidence: "medium",
        content: { risk: "competencia_radio_500m", impact: "medio" },
        raw_text: "Densidad alta de competencia en radio 500 m presiona el ticket.",
      },
      {
        signal_type: "sector_lever",
        importance: 6,
        confidence: "medium",
        content: { lever: "menu_engineering", impact: "medio" },
        raw_text: "Reordenar la carta y resaltar 3 productos estrella sube ticket 4–9%.",
      },
    ],
  },

  restaurante: {
    key: "restaurante",
    family: "gastronomia",
    displayName: "Restaurante",
    peakDayparts: ["midday", "evening"],
    typicalTicketRange: { min: 6000, max: 24000 },
    signature: {
      morning: "Pre-servicio: mise en place y revisión de reservas.",
      midday: "Servicio de mediodía. Velocidad de mesa y rotación marcan el día.",
      afternoon: "Ventana de cambio de turno. Momento para análisis y prep.",
      evening: "Servicio noche: ticket más alto, mayor riesgo de cuellos de botella.",
      late_night: "Cierre operativo. Revisar mermas y conciliación de caja.",
    },
    seedSignals: [
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "rotacion_mesas_servicio", min: 1.5, max: 2.8 },
        raw_text: "Rotación de mesas por servicio en bistró/restó: 1.5–2.8.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 7,
        confidence: "high",
        content: { metric: "dayparts_pico", value: ["midday", "evening"] },
        raw_text: "Dos picos: 13–15 h y 21–23 h.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "food_cost_pct", min: 30, max: 38 },
        raw_text: "Food cost saludable en restaurante: 30–38%.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 5,
        confidence: "medium",
        content: { metric: "labor_cost_pct", min: 28, max: 35 },
        raw_text: "Costo de personal típico: 28–35% de la venta.",
      },
      {
        signal_type: "sector_lever",
        importance: 7,
        confidence: "medium",
        content: { lever: "reservas_propias", impact: "alto" },
        raw_text: "Migrar reservas a canal propio reduce comisiones 6–12%.",
      },
      {
        signal_type: "sector_risk",
        importance: 6,
        confidence: "medium",
        content: { risk: "dependencia_apps_delivery", impact: "alto" },
        raw_text: "Más de 30% de venta vía apps suele erosionar margen.",
      },
      {
        signal_type: "sector_lever",
        importance: 6,
        confidence: "medium",
        content: { lever: "carta_estacional", impact: "medio" },
        raw_text: "Carta estacional con 3 destacados sube ticket 5–10%.",
      },
    ],
  },

  retail: {
    key: "retail",
    family: "retail",
    displayName: "Retail / Tienda",
    peakDayparts: ["midday", "afternoon", "evening"],
    typicalTicketRange: { min: 8000, max: 45000 },
    signature: {
      morning: "Apertura: visual merchandising y reposición marcan el día.",
      midday: "Tráfico estable de almuerzo. Buen momento para clienteling.",
      afternoon: "Ventana clave de conversión. Atención uno-a-uno paga.",
      evening: "Pico de tráfico. Velocidad de checkout no puede fallar.",
      late_night: "Cierre. Revisar inventario y rotura de talles.",
    },
    seedSignals: [
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "conversion_rate_pct", min: 12, max: 28 },
        raw_text: "Tasa de conversión típica en retail físico: 12–28%.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "upt_unidades_por_ticket", min: 1.4, max: 2.6 },
        raw_text: "Unidades por ticket (UPT) saludables: 1.4–2.6.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 5,
        confidence: "medium",
        content: { metric: "rotacion_inventario_anual", min: 4, max: 8 },
        raw_text: "Rotación de inventario anual objetivo: 4–8x.",
      },
      {
        signal_type: "sector_lever",
        importance: 7,
        confidence: "medium",
        content: { lever: "clienteling_whatsapp", impact: "alto" },
        raw_text: "Clienteling vía WhatsApp con base segmentada sube recurrencia 10–20%.",
      },
      {
        signal_type: "sector_lever",
        importance: 6,
        confidence: "medium",
        content: { lever: "vidriera_semanal", impact: "medio" },
        raw_text: "Cambio de vidriera semanal aumenta tráfico entrante 5–12%.",
      },
      {
        signal_type: "sector_risk",
        importance: 6,
        confidence: "medium",
        content: { risk: "stock_dormido", impact: "medio" },
        raw_text: "Más de 25% de SKUs sin venta en 90 días erosiona capital de trabajo.",
      },
    ],
  },

  servicios: {
    key: "servicios",
    family: "servicios",
    displayName: "Servicios profesionales",
    peakDayparts: ["morning", "midday", "afternoon"],
    typicalTicketRange: { min: 15000, max: 250000 },
    signature: {
      morning: "Ventana de productividad alta. Bloquearla para trabajo profundo.",
      midday: "Buen momento para reuniones cortas con clientes activos.",
      afternoon: "Energía media. Tareas de gestión, propuestas, seguimiento.",
      evening: "Hora para cierre administrativo y planificación del día siguiente.",
      late_night: "Fuera de horario. Las decisiones de hoy se notan mañana.",
    },
    seedSignals: [
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "horas_facturables_pct", min: 55, max: 75 },
        raw_text: "Horas facturables sobre disponibles: 55–75% es saludable.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "tasa_renovacion_cliente_pct", min: 60, max: 85 },
        raw_text: "Tasa de renovación de clientes recurrentes: 60–85%.",
      },
      {
        signal_type: "sector_lever",
        importance: 7,
        confidence: "medium",
        content: { lever: "paquetizar_servicios", impact: "alto" },
        raw_text: "Paquetizar servicios sube ticket promedio 15–30% y reduce fricción de venta.",
      },
      {
        signal_type: "sector_lever",
        importance: 6,
        confidence: "medium",
        content: { lever: "proceso_onboarding", impact: "medio" },
        raw_text: "Un onboarding claro reduce churn temprano (primeros 60 días).",
      },
      {
        signal_type: "sector_risk",
        importance: 6,
        confidence: "medium",
        content: { risk: "dependencia_pocos_clientes", impact: "alto" },
        raw_text: "Más de 40% de facturación en 1 cliente concentra riesgo.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 5,
        confidence: "medium",
        content: { metric: "ciclo_cobro_dias", min: 7, max: 30 },
        raw_text: "Ciclo de cobro objetivo: 7–30 días según contrato.",
      },
    ],
  },

  digital: {
    key: "digital",
    family: "digital",
    displayName: "Negocio digital / SaaS",
    peakDayparts: ["morning", "midday", "afternoon", "evening"],
    typicalTicketRange: { min: 5000, max: 80000 },
    signature: {
      morning: "Ventana de tráfico orgánico alta. Buen momento para publicar.",
      midday: "Pico de uso. Monitorear latencia y soporte.",
      afternoon: "Conversión web suele subir 14–18 h. Revisar funnel.",
      evening: "Engagement social fuerte. Momento de comunidad.",
      late_night: "Bajo tráfico LATAM. Buen momento para deploys.",
    },
    seedSignals: [
      {
        signal_type: "sector_benchmark",
        importance: 6,
        confidence: "medium",
        content: { metric: "conversion_landing_pct", min: 1.5, max: 6 },
        raw_text: "Conversión típica de landing en LATAM: 1.5–6%.",
      },
      {
        signal_type: "sector_benchmark",
        importance: 7,
        confidence: "medium",
        content: { metric: "churn_mensual_pct", min: 3, max: 8 },
        raw_text: "Churn mensual aceptable en SaaS de PyME: 3–8%.",
      },
      {
        signal_type: "sector_lever",
        importance: 7,
        confidence: "medium",
        content: { lever: "activacion_primeros_7_dias", impact: "alto" },
        raw_text: "Activación en los primeros 7 días predice retención a 90 días.",
      },
      {
        signal_type: "sector_lever",
        importance: 6,
        confidence: "medium",
        content: { lever: "contenido_seo_evergreen", impact: "alto" },
        raw_text: "Contenido SEO evergreen tarda 3–6 meses pero compone tráfico.",
      },
      {
        signal_type: "sector_risk",
        importance: 6,
        confidence: "medium",
        content: { risk: "dependencia_un_canal", impact: "alto" },
        raw_text: "Más de 60% del tráfico desde un solo canal es frágil.",
      },
    ],
  },

  [DEFAULT_SECTOR_KEY]: {
    key: DEFAULT_SECTOR_KEY,
    family: "otros",
    displayName: "Negocio",
    peakDayparts: ["morning", "midday", "afternoon"],
    typicalTicketRange: { min: 5000, max: 30000 },
    signature: {
      morning: "Mañana operativa. Definir las 3 prioridades del día.",
      midday: "Mediodía: revisar ventas de la mañana y ajustar.",
      afternoon: "Tarde: ventana de gestión comercial y seguimiento.",
      evening: "Cierre del día: lectura honesta de qué movió la aguja.",
      late_night: "Fuera de horario. Las decisiones grandes mejor con luz.",
    },
    seedSignals: [
      {
        signal_type: "sector_benchmark",
        importance: 5,
        confidence: "medium",
        content: { metric: "recurrencia_clientes_pct", min: 25, max: 50 },
        raw_text: "Clientes recurrentes en PyME estable: 25–50%.",
      },
      {
        signal_type: "sector_lever",
        importance: 6,
        confidence: "medium",
        content: { lever: "foco_3_palancas", impact: "alto" },
        raw_text: "Foco en 3 palancas por mes supera a 10 iniciativas en paralelo.",
      },
      {
        signal_type: "sector_lever",
        importance: 6,
        confidence: "medium",
        content: { lever: "medicion_semanal_kpis", impact: "medio" },
        raw_text: "Medir 3–5 KPIs semanales acelera decisiones 2–3x.",
      },
      {
        signal_type: "sector_risk",
        importance: 5,
        confidence: "medium",
        content: { risk: "decision_por_intuicion", impact: "medio" },
        raw_text: "Decidir sin números chicos lleva a corregir tarde.",
      },
    ],
  },
};

export function resolveSectorBaseline(category?: string | null): SectorBaseline {
  if (!category) return SECTOR_BASELINES[DEFAULT_SECTOR_KEY];
  const normalized = category.toLowerCase().trim();
  // Mapeo de aliases comunes a claves canónicas
  const aliasMap: Record<string, string> = {
    cafe: "cafeteria",
    cafetería: "cafeteria",
    coffee: "cafeteria",
    resto: "restaurante",
    bistro: "restaurante",
    bistró: "restaurante",
    tienda: "retail",
    boutique: "retail",
    ecommerce: "digital",
    saas: "digital",
    agencia: "servicios",
    estudio: "servicios",
    consultoria: "servicios",
    consultoría: "servicios",
    b2b: "servicios",
  };
  const key = aliasMap[normalized] ?? normalized;
  return SECTOR_BASELINES[key] ?? SECTOR_BASELINES[DEFAULT_SECTOR_KEY];
}

export function resolveDayPart(hour: number): DayPart {
  if (hour < 6) return "late_night";
  if (hour < 10) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 15) return "midday";
  if (hour < 19) return "afternoon";
  if (hour < 23) return "evening";
  return "late_night";
}

export function sectorSignatureForNow(category?: string | null, now: Date = new Date()): {
  baseline: SectorBaseline;
  daypart: DayPart;
  line: string;
} {
  const baseline = resolveSectorBaseline(category);
  const daypart = resolveDayPart(now.getHours());
  const line =
    baseline.signature[daypart] ??
    baseline.signature.morning ??
    "Momento de leer datos reales y mover una palanca.";
  return { baseline, daypart, line };
}
