import { useMemo } from "react";
import { cn } from "@/lib/utils";
import starAvatar from "@/assets/brand/star-avatar.png";

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
  lg: 56,
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
      {/* Deep Ambient Glow Layer */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(38, 146, 220, 0.5) 0%, rgba(116, 108, 230, 0.3) 50%, transparent 70%)",
          transform: "scale(2.5)",
          animation: state === "speaking" 
            ? "avatar-glow-speak 0.6s ease-in-out infinite" 
            : state === "thinking"
            ? "avatar-glow-think 1.2s ease-in-out infinite"
            : "avatar-glow-idle 4s ease-in-out infinite",
        }}
      />

      {/* Secondary Glow Ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59, 184, 195, 0.4) 0%, transparent 60%)",
          transform: "scale(1.8)",
          animation: state === "thinking" 
            ? "avatar-ring-rotate 3s linear infinite"
            : "avatar-ring-breathe 5s ease-in-out infinite",
        }}
      />

      {/* Speaking Ripple Waves */}
      {state === "speaking" && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle, transparent 40%, rgba(38, 146, 220, 0.25) 50%, transparent 60%)",
                animation: "avatar-ripple 1.8s ease-out infinite",
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Main Star Image Container */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: state === "thinking"
            ? "avatar-star-rotate 2.5s ease-in-out infinite"
            : state === "speaking"
            ? "avatar-star-bounce 0.5s ease-in-out infinite"
            : "avatar-star-float 4s ease-in-out infinite",
        }}
      >
        {/* Star Image */}
        <img
          src={starAvatar}
          alt="VISTA CEO"
          className="w-full h-full object-contain"
          style={{
            filter: `
              drop-shadow(0 0 ${dims * 0.1}px rgba(38, 146, 220, 0.9))
              drop-shadow(0 0 ${dims * 0.2}px rgba(116, 108, 230, 0.6))
              drop-shadow(0 0 ${dims * 0.4}px rgba(59, 184, 195, 0.4))
            `,
            transform: "scale(0.85)",
          }}
        />
      </div>

      {/* Shimmer Effect */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ borderRadius: "30%" }}
      >
        <div
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
          style={{
            background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            animation: "avatar-shimmer 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        /* === IDLE STATE === */
        @keyframes avatar-glow-idle {
          0%, 100% { 
            opacity: 0.5; 
            transform: scale(2.5); 
          }
          50% { 
            opacity: 0.7; 
            transform: scale(2.8); 
          }
        }
        
        @keyframes avatar-star-float {
          0%, 100% { 
            transform: translateY(0) scale(1); 
          }
          25% { 
            transform: translateY(-2px) scale(1.01); 
          }
          50% { 
            transform: translateY(-4px) scale(1.02); 
          }
          75% { 
            transform: translateY(-2px) scale(1.01); 
          }
        }
        
        @keyframes avatar-core-breathe {
          0%, 100% { 
            opacity: 0.7; 
            transform: translate(-50%, -50%) scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.3); 
          }
        }
        
        @keyframes avatar-ring-breathe {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1.8) rotate(0deg); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(2) rotate(3deg); 
          }
        }
        
        /* === THINKING STATE === */
        @keyframes avatar-glow-think {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(2.5); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(3); 
          }
        }
        
        @keyframes avatar-star-rotate {
          0% { 
            transform: rotate(0deg) scale(1); 
          }
          25% { 
            transform: rotate(90deg) scale(1.05); 
          }
          50% { 
            transform: rotate(180deg) scale(1); 
          }
          75% { 
            transform: rotate(270deg) scale(1.05); 
          }
          100% { 
            transform: rotate(360deg) scale(1); 
          }
        }
        
        @keyframes avatar-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes avatar-particle-float {
          0%, 100% { 
            opacity: 0.6; 
            transform: rotate(inherit) translateY(-${dims * 0.8}px) scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: rotate(inherit) translateY(-${dims * 0.9}px) scale(1.5); 
          }
        }
        
        @keyframes avatar-ring-rotate {
          0% { 
            transform: scale(1.8) rotate(0deg); 
            opacity: 0.4; 
          }
          50% { 
            opacity: 0.6; 
          }
          100% { 
            transform: scale(1.8) rotate(360deg); 
            opacity: 0.4; 
          }
        }
        
        @keyframes avatar-core-pulse-think {
          0%, 100% { 
            opacity: 0.5; 
            transform: translate(-50%, -50%) scale(0.8); 
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.5); 
          }
        }
        
        /* === SPEAKING STATE === */
        @keyframes avatar-glow-speak {
          0%, 100% { 
            opacity: 0.5; 
            transform: scale(2.5); 
          }
          50% { 
            opacity: 0.9; 
            transform: scale(3.2); 
          }
        }
        
        @keyframes avatar-star-bounce {
          0%, 100% { 
            transform: scale(1); 
          }
          25% { 
            transform: scale(1.08); 
          }
          50% { 
            transform: scale(0.95); 
          }
          75% { 
            transform: scale(1.05); 
          }
        }
        
        @keyframes avatar-ripple {
          0% { 
            transform: scale(0.8); 
            opacity: 0.6; 
          }
          100% { 
            transform: scale(2.5); 
            opacity: 0; 
          }
        }
        
        @keyframes avatar-core-pulse-speak {
          0%, 100% { 
            opacity: 0.8; 
            transform: translate(-50%, -50%) scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.8); 
          }
        }
        
        /* === SHIMMER === */
        @keyframes avatar-shimmer {
          0% { 
            transform: translateX(-100%) translateY(-100%) rotate(45deg); 
          }
          100% { 
            transform: translateX(100%) translateY(100%) rotate(45deg); 
          }
        }
        
        /* === ACCESSIBILITY === */
        @media (prefers-reduced-motion: reduce) {
          * { 
            animation-duration: 0.01ms !important; 
            animation-iteration-count: 1 !important; 
          }
        }
      `}</style>
    </div>
  );
};
