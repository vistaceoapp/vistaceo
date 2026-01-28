// =============================================
// JUGUETERÍA Y HOBBIES - Cuestionario Hiper-Personalizado
// Sector: A3_RETAIL | Tipo: JUGUETERIA_HOBBIES
// =============================================

import { UniversalQuestion } from '../../universalQuestionsEngine';

export const JUGUETERIA_QUESTIONS: UniversalQuestion[] = [
  // ========== QUICK MODE (12-15 preguntas esenciales) ==========
  
  {
    id: 'JUG_Q01_PERFIL',
    category: 'identity',
    mode: 'quick',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es el enfoque principal de tu juguetería?',
      'pt-BR': 'Qual é o foco principal da sua loja de brinquedos?'
    },
    type: 'single',
    options: [
      { id: 'general', label: { es: 'Juguetería general (todo tipo)', 'pt-BR': 'Loja geral (todo tipo)' }, emoji: '🎮' },
      { id: 'didactico', label: { es: 'Enfoque didáctico/educativo', 'pt-BR': 'Foco didático/educativo' }, emoji: '🧩' },
      { id: 'bebes', label: { es: 'Especializada en bebés/primera infancia', 'pt-BR': 'Especializada em bebês/primeira infância' }, emoji: '👶' },
      { id: 'coleccionables', label: { es: 'Coleccionables/figuras', 'pt-BR': 'Colecionáveis/figuras' }, emoji: '🎭' },
      { id: 'hobbies', label: { es: 'Hobbies (modelismo, puzzles, etc)', 'pt-BR': 'Hobbies (modelismo, puzzles, etc)' }, emoji: '🧱' },
      { id: 'videojuegos', label: { es: 'Incluye videojuegos', 'pt-BR': 'Inclui videogames' }, emoji: '🎮' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q02_ANTIGUEDAD',
    category: 'identity',
    mode: 'quick',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Cuántos años lleva operando tu juguetería?',
      'pt-BR': 'Há quantos anos sua loja de brinquedos está operando?'
    },
    type: 'single',
    options: [
      { id: 'nuevo', label: { es: 'Menos de 1 año', 'pt-BR': 'Menos de 1 ano' }, emoji: '🌱' },
      { id: '1-3', label: { es: '1 a 3 años', 'pt-BR': '1 a 3 anos' }, emoji: '🎈' },
      { id: '3-10', label: { es: '3 a 10 años', 'pt-BR': '3 a 10 anos' }, emoji: '🎪' },
      { id: '10+', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q03_RANGO_EDAD',
    category: 'customer',
    mode: 'quick',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Para qué rango de edad vendés más juguetes?',
      'pt-BR': 'Para qual faixa etária você vende mais brinquedos?'
    },
    type: 'single',
    options: [
      { id: 'bebes', label: { es: '0-2 años (bebés)', 'pt-BR': '0-2 anos (bebês)' }, emoji: '👶' },
      { id: 'preescolar', label: { es: '3-5 años (preescolar)', 'pt-BR': '3-5 anos (pré-escolar)' }, emoji: '🧒' },
      { id: 'ninos', label: { es: '6-10 años (niños)', 'pt-BR': '6-10 anos (crianças)' }, emoji: '👦' },
      { id: 'preadolescentes', label: { es: '11-14 años (preadolescentes)', 'pt-BR': '11-14 anos (pré-adolescentes)' }, emoji: '🎮' },
      { id: 'coleccionistas', label: { es: 'Adultos coleccionistas', 'pt-BR': 'Adultos colecionadores' }, emoji: '👨' },
      { id: 'todos', label: { es: 'Variado/todas las edades', 'pt-BR': 'Variado/todas as idades' }, emoji: '👨‍👩‍👧‍👦' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q04_TICKET_PROMEDIO',
    category: 'sales',
    mode: 'quick',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu ticket promedio de venta?',
      'pt-BR': 'Qual é seu ticket médio de venda?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos de $20 USD', 'pt-BR': 'Menos de R$100' }, emoji: '💵' },
      { id: 'medio_bajo', label: { es: '$20-40 USD', 'pt-BR': 'R$100-200' }, emoji: '💰' },
      { id: 'medio', label: { es: '$40-80 USD', 'pt-BR': 'R$200-400' }, emoji: '💎' },
      { id: 'alto', label: { es: '$80-150 USD', 'pt-BR': 'R$400-750' }, emoji: '👑' },
      { id: 'muy_alto', label: { es: 'Más de $150 USD', 'pt-BR': 'Mais de R$750' }, emoji: '🏆' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q05_MARCAS',
    category: 'offering',
    mode: 'quick',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Con qué tipo de marcas trabajás?',
      'pt-BR': 'Com que tipo de marcas você trabalha?'
    },
    type: 'single',
    options: [
      { id: 'premium', label: { es: 'Marcas premium (LEGO, Fisher-Price, etc)', 'pt-BR': 'Marcas premium (LEGO, Fisher-Price, etc)' }, emoji: '⭐' },
      { id: 'mix', label: { es: 'Mix de premium y económicas', 'pt-BR': 'Mix de premium e econômicas' }, emoji: '⚖️' },
      { id: 'economicas', label: { es: 'Principalmente económicas', 'pt-BR': 'Principalmente econômicas' }, emoji: '💰' },
      { id: 'importados', label: { es: 'Importados directos', 'pt-BR': 'Importados diretos' }, emoji: '🌍' },
      { id: 'artesanales', label: { es: 'Artesanales/nacionales', 'pt-BR': 'Artesanais/nacionais' }, emoji: '🎨' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q06_TRANSACCIONES',
    category: 'sales',
    mode: 'quick',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuántas ventas hacés en un día normal?',
      'pt-BR': 'Quantas vendas você faz em um dia normal?'
    },
    type: 'single',
    options: [
      { id: 'muy_bajo', label: { es: 'Menos de 10', 'pt-BR': 'Menos de 10' }, emoji: '📉' },
      { id: 'bajo', label: { es: '10-25', 'pt-BR': '10-25' }, emoji: '📊' },
      { id: 'medio', label: { es: '25-50', 'pt-BR': '25-50' }, emoji: '📈' },
      { id: 'alto', label: { es: '50-100', 'pt-BR': '50-100' }, emoji: '🚀' },
      { id: 'muy_alto', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, emoji: '⭐' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q07_MARGEN',
    category: 'finances',
    mode: 'quick',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu margen bruto promedio?',
      'pt-BR': 'Qual é sua margem bruta média?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, emoji: '📉' },
      { id: 'medio_bajo', label: { es: '25-35%', 'pt-BR': '25-35%' }, emoji: '📊' },
      { id: 'medio', label: { es: '35-50%', 'pt-BR': '35-50%' }, emoji: '📈' },
      { id: 'alto', label: { es: '50-65%', 'pt-BR': '50-65%' }, emoji: '💰' },
      { id: 'muy_alto', label: { es: 'Más del 65%', 'pt-BR': 'Mais de 65%' }, emoji: '💎' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q08_CAPTACION',
    category: 'marketing',
    mode: 'quick',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cómo llegan la mayoría de tus clientes?',
      'pt-BR': 'Como chegam a maioria dos seus clientes?'
    },
    type: 'single',
    options: [
      { id: 'ubicacion', label: { es: 'Por la ubicación (paso)', 'pt-BR': 'Pela localização (passagem)' }, emoji: '📍' },
      { id: 'boca_boca', label: { es: 'Recomendación', 'pt-BR': 'Recomendação' }, emoji: '🗣️' },
      { id: 'redes', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
      { id: 'google', label: { es: 'Búsqueda Google/Maps', 'pt-BR': 'Busca Google/Maps' }, emoji: '🔍' },
      { id: 'eventos', label: { es: 'Eventos/ferias infantiles', 'pt-BR': 'Eventos/feiras infantis' }, emoji: '🎪' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q09_EQUIPO',
    category: 'team',
    mode: 'quick',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuántas personas trabajan en la juguetería?',
      'pt-BR': 'Quantas pessoas trabalham na loja?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
      { id: 'familiar', label: { es: '2-3 (familiar)', 'pt-BR': '2-3 (familiar)' }, emoji: '👨‍👩‍👧' },
      { id: 'pequeno', label: { es: '4-6 empleados', 'pt-BR': '4-6 funcionários' }, emoji: '👥' },
      { id: 'mediano', label: { es: '7-15 empleados', 'pt-BR': '7-15 funcionários' }, emoji: '👨‍💼' },
      { id: 'grande', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🏢' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q10_SISTEMA',
    category: 'technology',
    mode: 'quick',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Qué sistema usás para gestionar ventas?',
      'pt-BR': 'Qual sistema você usa para gerenciar vendas?'
    },
    type: 'single',
    options: [
      { id: 'manual', label: { es: 'Manual/planillas', 'pt-BR': 'Manual/planilhas' }, emoji: '📝' },
      { id: 'pos_basico', label: { es: 'POS básico', 'pt-BR': 'POS básico' }, emoji: '💻' },
      { id: 'pos_inventario', label: { es: 'POS con inventario', 'pt-BR': 'POS com estoque' }, emoji: '🖥️' },
      { id: 'erp', label: { es: 'Sistema completo/ERP', 'pt-BR': 'Sistema completo/ERP' }, emoji: '⚙️' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q11_ESTACIONALIDAD',
    category: 'risks',
    mode: 'quick',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuánto representan las ventas de temporada alta (Navidad, Día del Niño)?',
      'pt-BR': 'Quanto representam as vendas de alta temporada (Natal, Dia das Crianças)?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos del 30% del año', 'pt-BR': 'Menos de 30% do ano' }, emoji: '📊' },
      { id: 'moderado', label: { es: '30-50% del año', 'pt-BR': '30-50% do ano' }, emoji: '📈' },
      { id: 'alto', label: { es: '50-70% del año', 'pt-BR': '50-70% do ano' }, emoji: '🎄' },
      { id: 'muy_alto', label: { es: 'Más del 70% del año', 'pt-BR': 'Mais de 70% do ano' }, emoji: '🎅' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_Q12_OBJETIVO',
    category: 'goals',
    mode: 'quick',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es tu principal objetivo para este año?',
      'pt-BR': 'Qual é seu principal objetivo para este ano?'
    },
    type: 'single',
    options: [
      { id: 'ventas', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈' },
      { id: 'margen', label: { es: 'Mejorar márgenes', 'pt-BR': 'Melhorar margens' }, emoji: '💰' },
      { id: 'online', label: { es: 'Crecer en ventas online', 'pt-BR': 'Crescer em vendas online' }, emoji: '🛒' },
      { id: 'expansion', label: { es: 'Abrir otra tienda', 'pt-BR': 'Abrir outra loja' }, emoji: '🏪' },
      { id: 'estabilidad', label: { es: 'Reducir estacionalidad', 'pt-BR': 'Reduzir sazonalidade' }, emoji: '⚖️' }
    ],
    required: true,
    businessTypes: ['JUGUETERIA_HOBBIES']
  },

  // ========== COMPLETE MODE (55+ preguntas adicionales) ==========

  {
    id: 'JUG_C01_DIFERENCIADOR',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Qué te diferencia de otras jugueterías?',
      'pt-BR': 'O que te diferencia de outras lojas de brinquedos?'
    },
    type: 'multi',
    options: [
      { id: 'variedad', label: { es: 'Mayor variedad', 'pt-BR': 'Maior variedade' }, emoji: '📦' },
      { id: 'exclusivas', label: { es: 'Marcas exclusivas', 'pt-BR': 'Marcas exclusivas' }, emoji: '⭐' },
      { id: 'precios', label: { es: 'Mejores precios', 'pt-BR': 'Melhores preços' }, emoji: '💰' },
      { id: 'atencion', label: { es: 'Atención personalizada', 'pt-BR': 'Atendimento personalizado' }, emoji: '🤝' },
      { id: 'experiencia', label: { es: 'Experiencia de compra', 'pt-BR': 'Experiência de compra' }, emoji: '✨' },
      { id: 'eventos', label: { es: 'Eventos/actividades', 'pt-BR': 'Eventos/atividades' }, emoji: '🎪' },
      { id: 'envoltorio', label: { es: 'Servicio de envoltura regalo', 'pt-BR': 'Serviço de embrulho presente' }, emoji: '🎁' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C02_METROS',
    category: 'identity',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Cuántos metros cuadrados tiene tu local?',
      'pt-BR': 'Quantos metros quadrados tem seu local?'
    },
    type: 'single',
    options: [
      { id: 'pequeno', label: { es: 'Menos de 50m²', 'pt-BR': 'Menos de 50m²' }, emoji: '🏠' },
      { id: 'mediano', label: { es: '50-120m²', 'pt-BR': '50-120m²' }, emoji: '🏪' },
      { id: 'grande', label: { es: '120-300m²', 'pt-BR': '120-300m²' }, emoji: '🏬' },
      { id: 'muy_grande', label: { es: 'Más de 300m²', 'pt-BR': 'Mais de 300m²' }, emoji: '🏢' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C03_CATEGORIAS_TOP',
    category: 'offering',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué categorías de juguetes vendés más?',
      'pt-BR': 'Quais categorias de brinquedos você mais vende?'
    },
    type: 'multi',
    options: [
      { id: 'munecas', label: { es: 'Muñecas y accesorios', 'pt-BR': 'Bonecas e acessórios' }, emoji: '👧' },
      { id: 'vehiculos', label: { es: 'Vehículos/autos', 'pt-BR': 'Veículos/carros' }, emoji: '🚗' },
      { id: 'construccion', label: { es: 'Construcción (LEGO, bloques)', 'pt-BR': 'Construção (LEGO, blocos)' }, emoji: '🧱' },
      { id: 'peluches', label: { es: 'Peluches', 'pt-BR': 'Pelúcias' }, emoji: '🧸' },
      { id: 'juegos_mesa', label: { es: 'Juegos de mesa', 'pt-BR': 'Jogos de tabuleiro' }, emoji: '🎲' },
      { id: 'electronico', label: { es: 'Electrónicos/robótica', 'pt-BR': 'Eletrônicos/robótica' }, emoji: '🤖' },
      { id: 'exterior', label: { es: 'Exterior (bicicletas, etc)', 'pt-BR': 'Exterior (bicicletas, etc)' }, emoji: '🚲' },
      { id: 'didacticos', label: { es: 'Didácticos/educativos', 'pt-BR': 'Didáticos/educativos' }, emoji: '🧩' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C04_SKU_COUNT',
    category: 'offering',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Cuántos productos diferentes manejás aproximadamente?',
      'pt-BR': 'Quantos produtos diferentes você gerencia aproximadamente?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos de 500', 'pt-BR': 'Menos de 500' }, emoji: '📦' },
      { id: 'medio', label: { es: '500-2,000', 'pt-BR': '500-2.000' }, emoji: '📚' },
      { id: 'alto', label: { es: '2,000-5,000', 'pt-BR': '2.000-5.000' }, emoji: '🏪' },
      { id: 'muy_alto', label: { es: 'Más de 5,000', 'pt-BR': 'Mais de 5.000' }, emoji: '🏬' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C05_LICENCIAS',
    category: 'offering',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué licencias/personajes vendés más?',
      'pt-BR': 'Quais licenças/personagens você mais vende?'
    },
    type: 'multi',
    options: [
      { id: 'disney', label: { es: 'Disney/Marvel/Star Wars', 'pt-BR': 'Disney/Marvel/Star Wars' }, emoji: '🏰' },
      { id: 'pokemon', label: { es: 'Pokémon', 'pt-BR': 'Pokémon' }, emoji: '⚡' },
      { id: 'paw_patrol', label: { es: 'Paw Patrol/Peppa', 'pt-BR': 'Patrulha Canina/Peppa' }, emoji: '🐕' },
      { id: 'barbie', label: { es: 'Barbie/Hot Wheels', 'pt-BR': 'Barbie/Hot Wheels' }, emoji: '💖' },
      { id: 'lego', label: { es: 'LEGO/construcción', 'pt-BR': 'LEGO/construção' }, emoji: '🧱' },
      { id: 'videojuegos', label: { es: 'Nintendo/PlayStation', 'pt-BR': 'Nintendo/PlayStation' }, emoji: '🎮' },
      { id: 'genericos', label: { es: 'Principalmente genéricos', 'pt-BR': 'Principalmente genéricos' }, emoji: '📦' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C06_COMPRADOR_VS_USUARIO',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Quién compra normalmente en tu tienda?',
      'pt-BR': 'Quem normalmente compra na sua loja?'
    },
    type: 'single',
    options: [
      { id: 'padres', label: { es: 'Principalmente padres', 'pt-BR': 'Principalmente pais' }, emoji: '👨‍👩‍👧' },
      { id: 'abuelos', label: { es: 'Muchos abuelos', 'pt-BR': 'Muitos avós' }, emoji: '👴👵' },
      { id: 'ninos', label: { es: 'Niños con dinero propio', 'pt-BR': 'Crianças com dinheiro próprio' }, emoji: '🧒' },
      { id: 'corporativo', label: { es: 'Empresas (regalos corporativos)', 'pt-BR': 'Empresas (presentes corporativos)' }, emoji: '🏢' },
      { id: 'coleccionistas', label: { es: 'Coleccionistas adultos', 'pt-BR': 'Colecionadores adultos' }, emoji: '👨' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C07_OCASION_COMPRA',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Cuál es la ocasión de compra más común?',
      'pt-BR': 'Qual é a ocasião de compra mais comum?'
    },
    type: 'single',
    options: [
      { id: 'cumpleanos', label: { es: 'Cumpleaños', 'pt-BR': 'Aniversários' }, emoji: '🎂' },
      { id: 'navidad', label: { es: 'Navidad/Reyes', 'pt-BR': 'Natal' }, emoji: '🎄' },
      { id: 'dia_nino', label: { es: 'Día del Niño', 'pt-BR': 'Dia das Crianças' }, emoji: '👧' },
      { id: 'premio', label: { es: 'Premio/capricho', 'pt-BR': 'Prêmio/capricho' }, emoji: '🌟' },
      { id: 'educativo', label: { es: 'Desarrollo/educación', 'pt-BR': 'Desenvolvimento/educação' }, emoji: '🧩' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C08_FRECUENCIA',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Con qué frecuencia vuelven tus clientes?',
      'pt-BR': 'Com que frequência seus clientes voltam?'
    },
    type: 'single',
    options: [
      { id: 'mensual', label: { es: 'Mensualmente', 'pt-BR': 'Mensalmente' }, emoji: '📅' },
      { id: 'bimestral', label: { es: 'Cada 2-3 meses', 'pt-BR': 'A cada 2-3 meses' }, emoji: '📆' },
      { id: 'temporada', label: { es: 'Solo en fechas especiales', 'pt-BR': 'Só em datas especiais' }, emoji: '🎁' },
      { id: 'anual', label: { es: 'Una vez al año o menos', 'pt-BR': 'Uma vez ao ano ou menos' }, emoji: '📊' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C09_CANALES',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿A través de qué canales vendés?',
      'pt-BR': 'Através de quais canais você vende?'
    },
    type: 'multi',
    options: [
      { id: 'local', label: { es: 'Tienda física', 'pt-BR': 'Loja física' }, emoji: '🏪' },
      { id: 'whatsapp', label: { es: 'WhatsApp/pedidos', 'pt-BR': 'WhatsApp/pedidos' }, emoji: '📱' },
      { id: 'web', label: { es: 'Tienda online propia', 'pt-BR': 'Loja online própria' }, emoji: '🌐' },
      { id: 'marketplace', label: { es: 'Marketplaces (ML, Amazon)', 'pt-BR': 'Marketplaces (ML, Amazon)' }, emoji: '🛒' },
      { id: 'instagram', label: { es: 'Ventas por Instagram', 'pt-BR': 'Vendas por Instagram' }, emoji: '📸' },
      { id: 'ferias', label: { es: 'Ferias/eventos', 'pt-BR': 'Feiras/eventos' }, emoji: '🎪' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C10_FACTURACION',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es tu facturación mensual promedio (sin temporada alta)?',
      'pt-BR': 'Qual é seu faturamento mensal médio (fora da alta temporada)?'
    },
    type: 'single',
    options: [
      { id: 'micro', label: { es: 'Menos de $5,000 USD', 'pt-BR': 'Menos de R$25.000' }, emoji: '🌱' },
      { id: 'pequeno', label: { es: '$5,000-15,000 USD', 'pt-BR': 'R$25.000-75.000' }, emoji: '📈' },
      { id: 'mediano', label: { es: '$15,000-40,000 USD', 'pt-BR': 'R$75.000-200.000' }, emoji: '💰' },
      { id: 'grande', label: { es: '$40,000-100,000 USD', 'pt-BR': 'R$200.000-500.000' }, emoji: '💎' },
      { id: 'muy_grande', label: { es: 'Más de $100,000 USD', 'pt-BR': 'Mais de R$500.000' }, emoji: '🏆' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C11_PAGOS',
    category: 'sales',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Qué métodos de pago aceptás?',
      'pt-BR': 'Quais métodos de pagamento você aceita?'
    },
    type: 'multi',
    options: [
      { id: 'efectivo', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵' },
      { id: 'tarjetas', label: { es: 'Tarjetas débito/crédito', 'pt-BR': 'Cartões débito/crédito' }, emoji: '💳' },
      { id: 'qr', label: { es: 'QR/billeteras digitales', 'pt-BR': 'QR/carteiras digitais' }, emoji: '📱' },
      { id: 'cuotas', label: { es: 'Cuotas sin interés', 'pt-BR': 'Parcelamento sem juros' }, emoji: '📊' },
      { id: 'transferencia', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C12_ENVOLTORIO',
    category: 'sales',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Ofrecés servicio de envoltorio de regalo?',
      'pt-BR': 'Você oferece serviço de embrulho de presente?'
    },
    type: 'single',
    options: [
      { id: 'gratis', label: { es: 'Sí, gratis', 'pt-BR': 'Sim, grátis' }, emoji: '🎁' },
      { id: 'pago', label: { es: 'Sí, con costo', 'pt-BR': 'Sim, com custo' }, emoji: '💰' },
      { id: 'basico', label: { es: 'Solo bolsa de regalo', 'pt-BR': 'Só sacola de presente' }, emoji: '🛍️' },
      { id: 'no', label: { es: 'No ofrezco', 'pt-BR': 'Não ofereço' }, emoji: '❌' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C13_MARGEN_MARCA',
    category: 'finances',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es tu margen en marcas premium vs económicas?',
      'pt-BR': 'Qual é sua margem em marcas premium vs econômicas?'
    },
    type: 'single',
    options: [
      { id: 'premium_mejor', label: { es: 'Mejor margen en premium', 'pt-BR': 'Melhor margem em premium' }, emoji: '⭐' },
      { id: 'economicas_mejor', label: { es: 'Mejor margen en económicas', 'pt-BR': 'Melhor margem em econômicas' }, emoji: '💰' },
      { id: 'similar', label: { es: 'Similar en ambas', 'pt-BR': 'Similar em ambas' }, emoji: '⚖️' },
      { id: 'solo_premium', label: { es: 'Solo vendo premium', 'pt-BR': 'Só vendo premium' }, emoji: '👑' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C14_PROVEEDORES',
    category: 'operations',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cómo te abastecés principalmente?',
      'pt-BR': 'Como você se abastece principalmente?'
    },
    type: 'single',
    options: [
      { id: 'distribuidores', label: { es: 'Distribuidores locales', 'pt-BR': 'Distribuidores locais' }, emoji: '📦' },
      { id: 'fabricantes', label: { es: 'Directo de fabricantes', 'pt-BR': 'Direto de fabricantes' }, emoji: '🏭' },
      { id: 'importacion', label: { es: 'Importación directa', 'pt-BR': 'Importação direta' }, emoji: '🌍' },
      { id: 'mix', label: { es: 'Mix de varios', 'pt-BR': 'Mix de vários' }, emoji: '🔄' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C15_STOCK_PROBLEMA',
    category: 'operations',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cuál es tu principal problema con el stock?',
      'pt-BR': 'Qual é seu principal problema com o estoque?'
    },
    type: 'single',
    options: [
      { id: 'sobrestock', label: { es: 'Sobrestock post-temporada', 'pt-BR': 'Excesso de estoque pós-temporada' }, emoji: '📦' },
      { id: 'faltantes', label: { es: 'Faltantes en temporada alta', 'pt-BR': 'Falta em alta temporada' }, emoji: '⚠️' },
      { id: 'rotacion', label: { es: 'Productos de baja rotación', 'pt-BR': 'Produtos de baixa rotação' }, emoji: '🔄' },
      { id: 'capital', label: { es: 'Capital inmovilizado', 'pt-BR': 'Capital imobilizado' }, emoji: '💰' },
      { id: 'ninguno', label: { es: 'No tengo problemas graves', 'pt-BR': 'Não tenho problemas graves' }, emoji: '✅' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C16_ROTACION',
    category: 'operations',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cada cuánto rotás tu inventario completo?',
      'pt-BR': 'A cada quanto você gira seu estoque completo?'
    },
    type: 'single',
    options: [
      { id: 'mensual', label: { es: 'Mensualmente', 'pt-BR': 'Mensalmente' }, emoji: '🚀' },
      { id: 'bimestral', label: { es: 'Cada 2-3 meses', 'pt-BR': 'A cada 2-3 meses' }, emoji: '📈' },
      { id: 'semestral', label: { es: 'Cada 6 meses', 'pt-BR': 'A cada 6 meses' }, emoji: '📊' },
      { id: 'anual', label: { es: 'Una vez al año', 'pt-BR': 'Uma vez ao ano' }, emoji: '📉' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C17_PRESENCIA_DIGITAL',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué presencia digital tenés?',
      'pt-BR': 'Qual presença digital você tem?'
    },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram activo', 'pt-BR': 'Instagram ativo' }, emoji: '📸' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘' },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
      { id: 'google', label: { es: 'Google My Business', 'pt-BR': 'Google Meu Negócio' }, emoji: '🔍' },
      { id: 'web', label: { es: 'Sitio web', 'pt-BR': 'Site' }, emoji: '🌐' },
      { id: 'ninguna', label: { es: 'Muy poca', 'pt-BR': 'Muito pouca' }, emoji: '❌' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C18_PUBLICIDAD',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Invertís en publicidad paga?',
      'pt-BR': 'Você investe em publicidade paga?'
    },
    type: 'single',
    options: [
      { id: 'constante', label: { es: 'Sí, todo el año', 'pt-BR': 'Sim, o ano todo' }, emoji: '📢' },
      { id: 'temporada', label: { es: 'Solo en temporada alta', 'pt-BR': 'Só em alta temporada' }, emoji: '🎄' },
      { id: 'poco', label: { es: 'Muy poco', 'pt-BR': 'Muito pouco' }, emoji: '💵' },
      { id: 'no', label: { es: 'No invierto', 'pt-BR': 'Não invisto' }, emoji: '❌' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C19_EVENTOS',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Organizás eventos o actividades para niños?',
      'pt-BR': 'Você organiza eventos ou atividades para crianças?'
    },
    type: 'single',
    options: [
      { id: 'frecuente', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🎪' },
      { id: 'especial', label: { es: 'En fechas especiales', 'pt-BR': 'Em datas especiais' }, emoji: '🎂' },
      { id: 'no_interes', label: { es: 'No, pero me interesa', 'pt-BR': 'Não, mas me interessa' }, emoji: '🤔' },
      { id: 'no', label: { es: 'No organizo', 'pt-BR': 'Não organizo' }, emoji: '❌' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C20_FIDELIZACION',
    category: 'retention',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Tenés programa de fidelización?',
      'pt-BR': 'Você tem programa de fidelização?'
    },
    type: 'single',
    options: [
      { id: 'digital', label: { es: 'Sí, sistema digital', 'pt-BR': 'Sim, sistema digital' }, emoji: '📱' },
      { id: 'tarjeta', label: { es: 'Tarjeta de puntos/físico', 'pt-BR': 'Cartão de pontos/físico' }, emoji: '🎫' },
      { id: 'descuentos', label: { es: 'Descuentos a frecuentes', 'pt-BR': 'Descontos para frequentes' }, emoji: '💰' },
      { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C21_DEVOLUCIONES',
    category: 'retention',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Cuál es tu política de cambios/devoluciones?',
      'pt-BR': 'Qual é sua política de trocas/devoluções?'
    },
    type: 'single',
    options: [
      { id: 'flexible', label: { es: 'Muy flexible (30+ días)', 'pt-BR': 'Muito flexível (30+ dias)' }, emoji: '✅' },
      { id: 'estandar', label: { es: 'Estándar (15 días)', 'pt-BR': 'Padrão (15 dias)' }, emoji: '📋' },
      { id: 'estricta', label: { es: 'Estricta (solo defectos)', 'pt-BR': 'Estrita (só defeitos)' }, emoji: '⚠️' },
      { id: 'caso', label: { es: 'Caso por caso', 'pt-BR': 'Caso a caso' }, emoji: '🤝' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C22_ROLES',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Qué roles tenés en tu equipo?',
      'pt-BR': 'Quais funções você tem na sua equipe?'
    },
    type: 'multi',
    options: [
      { id: 'vendedores', label: { es: 'Vendedores', 'pt-BR': 'Vendedores' }, emoji: '👥' },
      { id: 'cajero', label: { es: 'Cajero', 'pt-BR': 'Caixa' }, emoji: '💰' },
      { id: 'repositor', label: { es: 'Repositor/stock', 'pt-BR': 'Repositor/estoque' }, emoji: '📦' },
      { id: 'admin', label: { es: 'Administrativo', 'pt-BR': 'Administrativo' }, emoji: '💼' },
      { id: 'todos', label: { es: 'Todos hacen todo', 'pt-BR': 'Todos fazem tudo' }, emoji: '🔄' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C23_CAPACITACION',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Tu equipo conoce bien los productos que vende?',
      'pt-BR': 'Sua equipe conhece bem os produtos que vende?'
    },
    type: 'single',
    options: [
      { id: 'expertos', label: { es: 'Sí, son expertos', 'pt-BR': 'Sim, são especialistas' }, emoji: '⭐' },
      { id: 'bien', label: { es: 'Conocimiento adecuado', 'pt-BR': 'Conhecimento adequado' }, emoji: '✅' },
      { id: 'basico', label: { es: 'Conocimiento básico', 'pt-BR': 'Conhecimento básico' }, emoji: '📚' },
      { id: 'mejorar', label: { es: 'Necesitan capacitación', 'pt-BR': 'Precisam de capacitação' }, emoji: '📖' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C24_COMPETENCIA',
    category: 'risks',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Cuántas jugueterías competidoras hay cerca?',
      'pt-BR': 'Quantas lojas de brinquedos concorrentes há por perto?'
    },
    type: 'single',
    options: [
      { id: 'ninguna', label: { es: 'Ninguna directa', 'pt-BR': 'Nenhuma direta' }, emoji: '🏆' },
      { id: 'pocas', label: { es: '1-2 competidores', 'pt-BR': '1-2 concorrentes' }, emoji: '📊' },
      { id: 'varias', label: { es: '3-5 competidores', 'pt-BR': '3-5 concorrentes' }, emoji: '📈' },
      { id: 'muchas', label: { es: 'Más de 5', 'pt-BR': 'Mais de 5' }, emoji: '⚠️' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C25_AMENAZA_ONLINE',
    category: 'risks',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuánto te afecta la competencia online (Amazon, ML)?',
      'pt-BR': 'Quanto a concorrência online (Amazon, ML) te afeta?'
    },
    type: 'single',
    options: [
      { id: 'mucho', label: { es: 'Mucho, perdí clientes', 'pt-BR': 'Muito, perdi clientes' }, emoji: '📉' },
      { id: 'moderado', label: { es: 'Moderadamente', 'pt-BR': 'Moderadamente' }, emoji: '📊' },
      { id: 'poco', label: { es: 'Poco', 'pt-BR': 'Pouco' }, emoji: '📈' },
      { id: 'nada', label: { es: 'No me afecta', 'pt-BR': 'Não me afeta' }, emoji: '✅' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C26_MAYOR_DESAFIO',
    category: 'risks',
    mode: 'complete',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es tu mayor desafío actual?',
      'pt-BR': 'Qual é seu maior desafio atual?'
    },
    type: 'single',
    options: [
      { id: 'estacionalidad', label: { es: 'Reducir dependencia de temporada', 'pt-BR': 'Reduzir dependência de temporada' }, emoji: '📅' },
      { id: 'competencia', label: { es: 'Competencia online', 'pt-BR': 'Concorrência online' }, emoji: '🌐' },
      { id: 'margenes', label: { es: 'Mejorar márgenes', 'pt-BR': 'Melhorar margens' }, emoji: '💰' },
      { id: 'stock', label: { es: 'Gestión de inventario', 'pt-BR': 'Gestão de estoque' }, emoji: '📦' },
      { id: 'digital', label: { es: 'Presencia digital', 'pt-BR': 'Presença digital' }, emoji: '📱' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  },
  {
    id: 'JUG_C27_PROYECCION',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Dónde ves tu juguetería en 3 años?',
      'pt-BR': 'Onde você vê sua loja em 3 anos?'
    },
    type: 'single',
    options: [
      { id: 'expansion', label: { es: 'Más sucursales', 'pt-BR': 'Mais filiais' }, emoji: '📈' },
      { id: 'online', label: { es: 'Fuerte en online', 'pt-BR': 'Forte no online' }, emoji: '🌐' },
      { id: 'especializada', label: { es: 'Más especializada', 'pt-BR': 'Mais especializada' }, emoji: '🎯' },
      { id: 'mantener', label: { es: 'Mantener y optimizar', 'pt-BR': 'Manter e otimizar' }, emoji: '⚖️' }
    ],
    businessTypes: ['JUGUETERIA_HOBBIES']
  }
];

export default JUGUETERIA_QUESTIONS;
