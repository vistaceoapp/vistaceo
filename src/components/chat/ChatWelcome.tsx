import { CEOAvatar } from "./CEOAvatar";
import { ChatSuggestedQuestions } from "./ChatSuggestedQuestions";
import { Sparkles, Mic, Paperclip, Brain } from "lucide-react";
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
      <p className="text-sm text-muted-foreground text-center mb-2 max-w-md leading-relaxed">
        Soy tu CEO virtual. Preguntame lo que necesites sobre tu negocio.
      </p>

      {/* Capability badges */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { icon: Brain, label: "Aprendo" },
          { icon: Mic, label: "Voz" },
          { icon: Paperclip, label: "Archivos" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
              "bg-muted/50 border border-border/40 text-muted-foreground",
              "text-[11px] font-medium"
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </div>
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