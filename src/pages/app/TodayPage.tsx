import { useEffect, useState, useCallback, useMemo } from "react";
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
import { PredictionsWidget } from "@/components/app/PredictionsWidget";

import { PulseCheckinCard } from "@/components/app/PulseCheckinCard";
import { WeeklyMetricsWidget } from "@/components/app/WeeklyMetricsWidget";
import { RadarWidget } from "@/components/app/RadarWidget";
import { FocusWidget } from "@/components/app/FocusWidget";
import { ReputationWidget } from "@/components/app/ReputationWidget";
import { useWidgetConfig } from "@/hooks/use-widget-config";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useHealthSync } from "@/hooks/use-health-sync";

const TodayPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentBusiness } = useBusiness();
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  const { syncHealth, isSyncing } = useHealthSync();
  const { loading: widgetsLoading, isPro, getVisibleWidgets } = useWidgetConfig();

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

  // Scroll to widget when hash is present (e.g. /app#brain)
  useEffect(() => {
    if (dashboardLoading || widgetsLoading) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`widget-${hash}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-2", "ring-primary/40", "rounded-3xl");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary/40", "rounded-3xl"), 2200);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [dashboardLoading, widgetsLoading]);

  // Registry: widget id → renderer
  const renderWidget = useCallback((id: string): React.ReactNode => {
    switch (id) {
      case "aiSummary":
        return <DashboardHero isMobile={isMobile} />;
      case "health":
        return (
          <HealthScoreWidget
            subScores={dashboardData.subScores}
            snapshotScore={dashboardData.snapshotScore}
            previousScore={dashboardData.previousScore}
            precisionPct={dashboardData.certaintyPct}
            onSync={handleSync}
            isSyncing={isSyncing}
          />
        );
      case "missions":
        return <MissionsWidget />;
      case "opportunities":
        return <OpportunitiesPreview />;
      case "talkToCEO":
        return <TalkToCEOCard />;
      case "pulse":
        return <PulseCheckinCard />;
      case "weeklyMetrics":
        return <WeeklyMetricsWidget />;
      case "predictions":
        return isPro ? <PredictionsWidget /> : null;
      case "brain":
        return <BrainKnowledgeWidget compact />;
      case "radar":
        return <RadarWidget isPro={isPro} />;
      case "focus":
        return <FocusWidget />;
      case "reputation":
        return <ReputationWidget isPro={isPro} />;
      default:
        return null;
    }
  }, [isMobile, dashboardData, handleSync, isSyncing, isPro]);

  const mainVisible = useMemo(() => getVisibleWidgets("main"), [getVisibleWidgets]);
  const sidebarVisible = useMemo(() => getVisibleWidgets("sidebar"), [getVisibleWidgets]);

  if (dashboardLoading || widgetsLoading) {
    const Shimmer = ({ className }: { className?: string }) => (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-card/60 border border-border/40",
          "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite]",
          "before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.04] before:to-transparent",
          className
        )}
      />
    );

    if (isMobile) {
      return (
        <div className="space-y-5">
          <Shimmer className="h-9 w-3/4" />
          <Shimmer className="h-40" />
          <Shimmer className="h-56" />
          <Shimmer className="h-48" />
          <Shimmer className="h-32" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <Shimmer className="h-10 w-2/3" />
            <Shimmer className="h-44" />
            <Shimmer className="h-64" />
            <Shimmer className="h-56" />
            <Shimmer className="h-48" />
          </div>
          <aside className="space-y-5">
            <Shimmer className="h-40" />
            <Shimmer className="h-32" />
            <Shimmer className="h-48" />
            <Shimmer className="h-28" />
          </aside>
        </div>
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
            Completa el Setup Inteligente
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

  // Render visible widgets respetando orden del usuario (Personalizar)
  const renderMain = () => {
    const nodes: React.ReactNode[] = [];
    mainVisible.forEach((w) => {
      const node = renderWidget(w.id);
      if (node) nodes.push(<div key={w.id} id={`widget-${w.id}`} className="scroll-mt-24">{node}</div>);
    });
    return nodes;
  };

  const renderSidebar = () => {
    const nodes: React.ReactNode[] = [];
    sidebarVisible.forEach((w) => {
      const node = renderWidget(w.id);
      if (node) nodes.push(<div key={w.id} id={`widget-${w.id}`} className="scroll-mt-24">{node}</div>);
    });
    return nodes;
  };

  // Desktop — 2 columnas
  if (!isMobile) {
    return (
      <div className="space-y-6">
        {setupBanner}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            {renderMain()}
            {!isPro && <ProUpgradeBanner variant="compact" />}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-16 self-start">
            {renderSidebar()}
          </aside>
        </div>

        <ActionsListPanel open={showActionsPanel} onOpenChange={setShowActionsPanel} />
      </div>
    );
  }

  // Mobile — feed
  return (
    <div className="space-y-5">
      {setupBanner}
      {renderMain()}
      {renderSidebar()}
      {!isPro && <ProUpgradeBanner variant="compact" />}

      <ActionsListPanel open={showActionsPanel} onOpenChange={setShowActionsPanel} />
      <AlertFAB />
    </div>
  );
};

export default TodayPage;
