import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BusinessHealthDashboard } from "@/components/app/BusinessHealthDashboard";
import { EvolutionPanel } from "@/components/app/EvolutionPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3, Stethoscope, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnalyticsPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <BarChart3 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Diagnóstico, evolución y métricas</p>
        </div>
      </div>

      {/* Tabs for Diagnóstico, Evolución, Métricas */}
      <Tabs defaultValue="diagnostico" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} mb-6`}>
          <TabsTrigger value="diagnostico" className={isMobile ? "text-xs" : ""}>
            <Stethoscope className="w-4 h-4 mr-1.5" />
            Diagnóstico
          </TabsTrigger>
          <TabsTrigger value="evolucion" className={isMobile ? "text-xs" : ""}>
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Evolución
          </TabsTrigger>
          <TabsTrigger value="metricas" className={isMobile ? "text-xs" : ""}>
            <BarChart3 className="w-4 h-4 mr-1.5" />
            Métricas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Diagnóstico */}
        <TabsContent value="diagnostico" className="space-y-6">
          <BusinessHealthDashboard />
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
  );
};

export default AnalyticsPage;
