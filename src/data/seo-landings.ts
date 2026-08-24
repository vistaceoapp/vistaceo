// Páginas de captación orgánica del dominio principal.
// Contenido 100% verificable: describe lo que VISTACEO realmente hace
// (setup, misiones, radar, predicciones, chat, memoria) y su precio real.
// Prohibido inventar estadísticas, testimonios o resultados garantizados.

export type LandingKind = "rubro" | "pais" | "comparativa";

export interface LandingSection {
  h2: string;
  body: string;
  bullets?: string[];
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface SeoLanding {
  slug: string;
  /** Ruta pública completa. */
  path: string;
  kind: LandingKind;
  title: string;        // <title> — menos de 60 caracteres
  description: string;  // meta description — menos de 160
  h1: string;
  intro: string;
  sections: LandingSection[];
  faqs: LandingFaq[];
  /** Rutas relacionadas para enlazado interno. */
  related: string[];
}

const CORE_MODULES: LandingSection = {
  h2: "Qué hace VISTACEO todos los días",
  body:
    "Después de un setup guiado, el sistema arma el perfil de tu negocio y trabaja sobre él de forma continua. No son plantillas: cada salida se construye con los datos que cargaste y con lo que aprende en cada conversación.",
  bullets: [
    "Misiones: planes paso a paso, con el orden concreto de ejecución y qué revisar en cada paso.",
    "Radar (I+D): señales externas de tu sector, filtradas para descartar lo que no aplica a tu caso.",
    "Predicciones: escenarios prudentes con probabilidad, ventana de tiempo y la acción recomendada.",
    "Chat ejecutivo: responde sobre tu negocio con memoria de lo que ya te dijo y de lo que le contaste.",
    "Memoria: la sección donde ves, en texto claro, todo lo que el sistema aprendió de tu negocio.",
  ],
};

const PRICING_SECTION: LandingSection = {
  h2: "Plan gratuito y plan Pro",
  body:
    "Podés crear la cuenta y usar el plan gratuito para ver el análisis inicial de tu negocio, con un cupo limitado de misiones, oportunidades y conversaciones. El plan Pro cuesta 49 USD por mes o 290 USD por año y libera el uso completo: misiones ilimitadas, radar continuo, predicciones y chat sin cupo. En Argentina el pago se cobra en pesos por MercadoPago; en el resto de los países, en dólares por PayPal.",
};

function rubro(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  contexto: LandingSection,
  faqs: LandingFaq[],
): SeoLanding {
  return {
    slug,
    path: `/para/${slug}`,
    kind: "rubro",
    title,
    description,
    h1,
    intro,
    sections: [contexto, CORE_MODULES, PRICING_SECTION],
    faqs,
    related: [],
  };
}

const RUBROS: SeoLanding[] = [
  rubro(
    "cafeterias",
    "IA de gestión para cafeterías y bares",
    "IA para gestión de cafeterías | VISTACEO",
    "Analizá tu cafetería con IA: qué producto conviene empujar, cómo ordenar turnos y qué hacer hoy para mejorar el ticket promedio.",
    "Una cafetería se define en detalles que se repiten todos los días: qué se vende en cada franja horaria, cuánta gente entra y no consume, qué producto deja margen real y cuánto personal necesitás en la hora pico. VISTACEO toma esos datos y los convierte en decisiones concretas para la semana.",
    {
      h2: "Los cuellos de botella típicos de una cafetería",
      body:
        "Cuando cargás tu carta, tus horarios y tu ticket promedio, el sistema empieza a trabajar sobre los puntos donde se pierde plata en este rubro.",
      bullets: [
        "Franjas horarias con personal de más o de menos frente a la demanda real.",
        "Productos de alta rotación con margen bajo que sostienen la caja pero no la rentabilidad.",
        "Clientes que consumen una vez y no vuelven porque no hay ningún motivo para volver.",
        "Promociones que suben la cantidad de tickets y bajan el margen total.",
      ],
    },
    [
      {
        q: "¿Sirve si no tengo sistema de punto de venta?",
        a: "Sí. El setup te pregunta por tus datos clave (carta, ticket promedio, horarios, personal) y con eso ya arma el análisis. Si después conectás más datos, el análisis se afina.",
      },
      {
        q: "¿Las recomendaciones son genéricas de gastronomía?",
        a: "No. Cada salida se valida contra los datos de tu negocio antes de mostrarse: si no está anclada en tu carta, tus horarios o tu tipo de cliente, el sistema la descarta y la vuelve a generar.",
      },
    ],
  ),
  rubro(
    "restaurantes",
    "IA de gestión para restaurantes",
    "IA para gestión de restaurantes | VISTACEO",
    "Un CEO digital para tu restaurante: costo de plato, rotación de mesas, personal por turno y la acción concreta de cada día.",
    "En un restaurante conviven cocina, salón, compras y personal, y casi siempre la decisión se toma sobre la marcha. VISTACEO ordena esa información y te devuelve una lista corta de acciones priorizadas, con el detalle de por qué cada una está antes que las demás.",
    {
      h2: "Dónde suele estar la rentabilidad escondida",
      body:
        "Con tu carta, tus costos y tu volumen semanal cargados, el sistema mira los focos habituales de un restaurante.",
      bullets: [
        "Platos estrella por venta que no son estrella por margen.",
        "Rotación de mesas en las franjas donde cada minuto vale más.",
        "Compras y desperdicio frente a la demanda proyectada de la semana.",
        "Reservas y ausencias sin aviso que dejan capacidad sin usar.",
      ],
    },
    [
      {
        q: "¿Puedo cargar mi carta completa?",
        a: "Sí, podés cargar tus platos y precios en el perfil del negocio. Cuanto más completa está la carta, más específicas son las misiones y las predicciones.",
      },
      {
        q: "¿Reemplaza a mi contador?",
        a: "No. VISTACEO trabaja sobre decisiones de gestión y crecimiento; la liquidación de impuestos y la contabilidad formal siguen siendo trabajo de tu contador.",
      },
    ],
  ),
  rubro(
    "ecommerce",
    "IA de gestión para ecommerce y tiendas online",
    "IA para ecommerce y tiendas online | VISTACEO",
    "Analizá tu tienda online con IA: dónde se cae la conversión, qué producto empujar y qué hacer esta semana para vender más.",
    "En una tienda online el problema casi nunca es la falta de datos, es decidir qué mirar primero. VISTACEO ordena el embudo completo —visita, ficha de producto, carrito, pago y recompra— y te dice en qué punto está la pérdida más grande hoy.",
    {
      h2: "El embudo, punto por punto",
      body:
        "El sistema separa el problema en etapas para que no gastes esfuerzo en la etapa equivocada.",
      bullets: [
        "Tráfico que llega pero no encuentra el producto que buscaba.",
        "Fichas de producto que no resuelven las dudas que frenan la compra.",
        "Carritos abandonados por costo de envío, plazos o medios de pago.",
        "Clientes que compraron una vez y no tienen motivo ni recordatorio para volver.",
      ],
    },
    [
      {
        q: "¿Necesito conectar mi tienda?",
        a: "No es obligatorio. Con los datos que cargás en el setup el sistema ya trabaja; las integraciones disponibles sirven para afinar el análisis con datos reales de tráfico y ventas.",
      },
      {
        q: "¿Funciona para venta por redes sin tienda propia?",
        a: "Sí. Si vendés por redes o por mensajería, el setup lo registra como tu canal principal y las misiones se arman sobre ese canal, no sobre una tienda que no tenés.",
      },
    ],
  ),
  rubro(
    "servicios-profesionales",
    "IA de gestión para estudios y servicios profesionales",
    "IA para servicios profesionales | VISTACEO",
    "Para estudios contables, jurídicos y consultorios: cartera de clientes, precios, capacidad del equipo y la próxima acción concreta.",
    "En un servicio profesional lo que se vende es tiempo y criterio, así que la rentabilidad depende de a quién le vendés, a qué precio y con cuánta capacidad real. VISTACEO trabaja sobre esas tres variables y te propone acciones que se pueden ejecutar sin frenar la operación.",
    {
      h2: "Las decisiones que más mueven el resultado",
      body:
        "Con tu tipo de servicio, tu cartera y tu estructura cargados, el análisis se concentra en lo que realmente cambia el número de fin de mes.",
      bullets: [
        "Clientes que consumen mucho tiempo y aportan poco margen.",
        "Honorarios desactualizados frente al costo real de la hora del equipo.",
        "Dependencia excesiva de pocos clientes grandes.",
        "Servicios recurrentes que podrías empaquetar en lugar de cobrar por hora.",
      ],
    },
    [
      {
        q: "¿Sirve si trabajo solo?",
        a: "Sí. El setup distingue si sos profesional independiente o tenés equipo, y las misiones se ajustan a la capacidad real que declarás.",
      },
      {
        q: "¿Mis datos de clientes quedan expuestos?",
        a: "No. Cada negocio ve únicamente su propia información: el acceso a los datos está restringido al dueño de la cuenta a nivel de base de datos.",
      },
    ],
  ),
  rubro(
    "agencias",
    "IA de gestión para agencias y freelancers",
    "IA para agencias y freelancers | VISTACEO",
    "Para agencias y freelancers: rentabilidad por cliente, propuestas, capacidad y qué hacer hoy para crecer sin saturarte.",
    "En una agencia o como freelance el riesgo es siempre el mismo: crecer en facturación y perder en margen y en tiempo. VISTACEO mira la relación entre carga de trabajo, precio y resultado, y te devuelve un plan que respeta tu capacidad real.",
    {
      h2: "Crecer sin romper la operación",
      body:
        "El sistema trabaja sobre los puntos donde una agencia pierde rentabilidad sin darse cuenta.",
      bullets: [
        "Proyectos con alcance abierto que se estiran sin recompensa económica.",
        "Presupuestos armados sobre intuición y no sobre horas reales.",
        "Captación intermitente: meses cargados y meses vacíos.",
        "Clientes que podrían pasar de proyecto puntual a retainer mensual.",
      ],
    },
    [
      {
        q: "¿Puedo usarlo para varios clientes a la vez?",
        a: "VISTACEO analiza tu propio negocio (la agencia). Las misiones y predicciones se generan sobre tu operación y tu cartera, no como una herramienta de reporte para terceros.",
      },
      {
        q: "¿Cuánto tarda en dar la primera recomendación?",
        a: "El análisis inicial se genera al terminar el setup, en la misma sesión. Desde ahí el sistema sigue sumando señales y ajustando lo que te propone.",
      },
    ],
  ),
];

interface PaisInput {
  slug: string;
  nombre: string;
  gentilicio: string;
  moneda: string;
  pago: string;
  title: string;
  description: string;
  contexto: string;
  bullets: string[];
}

const PAISES_INPUT: PaisInput[] = [
  {
    slug: "argentina",
    nombre: "Argentina",
    gentilicio: "argentinos",
    moneda: "pesos argentinos",
    pago: "En Argentina el plan Pro se cobra en pesos a través de MercadoPago.",
    title: "IA para negocios en Argentina | VISTACEO",
    description: "IA de gestión para negocios argentinos: precios en pesos, contexto inflacionario y acciones concretas cada día.",
    contexto:
      "Gestionar en Argentina agrega una capa que ningún manual extranjero contempla: precios que se mueven, costos que se actualizan antes que las ventas y decisiones de reposición que hay que revisar seguido. VISTACEO trabaja con tu moneda y tu contexto, y evita recomendaciones pensadas para mercados estables.",
    bullets: [
      "Revisión de precios y margen cuando los costos se mueven más rápido que la carta.",
      "Decisiones de stock y reposición con costo de reposición, no con costo histórico.",
      "Cuidado del flujo de caja frente a plazos de cobro y de pago desalineados.",
      "Comunicación de aumentos sin perder a los clientes que ya compran.",
    ],
  },
  {
    slug: "mexico",
    nombre: "México",
    gentilicio: "mexicanos",
    moneda: "pesos mexicanos",
    pago: "En México el plan Pro se muestra en tu moneda local y se cobra en dólares a través de PayPal.",
    title: "IA para negocios en México | VISTACEO",
    description: "IA de gestión para negocios en México: análisis de tu operación, oportunidades y acciones concretas cada día.",
    contexto:
      "En México conviven mercados muy distintos según la ciudad y el canal de venta. VISTACEO parte de tu ubicación, tu tipo de cliente y tu canal principal para que las recomendaciones se parezcan a tu operación real y no a un promedio nacional.",
    bullets: [
      "Diferencias de demanda y competencia según zona y canal de venta.",
      "Precios y ticket promedio en tu moneda, con lenguaje local.",
      "Captación por redes y mensajería, que en muchos rubros es el canal principal.",
      "Recompra y programas de retorno para clientes que ya compraron una vez.",
    ],
  },
  {
    slug: "chile",
    nombre: "Chile",
    gentilicio: "chilenos",
    moneda: "pesos chilenos",
    pago: "En Chile el plan Pro se muestra en tu moneda local y se cobra en dólares a través de PayPal.",
    title: "IA para negocios en Chile | VISTACEO",
    description: "IA de gestión para negocios en Chile: diagnóstico de tu operación, oportunidades reales y acciones para hoy.",
    contexto:
      "En Chile la competencia por canal digital y la sensibilidad al precio marcan buena parte del resultado. VISTACEO ordena tu operación sobre esos dos ejes y te da un plan corto, en tu moneda y con el vocabulario que usás todos los días.",
    bullets: [
      "Posicionamiento de precio frente a competidores directos de tu zona.",
      "Costos y margen expresados en tu moneda local.",
      "Canales digitales de captación y su costo real por cliente nuevo.",
      "Fidelización de clientes en rubros con alta rotación de proveedores.",
    ],
  },
];

const PAISES: SeoLanding[] = PAISES_INPUT.map((p) => ({
  slug: p.slug,
  path: `/${p.slug}`,
  kind: "pais" as const,
  title: p.title,
  description: p.description,
  h1: `IA de gestión para negocios en ${p.nombre}`,
  intro: `VISTACEO es un sistema de inteligencia de negocio que analiza tu empresa y te dice qué hacer hoy. Está pensado para negocios ${p.gentilicio}: trabaja en español, con tu contexto local y con precios en ${p.moneda}.`,
  sections: [
    { h2: `Gestionar un negocio en ${p.nombre}`, body: p.contexto, bullets: p.bullets },
    CORE_MODULES,
    {
      h2: `Precios y medios de pago en ${p.nombre}`,
      body: `${PRICING_SECTION.body} ${p.pago}`,
    },
  ],
  faqs: [
    {
      q: `¿VISTACEO funciona para cualquier rubro en ${p.nombre}?`,
      a: "Sí. El setup identifica tu rubro, tu etapa y tu canal principal, y todo el análisis se construye sobre esa clasificación en lugar de usar una plantilla única.",
    },
    {
      q: "¿En qué idioma trabaja el sistema?",
      a: "Íntegramente en español, con el tono y el vocabulario del país que detecta o que elegís durante el setup.",
    },
    {
      q: "¿Puedo probarlo sin pagar?",
      a: "Sí. Podés crear la cuenta y completar el setup gratis para ver el análisis inicial de tu negocio antes de decidir si pasás a Pro.",
    },
  ],
  related: [],
}));

const COMPARATIVAS: SeoLanding[] = [
  {
    slug: "consultoria-de-negocios",
    path: "/vs/consultoria-de-negocios",
    kind: "comparativa",
    title: "VISTACEO o una consultoría: qué conviene",
    description: "Comparación honesta entre VISTACEO y contratar una consultoría de negocios: alcance, costo, tiempos y cuándo conviene cada opción.",
    h1: "VISTACEO frente a contratar una consultoría de negocios",
    intro:
      "Las dos opciones resuelven el mismo problema de fondo —saber qué hacer para que el negocio funcione mejor— pero de maneras muy distintas. Esta comparación es directa, incluido lo que una consultoría hace mejor.",
    sections: [
      {
        h2: "En qué se diferencian",
        body: "La diferencia principal es la frecuencia y el costo, no la buena intención de cada enfoque.",
        bullets: [
          "Frecuencia: una consultoría entrega informes en hitos; VISTACEO revisa y actualiza el plan de forma continua.",
          "Costo: el plan Pro cuesta 49 USD por mes o 290 USD por año; una consultoría se cotiza por proyecto o por hora.",
          "Puesta en marcha: el análisis inicial sale al terminar el setup, sin agenda ni reuniones previas.",
          "Memoria: el sistema guarda lo que aprende de tu negocio y lo usa en cada respuesta posterior.",
        ],
      },
      {
        h2: "Cuándo conviene una consultoría",
        body:
          "Si necesitás trabajo presencial dentro de la operación, negociación con terceros, auditoría formal, due diligence o intervención sobre el equipo, una consultoría o un profesional dedicado es la mejor opción. VISTACEO no reemplaza la presencia humana ni la firma profesional.",
      },
      CORE_MODULES,
      PRICING_SECTION,
    ],
    faqs: [
      {
        q: "¿Puedo usar las dos cosas a la vez?",
        a: "Sí, y es una combinación razonable: VISTACEO sostiene la gestión del día a día y la consultoría se enfoca en el proyecto puntual que requiere intervención humana.",
      },
      {
        q: "¿Las recomendaciones tienen respaldo?",
        a: "Cada recomendación muestra en qué datos de tu negocio se apoya, dentro del bloque 'Por qué te lo digo'. Si el sistema no tiene evidencia suficiente, te pide el dato en lugar de improvisar.",
      },
    ],
    related: [],
  },
  {
    slug: "cfo-externo",
    path: "/vs/cfo-externo",
    kind: "comparativa",
    title: "Alternativa a un CFO externo para PyMEs",
    description: "Qué cubre VISTACEO frente a un CFO externo o director financiero part time, cuánto cuesta cada opción y dónde está el límite de cada una.",
    h1: "Alternativa a un CFO externo para negocios en crecimiento",
    intro:
      "Muchos negocios llegan a un punto en que necesitan criterio de dirección: precios, margen, flujo de caja y prioridades. Contratar un CFO externo es una salida; usar un sistema de inteligencia de negocio es otra. Estas son las diferencias concretas.",
    sections: [
      {
        h2: "Qué cubre cada opción",
        body: "Conviene mirarlo por tipo de tarea, no por título del puesto.",
        bullets: [
          "Lectura del negocio y prioridades de la semana: VISTACEO lo hace de forma continua y en tu idioma.",
          "Escenarios a futuro: el sistema genera predicciones con probabilidad, ventana de tiempo y acción sugerida.",
          "Ejecución diaria: las misiones bajan cada decisión a pasos concretos y verificables.",
          "Responsabilidad formal, firma y trato con bancos o inversores: eso requiere una persona, no un sistema.",
        ],
      },
      {
        h2: "El límite, dicho claro",
        body:
          "VISTACEO no reemplaza a un CFO, a un contador ni a un asesor financiero matriculado. No presenta declaraciones, no firma balances y no negocia en tu nombre. Sirve para tener criterio de dirección todos los días a un costo fijo bajo, y para llegar mejor preparado a esas conversaciones cuando hagan falta.",
      },
      CORE_MODULES,
      PRICING_SECTION,
    ],
    faqs: [
      {
        q: "¿Necesito conocimientos financieros para usarlo?",
        a: "No. El sistema explica cada recomendación en lenguaje común y evita terminología técnica innecesaria.",
      },
      {
        q: "¿Qué pasa si mi negocio es muy chico?",
        a: "Funciona igual: el setup detecta tu etapa (idea, en planificación o en marcha) y ajusta el plan a esa realidad, sin pedirte estructura que todavía no tenés.",
      },
    ],
    related: [],
  },
];

export const SEO_LANDINGS: SeoLanding[] = [...RUBROS, ...PAISES, ...COMPARATIVAS];

// Enlazado interno: cada página apunta a sus hermanas y a las herramientas.
const TOOL_PATHS = [
  "/herramientas/calculadora-de-margen",
  "/herramientas/punto-de-equilibrio",
];

for (const l of SEO_LANDINGS) {
  const siblings = SEO_LANDINGS.filter((o) => o.kind === l.kind && o.path !== l.path).map((o) => o.path);
  const others = SEO_LANDINGS.filter((o) => o.kind !== l.kind).slice(0, 2).map((o) => o.path);
  l.related = [...siblings, ...others, ...TOOL_PATHS].slice(0, 6);
}

export function findLandingByPath(path: string): SeoLanding | undefined {
  return SEO_LANDINGS.find((l) => l.path === path);
}

export function landingLabel(path: string): string {
  const l = findLandingByPath(path);
  if (l) return l.h1;
  if (path === "/herramientas/calculadora-de-margen") return "Calculadora de margen de ganancia";
  if (path === "/herramientas/punto-de-equilibrio") return "Calculadora de punto de equilibrio";
  return path;
}

export const SEO_LANDING_PATHS = [...SEO_LANDINGS.map((l) => l.path), ...TOOL_PATHS];
