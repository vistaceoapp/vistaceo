// Business Type Specific Questions - 5-10% super-focused per type
// These are the ultra-specific questions that only apply to each business type

import type { GastroQuestion } from './gastroQuestionsEngine';

// ============= PIZZERIA QUESTIONS =============
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
    businessTypes: ['A1_T006_PIZZERIA'],
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
    businessTypes: ['A1_T006_PIZZERIA'],
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
    businessTypes: ['A1_T006_PIZZERIA'],
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
    businessTypes: ['A1_T006_PIZZERIA'],
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
      es: 'Tiempo de entrega en delivery (minutos)', 
      'pt-BR': 'Tempo de entrega no delivery (minutos)' 
    },
    type: 'single',
    businessTypes: ['A1_T006_PIZZERIA'],
    options: [
      { id: 'fast_20', label: { es: 'Menos de 20 min', 'pt-BR': 'Menos de 20 min' }, emoji: '🚀', impactScore: 20 },
      { id: 'normal_30', label: { es: '20-30 min', 'pt-BR': '20-30 min' }, emoji: '👍', impactScore: 10 },
      { id: 'slow_45', label: { es: '30-45 min', 'pt-BR': '30-45 min' }, emoji: '😐', impactScore: 0 },
      { id: 'very_slow', label: { es: 'Más de 45 min', 'pt-BR': 'Mais de 45 min' }, emoji: '🐢', impactScore: -10 },
    ],
  },
];

// ============= CAFETERIA / COFFEE SHOP QUESTIONS =============
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
    businessTypes: ['A1_T009_CAFETERIA'],
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
    businessTypes: ['A1_T009_CAFETERIA'],
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
      es: '¿Qué tipo de café ofrecés?', 
      'pt-BR': 'Que tipo de café você oferece?' 
    },
    type: 'multi',
    businessTypes: ['A1_T009_CAFETERIA'],
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
    id: 'Q_CAFE_FOOD',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 7,
    title: { 
      es: '¿Qué comida vendés?', 
      'pt-BR': 'Que comida você vende?' 
    },
    type: 'multi',
    businessTypes: ['A1_T009_CAFETERIA'],
    options: [
      { id: 'pastries', label: { es: 'Medialunas/Facturas', 'pt-BR': 'Pães de queijo/Croissants' }, emoji: '🥐', impactScore: 8 },
      { id: 'sandwiches', label: { es: 'Sándwiches/Tostados', 'pt-BR': 'Sanduíches/Torradas' }, emoji: '🥪', impactScore: 10 },
      { id: 'cakes', label: { es: 'Tortas/Postres', 'pt-BR': 'Bolos/Sobremesas' }, emoji: '🎂', impactScore: 12 },
      { id: 'brunch', label: { es: 'Brunch/Desayunos', 'pt-BR': 'Brunch/Café da manhã' }, emoji: '🍳', impactScore: 15 },
      { id: 'light_meals', label: { es: 'Comidas livianas', 'pt-BR': 'Refeições leves' }, emoji: '🥗', impactScore: 10 },
      { id: 'none', label: { es: 'Solo café', 'pt-BR': 'Só café' }, emoji: '☕', impactScore: 0 },
    ],
  },
  {
    id: 'Q_CAFE_ATMOSPHERE',
    category: 'operation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: { 
      es: '¿Cuál es el ambiente de tu café?', 
      'pt-BR': 'Qual é o ambiente do seu café?' 
    },
    type: 'single',
    businessTypes: ['A1_T009_CAFETERIA'],
    options: [
      { id: 'work_friendly', label: { es: 'Para trabajar/estudiar', 'pt-BR': 'Para trabalhar/estudar' }, emoji: '💻', impactScore: 10 },
      { id: 'social', label: { es: 'Para charlar/reunirse', 'pt-BR': 'Para conversar/encontros' }, emoji: '👥', impactScore: 10 },
      { id: 'quick', label: { es: 'Rápido/Para llevar', 'pt-BR': 'Rápido/Para viagem' }, emoji: '⚡', impactScore: 5 },
      { id: 'cozy', label: { es: 'Acogedor/Artesanal', 'pt-BR': 'Aconchegante/Artesanal' }, emoji: '🏡', impactScore: 12 },
    ],
  },
];

// ============= BAR QUESTIONS =============
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
    businessTypes: ['A1_T011_BAR', 'A1_T012_PUB', 'A1_T013_CERVECERIA', 'A1_T019_WINE_BAR'],
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
    businessTypes: ['A1_T011_BAR', 'A1_T012_PUB', 'A1_T013_CERVECERIA', 'A1_T019_WINE_BAR'],
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
    businessTypes: ['A1_T011_BAR', 'A1_T012_PUB', 'A1_T013_CERVECERIA'],
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
      es: '¿Tenés happy hour u ofertas?', 
      'pt-BR': 'Você tem happy hour ou promoções?' 
    },
    type: 'multi',
    businessTypes: ['A1_T011_BAR', 'A1_T012_PUB', 'A1_T013_CERVECERIA'],
    options: [
      { id: 'happy_hour', label: { es: 'Happy hour', 'pt-BR': 'Happy hour' }, emoji: '🍻', impactScore: 10 },
      { id: '2x1', label: { es: '2x1 en tragos', 'pt-BR': '2x1 em drinks' }, emoji: '🍹', impactScore: 8 },
      { id: 'ladies_night', label: { es: 'Ladies night', 'pt-BR': 'Ladies night' }, emoji: '👯', impactScore: 5 },
      { id: 'none', label: { es: 'No hacemos', 'pt-BR': 'Não fazemos' }, emoji: '❌', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BAR_MUSIC',
    category: 'operation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: { 
      es: '¿Qué música/entretenimiento tenés?', 
      'pt-BR': 'Que música/entretenimento você tem?' 
    },
    type: 'multi',
    businessTypes: ['A1_T011_BAR', 'A1_T012_PUB', 'A1_T013_CERVECERIA'],
    options: [
      { id: 'dj', label: { es: 'DJ', 'pt-BR': 'DJ' }, emoji: '🎧', impactScore: 10 },
      { id: 'live_music', label: { es: 'Música en vivo', 'pt-BR': 'Música ao vivo' }, emoji: '🎸', impactScore: 15 },
      { id: 'playlist', label: { es: 'Playlist ambiente', 'pt-BR': 'Playlist ambiente' }, emoji: '🎵', impactScore: 5 },
      { id: 'karaoke', label: { es: 'Karaoke', 'pt-BR': 'Karaokê' }, emoji: '🎤', impactScore: 8 },
      { id: 'sports', label: { es: 'Pantallas/Deportes', 'pt-BR': 'Telas/Esportes' }, emoji: '📺', impactScore: 8 },
    ],
  },
];

// ============= HELADERIA (ICE CREAM SHOP) QUESTIONS =============
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
    businessTypes: ['A1_T018_HELADERIA'],
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
    businessTypes: ['A1_T018_HELADERIA'],
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
    businessTypes: ['A1_T018_HELADERIA'],
    options: [
      { id: 'on_site', label: { es: 'En el local', 'pt-BR': 'No local' }, emoji: '🏪', impactScore: 15 },
      { id: 'central_kitchen', label: { es: 'Cocina central propia', 'pt-BR': 'Cozinha central própria' }, emoji: '🏭', impactScore: 12 },
      { id: 'supplier', label: { es: 'Proveedor externo', 'pt-BR': 'Fornecedor externo' }, emoji: '🚚', impactScore: 0 },
    ],
  },
  {
    id: 'Q_ICE_CREAM_SPECIAL',
    category: 'menu',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: { 
      es: '¿Ofrecés opciones especiales?', 
      'pt-BR': 'Você oferece opções especiais?' 
    },
    type: 'multi',
    businessTypes: ['A1_T018_HELADERIA'],
    options: [
      { id: 'sugar_free', label: { es: 'Sin azúcar', 'pt-BR': 'Sem açúcar' }, emoji: '🍃', impactScore: 8 },
      { id: 'vegan', label: { es: 'Vegano', 'pt-BR': 'Vegano' }, emoji: '🌱', impactScore: 10 },
      { id: 'gluten_free', label: { es: 'Sin gluten', 'pt-BR': 'Sem glúten' }, emoji: '🌾', impactScore: 8 },
      { id: 'premium', label: { es: 'Línea premium', 'pt-BR': 'Linha premium' }, emoji: '✨', impactScore: 10 },
      { id: 'seasonal', label: { es: 'Sabores de temporada', 'pt-BR': 'Sabores da temporada' }, emoji: '📅', impactScore: 8 },
    ],
  },
];

// ============= PANADERIA (BAKERY) QUESTIONS =============
export const PANADERIA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_BAKERY_PRODUCTION',
    category: 'operation',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿Cómo producís?', 
      'pt-BR': 'Como você produz?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['A1_T010_BAKERY'],
    options: [
      { id: 'all_fresh', label: { es: 'Todo fresco cada día', 'pt-BR': 'Tudo fresco cada dia' }, emoji: '🥖', impactScore: 25 },
      { id: 'partial_fresh', label: { es: 'Parte fresco, parte pre-horneado', 'pt-BR': 'Parte fresco, parte pré-assado' }, emoji: '🔄', impactScore: 15 },
      { id: 'pre_baked', label: { es: 'Pre-horneado/Congelado', 'pt-BR': 'Pré-assado/Congelado' }, emoji: '❄️', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BAKERY_SPECIALTY',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { 
      es: '¿Cuál es tu fuerte?', 
      'pt-BR': 'Qual é seu ponto forte?' 
    },
    type: 'multi',
    businessTypes: ['A1_T010_BAKERY'],
    options: [
      { id: 'bread', label: { es: 'Pan artesanal', 'pt-BR': 'Pão artesanal' }, emoji: '🍞', impactScore: 15 },
      { id: 'pastries', label: { es: 'Facturas/Medialunas', 'pt-BR': 'Pães doces/Croissants' }, emoji: '🥐', impactScore: 12 },
      { id: 'cakes', label: { es: 'Tortas/Pastelería', 'pt-BR': 'Bolos/Confeitaria' }, emoji: '🎂', impactScore: 12 },
      { id: 'sourdough', label: { es: 'Masa madre', 'pt-BR': 'Fermentação natural' }, emoji: '🌿', impactScore: 15 },
      { id: 'sandwiches', label: { es: 'Sándwiches/Tostados', 'pt-BR': 'Sanduíches' }, emoji: '🥪', impactScore: 10 },
      { id: 'custom', label: { es: 'Pedidos especiales', 'pt-BR': 'Pedidos especiais' }, emoji: '✨', impactScore: 10 },
    ],
  },
  {
    id: 'Q_BAKERY_START_TIME',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: { 
      es: '¿A qué hora empezás a hornear?', 
      'pt-BR': 'A que horas você começa a assar?' 
    },
    type: 'single',
    businessTypes: ['A1_T010_BAKERY'],
    options: [
      { id: 'very_early', label: { es: 'Antes de las 4am', 'pt-BR': 'Antes das 4h' }, emoji: '🌙', impactScore: 15 },
      { id: 'early', label: { es: '4-6am', 'pt-BR': '4-6h' }, emoji: '🌅', impactScore: 10 },
      { id: 'normal', label: { es: '6-8am', 'pt-BR': '6-8h' }, emoji: '☀️', impactScore: 5 },
      { id: 'late', label: { es: 'Después de las 8am', 'pt-BR': 'Depois das 8h' }, emoji: '😴', impactScore: 0 },
    ],
  },
];

// ============= HAMBURGUESERIA (BURGER SHOP) QUESTIONS =============
export const HAMBURGUESERIA_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_BURGER_MEAT',
    category: 'menu',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { 
      es: '¿De dónde viene tu carne?', 
      'pt-BR': 'De onde vem sua carne?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['A1_T007_HAMBURGUE'],
    options: [
      { id: 'butcher', label: { es: 'Carnicería propia/exclusiva', 'pt-BR': 'Açougue próprio/exclusivo' }, emoji: '🥩', impactScore: 20 },
      { id: 'premium', label: { es: 'Proveedor premium', 'pt-BR': 'Fornecedor premium' }, emoji: '✨', impactScore: 15 },
      { id: 'standard', label: { es: 'Proveedor estándar', 'pt-BR': 'Fornecedor padrão' }, emoji: '📦', impactScore: 5 },
      { id: 'mixed', label: { es: 'Varios proveedores', 'pt-BR': 'Vários fornecedores' }, emoji: '🔄', impactScore: 8 },
    ],
  },
  {
    id: 'Q_BURGER_PREP',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: { 
      es: '¿Cómo preparás los medallones?', 
      'pt-BR': 'Como você prepara os hambúrgueres?' 
    },
    type: 'single',
    businessTypes: ['A1_T007_HAMBURGUE'],
    options: [
      { id: 'smash', label: { es: 'Smash burger al momento', 'pt-BR': 'Smash burger na hora' }, emoji: '💥', impactScore: 15 },
      { id: 'fresh_patty', label: { es: 'Medallón fresco diario', 'pt-BR': 'Hambúrguer fresco diário' }, emoji: '👨‍🍳', impactScore: 12 },
      { id: 'pre_formed', label: { es: 'Pre-formados frescos', 'pt-BR': 'Pré-formados frescos' }, emoji: '🔵', impactScore: 8 },
      { id: 'frozen', label: { es: 'Congelados', 'pt-BR': 'Congelados' }, emoji: '❄️', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BURGER_BREAD',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: { 
      es: '¿De dónde viene el pan?', 
      'pt-BR': 'De onde vem o pão?' 
    },
    type: 'single',
    businessTypes: ['A1_T007_HAMBURGUE'],
    options: [
      { id: 'own', label: { es: 'Propio/Receta exclusiva', 'pt-BR': 'Próprio/Receita exclusiva' }, emoji: '🥖', impactScore: 15 },
      { id: 'bakery', label: { es: 'Panadería artesanal', 'pt-BR': 'Padaria artesanal' }, emoji: '🍞', impactScore: 12 },
      { id: 'standard', label: { es: 'Pan industrial', 'pt-BR': 'Pão industrial' }, emoji: '📦', impactScore: 0 },
    ],
  },
  {
    id: 'Q_BURGER_COMBOS',
    category: 'sales',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: { 
      es: '¿Ofrecés combos?', 
      'pt-BR': 'Você oferece combos?' 
    },
    type: 'single',
    businessTypes: ['A1_T007_HAMBURGUE'],
    options: [
      { id: 'yes_popular', label: { es: 'Sí, son los más pedidos', 'pt-BR': 'Sim, são os mais pedidos' }, emoji: '🍟', impactScore: 15 },
      { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '👍', impactScore: 10 },
      { id: 'no', label: { es: 'No, todo individual', 'pt-BR': 'Não, tudo individual' }, emoji: '🍔', impactScore: 5 },
    ],
  },
];

// ============= FAST FOOD QUESTIONS =============
export const FAST_FOOD_QUESTIONS: GastroQuestion[] = [
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
    required: true,
    businessTypes: ['A1_T005_FAST_FOOD'],
    options: [
      { id: 'ultra_fast', label: { es: 'Menos de 3 min', 'pt-BR': 'Menos de 3 min' }, emoji: '⚡', impactScore: 20 },
      { id: 'fast', label: { es: '3-5 min', 'pt-BR': '3-5 min' }, emoji: '🚀', impactScore: 15 },
      { id: 'normal', label: { es: '5-10 min', 'pt-BR': '5-10 min' }, emoji: '👍', impactScore: 8 },
      { id: 'slow', label: { es: 'Más de 10 min', 'pt-BR': 'Mais de 10 min' }, emoji: '🐢', impactScore: 0 },
    ],
  },
  {
    id: 'Q_FF_DRIVE_THRU',
    category: 'operation',
    mode: 'both',
    dimension: 'traffic',
    weight: 7,
    title: { 
      es: '¿Tenés autoservicio/drive-thru?', 
      'pt-BR': 'Você tem drive-thru?' 
    },
    type: 'single',
    businessTypes: ['A1_T005_FAST_FOOD'],
    options: [
      { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🚗', impactScore: 15 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 0 },
      { id: 'planning', label: { es: 'Planificando', 'pt-BR': 'Planejando' }, emoji: '📋', impactScore: 5 },
    ],
  },
];

// ============= DARK KITCHEN QUESTIONS =============
export const DARK_KITCHEN_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_DK_BRANDS',
    category: 'operation',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: { 
      es: '¿Cuántas marcas/conceptos manejás?', 
      'pt-BR': 'Quantas marcas/conceitos você gerencia?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['A1_T015_DARK_KITCHEN'],
    options: [
      { id: '1', label: { es: '1 marca', 'pt-BR': '1 marca' }, emoji: '1️⃣', impactScore: 8 },
      { id: '2-3', label: { es: '2-3 marcas', 'pt-BR': '2-3 marcas' }, emoji: '🔢', impactScore: 15 },
      { id: '4+', label: { es: '4+ marcas', 'pt-BR': '4+ marcas' }, emoji: '📈', impactScore: 12 },
    ],
  },
  {
    id: 'Q_DK_PACKAGING',
    category: 'operation',
    mode: 'both',
    dimension: 'reputation',
    weight: 7,
    title: { 
      es: '¿Cómo es tu packaging?', 
      'pt-BR': 'Como é sua embalagem?' 
    },
    type: 'single',
    businessTypes: ['A1_T015_DARK_KITCHEN'],
    options: [
      { id: 'premium', label: { es: 'Premium/Diferenciado', 'pt-BR': 'Premium/Diferenciado' }, emoji: '✨', impactScore: 15 },
      { id: 'branded', label: { es: 'Con marca propia', 'pt-BR': 'Com marca própria' }, emoji: '🏷️', impactScore: 10 },
      { id: 'standard', label: { es: 'Estándar', 'pt-BR': 'Padrão' }, emoji: '📦', impactScore: 5 },
      { id: 'eco', label: { es: 'Eco-friendly', 'pt-BR': 'Eco-friendly' }, emoji: '🌱', impactScore: 12 },
    ],
  },
  {
    id: 'Q_DK_PLATFORMS',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { 
      es: '% de ventas por canal propio vs apps', 
      'pt-BR': '% de vendas por canal próprio vs apps' 
    },
    type: 'single',
    businessTypes: ['A1_T015_DARK_KITCHEN'],
    options: [
      { id: 'mostly_own', label: { es: 'Mayoría canal propio (+60%)', 'pt-BR': 'Maioria canal próprio (+60%)' }, emoji: '🏆', impactScore: 20 },
      { id: 'balanced', label: { es: 'Equilibrado (40-60%)', 'pt-BR': 'Equilibrado (40-60%)' }, emoji: '⚖️', impactScore: 12 },
      { id: 'mostly_apps', label: { es: 'Mayoría apps (+60%)', 'pt-BR': 'Maioria apps (+60%)' }, emoji: '📱', impactScore: 0 },
    ],
  },
];

// ============= FOOD TRUCK QUESTIONS =============
export const FOOD_TRUCK_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_FT_LOCATIONS',
    category: 'operation',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { 
      es: '¿Cuántas ubicaciones frecuentás?', 
      'pt-BR': 'Quantas localizações você frequenta?' 
    },
    type: 'single',
    required: true,
    businessTypes: ['A1_T014_FOOD_TRUCK'],
    options: [
      { id: 'fixed', label: { es: 'Ubicación fija', 'pt-BR': 'Localização fixa' }, emoji: '📍', impactScore: 10 },
      { id: 'few', label: { es: '2-3 ubicaciones', 'pt-BR': '2-3 localizações' }, emoji: '🔄', impactScore: 15 },
      { id: 'many', label: { es: '4+ ubicaciones/eventos', 'pt-BR': '4+ localizações/eventos' }, emoji: '🎪', impactScore: 12 },
    ],
  },
  {
    id: 'Q_FT_EVENTS',
    category: 'marketing',
    mode: 'both',
    dimension: 'growth',
    weight: 7,
    title: { 
      es: '¿Participás en eventos/festivales?', 
      'pt-BR': 'Você participa de eventos/festivais?' 
    },
    type: 'single',
    businessTypes: ['A1_T014_FOOD_TRUCK'],
    options: [
      { id: 'frequent', label: { es: 'Sí, frecuentemente', 'pt-BR': 'Sim, frequentemente' }, emoji: '🎉', impactScore: 15 },
      { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🎪', impactScore: 10 },
      { id: 'rarely', label: { es: 'Raramente', 'pt-BR': 'Raramente' }, emoji: '😐', impactScore: 5 },
      { id: 'never', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌', impactScore: 0 },
    ],
  },
];

// ============= CATERING QUESTIONS =============
export const CATERING_QUESTIONS: GastroQuestion[] = [
  {
    id: 'Q_CAT_SIZE',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: { 
      es: 'Tamaño promedio de eventos', 
      'pt-BR': 'Tamanho médio de eventos' 
    },
    type: 'single',
    required: true,
    businessTypes: ['A1_T016_CATERING'],
    options: [
      { id: 'small', label: { es: 'Pequeños (10-30 personas)', 'pt-BR': 'Pequenos (10-30 pessoas)' }, impactScore: 8 },
      { id: 'medium', label: { es: 'Medianos (30-100 personas)', 'pt-BR': 'Médios (30-100 pessoas)' }, impactScore: 12 },
      { id: 'large', label: { es: 'Grandes (100+ personas)', 'pt-BR': 'Grandes (100+ pessoas)' }, impactScore: 15 },
      { id: 'mixed', label: { es: 'Variado', 'pt-BR': 'Variado' }, impactScore: 10 },
    ],
  },
  {
    id: 'Q_CAT_TYPE',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 8,
    title: { 
      es: '¿Qué tipo de eventos manejás?', 
      'pt-BR': 'Que tipo de eventos você gerencia?' 
    },
    type: 'multi',
    businessTypes: ['A1_T016_CATERING'],
    options: [
      { id: 'corporate', label: { es: 'Corporativos', 'pt-BR': 'Corporativos' }, emoji: '💼', impactScore: 15 },
      { id: 'weddings', label: { es: 'Bodas/Casamientos', 'pt-BR': 'Casamentos' }, emoji: '💒', impactScore: 15 },
      { id: 'social', label: { es: 'Sociales/Cumpleaños', 'pt-BR': 'Sociais/Aniversários' }, emoji: '🎂', impactScore: 10 },
      { id: 'private', label: { es: 'Chef privado', 'pt-BR': 'Chef privado' }, emoji: '👨‍🍳', impactScore: 12 },
    ],
  },
];

// ============= RESTAURANTE ALTA COCINA QUESTIONS =============
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
    businessTypes: ['A1_T002_ALTA_COCINA', 'A1_T020_COCINA_AUTOR'],
    options: [
      { id: 'tasting', label: { es: 'Menú degustación', 'pt-BR': 'Menu degustação' }, emoji: '🍽️', impactScore: 20 },
      { id: 'a_la_carte', label: { es: 'A la carta premium', 'pt-BR': 'À la carte premium' }, emoji: '📋', impactScore: 15 },
      { id: 'mixed', label: { es: 'Ambos', 'pt-BR': 'Ambos' }, emoji: '✨', impactScore: 18 },
    ],
  },
  {
    id: 'Q_AC_PAIRING',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: { 
      es: '¿Ofrecés maridaje de vinos?', 
      'pt-BR': 'Você oferece harmonização de vinhos?' 
    },
    type: 'single',
    businessTypes: ['A1_T002_ALTA_COCINA', 'A1_T020_COCINA_AUTOR'],
    options: [
      { id: 'sommelier', label: { es: 'Sí, con sommelier', 'pt-BR': 'Sim, com sommelier' }, emoji: '🍷', impactScore: 20 },
      { id: 'curated', label: { es: 'Carta curada', 'pt-BR': 'Carta curada' }, emoji: '📚', impactScore: 12 },
      { id: 'basic', label: { es: 'Básico', 'pt-BR': 'Básico' }, emoji: '🍾', impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 0 },
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
  ...HAMBURGUESERIA_QUESTIONS,
  ...FAST_FOOD_QUESTIONS,
  ...DARK_KITCHEN_QUESTIONS,
  ...FOOD_TRUCK_QUESTIONS,
  ...CATERING_QUESTIONS,
  ...ALTA_COCINA_QUESTIONS,
];

// Get type-specific questions for a business type
export function getTypeSpecificQuestions(
  businessTypeId: string,
  countryCode: string,
  setupMode: 'quick' | 'complete'
): GastroQuestion[] {
  return ALL_TYPE_SPECIFIC_QUESTIONS.filter(q => {
    // Must match business type
    if (!q.businessTypes?.includes(businessTypeId)) return false;
    
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
