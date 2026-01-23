import { useState, useEffect } from "react";
import { Radar, TrendingUp, ChevronRight, Lock, Sparkles, Lightbulb, ExternalLink, Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  source?: string;
  date: string;
  isExternal?: boolean;
}

interface RadarWidgetProps {
  isPro?: boolean;
  className?: string;
}

// Generate sector-specific demo insights based on business type
const getSectorInsights = (businessType: string | undefined, sector: string | undefined): MarketInsight[] => {
  const sectorMap: Record<string, MarketInsight[]> = {
    // GASTRONOMÍA
    restaurante: [
      { id: "r1", title: "Tendencia: Menús degustación en alza", description: "Los restaurantes que implementaron menús degustación vieron un 28% más de ticket promedio.", category: "tendencias", source: "Mercado local", date: "Esta semana" },
    ],
    cafeteria: [
      { id: "c1", title: "Tendencia: Specialty coffee crece 35%", description: "El café de especialidad está creciendo entre millennials y Gen Z en tu zona.", category: "tendencias", source: "Mercado local", date: "Esta semana" },
    ],
    bar: [
      { id: "b1", title: "Tendencia: Cócteles sin alcohol +40%", description: "La demanda de mocktails premium está en auge, especialmente en afterwork.", category: "tendencias", source: "Mercado local", date: "Esta semana" },
    ],
    heladeria: [
      { id: "h1", title: "Tendencia: Helados artesanales veganos", description: "Los helados plant-based están creciendo 45% vs año anterior.", category: "tendencias", source: "Mercado local", date: "Esta semana" },
    ],
    panaderia: [
      { id: "p1", title: "Tendencia: Masa madre y fermentados", description: "El pan de masa madre tiene 50% más demanda que el pan tradicional.", category: "tendencias", source: "Mercado local", date: "Esta semana" },
    ],
    // RETAIL
    moda: [
      { id: "rm1", title: "Tendencia: Moda circular en crecimiento", description: "Las tiendas con opciones de second-hand ven 25% más tráfico.", category: "tendencias", source: "Análisis retail", date: "Esta semana" },
    ],
    electronica: [
      { id: "re1", title: "Tendencia: Reparación antes que reemplazo", description: "El servicio técnico agrega 30% a la facturación promedio.", category: "tendencias", source: "Análisis retail", date: "Esta semana" },
    ],
    // SALUD
    spa: [
      { id: "s1", title: "Tendencia: Wellness integral 360°", description: "Los spas con programas integrales tienen 40% más retención.", category: "tendencias", source: "Mercado wellness", date: "Esta semana" },
    ],
    consultorio: [
      { id: "co1", title: "Tendencia: Telemedicina complementaria", description: "Los consultorios con seguimiento virtual retienen 35% más pacientes.", category: "tendencias", source: "Mercado salud", date: "Esta semana" },
    ],
    // TURISMO
    hotel: [
      { id: "ho1", title: "Tendencia: Experiencias locales únicas", description: "Los hoteles con tours locales exclusivos tienen 45% más bookings.", category: "tendencias", source: "Mercado turismo", date: "Esta semana" },
    ],
    // B2B
    consultoria: [
      { id: "co1", title: "Tendencia: Servicios por suscripción", description: "Las consultoras con modelo retainer crecen 60% más rápido.", category: "tendencias", source: "Mercado B2B", date: "Esta semana" },
    ],
  };

  // Get specific sector insights or fallback to generic
  const typeKey = businessType?.toLowerCase() || "";
  const sectorKey = sector?.toLowerCase() || "";
  
  return sectorMap[typeKey] || sectorMap[sectorKey] || [
    { id: "g1", title: "Tendencia: Digitalización acelerada", description: "Los negocios con presencia digital activa crecen 40% más rápido.", category: "tendencias", source: "Análisis del mercado", date: "Esta semana" },
  ];
};

// Pro insights adapted by sector
const getProInsights = (businessType: string | undefined): MarketInsight[] => {
  const isGastro = ["restaurante", "cafeteria", "bar", "heladeria", "panaderia", "dark_kitchen", "fast_casual"].includes(businessType?.toLowerCase() || "");
  
  if (isGastro) {
    return [
      { id: "pro-1", title: "Tu competencia bajó precios en delivery", description: "2 competidores directos redujeron sus precios 15% esta semana.", category: "competencia", source: "Monitoreo automático", date: "Hoy", isExternal: true },
      { id: "pro-2", title: "Nuevo local abrió a 500m", description: "Se detectó apertura de un local similar en tu zona de influencia.", category: "mercado", source: "Google Maps", date: "Ayer", isExternal: true },
      { id: "pro-3", title: "Demanda alta para brunch este finde", description: "Las búsquedas de 'brunch' en tu zona subieron 40%.", category: "oportunidad", source: "Tendencias locales", date: "Hoy" },
    ];
  }
  
  return [
    { id: "pro-1", title: "Nuevo competidor en tu zona", description: "Se detectó apertura de un negocio similar a 800m.", category: "competencia", source: "Monitoreo automático", date: "Hoy", isExternal: true },
    { id: "pro-2", title: "Tu sector crece 15% este trimestre", description: "Las búsquedas relacionadas a tu rubro aumentaron en tu ciudad.", category: "mercado", source: "Tendencias", date: "Ayer", isExternal: true },
    { id: "pro-3", title: "Oportunidad: evento local próximo", description: "Hay un evento masivo cerca que podría traer tráfico adicional.", category: "oportunidad", source: "Calendario local", date: "Hoy" },
  ];
};

export const RadarWidget = ({ isPro = false, className }: RadarWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [currentBusiness, isPro, brain?.primary_business_type]);

  const fetchInsights = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      // Fetch real learning items from database
      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .in("item_type", ["trend", "benchmark", "platform", "competitive"])
        .order("created_at", { ascending: false })
        .limit(isPro ? 3 : 1);

      if (error) throw error;

      if (data && data.length > 0) {
        setInsights(data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.content || "",
          category: item.item_type === "competitive" ? "competencia" : "tendencia",
          source: item.source || "Radar I+D",
          date: new Date(item.created_at).toLocaleDateString("es", { weekday: "long" }),
          isExternal: true,
        })));
      } else {
        // Use sector-personalized demo insights based on brain type
        const sectorInsights = getSectorInsights(
          brain?.primary_business_type, 
          currentBusiness.category
        );
        setInsights(isPro ? getProInsights(brain?.primary_business_type) : sectorInsights);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      // Fallback to personalized demo data
      const sectorInsights = getSectorInsights(
        brain?.primary_business_type, 
        currentBusiness?.category
      );
      setInsights(isPro ? getProInsights(brain?.primary_business_type) : sectorInsights);
    } finally {
      setLoading(false);
    }
  };

  const currentInsight = insights[0];

  if (loading) {
    return (
      <GlassCard className={cn("p-4 animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/2 mb-4" />
        <div className="h-16 bg-muted rounded" />
      </GlassCard>
    );
  }

  // Free version
  if (!isPro) {
    return (
      <GlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-accent" />
            <h4 className="font-semibold text-foreground text-sm">Hoy en tu mercado</h4>
          </div>
          <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
            Semanal
          </Badge>
        </div>

        {currentInsight && (
          <button
            className="w-full p-3 rounded-xl bg-accent/5 border border-accent/10 mb-3 text-left hover:border-accent/30 transition-colors cursor-pointer"
            onClick={() => navigate("/app/radar?tab=id")}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm mb-1">{currentInsight.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{currentInsight.description}</p>
                <p className="text-[10px] text-muted-foreground mt-2 italic">{currentInsight.date}</p>
              </div>
            </div>
          </button>
        )}

        {/* Pro CTA */}
        <button
          className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => navigate("/app/radar?tab=id")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-sm">Insights diarios</p>
              <p className="text-xs text-muted-foreground">Monitoreo de competencia en tiempo real</p>
            </div>
            <Button 
              size="sm" 
              className="gradient-primary h-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/app/more");
              }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Pro
            </Button>
          </div>
        </button>
      </GlassCard>
    );
  }

  // Pro version
  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-foreground text-sm">Hoy en tu mercado</h4>
        </div>
        <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
          En vivo
        </Badge>
      </div>

      <div className="space-y-2">
        {insights.slice(0, 3).map((insight, idx) => (
          <button
            key={insight.id}
            className="w-full p-3 rounded-xl bg-secondary/30 border border-border hover:border-accent/30 transition-all text-left group"
            onClick={() => navigate(`/app/radar?tab=id`)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                insight.category === "competencia" && "bg-destructive/10",
                insight.category === "mercado" && "bg-warning/10",
                insight.category === "oportunidad" && "bg-success/10",
                insight.category === "tendencia" && "bg-accent/10",
              )}>
                {insight.category === "competencia" && <TrendingUp className="w-4 h-4 text-destructive" />}
                {insight.category === "mercado" && <Radar className="w-4 h-4 text-warning" />}
                {insight.category === "oportunidad" && <Lightbulb className="w-4 h-4 text-success" />}
                {insight.category === "tendencia" && <TrendingUp className="w-4 h-4 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm mb-0.5 line-clamp-1 group-hover:text-accent transition-colors">
                  {insight.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{insight.date} • {insight.source}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </button>
        ))}
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full mt-3 text-xs"
        onClick={() => navigate("/app/radar")}
      >
        Ver más en I+D
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
    </GlassCard>
  );
};

export default RadarWidget;
