// Per-owner Gmail: connect, status, send approved task, disconnect.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { appUserReconnectRequired, authorizeAppUserOAuth, callAsAppUser, disconnectAppUser, exchangeAppUserOAuthCode } from "../_shared/appUserConnector.ts";
import { adminClient, deleteConnectionForUser, getConnectionForUser, saveConnectionKeyForUser, setReconnectRequired } from "../_shared/appUserConnections.ts";

const GATEWAY = "https://connector-gateway.lovable.dev";
const CONNECTOR = "google_mail";
const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/gmail.send",
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const b64 = (s: string) => btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
const hdr = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);
const EMAIL_RE = /^[^\s@<>,]+@[^\s@<>,]+\.[^\s@<>,]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Iniciá sesión" }, 401);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Iniciá sesión" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "start") {
      const clientAPIKey = Deno.env.get("GOOGLE_MAIL_APP_USER_CONNECTOR_CLIENT_API_KEY");
      if (!clientAPIKey) return json({ error: "Conexión de Gmail no configurada" }, 500);
      let origin: URL;
      try { origin = new URL(String(body.origin)); } catch { return json({ error: "Origen inválido" }, 400); }
      const existing = await getConnectionForUser(user.id, CONNECTOR);
      const { authorizationUrl } = await authorizeAppUserOAuth({
        gatewayBaseUrl: GATEWAY,
        connectorId: CONNECTOR,
        appUserId: user.id,
        clientAPIKey,
        returnUrl: new URL("/oauth/gmail/return", origin.origin).toString(),
        connectionAPIKey: existing?.key,
        credentialsConfiguration: { scopes: SCOPES },
      });
      return json({ authorizationUrl });
    }

    if (action === "complete") {
      const code = String(body.code ?? "");
      if (!code || code.length > 2000) return json({ error: "Código inválido" }, 400);
      const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(GATEWAY, code);
      if (connectorId !== CONNECTOR) return json({ error: "Conector incorrecto" }, 400);
      // Verify with the provider before marking connected.
      let email: string | null = null;
      const who = await callAsAppUser({ gatewayBaseUrl: GATEWAY, connectionAPIKey, connectorId: CONNECTOR, path: "/oauth2/v2/userinfo" }).catch(() => null);
      if (who?.ok) email = (await who.json()).email ?? null;
      await saveConnectionKeyForUser(user.id, CONNECTOR, connectionAPIKey, email);
      return json({ ok: true, email });
    }

    if (action === "status") {
      const conn = await getConnectionForUser(user.id, CONNECTOR);
      if (!conn) return json({ connected: false });
      if (conn.reconnectRequired) return json({ connected: false, reconnectRequired: true, email: conn.email });
      return json({ connected: true, email: conn.email });
    }

    if (action === "disconnect") {
      const conn = await getConnectionForUser(user.id, CONNECTOR);
      if (conn) {
        await disconnectAppUser({ gatewayBaseUrl: GATEWAY, connectionAPIKey: conn.key, connectorId: CONNECTOR });
        await deleteConnectionForUser(user.id, CONNECTOR);
      }
      return json({ ok: true });
    }

    if (action === "send") {
      const taskId = String(body.taskId ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(taskId)) return json({ error: "Tarea inválida" }, 400);
      // RLS guarantees the task belongs to this user.
      const { data: task, error: tErr } = await userClient.from("agent_tasks").select("*").eq("id", taskId).maybeSingle();
      if (tErr || !task) return json({ error: "Tarea no encontrada" }, 404);
      if (task.external_message_id) return json({ ok: true, alreadySent: true, messageId: task.external_message_id });
      if (!["approved", "opened_in_client"].includes(task.status)) return json({ error: "Primero aprobá el borrador" }, 400);
      const to = String(task.recipient ?? "").trim();
      if (!EMAIL_RE.test(to)) return json({ error: "El destinatario no tiene un correo válido" }, 400);
      if (!task.subject || !task.body) return json({ error: "Falta asunto o cuerpo" }, 400);

      const conn = await getConnectionForUser(user.id, CONNECTOR);
      if (!conn || conn.reconnectRequired) return json({ error: "Conectá tu Gmail primero", needsConnect: true }, 409);

      const raw = b64([
        `To: ${to}`,
        `Subject: ${hdr(String(task.subject).replace(/[\r\n]+/g, " "))}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        String(task.body),
      ].join("\r\n")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY,
        connectionAPIKey: conn.key,
        connectorId: CONNECTOR,
        path: "/gmail/v1/users/me/messages/send",
        requiredScopes: SCOPES,
        init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raw }) },
      });
      if (await appUserReconnectRequired(res)) {
        await setReconnectRequired(user.id, CONNECTOR);
        return json({ error: "Tu acceso a Gmail necesita renovarse", needsConnect: true }, 409);
      }
      if (!res.ok) {
        const details = await res.text();
        console.error(`Gmail send failed [${res.status}]: ${details}`);
        return json({ error: "Gmail rechazó el envío", status: res.status }, 502);
      }
      const sent = await res.json();
      const now = new Date().toISOString();
      const events = Array.isArray(task.events) ? task.events : [];
      events.push({ at: now, type: "sent_confirmed", note: `Enviado desde ${conn.email ?? "tu Gmail"} a ${to}. ID de Gmail: ${sent.id}` });
      const { error: uErr } = await adminClient().from("agent_tasks").update({
        status: "sent_confirmed",
        external_message_id: sent.id,
        execution_channel: "gmail",
        executed_at: now,
        events,
        result_notes: `Gmail confirmó el envío (hilo ${sent.threadId ?? "-"}).`,
      }).eq("id", task.id).eq("user_id", user.id);
      if (uErr) console.error("Task update after send failed", uErr);
      return json({ ok: true, messageId: sent.id });
    }

    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    console.error("gmail-connector error", e);
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
