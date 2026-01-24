import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
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
    <div
      className={cn(
        "rounded-xl border bg-card transition-all duration-200",
        isFocused ? "border-primary/40 shadow-md" : "border-border",
        isRecording && "border-destructive/40"
      )}
    >
      {/* Recording indicator bar */}
      {isRecording && (
        <div className="h-0.5 bg-destructive/60 rounded-t-xl animate-pulse" />
      )}

      <div className="flex items-end gap-2 p-3">
        {/* Audio toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAudio}
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-lg",
            audioEnabled ? "text-primary" : "text-muted-foreground"
          )}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>

        {/* Text input */}
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
            "flex-1 resize-none bg-transparent border-0",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-0",
            "text-sm leading-relaxed",
            "min-h-[36px] max-h-[120px] py-2"
          )}
          rows={1}
        />

        {/* Voice button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isTranscribing || isLoading}
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-lg",
            isRecording
              ? "bg-destructive/10 text-destructive animate-pulse"
              : "text-muted-foreground hover:text-primary"
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

        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={!canSend}
          size="icon"
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-lg",
            "gradient-primary",
            "disabled:opacity-40"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Bottom hint - only on desktop */}
      {!isMobile && (
        <div className="px-4 pb-2 -mt-1">
          <p className="text-xs text-muted-foreground">
            {audioEnabled ? "🔊 Audio activado" : "🔇 Audio desactivado"} • Shift+Enter para nueva línea
          </p>
        </div>
      )}
    </div>
  );
};
