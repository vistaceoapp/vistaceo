/**
 * Intelligent Question Prompt Component
 * 
 * Displays personalized questions when the Brain needs clarification.
 * Appears in the Dashboard when there are pending knowledge gaps.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Brain, 
  Sparkles, 
  X, 
  Send, 
  ChevronRight,
  Lightbulb,
  MapPin,
  Building2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';
import { useIntelligentQuestions, IntelligentQuestion } from '@/hooks/use-intelligent-questions';
import { toast } from 'sonner';

// ============================================
// CATEGORY ICONS & STYLES
// ============================================

const categoryConfig = {
  clarification: {
    icon: MessageSquare,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    label: 'Aclaración',
  },
  missing_data: {
    icon: HelpCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    label: 'Dato faltante',
  },
  regional: {
    icon: MapPin,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
    label: 'Regional',
  },
  industry: {
    icon: Building2,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    label: 'Industria',
  },
  preference: {
    icon: Lightbulb,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    label: 'Preferencia',
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

interface IntelligentQuestionPromptProps {
  variant?: 'full' | 'compact' | 'minimal';
  maxQuestions?: number;
  className?: string;
}

export function IntelligentQuestionPrompt({
  variant = 'full',
  maxQuestions = 1,
  className,
}: IntelligentQuestionPromptProps) {
  const {
    questions,
    topQuestion,
    hasUrgentQuestions,
    loading,
    answerQuestion,
    dismissQuestion,
  } = useIntelligentQuestions();

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = useCallback(async (question: IntelligentQuestion) => {
    if (!answer.trim()) {
      toast.error('Por favor escribí una respuesta');
      return;
    }

    setSubmitting(true);
    try {
      await answerQuestion(question.id, answer.trim());
      toast.success('¡Gracias! Aprendí algo nuevo sobre tu negocio', {
        icon: <Brain className="w-4 h-4 text-primary" />,
      });
      setAnswer('');
      setExpandedQuestion(null);
    } catch (error) {
      toast.error('Error al guardar la respuesta');
    } finally {
      setSubmitting(false);
    }
  }, [answer, answerQuestion]);

  const handleDismiss = useCallback(async (question: IntelligentQuestion) => {
    await dismissQuestion(question.id, 'skipped');
    setExpandedQuestion(null);
    setAnswer('');
  }, [dismissQuestion]);

  // Don't render if no questions or loading
  if (loading || questions.length === 0) {
    return null;
  }

  const displayQuestions = questions.slice(0, maxQuestions);

  // Minimal variant - just a badge/indicator
  if (variant === 'minimal') {
    if (!hasUrgentQuestions) return null;
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-warning/10 border border-warning/30",
          className
        )}
      >
        <HelpCircle className="w-4 h-4 text-warning" />
        <span className="text-xs font-medium text-warning">
          {questions.length} pregunta{questions.length > 1 ? 's' : ''} pendiente{questions.length > 1 ? 's' : ''}
        </span>
      </motion.div>
    );
  }

  // Compact variant - collapsed question cards
  if (variant === 'compact') {
    return (
      <AnimatePresence>
        {displayQuestions.map((question) => {
          const config = categoryConfig[question.category];
          const Icon = config.icon;
          const isExpanded = expandedQuestion === question.id;

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={className}
            >
              <GlassCard 
                className={cn(
                  "p-4 transition-all duration-300",
                  config.borderColor,
                  config.bgColor,
                  isExpanded ? "ring-2 ring-primary/20" : ""
                )}
              >
                {isExpanded ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <span className="text-xs text-muted-foreground">{config.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setExpandedQuestion(null);
                          setAnswer('');
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground">{question.question}</p>
                    <p className="text-xs text-muted-foreground">{question.context}</p>
                    
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Tu respuesta..."
                      className="min-h-[80px] text-sm resize-none"
                      disabled={submitting}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(question)}
                        disabled={submitting}
                        className="flex-1"
                      >
                        Omitir
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAnswer(question)}
                        disabled={submitting || !answer.trim()}
                        className="flex-1 gradient-primary"
                      >
                        {submitting ? (
                          <span className="animate-pulse">Guardando...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Responder
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedQuestion(question.id)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.bgColor)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{question.question}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        Desbloquea: {question.unlocks}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </button>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    );
  }

  // Full variant - detailed question card
  const question = topQuestion;
  if (!question) return null;

  const config = categoryConfig[question.category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      <GlassCard className={cn("p-6 relative overflow-hidden", config.borderColor)}>
        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-accent/20"
            )}>
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Pregunta Inteligente
              </h3>
              <p className="text-xs text-muted-foreground">
                {config.label} • Prioridad: {question.priority}/10
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDismiss(question)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Question */}
        <div className="mb-4">
          <p className="text-lg font-medium text-foreground mb-2">{question.question}</p>
          <p className="text-sm text-muted-foreground">{question.context}</p>
        </div>

        {/* Unlocks badge */}
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg mb-4",
          config.bgColor
        )}>
          <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
          <span className="text-xs text-foreground/80">
            <strong>Desbloquea:</strong> {question.unlocks}
          </span>
        </div>

        {/* Answer input */}
        <div className="space-y-3">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escribí tu respuesta..."
            className="min-h-[100px] resize-none"
            disabled={submitting}
          />
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleDismiss(question)}
              disabled={submitting}
              className="flex-1"
            >
              Responder después
            </Button>
            <Button
              onClick={() => handleAnswer(question)}
              disabled={submitting || !answer.trim()}
              className="flex-1 gradient-primary"
            >
              {submitting ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar respuesta
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Remaining questions indicator */}
        {questions.length > 1 && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            +{questions.length - 1} pregunta{questions.length > 2 ? 's' : ''} más para conocer mejor tu negocio
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}

export default IntelligentQuestionPrompt;
