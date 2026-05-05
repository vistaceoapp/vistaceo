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

interface SetupStepQuestionnaireProps {
  countryCode: CountryCode;
  areaId: string;
  businessTypeId: string;
  setupMode: 'quick' | 'complete';
  answers: Record<string, any>;
  questionIndex?: number;
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

// Batch configuration - optimized for speed with parallel generation
const BATCH_CONFIG = {
  quick: {
    firstBatch: 10,
    remainingTarget: 0,
    totalMin: 10,
    totalMax: 10,
  },
  complete: {
    firstBatch: 35,
    parallelBatches: 0,
    perBatch: 0,
    totalMin: 35,
    totalMax: 35,
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
const QUESTIONS_CACHE_KEY = 'setupQuestionsCache_easy_v2';
const QUESTIONS_META_KEY = 'setupQuestionsMeta';

interface QuestionsCacheData {
  questions: UniversalQuestion[];
  timestamp: number;
  businessTypeId: string;
  setupMode: string;
  allBatchesDone: boolean;
}

function getCachedQuestions(businessTypeId: string, setupMode: string): QuestionsCacheData | null {
  try {
    const cached = localStorage.getItem(QUESTIONS_CACHE_KEY);
    if (!cached) return null;
    const parsed: QuestionsCacheData = JSON.parse(cached);
    // Valid for 30 days AND same business type AND same mode
    if (
      Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000 &&
      parsed.questions?.length > 0 &&
      parsed.businessTypeId === businessTypeId &&
      parsed.setupMode === setupMode
    ) {
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function setCachedQuestions(questions: UniversalQuestion[], businessTypeId: string, setupMode: string, allDone: boolean) {
  try {
    const data: QuestionsCacheData = {
      questions,
      timestamp: Date.now(),
      businessTypeId,
      setupMode,
      allBatchesDone: allDone,
    };
    localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export const SetupStepQuestionnaire = ({
  countryCode,
  areaId,
  businessTypeId,
  setupMode,
  answers,
  questionIndex = 0,
  onUpdate,
  onQuestionIndexChange,
  onComplete,
  onBack,
}: SetupStepQuestionnaireProps) => {
  // Restore cached questions if returning (validated by businessTypeId + setupMode)
  const cacheData = useMemo(() => getCachedQuestions(businessTypeId, setupMode), [businessTypeId, setupMode]);
  const hasCache = !!cacheData && cacheData.questions.length > 0;
  const cacheComplete = !!cacheData?.allBatchesDone;

  const [currentIndex, setCurrentIndex] = useState(questionIndex);
  const [questions, setQuestions] = useState<UniversalQuestion[]>(hasCache ? cacheData!.questions : []);
  const [isLoadingFirst, setIsLoadingFirst] = useState(!hasCache);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  // Only skip background fetch if cache has ALL batches done
  const backgroundFetchStarted = useRef(cacheComplete);
  const allBatchesDone = useRef(cacheComplete);
  const latestAnswersRef = useRef(answers);

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
  const fetchQuestions = useCallback(async (questionCount: string, batchIndex: number, previousAnswersCtx?: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke('generate-questionnaire', {
      body: {
        businessTypeLabel,
        businessTypeId,
        areaId,
        countryCode,
        setupMode,
        businessName,
        rawUserText,
        universalProfile,
        questionCount, // Override the default
        batchIndex,
        previousAnswers: previousAnswersCtx,
      },
    });

    if (error) throw error;
    if (!data?.questions?.length) throw new Error('No questions generated');
    return data.questions as UniversalQuestion[];
  }, [businessTypeLabel, businessTypeId, areaId, countryCode, setupMode, businessName, rawUserText, universalProfile]);

  // Keep latestAnswersRef in sync
  useEffect(() => { latestAnswersRef.current = answers; }, [answers]);

  // Generate first batch of questions
  const generateFirstBatch = useCallback(async () => {
    setIsLoadingFirst(true);
    setGenerationError(false);
    setLoadingMsgIndex(0);

    const firstCount = setupMode === 'quick' 
      ? BATCH_CONFIG.quick.firstBatch 
      : BATCH_CONFIG.complete.firstBatch;

    try {
      const firstQuestions = await fetchQuestions(`${firstCount}-${firstCount + 2}`, 0);
      setQuestions(firstQuestions);
      setCachedQuestions(firstQuestions, businessTypeId, setupMode, false);
      // Only reset index if we don't have a saved position
      if (questionIndex === 0) {
        setCurrentIndex(0);
      }
      setIsLoadingFirst(false);
    } catch (err) {
      const attempt = retryCountRef.current + 1;
      console.warn('AI questionnaire first batch failed (attempt ' + attempt + '):', err);
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setTimeout(() => generateFirstBatch(), 2000);
        return;
      }
      setGenerationError(true);
      setIsLoadingFirst(false);
    }
  }, [fetchQuestions, setupMode, questionIndex, businessTypeId]);

  // Generate remaining batches in background - PARALLEL for speed
  const generateRemainingBatches = useCallback(async () => {
    if (backgroundFetchStarted.current || allBatchesDone.current) return;
    backgroundFetchStarted.current = true;
    setIsLoadingMore(true);

    try {
      if (setupMode === 'quick') {
        // Quick: one more batch to reach 12-15 total
        const remaining = await fetchQuestions(
          `${BATCH_CONFIG.quick.remainingTarget}-${BATCH_CONFIG.quick.remainingTarget + 2}`,
          1,
          latestAnswersRef.current
        );
        setQuestions(prev => {
          const existingIds = new Set(prev.map(q => q.id));
          const newQuestions = remaining.filter(q => !existingIds.has(q.id));
          const merged = capQuestions([...prev, ...newQuestions], 'quick');
          setCachedQuestions(merged, businessTypeId, setupMode, true);
          allBatchesDone.current = true;
          return merged;
        });
      } else {
        // Complete: run ALL batches in PARALLEL for maximum speed
        const batchPromises = Array.from(
          { length: BATCH_CONFIG.complete.parallelBatches },
          (_, i) => fetchQuestions(
            `${BATCH_CONFIG.complete.perBatch}-${BATCH_CONFIG.complete.perBatch + 2}`,
            i + 1,
            latestAnswersRef.current
          ).catch(err => {
            console.warn(`Batch ${i + 1} failed:`, err);
            return [] as UniversalQuestion[];
          })
        );

        const results = await Promise.all(batchPromises);
        const totalNewQuestions = results.flat().filter(q => q.id).length;
        
        // Merge all results at once
        setQuestions(prev => {
          const existingIds = new Set(prev.map(q => q.id));
          const allNew = results.flat().filter(q => q.id && !existingIds.has(q.id));
          const merged = capQuestions([...prev, ...allNew], 'complete');
          
          // Only mark as done if we got a reasonable number of total questions
          const { min } = getQuestionLimits('complete');
          const isValid = merged.length >= Math.min(min, prev.length + totalNewQuestions);
          setCachedQuestions(merged, businessTypeId, setupMode, isValid);
          if (isValid) {
            allBatchesDone.current = true;
          } else {
            // Allow retry on next navigation
            backgroundFetchStarted.current = false;
            console.warn(`Only ${merged.length} questions after merge, expected at least ${min}. Will retry.`);
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('Background question generation failed:', err);
      // Allow retry - don't mark as done
      backgroundFetchStarted.current = false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchQuestions, setupMode, businessTypeId]);

  // Start first batch on mount (skip if we have cached questions)
  useEffect(() => {
    if (!hasCache) {
      generateFirstBatch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start background fetch: immediately if returning with incomplete cache, or after first answer
  useEffect(() => {
    if (backgroundFetchStarted.current || allBatchesDone.current) return;
    // If we have cached questions but batches aren't done, start immediately
    if (hasCache && !cacheComplete && questions.length > 0) {
      generateRemainingBatches();
      return;
    }
    // Otherwise wait until user answers first question
    if (!isLoadingFirst && questions.length > 0 && currentIndex >= 1) {
      generateRemainingBatches();
    }
  }, [isLoadingFirst, questions.length, currentIndex, generateRemainingBatches, hasCache, cacheComplete]);

  // Cycle loading messages
  useEffect(() => {
    if (!isLoadingFirst) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoadingFirst, loadingMessages.length]);

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

  // Reset custom input when question changes
  useEffect(() => {
    setShowCustomInput(false);
    setCustomText('');
  }, [currentIndex]);

  const getCurrentValue = () => answers[currentQuestion?.id];

  const handleAnswer = (value: any) => {
    onUpdate({ ...answers, [currentQuestion.id]: value });
  };

  const handleNoneOfThese = () => {
    setShowCustomInput(true);
    handleAnswer('__NONE__');
  };

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      handleAnswer({ type: '__CUSTOM__', text: customText.trim() });
      setShowCustomInput(false);
    }
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
    if (value === '__NONE__') return false; // Must write custom text
    if (typeof value === 'object' && value?.type === '__CUSTOM__') return true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== null;
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (!isLoadingMore && allBatchesDone.current) {
      // Validate minimum question count before completing
      const { min } = getQuestionLimits(setupMode);
      if (totalQuestions < min) {
        console.warn(`Only ${totalQuestions} questions, minimum is ${min}. Allowing completion anyway.`);
      }
      onComplete();
    } else if (isLoadingMore) {
      // Still loading more questions - user sees waiting state
    } else if (totalQuestions >= getQuestionLimits(setupMode).min) {
      // Background failed but we have enough questions
      onComplete();
    }
    // If none of the above, do nothing (prevents premature completion)
  };

  // Auto-advance when new questions arrive and user was at the end
  useEffect(() => {
    // If user was waiting at the last question and new ones just arrived
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
      </div>
    );
  }

  if (!currentQuestion && !isLoadingFirst) return null;
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
        const isNone = currentVal === '__NONE__' || (typeof currentVal === 'object' && currentVal?.type === '__CUSTOM__');
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = currentVal === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => { handleAnswer(option.id); setShowCustomInput(false); }}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                  >
                    {option.emoji && <span className="text-xl mb-2 block">{option.emoji}</span>}
                    <span className={cn("font-medium text-sm", isSelected && "text-primary")}>
                      {option.label[lang] || option.label.es}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* "Ninguna de estas" + custom text */}
            <button
              onClick={handleNoneOfThese}
              className={cn(
                "w-full p-3 rounded-xl border-2 text-sm transition-all text-center flex items-center justify-center gap-2",
                isNone
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:border-primary/50 bg-card text-muted-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              {lang === 'pt-BR' ? 'Nenhuma dessas / Quero escrever' : 'Ninguna de estas / Quiero escribir'}
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
                  placeholder={lang === 'pt-BR' ? 'Escreva sua resposta aqui...' : 'Escribí tu respuesta acá...'}
                  className="min-h-[80px] text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCustomSubmit} disabled={!customText.trim()} className="flex-1">
                    <Check className="w-4 h-4 mr-1" />
                    {lang === 'pt-BR' ? 'Confirmar' : 'Confirmar'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowCustomInput(false); handleAnswer(undefined); }}>
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
        const hasCustomMulti = typeof getCurrentValue() === 'object' && getCurrentValue()?.type === '__CUSTOM__';
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedItems.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleMultiSelect(option.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all relative",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                  >
                    {isSelected && (
                      <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                    )}
                    {option.emoji && <span className="text-xl mb-2 block">{option.emoji}</span>}
                    <span className={cn("font-medium text-sm", isSelected && "text-primary")}>
                      {option.label[lang] || option.label.es}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* "Ninguna de estas" + custom text for multi */}
            <button
              onClick={handleNoneOfThese}
              className={cn(
                "w-full p-3 rounded-xl border-2 text-sm transition-all text-center flex items-center justify-center gap-2",
                hasCustomMulti
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:border-primary/50 bg-card text-muted-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              {lang === 'pt-BR' ? 'Outra resposta / Quero escrever' : 'Otra respuesta / Quiero escribir'}
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
                  placeholder={lang === 'pt-BR' ? 'Escreva sua resposta aqui...' : 'Escribí tu respuesta acá...'}
                  className="min-h-[80px] text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCustomSubmit} disabled={!customText.trim()} className="flex-1">
                    <Check className="w-4 h-4 mr-1" />
                    {lang === 'pt-BR' ? 'Confirmar' : 'Confirmar'}
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
              {lang === 'pt-BR' ? '🤷 Não tenho certeza' : '🤷 No estoy seguro'}
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
              {lang === 'pt-BR' ? '🤷 Não tenho certeza' : '🤷 No estoy seguro'}
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

  // Estimated total - always show a number within valid range
  const { min: limitMin, max: limitMax } = getQuestionLimits(setupMode);
  const estimatedTotal = setupMode === 'quick' ? 14 : 70;
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
              {currentIndex + 1} / {allBatchesDone.current ? totalQuestions : `~${displayTotal}`}
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
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                {currentQuestion.title[lang] || currentQuestion.title.es}
              </h2>
              {currentQuestion.help && (
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{currentQuestion.help[lang] || currentQuestion.help.es}</span>
                </p>
              )}
            </div>

            {/* Input */}
            <div className="py-4">{renderInput()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-4 pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentIndex === 0 && !onBack}
          size="lg"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {lang === 'pt-BR' ? 'Voltar' : 'Atrás'}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isWaitingForMore}
          className="flex-1"
          size="lg"
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
    </div>
  );
};
