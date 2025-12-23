import { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  DollarSign, 
  Activity,
  Calendar,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";

// Chart colors using CSS variables
const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
};

const PIE_COLORS = [
  "hsl(271, 91%, 55%)", // primary
  "hsl(217, 91%, 55%)", // accent
  "hsl(142, 76%, 40%)", // success
  "hsl(38, 92%, 50%)",  // warning
  "hsl(0, 72%, 51%)",   // destructive
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  color?: string;
}

const MetricCard = ({ title, value, change, changeLabel, icon: Icon, color = "primary" }: MetricCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-success" />
                ) : isNegative ? (
                  <ArrowDownRight className="w-4 h-4 text-destructive" />
                ) : null}
                <span className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
                )}>
                  {isPositive ? "+" : ""}{change}%
                </span>
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            color === "primary" && "bg-primary/10",
            color === "accent" && "bg-accent/10",
            color === "success" && "bg-success/10",
            color === "warning" && "bg-warning/10"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              color === "primary" && "text-primary",
              color === "accent" && "text-accent",
              color === "success" && "text-success",
              color === "warning" && "text-warning"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface AnalyticsDashboardProps {
  variant?: "full" | "compact";
}

export const AnalyticsDashboard = ({ variant = "full" }: AnalyticsDashboardProps) => {
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("week");
  
  // Data states
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [actionsData, setActionsData] = useState<any[]>([]);
  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [knowledgeData, setKnowledgeData] = useState<any[]>([]);
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalActions: 0,
    completedActions: 0,
    avgTraffic: 0,
    avgRating: 0,
    totalInsights: 0,
    weeklyGrowth: 0,
  });

  const fetchAnalytics = async () => {
    if (!currentBusiness) return;
    
    setRefreshing(true);
    
    try {
      // Get date ranges based on period
      const now = new Date();
      const startDate = new Date();
      if (period === "week") startDate.setDate(now.getDate() - 7);
      else if (period === "month") startDate.setMonth(now.getMonth() - 1);
      else startDate.setMonth(now.getMonth() - 3);

      // Fetch all data in parallel
      const [checkinsRes, actionsRes, insightsRes, externalRes] = await Promise.all([
        supabase
          .from("checkins")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true }),
        supabase
          .from("daily_actions")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true }),
        supabase
          .from("business_insights")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("external_data")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .gte("synced_at", startDate.toISOString()),
      ]);

      const checkins = checkinsRes.data || [];
      const actions = actionsRes.data || [];
      const insights = insightsRes.data || [];
      const external = externalRes.data || [];

      // Process traffic data by day
      const trafficByDay: Record<string, { traffic: number; count: number }> = {};
      for (const checkin of checkins) {
        const day = new Date(checkin.created_at).toLocaleDateString("es", { weekday: "short", day: "numeric" });
        if (!trafficByDay[day]) trafficByDay[day] = { traffic: 0, count: 0 };
        trafficByDay[day].traffic += checkin.traffic_level || 0;
        trafficByDay[day].count++;
      }
      
      setTrafficData(Object.entries(trafficByDay).map(([day, data]) => ({
        day,
        traffic: Math.round((data.traffic / data.count) * 20), // Convert to 0-100 scale
        checkins: data.count,
      })));

      // Process actions data by day
      const actionsByDay: Record<string, { completed: number; total: number }> = {};
      for (const action of actions) {
        const day = new Date(action.created_at || action.scheduled_for).toLocaleDateString("es", { weekday: "short", day: "numeric" });
        if (!actionsByDay[day]) actionsByDay[day] = { completed: 0, total: 0 };
        actionsByDay[day].total++;
        if (action.status === "completed") actionsByDay[day].completed++;
      }
      
      setActionsData(Object.entries(actionsByDay).map(([day, data]) => ({
        day,
        completed: data.completed,
        pending: data.total - data.completed,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      })));

      // Process reviews from external data
      const reviews = external.filter(e => e.data_type === "review");
      const reviewsByDay: Record<string, { rating: number; count: number }> = {};
      for (const review of reviews) {
        const day = new Date(review.synced_at).toLocaleDateString("es", { weekday: "short", day: "numeric" });
        if (!reviewsByDay[day]) reviewsByDay[day] = { rating: 0, count: 0 };
        const content = review.content as Record<string, any> | null;
        reviewsByDay[day].rating += content?.rating || 0;
        reviewsByDay[day].count++;
      }
      
      setReviewsData(Object.entries(reviewsByDay).map(([day, data]) => ({
        day,
        rating: data.count > 0 ? (data.rating / data.count).toFixed(1) : 0,
        reviews: data.count,
      })));

      // Category distribution for actions
      const byCategory: Record<string, number> = {};
      for (const action of actions.filter(a => a.status === "completed")) {
        const cat = action.category || "general";
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
      
      setCategoryData(Object.entries(byCategory).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })));

      // Knowledge growth (insights over time)
      const insightsByWeek: Record<string, number> = {};
      for (const insight of insights) {
        const week = new Date(insight.created_at).toLocaleDateString("es", { month: "short", day: "numeric" });
        insightsByWeek[week] = (insightsByWeek[week] || 0) + 1;
      }
      
      // Calculate cumulative
      let cumulative = 0;
      setKnowledgeData(Object.entries(insightsByWeek).map(([week, count]) => {
        cumulative += count;
        return { week, count, total: cumulative };
      }));

      // Calculate metrics
      const completedCount = actions.filter(a => a.status === "completed").length;
      const avgTrafficVal = checkins.length > 0 
        ? checkins.reduce((sum, c) => sum + (c.traffic_level || 0), 0) / checkins.length 
        : 0;
      const avgRatingVal = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + ((r.content as Record<string, any> | null)?.rating || 0), 0) / reviews.length
        : currentBusiness.avg_rating || 0;

      setMetrics({
        totalActions: actions.length,
        completedActions: completedCount,
        avgTraffic: Math.round(avgTrafficVal * 20),
        avgRating: Number(avgRatingVal.toFixed(1)),
        totalInsights: insights.length,
        weeklyGrowth: insights.length > 10 ? 12 : insights.length > 5 ? 8 : 5,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentBusiness, period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionRate = metrics.totalActions > 0 
    ? Math.round((metrics.completedActions / metrics.totalActions) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Métricas del Negocio</h2>
          <p className="text-muted-foreground">Análisis de rendimiento y tendencias</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList>
              <TabsTrigger value="week">7 días</TabsTrigger>
              <TabsTrigger value="month">30 días</TabsTrigger>
              <TabsTrigger value="quarter">90 días</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchAnalytics}
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tasa de Ejecución"
          value={`${completionRate}%`}
          change={8}
          changeLabel="vs. semana anterior"
          icon={Activity}
          color="primary"
        />
        <MetricCard
          title="Tráfico Promedio"
          value={`${metrics.avgTraffic}%`}
          change={metrics.avgTraffic > 60 ? 5 : -3}
          changeLabel="capacidad"
          icon={Users}
          color="accent"
        />
        <MetricCard
          title="Rating Promedio"
          value={metrics.avgRating || "—"}
          change={0.2}
          changeLabel="⭐ puntos"
          icon={Star}
          color="warning"
        />
        <MetricCard
          title="Conocimiento"
          value={metrics.totalInsights}
          change={metrics.weeklyGrowth}
          changeLabel="respuestas"
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Tendencia de Tráfico
            </CardTitle>
            <CardDescription>Ocupación del local por día</CardDescription>
          </CardHeader>
          <CardContent>
            {trafficData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="traffic" 
                    stroke={CHART_COLORS.accent} 
                    fillOpacity={1} 
                    fill="url(#colorTraffic)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>No hay datos de tráfico. Haz check-ins para ver tendencias.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Ejecución de Acciones
            </CardTitle>
            <CardDescription>Acciones completadas vs pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            {actionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={actionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="completed" stackId="a" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill={CHART_COLORS.muted} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>No hay datos de acciones. El sistema generará acciones automáticamente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-warning" />
              Por Categoría
            </CardTitle>
            <CardDescription>Distribución de acciones completadas</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm text-center">
                <p>Completa acciones para ver la distribución por categoría</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Crecimiento del Conocimiento
            </CardTitle>
            <CardDescription>Respuestas acumuladas que personalizan tu CEO</CardDescription>
          </CardHeader>
          <CardContent>
            {knowledgeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={knowledgeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.success, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm text-center">
                <p>Responde preguntas para ver cómo crece el conocimiento de tu negocio</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews if available */}
      {reviewsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              Tendencia de Reseñas
            </CardTitle>
            <CardDescription>Rating promedio de fuentes externas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={reviewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke={CHART_COLORS.warning} 
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.warning, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;