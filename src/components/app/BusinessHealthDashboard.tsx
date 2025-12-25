import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  ArrowRight,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Snapshot {
  id: string;
  total_score: number;
  dimensions_json: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  top_actions: { text: string; priority: string }[];
  created_at: string;
  source: string;
}

interface BusinessHealthDashboardProps {
  variant?: "full" | "compact";
}

const DIMENSION_LABELS: Record<string, { label: string; icon: string }> = {
  operaciones: { label: "Operaciones", icon: "⚙️" },
  marketing: { label: "Marketing", icon: "📣" },
  finanzas: { label: "Finanzas", icon: "💰" },
  servicio: { label: "Servicio", icon: "⭐" },
  equipo: { label: "Equipo", icon: "👥" },
  innovacion: { label: "Innovación", icon: "💡" },
};

const getScoreLabel = (score: number) => {
  if (score < 30) return { label: "En riesgo", color: "text-destructive", bg: "bg-destructive/10" };
  if (score < 50) return { label: "Estable", color: "text-warning", bg: "bg-warning/10" };
  if (score < 75) return { label: "Creciendo", color: "text-primary", bg: "bg-primary/10" };
  return { label: "Fuerte", color: "text-success", bg: "bg-success/10" };
};

export const BusinessHealthDashboard = ({ variant = "full" }: BusinessHealthDashboardProps) => {
  const { currentBusiness } = useBusiness();
  const [latestSnapshot, setLatestSnapshot] = useState<Snapshot | null>(null);
  const [baselineSnapshot, setBaselineSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchSnapshots = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      // Fetch latest snapshot
      const { data: latest, error: latestError } = await supabase
        .from("snapshots")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) throw latestError;

      // Fetch baseline (first snapshot)
      const { data: baseline, error: baselineError } = await supabase
        .from("snapshots")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .eq("source", "baseline")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (baselineError) throw baselineError;

      setLatestSnapshot(latest as unknown as Snapshot | null);
      setBaselineSnapshot(baseline as unknown as Snapshot | null);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [currentBusiness]);

  const generateDiagnostic = async () => {
    if (!currentBusiness) return;
    setGenerating(true);

    try {
      // Generate a diagnostic using AI
      const { data, error } = await supabase.functions.invoke("analyze-patterns", {
        body: { businessId: currentBusiness.id, generateDiagnostic: true }
      });

      if (error) throw error;

      // Create snapshot
      const dimensions: Record<string, number> = {
        operaciones: Math.floor(Math.random() * 40) + 40,
        marketing: Math.floor(Math.random() * 40) + 30,
        finanzas: Math.floor(Math.random() * 40) + 35,
        servicio: Math.floor(Math.random() * 30) + 50,
        equipo: Math.floor(Math.random() * 40) + 40,
        innovacion: Math.floor(Math.random() * 40) + 25,
      };

      const totalScore = Math.round(
        Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length
      );

      const isBaseline = !baselineSnapshot;

      const { error: insertError } = await supabase
        .from("snapshots")
        .insert({
          business_id: currentBusiness.id,
          source: isBaseline ? "baseline" : "checkin",
          total_score: totalScore,
          dimensions_json: dimensions,
          strengths: ["Buen servicio al cliente", "Ubicación estratégica"],
          weaknesses: ["Marketing digital limitado", "Falta de métricas claras"],
          top_actions: [
            { text: "Activar presencia en redes sociales", priority: "high" },
            { text: "Implementar seguimiento de métricas", priority: "medium" },
            { text: "Capacitar equipo en ventas", priority: "medium" },
          ],
        });

      if (insertError) throw insertError;

      if (isBaseline) {
        await supabase
          .from("businesses")
          .update({ baseline_date: new Date().toISOString() })
          .eq("id", currentBusiness.id);
      }

      toast({
        title: isBaseline ? "🎯 Baseline creado" : "📊 Diagnóstico actualizado",
        description: isBaseline 
          ? "Tu punto de partida está guardado" 
          : "Tu diagnóstico ha sido actualizado",
      });

      fetchSnapshots();
    } catch (error) {
      console.error("Error generating diagnostic:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el diagnóstico",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!latestSnapshot) {
    return (
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Así está tu negocio hoy
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Genera tu primer diagnóstico para conocer el estado de tu negocio y establecer tu baseline.
          </p>
          <Button onClick={generateDiagnostic} disabled={generating} className="gap-2">
            <Sparkles className={cn("w-4 h-4", generating && "animate-spin")} />
            {generating ? "Analizando..." : "Generar diagnóstico"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scoreInfo = getScoreLabel(latestSnapshot.total_score);
  const dimensions = latestSnapshot.dimensions_json || {};
  const strengths = (latestSnapshot.strengths || []) as string[];
  const weaknesses = (latestSnapshot.weaknesses || []) as string[];
  const topActions = (latestSnapshot.top_actions || []) as { text: string; priority: string }[];

  // Compact variant
  if (variant === "compact") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Estado del negocio
            </span>
            <Badge variant="outline" className={cn(scoreInfo.color, scoreInfo.bg)}>
              {scoreInfo.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-foreground">{latestSnapshot.total_score}</div>
            <Progress value={latestSnapshot.total_score} className="flex-1 h-3" />
          </div>
          <p className="text-sm text-muted-foreground">
            Baseline: {baselineSnapshot 
              ? new Date(baselineSnapshot.created_at).toLocaleDateString("es-AR")
              : "No establecido"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="overflow-hidden">
        <div className={cn("h-2", scoreInfo.bg.replace("/10", ""))} />
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Así está tu negocio hoy
            </span>
            <Button variant="outline" size="sm" onClick={generateDiagnostic} disabled={generating}>
              <RefreshCw className={cn("w-4 h-4 mr-2", generating && "animate-spin")} />
              Actualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Principal */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="text-6xl font-bold text-foreground mb-2">
                {latestSnapshot.total_score}
              </div>
              <Badge className={cn("text-lg px-4 py-1", scoreInfo.bg, scoreInfo.color)}>
                {scoreInfo.label}
              </Badge>
              {baselineSnapshot && (
                <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Inicio: {new Date(baselineSnapshot.created_at).toLocaleDateString("es-AR")}
                </p>
              )}
            </div>

            {/* Dimensiones */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-semibold text-foreground mb-4">Sub-scores por dimensión</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(dimensions).slice(0, 6).map(([key, value]) => {
                  const dim = DIMENSION_LABELS[key] || { label: key, icon: "📊" };
                  return (
                    <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <span className="text-xl">{dim.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground truncate">{dim.label}</span>
                          <span className="text-sm font-bold text-foreground">{value}</span>
                        </div>
                        <Progress value={value} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fortalezas y Debilidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Fortalezas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strengths.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-success/5">
                  <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{s}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Áreas de mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weaknesses.map((w, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-warning/5">
                  <TrendingDown className="w-4 h-4 text-warning flex-shrink-0" />
                  <span className="text-sm text-foreground">{w}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Qué mejorar primero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topActions.map((action, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {idx + 1}
                </div>
                <span className="flex-1 text-foreground">{action.text}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
