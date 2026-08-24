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


// ---------------------------------------------------------------
// Expansión de captación: más rubros, más países, más comparativas.
// Mismo criterio: contenido verificable sobre lo que el sistema hace.
// ---------------------------------------------------------------

interface RubroExtra {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  h2: string;
  body: string;
  bullets: string[];
  faqs: LandingFaq[];
}

const RUBROS_EXTRA_INPUT: RubroExtra[] = [
  {
    slug: "peluquerias-y-barberias",
    h1: "IA de gestión para peluquerías y barberías",
    title: "IA para peluquerías y barberías | VISTACEO",
    description: "Agenda, ausencias, precios por servicio y recompra: análisis con IA para peluquerías y barberías, con acciones para esta semana.",
    intro: "En una peluquería o barbería el resultado del mes se define en la agenda: cuántos huecos quedan sin cubrir, cuántos turnos se caen sin aviso y cuánto deja cada servicio. VISTACEO trabaja sobre esos números y te devuelve acciones concretas.",
    h2: "Dónde se pierde facturación en la agenda",
    body: "Con tus servicios, precios, horarios y cantidad de profesionales cargados, el análisis se concentra en los puntos que mueven la caja.",
    bullets: [
      "Huecos de agenda en franjas de baja demanda que se pueden llenar con otra oferta.",
      "Ausencias sin aviso y cómo reducirlas sin perder al cliente.",
      "Servicios de mucho tiempo y poco margen frente a otros más rentables.",
      "Clientes que vienen una vez y no tienen motivo agendado para volver.",
    ],
    faqs: [
      { q: "¿Necesito un sistema de turnos conectado?", a: "No. Con los datos que cargás en el setup (servicios, precios, horarios, profesionales) el sistema ya arma el análisis." },
      { q: "¿Sirve si trabajo sola o solo?", a: "Sí. El setup registra tu capacidad real y las misiones se ajustan al tiempo que tenés disponible." },
    ],
  },
  {
    slug: "gimnasios",
    h1: "IA de gestión para gimnasios y centros de entrenamiento",
    title: "IA para gimnasios y centros fitness | VISTACEO",
    description: "Bajas de socios, ocupación por horario y precios de membresía: análisis con IA para gimnasios y acciones concretas cada día.",
    intro: "Un gimnasio vive de la permanencia: no del socio que entra, sino del que sigue tres meses después. VISTACEO mira altas, bajas, ocupación por franja y precio de membresía, y te dice dónde intervenir primero.",
    h2: "El problema real: retención, no captación",
    body: "Con tus planes, tu cantidad de socios y tus horarios cargados, el sistema se concentra en la permanencia y en el uso real de la capacidad.",
    bullets: [
      "Bajas concentradas en los primeros meses de membresía.",
      "Franjas horarias saturadas y otras vacías, con el mismo costo fijo.",
      "Planes y precios que no se diferencian entre sí lo suficiente.",
      "Servicios adicionales (clases, planes personalizados) sin uso ni promoción.",
    ],
    faqs: [
      { q: "¿Puedo cargar mis planes de membresía?", a: "Sí, y cuanto más completos estén, más específicas son las misiones sobre precios y permanencia." },
      { q: "¿Reemplaza a mi software de gestión de socios?", a: "No. VISTACEO no administra cobros ni accesos: analiza tu negocio y te dice qué decisión tomar." },
    ],
  },
  {
    slug: "clinicas-y-consultorios",
    h1: "IA de gestión para clínicas y consultorios",
    title: "IA para clínicas y consultorios | VISTACEO",
    description: "Agenda, ausencias, mix de prestaciones y honorarios: análisis con IA para clínicas y consultorios, con acciones para esta semana.",
    intro: "En un consultorio la rentabilidad depende del mix de prestaciones, de cuánta agenda se cubre y de cuánto tarda en cobrarse cada práctica. VISTACEO trabaja sobre esas tres variables sin meterse en criterio clínico.",
    h2: "Gestión, no criterio clínico",
    body: "El sistema analiza únicamente la parte administrativa y comercial del consultorio.",
    bullets: [
      "Ausencias y agenda incompleta en franjas de alto costo fijo.",
      "Prestaciones con demora de cobro larga frente a las de cobro directo.",
      "Honorarios desactualizados respecto del costo real de la hora.",
      "Pacientes que no vuelven a controles cuando el tratamiento lo requiere.",
    ],
    faqs: [
      { q: "¿VISTACEO da indicaciones médicas?", a: "No. Trabaja exclusivamente sobre gestión, precios, agenda y crecimiento. Ninguna salida es un consejo clínico." },
      { q: "¿Los datos de pacientes están protegidos?", a: "El sistema no necesita datos de pacientes. Trabaja con información agregada del negocio y cada cuenta ve solo su propia información." },
    ],
  },
  {
    slug: "inmobiliarias",
    h1: "IA de gestión para inmobiliarias y corredores",
    title: "IA para inmobiliarias y corredores | VISTACEO",
    description: "Cartera de propiedades, calidad de consultas y cierre: análisis con IA para inmobiliarias, con acciones concretas cada semana.",
    intro: "En una inmobiliaria el cuello de botella casi nunca es la cantidad de consultas, es su calidad y el tiempo hasta el cierre. VISTACEO ordena la cartera y el embudo, y te dice dónde se está cayendo la operación.",
    h2: "De la consulta al cierre",
    body: "Con tu cartera, tu zona y tu tipo de operación cargados, el análisis separa el embudo por etapa.",
    bullets: [
      "Propiedades publicadas hace mucho tiempo sin ajuste de precio ni de fotos.",
      "Consultas que no califican y consumen tiempo del equipo.",
      "Tiempo entre visita y oferta, y qué lo alarga.",
      "Captación de propietarios frente a captación de compradores o inquilinos.",
    ],
    faqs: [
      { q: "¿Sirve para alquileres y para venta?", a: "Sí. El setup registra tu tipo de operación principal y el análisis se arma sobre ese modelo." },
      { q: "¿Hace tasaciones?", a: "No. No tasa propiedades: trabaja sobre la gestión comercial de tu cartera y de tu equipo." },
    ],
  },
  {
    slug: "constructoras",
    h1: "IA de gestión para constructoras y estudios de obra",
    title: "IA para constructoras y obras | VISTACEO",
    description: "Presupuestos, desvíos de obra, certificaciones y flujo de caja: análisis con IA para constructoras y acciones para esta semana.",
    intro: "En obra el margen se define en el presupuesto y se pierde en los desvíos. VISTACEO trabaja sobre presupuesto, avance, certificación y cobranza para que el desvío se vea antes de que sea irreversible.",
    h2: "Presupuesto, avance y cobranza",
    body: "Con tus obras activas, tu forma de presupuestar y tus plazos de cobro cargados, el análisis apunta a los focos clásicos del rubro.",
    bullets: [
      "Presupuestos armados con costos históricos en lugar de costo de reposición.",
      "Desvíos de obra detectados tarde, cuando ya no se pueden renegociar.",
      "Certificaciones y cobranzas desfasadas respecto de los pagos a proveedores.",
      "Capacidad de equipo comprometida en más obras de las que soporta.",
    ],
    faqs: [
      { q: "¿Reemplaza mi software de cómputo y presupuesto?", a: "No. No calcula cómputos: analiza las decisiones de negocio alrededor del presupuesto, el avance y la cobranza." },
      { q: "¿Sirve si trabajo con obra pública?", a: "Sí, el setup registra tu tipo de cliente principal y el análisis considera los plazos de certificación que declarás." },
    ],
  },
  {
    slug: "talleres-mecanicos",
    h1: "IA de gestión para talleres mecánicos",
    title: "IA para talleres mecánicos | VISTACEO",
    description: "Ocupación de bahías, repuestos, precios de mano de obra y retorno de clientes: análisis con IA para talleres y acciones concretas.",
    intro: "Un taller vive de la ocupación real de sus bahías y del precio correcto de la hora de mano de obra. VISTACEO mira esos dos ejes, más el manejo de repuestos, y te devuelve acciones que se pueden aplicar la semana que viene.",
    h2: "Capacidad, repuestos y precio de la hora",
    body: "Con tus servicios, tu cantidad de puestos de trabajo y tus tiempos promedio cargados, el análisis apunta a los focos del rubro.",
    bullets: [
      "Bahías inactivas por espera de repuestos o de aprobación del cliente.",
      "Precio de la hora de mano de obra desactualizado frente al costo real.",
      "Servicios de mantenimiento programado que no se agendan de forma proactiva.",
      "Clientes que hacen una reparación y nunca vuelven al mantenimiento.",
    ],
    faqs: [
      { q: "¿Necesito cargar cada orden de trabajo?", a: "No. Con los datos generales del taller ya arma el análisis; si sumás detalle, las recomendaciones se afinan." },
      { q: "¿Sirve para talleres de especialidad?", a: "Sí. El setup registra tu especialidad y las misiones se construyen sobre ese tipo de trabajo." },
    ],
  },
  {
    slug: "escuelas-y-academias",
    h1: "IA de gestión para escuelas, academias e institutos",
    title: "IA para academias e institutos | VISTACEO",
    description: "Inscripciones, deserción, precios de cursada y ocupación de comisiones: análisis con IA para academias e institutos.",
    intro: "En una academia el problema del año se resuelve en dos momentos: la inscripción y la deserción a mitad de cursada. VISTACEO trabaja sobre ambos, más la ocupación real de cada comisión.",
    h2: "Inscripción, permanencia y ocupación",
    body: "Con tu oferta de cursos, tus precios y tu capacidad por comisión cargados, el análisis se enfoca en los tres momentos críticos.",
    bullets: [
      "Comisiones que arrancan con la mitad del cupo y sostienen el mismo costo docente.",
      "Deserción concentrada en determinadas semanas de la cursada.",
      "Precios y planes de pago que no acompañan la capacidad de pago real del alumno.",
      "Egresados sin ninguna propuesta de continuidad.",
    ],
    faqs: [
      { q: "¿Sirve para cursos online?", a: "Sí. El setup registra si tu cursada es presencial, online o mixta y ajusta el análisis a ese modelo." },
      { q: "¿Administra alumnos y notas?", a: "No. No es un sistema académico: analiza el negocio de la academia y te dice qué hacer." },
    ],
  },
  {
    slug: "hoteles-y-alojamientos",
    h1: "IA de gestión para hoteles y alojamientos",
    title: "IA para hoteles y alojamientos | VISTACEO",
    description: "Ocupación, tarifas por temporada, canales de reserva y reseñas: análisis con IA para hoteles, cabañas y alojamientos.",
    intro: "En alojamiento todo se juega entre tarifa, ocupación y comisión de canal. VISTACEO mira esa ecuación completa junto con la estacionalidad de tu zona y te propone movimientos concretos.",
    h2: "Tarifa, ocupación y canales",
    body: "Con tus unidades, tus tarifas, tu temporada y tus canales de venta cargados, el análisis apunta al resultado por noche disponible.",
    bullets: [
      "Tarifas planas en periodos con demanda muy distinta entre sí.",
      "Dependencia de un canal de reservas con comisión alta.",
      "Ocupación de media semana frente al fin de semana.",
      "Reseñas y su efecto directo en la conversión de las consultas.",
    ],
    faqs: [
      { q: "¿Sirve para cabañas o departamentos temporarios?", a: "Sí. El setup registra tu tipo y cantidad de unidades y el análisis se adapta a esa escala." },
      { q: "¿Se conecta con mi motor de reservas?", a: "No es obligatorio. Con los datos del setup ya trabaja; las integraciones disponibles solo afinan el análisis." },
    ],
  },
  {
    slug: "distribuidoras-y-mayoristas",
    h1: "IA de gestión para distribuidoras y mayoristas",
    title: "IA para distribuidoras y mayoristas | VISTACEO",
    description: "Stock, rotación, listas de precios y cobranza: análisis con IA para distribuidoras y mayoristas, con acciones para esta semana.",
    intro: "En distribución el capital está en el depósito y el riesgo está en la cuenta corriente. VISTACEO trabaja sobre rotación, margen por línea y cobranza para que el capital no quede inmovilizado.",
    h2: "Rotación, margen y cuenta corriente",
    body: "Con tus líneas de producto, tus listas de precios y tus plazos de cobro cargados, el análisis apunta a los focos del rubro.",
    bullets: [
      "Líneas con mucho stock y poca rotación que congelan capital.",
      "Listas de precios y bonificaciones que licuan el margen sin subir volumen.",
      "Clientes con cuenta corriente vencida y compras nuevas aprobadas.",
      "Concentración de facturación en pocos clientes grandes.",
    ],
    faqs: [
      { q: "¿Necesito exportar mi stock completo?", a: "No. Con las líneas principales y sus condiciones ya arma el análisis; el detalle extra lo afina." },
      { q: "¿Controla el inventario?", a: "No es un sistema de inventario: usa la información de stock para decidir compras, precios y foco comercial." },
    ],
  },
  {
    slug: "software-y-saas",
    h1: "IA de gestión para empresas de software y SaaS",
    title: "IA de gestión para software y SaaS | VISTACEO",
    description: "Churn, precios por plan, adquisición y capacidad del equipo: análisis con IA para empresas de software y SaaS.",
    intro: "En software el número que manda es la permanencia del cliente frente al costo de conseguirlo. VISTACEO ordena adquisición, activación, permanencia y precio, y te dice cuál de las cuatro está frenando el crecimiento hoy.",
    h2: "Adquisición, activación, permanencia y precio",
    body: "Con tu modelo de suscripción, tus planes y tu tipo de cliente cargados, el análisis separa el embudo por etapa.",
    bullets: [
      "Usuarios que se registran y nunca llegan al primer uso valioso.",
      "Planes con precios muy cercanos entre sí que no orientan la decisión.",
      "Bajas concentradas en un momento específico del ciclo de vida.",
      "Capacidad del equipo comprometida en soporte en lugar de producto.",
    ],
    faqs: [
      { q: "¿Se conecta con mi base de datos de producto?", a: "No es necesario. Con las métricas que cargás el sistema ya trabaja; podés actualizarlas cuando cambien." },
      { q: "¿Sirve si todavía no tengo clientes pagos?", a: "Sí. El setup detecta tu etapa y las misiones priorizan validación y primeros clientes en lugar de optimización." },
    ],
  },
  {
    slug: "logistica-y-transporte",
    h1: "IA de gestión para logística y transporte",
    title: "IA para logística y transporte | VISTACEO",
    description: "Costo por viaje, ocupación de flota, tarifas y cobranza: análisis con IA para empresas de logística y transporte.",
    intro: "En transporte la rentabilidad se define por viaje y se pierde en los kilómetros vacíos. VISTACEO trabaja sobre costo real por viaje, ocupación de flota y tarifas para que cada movimiento tenga sentido económico.",
    h2: "Costo por viaje y uso de la flota",
    body: "Con tu flota, tus rutas habituales y tu estructura de costos cargadas, el análisis apunta al resultado por viaje.",
    bullets: [
      "Retornos vacíos y rutas con baja ocupación de carga.",
      "Tarifas que no reflejan el costo actual de combustible y mantenimiento.",
      "Mantenimiento reactivo que saca unidades de servicio en momentos críticos.",
      "Clientes con tarifas históricas por debajo del costo actual.",
    ],
    faqs: [
      { q: "¿Hace ruteo o seguimiento de unidades?", a: "No. No es un sistema de ruteo ni de GPS: analiza el negocio y las decisiones de tarifa, flota y cartera." },
      { q: "¿Sirve para transportistas con pocas unidades?", a: "Sí. El setup registra el tamaño real de la flota y el análisis se ajusta a esa escala." },
    ],
  },
  {
    slug: "veterinarias",
    h1: "IA de gestión para veterinarias y pet shops",
    title: "IA para veterinarias y pet shops | VISTACEO",
    description: "Consultas, planes de salud, venta de productos y retorno de clientes: análisis con IA para veterinarias y pet shops.",
    intro: "Una veterinaria combina servicio y venta de productos, y cada parte tiene un margen muy distinto. VISTACEO separa las dos y te muestra dónde conviene poner el esfuerzo esta semana.",
    h2: "Servicio y mostrador, por separado",
    body: "Con tus servicios, tus productos y tu agenda cargados, el análisis distingue las dos fuentes de ingreso.",
    bullets: [
      "Consultas y prácticas con margen bajo frente al tiempo profesional que consumen.",
      "Productos de mostrador con rotación lenta que ocupan capital.",
      "Planes de salud o vacunación sin seguimiento automático de vencimientos.",
      "Clientes que compran alimento y no usan ningún servicio del local.",
    ],
    faqs: [
      { q: "¿Da indicaciones veterinarias?", a: "No. Trabaja únicamente sobre la gestión del negocio: precios, agenda, stock y crecimiento." },
      { q: "¿Sirve si solo tengo pet shop sin consultorio?", a: "Sí. El setup registra tu modelo real y el análisis se arma sobre la venta de productos." },
    ],
  },
  {
    slug: "marketing-y-publicidad",
    h1: "IA de gestión para empresas de marketing y publicidad",
    title: "IA de gestión para marketing y publicidad | VISTACEO",
    description: "Rentabilidad por cuenta, precios, capacidad del equipo y captación: análisis con IA para empresas de marketing y publicidad.",
    intro: "En marketing el riesgo es vivir dentro de las cuentas de los clientes y perder de vista el propio negocio. VISTACEO analiza tu operación: rentabilidad por cuenta, precios, capacidad y previsibilidad de la captación.",
    h2: "Tu negocio, no el de tus clientes",
    body: "Con tu cartera, tu estructura y tu forma de cobrar cargadas, el análisis se enfoca en tu propia rentabilidad.",
    bullets: [
      "Cuentas que consumen más horas de las presupuestadas mes a mes.",
      "Fees planos frente a alcances que crecieron con el tiempo.",
      "Dependencia de pocos clientes que concentran la facturación.",
      "Captación irregular y sin proceso definido de seguimiento.",
    ],
    faqs: [
      { q: "¿Genera reportes para mis clientes?", a: "No. VISTACEO analiza tu empresa; no es una herramienta de reporte para terceros." },
      { q: "¿Sirve para freelancers del rubro?", a: "Sí, el setup distingue si trabajás solo o con equipo y ajusta la carga de cada misión." },
    ],
  },
  {
    slug: "panaderias-y-pastelerias",
    h1: "IA de gestión para panaderías y pastelerías",
    title: "IA para panaderías y pastelerías | VISTACEO",
    description: "Costo de producción, desperdicio, precios y franjas de venta: análisis con IA para panaderías y pastelerías.",
    intro: "En panadería el margen se define en la producción del día: cuánto se hace, cuánto se vende y cuánto sobra. VISTACEO trabaja sobre esa ecuación con tus productos y tus costos reales.",
    h2: "Producción, desperdicio y precio",
    body: "Con tu producción diaria, tus costos de insumos y tus franjas de venta cargadas, el análisis apunta a lo que define el resultado.",
    bullets: [
      "Desperdicio de producto fresco frente a la demanda real por franja.",
      "Precios desactualizados cuando el insumo se movió y la vidriera no.",
      "Productos de alta venta con margen bajo que sostienen la caja.",
      "Pedidos por encargo y eventos como fuente de margen previsible.",
    ],
    faqs: [
      { q: "¿Necesito costear cada receta?", a: "Ayuda, pero no es obligatorio: con los productos principales y sus costos ya arma el análisis." },
      { q: "¿Sirve si además tengo salón?", a: "Sí. El setup registra si vendés por mostrador, con salón o por encargo, y el análisis contempla cada canal." },
    ],
  },
  {
    slug: "estudios-contables",
    h1: "IA de gestión para estudios contables",
    title: "IA de gestión para estudios contables | VISTACEO",
    description: "Rentabilidad por cliente, honorarios, carga del equipo y captación: análisis con IA para estudios contables.",
    intro: "Un estudio contable suele tener cartera llena y margen ajustado. VISTACEO mira honorarios, tiempo real por cliente y estructura del equipo, y te propone acciones sin frenar la operación mensual.",
    h2: "Honorarios y tiempo real por cliente",
    body: "Con tu cartera, tus honorarios y tu equipo cargados, el análisis se concentra en lo que cambia el resultado del estudio.",
    bullets: [
      "Clientes chicos que consumen tanto tiempo como los grandes.",
      "Honorarios que quedaron viejos frente al costo actual de la hora.",
      "Picos de carga en vencimientos sin redistribución del trabajo.",
      "Servicios de asesoría que se regalan dentro del abono mensual.",
    ],
    faqs: [
      { q: "¿Liquida impuestos o hace balances?", a: "No. VISTACEO no hace trabajo contable: analiza el estudio como negocio y te dice qué decisión tomar." },
      { q: "¿Sirve si soy contador independiente?", a: "Sí. El setup registra tu escala real y las misiones se ajustan al tiempo que tenés." },
    ],
  },
];

const RUBROS_EXTRA: SeoLanding[] = RUBROS_EXTRA_INPUT.map((r) =>
  rubro(r.slug, r.h1, r.title, r.description, r.intro, { h2: r.h2, body: r.body, bullets: r.bullets }, r.faqs),
);

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
    slug: "colombia",
    nombre: "Colombia",
    gentilicio: "colombianos",
    moneda: "pesos colombianos",
    pago: "En Colombia el plan Pro se muestra en tu moneda local y se cobra en dólares a través de PayPal.",
    title: "IA para negocios en Colombia | VISTACEO",
    description: "IA de gestión para negocios en Colombia: diagnóstico de tu operación, oportunidades reales y la acción concreta de cada día.",
    contexto:
      "En Colombia el canal digital y la venta por mensajería pesan mucho en la captación, y la competencia cambia bastante entre ciudades. VISTACEO parte de tu ciudad, tu canal y tu tipo de cliente para que las recomendaciones se parezcan a tu operación real.",
    bullets: [
      "Captación por redes y mensajería como canal principal en muchos rubros.",
      "Diferencias de demanda y competencia según ciudad y zona.",
      "Precios y ticket promedio expresados en tu moneda local.",
      "Recompra y fidelización en mercados con alta rotación de oferta.",
    ],
  },
  {
    slug: "uruguay",
    nombre: "Uruguay",
    gentilicio: "uruguayos",
    moneda: "pesos uruguayos",
    pago: "En Uruguay el plan Pro se muestra en tu moneda local y se cobra en dólares a través de PayPal.",
    title: "IA para negocios en Uruguay | VISTACEO",
    description: "IA de gestión para negocios uruguayos: análisis de tu operación, oportunidades y acciones concretas para cada semana.",
    contexto:
      "En un mercado chico como el uruguayo cada cliente pesa más y la recompra define el año. VISTACEO trabaja con esa escala: prioriza retención, margen y diferenciación antes que volumen a cualquier costo.",
    bullets: [
      "Retención y recompra como motor principal del crecimiento.",
      "Margen por producto o servicio en un mercado de volumen acotado.",
      "Estacionalidad marcada en rubros ligados al turismo interno y regional.",
      "Diferenciación frente a competidores directos muy cercanos.",
    ],
  },
  {
    slug: "peru",
    nombre: "Perú",
    gentilicio: "peruanos",
    moneda: "soles",
    pago: "En Perú el plan Pro se muestra en tu moneda local y se cobra en dólares a través de PayPal.",
    title: "IA para negocios en Perú | VISTACEO",
    description: "IA de gestión para negocios en Perú: análisis de tu operación, oportunidades reales y la acción concreta de cada día.",
    contexto:
      "En Perú conviven canales muy distintos, del local a pie de calle a la venta por redes, y la sensibilidad al precio es alta. VISTACEO ordena tu operación sobre tu canal real y tu tipo de cliente, en soles y con lenguaje local.",
    bullets: [
      "Posicionamiento de precio en un mercado sensible al valor percibido.",
      "Canales de venta mixtos: local, redes y mensajería.",
      "Costos e insumos con variaciones que conviene revisar seguido.",
      "Fidelización de clientes frecuentes frente a la captación permanente.",
    ],
  },
  {
    slug: "espana",
    nombre: "España",
    gentilicio: "españoles",
    moneda: "euros",
    pago: "En España el plan Pro se cobra en dólares a través de PayPal, con el importe mostrado también en euros.",
    title: "IA de gestión para negocios en España | VISTACEO",
    description: "IA de gestión para pymes y autónomos en España: diagnóstico de tu negocio, oportunidades y acciones concretas cada día.",
    contexto:
      "Para una pyme o un autónomo en España el tiempo de dirección es el recurso más escaso. VISTACEO ordena las decisiones de la semana —precios, margen, captación y capacidad— y las baja a pasos concretos, en euros y en español.",
    bullets: [
      "Precios y margen frente a costes que se mueven antes que las tarifas.",
      "Captación digital y su coste real por cliente nuevo.",
      "Estacionalidad fuerte en hostelería, turismo y servicios.",
      "Capacidad del equipo frente al volumen comprometido.",
    ],
  },
  {
    slug: "costa-rica",
    nombre: "Costa Rica",
    gentilicio: "costarricenses",
    moneda: "colones",
    pago: "En Costa Rica el plan Pro se muestra en tu moneda local y se cobra en dólares a través de PayPal.",
    title: "IA para negocios en Costa Rica | VISTACEO",
    description: "IA de gestión para negocios en Costa Rica: análisis de tu operación, oportunidades y acciones concretas cada semana.",
    contexto:
      "En Costa Rica muchos negocios combinan cliente local y cliente turista, y esas dos demandas se comportan distinto. VISTACEO separa ambos públicos y arma el plan sobre el que realmente sostiene tu facturación.",
    bullets: [
      "Demanda local frente a demanda turística y su estacionalidad.",
      "Precios y ticket promedio en tu moneda local.",
      "Canales digitales de captación y su costo real.",
      "Retención de clientes recurrentes fuera de temporada alta.",
    ],
  },
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
    slug: "excel-y-planillas",
    path: "/vs/excel-y-planillas",
    kind: "comparativa",
    title: "VISTACEO o planillas de Excel: qué cambia",
    description: "Diferencias reales entre gestionar tu negocio con planillas y usar un sistema de inteligencia de negocio que analiza, prioriza y recuerda.",
    h1: "VISTACEO frente a gestionar el negocio con planillas",
    intro:
      "Una planilla guarda los números; no te dice qué hacer con ellos. Esta comparación es directa, incluido lo que la planilla sigue haciendo mejor.",
    sections: [
      {
        h2: "En qué se diferencian",
        body: "La diferencia no es el cálculo, es la interpretación y la continuidad.",
        bullets: [
          "La planilla registra; VISTACEO interpreta y prioriza qué atender primero.",
          "La planilla no recuerda contexto: el sistema guarda lo aprendido y lo usa en cada respuesta.",
          "Las misiones bajan cada decisión a pasos concretos, con criterio de cumplimiento.",
          "El radar aporta señales externas del sector, algo que ninguna planilla trae sola.",
        ],
      },
      {
        h2: "Cuándo la planilla sigue siendo mejor",
        body:
          "Para cálculos propios muy específicos, para tu detalle contable y para registros que ya tenés armados y funcionan, la planilla sigue siendo la herramienta correcta. VISTACEO no reemplaza tus registros: trabaja sobre las decisiones que salen de ellos.",
      },
      CORE_MODULES,
      PRICING_SECTION,
    ],
    faqs: [
      {
        q: "¿Tengo que abandonar mis planillas?",
        a: "No. Podés seguir usándolas y cargar en VISTACEO los datos clave para que el análisis se apoye en información real.",
      },
      {
        q: "¿Cuánto trabajo lleva empezar?",
        a: "El setup guiado y el análisis inicial se completan en una sola sesión; después el sistema sigue aprendiendo con el uso.",
      },
    ],
    related: [],
  },
  {
    slug: "chatgpt-para-negocios",
    path: "/vs/chatgpt-para-negocios",
    kind: "comparativa",
    title: "VISTACEO o un chat de IA genérico",
    description: "Diferencias entre preguntarle a un chat de IA genérico y usar un sistema que conoce tu negocio, recuerda el historial y valida cada salida.",
    h1: "VISTACEO frente a usar un chat de IA genérico",
    intro:
      "Un chat de IA general responde bien preguntas generales. El problema aparece cuando la respuesta tiene que ser específica de tu negocio y sostenerse en el tiempo.",
    sections: [
      {
        h2: "En qué se diferencian",
        body: "La diferencia está en el contexto persistente y en el control de calidad de la salida.",
        bullets: [
          "Contexto: VISTACEO parte de un perfil completo de tu negocio en lugar de lo que alcances a escribir en el mensaje.",
          "Memoria: guarda lo que aprende y lo reutiliza; podés verlo en la sección Memoria.",
          "Validación: cada salida se revisa contra los datos de tu negocio y se descarta si es genérica.",
          "Continuidad: misiones, radar y predicciones trabajan solos entre una conversación y la siguiente.",
        ],
      },
      {
        h2: "Cuándo alcanza un chat genérico",
        body:
          "Para redactar textos, resolver dudas puntuales o aprender un concepto, un chat general es suficiente y más barato. VISTACEO tiene sentido cuando querés decisiones de gestión sostenidas y ancladas en tu propia información.",
      },
      CORE_MODULES,
      PRICING_SECTION,
    ],
    faqs: [
      {
        q: "¿Qué modelo de IA usa VISTACEO?",
        a: "Usa modelos de lenguaje de última generación, con capas propias de contexto, validación y memoria por encima. El valor está en esas capas, no solo en el modelo.",
      },
      {
        q: "¿Puedo pedirle lo mismo que a un chat común?",
        a: "Sí, y además responde con tu contexto cargado. Si le falta un dato para ser preciso, te lo pide en lugar de suponerlo.",
      },
    ],
    related: [],
  },
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

export const SEO_LANDINGS: SeoLanding[] = [...RUBROS, ...RUBROS_EXTRA, ...PAISES, ...COMPARATIVAS];

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
