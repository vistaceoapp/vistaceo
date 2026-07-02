import { lazy, Suspense, useEffect, useMemo, useState } from "react";
const AdminConversionOSPage = lazy(() => import("./AdminConversionOSPage"));
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Severity = "critical" | "high" | "medium" | "low";
type Status =
  | "open"
  | "auto_fixing"
  | "fixed"
  | "ignored"
  | "manual_required";

interface Incident {
  id: string;
  source: string;
  category: string;
  severity: Severity;
  title: string;
  where_path: string | null;
  detected_by: string;
  context: Record<string, unknown> | null;
  status: Status;
  fix_strategy: string | null;
  fix_result: Record<string, unknown> | null;
  fix_attempts: number;
  occurrences: number;
  last_seen_at: string;
  fixed_at: string | null;
  created_at: string;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  high: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  low: "bg-sky-500/15 text-sky-500 border-sky-500/30",
};

const STATUS_COPY: Record<Status, { label: string; icon: typeof Activity }> = {
  open: { label: "Abierto", icon: AlertOctagon },
  auto_fixing: { label: "Auto-reparando", icon: Zap },
  fixed: { label: "Resuelto", icon: CheckCircle2 },
  ignored: { label: "Ignorado", icon: Clock },
  manual_required: { label: "Requiere acción", icon: AlertTriangle },
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function IncidentRow({
  incident,
  onMarkFixed,
  onIgnore,
}: {
  incident: Incident;
  onMarkFixed?: (id: string) => void;
  onIgnore?: (id: string) => void;
}) {
  const StatusIcon = STATUS_COPY[incident.status].icon;
  return (
    <AccordionItem value={incident.id} className="border-border/50">
      <AccordionTrigger className="hover:no-underline py-3 px-1 group">
        <div className="flex items-start gap-3 text-left w-full pr-3">
          <Badge
            variant="outline"
            className={cn("uppercase text-[10px] font-semibold", SEVERITY_COLOR[incident.severity])}
          >
            {incident.severity}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {incident.title}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
              <span className="capitalize">{incident.source}</span>
              <span>·</span>
              <span>{incident.detected_by}</span>
              {incident.where_path && (
                <>
                  <span>·</span>
                  <code className="bg-muted/40 px-1 rounded text-[10px] truncate max-w-[200px]">
                    {incident.where_path}
                  </code>
                </>
              )}
              <span>·</span>
              <span>{timeAgo(incident.last_seen_at)}</span>
              {incident.occurrences > 1 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                  ×{incident.occurrences}
                </Badge>
              )}
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-[10px]">
            <StatusIcon className="w-3 h-3" />
            {STATUS_COPY[incident.status].label}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-1 pb-4">
        <div className="space-y-3 text-xs">
          {incident.fix_strategy && (
            <div className="rounded-md bg-muted/30 p-3 border border-border/40">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Estrategia de auto-fix
              </p>
              <p className="text-foreground">{incident.fix_strategy}</p>
              {incident.fix_result && (
                <pre className="mt-2 text-[10px] text-muted-foreground whitespace-pre-wrap break-all">
                  {JSON.stringify(incident.fix_result, null, 2)}
                </pre>
              )}
            </div>
          )}
          {incident.context && Object.keys(incident.context).length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Contexto
              </p>
              <pre className="text-[10px] text-muted-foreground/80 whitespace-pre-wrap break-all bg-muted/20 p-2 rounded border border-border/30 max-h-64 overflow-auto">
                {JSON.stringify(incident.context, null, 2)}
              </pre>
            </div>
          )}
          {(onMarkFixed || onIgnore) && (
            <div className="flex gap-2 pt-1">
              {onMarkFixed && (
                <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs"
                  onClick={() => onMarkFixed(incident.id)}>
                  <CheckCircle2 className="w-3 h-3" /> Marcar resuelto
                </Button>
              )}
              {onIgnore && (
                <Button size="sm" variant="ghost" className="gap-1.5 h-7 text-xs"
                  onClick={() => onIgnore(incident.id)}>
                  <Clock className="w-3 h-3" /> Ignorar
                </Button>
              )}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function AdminSaludPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"live" | "fixed" | "conversion">("live");

  const fetchIncidents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ops_incidents")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(200);
    if (!error && data) setIncidents(data as Incident[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
    const channel = supabase
      .channel("ops_incidents_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ops_incidents" },
        () => fetchIncidents(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = useMemo(
    () => incidents.filter((i) => i.status !== "fixed" && i.status !== "ignored"),
    [incidents],
  );
  const fixed = useMemo(
    () => incidents.filter((i) => i.status === "fixed" || i.status === "ignored"),
    [incidents],
  );

  const metrics = useMemo(() => {
    const last24 = incidents.filter(
      (i) => Date.now() - new Date(i.created_at).getTime() < 86_400_000,
    );
    return {
      open: live.length,
      critical: live.filter((i) => i.severity === "critical").length,
      autoFixed: incidents.filter((i) => i.status === "fixed" && i.fix_strategy).length,
      last24: last24.length,
    };
  }, [incidents, live]);

  const markFixed = async (id: string) => {
    const { error } = await supabase
      .from("ops_incidents")
      .update({
        status: "fixed",
        fixed_at: new Date().toISOString(),
        fix_strategy: "Marcado manualmente como resuelto",
      })
      .eq("id", id);
    if (error) {
      toast({ title: "No se pudo marcar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Incidente resuelto" });
      fetchIncidents();
    }
  };

  const ignore = async (id: string) => {
    const { error } = await supabase
      .from("ops_incidents")
      .update({ status: "ignored" })
      .eq("id", id);
    if (!error) {
      toast({ title: "Incidente ignorado" });
      fetchIncidents();
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salud Operativa</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todo lo que se rompe, se demora o se arregla — app y blog en tiempo real.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchIncidents} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Abiertos ahora" value={metrics.open} icon={AlertOctagon} tone="rose" />
        <MetricCard label="Críticos" value={metrics.critical} icon={AlertTriangle} tone="orange" />
        <MetricCard label="Auto-reparados" value={metrics.autoFixed} icon={Wrench} tone="emerald" />
        <MetricCard label="Últimas 24h" value={metrics.last24} icon={Activity} tone="sky" />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "live" | "fixed" | "conversion")}>
        <TabsList>
          <TabsTrigger value="live" className="gap-2">
            En vivo
            {live.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {live.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="fixed" className="gap-2">
            Resueltos
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {fixed.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="conversion" className="gap-2">
            Conversión OS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Incidentes activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Cargando…</p>
              ) : live.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Todo en orden</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No hay incidentes abiertos. Los sensores siguen monitoreando.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[60vh]">
                  <Accordion type="single" collapsible className="w-full">
                    {live.map((i) => (
                      <IncidentRow
                        key={i.id}
                        incident={i}
                        onMarkFixed={markFixed}
                        onIgnore={ignore}
                      />
                    ))}
                  </Accordion>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixed" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Historial de resoluciones</CardTitle>
            </CardHeader>
            <CardContent>
              {fixed.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Todavía no hay incidentes resueltos.
                </p>
              ) : (
                <ScrollArea className="max-h-[60vh]">
                  <Accordion type="single" collapsible className="w-full">
                    {fixed.map((i) => (
                      <IncidentRow key={i.id} incident={i} />
                    ))}
                  </Accordion>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="mt-4">
          <Suspense fallback={<p className="text-sm text-muted-foreground py-8 text-center">Cargando Conversión OS…</p>}>
            <AdminConversionOSPage />
          </Suspense>
        </TabsContent>
      </Tabs>

      <p className="text-[11px] text-muted-foreground/70 text-center">
        Fase 1 activa · Sensores de app, errores, fetch y rendimiento. Próximamente: escaneo automático del blog y auto-healers.
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  tone: "rose" | "orange" | "emerald" | "sky";
}) {
  const toneClass = {
    rose: "text-rose-500 bg-rose-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    sky: "text-sky-500 bg-sky-500/10",
  }[tone];
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", toneClass)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
