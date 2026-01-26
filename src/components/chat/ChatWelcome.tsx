import { CEOAvatar } from "./CEOAvatar";

interface ChatWelcomeProps {
  businessName: string;
  onSelectSuggestion: (text: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  { emoji: "📊", text: "¿Cómo mejorar mis ventas?" },
  { emoji: "⭐", text: "Analiza mis reseñas" },
  { emoji: "💡", text: "Ideas de marketing" },
  { emoji: "💰", text: "¿Cómo reducir costos?" },
];

export const ChatWelcome = ({
  businessName,
  onSelectSuggestion,
  disabled,
}: ChatWelcomeProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-6">
      {/* Avatar */}
      <div className="mb-4">
        <CEOAvatar size="lg" />
      </div>

      {/* Greeting */}
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1 text-center">
        Hola, {businessName.split(" ")[0]}
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
        Soy tu CEO virtual. ¿En qué puedo ayudarte?
      </p>

      {/* Quick Suggestions */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => !disabled && onSelectSuggestion(s.text)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm
              bg-card/80 border border-border/50 hover:border-primary/40 hover:bg-primary/5
              transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="text-base">{s.emoji}</span>
            <span className="text-foreground/90 line-clamp-1">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
