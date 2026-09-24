// Prepara un borrador de correo de seguimiento comercial para un lead real,
// con datos reales del negocio. NO envía nada: solo guarda la tarea en estado "draft".
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "Falta configuración de IA" }, 500);

    // Cliente con la sesión del usuario: RLS garantiza aislamiento por usuario/negocio.
    const sb = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "No autenticado" }, 401);

    const { leadId, goal } = await req.json().catch(() => ({}));
    if (typeof leadId !== "string") return json({ error: "leadId requerido" }, 400);
    const cleanGoal = typeof goal === "string" ? goal.slice(0, 400) : "";

    const { data: lead, error: leadErr } = await sb.from("agent_leads").select("*").eq("id", leadId).maybeSingle();
    if (leadErr || !lead) return json({ error: "Contacto no encontrado" }, 404);

    const { data: biz } = await sb
      .from("businesses")
      .select("id,name,category,country,address,instagram_handle,settings")
      .eq("id", lead.business_id)
      .maybeSingle();
    if (!biz) return json({ error: "Negocio no encontrado" }, 404);

    const agentName = (biz.settings as any)?.agent?.name ?? null;
    const voseo = ["AR", "UY", "PY"].includes((biz.country || "").toUpperCase());

    const facts = {
      negocio: biz.name,
      rubro: biz.category,
      pais: biz.country,
      direccion: biz.address,
      instagram: biz.instagram_handle,
      contacto: { nombre: lead.name, empresa: lead.company, contexto: lead.context },
      objetivo_del_dueno: cleanGoal || "seguimiento comercial",
    };

    const system = `Redactás correos comerciales breves y humanos en español ${voseo ? "rioplatense (vos)" : "neutro (tú)"}.
Usás SOLO los datos provistos. Prohibido inventar precios, descuentos, cifras, fechas, testimonios o datos no dados.
Si falta un dato, no lo menciones. Máximo 120 palabras en el cuerpo. Sin anglicismos.
Respondés SOLO JSON: {"subject": string, "body": string}. El cuerpo termina con la firma "${biz.name}".`;

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(facts) },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!ai.ok) {
      const t = await ai.text();
      console.error("[agent-draft-followup] AI", ai.status, t);
      if (ai.status === 429) return json({ error: "Demasiadas solicitudes, probá en un minuto" }, 429);
      if (ai.status === 402) return json({ error: "Sin saldo de IA disponible" }, 402);
      return json({ error: "No se pudo preparar el borrador" }, 502);
    }
    const out = await ai.json();
    let parsed: { subject?: string; body?: string } = {};
    try {
      parsed = JSON.parse(out.choices?.[0]?.message?.content ?? "{}");
    } catch { /* noop */ }
    const subject = (parsed.subject || "").trim().slice(0, 200);
    const body = (parsed.body || "").trim().slice(0, 4000);
    if (!subject || !body) return json({ error: "Borrador vacío, reintentá" }, 502);

    const now = new Date().toISOString();
    const { data: task, error: taskErr } = await sb
      .from("agent_tasks")
      .insert({
        business_id: biz.id,
        user_id: user.id,
        lead_id: lead.id,
        kind: "email_followup",
        origin: "owner_order",
        title: `Seguimiento a ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
        status: "draft",
        requires_approval: true,
        recipient: lead.email,
        subject,
        body,
        provenance: {
          datos_usados: facts,
          fuente_contacto: lead.source,
          modelo: "google/gemini-2.5-flash-lite",
          empleado: agentName,
          generado_en: now,
        },
        events: [{ at: now, type: "draft_created", note: "Borrador preparado. Nada fue enviado." }],
      })
      .select()
      .single();
    if (taskErr) {
      console.error("[agent-draft-followup] insert", taskErr);
      return json({ error: "No se pudo guardar la tarea" }, 500);
    }
    return json({ task });
  } catch (e) {
    console.error("[agent-draft-followup]", e);
    return json({ error: "Error inesperado" }, 500);
  }
});
