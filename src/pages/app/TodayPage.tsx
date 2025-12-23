import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, ChevronRight, Sparkles, Plus, Zap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DailyAction {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  category: string | null;
  signals: unknown;
  checklist: unknown;
  status: string;
}

interface WeeklyPriority {
  id: string;
  title: string;
  description: string | null;
  status: string;
  checklist: unknown;
}

const TodayPage = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [todayAction, setTodayAction] = useState<DailyAction | null>(null);
  const [weeklyPriorities, setWeeklyPriorities] = useState<WeeklyPriority[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const fetchData = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split("T")[0];

      // Fetch today's pending action
      const { data: actionData, error: actionError } = await supabase
        .from("daily_actions")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .eq("scheduled_for", today)
        .eq("status", "pending")
        .order("priority", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (actionError) throw actionError;
      setTodayAction(actionData);

      // Fetch completed today count
      const { count: todayCount } = await supabase
        .from("daily_actions")
        .select("*", { count: "exact", head: true })
        .eq("business_id", currentBusiness.id)
        .eq("scheduled_for", today)
        .eq("status", "completed");

      setCompletedToday(todayCount || 0);

      // Fetch weekly completed
      const { count: weekCount } = await supabase
        .from("daily_actions")
        .select("*", { count: "exact", head: true })
        .eq("business_id", currentBusiness.id)
        .gte("scheduled_for", weekStartStr)
        .eq("status", "completed");

      setWeeklyCompleted(weekCount || 0);

      // Fetch weekly priorities
      const { data: prioritiesData, error: prioritiesError } = await supabase
        .from("weekly_priorities")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .gte("week_start", weekStartStr)
        .order("created_at", { ascending: true })
        .limit(3);

      if (prioritiesError) throw prioritiesError;
      setWeeklyPriorities(prioritiesData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentBusiness]);

  const handleComplete = async () => {
    if (!todayAction) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("daily_actions")
        .update({ 
          status: "completed", 
          completed_at: new Date().toISOString() 
        })
        .eq("id", todayAction.id);

      if (error) throw error;
      
      toast({
        title: "¡Acción completada!",
        description: "Excelente trabajo. Sigue así.",
      });
      
      setTodayAction(null);
      setCompletedToday(prev => prev + 1);
      setWeeklyCompleted(prev => prev + 1);
      fetchData();
    } catch (error) {
      console.error("Error completing action:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSnooze = async () => {
    if (!todayAction) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("daily_actions")
        .update({ status: "snoozed" })
        .eq("id", todayAction.id);

      if (error) throw error;
      
      toast({
        title: "Acción pospuesta",
        description: "La verás mañana.",
      });
      
      setTodayAction(null);
      fetchData();
    } catch (error) {
      console.error("Error snoozing action:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const generateAction = async () => {
    if (!currentBusiness) return;
    setActionLoading(true);

    try {
      // Call AI to generate an action
      const { data, error } = await supabase.functions.invoke("uceo-chat", {
        body: {
          messages: [{ 
            role: "user", 
            content: "Dame una acción concreta y específica que pueda hacer HOY para mejorar mi negocio. Responde SOLO con un JSON con los campos: title (máx 60 chars), description (máx 200 chars), priority (low/medium/high), category (marketing/operaciones/finanzas/servicio)." 
          }],
          businessContext: {
            name: currentBusiness.name,
            category: currentBusiness.category,
            country: currentBusiness.country,
          }
        }
      });

      if (error) throw error;

      // Try to parse the AI response as JSON
      let actionData;
      try {
        const jsonMatch = data.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          actionData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback action
          actionData = {
            title: "Revisar las reseñas de la última semana",
            description: "Analiza los comentarios de tus clientes y anota 3 puntos de mejora.",
            priority: "medium",
            category: "servicio"
          };
        }
      } catch {
        actionData = {
          title: "Hacer check-in del turno",
          description: "Registra el nivel de tráfico y observaciones del día.",
          priority: "medium",
          category: "operaciones"
        };
      }

      // Insert the generated action
      const today = new Date().toISOString().split("T")[0];
      const { error: insertError } = await supabase
        .from("daily_actions")
        .insert({
          business_id: currentBusiness.id,
          title: actionData.title,
          description: actionData.description,
          priority: actionData.priority || "medium",
          category: actionData.category,
          scheduled_for: today,
          status: "pending",
        });

      if (insertError) throw insertError;

      toast({
        title: "Acción generada",
        description: "UCEO analizó tu negocio y creó una nueva acción.",
      });

      fetchData();
    } catch (error) {
      console.error("Error generating action:", error);
      toast({
        title: "Error",
        description: "No se pudo generar la acción",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityProgress = (priority: WeeklyPriority) => {
    if (!priority.checklist || !Array.isArray(priority.checklist)) return 0;
    const items = priority.checklist as { done?: boolean }[];
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.done).length;
    return Math.round((completed / items.length) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-secondary rounded w-1/2" />
        <div className="h-48 bg-card rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-card rounded-xl" />
          <div className="h-20 bg-card rounded-xl" />
        </div>
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
        <Button variant="hero" onClick={() => navigate("/onboarding")}>
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
          {getGreeting()} 👋
        </h1>
        <p className="text-muted-foreground">
          {currentBusiness.name}
        </p>
      </div>

      {/* Main Action Card */}
      {todayAction ? (
        <div className="relative">
          <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg animate-pulse-slow" />
          <div className="relative bg-card border border-primary/30 rounded-2xl p-6 neon-border">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    todayAction.priority === "high" || todayAction.priority === "urgent"
                      ? "bg-destructive/20 text-destructive border border-destructive/30"
                      : todayAction.priority === "medium"
                      ? "bg-warning/20 text-warning border border-warning/30"
                      : "bg-primary/20 text-primary border border-primary/30"
                  )}>
                    {todayAction.priority === "urgent" ? "🔥 Urgente" : 
                     todayAction.priority === "high" ? "⚡ Alta" : 
                     todayAction.priority === "medium" ? "📌 Media" :
                     "📋 Normal"}
                  </span>
                  {todayAction.category && (
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {todayAction.category}
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {todayAction.title}
                </h2>
                
                {todayAction.description && (
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {todayAction.description}
                  </p>
                )}

                {/* Checklist preview */}
                {todayAction.checklist && Array.isArray(todayAction.checklist) && todayAction.checklist.length > 0 && (
                  <div className="bg-background/50 rounded-lg p-3 mb-4 space-y-2">
                    {(todayAction.checklist as { text: string; done?: boolean }[]).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center",
                          item.done ? "bg-primary border-primary" : "border-muted-foreground/30"
                        )}>
                          {item.done && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={cn(item.done && "line-through text-muted-foreground")}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleComplete} 
                    className="flex-1 group"
                    disabled={actionLoading}
                  >
                    <Check className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Completar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSnooze}
                    disabled={actionLoading}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Después
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            ¡Todo listo por hoy!
          </h2>
          <p className="text-muted-foreground mb-6">
            No hay acciones pendientes. ¿Quieres que UCEO genere una nueva?
          </p>
          <Button 
            variant="hero" 
            onClick={generateAction}
            disabled={actionLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {actionLoading ? "Generando..." : "Generar acción con IA"}
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Hoy</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{completedToday}</div>
          <div className="text-xs text-muted-foreground">completadas</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Esta semana</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{weeklyCompleted}</div>
          <div className="text-xs text-muted-foreground">acciones</div>
        </div>
      </div>

      {/* Weekly Priorities Preview */}
      <div 
        className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => navigate("/app/missions")}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Prioridades de la semana</h3>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        {weeklyPriorities.length > 0 ? (
          <div className="space-y-4">
            {weeklyPriorities.map((priority) => (
              <div key={priority.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  priority.status === "completed" ? "bg-success" : "bg-primary"
                )} />
                <div className="flex-1">
                  <div className="text-sm text-foreground font-medium">{priority.title}</div>
                  <div className="h-1.5 bg-secondary rounded-full mt-2">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        priority.status === "completed" ? "bg-success" : "bg-primary"
                      )}
                      style={{ width: `${priority.status === "completed" ? 100 : getPriorityProgress(priority)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {priority.status === "completed" ? "100%" : `${getPriorityProgress(priority)}%`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay prioridades esta semana. Explora las misiones para crear una.
          </p>
        )}
      </div>
    </div>
  );
};

export default TodayPage;
