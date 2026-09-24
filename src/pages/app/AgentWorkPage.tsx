import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/app/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, UserPlus, Check, ExternalLink, Download, Lock } from "lucide-react";

type Lead = { id: string; name: string; email: string | null; company: string | null; context: string | null };
type Task = {
  id: string; title: string; status: string; recipient: string | null; subject: string | null; body: string | null;
  provenance: Record<string, unknown>; events: Array<{ at: string; type: string; note?: string }>;
  approved_at: string | null; created_at: string; lead_id: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador — esperando tu aprobación",
  approved: "Aprobado — todavía no se envió",
  opened_in_client: "Abierto en tu correo — envío no confirmado",
  sent_confirmed: "Enviado (confirmado por el proveedor)",
  replied: "Respondió",
  closed: "Cerrado",
  cancelled: "Cancelado",
};

const AgentWorkPage = () => {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", company: "", context: "" });
  const [goal, setGoal] = useState("");
  const [busyLead, setBusyLead] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { subject: string; body: string; recipient: string }>>({});

  const load = useCallback(async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const [l, t] = await Promise.all([
      supabase.from("agent_leads").select("id,name,email,company,context").eq("business_id", currentBusiness.id).order("created_at", { ascending: false }),
      supabase.from("agent_tasks").select("*").eq("business_id", currentBusiness.id).order("created_at", { ascending: false }).limit(50),
    ]);
    setLeads((l.data as Lead[]) ?? []);
    setTasks((t.data as unknown as Task[]) ?? []);
    setLoading(false);
  }, [currentBusiness]);

  useEffect(() => { load(); }, [load]);

  const addLead = async () => {
    if (!currentBusiness || !user || !form.name.trim()) return;
    const email = form.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Correo inválido", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("agent_leads").insert({
      business_id: currentBusiness.id, user_id: user.id, name: form.name.trim().slice(0, 120),
      email: email || null, company: form.company.trim().slice(0, 120) || null,
      context: form.context.trim().slice(0, 600) || null, source: "manual",
    });
    if (error) { toast({ title: "No se pudo guardar el contacto", variant: "destructive" }); return; }
    setForm({ name: "", email: "", company: "", context: "" });
    load();
  };

  const draftFor = async (lead: Lead) => {
    setBusyLead(lead.id);
    const { data, error } = await supabase.functions.invoke("agent-draft-followup", { body: { leadId: lead.id, goal } });
    setBusyLead(null);
    if (error) {
      const d = error instanceof FunctionsHttpError ? await error.context.json().catch(() => ({})) : {};
      toast({ title: (d as { error?: string }).error || "No se pudo preparar el borrador", variant: "destructive" });
      return;
    }
    if (data?.task) load();
  };

  const pushEvent = (t: Task, type: string, note: string) => [...(t.events || []), { at: new Date().toISOString(), type, note }];

  const saveEdit = async (t: Task) => {
    const e = edits[t.id]; if (!e) return;
    await supabase.from("agent_tasks").update({
      subject: e.subject.slice(0, 200), body: e.body.slice(0, 4000), recipient: e.recipient.trim() || null,
      events: pushEvent(t, "edited", "Editado por el dueño"),
    }).eq("id", t.id);
    setEdits((s) => { const n = { ...s }; delete n[t.id]; return n; });
    load();
  };

  const approve = async (t: Task) => {
    await supabase.from("agent_tasks").update({
      status: "approved", approved_at: new Date().toISOString(),
      events: pushEvent(t, "approved", "Aprobado por el dueño. Todavía no se envió."),
    }).eq("id", t.id);
    load();
  };

  const openInClient = async (t: Task) => {
    const href = `mailto:${encodeURIComponent(t.recipient || "")}?subject=${encodeURIComponent(t.subject || "")}&body=${encodeURIComponent(t.body || "")}`;
    await supabase.from("agent_tasks").update({
      status: "opened_in_client", execution_channel: "mailto",
      events: pushEvent(t, "opened_in_client", "Abierto en el correo del dueño. El envío no está confirmado."),
    }).eq("id", t.id);
    window.location.href = href;
    load();
  };

  const download = (t: Task) => {
    const txt = `Para: ${t.recipient || "(sin destinatario)"}\nAsunto: ${t.subject}\n\n${t.body}\n`;
    const url = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `borrador-${t.id.slice(0, 8)}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentBusiness) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Bandeja de trabajo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tu empleado prepara borradores con los datos reales de tu negocio. Nada se envía sin tu aprobación.
        </p>
      </div>

      <GlassCard className="p-4 flex gap-3 items-start border-border">
        <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Envío automático y seguimiento de respuestas: pendientes hasta conectar tu correo. Mientras tanto, abrís el
          borrador en tu propio correo y lo enviás vos; acá queda como "envío no confirmado".
        </p>
      </GlassCard>

      <GlassCard className="p-5 space-y-3">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><UserPlus className="w-4 h-4" /> Nuevo contacto</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <Input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Correo" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input placeholder="Qué pasó con este contacto" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} />
        </div>
        <Button onClick={addLead} disabled={!form.name.trim()}>Guardar contacto</Button>
      </GlassCard>

      <GlassCard className="p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Contactos</h2>
        <Input placeholder="Objetivo del seguimiento (opcional): ej. retomar el presupuesto enviado" value={goal} onChange={(e) => setGoal(e.target.value)} />
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no cargaste contactos.</p>
        ) : leads.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{l.name}{l.company ? ` · ${l.company}` : ""}</p>
              <p className="text-xs text-muted-foreground truncate">{l.email || "sin correo"}{l.context ? ` · ${l.context}` : ""}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => draftFor(l)} disabled={busyLead === l.id}>
              {busyLead === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4 mr-1" /> Preparar seguimiento</>}
            </Button>
          </div>
        ))}
      </GlassCard>

      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Tareas</h2>
        {tasks.length === 0 && !loading && <p className="text-sm text-muted-foreground">Sin tareas todavía.</p>}
        {tasks.map((t) => {
          const e = edits[t.id];
          return (
            <GlassCard key={t.id} className="p-5 space-y-3" data-testid="agent-task">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground text-sm">{t.title}</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{STATUS_LABEL[t.status] ?? t.status}</span>
              </div>
              {e ? (
                <div className="space-y-2">
                  <Input value={e.recipient} placeholder="Destinatario" onChange={(ev) => setEdits({ ...edits, [t.id]: { ...e, recipient: ev.target.value } })} />
                  <Input value={e.subject} onChange={(ev) => setEdits({ ...edits, [t.id]: { ...e, subject: ev.target.value } })} />
                  <Textarea rows={8} value={e.body} onChange={(ev) => setEdits({ ...edits, [t.id]: { ...e, body: ev.target.value } })} />
                  <Button size="sm" onClick={() => saveEdit(t)}>Guardar cambios</Button>
                </div>
              ) : (
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Para: <span className="text-foreground">{t.recipient || "(sin destinatario)"}</span></p>
                  <p className="text-muted-foreground">Asunto: <span className="text-foreground">{t.subject}</span></p>
                  <p className="whitespace-pre-wrap text-foreground/90 pt-1">{t.body}</p>
                </div>
              )}
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">Procedencia e historial</summary>
                <pre className="whitespace-pre-wrap mt-2">{JSON.stringify(t.provenance?.datos_usados ?? {}, null, 2)}</pre>
                <ul className="mt-2 space-y-0.5">
                  {(t.events || []).map((ev, i) => <li key={i}>{new Date(ev.at).toLocaleString("es")} — {ev.note || ev.type}</li>)}
                </ul>
              </details>
              <div className="flex flex-wrap gap-2">
                {!e && ["draft", "approved"].includes(t.status) && (
                  <Button size="sm" variant="outline" onClick={() => setEdits({ ...edits, [t.id]: { subject: t.subject || "", body: t.body || "", recipient: t.recipient || "" } })}>Editar</Button>
                )}
                {t.status === "draft" && <Button size="sm" onClick={() => approve(t)}><Check className="w-4 h-4 mr-1" /> Aprobar</Button>}
                {["approved", "opened_in_client"].includes(t.status) && (
                  <Button size="sm" onClick={() => openInClient(t)}><ExternalLink className="w-4 h-4 mr-1" /> Abrir borrador en mi correo</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => download(t)}><Download className="w-4 h-4 mr-1" /> Descargar</Button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default AgentWorkPage;
