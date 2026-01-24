import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, MicOff, Camera, Sparkles, MessageSquare, Trash2, Volume2, VolumeX, Brain, Loader2, Square } from "lucide-react";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/app/GlassCard";
import { TypingIndicator } from "@/components/app/TypingIndicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { LessonsPanel } from "@/components/app/LessonsPanel";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  hasLearning?: boolean;
  audioScript?: string;
}

const SUGGESTIONS = [
  { icon: "📊", text: "¿Cómo puedo mejorar mis ventas?", category: "Ventas" },
  { icon: "⭐", text: "Analiza mis últimas reseñas", category: "Reputación" },
  { icon: "💡", text: "Dame ideas para promocionar el almuerzo", category: "Marketing" },
  { icon: "📈", text: "¿Qué métricas debería seguir?", category: "Análisis" },
  { icon: "👥", text: "Consejos para retener empleados", category: "Equipo" },
  { icon: "💰", text: "¿Cómo reducir costos sin afectar calidad?", category: "Finanzas" },
];

const ChatPage = () => {
  const { currentBusiness } = useBusiness();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialPromptSent, setInitialPromptSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle URL prompt parameter (from score click)
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
      setMessages((data || []).map(m => ({ ...m, role: m.role as "user" | "assistant" })));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // TTS Playback
  const playAudioResponse = useCallback(async (audioScript: string) => {
    if (!audioEnabled || !audioScript) return;

    try {
      setIsPlayingAudio(true);
      
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
          currentAudioRef.current = null;
        };
        
        audio.onerror = () => {
          setIsPlayingAudio(false);
          currentAudioRef.current = null;
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlayingAudio(false);
    }
  }, [audioEnabled]);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlayingAudio(false);
    }
  }, []);

  // Voice Recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
        // Send the transcribed text as a message
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
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "user",
        content: textToSend,
      });

      const messagesForAI = [...messages, tempUserMsg].map(m => ({
        role: m.role,
        content: m.content
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
        }
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
        setTimeout(() => setLearningIndicator(false), 3000);
      }
      
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "assistant",
        content: aiResponse,
      });

      // Update messages with metadata
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove temp user msg
        { ...tempUserMsg, id: `user-${Date.now()}` },
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: aiResponse,
          created_at: new Date().toISOString(),
          hasLearning,
          audioScript,
        }
      ]);

      // Play audio response if enabled
      if (audioScript && audioEnabled) {
        playAudioResponse(audioScript);
      }

      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el mensaje",
        variant: "destructive",
      });
      // Remove the temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    if (!currentBusiness) return;
    
    try {
      await supabase
        .from("chat_messages")
        .delete()
        .eq("business_id", currentBusiness.id);
      
      setMessages([]);
      toast({ title: "Conversación borrada" });
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  // Learning Indicator Component
  const LearningBadge = () => (
    <div className={cn(
      "fixed top-20 right-4 z-50 transition-all duration-500",
      learningIndicator ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
    )}>
      <Badge className="bg-emerald-500/90 text-white flex items-center gap-2 px-3 py-1.5 shadow-lg">
        <Brain className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">Aprendiendo...</span>
      </Badge>
    </div>
  );

  // Audio Controls Component
  const AudioControls = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Audio Output Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (isPlayingAudio) {
            stopAudio();
          } else {
            setAudioEnabled(!audioEnabled);
          }
        }}
        className={cn(
          "flex-shrink-0 transition-colors",
          audioEnabled ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-primary"
        )}
        title={audioEnabled ? "Desactivar audio" : "Activar audio"}
      >
        {isPlayingAudio ? (
          <Square className="w-5 h-5" />
        ) : audioEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </Button>

      {/* Voice Input */}
      <Button
        variant="ghost"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing || loading}
        className={cn(
          "flex-shrink-0 transition-all",
          isRecording 
            ? "text-red-500 hover:text-red-600 animate-pulse bg-red-500/10" 
            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
        )}
        title={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
      >
        {isTranscribing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>
    </div>
  );

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <VistaceoLogo size={72} variant="icon" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Tu asistente de IA
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Tu copiloto inteligente para gestionar tu negocio de manera eficiente.
        </p>
        <Button variant="hero" size="lg" onClick={() => window.location.href = "/setup"}>
          <Sparkles className="w-5 h-5 mr-2" />
          Configurar negocio
        </Button>
      </div>
    );
  }

  // Desktop Layout - ChatGPT Style with Lessons Panel
  if (!isMobile) {
    return (
      <>
        <LearningBadge />
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Chat con CEO
                </h1>
                <p className="text-muted-foreground">Tu mentor ejecutivo para {currentBusiness.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <AudioControls />
                {messages.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearChat}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Nueva conversación
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="mb-8">
                    <VistaceoLogo size={72} variant="icon" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    ¿En qué puedo ayudarte hoy?
                  </h2>
                  <p className="text-muted-foreground mb-10 max-w-md text-center">
                    Pregúntame sobre tu negocio, estrategias de venta, marketing, operaciones o cualquier desafío que enfrentes.
                  </p>
                  
                  {/* Suggestions Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
                    {SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(suggestion.text)}
                        className={cn(
                          "group p-4 rounded-xl border border-border bg-card text-left",
                          "hover:border-primary/30 hover:shadow-md hover:bg-secondary/50",
                          "transition-all duration-200"
                        )}
                      >
                        <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">
                          {suggestion.icon}
                        </span>
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {suggestion.text}
                        </p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {suggestion.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {messages.map((message, idx) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-4 animate-fade-in",
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        message.role === "user" 
                          ? "bg-primary/10 text-primary"
                          : "gradient-primary"
                      )}>
                        {message.role === "user" ? (
                          <span className="text-sm font-bold">
                            {currentBusiness.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <VistaceoLogo size={24} variant="icon" />
                        )}
                      </div>
                      
                      {/* Message */}
                      <div className={cn(
                        "flex-1 max-w-[80%]",
                        message.role === "user" && "text-right"
                      )}>
                        <div className={cn(
                          "inline-block rounded-2xl px-5 py-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        )}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString("es", { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </p>
                          {message.hasLearning && message.role === "assistant" && (
                            <Badge variant="secondary" className="text-xs py-0 px-1.5 gap-1">
                              <Brain className="w-3 h-3" />
                              Aprendido
                            </Badge>
                          )}
                          {message.audioScript && message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1.5 text-xs"
                              onClick={() => playAudioResponse(message.audioScript!)}
                              disabled={isPlayingAudio}
                            >
                              <Volume2 className="w-3 h-3 mr-1" />
                              Escuchar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-4 animate-fade-in">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <VistaceoLogo size={24} variant="icon" />
                      </div>
                      <div className="bg-secondary rounded-2xl px-5 py-4">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRecording ? "🎤 Grabando..." : "Escribe tu mensaje..."}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base"
                  disabled={isRecording || isTranscribing}
                />
                
                {/* Voice Input Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing || loading}
                  className={cn(
                    "transition-all",
                    isRecording 
                      ? "text-red-500 hover:text-red-600 animate-pulse bg-red-500/10" 
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
                
                <Button 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || loading || isRecording}
                  className="gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {audioEnabled ? "🔊 Audio habilitado" : "🔇 Audio desactivado"} • El asistente puede cometer errores.
              </p>
            </div>
          </div>
          
          {/* Lessons Sidebar */}
          <div className="w-80 flex-shrink-0 hidden xl:block">
            <div className="h-full overflow-y-auto rounded-xl border border-border bg-card/50 p-4">
              <LessonsPanel />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Mobile Layout
  return (
    <>
      <LearningBadge />
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="mb-6">
                <VistaceoLogo size={64} variant="icon" className="animate-float" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¿En qué puedo ayudarte?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
                Pregúntame sobre tu negocio, ventas, reseñas o pídeme ideas creativas.
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center max-w-sm">
                {SUGGESTIONS.slice(0, 3).map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(action.text)}
                    className={cn(
                      "group relative px-4 py-3 rounded-2xl",
                      "bg-card/80 backdrop-blur-sm border border-border/50",
                      "hover:border-primary/40 hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]",
                      "transition-all duration-300",
                      "text-sm font-medium text-foreground",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <VistaceoLogo size={32} variant="icon" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 backdrop-blur-sm",
                        message.role === "user"
                          ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-card/90 border border-border/50 text-foreground shadow-lg shadow-background/30"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    {message.hasLearning && message.role === "assistant" && (
                      <Badge variant="secondary" className="text-xs py-0 px-1.5 gap-1 w-fit mt-1 ml-1">
                        <Brain className="w-3 h-3" />
                        Aprendido
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="flex-shrink-0">
                    <VistaceoLogo size={32} variant="icon" />
                  </div>
                  <GlassCard className="px-5 py-4">
                    <TypingIndicator />
                  </GlassCard>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 pt-4 pb-2">
          <GlassCard variant="elevated" className="p-2">
            <div className="flex items-center gap-2">
              {/* Audio Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={cn(
                  "flex-shrink-0",
                  audioEnabled ? "text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? "🎤 Grabando..." : "Escribe un mensaje..."}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                disabled={isRecording || isTranscribing}
              />
              
              {/* Voice Input */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing || loading}
                className={cn(
                  "flex-shrink-0 transition-all",
                  isRecording 
                    ? "text-red-500 hover:text-red-600 animate-pulse bg-red-500/10" 
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
              
              <Button 
                onClick={() => sendMessage()} 
                disabled={!input.trim() || loading || isRecording}
                size="icon"
                className={cn(
                  "flex-shrink-0 gradient-primary",
                  "shadow-lg shadow-primary/30",
                  "hover:shadow-primary/50 hover:scale-105",
                  "disabled:opacity-50 disabled:shadow-none disabled:scale-100",
                  "transition-all duration-200"
                )}
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
