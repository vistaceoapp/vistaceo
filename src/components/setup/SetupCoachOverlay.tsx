import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Brain, Clock, MousePointerClick, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { safeSessionStorage } from '@/lib/safe-storage';

type Trigger = 'speed' | 'rage' | 'idle' | 'returning' | 'leaving' | 'back_pressure';

interface CoachMessage {
  icon: typeof Sparkles;
  title: string;
  body: string;
  cta: string;
}

const MESSAGES: Record<Trigger, (ctx: { stepId: string; voseo: boolean }) => CoachMessage> = {
  speed: ({ voseo }) => ({
    icon: Sparkles,
    title: voseo ? 'Frená 5 segundos, vale la pena' : 'Para 5 segundos, vale la pena',
    body: voseo
      ? 'Cada respuesta que escribís entrena tu CEO digital. Si vas muy rápido, va a tirar consejos genéricos. Si te tomás un minuto más, te da diagnósticos quirúrgicos para tu negocio real.'
      : 'Cada respuesta que escribes entrena tu CEO digital. Si vas muy rápido, te dará consejos genéricos. Si te tomas un minuto más, recibirás diagnósticos quirúrgicos para tu negocio real.',
    cta: voseo ? 'Sigo con calma' : 'Sigo con calma',
  }),
  rage: ({ voseo }) => ({
    icon: MousePointerClick,
    title: voseo ? '¿Algo no responde?' : '¿Algo no responde?',
    body: voseo
      ? 'Notamos que cliqueás varias veces. Si algo no anda, contanos por chat — vamos a arreglarlo en el momento. No queremos perderte por un bug.'
      : 'Notamos que haces varios clics. Si algo no funciona, escríbenos por chat — lo arreglamos al momento. No queremos perderte por un bug.',
    cta: 'Sigo igual',
  }),
  idle: ({ voseo }) => ({
    icon: Clock,
    title: voseo ? '¿Te trabaste en esta parte?' : '¿Te quedaste atascado aquí?',
    body: voseo
      ? 'Si no sabés qué poner, escribí lo primero que se te ocurra — el CEO entiende texto libre y lo interpreta. No hay respuesta incorrecta.'
      : 'Si no sabes qué poner, escribe lo primero que se te ocurra — el CEO entiende texto libre y lo interpreta. No hay respuesta incorrecta.',
    cta: 'Entendido',
  }),
  returning: ({ voseo }) => ({
    icon: Brain,
    title: voseo ? 'Bienvenido de vuelta' : 'Bienvenido de vuelta',
    body: voseo
      ? 'Te guardamos exactamente en el mismo punto. Te faltan pocos pasos — terminás el setup y entrás directo al dashboard con tu primer plan armado.'
      : 'Te guardamos exactamente en el mismo punto. Te faltan pocos pasos — termina el setup y entras directo al dashboard con tu primer plan listo.',
    cta: 'Seguir',
  }),
  leaving: ({ voseo }) => ({
    icon: LogOut,
    title: voseo ? 'Antes de irte…' : 'Antes de irte…',
    body: voseo
      ? 'Si cerrás ahora perdés el contexto que ya cargaste para hoy. Quedan menos pasos de los que parece — el siguiente es el más rápido.'
      : 'Si cierras ahora pierdes el contexto cargado hoy. Quedan menos pasos de los que parece — el siguiente es el más rápido.',
    cta: 'Termino ahora',
  }),
  back_pressure: ({ voseo }) => ({
    icon: Brain,
    title: voseo ? 'No hace falta perfección' : 'No hace falta perfección',
    body: voseo
      ? 'Las respuestas se pueden editar después desde Ajustes. Avanzá con lo que sepas hoy — el CEO va aprendiendo con vos.'
      : 'Las respuestas se pueden editar después desde Ajustes. Avanza con lo que sepas hoy — el CEO va aprendiendo contigo.',
    cta: 'Sigo',
  }),
};

const VOSEO_COUNTRIES = new Set(['AR', 'UY', 'PY']);

interface Props {
  currentStep: number;
  stepId: string;
  countryCode?: string;
  totalSteps: number;
}

const MAX_SHOWN_PER_SESSION = 3;
const COOLDOWN_MS = 35_000;
const STORAGE_KEY = 'setup_coach_state';

export function SetupCoachOverlay({ currentStep, stepId, countryCode, totalSteps }: Props) {
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const shownCountRef = useRef(0);
  const lastShownAtRef = useRef(0);
  const stepEnteredAtRef = useRef(Date.now());
  const lastStepChangeAtRef = useRef(Date.now());
  const consecutiveFastStepsRef = useRef(0);
  const clickTimesRef = useRef<number[]>([]);
  const idleTimerRef = useRef<number | null>(null);
  const blurAtRef = useRef<number | null>(null);
  const triggeredKeysRef = useRef<Set<string>>(new Set());

  const voseo = VOSEO_COUNTRIES.has((countryCode || '').toUpperCase());

  // Hydrate session state
  useEffect(() => {
    try {
      const raw = safeSessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        shownCountRef.current = s.count || 0;
        lastShownAtRef.current = s.last || 0;
        triggeredKeysRef.current = new Set(s.keys || []);
      }
    } catch { /* noop */ }
  }, []);

  const persist = useCallback(() => {
    try {
      safeSessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        count: shownCountRef.current,
        last: lastShownAtRef.current,
        keys: Array.from(triggeredKeysRef.current),
      }));
    } catch { /* noop */ }
  }, []);

  const fire = useCallback((t: Trigger, key?: string) => {
    if (trigger) return;
    const k = key || `${t}:${stepId}`;
    if (triggeredKeysRef.current.has(k)) return;
    if (shownCountRef.current >= MAX_SHOWN_PER_SESSION) return;
    if (Date.now() - lastShownAtRef.current < COOLDOWN_MS) return;
    triggeredKeysRef.current.add(k);
    shownCountRef.current += 1;
    lastShownAtRef.current = Date.now();
    setDismissed(false);
    setTrigger(t);
    persist();
  }, [trigger, stepId, persist]);

  // Reset idle timer + track step changes (speed detection)
  useEffect(() => {
    const now = Date.now();
    const sinceLastStep = now - lastStepChangeAtRef.current;
    if (sinceLastStep < 3500 && currentStep > 0) {
      consecutiveFastStepsRef.current += 1;
      if (consecutiveFastStepsRef.current >= 2 && currentStep < totalSteps - 1) {
        fire('speed', `speed:${currentStep}`);
      }
    } else {
      consecutiveFastStepsRef.current = 0;
    }
    lastStepChangeAtRef.current = now;
    stepEnteredAtRef.current = now;

    // Idle detection per step
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      // Only nag idle on content-heavy steps
      if (['questionnaire', 'enrich', 'identity'].includes(stepId)) {
        fire('idle', `idle:${stepId}`);
      }
    }, 55_000);

    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [currentStep, stepId, totalSteps, fire]);

  // Reset idle on activity
  useEffect(() => {
    const reset = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        if (['questionnaire', 'enrich', 'identity'].includes(stepId)) {
          fire('idle', `idle:${stepId}:${currentStep}`);
        }
      }, 55_000);
    };
    window.addEventListener('keydown', reset, { passive: true });
    window.addEventListener('scroll', reset, { passive: true });
    return () => {
      window.removeEventListener('keydown', reset);
      window.removeEventListener('scroll', reset);
    };
  }, [stepId, currentStep, fire]);

  // Rage clicks: 4+ clicks in 1200ms
  useEffect(() => {
    const onClick = () => {
      const now = Date.now();
      clickTimesRef.current = clickTimesRef.current.filter(t => now - t < 1200);
      clickTimesRef.current.push(now);
      if (clickTimesRef.current.length >= 4) {
        clickTimesRef.current = [];
        fire('rage', `rage:${currentStep}`);
      }
    };
    window.addEventListener('click', onClick, { passive: true });
    return () => window.removeEventListener('click', onClick);
  }, [currentStep, fire]);

  // Tab blur / return
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        blurAtRef.current = Date.now();
      } else if (blurAtRef.current) {
        const away = Date.now() - blurAtRef.current;
        blurAtRef.current = null;
        if (away > 25_000 && currentStep > 0) {
          fire('returning', `ret:${currentStep}`);
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [currentStep, fire]);

  // Exit intent (pointer leaves top of viewport)
  useEffect(() => {
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && currentStep > 0 && currentStep < totalSteps - 1) {
        fire('leaving', `exit:${currentStep}`);
      }
    };
    document.addEventListener('mouseout', onMouseOut);
    return () => document.removeEventListener('mouseout', onMouseOut);
  }, [currentStep, totalSteps, fire]);

  // Back button pressure (popstate)
  useEffect(() => {
    const onPop = () => {
      if (currentStep > 0 && currentStep < totalSteps - 1) {
        fire('back_pressure', `back:${currentStep}`);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [currentStep, totalSteps, fire]);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => setTrigger(null), 220);
  };

  if (!trigger) return null;
  const msg = MESSAGES[trigger]({ stepId, voseo });
  const Icon = msg.icon;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', damping: 22, stiffness: 240 }}
          className="fixed bottom-24 right-4 sm:right-6 z-[60] max-w-[360px] w-[calc(100vw-2rem)] sm:w-[360px]"
          role="dialog"
          aria-live="polite"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #2692DC, #746CE6)' }}
            />
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="p-4 pr-9">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(38,146,220,0.12), rgba(116,108,230,0.12))' }}
                >
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">{msg.title}</p>
                  <p className="text-[12px] text-muted-foreground leading-snug mt-1.5">{msg.body}</p>
                  <div className="mt-3 flex items-center justify-end">
                    <Button size="sm" variant="ghost" className="h-7 text-[12px]" onClick={handleDismiss}>
                      {msg.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SetupCoachOverlay;
