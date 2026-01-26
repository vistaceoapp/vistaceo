import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Chat components
import { ChatWelcome } from "@/components/chat/ChatWelcome";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput, AttachedFile } from "@/components/chat/ChatInput";
import { ChatThinkingState } from "@/components/chat/ChatThinkingState";
import { LearningNotification } from "@/components/chat/LearningNotification";
import { CEOAvatar } from "@/components/chat/CEOAvatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  hasLearning?: boolean;
  audioScript?: string;
  attachments?: AttachedFile[];
}

const ChatPage = () => {
  const { currentBusiness } = useBusiness();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialPromptSent, setInitialPromptSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [learningIndicator, setLearningIndicator] = useState(false);

  // File attachments
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentBusiness) {
      fetchMessages();
    }
  }, [currentBusiness]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Handle URL prompt parameter
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && currentBusiness && !loading && !initialPromptSent && messages.length >= 0) {
      setInitialPromptSent(true);
      setSearchParams({});
      setTimeout(() => sendMessage(prompt), 500);
    }
  }, [searchParams, currentBusiness, loading, initialPromptSent, messages]);

  const fetchMessages = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages((data || []).map((m) => ({ ...m, role: m.role as "user" | "assistant" })));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // TTS Playback
  const playAudioResponse = useCallback(
    async (audioScript: string, messageId?: string) => {
      if (!audioEnabled || !audioScript) return;

      try {
        setIsPlayingAudio(true);
        if (messageId) setPlayingMessageId(messageId);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text: audioScript }),
          }
        );

        if (!response.ok) {
          console.log("TTS request failed, continuing without audio");
          setIsPlayingAudio(false);
          setPlayingMessageId(null);
          return;
        }

        const data = await response.json();

        // Handle graceful fallback when voice is unavailable
        if (!data.audioContent) {
          console.log("TTS unavailable:", data.message || "No audio returned");
          setIsPlayingAudio(false);
          setPlayingMessageId(null);
          return;
        }

        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsPlayingAudio(false);
          setPlayingMessageId(null);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          setIsPlayingAudio(false);
          setPlayingMessageId(null);
          currentAudioRef.current = null;
        };

        await audio.play();
      } catch (error) {
        console.log("TTS error (silent fallback):", error);
        setIsPlayingAudio(false);
        setPlayingMessageId(null);
      }
    },
    [audioEnabled]
  );

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
    }
  }, []);

  // Voice Recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          await transcribeAudio(audioBlob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      toast({ title: "🎤 Grabando...", description: "Habla ahora" });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("language", "spa");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
        {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`STT request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        await sendMessage(data.text.trim(), "audio");
      } else {
        toast({
          title: "No se detectó audio",
          description: "Intenta hablar más claro o cerca del micrófono",
        });
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Error de transcripción",
        description: "No se pudo procesar el audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const sendMessage = async (messageText?: string, inputType: string = "text") => {
    const textToSend = messageText || input.trim();
    const hasAttachments = attachedFiles.length > 0;
    
    if ((!textToSend && !hasAttachments) || !currentBusiness || loading) return;

    // Store attachments before clearing
    const messageAttachments = [...attachedFiles];
    
    setInput("");
    setAttachedFiles([]);
    setLoading(true);
    setLearningIndicator(false);

    // Build message content with attachment info
    let fullContent = textToSend;
    if (hasAttachments) {
      const attachmentDescriptions = messageAttachments.map(f => 
        f.type === "image" ? `[📷 Imagen: ${f.file.name}]` : `[📄 Documento: ${f.file.name}]`
      ).join(" ");
      fullContent = fullContent ? `${fullContent}\n\n${attachmentDescriptions}` : attachmentDescriptions;
    }

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: fullContent,
      created_at: new Date().toISOString(),
      attachments: messageAttachments,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "user",
        content: fullContent,
      });

      const messagesForAI = [...messages, tempUserMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data: aiData, error: aiError } = await supabase.functions.invoke("vistaceo-chat", {
        body: {
          messages: messagesForAI,
          businessContext: {
            id: currentBusiness.id,
            name: currentBusiness.name,
            category: currentBusiness.category,
            country: currentBusiness.country,
            avg_ticket: currentBusiness.avg_ticket,
            avg_rating: currentBusiness.avg_rating,
          },
          inputType: hasAttachments ? "multimodal" : inputType,
          messageId: `msg-${Date.now()}`,
          attachments: messageAttachments.map(f => ({
            name: f.file.name,
            type: f.type,
            size: f.file.size,
          })),
        },
      });

      if (aiError) {
        console.error("AI error:", aiError);
        throw new Error(aiError.message || "Error al comunicarse con el asistente");
      }

      const aiResponse = aiData?.message || "Lo siento, no pude procesar tu mensaje. Intenta de nuevo.";
      const audioScript = aiData?.audioScript;
      const hasLearning = aiData?.learningExtract && Object.keys(aiData.learningExtract).length > 0;

      // Show learning indicator
      if (hasLearning) {
        setLearningIndicator(true);
        setTimeout(() => setLearningIndicator(false), 3500);
      }

      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "assistant",
        content: aiResponse,
      });

      const newAssistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse,
        created_at: new Date().toISOString(),
        hasLearning,
        audioScript,
      };

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...tempUserMsg, id: `user-${Date.now()}` },
        newAssistantMsg,
      ]);

      // Play audio response if enabled
      if (audioScript && audioEnabled) {
        playAudioResponse(audioScript, newAssistantMsg.id);
      }

      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el mensaje",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!currentBusiness) return;

    try {
      await supabase.from("chat_messages").delete().eq("business_id", currentBusiness.id);

      setMessages([]);
      toast({ title: "Conversación borrada" });
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  // No business state
  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <CEOAvatar size="lg" />
        <h2 className="text-2xl font-bold text-foreground mb-3 mt-6">Tu CEO virtual</h2>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Tu mentor ejecutivo para gestionar tu negocio de manera inteligente.
        </p>
        <Button variant="default" size="lg" onClick={() => (window.location.href = "/setup")} className="gradient-primary">
          Configurar negocio
        </Button>
      </div>
    );
  }

  // Desktop Layout
  if (!isMobile) {
    return (
      <>
        <LearningNotification isVisible={learningIndicator} />

        <div className="flex flex-col h-[calc(100vh-120px)]">
          {/* Header - Simplified */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
              <CEOAvatar size="md" isSpeaking={isPlayingAudio} isThinking={loading} />
              <div>
                <h1 className="text-lg font-semibold text-foreground">CEO Chat</h1>
                <p className="text-xs text-muted-foreground">{currentBusiness.name}</p>
              </div>
            </div>

            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <Trash2 className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Nueva</span>
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto rounded-xl border border-border/40 bg-card/50"
          >
            {messages.length === 0 ? (
              <ChatWelcome
                businessName={currentBusiness.name}
                onSelectSuggestion={sendMessage}
                disabled={loading}
              />
            ) : (
              <div className="p-4 md:p-6 space-y-4">
                {messages.map((message, idx) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.created_at}
                    hasLearning={message.hasLearning}
                    audioScript={message.audioScript}
                    isPlaying={playingMessageId === message.id}
                    onPlayAudio={() => message.audioScript && playAudioResponse(message.audioScript, message.id)}
                    businessInitial={currentBusiness.name.charAt(0).toUpperCase()}
                    index={idx}
                    isSpeaking={playingMessageId === message.id}
                    attachments={message.attachments}
                  />
                ))}

                {loading && <ChatThinkingState />}

                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-3">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => sendMessage()}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              isLoading={loading}
              audioEnabled={audioEnabled}
              onToggleAudio={() => {
                if (isPlayingAudio) {
                  stopAudio();
                } else {
                  setAudioEnabled(!audioEnabled);
                }
              }}
              attachedFiles={attachedFiles}
              onAttachFiles={setAttachedFiles}
              onRemoveFile={(id) => setAttachedFiles(prev => prev.filter(f => f.id !== id))}
            />
          </div>
        </div>
      </>
    );
  }

  // Mobile Layout
  return (
    <>
      <LearningNotification isVisible={learningIndicator} />

      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          <div className="flex items-center gap-2">
            <CEOAvatar size="sm" isSpeaking={isPlayingAudio} isThinking={loading} />
            <span className="text-sm font-medium text-foreground">CEO Chat</span>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 w-8 p-0">
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-2"
        >
          {messages.length === 0 ? (
            <ChatWelcome
              businessName={currentBusiness.name}
              onSelectSuggestion={sendMessage}
              disabled={loading}
            />
          ) : (
            <div className="space-y-3 pb-4">
              {messages.map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.created_at}
                  hasLearning={message.hasLearning}
                  audioScript={message.audioScript}
                  isPlaying={playingMessageId === message.id}
                  onPlayAudio={() => message.audioScript && playAudioResponse(message.audioScript, message.id)}
                  businessInitial={currentBusiness.name.charAt(0).toUpperCase()}
                  index={idx}
                  isSpeaking={playingMessageId === message.id}
                  attachments={message.attachments}
                />
              ))}

              {loading && <ChatThinkingState />}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-2 py-2 bg-background/90 backdrop-blur-sm border-t border-border/30">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage()}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            isLoading={loading}
            audioEnabled={audioEnabled}
            onToggleAudio={() => {
              if (isPlayingAudio) {
                stopAudio();
              } else {
                setAudioEnabled(!audioEnabled);
              }
            }}
            attachedFiles={attachedFiles}
            onAttachFiles={setAttachedFiles}
            onRemoveFile={(id) => setAttachedFiles(prev => prev.filter(f => f.id !== id))}
            isMobile
          />
        </div>
      </div>
    </>
  );
};

export default ChatPage;