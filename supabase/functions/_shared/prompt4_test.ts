// PROMPT 4 — server-side gate tests for the remaining hardened functions.
// Run with: deno test --allow-env --allow-net supabase/functions/_shared/prompt4_test.ts
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateBeforeStore } from "./validate-before-store.ts";
import { gateCompetitor, gateReputation, gateHealthScore, gateSeedInsight, gateOpportunity, gateMission, gatePrediction, gateAnalytics } from "./quality-gates.ts";
import { validateQuestionServer, CLARIFY_OPTION } from "./questionnaire-gates.ts";
import { containsForbidden } from "./ai-output-sanitizer.ts";

Deno.test("scan-competitors: ai_estimated source is rejected", () => {
  const r = gateCompetitor({ name: "Café Inventado", sourceType: "ai_estimated" });
  assertEquals(r.passed, false);
  assert(r.reasons.includes("competitor_invented"));
});

Deno.test("scan-competitors: google_places source passes", () => {
  const r = gateCompetitor({ name: "Café Real", sourceType: "google_places" });
  assertEquals(r.passed, true);
});

Deno.test("analyze-reputation: positive score without reviews must be labeled", () => {
  const fail = gateReputation({ reviewsCount: 0, score: 80, summary: "Tu negocio tiene excelente reputación." });
  assertEquals(fail.passed, false);
  assert(fail.reasons.includes("reputation_without_real_data_unlabeled"));

  const ok = gateReputation({ reviewsCount: 0, score: 80, summary: "Estimación basada en la información proporcionada al Brain." });
  assertEquals(ok.passed, true);
});

Deno.test("analyze-patterns: market_signal token leak blocks opportunity", () => {
  const audit = validateBeforeStore({
    module: "opportunity",
    title: "Nueva oportunidad",
    description: "Basada en market_signal detectado.",
  });
  assertEquals(audit.passed, false);
  assert(audit.reasons.includes("red_list_leak"));
});

Deno.test("analyze-patterns: raw Google News URL blocks opportunity", () => {
  const r = gateOpportunity({
    title: "Tendencia detectada",
    description: "Ver fuente.",
    source_url: "https://news.google.com/rss/articles/abc",
  });
  assertEquals(r.passed, false);
  assert(r.reasons.includes("rss_url_raw"));
});

Deno.test("analyze-patterns: generic opportunity description blocked", () => {
  const r = gateOpportunity({ title: "Cuéntame 3 cosas", description: "Cuéntame 3 cosas más." });
  assertEquals(r.passed, false);
});

Deno.test("generate-questionnaire: question without options is dropped", () => {
  const r = validateQuestionServer({
    title: { es: "¿Cuál es tu mayor desafío?" },
    type: "single",
    dimension: "growth",
    category: "goals",
    options: [],
  });
  assertEquals(r.passed, false);
  assert(r.reasons.includes("missing_options"));
});

Deno.test("generate-questionnaire: more than 6 normal options is blocked", () => {
  const opts = Array.from({ length: 8 }).map((_, i) => ({ id: `o${i}`, label: { es: `Opción ${i}` } }));
  const r = validateQuestionServer({
    title: { es: "¿Cuántas mesas tienes hoy?" },
    type: "single",
    dimension: "efficiency",
    category: "operation",
    options: opts,
  });
  assertEquals(r.passed, false);
  assert(r.reasons.includes("too_many_options"));
});

Deno.test("generate-questionnaire: CLARIFY_OPTION es horizontal y no autoavanza", () => {
  assertEquals(CLARIFY_OPTION.autoAdvance, false);
  assertEquals(CLARIFY_OPTION.opensInput, true);
  assertEquals(CLARIFY_OPTION.horizontal, true);
});

Deno.test("generate-questionnaire: requiere targetBrainField, affectedModules y mobileSafe", () => {
  const r = validateQuestionServer({
    title: { es: "¿Cómo se siente tu equipo esta semana?" },
    type: "single",
    dimension: "team",
    category: "team",
    options: [
      { id: "a", label: { es: "Motivado" } },
      { id: "b", label: { es: "Cansado" } },
      { id: "c", label: { es: "Estresado" } },
      { id: "d", label: { es: "Indiferente" } },
    ],
  });
  assertEquals(r.passed, true);
  assert(r.question.targetBrainField.startsWith("factual."));
  assert(r.question.affectedModules.length > 0);
  assertEquals(r.question.mobileSafe, true);
});

Deno.test("missions: pasos pobres no pasan el quality gate", () => {
  const r = gateMission({
    title: "Mejorar ventas",
    description: "Vamos a vender más esta semana.",
    steps: [{ title: "A", description: "x" }],
  });
  assertEquals(r.passed, false);
});

Deno.test("predictions: sin evidencia no pasan el quality gate", () => {
  const r = gatePrediction({ title: "Subirán las ventas", baseEvidence: "" });
  assertEquals(r.passed, false);
  assert(r.reasons.includes("prediction_missing_evidence"));
});

Deno.test("analytics: 0% como verdad sin métricas se bloquea", () => {
  const r = gateAnalytics({ interpretation: "Tu conversión es del 0% esta semana.", metricsCount: 0 });
  assertEquals(r.passed, false);
});

Deno.test("seed-insight: título genérico sin descripción desarrollada se bloquea", () => {
  const r = gateSeedInsight({ title: "Mejorar ventas", description: "Vendé más." });
  assertEquals(r.passed, false);
});

Deno.test("health: score 0 sin datos reales se rechaza", () => {
  const r = gateHealthScore({ score: 0, hasData: false, rationale: "Aún no hay datos." });
  assertEquals(r.passed, false);
  assert(r.reasons.includes("zero_as_truth_without_data"));
});

Deno.test("red list: [object Object] se detecta como leak", () => {
  assert(containsForbidden("Resultado: [object Object]"));
});
