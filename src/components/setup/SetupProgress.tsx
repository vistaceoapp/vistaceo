// Setup Progress Panel - Shows real-time analytics during setup
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SetupProgressProps {
  precisionScore: number;
  estimatedHealthScore: number;
  currentSection: string;
  answeredQuestions: number;
  totalQuestions: number;
  businessName?: string;
  isCompact?: boolean;
}

const SUB_SCORES = [
  { id: 'identity', label: 'Identidad', weight: 25 },
  { id: 'operations', label: 'Operación', weight: 20 },
  { id: 'sales', label: 'Ventas', weight: 20 },
  { id: 'finance', label: 'Finanzas', weight: 20 },
  { id: 'reputation', label: 'Reputación', weight: 15 },
];

export const SetupProgress = ({
  precisionScore,
  estimatedHealthScore,
  currentSection,
  answeredQuestions,
  totalQuestions,
  businessName,
  isCompact = false,
}: SetupProgressProps) => {
  const [expanded, setExpanded] = useState(!isCompact);

  const getSubScoreValue = (id: string) => {
    // Simulate sub-score based on answered questions per category
    const baseValue = Math.min(100, (answeredQuestions / Math.max(totalQuestions, 1)) * 100);
    const variation = Math.random() * 20 - 10;
    return Math.max(0, Math.min(100, baseValue + variation));
  };

  if (isCompact && !expanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {businessName ? `Creando ${businessName}` : 'Creando tu negocio'}
              </p>
              <p className="text-xs text-muted-foreground">
                Precisión: {precisionScore}%
              </p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {businessName ? `Creando ${businessName}` : 'Creando tu negocio'}
            </h3>
            <p className="text-sm text-muted-foreground">vistaceo está aprendiendo</p>
          </div>
        </div>
        {isCompact && (
          <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground">
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Scores */}
      <div className="grid grid-cols-2 gap-4">
        {/* Precision Score */}
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-border"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="url(#gradient-precision)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${precisionScore * 1.76} 176`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient-precision" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">{precisionScore}%</span>
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Precisión</p>
        </div>

        {/* Health Score (Estimated) */}
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-border"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="hsl(var(--success))"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${estimatedHealthScore * 1.76} 176`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">~{estimatedHealthScore}</span>
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Salud (est.)</p>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground mb-3">Sub-scores por área</p>
        {SUB_SCORES.map((sub) => {
          const value = getSubScoreValue(sub.id);
          return (
            <div key={sub.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 truncate">{sub.label}</span>
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
              <span className="text-xs font-medium text-foreground w-8 text-right">
                {Math.round(value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* How to improve */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Cómo mejorar precisión</p>
            <p className="text-xs text-muted-foreground mt-1">
              {precisionScore < 30 && 'Completá más preguntas del cuestionario.'}
              {precisionScore >= 30 && precisionScore < 60 && 'Conectá Google Business para más datos.'}
              {precisionScore >= 60 && precisionScore < 80 && 'Agregá integraciones de pagos y redes.'}
              {precisionScore >= 80 && '¡Excelente! Tu Brain tendrá alta precisión.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
