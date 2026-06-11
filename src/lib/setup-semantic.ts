/**
 * Setup Semantic Builder — convierte respuestas del cuestionario en
 * registros semánticos enriquecidos que sí mueven el brain.
 *
 * No reemplaza el storage existente — agrega un mapeo paralelo
 * `answers_semantic` que admin/dashboard/brain leen.
 */

export type SemanticAnswerType = 'normal' | 'unknown' | 'clarification' | 'multi' | 'numeric' | 'text';

export interface SemanticAnswer {
  questionId: string;
  questionText?: string;
  optionText?: string;
  semanticValue?: unknown;
  intentKey?: string;
  targetBrainField?: string;
  healthDimension?: string;
  affectedModules?: string[];
  answerType: SemanticAnswerType;
  rawAnswer: unknown;
  normalizedAnswer?: unknown;
  wasUnknown: boolean;
  wasClarification: boolean;
  hypothesisConfirmed?: boolean;
  hypothesisRejected?: boolean;
  confidenceDelta?: number;
  createdAt: string;
}

interface QuestionDef {
  id: string;
  title?: string;
  question?: string;
  options?: Array<{ id: string; label?: string; semanticValue?: unknown }>;
  targetBrainField?: string;
  intentKey?: string;
  healthDimension?: string;
  affectedModules?: string[];
}

export function buildSemanticAnswer(
  question: QuestionDef,
  rawAnswer: unknown
): SemanticAnswer {
  const now = new Date().toISOString();
  const base: SemanticAnswer = {
    questionId: question.id,
    questionText: question.title ?? question.question,
    targetBrainField: question.targetBrainField,
    intentKey: question.intentKey,
    healthDimension: question.healthDimension,
    affectedModules: question.affectedModules,
    answerType: 'normal',
    rawAnswer,
    wasUnknown: false,
    wasClarification: false,
    createdAt: now,
  };

  // Caso "No sé / aclaración" (objetos especiales emitidos por el form)
  if (rawAnswer && typeof rawAnswer === 'object' && 'type' in (rawAnswer as Record<string, unknown>)) {
    const t = (rawAnswer as { type: string }).type;
    const text = (rawAnswer as { text?: string }).text ?? '';
    if (t === '__NO_SE__' || t === '__CLARIFY_PENDING__') {
      return {
        ...base,
        answerType: 'unknown',
        normalizedAnswer: null,
        wasUnknown: true,
        confidenceDelta: 0,
      };
    }
    if (t === '__CLARIFY__') {
      return {
        ...base,
        answerType: 'clarification',
        normalizedAnswer: text,
        wasClarification: true,
        // Aclaración escrita pisa hipótesis previas con mayor peso.
        confidenceDelta: 0.25,
        hypothesisRejected: true,
      };
    }
  }

  // Multi-select
  if (Array.isArray(rawAnswer)) {
    return {
      ...base,
      answerType: 'multi',
      normalizedAnswer: rawAnswer,
      semanticValue: rawAnswer,
      confidenceDelta: 0.1,
      hypothesisConfirmed: true,
    };
  }

  // Numérico
  if (typeof rawAnswer === 'number') {
    return {
      ...base,
      answerType: 'numeric',
      normalizedAnswer: rawAnswer,
      semanticValue: rawAnswer,
      confidenceDelta: 0.15,
      hypothesisConfirmed: true,
    };
  }

  // String (id de opción o texto libre)
  if (typeof rawAnswer === 'string') {
    const matchedOption = question.options?.find(o => o.id === rawAnswer);
    return {
      ...base,
      answerType: matchedOption ? 'normal' : 'text',
      optionText: matchedOption?.label,
      semanticValue: matchedOption?.semanticValue ?? rawAnswer,
      normalizedAnswer: rawAnswer,
      confidenceDelta: matchedOption ? 0.2 : 0.1,
      hypothesisConfirmed: !!matchedOption,
    };
  }

  return base;
}

/**
 * Convierte un dict `{ questionId: rawAnswer }` en un array de SemanticAnswer
 * usando un catálogo de definiciones de preguntas (opcional).
 */
export function buildSemanticAnswerMap(
  answers: Record<string, unknown>,
  questionCatalog?: Record<string, QuestionDef>
): SemanticAnswer[] {
  return Object.entries(answers).map(([qid, value]) => {
    const def = questionCatalog?.[qid] ?? { id: qid };
    return buildSemanticAnswer(def, value);
  });
}
