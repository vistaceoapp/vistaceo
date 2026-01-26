import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface CEOAvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  className,
}: CEOAvatarProps) => {
  const dims = sizeMap[size];

  const state = useMemo(() => {
    if (isSpeaking) return "speaking";
    if (isThinking) return "thinking";
    return "idle";
  }, [isSpeaking, isThinking]);

  return (
    <div 
      className={cn("relative flex-shrink-0", className)}
      style={{ width: dims, height: dims }}
    >
      {/* Ambient Glow */}
      <div
        className="absolute inset-0 rounded-full blur-lg opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(38,146,220,0.5) 0%, rgba(116,108,230,0.3) 50%, transparent 70%)",
          transform: "scale(1.8)",
          animation: state === "speaking" 
            ? "ceo-glow-pulse 1s ease-in-out infinite" 
            : state === "thinking"
            ? "ceo-glow-think 2s ease-in-out infinite"
            : "none",
        }}
      />

      {/* Speaking Waves */}
      {state === "speaking" && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid rgba(59,184,195,0.4)",
                animation: `ceo-wave 1.8s ease-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Main Orb */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a365d 0%, #2692DC 30%, #3BB8C3 50%, #746CE6 100%)",
          boxShadow: `
            0 4px ${dims * 0.4}px rgba(38,146,220,0.35),
            inset 0 -${dims * 0.15}px ${dims * 0.25}px rgba(0,0,0,0.25),
            inset 0 ${dims * 0.08}px ${dims * 0.12}px rgba(255,255,255,0.4)
          `,
          animation: state === "thinking" 
            ? "ceo-float 2.5s ease-in-out infinite" 
            : state === "speaking"
            ? "ceo-speak-bounce 0.6s ease-in-out infinite"
            : "none",
        }}
      >
        {/* Glass Highlight */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-1/3 rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)",
          }}
        />

        {/* Inner Gradient Animation */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            animation: "ceo-shimmer 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Logo Star Core */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{
          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
        }}
      >
        <defs>
          <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 4-Point Star (Logo) */}
        <g 
          filter="url(#starGlow)"
          style={{ 
            transformOrigin: "50px 50px",
            animation: state === "thinking" 
              ? "ceo-star-rotate 3s linear infinite" 
              : state === "speaking"
              ? "ceo-star-pulse 0.5s ease-in-out infinite"
              : "ceo-star-breathe 4s ease-in-out infinite",
          }}
        >
          <path
            d="M50 22 L56 42 L78 50 L56 58 L50 78 L44 58 L22 50 L44 42 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <circle 
            cx="50" 
            cy="50" 
            r="8" 
            fill="rgba(255,255,255,0.9)"
          />
        </g>

        {/* Thinking Particles */}
        {state === "thinking" && (
          <g>
            <circle cx="30" cy="35" r="3" fill="#ffffff" opacity="0.8">
              <animate attributeName="cy" values="35;25;35" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="70" cy="30" r="2" fill="#3BB8C3" opacity="0.7">
              <animate attributeName="cy" values="30;20;30" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="25" r="2.5" fill="#746CE6" opacity="0.6">
              <animate attributeName="cy" values="25;15;25" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>

      {/* CSS Animations */}
      <style>{`
        @keyframes ceo-wave {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        
        @keyframes ceo-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
        }
        
        @keyframes ceo-speak-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        
        @keyframes ceo-glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1.8); }
          50% { opacity: 0.8; transform: scale(2); }
        }
        
        @keyframes ceo-glow-think {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        
        @keyframes ceo-star-rotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(0.95); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes ceo-star-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        
        @keyframes ceo-star-breathe {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes ceo-shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          50% { transform: translateX(100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
