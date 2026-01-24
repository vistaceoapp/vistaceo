import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
  showStatus?: boolean;
}

const sizeMap = {
  sm: { container: 44, logoSize: 18, ringWidth: 2 },
  md: { container: 64, logoSize: 26, ringWidth: 2.5 },
  lg: { container: 88, logoSize: 36, ringWidth: 3 },
  xl: { container: 120, logoSize: 48, ringWidth: 4 },
  hero: { container: 160, logoSize: 64, ringWidth: 5 },
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  className,
  showStatus = true,
}: CEOAvatarProps) => {
  const dimensions = sizeMap[size];
  const isActive = isThinking || isSpeaking;
  const statusText = isSpeaking ? "Hablando..." : isThinking ? "Pensando..." : "";

  return (
    <div className={cn("relative flex flex-col items-center gap-2", className)}>
      {/* Avatar container */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center"
        style={{
          width: dimensions.container,
          height: dimensions.container,
        }}
      >
        {/* Ambient glow - always visible, stronger when active */}
        <div
          className={cn(
            "absolute inset-[-20%] rounded-full blur-2xl transition-all duration-700",
            isActive ? "opacity-60" : "opacity-25"
          )}
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.2) 50%, transparent 70%)`,
          }}
        />

        {/* Outer rotating ring 1 */}
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            isSpeaking ? "ceo-ring-speaking" : isThinking ? "ceo-ring-thinking" : "ceo-ring-idle"
          )}
          style={{
            background: `conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.8), transparent, hsl(var(--primary) / 0.4), transparent)`,
            padding: dimensions.ringWidth,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${dimensions.ringWidth}px), #fff calc(100% - ${dimensions.ringWidth}px))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${dimensions.ringWidth}px), #fff calc(100% - ${dimensions.ringWidth}px))`,
          }}
        />

        {/* Outer rotating ring 2 (counter-rotation) */}
        <div
          className={cn(
            "absolute inset-[8%] rounded-full",
            isSpeaking ? "ceo-ring-speaking-reverse" : isThinking ? "ceo-ring-thinking-reverse" : "ceo-ring-idle-reverse"
          )}
          style={{
            background: `conic-gradient(from 180deg, transparent, hsl(var(--primary) / 0.5), transparent, hsl(var(--primary) / 0.3), transparent)`,
            padding: dimensions.ringWidth * 0.7,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${dimensions.ringWidth * 0.7}px), #fff calc(100% - ${dimensions.ringWidth * 0.7}px))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${dimensions.ringWidth * 0.7}px), #fff calc(100% - ${dimensions.ringWidth * 0.7}px))`,
          }}
        />

        {/* Pulsing orb background */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-300",
            isSpeaking ? "ceo-orb-speaking" : isThinking ? "ceo-orb-thinking" : "ceo-orb-idle"
          )}
          style={{
            width: dimensions.container * 0.65,
            height: dimensions.container * 0.65,
            background: `radial-gradient(circle at 30% 30%, 
              hsl(var(--primary) / 0.3), 
              hsl(var(--primary) / 0.15) 50%, 
              hsl(var(--primary) / 0.05) 100%)`,
          }}
        />

        {/* Inner gradient orb */}
        <div
          className={cn(
            "absolute rounded-full",
            isSpeaking && "ceo-inner-speaking"
          )}
          style={{
            width: dimensions.container * 0.55,
            height: dimensions.container * 0.55,
            background: `
              radial-gradient(circle at 35% 35%, 
                hsl(var(--primary) / 0.2), 
                transparent 60%),
              radial-gradient(circle at 65% 65%, 
                hsl(220 70% 50% / 0.15), 
                transparent 50%)
            `,
          }}
        />

        {/* Core logo container */}
        <div
          className={cn(
            "relative z-10 rounded-full flex items-center justify-center",
            "bg-background/95 backdrop-blur-md",
            "shadow-2xl shadow-primary/20",
            "border-2 border-primary/30",
            "transition-all duration-300",
            isSpeaking && "ceo-core-speaking",
            isThinking && "ceo-core-thinking"
          )}
          style={{
            width: dimensions.container * 0.48,
            height: dimensions.container * 0.48,
          }}
        >
          <VistaceoLogo size={dimensions.logoSize} variant="icon" />
        </div>

        {/* Speaking audio waves */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="ceo-audio-wave ceo-audio-wave-1" style={{ width: dimensions.container * 0.7, height: dimensions.container * 0.7 }} />
            <div className="ceo-audio-wave ceo-audio-wave-2" style={{ width: dimensions.container * 0.85, height: dimensions.container * 0.85 }} />
            <div className="ceo-audio-wave ceo-audio-wave-3" style={{ width: dimensions.container, height: dimensions.container }} />
          </div>
        )}

        {/* Speaking indicator dots */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[3px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-full bg-primary ceo-sound-bar"
                style={{
                  width: 3,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Thinking dots */}
        {isThinking && !isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary ceo-thinking-dot"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status text */}
      {showStatus && statusText && size !== "sm" && (
        <span className="text-xs font-medium text-primary animate-pulse">
          {statusText}
        </span>
      )}

      <style>{`
        /* Ring animations */
        .ceo-ring-idle {
          animation: ceo-rotate 12s linear infinite;
        }
        .ceo-ring-idle-reverse {
          animation: ceo-rotate-reverse 15s linear infinite;
        }
        .ceo-ring-thinking {
          animation: ceo-rotate 4s linear infinite;
        }
        .ceo-ring-thinking-reverse {
          animation: ceo-rotate-reverse 5s linear infinite;
        }
        .ceo-ring-speaking {
          animation: ceo-rotate 1.5s linear infinite;
        }
        .ceo-ring-speaking-reverse {
          animation: ceo-rotate-reverse 2s linear infinite;
        }

        @keyframes ceo-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ceo-rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Orb animations */
        .ceo-orb-idle {
          animation: ceo-pulse-slow 4s ease-in-out infinite;
        }
        .ceo-orb-thinking {
          animation: ceo-pulse-medium 2s ease-in-out infinite;
        }
        .ceo-orb-speaking {
          animation: ceo-pulse-fast 0.8s ease-in-out infinite;
        }

        @keyframes ceo-pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes ceo-pulse-medium {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes ceo-pulse-fast {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.12); opacity: 1; }
        }

        /* Inner orb speaking */
        .ceo-inner-speaking {
          animation: ceo-inner-pulse 0.6s ease-in-out infinite;
        }
        @keyframes ceo-inner-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Core animations */
        .ceo-core-speaking {
          animation: ceo-core-beat 0.5s ease-in-out infinite;
        }
        .ceo-core-thinking {
          animation: ceo-core-think 1.5s ease-in-out infinite;
        }
        @keyframes ceo-core-beat {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px hsl(var(--primary) / 0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 30px hsl(var(--primary) / 0.5); }
        }
        @keyframes ceo-core-think {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.97); }
        }

        /* Audio wave rings */
        .ceo-audio-wave {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid hsl(var(--primary) / 0.4);
          animation: ceo-wave-expand 1.5s ease-out infinite;
        }
        .ceo-audio-wave-1 { animation-delay: 0s; }
        .ceo-audio-wave-2 { animation-delay: 0.3s; }
        .ceo-audio-wave-3 { animation-delay: 0.6s; }

        @keyframes ceo-wave-expand {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        /* Sound bars */
        .ceo-sound-bar {
          animation: ceo-sound 0.4s ease-in-out infinite alternate;
        }
        @keyframes ceo-sound {
          from { height: 4px; }
          to { height: 12px; }
        }

        /* Thinking dots */
        .ceo-thinking-dot {
          animation: ceo-dot-bounce 0.6s ease-in-out infinite;
        }
        @keyframes ceo-dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
