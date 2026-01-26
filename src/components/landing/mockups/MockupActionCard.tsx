import { motion } from "framer-motion";
import { Zap, Clock, TrendingUp, CheckCircle2, ArrowRight, Star } from "lucide-react";

// Acciones reales que VistaCEO genera
const MOCK_ACTIONS = [
  {
    priority: "alta",
    title: "Optimizar horario de apertura los sábados",
    description: "Los datos muestran un 40% más de tráfico entre 8-9am. Abrir 1 hora antes podría generar +$45,000/mes.",
    impact: "+$45,000/mes",
    time: "15 min",
    steps: [
      "Revisar personal disponible",
      "Ajustar horario en Google",
      "Comunicar al equipo",
    ],
    category: "Crecimiento",
  },
  {
    priority: "media",
    title: "Responder 3 reseñas de Google pendientes",
    description: "Tenés 3 reseñas sin responder de esta semana. Responderlas aumenta la conversión un 15%.",
    impact: "+15% conversión",
    time: "10 min",
    steps: [
      "Leer reseñas",
      "Responder personalizadamente",
      "Agradecer feedback positivo",
    ],
    category: "Reputación",
  },
];

interface MockupActionCardProps {
  variant?: "full" | "compact";
}

export const MockupActionCard = ({ variant = "full" }: MockupActionCardProps) => {
  const action = MOCK_ACTIONS[0];
  
  if (variant === "compact") {
    return (
      <div className="bg-background/95 backdrop-blur-xl rounded-xl border border-border shadow-xl p-4 w-full max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive uppercase">
                Alta prioridad
              </span>
            </div>
            <h4 className="font-semibold text-foreground text-sm leading-tight mb-1">
              {action.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                {action.impact}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.time}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl p-5 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground">Tu acción de hoy</span>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-destructive/10 text-destructive uppercase">
          Alta prioridad
        </span>
      </div>

      {/* Action content */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground mb-2">{action.title}</h3>
        <p className="text-sm text-muted-foreground">{action.description}</p>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-secondary/50 rounded-lg">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-foreground">{action.impact}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{action.time}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-4">
        {action.steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted-foreground">{i + 1}</span>
            </div>
            <span className="text-sm text-foreground">{step}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 px-4 rounded-lg gradient-primary text-white font-medium text-sm flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Completar ahora
        </button>
      </div>
    </div>
  );
};
