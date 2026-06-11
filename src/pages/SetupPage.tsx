// Setup Page v7.0 - Complete Rebuild
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Loader2, Brain, Sparkles, Check, Crown } from 'lucide-react';
import { VistaceoLogo } from '@/components/ui/VistaceoLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useActivityTracker } from '@/hooks/use-activity-tracker';
import { CountryCode, COUNTRY_PACKS } from '@/lib/countryPacks';
import { analyzeHealthFromAnswers } from '@/lib/gastroQuestionsEngine';
import { safeLocalStorage } from '@/lib/safe-storage';
import { useCountryDetection } from '@/hooks/use-country-detection';
import { buildSemanticAnswerMap } from '@/lib/setup-semantic';
import { emitBrainEvent } from '@/lib/brain-event-ledger';

// Map area IDs to valid business_category enum values
const AREA_TO_CATEGORY: Record<string, string> = {
  'A1_GASTRO': 'restaurant',
  'A2_RETAIL': 'comercio',
  'A3_SALUD': 'salud',
  'A4_EDUCA': 'educacion',
  'A5_TECH': 'ecommerce',
  'A6_B2B': 'b2b',
  'A7_HOGAR_SERV': 'servicio_profesional',
  'A8_CONSTRU_INMO': 'industria',
  'A9_LOGISTICA': 'industria',
  'A10_AGRO': 'industria',
  'A11_FINANZAS': 'servicio_profesional',
  'A12_LEGAL': 'servicio_profesional',
  'A13_CREATIVO': 'creador',
  'A14_TURISMO': 'servicio_profesional',
  'A15_DEPORTE': 'salud',
  'A16_BELLEZA': 'salud',
  'A17_VETERINARIA': 'salud',
  'A18_GREENTECH': 'industria',
  'A19_SOCIAL': 'freelancer',
  'A20_FREELANCE': 'freelancer',
};

function mapAreaToCategory(areaId?: string): string {
  if (!areaId) return 'otro';
  return AREA_TO_CATEGORY[areaId] || 'otro';
}

// Setup steps
import { SetupStepCountry } from '@/components/setup/SetupStepCountry';
import { SetupStepIdentityAI } from '@/components/setup/SetupStepIdentityAI';
import { SetupStepSector } from '@/components/setup/SetupStepSector';
import { SetupStepType } from '@/components/setup/SetupStepType';
import { SetupStepMode } from '@/components/setup/SetupStepMode';
import { SetupStepBusiness } from '@/components/setup/SetupStepBusiness';
import { SetupStepQuestionnaire } from '@/components/setup/SetupStepQuestionnaire';

import { SetupProgress } from '@/components/setup/SetupProgress';
import { collectSignupTrackingContext } from '@/lib/signup-tracking';

// Steps: country -> identity (AI) -> business (name+google) -> mode -> questionnaire -> create
// Manual fallback inserts sector+type steps dynamically
const STEPS = ['country', 'identity', 'business', 'mode', 'questionnaire', 'create'] as const;
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
  linkedinUrl?: string;
  websiteUrl?: string;
  sourcePreference?: 'google' | 'linkedin' | 'website' | 'manual';
  answers: Record<string, any>;
  questionIndex: number;
  integrationsProfiled: {
    payments: string[];
    reviews: string[];
    social: string[];
    other: string[];
  };
}

const SetupPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { refreshBusinesses, setCurrentBusiness, businesses } = useBusiness();
  const { trackSetupStarted, trackSetupStepViewed, trackSetupCompleted } = useActivityTracker();
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const setupStartTracked = useRef(false);
  const { yearlySavings } = useCountryDetection();
  const realSavingsPct = Math.max(0, Math.min(99, yearlySavings().percentage || 0));
  
  // Check if user already has Pro (from pre-setup purchase stored in localStorage)
  const hasPendingProPurchase = safeLocalStorage.getItem('proPurchaseCompleted') === 'true';
  const showUpgradeButton = !hasPendingProPurchase;

  // Restore setup progress from localStorage if returning from checkout
  const getSavedSetupState = () => {
    try {
      const saved = safeLocalStorage.getItem('setupProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if saved less than 30 days ago (persist across sessions)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // Saved progress unreadable — start fresh, no need to alarm the user
    }
    return null;
  };

  const savedState = getSavedSetupState();

  const [currentStep, setCurrentStep] = useState(savedState?.step || 0);
  
  const [data, setData] = useState<SetupData>(() => {
    if (savedState?.data) {
      return savedState.data;
    }
    // Check for saved country from selection
    const savedCountry = safeLocalStorage.getItem('selectedCountryCode') as CountryCode | null;
    return {
      countryCode: savedCountry || 'AR',
      areaId: '',
      businessTypeId: '',
      businessTypeLabel: '',
      businessName: '',
      setupMode: 'complete',
      answers: {},
      questionIndex: 0,
      integrationsProfiled: {
        payments: [],
        reviews: [],
        social: [],
        other: [],
      },
    };
  });

  // Save setup progress whenever it changes (for returning from checkout)
  useEffect(() => {
    if (currentStep > 0 || data.areaId) {
      safeLocalStorage.setItem('setupProgress', JSON.stringify({
        step: currentStep,
        data: data,
        timestamp: Date.now(),
      }));
    }
  }, [currentStep, data]);

  // Clear saved progress on component unmount if setup is complete
  const clearSavedProgress = () => {
    safeLocalStorage.removeItem('setupProgress');
    safeLocalStorage.removeItem('setupQuestionsCache');
    safeLocalStorage.removeItem('setupUniversalProfile');
  };

  // Redirect if user already has a completed business
  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const completed = businesses.find(b => b.setup_completed);
      if (completed) {
        clearSavedProgress();
        navigate('/app', { replace: true });
      }
    }
  }, [businesses, navigate]);

  // Track setup_started once
  useEffect(() => {
    if (!setupStartTracked.current && user) {
      setupStartTracked.current = true;
      trackSetupStarted({ countryCode: data.countryCode });
    }
  }, [user]);

  // Track step views
  useEffect(() => {
    trackSetupStepViewed(STEPS[currentStep], currentStep);
  }, [currentStep]);

  const stepId = STEPS[currentStep];
  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const precisionScore = calculatePrecision(data);
  const lang = COUNTRY_PACKS[data.countryCode]?.locale?.startsWith('pt') ? 'pt' : 'es';

  // Track if user chose manual flow (sector+type cards)
  const [manualIdentityMode, setManualIdentityMode] = useState(false);
  const [manualSubStep, setManualSubStep] = useState<'sector' | 'type' | null>(null);

  // Áreas de servicio/profesión — el nombre es obligatorio
  const SERVICE_AREAS_PAGE = new Set([
    'A5_TECH','A6_B2B','A7_HOGAR_SERV','A11_FINANZAS','A12_LEGAL',
    'A13_CREATIVO','A14_TURISMO','A19_SOCIAL','A20_FREELANCE',
  ]);
  const isServiceArea = SERVICE_AREAS_PAGE.has(data.areaId);

  const canProceed = useCallback(() => {
    switch (stepId) {
      case 'country': return !!data.countryCode;
      case 'identity': return !!data.businessTypeId;
      case 'business': {
        // Servicio/profesión: nombre obligatorio (mínimo 2 chars).
        // Físico: nombre manual o ficha de Google.
        if (isServiceArea) return (data.businessName?.trim().length ?? 0) >= 2;
        return !!data.googlePlaceId || (data.businessName?.trim().length ?? 0) >= 2;
      }
      case 'mode': return true;
      case 'questionnaire': return true;
      case 'create': return true;
      default: return false;
    }
  }, [stepId, data, isServiceArea]);

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
    // Handle manual identity sub-steps
    if (manualIdentityMode && STEPS[currentStep] === 'identity') {
      if (manualSubStep === 'type') {
        setManualSubStep('sector');
        return;
      }
      setManualIdentityMode(false);
      setManualSubStep(null);
      return;
    }
    
    // If going back to identity step (changing business type), warn about losing questions
    if (currentStep > 0 && STEPS[currentStep - 1] === 'identity') {
      const hasAnswers = Object.keys(data.answers).length > 0;
      if (hasAnswers) {
        const msg = lang === 'pt' 
          ? 'Se você mudar o tipo de negócio, as perguntas e respostas serão regeneradas. Deseja continuar?'
          : 'Si cambiás el tipo de negocio, las preguntas y respuestas se van a regenerar. ¿Querés continuar?';
        if (!window.confirm(msg)) return;
        // Clear questions cache since business type will change
        safeLocalStorage.removeItem('setupQuestionsCache');
        setData(d => ({ ...d, answers: {}, questionIndex: 0 }));
      }
      setManualIdentityMode(false);
      setManualSubStep(null);
    }
    
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const deriveBusinessName = (): string => {
    const direct = data.businessName?.trim();
    if (direct) return direct;
    // Fallback: derive from web/linkedin URL or generic label
    const url = (data.websiteUrl || data.linkedinUrl || '').trim();
    if (url) {
      try {
        const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
        const slug = host.split('.')[0];
        if (slug) return slug.charAt(0).toUpperCase() + slug.slice(1);
      } catch {
        if (url.length > 0) return url.slice(0, 60);
      }
    }
    return 'Mi negocio';
  };

  const createBusiness = async () => {
    if (!user) return;
    const finalName = deriveBusinessName();
    
    setCreatingBusiness(true);
    setCreateProgress(10);

    try {
      const existingIncompleteBusiness = businesses.find((business) => !business.setup_completed);

      // Step 1: Create business
      setCreateProgress(20);
      const businessMutation = existingIncompleteBusiness
        ? supabase
            .from('businesses')
            .update({
              name: finalName,
              category: mapAreaToCategory(data.areaId) as any,
              country: data.countryCode,
              owner_id: user.id,
              setup_completed: true,
              google_place_id: data.googlePlaceId,
              avg_rating: data.googleRating,
              address: data.googleAddress,
              precision_score: precisionScore,
              settings: {
                ...(existingIncompleteBusiness.settings && typeof existingIncompleteBusiness.settings === 'object' ? existingIncompleteBusiness.settings : {}),
                setup_version: '7.0',
                setup_mode: data.setupMode,
                web_url: data.websiteUrl || null,
                linkedin_url: data.linkedinUrl || null,
                source_preference: data.sourcePreference || (data.googlePlaceId ? 'google' : 'manual'),
              },
            })
            .eq('id', existingIncompleteBusiness.id)
            .select()
            .single()
        : supabase
            .from('businesses')
            .insert({
              name: finalName,
              category: mapAreaToCategory(data.areaId) as any,
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
                web_url: data.websiteUrl || null,
                linkedin_url: data.linkedinUrl || null,
                source_preference: data.sourcePreference || (data.googlePlaceId ? 'google' : 'manual'),
              },
            })
            .select()
            .single();

      const { data: business, error } = await businessMutation;

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
          web_url: data.websiteUrl || null,
          linkedin_url: data.linkedinUrl || null,
          source_preference: data.sourcePreference || (data.googlePlaceId ? 'google' : 'manual'),
          has_google: !!data.googlePlaceId,
          has_website: !!data.websiteUrl,
          has_linkedin: !!data.linkedinUrl,
          answers: data.answers,
          // Versión semántica: cada respuesta enriquecida con intentKey,
          // targetBrainField, healthDimension, wasUnknown, wasClarification, etc.
          answers_semantic: buildSemanticAnswerMap(data.answers ?? {}),
          integrations_profiled: data.integrationsProfiled,
        },
        preferences_memory: {
          language: 'es',
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

      await supabase.from('business_brains').upsert(brainData, { onConflict: 'business_id' });

      // Brain Event: setup completado — dispara recalibración de dashboard,
      // health, radar, missions, predictions y analytics.
      emitBrainEvent({
        eventType: 'setup_completed',
        businessId: business.id,
        sourceModule: 'setup',
        normalizedInput: {
          setupMode: data.setupMode,
          businessType: data.businessTypeId,
          country: data.countryCode,
          answersCount: Object.keys(data.answers ?? {}).length,
        },
        brainFieldsUpdated: ['factual_memory', 'answers_semantic', 'primary_business_type'],
        confidenceDelta: 0.4,
      }).catch(() => {});

      setCreateProgress(50);

      // Step 3: Create setup progress record
      await supabase.from('business_setup_progress').upsert({
        business_id: business.id,
        current_step: 'completed',
        precision_score: precisionScore,
        setup_data: {
          ...data,
          completed_at: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      }, { onConflict: 'business_id' });
      setCreateProgress(65);

      // Step 4: Use AI to calculate intelligent health score
      try {
        const { data: aiAnalysis, error: aiError } = await supabase.functions.invoke('analyze-health-score', {
          body: {
            businessId: business.id,
            setupData: {
              businessName: data.businessName,
              countryCode: data.countryCode,
              businessTypeId: data.businessTypeId,
              businessTypeLabel: data.businessTypeLabel,
              setupMode: data.setupMode,
              answers: data.answers,
              integrationsProfiled: data.integrationsProfiled,
              googleAddress: data.googleAddress,
              websiteUrl: data.websiteUrl,
              linkedinUrl: data.linkedinUrl,
              sourcePreference: data.sourcePreference,
            },
            googleData: {
              placeId: data.googlePlaceId,
              rating: data.googleRating,
              reviewCount: data.googleReviewCount,
            },
          },
        });
        
        if (aiError) {
          console.warn('AI analysis failed, using fallback:', aiError);
          await createFallbackSnapshot(business.id, data, precisionScore);
        }
      } catch (aiErr) {
        console.warn('AI analysis error, using fallback:', aiErr);
        await createFallbackSnapshot(business.id, data, precisionScore);
      }
      
      setCreateProgress(80);

      // Step 5: Auto-sync Google reviews if we have a Place ID
      if (data.googlePlaceId) {
        try {
          const { error: syncError } = await supabase.functions.invoke('google-sync-public-reviews', {
            body: {
              businessId: business.id,
              placeId: data.googlePlaceId,
            },
          });
          if (syncError) {
            console.warn('Google reviews sync failed:', syncError);
          }
        } catch (syncErr) {
          console.warn('Error syncing Google reviews:', syncErr);
        }
      }

      // Step 5b: Seed initial Radar (opportunities + 1 trend) so the user
      // never lands on an empty dashboard. Fire-and-forget; the function
      // guarantees at least 1-2 opportunities and 1 trend even if the AI
      // returns nothing.
      try {
        supabase.functions.invoke('seed-initial-insights', {
          body: { businessId: business.id },
        }).catch(err => {
          console.warn('[Setup] seed-initial-insights failed (non-blocking):', err);
        });
      } catch (scanErr) {
        console.warn('[Setup] Error triggering initial seed:', scanErr);
      }

      setCreateProgress(100);

      // Set as current business and navigate to celebration page
      setCurrentBusiness(business);
      await refreshBusinesses();
      
      // Clear saved progress since setup is complete
      clearSavedProgress();
      safeLocalStorage.removeItem('selectedCountryCode');
      safeLocalStorage.setItem('setup_completed', 'true');

      // Track setup completed
      trackSetupCompleted({
        countryCode: data.countryCode,
        areaId: data.areaId,
        businessTypeId: data.businessTypeId,
        setupMode: data.setupMode,
        precisionScore,
        durationMs: Date.now() - (savedState?.timestamp || Date.now()),
      });

      // Step 6: Send "Activated" email (fire and forget - don't block navigation)
      supabase.functions.invoke('send-email-activated', {
        body: {
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
          businessId: business.id,
          businessName: data.businessName,
        },
      }).catch(err => {
        console.warn('[Setup] Activated email failed (non-blocking):', err);
      });

      // Aviso interno al admin: setup completado con TODO el contexto del negocio (no bloqueante)
      const answersSummary = data.answers && typeof data.answers === 'object'
        ? Object.entries(data.answers as Record<string, any>)
            .filter(([, v]) => v !== null && v !== undefined && v !== '')
            .map(([k, v]) => {
              const value = Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? JSON.stringify(v) : String(v));
              return `${k}: ${value.length > 200 ? value.slice(0, 200) + '…' : value}`;
            })
            .join(' | ')
        : '';

      supabase.functions.invoke('notify-admin', {
        body: {
          event: 'setup_completed',
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
          userId: user.id,
          businessName: data.businessName,
          businessId: business.id,
          countryCode: data.countryCode,
          areaId: data.areaId,
          // Tipo de negocio ultra-detallado
          businessTypeId: data.businessTypeId,
          businessTypeLabel: data.businessTypeLabel,
          // Setup
          setupMode: data.setupMode,
          setupVersion: '7.0',
          precisionScore: precisionScore,
          // Google / dirección
          googleConnected: !!data.googlePlaceId,
          googlePlaceId: data.googlePlaceId,
          googleAddress: data.googleAddress,
          googleRating: data.googleRating,
          googleReviewCount: data.googleReviewCount,
          // Integraciones
          integrationsProfiled: data.integrationsProfiled,
          // Cuestionario completo (qué escribió/eligió)
          answersCount: data.answers ? Object.keys(data.answers as Record<string, any>).length : 0,
          answersSummary,
          // Atribución de origen (recuperada del first-touch guardado en signup)
          ...collectSignupTrackingContext(),
        },
      }).catch(err => {
        console.warn('[notify-admin] setup_completed failed (non-blocking):', err);
      });

      toast.success(lang === 'pt' ? 'Negócio criado com sucesso!' : '¡Tu negocio está listo!');
      navigate('/setup-complete', { replace: true });
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
      case 'identity':
        // Manual sub-steps (sector → type)
        if (manualIdentityMode && manualSubStep === 'sector') {
          return (
            <div className="space-y-4">
              <SetupStepSector
                countryCode={data.countryCode}
                value={data.areaId}
                onChange={(areaId) => {
                  setData(d => ({ ...d, areaId, businessTypeId: '' }));
                  setManualSubStep('type');
                }}
              />
              <div className="flex justify-center">
                <button
                  onClick={() => { setManualIdentityMode(false); setManualSubStep(null); }}
                  className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                >
                  <Brain className="w-4 h-4" />
                  Volver a probar con IA
                </button>
              </div>
            </div>
          );
        }
        if (manualIdentityMode && manualSubStep === 'type') {
          return (
            <div className="space-y-4">
              <SetupStepType
                countryCode={data.countryCode}
                areaId={data.areaId}
                value={data.businessTypeId}
                onChange={(id, label) => {
                  setData(d => ({ ...d, businessTypeId: id, businessTypeLabel: label }));
                  setTimeout(() => setCurrentStep(prev => prev + 1), 300);
                }}
              />
              <div className="flex justify-center">
                <button
                  onClick={() => { setManualIdentityMode(false); setManualSubStep(null); }}
                  className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                >
                  <Brain className="w-4 h-4" />
                  Volver a probar con IA
                </button>
              </div>
            </div>
          );
        }
        // AI-first (default)
        return (
          <SetupStepIdentityAI
            onSelect={(option, rawText) => {
              setData(d => ({
                ...d,
                areaId: option.sector_id,
                businessTypeId: option.catalog_id || option.universal_profile?.subtype || 'custom',
                businessTypeLabel: option.title,
              }));
              // Store universal profile + raw text for brain initialization
              const profileToStore = {
                ...option.universal_profile,
                _raw_user_text: rawText || '',
                _selected_option_origin: option.origin,
                _precision_percent: option.precision_percent,
              };
              safeLocalStorage.setItem('setupUniversalProfile', JSON.stringify(profileToStore));
              try { localStorage.removeItem('setupIdentityDraft'); } catch { /* noop */ }
              // Auto-advance
              setTimeout(() => setCurrentStep(prev => prev + 1), 200);
            }}
          />
        );
      case 'business':
        return (
          <SetupStepBusiness
            countryCode={data.countryCode}
            areaId={data.areaId}
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
              linkedinUrl: update.linkedinUrl,
              websiteUrl: update.websiteUrl,
              sourcePreference: update.sourcePreference,
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
            areaId={data.areaId}
            businessTypeId={data.businessTypeId}
            setupMode={data.setupMode}
            answers={data.answers}
            questionIndex={data.questionIndex}
            onUpdate={(answers) => setData(d => ({ ...d, answers }))}
            onQuestionIndexChange={(questionIndex) => setData(d => ({ ...d, questionIndex }))}
            onComplete={handleNext}
            onBack={handleBack}
          />
        );
      case 'create':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-md mx-auto"
          >
            {creatingBusiness ? (
              <div className="space-y-8">
                {/* Animated Brain Icon */}
                <div className="relative mx-auto w-24 h-24">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Brain className="w-12 h-12 text-primary-foreground" />
                    </motion.div>
                  </div>
                  {/* Orbiting dots */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary"
                      style={{ top: '50%', left: '50%' }}
                      animate={{
                        x: [0, 40 * Math.cos((i * 120 * Math.PI) / 180), 0],
                        y: [0, 40 * Math.sin((i * 120 * Math.PI) / 180), 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                {/* Progress text */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {lang === 'pt' ? 'Criando seu negócio...' : 'Creando tu negocio...'}
                  </h2>
                  <motion.p 
                    key={createProgress}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-muted-foreground"
                  >
                    {createProgress < 40 && (lang === 'pt' ? 'Configurando perfil' : 'Configurando perfil')}
                    {createProgress >= 40 && createProgress < 70 && (lang === 'pt' ? 'Ativando inteligência' : 'Activando inteligencia')}
                    {createProgress >= 70 && (lang === 'pt' ? 'Preparando dashboard' : 'Preparando dashboard')}
                  </motion.p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={createProgress} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {lang === 'pt' ? 'Tudo pronto!' : '¡Todo listo!'}
                  </h2>
                  <p className="text-muted-foreground">
                    {lang === 'pt' 
                      ? 'Vamos criar seu negócio e ativar a inteligência com os dados que você nos deu.'
                      : 'Vamos a crear tu negocio y activar la inteligencia con los datos que nos diste.'
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Don't show nav buttons for questionnaire (it has its own) or during creation
  const showNavButtons = stepId !== 'questionnaire' && !creatingBusiness;

  const handleBackToAuth = async () => {
    if (!window.confirm(lang === 'pt' 
      ? 'Se você sair, todo o progresso do setup será perdido. Deseja continuar?' 
      : 'Si salís, se perderá todo el progreso del setup. ¿Querés continuar?')) {
      return;
    }
    clearSavedProgress();
    await signOut();
    navigate('/auth?mode=login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <VistaceoLogo size={32} variant="full" />
          <div className="flex items-center gap-3">
            {/* Upgrade to Pro button - solo se habilita tras responder al menos una pregunta */}
            {showUpgradeButton && (() => {
              const hasStarted = !!data.areaId || !!data.businessTypeId || (data.businessName?.trim().length ?? 0) >= 2 || Object.keys(data.answers || {}).length > 0;
              return (
                <Button
                  size="sm"
                  disabled={!hasStarted}
                  onClick={() => {
                    // Persistir explícitamente para volver exactamente aquí si el usuario regresa
                    try {
                      safeLocalStorage.setItem('setupProgress', JSON.stringify({
                        step: currentStep, data, timestamp: Date.now(),
                      }));
                    } catch { /* noop */ }
                    navigate(`/checkout?plan=pro_yearly&country=${data.countryCode}&return=setup`);
                  }}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!hasStarted ? (lang === 'pt' ? 'Responde al menos una pregunta para continuar' : 'Responde al menos una pregunta para continuar') : undefined}
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === 'pt' ? 'Quero Pro' : 'Quiero Pro'}</span>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground text-[10px] px-1.5 py-0 border-0">
                    -{realSavingsPct}%
                  </Badge>
                </Button>
              );
            })()}
            {/* Subtle back to auth link - only on first step */}
            {currentStep === 0 && (
              <button
                onClick={handleBackToAuth}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {lang === 'pt' ? 'Outra conta' : 'Otra cuenta'}
              </button>
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">
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

      {/* Footer - Navigation */}
      {showNavButtons && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border py-4">
          <div className="container max-w-4xl mx-auto px-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="min-w-[100px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === 'pt' ? 'Voltar' : 'Atrás'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || creatingBusiness}
              className={cn(
                "min-w-[140px]",
                stepId === 'create' && 'bg-gradient-to-r from-primary to-accent'
              )}
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

interface HealthAnalysis {
  totalScore: number;
  dimensions: Record<string, number | null>;
  strengths: string[];
  weaknesses: string[];
}

function analyzeBusinessHealth(data: SetupData): HealthAnalysis {
  const result = analyzeHealthFromAnswers(
    data.answers,
    data.countryCode,
    data.businessTypeId,
    data.setupMode,
    {
      rating: data.googleRating,
      reviewCount: data.googleReviewCount,
      placeId: data.googlePlaceId,
    }
  );
  
  return {
    totalScore: result.totalScore,
    dimensions: result.dimensions,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
  };
}

async function createFallbackSnapshot(businessId: string, data: SetupData, precisionScore: number) {
  const healthAnalysis = analyzeBusinessHealth(data);
  
  await supabase.from('snapshots').insert({
    business_id: businessId,
    source: 'setup_baseline',
    total_score: healthAnalysis.totalScore,
    dimensions_json: {
      reputation: healthAnalysis.dimensions.reputation,
      profitability: healthAnalysis.dimensions.profitability,
      finances: healthAnalysis.dimensions.finances,
      efficiency: healthAnalysis.dimensions.efficiency,
      traffic: healthAnalysis.dimensions.traffic,
      team: healthAnalysis.dimensions.team,
      growth: healthAnalysis.dimensions.growth,
      _meta: {
        data_quality: precisionScore,
        setup_mode: data.setupMode,
        google_connected: !!data.googlePlaceId,
        questions_answered: Object.keys(data.answers).length,
        integrations_profiled: Object.values(data.integrationsProfiled).flat().length,
        fallback: true,
      },
    },
    strengths: healthAnalysis.strengths,
    weaknesses: healthAnalysis.weaknesses,
  });
}

export default SetupPage;
