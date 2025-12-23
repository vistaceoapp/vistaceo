import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";

interface DailyAction {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  category: string | null;
  signals: unknown;
  status: string;
}

const TodayPage = () => {
  const { currentBusiness } = useBusiness();
  const [todayAction, setTodayAction] = useState<DailyAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayAction = async () => {
      if (!currentBusiness) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split("T")[0];
        const { data, error } = await supabase
          .from("daily_actions")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .eq("scheduled_for", today)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setTodayAction(data);
      } catch (error) {
        console.error("Error fetching today's action:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAction();
  }, [currentBusiness]);

  const handleComplete = async () => {
    if (!todayAction) return;

    try {
      const { error } = await supabase
        .from("daily_actions")
        .update({ 
          status: "completed", 
          completed_at: new Date().toISOString() 
        })
        .eq("id", todayAction.id);

      if (error) throw error;
      setTodayAction(null);
    } catch (error) {
      console.error("Error completing action:", error);
    }
  };

  const handleSnooze = async () => {
    if (!todayAction) return;

    try {
      const { error } = await supabase
        .from("daily_actions")
        .update({ status: "snoozed" })
        .eq("id", todayAction.id);

      if (error) throw error;
      setTodayAction(null);
    } catch (error) {
      console.error("Error snoozing action:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-secondary rounded w-1/2" />
        <div className="h-48 bg-card rounded-2xl" />
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Configura tu negocio
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Para empezar a recibir acciones diarias, primero necesitas crear tu negocio.
        </p>
        <Button variant="hero" onClick={() => window.location.href = "/onboarding"}>
          Configurar negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Buenos días 👋
        </h1>
        <p className="text-muted-foreground">
          Aquí está tu prioridad de hoy
        </p>
      </div>

      {/* Main Action Card */}
      {todayAction ? (
        <div className="relative">
          <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg" />
          <div className="relative bg-card border border-primary/30 rounded-2xl p-6 neon-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    todayAction.priority === "high" || todayAction.priority === "urgent"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-primary/20 text-primary"
                  )}>
                    {todayAction.priority === "urgent" ? "Urgente" : 
                     todayAction.priority === "high" ? "Alta prioridad" : 
                     "Acción de Hoy"}
                  </span>
                  {todayAction.category && (
                    <span className="text-xs text-muted-foreground">
                      {todayAction.category}
                    </span>
                  )}
                </div>
                
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {todayAction.title}
                </h2>
                
                {todayAction.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {todayAction.description}
                  </p>
                )}

                {/* Signals */}
                {todayAction.signals && Array.isArray(todayAction.signals) && todayAction.signals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(todayAction.signals as string[]).map((signal, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground"
                      >
                        📊 {signal}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button onClick={handleComplete} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Hecho
                  </Button>
                  <Button variant="outline" onClick={handleSnooze}>
                    <Clock className="w-4 h-4 mr-2" />
                    Después
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            ¡Excelente trabajo!
          </h2>
          <p className="text-sm text-muted-foreground">
            No hay acciones pendientes para hoy. Descansa o explora las misiones.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-foreground">3</div>
          <div className="text-xs text-muted-foreground">Acciones esta semana</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-success">+12%</div>
          <div className="text-xs text-muted-foreground">vs semana pasada</div>
        </div>
      </div>

      {/* Weekly Priorities Preview */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Prioridades de la semana</h3>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {[
            { title: "Mejorar tiempo de espera", progress: 60 },
            { title: "Aumentar reseñas positivas", progress: 30 },
            { title: "Optimizar menú digital", progress: 0 },
          ].map((priority, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex-1">
                <div className="text-sm text-foreground">{priority.title}</div>
                <div className="h-1.5 bg-secondary rounded-full mt-1">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${priority.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayPage;
