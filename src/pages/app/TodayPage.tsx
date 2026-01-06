import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertFAB } from "@/components/app/AlertFAB";
import { ActionsListPanel } from "@/components/app/ActionsListPanel";
import { HealthScoreWidget } from "@/components/app/HealthScoreWidget";
import { FocusWidget } from "@/components/app/FocusWidget";
import { ReputationWidget } from "@/components/app/ReputationWidget";
import { BrainKnowledgeWidget } from "@/components/app/BrainKnowledgeWidget";
import { RadarWidget } from "@/components/app/RadarWidget";
import { MissionsWidget } from "@/components/app/MissionsWidget";
import { WeeklyMetricsWidget } from "@/components/app/WeeklyMetricsWidget";
import { DashboardEditor } from "@/components/app/DashboardEditor";
import { useWidgetConfig } from "@/hooks/use-widget-config";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useHealthSync } from "@/hooks/use-health-sync";

const TodayPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentBusiness } = useBusiness();
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  const { syncHealth, isSyncing } = useHealthSync();
  const { 
    widgets, 
    loading: widgetsLoading, 
    isPro,
    saveConfig, 
    toggleWidget, 
    reorderWidgets, 
    getVisibleWidgets,
    resetToDefaults 
  } = useWidgetConfig();
  
  const [loading, setLoading] = useState(true);
  const [showActionsPanel, setShowActionsPanel] = useState(false);

  const setupCompleted = dashboardData.setupCompleted;
  
  // Handle sync and refresh data
  const handleSync = useCallback(async () => {
    const result = await syncHealth();
    if (result.success) {
      // Trigger a page reload to get fresh data
      window.location.reload();
    }
  }, [syncHealth]);

  useEffect(() => {
    if (!dashboardLoading && currentBusiness && !setupCompleted) {
      navigate('/setup');
    }
  }, [dashboardLoading, currentBusiness, setupCompleted, navigate]);

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

  useEffect(() => {
    if (currentBusiness) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentBusiness]);

  // Widget renderer based on ID
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "health":
        return (
          <HealthScoreWidget
            key="health"
            subScores={dashboardData.subScores}
            snapshotScore={dashboardData.snapshotScore}
            previousScore={dashboardData.previousScore}
            precisionPct={dashboardData.certaintyPct}
            onSync={handleSync}
            isSyncing={isSyncing}
          />
        );
      case "missions":
        return <MissionsWidget key="missions" />;
      case "brain":
        return <BrainKnowledgeWidget key="brain" />;
      case "weeklyMetrics":
        return <WeeklyMetricsWidget key="weeklyMetrics" />;
      case "focus":
        return <FocusWidget key="focus" />;
      case "reputation":
        return <ReputationWidget key="reputation" isPro={isPro} />;
      case "radar":
        return <RadarWidget key="radar" isPro={isPro} />;
      default:
        return null;
    }
  };

  if (loading || widgetsLoading) {
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
            </div>
          </>
        ) : (
          <>
            <div className="h-10 bg-card/50 rounded-xl animate-pulse w-2/3" />
            <GlassCard className="h-48 animate-pulse" />
          </>
        )}
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Configura tu negocio</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">Para empezar a recibir acciones diarias personalizadas.</p>
        <Button variant="hero" size="lg" onClick={() => navigate("/onboarding")}>
          <Sparkles className="w-5 h-5 mr-2" />
          Comenzar ahora
        </Button>
      </div>
    );
  }

  const mainWidgets = getVisibleWidgets("main");
  const sidebarWidgets = getVisibleWidgets("sidebar");

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="space-y-6">
        {/* Setup CTA */}
        {!setupCompleted && (
          <GlassCard interactive className="p-5 cursor-pointer border-primary/30 bg-primary/5" onClick={() => navigate('/setup')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Completá el Setup Inteligente</h3>
                <p className="text-sm text-muted-foreground">7-12 minutos para un dashboard personalizado</p>
              </div>
              <Button size="sm" className="gradient-primary"><Sparkles className="w-4 h-4 mr-2" />Comenzar</Button>
            </div>
          </GlassCard>
        )}

        {/* Header with Edit Button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{getTimeEmoji()}</span>
              <h1 className="text-3xl font-bold text-foreground">{getGreeting()}</h1>
            </div>
            <p className="text-muted-foreground text-lg">{currentBusiness.name} • {new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          
          <DashboardEditor 
            widgets={widgets}
            onSave={saveConfig}
            onToggle={toggleWidget}
            onReorder={reorderWidgets}
            onReset={resetToDefaults}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            {mainWidgets.map(w => renderWidget(w.id))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {sidebarWidgets.map(w => renderWidget(w.id))}
          </div>
        </div>

        <ActionsListPanel open={showActionsPanel} onOpenChange={setShowActionsPanel} />
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="space-y-6">
      {!setupCompleted && (
        <GlassCard interactive className="p-5 cursor-pointer border-primary/30 bg-primary/5" onClick={() => navigate('/setup')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground text-sm">Setup Inteligente</h3>
              <p className="text-xs text-muted-foreground">Dashboard personalizado en minutos</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </GlassCard>
      )}

      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getTimeEmoji()}</span>
            <h1 className="text-2xl font-bold text-foreground">{getGreeting()}</h1>
          </div>
          <p className="text-muted-foreground">{currentBusiness.name}</p>
        </div>
        
        <DashboardEditor 
          widgets={widgets}
          onSave={saveConfig}
          onToggle={toggleWidget}
          onReorder={reorderWidgets}
          onReset={resetToDefaults}
        />
      </div>

      {/* Render all visible widgets in order */}
      {[...mainWidgets, ...sidebarWidgets]
        .sort((a, b) => {
          // Custom mobile order: health first, then brain, then metrics, missions
          const mobileOrder: Record<string, number> = {
            health: 0,
            brain: 1,
            weeklyMetrics: 2,
            missions: 3,
            focus: 4,
            reputation: 5,
            radar: 6,
          };
          return (mobileOrder[a.id] ?? 99) - (mobileOrder[b.id] ?? 99);
        })
        .map(w => renderWidget(w.id))}

      <ActionsListPanel open={showActionsPanel} onOpenChange={setShowActionsPanel} />
      <AlertFAB />
    </div>
  );
};

export default TodayPage;
