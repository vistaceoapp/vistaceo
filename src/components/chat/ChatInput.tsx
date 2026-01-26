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
  const [fileType, setFileType] = useState<"image" | "document">("image");

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
      if ((value.trim() || attachedFiles.length > 0) && !isLoading && !isRecording) {
        onSend();
      }
    }
  };

  const handleFileSelect = (type: "image" | "document") => {
    setFileType(type);
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
        "rounded-2xl border-2 bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFocused ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border/60",
        isRecording && "border-destructive/50 shadow-destructive/20"
      )}
    >
      {/* File previews */}
      {attachedFiles.length > 0 && (
        <div className="flex gap-2 p-3 pb-0 flex-wrap">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted/50"
            >
              {file.type === "image" && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center gap-1 p-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground truncate max-w-full">
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

      {/* Recording indicator bar */}
      {isRecording && (
        <div className="h-1 bg-gradient-to-r from-destructive/60 via-destructive to-destructive/60 rounded-t-2xl animate-pulse" />
      )}

      <div className="flex items-end gap-1.5 p-3">
        {/* Attachment button */}
        {onAttachFiles && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              <DropdownMenuItem onClick={() => handleFileSelect("image")} className="gap-3">
                <Image className="w-4 h-4" />
                <span>Foto / Imagen</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileSelect("document")} className="gap-3">
                <FileText className="w-4 h-4" />
                <span>Documento</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        {/* Audio Settings Popover */}
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
              isRecording
                ? "🎤 Escuchando tu voz..."
                : isTranscribing
                ? "✨ Transcribiendo..."
                : "Preguntame lo que necesites..."
            }
            disabled={isRecording || isTranscribing}
            className={cn(
              "w-full resize-none bg-transparent border-0",
              "text-foreground placeholder:text-muted-foreground/70",
              "focus:outline-none focus:ring-0",
              "text-base leading-relaxed",
              "min-h-[44px] max-h-[120px] py-2.5 px-1"
            )}
            rows={1}
          />
        </div>

        {/* Voice button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isTranscribing || isLoading}
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-xl transition-all duration-300",
            isRecording
              ? "bg-destructive text-destructive-foreground animate-pulse scale-110"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          )}
        >
          {isTranscribing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={!canSend}
          size="icon"
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-xl transition-all duration-300",
            "gradient-primary shadow-md",
            canSend && "hover:scale-105 hover:shadow-lg",
            "disabled:opacity-30 disabled:scale-100"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Bottom hint - only on desktop */}
      {!isMobile && (
        <div className="px-4 pb-2.5 -mt-1">
          <p className="text-xs text-muted-foreground/70">
            {isRecording ? (
              <span className="text-destructive">● Grabando - Haz clic para detener</span>
            ) : (
              <>
                {audioSettings.enabled ? "🔊 Voz activada" : "🔇 Voz desactivada"} • Adjunta fotos o documentos • Enter para enviar
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
