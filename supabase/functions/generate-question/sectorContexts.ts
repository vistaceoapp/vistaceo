// Ultra-personalized sector contexts for 180+ business types
// Each context provides specific questions, metrics and challenges for the AI

export interface SectorContext {
  focus: string;
  keyMetrics: string[];
  uniqueChallenges: string[];
  followUpTriggers?: Record<string, string[]>; // answers that trigger follow-up questions
}

export const SECTOR_CONTEXTS: Record<string, SectorContext> = {
  // ========================
  // A1_GASTRO - GASTRONOMÍA (18 tipos)
  // ========================
  restaurant_general: { 
    focus: "experiencia gastronómica y servicio", 
    keyMetrics: ["ticket promedio", "rotación de mesas", "costo de alimentos", "satisfacción del cliente"], 
    uniqueChallenges: ["consistencia en la cocina", "manejo de reservas", "control de desperdicio", "retención de personal"],
    followUpTriggers: { "equipo": ["rotación alta", "problemas de capacitación"], "operaciones": ["coordinación", "tiempos"] }
  },
  alta_cocina: { 
    focus: "experiencia gourmet premium", 
    keyMetrics: ["precio por cubierto", "tasa de reservas anticipadas", "rating en guías gastronómicas", "margen por plato estrella"], 
    uniqueChallenges: ["sourcing de ingredientes premium", "retención de chefs talentosos", "expectativas altísimas del cliente", "consistencia en degustaciones"],
    followUpTriggers: { "producto": ["menú degustación", "maridaje"], "equipo": ["chef ejecutivo", "sommelier"] }
  },
  bodegon_cantina: { 
    focus: "comida casera y ambiente tradicional", 
    keyMetrics: ["platos del día vendidos", "clientes habituales", "costo por porción abundante", "rotación almuerzo"], 
    uniqueChallenges: ["mantener recetas tradicionales", "velocidad en hora pico", "control de porciones generosas", "fidelizar a clientela local"],
    followUpTriggers: { "clientes": ["oficinistas", "barrio"], "operaciones": ["menú del día"] }
  },
  parrilla_asador: { 
    focus: "carnes a la parrilla y experiencia de asado", 
    keyMetrics: ["kilo de carne vendido", "ticket por mesa", "rotación fin de semana", "costo de cortes premium"], 
    uniqueChallenges: ["calidad constante de carne", "punto de cocción perfecto", "manejo de grupo grandes", "rentabilidad de cortes caros"],
    followUpTriggers: { "producto": ["proveedores de carne", "cortes populares"], "operaciones": ["parrillero principal"] }
  },
  cocina_criolla: { 
    focus: "sabores locales y tradicionales", 
    keyMetrics: ["platos tradicionales más vendidos", "eventos especiales", "ingredientes locales", "percepción de autenticidad"], 
    uniqueChallenges: ["sourcing de ingredientes regionales", "recetas de familia", "educar al turista", "competir con cadenas"],
    followUpTriggers: { "marketing": ["turistas vs locales"], "producto": ["recetas únicas"] }
  },
  pescados_mariscos: { 
    focus: "productos del mar y frescura", 
    keyMetrics: ["rotación de inventario fresco", "costo de pescado del día", "ticket en cevichería", "desperdicio de mariscos"], 
    uniqueChallenges: ["cadena de frío impecable", "proveedores de confianza", "precios fluctuantes", "educación sobre frescura"],
    followUpTriggers: { "proveedores": ["mercado de pescado", "frecuencia de entrega"], "operaciones": ["control de frescura"] }
  },
  pizzeria: { 
    focus: "pizzas artesanales y delivery", 
    keyMetrics: ["pizzas por hora horno", "tiempo de entrega delivery", "costo de masa e insumos", "pedidos online vs local"], 
    uniqueChallenges: ["consistencia de masa", "tiempos de delivery", "competencia de apps", "horario nocturno"],
    followUpTriggers: { "tecnologia": ["apps delivery", "pedidos online"], "operaciones": ["producción por hora"] }
  },
  panaderia: { 
    focus: "pan artesanal y productos horneados", 
    keyMetrics: ["producción diaria", "desperdicio de pan", "venta por hora matutina", "margen de facturas"], 
    uniqueChallenges: ["horarios de producción muy temprano", "frescura todo el día", "variedad vs eficiencia", "estacionalidad"],
    followUpTriggers: { "operaciones": ["horarios de producción", "maestro panadero"], "producto": ["productos más vendidos"] }
  },
  pastas_italiana: { 
    focus: "pastas frescas y cocina italiana", 
    keyMetrics: ["pastas frescas vs secas vendidas", "ticket promedio", "costo de harinas especiales", "rotación cena"], 
    uniqueChallenges: ["producción de pasta fresca", "tiempos de cocción perfectos", "salsas caseras", "autenticidad percibida"],
    followUpTriggers: { "producto": ["pasta fresca propia", "importados"], "operaciones": ["producción diaria"] }
  },
  heladeria: { 
    focus: "helados artesanales", 
    keyMetrics: ["sabores más vendidos", "ventas estacionales", "costo de insumos lácteos", "rotación de sabores nuevos"], 
    uniqueChallenges: ["temporada baja invernal", "cadena de frío perfecta", "innovación de sabores", "competencia de cadenas"],
    followUpTriggers: { "finanzas": ["estacionalidad", "productos alternativos invierno"], "producto": ["sabores únicos"] }
  },
  fast_food: { 
    focus: "comida rápida y volumen", 
    keyMetrics: ["tiempo de servicio", "ventas por hora pico", "costo operativo por pedido", "satisfacción delivery"], 
    uniqueChallenges: ["velocidad de entrega", "consistencia del producto", "manejo de apps", "rotación de personal"],
    followUpTriggers: { "tecnologia": ["sistemas de pedido"], "equipo": ["capacitación rápida"] }
  },
  cafeteria_pasteleria: { 
    focus: "café de especialidad y dulces artesanales", 
    keyMetrics: ["café vendido por día", "ticket promedio desayuno", "margen de pastelería", "clientes recurrentes"], 
    uniqueChallenges: ["hora pico matutina extrema", "frescura de productos", "competencia de cadenas de café", "wifi y trabajo remoto"],
    followUpTriggers: { "clientes": ["trabajadores remotos", "take away"], "producto": ["café especialidad", "pastelería propia"] }
  },
  cocina_asiatica: { 
    focus: "cocina asiática (sushi, ramen, wok)", 
    keyMetrics: ["rolls vendidos", "tiempo de preparación wok", "costo de pescado sushi", "rating de autenticidad"], 
    uniqueChallenges: ["sourcing de ingredientes asiáticos", "técnica específica", "percepción de frescura", "competencia de delivery"],
    followUpTriggers: { "producto": ["sushi vs otros", "importaciones"], "equipo": ["sushiman capacitado"] }
  },
  cocina_arabe: { 
    focus: "sabores del medio oriente", 
    keyMetrics: ["platos más pedidos", "eventos y catering", "costo de especias", "percepción de autenticidad"], 
    uniqueChallenges: ["ingredientes específicos", "técnicas de preparación", "educar al cliente local", "presentación auténtica"],
    followUpTriggers: { "marketing": ["comunidad árabe", "curiosos"], "producto": ["platos estrella"] }
  },
  cocina_saludable: { 
    focus: "alimentación saludable, veggie y consciente", 
    keyMetrics: ["bowls vendidos", "clientes recurrentes fitness", "costo de orgánicos", "engagement en redes"], 
    uniqueChallenges: ["sourcing orgánico", "precios competitivos", "variedad sin aburrimiento", "certificaciones"],
    followUpTriggers: { "clientes": ["veganos estrictos", "flexitarianos"], "producto": ["orgánicos", "libre de"] }
  },
  bar_cerveceria: { 
    focus: "bebidas, ambiente nocturno y socialización", 
    keyMetrics: ["consumo por persona", "rotación en barra", "margen de tragos", "eventos especiales"], 
    uniqueChallenges: ["control de inventario de bebidas", "seguridad nocturna", "retención de bartenders", "licencias"],
    followUpTriggers: { "operaciones": ["horarios nocturnos", "control de stock"], "equipo": ["bartenders", "seguridad"] }
  },
  servicio_comida: { 
    focus: "take away, viandas y catering", 
    keyMetrics: ["viandas semanales", "clientes corporativos", "costo de packaging", "logística de entrega"], 
    uniqueChallenges: ["planificación de producción", "packaging eficiente", "cadena de frío", "escalabilidad"],
    followUpTriggers: { "clientes": ["empresas", "individuales"], "operaciones": ["producción diaria", "logística"] }
  },
  dark_kitchen: { 
    focus: "delivery puro sin salón", 
    keyMetrics: ["pedidos por hora", "rating en apps", "costo de empaque", "tiempo de preparación"], 
    uniqueChallenges: ["posicionamiento en apps", "sin interacción directa", "múltiples marcas virtuales", "dependencia de plataformas"],
    followUpTriggers: { "tecnologia": ["apps dominantes", "marca propia"], "marketing": ["posicionamiento en apps"] }
  },

  // ========================
  // A2_TURISMO - TURISMO Y EVENTOS (18 tipos)
  // ========================
  hotel_urbano: { 
    focus: "alojamiento de negocios en ciudad", 
    keyMetrics: ["ocupación", "tarifa promedio (ADR)", "RevPAR", "clientes corporativos"], 
    uniqueChallenges: ["competencia con OTAs", "fidelización corporativa", "servicios business center", "wifi confiable"],
    followUpTriggers: { "clientes": ["empresas vs turistas"], "tecnologia": ["gestión de reservas"] }
  },
  hotel_boutique: { 
    focus: "experiencia única y diferenciada", 
    keyMetrics: ["tarifa premium", "reseñas en TripAdvisor", "huéspedes que repiten", "experiencias vendidas"], 
    uniqueChallenges: ["diferenciación constante", "servicio ultra personalizado", "marketing de nicho", "mantenimiento de la experiencia"],
    followUpTriggers: { "marketing": ["posicionamiento único"], "servicio": ["personalización"] }
  },
  resort_all_inclusive: { 
    focus: "experiencia de ocio completa", 
    keyMetrics: ["ocupación por temporada", "gasto adicional por huésped", "satisfacción de servicios incluidos", "retención anual"], 
    uniqueChallenges: ["control de costos todo incluido", "variedad de actividades", "estacionalidad extrema", "logística de insumos"],
    followUpTriggers: { "finanzas": ["rentabilidad all inclusive"], "operaciones": ["temporada alta vs baja"] }
  },
  hostel: { 
    focus: "turismo joven y social", 
    keyMetrics: ["camas vendidas", "tours y actividades vendidos", "rating en Hostelworld", "ocupación dormitorios vs privados"], 
    uniqueChallenges: ["ambiente comunitario", "seguridad de pertenencias", "bajo costo operativo", "estacionalidad backpacker"],
    followUpTriggers: { "clientes": ["mochileros", "nómadas digitales"], "marketing": ["presencia en apps de hostels"] }
  },
  posada_lodge: { 
    focus: "naturaleza, descanso y estilo local", 
    keyMetrics: ["ocupación fin de semana", "experiencias locales vendidas", "repeat guests", "rating de tranquilidad"], 
    uniqueChallenges: ["accesibilidad remota", "servicios en zona rural", "autenticidad local", "clima dependiente"],
    followUpTriggers: { "ubicacion": ["acceso", "atractivos cercanos"], "servicio": ["experiencias locales"] }
  },
  apart_hotel: { 
    focus: "estadías medias con autonomía", 
    keyMetrics: ["ocupación mensual", "estadía promedio en días", "servicios adicionales", "clientes relocados"], 
    uniqueChallenges: ["limpieza de cocinas", "desgaste mayor", "servicios de hotelería vs apartamento", "pricing por duración"],
    followUpTriggers: { "clientes": ["corporativos en proyecto", "familias"], "operaciones": ["frecuencia de limpieza"] }
  },
  alquiler_temporario: { 
    focus: "propiedades por días o semanas", 
    keyMetrics: ["ocupación anual", "tarifa por noche", "rating en Airbnb/Booking", "costos de check-in"], 
    uniqueChallenges: ["gestión remota", "check-in automatizado", "mantenimiento entre huéspedes", "competencia de precios"],
    followUpTriggers: { "tecnologia": ["automatización", "cerraduras inteligentes"], "operaciones": ["limpieza y mantenimiento"] }
  },
  agencia_viajes: { 
    focus: "paquetes, aéreos y asistencia al viajero", 
    keyMetrics: ["ventas por agente", "comisiones promedio", "cancelaciones", "NPS de viajeros"], 
    uniqueChallenges: ["competencia online extrema", "márgenes muy bajos", "atención 24/7 en viajes", "errores costosos"],
    followUpTriggers: { "competencia": ["agencias online", "venta directa"], "servicio": ["emergencias en viaje"] }
  },
  operador_turistico: { 
    focus: "tours y experiencias en destino", 
    keyMetrics: ["tours vendidos", "rating de guías", "ocupación por tour", "reservas anticipadas"], 
    uniqueChallenges: ["dependencia del clima", "calidad de guías", "logística de transporte", "estacionalidad"],
    followUpTriggers: { "equipo": ["guías profesionales"], "operaciones": ["capacidad por tour"] }
  },
  tours_guiados: { 
    focus: "city tours y experiencias culturales", 
    keyMetrics: ["tours por día", "satisfacción de turistas", "tips promedio", "reservas online"], 
    uniqueChallenges: ["idiomas múltiples", "conocimiento profundo", "competencia de free tours", "clima"],
    followUpTriggers: { "marketing": ["OTAs vs directo"], "servicio": ["idiomas disponibles"] }
  },
  turismo_aventura: { 
    focus: "actividades outdoor y adrenalina", 
    keyMetrics: ["actividades por día", "tasa de accidentes cero", "equipamiento en condiciones", "certificaciones vigentes"], 
    uniqueChallenges: ["seguridad extrema", "seguros costosos", "equipamiento especializado", "clima dependiente"],
    followUpTriggers: { "operaciones": ["protocolos de seguridad"], "finanzas": ["seguros", "equipamiento"] }
  },
  atracciones_tickets: { 
    focus: "entradas y experiencias de ocio", 
    keyMetrics: ["tickets vendidos", "ingreso por visitante", "tiempo de espera", "satisfacción de la experiencia"], 
    uniqueChallenges: ["manejo de colas", "experiencia consistente", "pricing dinámico", "mantenimiento de atracciones"],
    followUpTriggers: { "tecnologia": ["venta online", "gestión de colas"], "operaciones": ["capacidad máxima"] }
  },
  parque_tematico: { 
    focus: "entretenimiento familiar masivo", 
    keyMetrics: ["visitantes diarios", "gasto per cápita", "NPS", "ocupación de atracciones"], 
    uniqueChallenges: ["seguridad de atracciones", "flujo de multitudes", "estacionalidad escolar", "inversión en mantenimiento"],
    followUpTriggers: { "finanzas": ["inversión en atracciones"], "operaciones": ["personal de temporada"] }
  },
  teatro_espectaculos: { 
    focus: "shows, funciones y programación cultural", 
    keyMetrics: ["ocupación de butacas", "funciones por semana", "ticket promedio", "abonos vendidos"], 
    uniqueChallenges: ["programación atractiva", "artistas y cachés", "marketing cultural", "mantenimiento de sala"],
    followUpTriggers: { "marketing": ["público objetivo"], "producto": ["programación"] }
  },
  salon_eventos_sociales: { 
    focus: "casamientos, fiestas y celebraciones", 
    keyMetrics: ["eventos por mes", "ticket promedio por evento", "satisfacción de novios", "reservas anticipadas"], 
    uniqueChallenges: ["coordinación de proveedores", "fechas pico", "expectativas altísimas", "logística de día D"],
    followUpTriggers: { "operaciones": ["coordinación de evento"], "marketing": ["captación de novios"] }
  },
  eventos_corporativos: { 
    focus: "congresos, reuniones MICE", 
    keyMetrics: ["eventos corporativos", "asistentes por evento", "servicios adicionales", "clientes recurrentes"], 
    uniqueChallenges: ["tecnología de audio/video", "catering masivo", "logística de registro", "sponsors"],
    followUpTriggers: { "tecnologia": ["streaming", "registro digital"], "servicio": ["catering", "coffee breaks"] }
  },
  productora_eventos: { 
    focus: "producción integral de eventos", 
    keyMetrics: ["eventos producidos", "margen por proyecto", "proveedores en red", "satisfacción de clientes"], 
    uniqueChallenges: ["coordinación de múltiples proveedores", "presupuestos ajustados", "imprevistos de último momento", "creatividad constante"],
    followUpTriggers: { "operaciones": ["red de proveedores"], "finanzas": ["presupuestos y márgenes"] }
  },
  ocio_nocturno: { 
    focus: "entretenimiento nocturno y música", 
    keyMetrics: ["entrada promedio", "consumo en barra", "capacidad utilizada", "eventos especiales"], 
    uniqueChallenges: ["seguridad y control de acceso", "licencias y permisos", "DJs y artistas", "horarios nocturnos extremos"],
    followUpTriggers: { "operaciones": ["seguridad", "horarios"], "marketing": ["eventos y DJs"] }
  },

  // ========================
  // A3_RETAIL - COMERCIO MINORISTA (18 tipos)
  // ========================
  almacen_tienda_barrio: { 
    focus: "proximidad y servicio al vecino", 
    keyMetrics: ["ventas diarias", "clientes habituales", "rotación de productos", "margen promedio"], 
    uniqueChallenges: ["competencia de supermercados", "capital de trabajo", "variedad limitada", "fiado y cobranza"],
    followUpTriggers: { "finanzas": ["manejo de fiado"], "clientes": ["fidelización barrial"] }
  },
  supermercado: { 
    focus: "consumo masivo y alto volumen", 
    keyMetrics: ["ventas por m²", "rotación por categoría", "merma total", "ticket promedio"], 
    uniqueChallenges: ["márgenes muy ajustados", "logística de reposición", "competencia de cadenas", "control de vencimientos"],
    followUpTriggers: { "operaciones": ["reposición", "control de mermas"], "finanzas": ["negociación con proveedores"] }
  },
  moda_accesorios: { 
    focus: "tendencias, temporada y estilo", 
    keyMetrics: ["rotación de inventario", "ticket promedio", "devoluciones", "conversión en tienda"], 
    uniqueChallenges: ["predicción de tendencias", "gestión de tallas/colores", "liquidación de temporada", "competencia online"],
    followUpTriggers: { "producto": ["compra de temporada"], "marketing": ["redes sociales", "influencers"] }
  },
  calzado_marroquineria: { 
    focus: "calzado, bolsos y accesorios de cuero", 
    keyMetrics: ["unidades vendidas", "ticket promedio", "rotación por modelo", "tasa de devolución"], 
    uniqueChallenges: ["gestión de talles y colores", "calidad de materiales", "tendencias cambiantes", "stock de modelos clásicos"],
    followUpTriggers: { "producto": ["marcas propias vs terceros"], "operaciones": ["gestión de talles"] }
  },
  hogar_decoracion: { 
    focus: "muebles, deco y artículos del hogar", 
    keyMetrics: ["ticket promedio alto", "clientes de proyecto", "rotación de exhibición", "ventas de impulso"], 
    uniqueChallenges: ["showroom atractivo", "logística de entrega", "productos voluminosos", "tendencias de diseño"],
    followUpTriggers: { "servicio": ["entrega e instalación"], "marketing": ["inspiración en redes"] }
  },
  electronica_tecnologia: { 
    focus: "gadgets, tecnología y equipos", 
    keyMetrics: ["margen por producto", "garantías vendidas", "rotación", "servicio técnico"], 
    uniqueChallenges: ["obsolescencia rápida", "servicio post-venta", "competencia de precio online", "capacitación técnica"],
    followUpTriggers: { "servicio": ["soporte técnico"], "competencia": ["precios online"] }
  },
  ferreteria: { 
    focus: "herramientas, materiales y reparación", 
    keyMetrics: ["ticket promedio", "clientes profesionales vs hogar", "rotación de básicos", "servicio de corte/mezcla"], 
    uniqueChallenges: ["variedad enorme de SKUs", "asesoramiento técnico", "competencia de grandes superficies", "crédito a profesionales"],
    followUpTriggers: { "clientes": ["constructores vs hogar"], "servicio": ["asesoría técnica"] }
  },
  libreria_papeleria: { 
    focus: "material escolar, oficina y regalos", 
    keyMetrics: ["ventas en temporada escolar", "clientes institucionales", "variedad de productos", "margen de regalería"], 
    uniqueChallenges: ["estacionalidad escolar extrema", "competencia de grandes cadenas", "digitalización", "listas escolares"],
    followUpTriggers: { "clientes": ["instituciones", "retail"], "operaciones": ["temporada escolar"] }
  },
  jugueteria: { 
    focus: "juegos, juguetes y entretenimiento", 
    keyMetrics: ["ventas navideñas", "ticket promedio", "tendencias de licencias", "experiencia en tienda"], 
    uniqueChallenges: ["estacionalidad extrema", "licencias de moda", "competencia online", "experiencia para niños"],
    followUpTriggers: { "marketing": ["licencias populares"], "operaciones": ["temporada navideña"] }
  },
  deportes_outdoor: { 
    focus: "indumentaria y equipamiento deportivo", 
    keyMetrics: ["ventas por categoría deportiva", "equipamiento vs indumentaria", "clientes de club", "servicio técnico"], 
    uniqueChallenges: ["variedad de deportes", "tallas especiales", "estacionalidad de deportes", "conocimiento técnico"],
    followUpTriggers: { "clientes": ["clubes", "amateur"], "producto": ["deportes principales"] }
  },
  belleza_perfumeria: { 
    focus: "cosmética, skincare y fragancias", 
    keyMetrics: ["ticket promedio", "clientes fidelizadas", "lanzamientos", "asesoramiento personalizado"], 
    uniqueChallenges: ["tendencias de beauty", "fechas de vencimiento", "asesoramiento experto", "sampling"],
    followUpTriggers: { "servicio": ["asesoría de belleza"], "marketing": ["influencers", "demostraciones"] }
  },
  pet_shop: { 
    focus: "mascotas, alimentos y accesorios", 
    keyMetrics: ["clientes recurrentes de alimento", "ticket promedio", "servicios adicionales", "variedad de marcas"], 
    uniqueChallenges: ["fidelización por mascota", "competencia de supermercados", "servicios de grooming", "productos de nicho"],
    followUpTriggers: { "clientes": ["tipos de mascota"], "servicio": ["grooming", "veterinaria"] }
  },
  gourmet_delicatessen: { 
    focus: "productos premium y especiales", 
    keyMetrics: ["ticket alto", "clientes conocedores", "productos importados", "regalos corporativos"], 
    uniqueChallenges: ["sourcing de productos especiales", "educación del cliente", "perecederos premium", "presentación"],
    followUpTriggers: { "producto": ["importados", "locales artesanales"], "clientes": ["conocedores", "regalos"] }
  },
  segunda_mano: { 
    focus: "reventa, consignación y sostenibilidad", 
    keyMetrics: ["productos recibidos", "rotación de inventario", "margen de consignación", "clientes recurrentes"], 
    uniqueChallenges: ["valuación de productos", "calidad variable", "gestión de consignantes", "espacio de almacenamiento"],
    followUpTriggers: { "operaciones": ["consignación vs compra directa"], "marketing": ["sostenibilidad"] }
  },
  ecommerce_d2c: { 
    focus: "venta online directa al consumidor", 
    keyMetrics: ["conversión web", "CAC", "LTV", "tasa de abandono de carrito"], 
    uniqueChallenges: ["tráfico y SEO", "logística de envíos", "devoluciones", "competencia de marketplaces"],
    followUpTriggers: { "tecnologia": ["plataforma ecommerce"], "marketing": ["publicidad digital", "SEO"] }
  },
  seller_marketplace: { 
    focus: "venta en plataformas (MeLi, Amazon)", 
    keyMetrics: ["ventas por marketplace", "posicionamiento", "métricas de seller", "costos de comisión"], 
    uniqueChallenges: ["algoritmos de posicionamiento", "guerra de precios", "logística full", "métricas de reputación"],
    followUpTriggers: { "competencia": ["otros sellers"], "operaciones": ["full vs flex", "inventario"] }
  },
  suscripcion_cajas: { 
    focus: "productos recurrentes por membresía", 
    keyMetrics: ["suscriptores activos", "churn mensual", "LTV", "costo de adquisición"], 
    uniqueChallenges: ["retención de suscriptores", "variedad sin repetir", "logística mensual", "costos de envío"],
    followUpTriggers: { "clientes": ["retención", "cancelaciones"], "producto": ["curaduría de cajas"] }
  },
  mayorista_distribuidor: { 
    focus: "venta B2B por volumen", 
    keyMetrics: ["clientes activos", "ticket promedio B2B", "frecuencia de recompra", "crédito otorgado"], 
    uniqueChallenges: ["gestión de crédito", "logística de volumen", "negociación de precios", "competencia de importadores"],
    followUpTriggers: { "finanzas": ["crédito y cobranza"], "clientes": ["retención de cuentas"] }
  },

  // ========================
  // A4_SALUD - SALUD Y BIENESTAR (18 tipos)
  // ========================
  clinica_policonsultorio: { 
    focus: "atención médica integral", 
    keyMetrics: ["pacientes por día", "ocupación de consultorios", "satisfacción de pacientes", "obras sociales facturadas"], 
    uniqueChallenges: ["gestión de turnos", "cobranza de obras sociales", "retención de profesionales", "normativas sanitarias"],
    followUpTriggers: { "operaciones": ["sistema de turnos"], "finanzas": ["obras sociales", "particulares"] }
  },
  consultorio_medico: { 
    focus: "atención médica especializada", 
    keyMetrics: ["pacientes por jornada", "ticket particular", "obras sociales atendidas", "tasa de seguimiento"], 
    uniqueChallenges: ["captación de pacientes", "gestión de agenda", "actualización profesional", "equipamiento"],
    followUpTriggers: { "marketing": ["derivaciones", "presencia online"], "operaciones": ["gestión de agenda"] }
  },
  centro_odontologico: { 
    focus: "salud dental y tratamientos", 
    keyMetrics: ["tratamientos por mes", "ticket promedio", "planes de tratamiento vendidos", "retorno de pacientes"], 
    uniqueChallenges: ["equipamiento costoso", "materiales de calidad", "seguimiento de tratamientos largos", "fobia dental"],
    followUpTriggers: { "producto": ["tratamientos más rentables"], "finanzas": ["planes de pago"] }
  },
  laboratorio_analisis: { 
    focus: "estudios clínicos y diagnóstico", 
    keyMetrics: ["estudios por día", "tiempo de entrega de resultados", "obras sociales", "precisión y calidad"], 
    uniqueChallenges: ["equipamiento de alta tecnología", "control de calidad", "logística de muestras", "competencia de cadenas"],
    followUpTriggers: { "tecnologia": ["equipamiento", "software"], "operaciones": ["tiempos de entrega"] }
  },
  centro_diagnostico: { 
    focus: "diagnóstico por imágenes", 
    keyMetrics: ["estudios por día", "ocupación de equipos", "tiempo de informes", "derivaciones"], 
    uniqueChallenges: ["inversión en equipos", "radiólogos especializados", "mantenimiento técnico", "turnos eficientes"],
    followUpTriggers: { "finanzas": ["inversión en equipos"], "equipo": ["especialistas"] }
  },
  kinesiologia: { 
    focus: "rehabilitación y recuperación física", 
    keyMetrics: ["sesiones por día", "pacientes en tratamiento", "altas por mes", "satisfacción"], 
    uniqueChallenges: ["adherencia al tratamiento", "equipamiento específico", "seguimiento de evolución", "obras sociales"],
    followUpTriggers: { "servicio": ["protocolos de tratamiento"], "clientes": ["adherencia"] }
  },
  psicologia: { 
    focus: "salud mental y terapia", 
    keyMetrics: ["pacientes activos", "sesiones por semana", "retención de pacientes", "modalidad online vs presencial"], 
    uniqueChallenges: ["gestión de agenda", "burnout del profesional", "confidencialidad", "cobranza"],
    followUpTriggers: { "operaciones": ["modalidad de atención"], "finanzas": ["honorarios", "obras sociales"] }
  },
  nutricion: { 
    focus: "planes alimentarios y salud", 
    keyMetrics: ["pacientes activos", "adherencia a planes", "consultas de seguimiento", "resultados medibles"], 
    uniqueChallenges: ["motivación del paciente", "personalización de planes", "competencia de apps", "seguimiento remoto"],
    followUpTriggers: { "tecnologia": ["apps de seguimiento"], "servicio": ["planes personalizados"] }
  },
  medicina_estetica: { 
    focus: "procedimientos estéticos médicos", 
    keyMetrics: ["procedimientos por mes", "ticket promedio alto", "pacientes recurrentes", "satisfacción"], 
    uniqueChallenges: ["inversión en tecnología", "tendencias estéticas", "seguridad de procedimientos", "resultados visibles"],
    followUpTriggers: { "producto": ["procedimientos más demandados"], "marketing": ["antes/después", "testimonios"] }
  },
  centro_estetica: { 
    focus: "tratamientos faciales y corporales", 
    keyMetrics: ["servicios por día", "ticket promedio", "paquetes vendidos", "clientes recurrentes"], 
    uniqueChallenges: ["capacitación constante", "productos de calidad", "fidelización", "competencia"],
    followUpTriggers: { "servicio": ["tratamientos estrella"], "clientes": ["fidelización"] }
  },
  spa_masajes: { 
    focus: "relax, bienestar y circuitos", 
    keyMetrics: ["servicios por día", "ocupación de cabinas", "paquetes vendidos", "NPS"], 
    uniqueChallenges: ["ambiente de relax", "terapeutas calificados", "productos premium", "experiencia integral"],
    followUpTriggers: { "servicio": ["circuitos más vendidos"], "equipo": ["terapeutas"] }
  },
  gimnasio_fitness: { 
    focus: "entrenamiento y membresías", 
    keyMetrics: ["membresías activas", "tasa de retención", "ocupación por horario", "ingresos adicionales"], 
    uniqueChallenges: ["retención de socios", "mantenimiento de equipos", "instructores motivados", "horarios pico"],
    followUpTriggers: { "clientes": ["retención", "motivos de baja"], "operaciones": ["capacidad por horario"] }
  },
  yoga_pilates: { 
    focus: "clases de bienestar y postura", 
    keyMetrics: ["alumnos activos", "clases por semana", "retención", "instructores"], 
    uniqueChallenges: ["espacio adecuado", "instructores certificados", "variedad de estilos", "competencia de apps"],
    followUpTriggers: { "producto": ["estilos ofrecidos"], "marketing": ["diferenciación"] }
  },
  peluqueria_salon: { 
    focus: "corte, color y styling", 
    keyMetrics: ["clientes por día", "ticket promedio", "productos vendidos", "retención de estilistas"], 
    uniqueChallenges: ["retención de profesionales", "tendencias de moda", "venta de productos", "gestión de agenda"],
    followUpTriggers: { "equipo": ["estilistas", "comisiones"], "producto": ["productos a la venta"] }
  },
  barberia: { 
    focus: "cuidado masculino y estilo", 
    keyMetrics: ["clientes por día", "servicios adicionales", "productos vendidos", "fidelización"], 
    uniqueChallenges: ["ambiente masculino", "barberos hábiles", "tendencias de grooming", "walk-ins vs turnos"],
    followUpTriggers: { "servicio": ["servicios adicionales"], "marketing": ["público objetivo"] }
  },
  manicuria: { 
    focus: "uñas, nail art y cuidado", 
    keyMetrics: ["servicios por día", "ticket promedio", "clientes recurrentes", "tendencias de diseño"], 
    uniqueChallenges: ["higiene estricta", "tendencias de nail art", "productos de calidad", "fidelización"],
    followUpTriggers: { "servicio": ["servicios más pedidos"], "operaciones": ["protocolos de higiene"] }
  },
  depilacion: { 
    focus: "depilación láser y tradicional", 
    keyMetrics: ["sesiones por día", "packs vendidos", "retorno para mantenimiento", "tecnología utilizada"], 
    uniqueChallenges: ["inversión en equipos láser", "protocolos de seguridad", "competencia de precios", "resultados prometidos"],
    followUpTriggers: { "tecnologia": ["tipo de láser"], "marketing": ["garantías de resultado"] }
  },
  optica: { 
    focus: "lentes, exámenes y contactología", 
    keyMetrics: ["lentes vendidos", "exámenes por día", "ticket promedio", "obras sociales"], 
    uniqueChallenges: ["stock de armazones variado", "profesionales optómetras", "competencia online", "obras sociales"],
    followUpTriggers: { "producto": ["marcas de armazones"], "servicio": ["exámenes en local"] }
  },

  // ========================
  // A5_EDUCACION - EDUCACIÓN (18 tipos)
  // ========================
  jardin_inicial: { 
    focus: "primera infancia y cuidado educativo", 
    keyMetrics: ["matrícula activa", "ratio alumno/docente", "satisfacción de padres", "retención anual"], 
    uniqueChallenges: ["confianza de los padres", "personal capacitado", "seguridad infantil", "normativas estrictas"],
    followUpTriggers: { "equipo": ["docentes", "ratio"], "operaciones": ["seguridad", "alimentación"] }
  },
  escuela_primaria_secundaria: { 
    focus: "educación formal K-12", 
    keyMetrics: ["matrícula", "retención anual", "resultados académicos", "participación de familias"], 
    uniqueChallenges: ["calidad docente", "infraestructura", "competencia de colegios", "adaptación curricular"],
    followUpTriggers: { "equipo": ["plantel docente"], "marketing": ["diferenciación educativa"] }
  },
  terciario_instituto: { 
    focus: "formación técnica y carreras cortas", 
    keyMetrics: ["inscriptos por carrera", "tasa de graduación", "inserción laboral", "convenios con empresas"], 
    uniqueChallenges: ["actualización de contenidos", "docentes con experiencia práctica", "empleabilidad", "competencia de universidades"],
    followUpTriggers: { "producto": ["carreras más demandadas"], "clientes": ["inserción laboral"] }
  },
  universidad_posgrado: { 
    focus: "educación superior y especialización", 
    keyMetrics: ["matrícula por programa", "investigación publicada", "empleabilidad de egresados", "rankings"], 
    uniqueChallenges: ["investigación y docencia", "acreditaciones", "internacionalización", "competencia global"],
    followUpTriggers: { "producto": ["programas diferenciadores"], "marketing": ["posicionamiento académico"] }
  },
  instituto_idiomas: { 
    focus: "enseñanza de idiomas", 
    keyMetrics: ["alumnos activos por idioma", "niveles completados", "certificaciones logradas", "retención"], 
    uniqueChallenges: ["profesores nativos/certificados", "metodología efectiva", "competencia de apps", "grupos por nivel"],
    followUpTriggers: { "producto": ["idiomas ofrecidos"], "servicio": ["modalidad de clases"] }
  },
  apoyo_escolar: { 
    focus: "refuerzo educativo personalizado", 
    keyMetrics: ["alumnos activos", "mejora en calificaciones", "horas semanales", "satisfacción de padres"], 
    uniqueChallenges: ["personalización real", "coordinación con escuela", "motivación del alumno", "resultados medibles"],
    followUpTriggers: { "servicio": ["materias más demandadas"], "clientes": ["seguimiento de resultados"] }
  },
  preparacion_examenes: { 
    focus: "preparación para exámenes de ingreso", 
    keyMetrics: ["alumnos por examen objetivo", "tasa de aprobación", "satisfacción", "referidos"], 
    uniqueChallenges: ["contenido actualizado", "presión de resultados", "estacionalidad de exámenes", "metodología efectiva"],
    followUpTriggers: { "producto": ["exámenes objetivo"], "marketing": ["tasa de éxito"] }
  },
  programacion_tech: { 
    focus: "habilidades tech y empleabilidad", 
    keyMetrics: ["alumnos por programa", "tasa de empleo post-curso", "proyectos completados", "NPS"], 
    uniqueChallenges: ["contenido actualizado rápidamente", "instructores con experiencia real", "empleabilidad real", "competencia de bootcamps"],
    followUpTriggers: { "producto": ["tecnologías enseñadas"], "clientes": ["inserción laboral"] }
  },
  diseno_creatividad: { 
    focus: "diseño gráfico, UX y creatividad", 
    keyMetrics: ["alumnos activos", "portafolios generados", "inserción laboral", "proyectos reales"], 
    uniqueChallenges: ["software actualizado", "proyectos con clientes reales", "tendencias de diseño", "portafolio profesional"],
    followUpTriggers: { "producto": ["especializaciones"], "servicio": ["proyectos reales"] }
  },
  marketing_negocios: { 
    focus: "marketing digital y emprendimiento", 
    keyMetrics: ["alumnos activos", "negocios lanzados", "métricas de campañas de alumnos", "testimonios"], 
    uniqueChallenges: ["contenido actualizado", "casos reales", "herramientas cambiantes", "resultados medibles"],
    followUpTriggers: { "producto": ["temas más demandados"], "servicio": ["práctica real"] }
  },
  cursos_oficios: { 
    focus: "formación técnica y manual", 
    keyMetrics: ["alumnos por oficio", "tasa de empleo", "práctica real", "materiales incluidos"], 
    uniqueChallenges: ["talleres equipados", "práctica suficiente", "inserción laboral", "materiales costosos"],
    followUpTriggers: { "producto": ["oficios más demandados"], "operaciones": ["equipamiento de taller"] }
  },
  capacitacion_corporativa: { 
    focus: "formación para empresas", 
    keyMetrics: ["empresas cliente", "horas de capacitación", "satisfacción de RRHH", "recurrencia"], 
    uniqueChallenges: ["contenido a medida", "disponibilidad horaria", "medición de impacto", "competencia de consultoras"],
    followUpTriggers: { "clientes": ["sectores cliente"], "producto": ["temas más solicitados"] }
  },
  elearning_plataforma: { 
    focus: "cursos digitales escalables", 
    keyMetrics: ["usuarios activos", "tasa de completación", "MRR", "NPS"], 
    uniqueChallenges: ["retención de usuarios", "producción de contenido", "plataforma tecnológica", "engagement"],
    followUpTriggers: { "tecnologia": ["plataforma utilizada"], "marketing": ["adquisición de usuarios"] }
  },
  clases_particulares: { 
    focus: "tutoría personalizada 1:1", 
    keyMetrics: ["alumnos activos", "horas semanales", "resultados de alumnos", "referidos"], 
    uniqueChallenges: ["gestión de agenda", "personalización real", "resultados medibles", "pricing por hora"],
    followUpTriggers: { "servicio": ["materias ofrecidas"], "operaciones": ["modalidad online/presencial"] }
  },
  artes_escenicas: { 
    focus: "teatro, actuación y expresión", 
    keyMetrics: ["alumnos activos", "producciones anuales", "inserción profesional", "clases por semana"], 
    uniqueChallenges: ["espacio de ensayo", "docentes profesionales", "montaje de obras", "mercado laboral artístico"],
    followUpTriggers: { "producto": ["disciplinas ofrecidas"], "servicio": ["producciones propias"] }
  },
  academia_musica: { 
    focus: "instrumentos, canto y teoría musical", 
    keyMetrics: ["alumnos por instrumento", "retención anual", "presentaciones", "exámenes aprobados"], 
    uniqueChallenges: ["instrumentos disponibles", "profesores por instrumento", "insonorización", "motivación del alumno"],
    followUpTriggers: { "producto": ["instrumentos más demandados"], "servicio": ["clases individuales vs grupales"] }
  },
  academia_danza: { 
    focus: "estilos de baile y expresión corporal", 
    keyMetrics: ["alumnos por estilo", "retención", "presentaciones anuales", "clases por semana"], 
    uniqueChallenges: ["espacio adecuado", "profesores por estilo", "vestuario y producciones", "competencia"],
    followUpTriggers: { "producto": ["estilos más populares"], "servicio": ["presentaciones"] }
  },
  academia_deportiva: { 
    focus: "entrenamiento deportivo por disciplina", 
    keyMetrics: ["deportistas activos", "competencias participadas", "resultados deportivos", "instalaciones"], 
    uniqueChallenges: ["instalaciones deportivas", "entrenadores calificados", "competencia con clubes", "equipamiento"],
    followUpTriggers: { "producto": ["deportes ofrecidos"], "operaciones": ["instalaciones propias/alquiladas"] }
  },

  // ========================
  // A6_B2B - SERVICIOS PROFESIONALES (18 tipos)
  // ========================
  consultoria_estrategica: { 
    focus: "asesoría de dirección y estrategia", 
    keyMetrics: ["clientes activos", "proyectos anuales", "fee promedio", "recurrencia de clientes"], 
    uniqueChallenges: ["venta consultiva", "entrega de valor medible", "retención de consultores", "diferenciación"],
    followUpTriggers: { "clientes": ["industrias atendidas"], "servicio": ["metodologías propias"] }
  },
  consultoria_comercial: { 
    focus: "ventas, procesos y resultados comerciales", 
    keyMetrics: ["clientes activos", "mejoras en ventas de clientes", "proyectos cerrados", "referidos"], 
    uniqueChallenges: ["demostrar ROI", "implementación de cambios", "resistencia al cambio", "medición de resultados"],
    followUpTriggers: { "servicio": ["áreas de especialización"], "clientes": ["tamaño de empresas atendidas"] }
  },
  agencia_marketing: { 
    focus: "campañas, performance y crecimiento", 
    keyMetrics: ["clientes activos", "inversión gestionada", "ROAS promedio", "retención de cuentas"], 
    uniqueChallenges: ["resultados medibles", "creatividad constante", "herramientas cambiantes", "retención de talento"],
    followUpTriggers: { "servicio": ["servicios core"], "tecnologia": ["herramientas utilizadas"] }
  },
  branding_diseno: { 
    focus: "identidad visual y comunicación de marca", 
    keyMetrics: ["proyectos anuales", "ticket promedio", "clientes de retainer", "portfolio"], 
    uniqueChallenges: ["diferenciación creativa", "gestión de expectativas", "pricing de creatividad", "tendencias de diseño"],
    followUpTriggers: { "servicio": ["especialización"], "clientes": ["sectores atendidos"] }
  },
  desarrollo_software: { 
    focus: "desarrollo de apps, sistemas y productos", 
    keyMetrics: ["proyectos activos", "horas facturadas", "satisfacción de clientes", "retención de developers"], 
    uniqueChallenges: ["estimaciones precisas", "cambios de alcance", "talento tech escaso", "tecnologías cambiantes"],
    followUpTriggers: { "tecnologia": ["stack principal"], "operaciones": ["metodología de desarrollo"] }
  },
  servicios_it: { 
    focus: "infraestructura, soporte y redes", 
    keyMetrics: ["clientes con contrato", "tickets resueltos", "SLA cumplido", "ingresos recurrentes"], 
    uniqueChallenges: ["disponibilidad 24/7", "actualización constante", "ciberseguridad", "competencia de precios"],
    followUpTriggers: { "servicio": ["servicios principales"], "clientes": ["tamaño de clientes"] }
  },
  ciberseguridad: { 
    focus: "protección, auditorías y prevención", 
    keyMetrics: ["clientes protegidos", "auditorías realizadas", "incidentes prevenidos", "certificaciones"], 
    uniqueChallenges: ["amenazas cambiantes", "personal altamente especializado", "regulaciones", "concientización"],
    followUpTriggers: { "servicio": ["servicios core"], "tecnologia": ["herramientas y certificaciones"] }
  },
  estudio_contable: { 
    focus: "contabilidad, impuestos y gestión", 
    keyMetrics: ["clientes activos", "declaraciones mensuales", "retención anual", "fee promedio"], 
    uniqueChallenges: ["normativas cambiantes", "deadlines estrictos", "competencia de precio", "automatización"],
    followUpTriggers: { "tecnologia": ["software utilizado"], "clientes": ["tamaño de clientes"] }
  },
  estudio_juridico: { 
    focus: "asesoría legal y representación", 
    keyMetrics: ["casos activos", "horas facturables", "tasa de éxito", "clientes de retainer"], 
    uniqueChallenges: ["captación de casos", "gestión de tiempo", "actualización legal", "cobro de honorarios"],
    followUpTriggers: { "servicio": ["áreas de especialización"], "clientes": ["tipo de clientes"] }
  },
  rrhh_reclutamiento: { 
    focus: "búsqueda de talento y selección", 
    keyMetrics: ["posiciones cubiertas", "tiempo de cobertura", "retención de contratados", "clientes activos"], 
    uniqueChallenges: ["mercado laboral cambiante", "expectativas de candidatos", "ghosting", "competencia de plataformas"],
    followUpTriggers: { "servicio": ["sectores especializados"], "tecnologia": ["herramientas de búsqueda"] }
  },
  capacitacion_empresarial: { 
    focus: "formación corporativa y desarrollo", 
    keyMetrics: ["empresas cliente", "horas impartidas", "participantes", "NPS post-capacitación"], 
    uniqueChallenges: ["contenido a medida", "medición de impacto", "formadores calificados", "disponibilidad de agendas"],
    followUpTriggers: { "producto": ["temas especializados"], "servicio": ["modalidad presencial/virtual"] }
  },
  asesoria_financiera: { 
    focus: "planificación financiera y estructura", 
    keyMetrics: ["clientes activos", "AUM", "fee promedio", "retención de clientes"], 
    uniqueChallenges: ["regulaciones", "confianza del cliente", "resultados en mercados volátiles", "educación financiera"],
    followUpTriggers: { "clientes": ["perfil de clientes"], "servicio": ["productos ofrecidos"] }
  },
  seguros_broker: { 
    focus: "coberturas, pólizas y gestión de riesgos", 
    keyMetrics: ["pólizas vigentes", "prima anual", "renovaciones", "siniestros gestionados"], 
    uniqueChallenges: ["competencia de precio", "renovaciones", "siniestros complejos", "regulación"],
    followUpTriggers: { "producto": ["ramos principales"], "clientes": ["empresas vs particulares"] }
  },
  investigacion_mercado: { 
    focus: "insights, estudios y análisis de mercado", 
    keyMetrics: ["estudios realizados", "clientes activos", "metodologías", "fee promedio"], 
    uniqueChallenges: ["calidad de datos", "metodologías actualizadas", "insights accionables", "competencia de herramientas DIY"],
    followUpTriggers: { "servicio": ["metodologías utilizadas"], "clientes": ["industrias atendidas"] }
  },
  produccion_audiovisual: { 
    focus: "contenido, video y fotografía profesional", 
    keyMetrics: ["proyectos anuales", "ticket promedio", "clientes recurrentes", "equipamiento"], 
    uniqueChallenges: ["equipamiento costoso", "creatividad constante", "logística de producciones", "competencia de freelancers"],
    followUpTriggers: { "servicio": ["tipos de producción"], "tecnologia": ["equipamiento propio"] }
  },
  traduccion_localizacion: { 
    focus: "traducciones profesionales y adaptación", 
    keyMetrics: ["palabras traducidas", "idiomas cubiertos", "clientes activos", "traductores en red"], 
    uniqueChallenges: ["calidad y consistencia", "deadlines ajustados", "herramientas CAT", "competencia de IA"],
    followUpTriggers: { "servicio": ["pares de idiomas"], "tecnologia": ["herramientas utilizadas"] }
  },
  limpieza_facility: { 
    focus: "servicios de limpieza para empresas", 
    keyMetrics: ["contratos activos", "m² gestionados", "rotación de personal", "satisfacción de clientes"], 
    uniqueChallenges: ["gestión de personal operativo", "productos y equipos", "horarios flexibles", "competencia de precio"],
    followUpTriggers: { "operaciones": ["tipo de instalaciones"], "equipo": ["personal operativo"] }
  },
  outsourcing_backoffice: { 
    focus: "tercerización de procesos y soporte", 
    keyMetrics: ["agentes activos", "SLA cumplido", "clientes activos", "tickets/llamadas gestionados"], 
    uniqueChallenges: ["calidad de atención", "rotación de personal", "tecnología", "horarios extendidos"],
    followUpTriggers: { "servicio": ["procesos tercerizados"], "tecnologia": ["sistemas utilizados"] }
  },

  // ========================
  // A7_HOGAR - SERVICIOS DEL HOGAR (18 tipos)
  // ========================
  plomeria: { 
    focus: "instalaciones sanitarias y reparaciones", 
    keyMetrics: ["trabajos por semana", "ticket promedio", "clientes recurrentes", "urgencias atendidas"], 
    uniqueChallenges: ["disponibilidad para urgencias", "repuestos en stock", "pricing de emergencias", "confianza del cliente"],
    followUpTriggers: { "operaciones": ["urgencias vs programados"], "marketing": ["captación de clientes"] }
  },
  electricidad: { 
    focus: "instalaciones eléctricas y reparaciones", 
    keyMetrics: ["trabajos por semana", "ticket promedio", "certificaciones", "clientes empresa vs hogar"], 
    uniqueChallenges: ["normativas de seguridad", "certificaciones vigentes", "urgencias", "competencia"],
    followUpTriggers: { "clientes": ["hogares vs empresas"], "servicio": ["certificaciones"] }
  },
  gasista: { 
    focus: "instalaciones de gas y seguridad", 
    keyMetrics: ["instalaciones por mes", "revisiones obligatorias", "certificaciones", "urgencias"], 
    uniqueChallenges: ["regulaciones estrictas", "responsabilidad legal", "certificaciones", "estacionalidad"],
    followUpTriggers: { "servicio": ["tipos de trabajos"], "operaciones": ["certificaciones requeridas"] }
  },
  aire_acondicionado: { 
    focus: "climatización, instalación y service", 
    keyMetrics: ["instalaciones por mes", "services programados", "ticket promedio", "estacionalidad"], 
    uniqueChallenges: ["estacionalidad extrema", "stock de equipos", "técnicos capacitados", "competencia de grandes cadenas"],
    followUpTriggers: { "operaciones": ["temporada alta/baja"], "producto": ["marcas trabajadas"] }
  },
  reparacion_electrodomesticos: { 
    focus: "reparación de línea blanca y electrónica", 
    keyMetrics: ["reparaciones por semana", "marcas especializadas", "repuestos en stock", "garantía de trabajo"], 
    uniqueChallenges: ["acceso a repuestos", "diagnóstico correcto", "competencia de servicio oficial", "obsolescencia"],
    followUpTriggers: { "producto": ["marcas especializadas"], "operaciones": ["repuestos en stock"] }
  },
  soporte_tecnico_hogar: { 
    focus: "soporte de PC, redes y tecnología", 
    keyMetrics: ["clientes atendidos", "ticket promedio", "tiempo de resolución", "clientes recurrentes"], 
    uniqueChallenges: ["diversidad de problemas", "actualización constante", "competencia de precios", "soporte remoto"],
    followUpTriggers: { "servicio": ["servicios principales"], "tecnologia": ["remoto vs presencial"] }
  },
  pintura: { 
    focus: "pintura de interiores y exteriores", 
    keyMetrics: ["proyectos por mes", "m² pintados", "clientes recurrentes", "presupuestos cerrados"], 
    uniqueChallenges: ["estimaciones precisas", "calidad de acabado", "tiempos de obra", "clima"],
    followUpTriggers: { "servicio": ["residencial vs comercial"], "operaciones": ["equipo de trabajo"] }
  },
  albanileria: { 
    focus: "construcción menor y refacciones", 
    keyMetrics: ["proyectos por mes", "ticket promedio", "duración de obras", "referidos"], 
    uniqueChallenges: ["estimaciones de tiempo", "gestión de materiales", "personal de obra", "imprevistos"],
    followUpTriggers: { "servicio": ["tipos de trabajos"], "operaciones": ["equipo propio"] }
  },
  carpinteria: { 
    focus: "muebles a medida y trabajos en madera", 
    keyMetrics: ["proyectos por mes", "ticket promedio", "trabajos a medida vs standar", "tiempo de entrega"], 
    uniqueChallenges: ["materia prima", "diseño personalizado", "tiempos de producción", "logística de entrega"],
    followUpTriggers: { "producto": ["tipos de trabajos"], "operaciones": ["taller propio"] }
  },
  herreria: { 
    focus: "estructuras metálicas y herrería", 
    keyMetrics: ["proyectos por mes", "tipo de trabajos", "ticket promedio", "tiempo de entrega"], 
    uniqueChallenges: ["materia prima fluctuante", "equipamiento pesado", "instalación", "competencia"],
    followUpTriggers: { "producto": ["tipos de trabajos"], "operaciones": ["taller equipado"] }
  },
  vidrieria: { 
    focus: "cristales, ventanas y cerramientos", 
    keyMetrics: ["trabajos por mes", "ticket promedio", "urgencias", "proveedores de vidrio"], 
    uniqueChallenges: ["manipulación de material frágil", "mediciones precisas", "instalación", "urgencias"],
    followUpTriggers: { "servicio": ["residencial vs comercial"], "operaciones": ["stock de vidrios"] }
  },
  cerrajeria: { 
    focus: "cerraduras, llaves y seguridad", 
    keyMetrics: ["trabajos por día", "urgencias", "ticket promedio", "zona de cobertura"], 
    uniqueChallenges: ["disponibilidad 24/7", "stock de cerraduras", "confianza del cliente", "competencia"],
    followUpTriggers: { "operaciones": ["urgencias 24hs"], "servicio": ["tipos de cerraduras"] }
  },
  jardineria: { 
    focus: "mantenimiento de jardines y paisajismo", 
    keyMetrics: ["clientes mensuales fijos", "ticket promedio", "frecuencia de visitas", "equipamiento"], 
    uniqueChallenges: ["estacionalidad", "personal de campo", "equipamiento", "clima"],
    followUpTriggers: { "clientes": ["residencial vs comercial"], "servicio": ["mantenimiento vs proyectos"] }
  },
  piscinas: { 
    focus: "mantenimiento y construcción de piscinas", 
    keyMetrics: ["piscinas en mantenimiento", "construcciones por año", "ticket mensual", "estacionalidad"], 
    uniqueChallenges: ["estacionalidad extrema", "químicos y equipos", "personal especializado", "construcción"],
    followUpTriggers: { "servicio": ["mantenimiento vs construcción"], "operaciones": ["temporada"] }
  },
  control_plagas: { 
    focus: "fumigación y control de plagas", 
    keyMetrics: ["clientes mensuales", "servicios por mes", "contratos anuales", "efectividad"], 
    uniqueChallenges: ["productos regulados", "certificaciones", "seguridad", "seguimiento"],
    followUpTriggers: { "clientes": ["residencial vs comercial"], "servicio": ["tipos de plagas"] }
  },
  limpieza_hogar: { 
    focus: "limpieza residencial recurrente", 
    keyMetrics: ["hogares atendidos", "frecuencia promedio", "ticket por visita", "retención"], 
    uniqueChallenges: ["personal de confianza", "rotación", "productos de limpieza", "horarios flexibles"],
    followUpTriggers: { "operaciones": ["personal propio vs terceros"], "servicio": ["frecuencia más común"] }
  },
  mudanzas_traslados: { 
    focus: "fletes, mudanzas y logística", 
    keyMetrics: ["mudanzas por mes", "ticket promedio", "distancia promedio", "daños reportados"], 
    uniqueChallenges: ["personal de carga", "vehículos", "seguros", "logística"],
    followUpTriggers: { "operaciones": ["flota propia"], "servicio": ["locales vs larga distancia"] }
  },
  seguridad_hogar: { 
    focus: "alarmas, cámaras y monitoreo", 
    keyMetrics: ["instalaciones por mes", "clientes monitoreados", "ticket mensual", "incidentes atendidos"], 
    uniqueChallenges: ["tecnología actualizada", "monitoreo 24/7", "respuesta a incidentes", "competencia de grandes"],
    followUpTriggers: { "tecnologia": ["sistemas utilizados"], "servicio": ["monitoreo propio"] }
  },

  // ========================
  // A8_CONSTRUCCION - CONSTRUCCIÓN E INMOBILIARIO (18 tipos)
  // ========================
  constructora: { 
    focus: "ejecución de obras nuevas", 
    keyMetrics: ["obras en ejecución", "m² construidos", "cumplimiento de plazos", "margen por obra"], 
    uniqueChallenges: ["gestión de proyectos", "subcontratistas", "materiales fluctuantes", "permisos"],
    followUpTriggers: { "operaciones": ["capacidad de obras"], "finanzas": ["flujo de caja"] }
  },
  desarrolladora_inmobiliaria: { 
    focus: "desarrollo de proyectos inmobiliarios", 
    keyMetrics: ["unidades en desarrollo", "velocidad de venta", "m² desarrollados", "ROI por proyecto"], 
    uniqueChallenges: ["financiamiento", "permisos y habilitaciones", "comercialización", "riesgo de mercado"],
    followUpTriggers: { "finanzas": ["estructura de financiamiento"], "marketing": ["estrategia de venta"] }
  },
  estudio_arquitectura: { 
    focus: "diseño arquitectónico y dirección de obra", 
    keyMetrics: ["proyectos activos", "m² diseñados", "fee promedio", "clientes recurrentes"], 
    uniqueChallenges: ["gestión de expectativas", "cambios del cliente", "dirección de obra", "cobro de honorarios"],
    followUpTriggers: { "servicio": ["tipos de proyectos"], "operaciones": ["equipo de arquitectos"] }
  },
  ingenieria_estructuras: { 
    focus: "cálculo estructural y supervisión técnica", 
    keyMetrics: ["proyectos calculados", "obras supervisadas", "fee promedio", "certificaciones"], 
    uniqueChallenges: ["responsabilidad técnica", "software especializado", "normativas", "seguros"],
    followUpTriggers: { "tecnologia": ["software utilizado"], "servicio": ["tipos de estructuras"] }
  },
  obras_civiles: { 
    focus: "infraestructura y obras públicas", 
    keyMetrics: ["contratos activos", "facturación anual", "cumplimiento de plazos", "licitaciones ganadas"], 
    uniqueChallenges: ["licitaciones públicas", "financiamiento de obra", "escala de proyectos", "política"],
    followUpTriggers: { "clientes": ["público vs privado"], "operaciones": ["capacidad de obra"] }
  },
  remodelaciones: { 
    focus: "renovación y mejora de espacios", 
    keyMetrics: ["proyectos por mes", "ticket promedio", "duración promedio", "referidos"], 
    uniqueChallenges: ["estimaciones precisas", "sorpresas en obra", "convivencia con cliente", "subcontratistas"],
    followUpTriggers: { "servicio": ["residencial vs comercial"], "operaciones": ["equipos especializados"] }
  },
  instalaciones_obra: { 
    focus: "instalaciones sanitarias/eléctricas en obra", 
    keyMetrics: ["obras atendidas", "facturación mensual", "cumplimiento de plazos", "constructoras cliente"], 
    uniqueChallenges: ["coordinación con obra civil", "normativas", "materiales", "personal especializado"],
    followUpTriggers: { "servicio": ["especialización"], "clientes": ["constructoras recurrentes"] }
  },
  mantenimiento_edilicio: { 
    focus: "mantenimiento de edificios y consorcios", 
    keyMetrics: ["edificios atendidos", "contratos mensuales", "emergencias atendidas", "satisfacción"], 
    uniqueChallenges: ["diversidad de problemas", "disponibilidad", "consorcios exigentes", "competencia"],
    followUpTriggers: { "clientes": ["consorcios vs empresas"], "operaciones": ["personal disponible"] }
  },
  inmobiliaria_residencial: { 
    focus: "compra-venta de propiedades residenciales", 
    keyMetrics: ["operaciones cerradas", "propiedades en cartera", "comisión promedio", "días en venta"], 
    uniqueChallenges: ["captación de propiedades", "ciclos de mercado", "competencia online", "financiamiento de compradores"],
    followUpTriggers: { "marketing": ["captación de propiedades"], "operaciones": ["zonas de cobertura"] }
  },
  inmobiliaria_comercial: { 
    focus: "locales comerciales y oficinas", 
    keyMetrics: ["operaciones cerradas", "m² comercializados", "clientes corporativos", "contratos de alquiler"], 
    uniqueChallenges: ["ciclos económicos", "negociación corporativa", "contratos largos", "comisiones menores"],
    followUpTriggers: { "clientes": ["tipo de empresas"], "servicio": ["venta vs alquiler"] }
  },
  administracion_alquileres: { 
    focus: "gestión de propiedades en alquiler", 
    keyMetrics: ["propiedades administradas", "tasa de ocupación", "cobranza efectiva", "rotación de inquilinos"], 
    uniqueChallenges: ["cobranza morosa", "mantenimiento", "conflictos propietario-inquilino", "regulación"],
    followUpTriggers: { "operaciones": ["gestión de cobranza"], "servicio": ["mantenimiento incluido"] }
  },
  gestion_consorcios: { 
    focus: "administración de edificios", 
    keyMetrics: ["consorcios administrados", "unidades totales", "satisfacción de copropietarios", "cobranza de expensas"], 
    uniqueChallenges: ["asambleas", "morosos", "proveedores de mantenimiento", "conflictos vecinales"],
    followUpTriggers: { "operaciones": ["cobranza de expensas"], "servicio": ["proveedores de servicios"] }
  },
  property_management: { 
    focus: "gestión integral de activos inmobiliarios", 
    keyMetrics: ["m² gestionados", "ocupación promedio", "NOI de propiedades", "clientes institucionales"], 
    uniqueChallenges: ["reporting a inversores", "optimización de gastos", "renovaciones de contratos", "capex"],
    followUpTriggers: { "clientes": ["tipo de inversores"], "servicio": ["asset management incluido"] }
  },
  lotes_terrenos: { 
    focus: "venta de lotes y desarrollo de tierra", 
    keyMetrics: ["lotes vendidos", "desarrollos activos", "m² comercializados", "velocidad de venta"], 
    uniqueChallenges: ["permisos de loteo", "infraestructura", "financiamiento de compradores", "ubicaciones"],
    followUpTriggers: { "producto": ["tipo de desarrollos"], "marketing": ["estrategia de venta"] }
  },
  tasacion_peritaje: { 
    focus: "valuación de propiedades y pericias", 
    keyMetrics: ["tasaciones por mes", "fee promedio", "clientes institucionales", "tipos de propiedades"], 
    uniqueChallenges: ["metodología de valuación", "conocimiento del mercado", "responsabilidad legal", "competencia"],
    followUpTriggers: { "clientes": ["bancos vs particulares"], "servicio": ["tipos de propiedades"] }
  },
  seguridad_higiene_obra: { 
    focus: "seguridad laboral en construcción", 
    keyMetrics: ["obras asesoradas", "accidentes cero", "inspecciones realizadas", "capacitaciones"], 
    uniqueChallenges: ["cumplimiento normativo", "cultura de seguridad", "documentación", "responsabilidad"],
    followUpTriggers: { "servicio": ["asesoría vs supervisión"], "clientes": ["constructoras cliente"] }
  },
  interiorismo: { 
    focus: "diseño de interiores y ambientación", 
    keyMetrics: ["proyectos anuales", "ticket promedio", "proveedores en red", "clientes recurrentes"], 
    uniqueChallenges: ["gestión de expectativas", "proveedores confiables", "tendencias", "presupuestos"],
    followUpTriggers: { "servicio": ["residencial vs comercial"], "producto": ["estilo predominante"] }
  },
  paisajismo: { 
    focus: "diseño de espacios verdes y exteriores", 
    keyMetrics: ["proyectos anuales", "m² diseñados", "mantenimiento post-obra", "proveedores"], 
    uniqueChallenges: ["clima y especies locales", "riego y mantenimiento", "presupuestos de plantas", "tiempos de crecimiento"],
    followUpTriggers: { "servicio": ["diseño vs mantenimiento"], "clientes": ["residencial vs comercial"] }
  },

  // ========================
  // A9_LOGISTICA - TRANSPORTE Y LOGÍSTICA (18 tipos)
  // ========================
  mensajeria_urbana: { 
    focus: "envíos rápidos en ciudad", 
    keyMetrics: ["entregas diarias", "tiempo promedio", "zona de cobertura", "tasa de éxito"], 
    uniqueChallenges: ["tráfico urbano", "coordinación de mensajeros", "tecnología de tracking", "competencia de apps"],
    followUpTriggers: { "tecnologia": ["app de gestión"], "operaciones": ["flota propia vs freelance"] }
  },
  courier_nacional: { 
    focus: "paquetería a todo el país", 
    keyMetrics: ["envíos mensuales", "tiempo de entrega", "tasa de siniestros", "red de sucursales"], 
    uniqueChallenges: ["capilaridad nacional", "última milla rural", "tracking confiable", "competencia de grandes"],
    followUpTriggers: { "operaciones": ["red de sucursales"], "tecnologia": ["sistema de tracking"] }
  },
  logistica_ecommerce: { 
    focus: "fulfillment para e-commerce", 
    keyMetrics: ["pedidos procesados", "tiempo de preparación", "precisión de picking", "clientes activos"], 
    uniqueChallenges: ["picos de demanda", "integración con plataformas", "devoluciones", "costos de almacenamiento"],
    followUpTriggers: { "tecnologia": ["WMS utilizado"], "clientes": ["tamaño de sellers"] }
  },
  ultima_milla: { 
    focus: "distribución final al consumidor", 
    keyMetrics: ["entregas diarias", "tasa de éxito primer intento", "costo por entrega", "NPS"], 
    uniqueChallenges: ["coordinación de ventanas horarias", "intentos fallidos", "devoluciones", "conductores"],
    followUpTriggers: { "operaciones": ["flota propia vs terceros"], "tecnologia": ["optimización de rutas"] }
  },
  transporte_carga: { 
    focus: "fletes y carga general", 
    keyMetrics: ["viajes por mes", "toneladas transportadas", "km recorridos", "utilización de flota"], 
    uniqueChallenges: ["combustible", "mantenimiento de flota", "conductores", "regulaciones"],
    followUpTriggers: { "operaciones": ["flota propia"], "clientes": ["tipo de carga"] }
  },
  transporte_refrigerado: { 
    focus: "cadena de frío y perecederos", 
    keyMetrics: ["viajes por mes", "control de temperatura", "clientes de alimentos", "certificaciones"], 
    uniqueChallenges: ["cadena de frío ininterrumpida", "equipos refrigerantes", "regulaciones sanitarias", "costos operativos"],
    followUpTriggers: { "tecnologia": ["monitoreo de temperatura"], "clientes": ["industrias atendidas"] }
  },
  cargas_peligrosas: { 
    focus: "transporte de materiales especiales", 
    keyMetrics: ["viajes por mes", "cero accidentes", "certificaciones vigentes", "seguros"], 
    uniqueChallenges: ["regulaciones estrictas", "capacitación especial", "seguros costosos", "documentación"],
    followUpTriggers: { "servicio": ["tipos de cargas"], "operaciones": ["certificaciones"] }
  },
  fletes_mudanzas: { 
    focus: "mudanzas y traslados", 
    keyMetrics: ["mudanzas por mes", "ticket promedio", "daños reportados", "satisfacción"], 
    uniqueChallenges: ["personal de carga", "embalaje profesional", "seguros", "logística de día"],
    followUpTriggers: { "servicio": ["residencial vs empresarial"], "operaciones": ["flota propia"] }
  },
  deposito_almacenaje: { 
    focus: "almacenamiento y distribución", 
    keyMetrics: ["m² ocupados", "rotación de inventario", "picking por día", "clientes activos"], 
    uniqueChallenges: ["optimización de espacio", "control de inventario", "seguridad", "costos fijos"],
    followUpTriggers: { "operaciones": ["WMS utilizado"], "servicio": ["valor agregado"] }
  },
  freight_forwarder: { 
    focus: "comercio exterior y coordinación", 
    keyMetrics: ["operaciones por mes", "contenedores gestionados", "tiempos de tránsito", "clientes activos"], 
    uniqueChallenges: ["documentación de comercio exterior", "coordinación multimodal", "regulaciones cambiantes", "tipos de cambio"],
    followUpTriggers: { "servicio": ["rutas principales"], "clientes": ["industrias atendidas"] }
  },
  despachante_aduana: { 
    focus: "gestión aduanera y documentación", 
    keyMetrics: ["despachos por mes", "tiempo de liberación", "clientes activos", "tasa de observaciones"], 
    uniqueChallenges: ["regulaciones cambiantes", "documentación perfecta", "relación con aduana", "tiempos críticos"],
    followUpTriggers: { "servicio": ["tipos de operaciones"], "clientes": ["industrias atendidas"] }
  },
  taxi_remis: { 
    focus: "transporte urbano de pasajeros", 
    keyMetrics: ["viajes por día", "ticket promedio", "zonas de operación", "conductores activos"], 
    uniqueChallenges: ["competencia de apps", "regulación de licencias", "seguridad", "costos de combustible"],
    followUpTriggers: { "operaciones": ["flota propia vs choferes"], "tecnologia": ["app de gestión"] }
  },
  flota_app: { 
    focus: "operación de flota en plataformas", 
    keyMetrics: ["conductores activos", "viajes por conductor", "rating promedio", "ingresos por conductor"], 
    uniqueChallenges: ["retención de conductores", "costos de vehículos", "métricas de plataforma", "seguros"],
    followUpTriggers: { "operaciones": ["gestión de conductores"], "finanzas": ["modelo de negocio"] }
  },
  transporte_turistico: { 
    focus: "excursiones y traslados grupales", 
    keyMetrics: ["tours operados", "pasajeros transportados", "flota activa", "satisfacción"], 
    uniqueChallenges: ["estacionalidad", "licencias de turismo", "mantenimiento de unidades", "choferes bilingües"],
    followUpTriggers: { "clientes": ["agencias vs directo"], "operaciones": ["flota propia"] }
  },
  transporte_escolar: { 
    focus: "transporte de estudiantes", 
    keyMetrics: ["alumnos transportados", "rutas activas", "escuelas atendidas", "cero accidentes"], 
    uniqueChallenges: ["regulaciones escolares", "seguridad de menores", "puntualidad crítica", "comunicación con padres"],
    followUpTriggers: { "operaciones": ["flota y conductores"], "servicio": ["escuelas atendidas"] }
  },
  transporte_corporativo: { 
    focus: "shuttles y transporte de personal", 
    keyMetrics: ["empresas cliente", "rutas operadas", "pasajeros diarios", "puntualidad"], 
    uniqueChallenges: ["horarios de turno", "confort de pasajeros", "contratos corporativos", "coordinación con RRHH"],
    followUpTriggers: { "clientes": ["industrias atendidas"], "operaciones": ["flota dedicada"] }
  },
  alquiler_vehiculos: { 
    focus: "rent a car y flotas de alquiler", 
    keyMetrics: ["flota activa", "tasa de utilización", "ticket diario promedio", "daños y siniestros"], 
    uniqueChallenges: ["rotación de flota", "mantenimiento", "seguros", "devoluciones en otras ciudades"],
    followUpTriggers: { "operaciones": ["gestión de flota"], "marketing": ["canales de venta"] }
  },
  gestion_flotas: { 
    focus: "administración de flotas corporativas", 
    keyMetrics: ["vehículos gestionados", "ahorro generado", "empresas cliente", "tecnología de tracking"], 
    uniqueChallenges: ["optimización de rutas", "control de combustible", "mantenimiento preventivo", "reporting"],
    followUpTriggers: { "tecnologia": ["plataforma de gestión"], "servicio": ["alcance del servicio"] }
  },

  // ========================
  // A10_AGRO - AGRO Y AGROINDUSTRIA (18 tipos)
  // ========================
  agricultura_extensiva: { 
    focus: "producción de granos a gran escala", 
    keyMetrics: ["hectáreas sembradas", "rendimiento por ha", "costo por tonelada", "margen bruto"], 
    uniqueChallenges: ["clima", "precios de commodities", "insumos", "logística de cosecha"],
    followUpTriggers: { "producto": ["cultivos principales"], "operaciones": ["campo propio vs arrendado"] }
  },
  horticultura: { 
    focus: "producción intensiva de verduras", 
    keyMetrics: ["ciclos por año", "rendimiento por m²", "canales de venta", "desperdicio"], 
    uniqueChallenges: ["perecederos", "mano de obra intensiva", "comercialización", "clima en invernaderos"],
    followUpTriggers: { "producto": ["cultivos principales"], "ventas": ["canales de venta"] }
  },
  fruticultura: { 
    focus: "producción de frutas", 
    keyMetrics: ["hectáreas productivas", "toneladas por temporada", "calidad de exportación", "costos de cosecha"], 
    uniqueChallenges: ["estacionalidad", "mano de obra de cosecha", "cadena de frío", "exportación"],
    followUpTriggers: { "producto": ["frutas principales"], "ventas": ["mercado interno vs exportación"] }
  },
  vitivinicultura: { 
    focus: "viñedos y producción de vino", 
    keyMetrics: ["hectáreas de viñedo", "litros producidos", "ventas por canal", "premios y ratings"], 
    uniqueChallenges: ["clima y terroir", "enología", "comercialización premium", "enoturismo"],
    followUpTriggers: { "producto": ["varietales principales"], "ventas": ["bodegas vs exportación"] }
  },
  ganaderia_carne: { 
    focus: "cría y engorde de ganado", 
    keyMetrics: ["cabezas de ganado", "kg vendidos", "costo por kg", "hectáreas de pastoreo"], 
    uniqueChallenges: ["ciclos largos", "precio de hacienda", "sanidad animal", "trazabilidad"],
    followUpTriggers: { "producto": ["ciclo completo vs cría"], "operaciones": ["campo propio vs arrendado"] }
  },
  ganaderia_leche: { 
    focus: "producción lechera", 
    keyMetrics: ["litros diarios", "vacas en ordeñe", "precio por litro", "calidad de leche"], 
    uniqueChallenges: ["operación 365 días", "precio regulado", "cadena de frío", "genética"],
    followUpTriggers: { "ventas": ["industria vs directo"], "operaciones": ["tecnificación"] }
  },
  avicultura: { 
    focus: "producción avícola (carne y huevos)", 
    keyMetrics: ["aves en producción", "conversión alimenticia", "huevos/kg producidos", "sanidad"], 
    uniqueChallenges: ["bioseguridad", "costos de alimento", "integración vertical", "brotes sanitarios"],
    followUpTriggers: { "producto": ["carne vs huevos"], "operaciones": ["integración con industria"] }
  },
  porcicultura: { 
    focus: "cría de cerdos", 
    keyMetrics: ["cabezas en producción", "conversión alimenticia", "costo por kg", "ciclos por año"], 
    uniqueChallenges: ["bioseguridad", "costos de alimento", "precio de mercado", "genética"],
    followUpTriggers: { "producto": ["ciclo completo vs cría"], "ventas": ["faena propia vs terceros"] }
  },
  acuicultura: { 
    focus: "cría de peces y mariscos", 
    keyMetrics: ["toneladas producidas", "especies cultivadas", "ciclos por año", "mortalidad"], 
    uniqueChallenges: ["calidad del agua", "sanidad acuícola", "alimento especializado", "comercialización"],
    followUpTriggers: { "producto": ["especies principales"], "operaciones": ["tipo de cultivo"] }
  },
  apicultura: { 
    focus: "producción de miel y derivados", 
    keyMetrics: ["colmenas activas", "kg de miel por colmena", "exportación", "productos derivados"], 
    uniqueChallenges: ["sanidad de abejas", "clima y floración", "trazabilidad para exportación", "diversificación"],
    followUpTriggers: { "producto": ["miel vs otros derivados"], "ventas": ["exportación"] }
  },
  agroindustria_procesamiento: { 
    focus: "procesamiento de productos agrícolas", 
    keyMetrics: ["toneladas procesadas", "capacidad instalada", "productos finales", "clientes industriales"], 
    uniqueChallenges: ["estacionalidad de materia prima", "calidad constante", "regulaciones alimentarias", "logística"],
    followUpTriggers: { "producto": ["productos procesados"], "operaciones": ["capacidad de planta"] }
  },
  feed_lot: { 
    focus: "engorde intensivo de ganado", 
    keyMetrics: ["cabezas en engorde", "conversión alimenticia", "días de engorde", "precio de venta"], 
    uniqueChallenges: ["costos de alimento", "bienestar animal", "precio de hacienda", "logística"],
    followUpTriggers: { "operaciones": ["capacidad de corrales"], "ventas": ["frigoríficos cliente"] }
  },
  acopio_granos: { 
    focus: "almacenamiento y comercialización de granos", 
    keyMetrics: ["toneladas acopiadas", "capacidad de almacenamiento", "servicios a productores", "márgenes"], 
    uniqueChallenges: ["logística de cosecha", "calidad de almacenamiento", "financiamiento de productores", "mercados"],
    followUpTriggers: { "operaciones": ["capacidad de silos"], "servicio": ["servicios adicionales"] }
  },
  maquinaria_servicios: { 
    focus: "servicios de maquinaria agrícola", 
    keyMetrics: ["hectáreas trabajadas", "máquinas en operación", "servicios ofrecidos", "clientes"], 
    uniqueChallenges: ["estacionalidad", "mantenimiento de maquinaria", "personal especializado", "logística"],
    followUpTriggers: { "producto": ["servicios principales"], "operaciones": ["flota propia"] }
  },
  agronomia_consultoria: { 
    focus: "asesoramiento técnico agrícola", 
    keyMetrics: ["campos asesorados", "hectáreas bajo gestión", "fee por hectárea", "resultados de clientes"], 
    uniqueChallenges: ["actualización técnica", "cobertura geográfica", "medición de resultados", "competencia"],
    followUpTriggers: { "servicio": ["cultivos especializados"], "clientes": ["tamaño de productores"] }
  },
  vivero: { 
    focus: "producción de plantines y plantas", 
    keyMetrics: ["unidades producidas", "especies en catálogo", "clientes mayoristas", "supervivencia de plantas"], 
    uniqueChallenges: ["ciclos de producción", "calidad genética", "logística de entrega", "estacionalidad"],
    followUpTriggers: { "producto": ["tipo de plantas"], "ventas": ["mayorista vs minorista"] }
  },
  insumos_agropecuarios: { 
    focus: "venta de insumos para el agro", 
    keyMetrics: ["ventas mensuales", "líneas de producto", "clientes activos", "crédito otorgado"], 
    uniqueChallenges: ["estacionalidad", "crédito de campaña", "asesoramiento técnico", "competencia de grandes"],
    followUpTriggers: { "producto": ["insumos principales"], "finanzas": ["política de crédito"] }
  },
  agtech_datos: { 
    focus: "tecnología y datos para el agro", 
    keyMetrics: ["usuarios activos", "hectáreas monitoreadas", "funcionalidades", "retención"], 
    uniqueChallenges: ["adopción de productores", "conectividad rural", "integración de datos", "ROI demostrable"],
    followUpTriggers: { "producto": ["solución principal"], "tecnologia": ["stack tecnológico"] }
  },

  // DEFAULT para tipos no mapeados
  default: { 
    focus: "crecimiento y optimización del negocio", 
    keyMetrics: ["ventas mensuales", "clientes activos", "margen de ganancia", "satisfacción del cliente"], 
    uniqueChallenges: ["competencia", "costos operativos", "gestión de personal", "captación de clientes"],
    followUpTriggers: { "operaciones": ["mayor desafío"], "clientes": ["tipo de cliente"] }
  },
};

// Helper to get context with fallback
export function getSectorContext(businessType: string): SectorContext {
  // Try exact match first
  if (SECTOR_CONTEXTS[businessType]) {
    return SECTOR_CONTEXTS[businessType];
  }
  
  // Try partial match
  const partialMatch = Object.keys(SECTOR_CONTEXTS).find(key => 
    businessType.includes(key) || key.includes(businessType)
  );
  
  if (partialMatch) {
    return SECTOR_CONTEXTS[partialMatch];
  }
  
  return SECTOR_CONTEXTS.default;
}

// Get follow-up questions based on previous answer
export function getFollowUpTrigger(businessType: string, category: string, answer: string): string[] | null {
  const context = getSectorContext(businessType);
  const triggers = context.followUpTriggers?.[category];
  
  if (!triggers) return null;
  
  // Check if answer contains any trigger words
  const lowerAnswer = answer.toLowerCase();
  const matchedTrigger = triggers.find(trigger => 
    lowerAnswer.includes(trigger.toLowerCase())
  );
  
  return matchedTrigger ? triggers : null;
}
