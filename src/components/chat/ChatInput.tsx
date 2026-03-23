import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader2, Paperclip, Image, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AudioSettingsPopover, AudioSettings } from "./AudioSettingsPopover";

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "document";
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isLoading: boolean;
  audioSettings: AudioSettings;
  onAudioSettingsChange: (settings: AudioSettings) => void;
  isPlayingAudio?: boolean;
  onStopAudio?: () => void;
  isMobile?: boolean;
  attachedFiles?: AttachedFile[];
  onAttachFiles?: (files: AttachedFile[]) => void;
  onRemoveFile?: (id: string) => void;
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
  audioSettings,
  onAudioSettingsChange,
  isPlayingAudio,
  onStopAudio,
  isMobile,
  attachedFiles = [],
  onAttachFiles,
  onRemoveFile,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachedFiles.length > 0) && !isLoading && !isRecording) {
        onSend();
      }
    }
  };

  const handleFileSelect = (type: "image" | "document") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/*" : ".pdf,.doc,.docx,.txt,.xls,.xlsx";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !onAttachFiles) return;

    const newAttachments: AttachedFile[] = await Promise.all(
      files.map(async (file) => {
        const isImage = file.type.startsWith("image/");
        let preview: string | undefined;
        if (isImage) {
          preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview,
          type: isImage ? "image" : "document",
        };
      })
    );

    onAttachFiles([...attachedFiles, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSend = (value.trim() || attachedFiles.length > 0) && !isLoading && !isRecording;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card transition-all duration-200",
        isFocused
          ? "border-primary/40 shadow-[var(--shadow-glow)]"
          : "border-border/50 shadow-[var(--shadow-sm)]",
        isRecording && "border-destructive/50 shadow-destructive/20"
      )}
    >
      {/* File previews */}
      {attachedFiles.length > 0 && (
        <div className="flex gap-2 p-3 pb-0 flex-wrap">
          {attachedFiles.map((file) => (
            <div key={file.id} className="relative group rounded-xl overflow-hidden border border-border/30 bg-muted/20">
              {file.type === "image" && file.preview ? (
                <img src={file.preview} alt={file.file.name} className="w-16 h-16 object-cover" />
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center gap-1 p-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground truncate max-w-full">
                    {file.file.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}
              {onRemoveFile && (
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mx-3 mt-2 flex items-center gap-2 text-destructive text-xs font-medium animate-pulse">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          Grabando... toca para detener
        </div>
      )}

      <div className="flex items-end gap-1 p-2.5">
        {/* Attachment */}
        {onAttachFiles && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/8">
                <Paperclip className="w-[18px] h-[18px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[150px] rounded-xl">
              <DropdownMenuItem onClick={() => handleFileSelect("image")} className="gap-2.5 rounded-lg text-[13px]">
                <Image className="w-4 h-4 text-primary" />
                Foto / Imagen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileSelect("document")} className="gap-2.5 rounded-lg text-[13px]">
                <FileText className="w-4 h-4 text-accent" />
                Documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

        {/* Audio Settings */}
        <AudioSettingsPopover
          settings={audioSettings}
          onSettingsChange={onAudioSettingsChange}
          isPlaying={isPlayingAudio}
          onStop={onStopAudio}
          compact={isMobile}
        />

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
              isRecording ? "🎤 Escuchando..."
                : isTranscribing ? "✨ Transcribiendo..."
                : "Preguntame lo que necesites..."
            }
            disabled={isRecording || isTranscribing}
            className={cn(
              "w-full resize-none bg-transparent border-0",
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-0",
              "text-[14px] leading-relaxed",
              "min-h-[40px] max-h-[120px] py-2 px-1"
            )}
            rows={1}
          />
        </div>

        {/* Voice */}
        <Button
          variant="ghost"
          size="icon"
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isTranscribing || isLoading}
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-xl transition-all duration-200",
            isRecording
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : "text-muted-foreground hover:text-primary hover:bg-primary/8"
          )}
        >
          {isTranscribing ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : isRecording ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
        </Button>

        {/* Send */}
        <Button
          onClick={onSend}
          disabled={!canSend}
          size="icon"
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-xl transition-all duration-200",
            "gradient-primary shadow-[var(--shadow-glow)]",
            canSend && "hover:scale-105",
            "disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
          )}
        >
          {isLoading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Send className="w-[18px] h-[18px]" />}
        </Button>
      </div>
    </div>
  );
};
