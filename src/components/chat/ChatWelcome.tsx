import { CEOAvatar } from "./CEOAvatar";
import { ChatSuggestedQuestions } from "./ChatSuggestedQuestions";
import { Sparkles, Camera, FileText, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const firstName = businessName.split(" ")[0];
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-8">
      {/* Avatar with glow */}
      <div className="relative mb-6">
        <CEOAvatar size="lg" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </div>

      {/* Welcome Text */}
      <h2 className="text-xl font-bold text-foreground mb-1.5 text-center">
        Hola, {firstName} 👋
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
        Soy tu CEO virtual. Preguntame, pedime análisis, subí fotos o documentos de tu negocio.
      </p>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 mb-6 w-full max-w-sm">
        {[
          { icon: TrendingUp, label: "Análisis", prompt: "Haceme un análisis completo de cómo está mi negocio hoy" },
          { icon: Camera, label: "Subir foto", prompt: "Quiero subir fotos de mi negocio para que lo conozcas mejor" },
          { icon: FileText, label: "Estrategia", prompt: "Dame una estrategia concreta para mejorar mis ventas esta semana" },
        ].map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => onSelectSuggestion(prompt)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl",
              "bg-card border border-border/50 hover:border-primary/30",
              "transition-all duration-200 hover:shadow-[var(--shadow-sm)]",
              "disabled:opacity-50"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Personalized Questions */}
      <div className="w-full max-w-lg">
        <ChatSuggestedQuestions
          businessId={businessId}
          onSelectQuestion={onSelectSuggestion}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
