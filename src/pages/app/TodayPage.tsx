import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, Sparkles, Plus, Zap, TrendingUp, Calendar, ArrowRight, BarChart3, Camera, Brain, Target, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { ProgressRing } from "@/components/app/ProgressRing";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckinCard } from "@/components/app/CheckinCard";
import { InboxCard } from "@/components/app/InboxCard";
import { ActionCard } from "@/components/app/ActionCard";
import { SocialRatingsPanel } from "@/components/app/SocialRatingsPanel";
import { AlertFAB } from "@/components/app/AlertFAB";
import { BrainStatusWidget } from "@/components/app/BrainStatusWidget";
import { TellMeMoreCard } from "@/components/app/TellMeMoreCard";
import { KnowledgeByAreaCard } from "@/components/app/KnowledgeByAreaCard";
import { FocusCard } from "@/components/app/FocusCard";
import { ActionsListPanel } from "@/components/app/ActionsListPanel";
import { BusinessHealthDashboard } from "@/components/app/BusinessHealthDashboard";
import { SetupWizard } from "@/components/app/SetupWizard";
import { DashboardCardsGrid } from "@/components/app/DashboardCardsGrid";
import { HealthScoreWidget } from "@/components/app/HealthScoreWidget";
import { PrecisionRingWidget } from "@/components/app/PrecisionRingWidget";
import { CountryCode } from "@/lib/countryPacks";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { calculatePrecisionScore } from "@/lib/gastroQuestionsComplete";

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
  const { brain, focusLabel, confidenceLevel, canGenerateSpecific, dataGaps } = useBrain();
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  const [todayAction, setTodayAction] = useState<DailyAction | null>(null);
  const [weeklyPriorities, setWeeklyPriorities] = useState<WeeklyPriority[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Use setup status from dashboard data
  const setupCompleted = dashboardData.setupCompleted;

  // Auto-open setup wizard if not completed
  useEffect(() => {
    if (!dashboardLoading && currentBusiness && !setupCompleted) {
      setShowSetupWizard(true);
    }
  }, [dashboardLoading, currentBusiness, setupCompleted]);

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

  // Auto-generate action if none exists
  const autoGenerateAction = async () => {
    if (!currentBusiness || actionLoading) return;
    setActionLoading(true);

    try {
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
      await supabase
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

      fetchData();
    } catch (error) {
      console.error("Error auto-generating action:", error);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentBusiness]);

  // Proactively generate action if none exists after loading
  useEffect(() => {
    if (!loading && currentBusiness && !todayAction && !actionLoading) {
      autoGenerateAction();
    }
  }, [loading, currentBusiness, todayAction]);

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
        {/* Setup Wizard CTA if not completed */}
        {!setupCompleted && (
          <GlassCard 
            interactive 
            className="p-5 cursor-pointer border-primary/30 bg-primary/5" 
            onClick={() => setShowSetupWizard(true)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Completá el Setup Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  7-12 minutos para un dashboard personalizado con datos reales
                </p>
              </div>
              <Button size="sm" className="gradient-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Comenzar
              </Button>
            </div>
          </GlassCard>
        )}

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
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* HERO: Health Score + Precision Double Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HealthScoreWidget
                subScores={dashboardData.subScores}
                previousScore={dashboardData.previousScore}
              />
              <PrecisionRingWidget 
                healthScore={Math.round((dashboardData.subScores.revenue + dashboardData.subScores.reputation + dashboardData.subScores.operations) / 3)}
                precisionScore={35}
                previousHealthScore={dashboardData.previousScore}
                isPro={false}
                onStartDiagnostic={() => navigate('/app/diagnostic')}
              />
            </div>

            {/* Dashboard Cards Grid */}
            <DashboardCardsGrid
              countryCode={(currentBusiness?.country as CountryCode) || 'AR'}
              availableData={dashboardData.availableData}
            />

            {/* Check-in del turno */}
            {!hasCheckedInToday && !showCheckin && (
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
                    <p className="text-xs text-muted-foreground">10 segundos • mejora recomendaciones</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </GlassCard>
            )}

            {showCheckin && (
              <CheckinCard 
                onComplete={() => {
                  setHasCheckedInToday(true);
                  setShowCheckin(false);
                }} 
              />
            )}

            {/* Acciones disponibles - CTA compacto */}
            <GlassCard 
              interactive 
              className="p-6 cursor-pointer" 
              onClick={() => setShowActionsPanel(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Acciones disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    {todayAction ? "1 acción pendiente" : "Generando acciones personalizadas..."}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </GlassCard>

            {/* Tengo tiempo, quiero contarte más */}
            <TellMeMoreCard />

            {/* Qué tanto te conozco por área */}
            <KnowledgeByAreaCard />

            {/* Quiero potenciar... */}
            <FocusCard />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-4">
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
              
              <GlassCard className="p-4">
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

          </div>

          {/* Sidebar - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Brain Status Widget */}
            <BrainStatusWidget variant="compact" />

            {/* Social Ratings */}
            <SocialRatingsPanel variant="compact" />

            {/* KNOWLEDGE CENTER */}
            <InboxCard variant="compact" />

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
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/app/analytics")}>
                  <TrendingUp className="w-4 h-4 mr-3 text-success" />
                  Ver analytics
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Panel */}
        <ActionsListPanel 
          open={showActionsPanel}
          onOpenChange={setShowActionsPanel}
          onRefresh={fetchData}
        />

        {/* Setup Wizard */}
        <SetupWizard 
          open={showSetupWizard}
          onOpenChange={setShowSetupWizard}
          onComplete={() => {
            fetchData();
            window.location.reload(); // Refresh to get updated data
          }}
        />
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="space-y-6">
      {/* Setup Wizard CTA if not completed - Mobile */}
      {!setupCompleted && (
        <div className="animate-fade-in">
          <GlassCard 
            interactive 
            className="p-5 cursor-pointer border-primary/30 bg-primary/5" 
            onClick={() => setShowSetupWizard(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground text-sm">Setup Inteligente</h3>
                <p className="text-xs text-muted-foreground">
                  Dashboard personalizado en minutos
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </GlassCard>
        </div>
      )}

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

      {/* HERO: Health Score Widget - Mobile */}
      <div className="animate-fade-in" style={{ animationDelay: "25ms" }}>
        <HealthScoreWidget
          subScores={dashboardData.subScores}
          previousScore={dashboardData.previousScore}
        />
      </div>

      {/* Precision Widget - Mobile */}
      <div className="animate-fade-in" style={{ animationDelay: "28ms" }}>
        <PrecisionRingWidget 
          healthScore={Math.round((dashboardData.subScores.revenue + dashboardData.subScores.reputation + dashboardData.subScores.operations) / 3)}
          precisionScore={35}
          previousHealthScore={dashboardData.previousScore}
          isPro={false}
          onStartDiagnostic={() => navigate('/app/diagnostic')}
        />
      </div>

      {/* Dashboard Cards Grid - Mobile */}
      <div className="animate-fade-in" style={{ animationDelay: "30ms" }}>
        <DashboardCardsGrid
          countryCode={(currentBusiness?.country as CountryCode) || 'AR'}
          availableData={dashboardData.availableData}
        />
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

      {/* Acciones disponibles - CTA compacto */}
      <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <GlassCard 
          interactive 
          className="p-6 cursor-pointer" 
          onClick={() => setShowActionsPanel(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Acciones disponibles</h3>
              <p className="text-sm text-muted-foreground">
                {todayAction ? "1 acción pendiente" : "Generando acciones personalizadas..."}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </GlassCard>
      </div>

      {/* Tengo tiempo, quiero contarte más */}
      <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
        <TellMeMoreCard />
      </div>

      {/* Qué tanto te conozco por área */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <KnowledgeByAreaCard />
      </div>

      {/* Quiero potenciar... */}
      <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
        <FocusCard />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
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

      {/* Micro-questions */}
      <div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
        <InboxCard variant="compact" />
      </div>

      {/* Weekly Priorities Preview */}
      <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
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
      
      {/* Actions Panel */}
      <ActionsListPanel 
        open={showActionsPanel}
        onOpenChange={setShowActionsPanel}
        onRefresh={fetchData}
      />
      
      {/* Setup Wizard */}
      <SetupWizard 
        open={showSetupWizard}
        onOpenChange={setShowSetupWizard}
        onComplete={() => {
          fetchData();
          window.location.reload(); // Refresh to get updated data
        }}
      />
      
      {/* Alert FAB */}
      <AlertFAB />
    </div>
  );
};

export default TodayPage;
