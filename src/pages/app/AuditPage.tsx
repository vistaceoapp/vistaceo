import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Filter,
  RefreshCw,
  FileText,
  Target,
  Lightbulb,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type RecommendationTrace = {
  id: string;
  output_type: string;
  output_content: Record<string, unknown>;
  confidence: string;
  why_summary: string;
  based_on: unknown[];
  variables_used: Record<string, unknown>;
  passed_quality_gate: boolean;
  quality_gate_score: number | null;
  quality_gate_details: Record<string, unknown>;
  is_blocked: boolean;
  block_reason: string | null;
  user_feedback: string | null;
  feedback_notes: string | null;
  created_at: string;
};

type RecommendationFeedback = {
  id: string;
  applied_status: string;
  blocker: string | null;
  notes: string | null;
  action_id: string | null;
  mission_id: string | null;
  opportunity_id: string | null;
  created_at: string;
};

const AuditPage = () => {
  const { currentBusiness } = useBusiness();
  const [selectedTrace, setSelectedTrace] = useState<RecommendationTrace | null>(null);
  const [filter, setFilter] = useState<"all" | "passed" | "blocked">("all");

  const { data: traces, isLoading: tracesLoading, refetch: refetchTraces } = useQuery({
    queryKey: ["recommendation-traces", currentBusiness?.id],
    queryFn: async () => {
      if (!currentBusiness?.id) return [];
      const { data, error } = await supabase
        .from("recommendation_traces")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as RecommendationTrace[];
    },
    enabled: !!currentBusiness?.id,
  });

  const { data: feedback, isLoading: feedbackLoading, refetch: refetchFeedback } = useQuery({
    queryKey: ["recommendations-feedback", currentBusiness?.id],
    queryFn: async () => {
      if (!currentBusiness?.id) return [];
      const { data, error } = await supabase
        .from("recommendations_feedback")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as RecommendationFeedback[];
    },
    enabled: !!currentBusiness?.id,
  });

  const filteredTraces = traces?.filter(trace => {
    if (filter === "passed") return trace.passed_quality_gate && !trace.is_blocked;
    if (filter === "blocked") return trace.is_blocked || !trace.passed_quality_gate;
    return true;
  });

  const stats = {
    total: traces?.length || 0,
    passed: traces?.filter(t => t.passed_quality_gate && !t.is_blocked).length || 0,
    blocked: traces?.filter(t => t.is_blocked).length || 0,
    avgScore: traces?.length 
      ? (traces.reduce((acc, t) => acc + (t.quality_gate_score || 0), 0) / traces.length).toFixed(1)
      : "0",
    feedbackCount: feedback?.length || 0,
    appliedCount: feedback?.filter(f => f.applied_status === "applied").length || 0,
  };

  const getOutputTypeIcon = (type: string) => {
    switch (type) {
      case "mission": return <Target className="w-4 h-4" />;
      case "action": return <Zap className="w-4 h-4" />;
      case "opportunity": return <Lightbulb className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return (
      <Badge variant={variants[confidence] || "secondary"} className="capitalize">
        {confidence}
      </Badge>
    );
  };

  const getFeedbackStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode }> = {
      applied: { variant: "default", icon: <ThumbsUp className="w-3 h-3 mr-1" /> },
      tried: { variant: "secondary", icon: <Clock className="w-3 h-3 mr-1" /> },
      not_applied: { variant: "outline", icon: <ThumbsDown className="w-3 h-3 mr-1" /> },
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3 mr-1" /> },
    };
    const { variant, icon } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="capitalize flex items-center">
        {icon}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Auditoría de Recomendaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Trazabilidad completa de las recomendaciones del sistema
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { refetchTraces(); refetchFeedback(); }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Trazas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-xs text-muted-foreground">Aprobadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            <div className="text-xs text-muted-foreground">Bloqueadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.avgScore}</div>
            <div className="text-xs text-muted-foreground">Score Promedio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.feedbackCount}</div>
            <div className="text-xs text-muted-foreground">Feedback Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.appliedCount}</div>
            <div className="text-xs text-muted-foreground">Aplicadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="traces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traces">Trazas de Recomendaciones</TabsTrigger>
          <TabsTrigger value="feedback">Feedback del Usuario</TabsTrigger>
        </TabsList>

        {/* Traces Tab */}
        <TabsContent value="traces" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(["all", "passed", "blocked"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Todas" : f === "passed" ? "Aprobadas" : "Bloqueadas"}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Recomendaciones</CardTitle>
              <CardDescription>
                Cada fila representa una recomendación generada por el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tracesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTraces?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay trazas de recomendaciones
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Confianza</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTraces?.map((trace) => (
                        <TableRow key={trace.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(trace.created_at), "dd MMM HH:mm", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getOutputTypeIcon(trace.output_type)}
                              <span className="capitalize text-sm">{trace.output_type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {(trace.output_content as { title?: string })?.title || "Sin título"}
                          </TableCell>
                          <TableCell>{getConfidenceBadge(trace.confidence)}</TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {trace.quality_gate_score?.toFixed(1) || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {trace.is_blocked ? (
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" />
                                Bloqueada
                              </Badge>
                            ) : trace.passed_quality_gate ? (
                              <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Aprobada
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" />
                                Pendiente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {trace.user_feedback ? (
                              <Badge variant="outline" className="capitalize">
                                {trace.user_feedback}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedTrace(trace)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback de Recomendaciones</CardTitle>
              <CardDescription>
                Respuestas del usuario sobre las recomendaciones aplicadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : feedback?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay feedback registrado
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Bloqueador</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedback?.map((fb) => (
                        <TableRow key={fb.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(fb.created_at), "dd MMM HH:mm", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {fb.action_id && <><Zap className="w-4 h-4" /> Acción</>}
                              {fb.mission_id && <><Target className="w-4 h-4" /> Misión</>}
                              {fb.opportunity_id && <><Lightbulb className="w-4 h-4" /> Oportunidad</>}
                            </div>
                          </TableCell>
                          <TableCell>{getFeedbackStatusBadge(fb.applied_status)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {fb.blocker || "—"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {fb.notes || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trace Detail Dialog */}
      <Dialog open={!!selectedTrace} onOpenChange={() => setSelectedTrace(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTrace && getOutputTypeIcon(selectedTrace.output_type)}
              Detalle de Recomendación
            </DialogTitle>
            <DialogDescription>
              {selectedTrace && format(new Date(selectedTrace.created_at), "PPpp", { locale: es })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrace && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Output Content */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Contenido</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedTrace.output_content, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                {/* Why Summary */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Por qué se generó</h4>
                  <p className="text-sm bg-secondary/50 p-3 rounded-lg">
                    {selectedTrace.why_summary}
                  </p>
                </div>

                {/* Based On */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Basado en</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedTrace.based_on) && selectedTrace.based_on.map((item, i) => (
                      <Badge key={i} variant="outline">{String(item)}</Badge>
                    ))}
                    {(!selectedTrace.based_on || (Array.isArray(selectedTrace.based_on) && selectedTrace.based_on.length === 0)) && (
                      <span className="text-sm text-muted-foreground">Sin datos base</span>
                    )}
                  </div>
                </div>

                {/* Variables Used */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Variables utilizadas</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedTrace.variables_used, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                {/* Quality Gate Details */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Detalles Quality Gate</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="text-lg font-bold">{selectedTrace.quality_gate_score?.toFixed(1) || "—"}</p>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <p className="text-lg font-bold">
                        {selectedTrace.passed_quality_gate ? "✅ Aprobada" : "❌ No aprobada"}
                      </p>
                    </div>
                  </div>
                  {selectedTrace.quality_gate_details && Object.keys(selectedTrace.quality_gate_details).length > 0 && (
                    <Card className="mt-2">
                      <CardContent className="pt-4">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(selectedTrace.quality_gate_details, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Block Reason */}
                {selectedTrace.is_blocked && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Razón de bloqueo</h4>
                    <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-lg">
                      {selectedTrace.block_reason || "Sin razón especificada"}
                    </p>
                  </div>
                )}

                {/* User Feedback */}
                {selectedTrace.user_feedback && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Feedback del usuario</h4>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Badge className="mb-2">{selectedTrace.user_feedback}</Badge>
                      {selectedTrace.feedback_notes && (
                        <p className="text-sm">{selectedTrace.feedback_notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditPage;
