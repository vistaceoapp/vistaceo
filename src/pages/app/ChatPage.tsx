import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Settings2, MessageCircle, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFreeLimits, FREE_LIMITS } from "@/hooks/use-free-limits";
import { safeLocalStorage } from "@/lib/safe-storage";

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
  isNew?: boolean;
}

const ChatPage = () => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { canCreate, remaining, isPro, usage, refresh: refreshLimits } = useFreeLimits();
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

  // Audio recording states (envío de audio de usuario; sin reproducción de voz del CEO)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [learningIndicator, setLearningIndicator] = useState(false);

  // File attachments
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.removeAttribute('src');
        currentAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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

  // Voice Recording (envío de audio del usuario → transcripción a texto)
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      
      // Check supported mime types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          await transcribeAudio(audioBlob);
        }
      };
      
      mediaRecorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        toast({ title: "Error de grabación", variant: "destructive" });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Collect data every 250ms for reliability
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      toast({
        title: "Micrófono no disponible",
        description: "Verificá los permisos del navegador",
        variant: "destructive",
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

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

    // Free user limit check
    if (!isPro && !canCreate.chat) {
      toast({
        title: "Límite alcanzado",
        description: "Usaste tus 3 mensajes gratis este mes. Actualizá a Pro para mensajes ilimitados.",
        variant: "destructive",
      });
      return;
    }

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
            dataUrl: f.type === "image" ? f.preview : undefined,
          })),
        },
      });

      // Handle Free plan limit reached (HTTP 402 from edge function)
      // supabase.functions.invoke maps non-2xx into aiError; the body is in aiError.context
      if (aiError) {
        let limitPayload: any = null;
        try {
          const ctx: any = (aiError as any).context;
          if (ctx && typeof ctx.json === "function") {
            limitPayload = await ctx.json();
          }
        } catch {
          // ignore parse error
        }
        // Some clients return the body inline in aiData even on error
        if (!limitPayload && aiData && (aiData as any).error === "free_limit_reached") {
          limitPayload = aiData;
        }

        if (limitPayload?.error === "free_limit_reached") {
          toast({
            title: "Límite del plan Gratis alcanzado",
            description: limitPayload.message ||
              "Llegaste a los 3 mensajes mensuales. Pasate a Pro para chatear sin límites.",
            action: (
              <ToastAction altText="Ver Pro" onClick={() => navigate("/checkout")}>
                Ver Pro
              </ToastAction>
            ),
          });
          // Roll back the optimistic user message
          setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
          setLoading(false);
          if (!isPro) refreshLimits();
          return;
        }

        console.error("AI error:", aiError);
        throw new Error(aiError.message || "Error al comunicarse con el asistente");
      }

      // Inline 402 (rare path: body returned as data)
      if (aiData && (aiData as any).error === "free_limit_reached") {
        toast({
          title: "Límite del plan Gratis alcanzado",
          description: (aiData as any).message ||
            "Llegaste a los 3 mensajes mensuales. Pasate a Pro para chatear sin límites.",
          action: (
            <ToastAction altText="Ver Pro" onClick={() => navigate("/checkout")}>
              Ver Pro
            </ToastAction>
          ),
        });
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setLoading(false);
        if (!isPro) refreshLimits();
        return;
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
        isNew: true,
      };

      setMessages((prev) => [
        ...prev.slice(0, -1).map(m => ({ ...m, isNew: false })),
        { ...tempUserMsg, id: `user-${Date.now()}`, isNew: false },
        newAssistantMsg,
      ]);

      // Voz del CEO desactivada — el chat es 100% texto. Sólo se admite envío de audio del usuario.

      // Messages already updated via setMessages above — skip redundant fetch
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
      if (!isPro) refreshLimits();
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
        <Button variant="default" size="lg" onClick={() => navigate("/setup")} className="gradient-primary">
          Configurar negocio
        </Button>
      </div>
    );
  }

  // Chat is accessible to all users — Free users have 3 messages/month limit enforced at send time
  return (
    <>
      <LearningNotification isVisible={learningIndicator} />

      <div className={cn(
        "flex flex-col",
        isMobile ? "h-[calc(100dvh-130px)]" : "h-[calc(100vh-100px)]"
      )}>
        {/* Header - premium glassmorphism */}
        <div className={cn(
          "flex items-center justify-between bg-background/60 backdrop-blur-xl border-b border-border/20",
          "sticky top-0 z-10",
          isMobile ? "px-3 py-2.5" : "px-5 py-3"
        )}>
          <div className="flex items-center gap-3">
            <CEOAvatar size={isMobile ? "sm" : "md"} isThinking={loading} />
            <div className="min-w-0">
              <h1 className={cn(
                "font-bold text-foreground truncate",
                isMobile ? "text-sm" : "text-lg"
              )}>
                Tu CEO Virtual
              </h1>
              {!isMobile && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {currentBusiness.name} — Siempre disponible
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <CEOPersonalitySelector
              value={personality}
              onChange={handlePersonalityChange}
              compact={isMobile}
            />
            
            <ChatHistoryPanel
              businessId={currentBusiness.id}
              compact={isMobile}
            />
            
            <ChatLearningPanel
              businessId={currentBusiness.id}
              compact={isMobile}
            />

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
            "flex-1 overflow-y-auto scroll-smooth",
            isMobile ? "px-3" : "px-5"
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
                  onReplayAudio={() => message.audioScript && playAudioResponse(message.audioScript, message.id)}
                  businessInitial={currentBusiness.name.charAt(0).toUpperCase()}
                  businessId={currentBusiness.id}
                  index={idx}
                  isSpeaking={playingMessageId === message.id}
                  attachments={message.attachments}
                  missionSuggestions={message.missionSuggestions}
                  isNew={message.isNew}
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
            "py-2 flex items-center justify-center",
            isMobile ? "px-3" : "px-5"
          )}>
            <SuggestedQuestionsButton
              businessId={currentBusiness.id}
              onSelectQuestion={sendMessage}
              disabled={loading}
            />
          </div>
        )}

        {/* Free user message counter */}
        {!isPro && (
          <div className={cn(
            "flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border/20",
            isMobile && "px-3"
          )}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{usage.chatMessages}/{FREE_LIMITS.chatMessages} mensajes este mes</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary hover:text-primary gap-1"
              onClick={() => navigate("/checkout")}
            >
              <Crown className="w-3 h-3" />
              Pro = ilimitados
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className={cn(
          "bg-background/80 backdrop-blur-xl border-t border-border/20",
          isMobile ? "px-3 py-2" : "px-5 py-3"
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
