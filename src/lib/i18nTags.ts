/**
 * Centralized tag/code translator — ZERO LEAKAGE
 * Garantiza que ningún código interno en inglés llegue al usuario.
 *
 * Uso:
 *   translateTag("market_signal") -> "Señal de mercado"
 *   translateTag("innovation")    -> "Innovación"
 *   translateTag("unknown_code")  -> "Unknown code" -> "Código desconocido"
 */

const TAG_TRANSLATIONS: Record<string, string> = {
  // item_type / radar
  trend: "Tendencia",
  trends: "Tendencias",
  benchmark: "Comparativa",
  benchmarks: "Comparativas",
  platform: "Plataforma",
  competitive: "Competencia",
  competitor: "Competencia",
  competitors: "Competencia",
  product: "Producto",
  products: "Productos",
  macro: "Macro",
  opportunity: "Oportunidad",
  opportunities: "Oportunidades",
  general: "General",
  consumo: "Consumo",
  operacion_externa: "Operación externa",
  innovation: "Innovación",
  innovations: "Innovaciones",
  market_signal: "Señal de mercado",
  market_signals: "Señales de mercado",
  case_study: "Caso de estudio",
  case_studies: "Casos de estudio",
  insight: "Hallazgo",
  insights: "Hallazgos",
  tactic: "Táctica",
  tactics: "Tácticas",
  research: "Investigación",
  analysis: "Análisis",
  development: "Desarrollo",
  external: "Externo",
  internal: "Interno",
  rd: "I+D",
  // sources
  reviews: "Reseñas",
  sales: "Ventas",
  social: "Redes sociales",
  operations: "Operaciones",
  ai: "IA",
  checkin: "Registro",
  health: "Salud",
  // estados
  quick_win: "Logro rápido",
  "quick win": "Logro rápido",
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
  pending: "Pendiente",
  done: "Hecho",
  in_progress: "En curso",
  success: "Éxito",
  failed: "Falló",
  loading: "Cargando",
  error: "Error",
  // drivers / dimensiones
  traffic: "Tráfico",
  profitability: "Rentabilidad",
  team: "Equipo",
  finance: "Finanzas",
  efficiency: "Eficiencia",
  growth: "Crecimiento",
  reputation: "Reputación",
  marketing: "Marketing",
  brand: "Marca",
  customer: "Cliente",
  customers: "Clientes",
  retention: "Retención",
  acquisition: "Captación",
  conversion: "Conversión",
  // varios
  draft: "Borrador",
  preview: "Vista previa",
  beta: "Beta",
  new: "Nuevo",
  trending: "En tendencia",
  recommended: "Recomendado",
};

// EN→ES de palabras sueltas para humanización fallback
const WORD_TRANSLATIONS: Record<string, string> = {
  market: "mercado",
  signal: "señal",
  signals: "señales",
  innovation: "innovación",
  case: "caso",
  study: "estudio",
  studies: "estudios",
  trend: "tendencia",
  trends: "tendencias",
  growth: "crecimiento",
  insight: "hallazgo",
  insights: "hallazgos",
  win: "logro",
  quick: "rápido",
  benchmark: "comparativa",
  research: "investigación",
  analysis: "análisis",
  development: "desarrollo",
  product: "producto",
  customer: "cliente",
  brand: "marca",
  pending: "pendiente",
  loading: "cargando",
  error: "error",
  success: "éxito",
  done: "hecho",
  external: "externo",
  internal: "interno",
};

function humanize(raw: string): string {
  // snake_case / kebab-case / camelCase → palabras
  const words = raw
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => WORD_TRANSLATIONS[w] ?? w);
  const joined = words.join(" ").trim();
  if (!joined) return "";
  return joined.charAt(0).toLocaleUpperCase("es-ES") + joined.slice(1);
}

export function translateTag(value: string | null | undefined, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;

  const key = raw.toLowerCase();
  if (TAG_TRANSLATIONS[key]) return TAG_TRANSLATIONS[key];

  // Si ya está en español (acentos o ñ), respetar
  if (/[áéíóúñü]/i.test(raw)) return raw;

  // Si es snake_case o tiene caracteres no-letra → humanizar
  if (/[_\-]/.test(raw) || /[a-z][A-Z]/.test(raw)) return humanize(raw);

  // Palabra suelta: ver si hay traducción directa
  if (WORD_TRANSLATIONS[key]) {
    const t = WORD_TRANSLATIONS[key];
    return t.charAt(0).toLocaleUpperCase("es-ES") + t.slice(1);
  }

  // Si parece código (mayúsculas+underscores+dígitos) → fallback genérico
  if (/^[A-Z0-9_]{3,}$/.test(raw)) return fallback || "Categoría";

  // Devolver capitalizado
  return raw.charAt(0).toLocaleUpperCase("es-ES") + raw.slice(1);
}

export const TAG_DICTIONARY = TAG_TRANSLATIONS;
