import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useTheme } from "@/hooks/use-theme";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
  showStatus?: boolean;
}

const sizeMap = {
  sm: { container: 48, logo: 16, eyeSize: 3, mouthWidth: 10 },
  md: { container: 72, logo: 22, eyeSize: 4, mouthWidth: 14 },
  lg: { container: 100, logo: 28, eyeSize: 5, mouthWidth: 18 },
  xl: { container: 140, logo: 36, eyeSize: 7, mouthWidth: 24 },
  hero: { container: 180, logo: 48, eyeSize: 9, mouthWidth: 30 },
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  className,
  showStatus = true,
}: CEOAvatarProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const dims = sizeMap[size];
  const isActive = isThinking || isSpeaking;
  const statusText = isSpeaking ? "Hablando..." : isThinking ? "Pensando..." : "";

  return (
    <div className={cn("relative flex flex-col items-center gap-2", className)}>
      {/* Main Avatar Container */}
      <div
        className="relative flex-shrink-0"
        style={{ width: dims.container, height: dims.container }}
      >
        {/* Ambient Background Glow */}
        <div
          className={cn(
            "absolute inset-[-30%] rounded-full blur-3xl transition-all duration-1000",
            isSpeaking ? "ceo-glow-speaking" : isThinking ? "ceo-glow-thinking" : "ceo-glow-idle"
          )}
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.3) 40%, transparent 70%)`,
          }}
        />

        {/* Outer Particle Ring */}
        <div className="absolute inset-[-15%] ceo-particle-ring">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/60 ceo-particle"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateY(-${dims.container * 0.55}px)`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Primary Rotating Gradient Ring */}
        <svg
          className={cn(
            "absolute inset-0 w-full h-full",
            isSpeaking ? "ceo-ring-fast" : isThinking ? "ceo-ring-medium" : "ceo-ring-slow"
          )}
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(204, 79%, 50%)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(254, 61%, 67%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(204, 79%, 50%)" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="ringGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(254, 61%, 67%)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="hsl(204, 79%, 50%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(254, 61%, 67%)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="1.5"
            strokeDasharray="60 30 10 30"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#ringGradient2)"
            strokeWidth="1"
            strokeDasharray="40 20 5 20"
            strokeLinecap="round"
            className="ceo-ring-counter"
          />
        </svg>

        {/* Secondary Pulsing Ring */}
        <div
          className={cn(
            "absolute rounded-full border transition-all duration-500",
            isSpeaking ? "ceo-pulse-fast border-primary/50" : 
            isThinking ? "ceo-pulse-medium border-accent/40" : 
            "ceo-pulse-slow border-primary/20"
          )}
          style={{
            inset: '8%',
          }}
        />

        {/* Inner Gradient Orb */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-700",
            isSpeaking ? "ceo-orb-speaking" : isThinking ? "ceo-orb-thinking" : "ceo-orb-idle"
          )}
          style={{
            inset: '12%',
            background: isDark
              ? `radial-gradient(circle at 35% 35%, 
                  hsl(var(--primary) / 0.25), 
                  hsl(var(--accent) / 0.15) 50%, 
                  hsl(var(--background) / 0.9) 100%)`
              : `radial-gradient(circle at 35% 35%, 
                  hsl(var(--primary) / 0.2), 
                  hsl(var(--accent) / 0.1) 50%, 
                  hsl(var(--card)) 100%)`,
          }}
        />

        {/* AI Face Container */}
        <div
          className="absolute rounded-full overflow-hidden backdrop-blur-xl flex items-center justify-center border border-primary/20 transition-all duration-300"
          style={{
            inset: '18%',
            background: isDark 
              ? 'linear-gradient(145deg, hsl(var(--card) / 0.95), hsl(var(--background) / 0.9))'
              : 'linear-gradient(145deg, hsl(var(--card)), hsl(var(--background) / 0.95))',
            boxShadow: isSpeaking 
              ? '0 0 30px hsl(var(--primary) / 0.4), inset 0 0 20px hsl(var(--primary) / 0.1)'
              : isThinking
              ? '0 0 20px hsl(var(--accent) / 0.3), inset 0 0 15px hsl(var(--accent) / 0.05)'
              : '0 0 15px hsl(var(--primary) / 0.15), inset 0 0 10px hsl(var(--primary) / 0.02)',
          }}
        >
          {/* AI Face SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full p-3"
            style={{ filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.2))' }}
          >
            {/* Face Glow Background */}
            <defs>
              <radialGradient id="faceGlow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="hsl(204, 79%, 50%)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(204, 79%, 60%)" />
                <stop offset="100%" stopColor="hsl(254, 61%, 67%)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <circle cx="50" cy="50" r="45" fill="url(#faceGlow)" />

            {/* Left Eye */}
            <g className={cn(isSpeaking ? "ceo-eye-speaking" : isThinking ? "ceo-eye-thinking" : "ceo-eye-idle")}>
              <ellipse
                cx="35"
                cy="42"
                rx="8"
                ry={isSpeaking ? "6" : isThinking ? "4" : "5"}
                fill="url(#eyeGradient)"
                filter="url(#glow)"
                className="transition-all duration-300"
              />
              <ellipse
                cx="35"
                cy="42"
                rx="4"
                ry={isSpeaking ? "3" : isThinking ? "2" : "2.5"}
                fill="hsl(var(--primary-foreground))"
                className="transition-all duration-300"
              />
              {/* Eye sparkle */}
              <circle cx="37" cy="40" r="1.5" fill="hsl(var(--primary-foreground))" opacity="0.8" />
            </g>

            {/* Right Eye */}
            <g className={cn(isSpeaking ? "ceo-eye-speaking" : isThinking ? "ceo-eye-thinking" : "ceo-eye-idle")}>
              <ellipse
                cx="65"
                cy="42"
                rx="8"
                ry={isSpeaking ? "6" : isThinking ? "4" : "5"}
                fill="url(#eyeGradient)"
                filter="url(#glow)"
                className="transition-all duration-300"
              />
              <ellipse
                cx="65"
                cy="42"
                rx="4"
                ry={isSpeaking ? "3" : isThinking ? "2" : "2.5"}
                fill="hsl(var(--primary-foreground))"
                className="transition-all duration-300"
              />
              {/* Eye sparkle */}
              <circle cx="67" cy="40" r="1.5" fill="hsl(var(--primary-foreground))" opacity="0.8" />
            </g>

            {/* AI Circuit Lines */}
            <g stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3" fill="none">
              <path d="M 50 30 L 50 25 M 50 25 L 45 20 M 50 25 L 55 20" />
              <path d="M 25 50 L 20 50 M 20 50 L 15 45 M 20 50 L 15 55" />
              <path d="M 75 50 L 80 50 M 80 50 L 85 45 M 80 50 L 85 55" />
            </g>

            {/* Mouth / Voice Visualizer */}
            <g className={cn(isSpeaking ? "ceo-mouth-speaking" : "ceo-mouth-idle")}>
              {isSpeaking ? (
                // Speaking: Animated wave mouth
                <g transform="translate(50, 65)">
                  {[-12, -6, 0, 6, 12].map((x, i) => (
                    <rect
                      key={i}
                      x={x - 2}
                      y={-4}
                      width="4"
                      height="8"
                      rx="2"
                      fill="url(#eyeGradient)"
                      className="ceo-voice-bar"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </g>
              ) : isThinking ? (
                // Thinking: Subtle line
                <ellipse
                  cx="50"
                  cy="65"
                  rx="10"
                  ry="2"
                  fill="hsl(var(--muted-foreground))"
                  opacity="0.5"
                />
              ) : (
                // Idle: Subtle smile
                <path
                  d="M 38 62 Q 50 72 62 62"
                  fill="none"
                  stroke="url(#eyeGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Forehead Logo Mark */}
            <g transform="translate(50, 28)" opacity="0.6">
              <circle r="6" fill="none" stroke="url(#eyeGradient)" strokeWidth="1" />
              <circle r="3" fill="url(#eyeGradient)" />
            </g>
          </svg>
        </div>

        {/* Floating Logo Badge */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-lg border transition-all duration-300",
            "bg-card border-primary/30",
            isSpeaking && "ceo-badge-pulse"
          )}
          style={{
            boxShadow: '0 4px 15px hsl(var(--primary) / 0.25)',
          }}
        >
          <VistaceoLogo size={dims.logo * 0.6} variant="icon" />
        </div>

        {/* Speaking Audio Waves */}
        {isSpeaking && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-primary/40 ceo-audio-wave"
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </>
        )}

        {/* Thinking Orbital Dots */}
        {isThinking && (
          <div className="absolute inset-0 ceo-orbital">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full ceo-orbital-dot"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 120}deg) translateY(-${dims.container * 0.6}px)`,
                  animationDelay: `${i * 0.3}s`,
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
        /* Glow Animations */
        .ceo-glow-idle {
          opacity: 0.4;
          animation: ceo-breathe 4s ease-in-out infinite;
        }
        .ceo-glow-thinking {
          opacity: 0.6;
          animation: ceo-breathe 2s ease-in-out infinite;
        }
        .ceo-glow-speaking {
          opacity: 0.8;
          animation: ceo-pulse-glow 0.6s ease-in-out infinite;
        }

        @keyframes ceo-breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        @keyframes ceo-pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }

        /* Ring Rotations */
        .ceo-ring-slow { animation: ceo-spin 20s linear infinite; }
        .ceo-ring-medium { animation: ceo-spin 8s linear infinite; }
        .ceo-ring-fast { animation: ceo-spin 3s linear infinite; }
        .ceo-ring-counter { animation: ceo-spin-reverse 15s linear infinite; }

        @keyframes ceo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ceo-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Pulse Animations */
        .ceo-pulse-slow {
          animation: ceo-border-pulse 4s ease-in-out infinite;
        }
        .ceo-pulse-medium {
          animation: ceo-border-pulse 2s ease-in-out infinite;
        }
        .ceo-pulse-fast {
          animation: ceo-border-pulse 0.8s ease-in-out infinite;
        }

        @keyframes ceo-border-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }

        /* Orb Animations */
        .ceo-orb-idle {
          animation: ceo-orb-breathe 5s ease-in-out infinite;
        }
        .ceo-orb-thinking {
          animation: ceo-orb-breathe 2.5s ease-in-out infinite;
        }
        .ceo-orb-speaking {
          animation: ceo-orb-pulse 0.5s ease-in-out infinite;
        }

        @keyframes ceo-orb-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes ceo-orb-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        /* Eye Animations */
        .ceo-eye-idle {
          animation: ceo-eye-blink 4s ease-in-out infinite;
        }
        .ceo-eye-thinking {
          animation: ceo-eye-scan 2s ease-in-out infinite;
        }
        .ceo-eye-speaking {
          animation: ceo-eye-focus 0.3s ease-in-out infinite;
        }

        @keyframes ceo-eye-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes ceo-eye-scan {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes ceo-eye-focus {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Voice Bars */
        .ceo-voice-bar {
          animation: ceo-voice 0.3s ease-in-out infinite alternate;
          transform-origin: center;
        }
        @keyframes ceo-voice {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.2); }
        }

        /* Audio Waves */
        .ceo-audio-wave {
          animation: ceo-wave-expand 1.5s ease-out infinite;
        }
        @keyframes ceo-wave-expand {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* Orbital Animation */
        .ceo-orbital {
          animation: ceo-spin 3s linear infinite;
        }
        .ceo-orbital-dot {
          animation: ceo-orbital-pulse 1s ease-in-out infinite;
        }
        @keyframes ceo-orbital-pulse {
          0%, 100% { transform: rotate(var(--rotation, 0deg)) translateY(var(--translate, -30px)) scale(1); opacity: 0.8; }
          50% { transform: rotate(var(--rotation, 0deg)) translateY(var(--translate, -30px)) scale(1.3); opacity: 1; }
        }

        /* Particle Ring */
        .ceo-particle-ring {
          animation: ceo-spin-reverse 30s linear infinite;
        }
        .ceo-particle {
          animation: ceo-particle-twinkle 2s ease-in-out infinite;
        }
        @keyframes ceo-particle-twinkle {
          0%, 100% { opacity: 0.3; transform: rotate(var(--rotation, 0deg)) translateY(var(--translate, -30px)) scale(0.8); }
          50% { opacity: 0.8; transform: rotate(var(--rotation, 0deg)) translateY(var(--translate, -30px)) scale(1.2); }
        }

        /* Badge Pulse */
        .ceo-badge-pulse {
          animation: ceo-badge-glow 0.8s ease-in-out infinite;
        }
        @keyframes ceo-badge-glow {
          0%, 100% { box-shadow: 0 4px 15px hsl(var(--primary) / 0.25); }
          50% { box-shadow: 0 4px 25px hsl(var(--primary) / 0.5); }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .ceo-glow-idle, .ceo-glow-thinking, .ceo-glow-speaking,
          .ceo-ring-slow, .ceo-ring-medium, .ceo-ring-fast, .ceo-ring-counter,
          .ceo-pulse-slow, .ceo-pulse-medium, .ceo-pulse-fast,
          .ceo-orb-idle, .ceo-orb-thinking, .ceo-orb-speaking,
          .ceo-eye-idle, .ceo-eye-thinking, .ceo-eye-speaking,
          .ceo-voice-bar, .ceo-audio-wave, .ceo-orbital, .ceo-orbital-dot,
          .ceo-particle-ring, .ceo-particle, .ceo-badge-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
