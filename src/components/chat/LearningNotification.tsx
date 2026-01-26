import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningNotificationProps {
  isVisible: boolean;
}

export const LearningNotification = ({ isVisible }: LearningNotificationProps) => {
  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2.5 px-4 py-2.5 rounded-full",
        "bg-gradient-to-r from-[#2692DC] to-[#746CE6] text-white shadow-lg",
        "transition-all duration-500 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-4 pointer-events-none"
      )}
      style={{
        boxShadow: "0 8px 32px rgba(38,146,220,0.35)",
      }}
    >
      {/* Animated Star */}
      <div className="relative">
        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ animation: "learn-star 1.5s ease-in-out infinite" }}>
          <path
            d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"
            fill="currentColor"
          />
        </svg>
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-pulse" />
      </div>

      <span className="text-sm font-medium whitespace-nowrap">
        ¡Aprendido!
      </span>

      {/* Shimmer Effect */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          animation: "learn-shimmer 2s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes learn-star {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(15deg); }
        }
        
        @keyframes learn-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
