/**
 * Perfil del Empleado Digital (Ficha de Contratación)
 * ---------------------------------------------------
 * Genera de forma determinista (sin costo de IA) el rol, el tono y las
 * habilidades del empleado digital según sector + país + tipo de operación.
 * El usuario puede renombrar al empleado; el resto se adapta solo.
 */

export type AgentSectorKey =
  | "gastronomia"
  | "comercio"
  | "ecommerce"
  | "b2b"
  | "industria"
  | "salud"
  | "servicio_profesional"
  | "agencia"
  | "educacion"
  | "creador"
  | "oficio"
  | "generico";

export interface AgentSkill {
  title: string;
  detail: string;
}

export interface AgentProfile {
  suggestedNames: string[];
  role: string;
  mission: string;
  tone: string;
  locationLine: string;
  skills: AgentSkill[];
}

const CATEGORY_TO_SECTOR: Record<string, AgentSectorKey> = {
  cafeteria: "gastronomia",
  bar: "gastronomia",
  restaurant: "gastronomia",
  fast_casual: "gastronomia",
  heladeria: "gastronomia",
  panaderia: "gastronomia",
  dark_kitchen: "gastronomia",
  ecommerce: "ecommerce",
  comercio: "comercio",
  b2b: "b2b",
  industria: "industria",
  salud: "salud",
  servicio_profesional: "servicio_profesional",
  freelancer: "servicio_profesional",
  empleado: "servicio_profesional",
  agencia: "agencia",
  educacion: "educacion",
  creador: "creador",
  otro: "generico",
};

export function resolveSector(category?: string | null, hint?: string | null): AgentSectorKey {
  const h = (hint || "").toLowerCase();
  if (/(taller|gomer|mecánic|mecanic|electricist|gasist|plomer|herrer|carpinter|refriger|aire acondicionado|cerrajer)/.test(h)) {
    return "oficio";
  }
  if (category && CATEGORY_TO_SECTOR[category]) return CATEGORY_TO_SECTOR[category];
  return "generico";
}

/* ── Nombres sugeridos por país (tono local, nunca extranjerizante) ── */
const NAMES_BY_COUNTRY: Record<string, string[]> = {
  AR: ["Mateo", "Facundo", "Valentina", "Joaquín"],
  UY: ["Mateo", "Santiago", "Camila", "Bruno"],
  CL: ["Matías", "Javiera", "Tomás", "Antonia"],
  MX: ["Rodrigo", "Regina", "Emiliano", "Ximena"],
  CO: ["Santiago", "Mariana", "Andrés", "Valeria"],
  PE: ["Sebastián", "Camila", "Rodrigo", "Fernanda"],
  EC: ["Martín", "Daniela", "Andrés", "Paula"],
  PY: ["Gabriel", "Lucía", "Diego", "Rocío"],
  CR: ["Diego", "Natalia", "Andrés", "María José"],
  PA: ["Carlos", "Gabriela", "Luis", "Ana"],
  ES: ["Elena", "Álvaro", "Marta", "Pablo"],
  BO: ["Alejandro", "Andrea", "Rodrigo", "Gabriela"],
  DO: ["José", "Laura", "Miguel", "Patricia"],
  GT: ["Diego", "Ana", "Luis", "Sofía"],
  SV: ["Carlos", "Andrea", "José", "Karla"],
  HN: ["Marco", "Daniela", "Luis", "Gabriela"],
  NI: ["Juan", "María", "Carlos", "Ana"],
  US: ["Daniel", "Sofía", "Andrés", "Laura"],
  BR: ["Lucas", "Beatriz", "Rafael", "Camila"],
};

const COUNTRY_LABEL: Record<string, string> = {
  AR: "Argentina", UY: "Uruguay", CL: "Chile", MX: "México", CO: "Colombia",
  PE: "Perú", EC: "Ecuador", PY: "Paraguay", CR: "Costa Rica", PA: "Panamá",
  ES: "España", BO: "Bolivia", DO: "República Dominicana", GT: "Guatemala",
  SV: "El Salvador", HN: "Honduras", NI: "Nicaragua", US: "Estados Unidos", BR: "Brasil",
};

/* ── Realidad económica y de cobro por país ── */
const COUNTRY_CONTEXT: Record<string, { tone: string; money: string }> = {
  AR: {
    tone: "Voseo profesional, directo y negociador firme.",
    money: "Sabe que acá el dinero pierde valor cada semana: cobra rápido, ajusta precios apenas sube un costo y trabaja con transferencias y MercadoPago.",
  },
  UY: {
    tone: "Voseo cordial y prolijo, sin vueltas.",
    money: "Maneja plazos de cobro cortos, pagos por transferencia y ajustes de lista medidos.",
  },
  CL: {
    tone: "Tuteo profesional, claro y ordenado.",
    money: "Trabaja con boletas, facturación a 30 días y comparación de precios de la competencia local.",
  },
  MX: {
    tone: "Tuteo profesional y cercano.",
    money: "Da seguimiento a cotizaciones y órdenes de compra, líneas de crédito a 30 días y costos de flete.",
  },
  CO: {
    tone: "Tuteo profesional y amable, muy resolutivo.",
    money: "Sigue cotizaciones pendientes, cobros por transferencia y precios de la zona.",
  },
  ES: {
    tone: "Tono formal ibérico, directo y sobrio.",
    money: "Trabaja con IVA, facturación a 30/60 días, transferencias SEPA y protección de datos (RGPD).",
  },
};

const DEFAULT_COUNTRY_CONTEXT = {
  tone: "Tuteo profesional, claro y directo.",
  money: "Cuida tus márgenes, sigue los cobros pendientes y compara precios de tu zona.",
};

/* ── Habilidades reales por sector (siempre trabajo hecho, nunca consejos) ── */
const SECTOR_PROFILE: Record<AgentSectorKey, { role: string; mission: string; skills: AgentSkill[] }> = {
  gastronomia: {
    role: "Encargado Comercial y Guardián de Costos",
    mission: "Llenar mesas los días flojos y defender el margen de cada plato.",
    skills: [
      { title: "Control de carta y costo de insumos", detail: "Detecta subas de proveedores y recalcula los precios de los platos que te están dejando de dar margen." },
      { title: "Llenado de días flojos", detail: "Arma la promoción del día flojo con números reales y deja el mensaje listo para publicar y enviar." },
      { title: "Reputación y reseñas", detail: "Sigue lo que dicen tus clientes y responde reseñas con tu tono para que no se te caiga la calificación." },
      { title: "Clientes que dejaron de venir", detail: "Identifica a los habitués que no vuelven hace semanas y les prepara la invitación de regreso." },
    ],
  },
  comercio: {
    role: "Jefe de Mostrador y Rotación",
    mission: "Subir el ticket promedio y mover el stock parado sin resignar margen.",
    skills: [
      { title: "Ticket promedio del mostrador", detail: "Arma combos y ventas cruzadas con tus productos reales para que cada cliente se lleve más." },
      { title: "Stock inmovilizado", detail: "Detecta lo que no rota y prepara la liquidación puntual que recupera caja sin quemar margen." },
      { title: "Club de clientes por WhatsApp", detail: "Genera el cartel con código y el guion para captar teléfonos en el mostrador, y después escribe él las ofertas." },
      { title: "Precios contra la zona", detail: "Compara tus precios con comercios cercanos y ajusta tu lista cuando cambia el costo." },
    ],
  },
  ecommerce: {
    role: "Director de Ventas Online",
    mission: "Recuperar ventas perdidas y sostener el margen en cada pedido.",
    skills: [
      { title: "Carritos y consultas sin respuesta", detail: "Retoma a quien preguntó y no compró con un mensaje personalizado listo para enviar." },
      { title: "Margen real por producto", detail: "Descuenta envío y comisiones para mostrarte qué productos rinden de verdad y cuáles hay que retocar." },
      { title: "Fichas y descripciones", detail: "Reescribe títulos y descripciones de los productos que no venden para que aparezcan y conviertan." },
      { title: "Recompra de clientes", detail: "Detecta a los que compraron una vez y nunca más, y prepara la campaña de regreso." },
    ],
  },
  b2b: {
    role: "Director Comercial y Guardián de Caja",
    mission: "Que ninguna cotización quede en visto y que ninguna factura se pase de fecha.",
    skills: [
      { title: "Seguimiento de presupuestos", detail: "Persigue cada cotización enviada con recordatorios redactados y enviados por él mismo." },
      { title: "Cobranza de saldos vencidos", detail: "Reclama con cortesía antes y después del vencimiento, y agenda el chequeo cuando el cliente promete pagar." },
      { title: "Clientes que bajaron el ritmo", detail: "Avisa cuándo una cuenta importante redujo compras y prepara la propuesta para recuperarla." },
      { title: "Costos y lista de precios", detail: "Vigila subas de insumos y logística y recalcula tu lista el mismo día del aumento." },
    ],
  },
  industria: {
    role: "Gerente de Producción y Rentabilidad",
    mission: "Cuidar el costo por unidad y sostener la cartera de clientes grandes.",
    skills: [
      { title: "Costo por unidad producida", detail: "Recalcula el costo real cuando cambia la materia prima y te deja la lista corregida." },
      { title: "Concentración de clientes", detail: "Alerta si un cliente representa demasiado de tu facturación y prepara la búsqueda de nuevos compradores." },
      { title: "Cotizaciones y órdenes de compra", detail: "Da seguimiento formal a cada cotización enviada hasta que haya respuesta." },
      { title: "Cobranza y plazos", detail: "Controla vencimientos y reclama pagos atrasados sin que tengas que hacerlo vos." },
    ],
  },
  salud: {
    role: "Coordinador de Agenda y Pacientes",
    mission: "Que no queden huecos en la agenda y que los pacientes vuelvan a tiempo.",
    skills: [
      { title: "Huecos y ausencias", detail: "Confirma turnos y ofrece los espacios libres a pacientes en espera antes de que se pierdan." },
      { title: "Controles vencidos", detail: "Detecta pacientes que no vuelven hace meses y les escribe para reagendar el control." },
      { title: "Reputación profesional", detail: "Sigue reseñas y comentarios y responde con el tono correcto de tu profesión." },
      { title: "Aranceles y cobertura", detail: "Compara tus honorarios con la zona y prepara la actualización cuando quedaste atrasado." },
    ],
  },
  servicio_profesional: {
    role: "Asistente Ejecutivo y Gestor de Cartera",
    mission: "Cerrar propuestas y mantener cada cliente pagando en fecha.",
    skills: [
      { title: "Propuestas enviadas", detail: "Redacta la propuesta y hace el seguimiento hasta que el cliente responde." },
      { title: "Honorarios y actualización", detail: "Detecta cuándo tus honorarios quedaron atrasados y prepara la carta de actualización." },
      { title: "Cobranza sin incomodidad", detail: "Reclama los pagos atrasados por vos, con el tono justo y el recordatorio en fecha." },
      { title: "Clientes en riesgo", detail: "Avisa cuándo un cliente dejó de responder o bajó su actividad y prepara el contacto." },
    ],
  },
  agencia: {
    role: "Director de Cuentas",
    mission: "Retener clientes mensuales y cerrar las propuestas abiertas.",
    skills: [
      { title: "Informes de resultados", detail: "Arma el informe mensual que justifica tu honorario y lo deja listo para enviar." },
      { title: "Propuestas y seguimiento", detail: "Persigue cada presupuesto abierto con recordatorios redactados por él." },
      { title: "Cuentas en riesgo", detail: "Detecta clientes que se enfriaron y prepara la reunión de rescate." },
      { title: "Precios por hora real", detail: "Calcula cuánto te cuesta realmente cada cuenta y qué precio deberías estar cobrando." },
    ],
  },
  educacion: {
    role: "Coordinador de Inscripciones",
    mission: "Llenar cupos y sostener la continuidad de los alumnos.",
    skills: [
      { title: "Consultas sin cerrar", detail: "Responde y sigue a cada interesado que preguntó y no se inscribió." },
      { title: "Alumnos que abandonan", detail: "Detecta caídas de asistencia o pagos y prepara el contacto de retención." },
      { title: "Cobro de cuotas", detail: "Envía recordatorios de cuota antes del vencimiento y reclama las atrasadas." },
      { title: "Oferta y precios", detail: "Compara tu propuesta con la de la zona y ajusta el valor de los cursos." },
    ],
  },
  creador: {
    role: "Mánager Comercial",
    mission: "Convertir audiencia en ingresos concretos y estables.",
    skills: [
      { title: "Propuestas a marcas", detail: "Redacta y envía las propuestas comerciales con tus números reales." },
      { title: "Cobros pendientes", detail: "Persigue las facturas de campañas que quedaron sin pagar." },
      { title: "Precios de tu categoría", detail: "Compara lo que cobran perfiles similares y ajusta tu tarifario." },
      { title: "Clientes repetidos", detail: "Detecta marcas que trabajaron una vez y prepara la propuesta para volver." },
    ],
  },
  oficio: {
    role: "Secretario Comercial de Taller",
    mission: "Que no se pierda ningún presupuesto y que los clientes vuelvan al service.",
    skills: [
      { title: "Presupuestos en visto", detail: "Hace el seguimiento de cada presupuesto por mensaje hasta obtener respuesta." },
      { title: "Mantenimiento y regreso", detail: "Detecta clientes que no vuelven hace meses y les escribe para el próximo service." },
      { title: "Mano de obra bien cobrada", detail: "Calcula tu hora real contra insumos y repuestos para que no regales trabajo." },
      { title: "Costo de repuestos", detail: "Vigila subas de insumos y te corrige la lista el mismo día." },
    ],
  },
  generico: {
    role: "Director Ejecutivo",
    mission: "Traer clientes nuevos, recuperar los dormidos y cuidar la caja.",
    skills: [
      { title: "Clientes dormidos", detail: "Detecta a quienes dejaron de comprarte y prepara y envía el mensaje de regreso." },
      { title: "Seguimiento de ventas", detail: "Persigue cada consulta o presupuesto abierto hasta que haya respuesta." },
      { title: "Precios y costos", detail: "Vigila aumentos y recalcula tu lista para que no pierdas margen." },
      { title: "Competencia de tu zona", detail: "Monitorea qué hacen los de al lado y prepara tu respuesta comercial." },
    ],
  },
};

const ZERO_COST_SKILL: AgentSkill = {
  title: "Criterio de costo cero",
  detail: "Siempre usa primero las vías gratuitas (mensajes, correo del sistema, tus propios canales). Si algo requiere pagar, te lo avisa y te pide permiso antes.",
};

export function buildAgentProfile(params: {
  category?: string | null;
  country?: string | null;
  businessTypeLabel?: string | null;
  city?: string | null;
}): AgentProfile {
  const sector = resolveSector(params.category, params.businessTypeLabel);
  const base = SECTOR_PROFILE[sector];
  const countryCode = (params.country || "AR").toUpperCase();
  const ctx = COUNTRY_CONTEXT[countryCode] ?? DEFAULT_COUNTRY_CONTEXT;
  const countryName = COUNTRY_LABEL[countryCode] ?? "tu país";
  const locationLine = params.city ? `${params.city}, ${countryName}` : countryName;

  return {
    suggestedNames: NAMES_BY_COUNTRY[countryCode] ?? NAMES_BY_COUNTRY.AR,
    role: base.role,
    mission: base.mission,
    tone: ctx.tone,
    locationLine,
    skills: [...base.skills.slice(0, 3), { title: "Adaptado a tu mercado", detail: ctx.money }, ZERO_COST_SKILL],
  };
}
