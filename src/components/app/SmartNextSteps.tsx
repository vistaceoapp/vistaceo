import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Target, Radar, MessageCircle, Camera, Brain, TrendingUp, Check, X, ChevronDown } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { safeLocalStorage } from '@/lib/safe-storage';

interface NextStep {
  id: string;
  label: string;
  description: string;
  why: string;
  icon: React.ElementType;
  action: () => void;
  priority: number;
  color: string;
  done: boolean;
}

export const SmartNextSteps = () => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<NextStep[]>([]);
  const [loading, setLoading] = useState(true);
  const storageKey = `vc_onboarding_guide_${currentBusiness?.id ?? 'anon'}`;
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const state = safeLocalStorage.getItem(storageKey);
    setDismissed(state === 'dismissed');
    setCollapsed(state === 'collapsed');
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    safeLocalStorage.setItem(storageKey, 'dismissed');
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    safeLocalStorage.setItem(storageKey, next ? 'collapsed' : 'open');
  };

  useEffect(() => {
    if (currentBusiness) computeSteps();
    else setLoading(false);
  }, [currentBusiness?.id]);

  const computeSteps = async () => {
    if (!currentBusiness) return;
    setLoading(true);

    const [brainRes, photoRes, missionRes, chatRes, radarRes] = await Promise.all([
      supabase
        .from('business_brains')
        .select('mvc_completion_pct, total_signals')
        .eq('business_id', currentBusiness.id)
        .maybeSingle(),
      supabase
        .from('business_photos')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', currentBusiness.id),
      supabase
        .from('daily_actions')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', currentBusiness.id),
      supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', currentBusiness.id)
        .eq('role', 'user'),
      supabase
        .from('learning_items')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', currentBusiness.id),
    ]);

    const brainCompletion = brainRes.data?.mvc_completion_pct || 0;

    const all: NextStep[] = [
      {
        id: 'ask-ai',
        label: 'Hablá con tu CEO virtual',
        description: 'Contale una duda real y recibí una respuesta concreta.',
        why: 'Es el punto de entrada: todo lo que le contás mejora misiones, radar y predicciones.',
        icon: MessageCircle,
        action: () => navigate('/app/chat?prompt=' + encodeURIComponent('¿Qué debería hacer esta semana en mi negocio para crecer?')),
        priority: 1,
        color: 'text-primary',
        done: (chatRes.count || 0) > 0,
      },
      {
        id: 'start-mission',
        label: 'Abrí tu primera misión',
        description: 'Un plan paso a paso, listo para ejecutar hoy.',
        why: 'Las misiones traducen el análisis en acciones con resultado medible.',
        icon: Target,
        action: () => navigate('/app/missions'),
        priority: 2,
        color: 'text-success',
        done: (missionRes.count || 0) > 0,
      },
      {
        id: 'check-radar',
        label: 'Mirá el radar de tu mercado',
        description: 'Oportunidades y tendencias detectadas para tu rubro.',
        why: 'Lo que marques como relevante afina lo que el sistema te propone después.',
        icon: Radar,
        action: () => navigate('/app/radar'),
        priority: 3,
        color: 'text-warning',
        done: (radarRes.count || 0) > 0,
      },
      {
        id: 'improve-brain',
        label: 'Completá el perfil de tu negocio',
        description: `El sistema te conoce un ${brainCompletion}%. Más contexto, mejores decisiones.`,
        why: 'Cada dato nuevo se propaga automáticamente a todas las áreas de la app.',
        icon: Brain,
        action: () => navigate('/app/chat?prompt=' + encodeURIComponent('Quiero contarte más sobre mi negocio para que me ayudes mejor')),
        priority: 4,
        color: 'text-primary',
        done: brainCompletion >= 60,
      },
      {
        id: 'upload-photos',
        label: 'Subí fotos de tu negocio',
        description: 'Tu espacio, tus productos, tu marca.',
        why: 'El análisis visual suma contexto que ningún formulario captura.',
        icon: Camera,
        action: () => navigate('/app/more'),
        priority: 5,
        color: 'text-accent',
        done: (photoRes.count || 0) > 0,
      },
    ];

    setSteps(all.sort((a, b) => a.priority - b.priority));
    setLoading(false);
  };

  if (loading || steps.length === 0 || dismissed) return null;

  const doneCount = steps.filter((s) => s.done).length;
  const pending = steps.filter((s) => !s.done);
  const progress = Math.round((doneCount / steps.length) * 100);

  if (pending.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase px-1">
          Siguiente paso
        </h3>
        <button
          onClick={() => navigate('/app/chat?prompt=' + encodeURIComponent('¿Qué debería hacer hoy en mi negocio para crecer?'))}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Tu base está lista</p>
            <p className="text-[11px] text-muted-foreground truncate">Pedile a la IA la próxima jugada estratégica.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
        </button>
      </div>
    );
  }

  const [hero, ...rest] = pending;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4">
      {/* Encabezado con progreso y controles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-2 min-w-0 group"
            aria-expanded={!collapsed}
          >
            <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase group-hover:text-foreground transition-colors">
              Cómo empezar
            </h3>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-muted-foreground/60 transition-transform',
                collapsed && '-rotate-90'
              )}
            />
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {doneCount}/{steps.length}
            </span>
            <button
              onClick={handleDismiss}
              aria-label="Ocultar guía"
              title="Ocultar guía"
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="guide-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">


      {/* Paso destacado */}
      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={hero.action}
        className={cn(
          'w-full text-left p-4 rounded-xl border border-primary/20 bg-primary/5',
          'hover:border-primary/40 transition-all duration-200 group'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <hero.icon className={cn('w-5 h-5', hero.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{hero.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{hero.description}</p>
            <p className="text-[11px] text-muted-foreground/80 mt-1.5 leading-relaxed">{hero.why}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary/60 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
        </div>
      </motion.button>

      {/* Resto de pasos */}
      {rest.length > 0 && (
        <div className="space-y-1">
          {rest.map((step, i) => (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * (i + 1) }}
              onClick={step.action}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                <step.icon className={cn('w-3.5 h-3.5', step.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{step.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{step.description}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Completados */}
      {doneCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/40">
          {steps.filter((s) => s.done).map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5 mt-2"
            >
              <Check className="w-2.5 h-2.5 text-success" />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
