import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ChatSuggestionCardProps {
  icon: string;
  title: string;
  category: string;
  onClick: () => void;
  index: number;
  disabled?: boolean;
}

export const ChatSuggestionCard = ({
  icon,
  title,
  category,
  onClick,
  index,
  disabled,
}: ChatSuggestionCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative w-full text-left",
        "rounded-2xl p-4 overflow-hidden",
        "bg-card/80 backdrop-blur-md",
        "border border-border/50",
        "hover:border-primary/40 hover:bg-card",
        "transition-all duration-300",
        "disabled:opacity-50 disabled:pointer-events-none"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100",
          "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
          "transition-opacity duration-300"
        )}
      />

      {/* Glow effect */}
      <div
        className={cn(
          "absolute -inset-1 opacity-0 group-hover:opacity-100",
          "bg-gradient-to-r from-primary/20 to-accent/20",
          "blur-xl transition-opacity duration-500"
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-3">
        {/* Icon */}
        <motion.span
          className="text-2xl flex-shrink-0 mt-0.5"
          animate={{}}
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </p>
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-secondary/80 text-foreground/70">
              {category}
            </span>
          </span>
        </div>

        {/* Arrow indicator */}
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -4 }}
          whileHover={{ x: 0 }}
        >
          <ArrowRight className="w-4 h-4 text-primary" />
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};
