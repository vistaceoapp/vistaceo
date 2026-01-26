import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Settings2 } from "lucide-react";
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
import { CEOPersonalitySelector, CEOPersonality } from "@/components/chat/CEOPersonalitySelector";
import { ChatLearningPanel } from "@/components/chat/ChatLearningPanel";
import { ChatHistoryPanel } from "@/components/chat/ChatHistoryPanel";
import { ChatSuggestedQuestions } from "@/components/chat/ChatSuggestedQuestions";
import { SuggestedQuestionsButton } from "@/components/chat/SuggestedQuestionsButton";
import { AudioSettings } from "@/components/chat/AudioSettingsPopover";

interface MissionSuggestion {
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  kpi?: string;
  definition_of_done?: string[];
  due_hint?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  hasLearning?: boolean;
  audioScript?: string;
  attachments?: AttachedFile[];
  missionSuggestions?: MissionSuggestion[];
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

  // Personality state - "balanceada" is default
  const [personality, setPersonality] = useState<CEOPersonality>("balanceada");
  const [personalityPrompt, setPersonalityPrompt] = useState(`Sos un CEO mentor con estilo balanceado y profesional. Combinás claridad con calidez.
- Usá un tono profesional pero accesible
- Sé claro y estructurado sin ser frío
- Incluí datos cuando sean relevantes
- Motivá sin exagerar
- Adaptate al contexto: más técnico para métricas, más cercano para problemas personales`);

  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  // Load audio settings from localStorage
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem("vistaceo-audio-settings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.log("Failed to load audio settings");
    }
    return {
      enabled: true,
      speed: 1.0,
      autoPlay: true,
    };
  });
  
  const [learningIndicator, setLearningIndicator] = useState(false);
  
  // Persist audio settings
  useEffect(() => {
    localStorage.setItem("vistaceo-audio-settings", JSON.stringify(audioSettings));
    console.log("Audio settings updated:", audioSettings);
  }, [audioSettings]);

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

  // Use ref to always have current audio settings (avoids stale closure)
  const audioSettingsRef = useRef(audioSettings);
  useEffect(() => {
    audioSettingsRef.current = audioSettings;
  }, [audioSettings]);

  // TTS Playback - uses ref to get current settings
  const playAudioResponse = useCallback(
    async (audioScript: string, messageId?: string) => {
      const currentSettings = audioSettingsRef.current;
      
      // Check if audio is enabled
      if (!currentSettings.enabled) {
        console.log("Audio disabled, skipping TTS");
        return;
      }
      
      if (!audioScript) {
        console.log("No audio script provided");
        return;
      }

      try {
        setIsPlayingAudio(true);
        if (messageId) setPlayingMessageId(messageId);
        
        console.log("TTS Request - Speed:", currentSettings.speed, "Enabled:", currentSettings.enabled);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ 
              text: audioScript,
              speed: currentSettings.speed,
            }),
          }
        );

        if (!response.ok) {
          console.log("TTS request failed, continuing without audio");
          setIsPlayingAudio(false);
          setPlayingMessageId(null);
          return;
        }

        const data = await response.json();

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
    [] // No dependencies needed - uses ref
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

    const messageAttachments = [...attachedFiles];
    
    setInput("");
    setAttachedFiles([]);
    setLoading(true);
    setLearningIndicator(false);

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
          personalityPrompt: personalityPrompt,
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
      
      // Extract mission suggestions from learningExtract
      const missionSuggestions = aiData?.learningExtract?.missions_suggested as MissionSuggestion[] | undefined;

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
        missionSuggestions: missionSuggestions && missionSuggestions.length > 0 ? missionSuggestions : undefined,
      };

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...tempUserMsg, id: `user-${Date.now()}` },
        newAssistantMsg,
      ]);

      // Check current settings via ref for autoplay
      const currentSettings = audioSettingsRef.current;
      if (audioScript && currentSettings.enabled && currentSettings.autoPlay) {
        console.log("Auto-playing audio response");
        playAudioResponse(audioScript, newAssistantMsg.id);
      } else {
        console.log("Skipping auto-play:", { 
          hasAudioScript: !!audioScript, 
          enabled: currentSettings.enabled, 
          autoPlay: currentSettings.autoPlay 
        });
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
      toast({ title: "Nueva conversación iniciada" });
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handlePersonalityChange = (p: CEOPersonality, prompt: string) => {
    setPersonality(p);
    setPersonalityPrompt(prompt);
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

  // Unified Layout (responsive)
  return (
    <>
      <LearningNotification isVisible={learningIndicator} />

      <div className={cn(
        "flex flex-col",
        isMobile ? "h-[calc(100dvh-130px)]" : "h-[calc(100vh-100px)]"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between border-b border-border/30 bg-background/80 backdrop-blur-sm",
          isMobile ? "px-3 py-2" : "px-4 py-3 mb-2"
        )}>
          <div className="flex items-center gap-3">
            <CEOAvatar size={isMobile ? "sm" : "md"} isSpeaking={isPlayingAudio} isThinking={loading} />
            <div className="min-w-0">
              <h1 className={cn(
                "font-semibold text-foreground truncate",
                isMobile ? "text-sm" : "text-lg"
              )}>
                CEO Chat
              </h1>
              {!isMobile && (
                <p className="text-xs text-muted-foreground truncate">{currentBusiness.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Personality Selector */}
            <CEOPersonalitySelector
              value={personality}
              onChange={handlePersonalityChange}
              compact={isMobile}
            />
            
            {/* History Panel */}
            <ChatHistoryPanel
              businessId={currentBusiness.id}
              compact={isMobile}
            />
            
            {/* Learning Panel */}
            <ChatLearningPanel
              businessId={currentBusiness.id}
              compact={isMobile}
            />

            {/* New Conversation */}
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                onClick={clearChat} 
                className={cn(
                  "gap-1.5 text-muted-foreground hover:text-foreground",
                  isMobile && "h-8 w-8 p-0"
                )}
              >
                <Plus className={cn("w-4 h-4", isMobile && "w-4 h-4")} />
                {!isMobile && <span className="text-sm">Nueva</span>}
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className={cn(
            "flex-1 overflow-y-auto",
            isMobile ? "px-3" : "px-4 rounded-xl border border-border/30 bg-card/30"
          )}
        >
          {messages.length === 0 ? (
            <ChatWelcome
              businessId={currentBusiness.id}
              businessName={currentBusiness.name}
              onSelectSuggestion={sendMessage}
              disabled={loading}
            />
          ) : (
            <div className={cn(
              "space-y-4 py-4",
              isMobile && "space-y-3"
            )}>
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
                  businessId={currentBusiness.id}
                  index={idx}
                  isSpeaking={playingMessageId === message.id}
                  attachments={message.attachments}
                  missionSuggestions={message.missionSuggestions}
                />
              ))}

              {loading && <ChatThinkingState compact={isMobile} />}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>

        {/* Suggested Questions Button (when has messages) */}
        {messages.length > 0 && !loading && (
          <div className={cn(
            "py-2 border-t border-border/20 flex items-center justify-center",
            isMobile ? "px-3" : "px-4"
          )}>
            <SuggestedQuestionsButton
              businessId={currentBusiness.id}
              onSelectQuestion={sendMessage}
              disabled={loading}
            />
          </div>
        )}

        {/* Input Area */}
        <div className={cn(
          "bg-background/90 backdrop-blur-sm",
          isMobile ? "px-3 py-2 border-t border-border/30" : "mt-2"
        )}>
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage()}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            isLoading={loading}
            audioSettings={audioSettings}
            onAudioSettingsChange={setAudioSettings}
            isPlayingAudio={isPlayingAudio}
            onStopAudio={stopAudio}
            attachedFiles={attachedFiles}
            onAttachFiles={setAttachedFiles}
            onRemoveFile={(id) => setAttachedFiles(prev => prev.filter(f => f.id !== id))}
            isMobile={isMobile}
          />
        </div>
      </div>
    </>
  );
};

export default ChatPage;
