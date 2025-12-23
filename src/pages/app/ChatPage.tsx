import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Camera, Sparkles, Plus, MessageSquare, Trash2 } from "lucide-react";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/app/GlassCard";
import { TypingIndicator } from "@/components/app/TypingIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentBusiness) {
      fetchMessages();
    }
  }, [currentBusiness]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || !currentBusiness || loading) return;

    setInput("");
    setLoading(true);

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

      const { data: aiData, error: aiError } = await supabase.functions.invoke("uceo-chat", {
        body: {
          messages: messagesForAI,
          businessContext: {
            name: currentBusiness.name,
            category: currentBusiness.category,
            country: currentBusiness.country,
          }
        }
      });

      if (aiError) {
        console.error("AI error:", aiError);
        throw new Error(aiError.message || "Error al comunicarse con UCEO");
      }

      const aiResponse = aiData?.message || "Lo siento, no pude procesar tu mensaje. Intenta de nuevo.";
      
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "assistant",
        content: aiResponse,
      });

      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el mensaje",
        variant: "destructive",
      });
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

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
          <OwlLogo size={80} className="relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Hola, soy UCEO
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Tu copiloto de IA para gestionar tu negocio gastronómico de manera inteligente.
        </p>
        <Button variant="hero" size="lg" onClick={() => window.location.href = "/onboarding"}>
          <Sparkles className="w-5 h-5 mr-2" />
          Configurar negocio
        </Button>
      </div>
    );
  }

  // Desktop Layout - ChatGPT Style
  if (!isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              Chat con UCEO
            </h1>
            <p className="text-muted-foreground">Tu asistente de IA para {currentBusiness.name}</p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="w-4 h-4 mr-2" />
              Nueva conversación
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
                <OwlLogo size={80} className="relative z-10" />
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
                      <OwlLogo size={24} />
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
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {new Date(message.created_at).toLocaleTimeString("es", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <OwlLogo size={24} />
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
              placeholder="Escribe tu mensaje..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base"
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={!input.trim() || loading}
              className="gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            UCEO puede cometer errores. Considera verificar información importante.
          </p>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-glow-pulse" />
              <div className="relative">
                <OwlLogo size={72} className="animate-float" />
              </div>
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
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full" />
                    <OwlLogo size={36} className="relative z-10" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-sm",
                    message.role === "user"
                      ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-card/90 border border-border/50 text-foreground shadow-lg shadow-background/30"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full animate-pulse" />
                  <OwlLogo size={36} className="relative z-10" />
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Camera className="w-5 h-5" />
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
            />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Mic className="w-5 h-5" />
            </Button>
            
            <Button 
              onClick={() => sendMessage()} 
              disabled={!input.trim() || loading}
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
  );
};

export default ChatPage;
