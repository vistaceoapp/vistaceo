import { CEOAvatar } from "./CEOAvatar";
import { cn } from "@/lib/utils";

interface ChatThinkingStateProps {
  compact?: boolean;
}

export const ChatThinkingState = ({ compact = false }: ChatThinkingStateProps) => {
  return (
    <div className={cn(
      "flex items-start gap-3 animate-fade-in",
      compact && "gap-2"
    )}>
      <CEOAvatar size={compact ? "xs" : "sm"} isThinking />
      
      <div className={cn(
        "inline-flex items-center gap-2 rounded-2xl rounded-tl-md",
        "bg-card/90 backdrop-blur-sm border border-border/60 shadow-sm",
        compact ? "px-3 py-2" : "px-4 py-3"
      )}>
        {/* Typing dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              style={{
                animation: "thinking-dot 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        
        <span className={cn(
          "font-medium bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent ml-1",
          compact ? "text-xs" : "text-sm"
        )}>
          Analizando...
        </span>
      </div>

      <style>{`
        @keyframes thinking-dot {
          0%, 80%, 100% { 
            transform: scale(0.8); 
            opacity: 0.5; 
          }
          40% { 
            transform: scale(1.2); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
};
