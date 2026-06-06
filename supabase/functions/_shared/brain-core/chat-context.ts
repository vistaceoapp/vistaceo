// Brain Core — Contexto obligatorio de chat (Parte 3 §1).
// Carga internamente el set mínimo de datos que VISTACEO debe conocer antes
// de responder. Devuelve una versión LIMPIA y compacta lista para inyectar
// como system prompt — nunca expone snake_case ni JSON al usuario.

import { resolveCountryTone } from "./country-tone.ts";

export interface ChatContext {
  countryCode: string | null;
  toneHint: string;
  offer: string | null;
  customer: string | null;
  channels: string[];
  mainFriction: string | null;
  currentGoal: string | null;
  activeMissions: string[];
  detectedOpportunities: string[];
  healthSummary: string | null;
  recentLearnings: string[];
  missingData: string[];
  acceptedActions: string[];
  rejectedActions: string[];
  plan: string;
  remainingMessages: number | null;
}

export function buildChatContextPrompt(ctx: ChatContext): string {
  const tone = resolveCountryTone(ctx.countryCode ?? undefined);
  const lines: string[] = [];

  lines.push("CONTEXTO BRAIN (uso interno, nunca mostrar campos):");
  if (ctx.countryCode) lines.push(`- País: ${ctx.countryCode}. Tono: ${tone.label}.`);
  if (ctx.offer) lines.push(`- Oferta principal: ${ctx.offer}.`);
  if (ctx.customer) lines.push(`- Cliente objetivo: ${ctx.customer}.`);
  if (ctx.channels.length) lines.push(`- Canales reales: ${ctx.channels.join(", ")}.`);
  if (ctx.mainFriction) lines.push(`- Fricción principal: ${ctx.mainFriction}.`);
  if (ctx.currentGoal) lines.push(`- Objetivo actual: ${ctx.currentGoal}.`);
  if (ctx.activeMissions.length) lines.push(`- Misiones activas: ${ctx.activeMissions.slice(0,3).join(" | ")}.`);
  if (ctx.detectedOpportunities.length) lines.push(`- Oportunidades vivas: ${ctx.detectedOpportunities.slice(0,3).join(" | ")}.`);
  if (ctx.healthSummary) lines.push(`- Salud del negocio: ${ctx.healthSummary}.`);
  if (ctx.recentLearnings.length) lines.push(`- Aprendizajes recientes: ${ctx.recentLearnings.slice(0,4).join(" | ")}.`);
  if (ctx.missingData.length) lines.push(`- Datos faltantes que sería útil confirmar: ${ctx.missingData.slice(0,3).join(", ")}.`);
  if (ctx.acceptedActions.length) lines.push(`- Acciones que el usuario ya aceptó: ${ctx.acceptedActions.slice(0,3).join(" | ")}.`);
  if (ctx.rejectedActions.length) lines.push(`- Acciones rechazadas (no insistir igual): ${ctx.rejectedActions.slice(0,3).join(" | ")}.`);
  lines.push(`- Plan: ${ctx.plan}.`);
  if (ctx.remainingMessages != null) lines.push(`- Mensajes restantes: ${ctx.remainingMessages}.`);

  lines.push("");
  lines.push("REGLAS DE RESPUESTA (Parte 3):");
  lines.push("- Hablar como CEO del negocio específico, no como asistente general.");
  lines.push("- Conectar la respuesta con al menos uno: misión, oportunidad, métrica, fricción, dato faltante, acción concreta, salud.");
  lines.push("- Si falta información, dar una hipótesis prudente y a lo sumo UNA pregunta breve.");
  lines.push("- No repetir el mensaje del usuario ni respuestas anteriores.");
  lines.push("- Español natural. Tono ejecutivo. Sin emojis decorativos. Sin asteriscos markdown. Sin JSON.");
  lines.push("- Nunca decir 'tuve un problema', 'error', 'fallback', 'prompt', nombres de modelos.");

  return lines.join("\n");
}
