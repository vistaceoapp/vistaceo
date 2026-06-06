// Brain Core — Recalibración continua (Parte 3 §6).
// Reglas para decidir si un evento debe disparar recalculo del dashboard,
// prioridad de misiones, peso de oportunidades y preguntas sugeridas.
//
// No ejecuta SQL: devuelve un "plan de recalibración" que el edge function
// puede aplicar de forma segura, sin perder historial.

export type RecalibrationEvent =
  | "onboarding_completed"
  | "first_dashboard_view"
  | "chat_message"
  | "mission_accepted"
  | "mission_completed"
  | "mission_rejected"
  | "opportunity_saved"
  | "opportunity_dismissed"
  | "opportunity_applied"
  | "metric_updated"
  | "goal_changed"
  | "friction_declared"
  | "objection_detected"
  | "action_completed"
  | "user_correction"
  | "data_update"
  | "inactivity_on_mission";

export interface RecalibrationPlan {
  recalc_dashboard: boolean;
  recalc_missions: boolean;
  recalc_opportunities: boolean;
  recalc_suggested_questions: boolean;
  recalc_health: boolean;
  reweight_focus: boolean;
  reason: RecalibrationEvent;
  prudence: "low" | "medium" | "high"; // qué tan agresivo recalcular
}

export function planRecalibration(event: RecalibrationEvent): RecalibrationPlan {
  const high: RecalibrationEvent[] = [
    "onboarding_completed", "goal_changed", "user_correction", "mission_completed",
  ];
  const medium: RecalibrationEvent[] = [
    "mission_accepted", "opportunity_applied", "friction_declared", "metric_updated", "data_update",
  ];
  const lvl: RecalibrationPlan["prudence"] =
    high.includes(event) ? "high" : medium.includes(event) ? "medium" : "low";

  return {
    recalc_dashboard: lvl !== "low",
    recalc_missions: ["mission_accepted","mission_completed","mission_rejected","goal_changed","onboarding_completed","user_correction"].includes(event),
    recalc_opportunities: ["opportunity_saved","opportunity_dismissed","opportunity_applied","friction_declared","goal_changed","user_correction"].includes(event),
    recalc_suggested_questions: true,
    recalc_health: ["metric_updated","mission_completed","action_completed","data_update","goal_changed"].includes(event),
    reweight_focus: ["goal_changed","onboarding_completed","user_correction"].includes(event),
    reason: event,
    prudence: lvl,
  };
}
