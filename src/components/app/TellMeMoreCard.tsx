import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mic, Camera, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";

interface TellMeMoreCardProps {
  onComplete?: () => void;
  className?: string;
}

export const TellMeMoreCard = ({ onComplete, className }: TellMeMoreCardProps) => {
  const { currentBusiness } = useBusiness();
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!currentBusiness || !text.trim()) return;
    setSaving(true);

    try {
      // Record as a signal for the brain
      await supabase.from("signals").insert({
        business_id: currentBusiness.id,
        signal_type: "user_input",
        source: "tell_me_more",
        content: { text: text.trim() },
        raw_text: text.trim(),
        confidence: "high",
        importance: 7
      });

      toast({
        title: "¡Gracias por contarme!",
        description: "Voy a usar esta info para darte mejores recomendaciones.",
      });

      setText("");
      setIsExpanded(false);
      onComplete?.();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isExpanded) {
    return (
      <GlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Contame más</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Contame algo sobre tu negocio, un problema que tengas, algo que funcionó bien, o cualquier cosa que creas relevante..."
          className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none h-32 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
        />

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Mic className="w-4 h-4" />
          </Button>
          <div className="flex-1" />
          <Button 
            onClick={handleSubmit}
            disabled={!text.trim() || saving}
            className="gradient-primary"
          >
            <Send className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Enviar"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          💡 Todo lo que me cuentes mejora las recomendaciones futuras
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      interactive 
      className={cn("p-4 cursor-pointer", className)}
      onClick={() => setIsExpanded(true)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Tengo tiempo, quiero contarte más</p>
          <p className="text-xs text-muted-foreground">Opcional • Mejora las recomendaciones</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default TellMeMoreCard;