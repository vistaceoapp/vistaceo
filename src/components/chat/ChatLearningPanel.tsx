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
import { Brain, Sparkles, MessageCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LearningFact {
  question: string;
  answer: string;
  date: string;
}

interface LearningCategory {
  category: string;
  label: string;
  icon: string;
  facts: LearningFact[];
}

interface ChatLearningPanelProps {
  businessId: string;
  compact?: boolean;
}

// Spanish labels for categories
const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  ventas: { label: "Ventas", icon: "💰", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  clientes: { label: "Clientes", icon: "👥", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  operacion: { label: "Operación", icon: "⚙️", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  marketing: { label: "Marketing", icon: "📱", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  finanzas: { label: "Finanzas", icon: "📊", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  competencia: { label: "Competencia", icon: "🎯", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  productos: { label: "Productos", icon: "📦", color: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
  equipo: { label: "Equipo", icon: "🤝", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
  tecnologia: { label: "Tecnología", icon: "💻", color: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
  constraints: { label: "Limitaciones", icon: "⚠️", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  top_sellers: { label: "Más Vendidos", icon: "⭐", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  general: { label: "General", icon: "📝", color: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
};

// Field name translations
const fieldTranslations: Record<string, string> = {
  teamSize: "Tamaño del equipo",
  weeklyTime: "Tiempo semanal disponible",
  mainLimitation: "Principal limitación",
  top_sellers: "Productos más vendidos",
  constraints: "Restricciones",
};

const getCategoryKey = (rawCategory: string): string => {
  // Extract category from learning_xxx format
  if (rawCategory.startsWith("learning_")) {
    return rawCategory.replace("learning_", "");
  }
  return rawCategory;
};

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
};

const parseLearningData = (data: unknown): LearningFact[] => {
  const facts: LearningFact[] = [];
  
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        // Handle {q, a, t} format
        if (obj.q && obj.a) {
          facts.push({
            question: String(obj.q),
            answer: String(obj.a),
            date: obj.t ? formatDate(String(obj.t)) : "",
          });
        }
        // Handle {question, answer} format
        else if (obj.question && obj.answer) {
          facts.push({
            question: String(obj.question),
            answer: String(obj.answer),
            date: obj.timestamp ? formatDate(String(obj.timestamp)) : "",
          });
        }
        // Handle simple value objects
        else {
          Object.entries(obj).forEach(([key, value]) => {
            if (value && typeof value !== "object") {
              facts.push({
                question: fieldTranslations[key] || key,
                answer: String(value),
                date: "",
              });
            }
          });
        }
      } else if (typeof item === "string") {
        facts.push({
          question: "",
          answer: item,
          date: "",
        });
      }
    });
  } else if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value !== "object") {
        facts.push({
          question: fieldTranslations[key] || key,
          answer: String(value),
          date: "",
        });
      }
    });
  }
  
  return facts;
};

export const ChatLearningPanel = ({
  businessId,
  compact = false,
}: ChatLearningPanelProps) => {
  const [categories, setCategories] = useState<LearningCategory[]>([]);
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
        const factualMemory = brain.factual_memory as Record<string, unknown>;
        const parsedCategories: LearningCategory[] = [];
        let count = 0;

        Object.entries(factualMemory).forEach(([rawCategory, data]) => {
          const categoryKey = getCategoryKey(rawCategory);
          const config = categoryConfig[categoryKey] || categoryConfig.general;
          const facts = parseLearningData(data);
          
          if (facts.length > 0) {
            parsedCategories.push({
              category: categoryKey,
              label: config.label,
              icon: config.icon,
              facts: facts.slice(0, 5), // Limit to 5 per category
            });
            count += facts.length;
          }
        });

        setCategories(parsedCategories);
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
        "gap-2 text-muted-foreground hover:text-foreground transition-colors",
        compact && "h-8 px-2"
      )}
    >
      <Brain className={cn("w-4 h-4", compact && "w-3.5 h-3.5")} />
      {!compact && (
        <>
          <span className="text-sm">Aprendido</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary">
            {totalFacts}
          </Badge>
        </>
      )}
      {compact && (
        <span className="text-xs font-medium">{totalFacts}</span>
      )}
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {TriggerButton}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 border-border/50">
        <SheetHeader className="p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left text-lg">Lo que sé de tu negocio</SheetTitle>
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
                  <div key={i} className="h-28 bg-muted/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">
                  Aún no te conozco
                </p>
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
                  Mientras más hablemos, mejor podré ayudarte con recomendaciones personalizadas
                </p>
              </div>
            ) : (
              categories.map((cat, idx) => {
                const config = categoryConfig[cat.category] || categoryConfig.general;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-card/50 border border-border/30 overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="px-4 py-3 border-b border-border/20 flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs font-medium", config.color)}
                      >
                        {cat.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {cat.facts.length} dato{cat.facts.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    
                    {/* Facts List */}
                    <div className="divide-y divide-border/20">
                      {cat.facts.map((fact, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                          {fact.question ? (
                            <>
                              <div className="flex items-start gap-2 mb-1.5">
                                <MessageCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {fact.question}
                                </p>
                              </div>
                              <p className="text-sm text-foreground font-medium pl-5.5 leading-relaxed">
                                {fact.answer}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-foreground leading-relaxed">
                              {fact.answer}
                            </p>
                          )}
                          {fact.date && (
                            <div className="flex items-center gap-1 mt-2 pl-5.5">
                              <Calendar className="w-3 h-3 text-muted-foreground/60" />
                              <span className="text-[10px] text-muted-foreground/60">
                                {fact.date}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};