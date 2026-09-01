import { useState, useEffect, useRef } from "react";
import { Brain, Check, CheckCheck, FileText, Target, Layers, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CEOAvatar } from "./CEOAvatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { AttachedFile } from "./ChatInput";
import { MissionActionCard } from "./MissionActionCard";
import { ChatTableDownload } from "./ChatTableDownload";
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
  onAction?: (action: "mission" | "deepen", content: string) => void;

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
  onAction,
}: ChatMessageProps) => {
  const isUser = role === "user";
  const isRecent = Date.now() - new Date(timestamp).getTime() < 5000;
  const [copied, setCopied] = useState(false);
  // Sanitize assistant content (strip internal codes, fix capitalization, spacing).
  // User messages are shown as-is.
  const safeContent = isUser ? content : sanitizeAIOutput(content);
  const displayContent = useTypingReveal(safeContent, isNew, role);
  const isTyping = displayContent.length < safeContent.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard no disponible */
    }
  };


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
      <div className={cn("flex-1 min-w-0 max-w-[85%] [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_a]:break-all [&_code]:break-all break-words", isUser && "flex flex-col items-end")}>
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
              : "bg-card border border-border/40 text-foreground rounded-tl-md shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
          )}
        >
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

        {/* Acciones rápidas sobre la respuesta */}
        {!isUser && !isTyping && displayContent.length > 160 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {(!missionSuggestions || missionSuggestions.length === 0) && onAction && (
              <button
                onClick={() => onAction("mission", content)}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
              >
                <Target className="w-3 h-3" />
                Convertir en misión
              </button>
            )}
            {onAction && (
              <button
                onClick={() => onAction("deepen", content)}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground transition-colors"
              >
                <Layers className="w-3 h-3" />
                Profundizar
              </button>
            )}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
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
        </div>
      </div>
    </div>
  );
};
