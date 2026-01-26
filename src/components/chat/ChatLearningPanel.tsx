import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Brain, ChevronRight, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LearningItem {
  category: string;
  facts: string[];
  lastUpdated: string;
}

interface ChatLearningPanelProps {
  businessId: string;
  compact?: boolean;
}

const categoryLabels: Record<string, string> = {
  ventas: "Ventas",
  clientes: "Clientes",
  operacion: "Operación",
  marketing: "Marketing",
  finanzas: "Finanzas",
  competencia: "Competencia",
  productos: "Productos",
  equipo: "Equipo",
};

const categoryColors: Record<string, string> = {
  ventas: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  clientes: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  operacion: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  marketing: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  finanzas: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  competencia: "bg-red-500/10 text-red-500 border-red-500/30",
  productos: "bg-pink-500/10 text-pink-500 border-pink-500/30",
  equipo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
};

export const ChatLearningPanel = ({
  businessId,
  compact = false,
}: ChatLearningPanelProps) => {
  const [learnings, setLearnings] = useState<LearningItem[]>([]);
  const [totalFacts, setTotalFacts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearnings();
  }, [businessId]);

  const fetchLearnings = async () => {
    try {
      const { data: brain } = await supabase
        .from("business_brains")
        .select("factual_memory, updated_at")
        .eq("business_id", businessId)
        .single();

      if (brain?.factual_memory) {
        const factualMemory = brain.factual_memory as Record<string, any>;
        const items: LearningItem[] = [];
        let count = 0;

        Object.entries(factualMemory).forEach(([category, data]) => {
          if (Array.isArray(data)) {
            items.push({
              category,
              facts: data.slice(0, 5).map((d: any) => 
                typeof d === "string" ? d : d.answer || d.value || JSON.stringify(d)
              ),
              lastUpdated: brain.updated_at,
            });
            count += data.length;
          } else if (typeof data === "object" && data !== null) {
            const facts = Object.entries(data)
              .slice(0, 5)
              .map(([k, v]) => `${k}: ${v}`);
            if (facts.length > 0) {
              items.push({
                category,
                facts,
                lastUpdated: brain.updated_at,
              });
              count += facts.length;
            }
          }
        });

        setLearnings(items);
        setTotalFacts(count);
      }
    } catch (error) {
      console.error("Error fetching learnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const TriggerButton = (
    <Button
      variant="ghost"
      size={compact ? "sm" : "default"}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground",
        compact && "h-8 px-2"
      )}
    >
      <Brain className={cn("w-4 h-4", compact && "w-3.5 h-3.5")} />
      {!compact && (
        <>
          <span className="text-sm">Aprendido</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {totalFacts}
          </Badge>
        </>
      )}
      {compact && (
        <span className="text-xs">{totalFacts}</span>
      )}
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {TriggerButton}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left">Conocimiento del Negocio</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalFacts} datos aprendidos
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : learnings.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Aún no he aprendido sobre tu negocio
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Háblame para que pueda conocerte mejor
                </p>
              </div>
            ) : (
              learnings.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-card/50 border border-border/40"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        categoryColors[item.category] || "bg-muted"
                      )}
                    >
                      {categoryLabels[item.category] || item.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(item.lastUpdated).toLocaleDateString("es")}
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {item.facts.map((fact, i) => (
                      <li 
                        key={i}
                        className="text-sm text-foreground/80 flex items-start gap-2"
                      >
                        <ChevronRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
