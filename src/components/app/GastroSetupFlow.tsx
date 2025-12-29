import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles, Brain, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  COMPLETE_GASTRO_QUESTIONS, 
  getActiveQuestionsForBusiness,
  getTotalQuestionsForBusiness,
  getAnsweredQuestionsCount,
  calculatePrecisionScore,
  type SetupMode 
} from '@/lib/gastroQuestionsComplete';
import { GastroSetupInput } from '@/components/app/GastroSetupInputs';
import { type Language } from '@/lib/gastroSetupQuestions';

interface GastroSetupFlowProps {
  country: string;
  mode: SetupMode;
  gastroData: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
  onComplete: () => void;
  onBack?: () => void;
}

export const GastroSetupFlow = ({
  country,
  mode,
  gastroData,
  onUpdate,
  onComplete,
  onBack
}: GastroSetupFlowProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const language: Language = country === 'BR' ? 'pt-BR' : 'es';

  // Build context for filtering questions
  const context = useMemo(() => ({
    country,
    primary_type_id: gastroData['business.primary_type_id'] || '',
    secondary_type_id: gastroData['business.secondary_type_id'] || '',
    channels: gastroData['business.channels'] || [],
    tags: [],
    integrations: {
      google: {
        status: gastroData['integrations.google.status'] || 'skipped'
      }
    }
  }), [country, gastroData]);

  // Get active questions based on mode and context
  const activeQuestions = useMemo(() => {
    return getActiveQuestionsForBusiness(mode, context);
  }, [context, mode]);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalQuestions = activeQuestions.length;
  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Calculate precision
  const answeredCount = getAnsweredQuestionsCount(gastroData, activeQuestions);
  const precisionScore = calculatePrecisionScore(answeredCount, totalQuestions);

  const getCurrentValue = () => {
    if (!currentQuestion) return undefined;
    return gastroData[currentQuestion.store.path];
  };

  const handleValueChange = (value: any) => {
    if (!currentQuestion) return;
    onUpdate({ 
      ...gastroData, 
      [currentQuestion.store.path]: value 
    });
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    const value = getCurrentValue();
    const required = currentQuestion.ui.input.required;
    
    if (!required) return true;
    
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    
    return true;
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {language === 'pt-BR' ? 'Diagnóstico completo!' : '¡Diagnóstico completo!'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {language === 'pt-BR' 
            ? 'Seu painel está pronto com dados reais' 
            : 'Tu tablero está listo con datos reales'}
        </p>
        <Button onClick={onComplete} className="gradient-primary">
          <Sparkles className="w-4 h-4 mr-2" />
          {language === 'pt-BR' ? 'Ver meu painel' : 'Ver mi tablero'}
        </Button>
      </div>
    );
  }

  const uiText = currentQuestion.ui[language] || currentQuestion.ui.es;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'pt-BR' ? 'Pergunta' : 'Pregunta'} {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">{precisionScore}%</span>
            <span className="text-muted-foreground">{language === 'pt-BR' ? 'precisão' : 'precisión'}</span>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Question Header */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {uiText.title}
                </h3>
                {uiText.help && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {uiText.help}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Score Area Badge */}
          {currentQuestion.score_area && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                {currentQuestion.score_area}
              </span>
              {currentQuestion.modules?.slice(0, 2).map(mod => (
                <span key={mod} className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                  {mod.replace('M_', '')}
                </span>
              ))}
            </div>
          )}

          {/* Input Component */}
          <div className="py-4">
            <GastroSetupInput
              question={currentQuestion}
              value={getCurrentValue()}
              onChange={handleValueChange}
              country={country}
              language={language}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0 && !onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'pt-BR' ? 'Voltar' : 'Atrás'}
        </Button>

        <div className="flex items-center gap-2">
          {!currentQuestion.ui.input.required && (
            <Button
              variant="ghost"
              onClick={handleNext}
              className="text-muted-foreground"
            >
              {language === 'pt-BR' ? 'Pular' : 'Saltar'}
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              "gap-2",
              canProceed() && "gradient-primary"
            )}
          >
            {currentQuestionIndex === totalQuestions - 1 
              ? (language === 'pt-BR' ? 'Finalizar' : 'Finalizar')
              : (language === 'pt-BR' ? 'Próximo' : 'Siguiente')
            }
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Time Estimate */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>
          ~{Math.max(1, Math.ceil((totalQuestions - currentQuestionIndex) * 0.3))} min {language === 'pt-BR' ? 'restantes' : 'restantes'}
        </span>
      </div>
    </div>
  );
};
