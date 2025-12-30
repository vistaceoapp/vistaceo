// Business Type Specific Questions - 5-10% super-focused per type
// These are the ultra-specific questions that only apply to each business type
// Now mapped to the refined 18 gastro business types

import type { GastroQuestion } from './gastroQuestionsEngine';

// ============= BUSINESS TYPE ID MAPPING =============
// Maps new refined type IDs to arrays of old IDs for backward compatibility
export const BUSINESS_TYPE_ALIASES: Record<string, string[]> = {
  // New refined IDs -> Old IDs that should match
  'restaurant_general': ['A1_T001_RESTAURANTE', 'restaurant_general'],
  'alta_cocina': ['A1_T002_ALTA_COCINA', 'A1_T020_COCINA_AUTOR', 'alta_cocina'],
  'bodegon_cantina': ['A1_T003_BISTRO', 'A1_T004_BODEGON', 'bodegon_cantina'],
  'parrilla_asador': ['A1_T005_PARRILLA', 'parrilla_asador'],
  'cocina_criolla': ['A1_T022_COCINA_CRIOLLA', 'cocina_criolla'],
  'pescados_mariscos': ['A1_T010_MARISQUERIA', 'A1_T025_CEVICHERIA', 'pescados_mariscos'],
  'pizzeria': ['A1_T006_PIZZERIA', 'pizzeria'],
  'panaderia': ['A1_T008_PANADERIA', 'panaderia'],
  'pastas_italiana': ['A1_T007_PASTAS', 'pastas_italiana'],
  'heladeria': ['A1_T018_HELADERIA', 'heladeria'],
  'fast_food': ['A1_T024_FAST_FOOD', 'A1_T023_HAMBURGUESERIA', 'A1_T026_FOOD_TRUCK', 'fast_food'],
  'cafeteria_pasteleria': ['A1_T009_CAFETERIA', 'A1_T017_PASTELERIA', 'cafeteria_pasteleria'],
  'cocina_asiatica': ['A1_T011_SUSHI', 'A1_T012_ASIATICA', 'cocina_asiatica'],
  'cocina_arabe': ['A1_T013_ARABE', 'cocina_arabe'],
  'cocina_saludable': ['A1_T014_SALUDABLE', 'A1_T015_VEGGIE', 'cocina_saludable'],
  'bar_cerveceria': ['A1_T011_BAR', 'A1_T012_PUB', 'A1_T013_CERVECERIA', 'A1_T019_WINE_BAR', 'A1_T014_COCTELERIA', 'bar_cerveceria'],
  'servicio_comida': ['A1_T016_CATERING', 'A1_T027_TAKEAWAY', 'A1_T028_VIANDAS', 'servicio_comida'],
  'dark_kitchen': ['A1_T021_DARK_KITCHEN', 'dark_kitchen'],
};

// Helper to check if a question matches a business type (handles aliases)
export function matchesBusinessType(questionTypes: string[] | undefined, businessTypeId: string): boolean {
  if (!questionTypes) return false;
  
  const aliases = BUSINESS_TYPE_ALIASES[businessTypeId] || [businessTypeId];
  return questionTypes.some(qt => aliases.includes(qt));
}

// ============= PIZZERIA QUESTIONS (5 questions - ~6%) =============
export const PIZZERIA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_PIZZA_OVEN_TYPE',
    category: 'operation',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { 
      es: '¿Qué tipo de horno usás?', 
      'pt-BR': 'Que tipo de forno você usa?' 
    },
    help: { 
      es: 'El horno define tu pizza', 
      'pt-BR': 'O forno define sua pizza' 
    },
    type: 'single',
    required: true,
    businessTypes: ['pizzeria'],
    options: [
      { id: 'wood', label: { es: 'Horno a leña', 'pt-BR': 'Forno a lenha' }, emoji: '🔥', impactScore: 15 },
      { id: 'gas', label: { es: 'Horno a gas', 'pt-BR': 'Forno a gás' }, emoji: '🔵', impactScore: 8 },
      { id: 'electric', label: { es: 'Horno eléctrico', 'pt-BR': 'Forno elétrico' }, emoji: '⚡', impactScore: 5 },
      { id: 'conveyor', label: { es: 'Horno de cinta', 'pt-BR': 'Forno esteira' }, emoji: '🍕', impactScore: 3 },
      { id: 'multiple', label: { es: 'Varios tipos', 'pt-BR': 'Vários tipos' }, emoji: '✨', impactScore: 10 },
    ],
  },
  {
    id: 'Q_PIZZA_STYLE',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Qué estilo de pizza es tu especialidad?', 
      'pt-BR': 'Qual estilo de pizza é sua especialidade?' 
    },
    type: 'multi',
    businessTypes: ['pizzeria'],
    options: [
      { id: 'napolitana', label: { es: 'Napolitana', 'pt-BR': 'Napolitana' }, emoji: '🇮🇹', impactScore: 10 },
      { id: 'argentina', label: { es: 'Estilo argentino/media masa', 'pt-BR': 'Estilo argentino' }, emoji: '🇦🇷', impactScore: 8, countries: ['AR', 'UY'] },
      { id: 'americana', label: { es: 'Americana', 'pt-BR': 'Americana' }, emoji: '🇺🇸', impactScore: 6 },
      { id: 'romana', label: { es: 'Romana (al taglio)', 'pt-BR': 'Romana (al taglio)' }, emoji: '🍕', impactScore: 8 },
      { id: 'detroit', label: { es: 'Detroit style', 'pt-BR': 'Estilo Detroit' }, emoji: '🧀', impactScore: 7 },
      { id: 'massa_fina', label: { es: 'Masa fina artesanal', 'pt-BR': 'Massa fina artesanal' }, emoji: '👨‍🍳', impactScore: 8 },
    ],
  },
  {
    id: 'Q_PIZZA_DOUGH',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: { 
      es: '¿Cómo manejás la masa?', 
      'pt-BR': 'Como você gerencia a massa?' 
    },
    type: 'single',
    businessTypes: ['pizzeria'],
    options: [
      { id: 'fresh_daily', label: { es: 'Fresca todos los días', 'pt-BR': 'Fresca todos os dias' }, emoji: '🥖', impactScore: 15 },
      { id: 'fermented_48h', label: { es: 'Fermentación lenta (+48hs)', 'pt-BR': 'Fermentação lenta (+48h)' }, emoji: '⏰', impactScore: 20 },
      { id: 'pre_made', label: { es: 'Pre-hecha/congelada', 'pt-BR': 'Pré-pronta/congelada' }, emoji: '❄️', impactScore: -5 },
      { id: 'mixed', label: { es: 'Combino métodos', 'pt-BR': 'Combino métodos' }, emoji: '🔄', impactScore: 5 },
    ],
  },
  {
    id: 'Q_PIZZA_TOP_SELLER',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 6,
    title: { 
      es: '¿Cuál es tu pizza más vendida?', 
      'pt-BR': 'Qual é sua pizza mais vendida?' 
    },
    type: 'single',
    businessTypes: ['pizzeria'],
    options: [
      { id: 'muzzarella', label: { es: 'Muzzarella/Margherita', 'pt-BR': 'Mussarela/Margherita' }, emoji: '🧀', impactScore: 5 },
      { id: 'pepperoni', label: { es: 'Pepperoni/Calabresa', 'pt-BR': 'Calabresa/Pepperoni' }, emoji: '🔴', impactScore: 5 },
      { id: 'especial', label: { es: 'Especial de la casa', 'pt-BR': 'Especial da casa' }, emoji: '⭐', impactScore: 15 },
      { id: 'fugazzeta', label: { es: 'Fugazzeta/Cebolla', 'pt-BR': 'Cebola' }, emoji: '🧅', impactScore: 8, countries: ['AR', 'UY'] },
      { id: 'other', label: { es: 'Otra', 'pt-BR': 'Outra' }, emoji: '🍕', impactScore: 5 },
    ],
  },
  {
    id: 'Q_PIZZA_DELIVERY_TIME',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: { 
      es: 'Tiempo promedio desde pedido hasta entrega', 
      'pt-BR': 'Tempo médio do pedido até a entrega' 
    },
    type: 'single',
    businessTypes: ['pizzeria'],
    options: [
      { id: 'fast_20', label: { es: 'Menos de 20 min', 'pt-BR': 'Menos de 20 min' }, emoji: '🚀', impactScore: 20 },
      { id: 'normal_30', label: { es: '20-30 min', 'pt-BR': '20-30 min' }, emoji: '👍', impactScore: 10 },
      { id: 'slow_45', label: { es: '30-45 min', 'pt-BR': '30-45 min' }, emoji: '😐', impactScore: 0 },
      { id: 'very_slow', label: { es: 'Más de 45 min', 'pt-BR': 'Mais de 45 min' }, emoji: '🐢', impactScore: -10 },
    ],
  },
];

// ============= CAFETERIA / PASTELERIA QUESTIONS (5 questions - ~6%) =============
export const CAFETERIA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_COFFEE_SOURCE',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿De dónde viene tu café?', 
      'pt-BR': 'De onde vem seu café?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['cafeteria_pasteleria'],
    options: [
      { id: 'specialty_roaster', label: { es: 'Tostador de especialidad', 'pt-BR': 'Torrefação de especialidade' }, emoji: '☕', impactScore: 20 },
      { id: 'own_roast', label: { es: 'Tostamos nosotros', 'pt-BR': 'Torramos nós mesmos' }, emoji: '🔥', impactScore: 25 },
      { id: 'commercial', label: { es: 'Marca comercial', 'pt-BR': 'Marca comercial' }, emoji: '📦', impactScore: 0 },
      { id: 'mixed', label: { es: 'Mezcla de varios', 'pt-BR': 'Mistura de vários' }, emoji: '🔄', impactScore: 10 },
    ],
  },
  {
    id: 'Q_ESPRESSO_MACHINE',
    category: 'operation',
    mode: 'both',
    dimension: 'profitability',
    weight: 7,
    title: { 
      es: '¿Qué máquina de espresso usás?', 
      'pt-BR': 'Que máquina de espresso você usa?' 
    },
    type: 'single',
    businessTypes: ['cafeteria_pasteleria'],
    options: [
      { id: 'professional', label: { es: 'Profesional (La Marzocco, etc)', 'pt-BR': 'Profissional (La Marzocco, etc)' }, emoji: '🏆', impactScore: 20 },
      { id: 'semi_pro', label: { es: 'Semi-profesional', 'pt-BR': 'Semi-profissional' }, emoji: '👍', impactScore: 10 },
      { id: 'automatic', label: { es: 'Automática', 'pt-BR': 'Automática' }, emoji: '🤖', impactScore: 5 },
      { id: 'basic', label: { es: 'Básica', 'pt-BR': 'Básica' }, emoji: '☕', impactScore: 0 },
    ],
  },
  {
    id: 'Q_COFFEE_MENU',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { 
      es: '¿Qué especialidades de café ofrecés?', 
      'pt-BR': 'Que especialidades de café você oferece?' 
    },
    type: 'multi',
    businessTypes: ['cafeteria_pasteleria'],
    options: [
      { id: 'espresso', label: { es: 'Espresso clásico', 'pt-BR': 'Espresso clássico' }, emoji: '☕', impactScore: 5 },
      { id: 'latte_art', label: { es: 'Latte art', 'pt-BR': 'Latte art' }, emoji: '🎨', impactScore: 10 },
      { id: 'specialty', label: { es: 'Café de especialidad', 'pt-BR': 'Café especial' }, emoji: '✨', impactScore: 15 },
      { id: 'cold_brew', label: { es: 'Cold brew', 'pt-BR': 'Cold brew' }, emoji: '🧊', impactScore: 8 },
      { id: 'filter', label: { es: 'Métodos filtrados (V60, etc)', 'pt-BR': 'Métodos filtrados (V60, etc)' }, emoji: '⏳', impactScore: 12 },
      { id: 'plant_milk', label: { es: 'Leches vegetales', 'pt-BR': 'Leites vegetais' }, emoji: '🥛', impactScore: 8 },
    ],
  },
  {
    id: 'Q_PASTRY_SOURCE',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 7,
    title: { 
      es: '¿Cómo es tu pastelería/repostería?', 
      'pt-BR': 'Como é sua confeitaria?' 
    },
    type: 'single',
    businessTypes: ['cafeteria_pasteleria'],
    options: [
      { id: 'own_production', label: { es: 'Producción propia', 'pt-BR': 'Produção própria' }, emoji: '👨‍🍳', impactScore: 20 },
      { id: 'local_supplier', label: { es: 'Proveedor artesanal local', 'pt-BR': 'Fornecedor artesanal local' }, emoji: '🏪', impactScore: 15 },
      { id: 'mixed', label: { es: 'Mezcla propia + externa', 'pt-BR': 'Misto próprio + externo' }, emoji: '🔄', impactScore: 10 },
      { id: 'external', label: { es: 'Todo externo', 'pt-BR': 'Tudo externo' }, emoji: '📦', impactScore: 0 },
    ],
  },
  {
    id: 'Q_CAFE_ATMOSPHERE',
    category: 'operation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: { 
      es: '¿Cuál es el ambiente principal de tu café?', 
      'pt-BR': 'Qual é o ambiente principal do seu café?' 
    },
    type: 'single',
    businessTypes: ['cafeteria_pasteleria'],
    options: [
      { id: 'work_friendly', label: { es: 'Para trabajar/estudiar', 'pt-BR': 'Para trabalhar/estudar' }, emoji: '💻', impactScore: 10 },
      { id: 'social', label: { es: 'Para charlar/reunirse', 'pt-BR': 'Para conversar/encontros' }, emoji: '👥', impactScore: 10 },
      { id: 'quick', label: { es: 'Rápido/Para llevar', 'pt-BR': 'Rápido/Para viagem' }, emoji: '⚡', impactScore: 5 },
      { id: 'cozy', label: { es: 'Acogedor/Artesanal', 'pt-BR': 'Aconchegante/Artesanal' }, emoji: '🏡', impactScore: 12 },
    ],
  },
];

// ============= BAR / CERVECERIA / COCTELERIA QUESTIONS (5 questions - ~6%) =============
export const BAR_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_BAR_SPECIALTY',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Cuál es tu especialidad principal?', 
      'pt-BR': 'Qual é sua especialidade principal?' 
    },
    type: 'multi',
    required: true,
    businessTypes: ['bar_cerveceria'],
    options: [
      { id: 'cocktails', label: { es: 'Cócteles clásicos', 'pt-BR': 'Coquetéis clássicos' }, emoji: '🍸', impactScore: 10 },
      { id: 'signature', label: { es: 'Tragos de autor', 'pt-BR': 'Drinks autorais' }, emoji: '✨', impactScore: 15 },
      { id: 'craft_beer', label: { es: 'Cerveza artesanal', 'pt-BR': 'Cerveja artesanal' }, emoji: '🍺', impactScore: 12 },
      { id: 'wine', label: { es: 'Vinos', 'pt-BR': 'Vinhos' }, emoji: '🍷', impactScore: 12 },
      { id: 'spirits', label: { es: 'Destilados premium', 'pt-BR': 'Destilados premium' }, emoji: '🥃', impactScore: 10 },
      { id: 'shots', label: { es: 'Shots/Tragos cortos', 'pt-BR': 'Shots/Doses' }, emoji: '🔥', impactScore: 5 },
    ],
  },
  {
    id: 'Q_BAR_BARTENDER',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 8,
    title: { 
      es: '¿Tenés bartender profesional?', 
      'pt-BR': 'Você tem bartender profissional?' 
    },
    type: 'single',
    businessTypes: ['bar_cerveceria'],
    options: [
      { id: 'yes_trained', label: { es: 'Sí, con formación', 'pt-BR': 'Sim, com formação' }, emoji: '🏆', impactScore: 20 },
      { id: 'yes_exp', label: { es: 'Sí, con experiencia', 'pt-BR': 'Sim, com experiência' }, emoji: '👍', impactScore: 15 },
      { id: 'learning', label: { es: 'Aprendiendo', 'pt-BR': 'Aprendendo' }, emoji: '📚', impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: -5 },
    ],
  },
  {
    id: 'Q_BAR_FOOD',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: { 
      es: '¿Ofrecés comida?', 
      'pt-BR': 'Você oferece comida?' 
    },
    type: 'single',
    businessTypes: ['bar_cerveceria'],
    options: [
      { id: 'full_kitchen', label: { es: 'Sí, cocina completa', 'pt-BR': 'Sim, cozinha completa' }, emoji: '🍽️', impactScore: 15 },
      { id: 'snacks', label: { es: 'Picadas/Snacks', 'pt-BR': 'Petiscos/Snacks' }, emoji: '🍟', impactScore: 10 },
      { id: 'minimal', label: { es: 'Mínimo/Básico', 'pt-BR': 'Mínimo/Básico' }, emoji: '🥜', impactScore: 5 },
      { id: 'no', label: { es: 'No, solo bebidas', 'pt-BR': 'Não, só bebidas' }, emoji: '🍻', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BAR_HAPPY_HOUR',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: { 
      es: '¿Tenés happy hour u ofertas especiales?', 
      'pt-BR': 'Você tem happy hour ou ofertas especiais?' 
    },
    type: 'multi',
    businessTypes: ['bar_cerveceria'],
    options: [
      { id: 'happy_hour', label: { es: 'Happy hour', 'pt-BR': 'Happy hour' }, emoji: '🍻', impactScore: 10 },
      { id: '2x1', label: { es: '2x1 en tragos', 'pt-BR': '2x1 em drinks' }, emoji: '🍹', impactScore: 8 },
      { id: 'live_music', label: { es: 'Música en vivo', 'pt-BR': 'Música ao vivo' }, emoji: '🎸', impactScore: 12 },
      { id: 'none', label: { es: 'No hacemos', 'pt-BR': 'Não fazemos' }, emoji: '❌', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BAR_PEAK_NIGHTS',
    category: 'operation',
    mode: 'both',
    dimension: 'traffic',
    weight: 6,
    title: { 
      es: '¿Cuáles son tus noches más fuertes?', 
      'pt-BR': 'Quais são suas noites mais fortes?' 
    },
    type: 'multi',
    businessTypes: ['bar_cerveceria'],
    options: [
      { id: 'thu_fri', label: { es: 'Jueves y Viernes', 'pt-BR': 'Quinta e Sexta' }, emoji: '🎉', impactScore: 12 },
      { id: 'saturday', label: { es: 'Sábado', 'pt-BR': 'Sábado' }, emoji: '🥳', impactScore: 15 },
      { id: 'weekdays', label: { es: 'Entre semana', 'pt-BR': 'Dias de semana' }, emoji: '📅', impactScore: 8 },
      { id: 'sunday', label: { es: 'Domingo', 'pt-BR': 'Domingo' }, emoji: '☀️', impactScore: 5 },
    ],
  },
];

// ============= HELADERIA QUESTIONS (5 questions - ~6%) =============
export const HELADERIA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_ICE_CREAM_TYPE',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Qué tipo de helado hacés?', 
      'pt-BR': 'Que tipo de sorvete você faz?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['heladeria'],
    options: [
      { id: 'artisanal', label: { es: 'Artesanal propio', 'pt-BR': 'Artesanal próprio' }, emoji: '👨‍🍳', impactScore: 25 },
      { id: 'italian', label: { es: 'Estilo italiano/Gelato', 'pt-BR': 'Estilo italiano/Gelato' }, emoji: '🇮🇹', impactScore: 20 },
      { id: 'american', label: { es: 'Estilo americano', 'pt-BR': 'Estilo americano' }, emoji: '🇺🇸', impactScore: 10 },
      { id: 'soft_serve', label: { es: 'Soft serve/Máquina', 'pt-BR': 'Soft serve/Máquina' }, emoji: '🍦', impactScore: 5 },
      { id: 'industrial', label: { es: 'Industrial/Marca', 'pt-BR': 'Industrial/Marca' }, emoji: '📦', impactScore: 0 },
    ],
  },
  {
    id: 'Q_ICE_CREAM_FLAVORS',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 7,
    title: { 
      es: '¿Cuántos sabores tenés disponibles?', 
      'pt-BR': 'Quantos sabores você tem disponíveis?' 
    },
    type: 'single',
    businessTypes: ['heladeria'],
    options: [
      { id: '1-10', label: { es: '1-10 sabores', 'pt-BR': '1-10 sabores' }, impactScore: 5 },
      { id: '11-20', label: { es: '11-20 sabores', 'pt-BR': '11-20 sabores' }, impactScore: 10 },
      { id: '21-40', label: { es: '21-40 sabores', 'pt-BR': '21-40 sabores' }, impactScore: 15 },
      { id: '40+', label: { es: 'Más de 40', 'pt-BR': 'Mais de 40' }, impactScore: 12 },
    ],
  },
  {
    id: 'Q_ICE_CREAM_PRODUCTION',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: { 
      es: '¿Dónde producís el helado?', 
      'pt-BR': 'Onde você produz o sorvete?' 
    },
    type: 'single',
    businessTypes: ['heladeria'],
    options: [
      { id: 'on_site', label: { es: 'En el local', 'pt-BR': 'No local' }, emoji: '🏪', impactScore: 15 },
      { id: 'central_kitchen', label: { es: 'Cocina central propia', 'pt-BR': 'Cozinha central própria' }, emoji: '🏭', impactScore: 12 },
      { id: 'supplier', label: { es: 'Proveedor externo', 'pt-BR': 'Fornecedor externo' }, emoji: '🚚', impactScore: 0 },
    ],
  },
  {
    id: 'Q_ICE_CREAM_SPECIAL',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 6,
    title: { 
      es: '¿Ofrecés opciones especiales?', 
      'pt-BR': 'Você oferece opções especiais?' 
    },
    type: 'multi',
    businessTypes: ['heladeria'],
    options: [
      { id: 'sugar_free', label: { es: 'Sin azúcar', 'pt-BR': 'Sem açúcar' }, emoji: '🍃', impactScore: 8 },
      { id: 'vegan', label: { es: 'Vegano', 'pt-BR': 'Vegano' }, emoji: '🌱', impactScore: 10 },
      { id: 'gluten_free', label: { es: 'Sin gluten', 'pt-BR': 'Sem glúten' }, emoji: '🌾', impactScore: 8 },
      { id: 'premium', label: { es: 'Línea premium', 'pt-BR': 'Linha premium' }, emoji: '✨', impactScore: 10 },
    ],
  },
  {
    id: 'Q_ICE_CREAM_SEASON',
    category: 'operation',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: { 
      es: '¿Cómo varía tu negocio por temporada?', 
      'pt-BR': 'Como seu negócio varia por temporada?' 
    },
    type: 'single',
    businessTypes: ['heladeria'],
    options: [
      { id: 'very_seasonal', label: { es: 'Muy estacional (verano fuerte)', 'pt-BR': 'Muito sazonal (verão forte)' }, emoji: '☀️', impactScore: 0 },
      { id: 'moderate', label: { es: 'Moderado', 'pt-BR': 'Moderado' }, emoji: '🔄', impactScore: 8 },
      { id: 'stable', label: { es: 'Estable todo el año', 'pt-BR': 'Estável o ano todo' }, emoji: '📈', impactScore: 15 },
    ],
  },
];

// ============= PANADERIA QUESTIONS (5 questions - ~6%) =============
export const PANADERIA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_BAKERY_PRODUCTION',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: { 
      es: '¿Cómo es tu producción?', 
      'pt-BR': 'Como é sua produção?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['panaderia'],
    options: [
      { id: 'own_100', label: { es: '100% propia', 'pt-BR': '100% própria' }, emoji: '👨‍🍳', impactScore: 25 },
      { id: 'own_mostly', label: { es: 'Mayormente propia', 'pt-BR': 'Principalmente própria' }, emoji: '🥖', impactScore: 18 },
      { id: 'mixed', label: { es: 'Mezcla propia + externa', 'pt-BR': 'Misto próprio + externo' }, emoji: '🔄', impactScore: 10 },
      { id: 'resale', label: { es: 'Reventa principalmente', 'pt-BR': 'Revenda principalmente' }, emoji: '📦', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BAKERY_SCHEDULE',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 7,
    title: { 
      es: '¿A qué hora horneás?', 
      'pt-BR': 'A que hora você assa?' 
    },
    type: 'single',
    businessTypes: ['panaderia'],
    options: [
      { id: 'dawn', label: { es: 'Madrugada (3-6am)', 'pt-BR': 'Madrugada (3-6h)' }, emoji: '🌙', impactScore: 15 },
      { id: 'early_morning', label: { es: 'Mañana temprano (6-9am)', 'pt-BR': 'Manhã cedo (6-9h)' }, emoji: '☀️', impactScore: 12 },
      { id: 'throughout', label: { es: 'Varias veces al día', 'pt-BR': 'Várias vezes ao dia' }, emoji: '🔄', impactScore: 18 },
      { id: 'pre_baked', label: { es: 'Pre-horneado/recalentado', 'pt-BR': 'Pré-assado/reaquecido' }, emoji: '❄️', impactScore: 5 },
    ],
  },
  {
    id: 'Q_BAKERY_SPECIALTY',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { 
      es: '¿Cuál es tu producto estrella?', 
      'pt-BR': 'Qual é seu produto estrela?' 
    },
    type: 'multi',
    businessTypes: ['panaderia'],
    options: [
      { id: 'bread', label: { es: 'Pan tradicional', 'pt-BR': 'Pão tradicional' }, emoji: '🍞', impactScore: 8 },
      { id: 'facturas', label: { es: 'Facturas/Medialunas', 'pt-BR': 'Pães doces/Croissants' }, emoji: '🥐', impactScore: 12 },
      { id: 'artisan', label: { es: 'Pan artesanal/sourdough', 'pt-BR': 'Pão artesanal/fermentação natural' }, emoji: '🥖', impactScore: 18 },
      { id: 'cakes', label: { es: 'Tortas/Pastelería', 'pt-BR': 'Bolos/Confeitaria' }, emoji: '🎂', impactScore: 15 },
      { id: 'sandwiches', label: { es: 'Sándwiches/Para llevar', 'pt-BR': 'Sanduíches/Para viagem' }, emoji: '🥪', impactScore: 10 },
    ],
  },
  {
    id: 'Q_BAKERY_INGREDIENTS',
    category: 'operation',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: { 
      es: '¿Usás ingredientes especiales?', 
      'pt-BR': 'Você usa ingredientes especiais?' 
    },
    type: 'multi',
    businessTypes: ['panaderia'],
    options: [
      { id: 'organic', label: { es: 'Orgánicos', 'pt-BR': 'Orgânicos' }, emoji: '🌿', impactScore: 10 },
      { id: 'local', label: { es: 'Locales/De origen', 'pt-BR': 'Locais/De origem' }, emoji: '🏡', impactScore: 12 },
      { id: 'imported', label: { es: 'Importados premium', 'pt-BR': 'Importados premium' }, emoji: '✈️', impactScore: 8 },
      { id: 'standard', label: { es: 'Estándar comercial', 'pt-BR': 'Padrão comercial' }, emoji: '📦', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BAKERY_WHOLESALE',
    category: 'sales',
    mode: 'complete',
    dimension: 'finances',
    weight: 5,
    title: { 
      es: '¿Vendés al por mayor?', 
      'pt-BR': 'Você vende no atacado?' 
    },
    type: 'single',
    businessTypes: ['panaderia'],
    options: [
      { id: 'yes_main', label: { es: 'Sí, es mi fuerte', 'pt-BR': 'Sim, é meu forte' }, emoji: '📊', impactScore: 15 },
      { id: 'yes_some', label: { es: 'Sí, algo', 'pt-BR': 'Sim, um pouco' }, emoji: '🔄', impactScore: 10 },
      { id: 'no_retail', label: { es: 'No, solo minorista', 'pt-BR': 'Não, só varejo' }, emoji: '🏪', impactScore: 5 },
    ],
  },
];

// ============= PARRILLA / ASADOR QUESTIONS (4 questions - ~5%) =============
export const PARRILLA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_PARRILLA_FUEL',
    category: 'operation',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { 
      es: '¿Qué combustible usás para la parrilla?', 
      'pt-BR': 'Que combustível você usa para a churrasqueira?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['parrilla_asador'],
    options: [
      { id: 'wood', label: { es: 'Leña/Quebracho', 'pt-BR': 'Lenha/Quebracho' }, emoji: '🪵', impactScore: 20 },
      { id: 'charcoal', label: { es: 'Carbón vegetal', 'pt-BR': 'Carvão vegetal' }, emoji: '🔥', impactScore: 15 },
      { id: 'gas', label: { es: 'Gas', 'pt-BR': 'Gás' }, emoji: '🔵', impactScore: 5 },
      { id: 'mixed', label: { es: 'Combino', 'pt-BR': 'Combino' }, emoji: '🔄', impactScore: 12 },
    ],
  },
  {
    id: 'Q_PARRILLA_CUTS',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Qué cortes son tu especialidad?', 
      'pt-BR': 'Quais cortes são sua especialidade?' 
    },
    type: 'multi',
    businessTypes: ['parrilla_asador'],
    options: [
      { id: 'asado', label: { es: 'Asado de tira/Costilla', 'pt-BR': 'Costela' }, emoji: '🥩', impactScore: 15, countries: ['AR', 'UY'] },
      { id: 'bife', label: { es: 'Bife de chorizo/Ancho', 'pt-BR': 'Picanha/Fraldinha' }, emoji: '🥩', impactScore: 12 },
      { id: 'vacio', label: { es: 'Vacío', 'pt-BR': 'Vazio' }, emoji: '🥩', impactScore: 10, countries: ['AR', 'UY'] },
      { id: 'achuras', label: { es: 'Achuras/Mollejas', 'pt-BR': 'Miúdos' }, emoji: '🍖', impactScore: 8 },
      { id: 'cordero', label: { es: 'Cordero', 'pt-BR': 'Cordeiro' }, emoji: '🐑', impactScore: 10 },
      { id: 'cerdo', label: { es: 'Cerdo/Bondiola', 'pt-BR': 'Porco' }, emoji: '🐷', impactScore: 8 },
    ],
  },
  {
    id: 'Q_PARRILLA_SOURCE',
    category: 'operation',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: { 
      es: '¿De dónde viene tu carne?', 
      'pt-BR': 'De onde vem sua carne?' 
    },
    type: 'single',
    businessTypes: ['parrilla_asador'],
    options: [
      { id: 'premium_supplier', label: { es: 'Proveedor premium/Angus', 'pt-BR': 'Fornecedor premium/Angus' }, emoji: '⭐', impactScore: 20 },
      { id: 'local_butcher', label: { es: 'Carnicería de barrio', 'pt-BR': 'Açougue local' }, emoji: '🏪', impactScore: 12 },
      { id: 'wholesale', label: { es: 'Frigorífico mayorista', 'pt-BR': 'Frigorífico atacado' }, emoji: '🏭', impactScore: 8 },
      { id: 'mixed', label: { es: 'Varios proveedores', 'pt-BR': 'Vários fornecedores' }, emoji: '🔄', impactScore: 10 },
    ],
  },
  {
    id: 'Q_PARRILLA_SIDES',
    category: 'menu',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: { 
      es: '¿Qué guarniciones destacan?', 
      'pt-BR': 'Quais acompanhamentos se destacam?' 
    },
    type: 'multi',
    businessTypes: ['parrilla_asador'],
    options: [
      { id: 'ensaladas', label: { es: 'Ensaladas frescas', 'pt-BR': 'Saladas frescas' }, emoji: '🥗', impactScore: 8 },
      { id: 'papas', label: { es: 'Papas fritas/al horno', 'pt-BR': 'Batatas fritas/assadas' }, emoji: '🍟', impactScore: 5 },
      { id: 'provoleta', label: { es: 'Provoleta/Quesos', 'pt-BR': 'Queijo coalho' }, emoji: '🧀', impactScore: 10 },
      { id: 'empanadas', label: { es: 'Empanadas', 'pt-BR': 'Empanadas' }, emoji: '🥟', impactScore: 8 },
    ],
  },
];

// ============= FAST FOOD QUESTIONS (4 questions - ~5%) =============
export const FAST_FOOD_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_FF_CONCEPT',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { 
      es: '¿Cuál es tu concepto principal?', 
      'pt-BR': 'Qual é seu conceito principal?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['fast_food'],
    options: [
      { id: 'burgers', label: { es: 'Hamburguesas/Burgers', 'pt-BR': 'Hambúrgueres' }, emoji: '🍔', impactScore: 12 },
      { id: 'hot_dogs', label: { es: 'Panchos/Hot dogs', 'pt-BR': 'Hot dogs/Cachorros' }, emoji: '🌭', impactScore: 10 },
      { id: 'fried_chicken', label: { es: 'Pollo frito', 'pt-BR': 'Frango frito' }, emoji: '🍗', impactScore: 10 },
      { id: 'tacos', label: { es: 'Tacos/Mexicano', 'pt-BR': 'Tacos/Mexicano' }, emoji: '🌮', impactScore: 10 },
      { id: 'mixed', label: { es: 'Variado', 'pt-BR': 'Variado' }, emoji: '🍽️', impactScore: 8 },
    ],
  },
  {
    id: 'Q_FF_SPEED',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: { 
      es: 'Tiempo promedio de preparación', 
      'pt-BR': 'Tempo médio de preparação' 
    },
    type: 'single',
    businessTypes: ['fast_food'],
    options: [
      { id: 'ultra_fast', label: { es: 'Menos de 5 min', 'pt-BR': 'Menos de 5 min' }, emoji: '⚡', impactScore: 20 },
      { id: 'fast', label: { es: '5-10 min', 'pt-BR': '5-10 min' }, emoji: '🚀', impactScore: 15 },
      { id: 'normal', label: { es: '10-15 min', 'pt-BR': '10-15 min' }, emoji: '👍', impactScore: 8 },
      { id: 'slow', label: { es: 'Más de 15 min', 'pt-BR': 'Mais de 15 min' }, emoji: '🐢', impactScore: 0 },
    ],
  },
  {
    id: 'Q_FF_FORMAT',
    category: 'operation',
    mode: 'both',
    dimension: 'traffic',
    weight: 7,
    title: { 
      es: '¿Cuál es tu formato de operación?', 
      'pt-BR': 'Qual é seu formato de operação?' 
    },
    type: 'multi',
    businessTypes: ['fast_food'],
    options: [
      { id: 'counter', label: { es: 'Mostrador/Para llevar', 'pt-BR': 'Balcão/Para viagem' }, emoji: '🏪', impactScore: 8 },
      { id: 'dine_in', label: { es: 'Salón pequeño', 'pt-BR': 'Salão pequeno' }, emoji: '🪑', impactScore: 10 },
      { id: 'food_truck', label: { es: 'Food truck', 'pt-BR': 'Food truck' }, emoji: '🚚', impactScore: 12 },
      { id: 'kiosk', label: { es: 'Puesto/Kiosco', 'pt-BR': 'Quiosque' }, emoji: '🏗️', impactScore: 8 },
      { id: 'delivery_only', label: { es: 'Solo delivery', 'pt-BR': 'Só delivery' }, emoji: '📱', impactScore: 10 },
    ],
  },
  {
    id: 'Q_FF_COMBOS',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: { 
      es: '¿Trabajás con combos?', 
      'pt-BR': 'Você trabalha com combos?' 
    },
    type: 'single',
    businessTypes: ['fast_food'],
    options: [
      { id: 'main_driver', label: { es: 'Sí, son mi fuerte', 'pt-BR': 'Sim, são meu forte' }, emoji: '📊', impactScore: 18 },
      { id: 'available', label: { es: 'Tengo algunos', 'pt-BR': 'Tenho alguns' }, emoji: '👍', impactScore: 10 },
      { id: 'no_combos', label: { es: 'No, productos individuales', 'pt-BR': 'Não, produtos individuais' }, emoji: '1️⃣', impactScore: 5 },
    ],
  },
];

// ============= DARK KITCHEN QUESTIONS (4 questions - ~5%) =============
export const DARK_KITCHEN_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_DK_BRANDS',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: { 
      es: '¿Cuántas marcas/conceptos operás?', 
      'pt-BR': 'Quantas marcas/conceitos você opera?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['dark_kitchen'],
    options: [
      { id: 'single', label: { es: 'Una sola marca', 'pt-BR': 'Uma só marca' }, emoji: '1️⃣', impactScore: 10 },
      { id: 'two_three', label: { es: '2-3 marcas', 'pt-BR': '2-3 marcas' }, emoji: '🔢', impactScore: 15 },
      { id: 'multi', label: { es: '4+ marcas', 'pt-BR': '4+ marcas' }, emoji: '📊', impactScore: 12 },
    ],
  },
  {
    id: 'Q_DK_PLATFORMS',
    category: 'operation',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { 
      es: '¿En qué plataformas estás?', 
      'pt-BR': 'Em quais plataformas você está?' 
    },
    type: 'multi',
    businessTypes: ['dark_kitchen'],
    options: [
      { id: 'rappi', label: { es: 'Rappi', 'pt-BR': 'Rappi' }, emoji: '🟡', impactScore: 8 },
      { id: 'pedidosya', label: { es: 'PedidosYa', 'pt-BR': 'PedidosYa' }, emoji: '🟠', impactScore: 8, countries: ['AR', 'UY'] },
      { id: 'ifood', label: { es: 'iFood', 'pt-BR': 'iFood' }, emoji: '🔴', impactScore: 10, countries: ['BR'] },
      { id: 'ubereats', label: { es: 'Uber Eats', 'pt-BR': 'Uber Eats' }, emoji: '⚫', impactScore: 8 },
      { id: 'own_web', label: { es: 'Web propia', 'pt-BR': 'Site próprio' }, emoji: '🌐', impactScore: 15 },
      { id: 'whatsapp', label: { es: 'WhatsApp directo', 'pt-BR': 'WhatsApp direto' }, emoji: '💬', impactScore: 10 },
    ],
  },
  {
    id: 'Q_DK_KITCHEN_SIZE',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: { 
      es: '¿Tamaño de tu cocina?', 
      'pt-BR': 'Tamanho da sua cozinha?' 
    },
    type: 'single',
    businessTypes: ['dark_kitchen'],
    options: [
      { id: 'small', label: { es: 'Pequeña (<30m²)', 'pt-BR': 'Pequena (<30m²)' }, emoji: '🏠', impactScore: 5 },
      { id: 'medium', label: { es: 'Mediana (30-80m²)', 'pt-BR': 'Média (30-80m²)' }, emoji: '🏢', impactScore: 12 },
      { id: 'large', label: { es: 'Grande (>80m²)', 'pt-BR': 'Grande (>80m²)' }, emoji: '🏭', impactScore: 15 },
      { id: 'shared', label: { es: 'Compartida/Hub', 'pt-BR': 'Compartilhada/Hub' }, emoji: '👥', impactScore: 8 },
    ],
  },
  {
    id: 'Q_DK_PACKAGING',
    category: 'operation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: { 
      es: '¿Cómo es tu packaging?', 
      'pt-BR': 'Como é sua embalagem?' 
    },
    type: 'single',
    businessTypes: ['dark_kitchen'],
    options: [
      { id: 'branded', label: { es: 'Personalizado con marca', 'pt-BR': 'Personalizado com marca' }, emoji: '✨', impactScore: 18 },
      { id: 'eco', label: { es: 'Eco-friendly', 'pt-BR': 'Ecológico' }, emoji: '🌱', impactScore: 15 },
      { id: 'standard', label: { es: 'Estándar genérico', 'pt-BR': 'Padrão genérico' }, emoji: '📦', impactScore: 5 },
    ],
  },
];

// ============= ALTA COCINA / GOURMET QUESTIONS (4 questions - ~5%) =============
export const ALTA_COCINA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_AC_MENU_TYPE',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Cómo es tu formato de menú?', 
      'pt-BR': 'Como é seu formato de cardápio?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['alta_cocina'],
    options: [
      { id: 'tasting', label: { es: 'Menú degustación', 'pt-BR': 'Menu degustação' }, emoji: '🍽️', impactScore: 20 },
      { id: 'a_la_carte', label: { es: 'A la carta premium', 'pt-BR': 'À la carte premium' }, emoji: '📋', impactScore: 15 },
      { id: 'mixed', label: { es: 'Ambos', 'pt-BR': 'Ambos' }, emoji: '✨', impactScore: 18 },
    ],
  },
  {
    id: 'Q_AC_PAIRING',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 7,
    title: { 
      es: '¿Ofrecés maridaje de vinos?', 
      'pt-BR': 'Você oferece harmonização de vinhos?' 
    },
    type: 'single',
    businessTypes: ['alta_cocina'],
    options: [
      { id: 'sommelier', label: { es: 'Sí, con sommelier', 'pt-BR': 'Sim, com sommelier' }, emoji: '🍷', impactScore: 20 },
      { id: 'curated', label: { es: 'Carta curada', 'pt-BR': 'Carta curada' }, emoji: '📚', impactScore: 12 },
      { id: 'basic', label: { es: 'Básico', 'pt-BR': 'Básico' }, emoji: '🍾', impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 0 },
    ],
  },
  {
    id: 'Q_AC_RESERVATIONS',
    category: 'operation',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { 
      es: '¿Cómo manejás las reservas?', 
      'pt-BR': 'Como você gerencia as reservas?' 
    },
    type: 'single',
    businessTypes: ['alta_cocina'],
    options: [
      { id: 'only_res', label: { es: 'Solo con reserva', 'pt-BR': 'Só com reserva' }, emoji: '📅', impactScore: 15 },
      { id: 'recommended', label: { es: 'Recomendada', 'pt-BR': 'Recomendada' }, emoji: '👍', impactScore: 12 },
      { id: 'walk_in_ok', label: { es: 'Acepto sin reserva', 'pt-BR': 'Aceito sem reserva' }, emoji: '🚶', impactScore: 8 },
    ],
  },
  {
    id: 'Q_AC_SERVICE_STYLE',
    category: 'team',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: { 
      es: '¿Cómo es tu estilo de servicio?', 
      'pt-BR': 'Como é seu estilo de serviço?' 
    },
    type: 'single',
    businessTypes: ['alta_cocina'],
    options: [
      { id: 'french', label: { es: 'Servicio francés formal', 'pt-BR': 'Serviço francês formal' }, emoji: '🎩', impactScore: 18 },
      { id: 'modern', label: { es: 'Moderno/Desestructurado', 'pt-BR': 'Moderno/Desestruturado' }, emoji: '✨', impactScore: 15 },
      { id: 'relaxed', label: { es: 'Relajado pero atento', 'pt-BR': 'Relaxado mas atento' }, emoji: '😊', impactScore: 12 },
    ],
  },
];

// ============= SERVICIO DE COMIDA (CATERING/TAKEAWAY) QUESTIONS (4 questions - ~5%) =============
export const SERVICIO_COMIDA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_SC_TYPE',
    category: 'identity',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { 
      es: '¿Qué tipo de servicio ofrecés?', 
      'pt-BR': 'Que tipo de serviço você oferece?' 
    },
    type: 'multi',
    required: true,
    businessTypes: ['servicio_comida'],
    options: [
      { id: 'catering', label: { es: 'Catering/Eventos', 'pt-BR': 'Catering/Eventos' }, emoji: '🎉', impactScore: 15 },
      { id: 'viandas', label: { es: 'Viandas/Marmitas por suscripción', 'pt-BR': 'Marmitas por assinatura' }, emoji: '📦', impactScore: 12 },
      { id: 'takeaway', label: { es: 'Take away/Para llevar', 'pt-BR': 'Para viagem' }, emoji: '🥡', impactScore: 10 },
      { id: 'corporate', label: { es: 'Comidas corporativas', 'pt-BR': 'Refeições corporativas' }, emoji: '💼', impactScore: 12 },
      { id: 'private_chef', label: { es: 'Chef privado', 'pt-BR': 'Chef privado' }, emoji: '👨‍🍳', impactScore: 15 },
    ],
  },
  {
    id: 'Q_SC_FREQUENCY',
    category: 'operation',
    mode: 'both',
    dimension: 'finances',
    weight: 7,
    title: { 
      es: '¿Con qué frecuencia recibís pedidos?', 
      'pt-BR': 'Com que frequência você recebe pedidos?' 
    },
    type: 'single',
    businessTypes: ['servicio_comida'],
    options: [
      { id: 'daily', label: { es: 'Diario', 'pt-BR': 'Diário' }, emoji: '📅', impactScore: 18 },
      { id: 'weekly', label: { es: 'Semanal', 'pt-BR': 'Semanal' }, emoji: '📆', impactScore: 12 },
      { id: 'by_event', label: { es: 'Por evento/Ocasional', 'pt-BR': 'Por evento/Ocasional' }, emoji: '🎊', impactScore: 8 },
    ],
  },
  {
    id: 'Q_SC_DELIVERY',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: { 
      es: '¿Cómo entregás?', 
      'pt-BR': 'Como você entrega?' 
    },
    type: 'single',
    businessTypes: ['servicio_comida'],
    options: [
      { id: 'own_fleet', label: { es: 'Flota propia', 'pt-BR': 'Frota própria' }, emoji: '🚚', impactScore: 18 },
      { id: 'third_party', label: { es: 'Tercerizado', 'pt-BR': 'Terceirizado' }, emoji: '📱', impactScore: 10 },
      { id: 'pickup', label: { es: 'Retiran en local', 'pt-BR': 'Retiram no local' }, emoji: '🏪', impactScore: 8 },
      { id: 'mixed', label: { es: 'Combino métodos', 'pt-BR': 'Combino métodos' }, emoji: '🔄', impactScore: 12 },
    ],
  },
  {
    id: 'Q_SC_MIN_ORDER',
    category: 'sales',
    mode: 'complete',
    dimension: 'profitability',
    weight: 5,
    title: { 
      es: '¿Tenés pedido mínimo?', 
      'pt-BR': 'Você tem pedido mínimo?' 
    },
    type: 'single',
    businessTypes: ['servicio_comida'],
    options: [
      { id: 'yes_high', label: { es: 'Sí, alto', 'pt-BR': 'Sim, alto' }, emoji: '📊', impactScore: 12 },
      { id: 'yes_low', label: { es: 'Sí, bajo', 'pt-BR': 'Sim, baixo' }, emoji: '👍', impactScore: 8 },
      { id: 'no_min', label: { es: 'No tengo mínimo', 'pt-BR': 'Não tenho mínimo' }, emoji: '🆓', impactScore: 5 },
    ],
  },
];

// ============= COCINA ASIATICA QUESTIONS (4 questions - ~5%) =============
export const COCINA_ASIATICA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_ASIA_SPECIALTY',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Cuál es tu especialidad principal?', 
      'pt-BR': 'Qual é sua especialidade principal?' 
    },
    type: 'multi',
    required: true,
    businessTypes: ['cocina_asiatica'],
    options: [
      { id: 'sushi', label: { es: 'Sushi/Sashimi', 'pt-BR': 'Sushi/Sashimi' }, emoji: '🍣', impactScore: 15 },
      { id: 'ramen', label: { es: 'Ramen/Fideos', 'pt-BR': 'Ramen/Macarrão' }, emoji: '🍜', impactScore: 12 },
      { id: 'wok', label: { es: 'Wok/Salteados', 'pt-BR': 'Wok/Salteados' }, emoji: '🥡', impactScore: 10 },
      { id: 'dim_sum', label: { es: 'Dim Sum/Dumplings', 'pt-BR': 'Dim Sum/Dumplings' }, emoji: '🥟', impactScore: 12 },
      { id: 'thai', label: { es: 'Tailandés', 'pt-BR': 'Tailandês' }, emoji: '🌶️', impactScore: 10 },
      { id: 'korean', label: { es: 'Coreano/BBQ', 'pt-BR': 'Coreano/BBQ' }, emoji: '🇰🇷', impactScore: 10 },
    ],
  },
  {
    id: 'Q_ASIA_SUSHI_FISH',
    category: 'operation',
    mode: 'both',
    dimension: 'profitability',
    weight: 8,
    title: { 
      es: '¿De dónde viene tu pescado?', 
      'pt-BR': 'De onde vem seu peixe?' 
    },
    type: 'single',
    businessTypes: ['cocina_asiatica'],
    options: [
      { id: 'premium', label: { es: 'Proveedor premium/importado', 'pt-BR': 'Fornecedor premium/importado' }, emoji: '✨', impactScore: 20 },
      { id: 'local_market', label: { es: 'Mercado local de pescado', 'pt-BR': 'Mercado local de peixe' }, emoji: '🐟', impactScore: 12 },
      { id: 'frozen', label: { es: 'Congelado de calidad', 'pt-BR': 'Congelado de qualidade' }, emoji: '❄️', impactScore: 8 },
      { id: 'mixed', label: { es: 'Combino fuentes', 'pt-BR': 'Combino fontes' }, emoji: '🔄', impactScore: 10 },
    ],
  },
  {
    id: 'Q_ASIA_CHEF',
    category: 'team',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: { 
      es: '¿Tenés chef especializado en cocina asiática?', 
      'pt-BR': 'Você tem chef especializado em cozinha asiática?' 
    },
    type: 'single',
    businessTypes: ['cocina_asiatica'],
    options: [
      { id: 'japanese_trained', label: { es: 'Entrenado en Japón/Asia', 'pt-BR': 'Treinado no Japão/Ásia' }, emoji: '🎌', impactScore: 25 },
      { id: 'local_trained', label: { es: 'Formación local especializada', 'pt-BR': 'Formação local especializada' }, emoji: '👨‍🍳', impactScore: 15 },
      { id: 'self_taught', label: { es: 'Autodidacta', 'pt-BR': 'Autodidata' }, emoji: '📚', impactScore: 8 },
      { id: 'no_specialty', label: { es: 'Sin especialización formal', 'pt-BR': 'Sem especialização formal' }, emoji: '🍳', impactScore: 0 },
    ],
  },
  {
    id: 'Q_ASIA_DELIVERY_READY',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: { 
      es: '¿Tu comida viaja bien para delivery?', 
      'pt-BR': 'Sua comida viaja bem para delivery?' 
    },
    type: 'single',
    businessTypes: ['cocina_asiatica'],
    options: [
      { id: 'optimized', label: { es: 'Sí, packaging optimizado', 'pt-BR': 'Sim, embalagem otimizada' }, emoji: '📦', impactScore: 18 },
      { id: 'good', label: { es: 'Sí, funciona bien', 'pt-BR': 'Sim, funciona bem' }, emoji: '👍', impactScore: 12 },
      { id: 'challenging', label: { es: 'Es un desafío', 'pt-BR': 'É um desafio' }, emoji: '😅', impactScore: 5 },
      { id: 'no_delivery', label: { es: 'No hago delivery', 'pt-BR': 'Não faço delivery' }, emoji: '🍽️', impactScore: 0 },
    ],
  },
];

// ============= COCINA SALUDABLE / VEGGIE QUESTIONS (4 questions - ~5%) =============
export const COCINA_SALUDABLE_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_HEALTHY_TYPE',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Cuál es tu enfoque principal?', 
      'pt-BR': 'Qual é seu foco principal?' 
    },
    type: 'multi',
    required: true,
    businessTypes: ['cocina_saludable'],
    options: [
      { id: 'vegetarian', label: { es: 'Vegetariano', 'pt-BR': 'Vegetariano' }, emoji: '🥗', impactScore: 10 },
      { id: 'vegan', label: { es: 'Vegano', 'pt-BR': 'Vegano' }, emoji: '🌱', impactScore: 12 },
      { id: 'organic', label: { es: 'Orgánico/Natural', 'pt-BR': 'Orgânico/Natural' }, emoji: '🍃', impactScore: 15 },
      { id: 'gluten_free', label: { es: 'Sin gluten', 'pt-BR': 'Sem glúten' }, emoji: '🌾', impactScore: 10 },
      { id: 'keto_low_carb', label: { es: 'Keto/Low carb', 'pt-BR': 'Keto/Low carb' }, emoji: '🥑', impactScore: 10 },
      { id: 'balanced', label: { es: 'Balanceado/Healthy', 'pt-BR': 'Balanceado/Saudável' }, emoji: '⚖️', impactScore: 12 },
    ],
  },
  {
    id: 'Q_HEALTHY_SOURCING',
    category: 'operation',
    mode: 'both',
    dimension: 'profitability',
    weight: 7,
    title: { 
      es: '¿De dónde vienen tus ingredientes?', 
      'pt-BR': 'De onde vêm seus ingredientes?' 
    },
    type: 'multi',
    businessTypes: ['cocina_saludable'],
    options: [
      { id: 'organic_certified', label: { es: 'Orgánico certificado', 'pt-BR': 'Orgânico certificado' }, emoji: '✅', impactScore: 18 },
      { id: 'local_farms', label: { es: 'Granjas/Productores locales', 'pt-BR': 'Fazendas/Produtores locais' }, emoji: '🌾', impactScore: 15 },
      { id: 'specialty', label: { es: 'Distribuidores especializados', 'pt-BR': 'Distribuidores especializados' }, emoji: '📦', impactScore: 10 },
      { id: 'standard', label: { es: 'Proveedores estándar', 'pt-BR': 'Fornecedores padrão' }, emoji: '🛒', impactScore: 5 },
    ],
  },
  {
    id: 'Q_HEALTHY_LABELING',
    category: 'menu',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: { 
      es: '¿Cómo etiquetás tus platos?', 
      'pt-BR': 'Como você rotula seus pratos?' 
    },
    type: 'multi',
    businessTypes: ['cocina_saludable'],
    options: [
      { id: 'calories', label: { es: 'Con calorías', 'pt-BR': 'Com calorias' }, emoji: '🔢', impactScore: 10 },
      { id: 'macros', label: { es: 'Con macros completos', 'pt-BR': 'Com macros completos' }, emoji: '📊', impactScore: 15 },
      { id: 'allergens', label: { es: 'Alérgenos claros', 'pt-BR': 'Alérgenos claros' }, emoji: '⚠️', impactScore: 12 },
      { id: 'icons', label: { es: 'Íconos (vegano, etc)', 'pt-BR': 'Ícones (vegano, etc)' }, emoji: '🏷️', impactScore: 10 },
      { id: 'none', label: { es: 'Sin etiquetado especial', 'pt-BR': 'Sem rotulagem especial' }, emoji: '📝', impactScore: 0 },
    ],
  },
  {
    id: 'Q_HEALTHY_CUSTOMERS',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: { 
      es: '¿Quiénes son tus clientes principales?', 
      'pt-BR': 'Quem são seus principais clientes?' 
    },
    type: 'multi',
    businessTypes: ['cocina_saludable'],
    options: [
      { id: 'fitness', label: { es: 'Fitness/Deportistas', 'pt-BR': 'Fitness/Esportistas' }, emoji: '💪', impactScore: 12 },
      { id: 'office', label: { es: 'Oficinistas/Empresas', 'pt-BR': 'Escritórios/Empresas' }, emoji: '💼', impactScore: 10 },
      { id: 'families', label: { es: 'Familias conscientes', 'pt-BR': 'Famílias conscientes' }, emoji: '👨‍👩‍👧', impactScore: 10 },
      { id: 'medical', label: { es: 'Dietas médicas', 'pt-BR': 'Dietas médicas' }, emoji: '🏥', impactScore: 8 },
    ],
  },
];

// ============= COMBINE ALL TYPE-SPECIFIC QUESTIONS =============
export const ALL_TYPE_SPECIFIC_QUESTIONS: GastroQuestion[] = [
  ...PIZZERIA_QUESTIONS,
  ...CAFETERIA_QUESTIONS,
  ...BAR_QUESTIONS,
  ...HELADERIA_QUESTIONS,
  ...PANADERIA_QUESTIONS,
  ...PARRILLA_QUESTIONS,
  ...FAST_FOOD_QUESTIONS,
  ...DARK_KITCHEN_QUESTIONS,
  ...ALTA_COCINA_QUESTIONS,
  ...SERVICIO_COMIDA_QUESTIONS,
  ...COCINA_ASIATICA_QUESTIONS,
  ...COCINA_SALUDABLE_QUESTIONS,
];

// Get type-specific questions for a business type (5-10% of total questions)
export function getTypeSpecificQuestions(
  businessTypeId: string,
  countryCode: string,
  setupMode: 'quick' | 'complete'
): GastroQuestion[] {
  // Get all aliases for this business type
  const aliases = BUSINESS_TYPE_ALIASES[businessTypeId] || [businessTypeId];
  
  return ALL_TYPE_SPECIFIC_QUESTIONS.filter(q => {
    // Must match business type (check against aliases)
    if (!q.businessTypes?.some(bt => aliases.includes(bt))) return false;
    
    // Filter by mode
    if (q.mode !== 'both' && q.mode !== setupMode) return false;
    
    // Filter by country
    if (q.countries && !q.countries.includes(countryCode)) return false;
    
    return true;
  }).map(q => {
    // Filter options by country if needed
    if (q.options) {
      return {
        ...q,
        options: q.options.filter(opt => 
          !opt.countries || opt.countries.includes(countryCode)
        ),
      };
    }
    return q;
  });
}

// Calculate percentage of type-specific questions
export function getTypeSpecificQuestionStats(
  businessTypeId: string,
  countryCode: string,
  setupMode: 'quick' | 'complete',
  totalQuestions: number
): { count: number; percentage: number } {
  const typeSpecific = getTypeSpecificQuestions(businessTypeId, countryCode, setupMode);
  const count = typeSpecific.length;
  const percentage = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0;
  return { count, percentage };
}
