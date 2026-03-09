/**
 * PRESENTATION REGISTRY — P0 ZERO LEAKAGE
 * 
 * Repositorio central canónico de mapeos de códigos internos a labels humanas.
 * NINGÚN componente de UI puede renderizar Domain Model directamente.
 * Todo pasa por este registry + SafeText.
 */

// =============================================
// CATEGORY LABELS (internal key → human label)
// =============================================
export const CATEGORY_LABELS: Record<string, string> = {
  // Health dimensions
  ventas: "Ventas",
  sales: "Ventas",
  traffic: "Tráfico",
  trafico: "Tráfico",
  tráfico: "Tráfico",
  rentabilidad: "Rentabilidad",
  profitability: "Rentabilidad",
  equipo: "Equipo",
  team: "Equipo",
  finanzas: "Finanzas",
  finance: "Finanzas",
  eficiencia: "Eficiencia",
  efficiency: "Eficiencia",
  operaciones: "Operaciones",
  operations: "Operaciones",
  crecimiento: "Crecimiento",
  growth: "Crecimiento",
  reputacion: "Reputación",
  reputación: "Reputación",
  reputation: "Reputación",
  marketing: "Marketing",
  identidad: "Identidad",
  identity: "Identidad",
  
  // Business categories
  restaurant: "Restaurante",
  cafe: "Cafetería",
  bar: "Bar",
  food_truck: "Food Truck",
  bakery: "Panadería",
  dark_kitchen: "Cocina virtual",
  ice_cream: "Heladería",
  catering: "Catering",
  hotel: "Hotel",
  retail: "Comercio",
  service: "Servicio",
  professional: "Profesional",
  b2b: "B2B",
  ecommerce: "E-commerce",
  health: "Salud",
  education: "Educación",
  beauty: "Belleza",
  fitness: "Fitness",
  real_estate: "Inmobiliaria",
  consulting: "Consultoría",
  agency: "Agencia",
  freelance: "Freelance",
  construction: "Construcción",
  architecture: "Arquitectura",
  legal: "Legal",
  accounting: "Contabilidad",
  technology: "Tecnología",
  
  // Generic categories
  general: "General",
  industria: "Industria",
  other: "Otro",
  custom: "Personalizado",
  unknown: "Sin categoría",
  
  // Action/mission categories
  pricing: "Precios",
  menu: "Menú / Catálogo",
  staff: "Personal",
  inventory: "Inventario",
  delivery: "Delivery",
  social_media: "Redes sociales",
  customer_service: "Atención al cliente",
  technology_ops: "Tecnología",
  legal_compliance: "Legal y cumplimiento",
  sustainability: "Sustentabilidad",
};

// =============================================
// STATUS LABELS
// =============================================
export const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
  failed: "Con error",
  expired: "Expirado",
  in_progress: "En progreso",
  done: "Completado",
  todo: "Por hacer",
  snoozed: "Pospuesto",
  dismissed: "Descartado",
  converted: "Convertido",
  archived: "Archivado",
  draft: "Borrador",
  published: "Publicado",
  scheduled: "Programado",
  queued: "En cola",
  processing: "Procesando",
  error: "Error",
  success: "Éxito",
  paused: "Pausado",
  blocked: "Bloqueado",
  waiting: "Esperando",
  reviewing: "En revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
  
  // Subscription
  trialing: "En prueba",
  past_due: "Pago vencido",
  
  // Confidence
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  very_high: "Muy alto",
  critical: "Crítico",
};

// =============================================
// PRIORITY LABELS
// =============================================
export const PRIORITY_LABELS: Record<string, string> = {
  P0: "Urgente",
  P1: "Alta",
  P2: "Media",
  P3: "Baja",
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
  urgent: "Urgente",
};

// =============================================
// SOURCE LABELS
// =============================================
export const SOURCE_LABELS: Record<string, string> = {
  chat: "Conversación",
  checkin: "Check-in",
  radar: "Radar",
  manual: "Manual",
  ai: "Asistente IA",
  system: "Sistema",
  form: "Formulario",
  integration: "Integración",
  reviews: "Reseñas",
  sales: "Ventas",
  operations: "Operaciones",
  google: "Google",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  email: "Email",
  sms: "SMS",
  push: "Notificación",
  webhook: "Webhook",
  api: "API",
  import: "Importación",
  export: "Exportación",
  migration: "Migración",
  prediction: "Predicción",
  pulse: "Pulso diario",
  brain: "Análisis IA",
  setup: "Configuración",
  onboarding: "Onboarding",
  diagnostic: "Diagnóstico",
};

// =============================================
// DOMAIN LABELS
// =============================================
export const DOMAIN_LABELS: Record<string, string> = {
  revenue: "Ingresos",
  costs: "Costos",
  traffic: "Tráfico",
  reputation: "Reputación",
  team: "Equipo",
  operations: "Operaciones",
  growth: "Crecimiento",
  marketing: "Marketing",
  finance: "Finanzas",
  customer: "Clientes",
  product: "Producto",
  market: "Mercado",
  competition: "Competencia",
  legal: "Legal",
  technology: "Tecnología",
};

// =============================================
// HORIZON / TIME LABELS
// =============================================
export const HORIZON_LABELS: Record<string, string> = {
  now: "Inmediato",
  short: "Corto plazo",
  short_term: "Corto plazo",
  medium: "Mediano plazo",
  medium_term: "Mediano plazo",
  long: "Largo plazo",
  long_term: "Largo plazo",
  "7d": "7 días",
  "14d": "14 días",
  "30d": "30 días",
  "60d": "60 días",
  "90d": "90 días",
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  yearly: "Anual",
};

// =============================================
// QUESTION / OPTION HUMANIZATION MAPS
// =============================================
const QUESTION_LABELS: Record<string, string> = {
  Q_AI_001: "Origen principal de clientes",
  Q_AI_002: "Rango de clientes por mes",
  Q_AI_003: "Enfoque de capacitación",
  Q_AI_004: "Nivel de registro operativo",
  Q_AI_005: "Método de agenda",
  Q_AI_006: "Zona de crecimiento",
  Q_AI_007: "Tipo de feedback de clientes",
  Q_AI_008: "Presupuesto operativo",
  Q_AI_009: "Tamaño del equipo",
  Q_AI_010: "Horas disponibles por semana",
  Q_AI_011: "Estado de entrenamiento",
  Q_AI_012: "Margen actual",
  Q_AI_013: "Meta de crecimiento",
  Q_AI_014: "Nivel de implementación",
  Q_AI_015: "Tasa de conversión",
  Q_AI_016: "Cobertura actual",
  Q_AI_017: "Principal límite",
  Q_AI_018: "Formato de contenido",
  Q_AI_019: "Tiempo de respuesta al cliente",
};

const OPTION_LABELS: Record<string, string> = {
  referrals: "Referidos",
  train_new: "Entrenar al equipo",
  no_record: "Sin registro formal",
  manual_agenda: "Agenda manual",
  new_neighborhoods: "Nuevas zonas",
  private_feedback: "Feedback privado",
  no_training: "Sin capacitación",
  yes_implemented: "Implementado",
  yes_limited: "Implementado con límites",
  limit_clients: "Capacidad limitada por clientes",
  behind_the_scenes: "Detrás de escena",
  within_24h: "Dentro de 24 horas",
  general_estimate: "Estimación general",
  hand_drawings: "Bocetos a mano",
  larger_projects: "Proyectos de mayor escala",
  lab_tests: "Pruebas de laboratorio",
  thermal_analysis: "Análisis térmico",
  carbon_calc: "Cálculo de huella de carbono",
  logistics: "Logística",
  urban_focus: "Enfoque urbano",
  tight_cash: "Flujo de caja ajustado",
  high_conv: "Alta conversión",
  parity_price: "Precio competitivo",
  standard_tax: "Régimen impositivo estándar",
  residential: "Residencial",
  fixed_crew: "Equipo fijo",
  direct_waste: "Gestión directa de residuos",
  product_sales: "Venta de productos",
  premium_price: "Precio premium",
  universities_alliance: "Alianzas con universidades",
  speaker_expert: "Posicionamiento como experto",
  milestones: "Trabajo por hitos",
  experienced_hire: "Contratación con experiencia",
  intl_cert: "Certificación internacional",
  artisanal: "Producción artesanal",
  rec_focus: "Enfoque recomendado",
};

const INTERNAL_TOKEN_PATTERN = /^[a-z]+(?:_[a-z0-9]+)+$/i;
const QUESTION_CODE_PATTERN = /^Q_[A-Z]{2,}_\d+$/i;

// =============================================
// ERROR MESSAGES (user-friendly, in Spanish)
// =============================================
export const ERROR_MESSAGES: Record<string, string> = {
  network_error: "No se pudo conectar. Verificá tu conexión a internet.",
  timeout: "La solicitud tardó demasiado. Intentá de nuevo.",
  not_found: "No se encontró la información solicitada.",
  unauthorized: "Tu sesión expiró. Iniciá sesión nuevamente.",
  forbidden: "No tenés permisos para realizar esta acción.",
  server_error: "Ocurrió un error inesperado. Estamos trabajando para resolverlo.",
  validation_error: "Revisá los datos ingresados e intentá de nuevo.",
  rate_limit: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.",
  maintenance: "El sistema está en mantenimiento. Volvé en unos minutos.",
  unknown: "Algo salió mal. Intentá de nuevo en unos segundos.",
  quota_exceeded: "Alcanzaste el límite de tu plan. Actualizá para continuar.",
  payment_required: "Se requiere actualizar tu plan para acceder a esta función.",
  conflict: "Hubo un conflicto con los datos. Recargá la página e intentá de nuevo.",
};

// =============================================
// NEUTRAL FALLBACK LABELS
// =============================================
export const NEUTRAL_FALLBACKS = {
  label: "Dato del negocio",
  value: "Configurado",
  option: "Opción del servicio",
  preference: "Preferencia configurada",
  info: "Información adicional",
  pending: "Pendiente",
  notInformed: "No informado",
  activated: "Activado",
  deactivated: "Desactivado",
};

// =============================================
// ENGLISH → SPANISH COMMON WORDS
// =============================================
const ENGLISH_TO_SPANISH: Record<string, string> = {
  loading: "Cargando",
  error: "Error",
  success: "Éxito",
  warning: "Advertencia",
  info: "Información",
  cancel: "Cancelar",
  confirm: "Confirmar",
  delete: "Eliminar",
  edit: "Editar",
  save: "Guardar",
  close: "Cerrar",
  open: "Abrir",
  submit: "Enviar",
  retry: "Reintentar",
  back: "Volver",
  next: "Siguiente",
  previous: "Anterior",
  search: "Buscar",
  filter: "Filtrar",
  sort: "Ordenar",
  refresh: "Actualizar",
  download: "Descargar",
  upload: "Subir",
  share: "Compartir",
  copy: "Copiar",
  paste: "Pegar",
  select: "Seleccionar",
  none: "Ninguno",
  all: "Todos",
  yes: "Sí",
  no: "No",
  true: "Sí",
  false: "No",
  enabled: "Activado",
  disabled: "Desactivado",
  settings: "Configuración",
  profile: "Perfil",
  dashboard: "Panel",
  notifications: "Notificaciones",
  message: "Mensaje",
  messages: "Mensajes",
  help: "Ayuda",
  about: "Acerca de",
  terms: "Términos",
  privacy: "Privacidad",
  logout: "Cerrar sesión",
  login: "Iniciar sesión",
  signup: "Registrarse",
  "not found": "No encontrado",
  "no data": "Sin datos",
  "no results": "Sin resultados",
  undefined: "",
  null: "",
};

// =============================================
// ALLOWED ENGLISH WORDS (brands, products)
// =============================================
const ENGLISH_ALLOWLIST = new Set([
  "google", "whatsapp", "instagram", "facebook", "tiktok", "twitter", "linkedin",
  "chatgpt", "openai", "stripe", "paypal", "mercadopago", "rappi", "pedidosya",
  "uber", "ifood", "glovo", "waze", "yelp", "tripadvisor", "booking",
  "airbnb", "shopify", "wordpress", "wix", "canva", "figma", "slack",
  "zoom", "teams", "gmail", "outlook", "excel", "pdf", "csv",
  "wifi", "pos", "crm", "erp", "seo", "roi", "kpi", "b2b", "b2c",
  "saas", "api", "url", "qr", "nps", "cac", "ltv", "arpu",
  "pro", "premium", "starter", "free", "trial",
  "ok", "email", "feedback", "marketing", "stock", "delivery",
  "check-in", "checkin", "checkout", "check-out",
  "food truck", "dark kitchen", "coworking", "hub", "startup",
  "e-commerce", "ecommerce", "marketplace",
  "fitness", "wellness", "coaching", "freelance",
]);

// =============================================
// PROHIBITED PATTERNS (regex)
// =============================================
const PROHIBITED_PATTERNS = [
  /\bQ_[A-Z]{2,}_\d+\b/g,           // Q_BIO_104, Q_AI_002
  /\b[a-z]+_[a-z]+_\d{3}\b/g,       // b2b_arq_finance_001
  /\b[0-9a-f]{8}-[0-9a-f]{4}-/g,    // UUID prefixes
  /\bauth\.uid\(\)/g,                // SQL fragments
  /\b(snake|camel)_case\b/gi,        // Meta terms
  /\bconsole\.(log|error|warn)\b/g,  // Code fragments
  /\{[a-z_]+\}/g,                    // Template variables {variable_name}
  /\b__[a-z]+__\b/g,                 // Dunder patterns
];

// =============================================
// CORE FUNCTIONS
// =============================================

/**
 * Look up a human label for any internal key.
 * Searches all registries in priority order.
 */
export function humanLabel(key: string | null | undefined): string {
  if (!key) return NEUTRAL_FALLBACKS.notInformed;
  
  const normalized = key.trim().toLowerCase();
  
  // Direct lookups across all registries
  return (
    CATEGORY_LABELS[normalized] ||
    CATEGORY_LABELS[key] ||
    STATUS_LABELS[normalized] ||
    STATUS_LABELS[key] ||
    PRIORITY_LABELS[normalized] ||
    PRIORITY_LABELS[key] ||
    SOURCE_LABELS[normalized] ||
    SOURCE_LABELS[key] ||
    DOMAIN_LABELS[normalized] ||
    DOMAIN_LABELS[key] ||
    HORIZON_LABELS[normalized] ||
    HORIZON_LABELS[key] ||
    humanizeRawString(key)
  );
}

/**
 * Get a user-friendly error message.
 */
export function humanError(errorKey: string | null | undefined, fallbackMessage?: string): string {
  if (!errorKey) return ERROR_MESSAGES.unknown;
  
  const normalized = errorKey.trim().toLowerCase().replace(/\s+/g, '_');
  return ERROR_MESSAGES[normalized] || fallbackMessage || ERROR_MESSAGES.unknown;
}

/**
 * Humanize internal question keys (Q_AI_002, etc.) with safe fallback.
 */
export function questionLabel(questionKey: string | null | undefined): string {
  if (!questionKey) return NEUTRAL_FALLBACKS.label;

  const key = questionKey.trim().toUpperCase();
  if (QUESTION_LABELS[key]) return QUESTION_LABELS[key];
  if (QUESTION_CODE_PATTERN.test(key)) return NEUTRAL_FALLBACKS.label;

  return humanizeRawString(questionKey);
}

/**
 * Humanize values from domain/internal payloads (enum-like tokens, arrays, booleans).
 */
export function humanValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return NEUTRAL_FALLBACKS.notInformed;
  }

  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    const mapped = value.map((v) => humanValue(v)).filter(Boolean);
    return mapped.length ? mapped.join(", ") : NEUTRAL_FALLBACKS.notInformed;
  }

  const raw = String(value).trim();
  if (!raw) return NEUTRAL_FALLBACKS.notInformed;

  if (isProhibitedContent(raw)) return NEUTRAL_FALLBACKS.value;

  const normalized = raw.toLowerCase();
  if (OPTION_LABELS[normalized]) return OPTION_LABELS[normalized];

  if (QUESTION_CODE_PATTERN.test(raw)) return questionLabel(raw);
  if (INTERNAL_TOKEN_PATTERN.test(normalized)) return NEUTRAL_FALLBACKS.option;

  const sanitized = sanitizeForUI(raw);
  return sanitized || NEUTRAL_FALLBACKS.value;
}

/**
 * Humanize a raw technical string into something presentable.
 * Transforms snake_case, camelCase, slugs into human-readable text.
 */
export function humanizeRawString(raw: string): string {
  if (!raw || typeof raw !== 'string') return NEUTRAL_FALLBACKS.label;
  
  // Check if it looks like a prohibited code
  if (isProhibitedContent(raw)) {
    return NEUTRAL_FALLBACKS.label;
  }
  
  let result = raw;
  
  // Remove Q_ prefixes and numeric suffixes
  result = result.replace(/^Q_/i, '').replace(/_\d+$/, '');
  
  // Convert snake_case to spaces
  result = result.replace(/_/g, ' ');
  
  // Convert camelCase to spaces
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Capitalize first letter, lowercase rest
  result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  
  // Trim excess whitespace
  result = result.replace(/\s+/g, ' ').trim();
  
  return result || NEUTRAL_FALLBACKS.label;
}

/**
 * Check if content contains prohibited patterns.
 */
export function isProhibitedContent(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  for (const pattern of PROHIBITED_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) return true;
  }
  
  return false;
}

/**
 * Sanitize text for UI display.
 * Removes prohibited patterns, translates English, ensures Spanish output.
 */
export function sanitizeForUI(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  
  // Catch [object Object] leaks immediately
  if (text === '[object Object]' || text.includes('[object Object]')) {
    return text.replace(/\[object Object\]/g, '').trim() || '';
  }
  
  let result = text;
  
  // Remove prohibited code patterns
  for (const pattern of PROHIBITED_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '');
  }
  
  // Remove parentheses with internal codes e.g., (Q_BIO_104)
  result = result.replace(/\([A-Z_]+\d*\)/g, '');
  result = result.replace(/\(\s*\)/g, '');
  
  // Replace enum-like snake_case tokens with human labels or neutral fallback
  result = result.replace(/\b[a-z]+(?:_[a-z0-9]+)+\b/gi, (token) => {
    const normalized = token.toLowerCase();
    if (OPTION_LABELS[normalized]) return OPTION_LABELS[normalized];
    if (ENGLISH_ALLOWLIST.has(normalized)) return token;
    return NEUTRAL_FALLBACKS.option;
  });
  
  // Translate common English words (only standalone words, not within brands)
  const words = result.split(/\b/);
  result = words.map(word => {
    const lower = word.toLowerCase().trim();
    if (ENGLISH_ALLOWLIST.has(lower)) return word;
    return ENGLISH_TO_SPANISH[lower] || word;
  }).join('');
  
  // Clean up whitespace
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

/**
 * Check if a word is in the English allowlist (brands, etc.)
 */
export function isAllowedEnglish(word: string): boolean {
  return ENGLISH_ALLOWLIST.has(word.toLowerCase().trim());
}

/**
 * Get category label with fallback
 */
export function categoryLabel(category: string | null | undefined): string {
  if (!category) return NEUTRAL_FALLBACKS.label;
  return CATEGORY_LABELS[category.toLowerCase()] || CATEGORY_LABELS[category] || humanizeRawString(category);
}

/**
 * Get status label with fallback
 */
export function statusLabel(status: string | null | undefined): string {
  if (!status) return NEUTRAL_FALLBACKS.pending;
  return STATUS_LABELS[status.toLowerCase()] || STATUS_LABELS[status] || humanizeRawString(status);
}

/**
 * Get priority label with fallback
 */
export function priorityLabel(priority: string | null | undefined): string {
  if (!priority) return PRIORITY_LABELS.medium;
  return PRIORITY_LABELS[priority] || PRIORITY_LABELS[priority.toLowerCase()] || humanizeRawString(priority);
}

/**
 * Get source label with fallback
 */
export function sourceLabel(source: string | null | undefined): string {
  if (!source) return SOURCE_LABELS.system;
  return SOURCE_LABELS[source.toLowerCase()] || SOURCE_LABELS[source] || humanizeRawString(source);
}

/**
 * Get domain label with fallback
 */
export function domainLabel(domain: string | null | undefined): string {
  if (!domain) return NEUTRAL_FALLBACKS.label;
  return DOMAIN_LABELS[domain.toLowerCase()] || DOMAIN_LABELS[domain] || humanizeRawString(domain);
}

/**
 * Get horizon label with fallback
 */
export function horizonLabel(horizon: string | null | undefined): string {
  if (!horizon) return NEUTRAL_FALLBACKS.notInformed;
  return HORIZON_LABELS[horizon.toLowerCase()] || HORIZON_LABELS[horizon] || humanizeRawString(horizon);
}
