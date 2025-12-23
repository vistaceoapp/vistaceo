import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, Sparkles, Plus, Zap, TrendingUp, Calendar, ArrowRight, BarChart3, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { ProgressRing } from "@/components/app/ProgressRing";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckinCard } from "@/components/app/CheckinCard";
import { InboxCard } from "@/components/app/InboxCard";
import { ActionCard } from "@/components/app/ActionCard";

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
  const isMobile = useIsMobile();
  const { currentBusiness } = useBusiness();
  const [todayAction, setTodayAction] = useState<DailyAction | null>(null);
  const [weeklyPriorities, setWeeklyPriorities] = useState<WeeklyPriority[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);

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

      // Fetch all data in parallel
      const [actionRes, todayCountRes, weekCountRes, prioritiesRes, checkinRes] = await Promise.all([
        supabase
          .from("daily_actions")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .eq("scheduled_for", today)
          .eq("status", "pending")
          .order("priority", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("daily_actions")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("scheduled_for", today)
          .eq("status", "completed"),
        supabase
          .from("daily_actions")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("scheduled_for", weekStartStr)
          .eq("status", "completed"),
        supabase
          .from("weekly_priorities")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .gte("week_start", weekStartStr)
          .order("created_at", { ascending: true })
          .limit(3),
        supabase
          .from("checkins")
          .select("id")
          .eq("business_id", currentBusiness.id)
          .gte("created_at", today)
          .limit(1),
      ]);

      if (actionRes.error) throw actionRes.error;
      setTodayAction(actionRes.data);
      setCompletedToday(todayCountRes.count || 0);
      setWeeklyCompleted(weekCountRes.count || 0);
      
      if (prioritiesRes.error) throw prioritiesRes.error;
      setWeeklyPriorities(prioritiesRes.data || []);
      
      // Check if user already did check-in today
      setHasCheckedInToday((checkinRes.data?.length || 0) > 0);
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
      // Use the new dedicated generate-action function
      const { data, error } = await supabase.functions.invoke("generate-action", {
        body: {
          businessId: currentBusiness.id,
          business: {
            name: currentBusiness.name,
            category: currentBusiness.category,
            country: currentBusiness.country,
            avg_rating: currentBusiness.avg_rating,
          }
        }
      });

      if (error) throw error;

      const actionData = data?.action || {
        title: "Revisar las reseñas de la última semana",
        description: "Analiza los comentarios de tus clientes y anota 3 puntos de mejora.",
        priority: "medium",
        category: "servicio",
        signals: [],
        checklist: [],
      };

      const today = new Date().toISOString().split("T")[0];
      const { error: insertError } = await supabase
        .from("daily_actions")
        .insert({
          business_id: currentBusiness.id,
          title: actionData.title,
          description: actionData.description,
          priority: actionData.priority || "medium",
          category: actionData.category,
          signals: actionData.signals || [],
          checklist: actionData.checklist || [],
          scheduled_for: today,
          status: "pending",
        });

      if (insertError) throw insertError;

      toast({
        title: "✨ Acción generada",
        description: "Se analizó tu negocio y creó una nueva acción personalizada.",
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
      <div className={cn("space-y-6", !isMobile && "grid grid-cols-3 gap-6")}>
        {!isMobile ? (
          <>
            <div className="col-span-2 space-y-6">
              <div className="h-10 bg-card rounded-xl animate-pulse w-2/3" />
              <div className="h-48 bg-card rounded-xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-24 bg-card rounded-xl animate-pulse" />
              <div className="h-24 bg-card rounded-xl animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <div className="h-10 bg-card/50 rounded-xl animate-pulse w-2/3" />
            <GlassCard className="h-48 animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="h-24 animate-pulse" />
              <GlassCard className="h-24 animate-pulse" />
            </div>
          </>
        )}
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

  const weeklyGoal = 21;
  const weeklyProgress = Math.min((weeklyCompleted / weeklyGoal) * 100, 100);

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{getTimeEmoji()}</span>
              <h1 className="text-3xl font-bold text-foreground">
                {getGreeting()}
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {currentBusiness.name} • {new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <Button variant="outline" onClick={generateAction} disabled={actionLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva acción
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Main Action Card */}
            {todayAction ? (
              <div className="dashboard-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-full",
                        todayAction.priority === "high" || todayAction.priority === "urgent"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : todayAction.priority === "medium"
                          ? "bg-warning/10 text-warning border border-warning/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                      )}>
                        {todayAction.priority === "urgent" ? "🔥 Urgente" : 
                         todayAction.priority === "high" ? "⚡ Alta" : 
                         todayAction.priority === "medium" ? "📌 Media" :
                         "📋 Normal"}
                      </span>
                      {todayAction.category && (
                        <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                          {todayAction.category}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {todayAction.title}
                    </h2>
                    
                    {todayAction.description && (
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        {todayAction.description}
                      </p>
                    )}

                    {todayAction.checklist && Array.isArray(todayAction.checklist) && todayAction.checklist.length > 0 && (
                      <div className="bg-secondary/50 rounded-xl p-4 mb-6 space-y-2">
                        {(todayAction.checklist as { text: string; done?: boolean }[]).slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                              item.done ? "bg-success border-success" : "border-muted-foreground/30"
                            )}>
                              {item.done && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("text-sm", item.done && "line-through text-muted-foreground")}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={handleComplete} 
                        size="lg"
                        className="gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40"
                        disabled={actionLoading}
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Completar acción
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={handleSnooze}
                        disabled={actionLoading}
                      >
                        <Clock className="w-5 h-5 mr-2" />
                        Posponer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dashboard-card p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  ¡Todo listo por hoy!
                </h2>
                <p className="text-muted-foreground mb-6">
                  No hay acciones pendientes. ¿Quieres que UCEO genere una nueva?
                </p>
                <Button 
                  onClick={generateAction}
                  disabled={actionLoading}
                  className="gradient-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {actionLoading ? "Generando..." : "Generar acción con IA"}
                </Button>
              </div>
            )}

            {/* Weekly Priorities */}
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Prioridades de la semana</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/missions")}>
                  Ver misiones
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {weeklyPriorities.length > 0 ? (
                <div className="space-y-4">
                  {weeklyPriorities.map((priority) => (
                    <div key={priority.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors">
                      <div className={cn(
                        "w-3 h-3 rounded-full shadow-lg",
                        priority.status === "completed" 
                          ? "bg-success" 
                          : "bg-primary"
                      )} />
                      <div className="flex-1">
                        <div className="text-sm text-foreground font-medium">{priority.title}</div>
                        <div className="h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              priority.status === "completed" ? "bg-success" : "gradient-primary"
                            )}
                            style={{ width: `${priority.status === "completed" ? 100 : getPriorityProgress(priority)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {priority.status === "completed" ? "100%" : `${getPriorityProgress(priority)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay prioridades esta semana. Explora las misiones para crear una.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Check-in Card */}
            {!hasCheckedInToday && (
              <div className="animate-fade-in">
                {showCheckin ? (
                  <CheckinCard 
                    onComplete={() => {
                      setHasCheckedInToday(true);
                      setShowCheckin(false);
                    }} 
                  />
                ) : (
                  <div className="dashboard-card p-4 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-all" onClick={() => setShowCheckin(true)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">Check-in del turno</p>
                        <p className="text-xs text-muted-foreground">10 segundos • mejora recomendaciones</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Micro-question Inbox */}
            <InboxCard variant="compact" />

            {/* Today Stats */}
            <div className="dashboard-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground font-medium">Hoy</span>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{completedToday}</div>
              <div className="text-sm text-muted-foreground">acciones completadas</div>
            </div>

            {/* Weekly Progress */}
            <div className="dashboard-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">Esta semana</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-foreground mb-1">{weeklyCompleted}</div>
                  <div className="text-sm text-muted-foreground">de {weeklyGoal} objetivo</div>
                </div>
                <ProgressRing progress={weeklyProgress} size={80} strokeWidth={6}>
                  <span className="text-sm font-bold text-primary">{Math.round(weeklyProgress)}%</span>
                </ProgressRing>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card p-6">
              <h4 className="font-medium text-foreground mb-4">Acciones rápidas</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/app/chat")}>
                  <Sparkles className="w-4 h-4 mr-3 text-primary" />
                  Hablar con el asistente
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/app/radar")}>
                  <BarChart3 className="w-4 h-4 mr-3 text-accent" />
                  Ver oportunidades
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
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

      {/* Check-in prompt for mobile */}
      {!hasCheckedInToday && !showCheckin && (
        <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
          <GlassCard 
            interactive 
            className="p-4 cursor-pointer" 
            onClick={() => setShowCheckin(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Check-in del turno</p>
                <p className="text-xs text-muted-foreground">10 seg • mejora las recomendaciones</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Expanded Check-in */}
      {showCheckin && (
        <div className="animate-fade-in">
          <CheckinCard 
            variant="compact"
            onComplete={() => {
              setHasCheckedInToday(true);
              setShowCheckin(false);
            }} 
          />
        </div>
      )}

      {/* Main Action Card */}
      {todayAction ? (
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <GlassCard variant="glow" className="p-6 overflow-hidden">
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

                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleComplete} 
                    className="flex-1 gradient-primary shadow-lg shadow-primary/30 hover:shadow-primary/50"
                    disabled={actionLoading}
                  >
                    <Check className="w-4 h-4 mr-2" />
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
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {weeklyPriorities.length > 0 ? (
            <div className="space-y-4">
              {weeklyPriorities.map((priority, idx) => (
                <div key={priority.id} className="flex items-center gap-3" style={{ animationDelay: `${idx * 50}ms` }}>
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
