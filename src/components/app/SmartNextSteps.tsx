import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Radar, MessageCircle, Camera, Brain, TrendingUp } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NextStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  priority: number;
  color: string;
}

export const SmartNextSteps = () => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<NextStep[]>([]);

  useEffect(() => {
    if (currentBusiness) computeSteps();
  }, [currentBusiness?.id]);

  const computeSteps = async () => {
    if (!currentBusiness) return;

    const computedSteps: NextStep[] = [];

    // Check brain completeness
    const { data: brain } = await supabase
      .from('business_brains')
      .select('mvc_completion_pct, total_signals')
      .eq('business_id', currentBusiness.id)
      .maybeSingle();

    const brainCompletion = brain?.mvc_completion_pct || 0;

    // Check photos
    const { count: photoCount } = await supabase
      .from('business_photos')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', currentBusiness.id);

    // Check ANY mission ever (not just pending)
    const { count: missionCount } = await supabase
      .from('daily_actions')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', currentBusiness.id);

    // Check chat usage
    const { count: chatCount } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', currentBusiness.id)
      .eq('role', 'user');

    // Check radar engagement
    const { count: radarCount } = await supabase
      .from('learning_items')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', currentBusiness.id);

    if (brainCompletion < 60) {
      computedSteps.push({
        id: 'improve-brain',
        label: 'Contale más a la IA',
        description: `El sistema te conoce un ${brainCompletion}%. Más info = mejores consejos.`,
        icon: Brain,
        action: () => navigate('/app/chat?prompt=' + encodeURIComponent('Quiero contarte más sobre mi negocio para que me ayudes mejor')),
        priority: 1,
        color: 'text-primary',
      });
    }

    if ((photoCount || 0) === 0) {
      computedSteps.push({
        id: 'upload-photos',
        label: 'Subí fotos de tu negocio',
        description: 'Ayudá a la IA a entender tu espacio y marca visual.',
        icon: Camera,
        action: () => navigate('/app/more'),
        priority: 2,
        color: 'text-accent',
      });
    }

    if ((missionCount || 0) === 0) {
      computedSteps.push({
        id: 'start-mission',
        label: 'Empezá una misión',
        description: 'Acciones estratégicas personalizadas para crecer.',
        icon: Target,
        action: () => navigate('/app/missions'),
        priority: 3,
        color: 'text-success',
      });
    }

    if ((radarCount || 0) === 0) {
      computedSteps.push({
        id: 'check-radar',
        label: 'Revisá el radar',
        description: 'Oportunidades y tendencias de tu mercado.',
        icon: Radar,
        action: () => navigate('/app/radar'),
        priority: 4,
        color: 'text-warning',
      });
    }

    if ((chatCount || 0) === 0) {
      computedSteps.push({
        id: 'ask-ai',
        label: 'Preguntale a tu CEO',
        description: 'Resolvé dudas y recibí estrategias en tiempo real.',
        icon: MessageCircle,
        action: () => navigate('/app/chat'),
        priority: 5,
        color: 'text-primary',
      });
    }

    setSteps(computedSteps.sort((a, b) => a.priority - b.priority).slice(0, 3));
  };

  if (steps.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase px-1">
        Siguiente paso
      </h3>
      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <motion.button
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={step.action}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl",
              "bg-card border border-border/50 hover:border-primary/30",
              "transition-all duration-200 hover:shadow-[var(--shadow-sm)] group text-left"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              "bg-muted/50 group-hover:bg-primary/10 transition-colors"
            )}>
              <step.icon className={cn("w-4 h-4", step.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{step.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
