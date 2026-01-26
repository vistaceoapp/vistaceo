import { Brain, Volume2, Loader2, Check, CheckCheck, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CEOAvatar } from "./CEOAvatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { AttachedFile } from "./ChatInput";

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
  attachments?: AttachedFile[];
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
  attachments,
}: ChatMessageProps) => {
  const isUser = role === "user";
  const isRecent = Date.now() - new Date(timestamp).getTime() < 5000;

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
            "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
            "bg-gradient-to-br from-primary/20 to-primary/10 text-primary",
            "border border-primary/20 shadow-sm"
          )}
        >
          <span className="text-sm font-bold">{businessInitial}</span>
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
              <div
                key={file.id}
                className="rounded-xl overflow-hidden border border-border/50 bg-muted/30"
              >
                {file.type === "image" && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-24 h-24 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 flex flex-col items-center justify-center gap-2 p-3">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate max-w-full text-center">
                      {file.file.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "gradient-primary text-primary-foreground rounded-tr-md"
              : "bg-card/90 backdrop-blur-sm border border-border/60 text-foreground rounded-tl-md"
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-sm leading-relaxed mb-3 last:mb-0">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-foreground">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside ml-4 my-2 space-y-1.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside ml-4 my-2 space-y-1.5">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm leading-relaxed">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold mt-4 mb-2 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold mt-3 mb-2 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h3>
                  ),
                  code: ({ children }) => (
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{children}</code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-3 my-2 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta info bar */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1.5 px-1",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[11px] text-muted-foreground/70">
            {new Date(timestamp).toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {isUser && (
            <span className="text-muted-foreground/50">
              {isRecent ? <Check className="w-3 h-3" /> : <CheckCheck className="w-3 h-3" />}
            </span>
          )}

          {hasLearning && !isUser && (
            <Badge
              variant="secondary"
              className="text-[10px] py-0 px-1.5 gap-1 bg-success/10 text-success border-success/30 font-medium"
            >
              <Brain className="w-2.5 h-2.5" />
              Aprendido
            </Badge>
          )}

          {audioScript && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-[11px] gap-1 rounded-full",
                isPlaying 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary"
              )}
              onClick={onPlayAudio}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Reproduciendo...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Escuchar</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
