// Setup Page v7.0 - Complete Rebuild
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Loader2, Brain, Sparkles, Check } from 'lucide-react';
import { VistaceoLogo } from '@/components/ui/VistaceoLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CountryCode, COUNTRY_PACKS } from '@/lib/countryPacks';

// Setup steps
import { SetupStepCountry } from '@/components/setup/SetupStepCountry';
import { SetupStepSector } from '@/components/setup/SetupStepSector';
import { SetupStepType } from '@/components/setup/SetupStepType';
import { SetupStepMode } from '@/components/setup/SetupStepMode';
import { SetupStepBusiness } from '@/components/setup/SetupStepBusiness';
import { SetupStepQuestionnaire } from '@/components/setup/SetupStepQuestionnaire';
import { SetupStepIntegrations } from '@/components/setup/SetupStepIntegrations';
import { SetupProgress } from '@/components/setup/SetupProgress';

// Steps: country -> sector -> type -> business (name+google) -> mode -> questionnaire -> integrations -> create
const STEPS = ['country', 'sector', 'type', 'business', 'mode', 'questionnaire', 'integrations', 'create'] as const;
type StepId = typeof STEPS[number];

interface SetupData {
  countryCode: CountryCode;
  areaId: string;
  businessTypeId: string;
  businessTypeLabel: string;
  businessName: string;
  setupMode: 'quick' | 'complete';
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleAddress?: string;
  googleLat?: number;
  googleLng?: number;
  answers: Record<string, any>;
  integrationsProfiled: {
    payments: string[];
    reviews: string[];
    social: string[];
    other: string[];
  };
}

const SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshBusinesses, setCurrentBusiness, businesses } = useBusiness();
  const [currentStep, setCurrentStep] = useState(0);
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);

  const [data, setData] = useState<SetupData>({
    countryCode: 'AR',
    areaId: '',
    businessTypeId: '',
    businessTypeLabel: '',
    businessName: '',
    setupMode: 'complete',
    answers: {},
    integrationsProfiled: {
      payments: [],
      reviews: [],
      social: [],
      other: [],
    },
  });

  // Redirect if user already has a completed business
  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const completed = businesses.find(b => b.setup_completed);
      if (completed) {
        navigate('/app', { replace: true });
      }
    }
  }, [businesses, navigate]);

  const stepId = STEPS[currentStep];
  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const precisionScore = calculatePrecision(data);
  const lang = COUNTRY_PACKS[data.countryCode]?.locale?.startsWith('pt') ? 'pt' : 'es';

  const canProceed = useCallback(() => {
    switch (stepId) {
      case 'country': return !!data.countryCode;
      case 'sector': return !!data.areaId;
      case 'type': return !!data.businessTypeId;
      case 'business': return data.businessName.trim().length >= 2;
      case 'mode': return true;
      case 'questionnaire': return true; // Handled internally
      case 'integrations': return true;
      case 'create': return true;
      default: return false;
    }
  }, [stepId, data]);

  const handleNext = async () => {
    if (stepId === 'create') {
      await createBusiness();
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const createBusiness = async () => {
    if (!user || !data.businessName.trim()) return;
    
    setCreatingBusiness(true);
    setCreateProgress(10);

    try {
      // Step 1: Create business
      setCreateProgress(20);
      const { data: business, error } = await supabase
        .from('businesses')
        .insert({
          name: data.businessName.trim(),
          category: 'restaurant',
          country: data.countryCode,
          owner_id: user.id,
          setup_completed: true,
          google_place_id: data.googlePlaceId,
          avg_rating: data.googleRating,
          address: data.googleAddress,
          precision_score: precisionScore,
          settings: {
            setup_version: '7.0',
            setup_mode: data.setupMode,
          },
        })
        .select()
        .single();

      if (error) throw error;
      setCreateProgress(40);

      // Step 2: Create brain
      const brainData = {
        business_id: business.id,
        primary_business_type: data.businessTypeId || 'restaurant',
        current_focus: 'ventas',
        factual_memory: {
          area_id: data.areaId,
          business_type_label: data.businessTypeLabel,
          setup_mode: data.setupMode,
          google_connected: !!data.googlePlaceId,
          google_rating: data.googleRating,
          google_review_count: data.googleReviewCount,
          answers: data.answers,
          integrations_profiled: data.integrationsProfiled,
        },
        preferences_memory: {
          language: data.countryCode === 'BR' ? 'pt-BR' : 'es',
          autopilot_mode: 'standard',
          country_code: data.countryCode,
        },
        decisions_memory: {
          missions_created: 0,
          missions_completed: 0,
          feedback_given: 0,
        },
        mvc_completion_pct: precisionScore,
        version: 1,
      };

      await supabase.from('business_brains').insert(brainData);
      setCreateProgress(60);

      // Step 3: Create setup progress record
      await supabase.from('business_setup_progress').insert({
        business_id: business.id,
        current_step: 'completed',
        precision_score: precisionScore,
        setup_data: {
          ...data,
          completed_at: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      });
      setCreateProgress(80);

      // Step 4: Create baseline snapshot
      const healthScore = Math.round(50 + precisionScore * 0.35);
      await supabase.from('snapshots').insert({
        business_id: business.id,
        source: 'setup_baseline',
        total_score: healthScore,
        dimensions_json: {
          data_quality: precisionScore,
          setup_mode: data.setupMode,
          google_connected: !!data.googlePlaceId,
          questions_answered: Object.keys(data.answers).length,
          integrations_profiled: Object.values(data.integrationsProfiled).flat().length,
        },
        strengths: generateInitialStrengths(data),
        weaknesses: generateInitialWeaknesses(data),
      });
      setCreateProgress(100);

      // Set as current business and navigate
      setCurrentBusiness(business);
      await refreshBusinesses();
      
      toast.success(lang === 'pt' ? 'Negócio criado com sucesso!' : '¡Tu negocio está listo!');
      navigate('/app?open_widget=health');
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error(lang === 'pt' ? 'Erro ao criar negócio' : 'Error al crear el negocio');
    } finally {
      setCreatingBusiness(false);
    }
  };

  const renderStep = () => {
    switch (stepId) {
      case 'country':
        return (
          <SetupStepCountry
            value={data.countryCode}
            onChange={(code) => setData(d => ({ ...d, countryCode: code as CountryCode, areaId: '', businessTypeId: '' }))}
          />
        );
      case 'sector':
        return (
          <SetupStepSector
            countryCode={data.countryCode}
            value={data.areaId}
            onChange={(areaId) => setData(d => ({ ...d, areaId, businessTypeId: '' }))}
          />
        );
      case 'type':
        return (
          <SetupStepType
            countryCode={data.countryCode}
            areaId={data.areaId}
            value={data.businessTypeId}
            onChange={(id, label) => setData(d => ({ ...d, businessTypeId: id, businessTypeLabel: label }))}
          />
        );
      case 'business':
        return (
          <SetupStepBusiness
            countryCode={data.countryCode}
            currentName={data.businessName}
            currentPlaceId={data.googlePlaceId}
            onUpdate={(update) => setData(d => ({
              ...d,
              businessName: update.businessName,
              googlePlaceId: update.googlePlaceId,
              googleRating: update.googleRating,
              googleReviewCount: update.googleReviewCount,
              googleAddress: update.googleAddress,
              googleLat: update.googleLat,
              googleLng: update.googleLng,
            }))}
          />
        );
      case 'mode':
        return (
          <SetupStepMode
            value={data.setupMode}
            onChange={(mode) => setData(d => ({ ...d, setupMode: mode }))}
          />
        );
      case 'questionnaire':
        return (
          <SetupStepQuestionnaire
            countryCode={data.countryCode}
            setupMode={data.setupMode}
            answers={data.answers}
            onUpdate={(answers) => setData(d => ({ ...d, answers }))}
            onComplete={handleNext}
          />
        );
      case 'integrations':
        return (
          <SetupStepIntegrations
            countryCode={data.countryCode}
            profiled={data.integrationsProfiled}
            onUpdate={(profiled) => setData(d => ({ ...d, integrationsProfiled: profiled }))}
          />
        );
      case 'create':
        return (
          <div className="text-center space-y-8 max-w-md mx-auto">
            {creatingBusiness ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg">
                  <Brain className="w-10 h-10 text-primary-foreground animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {lang === 'pt' ? 'Criando seu negócio...' : 'Creando tu negocio...'}
                  </h2>
                  <p className="text-muted-foreground">
                    {createProgress < 40 && (lang === 'pt' ? 'Configurando perfil' : 'Configurando perfil')}
                    {createProgress >= 40 && createProgress < 70 && (lang === 'pt' ? 'Ativando Brain' : 'Activando Brain')}
                    {createProgress >= 70 && (lang === 'pt' ? 'Preparando dashboard' : 'Preparando dashboard')}
                  </p>
                </div>
                <Progress value={createProgress} className="h-2" />
              </motion.div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {lang === 'pt' ? 'Tudo pronto!' : '¡Todo listo!'}
                  </h2>
                  <p className="text-muted-foreground">
                    {lang === 'pt' 
                      ? 'Vamos criar seu negócio e ativar seu Brain com os dados que você nos deu.'
                      : 'Vamos a crear tu negocio y activar tu Brain con los datos que nos diste.'
                    }
                  </p>
                </div>
                <SetupProgress
                  precisionScore={precisionScore}
                  estimatedHealthScore={Math.round(50 + precisionScore * 0.35)}
                  currentSection="finish"
                  answeredQuestions={Object.keys(data.answers).length}
                  totalQuestions={data.setupMode === 'complete' ? 10 : 6}
                  businessName={data.businessName}
                />
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Don't show nav buttons for questionnaire (it has its own) or during creation
  const showNavButtons = stepId !== 'questionnaire' && !creatingBusiness;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <VistaceoLogo size={32} variant="full" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {lang === 'pt' ? 'Passo' : 'Paso'} {currentStep + 1} de {totalSteps}
            </span>
            <ThemeToggle />
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      {/* Content */}
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-24 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {showNavButtons && (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/50 py-4">
          <div className="container max-w-4xl mx-auto px-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === 'pt' ? 'Voltar' : 'Atrás'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || creatingBusiness}
              className={cn(stepId === 'create' && 'bg-gradient-to-r from-primary to-accent')}
            >
              {creatingBusiness ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {lang === 'pt' ? 'Criando...' : 'Creando...'}
                </>
              ) : stepId === 'create' ? (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  {lang === 'pt' ? 'Criar negócio' : 'Crear negocio'}
                </>
              ) : (
                <>
                  {lang === 'pt' ? 'Continuar' : 'Continuar'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
};

function calculatePrecision(data: SetupData): number {
  let score = 0;
  if (data.countryCode) score += 5;
  if (data.areaId) score += 10;
  if (data.businessTypeId) score += 15;
  if (data.businessName.length >= 2) score += 10;
  if (data.googlePlaceId) score += 20;
  if (data.setupMode === 'complete') score += 5;
  
  // Answers contribute up to 25 points
  const answeredCount = Object.keys(data.answers).filter(k => {
    const v = data.answers[k];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length;
  score += Math.min(25, answeredCount * 3);
  
  // Integrations contribute up to 10 points
  const integrationsCount = Object.values(data.integrationsProfiled).flat().length;
  score += Math.min(10, integrationsCount * 2);
  
  return Math.min(100, score);
}

function generateInitialStrengths(data: SetupData): string[] {
  const strengths: string[] = [];
  if (data.googlePlaceId && data.googleRating && data.googleRating >= 4) {
    strengths.push('Buena reputación en Google');
  }
  if (data.answers.channels?.length > 2) {
    strengths.push('Múltiples canales de venta');
  }
  if (Object.values(data.integrationsProfiled).flat().length > 3) {
    strengths.push('Ecosistema digital activo');
  }
  return strengths.length > 0 ? strengths : ['Negocio en crecimiento'];
}

function generateInitialWeaknesses(data: SetupData): string[] {
  const weaknesses: string[] = [];
  if (!data.googlePlaceId) {
    weaknesses.push('Sin presencia verificada en Google');
  }
  if (Object.keys(data.answers).length < 5) {
    weaknesses.push('Datos limitados para análisis profundo');
  }
  return weaknesses.length > 0 ? weaknesses : ['Mejorar precisión del perfil'];
}

export default SetupPage;
