import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Camera, Loader2 } from "lucide-react";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const ChatPage = () => {
  const { currentBusiness } = useBusiness();
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

  const sendMessage = async () => {
    if (!input.trim() || !currentBusiness || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message locally first
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Save user message
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "user",
        content: userMessage,
      });

      // For now, add a placeholder AI response
      // In production, this would call the AI edge function
      const aiResponse = `Entendido. Estoy analizando tu pregunta sobre "${userMessage.slice(0, 50)}...". Esta funcionalidad estará disponible pronto con IA.`;
      
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "assistant",
        content: aiResponse,
      });

      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
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

  const quickActions = [
    "¿Cómo van mis ventas hoy?",
    "Dame ideas para promocionar el almuerzo",
    "Analiza mis últimas reseñas",
  ];

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <OwlLogo size={64} className="mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Hola, soy UCEO
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Primero necesitas configurar tu negocio para poder ayudarte.
        </p>
        <Button variant="hero" onClick={() => window.location.href = "/onboarding"}>
          Configurar negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <OwlLogo size={64} className="mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              ¿En qué puedo ayudarte?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Pregúntame sobre tu negocio, ventas, reseñas o pídeme ideas.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action)}
                  className="text-sm px-4 py-2 rounded-full bg-secondary border border-border hover:border-primary/30 text-foreground transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <OwlLogo size={32} className="flex-shrink-0 mt-1" />
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <OwlLogo size={32} className="flex-shrink-0 mt-1" />
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background pt-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Camera className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0"
          />
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || loading}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
