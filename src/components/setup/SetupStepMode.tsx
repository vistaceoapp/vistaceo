// Step 4: Setup Mode Selection
import { motion } from 'framer-motion';
import { Zap, Target, Clock, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetupStepModeProps {
  value: 'quick' | 'complete';
  onChange: (mode: 'quick' | 'complete') => void;
}

const MODES = [
  {
    id: 'quick' as const,
    title: 'Rápido',
    subtitle: '8 a 10 preguntas',
    description: 'Lo esencial para arrancar hoy. Opciones simples y todo se puede afinar después.',
    icon: Zap,
    badge: null,
    precision: '15-30%',
    precisionLevel: 'inicial',
    timeHint: '2 a 3 min',
  },
  {
    id: 'complete' as const,
    title: 'Completo',
    subtitle: '23 a 25 preguntas',
    description: 'Más contexto desde el día uno: tu Brain arranca con mucho más para personalizar todo.',
    icon: Target,
    badge: 'Recomendado',
    precision: '35-65%',
    precisionLevel: 'alta',
    timeHint: '5 a 7 min',
  },
];

export const SetupStepMode = ({ value, onChange }: SetupStepModeProps) => {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">¿Cómo querés empezar?</h2>
        <p className="text-muted-foreground">Elegí una forma simple de arrancar. Lo avanzado queda para después.</p>
      </div>

      <div className="space-y-4">
        {MODES.map((mode, idx) => {
          const isSelected = value === mode.id;
          const Icon = mode.icon;

          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onChange(mode.id)}
              className={cn(
                'w-full relative p-6 rounded-2xl border-2 transition-all duration-200 text-left',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border bg-card'
              )}
            >
              {mode.badge && (
                <span className="absolute -top-3 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  {mode.badge}
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                )}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">{mode.title}</h3>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {mode.timeHint}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-primary mb-1.5">{mode.subtitle}</p>
                  <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-foreground">
                      Precisión inicial: <span className={mode.precisionLevel === 'inicial' ? 'text-warning' : 'text-primary'}>{mode.precision}</span>
                      <span className="text-muted-foreground ml-1">({mode.precisionLevel})</span>
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                  >
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Motivational message */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <p className="text-sm text-center text-muted-foreground">
          <span className="font-medium text-foreground">El setup no tiene que ser una traba.</span> Después, dentro de la app, VISTACEO va a seguir aprendiendo tu negocio hasta llegar al{' '}
          <span className="font-bold text-primary">100%</span> y logres crecer con acciones y recomendaciones precisas.
        </p>
      </div>
    </div>
  );
};
