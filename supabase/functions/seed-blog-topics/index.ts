// seed-blog-topics v2 - Fixed priority_score integer
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Helper to generate slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 80);
}

// Determine intent based on title patterns
function inferIntent(title: string): string {
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

// All 200 seed titles organized by pillar
const SEED_DATA: Array<{ pillar: string; titles: string[] }> = [
  {
    pillar: 'empleo',
    titles: [
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
    ]
  },
  {
    pillar: 'ia_aplicada',
    titles: [
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
    ]
  },
  {
    pillar: 'liderazgo',
    titles: [
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
    ]
  },
  {
    pillar: 'servicios',
    titles: [
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
    ]
  },
  {
    pillar: 'emprender',
    titles: [
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
    ]
  },
  {
    pillar: 'sistema_inteligente',
    titles: [
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
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[seed-blog-topics] Starting seed...');

    // Check if topics already exist
    const { count: existingCount } = await supabase
      .from('blog_topics')
      .select('*', { count: 'exact', head: true });

    if ((existingCount || 0) > 0) {
      // Check if force reseed
      let forceReseed = false;
      try {
        const body = await req.json();
        forceReseed = body.force || false;
      } catch {
        // No body
      }

      if (!forceReseed) {
        return new Response(JSON.stringify({
          success: false,
          error: `Topics already exist (${existingCount}). Use force:true to reseed.`,
          existing_count: existingCount
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Clear existing topics
      await supabase.from('blog_topics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log('[seed-blog-topics] Cleared existing topics');
    }

    // Build topic entries
    const countries = ['AR', 'CL', 'UY', 'CO', 'EC', 'CR', 'MX', 'PA'];
    const topics: any[] = [];
    let priorityIndex = 0;

    for (const pillarData of SEED_DATA) {
      for (const title of pillarData.titles) {
        const slug = slugify(title);
        
        // Check for duplicate slugs
        const existingSlug = topics.find(t => t.slug === slug);
        const finalSlug = existingSlug ? `${slug}-${topics.length}` : slug;

        // Priority score as integer: 100 down to 1
        const priorityScore = Math.max(1, 100 - Math.floor(priorityIndex / 2));

        topics.push({
          title_base: title,
          slug: finalSlug,
          pillar: pillarData.pillar,
          intent: inferIntent(title),
          country_codes: countries,
          priority_score: priorityScore,
          generated_filler: false,
        });

        priorityIndex++;
      }
    }

    console.log(`[seed-blog-topics] Prepared ${topics.length} topics`);

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < topics.length; i += batchSize) {
      const batch = topics.slice(i, i + batchSize);
      const { error } = await supabase
        .from('blog_topics')
        .insert(batch);

      if (error) throw new Error(`Insert error at batch ${i}: ${error.message}`);
      inserted += batch.length;
    }

    // Generate summary
    const byPillar: Record<string, number> = {};
    topics.forEach(t => {
      byPillar[t.pillar] = (byPillar[t.pillar] || 0) + 1;
    });

    console.log('[seed-blog-topics] Seed complete');

    return new Response(JSON.stringify({
      success: true,
      total_topics: inserted,
      by_pillar: byPillar,
      message: `Successfully seeded ${inserted} blog topics`
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('[seed-blog-topics] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
