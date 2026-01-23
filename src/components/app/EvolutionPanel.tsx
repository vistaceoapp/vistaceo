import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Snapshot {
  id: string;
  total_score: number;
  dimensions_json: Record<string, number>;
  created_at: string;
  source: string;
}

interface EvolutionPanelProps {
  variant?: "full" | "compact";
}

const DIMENSION_LABELS: Record<string, string> = {
  // English keys from database
  team: "Equipo",
  growth: "Crecimiento",
  traffic: "Tráfico",
  finances: "Finanzas",
  efficiency: "Eficiencia",
  reputation: "Reputación",
  profitability: "Rentabilidad",
  // Spanish keys (legacy)
  operaciones: "Operaciones",
  marketing: "Marketing",
  finanzas: "Finanzas",
  servicio: "Servicio",
  equipo: "Equipo",
  innovacion: "Innovación",
  crecimiento: "Crecimiento",
  trafico: "Tráfico",
  eficiencia: "Eficiencia",
  reputacion: "Reputación",
  rentabilidad: "Rentabilidad",
};

export const EvolutionPanel = ({ variant = "full" }: EvolutionPanelProps) => {
  const { currentBusiness } = useBusiness();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week");
  const [detailDialog, setDetailDialog] = useState(false);

  useEffect(() => {
    const fetchSnapshots = async () => {
      if (!currentBusiness) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("snapshots")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setSnapshots((data as Snapshot[]) || []);
      } catch (error) {
        console.error("Error fetching snapshots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, [currentBusiness]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-48 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (snapshots.length < 2) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-semibold text-foreground mb-1">Evolución del negocio</h4>
          <p className="text-sm text-muted-foreground">
            Necesitas al menos 2 diagnósticos para ver tu evolución.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latest = snapshots[0];
  const previous = snapshots[1];
  const baseline = snapshots.find(s => s.source === "baseline") || snapshots[snapshots.length - 1];

  const scoreDiff = latest.total_score - previous.total_score;
  const scoreFromBaseline = latest.total_score - (baseline?.total_score || 0);

  const getTrend = (diff: number) => {
    if (diff > 0) return { icon: TrendingUp, color: "text-success", label: "Mejoraste", arrow: ArrowUpRight };
    if (diff < 0) return { icon: TrendingDown, color: "text-destructive", label: "Empeoraste", arrow: ArrowDownRight };
    return { icon: Minus, color: "text-muted-foreground", label: "Igual", arrow: Minus };
  };

  const overallTrend = getTrend(scoreDiff);

  // Calculate dimension changes - filter out _meta and non-numeric values
  const dimensionChanges = Object.keys(latest.dimensions_json || {})
    .filter(key => {
      // Skip _meta and any non-numeric dimension values
      if (key === '_meta') return false;
      const val = latest.dimensions_json?.[key];
      return typeof val === 'number';
    })
    .map(key => {
      const latestVal = (latest.dimensions_json?.[key] as number) || 0;
      const prevVal = (previous.dimensions_json?.[key] as number) || 0;
      const diff = latestVal - prevVal;
      return { key, label: DIMENSION_LABELS[key] || key, latest: latestVal, previous: prevVal, diff };
    });

  // Compact variant
  if (variant === "compact") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Evolución
            </span>
            <Badge variant="outline" className={overallTrend.color}>
              {scoreDiff > 0 ? "+" : ""}{scoreDiff} pts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <overallTrend.icon className={cn("w-5 h-5", overallTrend.color)} />
            <span className="text-sm text-foreground">{overallTrend.label} vs último check-in</span>
          </div>
          <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setDetailDialog(true)}>
            Ver detalle
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evolución del negocio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as "week" | "month")}>
            <TabsList className="mb-4">
              <TabsTrigger value="week">Semanal</TabsTrigger>
              <TabsTrigger value="month">Mensual</TabsTrigger>
            </TabsList>

            <TabsContent value="week" className="space-y-4">
              {/* Overall Score Trend */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <overallTrend.icon className={cn("w-8 h-8", overallTrend.color)} />
                  <div>
                    <p className="font-semibold text-foreground">{overallTrend.label}</p>
                    <p className="text-sm text-muted-foreground">vs último check-in</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("text-2xl font-bold", overallTrend.color)}>
                    {scoreDiff > 0 ? "+" : ""}{scoreDiff}
                  </div>
                  <p className="text-sm text-muted-foreground">puntos</p>
                </div>
              </div>

              {/* Score Timeline */}
              <div className="flex items-end justify-between h-32 gap-1 p-4 rounded-xl bg-secondary/30">
                {snapshots.slice(0, 8).reverse().map((s, idx) => {
                  const height = Math.max(20, (s.total_score / 100) * 100);
                  return (
                    <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className={cn(
                          "w-full rounded-t transition-all",
                          idx === snapshots.slice(0, 8).length - 1 
                            ? "bg-primary" 
                            : "bg-primary/30"
                        )}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("es-AR", { day: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Dimension Changes */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Por dimensión</h4>
                {dimensionChanges.map(d => {
                  const trend = getTrend(d.diff);
                  return (
                    <div key={d.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <span className="text-sm text-foreground">{d.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{d.latest}</span>
                        <trend.arrow className={cn("w-4 h-4", trend.color)} />
                        <span className={cn("text-sm", trend.color)}>
                          {d.diff > 0 ? "+" : ""}{d.diff}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="month">
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>La vista mensual estará disponible con más datos.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de cambios</DialogTitle>
            <DialogDescription>
              Comparativa entre tu último check-in y el anterior
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Score total</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl text-muted-foreground">{previous.total_score}</span>
                <overallTrend.arrow className={cn("w-6 h-6", overallTrend.color)} />
                <span className="text-3xl font-bold text-foreground">{latest.total_score}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {dimensionChanges.map(d => {
                const trend = getTrend(d.diff);
                return (
                  <div key={d.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="font-medium text-foreground">{d.label}</span>
                    <Badge variant="outline" className={trend.color}>
                      {d.diff > 0 ? "+" : ""}{d.diff}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
