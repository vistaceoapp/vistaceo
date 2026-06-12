// Temp ops function: cancela el run trabado de GitHub Actions y relanza el deploy del blog
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  const token = Deno.env.get("GH_PAT") || Deno.env.get("GITHUB_TOKEN");
  if (!token) return new Response(JSON.stringify({ error: "no token" }), { status: 500 });
  const repo = "vistaceoapp/vistaceo";
  const headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "vistaceo-ops",
  };
  const results: Record<string, unknown> = {};

  // 1. Force-cancel stuck run
  const stuckId = "27262050765";
  let r = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${stuckId}/cancel`, { method: "POST", headers });
  results.cancel = r.status;
  if (r.status !== 202) {
    r = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${stuckId}/force-cancel`, { method: "POST", headers });
    results.force_cancel = r.status;
  }

  // 2. Wait a moment, then dispatch fresh deploy on HEAD
  await new Promise((res) => setTimeout(res, 5000));
  r = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers,
    body: JSON.stringify({ event_type: "blog-publish", client_payload: { reason: "redeploy-after-stuck-run-fix" } }),
  });
  results.dispatch = r.status;

  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});
