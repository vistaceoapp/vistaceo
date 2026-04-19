import { useState, useEffect, useRef } from "react";
import { Brain, Volume2, Loader2, Check, CheckCheck, FileText, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CEOAvatar } from "./CEOAvatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { AttachedFile } from "./ChatInput";
import { MissionActionCard } from "./MissionActionCard";
import { sanitizeAIOutput } from "@/lib/aiOutputSanitizer";

interface MissionSuggestion {
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  kpi?: string;
  definition_of_done?: string[];
  due_hint?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  hasLearning?: boolean;
  audioScript?: string;
  isPlaying?: boolean;
  onPlayAudio?: () => void;
  onReplayAudio?: () => void;
  businessInitial: string;
  businessId: string;
  index: number;
  isSpeaking?: boolean;
  attachments?: AttachedFile[];
  missionSuggestions?: MissionSuggestion[];
  isNew?: boolean;
}

/** Typing reveal effect for assistant messages */
const useTypingReveal = (content: string, isNew: boolean, role: string) => {
  const [revealed, setRevealed] = useState(isNew && role === "assistant" ? "" : content);
  const indexRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!isNew || role !== "assistant") {
      setRevealed(content);
      return;
    }

    indexRef.current = 0;
    setRevealed("");

    const CHARS_PER_FRAME = 4;
    const tick = () => {
      indexRef.current = Math.min(indexRef.current + CHARS_PER_FRAME, content.length);
      setRevealed(content.slice(0, indexRef.current));
      if (indexRef.current < content.length) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [content, isNew, role]);

  return revealed;
};

export const ChatMessage = ({
  role,
  content,
  timestamp,
  hasLearning,
  audioScript,
  isPlaying,
  onPlayAudio,
  onReplayAudio,
  businessInitial,
  businessId,
  isSpeaking,
  attachments,
  missionSuggestions,
  isNew = false,
}: ChatMessageProps) => {
  const isUser = role === "user";
  const isRecent = Date.now() - new Date(timestamp).getTime() < 5000;
  // Sanitize assistant content (strip internal codes, fix capitalization, spacing).
  // User messages are shown as-is.
  const safeContent = isUser ? content : sanitizeAIOutput(content);
  const displayContent = useTypingReveal(safeContent, isNew, role);

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <span className="text-[11px] font-bold">{businessInitial}</span>
        </div>
      ) : (
        <CEOAvatar size="sm" isSpeaking={isSpeaking} />
      )}

      {/* Message bubble */}
      <div className={cn("flex-1 max-w-[85%]", isUser && "flex flex-col items-end")}>
        {/* Attachments preview */}
        {attachments && attachments.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {attachments.map((file) => (
              <div key={file.id} className="rounded-xl overflow-hidden border border-border/40 bg-muted/20 shadow-sm">
                {file.type === "image" && file.preview ? (
                  <img src={file.preview} alt={file.file.name} className="w-24 h-24 object-cover" />
                ) : (
                  <div className="w-24 h-24 flex flex-col items-center justify-center gap-2 p-3">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground truncate max-w-full text-center">{file.file.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3 relative group transition-all duration-200",
            isUser
              ? "gradient-primary text-primary-foreground rounded-tr-md shadow-[var(--shadow-glow)]"
              : "bg-card border border-border/40 text-foreground rounded-tl-md shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
            audioScript && !isUser && "cursor-pointer"
          )}
          onClick={audioScript && !isUser && onReplayAudio ? onReplayAudio : undefined}
        >
          {/* Replay audio badge */}
          {audioScript && !isUser && (
            <div className={cn(
              "absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200",
              "gradient-primary text-primary-foreground rounded-full p-1.5 shadow-lg",
              isPlaying && "opacity-100 animate-pulse"
            )}>
              {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </div>
          )}

          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-[13px] leading-relaxed mb-3 last:mb-0 text-foreground">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-outside ml-4 my-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-outside ml-4 my-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-[13px] leading-relaxed">{children}</li>,
                  h1: ({ children }) => <h1 className="text-base font-bold mt-4 mb-2 text-foreground">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1.5 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h3>,
                  code: ({ children }) => <code className="text-xs bg-muted/60 px-1.5 py-0.5 rounded-md font-mono text-primary">{children}</code>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic text-[13px]">{children}</blockquote>
                  ),
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Mission Action Card */}
        {missionSuggestions && missionSuggestions.length > 0 && !isUser && (
          <MissionActionCard businessId={businessId} suggestions={missionSuggestions} />
        )}

        {/* Meta info bar */}
        <div className={cn("flex items-center gap-2 mt-1 px-1", isUser ? "justify-end" : "justify-start")}>
          <span className="text-[10px] text-muted-foreground/50 font-medium tabular-nums">
            {new Date(timestamp).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
          </span>

          {isUser && (
            <span className="text-muted-foreground/40">
              {isRecent ? <Check className="w-3 h-3" /> : <CheckCheck className="w-3 h-3 text-primary/50" />}
            </span>
          )}

          {hasLearning && !isUser && (
            <Badge variant="secondary" className="text-[9px] py-0 px-1.5 gap-1 bg-primary/8 text-primary border-primary/20 font-medium rounded-full">
              <Brain className="w-2.5 h-2.5" />
              Aprendido
            </Badge>
          )}

          {audioScript && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-5 px-2 text-[10px] gap-1 rounded-full",
                isPlaying ? "text-primary bg-primary/10" : "text-muted-foreground/50 hover:text-primary"
              )}
              onClick={onPlayAudio}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <><Loader2 className="w-2.5 h-2.5 animate-spin" /><span>Reproduciendo</span></>
              ) : (
                <><Volume2 className="w-2.5 h-2.5" /><span>Escuchar</span></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
