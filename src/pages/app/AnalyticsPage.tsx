import { useState, useEffect } from "react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BusinessHealthAnalytics } from "@/components/analytics/BusinessHealthAnalytics";
import { SmartInsightsPanel } from "@/components/analytics/SmartInsightsPanel";
import { CompetitorInsightsPanel } from "@/components/analytics/CompetitorInsightsPanel";
import { EvolutionPanel } from "@/components/app/EvolutionPanel";
import { ProFeatureGate } from "@/components/app/ProFeatureGate";
import { GooglePlacesReputationSection } from "@/components/app/GooglePlacesReputationSection";
import { ReputationAnalyticsPanel } from "@/components/app/ReputationAnalyticsPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/use-subscription";
import { BarChart3, Stethoscope, TrendingUp, Sparkles, Star, Brain, Lock, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const AnalyticsPage = () => {
  const isMobile = useIsMobile();
  const { isPro } = useSubscription();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || (isPro ? "insights" : "diagnostico"));

  useEffect(() => {
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const tabs = [
    { value: "diagnostico", label: "Diagnóstico", mobileLabel: "Diag.", icon: Stethoscope, locked: false },
    { value: "reputacion", label: "Reputación", mobileLabel: "Reput.", icon: Star, locked: false },
    { value: "competencia", label: "Competencia", mobileLabel: "Comp.", icon: Building2, locked: false },
    { value: "insights", label: "Insights", mobileLabel: "Insights", icon: Brain, locked: !isPro },
    { value: "evolucion", label: "Evolución", mobileLabel: "Evol.", icon: TrendingUp, locked: !isPro },
    { value: "metricas", label: "Métricas", mobileLabel: "Métr.", icon: BarChart3, locked: !isPro },
  ];

  return (
    <div className="space-y-5">
      {/* Clean header */}
      <div>
        <h1 className={cn("font-bold text-foreground tracking-tight", isMobile ? "text-xl" : "text-2xl")}>
          Analíticas
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isPro ? "Inteligencia de negocio en tiempo real" : "Diagnóstico y métricas de tu negocio"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "w-full mb-5 h-auto p-1 bg-muted/30 border border-border/40",
          isMobile ? "flex overflow-x-auto scrollbar-hide gap-0.5" : "grid grid-cols-6"
        )}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "relative gap-1.5 transition-all rounded-lg",
                isMobile ? "text-[11px] px-2.5 py-2 flex-shrink-0 min-w-0" : "text-[13px] py-2"
              )}
            >
              <tab.icon className={cn(isMobile ? "w-3.5 h-3.5" : "w-3.5 h-3.5")} />
              <span className="truncate">{isMobile ? tab.mobileLabel : tab.label}</span>
              {tab.locked && <Lock className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="diagnostico" className="space-y-5 animate-fade-in">
          <BusinessHealthAnalytics />
        </TabsContent>

        <TabsContent value="reputacion" className="space-y-5 animate-fade-in">
          <ReputationAnalyticsPanel />
        </TabsContent>

        <TabsContent value="competencia" className="space-y-5 animate-fade-in">
          <CompetitorInsightsPanel />
        </TabsContent>

        <TabsContent value="insights" className="space-y-5 animate-fade-in">
          {isPro ? (
            <SmartInsightsPanel />
          ) : (
            <ProFeatureGate feature="advanced_analytics" title="Insights IA" description="Desbloquea análisis inteligente con IA y recomendaciones estratégicas">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Insights inteligentes basados en tus datos reales</p>
              </div>
            </ProFeatureGate>
          )}
        </TabsContent>

        <TabsContent value="evolucion" className="space-y-5 animate-fade-in">
          {isPro ? (
            <EvolutionPanel />
          ) : (
            <ProFeatureGate feature="advanced_analytics" title="Evolución" description="Seguí la evolución de tus métricas clave semana a semana">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Evolución de métricas y tendencias</p>
              </div>
            </ProFeatureGate>
          )}
        </TabsContent>

        <TabsContent value="metricas" className="space-y-5 animate-fade-in">
          {isPro ? (
            <AnalyticsDashboard variant={isMobile ? "compact" : "full"} />
          ) : (
            <ProFeatureGate feature="advanced_analytics" title="Métricas Avanzadas" description="Accedé al dashboard completo de métricas y KPIs">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Dashboard completo de métricas</p>
              </div>
            </ProFeatureGate>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
