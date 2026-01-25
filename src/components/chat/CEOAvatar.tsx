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
  sm: { container: 48, face: 32, eyeSize: 2.5 },
  md: { container: 80, face: 54, eyeSize: 3.5 },
  lg: { container: 120, face: 80, eyeSize: 5 },
  xl: { container: 160, face: 110, eyeSize: 6.5 },
  hero: { container: 200, face: 140, eyeSize: 8 },
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  className,
  showStatus = true,
}: CEOAvatarProps) => {
  const dims = sizeMap[size];
  const statusText = isSpeaking ? "Hablando..." : isThinking ? "Pensando..." : "";

  return (
    <div className={cn("relative flex flex-col items-center gap-2", className)}>
      {/* Main Avatar Container */}
      <div
        className="relative flex-shrink-0"
        style={{ width: dims.container, height: dims.container }}
      >
        {/* Ambient Glow Background */}
        <div
          className={cn(
            "absolute inset-[-25%] rounded-full blur-2xl transition-all duration-700",
            isSpeaking ? "ceo-glow-active" : isThinking ? "ceo-glow-think" : "ceo-glow-idle"
          )}
        />

        {/* Outer Rotating Ring 1 */}
        <svg
          className={cn(
            "absolute inset-0 w-full h-full",
            isSpeaking ? "ceo-ring-fast" : isThinking ? "ceo-ring-med" : "ceo-ring-slow"
          )}
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="ceoRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2692DC" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#746CE6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2692DC" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="48"
            fill="none"
            stroke="url(#ceoRingGrad1)"
            strokeWidth="1"
            strokeDasharray="20 10 5 10"
            strokeLinecap="round"
          />
        </svg>

        {/* Outer Rotating Ring 2 (counter) */}
        <svg
          className="absolute inset-0 w-full h-full ceo-ring-counter"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="ceoRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#746CE6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#2692DC" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="url(#ceoRingGrad2)"
            strokeWidth="0.75"
            strokeDasharray="15 8 3 8"
            strokeLinecap="round"
          />
        </svg>

        {/* Inner Pulsing Ring */}
        <div
          className={cn(
            "absolute rounded-full border transition-all",
            isSpeaking 
              ? "border-primary/60 ceo-pulse-fast" 
              : isThinking 
              ? "border-accent/50 ceo-pulse-med" 
              : "border-primary/20 ceo-pulse-slow"
          )}
          style={{ inset: "10%" }}
        />

        {/* Face Container - The CEO Character */}
        <div
          className="absolute rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{
            inset: "14%",
            background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--background)))",
            boxShadow: isSpeaking
              ? "0 0 40px hsl(var(--primary) / 0.5), inset 0 -8px 20px hsl(var(--primary) / 0.15)"
              : isThinking
              ? "0 0 25px hsl(var(--accent) / 0.4), inset 0 -6px 15px hsl(var(--accent) / 0.1)"
              : "0 0 15px hsl(var(--primary) / 0.2), inset 0 -4px 10px hsl(var(--primary) / 0.05)",
          }}
        >
          {/* CEO Face SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ padding: "15%" }}
          >
            <defs>
              {/* Eye Gradient */}
              <linearGradient id="ceoEyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2692DC" />
                <stop offset="100%" stopColor="#746CE6" />
              </linearGradient>
              {/* Glow Filter */}
              <filter id="ceoGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Radial Glow for Face */}
              <radialGradient id="ceoFaceGlow" cx="50%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#2692DC" stopOpacity="0.12" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Face Background Glow */}
            <circle cx="50" cy="50" r="45" fill="url(#ceoFaceGlow)" />

            {/* Forehead Symbol - VistaCEO Mark */}
            <g className="ceo-forehead" opacity="0.7">
              <circle cx="50" cy="22" r="8" fill="none" stroke="url(#ceoEyeGrad)" strokeWidth="1.5" />
              <circle cx="50" cy="22" r="4" fill="url(#ceoEyeGrad)" />
              {/* Inner detail */}
              <circle cx="50" cy="22" r="2" fill="hsl(var(--background))" opacity="0.5" />
            </g>

            {/* Left Eye */}
            <g className={cn(
              "ceo-eye",
              isSpeaking ? "ceo-eye-speaking" : isThinking ? "ceo-eye-thinking" : "ceo-eye-idle"
            )}>
              {/* Eye Outer */}
              <ellipse
                cx="35"
                cy="45"
                rx="10"
                ry={isSpeaking ? "8" : isThinking ? "5" : "7"}
                fill="url(#ceoEyeGrad)"
                filter="url(#ceoGlow)"
                className="transition-all duration-300"
              />
              {/* Eye Inner (Iris) */}
              <ellipse
                cx="35"
                cy="45"
                rx="5"
                ry={isSpeaking ? "4" : isThinking ? "2.5" : "3.5"}
                fill="hsl(var(--background))"
                className="transition-all duration-300"
              />
              {/* Pupil */}
              <ellipse
                cx="35"
                cy="45"
                rx="2.5"
                ry={isSpeaking ? "2" : isThinking ? "1.25" : "1.75"}
                fill="url(#ceoEyeGrad)"
                className="transition-all duration-300"
              />
              {/* Sparkle */}
              <circle cx="37" cy="43" r="1.5" fill="hsl(var(--background))" opacity="0.9" />
            </g>

            {/* Right Eye */}
            <g className={cn(
              "ceo-eye",
              isSpeaking ? "ceo-eye-speaking" : isThinking ? "ceo-eye-thinking" : "ceo-eye-idle"
            )}>
              {/* Eye Outer */}
              <ellipse
                cx="65"
                cy="45"
                rx="10"
                ry={isSpeaking ? "8" : isThinking ? "5" : "7"}
                fill="url(#ceoEyeGrad)"
                filter="url(#ceoGlow)"
                className="transition-all duration-300"
              />
              {/* Eye Inner (Iris) */}
              <ellipse
                cx="65"
                cy="45"
                rx="5"
                ry={isSpeaking ? "4" : isThinking ? "2.5" : "3.5"}
                fill="hsl(var(--background))"
                className="transition-all duration-300"
              />
              {/* Pupil */}
              <ellipse
                cx="65"
                cy="45"
                rx="2.5"
                ry={isSpeaking ? "2" : isThinking ? "1.25" : "1.75"}
                fill="url(#ceoEyeGrad)"
                className="transition-all duration-300"
              />
              {/* Sparkle */}
              <circle cx="67" cy="43" r="1.5" fill="hsl(var(--background))" opacity="0.9" />
            </g>

            {/* Eyebrows - Express emotion */}
            <g className="ceo-brows" stroke="url(#ceoEyeGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6">
              <path 
                d={isThinking ? "M 25 35 Q 35 32 45 35" : isSpeaking ? "M 25 33 Q 35 30 45 33" : "M 25 34 Q 35 31 45 34"} 
                className="transition-all duration-300"
              />
              <path 
                d={isThinking ? "M 55 35 Q 65 32 75 35" : isSpeaking ? "M 55 33 Q 65 30 75 33" : "M 55 34 Q 65 31 75 34"} 
                className="transition-all duration-300"
              />
            </g>

            {/* Mouth / Voice Visualizer */}
            <g className="ceo-mouth">
              {isSpeaking ? (
                /* Speaking: Animated Voice Bars */
                <g transform="translate(50, 70)">
                  {[-14, -7, 0, 7, 14].map((x, i) => (
                    <rect
                      key={i}
                      x={x - 2.5}
                      y={-6}
                      width="5"
                      height="12"
                      rx="2.5"
                      fill="url(#ceoEyeGrad)"
                      className="ceo-voice-bar"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </g>
              ) : isThinking ? (
                /* Thinking: Contemplative line */
                <ellipse
                  cx="50"
                  cy="70"
                  rx="12"
                  ry="3"
                  fill="hsl(var(--muted-foreground))"
                  opacity="0.4"
                  className="ceo-think-mouth"
                />
              ) : (
                /* Idle: Friendly smile */
                <path
                  d="M 35 68 Q 50 80 65 68"
                  fill="none"
                  stroke="url(#ceoEyeGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="ceo-smile"
                />
              )}
            </g>

            {/* Cheek Highlights */}
            <circle cx="25" cy="58" r="5" fill="hsl(var(--primary))" opacity="0.08" />
            <circle cx="75" cy="58" r="5" fill="hsl(var(--accent))" opacity="0.08" />

            {/* Side Circuit Details */}
            <g stroke="url(#ceoEyeGrad)" strokeWidth="0.5" opacity="0.25" fill="none">
              <path d="M 15 50 L 10 50 L 10 45 M 10 50 L 10 55" />
              <path d="M 85 50 L 90 50 L 90 45 M 90 50 L 90 55" />
            </g>
          </svg>
        </div>

        {/* Logo Badge */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-lg border transition-all duration-300",
            "bg-card border-primary/40",
            isSpeaking && "ceo-badge-glow"
          )}
          style={{
            boxShadow: "0 4px 15px hsl(var(--primary) / 0.3)",
          }}
        >
          <VistaceoLogo size={dims.container * 0.12} variant="icon" />
        </div>

        {/* Speaking Audio Waves */}
        {isSpeaking && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-primary/50 ceo-wave"
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            ))}
          </>
        )}

        {/* Thinking Orbital Particles */}
        {isThinking && (
          <div className="absolute inset-0 ceo-orbital">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full ceo-orbital-dot"
                style={{
                  background: "linear-gradient(135deg, #2692DC, #746CE6)",
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${i * 120}deg) translateY(-${dims.container * 0.55}px)`,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Text */}
      {showStatus && statusText && size !== "sm" && (
        <span className="text-xs font-medium text-primary animate-pulse">
          {statusText}
        </span>
      )}

      <style>{`
        /* === GLOWS === */
        .ceo-glow-idle {
          background: radial-gradient(circle, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.15) 50%, transparent 70%);
          opacity: 0.5;
          animation: ceo-breathe 4s ease-in-out infinite;
        }
        .ceo-glow-think {
          background: radial-gradient(circle, hsl(var(--accent) / 0.5), hsl(var(--primary) / 0.2) 50%, transparent 70%);
          opacity: 0.7;
          animation: ceo-breathe 2s ease-in-out infinite;
        }
        .ceo-glow-active {
          background: radial-gradient(circle, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.3) 50%, transparent 70%);
          opacity: 0.9;
          animation: ceo-pulse 0.5s ease-in-out infinite;
        }

        @keyframes ceo-breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.08); opacity: 0.6; }
        }
        @keyframes ceo-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.12); opacity: 1; }
        }

        /* === RINGS === */
        .ceo-ring-slow { animation: ceo-spin 25s linear infinite; }
        .ceo-ring-med { animation: ceo-spin 10s linear infinite; }
        .ceo-ring-fast { animation: ceo-spin 4s linear infinite; }
        .ceo-ring-counter { animation: ceo-spin-rev 18s linear infinite; }

        @keyframes ceo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ceo-spin-rev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* === PULSE RINGS === */
        .ceo-pulse-slow { animation: ceo-border-pulse 4s ease-in-out infinite; }
        .ceo-pulse-med { animation: ceo-border-pulse 2s ease-in-out infinite; }
        .ceo-pulse-fast { animation: ceo-border-pulse 0.7s ease-in-out infinite; }

        @keyframes ceo-border-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.04); opacity: 0.7; }
        }

        /* === EYES === */
        .ceo-eye-idle { animation: ceo-blink 4s ease-in-out infinite; }
        .ceo-eye-thinking { animation: ceo-scan 2.5s ease-in-out infinite; }
        .ceo-eye-speaking { animation: ceo-focus 0.4s ease-in-out infinite; }

        @keyframes ceo-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }
        @keyframes ceo-scan {
          0%, 100% { transform: translateX(0); }
          30% { transform: translateX(-3px); }
          70% { transform: translateX(3px); }
        }
        @keyframes ceo-focus {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        /* === VOICE BARS === */
        .ceo-voice-bar {
          animation: ceo-voice 0.25s ease-in-out infinite alternate;
          transform-origin: center;
        }
        @keyframes ceo-voice {
          0% { transform: scaleY(0.35); }
          100% { transform: scaleY(1.3); }
        }

        /* === SMILE === */
        .ceo-smile {
          animation: ceo-smile-float 3s ease-in-out infinite;
        }
        @keyframes ceo-smile-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }

        /* === THINKING MOUTH === */
        .ceo-think-mouth {
          animation: ceo-think-morph 2s ease-in-out infinite;
        }
        @keyframes ceo-think-morph {
          0%, 100% { rx: 12; ry: 3; }
          50% { rx: 8; ry: 4; }
        }

        /* === AUDIO WAVES === */
        .ceo-wave {
          animation: ceo-wave-expand 1.2s ease-out infinite;
        }
        @keyframes ceo-wave-expand {
          0% { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        /* === ORBITAL === */
        .ceo-orbital {
          animation: ceo-spin 3.5s linear infinite;
        }
        .ceo-orbital-dot {
          animation: ceo-dot-pulse 1.2s ease-in-out infinite;
        }
        @keyframes ceo-dot-pulse {
          0%, 100% { transform: rotate(var(--rotation, 0deg)) translateY(var(--translate, -30px)) scale(0.8); opacity: 0.6; }
          50% { transform: rotate(var(--rotation, 0deg)) translateY(var(--translate, -30px)) scale(1.4); opacity: 1; }
        }

        /* === BADGE GLOW === */
        .ceo-badge-glow {
          animation: ceo-badge-pulse 0.6s ease-in-out infinite;
        }
        @keyframes ceo-badge-pulse {
          0%, 100% { box-shadow: 0 4px 15px hsl(var(--primary) / 0.3); }
          50% { box-shadow: 0 4px 25px hsl(var(--primary) / 0.5), 0 0 15px hsl(var(--primary) / 0.3); }
        }

        /* === REDUCED MOTION === */
        @media (prefers-reduced-motion: reduce) {
          .ceo-glow-idle, .ceo-glow-think, .ceo-glow-active,
          .ceo-ring-slow, .ceo-ring-med, .ceo-ring-fast, .ceo-ring-counter,
          .ceo-pulse-slow, .ceo-pulse-med, .ceo-pulse-fast,
          .ceo-eye-idle, .ceo-eye-thinking, .ceo-eye-speaking,
          .ceo-voice-bar, .ceo-smile, .ceo-think-mouth,
          .ceo-wave, .ceo-orbital, .ceo-orbital-dot, .ceo-badge-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CEOAvatar;
