import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Check,
  Loader2 
} from 'lucide-react';
import { useSetupProgress } from '@/hooks/use-setup-progress';
import { useBusiness } from '@/contexts/BusinessContext';
import { COUNTRY_PACKS, CountryCode, formatCurrency } from '@/lib/countryPacks';
import { getOrderedSteps, SetupData } from '@/lib/setupSteps';
import { cn } from '@/lib/utils';

// Step components
import { SetupStepChips } from './SetupStepChips';
import { SetupStepSlider } from './SetupStepSlider';
import { SetupStepMix } from './SetupStepMix';
import { SetupStepLocation } from './SetupStepLocation';
import { SetupStepToggle } from './SetupStepToggle';
import { SetupStepMenu } from './SetupStepMenu';
import { SetupStepSearch } from './SetupStepSearch';
import { SetupStepPreview } from './SetupStepPreview';

interface SetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export const SetupWizard = ({ open, onOpenChange, onComplete }: SetupWizardProps) => {
  const { currentBusiness } = useBusiness();
  const { progress, loading, saving, updateProgress, completeSetup } = useSetupProgress();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const countryCode = (currentBusiness?.country as CountryCode) || 'AR';
  const countryPack = COUNTRY_PACKS[countryCode];
  
  const steps = getOrderedSteps(countryCode, progress?.setup_data || {});
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Final step - complete setup
      const success = await completeSetup();
      if (success) {
        onComplete?.();
        onOpenChange(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleDataUpdate = async (data: Partial<SetupData>, precisionDelta?: number) => {
    if (currentStep) {
      await updateProgress(currentStep.id, data, precisionDelta);
    }
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-lg">Setup Inteligente</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {countryPack.flag} {currentBusiness?.name} • {countryPack.currency}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {progress?.precision_score || 0}% precisión
              </Badge>
            </div>
            
            {/* Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Paso {currentStepIndex + 1} de {totalSteps}</span>
                <span>{currentStep?.id}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Step Title */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentStep?.title(countryCode)}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentStep?.subtitle(countryCode)}
                  </p>
                </div>

                {/* Step Content based on type */}
                {currentStep?.inputType === 'chips' && (
                  <SetupStepChips
                    options={currentStep.getOptions?.(countryCode) || []}
                    selected={getSelectedForStep(currentStep.id, progress?.setup_data)}
                    onSelect={(value) => handleChipSelect(currentStep.id, value, handleDataUpdate)}
                    multiple={isMultipleSelect(currentStep.id)}
                  />
                )}

                {currentStep?.inputType === 'slider' && (
                  <SetupStepSlider
                    stepId={currentStep.id}
                    countryCode={countryCode}
                    data={progress?.setup_data || {}}
                    onUpdate={handleDataUpdate}
                  />
                )}

                {currentStep?.inputType === 'mix100' && (
                  <SetupStepMix
                    data={progress?.setup_data?.channelMix || { dineIn: 60, delivery: 30, takeaway: 10 }}
                    onUpdate={(mix) => handleDataUpdate({ channelMix: mix }, 5)}
                  />
                )}

                {currentStep?.inputType === 'cta' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    {currentStep.id === 'S00' ? (
                      <>
                        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
                          <Brain className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-center text-muted-foreground max-w-md">
                          En los próximos minutos vamos a armar juntos el Brain de tu negocio. 
                          Cada respuesta mejora la precisión de tus recomendaciones.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-2xl bg-success/20 flex items-center justify-center">
                          <Check className="w-10 h-10 text-success" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-xl font-semibold text-foreground">
                            ¡Tu Brain está activo!
                          </p>
                          <p className="text-muted-foreground">
                            Dashboard con {progress?.precision_score || 0}% de precisión, en {countryPack.currency}.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {currentStep?.inputType === 'map' && (
                  <SetupStepLocation
                    countryCode={countryCode}
                    data={progress?.setup_data || {}}
                    onUpdate={handleDataUpdate}
                  />
                )}

                {currentStep?.inputType === 'toggle' && (
                  <SetupStepToggle
                    stepId={currentStep.id}
                    data={progress?.setup_data || {}}
                    onUpdate={handleDataUpdate}
                  />
                )}

                {currentStep?.inputType === 'menu' && (
                  <SetupStepMenu
                    countryCode={countryCode}
                    data={progress?.setup_data || {}}
                    onUpdate={handleDataUpdate}
                  />
                )}

                {currentStep?.inputType === 'search' && (
                  <SetupStepSearch
                    stepId={currentStep.id}
                    countryCode={countryCode}
                    data={progress?.setup_data || {}}
                    onUpdate={handleDataUpdate}
                  />
                )}

                {currentStep?.inputType === 'preview' && (
                  <SetupStepPreview
                    stepId={currentStep.id}
                    countryCode={countryCode}
                    data={progress?.setup_data || {}}
                    precisionScore={progress?.precision_score || 0}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Brain Learning Panel - Side */}
          <div className="absolute right-6 top-32 w-48 hidden lg:block">
            <div className="p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Brain className="w-4 h-4 text-primary" />
                Brain está aprendiendo
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                {progress?.setup_data?.primaryType && (
                  <p>✓ Tipo: {progress.setup_data.primaryType}</p>
                )}
                {progress?.setup_data?.serviceModel && (
                  <p>✓ Modelo: {progress.setup_data.serviceModel}</p>
                )}
                {(progress?.setup_data?.activeDayparts?.length || 0) > 0 && (
                  <p>✓ Dayparts: {progress?.setup_data?.activeDayparts?.length}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={saving}
                className="gap-2 gradient-primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentStepIndex === totalSteps - 1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Ir al Dashboard
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper functions
function getSelectedForStep(stepId: string, data?: Partial<SetupData>): string[] {
  if (!data) return [];
  switch (stepId) {
    case 'S02': return data.primaryType ? [data.primaryType] : [];
    case 'S03': return data.serviceModel ? [data.serviceModel] : [];
    case 'S04': return data.activeDayparts || [];
    case 'S08': return [...(data.deliveryPlatforms || []), ...(data.reservationPlatforms || [])];
    case 'S09': return data.menuMethod ? [data.menuMethod] : [];
    default: return [];
  }
}

function handleChipSelect(
  stepId: string, 
  value: string, 
  onUpdate: (data: Partial<SetupData>, precision?: number) => void
) {
  switch (stepId) {
    case 'S02':
      onUpdate({ primaryType: value }, 10);
      break;
    case 'S03':
      onUpdate({ serviceModel: value }, 10);
      break;
    case 'S04':
      // Toggle daypart
      break;
    case 'S09':
      onUpdate({ menuMethod: value as SetupData['menuMethod'] }, 5);
      break;
  }
}

function isMultipleSelect(stepId: string): boolean {
  return ['S04', 'S08'].includes(stepId);
}
