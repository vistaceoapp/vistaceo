/**
 * Initial mission steps builder — devuelve pasos contextuales (no genéricos)
 * cuando una oportunidad se convierte en misión, mientras el AI plan completo
 * se carga en segundo plano vía generate-mission-plan.
 */

interface OpportunityLike {
  title?: string | null;
  description?: string | null;
  source?: string | null;
  evidence?: unknown;
}
interface BusinessLike {
  name?: string | null;
  category?: string | null;
}

export interface InitialStep {
  text: string;
  done: boolean;
  howTo?: string[];
  why?: string;
  timeEstimate?: string;
  metric?: string;
  confidence?: "high" | "medium" | "low";
}

export function buildInitialMissionSteps(
  opp: OpportunityLike,
  business: BusinessLike | null,
): InitialStep[] {
  const name = business?.name || "tu negocio";
  const title = (opp.title || "esta oportunidad").trim();

  return [
    {
      text: `Mapear la situación actual de ${name} en este punto`,
      done: false,
      howTo: [
        "Anotá cómo se está haciendo hoy y cuánto tiempo te lleva.",
        "Identificá 2 o 3 puntos concretos a mejorar.",
      ],
      why: "Sin un punto de partida claro no se puede medir mejora.",
      timeEstimate: "20 min",
      metric: "Diagnóstico documentado",
      confidence: "high",
    },
    {
      text: `Definir el resultado concreto que querés lograr con: ${title}`,
      done: false,
      howTo: [
        "Escribí el resultado en una frase con un número o porcentaje.",
        "Fijá un plazo realista (2 a 4 semanas).",
      ],
      why: "Una meta clara y medible guía las próximas decisiones.",
      timeEstimate: "15 min",
      metric: "Meta numérica con plazo",
      confidence: "high",
    },
    {
      text: "Diseñar el cambio mínimo viable que prueba la mejora",
      done: false,
      howTo: [
        "Elegí la acción más pequeña que ya impacta el resultado esperado.",
        "Listá los recursos y permisos que necesitás.",
      ],
      why: "Probar chico baja el riesgo y acelera el aprendizaje.",
      timeEstimate: "30 min",
      metric: "Plan de cambio mínimo definido",
      confidence: "medium",
    },
    {
      text: "Aplicar el cambio en un caso real esta semana",
      done: false,
      howTo: [
        "Ejecutalo con un cliente, propuesta o turno reales.",
        "Registrá tiempos, errores y reacciones del equipo o del cliente.",
      ],
      why: "Solo se aprende de verdad cuando se aplica.",
      timeEstimate: "1 a 3 días",
      metric: "Cambio aplicado al menos 1 vez",
      confidence: "medium",
    },
    {
      text: "Medir el resultado y decidir el próximo paso",
      done: false,
      howTo: [
        "Comparalo contra la meta que definiste en el paso 2.",
        "Decidí: escalar, ajustar o descartar.",
      ],
      why: "El cierre vuelve esta misión en aprendizaje útil para el negocio.",
      timeEstimate: "20 min",
      metric: "Resultado vs meta",
      confidence: "high",
    },
  ];
}
