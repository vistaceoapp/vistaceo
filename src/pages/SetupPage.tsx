// Setup Page v7.0 - Complete Rebuild
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Loader2, Brain } from 'lucide-react';
import { VistaceoLogo } from '@/components/ui/VistaceoLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CountryCode } from '@/lib/countryPacks';

// Setup steps
import { SetupStepCountry } from '@/components/setup/SetupStepCountry';
import { SetupStepSector } from '@/components/setup/SetupStepSector';
import { SetupStepType } from '@/components/setup/SetupStepType';
import { SetupStepName } from '@/components/setup/SetupStepName';
import { SetupStepMode } from '@/components/setup/SetupStepMode';
import { SetupStepGoogle } from '@/components/setup/SetupStepGoogle';
import { SetupProgress } from '@/components/setup/SetupProgress';

const STEPS = ['country', 'sector', 'type', 'name', 'mode', 'google', 'create'] as const;
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
}

const SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshBusinesses, setCurrentBusiness } = useBusiness();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creatingBusiness, setCreatingBusiness] = useState(false);

  const [data, setData] = useState<SetupData>({
    countryCode: 'AR',
    areaId: '',
    businessTypeId: '',
    businessTypeLabel: '',
    businessName: '',
    setupMode: 'complete',
  });

  const stepId = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const precisionScore = calculatePrecision(data);

  const canProceed = useCallback(() => {
    switch (stepId) {
      case 'country': return !!data.countryCode;
      case 'sector': return !!data.areaId;
      case 'type': return !!data.businessTypeId;
      case 'name': return data.businessName.trim().length >= 2;
      case 'mode': return true;
      case 'google': return true;
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
    try {
      // Create business
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
        })
        .select()
        .single();

      if (error) throw error;

      // Create brain
      await supabase.from('business_brains').insert({
        business_id: business.id,
        primary_business_type: data.businessTypeId || 'restaurant',
        current_focus: 'ventas',
        factual_memory: {
          area_id: data.areaId,
          business_type_label: data.businessTypeLabel,
          setup_mode: data.setupMode,
        },
        preferences_memory: {
          language: data.countryCode === 'BR' ? 'pt-BR' : 'es',
          autopilot_mode: 'standard',
        },
        mvc_completion_pct: precisionScore,
      });

      // Create baseline snapshot
      await supabase.from('snapshots').insert({
        business_id: business.id,
        source: 'setup_baseline',
        total_score: Math.round(50 + precisionScore * 0.3),
        dimensions_json: {
          data_quality: precisionScore,
          setup_mode: data.setupMode,
        },
      });

      setCurrentBusiness(business);
      await refreshBusinesses();
      
      toast.success('¡Tu negocio está listo!');
      navigate('/app?open_widget=health');
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error('Error al crear el negocio. Intenta de nuevo.');
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
            onChange={(code) => setData(d => ({ ...d, countryCode: code, areaId: '', businessTypeId: '' }))}
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
      case 'name':
        return (
          <SetupStepName
            value={data.businessName}
            onChange={(name) => setData(d => ({ ...d, businessName: name }))}
          />
        );
      case 'mode':
        return (
          <SetupStepMode
            value={data.setupMode}
            onChange={(mode) => setData(d => ({ ...d, setupMode: mode }))}
          />
        );
      case 'google':
        return (
          <SetupStepGoogle
            countryCode={data.countryCode}
            currentPlaceId={data.googlePlaceId}
            onConnect={(place) => {
              setData(d => ({
                ...d,
                googlePlaceId: place.placeId,
                googleRating: place.rating,
                googleReviewCount: place.reviewCount,
                googleAddress: place.address,
                businessName: d.businessName || place.name,
              }));
              handleNext();
            }}
            onSkip={handleNext}
          />
        );
      case 'create':
        return (
          <div className="text-center space-y-8 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">¡Todo listo!</h2>
              <p className="text-muted-foreground">
                Vamos a crear tu negocio y activar tu Brain con los datos que nos diste.
              </p>
            </div>
            <SetupProgress
              precisionScore={precisionScore}
              estimatedHealthScore={50 + Math.round(precisionScore * 0.3)}
              currentSection="finish"
              answeredQuestions={5}
              totalQuestions={10}
              businessName={data.businessName}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <VistaceoLogo size={32} variant="full" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {STEPS.length}
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
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/50 py-4">
        <div className="container max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>

          {stepId !== 'google' && (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading || creatingBusiness}
              className={cn(stepId === 'create' && 'bg-gradient-to-r from-primary to-accent')}
            >
              {creatingBusiness ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : stepId === 'create' ? (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Crear negocio
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

function calculatePrecision(data: SetupData): number {
  let score = 0;
  if (data.countryCode) score += 10;
  if (data.areaId) score += 15;
  if (data.businessTypeId) score += 20;
  if (data.businessName.length >= 2) score += 10;
  if (data.googlePlaceId) score += 25;
  if (data.setupMode === 'complete') score += 10;
  return Math.min(100, score);
}

export default SetupPage;
