import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sanitizeAIOutput, containsForbidden, sanitizeStructuredList } from "./ai-output-sanitizer.ts";
import { validateBeforeStore } from "./validate-before-store.ts";
import { gateMission, gatePrediction, gateChatResponse, gateOpportunity, gateAnalytics, gateDashboardText } from "./quality-gates.ts";

Deno.test("sanitizer: drops Red List content", () => {
  assertEquals(sanitizeAIOutput("hola [object Object] mundo"), "");
  assert(containsForbidden("market_signal: foo"));
  assert(containsForbidden("Q_AI_001 detected"));
});

Deno.test("sanitizer: keeps clean prose", () => {
  const out = sanitizeAIOutput("Tu café tiene buen ticket promedio.");
  assert(out.length > 10);
});

Deno.test("sanitizeStructuredList: rejects short/leaky items", () => {
  const items = ["Siguiente", "ok", "Esta es una acción concreta y útil", "[object Object]"];
  const out = sanitizeStructuredList(items);
  assertEquals(out.length, 1);
});

Deno.test("gateChatResponse: rejects JSON visible", () => {
  const r = gateChatResponse('{ "answer": "x" }');
  assert(!r.passed);
});

Deno.test("gateMission: rejects empty steps", () => {
  const r = gateMission({ title: "Plan grande", description: "Una descripción completa del plan", steps: [{ title: "Siguiente" }] });
  assert(!r.passed);
});

Deno.test("gatePrediction: rejects without evidence", () => {
  const r = gatePrediction({ title: "Predicción de demanda futura" });
  assert(!r.passed);
});

Deno.test("gateOpportunity: rejects RSS source", () => {
  const r = gateOpportunity({ title: "Oportunidad útil", description: "Descripción suficiente para no fallar el length check.", source_url: "https://news.google.com/rss/articles/xyz" });
  assert(!r.passed);
});

Deno.test("gateAnalytics: rejects 0% as truth with no metrics", () => {
  const r = gateAnalytics({ interpretation: "El crecimiento es 0% este mes", metricsCount: 0 });
  assert(!r.passed);
});

Deno.test("gateDashboardText: rejects generic prompt", () => {
  const r = gateDashboardText("Cuéntame 3 cosas sobre tu negocio");
  assert(!r.passed);
});

Deno.test("validateBeforeStore: blocks mission with leak", () => {
  const r = validateBeforeStore({
    module: 'mission',
    title: 'Plan Real',
    description: 'Descripción suficiente con contenido normal del negocio.',
    steps: [
      { title: 'Paso uno claro', description: 'Acción concreta paso uno con detalle.' },
      { title: 'Paso dos claro', description: 'Acción concreta paso dos con detalle.' },
      { title: 'Paso tres claro', description: 'Acción concreta paso tres con [object Object].' },
    ],
  });
  assert(!r.passed);
});

Deno.test("validateBeforeStore: passes clean mission", () => {
  const r = validateBeforeStore({
    module: 'mission',
    title: 'Activar recompra de clientes',
    description: 'Plan para reactivar clientes que no vuelven en 30 días.',
    steps: [
      { title: 'Listar últimos 50 clientes', description: 'Exportá tu base de clientes recientes y ordenala por fecha.' },
      { title: 'Segmentar por valor', description: 'Marcá quiénes tuvieron ticket alto vs bajo en los últimos 90 días.' },
      { title: 'Enviar mensaje personal', description: 'Mandá un WhatsApp directo con una oferta clara y un motivo personal.' },
    ],
  });
  assert(r.passed, JSON.stringify(r.reasons));
});
