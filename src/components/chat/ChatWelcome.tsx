import { Sparkles } from "lucide-react";
import { CEOAvatar } from "./CEOAvatar";
import { ChatSuggestionCard } from "./ChatSuggestionCard";

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
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 animate-fade-in">
        {/* CEO Avatar */}
        <div className="flex justify-center mb-5">
          <CEOAvatar size="xl" />
        </div>

        {/* Greeting */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Hola, {businessName.split(" ")[0]}
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          Soy tu <span className="text-primary font-medium">CEO virtual</span>.
          Pregúntame sobre estrategias, ventas o cualquier desafío.
        </p>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Aprendo de cada conversación</span>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Prueba con alguna de estas preguntas
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>
    </div>
  );
};
