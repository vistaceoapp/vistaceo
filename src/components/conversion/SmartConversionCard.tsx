// VISTACEO Conversion OS — Smart Card.
// Renderiza la Next Best Action si existe; si no, no muestra nada.
// 100% no invasivo: respeta segment + intent + placement.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import {
  fetchNextBestAction,
  trackConversionEvent,
} from "@/lib/conversion-tracker";

type NBA = {
  decision_id: string;
  strategy: string;
  placement: string | null;
  intent: string;
  segment: string | null;
};

const COPY: Record<string, { title: string; body: string; cta: string; route: string }> = {
  first_value: {
    title: "Activá tu primer logro",
    body: "Te falta un paso para ver el verdadero valor de VISTACEO en tu negocio.",
    cta: "Ver mi próximo paso",
    route: "/app/today",
  },
  activation: {
    title: "Empecemos por lo importante",
    body: "Tu CEO virtual ya tiene contexto. Hacé tu primera consulta y arrancá fuerte.",
    cta: "Hablar con el CEO",
    route: "/app/chat",
  },
  deepen: {
    title: "Sumá una capa más de inteligencia",
    body: "Tenés data lista para profundizar. Revisá las oportunidades del día.",
    cta: "Ver oportunidades",
    route: "/app/today",
  },
  show_pro_value: {
    title: "Esto se desbloquea con Pro",
    body: "Tu interés en esta función se nota. Mirá qué cambia con el plan Pro.",
    cta: "Conocer Pro",
    route: "/app/upgrade",
  },
  upgrade: {
    title: "Estás listo para Pro",
    body: "Tu uso muestra que el Pro va a multiplicar tus resultados.",
    cta: "Pasar a Pro",
    route: "/app/upgrade",
  },
  upgrade_contextual: {
    title: "Pro está hecho para vos",
    body: "Tu actividad reciente coincide con los casos donde Pro genera mayor impacto.",
    cta: "Ver Pro",
    route: "/app/upgrade",
  },
  recovery: {
    title: "Tu pago quedó a mitad de camino",
    body: "Retomalo en un toque y desbloqueá todo Pro.",
    cta: "Retomar pago",
    route: "/checkout",
  },
  recover_with_value: {
    title: "Volvé con un paso simple",
    body: "Te preparamos algo concreto para retomar el control de tu negocio.",
    cta: "Ver mi siguiente paso",
    route: "/app/today",
  },
};

export function SmartConversionCard({ placement }: { placement?: string }) {
  const navigate = useNavigate();
  const [nba, setNba] = useState<NBA | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchNextBestAction().then((a) => {
      if (cancelled) return;
      if (!a) return;
      // Si pasamos placement explícito, sólo render si coincide.
      if (placement && a.placement && a.placement !== placement) return;
      setNba(a);
    });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!nba || dismissed) return null;
  const copy = COPY[nba.intent];
  if (!copy) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="rounded-lg bg-primary/10 p-2">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{copy.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{copy.body}</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                trackConversionEvent("conversion_card_clicked", {
                  decision_id: nba.decision_id,
                  intent: nba.intent,
                });
                navigate(copy.route);
              }}
            >
              {copy.cta}
            </Button>
          </div>
        </div>
        <button
          onClick={() => {
            trackConversionEvent("conversion_card_dismissed", {
              decision_id: nba.decision_id,
              intent: nba.intent,
            });
            setDismissed(true);
          }}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>
      </CardContent>
    </Card>
  );
}

export default SmartConversionCard;
