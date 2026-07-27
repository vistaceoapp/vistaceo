import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, AlertCircle, Eye, MousePointerClick, RefreshCw, Search, Users, Sparkles, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface Row {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
  opens: number;
  clicks: number;
  lastEngagementAt: string | null;
}
interface Totals {
  total: number; sent: number; failed: number; suppressed: number; pending: number;
  opens: number; clicks: number; uniqueRecipients: number;
}
interface ByTemplate { [k: string]: { sent: number; failed: number; suppressed: number; pending: number; total: number } }

const STATUS_COLORS: Record<string,string> = {
  sent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  dlq: "bg-red-500/10 text-red-600 border-red-500/20",
  bounced: "bg-red-500/10 text-red-600 border-red-500/20",
  suppressed: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  complained: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
};

export default function AdminEmailsPage() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [byTemplate, setByTemplate] = useState<ByTemplate>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-emails-overview", {
        body: {}, // GET via query string
      });
      // Manually call with query string for days
      const sess = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/admin-emails-overview?days=${days}`, {
        headers: { Authorization: `Bearer ${sess}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "error");
      setTotals(json.totals);
      setByTemplate(json.byTemplate || {});
      setRows(json.rows || []);
    } catch (e) {
      console.error("[admin/emails]", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  const templates = useMemo(() => Object.keys(byTemplate).sort(), [byTemplate]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (templateFilter !== "all" && r.template_name !== templateFilter) return false;
      if (search && !r.recipient_email?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, statusFilter, templateFilter, search]);

  const openRate = totals && totals.sent > 0 ? Math.round((totals.opens / totals.sent) * 100) : 0;
  const clickRate = totals && totals.sent > 0 ? Math.round((totals.clicks / totals.sent) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Emails enviados</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envíos, aperturas y clics — vista única de todos los emails de la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Últimas 24h</SelectItem>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="90">90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={Mail} label="Total enviados" value={totals?.total ?? 0} hint={`${totals?.uniqueRecipients ?? 0} destinatarios`} />
        <StatCard icon={Send} label="Entregados" value={totals?.sent ?? 0} tone="success" />
        <StatCard icon={Eye} label="Aperturas" value={totals?.opens ?? 0} hint={`${openRate}% open rate`} tone="info" />
        <StatCard icon={MousePointerClick} label="Clics" value={totals?.clicks ?? 0} hint={`${clickRate}% click rate`} tone="info" />
        <StatCard icon={AlertCircle} label="Fallidos" value={totals?.failed ?? 0} tone="danger" />
        <StatCard icon={AlertCircle} label="Pendientes" value={totals?.pending ?? 0} tone="warn" />
        <StatCard icon={Users} label="Suprimidos" value={totals?.suppressed ?? 0} />
        <StatCard icon={Mail} label="Plantillas activas" value={templates.length} />
      </div>

      {/* Promo Campaign Launcher */}
      <PromoLauncher />

      {/* By template */}
      <Card className="p-4 md:p-5 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Por plantilla</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4 font-medium">Plantilla</th>
                <th className="py-2 px-2 font-medium text-right">Total</th>
                <th className="py-2 px-2 font-medium text-right">Enviados</th>
                <th className="py-2 px-2 font-medium text-right">Fallidos</th>
                <th className="py-2 px-2 font-medium text-right">Suprimidos</th>
                <th className="py-2 px-2 font-medium text-right">Pendientes</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">Sin datos en el rango.</td></tr>
              )}
              {templates.map(t => (
                <tr key={t} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4 font-mono text-xs">{t}</td>
                  <td className="py-2 px-2 text-right">{byTemplate[t].total}</td>
                  <td className="py-2 px-2 text-right text-emerald-600">{byTemplate[t].sent}</td>
                  <td className="py-2 px-2 text-right text-red-600">{byTemplate[t].failed}</td>
                  <td className="py-2 px-2 text-right text-zinc-500">{byTemplate[t].suppressed}</td>
                  <td className="py-2 px-2 text-right text-amber-600">{byTemplate[t].pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar email destinatario…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sent">Enviados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="failed">Fallidos</SelectItem>
              <SelectItem value="dlq">DLQ</SelectItem>
              <SelectItem value="suppressed">Suprimidos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Plantilla" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {templates.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 px-3 font-medium">Destinatario</th>
                <th className="py-2 px-2 font-medium">Plantilla</th>
                <th className="py-2 px-2 font-medium">Estado</th>
                <th className="py-2 px-2 font-medium text-right">Aperturas</th>
                <th className="py-2 px-2 font-medium text-right">Clics</th>
                <th className="py-2 px-3 font-medium text-right">Hace</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Cargando…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Sin resultados.</td></tr>
              )}
              {filtered.slice(0, 200).map(r => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                  <td className="py-2 px-3 truncate max-w-[220px]" title={r.recipient_email}>{r.recipient_email}</td>
                  <td className="py-2 px-2 font-mono text-xs text-muted-foreground">{r.template_name}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className={STATUS_COLORS[r.status] || ""}>{r.status}</Badge>
                    {r.error_message && (
                      <span className="ml-1 text-[10px] text-red-600" title={r.error_message}>!</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {r.opens > 0 ? <span className="text-emerald-600 font-medium">👁 {r.opens}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {r.clicks > 0 ? <span className="text-primary font-medium">👆 {r.clicks}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-2 px-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(r.created_at), { locale: es, addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">Mostrando 200 de {filtered.length}. Filtrá para acotar.</p>
        )}
      </Card>
    </div>
  );
}

function PromoLauncher() {
  const [campaignName, setCampaignName] = useState("Promo primer mes $1 USD (24h)");
  const [usd, setUsd] = useState(1);
  const [ars, setArs] = useState(1200);
  const [hours, setHours] = useState(24);
  const [testEmail, setTestEmail] = useState("");
  const [segments, setSegments] = useState<string[]>(["free_setup_complete"]);
  const [maxRecipients, setMaxRecipients] = useState(500);
  const [busy, setBusy] = useState<"idle" | "test" | "dry" | "send">("idle");
  const [lastResult, setLastResult] = useState<any>(null);

  const toggleSeg = (s: string) => setSegments((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const run = async (mode: "test" | "dry" | "send") => {
    setBusy(mode);
    setLastResult(null);
    try {
      const body: any = {
        createCampaign: { name: campaignName, usdAmount: usd, arsAmount: ars, windowHours: hours },
      };
      if (mode === "test") {
        if (!testEmail.trim()) { toast.error("Ingresá un email de prueba"); setBusy("idle"); return; }
        body.testEmail = testEmail.trim();
      } else {
        body.segments = segments;
        body.maxRecipients = maxRecipients;
        if (mode === "dry") body.dryRun = true;
      }
      const { data, error } = await supabase.functions.invoke("dispatch-promo-campaign", { body });
      if (error) throw error;
      setLastResult(data);
      if (mode === "send") toast.success(`Enviados: ${data?.sent ?? 0}/${data?.planned ?? 0}`);
      if (mode === "test") toast.success(`Email de prueba enviado a ${testEmail}`);
      if (mode === "dry") toast.success(`Simulación: ${data?.planned ?? 0} destinatarios`);
    } catch (e: any) {
      const msg = e?.context?.text ? await e.context.text() : (e?.message || "Error");
      toast.error(`Falló: ${msg}`);
    } finally {
      setBusy("idle");
    }
  };

  const SEG = [
    { id: "free_setup_complete", label: "Free · setup completo" },
    { id: "free_setup_stuck_14d", label: "Setup incompleto (<14d)" },
    { id: "free_active_60d", label: "Activos últimos 60d" },
  ];

  return (
    <Card className="p-4 md:p-5 mb-6 border-primary/30 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Campaña Promo · Primer mes 24hs</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Genera token único por usuario y link mágico <code>/checkout?promo=...</code>. Sin códigos, sin trucos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-[11px] text-muted-foreground uppercase tracking-wide">Nombre</label>
          <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground uppercase tracking-wide">Precio USD (PayPal)</label>
          <Input type="number" step="0.01" value={usd} onChange={(e) => setUsd(parseFloat(e.target.value) || 1)} />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground uppercase tracking-wide">Precio ARS (MP)</label>
          <Input type="number" value={ars} onChange={(e) => setArs(parseInt(e.target.value) || 1200)} />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground uppercase tracking-wide">Ventana (horas)</label>
          <Input type="number" value={hours} onChange={(e) => setHours(parseInt(e.target.value) || 24)} />
        </div>
      </div>

      <div className="border-t border-border pt-4 mb-4">
        <div className="text-xs font-semibold text-foreground mb-2">1) Prueba primero (recomendado)</div>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="tu@email.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="max-w-xs" />
          <Button size="sm" variant="outline" onClick={() => run("test")} disabled={busy !== "idle"}>
            {busy === "test" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
            Enviar email de prueba
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Genera oferta real, envía a esa dirección y crea un checkout funcional para probar el link mágico.</p>
      </div>

      <div className="border-t border-border pt-4">
        <div className="text-xs font-semibold text-foreground mb-2">2) Lanzamiento masivo</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {SEG.map(s => (
            <button key={s.id} onClick={() => toggleSeg(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                segments.includes(s.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"
              }`}>
              {s.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-[11px] text-muted-foreground">Máx:</label>
            <Input type="number" className="w-24 h-8" value={maxRecipients} onChange={(e) => setMaxRecipients(parseInt(e.target.value) || 500)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => run("dry")} disabled={busy !== "idle" || segments.length === 0}>
            {busy === "dry" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Users className="w-4 h-4 mr-1" />}
            Simular (dry run)
          </Button>
          <Button size="sm" className="gradient-primary text-white" onClick={() => run("send")} disabled={busy !== "idle" || segments.length === 0}>
            {busy === "send" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
            Lanzar campaña real
          </Button>
        </div>
      </div>

      {lastResult && (
        <pre className="mt-4 text-[11px] bg-background/60 border border-border rounded p-3 max-h-40 overflow-auto">
{JSON.stringify(lastResult, null, 2)}
        </pre>
      )}
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: number | string; hint?: string; tone?: "success"|"danger"|"warn"|"info" }) {
  const colors = {
    success: "text-emerald-600 bg-emerald-500/10",
    danger: "text-red-600 bg-red-500/10",
    warn: "text-amber-600 bg-amber-500/10",
    info: "text-primary bg-primary/10",
  } as const;
  const c = tone ? colors[tone] : "text-muted-foreground bg-muted";
  return (
    <Card className="p-3 md:p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-bold text-foreground">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </Card>
  );
}
