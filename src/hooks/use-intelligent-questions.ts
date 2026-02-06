/**
 * Intelligent Questions Hook
 * 
 * Detects when the Brain needs clarification about the business.
 * Generates ultra-personalized questions based on:
 * - Data gaps from setup
 * - Confusion during analysis (low confidence topics)
 * - Country/region/city-specific nuances
 * - Industry-specific terminology
 * - Missing context for accurate recommendations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useBrain } from './use-brain';

// ============================================
// TYPES
// ============================================

export interface IntelligentQuestion {
  id: string;
  question: string;
  context: string;
  category: 'clarification' | 'missing_data' | 'regional' | 'industry' | 'preference';
  priority: number; // 1-10
  field_name: string;
  unlocks: string;
  source: 'data_gap' | 'brain_confusion' | 'low_confidence' | 'system';
  metadata?: Record<string, unknown>;
}

export interface UseIntelligentQuestionsResult {
  questions: IntelligentQuestion[];
  topQuestion: IntelligentQuestion | null;
  hasUrgentQuestions: boolean;
  loading: boolean;
  
  // Actions
  answerQuestion: (questionId: string, answer: string) => Promise<void>;
  dismissQuestion: (questionId: string, reason?: string) => Promise<void>;
  refreshQuestions: () => Promise<void>;
}

// ============================================
// COUNTRY/REGION SPECIFIC QUESTIONS
// ============================================

const REGIONAL_CLARIFICATIONS: Record<string, string[]> = {
  AR: [
    '¿Cómo le dicen a este tipo de negocio en tu zona?',
    '¿Qué modismos usan tus clientes cuando hablan de tu servicio?',
    '¿Hay algún término local que debería conocer?',
  ],
  MX: [
    '¿Cómo le llaman a este servicio en tu región?',
    '¿Hay términos locales que tus clientes usan?',
  ],
  CL: [
    '¿Cómo describirías tu negocio en chileno?',
    '¿Hay jerga local importante para entender tu mercado?',
  ],
  CO: [
    '¿Cómo le dicen a esto en tu ciudad?',
    '¿Hay términos paisas/costeños/rolos específicos?',
  ],
  default: [
    '¿Hay términos locales que debería conocer?',
    '¿Cómo describen tu servicio tus clientes?',
  ],
};

// Industry-specific deep questions
const INDUSTRY_DEEP_QUESTIONS: Record<string, IntelligentQuestion[]> = {
  consulting: [
    {
      id: 'consulting_specialty',
      question: '¿Cuál es tu especialidad de consultoría y qué tipo de empresas atendés?',
      context: 'Para personalizar las recomendaciones a tu nicho específico',
      category: 'industry',
      priority: 9,
      field_name: 'consulting_specialty',
      unlocks: 'Recomendaciones de pricing y posicionamiento ultra-específicas',
      source: 'system',
    },
    {
      id: 'consulting_model',
      question: '¿Trabajás por proyecto, retainer mensual, o modelo híbrido?',
      context: 'Cada modelo tiene estrategias diferentes de crecimiento',
      category: 'industry',
      priority: 8,
      field_name: 'billing_model',
      unlocks: 'Estrategias de facturación y retención de clientes',
      source: 'system',
    },
  ],
  medical: [
    {
      id: 'medical_specialty',
      question: '¿Cuál es tu especialidad médica y qué procedimientos realizás más?',
      context: 'Las estrategias de marketing médico varían mucho por especialidad',
      category: 'industry',
      priority: 9,
      field_name: 'medical_specialty',
      unlocks: 'Estrategias de captación de pacientes específicas para tu especialidad',
      source: 'system',
    },
    {
      id: 'medical_insurance',
      question: '¿Trabajás con obras sociales/seguros o solo particular?',
      context: 'Esto cambia completamente la estrategia de pricing',
      category: 'industry',
      priority: 8,
      field_name: 'insurance_model',
      unlocks: 'Optimización de ingresos y mix de pacientes',
      source: 'system',
    },
  ],
  legal: [
    {
      id: 'legal_area',
      question: '¿En qué área del derecho te especializás?',
      context: 'Penal, civil, laboral, corporativo - cada uno tiene su mercado',
      category: 'industry',
      priority: 9,
      field_name: 'legal_specialty',
      unlocks: 'Estrategias de captación de casos específicas',
      source: 'system',
    },
  ],
  tech: [
    {
      id: 'tech_model',
      question: '¿Ofrecés SaaS, desarrollo a medida, o servicios de consultoría tech?',
      context: 'Los modelos de negocio tech son muy diferentes entre sí',
      category: 'industry',
      priority: 9,
      field_name: 'tech_model',
      unlocks: 'Métricas y estrategias específicas para tu modelo',
      source: 'system',
    },
  ],
  education: [
    {
      id: 'education_format',
      question: '¿Enseñás presencial, online, o híbrido? ¿Grupal o individual?',
      context: 'Cada formato tiene estrategias muy diferentes',
      category: 'industry',
      priority: 9,
      field_name: 'education_format',
      unlocks: 'Estrategias de captación y retención de alumnos',
      source: 'system',
    },
  ],
  fitness: [
    {
      id: 'fitness_model',
      question: '¿Trabajás con membresías, packs de clases, o entrenamiento personal?',
      context: 'El modelo de ingresos cambia toda la estrategia',
      category: 'industry',
      priority: 9,
      field_name: 'fitness_model',
      unlocks: 'Optimización de ingresos recurrentes',
      source: 'system',
    },
  ],
  realestate: [
    {
      id: 'realestate_focus',
      question: '¿Te enfocás en ventas, alquileres, o administración de propiedades?',
      context: 'Cada segmento tiene métricas clave diferentes',
      category: 'industry',
      priority: 9,
      field_name: 'realestate_focus',
      unlocks: 'KPIs y estrategias específicas para tu segmento',
      source: 'system',
    },
  ],
};

// ============================================
// HOOK
// ============================================

export function useIntelligentQuestions(): UseIntelligentQuestionsResult {
  const { currentBusiness } = useBusiness();
  const { brain, dataGaps, confidenceLevel } = useBrain();
  
  const [questions, setQuestions] = useState<IntelligentQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate questions based on business context
  const generateQuestions = useCallback(async () => {
    if (!currentBusiness) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const generatedQuestions: IntelligentQuestion[] = [];

    try {
      // 1. Fetch existing data gaps from DB
      const { data: gaps } = await supabase
        .from('data_gaps')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .limit(5);

      // Convert data gaps to questions
      if (gaps) {
        for (const gap of gaps) {
          const gapQuestions = Array.isArray(gap.questions) ? gap.questions : [];
          const questionText = gapQuestions[0] as string || `¿Podés contarme más sobre ${gap.field_name}?`;
          
          generatedQuestions.push({
            id: `gap-${gap.id}`,
            question: questionText,
            context: gap.reason,
            category: 'missing_data',
            priority: gap.priority || 5,
            field_name: gap.field_name,
            unlocks: gap.unlocks,
            source: 'data_gap',
            metadata: { gap_id: gap.id },
          });
        }
      }

      // 2. Add regional clarifications if needed
      const country = currentBusiness.country || 'default';
      const hasRegionalData = brain?.memory?.factual_memory?.regional_terms;
      
      if (!hasRegionalData && brain && brain.total_signals > 5) {
        const regionalQuestions = REGIONAL_CLARIFICATIONS[country] || REGIONAL_CLARIFICATIONS.default;
        if (regionalQuestions.length > 0) {
          generatedQuestions.push({
            id: 'regional-terms',
            question: regionalQuestions[0],
            context: 'Para comunicarme como lo hacen tus clientes',
            category: 'regional',
            priority: 6,
            field_name: 'regional_terms',
            unlocks: 'Comunicación ultra-localizada para tu mercado',
            source: 'system',
          });
        }
      }

      // 3. Add industry-specific questions
      const businessType = brain?.primary_business_type || currentBusiness.category;
      const industryQuestions = getIndustryQuestions(businessType);
      
      for (const iq of industryQuestions) {
        // Check if already answered
        const isAnswered = brain?.memory?.factual_memory?.[iq.field_name];
        if (!isAnswered) {
          generatedQuestions.push(iq);
        }
      }

      // 4. Add low-confidence clarifications
      if (confidenceLevel === 'low' && brain && brain.total_signals > 10) {
        generatedQuestions.push({
          id: 'confidence-clarify',
          question: '¿Hay algo específico de tu negocio que siento que no estoy entendiendo bien?',
          context: 'Quiero asegurarme de darte recomendaciones precisas',
          category: 'clarification',
          priority: 8,
          field_name: 'business_clarification',
          unlocks: 'Recomendaciones más precisas y personalizadas',
          source: 'brain_confusion',
        });
      }

      // 5. Check for missing critical data
      const criticalFields = ['avg_ticket', 'service_model', 'channel_mix'];
      for (const field of criticalFields) {
        const businessRecord = currentBusiness as unknown as Record<string, unknown>;
        const value = businessRecord[field];
        if (!value && !generatedQuestions.some(q => q.field_name === field)) {
          generatedQuestions.push({
            id: `critical-${field}`,
            question: getCriticalFieldQuestion(field, currentBusiness.country ?? undefined),
            context: 'Información clave para análisis precisos',
            category: 'missing_data',
            priority: 7,
            field_name: field,
            unlocks: getFieldUnlock(field),
            source: 'system',
          });
        }
      }

      // Sort by priority and deduplicate
      const uniqueQuestions = generatedQuestions
        .filter((q, i, arr) => arr.findIndex(x => x.field_name === q.field_name) === i)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5);

      setQuestions(uniqueQuestions);
    } catch (error) {
      console.error('[useIntelligentQuestions] Error generating questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, brain, dataGaps, confidenceLevel]);

  // Answer a question
  const answerQuestion = useCallback(async (questionId: string, answer: string) => {
    if (!currentBusiness) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    try {
      // Record as a signal
      await supabase.functions.invoke('brain-record-signal', {
        body: {
          businessId: currentBusiness.id,
          signalType: 'gap_answer',
          source: 'dashboard_prompt',
          content: {
            gap_id: question.metadata?.gap_id,
            field_name: question.field_name,
            question: question.question,
            answer,
            category: question.category,
          },
        },
      });

      // If it was a data_gap, update it
      if (question.source === 'data_gap' && question.metadata?.gap_id) {
        await supabase
          .from('data_gaps')
          .update({
            status: 'answered',
            answered_at: new Date().toISOString(),
            answer: { text: answer },
            answered_via: 'dashboard_prompt',
          })
          .eq('id', String(question.metadata.gap_id));
      }

      // Update brain factual memory
      const { data: brainData } = await supabase
        .from('business_brains')
        .select('id, factual_memory')
        .eq('business_id', currentBusiness.id)
        .maybeSingle();

      if (brainData) {
        const existingMemory = brainData.factual_memory;
        const factualMemory: Record<string, unknown> = 
          typeof existingMemory === 'object' && existingMemory !== null && !Array.isArray(existingMemory)
            ? { ...existingMemory }
            : {};
        factualMemory[question.field_name] = answer;

        await supabase
          .from('business_brains')
          .update({ 
            factual_memory: factualMemory as unknown as import('@/integrations/supabase/types').Json,
            last_learning_at: new Date().toISOString(),
          })
          .eq('id', brainData.id);
      }

      // Remove from list
      setQuestions(prev => prev.filter(q => q.id !== questionId));

      console.log(`[useIntelligentQuestions] Answered: ${question.field_name} = ${String(answer)}`);
    } catch (error) {
      console.error('[useIntelligentQuestions] Error answering question:', error);
      throw error;
    }
  }, [currentBusiness, questions]);

  // Dismiss a question
  const dismissQuestion = useCallback(async (questionId: string, reason?: string) => {
    if (!currentBusiness) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    try {
      // Record dismissal as a signal
      await supabase.functions.invoke('brain-record-signal', {
        body: {
          businessId: currentBusiness.id,
          signalType: 'question_dismissed',
          source: 'dashboard_prompt',
          content: {
            field_name: question.field_name,
            question: question.question,
            reason: reason || 'skipped',
          },
        },
      });

      // Update data_gap if applicable
      if (question.metadata?.gap_id) {
        await supabase
          .from('data_gaps')
          .update({ status: 'dismissed' })
          .eq('id', String(question.metadata.gap_id));
      }

      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('[useIntelligentQuestions] Error dismissing question:', error);
    }
  }, [currentBusiness, questions]);

  // Initial load
  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  // Computed values
  const topQuestion = useMemo(() => questions[0] || null, [questions]);
  const hasUrgentQuestions = useMemo(() => 
    questions.some(q => q.priority >= 8), 
    [questions]
  );

  return {
    questions,
    topQuestion,
    hasUrgentQuestions,
    loading,
    answerQuestion,
    dismissQuestion,
    refreshQuestions: generateQuestions,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getIndustryQuestions(businessType: string | null | undefined): IntelligentQuestion[] {
  if (!businessType) return [];
  
  const type = String(businessType).toLowerCase();
  
  // Map business types to industry categories
  if (type.includes('consult') || type.includes('asesoria')) {
    return INDUSTRY_DEEP_QUESTIONS.consulting || [];
  }
  if (type.includes('medic') || type.includes('doctor') || type.includes('clinic') || type.includes('salud')) {
    return INDUSTRY_DEEP_QUESTIONS.medical || [];
  }
  if (type.includes('abogad') || type.includes('legal') || type.includes('juridic')) {
    return INDUSTRY_DEEP_QUESTIONS.legal || [];
  }
  if (type.includes('tech') || type.includes('software') || type.includes('saas') || type.includes('desarrollo')) {
    return INDUSTRY_DEEP_QUESTIONS.tech || [];
  }
  if (type.includes('educac') || type.includes('academia') || type.includes('curso') || type.includes('capacitac')) {
    return INDUSTRY_DEEP_QUESTIONS.education || [];
  }
  if (type.includes('gym') || type.includes('fitness') || type.includes('entrena') || type.includes('deport')) {
    return INDUSTRY_DEEP_QUESTIONS.fitness || [];
  }
  if (type.includes('inmobil') || type.includes('real estate') || type.includes('propied')) {
    return INDUSTRY_DEEP_QUESTIONS.realestate || [];
  }
  
  return [];
}

function getCriticalFieldQuestion(field: string, country?: string | null): string {
  const countryCode = country || 'default';
  const currency = getCurrencySymbol(countryCode);
  
  const questions: Record<string, string> = {
    avg_ticket: `¿Cuál es el ticket promedio de una venta/servicio? (en ${currency})`,
    service_model: '¿Cómo atendés a tus clientes? (presencial, online, a domicilio, híbrido)',
    channel_mix: '¿Por dónde te llegan más clientes? (redes sociales, recomendación, Google, etc.)',
  };
  
  return questions[field] || `¿Podés contarme más sobre ${field}?`;
}

function getCurrencySymbol(country: string): string {
  const currencies: Record<string, string> = {
    AR: 'ARS',
    MX: 'MXN',
    CL: 'CLP',
    CO: 'COP',
    PE: 'PEN',
    UY: 'UYU',
    CR: 'CRC',
    PA: 'USD',
    default: 'tu moneda local',
  };
  return currencies[country] || currencies.default;
}

function getFieldUnlock(field: string): string {
  const unlocks: Record<string, string> = {
    avg_ticket: 'Análisis de rentabilidad y estrategias de upselling',
    service_model: 'Optimización de la experiencia del cliente',
    channel_mix: 'Estrategias de marketing focalizadas donde funcionan',
  };
  return unlocks[field] || 'Recomendaciones más precisas';
}

export default useIntelligentQuestions;
