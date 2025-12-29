import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Check,
  Loader2,
  Clock,
  Zap,
  Target,
  MapPin,
  Store,
  Users,
  DollarSign,
  Calendar,
  Utensils,
  TrendingUp,
  Globe,
  ChevronRight,
  Search,
  Building2,
  Briefcase,
  ChevronLeft
} from 'lucide-react';
import { VistaceoLogo } from '@/components/ui/VistaceoLogo';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Import step components
import { SetupStepChips } from '@/components/app/SetupStepChips';
import { SetupStepMix } from '@/components/app/SetupStepMix';
import { SetupStepSearch } from '@/components/app/SetupStepSearch';
import { AreaCard, BusinessTypeCard, CountryCard, SearchResultCard } from '@/components/app/SetupCards';
import { CompetitorData } from '@/lib/setupSteps';

// Import new business types helper
import {
  getCountries,
  getAreas,
  getBusinessTypes,
  searchBusinessTypes,
  getAreaById,
  type CountryCode,
  type BusinessType,
} from '@/lib/setupBusinessTypes';

// Import Gastro setup
import { COMPLETE_GASTRO_QUESTIONS, getActiveQuestionsForBusiness, type SetupMode as GastroSetupMode } from '@/lib/gastroQuestionsComplete';
import { GastroSetupInput } from '@/components/app/GastroSetupInputs';
import { GastroSetupFlow } from '@/components/app/GastroSetupFlow';
import { type Language } from '@/lib/gastroSetupQuestions';

// Step definitions
interface SetupStepDef {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  required: boolean;
  fastTrack: boolean;
  section: 'intro' | 'identity' | 'operations' | 'strategy' | 'finish';
}

const SETUP_STEPS: SetupStepDef[] = [
  { id: 'welcome', title: 'Bienvenido', subtitle: 'Tu CEO digital te espera', icon: Brain, required: true, fastTrack: true, section: 'intro' },
  { id: 'country', title: 'País', subtitle: 'Dónde operás', icon: Globe, required: true, fastTrack: true, section: 'identity' },
  { id: 'area', title: 'Sector', subtitle: 'Tu industria', icon: Building2, required: true, fastTrack: true, section: 'identity' },
  { id: 'business_type', title: 'Tipo', subtitle: 'Qué hacés', icon: Briefcase, required: true, fastTrack: true, section: 'identity' },
  { id: 'business_name', title: 'Nombre', subtitle: 'Tu negocio', icon: Store, required: true, fastTrack: true, section: 'identity' },
  { id: 'mode', title: 'Modo', subtitle: 'Tu camino', icon: Zap, required: true, fastTrack: true, section: 'intro' },
  { id: 'google_business', title: 'Google', subtitle: 'Conectar reseñas', icon: MapPin, required: false, fastTrack: true, section: 'identity' },
  { id: 'positioning', title: 'Propuesta', subtitle: 'Tu diferencial', icon: Target, required: true, fastTrack: true, section: 'strategy' },
  { id: 'service_model', title: 'Modelo', subtitle: 'Cómo vendés', icon: Users, required: true, fastTrack: true, section: 'operations' },
  { id: 'dayparts', title: 'Horarios', subtitle: 'Cuándo operás', icon: Calendar, required: true, fastTrack: true, section: 'operations' },
  { id: 'top_sellers', title: 'Estrellas', subtitle: 'Productos top', icon: Utensils, required: true, fastTrack: true, section: 'operations' },
  { id: 'ticket', title: 'Ticket', subtitle: 'Promedio', icon: DollarSign, required: true, fastTrack: true, section: 'operations' },
  { id: 'focus', title: 'Foco', subtitle: 'Prioridad', icon: Target, required: true, fastTrack: true, section: 'strategy' },
  { id: 'constraints', title: 'Contexto', subtitle: 'Restricciones', icon: Clock, required: true, fastTrack: true, section: 'strategy' },
  { id: 'competitors', title: 'Competencia', subtitle: 'Tu zona', icon: Store, required: true, fastTrack: true, section: 'strategy' },
  { id: 'channel_mix', title: 'Canales', subtitle: 'Mix', icon: TrendingUp, required: false, fastTrack: false, section: 'operations' },
  { id: 'complete', title: 'Listo', subtitle: 'Brain activo', icon: Check, required: true, fastTrack: true, section: 'finish' },
];

const COUNTRY_FLAGS: Record<string, string> = {
  AR: '🇦🇷', UY: '🇺🇾', BR: '🇧🇷', CL: '🇨🇱', CO: '🇨🇴', EC: '🇪🇨', MX: '🇲🇽', CR: '🇨🇷', PA: '🇵🇦',
};

interface SetupData {
  businessName: string;
  country: CountryCode;
  areaId: string;
  businessTypeId: string;
  businessTypeLabel: string;
  mode: 'fast' | 'complete';
  positioning: string;
  serviceModel: string;
  activeDayparts: string[];
  topSellers: string[];
  ticketRange: string;
  currentFocus: string;
  constraints: { weeklyTime: string; teamSize: string; mainLimitation: string };
  channelMix: { dineIn: number; delivery: number; takeaway: number };
  capacity: number;
  foodCostPercent: number;
  fixedCosts: number;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleLat?: number;
  googleLng?: number;
  competitors: CompetitorData[];
  // Gastro-specific data (stored by path)
  gastroData: Record<string, any>;
}

const SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState<'fast' | 'complete'>('fast');
  const [businessCreated, setBusinessCreated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGastroFlow, setShowGastroFlow] = useState(false);
  
  const [setupData, setSetupData] = useState<SetupData>({
    businessName: currentBusiness?.name || '',
    country: (currentBusiness?.country as CountryCode) || 'AR',
    areaId: '',
    businessTypeId: '',
    businessTypeLabel: '',
    mode: 'fast',
    positioning: '',
    serviceModel: '',
    activeDayparts: [],
    topSellers: [],
    ticketRange: '',
    currentFocus: '',
    constraints: { weeklyTime: '', teamSize: '', mainLimitation: '' },
    channelMix: { dineIn: 60, delivery: 30, takeaway: 10 },
    capacity: 50,
    foodCostPercent: 30,
    fixedCosts: 0,
    competitors: [],
    gastroData: {},
  });

  const countries = useMemo(() => getCountries(), []);
  const areas = useMemo(() => getAreas(setupData.country), [setupData.country]);
  const businessTypes = useMemo(() => 
    setupData.areaId ? getBusinessTypes(setupData.areaId, setupData.country) : [],
    [setupData.areaId, setupData.country]
  );
  const searchResults = useMemo(() => 
    searchQuery.length >= 2 ? searchBusinessTypes(searchQuery, setupData.country) : [],
    [searchQuery, setupData.country]
  );

  // Calculate activeSteps FIRST before using in effects
  const activeSteps = useMemo(() => {
    return SETUP_STEPS.filter(step => {
      // Once the business exists, we don't want to re-run the intro/identity creation steps
      if (businessCreated && ['welcome', 'country', 'area', 'business_type', 'business_name'].includes(step.id)) return false;
      return setupMode === 'complete' || step.fastTrack;
    });
  }, [businessCreated, setupMode]);

  // Handle navigation when business is created via context (e.g., page reload)
  useEffect(() => {
    if (currentBusiness && !businessCreated) {
      setBusinessCreated(true);

      // Find the mode step in the NEW filtered list (without creation steps)
      const stepsAfterCreate = SETUP_STEPS.filter(step => {
        if (['welcome', 'country', 'area', 'business_type', 'business_name'].includes(step.id)) return false;
        return setupMode === 'complete' || step.fastTrack;
      });

      const modeIndex = stepsAfterCreate.findIndex(s => s.id === 'mode');
      setCurrentStep(modeIndex >= 0 ? modeIndex : 0);
    }
  }, [currentBusiness, businessCreated, setupMode]);

  // Keep currentStep always within the active steps range (avoids "desconfigura" on step list changes)
  useEffect(() => {
    if (currentStep < 0) return;
    if (activeSteps.length === 0) return;
    if (currentStep > activeSteps.length - 1) {
      setCurrentStep(activeSteps.length - 1);
    }
  }, [activeSteps.length, currentStep]);

  const stepConfig = activeSteps[currentStep];
  const totalSteps = activeSteps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const precisionScore = calculatePrecision(setupData, setupMode);

  const handleNext = async () => {
    if (stepConfig?.id === 'business_name' && !currentBusiness) {
      await createBusiness();
      return;
    }
    if (currentStep < totalSteps - 1) {
      await saveProgress();
      setCurrentStep(prev => prev + 1);
    } else {
      await completeSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const createBusiness = async () => {
    if (!user || !setupData.businessName.trim() || !setupData.businessTypeId) return;
    setLoading(true);
    try {
      const { data: businessData, error } = await supabase.from("businesses").insert({
        name: setupData.businessName.trim(),
        category: 'restaurant' as const,
        country: setupData.country as any,
        owner_id: user.id,
        setup_completed: false,
      }).select().single();
      if (error) throw error;
      if (businessData) {
        await supabase.from("business_setup_progress").insert({
          business_id: businessData.id,
          current_step: 'mode',
          setup_data: { ...setupData } as any,
          precision_score: 20,
        });
      }
      await refreshBusinesses();
      
      // Calculate the steps after creating business (without creation steps)
      const stepsAfterCreate = SETUP_STEPS.filter(step => {
        if (['welcome', 'country', 'area', 'business_type', 'business_name'].includes(step.id)) return false;
        return setupMode === 'complete' || step.fastTrack;
      });
      const modeIndex = stepsAfterCreate.findIndex(s => s.id === 'mode');

      setBusinessCreated(true);
      setCurrentStep(modeIndex >= 0 ? modeIndex : 0);
      toast.success('Negocio creado');
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Error al crear el negocio");
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!currentBusiness) return;
    try {
      await supabase.from('business_setup_progress').upsert({
        business_id: currentBusiness.id,
        current_step: stepConfig?.id || 'welcome',
        setup_data: setupData as any,
        precision_score: precisionScore,
      }, { onConflict: 'business_id' });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeSetup = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      await supabase.from('business_setup_progress').upsert({
        business_id: currentBusiness.id,
        current_step: 'complete',
        setup_data: setupData as any,
        precision_score: precisionScore,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'business_id' });

      await supabase.from('businesses').update({
        setup_completed: true,
        service_model: setupData.serviceModel,
        active_dayparts: setupData.activeDayparts,
        channel_mix: setupData.channelMix,
        precision_score: precisionScore,
      }).eq('id', currentBusiness.id);

      await supabase.from('business_brains').upsert({
        business_id: currentBusiness.id,
        primary_business_type: setupData.businessTypeId,
        current_focus: setupData.currentFocus || 'ventas',
        factual_memory: {
          positioning: setupData.positioning,
          top_sellers: setupData.topSellers,
          ticket_range: setupData.ticketRange,
          constraints: setupData.constraints,
          area_id: setupData.areaId,
          business_type_label: setupData.businessTypeLabel,
        },
        preferences_memory: { autopilot_mode: 'standard', language: setupData.country === 'BR' ? 'pt-BR' : 'es' },
        mvc_completion_pct: precisionScore,
      }, { onConflict: 'business_id' });

      await supabase.from('snapshots').insert({
        business_id: currentBusiness.id,
        source: 'setup_baseline',
        total_score: Math.round(precisionScore * 0.5),
        dimensions_json: { data_quality: precisionScore, setup_mode: setupMode },
      });

      await refreshBusinesses();
      toast.success('¡Tu Brain está activo!');
      navigate('/app');
    } catch (error) {
      console.error('Error completing setup:', error);
      toast.error('Error al completar el setup');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    const stepId = stepConfig?.id;
    switch (stepId) {
      case 'welcome': return true;
      case 'country': return !!setupData.country;
      case 'area': return !!setupData.areaId;
      case 'business_type': return !!setupData.businessTypeId;
      case 'business_name': return setupData.businessName.trim().length >= 2;
      case 'mode': return true;
      case 'google_business': return true;
      case 'positioning': return setupData.positioning.length > 5;
      case 'service_model': return !!setupData.serviceModel;
      case 'dayparts': return setupData.activeDayparts.length > 0;
      case 'top_sellers': return setupData.topSellers.length > 0;
      case 'ticket': return !!setupData.ticketRange;
      case 'focus': return !!setupData.currentFocus;
      case 'constraints': return !!setupData.constraints.weeklyTime;
      case 'competitors': return setupData.competitors.length >= 1;
      case 'channel_mix': return true;
      case 'complete': return true;
      default: return true;
    }
  };

  const handleSearchUpdate = (updates: Partial<SetupData>) => {
    setSetupData(d => ({ ...d, ...updates }));
  };

  const selectBusinessType = (bt: BusinessType & { label: string }) => {
    setSetupData(d => ({ ...d, areaId: bt.area_id, businessTypeId: bt.id, businessTypeLabel: bt.label }));
    setSearchQuery('');
  };

  // Render step content
  const renderStepContent = () => {
    const stepId = stepConfig?.id;

    switch (stepId) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 to-accent/30 rounded-full animate-pulse" />
              <div className="relative w-32 h-32 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                <VistaceoLogo size={80} variant="icon" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4 max-w-md"
            >
              <h2 className="text-4xl font-bold text-foreground tracking-tight">
                Tu CEO digital
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                En minutos armaremos tu <span className="text-primary font-semibold">Brain</span> personalizado.
                Cada respuesta mejora mis recomendaciones.
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary font-medium">
                <Clock className="w-4 h-4" />
                <span>5-8 minutos</span>
              </div>
            </motion.div>
          </div>
        );

      case 'country':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {countries.map((country) => (
                <CountryCard
                  key={country.code}
                  code={country.code}
                  name={country.name}
                  flag={COUNTRY_FLAGS[country.code] || '🌎'}
                  selected={setupData.country === country.code}
                  onClick={() => setSetupData(d => ({ 
                    ...d, 
                    country: country.code as CountryCode, 
                    areaId: '', 
                    businessTypeId: '', 
                    businessTypeLabel: '' 
                  }))}
                />
              ))}
            </div>
          </div>
        );

      case 'area':
        return (
          <div className="space-y-6">
            {/* Smart Search */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscá tu tipo de negocio..."
                  className="pl-14 h-16 text-lg bg-card border-2 border-border rounded-2xl focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1 max-h-72 overflow-y-auto border-2 border-primary/20 rounded-2xl p-3 bg-card shadow-lg"
              >
                {searchResults.slice(0, 6).map((result) => (
                  <SearchResultCard
                    key={result.id}
                    label={result.label}
                    areaLabel={result.area.label}
                    definition={result.definition}
                    onClick={() => {
                      selectBusinessType(result);
                      setCurrentStep(prev => prev + 2);
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Areas Grid */}
            {searchQuery.length < 2 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground font-medium">O elegí tu sector</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {areas.map((area) => (
                    <AreaCard
                      key={area.id}
                      id={area.id}
                      label={area.label}
                      selected={setupData.areaId === area.id}
                      onClick={() => setSetupData(d => ({ 
                        ...d, 
                        areaId: area.id, 
                        businessTypeId: '', 
                        businessTypeLabel: '' 
                      }))}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'business_type':
        const selectedArea = getAreaById(setupData.areaId, setupData.country);
        return (
          <div className="space-y-6">
            {/* Breadcrumb */}
            {selectedArea && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSetupData(d => ({ ...d, areaId: '', businessTypeId: '', businessTypeLabel: '' }));
                    setCurrentStep(prev => prev - 1);
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sectores</span>
                </button>
                <span className="text-muted-foreground">/</span>
                <Badge variant="secondary" className="font-medium">
                  {selectedArea.label}
                </Badge>
              </div>
            )}

            {/* Search within area */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar tipos de negocio..."
                className="pl-12 h-12 bg-card border-2 border-border rounded-xl"
              />
            </div>

            {/* Business Types Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2">
              {(searchQuery.length >= 2 
                ? searchResults.filter(r => r.area_id === setupData.areaId) 
                : businessTypes
              ).map((bt) => (
                <BusinessTypeCard
                  key={bt.id}
                  id={bt.id}
                  label={bt.label}
                  definition={bt.definition}
                  selected={setupData.businessTypeId === bt.id}
                  onClick={() => selectBusinessType(bt)}
                />
              ))}
            </div>
          </div>
        );

      case 'business_name':
        return (
          <div className="space-y-8">
            {setupData.businessTypeLabel && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo seleccionado</p>
                    <p className="font-semibold text-foreground">{setupData.businessTypeLabel}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-base font-semibold text-foreground block">
                ¿Cómo se llama tu negocio?
              </label>
              <Input
                value={setupData.businessName}
                onChange={(e) => setSetupData(d => ({ ...d, businessName: e.target.value }))}
                placeholder="Ej: Café Central, Studio Fit..."
                className="h-16 text-xl bg-card border-2 border-border rounded-2xl px-6"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Podés cambiarlo cuando quieras
              </p>
            </div>
          </div>
        );

      case 'mode':
        // If A1_GASTRO is selected and gastro flow is active, show the gastro questions
        if (showGastroFlow && setupData.areaId === 'A1_GASTRO') {
          return (
            <GastroSetupFlow
              country={setupData.country}
              mode={setupMode === 'fast' ? 'quick' : 'full'}
              gastroData={setupData.gastroData}
              onUpdate={(newGastroData) => setSetupData(d => ({ ...d, gastroData: newGastroData }))}
              onComplete={() => {
                setShowGastroFlow(false);
                setCurrentStep(prev => prev + 1);
              }}
              onBack={() => setShowGastroFlow(false)}
            />
          );
        }
        
        return (
          <div className="space-y-4">
            {[
              { mode: 'fast' as const, icon: Zap, title: 'Empezar rápido', desc: '5-8 min • Dashboard útil desde hoy', color: 'primary' },
              { mode: 'complete' as const, icon: Target, title: 'Setup completo', desc: '10-15 min • Máxima precisión', color: 'accent' },
            ].map(({ mode, icon: Icon, title, desc }) => (
              <button
                key={mode}
                onClick={() => { 
                  setSetupMode(mode); 
                  setSetupData(d => ({ ...d, mode })); 
                  // If A1_GASTRO is selected, activate gastro flow after mode selection
                  if (setupData.areaId === 'A1_GASTRO') {
                    setShowGastroFlow(true);
                  }
                }}
                className={cn(
                  "w-full p-6 rounded-2xl border-2 text-left transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  setupMode === mode 
                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20" 
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    setupMode === mode ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <Icon className={cn("w-7 h-7", setupMode === mode ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-muted-foreground text-sm">{desc}</p>
                  </div>
                  {setupMode === mode && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
            <p className="text-sm text-center text-muted-foreground pt-2">
              Podés completar más info después
            </p>
          </div>
        );

      case 'google_business':
        return (
          <SetupStepSearch
            stepId="google_business"
            countryCode={setupData.country as any}
            data={setupData as any}
            onUpdate={handleSearchUpdate as any}
          />
        );

      case 'competitors':
        return (
          <SetupStepSearch
            stepId="competitors"
            countryCode={setupData.country as any}
            data={setupData as any}
            onUpdate={handleSearchUpdate as any}
            businessLat={setupData.googleLat}
            businessLng={setupData.googleLng}
            businessType={setupData.businessTypeId}
          />
        );

      case 'positioning':
        return (
          <div className="space-y-6">
            <textarea
              value={setupData.positioning}
              onChange={(e) => setSetupData(d => ({ ...d, positioning: e.target.value }))}
              placeholder="Ej: Café de especialidad para gente que trabaja cerca..."
              className="w-full h-36 p-5 rounded-2xl border-2 border-border bg-card text-foreground resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-lg"
            />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Ideas para inspirarte:</p>
              <div className="flex flex-wrap gap-2">
                {['Café de especialidad para oficinistas', 'Estudio de yoga para principiantes', 'Restaurante familiar con menú del día', 'Clínica dental para toda la familia'].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setSetupData(d => ({ ...d, positioning: sug }))}
                    className="px-4 py-2 text-sm bg-secondary rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'service_model':
        return (
          <SetupStepChips
            options={['Presencial', 'Online', 'Híbrido', 'Delivery-first', 'A domicilio']}
            selected={setupData.serviceModel ? [setupData.serviceModel] : []}
            onSelect={(val) => setSetupData(d => ({ ...d, serviceModel: val }))}
            multiple={false}
          />
        );

      case 'dayparts':
        const dayparts = setupData.country === 'BR' 
          ? ['Manhã', 'Almoço', 'Tarde', 'Jantar', 'Noite']
          : ['Mañana', 'Mediodía', 'Tarde', 'Noche', 'Madrugada'];
        return (
          <SetupStepChips
            options={dayparts}
            selected={setupData.activeDayparts}
            onSelect={(val) => setSetupData(d => ({ 
              ...d, 
              activeDayparts: d.activeDayparts.includes(val) 
                ? d.activeDayparts.filter(v => v !== val)
                : [...d.activeDayparts, val]
            }))}
            multiple={true}
          />
        );

      case 'top_sellers':
        return (
          <div className="space-y-4">
            <SetupStepChips
              options={['Servicio principal', 'Producto estrella', 'Oferta especial', 'Combo/Pack', 'Novedad']}
              selected={setupData.topSellers}
              onSelect={(val) => setSetupData(d => ({ 
                ...d, 
                topSellers: d.topSellers.includes(val) 
                  ? d.topSellers.filter(v => v !== val)
                  : d.topSellers.length < 3 ? [...d.topSellers, val] : d.topSellers
              }))}
              multiple={true}
            />
            <p className="text-sm text-center text-muted-foreground">
              Seleccioná hasta 3 productos/servicios
            </p>
          </div>
        );

      case 'ticket':
        return (
          <SetupStepChips
            options={getTicketRanges(setupData.country)}
            selected={setupData.ticketRange ? [setupData.ticketRange] : []}
            onSelect={(val) => setSetupData(d => ({ ...d, ticketRange: val }))}
            multiple={false}
          />
        );

      case 'focus':
        const focuses = [
          { value: 'ventas', label: 'Vender más', emoji: '💰' },
          { value: 'reputacion', label: 'Mejorar reputación', emoji: '⭐' },
          { value: 'eficiencia', label: 'Operar mejor', emoji: '⚙️' },
          { value: 'rentabilidad', label: 'Ser más rentable', emoji: '📈' },
          { value: 'clientes', label: 'Más clientes', emoji: '👥' },
          { value: 'marketing', label: 'Marketing', emoji: '📱' },
        ];
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {focuses.map((focus) => (
              <button
                key={focus.value}
                onClick={() => setSetupData(d => ({ ...d, currentFocus: focus.value }))}
                className={cn(
                  "p-5 rounded-2xl border-2 text-center transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  setupData.currentFocus === focus.value 
                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20" 
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-3xl block mb-2">{focus.emoji}</span>
                <span className={cn(
                  "text-sm font-semibold",
                  setupData.currentFocus === focus.value ? "text-primary" : "text-foreground"
                )}>{focus.label}</span>
              </button>
            ))}
          </div>
        );

      case 'constraints':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-base font-semibold text-foreground mb-4">Tiempo semanal para vistaceo:</p>
              <SetupStepChips
                options={['<5 hs', '5-10 hs', '10-20 hs', '+20 hs']}
                selected={setupData.constraints.weeklyTime ? [setupData.constraints.weeklyTime] : []}
                onSelect={(val) => setSetupData(d => ({ ...d, constraints: { ...d.constraints, weeklyTime: val } }))}
                multiple={false}
              />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground mb-4">Tamaño del equipo:</p>
              <SetupStepChips
                options={['Solo yo', '2-5', '6-15', '+15']}
                selected={setupData.constraints.teamSize ? [setupData.constraints.teamSize] : []}
                onSelect={(val) => setSetupData(d => ({ ...d, constraints: { ...d.constraints, teamSize: val } }))}
                multiple={false}
              />
            </div>
          </div>
        );

      case 'channel_mix':
        return (
          <SetupStepMix
            data={setupData.channelMix}
            onUpdate={(mix) => setSetupData(d => ({ ...d, channelMix: mix }))}
          />
        );

      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative"
            >
              <div className="absolute inset-0 blur-3xl bg-success/30 rounded-full animate-pulse" />
              <div className="relative w-28 h-28 rounded-3xl bg-success/20 flex items-center justify-center shadow-2xl">
                <Check className="w-14 h-14 text-success" />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 max-w-lg"
            >
              <h2 className="text-4xl font-bold text-foreground">¡Tu Brain está activo!</h2>
              <p className="text-lg text-muted-foreground">
                Dashboard con <span className="text-primary font-bold">{precisionScore}%</span> de precisión inicial
              </p>
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20">
                <p className="text-muted-foreground">
                  Mientras más uses vistaceo, más preciso se vuelve
                </p>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-80 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <VistaceoLogo size={36} variant="full" />
        </div>

        <div className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            {activeSteps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    isActive && "bg-primary/10 border border-primary/30",
                    isCompleted && "hover:bg-secondary cursor-pointer",
                    !isActive && !isCompleted && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    isActive && "gradient-primary text-primary-foreground",
                    isCompleted && "bg-success text-success-foreground",
                    !isActive && !isCompleted && "bg-secondary text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {step.title}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-4">
          <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Precisión</span>
              <Badge variant="secondary" className="text-primary font-bold">{precisionScore}%</Badge>
            </div>
            <Progress value={precisionScore} className="h-2" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <VistaceoLogo size={28} variant="icon" />
              <Badge variant="secondary" className="gap-1 font-bold">
                <Sparkles className="w-3 h-3" />
                {precisionScore}%
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </header>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepConfig?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {stepConfig?.id !== 'welcome' && stepConfig?.id !== 'complete' && (
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                      {stepConfig && <stepConfig.icon className="w-7 h-7 text-primary" />}
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">{stepConfig?.title}</h1>
                    <p className="text-muted-foreground text-lg">{stepConfig?.subtitle}</p>
                  </div>
                )}
                <div className="min-h-[300px]">{renderStepContent()}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border">
          <div className="max-w-xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Atrás</span>
              </Button>
              <Button onClick={handleNext} disabled={!canProceed() || loading} className="gap-2 gradient-primary flex-1 max-w-xs h-12 text-base font-semibold" size="lg">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : stepConfig?.id === 'complete' ? (
                  <><Sparkles className="w-5 h-5" /> Ir a Inicio</>
                ) : stepConfig?.id === 'business_name' && !currentBusiness ? (
                  <>Crear negocio <ArrowRight className="w-5 h-5" /></>
                ) : (
                  <>Siguiente <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

function calculatePrecision(data: SetupData, mode: 'fast' | 'complete'): number {
  let score = 10;
  if (data.businessName) score += 5;
  if (data.areaId) score += 5;
  if (data.businessTypeId) score += 10;
  if (data.positioning) score += 10;
  if (data.serviceModel) score += 10;
  if (data.activeDayparts.length > 0) score += 10;
  if (data.topSellers.length > 0) score += 10;
  if (data.ticketRange) score += 10;
  if (data.currentFocus) score += 10;
  if (data.constraints.weeklyTime) score += 5;
  if (data.constraints.teamSize) score += 5;
  if (data.competitors.length > 0) score += 5;
  if (mode === 'complete') score += 5;
  return Math.min(score, 100);
}

function getTicketRanges(country: CountryCode): string[] {
  switch (country) {
    case 'AR': return ['$5.000-10.000', '$10.000-20.000', '$20.000-40.000', '$40.000-80.000', '+$80.000'];
    case 'MX': return ['$100-300', '$300-600', '$600-1000', '$1000-2000', '+$2000'];
    case 'BR': return ['R$30-80', 'R$80-150', 'R$150-300', 'R$300-500', '+R$500'];
    case 'CL': return ['$5.000-15.000', '$15.000-30.000', '$30.000-50.000', '$50.000-100.000', '+$100.000'];
    case 'CO': return ['$20.000-50.000', '$50.000-100.000', '$100.000-200.000', '$200.000-400.000', '+$400.000'];
    default: return ['$10-30', '$30-60', '$60-100', '$100-200', '+$200'];
  }
}

export default SetupPage;
