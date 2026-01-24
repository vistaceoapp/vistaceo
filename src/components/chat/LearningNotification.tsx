import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningNotificationProps {
  isVisible: boolean;
}

export const LearningNotification = ({ isVisible }: LearningNotificationProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50",
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-success/90 text-success-foreground shadow-lg",
        "animate-fade-in"
      )}
    >
      <div className="relative">
        <Brain className="w-5 h-5" />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1" />
      </div>
      <div>
        <span className="text-sm font-medium">Aprendiendo...</span>
        <p className="text-xs opacity-80">Guardando nuevo conocimiento</p>
      </div>
    </div>
  );
};
