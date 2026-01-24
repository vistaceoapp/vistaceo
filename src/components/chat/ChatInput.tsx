import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isLoading: boolean;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  isMobile?: boolean;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onStartRecording,
  onStopRecording,
  isRecording,
  isTranscribing,
  isLoading,
  audioEnabled,
  onToggleAudio,
  isMobile,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !isRecording) {
        onSend();
      }
    }
  };

  const canSend = value.trim() && !isLoading && !isRecording;

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-card/80 backdrop-blur-xl",
        "border transition-all duration-300",
        isFocused 
          ? "border-primary/50 shadow-lg shadow-primary/10" 
          : "border-border/60 shadow-md",
        isRecording && "border-red-500/50 shadow-red-500/10"
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Gradient border effect when focused */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-red-300"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 p-3">
        {/* Audio toggle */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAudio}
            className={cn(
              "flex-shrink-0 h-9 w-9 rounded-xl transition-colors",
              audioEnabled
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              isRecording
                ? "🎤 Escuchando..."
                : isTranscribing
                ? "Transcribiendo..."
                : "Pregúntame lo que necesites..."
            }
            disabled={isRecording || isTranscribing}
            className={cn(
              "w-full resize-none bg-transparent border-0",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-0",
              "text-sm leading-relaxed",
              "min-h-[40px] max-h-[120px] py-2 px-1"
            )}
            rows={1}
          />
        </div>

        {/* Voice button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={isTranscribing || isLoading}
            className={cn(
              "flex-shrink-0 h-9 w-9 rounded-xl transition-all",
              isRecording
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
          >
            {isTranscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        </motion.div>

        {/* Send button */}
        <motion.div
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
        >
          <Button
            onClick={onSend}
            disabled={!canSend}
            className={cn(
              "flex-shrink-0 h-9 rounded-xl px-4 gap-2",
              "gradient-primary text-primary-foreground",
              "shadow-lg shadow-primary/25 hover:shadow-primary/40",
              "disabled:opacity-40 disabled:shadow-none",
              "transition-all duration-200"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {!isMobile && <span className="text-sm font-medium">Enviar</span>}
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Bottom hint */}
      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          {audioEnabled ? "Respuestas de voz activadas" : "Respuestas solo texto"}
          <span className="mx-1">•</span>
          <span className="opacity-70">Shift+Enter para nueva línea</span>
        </p>
      </div>
    </motion.div>
  );
};
