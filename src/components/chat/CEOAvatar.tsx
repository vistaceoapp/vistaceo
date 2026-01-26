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
        className="absolute inset-0 blur-xl opacity-50"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, hsl(var(--accent) / 0.3) 50%, transparent 70%)",
          transform: "scale(2)",
          animation: state === "speaking" 
            ? "star-glow-pulse 0.8s ease-in-out infinite" 
            : state === "thinking"
            ? "star-glow-think 1.5s ease-in-out infinite"
            : "star-glow-idle 4s ease-in-out infinite",
        }}
      />

      {/* Speaking Waves */}
      {state === "speaking" && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                border: "1px solid hsl(var(--primary) / 0.4)",
                borderRadius: "20%",
                transform: "rotate(45deg)",
                animation: `star-wave 1.5s ease-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Main Star SVG */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{
          filter: `drop-shadow(0 0 ${dims * 0.15}px hsl(var(--primary) / 0.6))`,
        }}
      >
        <defs>
          {/* Premium gradient */}
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a365d" />
            <stop offset="30%" stopColor="#2692DC" />
            <stop offset="60%" stopColor="#3BB8C3" />
            <stop offset="100%" stopColor="#746CE6" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="starGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Inner glow */}
          <radialGradient id="starInnerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="40%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 4-Point Star - Main Shape */}
        <g 
          filter="url(#starGlowFilter)"
          style={{ 
            transformOrigin: "50px 50px",
            animation: state === "thinking" 
              ? "star-rotate 2s linear infinite" 
              : state === "speaking"
              ? "star-pulse 0.6s ease-in-out infinite"
              : "star-breathe 3s ease-in-out infinite",
          }}
        >
          {/* Outer star with gradient */}
          <path
            d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z"
            fill="url(#starGradient)"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
          
          {/* Inner highlight */}
          <path
            d="M50 25 L55 45 L75 50 L55 55 L50 75 L45 55 L25 50 L45 45 Z"
            fill="url(#starInnerGlow)"
          />
          
          {/* Core circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="8" 
            fill="white"
            fillOpacity="0.95"
            style={{
              animation: state !== "idle" ? "star-core-pulse 0.8s ease-in-out infinite" : "none",
            }}
          />
        </g>

        {/* Thinking Particles */}
        {state === "thinking" && (
          <g>
            <circle cx="25" cy="30" r="2.5" fill="#3BB8C3">
              <animate attributeName="cy" values="30;18;30" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="75" cy="25" r="2" fill="#746CE6">
              <animate attributeName="cy" values="25;12;25" dur="1.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="18" r="1.5" fill="#2692DC">
              <animate attributeName="cy" values="18;8;18" dur="0.9s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.1;0.9" dur="0.9s" repeatCount="indefinite" />
            </circle>
            <circle cx="30" cy="70" r="1.5" fill="white">
              <animate attributeName="cy" values="70;78;70" dur="1.1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.1s" repeatCount="indefinite" />
            </circle>
            <circle cx="70" cy="75" r="2" fill="#3BB8C3">
              <animate attributeName="cy" values="75;85;75" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>

      {/* CSS Animations */}
      <style>{`
        @keyframes star-wave {
          0% { transform: rotate(45deg) scale(1); opacity: 0.6; }
          100% { transform: rotate(45deg) scale(2.5); opacity: 0; }
        }
        
        @keyframes star-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes star-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        
        @keyframes star-breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.95; }
        }
        
        @keyframes star-core-pulse {
          0%, 100% { r: 8; opacity: 0.95; }
          50% { r: 10; opacity: 1; }
        }
        
        @keyframes star-glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(2); }
          50% { opacity: 0.7; transform: scale(2.3); }
        }
        
        @keyframes star-glow-think {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes star-glow-idle {
          0%, 100% { opacity: 0.4; transform: scale(2); }
          50% { opacity: 0.5; transform: scale(2.1); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
