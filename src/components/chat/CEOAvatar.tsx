import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface CEOAvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  isThinking?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  className?: string;
  showStatus?: boolean;
}

const sizeMap = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  isListening = false,
  className,
  showStatus = false,
}: CEOAvatarProps) => {
  const dims = sizeMap[size];

  const state = useMemo(() => {
    if (isSpeaking) return "speaking";
    if (isThinking) return "thinking";
    if (isListening) return "listening";
    return "idle";
  }, [isSpeaking, isThinking, isListening]);

  return (
    <div 
      className={cn("relative flex-shrink-0", className)}
      style={{ width: dims, height: dims }}
    >
      {/* Glow Layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-md transition-all duration-500",
          state === "speaking" && "animate-pulse"
        )}
        style={{
          background: state === "thinking" 
            ? "radial-gradient(circle, rgba(116,108,230,0.5) 0%, transparent 70%)"
            : state === "speaking"
            ? "radial-gradient(circle, rgba(59,184,195,0.6) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(38,146,220,0.4) 0%, transparent 70%)",
          transform: "scale(1.4)",
        }}
      />

      {/* Speaking Waves */}
      {state === "speaking" && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-[#3BB8C3]/40"
              style={{
                animation: `ceo-wave 1.5s ease-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Main Core */}
      <div
        className={cn(
          "absolute inset-0 rounded-full overflow-hidden",
          "transition-transform duration-300",
          state === "thinking" && "animate-[ceo-float_3s_ease-in-out_infinite]",
          state === "speaking" && "animate-[ceo-pulse_0.8s_ease-in-out_infinite]"
        )}
        style={{
          background: "linear-gradient(145deg, #2692DC 0%, #3BB8C3 35%, #746CE6 100%)",
          boxShadow: `
            0 0 ${dims * 0.3}px rgba(38,146,220,0.4),
            inset 0 -${dims * 0.1}px ${dims * 0.2}px rgba(0,0,0,0.2),
            inset 0 ${dims * 0.05}px ${dims * 0.1}px rgba(255,255,255,0.3)
          `,
        }}
      >
        {/* Glass Highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 100%)",
          }}
        />

        {/* Star Core */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <filter id="ceoStarGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* 4-Point Star */}
          <g 
            filter="url(#ceoStarGlow)"
            style={{ 
              transformOrigin: "50px 50px",
              animation: state === "thinking" 
                ? "ceo-star-rotate 4s linear infinite" 
                : state === "speaking"
                ? "ceo-star-pulse 0.6s ease-in-out infinite"
                : "none"
            }}
          >
            <path
              d="M50 25 L56 44 L75 50 L56 56 L50 75 L44 56 L25 50 L44 44 Z"
              fill="#ffffff"
              opacity="0.95"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="6" 
              fill="#ffffff"
              opacity="0.9"
            >
              <animate
                attributeName="r"
                values="6;7;6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Thinking Particles */}
          {state === "thinking" && (
            <g>
              <circle cx="35" cy="40" r="2" fill="#ffffff" opacity="0.7">
                <animate attributeName="cy" values="40;32;40" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="65" cy="35" r="1.5" fill="#ffffff" opacity="0.5">
                <animate attributeName="cy" values="35;28;35" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="30" r="1.8" fill="#ffffff" opacity="0.6">
                <animate attributeName="cy" values="30;22;30" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>

        {/* Gradient Shimmer */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
            animation: "ceo-shimmer 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Status Indicator */}
      {showStatus && state !== "idle" && (
        <div 
          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
          style={{
            backgroundColor: state === "speaking" 
              ? "#3BB8C3" 
              : state === "thinking" 
              ? "#746CE6" 
              : "#2692DC",
            animation: "ceo-status-pulse 1.5s ease-in-out infinite",
          }}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes ceo-wave {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes ceo-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        
        @keyframes ceo-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes ceo-star-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes ceo-star-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes ceo-shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes ceo-status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
