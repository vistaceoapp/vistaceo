import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  BookOpen,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LearningItem {
  id: string;
  item_type: string;
  title: string;
  content: string | null;
  action_steps: { text: string }[];
  source: string | null;
  is_read: boolean;
  created_at: string;
}

interface LearningWidgetProps {
  variant?: "full" | "compact" | "sidebar";
}

const SAMPLE_ITEMS: Omit<LearningItem, "id" | "created_at" | "is_read">[] = [
  {
    item_type: "trend",
    title: "El 73% de los clientes prefieren reservar online",
    content: "Los estudios muestran que la reserva digital aumenta la tasa de conversión en restaurantes hasta un 35%.",
    action_steps: [{ text: "Implementar sistema de reservas online" }, { text: "Promocionar reservas en redes" }],
    source: "Tendencias Gastro 2024"
  },
  {
    item_type: "opportunity",
    title: "Happy Hour: oportunidad para tu horario valle",
    content: "Negocios similares al tuyo han aumentado ventas un 40% implementando promociones en horarios de baja afluencia.",
    action_steps: [{ text: "Definir horarios de baja afluencia" }, { text: "Crear promoción atractiva" }, { text: "Comunicar en redes y local" }],
    source: "Análisis de patrones"
  },
  {
    item_type: "tip",
    title: "Fotografía de producto: multiplica tu engagement",
    content: "Fotos profesionales de comida pueden aumentar los pedidos hasta un 30%.",
    action_steps: [{ text: "Fotografiar top 5 productos" }, { text: "Actualizar perfil de Google" }],
    source: "Best practices"
  }
];

export const LearningWidget = ({ variant = "compact" }: LearningWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchItems = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setItems((data as unknown as LearningItem[]) || []);
    } catch (error) {
      console.error("Error fetching learning items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentBusiness]);

  const generateLearningItems = async () => {
    if (!currentBusiness) return;
    setGenerating(true);

    try {
      // Insert sample items as placeholder
      for (const sample of SAMPLE_ITEMS.slice(0, 2)) {
        await supabase
          .from("learning_items")
          .insert({
            business_id: currentBusiness.id,
            ...sample,
            action_steps: sample.action_steps
          });
      }

      toast({
        title: "💡 Nuevas tendencias",
        description: "Se agregaron insights para tu negocio",
      });

      fetchItems();
    } catch (error) {
      console.error("Error generating items:", error);
    } finally {
      setGenerating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "trend": return <TrendingUp className="w-4 h-4" />;
      case "opportunity": return <Sparkles className="w-4 h-4" />;
      case "tip": return <Lightbulb className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "trend": return { label: "Tendencia", className: "bg-accent/10 text-accent" };
      case "opportunity": return { label: "Oportunidad", className: "bg-success/10 text-success" };
      case "tip": return { label: "Tip", className: "bg-primary/10 text-primary" };
      default: return { label: "Info", className: "bg-muted text-muted-foreground" };
    }
  };

  // Use sample items if no real items exist
  const displayItems = items.length > 0 ? items : SAMPLE_ITEMS.map((s, i) => ({
    ...s,
    id: `sample-${i}`,
    is_read: false,
    created_at: new Date().toISOString()
  } as LearningItem));

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-24 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  // Sidebar variant - minimal
  if (variant === "sidebar") {
    const topItem = displayItems[0];
    if (!topItem) return null;

    const badgeInfo = getTypeBadge(topItem.item_type);

    return (
      <div 
        className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
        onClick={() => setSelectedItem(topItem)}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {getTypeIcon(topItem.item_type)}
          </div>
          <div className="flex-1 min-w-0">
            <Badge className={cn("text-xs mb-1", badgeInfo.className)}>
              {badgeInfo.label}
            </Badge>
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {topItem.title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Learning
              </span>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedItem(displayItems[0])}>
                Ver más
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayItems.slice(0, 2).map((item) => {
              const badgeInfo = getTypeBadge(item.item_type);
              return (
                <div 
                  key={item.id}
                  className="p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors mb-2 last:mb-0"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(item.item_type)}
                    <Badge variant="outline" className={cn("text-xs", badgeInfo.className)}>
                      {badgeInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                {selectedItem && getTypeIcon(selectedItem.item_type)}
                <Badge className={cn("text-xs", selectedItem && getTypeBadge(selectedItem.item_type).className)}>
                  {selectedItem && getTypeBadge(selectedItem.item_type).label}
                </Badge>
              </div>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
              <DialogDescription>{selectedItem?.content}</DialogDescription>
            </DialogHeader>
            {selectedItem?.action_steps && selectedItem.action_steps.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold text-foreground text-sm">Plan de acción</h4>
                {selectedItem.action_steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-foreground">{step.text}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedItem?.source && (
              <p className="text-xs text-muted-foreground mt-4">
                Fuente: {selectedItem.source}
              </p>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Full variant
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Learning & Tendencias
            </span>
            <Button variant="outline" size="sm" onClick={generateLearningItems} disabled={generating}>
              <Sparkles className={cn("w-4 h-4 mr-2", generating && "animate-spin")} />
              Actualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayItems.map((item) => {
            const badgeInfo = getTypeBadge(item.item_type);
            return (
              <div 
                key={item.id}
                className="p-4 rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-all hover:shadow-md"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {getTypeIcon(item.item_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-xs", badgeInfo.className)}>
                        {badgeInfo.label}
                      </Badge>
                      {item.source && (
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                    {item.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedItem && getTypeIcon(selectedItem.item_type)}
              <Badge className={cn("text-xs", selectedItem && getTypeBadge(selectedItem.item_type).className)}>
                {selectedItem && getTypeBadge(selectedItem.item_type).label}
              </Badge>
            </div>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>{selectedItem?.content}</DialogDescription>
          </DialogHeader>
          {selectedItem?.action_steps && selectedItem.action_steps.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="font-semibold text-foreground text-sm">Plan de acción</h4>
              {selectedItem.action_steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-foreground">{step.text}</span>
                </div>
              ))}
            </div>
          )}
          {selectedItem?.source && (
            <p className="text-xs text-muted-foreground mt-4">
              Fuente: {selectedItem.source}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
