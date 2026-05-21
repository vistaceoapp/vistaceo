import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Brain } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertFAB } from "@/components/app/AlertFAB";
import { ActionsListPanel } from "@/components/app/ActionsListPanel";
import { HealthScoreWidget } from "@/components/app/HealthScoreWidget";
import { MissionsWidget } from "@/components/app/MissionsWidget";
import { DashboardHero } from "@/components/app/DashboardHero";
import { OpportunitiesPreview } from "@/components/app/OpportunitiesPreview";
import { TalkToCEOCard } from "@/components/app/TalkToCEOCard";
import { ProUpgradeBanner } from "@/components/app/ProUpgradeBanner";
import { BrainKnowledgeWidget } from "@/components/app/BrainKnowledgeWidget";
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
  const { widgets, loading: widgetsLoading, isPro, saveConfig, toggleWidget, reorderWidgets, resetToDefaults } = useWidgetConfig();

  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const setupCompleted = dashboardData.setupCompleted;

  const handleSync = useCallback(async () => {
    const result = await syncHealth();
    if (result.success) {
      navigate("/app", { replace: true });
    }
  }, [syncHealth, navigate]);

  useEffect(() => {
    if (!dashboardLoading && currentBusiness && !setupCompleted) {
      navigate("/setup");
    }
  }, [dashboardLoading, currentBusiness, setupCompleted, navigate]);

  if (dashboardLoading || widgetsLoading) {
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
        <p className="text-muted-foreground mb-8 max-w-sm">
          Para empezar a recibir acciones diarias personalizadas.
        </p>
        <Button variant="hero" size="lg" onClick={() => navigate("/setup")}>
          <Sparkles className="w-5 h-5 mr-2" />
          Comenzar ahora
        </Button>
      </div>
    );
  }

  // Bloques compartidos (mismos para desktop y mobile)
  const setupBanner = !setupCompleted && (
    <GlassCard
      interactive
      className="p-4 sm:p-5 cursor-pointer border-primary/30 bg-primary/5"
      onClick={() => navigate("/setup")}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">
            Completá el Setup Inteligente
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            El sistema se personaliza a tu negocio en 7-12 min
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground sm:hidden" />
        <Button size="sm" className="gradient-primary hidden sm:inline-flex">
          <Sparkles className="w-4 h-4 mr-2" />
          Comenzar
        </Button>
      </div>
    </GlassCard>
  );

  const healthBlock = (
    <HealthScoreWidget
      subScores={dashboardData.subScores}
      snapshotScore={dashboardData.snapshotScore}
      previousScore={dashboardData.previousScore}
      precisionPct={dashboardData.certaintyPct}
      onSync={handleSync}
      isSyncing={isSyncing}
    />
  );

  // Sidebar derecha (desktop): conversación con tu CEO + conocimiento de negocio
  const rightSidebar = (
    <aside className="space-y-5 lg:sticky lg:top-16 self-start">
      <TalkToCEOCard />
      <BrainKnowledgeWidget compact />
    </aside>
  );

  // Desktop — layout 2 columnas: feed principal + sidebar
  if (!isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <DashboardEditor
            widgets={widgets}
            onSave={saveConfig}
            onToggle={toggleWidget}
            onReorder={reorderWidgets}
            onReset={resetToDefaults}
          />
        </div>
        {setupBanner}


        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Columna principal */}
          <div className="space-y-6 min-w-0">
            {/* 1. Resumen ejecutivo del negocio (texto + salud) */}
            <DashboardHero />

            {/* 2. Salud del negocio (detalle) */}
            {healthBlock}

            {/* 3. Oportunidades: internas, tendencias, I+D */}
            <OpportunitiesPreview />

            {/* 4. Misiones */}
            <MissionsWidget />

            {/* 5. Pro (suave) */}
            {!isPro && <ProUpgradeBanner variant="compact" />}
          </div>

          {/* Sidebar derecha */}
          {rightSidebar}
        </div>

        <ActionsListPanel open={showActionsPanel} onOpenChange={setShowActionsPanel} />
      </div>
    );
  }

  // Mobile — feed ejecutivo (mismo orden, apilado)
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <DashboardEditor
          widgets={widgets}
          onSave={saveConfig}
          onToggle={toggleWidget}
          onReorder={reorderWidgets}
          onReset={resetToDefaults}
        />
      </div>
      {setupBanner}


      <DashboardHero isMobile />

      {healthBlock}

      <OpportunitiesPreview />

      <MissionsWidget />

      <TalkToCEOCard />

      <BrainKnowledgeWidget compact />

      {!isPro && <ProUpgradeBanner variant="compact" />}

      <ActionsListPanel open={showActionsPanel} onOpenChange={setShowActionsPanel} />
      <AlertFAB />
    </div>
  );
};

export default TodayPage;
