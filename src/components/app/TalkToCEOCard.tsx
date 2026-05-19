import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/app/GlassCard";
import { useDashboardData } from "@/hooks/use-dashboard-data";

/**
 * Bloque suave para hablar con tu CEO/IA.
 * No protagonista — refuerza certeza y abre chat con contexto.
 */
export const TalkToCEOCard = () => {
  const navigate = useNavigate();
  const { data } = useDashboardData();
  const certainty = data.certaintyPct || 31;

  const openChat = () => {
    navigate(
      "/app/chat?prompt=" +
        encodeURIComponent(
          "Contame cómo funciona tu negocio hoy, qué vendés, quiénes son tus clientes y qué querés mejorar. Voy a usar esa información para mejorar tus oportunidades, tu radar, tu salud de negocio y tus misiones."
        )
    );
  };

  return (
    <GlassCard className="p-5 border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.04]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">Contale más a tu CEO</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Tu nivel de certeza actual es <span className="font-semibold text-foreground">{certainty}%</span>. Cuanto más conozca tu negocio,
            mejores serán tus oportunidades, misiones y recomendaciones.
          </p>
          <Button onClick={openChat} variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary/40 hover:text-primary">
            Hablar con mi CEO
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default TalkToCEOCard;
