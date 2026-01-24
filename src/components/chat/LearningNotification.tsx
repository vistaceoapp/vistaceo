import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Check } from "lucide-react";

interface LearningNotificationProps {
  isVisible: boolean;
}

export const LearningNotification = ({ isVisible }: LearningNotificationProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 right-4 z-50"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Main notification */}
            <motion.div
              className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30 backdrop-blur-sm"
              animate={{
                boxShadow: [
                  "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
                  "0 10px 25px -3px rgba(16, 185, 129, 0.5)",
                  "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              {/* Animated brain icon */}
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <Brain className="w-5 h-5" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
              </motion.div>

              {/* Text */}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Aprendiendo...</span>
                <span className="text-xs opacity-80">Guardando nuevo conocimiento</span>
              </div>

              {/* Progress indicator */}
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center"
                initial={{ borderColor: "rgba(255,255,255,0.3)" }}
                animate={{ borderColor: "rgba(255,255,255,0.8)" }}
                transition={{ duration: 2 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.3 }}
                >
                  <Check className="w-3 h-3" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
