import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  HelpCircle, 
  X,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ActionFeedbackButtonsProps {
  actionId?: string;
  missionId?: string;
  opportunityId?: string;
  onFeedbackSent?: () => void;
  size?: "sm" | "default";
}

type FeedbackStatus = "applied" | "tried" | "not_applied";

export const ActionFeedbackButtons = ({ 
  actionId, 
  missionId, 
  opportunityId,
  onFeedbackSent,
  size = "default"
}: ActionFeedbackButtonsProps) => {
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [showBlockerDialog, setShowBlockerDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | null>(null);
  const [blockerText, setBlockerText] = useState("");

  const sendFeedback = async (status: FeedbackStatus, blocker?: string) => {
    if (!currentBusiness) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("recommendations_feedback")
        .insert({
          business_id: currentBusiness.id,
          action_id: actionId || null,
          mission_id: missionId || null,
          opportunity_id: opportunityId || null,
          applied_status: status,
          blocker: blocker || null,
        });

      if (error) throw error;

      toast({
        title: status === "applied" ? "✅ ¡Excelente!" : status === "tried" ? "📝 Anotado" : "📋 Registrado",
        description: status === "applied" 
          ? "Gracias por aplicar la recomendación" 
          : status === "tried"
          ? "Intentar ya es un gran paso"
          : "Lo tendremos en cuenta para futuras sugerencias",
      });

      onFeedbackSent?.();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowBlockerDialog(false);
      setBlockerText("");
    }
  };

  const handleClick = (status: FeedbackStatus) => {
    if (status === "tried" || status === "not_applied") {
      setSelectedStatus(status);
      setShowBlockerDialog(true);
    } else {
      sendFeedback(status);
    }
  };

  const handleBlockerSubmit = () => {
    if (selectedStatus) {
      sendFeedback(selectedStatus, blockerText);
    }
  };

  const buttonClass = size === "sm" 
    ? "h-8 px-2 text-xs" 
    : "h-10 px-3";

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonClass, "border-success/30 text-success hover:bg-success/10")}
          onClick={() => handleClick("applied")}
          disabled={loading}
        >
          <Check className="w-4 h-4 mr-1" />
          {size === "sm" ? "✓" : "Lo apliqué"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonClass, "border-warning/30 text-warning hover:bg-warning/10")}
          onClick={() => handleClick("tried")}
          disabled={loading}
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          {size === "sm" ? "~" : "Lo intenté"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonClass, "border-muted-foreground/30 text-muted-foreground hover:bg-muted")}
          onClick={() => handleClick("not_applied")}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-1" />
          {size === "sm" ? "✗" : "No lo hice"}
        </Button>
      </div>

      {/* Blocker Dialog */}
      <Dialog open={showBlockerDialog} onOpenChange={setShowBlockerDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              ¿Qué te trabó?
            </DialogTitle>
            <DialogDescription>
              Tu feedback nos ayuda a mejorar las recomendaciones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Ej: No tuve tiempo, me faltó información, era muy complejo..."
              value={blockerText}
              onChange={(e) => setBlockerText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBlockerDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleBlockerSubmit} disabled={loading} className="flex-1">
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
