import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BusinessHealthAnalytics } from "@/components/analytics/BusinessHealthAnalytics";
import { SmartInsightsPanel } from "@/components/analytics/SmartInsightsPanel";
import { EvolutionPanel } from "@/components/app/EvolutionPanel";
import { ProFeatureGate } from "@/components/app/ProFeatureGate";
import { GooglePlacesReputationSection } from "@/components/app/GooglePlacesReputationSection";
import { ReputationAnalyticsPanel } from "@/components/app/ReputationAnalyticsPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/use-subscription";
import { BarChart3, Stethoscope, TrendingUp, Sparkles, Star, Brain, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";

const AnalyticsPage = () => {
  const isMobile = useIsMobile();
  const { isPro } = useSubscription();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || (isPro ? "insights" : "diagnostico");

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
              {isPro ? "Inteligencia de negocio en tiempo real" : "Diagnóstico y métricas de tu negocio"}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="diagnostico" className={isMobile ? "text-xs px-1" : ""}>
            <Stethoscope className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {isMobile ? "Diagnóstico" : "Diagnóstico"}
          </TabsTrigger>
          <TabsTrigger value="reputacion" className={isMobile ? "text-xs px-1" : ""}>
            <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {isMobile ? "Reputación" : "Reputación"}
          </TabsTrigger>
          <TabsTrigger value="insights" className={isMobile ? "text-xs px-1" : ""}>
            <Brain className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            Insights
            {!isPro && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
          </TabsTrigger>
          <TabsTrigger value="evolucion" className={isMobile ? "text-xs px-1" : ""}>
            <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {isMobile ? "Evolución" : "Evolución"}
            {!isPro && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
          </TabsTrigger>
          <TabsTrigger value="metricas" className={isMobile ? "text-xs px-1" : ""}>
            <BarChart3 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {isMobile ? "Métricas" : "Métricas"}
            {!isPro && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
          </TabsTrigger>
        </TabsList>

        {/* Free-accessible tabs */}
        <TabsContent value="diagnostico" className="space-y-6">
          <BusinessHealthAnalytics />
        </TabsContent>

        <TabsContent value="reputacion" className="space-y-6">
          {isPro ? (
            <ReputationAnalyticsPanel />
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Reputación Online
                </h3>
                <p className="text-sm text-muted-foreground">
                  Desbloquea análisis completo de reputación con VISTACEO Pro.
                  Reseñas, sentimiento, palabras clave y más, todo automático desde Google Maps.
                </p>
              </div>
              <GooglePlacesReputationSection />
            </div>
          )}
        </TabsContent>

        {/* Pro tabs - show content if Pro, gate if Free */}
        <TabsContent value="insights" className="space-y-6">
          {isPro ? (
            <SmartInsightsPanel />
          ) : (
            <ProFeatureGate feature="advanced_analytics" title="Insights IA" description="Desbloquea análisis inteligente con IA y recomendaciones estratégicas con VISTACEO Pro">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Insights inteligentes basados en tus datos reales</p>
              </div>
            </ProFeatureGate>
          )}
        </TabsContent>

        <TabsContent value="evolucion" className="space-y-6">
          {isPro ? (
            <EvolutionPanel />
          ) : (
            <ProFeatureGate feature="advanced_analytics" title="Evolución" description="Seguí la evolución de tus métricas clave semana a semana con VISTACEO Pro">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Evolución de métricas y tendencias</p>
              </div>
            </ProFeatureGate>
          )}
        </TabsContent>

        <TabsContent value="metricas" className="space-y-6">
          {isPro ? (
            <AnalyticsDashboard variant={isMobile ? "compact" : "full"} />
          ) : (
            <ProFeatureGate feature="advanced_analytics" title="Métricas Avanzadas" description="Accedé al dashboard completo de métricas y KPIs con VISTACEO Pro">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Dashboard completo de métricas</p>
              </div>
            </ProFeatureGate>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
