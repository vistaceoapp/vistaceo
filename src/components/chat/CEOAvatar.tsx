import { cn } from "@/lib/utils";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
  showStatus?: boolean;
}

const sizeMap = {
  sm: { container: 48, fontSize: 8 },
  md: { container: 80, fontSize: 12 },
  lg: { container: 120, fontSize: 16 },
  xl: { container: 160, fontSize: 20 },
  hero: { container: 200, fontSize: 24 },
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
        {/* Ambient Glow */}
        <div
          className={cn(
            "absolute rounded-full blur-2xl transition-all duration-500",
            isSpeaking ? "ceo-glow-speaking" : isThinking ? "ceo-glow-thinking" : "ceo-glow-idle"
          )}
          style={{
            inset: "-30%",
            background: "radial-gradient(circle, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.2) 60%, transparent 80%)",
          }}
        />

        {/* Main Character Body */}
        <svg
          viewBox="0 0 200 200"
          className={cn(
            "w-full h-full relative z-10 transition-transform duration-300",
            isSpeaking && "ceo-bounce",
            isThinking && "ceo-float"
          )}
        >
          <defs>
            {/* Main Gradient - VistaCEO Colors */}
            <linearGradient id="ceoBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3BB8C3" />
              <stop offset="50%" stopColor="#2692DC" />
              <stop offset="100%" stopColor="#746CE6" />
            </linearGradient>

            {/* Highlight Gradient */}
            <radialGradient id="ceoHighlight" cx="30%" cy="20%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Shadow */}
            <filter id="ceoShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#746CE6" floodOpacity="0.3" />
            </filter>

            {/* Glow Filter */}
            <filter id="ceoGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glass Gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="#f0f0f0" />
            </linearGradient>
          </defs>

          {/* Main Body - Blob Shape */}
          <g filter="url(#ceoShadow)">
            <ellipse
              cx="100"
              cy="105"
              rx="75"
              ry="70"
              fill="url(#ceoBodyGrad)"
              className="ceo-body"
            />
            {/* Highlight overlay */}
            <ellipse
              cx="100"
              cy="105"
              rx="75"
              ry="70"
              fill="url(#ceoHighlight)"
            />
          </g>

          {/* Top Blob Accent */}
          <ellipse
            cx="70"
            cy="50"
            rx="25"
            ry="20"
            fill="url(#ceoBodyGrad)"
            opacity="0.9"
          />
          <ellipse
            cx="70"
            cy="50"
            rx="25"
            ry="20"
            fill="url(#ceoHighlight)"
          />

          {/* Glasses Frame */}
          <g className={cn(
            "ceo-glasses",
            isThinking && "ceo-glasses-thinking",
            isSpeaking && "ceo-glasses-speaking"
          )}>
            {/* Glasses Bridge */}
            <line
              x1="90"
              y1="95"
              x2="110"
              y2="95"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Left Glass */}
            <rect
              x="50"
              y="80"
              width="38"
              height="32"
              rx="6"
              fill="url(#glassGrad)"
              stroke="white"
              strokeWidth="2"
              className="ceo-glass-left"
            />

            {/* Right Glass */}
            <rect
              x="112"
              y="80"
              width="38"
              height="32"
              rx="6"
              fill="url(#glassGrad)"
              stroke="white"
              strokeWidth="2"
              className="ceo-glass-right"
            />

            {/* Left Eye */}
            <g className="ceo-eye-left">
              <rect
                x="60"
                y="88"
                width="18"
                height="18"
                rx="3"
                fill="#1a1a2e"
                className={cn(
                  "transition-all duration-200",
                  isThinking && "ceo-eye-squint"
                )}
              />
              {/* Eye Sparkle */}
              <circle cx="65" cy="92" r="3" fill="white" opacity="0.8" />
            </g>

            {/* Right Eye */}
            <g className="ceo-eye-right">
              <rect
                x="122"
                y="88"
                width="18"
                height="18"
                rx="3"
                fill="#1a1a2e"
                className={cn(
                  "transition-all duration-200",
                  isThinking && "ceo-eye-squint"
                )}
              />
              {/* Eye Sparkle */}
              <circle cx="127" cy="92" r="3" fill="white" opacity="0.8" />
            </g>
          </g>

          {/* Mouth */}
          <g className="ceo-mouth">
            {isSpeaking ? (
              /* Speaking - Animated mouth */
              <g transform="translate(100, 140)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx="20"
                  ry="12"
                  fill="white"
                  opacity="0.95"
                  className="ceo-mouth-speaking"
                />
                {/* Voice bars inside mouth */}
                {[-10, -5, 0, 5, 10].map((x, i) => (
                  <rect
                    key={i}
                    x={x - 1.5}
                    y={-6}
                    width="3"
                    height="12"
                    rx="1.5"
                    fill="#746CE6"
                    className="ceo-voice-bar"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </g>
            ) : isThinking ? (
              /* Thinking - Small contemplative mouth */
              <ellipse
                cx="100"
                cy="140"
                rx="10"
                ry="5"
                fill="white"
                opacity="0.8"
                className="ceo-mouth-thinking"
              />
            ) : (
              /* Idle - Friendly smile */
              <path
                d="M 75 135 Q 100 160 125 135"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                className="ceo-smile"
              />
            )}
          </g>

          {/* Cheek Blush */}
          <circle cx="50" cy="120" r="12" fill="#FF6B9D" opacity="0.15" />
          <circle cx="150" cy="120" r="12" fill="#FF6B9D" opacity="0.15" />
        </svg>

        {/* IA Badge */}
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full font-bold text-white shadow-lg transition-all duration-300",
            isSpeaking && "ceo-badge-pulse"
          )}
          style={{
            top: "0%",
            right: "0%",
            width: dims.container * 0.3,
            height: dims.container * 0.3,
            fontSize: dims.fontSize,
            background: "linear-gradient(135deg, #2692DC, #746CE6)",
            boxShadow: "0 4px 15px hsl(var(--primary) / 0.4)",
          }}
        >
          IA
        </div>

        {/* Speaking Audio Waves */}
        {isSpeaking && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-primary/40 ceo-wave"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </>
        )}

        {/* Thinking Sparkles */}
        {isThinking && (
          <div className="absolute inset-0 ceo-sparkles">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full ceo-sparkle"
                style={{
                  background: "linear-gradient(135deg, #2692DC, #746CE6)",
                  top: `${15 + Math.sin(i * 1.2) * 20}%`,
                  left: `${50 + Math.cos(i * 1.5) * 45}%`,
                  animationDelay: `${i * 0.2}s`,
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
        /* === GLOW STATES === */
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
          animation: ceo-pulse-glow 0.5s ease-in-out infinite;
        }

        @keyframes ceo-breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        @keyframes ceo-pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }

        /* === BODY ANIMATIONS === */
        .ceo-bounce {
          animation: ceo-bounce-anim 0.4s ease-in-out infinite;
        }
        .ceo-float {
          animation: ceo-float-anim 3s ease-in-out infinite;
        }

        @keyframes ceo-bounce-anim {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes ceo-float-anim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* === GLASSES ANIMATIONS === */
        .ceo-glasses {
          animation: ceo-glasses-idle 4s ease-in-out infinite;
        }
        .ceo-glasses-thinking {
          animation: ceo-glasses-think 2s ease-in-out infinite;
        }
        .ceo-glasses-speaking {
          animation: ceo-glasses-speak 0.3s ease-in-out infinite;
        }

        @keyframes ceo-glasses-idle {
          0%, 92%, 100% { transform: translateY(0); }
          96% { transform: translateY(2px); }
        }
        @keyframes ceo-glasses-think {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes ceo-glasses-speak {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }

        /* === EYE ANIMATIONS === */
        .ceo-eye-left, .ceo-eye-right {
          animation: ceo-blink 4s ease-in-out infinite;
        }
        .ceo-eye-right {
          animation-delay: 0.1s;
        }
        .ceo-eye-squint rect {
          height: 10px !important;
          y: 93 !important;
        }

        @keyframes ceo-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }

        /* === MOUTH ANIMATIONS === */
        .ceo-smile {
          animation: ceo-smile-float 3s ease-in-out infinite;
        }
        .ceo-mouth-speaking {
          animation: ceo-mouth-open 0.3s ease-in-out infinite;
        }
        .ceo-mouth-thinking {
          animation: ceo-mouth-think 2s ease-in-out infinite;
        }

        @keyframes ceo-smile-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes ceo-mouth-open {
          0%, 100% { ry: 12; }
          50% { ry: 16; }
        }
        @keyframes ceo-mouth-think {
          0%, 100% { rx: 10; ry: 5; }
          50% { rx: 8; ry: 4; }
        }

        /* === VOICE BARS === */
        .ceo-voice-bar {
          animation: ceo-voice 0.2s ease-in-out infinite alternate;
          transform-origin: center;
        }
        @keyframes ceo-voice {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.2); }
        }

        /* === BADGE === */
        .ceo-badge-pulse {
          animation: ceo-badge-anim 0.5s ease-in-out infinite;
        }
        @keyframes ceo-badge-anim {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 15px hsl(var(--primary) / 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 4px 25px hsl(var(--primary) / 0.6); }
        }

        /* === WAVES === */
        .ceo-wave {
          animation: ceo-wave-expand 1.2s ease-out infinite;
        }
        @keyframes ceo-wave-expand {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* === SPARKLES === */
        .ceo-sparkle {
          animation: ceo-sparkle-float 1.5s ease-in-out infinite;
        }
        @keyframes ceo-sparkle-float {
          0%, 100% { 
            transform: translateY(0) scale(0.8); 
            opacity: 0.4; 
          }
          50% { 
            transform: translateY(-10px) scale(1.2); 
            opacity: 1; 
          }
        }

        /* === REDUCED MOTION === */
        @media (prefers-reduced-motion: reduce) {
          .ceo-glow-idle, .ceo-glow-thinking, .ceo-glow-speaking,
          .ceo-bounce, .ceo-float,
          .ceo-glasses, .ceo-glasses-thinking, .ceo-glasses-speaking,
          .ceo-eye-left, .ceo-eye-right,
          .ceo-smile, .ceo-mouth-speaking, .ceo-mouth-thinking,
          .ceo-voice-bar, .ceo-badge-pulse,
          .ceo-wave, .ceo-sparkle {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CEOAvatar;
