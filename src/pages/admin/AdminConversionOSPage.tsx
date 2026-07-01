// VISTACEO Conversion OS — Admin Dashboard v2
// Vista completa: KPIs, filtros, tabla de perfiles con drill-down por usuario
// (razonamiento del agente, scores, decisiones históricas). Botón "Recalcular"
// que dispara conversion-run-agent en el momento.
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Search, Brain, Target } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  user_id: string;
  plan_status: string | null;
  current_conversion_segment: string | null;
  micro_segment: string | null;
  top_signal: string | null;
  current_conversion_strategy: string | null;
  next_best_action: string | null;
  next_best_channel: string | null;
  reasoning_summary: string | null;
  pro_readiness_score: number | null;
  conversion_probability: number | null;
  activation_score: number | null;
  engagement_score: number | null;
  value_realization_score: number | null;
  purchase_intent_score: number | null;
  friction_score: number | null;
  churn_risk_score: number | null;
  velocity_7d: number | null;
  velocity_30d: number | null;
  last_active_at: string | null;
  last_agent_run_at: string | null;
  days_since_signup: number | null;
};

type Decision = {
  id: string;
  user_id: string;
  strategy: string;
  channel: string;
  intent: string | null;
  placement: string | null;
  reason: string | null;
  passed_quality_gate: boolean | null;
  blocked_by_guard: string | null;
  scores_snapshot: any;
  context_snapshot: any;
  created_at: string;
};

const SEGMENT_LABELS: Record<string, string> = {
  pro_user: "Pro",
  checkout_abandoned: "Abandonó checkout",
  resistant_to_messages: "Resistente",
  no_business_yet: "Sin negocio",
  at_risk: "En riesgo",
  ready_for_pro: "Listo para Pro",
  high_intent: "Alta intención",
  interest_specific: "Interés puntual",
  accelerating: "Acelerando",
  free_active: "Free activo",
  activated_no_value: "Activado sin valor",
  new_unactivated: "Nuevo sin activar",
};

export default function AdminConversionOSPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [emailsByUser, setEmailsByUser] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const [{ data: pData }, { data: dData }] = await Promise.all([
      supabase
        .from("user_conversion_profiles")
        .select("*")
        .order("pro_readiness_score", { ascending: false })
        .limit(500),
      supabase
        .from("conversion_agent_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);
    setProfiles((pData ?? []) as Profile[]);
    setDecisions((dData ?? []) as Decision[]);

    // Resolver emails vía profiles
    const ids = (pData ?? []).map((p: any) => p.user_id);
    if (ids.length) {
      const { data: profRows } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);
      const map: Record<string, string> = {};
      (profRows ?? []).forEach((r: any) => { map[r.id] = r.email ?? ""; });
      setEmailsByUser(map);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const total = profiles.length;
    const pro = profiles.filter(p => p.plan_status === "pro").length;
    const ready = profiles.filter(p => (p.pro_readiness_score ?? 0) >= 70 && p.plan_status !== "pro").length;
    const highIntent = profiles.filter(p => (p.purchase_intent_score ?? 0) >= 50 && p.plan_status !== "pro").length;
    const atRisk = profiles.filter(p => (p.churn_risk_score ?? 0) >= 60).length;
    const accelerating = profiles.filter(p => (p.velocity_7d ?? 0) > (p.velocity_30d ?? 0) / 2).length;
    const silenced = decisions.filter(d => d.channel === "silent").length;
    const blocked = decisions.filter(d => d.blocked_by_guard).length;
    return { total, pro, ready, highIntent, atRisk, accelerating, silenced, blocked };
  }, [profiles, decisions]);

  const segments = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach(p => {
      const s = p.current_conversion_segment ?? "sin_datos";
      map[s] = (map[s] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (planFilter !== "all" && (p.plan_status ?? "free") !== planFilter) return false;
      if (segmentFilter !== "all" && p.current_conversion_segment !== segmentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const email = (emailsByUser[p.user_id] ?? "").toLowerCase();
        if (!email.includes(q) && !p.user_id.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, planFilter, segmentFilter, search, emailsByUser]);

  const userDecisions = useMemo(() => {
    if (!selectedUser) return [];
    return decisions.filter(d => d.user_id === selectedUser.user_id);
  }, [decisions, selectedUser]);

  async function recomputeUser(userId: string) {
    toast.loading("Recalculando…", { id: `rc-${userId}` });
    try {
      const { data, error } = await supabase.functions.invoke("conversion-run-agent", {
        body: { user_id: userId, trigger_event: "admin_recompute" },
      });
      if (error) throw error;
      toast.success(`Segmento: ${data?.segment ?? "?"} · Prob: ${Math.round(data?.scores?.conversion_probability ?? 0)}%`, { id: `rc-${userId}` });
      await load();
      if (selectedUser?.user_id === userId) {
        // refresh open modal data
        const fresh = (await supabase.from("user_conversion_profiles").select("*").eq("user_id", userId).maybeSingle()).data;
        if (fresh) setSelectedUser(fresh as Profile);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Error", { id: `rc-${userId}` });
    }
  }

  async function recomputeAll() {
    toast.loading("Recalculando cohorte…", { id: "rc-all" });
    const ids = filteredProfiles.slice(0, 50).map(p => p.user_id);
    let ok = 0, fail = 0;
    for (const id of ids) {
      try {
        await supabase.functions.invoke("conversion-run-agent", { body: { user_id: id, trigger_event: "admin_batch" } });
        ok++;
      } catch { fail++; }
    }
    toast.success(`Listo: ${ok} recalculados, ${fail} con error`, { id: "rc-all" });
    await load();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Conversion Intelligence OS</h1>
          <p className="text-sm text-muted-foreground">
            Inteligencia individual con decaimiento por recencia, velocidad de uso y micro-segmentos. Cero envíos masivos.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={recomputeAll} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Recalcular cohorte (top 50)
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        <StatCard label="Perfiles" value={stats.total} />
        <StatCard label="Pro" value={stats.pro} tone="success" />
        <StatCard label="Listos Pro" value={stats.ready} tone="primary" />
        <StatCard label="Alta intención" value={stats.highIntent} tone="primary" />
        <StatCard label="Acelerando" value={stats.accelerating} tone="primary" />
        <StatCard label="En riesgo" value={stats.atRisk} tone="warning" />
        <StatCard label="Silenciados" value={stats.silenced} />
        <StatCard label="Bloqueados guard" value={stats.blocked} tone="warning" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Distribución por segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {segments.map(([seg, n]) => (
              <button
                key={seg}
                onClick={() => setSegmentFilter(seg === segmentFilter ? "all" : seg)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  segmentFilter === seg ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                }`}
              >
                {SEGMENT_LABELS[seg] ?? seg} · <span className="font-semibold">{n}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-base flex-1">Cohortes y scores</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar email o id…" className="h-9 w-64 pl-8" />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Usuario</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3">Segmento · señal</th>
                  <th className="py-2 pr-3">Estrategia</th>
                  <th className="py-2 pr-3">NBA</th>
                  <th className="py-2 pr-3">Pro readiness</th>
                  <th className="py-2 pr-3">Vel 7d/30d</th>
                  <th className="py-2 pr-3">Días</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(p => (
                  <tr key={p.user_id} className="border-t border-border hover:bg-muted/40">
                    <td className="py-2 pr-3">
                      <div className="max-w-[220px] truncate text-xs">
                        {emailsByUser[p.user_id] ?? <span className="font-mono">{p.user_id.slice(0, 8)}…</span>}
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant={p.plan_status === "pro" ? "default" : "secondary"} className="text-[10px]">{p.plan_status ?? "free"}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      <div>{SEGMENT_LABELS[p.current_conversion_segment ?? ""] ?? p.current_conversion_segment ?? "—"}</div>
                      {p.top_signal && <div className="text-[10px] text-muted-foreground">↳ {p.top_signal}</div>}
                    </td>
                    <td className="py-2 pr-3 text-xs">{p.current_conversion_strategy ?? "—"}</td>
                    <td className="py-2 pr-3 text-xs">{p.next_best_action ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <ScoreBar value={p.pro_readiness_score ?? 0} />
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      <span className={p.velocity_7d && p.velocity_30d && p.velocity_7d > p.velocity_30d / 2 ? "text-emerald-600" : ""}>
                        {p.velocity_7d ?? 0}/{p.velocity_30d ?? 0}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{p.days_since_signup ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedUser(p)} title="Ver detalle">
                          <Brain className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => recomputeUser(p.user_id)} title="Recalcular">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProfiles.length === 0 && (
                  <tr><td colSpan={9} className="py-4 text-center text-xs text-muted-foreground">Sin coincidencias</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Decisiones del agente (últimas 100)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Usuario</th>
                <th className="py-2 pr-3">Estrategia</th>
                <th className="py-2 pr-3">Canal</th>
                <th className="py-2 pr-3">Intent</th>
                <th className="py-2 pr-3">Razón / guard</th>
              </tr>
            </thead>
            <tbody>
              {decisions.slice(0, 100).map(d => (
                <tr key={d.id} className="border-t border-border">
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString("es-AR")}</td>
                  <td className="py-2 pr-3 text-xs">
                    {emailsByUser[d.user_id] ? (
                      <span className="truncate">{emailsByUser[d.user_id]}</span>
                    ) : (
                      <span className="font-mono">{d.user_id.slice(0, 8)}…</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{d.strategy}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={d.channel === "silent" ? "outline" : "secondary"} className="text-[10px]">{d.channel}</Badge>
                  </td>
                  <td className="py-2 pr-3 text-xs">{d.intent ?? "—"}</td>
                  <td className="py-2 pr-3 text-xs">
                    {d.blocked_by_guard ? (
                      <span className="text-amber-600">⛔ {d.blocked_by_guard}</span>
                    ) : (
                      <span className="text-muted-foreground">{d.reason ?? "—"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Drill-down por usuario */}
      <Dialog open={!!selectedUser} onOpenChange={o => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-3xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {emailsByUser[selectedUser.user_id] ?? selectedUser.user_id.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Razonamiento del agente</p>
                  <p className="text-sm leading-relaxed">{selectedUser.reasoning_summary ?? "Sin datos"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <MiniScore label="Activación" v={selectedUser.activation_score} />
                  <MiniScore label="Engagement" v={selectedUser.engagement_score} />
                  <MiniScore label="Valor" v={selectedUser.value_realization_score} />
                  <MiniScore label="Intención" v={selectedUser.purchase_intent_score} />
                  <MiniScore label="Fricción" v={selectedUser.friction_score} tone="warn" />
                  <MiniScore label="Churn" v={selectedUser.churn_risk_score} tone="warn" />
                  <MiniScore label="Pro readiness" v={selectedUser.pro_readiness_score} tone="ok" />
                  <MiniScore label="Prob. conversión" v={selectedUser.conversion_probability} tone="ok" />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => recomputeUser(selectedUser.user_id)}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Recalcular ahora
                  </Button>
                  <a
                    href={`/admin/user-timeline/${selectedUser.user_id}`}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    Ver timeline
                  </a>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Últimas 20 decisiones</p>
                  <div className="max-h-64 overflow-y-auto rounded border">
                    <table className="w-full text-xs">
                      <tbody>
                        {userDecisions.slice(0, 20).map(d => (
                          <tr key={d.id} className="border-b last:border-0">
                            <td className="p-2 text-muted-foreground">{new Date(d.created_at).toLocaleString("es-AR")}</td>
                            <td className="p-2">{d.strategy}</td>
                            <td className="p-2">
                              <Badge variant={d.channel === "silent" ? "outline" : "secondary"} className="text-[10px]">{d.channel}</Badge>
                            </td>
                            <td className="p-2">
                              {d.blocked_by_guard ? <span className="text-amber-600">⛔ {d.blocked_by_guard}</span> : d.intent}
                            </td>
                          </tr>
                        ))}
                        {userDecisions.length === 0 && (
                          <tr><td className="p-3 text-center text-muted-foreground">Sin decisiones aún</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "primary" }) {
  const toneCls = tone === "success" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : tone === "primary" ? "text-primary" : "";
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-semibold ${toneCls}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-primary" : "bg-muted-foreground/50";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs tabular-nums">{pct}</span>
    </div>
  );
}

function MiniScore({ label, v, tone }: { label: string; v: number | null; tone?: "ok" | "warn" }) {
  const value = v ?? 0;
  const color = tone === "warn"
    ? (value >= 60 ? "text-amber-600" : value >= 30 ? "text-amber-500" : "text-muted-foreground")
    : (value >= 70 ? "text-emerald-600" : value >= 40 ? "text-primary" : "text-muted-foreground");
  return (
    <div className="rounded border p-2">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}
