import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, ChevronRight, Sparkles, Plus, Zap, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { ProgressRing } from "@/components/app/ProgressRing";

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

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "🌙";
    if (hour < 12) return "☀️";
    if (hour < 18) return "🌤️";
    if (hour < 21) return "🌅";
    return "🌙";
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

      const { count: todayCount } = await supabase
        .from("daily_actions")
        .select("*", { count: "exact", head: true })
        .eq("business_id", currentBusiness.id)
        .eq("scheduled_for", today)
        .eq("status", "completed");

      setCompletedToday(todayCount || 0);

      const { count: weekCount } = await supabase
        .from("daily_actions")
        .select("*", { count: "exact", head: true })
        .eq("business_id", currentBusiness.id)
        .gte("scheduled_for", weekStartStr)
        .eq("status", "completed");

      setWeeklyCompleted(weekCount || 0);

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
        title: "🎉 ¡Acción completada!",
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

      let actionData;
      try {
        const jsonMatch = data.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          actionData = JSON.parse(jsonMatch[0]);
        } else {
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
        title: "✨ Acción generada",
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
      <div className="space-y-4">
        <div className="h-10 bg-card/50 rounded-xl animate-pulse w-2/3" />
        <GlassCard className="h-48 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="h-24 animate-pulse" />
          <GlassCard className="h-24 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse" />
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center relative z-10 shadow-lg shadow-primary/30">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Configura tu negocio
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Para empezar a recibir acciones diarias personalizadas, primero necesitas crear tu negocio.
        </p>
        <Button variant="hero" size="lg" onClick={() => navigate("/onboarding")}>
          <Sparkles className="w-5 h-5 mr-2" />
          Comenzar ahora
        </Button>
      </div>
    );
  }

  const weeklyGoal = 21; // Example weekly goal
  const weeklyProgress = Math.min((weeklyCompleted / weeklyGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{getTimeEmoji()}</span>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {currentBusiness.name} • {new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Main Action Card */}
      {todayAction ? (
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <GlassCard variant="glow" className="p-6 overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-primary/40 rounded-xl" />
                <div className="relative w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm",
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
                    <span className="text-xs text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full backdrop-blur-sm">
                      {todayAction.category}
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
                  {todayAction.title}
                </h2>
                
                {todayAction.description && (
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {todayAction.description}
                  </p>
                )}

                {/* Checklist preview */}
                {todayAction.checklist && Array.isArray(todayAction.checklist) && todayAction.checklist.length > 0 && (
                  <div className="bg-background/50 rounded-xl p-3 mb-4 space-y-2 backdrop-blur-sm">
                    {(todayAction.checklist as { text: string; done?: boolean }[]).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                          item.done ? "bg-success border-success" : "border-muted-foreground/30"
                        )}>
                          {item.done && <Check className="w-3 h-3 text-white" />}
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
                    className="flex-1 gradient-primary shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={actionLoading}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Completar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSnooze}
                    disabled={actionLoading}
                    className="hover:bg-muted/50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Después
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <GlassCard className="p-8 text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 blur-2xl bg-success/30 rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              ¡Todo listo por hoy!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              No hay acciones pendientes. ¿Quieres que UCEO genere una nueva?
            </p>
            <Button 
              variant="hero" 
              onClick={generateAction}
              disabled={actionLoading}
              className="shadow-lg shadow-primary/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {actionLoading ? "Generando..." : "Generar acción con IA"}
            </Button>
          </GlassCard>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <GlassCard interactive className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground font-medium">Hoy</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{completedToday}</div>
              <div className="text-xs text-muted-foreground">completadas</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-success" />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard interactive className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Semana</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{weeklyCompleted}</div>
              <div className="text-xs text-muted-foreground">acciones</div>
            </div>
            <ProgressRing progress={weeklyProgress} size={48} strokeWidth={4} showGlow={false}>
              <span className="text-xs font-bold text-primary">{Math.round(weeklyProgress)}%</span>
            </ProgressRing>
          </div>
        </GlassCard>
      </div>

      {/* Weekly Priorities Preview */}
      <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
        <GlassCard 
          interactive
          className="p-5 cursor-pointer"
          onClick={() => navigate("/app/missions")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Prioridades de la semana</h3>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {weeklyPriorities.length > 0 ? (
            <div className="space-y-4">
              {weeklyPriorities.map((priority, idx) => (
                <div key={priority.id} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className={cn(
                    "w-3 h-3 rounded-full shadow-lg",
                    priority.status === "completed" 
                      ? "bg-success shadow-success/30" 
                      : "bg-primary shadow-primary/30"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">{priority.title}</div>
                    <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          priority.status === "completed" ? "bg-success" : "gradient-primary"
                        )}
                        style={{ width: `${priority.status === "completed" ? 100 : getPriorityProgress(priority)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
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
        </GlassCard>
      </div>
    </div>
  );
};

export default TodayPage;
