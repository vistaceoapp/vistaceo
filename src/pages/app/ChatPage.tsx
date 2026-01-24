import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { LessonsPanel } from "@/components/app/LessonsPanel";

// New premium chat components
import { ChatWelcome } from "@/components/chat/ChatWelcome";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
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
          throw new Error(`TTS request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.audioContent) {
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
        }
      } catch (error) {
        console.error("TTS error:", error);
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
    if (!textToSend || !currentBusiness || loading) return;

    setInput("");
    setLoading(true);
    setLearningIndicator(false);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "user",
        content: textToSend,
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
          inputType,
          messageId: `msg-${Date.now()}`,
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
        <CEOAvatar size="xl" />
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

        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <CEOAvatar size="md" isSpeaking={isPlayingAudio} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    CEO Chat
                    <span className="text-sm font-normal text-muted-foreground hidden sm:inline">
                      para {currentBusiness.name}
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Tu mentor ejecutivo con IA • Aprende de cada conversación
                  </p>
                </div>
              </div>

              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva conversación</span>
                </Button>
              )}
            </motion.div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className={cn(
                "flex-1 overflow-y-auto rounded-2xl",
                "border border-border/60 bg-gradient-to-b from-card/80 to-card/40",
                "backdrop-blur-sm relative"
              )}
            >
              <AnimatePresence mode="wait">
                {messages.length === 0 ? (
                  <ChatWelcome
                    businessName={currentBusiness.name}
                    onSelectSuggestion={sendMessage}
                    disabled={loading}
                  />
                ) : (
                  <motion.div
                    className="p-6 space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
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
                      />
                    ))}

                    <AnimatePresence>
                      {loading && <ChatThinkingState />}
                    </AnimatePresence>

                    <div ref={messagesEndRef} className="h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="mt-4">
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
              />
            </div>
          </div>

          {/* Lessons Sidebar */}
          <div className="w-80 flex-shrink-0 hidden xl:block">
            <motion.div
              className="h-full overflow-y-auto rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <LessonsPanel />
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Mobile Layout
  return (
    <>
      <LearningNotification isVisible={learningIndicator} />

      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-2 pb-4"
        >
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <ChatWelcome
                businessName={currentBusiness.name}
                onSelectSuggestion={sendMessage}
                disabled={loading}
              />
            ) : (
              <motion.div
                className="space-y-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
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
                  />
                ))}

                <AnimatePresence>
                  {loading && <ChatThinkingState />}
                </AnimatePresence>

                <div ref={messagesEndRef} className="h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 pt-2 pb-2 px-1">
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
            isMobile
          />
        </div>
      </div>
    </>
  );
};

export default ChatPage;
