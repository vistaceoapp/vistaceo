// Blog Factory - 200 Seed Titles for Annual Calendar
// Organized by pillar for easy parsing

export interface SeedTitle {
  title: string;
  pillar: string;
  slug: string;
  intent: 'informational' | 'comparative' | 'soft-transactional' | 'navigational';
  priority_score: number;
}

const PILLAR_EMPLEO = 'empleo';
const PILLAR_IA_APLICADA = 'ia_aplicada';
const PILLAR_LIDERAZGO = 'liderazgo';
const PILLAR_SERVICIOS = 'servicios';
const PILLAR_EMPRENDER = 'emprender';
const PILLAR_SISTEMA_INTELIGENTE = 'sistema_inteligente';

// Helper to generate slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, '') // Trim - from end
    .slice(0, 80); // Max length
}

// Empleo, carreras y habilidades (40 títulos)
const empleoTitles: string[] = [
  "Los trabajos que más crecen con IA (y los que se achican)",
  "Cómo reconvertirte sin empezar de cero: plan realista en 90 días",
  "Habilidades que te hacen contratable aunque no tengas título tech",
  "Cómo armar un CV que demuestre impacto (sin inflar experiencia)",
  "Portfolio que consigue entrevistas: qué mostrar y cómo contarlo",
  "Preguntas de entrevista que filtran talento (y cómo responder bien)",
  "Cómo negociar sueldo y condiciones sin perder la oferta",
  "Cómo cambiar de industria con estrategia (y no por impulso)",
  "El nuevo perfil profesional: humano + IA + criterio",
  "Cómo aprender rápido sin caer en cursos eternos",
  "Trabajo remoto: cómo destacarte sin estar siempre online",
  "Señales de una empresa bien gestionada antes de aceptar un empleo",
  "Señales de una empresa caótica (y cómo detectarlas en entrevista)",
  "Cómo conseguir tu primer rol en datos con experiencia transferible",
  "Analista de datos: ruta de aprendizaje con proyectos simples",
  "Data storytelling: cómo contar números para que te crean",
  "Product Manager: habilidades que separan junior de senior",
  "Project Manager: cómo liderar proyectos sin ser administrador de tareas",
  "Customer Success: el rol que define retención y crecimiento",
  "Ventas modernas: cómo vende el profesional con IA",
  "Marketing moderno: perfiles que más se piden (y por qué)",
  "RR.HH. moderno: del reclutamiento al sistema de performance",
  "Operaciones: el rol invisible que hace rentable una empresa",
  "Finanzas para empresas: habilidades que abren puertas aunque no seas contador",
  "Cómo demostrar liderazgo sin tener cargo de líder",
  "Qué poner en LinkedIn para que te contacten (sin hacer show)",
  "Cómo hacer networking sin incomodar: método en 15 minutos por día",
  "Cómo usar IA para preparar entrevistas (sin sonar robótico)",
  "Cómo usar IA para estudiar más rápido (sin depender de ella)",
  "Tu plan de carrera en 1 página: plantilla para decidir mejor",
  "Certificaciones: cuáles valen la pena según tu rol",
  "No tengo experiencia: cómo conseguirla con proyectos reales",
  "Cómo armar casos de éxito de tu propio trabajo (aunque seas empleado)",
  "Cómo pedir un ascenso con datos y resultados",
  "Cómo manejar burnout sin renunciar: sistema de trabajo sostenible",
  "Cómo organizar tu semana para rendir más (sin vivir apurado)",
  "Los errores que te dejan fuera en entrevistas (y cómo evitarlos)",
  "Cómo elegir un buen jefe: 12 señales que importan de verdad",
  "Cómo elegir un buen equipo: señales de cultura sana",
  "Tendencias de empleo 2026: qué perfiles ganan tracción en LATAM",
];

// IA aplicada a trabajo y empresas (30 títulos)
const iaTitles: string[] = [
  "Agentes de IA: qué son y para qué sirven en una empresa real",
  "Automatización inteligente: tareas que conviene delegar primero",
  "Cómo implementar IA sin caos: reglas simples para empezar",
  "IA en atención al cliente: cómo mejorar sin perder el toque humano",
  "IA en ventas: cómo priorizar leads y mejorar cierres",
  "IA en marketing: cómo producir sin perder calidad",
  "IA en operaciones: cómo bajar errores y tiempos",
  "IA en finanzas: control de caja con alertas tempranas",
  "IA en RR.HH.: selección, onboarding y desempeño con criterio",
  "Cómo medir ROI de IA sin fantasía: fórmula simple",
  "Cómo escribir prompts que funcionan (plantillas para negocios)",
  "Prompts para ventas: seguimiento, objeciones y cierre",
  "Prompts para marketing: calendario, copies y campañas",
  "Prompts para RR.HH.: entrevistas, onboarding y feedback",
  "Prompts para operaciones: SOPs, checklists y control de calidad",
  "IA y privacidad: lo mínimo que tenés que cuidar",
  "IA y riesgos: dónde falla y cómo poner límites",
  "IA vs automatización clásica: cuándo usar cada una",
  "Cómo evitar que la IA invente: método de verificación simple",
  "Cómo entrenar a tu equipo en IA sin asustarlo",
  "Política interna de IA: plantilla clara (sin burocracia)",
  "Cómo usar IA para escribir documentos internos que se cumplen",
  "Cómo usar IA para hacer reportes que se entiendan",
  "Cómo usar IA para analizar competencia sin perder semanas",
  "IA para pricing: decidir precios con datos y criterio",
  "IA para servicio profesional: estandarizar entregables sin perder personalización",
  "Cómo evitar herramientitis: menos herramientas, más sistema",
  "Los errores más comunes implementando IA (y cómo evitarlos)",
  "Mitos sobre IA en empresas: lo que es real y lo que es marketing",
  "Tendencias IA 2026: qué cambia en empresas y equipos",
];

// Liderazgo, gestión y ejecución (30 títulos)
const liderazgoTitles: string[] = [
  "Liderazgo sin microgestión: cómo controlar sin ahogar",
  "Cómo delegar de verdad: checklist que evita el me volvió a caer a mí",
  "Cómo tomar decisiones mejores: método de 3 pasos",
  "Cómo priorizar cuando todo es urgente",
  "Reuniones que sirven: protocolo para bajar la cantidad y subir la calidad",
  "Cultura de ejecución: cómo pasar de ideas a resultados",
  "Cómo alinear áreas: ventas, operaciones y finanzas sin guerra interna",
  "OKR sin burocracia: cómo usarlos para ejecutar",
  "KPI que importan: tablero mínimo para líderes",
  "Cómo diseñar procesos sin volver tu empresa lenta",
  "Cómo construir hábitos de liderazgo que sostienen crecimiento",
  "Feedback que mejora performance: guion y ejemplos",
  "Cómo manejar conversaciones difíciles sin romper el vínculo",
  "Gestión del cambio: cómo implementar sin resistencia",
  "Cómo contratar mejor: proceso y señales reales",
  "Onboarding que funciona: checklist de primeras 2 semanas",
  "Cómo evaluar desempeño sin injusticias ni subjetividad",
  "Cómo detectar cuellos de botella antes de que exploten",
  "Cómo ordenar un negocio desordenado en 30 días",
  "El error número 1 del management: confundir actividad con progreso",
  "Cómo hacer seguimiento sin perseguir a la gente",
  "Cómo diseñar roles y responsabilidades sin duplicación",
  "Cómo armar un playbook que la empresa realmente use",
  "Cómo crear una rutina semanal de dirección que no se abandona",
  "Cómo liderar equipos híbridos sin perder coordinación",
  "Cómo retener talento: lo que funciona (y lo que ya no)",
  "Cómo reducir rotación: sistema de señales tempranas",
  "Cómo mejorar productividad sin quemar al equipo",
  "Liderar con datos: qué mirar cada semana",
  "Tendencias de liderazgo 2026: lo que más diferencia a los equipos top",
];

// Servicios profesionales (30 títulos)
const serviciosTitles: string[] = [
  "Servicios profesionales más demandados: oportunidades reales",
  "Cómo vender servicios premium sin competir por precio",
  "Cómo paquetizar tu servicio: del a medida al producto",
  "Propuestas que cierran: estructura ganadora con ejemplos",
  "Cómo cobrar por valor (y no por horas) sin miedo",
  "Retainers: cómo vender mensualidades sin regalarte",
  "Diagnóstico rápido: el servicio que abre puertas y vende solo",
  "Auditoría operativa: cómo vender orden sin sonar aburrido",
  "Implementación de IA para empresas: servicio simple, vendible, rentable",
  "Automatización de reportes: servicio que ahorra horas cada semana",
  "CRM que se usa: servicio de implementación + adopción",
  "Sales Ops como servicio: pipeline, reglas y forecast",
  "Marketing Ops como servicio: medición, procesos y ejecución",
  "CFO as a Service: para quién sirve y cómo venderlo",
  "RR.HH. como servicio: selección + onboarding + desempeño",
  "Customer Success como servicio: bajar churn en 60 días",
  "Operaciones como servicio: SOPs + control + rutina semanal",
  "Documentación de procesos: convertir caos en sistema",
  "Servicio de tablero de control: KPI + reuniones + decisiones",
  "Cómo conseguir clientes B2B sin depender de referidos",
  "Cómo crear casos de éxito que venden (plantilla)",
  "Cómo diferenciarte si hay muchos que hacen lo mismo",
  "Cómo elegir nicho sin encerrarte (método práctico)",
  "Cómo subir precios sin perder clientes: estrategia gradual",
  "Cómo armar un proceso comercial para servicios (simple)",
  "Cómo reducir retrabajo y subir margen en servicios profesionales",
  "Cómo estandarizar entregables sin perder calidad",
  "Cómo escalar con colaboradores: reglas que evitan el caos",
  "Errores que matan servicios profesionales (y cómo corregirlos)",
  "Tendencias de servicios 2026: lo que más compran las empresas",
];

// Emprender y sectores más demandados (40 títulos)
const emprenderTitles: string[] = [
  "Ideas de negocio rentables (realistas) para LATAM",
  "Negocios B2B: dónde hay presupuesto de verdad",
  "Negocios con IA: qué se vende de verdad y qué es humo",
  "Cómo elegir negocio: matriz simple (mercado + ventaja + ejecución)",
  "Cómo validar una idea sin gastar de más (paso a paso)",
  "Cómo conseguir tus primeros 10 clientes sin tener audiencia",
  "Cómo armar una oferta irresistible sin marketing agresivo",
  "Negocios de capacitación corporativa: cómo entrar a empresas",
  "Negocios de automatización: oportunidades para PYMES",
  "Negocios de datos: dashboards como servicio",
  "Negocios de ciberseguridad básica: paquetes simples que se venden",
  "Negocios de soporte y operaciones: ordenar empresas desde adentro",
  "Negocios para salud y bienestar: modelos que escalan",
  "Negocios para educación: microlearning y upskilling",
  "Negocios de logística y última milla: dónde está la demanda",
  "Negocios para ecommerce: nichos que siguen creciendo",
  "Negocios para gastronomía: modelos rentables (sin romantizar)",
  "Negocios para turismo: experiencias, reservas y operación",
  "Negocios para inmobiliarias: servicios que impactan ventas",
  "Negocios para estudios contables: oferta moderna más allá de impuestos",
  "Negocios para abogados: servicios paquetizados que escalan",
  "Negocios para agencias: cómo crecer sin quemarte",
  "Emprender mientras trabajás: plan semanal que se sostiene",
  "Cómo fijar precios desde el día 1: método simple",
  "Cómo estimar costos y margen sin ser financiero",
  "Checklist de lanzamiento: lo mínimo para abrir sin improvisar",
  "Cómo contratar tu primer colaborador sin equivocarte",
  "Cómo construir procesos desde el inicio (sin burocracia)",
  "Cómo hacer partnerships para crecer más rápido",
  "Los errores más comunes al emprender (y cómo evitarlos)",
  "Sectores en alza 2026: oportunidades para nuevos negocios",
  "Tendencias de consumo en LATAM: qué cambia y cómo aprovecharlo",
  "Negocios locales inteligentes: cómo ganar sin ser grande",
  "Negocios de suscripción: cuándo conviene y cuándo no",
  "Negocios de comunidad: cómo monetizar sin vender humo",
  "Negocios de servicios recurrentes: estabilidad + escala",
  "Cómo competir sin bajar precios: estrategia para nuevos negocios",
  "Cómo vender sin redes sociales: canales B2B que funcionan",
  "Cómo pasar de freelance a empresa: sistema para escalar",
  "Cómo construir un negocio que no dependa de vos",
];

// Sistema inteligente, CEO virtual y VistaCEO (30 títulos)
const sistemaTitles: string[] = [
  "Qué es un sistema inteligente para dueños: y por qué ordena todo",
  "Cómo detectar problemas invisibles antes de que se vuelvan crisis",
  "Del caos a control: el tablero de salud del negocio explicado simple",
  "No sé dónde está el problema: método para encontrar el cuello de botella",
  "Cómo convertir un problema en una misión ejecutable (con dueño y fecha)",
  "El CEO virtual: cómo usarlo para decidir mejor sin perder criterio",
  "Cómo reducir reuniones usando un sistema de decisiones",
  "Cómo crear rutinas que el equipo cumple (sin perseguir)",
  "Por qué las planillas se rompen cuando tu empresa crece",
  "Cómo hacer seguimiento sin micromanagement: sistema de check-ins",
  "Alertas tempranas: señales que un negocio debería monitorear sí o sí",
  "Cómo ordenar ventas con un pipeline que nadie abandona",
  "Cómo ordenar operaciones con SOPs cortos y checklists",
  "Cómo ordenar finanzas con control de caja y prioridades",
  "Cómo ordenar RR.HH. con onboarding y desempeño claros",
  "Qué medir cada semana para no manejar a ciegas",
  "Cómo crear un playbook y que se use (en serio)",
  "Cómo implementar un sistema sin fricción: pasos que funcionan",
  "Errores al implementar sistemas: por qué se abandonan y cómo evitarlo",
  "Cómo hacer que el sistema aprenda de tu negocio: hábitos y señales",
  "Sistema vs consultoría: cuándo conviene cada uno",
  "VistaCEO: cómo se ve una empresa ordenada por dentro",
  "VistaCEO: de problemas sueltos a misiones y resultados",
  "VistaCEO: tablero mínimo para decidir cada semana",
  "Caso real: cómo una empresa pasó de caos a control con un sistema",
  "El modo piloto automático en empresas: qué es y cómo se construye",
  "Cómo escalar sin contratar de más: procesos + IA + control",
  "Cómo evitar que el negocio dependa del dueño: sistema de ejecución",
  "La rutina del CEO: decisiones semanales que cambian resultados",
  "Tendencias 2026: empresas que ganan por sistemas, no por suerte",
];

// Determine intent based on title patterns
function inferIntent(title: string): 'informational' | 'comparative' | 'soft-transactional' | 'navigational' {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes(' vs ') || lowerTitle.includes('mejor') || lowerTitle.includes('diferencia')) {
    return 'comparative';
  }
  if (lowerTitle.includes('servicio') || lowerTitle.includes('negocio') || lowerTitle.includes('vender')) {
    return 'soft-transactional';
  }
  if (lowerTitle.includes('vistaceo')) {
    return 'navigational';
  }
  return 'informational';
}

// Build seed titles with metadata
function buildSeedTitles(titles: string[], pillar: string, basePriority: number): SeedTitle[] {
  return titles.map((title, index) => ({
    title,
    pillar,
    slug: slugify(title),
    intent: inferIntent(title),
    priority_score: basePriority - (index * 0.5), // Gradual decrease
  }));
}

// All 200 titles organized by pillar
export const SEED_TITLES: SeedTitle[] = [
  ...buildSeedTitles(empleoTitles, PILLAR_EMPLEO, 80),
  ...buildSeedTitles(iaTitles, PILLAR_IA_APLICADA, 85),
  ...buildSeedTitles(liderazgoTitles, PILLAR_LIDERAZGO, 75),
  ...buildSeedTitles(serviciosTitles, PILLAR_SERVICIOS, 70),
  ...buildSeedTitles(emprenderTitles, PILLAR_EMPRENDER, 78),
  ...buildSeedTitles(sistemaTitles, PILLAR_SISTEMA_INTELIGENTE, 72),
];

// Verify we have exactly 200 titles
export const TOTAL_SEED_TITLES = SEED_TITLES.length;

// Countries for distribution
export const TARGET_COUNTRIES = ['AR', 'CL', 'UY', 'CO', 'EC', 'CR', 'MX', 'PA'] as const;
export type TargetCountry = typeof TARGET_COUNTRIES[number];
