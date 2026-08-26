// Step: Questionnaire v14 - Progressive AI-Generated Questions
// Questions load in batches so users can start answering immediately
// Covers all 7 health dimensions with balanced distribution
// v14: Added "Ninguna de estas" + custom text, "No tengo / No aplica" options
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, Check, HelpCircle, Sparkles, Brain, RefreshCw, AlertTriangle, Loader2, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CountryCode, COUNTRY_PACKS, getRevenueRanges, getCurrencyLabel } from '@/lib/countryPacks';
import { supabase } from '@/integrations/supabase/client';
import { 
  getUniversalCategoryLabel,
  UniversalQuestion
} from '@/lib/universalQuestionsEngine';
import { invokeEdgeFunctionSafe } from '@/lib/edge-function-caller';
import type { GenerateQuestionnaireResponse } from '@/lib/edge-function-response-types';
import { notifyBrainLearned } from '@/components/feedback/BrainLearningPulse';
import { SetupComprehension } from '@/components/setup/SetupComprehension';

interface SetupStepQuestionnaireProps {
  countryCode: CountryCode;
  areaId: string;
  businessTypeId: string;
  setupMode: 'quick' | 'complete';
  answers: Record<string, any>;
  questionIndex?: number;
  draftBusinessId?: string | null;
  onUpdate: (answers: Record<string, any>) => void;
  onQuestionIndexChange?: (index: number) => void;
  onComplete: () => void;
  onBack?: () => void;
}

// Loading messages for the AI generation animation
const LOADING_MESSAGES_ES = [
  'Analizando tu tipo de negocio...',
  'Creando preguntas personalizadas...',
  'Adaptando al contexto de tu industria...',
  'Preparando diagnóstico inteligente...',
  'Casi listo...',
];
const LOADING_MESSAGES_PT = [
  'Analisando seu tipo de negócio...',
  'Criando perguntas personalizadas...',
  'Adaptando ao contexto da sua indústria...',
  'Preparando diagnóstico inteligente...',
  'Quase pronto...',
];

// Batch configuration - GENERACIÓN PROGRESIVA:
// El primer micro-batch (3 preguntas) aparece en segundos y el usuario empieza a responder.
// Mientras tanto, el motor sigue pensando los siguientes batches en background y los va
// guardando apenas llegan. Nunca se piensan las 25 juntas.
const BATCH_CONFIG = {
  quick: {
    firstBatch: 3,
    perBatch: 4, // 3 + 4 + 3 = 10
    totalMin: 8,
    totalMax: 10,
  },
  complete: {
    firstBatch: 3,
    perBatch: 4,
    totalMin: 12,
    totalMax: 15,
  },
};

// Hard limits to prevent invalid question counts
function getQuestionLimits(mode: 'quick' | 'complete') {
  const cfg = BATCH_CONFIG[mode];
  return { min: cfg.totalMin, max: cfg.totalMax };
}

// Trim questions to stay within limits, preserving dimension balance
function capQuestions(questions: UniversalQuestion[], mode: 'quick' | 'complete'): UniversalQuestion[] {
  const { max } = getQuestionLimits(mode);
  if (questions.length <= max) return questions;
  // Keep first `max` questions (they're already ordered by generation priority)
  return questions.slice(0, max);
}

// Cache keys for persisting questions across navigation
const QUESTIONS_CACHE_KEY = 'setupQuestionsCache_adaptive_v7';
const QUESTIONS_META_KEY = 'setupQuestionsMeta';

// ============================================================================
// PERFIL DE CONOCIMIENTO DEL USUARIO (adaptación en vivo)
// El setup "tantea": si la persona responde "No sé" o deja respuestas vagas,
// bajamos la dificultad (preguntas observables, sin métricas ni jerga) y
// acortamos el cuestionario. Si responde con detalle, profundizamos.
// ============================================================================
export type KnowledgeLevel = 'bajo' | 'medio' | 'alto';

export interface KnowledgeProfile {
  answered: number;
  unknown: number;
  clarifications: number;
  richAnswers: number;
  unknownRatio: number;
  level: KnowledgeLevel;
}

export function buildKnowledgeProfile(answers: Record<string, any> | undefined | null): KnowledgeProfile {
  let answered = 0, unknown = 0, rich = 0, clarify = 0;
  for (const v of Object.values(answers || {})) {
    if (v === undefined || v === null || v === '') continue;
    answered += 1;
    if (v === '__NOT_SURE__' || v === '__NONE__') { unknown += 1; continue; }
    if (typeof v === 'object' && !Array.isArray(v) && (v as any).type) {
      const t = (v as any).type;
      if (t === '__NO_SE__' || t === '__CLARIFY_PENDING__' || t === '__NONE__') unknown += 1;
      else if (t === '__CLARIFY__' || t === '__CUSTOM__') {
        clarify += 1;
        if (String((v as any).text || '').trim().length >= 25) rich += 1;
      }
      continue;
    }
    if (typeof v === 'string' && v.trim().length >= 25) rich += 1;
  }
  const unknownRatio = answered > 0 ? unknown / answered : 0;
  const level: KnowledgeLevel =
    answered < 2 ? 'medio'
      : unknownRatio >= 0.34 ? 'bajo'
        : (rich + clarify >= 2 && unknownRatio <= 0.1) ? 'alto'
          : 'medio';
  return {
    answered,
    unknown,
    clarifications: clarify,
    richAnswers: rich,
    unknownRatio: Math.round(unknownRatio * 100) / 100,
    level,
  };
}

interface QuestionsCacheData {
  questions: UniversalQuestion[];
  timestamp: number;
  businessTypeId: string;
  setupMode: string;
  contextHash: string;
  allBatchesDone: boolean;
}

// Hash determinístico del contexto que dispara regeneración cuando cambia
// el texto crudo del usuario, las keywords o el sector — clave para 'custom' types.
function hashContext(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function buildContextHash(businessTypeId: string, areaId: string, rawUserText: string, keywords: string[]): string {
  const norm = `${businessTypeId}|${areaId}|${(rawUserText || '').trim().toLowerCase().slice(0, 400)}|${(keywords || []).slice(0, 10).join(',').toLowerCase()}`;
  return hashContext(norm);
}

function getCachedQuestions(businessTypeId: string, setupMode: string, contextHash: string): QuestionsCacheData | null {
  try {
    const cached = localStorage.getItem(QUESTIONS_CACHE_KEY);
    if (!cached) return null;
    const parsed: QuestionsCacheData = JSON.parse(cached);
    // TTL más corto para 'custom' (24h) — el usuario puede iterar la descripción.
    const ttl = businessTypeId === 'custom' ? 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    if (
      Date.now() - parsed.timestamp < ttl &&
      parsed.questions?.length > 0 &&
      parsed.businessTypeId === businessTypeId &&
      parsed.setupMode === setupMode &&
      parsed.contextHash === contextHash
    ) {
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function setCachedQuestions(questions: UniversalQuestion[], businessTypeId: string, setupMode: string, contextHash: string, allDone: boolean) {
  try {
    const data: QuestionsCacheData = {
      questions,
      timestamp: Date.now(),
      businessTypeId,
      setupMode,
      contextHash,
      allBatchesDone: allDone,
    };
    localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

const opt = (id: string, es: string, emoji?: string, impactScore = 5) => ({ id, label: { es, 'pt-BR': es }, emoji, impactScore });
const q = (
  id: string,
  category: string,
  dimension: UniversalQuestion['dimension'],
  title: string,
  options: ReturnType<typeof opt>[],
  type: 'single' | 'multi' = 'single',
  help?: string
): UniversalQuestion => ({
  id,
  category,
  mode: 'both',
  dimension,
  weight: 7,
  title: { es: title, 'pt-BR': title },
  type,
  // Sin opciones "No sé" dentro del grid normal: la UI agrega la opción horizontal
  // "No sé / Quiero aclarar algo" automáticamente para todas las preguntas single/multi.
  options: options.slice(0, 6),
  required: true,
  ...(help ? { help: { es: help, 'pt-BR': help } } : {}),
});

// IDs/labels que NUNCA deben aparecer como opción normal: representan "no sé / aclarar"
// y deben ir en la opción horizontal secundaria (sin autoavance).
const CLARIFY_OPTION_IDS = new Set([
  'not_sure', 'no_se', 'no_sé', 'dont_know', 'idk', 'unknown', 'na', 'n_a',
  'other', 'otro', 'otra', 'none', 'ninguna', 'ninguno',
]);
const CLARIFY_LABEL_PATTERNS = [
  /^no\s+(lo\s+)?s[eé]/i,
  /^no\s+aplica/i,
  /^otra?\s*(\.\.\.|$)/i,
  /^ninguna?\s+de/i,
  /quiero\s+aclarar/i,
  /quiero\s+escribir/i,
];
function isClarifyOption(o: { id: string; label?: { es?: string } }): boolean {
  if (!o) return true;
  if (CLARIFY_OPTION_IDS.has(String(o.id || '').toLowerCase())) return true;
  const lbl = o.label?.es || '';
  return CLARIFY_LABEL_PATTERNS.some(rx => rx.test(lbl.trim()));
}
function getNormalOptions(opts: any[] | undefined): any[] {
  if (!Array.isArray(opts)) return [];
  return opts.filter(o => !isClarifyOption(o)).slice(0, 6);
}

// ============================================================================
// FALLBACK PREMIUM DINÁMICO (visible si el motor AI falla 3 veces).
// NO usa listas fijas. Una sola pregunta-pivote estratégica que captura
// la fricción principal del negocio. Su respuesta se envía como contexto al
// próximo intento de generate-questionnaire (que ahora sí debe responder
// hiperpersonalizado).
// ============================================================================
function buildPremiumPivotFallback(): UniversalQuestion[] {
  return [{
    id: 'PIVOT_VALUE_LOSS',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Dónde se pierde más valor hoy en el negocio?',
      'pt-BR': 'Onde se perde mais valor hoje no negócio?',
    },
    type: 'single',
    required: true,
    options: [
      { id: 'arrival', label: { es: 'Llegada (no llegan suficientes prospectos)', 'pt-BR': 'Chegada' }, emoji: '👀', impactScore: 9 },
      { id: 'inquiry', label: { es: 'Consulta (preguntan pero no avanzan)', 'pt-BR': 'Consulta' }, emoji: '💬', impactScore: 9 },
      { id: 'price', label: { es: 'Precio (se caen al ver el valor)', 'pt-BR': 'Preço' }, emoji: '🏷️', impactScore: 9 },
      { id: 'purchase', label: { es: 'Compra (intentan comprar y no concretan)', 'pt-BR': 'Compra' }, emoji: '🛒', impactScore: 9 },
      { id: 'repeat', label: { es: 'Recompra (compran una vez y no vuelven)', 'pt-BR': 'Recompra' }, emoji: '🔁', impactScore: 9 },
      { id: 'operation', label: { es: 'Operación (lo que se entrega cuesta caro o falla)', 'pt-BR': 'Operação' }, emoji: '⚙️', impactScore: 9 },
    ],
  }];
}

// ============================================================================
// EMERGENCY QUESTIONNAIRE CANDIDATE - NO RENDERIZAR DIRECTO EN PRODUCCIÓN.
// Solo se usa como semilla técnica para debug/desarrollo. En producción, el
// flujo visible debe ser: AI motor → (fallback premium pivote) → AI motor.
// Si por error algún código intenta usarlo directo, isProductionRuntime()
// debe bloquearlo.
// ============================================================================
function isProductionRuntime(): boolean {
  try {
    // import.meta.env.PROD = true en build de producción
    // @ts-ignore
    return !!(import.meta?.env?.PROD);
  } catch { return false; }
}

function buildEmergencyQuestionnaireCandidate(mode: 'quick' | 'complete'): UniversalQuestion[] {
  // Detect business stage from universal profile (set by SetupStepIdentityAI)
  let stage: string | undefined;
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('setupUniversalProfile') : null;
    stage = stored ? JSON.parse(stored)?.business_stage : undefined;
  } catch { /* ignore */ }
  const isPlanning = stage === 'planning';

  // ============= QUICK (12 preguntas) =============
  // Para "Proyecto nuevo" cambiamos preguntas que asumen operación (precio actual, reseñas, seguimiento)
  // por preguntas faciles de planeamiento.
  const quick: UniversalQuestion[] = isPlanning ? [
    q('EASY_01_STAGE', 'identity', 'growth', '¿En qué momento estás con tu proyecto?', [opt('idea', 'Idea muy inicial', '💡'), opt('planning', 'Planeando los próximos pasos', '🗺️'), opt('almost', 'Casi listo para arrancar', '🚀'), opt('first_sales', 'Hice las primeras ventas de prueba', '🌱')]),
    q('EASY_02_GOAL', 'goals', 'growth', '¿Qué te ayudaría más ahora?', [opt('clarity', 'Tener claro qué hacer primero', '🎯'), opt('clients', 'Saber dónde encontrar clientes', '👥'), opt('offer', 'Definir bien la oferta', '📦'), opt('confidence', 'Validar que vale la pena', '✅')]),
    q('EASY_03_OFFER', 'identity', 'traffic', '¿Tu propuesta principal está definida?', [opt('clear', 'Sí, ya la tengo', '✅'), opt('almost', 'Casi, falta pulir', '🛠️'), opt('exploring', 'Estoy explorando', '🌫️'), opt('open', 'Abierto a sugerencias', '💭')]),
    q('EASY_04_AUDIENCE', 'identity', 'traffic', '¿Sabés a quién querés venderle?', [opt('clear', 'Sí, lo tengo claro', '🎯'), opt('rough', 'Tengo una idea', '🟡'), opt('exploring', 'Estoy probando', '🔍'), opt('open', 'No todavía', '🌱')]),
    q('EASY_05_DIFFERENTIAL', 'identity', 'growth', '¿Qué te diferencia o querés que te diferencie?', [opt('quality', 'Calidad', '⭐'), opt('price', 'Precio', '💰'), opt('attention', 'Atención cercana', '💬'), opt('innovation', 'Algo nuevo', '✨')]),
    q('EASY_06_CHANNEL', 'sales', 'traffic', '¿Por dónde pensás comunicar primero?', [opt('whatsapp', 'WhatsApp', '📲'), opt('instagram', 'Redes sociales', '📱'), opt('web', 'Web', '🌐'), opt('referrals', 'Boca en boca', '🤝')]),
    q('EASY_07_BLOCKER', 'operation', 'efficiency', '¿Qué es lo que más te traba para arrancar?', [opt('time', 'Tiempo', '⏱️'), opt('money', 'Capital inicial', '💸'), opt('know_how', 'No sé por dónde empezar', '🧭'), opt('fear', 'Inseguridad de lanzar', '🌫️')]),
    q('EASY_08_INVESTMENT', 'finance', 'finances', '¿Pensaste cuánto vas a invertir al principio?', [opt('low', 'Lo mínimo posible', '🪙'), opt('medium', 'Inversión moderada', '💼'), opt('high', 'Voy con todo', '💎'), opt('not_yet', 'Todavía no lo definí', '🤔')]),
    q('EASY_09_TIMELINE', 'goals', 'growth', '¿Cuándo te gustaría arrancar?', [opt('now', 'Ya', '🚀'), opt('weeks', 'En unas semanas', '📅'), opt('months', 'En unos meses', '🗓️'), opt('exploring', 'Sigo explorando', '🌱')]),
    q('EASY_10_FIRST_STEP', 'goals', 'efficiency', '¿Qué primer paso te gustaría hacer hoy?', [opt('plan', 'Tener un plan claro', '🗺️'), opt('test', 'Probar la idea con alguien', '🧪'), opt('content', 'Empezar a comunicar', '📣'), opt('priority', 'Saber qué priorizar', '🎯')]),
    q('EASY_11_SUPPORT', 'team', 'team', '¿Vas a hacerlo solo/a o con alguien?', [opt('solo', 'Solo/a', '👤'), opt('partner', 'Con un socio/a', '🤝'), opt('team', 'Con un equipo', '👥'), opt('family', 'Con familia o amigos', '🫶')]),
    q('EASY_12_FIRST_ANALYSIS', 'goals', 'growth', '¿Qué te gustaría ver primero en tu análisis?', [opt('opportunities', 'Radar de oportunidades', '📡'), opt('mission', 'Misión para hoy', '🎯'), opt('insights', 'Ideas para arrancar', '💡'), opt('competition', 'Análisis de competencia', '🔮')]),
  ] : [
    q('EASY_01_STAGE', 'identity', 'growth', '¿En qué momento está tu negocio hoy?', [opt('starting', 'Estoy empezando', '🌱'), opt('selling', 'Ya vendo, pero quiero crecer', '📈'), opt('stable', 'Funciona, pero quiero ordenarlo', '⚙️'), opt('stuck', 'Siento que está trabado', '🚧')]),
    q('EASY_02_GOAL', 'goals', 'growth', '¿Qué querés mejorar primero?', [opt('more_clients', 'Conseguir más clientes', '👥'), opt('sell_more', 'Vender más', '💬'), opt('profit', 'Mejorar rentabilidad', '💰'), opt('order', 'Ordenar procesos', '🧩')], 'single', 'Rentabilidad: cuánto te queda real después de cubrir todos los costos.'),
    q('EASY_03_CHANNEL', 'sales', 'traffic', '¿Por dónde llegan más consultas o ventas?', [opt('whatsapp', 'WhatsApp', '📲'), opt('instagram', 'Redes sociales', '📱'), opt('web', 'Web o buscadores', '🔎'), opt('referrals', 'Recomendaciones', '🤝')]),
    q('EASY_04_BLOCKER', 'operation', 'efficiency', '¿Qué te frena más en el día a día?', [opt('time', 'Falta de tiempo', '⏱️'), opt('clients', 'Faltan clientes', '👥'), opt('process', 'Mucho desorden operativo', '🧭'), opt('money', 'Los números no cierran', '💸')]),
    q('EASY_05_RESPONSE', 'sales', 'traffic', 'Cuando alguien consulta, ¿qué tan rápido respondés?', [opt('minutes', 'En minutos', '⚡'), opt('same_day', 'En el día', '🕒'), opt('next_day', 'Al otro día', '📅'), opt('late', 'A veces se me pasan consultas', '⚠️')]),
    q('EASY_06_PROFITABLE', 'finance', 'profitability', '¿Tenés claro qué producto o servicio te deja más ganancia?', [opt('yes', 'Sí, lo tengo claro', '✅'), opt('some', 'Más o menos', '🟡'), opt('no', 'No, vendo sin mirar eso', '🔍'), opt('varies', 'Depende del mes', '📆')]),
    q('EASY_07_REPEAT', 'reputation', 'reputation', '¿Tus clientes suelen volver o recomendarte?', [opt('often', 'Sí, bastante', '⭐'), opt('sometimes', 'A veces', '🙂'), opt('rarely', 'Poco', '🧊'), opt('new', 'Todavía no tengo suficientes clientes', '🌱')]),
    q('EASY_08_CONTROL', 'finance', 'finances', '¿Cómo llevás el control de ventas y gastos?', [opt('system', 'Con sistema o planilla', '📊'), opt('notes', 'Con notas o mensajes', '📝'), opt('memory', 'De memoria', '🧠'), opt('none', 'Casi no lo controlo', '⚠️')]),
    q('EASY_09_COMPETITION', 'sales', 'growth', '¿Qué sentís que hace mejor tu competencia?', [opt('price', 'Precio', '🏷️'), opt('attention', 'Atención o respuesta', '💬'), opt('visibility', 'Visibilidad', '📣'), opt('offer', 'Oferta más clara', '🎯')]),
    q('EASY_10_MISSION', 'goals', 'efficiency', 'Si VISTACEO te diera una misión para hoy, ¿cuál te serviría más?', [opt('sell', 'Mejorar ventas', '📈'), opt('whatsapp', 'Ordenar WhatsApp', '📲'), opt('prices', 'Revisar precios', '💰'), opt('priority', 'Saber qué priorizar', '🎯')]),
    q('EASY_11_CLEAR_OFFER', 'sales', 'traffic', '¿Tu oferta principal se entiende rápido?', [opt('yes', 'Sí, está clara', '✅'), opt('almost', 'Podría estar más clara', '🛠️'), opt('no', 'No tanto', '🌫️'), opt('new', 'La estoy definiendo', '🌱')], 'single', 'Oferta: el producto o servicio principal que ofrecés y por qué alguien debería elegirte.'),
    q('EASY_12_PRICE', 'finance', 'profitability', '¿Cuándo fue la última vez que revisaste precios?', [opt('month', 'Este mes', '📆'), opt('quarter', 'En los últimos 3 meses', '🗓️'), opt('year', 'Hace más de 6 meses', '⏳'), opt('never', 'Nunca de forma ordenada', '⚠️')]),
  ];

  if (mode === 'quick') return quick;

  // ============= COMPLETE - 18 preguntas extra =============
  const moreActive: UniversalQuestion[] = [
    q('EASY_13_PEAK', 'sales', 'traffic', '¿Sabés qué días u horarios te conviene vender más fuerte?', [opt('yes', 'Sí, lo tengo claro', '✅'), opt('intuition', 'Lo intuyo', '🧠'), opt('no', 'No lo miro', '🔍'), opt('varies', 'Cambia mucho', '🔄')]),
    q('EASY_14_LOST_CLIENTS', 'sales', 'traffic', '¿Dónde sentís que se pierden más clientes?', [opt('before_contact', 'Antes de consultar', '👀'), opt('after_message', 'Después del primer mensaje', '💬'), opt('price', 'Cuando ven el precio', '🏷️'), opt('followup', 'Por falta de seguimiento', '📌')], 'single', 'Seguimiento: volver a contactar a quien preguntó pero todavía no compró.'),
    q('EASY_15_REVIEWS', 'reputation', 'reputation', '¿Tenés reseñas o testimonios recientes?', [opt('many', 'Sí, varias recientes', '⭐'), opt('few', 'Algunas', '🙂'), opt('old', 'Tengo, pero viejas', '⏳'), opt('none', 'Casi ninguna', '🧊')]),
    q('EASY_16_TEAM', 'team', 'team', '¿Las tareas principales están claras para vos o tu equipo?', [opt('yes', 'Sí, cada uno sabe qué hacer', '✅'), opt('some', 'Más o menos', '🟡'), opt('no', 'Se decide sobre la marcha', '🧭'), opt('solo', 'Trabajo solo/a', '👤')]),
    q('EASY_17_FOLLOWUP', 'sales', 'traffic', '¿Hacés seguimiento a quienes consultan y no compran?', [opt('always', 'Sí, siempre', '🔁'), opt('sometimes', 'A veces', '🙂'), opt('rarely', 'Pocas veces', '🧊'), opt('never', 'No lo hago', '⚠️')]),
    q('EASY_18_CONTENT', 'sales', 'growth', '¿Qué tan seguido mostrás tu negocio en redes o web?', [opt('daily', 'Todos los días', '📱'), opt('weekly', 'Varias veces por semana', '🗓️'), opt('rare', 'Cuando puedo', '⏱️'), opt('never', 'Casi nunca', '🧊')]),
    q('EASY_19_PAYMENTS', 'finance', 'efficiency', '¿Cobrarle al cliente es simple?', [opt('easy', 'Sí, muy simple', '✅'), opt('some', 'Podría ser mejor', '🛠️'), opt('manual', 'Es bastante manual', '📝'), opt('problem', 'A veces genera problemas', '⚠️')]),
    q('EASY_20_CAPACITY', 'operation', 'efficiency', '¿Hoy podrías atender más demanda sin desordenarte?', [opt('yes', 'Sí', '✅'), opt('little', 'Un poco más', '🟡'), opt('no', 'No, ya estoy al límite', '🚦'), opt('depends', 'Depende del día', '📆')]),
    q('EASY_21_DECISIONS', 'goals', 'growth', '¿Qué decisión te cuesta más tomar?', [opt('prices', 'Precios', '💰'), opt('where_sell', 'Dónde vender o comunicar', '📣'), opt('hire', 'Contratar o delegar', '👥'), opt('priority', 'Qué hacer primero', '🎯')]),
    q('EASY_22_PROMOS', 'sales', 'profitability', '¿Usás promociones o descuentos?', [opt('planned', 'Sí, planificados', '🎯'), opt('sometimes', 'A veces', '🏷️'), opt('too_much', 'Demasiado seguido', '⚠️'), opt('never', 'No uso', '🧊')], 'single', 'Planificados: pensados con anticipación, con fecha y objetivo claro (no improvisados).'),
    q('EASY_23_SUPPLIERS', 'operation', 'profitability', '¿Hay costos o proveedores que te preocupan?', [opt('yes', 'Sí, varios', '💸'), opt('some', 'Algunos', '🟡'), opt('no', 'No especialmente', '✅'), opt('unknown', 'No lo tengo claro', '🔍')]),
    q('EASY_24_TOOLS', 'operation', 'efficiency', '¿Qué herramienta usás más para operar?', [opt('whatsapp', 'WhatsApp', '📲'), opt('spreadsheet', 'Planilla', '📊'), opt('system', 'Sistema de gestión', '🧩'), opt('manual', 'Todo manual', '📝')]),
    q('EASY_25_CUSTOMER_ASKS', 'reputation', 'traffic', '¿Qué te preguntan más los clientes?', [opt('price', 'Precio', '💰'), opt('availability', 'Disponibilidad', '📅'), opt('how_it_works', 'Cómo funciona', '💬'), opt('trust', 'Garantía o confianza', '⭐')]),
    q('EASY_26_CASH', 'finance', 'finances', '¿Cómo se siente tu caja hoy?', [opt('healthy', 'Ordenada', '✅'), opt('tight', 'Ajustada', '🟡'), opt('uncertain', 'Incierta', '🌫️'), opt('stress', 'Me preocupa', '⚠️')], 'single', 'Caja: la plata real disponible para el día a día del negocio.'),
    q('EASY_27_REFERRALS', 'reputation', 'growth', '¿Pedís recomendaciones a clientes satisfechos?', [opt('always', 'Sí, siempre', '⭐'), opt('sometimes', 'A veces', '🙂'), opt('rarely', 'Casi nunca', '🧊'), opt('never', 'Nunca', '⚠️')]),
    q('EASY_28_TIME_DRAIN', 'operation', 'efficiency', '¿Qué te genera más pérdida de tiempo?', [opt('messages', 'Responder mensajes', '💬'), opt('admin', 'Administración', '🧾'), opt('delivery', 'Entregas o coordinación', '🚚'), opt('rework', 'Corregir errores', '🛠️')]),
    q('EASY_29_WEBSITE', 'sales', 'traffic', 'Si alguien ve tu web o perfil, ¿tiene una acción clara?', [opt('yes', 'Sí, sabe qué hacer', '✅'), opt('some', 'Podría ser más claro', '🛠️'), opt('no', 'No mucho', '🌫️'), opt('none', 'No tengo web o perfil activo', '🧊')]),
    q('EASY_30_FIRST_ANALYSIS', 'goals', 'growth', '¿Qué querés ver primero en tu análisis?', [opt('opportunities', 'Radar de oportunidades', '📡'), opt('mission', 'Misión para hoy', '🎯'), opt('prediction', 'Predicción de competencia', '🔮'), opt('insights', 'Ideas concretas para crecer', '💡')]),
  ];

  const morePlanning: UniversalQuestion[] = [
    q('EASY_13_NAME', 'identity', 'reputation', '¿Ya tenés nombre para tu proyecto?', [opt('yes', 'Sí, definitivo', '✅'), opt('idea', 'Tengo una idea', '💭'), opt('options', 'Estoy entre varias opciones', '🤔'), opt('no', 'Todavía no', '🌱')]),
    q('EASY_14_LOCATION', 'identity', 'traffic', '¿Cómo va a operar tu proyecto?', [opt('online', '100% online', '🌐'), opt('local', 'Local físico', '🏠'), opt('hybrid', 'Mixto', '🔀'), opt('exploring', 'Aún no decidí', '🤷')]),
    q('EASY_15_PRICES', 'finance', 'profitability', '¿Pensaste cómo vas a cobrar / qué precios?', [opt('clear', 'Sí, ya los tengo', '💰'), opt('rough', 'Una idea inicial', '🟡'), opt('research', 'Estoy investigando', '🔍'), opt('no', 'Todavía no', '🌫️')]),
    q('EASY_16_FIRST_CLIENTS', 'sales', 'traffic', '¿Tenés idea de dónde van a salir tus primeros clientes?', [opt('network', 'De mi red personal', '🤝'), opt('online', 'De redes sociales', '📱'), opt('referrals', 'Por recomendación', '⭐'), opt('not_sure', 'No lo tengo claro', '🤔')]),
    q('EASY_17_BIGGEST_FEAR', 'goals', 'growth', '¿Qué es lo que más te preocupa de arrancar?', [opt('no_clients', 'No conseguir clientes', '👥'), opt('competition', 'La competencia', '⚔️'), opt('money', 'Quedarme sin plata', '💸'), opt('time', 'No tener tiempo', '⏱️')]),
    q('EASY_18_VALIDATION', 'sales', 'traffic', '¿Hablaste con alguien sobre tu idea para validarla?', [opt('many', 'Sí, con varias personas', '✅'), opt('few', 'Con algunos', '🙂'), opt('one', 'Con uno o dos', '🤝'), opt('no', 'Todavía no', '🌱')]),
    q('EASY_19_BRAND', 'identity', 'reputation', '¿Tenés logo o identidad visual?', [opt('yes', 'Sí, definitiva', '🎨'), opt('draft', 'Algo borrador', '✏️'), opt('idea', 'Sólo idea', '💭'), opt('no', 'Todavía no', '🌫️')]),
    q('EASY_20_SOCIAL', 'sales', 'traffic', '¿Ya tenés cuenta de redes sociales lista?', [opt('active', 'Sí, ya activa', '📱'), opt('created', 'Creada pero sin uso', '🟡'), opt('planning', 'La voy a crear', '🗓️'), opt('no', 'Todavía no lo pensé', '🤷')]),
    q('EASY_21_LEGAL', 'finance', 'finances', '¿Cómo vas a facturar al principio?', [opt('formal', 'Empresa o monotributo', '📜'), opt('informal', 'Sin facturar todavía', '🤷'), opt('research', 'Lo estoy averiguando', '🔍'), opt('not_sure', 'No lo definí', '🌫️')]),
    q('EASY_22_TIME', 'team', 'efficiency', '¿Cuánto tiempo por semana le vas a poder dedicar?', [opt('full', 'Tiempo completo', '🚀'), opt('half', 'Medio tiempo', '🕒'), opt('few', 'Pocas horas', '⏱️'), opt('weekends', 'Fines de semana', '📅')]),
    q('EASY_23_MARKET', 'sales', 'growth', '¿Investigaste a la competencia?', [opt('deep', 'Sí, en profundidad', '🔬'), opt('basic', 'Por arriba', '🟡'), opt('plan', 'Lo voy a hacer', '🗓️'), opt('no', 'Todavía no', '🌱')]),
    q('EASY_24_GOAL_3M', 'goals', 'growth', '¿Qué te gustaría haber logrado en 3 meses?', [opt('first_clients', 'Primeros clientes', '🎯'), opt('break_even', 'Cubrir gastos', '💰'), opt('confidence', 'Saber si funciona', '✅'), opt('community', 'Tener seguidores', '👥')]),
    q('EASY_25_RISK', 'goals', 'finances', '¿Qué tanto riesgo estás dispuesto/a a tomar?', [opt('low', 'Bajo, ir despacio', '🐢'), opt('medium', 'Moderado', '🟡'), opt('high', 'Alto, ir a fondo', '🚀'), opt('not_sure', 'No lo tengo claro', '🤔')]),
    q('EASY_26_HELP', 'team', 'team', '¿Quién te puede ayudar al principio?', [opt('mentor', 'Un mentor o referente', '🧭'), opt('friends', 'Amigos o familia', '🫶'), opt('community', 'Una comunidad', '👥'), opt('alone', 'Por ahora solo/a', '👤')]),
    q('EASY_27_CONTENT_PLAN', 'sales', 'growth', '¿Pensaste cómo vas a comunicar lo que hacés?', [opt('plan', 'Sí, tengo un plan', '🗺️'), opt('idea', 'Ideas sueltas', '💭'), opt('learn', 'Tengo que aprender', '📚'), opt('no', 'No todavía', '🌱')]),
    q('EASY_28_TOOLS', 'operation', 'efficiency', '¿Qué herramientas pensás usar para arrancar?', [opt('whatsapp', 'WhatsApp', '📲'), opt('spreadsheet', 'Planilla', '📊'), opt('platforms', 'Plataformas (Tienda, etc)', '🛒'), opt('not_sure', 'No lo definí', '🤷')]),
    q('EASY_29_PASSION', 'identity', 'growth', '¿Qué te apasiona de este proyecto?', [opt('purpose', 'El propósito', '🌟'), opt('freedom', 'La libertad', '🦅'), opt('impact', 'El impacto que puede tener', '🌍'), opt('income', 'La oportunidad de ingresos', '💰')]),
    q('EASY_30_FIRST_ANALYSIS', 'goals', 'growth', '¿Qué te gustaría ver primero en tu análisis?', [opt('roadmap', 'Plan de arranque', '🗺️'), opt('mission', 'Primera misión concreta', '🎯'), opt('insights', 'Ideas validadas', '💡'), opt('competition', 'Análisis de mercado', '🔮')]),
  ];

  return [...quick, ...(isPlanning ? morePlanning : moreActive)];
}

export const SetupStepQuestionnaire = ({
  countryCode,
  areaId,
  businessTypeId,
  setupMode,
  answers,
  questionIndex = 0,
  draftBusinessId,
  onUpdate,
  onQuestionIndexChange,
  onComplete,
  onBack,
}: SetupStepQuestionnaireProps) => {
  // Hash del contexto del usuario (rawUserText + keywords) para invalidar cache
  // cuando el usuario cambia su descripción aunque el businessTypeId siga igual ('custom').
  const contextHash = useMemo(() => {
    try {
      const raw = localStorage.getItem('setupUniversalProfile');
      const profile = raw ? JSON.parse(raw) : {};
      return buildContextHash(businessTypeId, areaId, profile?._raw_user_text || '', profile?.keywords || []);
    } catch {
      return buildContextHash(businessTypeId, areaId, '', []);
    }
  }, [businessTypeId, areaId]);
  // Restore cached questions if returning (validated by type + mode + contextHash)
  const cacheData = useMemo(() => getCachedQuestions(businessTypeId, setupMode, contextHash), [businessTypeId, setupMode, contextHash]);
  const hasCache = !!cacheData && cacheData.questions.length > 0;
  const cacheComplete = !!cacheData?.allBatchesDone;
  // Fallback premium dinámico (1 pregunta-pivote estratégica). NUNCA listas fijas visibles.
  const pivotFallback = useMemo(() => buildPremiumPivotFallback(), []);
  // Emergency seed: SOLO disponible en dev/debug. En producción es []. NUNCA se renderiza directo.
  const emergencyCandidate = useMemo(
    () => (isProductionRuntime() ? [] : buildEmergencyQuestionnaireCandidate(setupMode)),
    [setupMode]
  );

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, questionIndex));
  const [questions, setQuestions] = useState<UniversalQuestion[]>(hasCache ? cacheData!.questions : []);
  // Si no hay cache, mostramos loading e invocamos el motor inteligente (no la lista fija).
  const [isLoadingFirst, setIsLoadingFirst] = useState(!hasCache);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  const retryCountRef = useRef(0);
  const generateRemainingBatchesRef = useRef<(() => void) | null>(null);
  const MAX_RETRIES = 3;

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  // Empezamos en false: el motor AI DEBE correr salvo que el cache ya esté completo.
  const backgroundFetchStarted = useRef(false);
  const allBatchesDone = useRef(cacheComplete);
  const firstBatchStarted = useRef(hasCache); // si hay cache, no re-pedimos el primer batch

  const latestAnswersRef = useRef(answers);
  // Fuente de verdad síncrona del array de preguntas (para el loop progresivo en background)
  const questionsRef = useRef<UniversalQuestion[]>(hasCache ? cacheData!.questions : []);

  const lang = COUNTRY_PACKS[countryCode]?.locale?.startsWith('pt') ? 'pt-BR' : 'es';
  const currency = COUNTRY_PACKS[countryCode]?.currencySymbol || '$';
  const currencyLabel = getCurrencyLabel(countryCode);
  const revenueRanges = getRevenueRanges(countryCode);
  const loadingMessages = lang === 'pt-BR' ? LOADING_MESSAGES_PT : LOADING_MESSAGES_ES;

  // Get universal profile from localStorage
  const universalProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem('setupUniversalProfile');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, []);

  const businessTypeLabel = universalProfile?.subtype_label || universalProfile?.subtype || businessTypeId;
  const rawUserText = universalProfile?._raw_user_text || '';
  const businessName = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('setupProgress') || '{}')?.data?.businessName || '';
    } catch { return ''; }
  }, []);

  // Shared function to call the edge function
  const fetchQuestions = useCallback(async (
    questionCount: string,
    batchIndex: number,
    previousAnswersCtx?: Record<string, any>,
    existingTitles?: string[],
  ) => {
    const { data, error } = await invokeEdgeFunctionSafe<GenerateQuestionnaireResponse>('generate-questionnaire', {
      body: {
        module: 'setup',
        outputContract: 'questionnaire_v1',
        businessTypeLabel,
        businessTypeId,
        areaId,
        countryCode,
        setupMode,
        businessName,
        rawUserText,
        universalProfile,
        questionCount,
        batchIndex,
        previousAnswers: previousAnswersCtx,
        existingTitles,
        // Adaptación en vivo: nivel de claridad que la persona tiene sobre su negocio.
        knowledgeProfile: buildKnowledgeProfile(previousAnswersCtx || latestAnswersRef.current),
        // El primer batch debe incluir la pregunta de intención (para qué le sirve el sistema).
        askIntent: batchIndex === 0,
      },
    });

    if (error) throw error;
    if (!data?.questions?.length) throw new Error('No questions generated');
    return data.questions as UniversalQuestion[];
  }, [businessTypeLabel, businessTypeId, areaId, countryCode, setupMode, businessName, rawUserText, universalProfile]);

  // Keep latestAnswersRef in sync
  useEffect(() => { latestAnswersRef.current = answers; }, [answers]);

  // Generate first MICRO-batch (3 preguntas): aparece en segundos.
  // El resto se piensa en background mientras el usuario ya responde.
  const generateFirstBatch = useCallback(async () => {
    setIsLoadingFirst(true);
    setGenerationError(false);
    setLoadingMsgIndex(0);

    const firstCount = BATCH_CONFIG[setupMode].firstBatch;

    try {
      const firstQuestions = await fetchQuestions(`${firstCount}-${firstCount + 1}`, 0);
      const capped = capQuestions(firstQuestions, setupMode);
      questionsRef.current = capped;
      setQuestions(capped);
      setCachedQuestions(capped, businessTypeId, setupMode, contextHash, false);
      if (questionIndex === 0) {
        setCurrentIndex(0);
      }
      setIsLoadingFirst(false);
    } catch (err) {
      const attempt = retryCountRef.current + 1;
      console.warn('AI questionnaire first batch failed (attempt ' + attempt + '):', err);
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        // Backoff progresivo: el fallo típico es saturación momentánea del motor.
        const delay = [1200, 3000, 6000][retryCountRef.current - 1] ?? 6000;
        setTimeout(() => generateFirstBatch(), delay);
        return;
      }
      // Último recurso: pregunta-pivote premium dinámica (NO lista fija). Su respuesta
      // se inyecta como contexto y se reintenta el motor AI desde la próxima pregunta.
      console.warn('[Setup] Motor AI no respondió tras reintentos. Activando fallback premium pivote.');
      questionsRef.current = pivotFallback;
      setQuestions(pivotFallback);
      setCachedQuestions(pivotFallback, businessTypeId, setupMode, contextHash, false);
      // allBatchesDone NO se marca true: queremos que tras la primera respuesta
      // se reintente el motor AI con ese contexto real.
      backgroundFetchStarted.current = false;
      setGenerationError(false);
      setIsLoadingFirst(false);
      // Auto-recuperación: reintentar el motor en background aunque el usuario
      // no haya respondido todavía (nunca queda con una sola pregunta).
      setTimeout(() => {
        if (!allBatchesDone.current && !backgroundFetchStarted.current) {
          generateRemainingBatchesRef.current?.();
        }
      }, 9000);
    }

  }, [fetchQuestions, setupMode, questionIndex, businessTypeId, contextHash, pivotFallback]);

  // Generación PROGRESIVA en background: micro-batches secuenciales que se
  // guardan apenas llegan. Nunca se piensan todas las preguntas juntas y el
  // setup SIEMPRE puede terminarse (cierre garantizado).
  const generateRemainingBatches = useCallback(async () => {
    if (backgroundFetchStarted.current || allBatchesDone.current) return;
    backgroundFetchStarted.current = true;
    setIsLoadingMore(true);

    const cfg = BATCH_CONFIG[setupMode];
    const { min, max } = getQuestionLimits(setupMode);
    let consecutiveFailures = 0;
    let batchIdx = 1;

    // Si todavía no llegamos al mínimo, insistimos más (el fallo típico es
    // saturación momentánea del motor, no un error real).
    const failureBudget = () => (questionsRef.current.length < min ? 6 : 3);

    // ADAPTATIVO: si la persona ya mostró que no tiene claridad (varios "No sé"),
    // acortamos el cuestionario. Nunca por debajo del mínimo útil para el brain.
    const effectiveMax = () => {
      const kp = buildKnowledgeProfile(latestAnswersRef.current);
      if (kp.answered >= 4 && kp.level === 'bajo') return Math.max(min, max - 4);
      if (kp.answered >= 4 && kp.level === 'medio' && kp.unknownRatio >= 0.2) return Math.max(min, max - 2);
      return max;
    };

    while (questionsRef.current.length < effectiveMax() && consecutiveFailures < failureBudget()) {
      const missing = max - questionsRef.current.length;
      const ask = Math.min(cfg.perBatch, Math.max(3, missing));
      try {
        const existingTitles = questionsRef.current
          .map(q => q.title?.es || '')
          .filter(Boolean);
        const batch = await fetchQuestions(
          `${ask}-${ask}`,
          batchIdx,
          latestAnswersRef.current,
          existingTitles,
        );
        batchIdx += 1;
        consecutiveFailures = 0;

        const prev = questionsRef.current;
        const existingIds = new Set(prev.map(q => q.id));
        const titleSet = new Set(prev.map(q => (q.title?.es || '').toLowerCase().trim()));
        const fresh = batch.filter(q =>
          q.id &&
          !existingIds.has(q.id) &&
          !titleSet.has((q.title?.es || '').toLowerCase().trim())
        );
        const merged = capQuestions([...prev, ...fresh], setupMode);
        questionsRef.current = merged;
        setQuestions(merged);
        setCachedQuestions(merged, businessTypeId, setupMode, contextHash, merged.length >= max);

        // Si la IA sólo devolvió repetidas, contarlo como fallo para no loopear infinito.
        if (fresh.length === 0) consecutiveFailures += 1;
      } catch (err) {
        consecutiveFailures += 1;
        console.warn(`[Setup] batch ${batchIdx} falló (fallo #${consecutiveFailures}):`, err);
        const wait = Math.min(1200 * consecutiveFailures, 6000);
        await new Promise(r => setTimeout(r, wait));
      }
    }

    // Cierre GARANTIZADO: aunque la IA haya fallado, el usuario puede completar
    // el setup con las preguntas que haya. Nunca queda trabado ni expulsado.
    const total = questionsRef.current.length;
    if (total < min) {
      console.warn(`[Setup] Cerrando con ${total}/${min} preguntas (batches incompletos).`);
      // Dejamos la puerta abierta a un reintento posterior (al responder o al volver).
      backgroundFetchStarted.current = false;
      allBatchesDone.current = total > 0;
    } else {
      allBatchesDone.current = true;
    }
    setCachedQuestions(questionsRef.current, businessTypeId, setupMode, contextHash, allBatchesDone.current);
    setIsLoadingMore(false);
  }, [fetchQuestions, setupMode, businessTypeId, contextHash]);

  useEffect(() => {
    generateRemainingBatchesRef.current = generateRemainingBatches;
  }, [generateRemainingBatches]);


  // Motor inteligente: si no hay cache válido, generar preguntas hiperpersonalizadas vía AI.
  // Tanto Rápido como Completo usan el MISMO motor (generate-questionnaire).
  useEffect(() => {
    if (firstBatchStarted.current) return;
    if (hasCache && questions.length > 0) {
      firstBatchStarted.current = true;
      return;
    }
    firstBatchStarted.current = true;
    generateFirstBatch();
  }, [generateFirstBatch, hasCache, questions.length]);

  // Background batches (ambos modos): arrancan APENAS llega el primer micro-batch,
  // para que el resto de preguntas se piense mientras el usuario responde.
  useEffect(() => {
    if (backgroundFetchStarted.current || allBatchesDone.current) return;
    // Si volvemos con cache incompleto, retomar ya.
    if (hasCache && !cacheComplete && questions.length > 0) {
      generateRemainingBatches();
      return;
    }
    // Disparar inmediatamente al tener el primer batch (no esperar respuestas).
    if (!isLoadingFirst && questions.length > 0) {
      generateRemainingBatches();
    }
  }, [isLoadingFirst, questions.length, generateRemainingBatches, hasCache, cacheComplete]);

  // Cycle loading messages
  useEffect(() => {
    if (!isLoadingFirst) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoadingFirst, loadingMessages.length]);

  // Track elapsed loading time to reveal "start over" CTA when stuck
  useEffect(() => {
    if (!isLoadingFirst) { setLoadingElapsed(0); return; }
    const started = Date.now();
    const t = setInterval(() => setLoadingElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [isLoadingFirst]);

  // Self-service escape hatch: cuando el setup no representa al usuario o está atascado.
  // Limpia estado local, reporta incidente (no requiere admin) y reinicia.
  const handleNotRepresentative = useCallback(async () => {
    try {
      supabase.functions
        .invoke('report-incident', {
          body: {
            source: 'app',
            category: 'setup',
            severity: 'high',
            title: 'Usuario marcó setup como no representativo (self-service)',
            where_path: typeof window !== 'undefined' ? window.location.pathname : null,
            detected_by: 'SetupStepQuestionnaire',
            context: {
              businessTypeId,
              areaId,
              countryCode,
              setupMode,
              questionsLoaded: questions.length,
              loadingElapsed,
              draftBusinessId,
            },
            fingerprint: `not_representative:${draftBusinessId ?? 'nodraft'}:${businessTypeId}`,
          },
        })
        .catch(() => undefined);
    } catch { /* noop */ }
    try {
      localStorage.removeItem('setupUniversalProfile');
      localStorage.removeItem('setupProgress');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('vc:questions:cache:') || k.startsWith('setupQuestionnaireCache'))
        .forEach((k) => localStorage.removeItem(k));
    } catch { /* noop */ }
    if (typeof window !== 'undefined') window.location.assign('/setup');
  }, [businessTypeId, areaId, countryCode, setupMode, questions.length, loadingElapsed, draftBusinessId]);


  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (currentIndex >= totalQuestions && totalQuestions > 0) {
      setCurrentIndex(totalQuestions - 1);
    }
  }, [currentIndex, totalQuestions]);

  const onQuestionIndexChangeRef = useRef(onQuestionIndexChange);
  onQuestionIndexChangeRef.current = onQuestionIndexChange;

  useEffect(() => {
    onQuestionIndexChangeRef.current?.(currentIndex);
  }, [currentIndex]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Safety: don't auto-complete with zero questions (wait for generation)
  useEffect(() => {
    if (isLoadingFirst) return;
    if (questions.length === 0 && !generationError && !hasCache) {
      // Only auto-complete if we never had any questions and generation didn't error
      // This prevents the edge case of completing with 0 questions
      console.warn('No questions available and no error - this should not happen');
    }
  }, [isLoadingFirst, questions.length, generationError, hasCache]);

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset custom input when question changes + clear pending auto-advance
  useEffect(() => {
    setShowCustomInput(false);
    setCustomText('');
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, [currentIndex]);

  useEffect(() => () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  const getCurrentValue = () => answers[currentQuestion?.id];

  // 🧠 APRENDIZAJE EN VIVO: cada respuesta nutre el brain en tiempo real
  // (fire-and-forget). El brain ya existe (draft creado al entrar al cuestionario).
  const liveIngest = useCallback((question: UniversalQuestion, value: any) => {
    if (!draftBusinessId || !question) return;
    try {
      const field =
        (question as any).targetBrainField ||
        `factual.${question.category || 'general'}.${question.id}`;
      const rawAnswer = typeof value === 'string'
        ? value
        : (value && typeof value === 'object' && 'text' in value)
          ? String((value as any).text || '')
          : JSON.stringify(value);
      const isClarify = value && typeof value === 'object' && (value as any).type === '__CLARIFY__';
      const isUnknown = value && typeof value === 'object' && (value as any).type === '__CLARIFY_PENDING__';
      // Fire-and-forget. Nunca bloquea el UI ni interrumpe el flujo de respuesta.
      invokeEdgeFunctionSafe('onboarding-ingest', {
        body: {
          businessId: draftBusinessId,
          field,
          value,
          rawAnswer: question.title?.es ? `${question.title.es} → ${rawAnswer}` : rawAnswer,
          source: 'onboarding',
          state: isClarify ? 'confirmed' : (isUnknown ? 'unknown' : 'observed'),
          confidence: isClarify ? 0.9 : (isUnknown ? 0.2 : 0.7),
          kind: isClarify ? 'confirmed_fact' : 'new_fact',
          stage: 'oferta',
        },
      }).catch(() => { /* silencioso: el bulk del final igual persiste todo */ });
    } catch { /* noop */ }
  }, [draftBusinessId]);

  const handleAnswer = (value: any) => {
    onUpdate({ ...answers, [currentQuestion.id]: value });
    liveIngest(currentQuestion, value);
    // Feedback visual: el cerebro aprende en vivo. SIEMPRE en español, nunca raw category en inglés.
    const q: any = currentQuestion;
    const titleEs = q?.title?.es || q?.title || '';
    const catLabel = q?.category ? getUniversalCategoryLabel(q.category, lang as 'es' | 'pt-BR') : '';
    const text =
      (typeof titleEs === 'string' && titleEs) ||
      q?.shortLabel ||
      catLabel ||
      'nueva señal';
    notifyBrainLearned(String(text).slice(0, 60));
  };

  // "No sé / Quiero aclarar algo": NUNCA autoavanza. Solo abre input.
  // No setea respuesta todavía: se decide en handleCustomSubmit según haya texto o no.
  const handleNoneOfThese = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setShowCustomInput(true);
    // Marcamos un placeholder para que canProceed() habilite Continuar,
    // pero el contenido real se confirma en submit (vacío => "No sé", con texto => aclaración).
    handleAnswer({ type: '__CLARIFY_PENDING__', text: '' });
  };

  const handleCustomSubmit = () => {
    const trimmed = customText.trim();
    if (trimmed) {
      // Aclaración real del usuario: prioridad alta en el brain.
      handleAnswer({ type: '__CLARIFY__', text: trimmed, source: 'user_clarification' });

      // Si el usuario escribió >20 chars, disparar re-interpretación del setup
      // en background. Si el LLM detecta que area/businessType actuales son
      // incorrectos, se registra en settings.reinterpretations para trazabilidad
      // y el próximo batch de preguntas se generará con contexto corregido.
      if (trimmed.length >= 20 && draftBusinessId) {
        invokeEdgeFunctionSafe('setup-reinterpret', {
          body: {
            businessId: draftBusinessId,
            clarifyText: trimmed,
            currentAreaId: areaId,
            currentBusinessTypeId: businessTypeId,
            countryCode,
            questionTitle: (currentQuestion as any)?.title?.es ?? null,
          },
        }).catch(() => { /* silencioso: no bloquea el flujo */ });
      }
    } else {
      // Sin texto: se guarda como "No sé" (dato pendiente de validar, sin penalización).
      handleAnswer({ type: '__NO_SE__', text: 'No sé', source: 'user_unknown' });
    }
    setShowCustomInput(false);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => handleNext(), 120);
  };

  const handleMultiSelect = (optionId: string) => {
    const current = (answers[currentQuestion.id] as string[]) || [];
    const updated = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    onUpdate({ ...answers, [currentQuestion.id]: updated });
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    const value = getCurrentValue();
    if (!currentQuestion.required) return true;
    if (value === '__NONE__') return true;
    if (typeof value === 'object' && value?.type && [
      '__NONE__', '__CUSTOM__', '__CLARIFY__', '__CLARIFY_PENDING__', '__NO_SE__',
    ].includes(value.type)) return true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== null;
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (!isLoadingMore && allBatchesDone.current) {
      const { min } = getQuestionLimits(setupMode);
      if (totalQuestions < min) {
        console.warn(`Only ${totalQuestions} questions, minimum is ${min}. Allowing completion anyway.`);
      }
      onComplete();
    } else if (isLoadingMore) {
      // Still loading more questions - user sees waiting state
    } else if (totalQuestions >= getQuestionLimits(setupMode).min) {
      onComplete();
    }
  };

  // Auto-advance on single-select after a short delay (better UX, no extra click)
  const handleSingleSelect = (optionId: string) => {
    handleAnswer(optionId);
    setShowCustomInput(false);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      handleNext();
    }, 280);
  };

  // Auto-advance when new questions arrive and user was at the end
  useEffect(() => {
    if (currentIndex === totalQuestions - 1 && isLoadingMore) {
      // Questions array will grow, so this effect will re-trigger
    }
  }, [totalQuestions]);

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  // Check if user is at the end and waiting for more questions
  const isWaitingForMore = currentIndex >= totalQuestions - 1 && isLoadingMore && !allBatchesDone.current;

  // ============= LOADING STATE (first batch) =============
  if (isLoadingFirst) {
    return (
      <div className="space-y-8 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
            <Brain className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-primary" />
          </motion.div>
        </motion.div>

        <div className="space-y-3 text-center">
          <h3 className="text-xl font-bold text-foreground">
            {lang === 'pt-BR' ? 'Criando seu diagnóstico' : 'Creando tu diagnóstico'}
          </h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingMsgIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-muted-foreground text-sm"
            >
              {loadingMessages[loadingMsgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {loadingMessages.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
                i <= loadingMsgIndex ? "bg-primary" : "bg-muted"
              )}
              animate={i === loadingMsgIndex ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          ))}
        </div>

        {loadingElapsed >= 20 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 pt-4"
          >
            <p className="text-xs text-muted-foreground">
              {lang === 'pt-BR' ? 'Está demorando mais que o normal.' : 'Está tardando más de lo normal.'}
            </p>
            <Button variant="ghost" size="sm" onClick={handleNotRepresentative} className="gap-2 text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5" />
              {lang === 'pt-BR' ? 'Isto não me representa — começar de novo' : 'Esto no me representa — empezar de nuevo'}
            </Button>
          </motion.div>
        )}
      </div>
    );
  }


  // ============= ERROR STATE =============
  if (generationError && questions.length === 0) {
    return (
      <div className="space-y-8 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-3 text-center">
          <h3 className="text-xl font-bold text-foreground">
            {lang === 'pt-BR' ? 'Não foi possível gerar o questionário' : 'No pudimos generar el cuestionario'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {lang === 'pt-BR' 
              ? 'Houve um problema ao criar suas perguntas personalizadas. Tente novamente.'
              : 'Hubo un problema al crear tus preguntas personalizadas. Intentá de nuevo.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              retryCountRef.current = 0;
              setGenerationError(false);
              backgroundFetchStarted.current = false;
              allBatchesDone.current = false;
              generateFirstBatch();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {lang === 'pt-BR' ? 'Tentar novamente' : 'Reintentar'}
          </Button>
          <Button variant="ghost" onClick={onComplete}>
            {lang === 'pt-BR' ? 'Pular' : 'Omitir'}
          </Button>
        </div>
        <Button variant="link" size="sm" onClick={handleNotRepresentative} className="text-muted-foreground hover:text-foreground gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          {lang === 'pt-BR' ? 'Isto não me representa — começar de novo' : 'Esto no me representa — empezar de nuevo'}
        </Button>
      </div>
    );
  }


  if (!currentQuestion && !isLoadingFirst && questions.length > 0) {
    setTimeout(() => setCurrentIndex(Math.max(0, Math.min(currentIndex, questions.length - 1))), 0);
    return null;
  }
  if (!currentQuestion && !isLoadingFirst) {
    // Sin preguntas y sin loading: forzar fallback premium pivote (nunca lista fija).
    questionsRef.current = pivotFallback;
    setQuestions(pivotFallback);
    return null;
  }
  if (!currentQuestion) return null;

  // ============= RENDER INPUT =============
  const renderInput = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.id === 'Q_MONTHLY_REVENUE' || currentQuestion.id === 'Q_AI_MONTHLY_REVENUE') {
      return (
        <div className="grid grid-cols-1 gap-3">
          {revenueRanges.map((option) => {
            const isSelected = getCurrentValue() === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                <span className={cn("font-medium", isSelected && "text-primary")}>
                  {option.label[lang] || option.label.es}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    switch (currentQuestion.type) {
      case 'single': {
        const currentVal = getCurrentValue();
        const isClarify = typeof currentVal === 'object' && currentVal?.type && [
          '__CUSTOM__', '__NONE__', '__CLARIFY__', '__CLARIFY_PENDING__', '__NO_SE__',
        ].includes(currentVal.type);
        const normalOptions = getNormalOptions(currentQuestion.options as any[]);
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {normalOptions.map((option: any) => {
                const isSelected = currentVal === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSingleSelect(option.id)}
                    className={cn(
                      "p-3 sm:p-4 rounded-xl border-2 text-left transition-all min-h-[72px] flex flex-col justify-center",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50 bg-card active:scale-[0.98]"
                    )}
                  >
                    {option.emoji && <span className="text-lg sm:text-xl mb-1 block">{option.emoji}</span>}
                    <span className={cn("font-medium text-xs sm:text-sm leading-tight", isSelected && "text-primary")}>
                      {option.label[lang] || option.label.es}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Opción horizontal secundaria: NUNCA autoavanza, abre input */}
            <button
              onClick={handleNoneOfThese}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2",
                isClarify
                  ? "border-primary/60 bg-primary/5 text-primary"
                  : "border-border/60 hover:border-primary/40 bg-card/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 opacity-70" />
              {lang === 'pt-BR' ? 'Não sei / Quero esclarecer algo' : 'No sé / Quiero aclarar algo'}
            </button>
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={lang === 'pt-BR' ? 'Escreva sua resposta ou deixe em branco para "Não sei"...' : 'Escribí tu aclaración o dejá vacío para "No sé"...'}
                  className="min-h-[80px] text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCustomSubmit} className="flex-1">
                    <Check className="w-4 h-4 mr-1" />
                    {customText.trim()
                      ? (lang === 'pt-BR' ? 'Enviar esclarecimento' : 'Enviar aclaración')
                      : (lang === 'pt-BR' ? 'Continuar como "Não sei"' : 'Continuar como "No sé"')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowCustomInput(false); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        );
      }

      case 'multi': {
        const selectedItems = (getCurrentValue() as string[]) || [];
        const hasClarifyMulti = typeof getCurrentValue() === 'object' && getCurrentValue()?.type && [
          '__CUSTOM__', '__NONE__', '__CLARIFY__', '__CLARIFY_PENDING__', '__NO_SE__',
        ].includes(getCurrentValue()?.type);
        const normalMultiOptions = getNormalOptions(currentQuestion.options as any[]);
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {normalMultiOptions.map((option: any) => {
                const isSelected = selectedItems.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleMultiSelect(option.id)}
                    className={cn(
                      "p-3 sm:p-4 rounded-xl border-2 text-left transition-all relative min-h-[72px] flex flex-col justify-center",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                  >
                    {isSelected && (
                      <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                    )}
                    {option.emoji && <span className="text-lg sm:text-xl mb-1 block">{option.emoji}</span>}
                    <span className={cn("font-medium text-xs sm:text-sm leading-tight", isSelected && "text-primary")}>
                      {option.label[lang] || option.label.es}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Opción horizontal secundaria para multi: NUNCA autoavanza */}
            <button
              onClick={handleNoneOfThese}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2",
                hasClarifyMulti
                  ? "border-primary/60 bg-primary/5 text-primary"
                  : "border-border/60 hover:border-primary/40 bg-card/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 opacity-70" />
              {lang === 'pt-BR' ? 'Não sei / Quero esclarecer algo' : 'No sé / Quiero aclarar algo'}
            </button>
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={lang === 'pt-BR' ? 'Escreva sua resposta ou deixe em branco para "Não sei"...' : 'Escribí tu aclaración o dejá vacío para "No sé"...'}
                  className="min-h-[80px] text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCustomSubmit} className="flex-1">
                    <Check className="w-4 h-4 mr-1" />
                    {customText.trim()
                      ? (lang === 'pt-BR' ? 'Enviar esclarecimento' : 'Enviar aclaración')
                      : (lang === 'pt-BR' ? 'Continuar como "Não sei"' : 'Continuar como "No sé"')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowCustomInput(false); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        );
      }

      case 'number':
      case 'money':
        return (
          <div className="space-y-4">
            <div className="relative">
              {currentQuestion.type === 'money' && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                  {currency}
                </span>
              )}
              <Input
                type="number"
                value={getCurrentValue() === '__NOT_SURE__' ? '' : (getCurrentValue() || '')}
                onChange={(e) => handleAnswer(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={lang === 'pt-BR' ? 'Digite um valor' : 'Ingresá un valor'}
                className={cn(
                  "h-14 text-lg text-center",
                  currentQuestion.type === 'money' && "pl-10"
                )}
              />
            </div>
            {(currentQuestion.type === 'money' || currentQuestion.id.includes('PRICE') || currentQuestion.id.includes('TICKET')) && getCurrentValue() !== '__NOT_SURE__' && (
              <p className="text-center text-sm text-muted-foreground">
                {currencyLabel}: {currency} {getCurrentValue()?.toLocaleString() || '---'}
              </p>
            )}
            <button
              onClick={() => handleAnswer('__NOT_SURE__')}
              className={cn(
                "w-full p-3 rounded-xl border-2 text-sm transition-all text-center",
                getCurrentValue() === '__NOT_SURE__'
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:border-primary/50 bg-card text-muted-foreground"
              )}
            >
              {lang === 'pt-BR' ? '🤷 Não sei ainda' : '🤷 No lo sé todavía'}
            </button>
          </div>
        );

      case 'slider': {
        const isNotSure = getCurrentValue() === '__NOT_SURE__';
        const sliderValue = isNotSure ? (currentQuestion.min ?? 0) : (getCurrentValue() ?? currentQuestion.min ?? 0);
        return (
          <div className="space-y-6 py-4">
            {!isNotSure && (
              <>
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{sliderValue}</span>
                  <span className="text-lg text-muted-foreground ml-2">
                    {currentQuestion.unit === '%' ? '%' : currentQuestion.unit}
                  </span>
                </div>
                <Slider
                  value={[sliderValue]}
                  min={currentQuestion.min || 0}
                  max={currentQuestion.max || 100}
                  step={1}
                  onValueChange={([val]) => handleAnswer(val)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currentQuestion.min || 0}</span>
                  <span>{currentQuestion.max || 100}</span>
                </div>
              </>
            )}
            <button
              onClick={() => handleAnswer(isNotSure ? undefined : '__NOT_SURE__')}
              className={cn(
                "w-full p-3 rounded-xl border-2 text-sm transition-all text-center",
                isNotSure
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:border-primary/50 bg-card text-muted-foreground"
              )}
            >
              {lang === 'pt-BR' ? '🤷 Não sei ainda' : '🤷 No lo sé todavía'}
            </button>
          </div>
        );
      }

      case 'text':
        return (
          <Input
            type="text"
            value={getCurrentValue() || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={lang === 'pt-BR' ? 'Digite aqui...' : 'Escribí acá...'}
            className="h-14 text-lg"
          />
        );

      default:
        return null;
    }
  };

  const categoryLabel = getUniversalCategoryLabel(currentQuestion.category, lang);

  // Cuántas preguntas respondió realmente (para habilitar la salida temprana).
  const answeredCount = Object.values(answers || {}).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && String(v).trim() !== ''
  ).length;


  // Estimated total - always show a number within valid range
  const { min: limitMin, max: limitMax } = getQuestionLimits(setupMode);
  const estimatedTotal = setupMode === 'quick' ? 10 : 25;
  // If all batches done, show actual total (already capped). Otherwise show estimate.
  const displayTotal = allBatchesDone.current 
    ? totalQuestions 
    : Math.min(Math.max(totalQuestions, estimatedTotal), limitMax);
  const displayProgress = (currentIndex + 1) / displayTotal * 100;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            {categoryLabel}
          </Badge>
          <div className="flex items-center gap-2">
            {isLoadingMore && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
            <span className="text-muted-foreground">
              {currentIndex + 1} / {displayTotal}
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Prueba de comprensión: sólo con datos reales ya respondidos */}
      <SetupComprehension
        businessName={businessName}
        questions={questions as any}
        answers={answers as Record<string, unknown>}
        lang={lang === 'pt-BR' ? 'pt-BR' : 'es'}
      />



      <AnimatePresence mode="wait">
        {isWaitingForMore ? (
          <motion.div
            key="waiting-more"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              {lang === 'pt-BR' ? 'Preparando mais perguntas...' : 'Preparando más preguntas...'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* AI badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/30">
                <Brain className="w-3 h-3" />
                {lang === 'pt-BR' ? 'Personalizado com IA' : 'Personalizado con IA'}
              </Badge>
            </div>

            {/* Question */}
            <div className="text-center space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                {currentQuestion.title[lang] || currentQuestion.title.es}
              </h2>
              {currentQuestion.help && (
                <div className="mx-auto max-w-md rounded-xl bg-primary/5 border border-primary/20 px-3 py-2 flex items-start gap-2 text-left">
                  <HelpCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-foreground/80 leading-snug">
                    {currentQuestion.help[lang] || currentQuestion.help.es}
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="py-2">{renderInput()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - minimal: small back + continue only when needed */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={currentIndex === 0 && !onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {lang === 'pt-BR' ? 'Anterior' : 'Anterior'}
        </Button>
        {/* Show Continue only for non-single types (multi/number/etc) or at the end */}
        {(currentQuestion.type !== 'single' || showCustomInput || (currentIndex >= totalQuestions - 1 && allBatchesDone.current)) && (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isWaitingForMore}
            size="lg"
            className="flex-1 max-w-xs"
          >
            {isWaitingForMore ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {lang === 'pt-BR' ? 'Carregando...' : 'Cargando...'}
              </>
            ) : currentIndex >= totalQuestions - 1 && allBatchesDone.current ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                {lang === 'pt-BR' ? 'Finalizar' : 'Finalizar'}
              </>
            ) : (
              <>
                {lang === 'pt-BR' ? 'Continuar' : 'Continuar'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Skip option for non-required */}
      {!currentQuestion.required && !isWaitingForMore && (
        <button
          onClick={handleNext}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {lang === 'pt-BR' ? 'Pular' : 'Omitir'}
        </button>
      )}

      {/* Salida temprana: con 5+ respuestas ya hay contexto suficiente para activar el tablero.
          Evita el abandono en el paso más largo del setup. */}
      {answeredCount >= 4 && !isWaitingForMore && (
        <button
          onClick={onComplete}
          className="w-full text-center text-xs text-muted-foreground/70 hover:text-primary transition-colors"
        >
          {lang === 'pt-BR'
            ? `Já respondi ${answeredCount} — ativar meu painel agora`
            : `Ya respondí ${answeredCount} — activar mi tablero ahora`}
        </button>
      )}
    </div>
  );
};
