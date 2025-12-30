import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2, 
  Brain,
  Sparkles,
  Lock,
  Crown,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  COMPLETE_GASTRO_QUESTIONS,
  getActiveQuestionsForBusiness,
  getTotalQuestionsForBusiness,
  getAnsweredQuestionsCount,
  calculatePrecisionScore,
} from '@/lib/gastroQuestionsComplete';
import { COUNTRY_PROFILES, type Language } from '@/lib/gastroSetupQuestions';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [setupData, setSetupData] = useState<Record<string, any>>({});
  
  // Check if user is PRO (for now, simulate FREE)
  const isPro = false; // TODO: Replace with actual plan check
  
  // Get business context
  const country = currentBusiness?.country || 'AR';
  const language: Language = country === 'BR' ? 'pt-BR' : 'es';
  
  // Build business context for question filtering
  const businessContext = useMemo(() => ({
    channels: setupData['business.channels'] || [],
    primary_type_id: currentBusiness?.category || '',
    tags: [],
    integrations: setupData['integrations.google.status'] ? { google: { status: setupData['integrations.google.status'] } } : {},
  }), [setupData, currentBusiness]);
  
  // Get active questions for this business
  const activeQuestions = useMemo(() => 
    getActiveQuestionsForBusiness('full', businessContext),
    [businessContext]
  );
  
  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalQuestions = activeQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  
  // Calculate precision
  const answeredCount = getAnsweredQuestionsCount(setupData, activeQuestions);
  const precisionScore = calculatePrecisionScore(answeredCount, totalQuestions);
  
  // Load existing setup data
  useEffect(() => {
    const loadSetupData = async () => {
      if (!currentBusiness) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('business_setup_progress')
          .select('setup_data')
          .eq('business_id', currentBusiness.id)
          .single();
        
        if (data?.setup_data) {
          setSetupData(data.setup_data as Record<string, any>);
        }
      } catch (error) {
        console.error('Error loading setup data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSetupData();
  }, [currentBusiness]);
  
  // Check if FREE user and show paywall
  useEffect(() => {
    if (!isPro && !showPaywall) {
      setShowPaywall(true);
    }
  }, [isPro]);
  
  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;
    const path = currentQuestion.store.path;
    setSetupData(prev => ({ ...prev, [path]: value }));
  };
  
  const handleNext = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      await saveProgress();
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      await completeDignostic();
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      navigate('/app/more');
    }
  };
  
  const saveProgress = async () => {
    if (!currentBusiness) return;
    setSaving(true);
    try {
      await supabase
        .from('business_setup_progress')
        .upsert({
          business_id: currentBusiness.id,
          setup_data: setupData,
          precision_score: precisionScore,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'business_id' });
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const completeDignostic = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      await supabase
        .from('business_setup_progress')
        .upsert({
          business_id: currentBusiness.id,
          setup_data: setupData,
          precision_score: precisionScore,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'business_id' });
      
      await supabase
        .from('businesses')
        .update({ precision_score: precisionScore })
        .eq('id', currentBusiness.id);
      
      await refreshBusinesses();
      toast.success('¡Diagnóstico completado!');
      navigate('/app');
    } catch (error) {
      console.error('Error completing diagnostic:', error);
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };
  
  const getCurrentValue = () => {
    if (!currentQuestion) return undefined;
    return setupData[currentQuestion.store.path];
  };
  
  const canProceed = () => {
    if (!currentQuestion) return true;
    const value = getCurrentValue();
    if (!currentQuestion.ui.input.required) return true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  };
  
  // Paywall Modal
  if (showPaywall && !isPro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Diagnóstico Profundo</h2>
              <p className="text-muted-foreground">
                Conocé tu negocio en detalle y mejorá la precisión de las recomendaciones
              </p>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
              <div className="flex items-center gap-3 text-left">
                <Target className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">+50 preguntas adaptativas</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Brain className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">Precisión hasta 95%</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">Widgets personalizados</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full gap-2 h-12" 
                onClick={() => toast.info('Próximamente: Planes Pro')}
              >
                <Crown className="w-5 h-5" />
                Hacete Pro para desbloquear
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/app/more')}
              >
                Volver a Configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Diagnóstico Profundo</span>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {precisionScore}%
            </Badge>
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {currentQuestionIndex + 1} de {totalQuestions}
          </p>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Question Header */}
                <div className="text-center space-y-3">
                  <Badge variant="outline" className="mb-2">
                    {currentQuestion.score_area}
                  </Badge>
                  <h1 className="text-2xl font-bold text-foreground">
                    {currentQuestion.ui[language]?.title || currentQuestion.ui.es.title}
                  </h1>
                  <p className="text-muted-foreground">
                    {currentQuestion.ui[language]?.help || currentQuestion.ui.es.help}
                  </p>
                </div>
                
                {/* Question Input - Simple text input fallback */}
                <div className="py-4">
                  <Input
                    placeholder="Tu respuesta..."
                    value={getCurrentValue() || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} disabled={currentQuestionIndex === 0 && !loading}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!canProceed() || loading || saving}
              className="flex-1 gap-2 h-12"
            >
              {loading || saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentQuestionIndex >= totalQuestions - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Completar
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DiagnosticPage;
