import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useState, useEffect } from "react";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  isThinking?: boolean;
  isSpeaking?: boolean;
  mood?: "calm" | "serious" | "energetic" | "empathetic" | "focused";
  className?: string;
  showStatus?: boolean;
}

const sizeMap = {
  sm: { container: 44, logoSize: 22, ringWidth: 2 },
  md: { container: 64, logoSize: 32, ringWidth: 3 },
  lg: { container: 88, logoSize: 44, ringWidth: 3 },
  xl: { container: 120, logoSize: 60, ringWidth: 4 },
  hero: { container: 160, logoSize: 80, ringWidth: 5 },
};

const moodColors = {
  calm: { primary: [0.149, 0.573, 0.863], secondary: [0.455, 0.424, 0.902] },
  serious: { primary: [0.8, 0.4, 0.2], secondary: [0.6, 0.3, 0.4] },
  energetic: { primary: [0.2, 0.8, 0.4], secondary: [0.4, 0.9, 0.6] },
  empathetic: { primary: [0.6, 0.3, 0.7], secondary: [0.8, 0.4, 0.9] },
  focused: { primary: [0.2, 0.5, 0.9], secondary: [0.3, 0.6, 0.95] },
};

// Create animation data based on mood
const createAnimation = (mood: string, isSpeaking: boolean) => {
  const colors = moodColors[mood as keyof typeof moodColors] || moodColors.calm;
  const speed = isSpeaking ? 60 : 30;
  const duration = isSpeaking ? 60 : 90;

  return {
    v: "5.7.4",
    fr: speed,
    ip: 0,
    op: duration,
    w: 200,
    h: 200,
    nm: "AI Orb",
    ddd: 0,
    assets: [],
    layers: [
      // Outer rotating ring
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Outer Ring",
        sr: 1,
        ks: {
          o: { a: 0, k: isSpeaking ? 70 : 40 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [360] },
              { t: duration, s: [360] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [100, 100, 100], e: [isSpeaking ? 108 : 105, isSpeaking ? 108 : 105, 100] },
              { t: duration / 2, s: [isSpeaking ? 108 : 105, isSpeaking ? 108 : 105, 100], e: [100, 100, 100] },
              { t: duration, s: [100, 100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [170, 170] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "st",
            c: { a: 0, k: [...colors.primary, 1] },
            o: { a: 0, k: 100 },
            w: { a: 0, k: 2.5 },
            lc: 2,
            lj: 1,
            ml: 4,
            d: [
              { n: "d", nm: "dash", v: { a: 0, k: 15 } },
              { n: "g", nm: "gap", v: { a: 0, k: 25 } },
              { n: "o", nm: "offset", v: { a: 1, k: [{ t: 0, s: [0], e: [150] }, { t: duration, s: [150] }] } }
            ]
          }
        ],
        ip: 0,
        op: duration,
        st: 0
      },
      // Inner glow ring
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Inner Glow",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              { t: 0, s: [50], e: [80] },
              { t: duration / 2, s: [80], e: [50] },
              { t: duration, s: [50] }
            ]
          },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [-180] },
              { t: duration, s: [-180] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [100, 100, 100], e: [isSpeaking ? 115 : 108, isSpeaking ? 115 : 108, 100] },
              { t: duration / 2, s: [isSpeaking ? 115 : 108, isSpeaking ? 115 : 108, 100], e: [100, 100, 100] },
              { t: duration, s: [100, 100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [130, 130] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "gf",
            o: { a: 0, k: 100 },
            r: 1,
            g: {
              p: 3,
              k: {
                a: 0,
                k: [0, ...colors.primary, 0.5, ...colors.secondary, 1, ...colors.primary]
              }
            },
            s: { a: 0, k: [0, 0] },
            e: { a: 0, k: [65, 65] },
            t: 2
          }
        ],
        ip: 0,
        op: duration,
        st: 0
      },
      // Core pulsing orb
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "Core",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: isSpeaking
              ? [
                  { t: 0, s: [100, 100, 100], e: [110, 110, 100] },
                  { t: 10, s: [110, 110, 100], e: [94, 94, 100] },
                  { t: 20, s: [94, 94, 100], e: [106, 106, 100] },
                  { t: 30, s: [106, 106, 100], e: [98, 98, 100] },
                  { t: 40, s: [98, 98, 100], e: [104, 104, 100] },
                  { t: 50, s: [104, 104, 100], e: [100, 100, 100] },
                  { t: 60, s: [100, 100, 100] }
                ]
              : [
                  { t: 0, s: [100, 100, 100], e: [96, 96, 100] },
                  { t: 30, s: [96, 96, 100], e: [100, 100, 100] },
                  { t: 60, s: [100, 100, 100], e: [96, 96, 100] },
                  { t: 90, s: [96, 96, 100] }
                ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [90, 90] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "gf",
            o: { a: 0, k: 100 },
            r: 1,
            g: {
              p: 2,
              k: {
                a: 0,
                k: [0, ...colors.primary, 1, ...colors.secondary]
              }
            },
            s: { a: 0, k: [-45, -45] },
            e: { a: 0, k: [45, 45] },
            t: 1
          }
        ],
        ip: 0,
        op: duration,
        st: 0
      }
    ]
  };
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  mood = "calm",
  className,
  showStatus = true,
}: CEOAvatarProps) => {
  const dimensions = sizeMap[size];
  const [showLottie, setShowLottie] = useState(false);
  const [animationData, setAnimationData] = useState(() => createAnimation(mood, isSpeaking));

  // Show Lottie after mount for better performance
  useEffect(() => {
    const timer = setTimeout(() => setShowLottie(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Update animation when speaking state or mood changes
  useEffect(() => {
    setAnimationData(createAnimation(mood, isSpeaking));
  }, [isSpeaking, mood]);

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
        {/* Ambient glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
            isSpeaking ? "opacity-60" : isThinking ? "opacity-40" : "opacity-20"
          )}
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)`,
          }}
        />

        {/* Lottie background animation */}
        {showLottie && (
          <div className="absolute inset-0">
            <Lottie
              animationData={animationData}
              loop
              autoplay
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        )}

        {/* Fallback gradient while loading */}
        {!showLottie && (
          <div
            className="absolute rounded-full gradient-primary opacity-60 animate-pulse"
            style={{
              width: dimensions.container * 0.65,
              height: dimensions.container * 0.65,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {/* Center logo container */}
        <div
          className={cn(
            "relative z-10 rounded-full bg-background/95 backdrop-blur-md flex items-center justify-center",
            "shadow-xl border-2 border-primary/20",
            "transition-all duration-300",
            isThinking && "animate-pulse",
            isSpeaking && "scale-[1.02]"
          )}
          style={{
            width: dimensions.container * 0.48,
            height: dimensions.container * 0.48,
          }}
        >
          <VistaceoLogo size={dimensions.logoSize * 0.75} variant="icon" />
        </div>

        {/* Speaking wave indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[3px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-primary"
                style={{
                  height: `${8 + Math.sin(i * 0.8) * 4}px`,
                  animation: `soundwave 0.6s ease-in-out infinite`,
                  animationDelay: `${i * 0.08}s`,
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
                className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
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
        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(1.3); }
        }
      `}</style>
    </div>
  );
};
