// Step: Questionnaire v8 - Using new Questions Engine
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Check, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CountryCode, COUNTRY_PACKS, getRevenueRanges, getCurrencyLabel } from '@/lib/countryPacks';
import { 
  getQuestionsForSetup, 
  getCategoryLabel,
  GastroQuestion as Question 
} from '@/lib/gastroQuestionsEngine';

interface SetupStepQuestionnaireProps {
  countryCode: CountryCode;
  businessTypeId: string;
  setupMode: 'quick' | 'complete';
  answers: Record<string, any>;
  onUpdate: (answers: Record<string, any>) => void;
  onComplete: () => void;
  onBack?: () => void;
}

export const SetupStepQuestionnaire = ({
  countryCode,
  businessTypeId,
  setupMode,
  answers,
  onUpdate,
  onComplete,
  onBack,
}: SetupStepQuestionnaireProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lang = COUNTRY_PACKS[countryCode]?.locale?.startsWith('pt') ? 'pt-BR' : 'es';
  const currency = COUNTRY_PACKS[countryCode]?.currencySymbol || '$';
  const currencyLabel = getCurrencyLabel(countryCode);
  const revenueRanges = getRevenueRanges(countryCode);

  // Get filtered questions based on country, business type, and mode
  const activeQuestions = useMemo(() => {
    return getQuestionsForSetup(countryCode, businessTypeId, setupMode);
  }, [countryCode, businessTypeId, setupMode]);

  const currentQuestion = activeQuestions[currentIndex];
  const totalQuestions = activeQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

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
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (onBack) {
      // If at first question and onBack is provided, go back to previous setup step
      onBack();
    }
  };

  const renderInput = () => {
    if (!currentQuestion) return null;

    // Special handling for revenue question - use localized ranges
    if (currentQuestion.id === 'Q_MONTHLY_REVENUE') {
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
          <div className="grid grid-cols-2 gap-3">
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
                  <span className={cn("font-medium", isSelected && "text-primary")}>
                    {option.label[lang] || option.label.es}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'multi':
        const selectedItems = (getCurrentValue() as string[]) || [];
        return (
          <div className="grid grid-cols-2 gap-3">
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
                  <span className={cn("font-medium", isSelected && "text-primary")}>
                    {option.label[lang] || option.label.es}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4">
            <Input
              type="number"
              value={getCurrentValue() || ''}
              onChange={(e) => handleAnswer(e.target.value ? Number(e.target.value) : undefined)}
              placeholder={lang === 'pt-BR' ? 'Digite um valor' : 'Ingresá un valor'}
              className="h-14 text-lg text-center"
            />
            {(currentQuestion.id === 'Q_AVG_TICKET' || currentQuestion.id.includes('PRICE') || currentQuestion.id.includes('TICKET')) && (
              <p className="text-center text-sm text-muted-foreground">
                {currencyLabel}: {currency} {getCurrentValue() || '---'}
              </p>
            )}
          </div>
        );

      case 'slider':
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

  if (!currentQuestion) {
    // No questions for this combination, skip to complete
    onComplete();
    return null;
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            {getCategoryLabel(currentQuestion.category, lang)}
          </Badge>
          <span className="text-muted-foreground">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Question */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {currentQuestion.title[lang] || currentQuestion.title.es}
            </h2>
            {currentQuestion.help && (
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" />
                {currentQuestion.help[lang] || currentQuestion.help.es}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="py-4">{renderInput()}</div>
        </motion.div>
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
          disabled={!canProceed()}
          className="flex-1"
          size="lg"
        >
          {currentIndex >= totalQuestions - 1 ? (
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
      {!currentQuestion.required && (
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
