import { motion } from "framer-motion";
import { Brain, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CEOAvatar } from "./CEOAvatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  hasLearning?: boolean;
  audioScript?: string;
  isPlaying?: boolean;
  onPlayAudio?: () => void;
  businessInitial: string;
  index: number;
  isSpeaking?: boolean;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  hasLearning,
  audioScript,
  isPlaying,
  onPlayAudio,
  businessInitial,
  index,
  isSpeaking,
}: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <motion.div
      className={cn(
        "flex gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Avatar */}
      {isUser ? (
        <motion.div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-gradient-to-br from-primary/20 to-accent/20 text-primary",
            "border border-primary/20"
          )}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-sm font-bold">{businessInitial}</span>
        </motion.div>
      ) : (
        <CEOAvatar size="sm" isSpeaking={isSpeaking} />
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "flex-1 max-w-[75%]",
          isUser && "text-right"
        )}
      >
        <motion.div
          className={cn(
            "inline-block rounded-2xl px-5 py-3 relative overflow-hidden",
            isUser
              ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-card border border-border/60 text-foreground shadow-md"
          )}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {/* Shimmer effect for assistant */}
          {!isUser && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "linear",
              }}
            />
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap relative z-10">
            {content}
          </p>
        </motion.div>

        {/* Meta info */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1.5 px-1",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {hasLearning && !isUser && (
            <Badge
              variant="secondary"
              className="text-xs py-0 px-2 gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            >
              <Brain className="w-3 h-3" />
              Aprendido
            </Badge>
          )}

          {audioScript && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs gap-1",
                isPlaying && "text-primary"
              )}
              onClick={onPlayAudio}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
              {isPlaying ? "Reproduciendo..." : "Escuchar"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
