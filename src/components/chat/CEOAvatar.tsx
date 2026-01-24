import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 32, ring: 36, glow: 40 },
  md: { container: 48, ring: 56, glow: 64 },
  lg: { container: 64, ring: 76, glow: 88 },
  xl: { container: 96, ring: 112, glow: 128 },
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  className,
}: CEOAvatarProps) => {
  const dimensions = sizeMap[size];

  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{ width: dimensions.glow, height: dimensions.glow }}
    >
      {/* Outer glow ring - animated when speaking */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-50"
        style={{
          background: "linear-gradient(135deg, hsl(204 79% 50% / 0.4), hsl(254 61% 67% / 0.3))",
          filter: "blur(12px)",
        }}
        animate={
          isSpeaking
            ? {
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }
            : isThinking
            ? {
                scale: [1, 1.08, 1],
                opacity: [0.3, 0.5, 0.3],
              }
            : {}
        }
        transition={{
          duration: isSpeaking ? 0.8 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Spinning gradient ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: (dimensions.glow - dimensions.ring) / 2,
          left: (dimensions.glow - dimensions.ring) / 2,
          width: dimensions.ring,
          height: dimensions.ring,
          background: "conic-gradient(from 0deg, hsl(204 79% 50%), hsl(254 61% 67%), hsl(204 79% 50%))",
          padding: 2,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: isSpeaking ? 2 : 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full rounded-full bg-background" />
      </motion.div>

      {/* Main avatar container */}
      <motion.div
        className="absolute rounded-full gradient-primary flex items-center justify-center shadow-lg"
        style={{
          top: (dimensions.glow - dimensions.container) / 2,
          left: (dimensions.glow - dimensions.container) / 2,
          width: dimensions.container,
          height: dimensions.container,
          boxShadow: "0 8px 32px -8px hsl(204 79% 50% / 0.4)",
        }}
        animate={
          isThinking
            ? {
                scale: [1, 0.95, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* CEO Icon - Stylized V */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
          style={{
            width: dimensions.container * 0.55,
            height: dimensions.container * 0.55,
          }}
        >
          <motion.path
            d="M4 6L12 18L20 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Sparkle */}
          <motion.circle
            cx="12"
            cy="8"
            r="1.5"
            fill="currentColor"
            animate={
              isSpeaking
                ? {
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                  }
                : { opacity: 0.6 }
            }
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        </svg>
      </motion.div>

      {/* Speaking indicator dots */}
      {isSpeaking && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{
                y: [0, -4, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
