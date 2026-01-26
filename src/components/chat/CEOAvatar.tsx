import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  isThinking?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  hasInsight?: boolean;
  isAlert?: boolean;
  isSuccess?: boolean;
  className?: string;
  showStatus?: boolean;
}

const sizeMap = {
  sm: { container: 48, badge: 14, badgeFont: 7 },
  md: { container: 80, badge: 22, badgeFont: 9 },
  lg: { container: 120, badge: 30, badgeFont: 11 },
  xl: { container: 160, badge: 38, badgeFont: 13 },
  hero: { container: 220, badge: 48, badgeFont: 16 },
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  isListening = false,
  hasInsight = false,
  isAlert = false,
  isSuccess = false,
  className,
  showStatus = true,
}: CEOAvatarProps) => {
  const dims = sizeMap[size];

  const state = useMemo(() => {
    if (hasInsight) return "insight";
    if (isSuccess) return "success";
    if (isAlert) return "alert";
    if (isSpeaking) return "speaking";
    if (isThinking) return "thinking";
    if (isListening) return "listening";
    return "idle";
  }, [hasInsight, isSuccess, isAlert, isSpeaking, isThinking, isListening]);

  const statusText = useMemo(() => {
    switch (state) {
      case "speaking": return "Hablando...";
      case "thinking": return "Analizando...";
      case "listening": return "Escuchando...";
      case "insight": return "¡Tengo algo!";
      default: return "";
    }
  }, [state]);

  return (
    <div className={cn("relative flex flex-col items-center gap-2", className)}>
      <div
        className="relative flex-shrink-0"
        style={{ width: dims.container, height: dims.container }}
      >
        {/* Ambient Glow Layer */}
        <div
          className={cn(
            "absolute rounded-full blur-2xl transition-all duration-700",
            state === "idle" && "vista-glow-idle",
            state === "thinking" && "vista-glow-thinking",
            state === "speaking" && "vista-glow-speaking",
            state === "listening" && "vista-glow-listening",
            state === "insight" && "vista-glow-insight",
            state === "success" && "vista-glow-success",
            state === "alert" && "vista-glow-alert"
          )}
          style={{
            inset: "-35%",
            background: state === "insight" 
              ? "radial-gradient(circle, rgba(116,108,230,0.6), rgba(38,146,220,0.3) 60%, transparent 80%)"
              : state === "success"
              ? "radial-gradient(circle, rgba(59,184,195,0.5), rgba(116,108,230,0.3) 60%, transparent 80%)"
              : "radial-gradient(circle, rgba(38,146,220,0.4), rgba(116,108,230,0.2) 60%, transparent 80%)",
          }}
        />

        {/* Success Radial Halo */}
        {state === "success" && (
          <div className="absolute inset-0 vista-success-halo">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-[#3BB8C3]/30"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}
          </div>
        )}

        {/* Main SVG Character */}
        <svg
          viewBox="0 0 200 220"
          className={cn(
            "w-full h-full relative z-10",
            state === "speaking" && "vista-body-speak",
            state === "thinking" && "vista-body-think",
            state === "listening" && "vista-body-listen"
          )}
          style={{ 
            filter: "drop-shadow(0 8px 24px rgba(38,146,220,0.25))",
          }}
        >
          <defs>
            {/* Premium Body Gradient - Diagonal flow */}
            <linearGradient id="vistaBodyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a365d">
                <animate
                  attributeName="stop-color"
                  values="#1a365d;#234876;#1a365d"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="30%" stopColor="#2692DC" />
              <stop offset="60%" stopColor="#3BB8C3" />
              <stop offset="100%" stopColor="#746CE6">
                <animate
                  attributeName="stop-color"
                  values="#746CE6;#8b7cf7;#746CE6"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Skin Gradient - Premium synthetic */}
            <linearGradient id="vistaSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f7f2ed" />
              <stop offset="40%" stopColor="#ebe4dc" />
              <stop offset="100%" stopColor="#ddd5cc" />
            </linearGradient>

            {/* Core Star Glow */}
            <radialGradient id="vistaCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#3BB8C3" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#2692DC" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#746CE6" stopOpacity="0" />
            </radialGradient>

            {/* Eye Iris Gradient */}
            <radialGradient id="vistaIrisGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#4DA8E8" />
              <stop offset="100%" stopColor="#1a5a96" />
            </radialGradient>

            {/* Glass Overlay */}
            <linearGradient id="vistaGlassOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
            </linearGradient>

            {/* Hair Gradient */}
            <linearGradient id="vistaHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d4556" />
              <stop offset="100%" stopColor="#252b38" />
            </linearGradient>

            {/* Filters */}
            <filter id="vistaInnerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.15 0 0 0 0.25 0" />
              <feBlend in2="SourceGraphic" mode="normal" />
            </filter>

            <filter id="vistaGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* === BODY - Diagonal Capsule === */}
          <g filter="url(#vistaInnerShadow)">
            {/* Main Body Shape */}
            <path
              d="M55 210 
                 Q35 185 42 145 
                 L62 95 
                 Q75 75 100 70 
                 Q125 75 138 95 
                 L158 145 
                 Q165 185 145 210 
                 Z"
              fill="url(#vistaBodyGrad)"
              className="vista-body-shape"
            >
              {/* Breathing Animation */}
              <animate
                attributeName="d"
                values="
                  M55 210 Q35 185 42 145 L62 95 Q75 75 100 70 Q125 75 138 95 L158 145 Q165 185 145 210 Z;
                  M53 210 Q33 185 40 143 L60 93 Q73 73 100 68 Q127 73 140 93 L160 143 Q167 185 147 210 Z;
                  M55 210 Q35 185 42 145 L62 95 Q75 75 100 70 Q125 75 138 95 L158 145 Q165 185 145 210 Z
                "
                dur="5s"
                repeatCount="indefinite"
              />
            </path>

            {/* Glass Overlay on Body */}
            <path
              d="M60 205 
                 Q45 183 50 148 
                 L68 100 
                 Q78 83 100 79 
                 Q108 80 112 82
                 L72 140
                 Q50 175 60 205 
                 Z"
              fill="url(#vistaGlassOverlay)"
            />
          </g>

          {/* === INTELLIGENCE CORE - 4-Pointed Star === */}
          <g 
            filter="url(#vistaGlowFilter)"
            className={cn(
              state === "thinking" && "vista-core-think",
              state === "insight" && "vista-core-insight"
            )}
            style={{ transformOrigin: "100px 140px" }}
          >
            {/* Core Glow Background */}
            <circle 
              cx="100" 
              cy="140" 
              r="22" 
              fill="url(#vistaCoreGlow)"
              className={cn(
                state === "idle" && "vista-core-idle",
                state === "speaking" && "vista-core-speak",
                state === "alert" && "vista-core-alert",
                state === "success" && "vista-core-success"
              )}
            />

            {/* 4-Pointed Star - Logo Element */}
            <path
              d="M100 120 
                 L107 133 L122 140 L107 147 
                 L100 160 
                 L93 147 L78 140 L93 133 
                 Z"
              fill="#ffffff"
              opacity="0.97"
              className={cn(state === "success" && "vista-star-twinkle")}
            >
              <animate
                attributeName="opacity"
                values="0.97;1;0.97"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>

            {/* Core Center */}
            <circle cx="100" cy="140" r="5" fill="#3BB8C3" opacity="0.95">
              <animate
                attributeName="r"
                values="5;6;5"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Thinking Micro Particles */}
            {state === "thinking" && (
              <>
                <circle cx="90" cy="132" r="2" fill="#ffffff" opacity="0.7">
                  <animate attributeName="cy" values="132;126;132" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="110" cy="135" r="1.5" fill="#3BB8C3" opacity="0.6">
                  <animate attributeName="cx" values="110;116;110" dur="2.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="152" r="1.8" fill="#746CE6" opacity="0.5">
                  <animate attributeName="cy" values="152;158;152" dur="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </g>

          {/* === HEAD === */}
          <g className={cn(
            state === "listening" && "vista-head-listen",
            state === "speaking" && "vista-head-speak"
          )}>
            {/* Neck */}
            <ellipse cx="100" cy="75" rx="14" ry="10" fill="url(#vistaSkinGrad)" />

            {/* Head Shape */}
            <ellipse 
              cx="100" 
              cy="42" 
              rx="32" 
              ry="38" 
              fill="url(#vistaSkinGrad)"
              filter="url(#vistaInnerShadow)"
            />

            {/* === HAIR === */}
            <path
              d="M68 32 
                 Q68 8 100 5 
                 Q132 8 132 32 
                 Q135 25 128 18 
                 Q115 8 100 7 
                 Q85 8 72 18 
                 Q65 25 68 32
                 Z"
              fill="url(#vistaHairGrad)"
            />
            {/* Hair Shine */}
            <path
              d="M78 18 Q90 12 100 12 Q95 16 82 22 Z"
              fill="#4a5568"
              opacity="0.5"
            />

            {/* === EYEBROWS === */}
            <g className={cn(
              state === "thinking" && "vista-brow-focus",
              state === "alert" && "vista-brow-alert",
              state === "insight" && "vista-brow-insight"
            )}>
              <path
                d="M76 30 Q84 27 92 30"
                stroke="#4a5568"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M108 30 Q116 27 124 30"
                stroke="#4a5568"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* === EYES === */}
            <g className={cn(state === "thinking" && "vista-eyes-focus")}>
              {/* Left Eye */}
              <g>
                <ellipse cx="84" cy="42" rx="10" ry="8" fill="#ffffff" />
                <circle 
                  cx="84" 
                  cy="42" 
                  r="5" 
                  fill="url(#vistaIrisGrad)"
                  className={cn(state === "listening" && "vista-iris-follow")}
                >
                  {state === "idle" && (
                    <animate
                      attributeName="cx"
                      values="84;85;84;83;84"
                      dur="7s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                <circle cx="84" cy="42" r="2.5" fill="#1a365d" />
                {/* Eye Shine */}
                <circle cx="82" cy="40" r="2" fill="#ffffff" opacity="0.85" />
                <circle cx="86" cy="44" r="0.8" fill="#ffffff" opacity="0.5" />
                {/* Blink Eyelid */}
                <ellipse cx="84" cy="42" rx="10" ry="8" fill="url(#vistaSkinGrad)" className="vista-eyelid-left">
                  <animate
                    attributeName="ry"
                    values="0;0;0;0;0;0;0;0;0;0;8;0"
                    dur="5s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              </g>

              {/* Right Eye */}
              <g>
                <ellipse cx="116" cy="42" rx="10" ry="8" fill="#ffffff" />
                <circle 
                  cx="116" 
                  cy="42" 
                  r="5" 
                  fill="url(#vistaIrisGrad)"
                  className={cn(state === "listening" && "vista-iris-follow")}
                >
                  {state === "idle" && (
                    <animate
                      attributeName="cx"
                      values="116;117;116;115;116"
                      dur="7s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                <circle cx="116" cy="42" r="2.5" fill="#1a365d" />
                <circle cx="114" cy="40" r="2" fill="#ffffff" opacity="0.85" />
                <circle cx="118" cy="44" r="0.8" fill="#ffffff" opacity="0.5" />
                <ellipse cx="116" cy="42" rx="10" ry="8" fill="url(#vistaSkinGrad)" className="vista-eyelid-right">
                  <animate
                    attributeName="ry"
                    values="0;0;0;0;0;0;0;0;0;0;8;0"
                    dur="5s"
                    repeatCount="indefinite"
                    begin="0.08s"
                  />
                </ellipse>
              </g>
            </g>

            {/* === NOSE === */}
            <path
              d="M100 48 L100 58 Q97 61 100 62 Q103 61 100 62"
              stroke="#d4c4b5"
              strokeWidth="1.2"
              fill="none"
            />

            {/* === MOUTH === */}
            <g className="vista-mouth">
              {state === "idle" && (
                <path
                  d="M90 66 Q100 71 110 66"
                  stroke="#b8a090"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {state === "thinking" && (
                <path
                  d="M92 67 L108 67"
                  stroke="#b8a090"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {state === "listening" && (
                <ellipse cx="100" cy="67" rx="6" ry="3" fill="#a08070" opacity="0.7" />
              )}

              {state === "speaking" && (
                <ellipse cx="100" cy="67" rx="8" ry="5" fill="#a08070" className="vista-mouth-speak">
                  <animate
                    attributeName="ry"
                    values="4;7;3;6;4;8;4"
                    dur="0.35s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="rx"
                    values="8;6;9;7;8;10;8"
                    dur="0.45s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              )}

              {(state === "insight" || state === "success") && (
                <path
                  d="M88 65 Q100 74 112 65"
                  stroke="#b8a090"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {state === "alert" && (
                <path
                  d="M92 68 L108 68"
                  stroke="#a08070"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* === EARS === */}
            <ellipse cx="66" cy="44" rx="4" ry="8" fill="url(#vistaSkinGrad)" />
            <ellipse cx="134" cy="44" rx="4" ry="8" fill="url(#vistaSkinGrad)" />
          </g>

          {/* Speaking Audio Waves */}
          {state === "speaking" && (
            <g opacity="0.5">
              <circle cx="48" cy="140" r="10" fill="none" stroke="#3BB8C3" strokeWidth="1.5">
                <animate attributeName="r" values="6;18;6" dur="0.9s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="0.9s" repeatCount="indefinite" />
              </circle>
              <circle cx="152" cy="140" r="10" fill="none" stroke="#3BB8C3" strokeWidth="1.5">
                <animate attributeName="r" values="6;18;6" dur="0.9s" repeatCount="indefinite" begin="0.15s" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="0.9s" repeatCount="indefinite" begin="0.15s" />
              </circle>
            </g>
          )}

          {/* Listening Indicator */}
          {state === "listening" && (
            <circle cx="100" cy="95" r="4" fill="#3BB8C3" className="vista-listen-dot">
              <animate attributeName="r" values="3;5;3" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>

        {/* IA Badge */}
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full font-bold text-white shadow-lg",
            state === "speaking" && "vista-badge-pulse",
            state === "insight" && "vista-badge-insight"
          )}
          style={{
            top: "2%",
            right: "2%",
            width: dims.badge,
            height: dims.badge,
            fontSize: dims.badgeFont,
            background: "linear-gradient(135deg, #2692DC, #746CE6)",
            boxShadow: "0 4px 16px rgba(38,146,220,0.4)",
          }}
        >
          IA
          {state === "thinking" && (
            <span 
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-ping"
              style={{ animationDuration: "1.2s" }}
            />
          )}
        </div>

        {/* Concentric Waves for Speaking */}
        {state === "speaking" && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-[#3BB8C3]/30 vista-wave"
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            ))}
          </>
        )}

        {/* Floating Sparkles for Thinking */}
        {state === "thinking" && (
          <div className="absolute inset-0 vista-sparkle-container">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full vista-sparkle"
                style={{
                  background: i % 2 === 0 
                    ? "linear-gradient(135deg, #2692DC, #3BB8C3)" 
                    : "linear-gradient(135deg, #746CE6, #2692DC)",
                  top: `${20 + Math.sin(i * 1.1) * 25}%`,
                  left: `${50 + Math.cos(i * 1.3) * 42}%`,
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Insight Flash Ring */}
        {state === "insight" && (
          <div 
            className="absolute inset-0 rounded-full vista-insight-flash"
            style={{
              background: "radial-gradient(circle, rgba(116,108,230,0.4), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Status Text */}
      {showStatus && statusText && size !== "sm" && (
        <span 
          className={cn(
            "text-xs font-medium transition-colors duration-300",
            state === "insight" ? "text-[#746CE6]" : "text-[#2692DC]"
          )}
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          {statusText}
        </span>
      )}

      <style>{`
        /* === GLOW STATES === */
        .vista-glow-idle {
          opacity: 0.5;
          animation: vista-breathe 5s ease-in-out infinite;
        }
        .vista-glow-thinking {
          opacity: 0.7;
          animation: vista-breathe 2.5s ease-in-out infinite;
        }
        .vista-glow-speaking {
          opacity: 0.85;
          animation: vista-pulse-glow 0.6s ease-in-out infinite;
        }
        .vista-glow-listening {
          opacity: 0.6;
          animation: vista-breathe 3s ease-in-out infinite;
        }
        .vista-glow-insight {
          opacity: 1;
          animation: vista-flash-glow 1s ease-out;
        }
        .vista-glow-success {
          opacity: 0.8;
          animation: vista-success-glow 2s ease-in-out infinite;
        }
        .vista-glow-alert {
          opacity: 0.5;
          animation: none;
        }

        @keyframes vista-breathe {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes vista-pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes vista-flash-glow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes vista-success-glow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }

        /* === BODY ANIMATIONS === */
        .vista-body-speak {
          animation: vista-body-bounce 0.45s ease-in-out infinite;
        }
        .vista-body-think {
          animation: vista-body-float 3.5s ease-in-out infinite;
        }
        .vista-body-listen {
          animation: vista-body-tilt 4s ease-in-out infinite;
        }

        @keyframes vista-body-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.015); }
        }
        @keyframes vista-body-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes vista-body-tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-0.5deg); }
        }

        /* === HEAD ANIMATIONS === */
        .vista-head-listen {
          animation: vista-head-tilt 3.5s ease-in-out infinite;
        }
        .vista-head-speak {
          animation: vista-head-nod 1.8s ease-in-out infinite;
        }

        @keyframes vista-head-tilt {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(2deg) translateX(1px); }
          70% { transform: rotate(-1deg); }
        }
        @keyframes vista-head-nod {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-0.5px) translateX(0.3px); }
          50% { transform: translateY(0.3px); }
          75% { transform: translateY(-0.3px) translateX(-0.2px); }
        }

        /* === CORE ANIMATIONS === */
        .vista-core-idle {
          animation: vista-core-pulse-idle 5s ease-in-out infinite;
        }
        .vista-core-speak {
          animation: vista-core-pulse-speak 0.5s ease-in-out infinite;
        }
        .vista-core-think {
          animation: vista-core-rotate 10s linear infinite;
        }
        .vista-core-insight {
          animation: vista-core-expand 1.2s ease-out;
        }
        .vista-core-alert {
          opacity: 0.65;
          animation: vista-core-slow 4s ease-in-out infinite;
        }
        .vista-core-success {
          animation: vista-core-twinkle 0.8s ease-in-out 3;
        }

        @keyframes vista-core-pulse-idle {
          0%, 100% { r: 22; opacity: 0.85; }
          50% { r: 24; opacity: 1; }
        }
        @keyframes vista-core-pulse-speak {
          0%, 100% { r: 22; }
          25% { r: 26; }
          50% { r: 23; }
          75% { r: 25; }
        }
        @keyframes vista-core-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes vista-core-expand {
          0% { transform: scale(1); }
          40% { transform: scale(1.2); }
          100% { transform: scale(1.05); }
        }
        @keyframes vista-core-slow {
          0%, 100% { r: 20; opacity: 0.6; }
          50% { r: 22; opacity: 0.7; }
        }
        @keyframes vista-core-twinkle {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
        }

        /* === STAR TWINKLE === */
        .vista-star-twinkle {
          animation: vista-star-shine 0.6s ease-in-out 3;
        }
        @keyframes vista-star-shine {
          0%, 100% { opacity: 0.97; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.5); }
        }

        /* === BROW ANIMATIONS === */
        .vista-brow-focus {
          animation: vista-brow-furrow 3s ease-in-out infinite;
        }
        .vista-brow-alert {
          animation: vista-brow-raise 2s ease-in-out infinite;
        }
        .vista-brow-insight {
          animation: vista-brow-lift 0.5s ease-out;
        }

        @keyframes vista-brow-furrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes vista-brow-raise {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2.5px); }
        }
        @keyframes vista-brow-lift {
          0% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(-1px); }
        }

        /* === EYES FOCUS === */
        .vista-eyes-focus {
          animation: vista-squint 4s ease-in-out infinite;
        }
        @keyframes vista-squint {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.88); }
        }

        /* === BADGE === */
        .vista-badge-pulse {
          animation: vista-badge-beat 0.55s ease-in-out infinite;
        }
        .vista-badge-insight {
          animation: vista-badge-flash 0.8s ease-out;
        }
        @keyframes vista-badge-beat {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(38,146,220,0.4); }
          50% { transform: scale(1.12); box-shadow: 0 4px 24px rgba(38,146,220,0.6); }
        }
        @keyframes vista-badge-flash {
          0% { transform: scale(1); }
          30% { transform: scale(1.25); box-shadow: 0 0 30px rgba(116,108,230,0.8); }
          100% { transform: scale(1.05); }
        }

        /* === WAVES === */
        .vista-wave {
          animation: vista-wave-out 1.1s ease-out infinite;
        }
        @keyframes vista-wave-out {
          0% { transform: scale(0.92); opacity: 0.5; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        /* === SPARKLES === */
        .vista-sparkle {
          animation: vista-sparkle-float 1.6s ease-in-out infinite;
        }
        @keyframes vista-sparkle-float {
          0%, 100% { 
            transform: translateY(0) scale(0.7); 
            opacity: 0.35; 
          }
          50% { 
            transform: translateY(-12px) scale(1.1); 
            opacity: 0.9; 
          }
        }

        /* === INSIGHT FLASH === */
        .vista-insight-flash {
          animation: vista-flash-ring 1.5s ease-out;
        }
        @keyframes vista-flash-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        /* === SUCCESS HALO === */
        .vista-success-halo > div {
          animation: vista-halo-expand 2s ease-out infinite;
        }
        @keyframes vista-halo-expand {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* === REDUCED MOTION === */
        @media (prefers-reduced-motion: reduce) {
          .vista-glow-idle, .vista-glow-thinking, .vista-glow-speaking,
          .vista-glow-listening, .vista-glow-insight, .vista-glow-success,
          .vista-body-speak, .vista-body-think, .vista-body-listen,
          .vista-head-listen, .vista-head-speak,
          .vista-core-idle, .vista-core-speak, .vista-core-think,
          .vista-core-insight, .vista-core-alert, .vista-core-success,
          .vista-star-twinkle, .vista-brow-focus, .vista-brow-alert,
          .vista-brow-insight, .vista-eyes-focus,
          .vista-badge-pulse, .vista-badge-insight,
          .vista-wave, .vista-sparkle,
          .vista-insight-flash, .vista-success-halo > div,
          .vista-eyelid-left, .vista-eyelid-right {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CEOAvatar;
