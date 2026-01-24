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
  isSpeaking,
}: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-primary/10 text-primary border border-primary/20"
          )}
        >
          <span className="text-sm font-semibold">{businessInitial}</span>
        </div>
      ) : (
        <CEOAvatar size="sm" isSpeaking={isSpeaking} />
      )}

      {/* Message bubble */}
      <div className={cn("flex-1 max-w-[80%]", isUser && "text-right")}>
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3",
            isUser
              ? "gradient-primary text-primary-foreground"
              : "bg-card border border-border text-foreground"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Meta info */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 px-1",
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
              className="text-xs py-0 px-1.5 gap-1 bg-success/10 text-success border-success/20"
            >
              <Brain className="w-3 h-3" />
              Aprendido
            </Badge>
          )}

          {audioScript && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-xs gap-1"
              onClick={onPlayAudio}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
              {isPlaying ? "..." : "Escuchar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
