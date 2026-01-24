import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useState, useEffect } from "react";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 40, logoSize: 20 },
  md: { container: 56, logoSize: 28 },
  lg: { container: 72, logoSize: 36 },
  xl: { container: 96, logoSize: 48 },
};

// Premium AI assistant animation data - minimal elegant orb
const aiOrbAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "AI Orb",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Outer Ring",
      sr: 1,
      ks: {
        o: { a: 0, k: 40 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 90, s: [360] }
          ]
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [105, 105, 100] },
            { t: 45, s: [105, 105, 100], e: [100, 100, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [160, 160] },
          p: { a: 0, k: [0, 0] },
          nm: "Ellipse"
        },
        {
          ty: "st",
          c: { a: 0, k: [0.149, 0.573, 0.863, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 3 },
          lc: 2,
          lj: 1,
          ml: 4,
          d: [
            { n: "d", nm: "dash", v: { a: 0, k: 20 } },
            { n: "g", nm: "gap", v: { a: 0, k: 30 } },
            { n: "o", nm: "offset", v: { a: 1, k: [{ t: 0, s: [0], e: [100] }, { t: 90, s: [100] }] } }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
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
            { t: 0, s: [60], e: [80] },
            { t: 45, s: [80], e: [60] },
            { t: 90, s: [60] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [110, 110, 100] },
            { t: 45, s: [110, 110, 100], e: [100, 100, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [120, 120] },
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
              k: [0, 0.149, 0.573, 0.863, 0.5, 0.455, 0.424, 0.902, 1, 0.149, 0.573, 0.863]
            }
          },
          s: { a: 0, k: [0, 0] },
          e: { a: 0, k: [60, 60] },
          t: 2
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
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
          k: [
            { t: 0, s: [100, 100, 100], e: [95, 95, 100] },
            { t: 30, s: [95, 95, 100], e: [100, 100, 100] },
            { t: 60, s: [100, 100, 100], e: [95, 95, 100] },
            { t: 90, s: [95, 95, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [80, 80] },
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
              k: [0, 0.149, 0.573, 0.863, 1, 0.455, 0.424, 0.902]
            }
          },
          s: { a: 0, k: [-40, -40] },
          e: { a: 0, k: [40, 40] },
          t: 1
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

// More active animation for speaking state
const speakingAnimation = {
  ...aiOrbAnimation,
  fr: 60,
  op: 60,
  layers: aiOrbAnimation.layers.map((layer, idx) => ({
    ...layer,
    ks: {
      ...layer.ks,
      s: idx === 2 ? {
        a: 1,
        k: [
          { t: 0, s: [100, 100, 100], e: [108, 108, 100] },
          { t: 15, s: [108, 108, 100], e: [95, 95, 100] },
          { t: 30, s: [95, 95, 100], e: [105, 105, 100] },
          { t: 45, s: [105, 105, 100], e: [100, 100, 100] },
          { t: 60, s: [100, 100, 100] }
        ]
      } : layer.ks.s
    }
  }))
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  className,
}: CEOAvatarProps) => {
  const dimensions = sizeMap[size];
  const [showLottie, setShowLottie] = useState(false);

  // Show Lottie after mount for better performance
  useEffect(() => {
    const timer = setTimeout(() => setShowLottie(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const currentAnimation = isSpeaking ? speakingAnimation : aiOrbAnimation;

  return (
    <div
      className={cn(
        "relative flex-shrink-0 flex items-center justify-center",
        className
      )}
      style={{
        width: dimensions.container,
        height: dimensions.container,
      }}
    >
      {/* Lottie background animation */}
      {showLottie && (
        <div className="absolute inset-0">
          <Lottie
            animationData={currentAnimation}
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
          className="absolute inset-0 rounded-full gradient-primary opacity-80"
          style={{
            width: dimensions.container * 0.7,
            height: dimensions.container * 0.7,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Center logo */}
      <div
        className={cn(
          "relative z-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center",
          "shadow-lg border border-border/50",
          isThinking && "animate-pulse"
        )}
        style={{
          width: dimensions.container * 0.5,
          height: dimensions.container * 0.5,
        }}
      >
        <VistaceoLogo size={dimensions.logoSize * 0.8} variant="icon" />
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
