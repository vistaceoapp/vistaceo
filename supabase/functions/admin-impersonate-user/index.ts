// Admin: genera un magic link para entrar como el usuario (impersonación segura).
// El admin abre el link en una ventana privada y queda con la sesión de ese usuario.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyAdmin(supabase: any, req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data: role } = await supabase
    .from("user_roles").select("role")
    .eq("user_id", user.id).eq("role", "admin").maybeSingle();
  return role ? user : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const admin = await verifyAdmin(supabase, req);
    if (!admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body.userId;
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Email del usuario destino
    const { data: profile } = await supabase
      .from("profiles").select("email").eq("id", userId).maybeSingle();
    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "user not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://www.vistaceo.com";
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: profile.email,
      options: { redirectTo: `${siteUrl}/app/hoy` },
    });
    if (error) throw error;

    // Auditoría
    await supabase.from("user_activity_logs").insert({
      user_id: admin.id,
      business_id: null,
      event_type: `admin_impersonate:${userId}`,
    }).catch(() => {});

    return new Response(JSON.stringify({
      email: profile.email,
      action_link: data?.properties?.action_link,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("admin-impersonate-user error:", e);
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
