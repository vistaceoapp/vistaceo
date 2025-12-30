// Gastronomy Questions v7 - Intelligent by Country & Business Type

export interface QuestionOption {
  id: string;
  label: { es: string; 'pt-BR': string };
  emoji?: string;
  countries?: string[]; // If specified, only show in these countries
}

export interface Question {
  id: string;
  category: string;
  categoryLabel: { es: string; 'pt-BR': string };
  mode: 'quick' | 'complete' | 'both';
  title: { es: string; 'pt-BR': string };
  help?: { es: string; 'pt-BR': string };
  type: 'single' | 'multi' | 'number' | 'slider' | 'text';
  options?: QuestionOption[];
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  businessTypes?: string[]; // If specified, only show for these types
  countries?: string[]; // If specified, only show in these countries
}

// Business type groups for conditional questions
export const BUSINESS_TYPE_GROUPS = {
  restaurant: ['A1_T001_REST_CASUAL', 'A1_T002_ALTA_COCINA', 'A1_T003_PARRILLA', 'A1_T004_ETNICO', 'A1_T020_COCINA_AUTOR'],
  fastFood: ['A1_T005_FAST_FOOD', 'A1_T006_PIZZERIA', 'A1_T007_HAMBURGUE', 'A1_T008_EMPANADAS', 'A1_T014_FOOD_TRUCK'],
  cafe: ['A1_T009_CAFETERIA', 'A1_T010_BAKERY', 'A1_T017_BRUNCH'],
  bar: ['A1_T011_BAR', 'A1_T012_PUB', 'A1_T013_CERVECERIA', 'A1_T019_WINE_BAR'],
  delivery: ['A1_T015_DARK_KITCHEN', 'A1_T016_CATERING'],
  desserts: ['A1_T018_HELADERIA', 'A1_T010_BAKERY'],
};

// ============== QUESTIONS BY CATEGORY ==============

const OPERATION_QUESTIONS: Question[] = [
  // Channels - Universal
  {
    id: 'channels',
    category: 'operation',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'both',
    title: { es: '¿Cómo vendés hoy?', 'pt-BR': 'Como você vende hoje?' },
    help: { es: 'Elegí todo lo que aplique', 'pt-BR': 'Selecione tudo que se aplica' },
    type: 'multi',
    required: true,
    options: [
      { id: 'dine_in', label: { es: 'Salón', 'pt-BR': 'Salão' }, emoji: '🍽️' },
      { id: 'delivery_apps', label: { es: 'Apps de delivery', 'pt-BR': 'Apps de delivery' }, emoji: '📱' },
      { id: 'delivery_own', label: { es: 'Delivery propio', 'pt-BR': 'Delivery próprio' }, emoji: '🛵' },
      { id: 'pickup', label: { es: 'Take away', 'pt-BR': 'Take away' }, emoji: '🥡' },
      { id: 'catering', label: { es: 'Catering/Eventos', 'pt-BR': 'Catering/Eventos' }, emoji: '🎉' },
    ],
  },
  // Peak times - Universal
  {
    id: 'peaks',
    category: 'operation',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'both',
    title: { es: '¿Cuándo se te llena más?', 'pt-BR': 'Quando enche mais?' },
    help: { es: 'Elegí tus franjas fuertes', 'pt-BR': 'Escolha suas faixas fortes' },
    type: 'multi',
    options: [
      { id: 'morning', label: { es: 'Mañana (8-12h)', 'pt-BR': 'Manhã (8-12h)' }, emoji: '☀️' },
      { id: 'noon', label: { es: 'Mediodía (12-15h)', 'pt-BR': 'Almoço (12-15h)' }, emoji: '🌞' },
      { id: 'afternoon', label: { es: 'Tarde (15-19h)', 'pt-BR': 'Tarde (15-19h)' }, emoji: '🌤️' },
      { id: 'night', label: { es: 'Noche (19-24h)', 'pt-BR': 'Noite (19-24h)' }, emoji: '🌙' },
      { id: 'late_night', label: { es: 'Madrugada (+24h)', 'pt-BR': 'Madrugada (+24h)' }, emoji: '🌃' },
    ],
  },
  // Days - Complete only
  {
    id: 'peak_days',
    category: 'operation',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    title: { es: '¿Cuáles son tus días más fuertes?', 'pt-BR': 'Quais são seus dias mais fortes?' },
    type: 'multi',
    options: [
      { id: 'mon_thu', label: { es: 'Lunes a Jueves', 'pt-BR': 'Segunda a Quinta' }, emoji: '📅' },
      { id: 'friday', label: { es: 'Viernes', 'pt-BR': 'Sexta' }, emoji: '🎉' },
      { id: 'saturday', label: { es: 'Sábado', 'pt-BR': 'Sábado' }, emoji: '🥳' },
      { id: 'sunday', label: { es: 'Domingo', 'pt-BR': 'Domingo' }, emoji: '☀️' },
    ],
  },
  // Capacity - For dine-in businesses
  {
    id: 'capacity',
    category: 'operation',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'both',
    title: { es: 'Capacidad del local (asientos)', 'pt-BR': 'Capacidade do local (lugares)' },
    help: { es: 'Aproximado está bien', 'pt-BR': 'Aproximado está bom' },
    type: 'slider',
    min: 0,
    max: 300,
    unit: 'asientos',
    businessTypes: [...BUSINESS_TYPE_GROUPS.restaurant, ...BUSINESS_TYPE_GROUPS.cafe, ...BUSINESS_TYPE_GROUPS.bar],
  },
  // Reservations - Restaurants & bars
  {
    id: 'reservations',
    category: 'operation',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    title: { es: '¿Trabajás con reservas?', 'pt-BR': 'Você trabalha com reservas?' },
    type: 'single',
    businessTypes: [...BUSINESS_TYPE_GROUPS.restaurant, ...BUSINESS_TYPE_GROUPS.bar],
    options: [
      { id: 'yes_system', label: { es: 'Sí, con sistema', 'pt-BR': 'Sim, com sistema' }, emoji: '📲' },
      { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📓' },
      { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🤷' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
    ],
  },
  // Delivery platforms by country
  {
    id: 'delivery_platforms',
    category: 'operation',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    title: { es: '¿En qué apps de delivery estás?', 'pt-BR': 'Em quais apps de delivery você está?' },
    type: 'multi',
    options: [
      // Argentina
      { id: 'pedidosya', label: { es: 'PedidosYa', 'pt-BR': 'PedidosYa' }, emoji: '🟠', countries: ['AR', 'UY'] },
      { id: 'rappi', label: { es: 'Rappi', 'pt-BR': 'Rappi' }, emoji: '🟡', countries: ['AR', 'MX', 'CO', 'CL', 'BR'] },
      // Mexico
      { id: 'ubereats', label: { es: 'Uber Eats', 'pt-BR': 'Uber Eats' }, emoji: '⚫' },
      { id: 'didi', label: { es: 'DiDi Food', 'pt-BR': 'DiDi Food' }, emoji: '🟠', countries: ['MX', 'CL', 'CO', 'CR', 'PA'] },
      // Brazil
      { id: 'ifood', label: { es: 'iFood', 'pt-BR': 'iFood' }, emoji: '🔴', countries: ['BR'] },
      { id: 'zdelivery', label: { es: 'Zé Delivery', 'pt-BR': 'Zé Delivery' }, emoji: '🍺', countries: ['BR'] },
      // US
      { id: 'doordash', label: { es: 'DoorDash', 'pt-BR': 'DoorDash' }, emoji: '🔴', countries: ['US'] },
      { id: 'grubhub', label: { es: 'Grubhub', 'pt-BR': 'Grubhub' }, emoji: '🟢', countries: ['US'] },
    ],
  },
];

const SALES_QUESTIONS: Question[] = [
  // Sales tracking - Universal
  {
    id: 'sales_tracking',
    category: 'sales',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    title: { es: '¿Cómo registrás ventas hoy?', 'pt-BR': 'Como você registra vendas hoje?' },
    type: 'single',
    required: true,
    options: [
      { id: 'pos', label: { es: 'Sistema POS/Caja', 'pt-BR': 'Sistema PDV' }, emoji: '💻' },
      { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📊' },
      { id: 'notebook', label: { es: 'Cuaderno/Papel', 'pt-BR': 'Caderno/Papel' }, emoji: '📓' },
      { id: 'nothing', label: { es: 'Nada formal', 'pt-BR': 'Nada formal' }, emoji: '🤷' },
    ],
  },
  // POS System - Complete only
  {
    id: 'pos_system',
    category: 'sales',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'complete',
    title: { es: '¿Qué sistema POS usás?', 'pt-BR': 'Qual sistema PDV você usa?' },
    type: 'single',
    options: [
      // Argentina
      { id: 'tango', label: { es: 'Tango Gestión', 'pt-BR': 'Tango Gestión' }, countries: ['AR'] },
      { id: 'restorando', label: { es: 'Restorando', 'pt-BR': 'Restorando' }, countries: ['AR', 'UY', 'CL'] },
      { id: 'sicar', label: { es: 'Sicar', 'pt-BR': 'Sicar' }, countries: ['AR'] },
      // Brazil
      { id: 'totvs', label: { es: 'TOTVS', 'pt-BR': 'TOTVS' }, countries: ['BR'] },
      { id: 'ifood_sistema', label: { es: 'Sistema iFood', 'pt-BR': 'Sistema iFood' }, countries: ['BR'] },
      { id: 'linx', label: { es: 'Linx', 'pt-BR': 'Linx' }, countries: ['BR'] },
      // Mexico
      { id: 'softrestaurant', label: { es: 'Soft Restaurant', 'pt-BR': 'Soft Restaurant' }, countries: ['MX'] },
      { id: 'clip', label: { es: 'Clip', 'pt-BR': 'Clip' }, countries: ['MX'] },
      // Universal
      { id: 'square', label: { es: 'Square', 'pt-BR': 'Square' } },
      { id: 'toast', label: { es: 'Toast', 'pt-BR': 'Toast' } },
      { id: 'other', label: { es: 'Otro', 'pt-BR': 'Outro' } },
      { id: 'none', label: { es: 'No uso sistema', 'pt-BR': 'Não uso sistema' } },
    ],
  },
  // Avg ticket - Universal
  {
    id: 'avg_ticket',
    category: 'sales',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    title: { es: 'Ticket promedio por persona', 'pt-BR': 'Ticket médio por pessoa' },
    help: { es: 'En tu moneda local', 'pt-BR': 'Na sua moeda local' },
    type: 'number',
    min: 0,
    max: 100000,
  },
  // Daily transactions - Complete only
  {
    id: 'daily_transactions',
    category: 'sales',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'complete',
    title: { es: 'Transacciones promedio por día', 'pt-BR': 'Transações médias por dia' },
    type: 'single',
    options: [
      { id: '1-20', label: { es: '1-20', 'pt-BR': '1-20' } },
      { id: '21-50', label: { es: '21-50', 'pt-BR': '21-50' } },
      { id: '51-100', label: { es: '51-100', 'pt-BR': '51-100' } },
      { id: '100+', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' } },
    ],
  },
  // Payment methods by country
  {
    id: 'payment_methods',
    category: 'sales',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'complete',
    title: { es: '¿Cómo te pagan más?', 'pt-BR': 'Como você recebe mais?' },
    type: 'multi',
    options: [
      { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵' },
      { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳' },
      { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳' },
      // Argentina
      { id: 'mercadopago', label: { es: 'Mercado Pago', 'pt-BR': 'Mercado Pago' }, emoji: '🔵', countries: ['AR', 'MX', 'BR'] },
      { id: 'transferencia', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦' },
      // Brazil
      { id: 'pix', label: { es: 'PIX', 'pt-BR': 'PIX' }, emoji: '⚡', countries: ['BR'] },
      // US
      { id: 'venmo', label: { es: 'Venmo', 'pt-BR': 'Venmo' }, countries: ['US'] },
      { id: 'applepay', label: { es: 'Apple Pay', 'pt-BR': 'Apple Pay' }, countries: ['US'] },
    ],
  },
];

const MENU_QUESTIONS: Question[] = [
  // Menu size - Universal
  {
    id: 'menu_size',
    category: 'menu',
    categoryLabel: { es: 'Carta/Menú', 'pt-BR': 'Cardápio' },
    mode: 'both',
    title: { es: '¿Cuántos productos vendés activamente?', 'pt-BR': 'Quantos produtos você vende ativamente?' },
    type: 'single',
    options: [
      { id: '1-10', label: { es: '1-10 productos', 'pt-BR': '1-10 produtos' } },
      { id: '11-30', label: { es: '11-30 productos', 'pt-BR': '11-30 produtos' } },
      { id: '31-80', label: { es: '31-80 productos', 'pt-BR': '31-80 produtos' } },
      { id: '80+', label: { es: 'Más de 80', 'pt-BR': 'Mais de 80' } },
    ],
  },
  // Top sellers - Universal
  {
    id: 'top_sellers',
    category: 'menu',
    categoryLabel: { es: 'Carta/Menú', 'pt-BR': 'Cardápio' },
    mode: 'both',
    title: { es: 'Tu producto/plato estrella', 'pt-BR': 'Seu produto/prato estrela' },
    help: { es: 'El que más se vende o querés destacar', 'pt-BR': 'O que mais vende ou quer destacar' },
    type: 'text',
  },
  // Menu digital - Complete
  {
    id: 'menu_digital',
    category: 'menu',
    categoryLabel: { es: 'Carta/Menú', 'pt-BR': 'Cardápio' },
    mode: 'complete',
    title: { es: '¿Tenés menú digital?', 'pt-BR': 'Você tem cardápio digital?' },
    type: 'single',
    options: [
      { id: 'qr', label: { es: 'Sí, con QR', 'pt-BR': 'Sim, com QR' }, emoji: '📱' },
      { id: 'web', label: { es: 'Sí, en la web', 'pt-BR': 'Sim, no site' }, emoji: '🌐' },
      { id: 'pdf', label: { es: 'PDF/Foto', 'pt-BR': 'PDF/Foto' }, emoji: '📄' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
    ],
  },
  // Price changes - Complete
  {
    id: 'price_update_frequency',
    category: 'menu',
    categoryLabel: { es: 'Carta/Menú', 'pt-BR': 'Cardápio' },
    mode: 'complete',
    title: { es: '¿Cada cuánto actualizás precios?', 'pt-BR': 'Com que frequência atualiza preços?' },
    type: 'single',
    options: [
      { id: 'weekly', label: { es: 'Semanal', 'pt-BR': 'Semanal' } },
      { id: 'monthly', label: { es: 'Mensual', 'pt-BR': 'Mensal' } },
      { id: 'quarterly', label: { es: 'Trimestral', 'pt-BR': 'Trimestral' } },
      { id: 'rarely', label: { es: 'Casi nunca', 'pt-BR': 'Quase nunca' } },
    ],
  },
  // Specialty - For bars
  {
    id: 'drink_specialty',
    category: 'menu',
    categoryLabel: { es: 'Carta/Menú', 'pt-BR': 'Cardápio' },
    mode: 'complete',
    title: { es: '¿Cuál es tu fuerte en tragos?', 'pt-BR': 'Qual é sua especialidade em drinks?' },
    type: 'multi',
    businessTypes: BUSINESS_TYPE_GROUPS.bar,
    options: [
      { id: 'cocktails', label: { es: 'Cócteles clásicos', 'pt-BR': 'Coquetéis clássicos' }, emoji: '🍸' },
      { id: 'signature', label: { es: 'Tragos de autor', 'pt-BR': 'Drinks autorais' }, emoji: '✨' },
      { id: 'beer', label: { es: 'Cervezas', 'pt-BR': 'Cervejas' }, emoji: '🍺' },
      { id: 'wine', label: { es: 'Vinos', 'pt-BR': 'Vinhos' }, emoji: '🍷' },
      { id: 'spirits', label: { es: 'Destilados', 'pt-BR': 'Destilados' }, emoji: '🥃' },
    ],
  },
  // Coffee specialty - For cafes
  {
    id: 'coffee_specialty',
    category: 'menu',
    categoryLabel: { es: 'Carta/Menú', 'pt-BR': 'Cardápio' },
    mode: 'complete',
    title: { es: '¿Qué tipo de café ofrecés?', 'pt-BR': 'Que tipo de café você oferece?' },
    type: 'multi',
    businessTypes: BUSINESS_TYPE_GROUPS.cafe,
    options: [
      { id: 'espresso', label: { es: 'Espresso tradicional', 'pt-BR': 'Espresso tradicional' }, emoji: '☕' },
      { id: 'specialty', label: { es: 'Café de especialidad', 'pt-BR': 'Café especial' }, emoji: '✨' },
      { id: 'cold_brew', label: { es: 'Cold brew', 'pt-BR': 'Cold brew' }, emoji: '🧊' },
      { id: 'plant_milk', label: { es: 'Leches vegetales', 'pt-BR': 'Leites vegetais' }, emoji: '🥛' },
    ],
  },
];

const FINANCE_QUESTIONS: Question[] = [
  // Food cost - Complete
  {
    id: 'food_cost',
    category: 'finance',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    title: { es: '% costo de insumos sobre venta', 'pt-BR': '% custo de insumos sobre venda' },
    help: { es: 'Aproximado está bien', 'pt-BR': 'Aproximado está bom' },
    type: 'slider',
    min: 10,
    max: 70,
    unit: '%',
  },
  // Monthly revenue range - Complete
  {
    id: 'monthly_revenue',
    category: 'finance',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    title: { es: 'Facturación mensual aproximada', 'pt-BR': 'Faturamento mensal aproximado' },
    type: 'single',
    options: [
      // These will be adapted per country currency
      { id: 'tier1', label: { es: 'Menos de $2M', 'pt-BR': 'Menos de R$50k' } },
      { id: 'tier2', label: { es: '$2M - $5M', 'pt-BR': 'R$50k - R$150k' } },
      { id: 'tier3', label: { es: '$5M - $15M', 'pt-BR': 'R$150k - R$500k' } },
      { id: 'tier4', label: { es: 'Más de $15M', 'pt-BR': 'Mais de R$500k' } },
    ],
  },
  // Fixed costs - Complete
  {
    id: 'fixed_costs_pct',
    category: 'finance',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    title: { es: '% costos fijos (alquiler, sueldos, servicios)', 'pt-BR': '% custos fixos (aluguel, salários, serviços)' },
    type: 'slider',
    min: 20,
    max: 80,
    unit: '%',
  },
  // Rent - Complete
  {
    id: 'is_rented',
    category: 'finance',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    title: { es: '¿El local es alquilado o propio?', 'pt-BR': 'O local é alugado ou próprio?' },
    type: 'single',
    options: [
      { id: 'rented', label: { es: 'Alquilado', 'pt-BR': 'Alugado' }, emoji: '🏠' },
      { id: 'owned', label: { es: 'Propio', 'pt-BR': 'Próprio' }, emoji: '🔑' },
      { id: 'shared', label: { es: 'Compartido', 'pt-BR': 'Compartilhado' }, emoji: '🤝' },
    ],
  },
];

const TEAM_QUESTIONS: Question[] = [
  // Employees - Universal
  {
    id: 'employees',
    category: 'team',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'both',
    title: { es: '¿Cuántas personas trabajan?', 'pt-BR': 'Quantas pessoas trabalham?' },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
      { id: '2-5', label: { es: '2-5 personas', 'pt-BR': '2-5 pessoas' }, emoji: '👥' },
      { id: '6-15', label: { es: '6-15 personas', 'pt-BR': '6-15 pessoas' }, emoji: '👨‍👩‍👧‍👦' },
      { id: '16-30', label: { es: '16-30 personas', 'pt-BR': '16-30 pessoas' }, emoji: '🏢' },
      { id: '30+', label: { es: 'Más de 30', 'pt-BR': 'Mais de 30' }, emoji: '🏭' },
    ],
  },
  // Shifts - Complete
  {
    id: 'shifts',
    category: 'team',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'complete',
    title: { es: '¿Cuántos turnos de trabajo tenés?', 'pt-BR': 'Quantos turnos de trabalho você tem?' },
    type: 'single',
    businessTypes: [...BUSINESS_TYPE_GROUPS.restaurant, ...BUSINESS_TYPE_GROUPS.bar, ...BUSINESS_TYPE_GROUPS.cafe],
    options: [
      { id: '1', label: { es: 'Un turno', 'pt-BR': 'Um turno' } },
      { id: '2', label: { es: 'Dos turnos', 'pt-BR': 'Dois turnos' } },
      { id: '3+', label: { es: 'Tres o más', 'pt-BR': 'Três ou mais' } },
    ],
  },
  // Kitchen staff - For restaurants
  {
    id: 'kitchen_staff',
    category: 'team',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'complete',
    title: { es: '¿Cuántas personas en cocina?', 'pt-BR': 'Quantas pessoas na cozinha?' },
    type: 'single',
    businessTypes: BUSINESS_TYPE_GROUPS.restaurant,
    options: [
      { id: '1-2', label: { es: '1-2', 'pt-BR': '1-2' } },
      { id: '3-5', label: { es: '3-5', 'pt-BR': '3-5' } },
      { id: '6-10', label: { es: '6-10', 'pt-BR': '6-10' } },
      { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' } },
    ],
  },
  // Biggest challenge - Universal
  {
    id: 'team_challenge',
    category: 'team',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'complete',
    title: { es: '¿Cuál es tu mayor desafío con el equipo?', 'pt-BR': 'Qual é seu maior desafio com a equipe?' },
    type: 'single',
    options: [
      { id: 'finding', label: { es: 'Encontrar gente', 'pt-BR': 'Encontrar pessoas' }, emoji: '🔍' },
      { id: 'training', label: { es: 'Capacitación', 'pt-BR': 'Treinamento' }, emoji: '📚' },
      { id: 'retention', label: { es: 'Retención', 'pt-BR': 'Retenção' }, emoji: '💔' },
      { id: 'motivation', label: { es: 'Motivación', 'pt-BR': 'Motivação' }, emoji: '🎯' },
      { id: 'none', label: { es: 'Ninguno por ahora', 'pt-BR': 'Nenhum por agora' }, emoji: '✅' },
    ],
  },
];

const MARKETING_QUESTIONS: Question[] = [
  // Instagram - Universal
  {
    id: 'instagram',
    category: 'marketing',
    categoryLabel: { es: 'Marketing', 'pt-BR': 'Marketing' },
    mode: 'both',
    title: { es: 'Instagram del negocio', 'pt-BR': 'Instagram do negócio' },
    help: { es: 'Poné tu @usuario', 'pt-BR': 'Coloque seu @usuario' },
    type: 'text',
  },
  // Social presence - Complete
  {
    id: 'social_presence',
    category: 'marketing',
    categoryLabel: { es: 'Marketing', 'pt-BR': 'Marketing' },
    mode: 'complete',
    title: { es: '¿Dónde tenés presencia?', 'pt-BR': 'Onde você tem presença?' },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '👍' },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
      { id: 'google', label: { es: 'Google Business', 'pt-BR': 'Google Meu Negócio' }, emoji: '📍' },
      { id: 'website', label: { es: 'Sitio web', 'pt-BR': 'Site' }, emoji: '🌐' },
    ],
  },
  // Marketing activities - Complete
  {
    id: 'marketing_activities',
    category: 'marketing',
    categoryLabel: { es: 'Marketing', 'pt-BR': 'Marketing' },
    mode: 'complete',
    title: { es: '¿Qué acciones de marketing hacés?', 'pt-BR': 'Quais ações de marketing você faz?' },
    type: 'multi',
    options: [
      { id: 'social_posts', label: { es: 'Posts en redes', 'pt-BR': 'Posts nas redes' }, emoji: '📱' },
      { id: 'stories', label: { es: 'Stories diarios', 'pt-BR': 'Stories diários' }, emoji: '📸' },
      { id: 'promos', label: { es: 'Promociones', 'pt-BR': 'Promoções' }, emoji: '🏷️' },
      { id: 'influencers', label: { es: 'Influencers', 'pt-BR': 'Influenciadores' }, emoji: '⭐' },
      { id: 'none', label: { es: 'Nada todavía', 'pt-BR': 'Nada ainda' }, emoji: '🤷' },
    ],
  },
  // Reviews focus - Complete
  {
    id: 'reviews_importance',
    category: 'marketing',
    categoryLabel: { es: 'Marketing', 'pt-BR': 'Marketing' },
    mode: 'complete',
    title: { es: '¿Qué tan importantes son las reseñas online para vos?', 'pt-BR': 'Quão importantes são as avaliações online para você?' },
    type: 'single',
    options: [
      { id: 'critical', label: { es: 'Críticas', 'pt-BR': 'Críticas' }, emoji: '🔥' },
      { id: 'important', label: { es: 'Importantes', 'pt-BR': 'Importantes' }, emoji: '👍' },
      { id: 'moderate', label: { es: 'Moderadas', 'pt-BR': 'Moderadas' }, emoji: '🤔' },
      { id: 'low', label: { es: 'Poco', 'pt-BR': 'Pouco' }, emoji: '😌' },
    ],
  },
];

const GOALS_QUESTIONS: Question[] = [
  // Main goal - Universal
  {
    id: 'main_goal',
    category: 'goals',
    categoryLabel: { es: 'Objetivos', 'pt-BR': 'Objetivos' },
    mode: 'both',
    title: { es: '¿Qué querés lograr este año?', 'pt-BR': 'O que você quer alcançar este ano?' },
    type: 'multi',
    required: true,
    options: [
      { id: 'more_sales', label: { es: 'Vender más', 'pt-BR': 'Vender mais' }, emoji: '💰' },
      { id: 'more_clients', label: { es: 'Más clientes', 'pt-BR': 'Mais clientes' }, emoji: '👥' },
      { id: 'better_margins', label: { es: 'Mejorar márgenes', 'pt-BR': 'Melhorar margens' }, emoji: '📈' },
      { id: 'expand', label: { es: 'Expandir/Abrir otro', 'pt-BR': 'Expandir/Abrir outro' }, emoji: '🚀' },
      { id: 'efficiency', label: { es: 'Más eficiencia', 'pt-BR': 'Mais eficiência' }, emoji: '⚡' },
      { id: 'reputation', label: { es: 'Mejor reputación', 'pt-BR': 'Melhor reputação' }, emoji: '⭐' },
    ],
  },
  // Biggest pain - Universal
  {
    id: 'biggest_pain',
    category: 'goals',
    categoryLabel: { es: 'Objetivos', 'pt-BR': 'Objetivos' },
    mode: 'both',
    title: { es: '¿Cuál es tu mayor dolor de cabeza hoy?', 'pt-BR': 'Qual é sua maior dor de cabeça hoje?' },
    type: 'single',
    options: [
      { id: 'sales', label: { es: 'Ventas bajas', 'pt-BR': 'Vendas baixas' }, emoji: '📉' },
      { id: 'costs', label: { es: 'Costos altos', 'pt-BR': 'Custos altos' }, emoji: '💸' },
      { id: 'team', label: { es: 'Problemas de equipo', 'pt-BR': 'Problemas de equipe' }, emoji: '👥' },
      { id: 'time', label: { es: 'Falta de tiempo', 'pt-BR': 'Falta de tempo' }, emoji: '⏰' },
      { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, emoji: '🏃' },
      { id: 'nothing', label: { es: 'Todo bien por ahora', 'pt-BR': 'Tudo bem por agora' }, emoji: '✅' },
    ],
  },
];

// ============== EXPORT ALL QUESTIONS ==============

export const ALL_GASTRO_QUESTIONS: Question[] = [
  ...OPERATION_QUESTIONS,
  ...SALES_QUESTIONS,
  ...MENU_QUESTIONS,
  ...FINANCE_QUESTIONS,
  ...TEAM_QUESTIONS,
  ...MARKETING_QUESTIONS,
  ...GOALS_QUESTIONS,
];

// ============== FILTER FUNCTION ==============

export function getQuestionsForSetup(
  countryCode: string,
  businessTypeId: string,
  setupMode: 'quick' | 'complete'
): Question[] {
  return ALL_GASTRO_QUESTIONS.filter(q => {
    // Filter by mode
    if (q.mode !== 'both' && q.mode !== setupMode) return false;
    
    // Filter by country (if specified)
    if (q.countries && !q.countries.includes(countryCode)) return false;
    
    // Filter by business type (if specified)
    if (q.businessTypes && !q.businessTypes.includes(businessTypeId)) return false;
    
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

// Get category labels for progress display
export const CATEGORY_ORDER = ['operation', 'sales', 'menu', 'finance', 'team', 'marketing', 'goals'];

export function getCategoryLabel(categoryId: string, lang: 'es' | 'pt-BR'): string {
  const labels: Record<string, { es: string; 'pt-BR': string }> = {
    operation: { es: 'Operación', 'pt-BR': 'Operação' },
    sales: { es: 'Ventas', 'pt-BR': 'Vendas' },
    menu: { es: 'Carta/Menú', 'pt-BR': 'Cardápio' },
    finance: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    team: { es: 'Equipo', 'pt-BR': 'Equipe' },
    marketing: { es: 'Marketing', 'pt-BR': 'Marketing' },
    goals: { es: 'Objetivos', 'pt-BR': 'Objetivos' },
  };
  return labels[categoryId]?.[lang] || categoryId;
}
