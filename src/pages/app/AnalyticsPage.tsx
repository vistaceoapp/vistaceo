import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BusinessHealthAnalytics } from "@/components/analytics/BusinessHealthAnalytics";
import { SmartInsightsPanel } from "@/components/analytics/SmartInsightsPanel";
import { EvolutionPanel } from "@/components/app/EvolutionPanel";
import { ReputationAnalyticsPanel } from "@/components/app/ReputationAnalyticsPanel";
import { ProPageGate } from "@/components/app/ProPageGate";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3, Stethoscope, TrendingUp, Sparkles, Star, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AnalyticsPage = () => {
  const isMobile = useIsMobile();

  return (
    <ProPageGate
      featureName="Analytics Avanzado"
      featureDescription="Métricas profundas, predicciones IA y análisis de reputación para tomar decisiones estratégicas."
      features={[
        "Análisis de reputación con IA",
        "Diagnóstico completo del negocio",
        "Evolución de métricas en el tiempo",
        "Predicciones basadas en tus datos",
        "Google Reviews integrado"
      ]}
      icon={<BarChart3 className="w-10 h-10 text-primary" />}
    >
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
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-[10px] px-2 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground">Inteligencia de negocio en tiempo real</p>
            </div>
          </div>
        </div>

        {/* Tabs - Insights first */}
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-5' : 'grid-cols-5'} mb-6`}>
            <TabsTrigger value="insights" className={isMobile ? "text-xs px-1" : ""}>
              <Brain className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? "Insights" : "Insights"}
            </TabsTrigger>
            <TabsTrigger value="reputacion" className={isMobile ? "text-xs px-1" : ""}>
              <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? "Reputación" : "Reputación"}
            </TabsTrigger>
            <TabsTrigger value="diagnostico" className={isMobile ? "text-xs px-1" : ""}>
              <Stethoscope className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? "Diagnóstico" : "Diagnóstico"}
            </TabsTrigger>
            <TabsTrigger value="evolucion" className={isMobile ? "text-xs px-1" : ""}>
              <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? "Evolución" : "Evolución"}
            </TabsTrigger>
            <TabsTrigger value="metricas" className={isMobile ? "text-xs px-1" : ""}>
              <BarChart3 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? "Métricas" : "Métricas"}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Insights - AI Smart Analysis (NOW FIRST) */}
          <TabsContent value="insights" className="space-y-6">
            <SmartInsightsPanel />
          </TabsContent>

          {/* Tab: Reputación - AI Analysis */}
          <TabsContent value="reputacion" className="space-y-6">
            <ReputationAnalyticsPanel />
          </TabsContent>

          {/* Tab: Diagnóstico - Full Business Health Analysis */}
          <TabsContent value="diagnostico" className="space-y-6">
            <BusinessHealthAnalytics />
          </TabsContent>

          {/* Tab: Evolución */}
          <TabsContent value="evolucion" className="space-y-6">
            <EvolutionPanel />
          </TabsContent>

          {/* Tab: Métricas */}
          <TabsContent value="metricas" className="space-y-6">
            <AnalyticsDashboard variant={isMobile ? "compact" : "full"} />
          </TabsContent>
        </Tabs>
      </div>
    </ProPageGate>
  );
};

export default AnalyticsPage;
