import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3 } from "lucide-react";

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
          <p className="text-muted-foreground">Dashboard de métricas y tendencias</p>
        </div>
      </div>

      {/* Dashboard */}
      <AnalyticsDashboard variant={isMobile ? "compact" : "full"} />
    </div>
  );
};

export default AnalyticsPage;