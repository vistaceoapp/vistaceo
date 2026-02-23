import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BusinessHealthAnalytics } from "@/components/analytics/BusinessHealthAnalytics";
import { SmartInsightsPanel } from "@/components/analytics/SmartInsightsPanel";
import { EvolutionPanel } from "@/components/app/EvolutionPanel";
import { ReputationAnalyticsPanel } from "@/components/app/ReputationAnalyticsPanel";
import { ProFeatureGate } from "@/components/app/ProFeatureGate";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/use-subscription";
import { BarChart3, Stethoscope, TrendingUp, Sparkles, Star, Brain, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AnalyticsPage = () => {
  const isMobile = useIsMobile();
  const { isPro } = useSubscription();

  // Free users default to "reputacion", Pro users default to "insights"
  const defaultTab = isPro ? "insights" : "reputacion";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Star className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Analíticas</h1>
              {isPro && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-[10px] px-2 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isPro ? "Inteligencia de negocio en tiempo real" : "Reputación y diagnóstico de tu negocio"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`grid w-full ${isPro ? 'grid-cols-5' : 'grid-cols-3'} mb-6`}>
          {/* Free tabs */}
          <TabsTrigger value="reputacion" className={isMobile ? "text-xs px-1" : ""}>
            <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {isMobile ? "Reputación" : "Reputación"}
          </TabsTrigger>
          <TabsTrigger value="diagnostico" className={isMobile ? "text-xs px-1" : ""}>
            <Stethoscope className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {isMobile ? "Diagnóstico" : "Diagnóstico"}
          </TabsTrigger>

          {/* Pro tabs */}
          {isPro ? (
            <>
              <TabsTrigger value="insights" className={isMobile ? "text-xs px-1" : ""}>
                <Brain className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                Insights
              </TabsTrigger>
              <TabsTrigger value="evolucion" className={isMobile ? "text-xs px-1" : ""}>
                <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                {isMobile ? "Evolución" : "Evolución"}
              </TabsTrigger>
              <TabsTrigger value="metricas" className={isMobile ? "text-xs px-1" : ""}>
                <BarChart3 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                {isMobile ? "Métricas" : "Métricas"}
              </TabsTrigger>
            </>
          ) : (
            <TabsTrigger value="pro_preview" className={isMobile ? "text-xs px-1" : ""}>
              <Lock className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? "Pro" : "Más con Pro"}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Free-accessible tabs */}
        <TabsContent value="reputacion" className="space-y-6">
          <ReputationAnalyticsPanel />
        </TabsContent>

        <TabsContent value="diagnostico" className="space-y-6">
          <BusinessHealthAnalytics />
        </TabsContent>

        {/* Pro tabs */}
        {isPro ? (
          <>
            <TabsContent value="insights" className="space-y-6">
              <SmartInsightsPanel />
            </TabsContent>
            <TabsContent value="evolucion" className="space-y-6">
              <EvolutionPanel />
            </TabsContent>
            <TabsContent value="metricas" className="space-y-6">
              <AnalyticsDashboard variant={isMobile ? "compact" : "full"} />
            </TabsContent>
          </>
        ) : (
          <TabsContent value="pro_preview" className="space-y-6">
            <ProFeatureGate
              feature="advanced_analytics"
              title="Analytics Avanzado"
              description="Desbloquea Insights IA, Evolución de métricas y análisis completo con VistaCEO Pro"
            >
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Insights • Evolución • Métricas avanzadas</p>
              </div>
            </ProFeatureGate>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
