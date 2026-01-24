import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CEOAvatar } from "./CEOAvatar";
import { ChatSuggestionCard } from "./ChatSuggestionCard";
import { cn } from "@/lib/utils";

interface ChatWelcomeProps {
  businessName: string;
  onSelectSuggestion: (text: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  { 
    icon: "📊", 
    text: "¿Cómo puedo mejorar mis ventas esta semana?", 
    category: "Ventas" 
  },
  { 
    icon: "⭐", 
    text: "Analiza mis últimas reseñas y dame acciones concretas", 
    category: "Reputación" 
  },
  { 
    icon: "💡", 
    text: "Dame ideas creativas para promocionar el almuerzo", 
    category: "Marketing" 
  },
  { 
    icon: "📈", 
    text: "¿Qué métricas clave debería seguir cada día?", 
    category: "Análisis" 
  },
  { 
    icon: "👥", 
    text: "Consejos para motivar y retener a mi equipo", 
    category: "Equipo" 
  },
  { 
    icon: "💰", 
    text: "¿Cómo reducir costos sin afectar la calidad?", 
    category: "Finanzas" 
  },
];

export const ChatWelcome = ({
  businessName,
  onSelectSuggestion,
  disabled,
}: ChatWelcomeProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-8">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* CEO Avatar with animation */}
        <div className="flex justify-center mb-6">
          <CEOAvatar size="xl" />
        </div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Hola, {businessName.split(" ")[0]}
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Soy tu <span className="text-primary font-medium">CEO virtual</span>.
            Pregúntame sobre estrategias, ventas, marketing o cualquier desafío de tu negocio.
          </p>
        </motion.div>

        {/* Sparkle hint */}
        <motion.div
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Aprendo de cada conversación para darte mejores consejos</span>
        </motion.div>
      </motion.div>

      {/* Suggestions Grid */}
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.p
          className="text-sm text-muted-foreground text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Prueba con alguna de estas preguntas
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUGGESTIONS.map((suggestion, idx) => (
            <ChatSuggestionCard
              key={idx}
              icon={suggestion.icon}
              title={suggestion.text}
              category={suggestion.category}
              onClick={() => onSelectSuggestion(suggestion.text)}
              index={idx}
              disabled={disabled}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden opacity-30">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
        >
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(204 79% 50% / 0.2)" />
              <stop offset="50%" stopColor="hsl(254 61% 67% / 0.2)" />
              <stop offset="100%" stopColor="hsl(204 79% 50% / 0.2)" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
            fill="url(#wave-gradient)"
            animate={{
              d: [
                "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z",
                "M0,80 C150,20 350,100 600,80 C850,60 1050,100 1200,80 L1200,120 L0,120 Z",
                "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>
    </div>
  );
};
