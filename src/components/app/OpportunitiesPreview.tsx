import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Lightbulb, TrendingUp, FlaskConical, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/app/GlassCard";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { sanitizeAIOutput } from "@/lib/aiOutputSanitizer";

type OppType = "interna" | "tendencia" | "id";

interface Opp {
  id: string;
  title: string;
  why: string;
  type: OppType;
  certainty: "Inicial" | "Estimado" | "Según tu rubro" | "Señal inicial";
}

const TYPE_META: Record<OppType, { label: string; icon: any; tone: string; cta: string; route: string }> = {
  interna: {
    label: "Oportunidad interna",
    icon: Lightbulb,
    tone: "bg-primary/10 text-primary",
    cta: "Ver oportunidad interna",
    route: "/app/radar?tab=oportunidades",
  },
  tendencia: {
    label: "Tendencia",
    icon: TrendingUp,
    tone: "bg-accent/10 text-accent",
    cta: "Ver tendencia",
    route: "/app/radar?tab=oportunidades",
  },
  id: {
    label: "I+D del sector",
    icon: FlaskConical,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    cta: "Ver I+D del sector",
    route: "/app/radar?tab=id",
  },
};

/**
 * Mínimo 3 oportunidades — nunca vacío.
 * Mezcla datos reales (learning_items) con fallback ejecutivo según rubro.
 */
export const OpportunitiesPreview = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [opps, setOpps] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentBusiness) return;
      try {
        const { data } = await supabase
          .from("learning_items")
          .select("id, title, content, item_type")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false })
          .limit(6);

        const real: Opp[] = (data || []).slice(0, 3).map((d: any) => ({
          id: d.id,
          title: sanitizeAIOutput(d.title || "Oportunidad detectada"),
          why: sanitizeAIOutput(d.content || "").slice(0, 160),
          type: mapType(d.item_type),
          certainty: "Estimado",
        }));

        const fallbacks = getFallbackOpps(currentBusiness?.category);
        const merged = [...real];
        for (const f of fallbacks) {
          if (merged.length >= 3) break;
          if (!merged.some((m) => m.type === f.type)) merged.push(f);
        }
        // Garantizar al menos los 3 tipos clave
        const final: Opp[] = [];
        for (const t of ["interna", "tendencia", "id"] as OppType[]) {
          const found = merged.find((m) => m.type === t);
          final.push(found || fallbacks.find((f) => f.type === t)!);
        }
        setOpps(final);
      } catch {
        setOpps(getFallbackOpps(currentBusiness?.category));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentBusiness?.id]);

  if (loading) {
    return <GlassCard className="p-5 h-64 animate-pulse" />;
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <Compass className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Radar de oportunidades</h3>
            <p className="text-xs text-muted-foreground">
              Con la información actual, detectamos oportunidades iniciales para orientar tus próximas decisiones.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs hidden sm:inline-flex"
          onClick={() => navigate("/app/radar")}
        >
          Ver todo el radar
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {opps.map((o, i) => {
          const meta = TYPE_META[o.type];
          const Icon = meta.icon;
          return (
            <button
              key={o.id + i}
              type="button"
              onClick={() => navigate(meta.route)}
              className={cn(
                "group text-left rounded-2xl border border-border/50 p-3.5",
                "bg-card hover:bg-muted/30 hover:border-primary/30",
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                "flex flex-col gap-2"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg", meta.tone)}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {meta.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                {o.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{o.why}</p>
              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-[10px] font-medium text-muted-foreground/80">{o.certainty}</span>
                <span className="text-xs font-medium text-primary inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                  {meta.cta}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};

function mapType(itemType?: string): OppType {
  const t = (itemType || "").toLowerCase();
  if (["trend", "macro", "insight"].includes(t)) return "tendencia";
  if (["product", "platform", "benchmark"].includes(t)) return "id";
  return "interna";
}

function getFallbackOpps(category?: string): Opp[] {
  const cat = (category || "").toLowerCase();
  const isService = /servicio|consultor|estudio|asesor|profesion|coach/.test(cat);

  return [
    {
      id: "fb-internal",
      title: "Claridad comercial",
      why: isService
        ? "Tu servicio puede captar más clientes comunicando una propuesta más simple y fácil de entender."
        : "Tu negocio puede captar más clientes si comunica una oferta más simple y fácil de entender.",
      type: "interna",
      certainty: "Inicial",
    },
    {
      id: "fb-trend",
      title: "Momento de mayor intención",
      why: "Hay oportunidad de reforzar los momentos donde tus clientes tienen más intención de compra o consulta.",
      type: "tendencia",
      certainty: "Según tu rubro",
    },
    {
      id: "fb-id",
      title: "Movimiento del sector",
      why: "Tu rubro está cambiando y puede beneficiarse de acciones simples de diferenciación, comunicación o nuevos canales.",
      type: "id",
      certainty: "Señal inicial",
    },
  ];
}

export default OpportunitiesPreview;
