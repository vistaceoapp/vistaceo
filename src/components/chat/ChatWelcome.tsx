import { CEOAvatar } from "./CEOAvatar";
import { ChatSuggestedQuestions } from "./ChatSuggestedQuestions";
import { Sparkles } from "lucide-react";

interface ChatWelcomeProps {
  businessId: string;
  businessName: string;
  onSelectSuggestion: (text: string) => void;
  disabled?: boolean;
}

export const ChatWelcome = ({
  businessId,
  businessName,
  onSelectSuggestion,
  disabled,
}: ChatWelcomeProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-8">
      {/* Avatar */}
      <div className="relative mb-6">
        <CEOAvatar size="lg" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary-foreground" />
        </div>
      </div>

      {/* Welcome Text */}
      <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
        Hola, {businessName.split(" ")[0]}
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
        Soy tu CEO virtual. Estoy aquí para ayudarte a crecer tu negocio con 
        estrategias personalizadas y acciones concretas.
      </p>

      {/* Personalized Questions */}
      <div className="w-full max-w-lg">
        <ChatSuggestedQuestions
          businessId={businessId}
          onSelectQuestion={onSelectSuggestion}
          disabled={disabled}
        />
      </div>

      {/* Tip */}
      <p className="text-[11px] text-muted-foreground/60 mt-8 text-center max-w-xs">
        💡 Tip: También puedes enviar fotos, documentos o notas de voz
      </p>
    </div>
  );
};
