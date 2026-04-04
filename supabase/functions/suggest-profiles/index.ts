import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Full catalog of 180 business types for matching
const CATALOG_SECTORS: Record<string, { label: string; types: { id: string; label: string; keywords: string[] }[] }> = {
  A1_GASTRO: { label: "Gastronomía y Bebidas", types: [
    { id: "restaurant_general", label: "Restaurant General", keywords: ["restaurante","restaurant","comida","cocina","menú"] },
    { id: "alta_cocina", label: "Alta Cocina - Gourmet", keywords: ["gourmet","fine dining","alta cocina","premium"] },
    { id: "bodegon_cantina", label: "Bodegón - Cantina", keywords: ["bodegón","cantina","casera","boteco"] },
    { id: "parrilla_asador", label: "Parrilla / Asador", keywords: ["parrilla","asado","asador","carne","churrascaria"] },
    { id: "cocina_criolla", label: "Cocina Criolla / Regional", keywords: ["criolla","regional","típica","tradicional"] },
    { id: "pizzeria", label: "Pizzería", keywords: ["pizza","pizzería","pizzeria","pizzas"] },
    { id: "sushi_oriental", label: "Sushi / Cocina Oriental", keywords: ["sushi","oriental","japonés","chino","wok","ramen","nikkei"] },
    { id: "cafeteria", label: "Cafetería / Café de Especialidad", keywords: ["café","cafetería","coffee","specialty","barista"] },
    { id: "bar_pub", label: "Bar / Pub / Cervecería", keywords: ["bar","pub","cervecería","cerveza","craft","trago"] },
    { id: "heladeria", label: "Heladería / Postres", keywords: ["helado","heladería","postre","gelato","dulce"] },
    { id: "panaderia", label: "Panadería / Pastelería", keywords: ["pan","panadería","pastelería","facturas","torta","repostería"] },
    { id: "food_truck", label: "Food Truck / Street Food", keywords: ["food truck","ambulante","street food","puesto"] },
    { id: "catering_eventos", label: "Catering / Eventos", keywords: ["catering","evento","banquete","fiesta"] },
    { id: "comida_rapida", label: "Comida Rápida / Fast Food", keywords: ["rápida","fast food","hamburguesa","empanada","lomito"] },
    { id: "dark_kitchen", label: "Dark Kitchen / Virtual", keywords: ["dark kitchen","virtual","delivery only","ghost kitchen"] },
    { id: "vinoteca", label: "Vinoteca / Wine Bar", keywords: ["vino","vinoteca","wine","enología","bodega"] },
    { id: "dietetica", label: "Dietética / Healthy", keywords: ["dietética","natural","healthy","orgánico","saludable","vegano"] },
    { id: "rotiseria", label: "Rotisería / Take Away", keywords: ["rotisería","take away","vianda","llevar","comida preparada"] },
  ]},
  A2_TURISMO: { label: "Turismo, Hotelería, Ocio y Eventos", types: [
    { id: "hotel_resort", label: "Hotel / Resort", keywords: ["hotel","resort","hospedaje","alojamiento"] },
    { id: "hostel_bb", label: "Hostel / B&B", keywords: ["hostel","b&b","backpacker","mochilero"] },
    { id: "apart_hotel", label: "Apart Hotel / Cabañas", keywords: ["apart","cabaña","departamento temporal","airbnb"] },
    { id: "agencia_viajes", label: "Agencia de Viajes", keywords: ["viajes","agencia","turismo","paquete","excursión"] },
    { id: "guia_turismo", label: "Guía Turístico", keywords: ["guía","tour","recorrido","city tour"] },
    { id: "parque_atraccion", label: "Parque / Atracción", keywords: ["parque","atracción","diversión","aventura"] },
    { id: "organizacion_eventos", label: "Organización de Eventos", keywords: ["evento","organizador","wedding planner","congreso","conferencia"] },
    { id: "salon_fiestas", label: "Salón de Fiestas", keywords: ["salón","fiesta","quinceañera","casamiento","recepción"] },
    { id: "camping_glamping", label: "Camping / Glamping", keywords: ["camping","glamping","carpa","naturaleza"] },
    { id: "spa_termal", label: "Spa / Termas", keywords: ["spa","termas","relax","wellness retreat"] },
    { id: "deporte_aventura", label: "Deporte / Aventura", keywords: ["deporte","aventura","trekking","rafting","escalada","kayak"] },
    { id: "museo_cultural", label: "Museo / Cultural", keywords: ["museo","cultural","galería","arte","exposición"] },
    { id: "crucero_nautico", label: "Crucero / Náutico", keywords: ["crucero","náutico","barco","navegación","yate"] },
    { id: "casino_entret", label: "Casino / Entretenimiento", keywords: ["casino","entretenimiento","juego","bingo"] },
    { id: "ecoturismo", label: "Ecoturismo / Rural", keywords: ["ecoturismo","rural","agroturismo","campo","estancia"] },
    { id: "discoteca_night", label: "Discoteca / Nightlife", keywords: ["disco","boliche","night","nocturno","dj"] },
    { id: "fotografia_turismo", label: "Fotografía Turística", keywords: ["foto","fotografía","sesión","drone"] },
    { id: "transporte_turistico", label: "Transporte Turístico", keywords: ["transfer","transporte turístico","remise","charter"] },
  ]},
  A3_RETAIL: { label: "Comercio Minorista y E-commerce", types: [
    { id: "tienda_ropa", label: "Tienda de Ropa", keywords: ["ropa","indumentaria","moda","vestimenta","boutique"] },
    { id: "tienda_accesorios", label: "Accesorios / Joyería", keywords: ["accesorio","joyería","bijouterie","reloj"] },
    { id: "tienda_calzado", label: "Calzado / Zapatería", keywords: ["calzado","zapatería","zapato","zapatilla"] },
    { id: "ecommerce_general", label: "E-commerce / Tienda Online", keywords: ["ecommerce","online","tienda virtual","marketplace","venta online"] },
    { id: "almacen_kiosco", label: "Almacén / Kiosco / Minimercado", keywords: ["almacén","kiosco","minimercado","despensa","maxikiosco"] },
    { id: "supermercado", label: "Supermercado", keywords: ["supermercado","autoservicio","cadena"] },
    { id: "ferreteria", label: "Ferretería / Materiales", keywords: ["ferretería","material","herramienta","tornillo","pintura"] },
    { id: "farmacia_perfumeria", label: "Farmacia / Perfumería", keywords: ["farmacia","perfumería","cosmética","droguería"] },
    { id: "libreria_papeleria", label: "Librería / Papelería", keywords: ["librería","papelería","libro","cuaderno","escolar"] },
    { id: "electronica", label: "Electrónica / Tecnología", keywords: ["electrónica","tecnología","celular","computadora","gamer","informática"] },
    { id: "jugueteria", label: "Juguetería / Infantil", keywords: ["juguete","bebé","infantil","niño","didáctico"] },
    { id: "tienda_mascotas", label: "Tienda de Mascotas / Pet Shop", keywords: ["mascota","pet","perro","gato","veterinaria","petshop"] },
    { id: "floreria", label: "Florería", keywords: ["flor","florería","planta","jardín","arreglo floral"] },
    { id: "muebleria", label: "Mueblería / Deco / Hogar", keywords: ["mueble","decoración","hogar","colchón","bazar"] },
    { id: "automotor_repuestos", label: "Automotor / Repuestos", keywords: ["auto","repuesto","automotor","autopartes","aceite","mecánica"] },
    { id: "articulos_deportivos", label: "Artículos Deportivos", keywords: ["deportivo","gimnasio equip","pelota","fitness","camping equip"] },
    { id: "tienda_vinos", label: "Vinoteca / Licorería", keywords: ["licor","bebida","alcohol","vino","whisky","distribución"] },
    { id: "bazar_regalos", label: "Bazar / Regalería", keywords: ["bazar","regalo","regalería","souvenir","cotillón"] },
  ]},
  A4_SALUD: { label: "Salud, Bienestar y Belleza", types: [
    { id: "consultorio_medico", label: "Consultorio Médico", keywords: ["médico","doctor","consultorio","clínica","medicina"] },
    { id: "odontologia", label: "Odontología", keywords: ["dentista","odontología","diente","ortodoncia","implante"] },
    { id: "psicologia", label: "Psicología / Terapia", keywords: ["psicólogo","terapia","psicología","mental","coaching personal","terapeuta","adicción","adicciones"] },
    { id: "nutricion", label: "Nutrición / Dietología", keywords: ["nutrición","nutricionista","dieta","alimentación"] },
    { id: "fisioterapia", label: "Fisioterapia / Kinesiología", keywords: ["fisio","kinesio","rehabilitación","quiropráctica"] },
    { id: "estetica_cosmetologia", label: "Estética / Cosmetología", keywords: ["estética","cosmetología","lifting","botox","tratamiento facial"] },
    { id: "peluqueria", label: "Peluquería / Barbería", keywords: ["peluquería","barbería","corte","peinado","color","barber"] },
    { id: "spa_masajes", label: "Spa / Masajes", keywords: ["masaje","spa","relax","corporal","reflexología"] },
    { id: "gym_fitness", label: "Gimnasio / Fitness", keywords: ["gimnasio","gym","fitness","crossfit","funcional","pilates"] },
    { id: "yoga_meditacion", label: "Yoga / Meditación", keywords: ["yoga","meditación","mindfulness","bienestar"] },
    { id: "veterinaria", label: "Veterinaria", keywords: ["veterinaria","veterinario","animal","mascota médica"] },
    { id: "optica", label: "Óptica", keywords: ["óptica","lente","anteojos","visión","oftalmólogo"] },
    { id: "laboratorio", label: "Laboratorio / Análisis", keywords: ["laboratorio","análisis","sangre","estudio"] },
    { id: "farmacia_salud", label: "Farmacia / Herboristería", keywords: ["farmacia","hierba","homeopatía","natural","herboristería"] },
    { id: "centro_medico", label: "Centro Médico / Sanatorio", keywords: ["centro médico","sanatorio","hospital","clínica grande"] },
    { id: "podologia", label: "Podología / Manicuría", keywords: ["podología","manicura","uña","pedicura","nail"] },
    { id: "salud_alternativa", label: "Salud Alternativa / Holística", keywords: ["alternativa","holística","reiki","acupuntura","aromaterapia"] },
    { id: "cuidado_adultos", label: "Cuidado de Adultos Mayores", keywords: ["geriátrico","adulto mayor","cuidado","enfermería","residencia"] },
  ]},
  A5_EDUCACION: { label: "Educación, Formación y Academias", types: [
    { id: "colegio_jardin", label: "Colegio / Jardín", keywords: ["colegio","jardín","escuela","primaria","secundaria"] },
    { id: "universidad_terciario", label: "Universidad / Terciario", keywords: ["universidad","terciario","facultad","carrera"] },
    { id: "academia_idiomas", label: "Academia de Idiomas", keywords: ["idioma","inglés","español","francés","lenguaje"] },
    { id: "academia_artistica", label: "Academia Artística / Música", keywords: ["arte","música","danza","teatro","pintura","canto"] },
    { id: "academia_deportiva", label: "Academia Deportiva", keywords: ["fútbol","tenis","natación","escuela deportiva","club"] },
    { id: "capacitacion_corporativa", label: "Capacitación Corporativa", keywords: ["capacitación","training","corporativo","team building"] },
    { id: "plataforma_online", label: "Plataforma de Cursos Online", keywords: ["curso online","plataforma","e-learning","edtech","digital"] },
    { id: "coaching_mentoring", label: "Coaching / Mentoring", keywords: ["coaching","mentor","desarrollo personal","life coach"] },
    { id: "tutoria_particular", label: "Tutoría / Apoyo Escolar", keywords: ["tutoría","apoyo","particular","profesor particular"] },
    { id: "guarderia", label: "Guardería / Centro Infantil", keywords: ["guardería","maternal","infantil","cuidado niños"] },
    { id: "escuela_oficios", label: "Escuela de Oficios", keywords: ["oficio","técnico","electricidad","plomería","mecánica escuela"] },
    { id: "autoescuela", label: "Autoescuela / Conducción", keywords: ["autoescuela","conducir","licencia","manejo"] },
    { id: "comunidad_educativa", label: "Comunidad / Membership", keywords: ["comunidad","membership","suscripción educativa","grupo","membresía"] },
    { id: "formacion_tech", label: "Formación Tech / Bootcamp", keywords: ["bootcamp","programación","tech","código","data science","IA curso"] },
    { id: "editorial_educativa", label: "Editorial Educativa", keywords: ["editorial","material didáctico","publicación educativa"] },
    { id: "educacion_especial", label: "Educación Especial / Inclusiva", keywords: ["especial","inclusiva","discapacidad","integración"] },
    { id: "investigacion_academica", label: "Investigación Académica", keywords: ["investigación","académico","paper","estudio científico"] },
    { id: "creator_education", label: "Creator / Infoproducto", keywords: ["creator","infoproducto","curso propio","influencer educativo","contenido digital"] },
  ]},
  A6_B2B: { label: "Servicios Profesionales y B2B", types: [
    { id: "consultoria_gestion", label: "Consultoría de Gestión", keywords: ["consultoría","gestión","management","estrategia empresarial"] },
    { id: "estudio_contable", label: "Estudio Contable", keywords: ["contable","contador","contaduría","impuesto","auditoría","monotributo"] },
    { id: "estudio_juridico", label: "Estudio Jurídico / Abogado", keywords: ["abogado","jurídico","derecho","legal","penal","penalista","laboral","civil","familia"] },
    { id: "agencia_marketing", label: "Agencia de Marketing / Publicidad", keywords: ["marketing","publicidad","agencia","branding","digital","redes sociales","community"] },
    { id: "agencia_desarrollo", label: "Desarrollo de Software / IT", keywords: ["software","desarrollo","programación","app","web","IT","sistema"] },
    { id: "diseno_grafico", label: "Diseño Gráfico / Creativo", keywords: ["diseño","gráfico","creativo","identidad visual","logo"] },
    { id: "arquitectura", label: "Arquitectura / Diseño de Interiores", keywords: ["arquitectura","arquitecto","interiores","decoración profesional"] },
    { id: "ingenieria", label: "Ingeniería / Proyectos", keywords: ["ingeniería","ingeniero","proyecto técnico","civil","industrial"] },
    { id: "rrhh_headhunter", label: "RRHH / Headhunting", keywords: ["recursos humanos","rrhh","headhunting","selección personal","talento"] },
    { id: "seguros_broker", label: "Seguros / Broker", keywords: ["seguro","broker","póliza","aseguradora","productor"] },
    { id: "finanzas_inversiones", label: "Finanzas / Inversiones", keywords: ["finanzas","inversión","asesor financiero","trading","crypto","bolsa"] },
    { id: "traduccion", label: "Traducción / Interpretación", keywords: ["traducción","intérprete","idioma profesional","localización"] },
    { id: "fotografia_video", label: "Fotografía / Producción Audiovisual", keywords: ["foto","video","producción","audiovisual","cine","documental"] },
    { id: "imprenta", label: "Imprenta / Gráfica", keywords: ["imprenta","impresión","gráfica","ploteo","cartelería","señalética"] },
    { id: "outsourcing", label: "Outsourcing / BPO", keywords: ["outsourcing","BPO","tercerización","call center"] },
    { id: "coworking", label: "Coworking / Espacio Compartido", keywords: ["coworking","espacio compartido","oficina virtual","sala de reunión"] },
    { id: "relaciones_publicas", label: "Relaciones Públicas / Prensa", keywords: ["relaciones públicas","prensa","comunicación","PR","lobby"] },
    { id: "freelance_independiente", label: "Freelance / Independiente", keywords: ["freelance","independiente","autónomo","monotributista","cuenta propia"] },
  ]},
  A7_HOGAR_SERV: { label: "Hogar, Mantenimiento y Servicios Técnicos", types: [
    { id: "electricista", label: "Electricista", keywords: ["electricista","eléctrico","instalación eléctrica","tablero"] },
    { id: "plomero", label: "Plomero / Gasista", keywords: ["plomero","gasista","caño","agua","gas"] },
    { id: "pintor", label: "Pintor", keywords: ["pintor","pintura","pared","acabado"] },
    { id: "cerrajero", label: "Cerrajero", keywords: ["cerrajero","cerradura","llave","seguridad hogar"] },
    { id: "limpieza", label: "Limpieza / Mantenimiento", keywords: ["limpieza","mantenimiento","empleada","doméstica","edificio"] },
    { id: "jardineria", label: "Jardinería / Paisajismo", keywords: ["jardín","jardinero","paisajismo","poda","césped"] },
    { id: "mudanzas", label: "Mudanzas / Fletes", keywords: ["mudanza","flete","transporte","camión"] },
    { id: "fumigacion", label: "Fumigación / Control de Plagas", keywords: ["fumigación","plaga","insecto","desinfección","rata"] },
    { id: "aire_acondicionado", label: "Aire Acondicionado / Refrigeración", keywords: ["aire","refrigeración","climatización","split","heladera"] },
    { id: "carpinteria", label: "Carpintería / Muebles a Medida", keywords: ["carpintero","carpintería","madera","mueble a medida"] },
    { id: "herreria", label: "Herrería / Aluminio", keywords: ["herrero","herrería","aluminio","reja","puerta","ventana"] },
    { id: "reparacion_electronica", label: "Reparación Electrónica", keywords: ["reparación","celular","computadora","técnico","notebook","electro"] },
    { id: "instalacion_solar", label: "Instalación Solar / Energía", keywords: ["solar","panel","energía renovable","fotovoltaico","instalación solar"] },
    { id: "seguridad_alarmas", label: "Seguridad / Alarmas / Cámaras", keywords: ["seguridad","alarma","cámara","CCTV","monitoreo"] },
    { id: "piscinas", label: "Piscinas / Piletas", keywords: ["piscina","pileta","cloro","agua","mantenimiento pileta"] },
    { id: "tapiceria", label: "Tapicería / Cortinas", keywords: ["tapicería","cortina","tela","retapizado"] },
    { id: "techos_impermeabilizacion", label: "Techos / Impermeabilización", keywords: ["techo","impermeabilización","membrana","gotera","canaleta"] },
    { id: "servicio_tecnico_general", label: "Servicio Técnico General", keywords: ["técnico","reparación general","hogar","mantenimiento general"] },
  ]},
  A8_CONSTRU_INMO: { label: "Construcción, Inmobiliario y Gestión", types: [
    { id: "constructora", label: "Constructora", keywords: ["constructora","construcción","obra","edificio"] },
    { id: "inmobiliaria", label: "Inmobiliaria", keywords: ["inmobiliaria","propiedad","alquiler","venta casa","departamento","bienes raíces"] },
    { id: "desarrolladora", label: "Desarrolladora Inmobiliaria", keywords: ["desarrolladora","emprendimiento","proyecto","fideicomiso","pozo"] },
    { id: "administracion_consorcios", label: "Administración de Consorcios", keywords: ["consorcio","administración","expensa","edificio","propiedad horizontal"] },
    { id: "demolicion", label: "Demolición / Excavación", keywords: ["demolición","excavación","movimiento tierra","retroexcavadora"] },
    { id: "topografia", label: "Topografía / Agrimensura", keywords: ["topografía","agrimensura","medición","terreno","catastro"] },
    { id: "corralon", label: "Corralón / Venta de Materiales", keywords: ["corralón","material","cemento","ladrillo","hierro"] },
    { id: "marmoleria", label: "Marmolería / Granito", keywords: ["mármol","granito","mesada","piedra","cuarzo"] },
    { id: "vidriero", label: "Vidriero / Cristalería", keywords: ["vidrio","cristal","espejo","blindex","vidriero"] },
    { id: "reformas_remodelacion", label: "Reformas / Remodelación", keywords: ["reforma","remodelación","refacción","renovación"] },
    { id: "estudio_arq_ingenieria", label: "Estudio Arquitectura / Ingeniería Civil", keywords: ["estudio","proyecto","plano","cálculo estructural"] },
    { id: "facility_management", label: "Facility Management", keywords: ["facility","gestión edificio","mantenimiento corporativo"] },
    { id: "drywall_construccion_seco", label: "Drywall / Construcción en Seco", keywords: ["drywall","durlock","placa","yeso","construcción seco"] },
    { id: "sanitarios_griferias", label: "Sanitarios / Griferías", keywords: ["sanitario","grifería","baño","inodoro","ducha"] },
    { id: "paisajismo_obra", label: "Paisajismo de Obra", keywords: ["paisajismo","obra verde","diseño exterior","deck"] },
    { id: "pintura_obra", label: "Pintura de Obra / Industrial", keywords: ["pintura","obra","industrial","revestimiento","epoxy"] },
    { id: "cercos_portones", label: "Cercos / Portones / Automatización", keywords: ["cerco","portón","automatización","acceso","garage"] },
    { id: "tasaciones", label: "Tasaciones / Pericias", keywords: ["tasación","pericia","valuación","perito"] },
  ]},
  A9_LOGISTICA: { label: "Transporte, Logística y Movilidad", types: [
    { id: "transporte_carga", label: "Transporte de Carga", keywords: ["carga","camión","transporte","flete"] },
    { id: "mensajeria", label: "Mensajería / Courier", keywords: ["mensajería","courier","envío","moto","paquete"] },
    { id: "last_mile", label: "Última Milla / Delivery", keywords: ["última milla","delivery","entrega","rappi","pedidos ya"] },
    { id: "logistica_3pl", label: "Logística / 3PL / Fulfillment", keywords: ["logística","3PL","fulfillment","warehouse","almacén logístico"] },
    { id: "taxi_remis", label: "Taxi / Remis / Transporte VIP", keywords: ["taxi","remis","uber","cabify","VIP","chofer","transfer"] },
    { id: "mudanzas_log", label: "Mudanzas / Transporte Especial", keywords: ["mudanza","especial","piano","obra arte","caja fuerte"] },
    { id: "transporte_escolar", label: "Transporte Escolar / Corporativo", keywords: ["escolar","combi","transporte personal","micro"] },
    { id: "alquiler_vehiculos", label: "Alquiler de Vehículos", keywords: ["alquiler","rent a car","auto alquiler","camioneta"] },
    { id: "mecanica_taller", label: "Mecánica / Taller Automotor", keywords: ["mecánico","taller","auto","reparación auto","service"] },
    { id: "lavadero_autos", label: "Lavadero de Autos", keywords: ["lavadero","auto","lavado","car wash"] },
    { id: "estacionamiento", label: "Estacionamiento / Parking", keywords: ["estacionamiento","parking","cochera","playa"] },
    { id: "gomeria", label: "Gomería / Alineación", keywords: ["goma","neumático","alineación","balanceo","llanta"] },
    { id: "grua", label: "Grúa / Auxilio Mecánico", keywords: ["grúa","auxilio","remolque","asistencia vial"] },
    { id: "despachante_aduana", label: "Despachante de Aduana", keywords: ["aduana","despachante","importación","exportación","comercio exterior"] },
    { id: "flota_gestion", label: "Gestión de Flotas", keywords: ["flota","GPS","tracking","gestión vehicular"] },
    { id: "nautica_embarcaciones", label: "Náutica / Embarcaciones", keywords: ["náutica","embarcación","lancha","velero","marina"] },
    { id: "aviacion_charter", label: "Aviación / Charter", keywords: ["aviación","charter","avión","vuelo privado","aéreo"] },
    { id: "bicicletas_movilidad", label: "Bicicletas / Movilidad Urbana", keywords: ["bicicleta","bici","monopatín","movilidad","scooter"] },
  ]},
  A10_AGRO: { label: "Agro, Ganadería y Agroindustria", types: [
    { id: "agricultura_extensiva", label: "Agricultura Extensiva", keywords: ["campo","soja","trigo","maíz","girasol","agricultor"] },
    { id: "ganaderia_vacuna", label: "Ganadería Vacuna", keywords: ["ganadería","vacuno","carne","tambo","feedlot","hacienda"] },
    { id: "ganaderia_porcina", label: "Ganadería Porcina", keywords: ["cerdo","porcino","chancho","criadero cerdo"] },
    { id: "avicultura", label: "Avicultura", keywords: ["pollo","gallina","huevo","avícola","granja avícola"] },
    { id: "apicultura", label: "Apicultura", keywords: ["abeja","miel","apicultor","colmena","cera"] },
    { id: "acuicultura", label: "Acuicultura / Pesca", keywords: ["pez","pesca","acuicultura","trucha","camarón","mariscos"] },
    { id: "horticultura", label: "Horticultura / Vivero", keywords: ["hortaliza","verdura","vivero","plantín","huerta"] },
    { id: "fruticultura", label: "Fruticultura / Citricultura", keywords: ["fruta","cítrico","manzana","vid","uva","limón"] },
    { id: "lecheria", label: "Lechería / Tambo", keywords: ["leche","tambo","lechería","queso artesanal","lácteo"] },
    { id: "viticultura", label: "Viticultura / Bodega", keywords: ["viña","vid","bodega vino","enología producción"] },
    { id: "silvicultura", label: "Silvicultura / Forestal", keywords: ["forestal","madera","bosque","aserradero","pino"] },
    { id: "maquinaria_agricola", label: "Maquinaria Agrícola", keywords: ["maquinaria","tractor","cosechadora","implemento","sembradora"] },
    { id: "contratista_rural", label: "Contratista Rural", keywords: ["contratista","rural","siembra","cosecha","fumigación agrícola"] },
    { id: "acopio_cereales", label: "Acopio / Comercialización Granos", keywords: ["acopio","cereal","grano","silo","corredor"] },
    { id: "veterinaria_rural", label: "Veterinaria Rural", keywords: ["veterinario rural","sanidad animal","vacuna animal"] },
    { id: "riego_tecnologia", label: "Riego / Tecnología de Campo", keywords: ["riego","pivot","goteo","tecnología campo","precisión"] },
    { id: "agroindustria", label: "Agroindustria", keywords: ["agroindustria","procesamiento","molienda","alimento procesado"] },
    { id: "agtech", label: "Agtech / Servicios de Datos", keywords: ["agtech","drone agrícola","datos","monitoreo satelital","IA agro"] },
  ]},
};

// Build flat lookup
function buildFlatCatalog() {
  const flat: { id: string; label: string; sectorId: string; sectorLabel: string; keywords: string[] }[] = [];
  for (const [sectorId, sector] of Object.entries(CATALOG_SECTORS)) {
    for (const type of sector.types) {
      flat.push({ id: type.id, label: type.label, sectorId, sectorLabel: sector.label, keywords: type.keywords });
    }
  }
  return flat;
}

const FLAT_CATALOG = buildFlatCatalog();

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { raw_text, locale, clarification_answer, clarification_context } = await req.json();
    if (!raw_text || raw_text.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Texto muy corto" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // If this is a clarification response, skip clarification detection
    const isClarificationResponse = !!clarification_answer;

    const systemPrompt = `Sos el Cerebro de Identidad de VistaCEO. Tu misión es entender con precisión extrema qué hace el usuario (negocio, servicio o profesión) aunque escriba mal, use jerga LATAM, mezcle conceptos o sea confuso.

CATÁLOGO DISPONIBLE (180 tipos):
${Object.entries(CATALOG_SECTORS).map(([sectorId, s]) => `${sectorId} - ${s.label}: ${s.types.map(t => t.id + ' (' + t.label + ')').join(', ')}`).join('\n')}

REGLAS ABSOLUTAS:
1. SIEMPRE devolver EXACTAMENTE 3 opciones
2. Opción 1: Mejor encaje al catálogo, marcada como "Recomendado"
3. Opción 2: Alternativa REALMENTE distinta del catálogo (distinto eje: cliente, canal, formato). PROHIBIDO duplicar semánticamente la opción 1
4. Opción 3: SIEMPRE un perfil "a_medida" personalizado al caso exacto del usuario. Debe sentirse premium, no fallback
5. Si el texto es confuso, igual intentar. NUNCA devolver "no entendí".
6. Capturar subtipo real: "pizzería" NO es "gastronomía genérica", "abogado penalista" NO es "servicios profesionales genérico"
7. Entender ortografía horrible, jerga LATAM, mezclas de idiomas
8. Cada opción debe incluir "precision_percent" (0-100): qué tan bien representa lo que el usuario REALMENTE hace. Reflejar incertidumbre real, NO inflar. Opción 1 siempre tiene el % más alto. Si el perfil a medida resuelve mejor, puede tener % más alto que opción 2.
9. "reason" debe ser ultra corta: máximo 12 palabras, humana, sin tecnicismos. Formato: "Porque detecté X e Y en tu descripción"
10. Las 3 opciones deben ser DIFERENTES de verdad. Diversidad por eje: cliente (empresas vs personas), canal (online vs presencial), formato (academia vs consultoría vs plataforma)

DETECCIÓN DE ETAPA - PROYECTOS Y ASPIRACIONES:
El usuario puede estar en distintas etapas:
- "YA LO HAGO": Tiene un negocio funcionando. Ej: "Tengo una pizzería", "Soy abogado", "Mi taller tiene 5 empleados"
- "QUIERO EMPEZAR": Planea hacerlo pero AÚN NO arrancó. Señales: "quiero abrir", "estoy pensando en", "me gustaría arrancar", "planeo poner", "voy a lanzar", "tengo la idea de", "estoy por empezar"
- "ESTOY ESTUDIANDO": Investiga la posibilidad. Señales: "¿será rentable?", "quiero saber si", "estoy evaluando"

OBLIGATORIO: Capturar la etapa en el universal_profile de CADA opción:
- "business_stage": "active" | "planning" | "exploring"
- Si es "planning" o "exploring", adaptar tone_and_context, primary_pains y success_metrics a esa etapa (ej: pains de arranque, métricas de validación, no de operación)

DETECCIÓN DE AMBIGÜEDAD Y CLARIFICACIÓN:
${isClarificationResponse ? 'El usuario ya respondió una pregunta de clarificación. Usar esa respuesta para generar las 3 opciones con máxima precisión.' : `Si el texto del usuario contiene DOS O MÁS caminos/actividades/objetivos claramente diferentes que llevarían a perfiles DISTINTOS, debes pedir clarificación ANTES de sugerir opciones.

Ejemplos de ambigüedad:
- "Quiero dar clases de yoga y también vender ropa deportiva" → ¿enseñanza o comercio?
- "Soy contador pero quiero armar una app de finanzas" → ¿estudio contable o startup tech?
- "Hago tortas y también tengo un salón de eventos" → ¿pastelería o eventos?
- "Quiero vender muebles y hacer diseño de interiores" → ¿retail o servicio profesional?

Si detectás ambigüedad clara (dos actividades que pertenecen a sectores DISTINTOS), devolvé este formato especial:
{
  "needs_clarification": true,
  "clarification_question": "Pregunta clara y corta para desambiguar",
  "clarification_options": [
    { "id": "opt_a", "label": "Opción A clara (máx 8 palabras)", "emoji": "🎯" },
    { "id": "opt_b", "label": "Opción B clara (máx 8 palabras)", "emoji": "🔀" },
    { "id": "opt_both", "label": "Las dos cosas juntas", "emoji": "🤝" }
  ],
  "options": []
}

REGLAS de clarificación:
- Solo pedir clarificación si hay DOS CAMINOS QUE LLEVAN A SECTORES DISTINTOS
- NO pedir clarificación si es una sola actividad con matices
- La pregunta debe ser CORTA, directa, en español natural con voseo
- Siempre incluir la opción "Las dos cosas juntas"
- Máximo 3 opciones de clarificación`}

AUTO-SELECCIÓN:
Si la opción 1 es un match PERFECTO e INDUDABLE al catálogo (por ejemplo el usuario escribió "pizzería" y el match es "Pizzería", o "abogado" y el match es "Estudio Jurídico / Abogado"), entonces agregar "auto_select": true en el JSON raíz.
Esto SOLO aplica cuando:
- La confianza de la opción 1 es "alta"
- El texto del usuario describe claramente UNA sola actividad sin ambigüedad
- El catalog_id de la opción 1 encaja perfectamente
- NO hay información extra que sugiera un subtipo diferente al del catálogo
- El usuario NO está en etapa "planning" o "exploring" (porque necesita ver las opciones)
Si hay CUALQUIER duda, dejar "auto_select": false.
IMPORTANTE: Si el usuario da info extra (ej. "quiero crecer", "más clientes", "vender en todo el país", ubicación, objetivos), NO auto-seleccionar. Esa info es valiosa y debe quedar en auto_select: false para que vea las 3 opciones.

EXTRACCIÓN PROFUNDA DE CONTEXTO:
Cuando el usuario escribe texto largo con más contexto (objetivos, ubicación, canal de venta, tipo de cliente, aspiraciones, dolores), DEBES capturar TODO en el universal_profile:
- "user_goals": extraer objetivos mencionados (ej: "crecer", "más clientes", "expandirme")
- "detected_location": ciudad/país si lo mencionó (solo interno, NO mostrar al usuario)
- "detected_pains": dolores que mencionó explícitamente
- "detected_channels": canales que mencionó
- "raw_context_notes": resumen de TODO lo extra que dijo el usuario, para que el Brain lo use después
- "tone_and_context": incluir notas de personalización basadas en lo que escribió
- "business_stage": "active" | "planning" | "exploring"

Devolver SOLO un JSON válido (sin markdown, sin backticks) con esta estructura:
{
  "auto_select": false,
  "options": [
    {
      "title": "Nombre claro de la actividad",
      "catalog_id": "id del catálogo o null si no aplica",
      "sector_id": "A1_GASTRO etc",
      "sector_label": "Nombre del sector",
      "subtype": "subtipo específico",
      "tags": ["tag1", "tag2", "tag3"],
      "reason": "Máximo 12 palabras, humana",
      "origin": "catalogo o a_medida",
      "confidence": "alta o media o baja",
      "precision_percent": 92,
      "universal_profile": {
        "display_name": "Nombre para mostrar",
        "activity_type": "negocio o servicio o profesión",
        "parent_sector": "sector macro",
        "subtype": "subtipo específico",
        "keywords": ["10-25 keywords"],
        "offerings": ["productos/servicios principales"],
        "customer_type": "b2c o b2b o ambos",
        "channels": ["canales de venta"],
        "business_model": "local o online o mixto o a_domicilio o suscripción",
        "success_metrics": ["3-7 métricas sugeridas"],
        "primary_pains": ["3-7 dolores principales"],
        "opportunity_angles": ["3-7 oportunidades"],
        "tone_and_context": "notas para el sistema",
        "business_stage": "active o planning o exploring",
        "user_goals": ["objetivos del usuario si los mencionó"],
        "detected_location": "ubicación si la mencionó o null",
        "detected_pains": ["dolores explícitos del usuario"],
        "raw_context_notes": "resumen de todo el contexto extra que dio el usuario"
      }
    }
  ],
  "needs_clarification": false,
  "confidence_top": "alta"
}`;

    const userContent = isClarificationResponse
      ? `Texto original del usuario: "${raw_text.trim()}"\n\nPregunta de clarificación: "${clarification_context?.question || ''}"\nRespuesta elegida: "${clarification_answer}"\n\nAhora generá las 3 opciones basándote en esta clarificación.`
      : `Analizar esta actividad y devolver 3 opciones (o pedir clarificación si hay ambigüedad real):\n\n"${raw_text.trim()}"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "ai_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response (handle markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify(buildFallbackOptions(raw_text)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // If clarification needed, return it
    if (parsed.needs_clarification && parsed.clarification_question && !isClarificationResponse) {
      return new Response(JSON.stringify({
        needs_clarification: true,
        clarification_question: parsed.clarification_question,
        clarification_options: parsed.clarification_options || [],
        options: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate we have exactly 3 options
    if (!parsed.options || parsed.options.length !== 3) {
      console.warn("AI returned != 3 options, adjusting");
      return new Response(JSON.stringify(buildFallbackOptions(raw_text)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("suggest-profiles error:", err);
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

// Fallback when AI fails: simple keyword matching
function buildFallbackOptions(rawText: string) {
  const normalized = rawText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const scored = FLAT_CATALOG.map(entry => {
    let score = 0;
    for (const kw of entry.keywords) {
      const normKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(normKw)) score += normKw.length;
    }
    const normLabel = entry.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(normLabel)) score += 20;
    return { ...entry, score };
  }).filter(e => e.score > 0).sort((a, b) => b.score - a.score);

  const best = scored[0] || FLAT_CATALOG.find(e => e.id === "freelance_independiente")!;
  const alt = scored[1] || FLAT_CATALOG.find(e => e.sectorId === best?.sectorId && e.id !== best?.id) || FLAT_CATALOG[0];

  const makeProfile = (entry: typeof FLAT_CATALOG[0], origin: string, precisionPct: number) => ({
    title: entry.label,
    catalog_id: entry.id,
    sector_id: entry.sectorId,
    sector_label: entry.sectorLabel,
    subtype: entry.label,
    tags: entry.keywords.slice(0, 3),
    reason: origin === "a_medida" ? "Perfil armado a tu medida exacta" : `Coincide con lo que describiste`,
    origin,
    confidence: origin === "a_medida" ? "media" : (scored[0]?.score > 10 ? "alta" : "media"),
    precision_percent: precisionPct,
    universal_profile: {
      display_name: entry.label,
      activity_type: "negocio",
      parent_sector: entry.sectorLabel,
      subtype: entry.label,
      keywords: entry.keywords,
      offerings: [],
      customer_type: "ambos",
      channels: ["local"],
      business_model: "mixto",
      success_metrics: ["Ingresos mensuales", "Clientes nuevos", "Satisfacción"],
      primary_pains: ["Captar clientes", "Diferenciación", "Gestión del tiempo"],
      opportunity_angles: ["Presencia digital", "Fidelización", "Eficiencia operativa"],
      tone_and_context: "Perfil generado por fallback",
      business_stage: "active",
    },
  });

  const bestPrecision = best.score > 15 ? 85 : best.score > 10 ? 70 : 55;
  const altPrecision = Math.max(bestPrecision - 20, 30);
  return {
    options: [
      makeProfile(best, "catalogo", bestPrecision),
      makeProfile(alt, "catalogo", altPrecision),
      {
        ...makeProfile(best, "a_medida", Math.max(bestPrecision - 10, 40)),
        title: `${rawText.slice(0, 50).trim()} (personalizado)`,
        reason: "Perfil armado exacto a lo que describiste",
      },
    ],
    needs_clarification: false,
    confidence_top: scored[0]?.score > 10 ? "alta" : "media",
  };
}
