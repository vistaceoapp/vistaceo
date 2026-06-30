// VISTACEO Conversion OS — Admin dashboard mínimo.
// Muestra perfiles + últimas decisiones del agente (incluye silencios y razón).
// Lectura directa de tablas vía RLS admin (has_role('admin')).
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  user_id: string;
  plan_status: string | null;
  current_conversion_segment: string | null;
  current_conversion_strategy: string | null;
  next_best_action: string | null;
  next_best_channel: string | null;
  pro_readiness_score: number | null;
  conversion_probability: number | null;
  last_active_at: string | null;
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
  created_at: string;
};

export default function AdminConversionOSPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: pData }, { data: dData }] = await Promise.all([
        supabase
          .from("user_conversion_profiles")
          .select(
            "user_id, plan_status, current_conversion_segment, current_conversion_strategy, next_best_action, next_best_channel, pro_readiness_score, conversion_probability, last_active_at",
          )
          .order("pro_readiness_score", { ascending: false })
          .limit(100),
        supabase
          .from("conversion_agent_decisions")
          .select(
            "id, user_id, strategy, channel, intent, placement, reason, passed_quality_gate, blocked_by_guard, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (cancelled) return;
      setProfiles((pData ?? []) as Profile[]);
      setDecisions((dData ?? []) as Decision[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const silenced = decisions.filter((d) => d.channel === "silent").length;
  const blocked = decisions.filter((d) => d.blocked_by_guard).length;
  const ready = profiles.filter((p) => (p.pro_readiness_score ?? 0) >= 70 && p.plan_status !== "pro").length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Conversion Intelligence OS</h1>
        <p className="text-sm text-muted-foreground">
          Inteligencia individual de conversión. Cero envíos masivos, cero molestia.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Perfiles activos" value={profiles.length} />
        <StatCard label="Listos para Pro" value={ready} />
        <StatCard label="Decisiones (silenciadas)" value={silenced} />
        <StatCard label="Bloqueadas por guard" value={blocked} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cohortes & scores</CardTitle>
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
                  <th className="py-2 pr-3">Segmento</th>
                  <th className="py-2 pr-3">Estrategia</th>
                  <th className="py-2 pr-3">NBA</th>
                  <th className="py-2 pr-3">Pro readiness</th>
                  <th className="py-2 pr-3">Prob.</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.user_id} className="border-t border-border">
                    <td className="py-2 pr-3 font-mono text-xs">{p.user_id.slice(0, 8)}…</td>
                    <td className="py-2 pr-3">{p.plan_status ?? "—"}</td>
                    <td className="py-2 pr-3">{p.current_conversion_segment ?? "—"}</td>
                    <td className="py-2 pr-3">{p.current_conversion_strategy ?? "—"}</td>
                    <td className="py-2 pr-3">{p.next_best_action ?? "—"}</td>
                    <td className="py-2 pr-3">{p.pro_readiness_score ?? 0}</td>
                    <td className="py-2 pr-3">{p.conversion_probability ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decisiones del agente (últimas 100)</CardTitle>
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
              {decisions.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleString("es-AR")}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{d.user_id.slice(0, 8)}…</td>
                  <td className="py-2 pr-3">{d.strategy}</td>
                  <td className="py-2 pr-3">{d.channel}</td>
                  <td className="py-2 pr-3">{d.intent ?? "—"}</td>
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
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
