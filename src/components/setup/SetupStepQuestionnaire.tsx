// Step: Questionnaire v13 - Progressive AI-Generated Questions
// Questions load in batches so users can start answering immediately
// Covers all 7 health dimensions with balanced distribution
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, Check, HelpCircle, Sparkles, Brain, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Batch configuration
const BATCH_CONFIG = {
  quick: {
    firstBatch: 5,       // Show first 5 questions immediately
    remainingTarget: 10,  // Generate ~10 more in background
  },
  complete: {
    firstBatch: 8,        // Show first 8 questions immediately
    remainingBatches: 4,  // Generate 4 more batches of ~15
    perBatch: 17,         // ~17 per batch to reach 65-75 total
  },
};

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
  const [currentIndex, setCurrentIndex] = useState(questionIndex);
  const [questions, setQuestions] = useState<UniversalQuestion[]>([]);
  const [isLoadingFirst, setIsLoadingFirst] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const backgroundFetchStarted = useRef(false);
  const allBatchesDone = useRef(false);

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
      setCurrentIndex(0);
      setIsLoadingFirst(false);
    } catch (err) {
      console.warn('AI questionnaire first batch failed (attempt ' + (retryCount + 1) + '):', err);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => generateFirstBatch(), 2000);
        return;
      }
      setGenerationError(true);
      setIsLoadingFirst(false);
    }
  }, [fetchQuestions, setupMode, retryCount]);

  // Generate remaining batches in background
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
          answers
        );
        setQuestions(prev => {
          const existingIds = new Set(prev.map(q => q.id));
          const newQuestions = remaining.filter(q => !existingIds.has(q.id));
          return [...prev, ...newQuestions];
        });
      } else {
        // Complete: multiple batches to reach 65-75 total
        for (let batch = 1; batch <= BATCH_CONFIG.complete.remainingBatches; batch++) {
          try {
            const batchQuestions = await fetchQuestions(
              `${BATCH_CONFIG.complete.perBatch}-${BATCH_CONFIG.complete.perBatch + 2}`,
              batch,
              answers
            );
            setQuestions(prev => {
              const existingIds = new Set(prev.map(q => q.id));
              const newQuestions = batchQuestions.filter(q => !existingIds.has(q.id));
              return [...prev, ...newQuestions];
            });
          } catch (batchErr) {
            console.warn(`Batch ${batch} failed, continuing:`, batchErr);
            // Continue with remaining batches even if one fails
          }
        }
      }
    } catch (err) {
      console.warn('Background question generation failed:', err);
    } finally {
      setIsLoadingMore(false);
      allBatchesDone.current = true;
    }
  }, [fetchQuestions, setupMode, answers]);

  // Start first batch on mount
  useEffect(() => {
    generateFirstBatch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start background fetch once first batch is ready and user starts answering
  useEffect(() => {
    if (!isLoadingFirst && questions.length > 0 && currentIndex >= 1 && !backgroundFetchStarted.current) {
      generateRemainingBatches();
    }
  }, [isLoadingFirst, questions.length, currentIndex, generateRemainingBatches]);

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

  useEffect(() => {
    if (isLoadingFirst) return;
    if (questions.length === 0 && !generationError) {
      onCompleteRef.current();
    }
  }, [isLoadingFirst, questions.length, generationError]);

  const getCurrentValue = () => answers[currentQuestion?.id];

  const handleAnswer = (value: any) => {
    onUpdate({ ...answers, [currentQuestion.id]: value });
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
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== null;
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (!isLoadingMore && allBatchesDone.current) {
      // All batches done, user answered all → complete
      onComplete();
    } else if (isLoadingMore) {
      // Still loading more questions, show a brief waiting state
      // The useEffect below will auto-advance when new questions arrive
    } else {
      onComplete();
    }
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
              setRetryCount(0);
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
      case 'single':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options?.map((option) => {
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
                  {option.emoji && <span className="text-xl mb-2 block">{option.emoji}</span>}
                  <span className={cn("font-medium text-sm", isSelected && "text-primary")}>
                    {option.label[lang] || option.label.es}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'multi': {
        const selectedItems = (getCurrentValue() as string[]) || [];
        return (
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
                value={getCurrentValue() || ''}
                onChange={(e) => handleAnswer(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={lang === 'pt-BR' ? 'Digite um valor' : 'Ingresá un valor'}
                className={cn(
                  "h-14 text-lg text-center",
                  currentQuestion.type === 'money' && "pl-10"
                )}
              />
            </div>
            {(currentQuestion.type === 'money' || currentQuestion.id.includes('PRICE') || currentQuestion.id.includes('TICKET')) && (
              <p className="text-center text-sm text-muted-foreground">
                {currencyLabel}: {currency} {getCurrentValue()?.toLocaleString() || '---'}
              </p>
            )}
          </div>
        );

      case 'slider': {
        const sliderValue = getCurrentValue() ?? currentQuestion.min ?? 0;
        return (
          <div className="space-y-6 py-4">
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

  // Estimated total questions based on mode
  const estimatedTotal = setupMode === 'quick' ? 14 : 70;
  const displayTotal = allBatchesDone.current ? totalQuestions : Math.max(totalQuestions, estimatedTotal);
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
