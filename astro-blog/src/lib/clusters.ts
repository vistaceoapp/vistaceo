export interface Cluster {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  intro: string;
}

export const CLUSTERS: Record<string, Cluster> = {
  "empleo-habilidades": {
    slug: "empleo-habilidades",
    name: "Empleo y Habilidades",
    emoji: "💼",
    description: "Guías para conseguir empleo, desarrollar habilidades y crecer profesionalmente en la era de la IA",
    intro: "El mercado laboral latinoamericano está atravesando una transformación sin precedentes. La automatización y la inteligencia artificial están redefiniendo qué habilidades son valiosas y cómo se estructura el trabajo. En VistaCEO, analizamos las tendencias de empleo, las habilidades más demandadas y las estrategias probadas para destacar en un mercado cada vez más competitivo. Desde la preparación de CVs optimizados para sistemas ATS hasta técnicas de negociación salarial, cubrimos todo lo que necesitás saber para avanzar en tu carrera profesional."
  },
  "ia-para-pymes": {
    slug: "ia-para-pymes",
    name: "IA para PyMEs",
    emoji: "🤖",
    description: "Cómo implementar inteligencia artificial en tu negocio de forma práctica y rentable",
    intro: "La inteligencia artificial ya no es exclusiva de las grandes corporaciones. Las pequeñas y medianas empresas latinoamericanas tienen acceso a herramientas de IA que pueden transformar sus operaciones, desde chatbots de atención al cliente hasta sistemas de predicción de demanda. En esta sección exploramos implementaciones prácticas, casos de éxito regionales y guías paso a paso para que tu PyME aproveche el poder de la IA sin necesidad de grandes presupuestos o equipos técnicos especializados."
  },
  "servicios-profesionales-rentabilidad": {
    slug: "servicios-profesionales-rentabilidad",
    name: "Servicios Profesionales",
    emoji: "📋",
    description: "Optimización y rentabilidad para consultoras, agencias y profesionales independientes",
    intro: "Los profesionales de servicios enfrentan desafíos únicos: pricing basado en valor, gestión del tiempo facturable, retención de clientes y escalabilidad sin perder calidad. Ya seas consultor independiente, dueño de una agencia o socio de una firma profesional, esta sección te ofrece frameworks probados para aumentar tu rentabilidad, estructurar mejor tus servicios y construir relaciones duraderas con clientes que valoren tu expertise."
  },
  "marketing-crecimiento": {
    slug: "marketing-crecimiento",
    name: "Marketing y Crecimiento",
    emoji: "📈",
    description: "Estrategias de marketing digital y growth para negocios latinoamericanos",
    intro: "El marketing en Latinoamérica tiene sus propias reglas. Los canales que funcionan en otros mercados no siempre aplican aquí, y las estrategias de crecimiento deben adaptarse a realidades económicas y culturales específicas. Cubrimos desde SEO local hasta estrategias de WhatsApp Business, pasando por growth hacking adaptado a presupuestos limitados y tácticas de adquisición que realmente funcionan en nuestra región."
  },
  "finanzas-cashflow": {
    slug: "finanzas-cashflow",
    name: "Finanzas y Cashflow",
    emoji: "💰",
    description: "Gestión financiera, flujo de caja y decisiones de inversión para PyMEs",
    intro: "El cashflow es el oxígeno de cualquier negocio, especialmente en economías con alta inflación y volatilidad cambiaria. En esta sección abordamos la gestión financiera desde una perspectiva práctica latinoamericana: cómo proyectar flujos de caja en contextos inciertos, cuándo y cómo endeudarse, estrategias de pricing en economías inflacionarias, y herramientas para tomar mejores decisiones de inversión con información limitada."
  },
  "operaciones-procesos": {
    slug: "operaciones-procesos",
    name: "Operaciones y Procesos",
    emoji: "⚙️",
    description: "Eficiencia operativa, automatización y optimización de procesos de negocio",
    intro: "La eficiencia operativa puede ser la diferencia entre un negocio rentable y uno que apenas sobrevive. Exploramos metodologías de mejora continua adaptadas a PyMEs, herramientas de automatización accesibles, y casos prácticos de optimización de procesos. Desde la gestión de inventarios hasta la automatización de tareas administrativas, te mostramos cómo hacer más con menos."
  },
  "ventas-negociacion": {
    slug: "ventas-negociacion",
    name: "Ventas y Negociación",
    emoji: "🤝",
    description: "Técnicas de venta, negociación y cierre para mercados B2B y B2C",
    intro: "Vender en Latinoamérica requiere entender las dinámicas culturales de la negociación, los ciclos de venta más largos y la importancia de las relaciones personales. Esta sección cubre desde técnicas de prospección hasta estrategias de cierre, pasando por la gestión de objeciones típicas de nuestra región y cómo construir un proceso de ventas escalable sin perder el toque personal."
  },
  "liderazgo-management": {
    slug: "liderazgo-management",
    name: "Liderazgo y Management",
    emoji: "🎯",
    description: "Estrategias para liderar equipos y tomar mejores decisiones empresariales",
    intro: "Liderar en Latinoamérica implica navegar contextos de alta incertidumbre, equipos multigeneracionales y expectativas culturales específicas. Abordamos el liderazgo desde una perspectiva práctica: cómo tomar decisiones con información incompleta, gestionar equipos remotos e híbridos, desarrollar talento interno y crear culturas organizacionales que impulsen resultados sostenibles."
  },
  "estrategia-latam": {
    slug: "estrategia-latam",
    name: "Estrategia LATAM",
    emoji: "🌎",
    description: "Estrategia empresarial e internacionalización en mercados latinoamericanos",
    intro: "Expandirse en Latinoamérica presenta oportunidades únicas pero también complejidades regulatorias, culturales y logísticas. Analizamos estrategias de entrada a mercados, casos de éxito y fracaso de expansión regional, y frameworks para evaluar oportunidades de internacionalización. Ya sea que busques exportar, abrir operaciones en otros países o simplemente entender mejor el panorama regional."
  },
  "herramientas-productividad": {
    slug: "herramientas-productividad",
    name: "Herramientas y Productividad",
    emoji: "🛠️",
    description: "Reviews de herramientas, stacks tecnológicos y productividad personal",
    intro: "El stack de herramientas correcto puede multiplicar la productividad de un equipo pequeño. Evaluamos y comparamos herramientas accesibles para PyMEs latinoamericanas, considerando factores como pricing en moneda local, soporte en español y facilidad de implementación. También cubrimos metodologías de productividad personal y técnicas de gestión del tiempo probadas."
  },
  "data-analytics": {
    slug: "data-analytics",
    name: "Data y Analytics",
    emoji: "📊",
    description: "Análisis de datos, métricas de negocio y toma de decisiones basada en datos",
    intro: "Los datos son el nuevo petróleo, pero solo si sabés extraer valor de ellos. Esta sección está dedicada a democratizar el análisis de datos para PyMEs: qué métricas realmente importan, cómo implementar dashboards útiles sin grandes inversiones, y cómo desarrollar una cultura data-driven en equipos sin científicos de datos."
  },
  "tendencias-ia-tech": {
    slug: "tendencias-ia-tech",
    name: "Tendencias IA y Tech",
    emoji: "🚀",
    description: "Análisis de tendencias tecnológicas y oportunidades emergentes",
    intro: "El panorama tecnológico cambia constantemente, y mantenerse actualizado es crucial para identificar oportunidades y amenazas. Analizamos las tendencias más relevantes para negocios latinoamericanos: desde nuevos modelos de IA hasta cambios regulatorios, pasando por tecnologías emergentes que podrían transformar industrias específicas. Te ayudamos a separar el hype de las oportunidades reales."
  }
};

export function getCluster(slug: string | null | undefined): Cluster | null {
  if (!slug) return null;
  return CLUSTERS[slug] || null;
}

export function getAllClusters(): Cluster[] {
  return Object.values(CLUSTERS);
}
