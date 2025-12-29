// Gastronomy Setup Questions Engine v1
// Based on vistaCEO.setup_inteligente.gastro.questions.v1

export type SetupMode = 'quick' | 'full';
export type Language = 'es' | 'pt-BR';

export interface GastroQuestion {
  id: string;
  step: string;
  mode: 'quick' | 'full' | 'both';
  modules: string[];
  score_area: string;
  applies_if: AppliesCondition;
  ui: QuestionUI;
  store: { path: string; map?: Record<string, string> };
}

export interface AppliesCondition {
  always?: boolean;
  channels_any?: string[];
  type_any?: string[];
  tags_any?: string[];
  integrations_any?: Array<{ key: string; equals?: string; in?: string[] }>;
  any?: Array<{ field: string; equals?: string; in?: string[] }>;
}

export interface QuestionUI {
  es: { title: string; help: string };
  'pt-BR': { title: string; help: string };
  input: QuestionInput;
}

export interface QuestionInputOption {
  id: string;
  label_es: string;
  label_pt: string;
}

export interface QuestionInput {
  type: string;
  required?: boolean;
  options?: (string | QuestionInputOption)[];
  optionsSource?: string;
  value?: string;
  placeholder_es?: string;
  placeholder_pt?: string;
  include_other?: boolean;
  max?: number;
  min?: number;
  unit?: string;
  currencyFrom?: string;
  showUsdEstimate?: boolean;
  channelsFrom?: string;
  avoid_duplicate_primary?: boolean;
  area_id?: string;
  country_first_labels?: boolean;
  prefill_from_google_if_connected?: boolean;
  percentRange?: [number, number];
  buckets?: string[];
  fields?: string[];
}

// Country profiles for dynamic options
export const COUNTRY_PROFILES: Record<string, {
  currency: { code: string; symbol: string };
  language: Language;
  optionPacks: {
    gastro: {
      deliveryPlatforms: string[];
      paymentMethods: string[];
      reviewSources: string[];
      reservationTools: string[];
      posVendors: string[];
      socialChannels: string[];
    };
  };
}> = {
  AR: {
    currency: { code: 'ARS', symbol: '$' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['PedidosYa', 'Rappi', 'Uber Eats', 'Wabi', 'Propio'],
        paymentMethods: ['Efectivo', 'Mercado Pago', 'Tarjeta crédito', 'Tarjeta débito', 'QR'],
        reviewSources: ['TripAdvisor', 'Instagram', 'Facebook', 'Apps de delivery'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono', 'OpenTable', 'Mesa 24/7'],
        posVendors: ['Odoo', 'Totem', 'Tango', 'Dragonfish', 'BePOS', 'Contabilium'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  MX: {
    currency: { code: 'MXN', symbol: '$' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['Uber Eats', 'Rappi', 'Didi Food', 'Sin Delantal', 'Propio'],
        paymentMethods: ['Efectivo', 'Tarjeta crédito', 'Tarjeta débito', 'OXXO Pay', 'Mercado Pago'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram', 'Facebook'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono', 'OpenTable', 'Cover'],
        posVendors: ['Clip', 'Soft Restaurant', 'Poster', 'Square', 'Aloha'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  CL: {
    currency: { code: 'CLP', symbol: '$' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['PedidosYa', 'Rappi', 'Uber Eats', 'Cornershop', 'Propio'],
        paymentMethods: ['Efectivo', 'Tarjeta crédito', 'Tarjeta débito', 'Transbank', 'Webpay'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono', 'The Fork'],
        posVendors: ['Bsale', 'Nubox', 'SimpliPOS', 'Square'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  CO: {
    currency: { code: 'COP', symbol: '$' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['Rappi', 'Domicilios.com', 'Uber Eats', 'Didi Food', 'Propio'],
        paymentMethods: ['Efectivo', 'Nequi', 'Daviplata', 'Tarjeta crédito', 'PSE'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono'],
        posVendors: ['Siigo', 'World Office', 'Alegra', 'Square'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  BR: {
    currency: { code: 'BRL', symbol: 'R$' },
    language: 'pt-BR',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['iFood', 'Rappi', 'Uber Eats', '99Food', 'Próprio'],
        paymentMethods: ['Dinheiro', 'Pix', 'Cartão crédito', 'Cartão débito', 'VR/VA'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram', 'iFood'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Telefone', 'GetNinjas'],
        posVendors: ['Bling', 'Totvs', 'Linx', 'Stone', 'iFood para Negócios'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  UY: {
    currency: { code: 'UYU', symbol: '$' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['PedidosYa', 'Rappi', 'Uber Eats', 'Propio'],
        paymentMethods: ['Efectivo', 'Mercado Pago', 'Tarjeta crédito', 'Tarjeta débito'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono'],
        posVendors: ['Scanntech', 'GeneXus', 'Sonda', 'Square'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  CR: {
    currency: { code: 'CRC', symbol: '₡' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['Uber Eats', 'Glovo', 'Hugo', 'Pedidos Ya', 'Propio'],
        paymentMethods: ['Efectivo', 'SINPE Móvil', 'Tarjeta crédito', 'Tarjeta débito'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono'],
        posVendors: ['Soft', 'Syscafe', 'Square'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  PA: {
    currency: { code: 'USD', symbol: '$' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['PedidosYa', 'Uber Eats', 'Appetito 24', 'Propio'],
        paymentMethods: ['Efectivo', 'Yappy', 'Tarjeta crédito', 'Tarjeta débito'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono'],
        posVendors: ['NCR', 'Micros', 'Square'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
  EC: {
    currency: { code: 'USD', symbol: '$' },
    language: 'es',
    optionPacks: {
      gastro: {
        deliveryPlatforms: ['PedidosYa', 'Uber Eats', 'Rappi', 'Propio'],
        paymentMethods: ['Efectivo', 'Tarjeta crédito', 'Tarjeta débito', 'Transferencia'],
        reviewSources: ['TripAdvisor', 'Google Maps', 'Instagram'],
        reservationTools: ['WhatsApp', 'Instagram DM', 'Teléfono'],
        posVendors: ['Siigo', 'Alegra', 'Square'],
        socialChannels: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Business'],
      },
    },
  },
};

// Channel options (always visible)
export const CHANNEL_OPTIONS: QuestionInputOption[] = [
  { id: 'dine_in', label_es: 'En local (salón/mesas)', label_pt: 'No local (salão/mesas)' },
  { id: 'pickup', label_es: 'Para llevar (retiro)', label_pt: 'Retirada (para viagem)' },
  { id: 'delivery_own', label_es: 'Delivery propio', label_pt: 'Entrega própria' },
  { id: 'delivery_apps', label_es: 'Delivery por apps', label_pt: 'Entrega por apps' },
  { id: 'catering_events', label_es: 'Eventos / catering', label_pt: 'Eventos / catering' },
  { id: 'subscription', label_es: 'Suscripción (viandas)', label_pt: 'Assinatura (marmitas)' },
  { id: 'mobile', label_es: 'Itinerante (food truck / ferias)', label_pt: 'Itinerante (food truck / feiras)' },
  { id: 'institutional', label_es: 'Institucional (comedor)', label_pt: 'Institucional (refeitório)' },
];

// Quick flow order
export const QUICK_FLOW_ORDER = [
  'SI00_COUNTRY',
  'SI01_GOOGLE_CHOICE',
  'SI01_BUSINESS_NAME_IF_NO_GOOGLE',
  'SI01_CITY_IF_NO_GOOGLE',
  'SI02_MODE',
  'SI03_SECTOR',
  'SI04_TYPE_PRIMARY',
  'G01_CHANNELS',
  'G50_SALES_TRACKING_METHOD',
  'G52_AVG_TICKET',
  'G53_MONTHLY_REVENUE',
  'G20_SCHEDULE_SIMPLE',
  'G22_PEAKS',
  'G30_SEATING_CAPACITY',
  'G40_DELIVERY_APPS_USED',
  'G41_DELIVERY_APPS_SHARE',
  'G44_DELIVERY_TIME',
  'G60_MENU_SIZE',
  'G61_TOP_SELLERS',
  'G63_MENU_LINK',
  'G70_FOOD_COST_PERCENT',
  'G71_LABOR_COST_PERCENT',
  'G101_REVIEWS_REPLY_HABIT',
  'G110_ACTIVE_CHANNELS',
  'G120_TEAM_SIZE',
  'G130_MAIN_CUSTOMER',
  'G131_TOP_COMPLAINT',
  'G140_MAIN_GOAL_30D',
];

// Full flow additional questions
export const FULL_ADDITIONAL_ORDER = [
  'SI05_TYPE_SECONDARY',
  'G10_LEGAL_ENTITY',
  'G11_OPENING_DATE',
  'G21_SCHEDULE_DETAILED',
  'G31_TABLE_TURNOVER',
  'G32_SERVICE_TIME',
  'G42_DELIVERY_APPS_COMMISSION',
  'G43_DELIVERY_OWN_RADIUS',
  'G51_POS_VENDOR',
  'G54_ORDERS_PER_DAY',
  'G55_CHANNEL_MIX',
  'G62_SIGNATURE_ITEM',
  'G72_FIXED_COSTS',
  'G73_PROFIT_FEEL',
  'G80_INVENTORY_CONTROL',
  'G81_WASTE_LEVEL',
  'G82_STOCKOUTS',
  'G83_SUPPLIERS_COUNT',
  'G90_TAKES_RESERVATIONS',
  'G91_RESERVATION_TOOL',
  'G92_NO_SHOW_LEVEL',
  'G100_REVIEWS_SOURCES',
  'G102_REVIEW_REPLY_SLA',
  'G111_POSTING_FREQUENCY',
  'G112_MARKETING_BUDGET',
  'G121_HIRING_PAIN',
  'G141_GOAL_90D',
  'GX_RESTAURANT_KITCHEN_BOTTLENECK',
  'GX_BAR_BEVERAGE_MIX',
  'GX_BAKERY_PRODUCTION_SCHEDULE',
  'GX_ICECREAM_SEASONALITY',
  'GX_GHOST_KITCHEN_BRANDS',
  'GX_CATERING_EVENTS_PER_MONTH',
  'GX_INSTITUTIONAL_RATIONS_PER_DAY',
];

// All questions definition
export const GASTRO_QUESTIONS: GastroQuestion[] = [
  // SI-01: Google Choice
  {
    id: 'SI01_GOOGLE_CHOICE',
    step: 'SI-01',
    mode: 'both',
    modules: ['M_ATENCION', 'M_REPUTACION'],
    score_area: 'Reputación',
    applies_if: { always: true },
    ui: {
      es: { title: 'Conectar Google (recomendado)', help: 'Trae reseñas, horarios y señales públicas. Podés hacerlo ahora o después.' },
      'pt-BR': { title: 'Conectar Google (recomendado)', help: 'Traz avaliações, horários e sinais públicos. Você pode fazer agora ou depois.' },
      input: {
        type: 'choice_cards',
        required: true,
        options: [
          { id: 'connect', label_es: 'Conectar Google', label_pt: 'Conectar Google' },
          { id: 'not_listed', label_es: 'No tengo mi negocio en Google', label_pt: 'Não tenho meu negócio no Google' },
          { id: 'later', label_es: 'Más tarde', label_pt: 'Mais tarde' },
        ],
      },
    },
    store: { path: 'integrations.google.status', map: { connect: 'connected', not_listed: 'not_listed', later: 'skipped' } },
  },
  // SI-02: Mode selection
  {
    id: 'SI02_MODE',
    step: 'SI-02',
    mode: 'both',
    modules: [],
    score_area: 'Identidad',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cómo querés empezar?', help: 'Rápido = tablero útil ya. Completo = más precisión desde el día 1.' },
      'pt-BR': { title: 'Como você quer começar?', help: 'Rápido = painel útil já. Completo = mais precisão desde o dia 1.' },
      input: {
        type: 'choice_cards',
        required: true,
        options: [
          { id: 'quick', label_es: 'Empezar rápido (2–4 min)', label_pt: 'Começar rápido (2–4 min)' },
          { id: 'full', label_es: 'Setup completo (8–15 min)', label_pt: 'Setup completo (8–15 min)' },
        ],
      },
    },
    store: { path: 'setup.mode' },
  },
  // G-01: Channels
  {
    id: 'G01_CHANNELS',
    step: 'G-01',
    mode: 'both',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cómo vendés hoy?', help: 'Elegí todo lo que aplique. Esto define tus widgets.' },
      'pt-BR': { title: 'Como você vende hoje?', help: 'Selecione tudo que se aplica. Isso define seus widgets.' },
      input: { type: 'multiselect', required: true, options: CHANNEL_OPTIONS },
    },
    store: { path: 'business.channels' },
  },
  // G-50: Sales tracking method
  {
    id: 'G50_SALES_TRACKING_METHOD',
    step: 'G-50',
    mode: 'both',
    modules: ['M_VENTAS_POS'],
    score_area: 'Ventas',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cómo registrás ventas hoy?', help: 'No importa si es simple: con eso te armo métricas igual.' },
      'pt-BR': { title: 'Como você registra vendas hoje?', help: 'Não importa se é simples: com isso eu monto métricas igual.' },
      input: { type: 'single_select', options: ['pos', 'excel', 'cuaderno', 'nada', 'no_se'], required: true },
    },
    store: { path: 'sales.tracking.method' },
  },
  // G-52: Average ticket
  {
    id: 'G52_AVG_TICKET',
    step: 'G-52',
    mode: 'both',
    modules: ['M_VENTAS_POS', 'M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Ticket promedio (aprox.)', help: 'En tu moneda. Abajo te muestro ≈ USD.' },
      'pt-BR': { title: 'Ticket médio (aprox.)', help: 'Na sua moeda. Embaixo eu mostro ≈ USD.' },
      input: { type: 'money', required: false, currencyFrom: 'countryProfile.currency.code', showUsdEstimate: true },
    },
    store: { path: 'sales.avg_ticket' },
  },
  // G-53: Monthly revenue
  {
    id: 'G53_MONTHLY_REVENUE',
    step: 'G-53',
    mode: 'both',
    modules: ['M_FINANZAS', 'M_ANALITICA'],
    score_area: 'Finanzas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Facturación mensual (aprox.)', help: 'Aunque sea un rango: te ayuda a medir impacto real.' },
      'pt-BR': { title: 'Faturamento mensal (aprox.)', help: 'Mesmo em faixa: ajuda a medir impacto real.' },
      input: { type: 'money_or_range', currencyFrom: 'countryProfile.currency.code', showUsdEstimate: true, required: false },
    },
    store: { path: 'finance.monthly_revenue' },
  },
  // G-60: Menu size
  {
    id: 'G60_MENU_SIZE',
    step: 'G-60',
    mode: 'both',
    modules: ['M_INVENTARIO', 'M_ANALITICA'],
    score_area: 'Oferta',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cuántos productos/platos vendés activamente?', help: 'Rango aproximado.' },
      'pt-BR': { title: 'Quantos produtos/pratos você vende ativamente?', help: 'Faixa aproximada.' },
      input: { type: 'single_select', options: ['1-10', '11-30', '31-80', '80+', 'no_se'], required: false },
    },
    store: { path: 'offer.menu.size_bucket' },
  },
  // G-61: Top sellers
  {
    id: 'G61_TOP_SELLERS',
    step: 'G-61',
    mode: 'both',
    modules: ['M_ANALITICA'],
    score_area: 'Oferta',
    applies_if: { always: true },
    ui: {
      es: { title: 'Top 3–5 productos que más se venden', help: 'Si no sabés, poné los que te vengan.' },
      'pt-BR': { title: 'Top 3–5 produtos que mais vendem', help: 'Se não souber, coloque os que lembrar.' },
      input: { type: 'chips_text', max: 5, required: false },
    },
    store: { path: 'offer.top_sellers' },
  },
  // G-70: Food cost percent
  {
    id: 'G70_FOOD_COST_PERCENT',
    step: 'G-70',
    mode: 'both',
    modules: ['M_FINANZAS'],
    score_area: 'Finanzas',
    applies_if: { always: true },
    ui: {
      es: { title: '% costo de insumos sobre venta (aprox.)', help: 'Si no sabés exacto, elegí bajo/medio/alto.' },
      'pt-BR': { title: '% de custo de insumos sobre venda (aprox.)', help: 'Se não souber exato, escolha baixo/médio/alto.' },
      input: { type: 'percent_or_bucket', buckets: ['bajo', 'medio', 'alto', 'no_se'], percentRange: [10, 70], required: false },
    },
    store: { path: 'finance.food_cost_percent' },
  },
  // G-71: Labor cost percent
  {
    id: 'G71_LABOR_COST_PERCENT',
    step: 'G-71',
    mode: 'both',
    modules: ['M_FINANZAS'],
    score_area: 'Finanzas',
    applies_if: { always: true },
    ui: {
      es: { title: '% costo de personal sobre venta (aprox.)', help: 'Puede ser estimado.' },
      'pt-BR': { title: '% de custo de equipe sobre venda (aprox.)', help: 'Pode ser estimado.' },
      input: { type: 'percent_or_bucket', buckets: ['bajo', 'medio', 'alto', 'no_se'], percentRange: [5, 60], required: false },
    },
    store: { path: 'finance.labor_cost_percent' },
  },
  // G-101: Reviews reply habit
  {
    id: 'G101_REVIEWS_REPLY_HABIT',
    step: 'G-101',
    mode: 'both',
    modules: ['M_ATENCION'],
    score_area: 'Reputación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Respondés reseñas?', help: 'Esto impacta directo en reputación y conversión.' },
      'pt-BR': { title: 'Você responde avaliações?', help: 'Isso impacta direto reputação e conversão.' },
      input: { type: 'single_select', options: ['siempre', 'a_veces', 'nunca'], required: false },
    },
    store: { path: 'reputation.reply_habit' },
  },
  // G-120: Team size
  {
    id: 'G120_TEAM_SIZE',
    step: 'G-120',
    mode: 'both',
    modules: ['M_OPERACIONES'],
    score_area: 'Equipo',
    applies_if: { always: true },
    ui: {
      es: { title: 'Equipo total (aprox.)', help: 'Incluye cocina + salón + delivery.' },
      'pt-BR': { title: 'Equipe total (aprox.)', help: 'Inclui cozinha + salão + entregas.' },
      input: { type: 'single_select', options: ['1-2', '3-5', '6-10', '11-20', '20+', 'no_se'], required: false },
    },
    store: { path: 'team.size_bucket' },
  },
  // G-130: Main customer
  {
    id: 'G130_MAIN_CUSTOMER',
    step: 'G-130',
    mode: 'both',
    modules: ['M_ANALITICA', 'M_MARKETING'],
    score_area: 'Clientes',
    applies_if: { always: true },
    ui: {
      es: { title: 'Tu cliente principal hoy', help: 'Elijo benchmarks y misiones con eso.' },
      'pt-BR': { title: 'Seu cliente principal hoje', help: 'Eu escolho benchmarks e missões com isso.' },
      input: { type: 'multiselect', max: 2, options: ['familias', 'oficinas', 'turistas', 'estudiantes', 'premium', 'masivo', 'no_se'], required: false },
    },
    store: { path: 'customers.main_segments' },
  },
  // G-131: Top complaint
  {
    id: 'G131_TOP_COMPLAINT',
    step: 'G-131',
    mode: 'both',
    modules: ['M_ATENCION'],
    score_area: 'Clientes',
    applies_if: { always: true },
    ui: {
      es: { title: 'Problema #1 que te reclaman', help: 'Para priorizar misiones.' },
      'pt-BR': { title: 'Problema #1 que reclamam', help: 'Para priorizar missões.' },
      input: { type: 'single_select', options: ['demora', 'precio', 'calidad', 'atencion', 'errores_pedido', 'otro', 'no_se'], required: false },
    },
    store: { path: 'customers.top_complaint' },
  },
  // G-140: Main goal 30d
  {
    id: 'G140_MAIN_GOAL_30D',
    step: 'G-140',
    mode: 'both',
    modules: ['M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Qué querés mejorar primero (30 días)?', help: 'Esto define tu foco y misiones.' },
      'pt-BR': { title: 'O que você quer melhorar primeiro (30 dias)?', help: 'Isso define seu foco e missões.' },
      input: { type: 'single_select', options: ['ventas', 'rentabilidad', 'servicio', 'reputacion', 'delivery', 'orden_control'], required: true },
    },
    store: { path: 'goals.primary_30d' },
  },
  // G-30: Seating capacity (conditional: dine_in)
  {
    id: 'G30_SEATING_CAPACITY',
    step: 'G-30',
    mode: 'both',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { channels_any: ['dine_in'] },
    ui: {
      es: { title: 'Capacidad en el local', help: 'Aprox. asientos o mesas. Me sirve para saturación.' },
      'pt-BR': { title: 'Capacidade no local', help: 'Aprox. lugares/mesas. Serve para lotação.' },
      input: { type: 'number_or_range', unit: 'seats_or_tables', required: false },
    },
    store: { path: 'ops.dine_in.capacity' },
  },
  // G-40: Delivery apps used (conditional: delivery_apps)
  {
    id: 'G40_DELIVERY_APPS_USED',
    step: 'G-40',
    mode: 'both',
    modules: ['M_LOGISTICA', 'M_FINANZAS', 'M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { channels_any: ['delivery_apps'] },
    ui: {
      es: { title: '¿Qué apps usás?', help: 'Te muestro comisiones e impacto real (USD).' },
      'pt-BR': { title: 'Quais apps você usa?', help: 'Mostro comissões e impacto real (USD).' },
      input: { type: 'multiselect', optionsSource: 'countryProfile.optionPacks.gastro.deliveryPlatforms', include_other: true, required: true },
    },
    store: { path: 'delivery.apps.platforms' },
  },
  // G-41: Delivery apps share (conditional: delivery_apps)
  {
    id: 'G41_DELIVERY_APPS_SHARE',
    step: 'G-41',
    mode: 'both',
    modules: ['M_FINANZAS', 'M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { channels_any: ['delivery_apps'] },
    ui: {
      es: { title: '% de ventas por apps (aprox.)', help: 'Aunque sea aproximado, sirve muchísimo.' },
      'pt-BR': { title: '% de vendas por apps (aprox.)', help: 'Mesmo aproximado, ajuda muito.' },
      input: { type: 'percent_slider', required: false },
    },
    store: { path: 'delivery.apps.sales_share_percent' },
  },
  // G-44: Delivery time (conditional)
  {
    id: 'G44_DELIVERY_TIME',
    step: 'G-44',
    mode: 'both',
    modules: ['M_LOGISTICA', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { channels_any: ['delivery_own', 'delivery_apps', 'pickup'] },
    ui: {
      es: { title: 'Tiempo promedio de preparación/entrega', help: 'Rango aproximado. Esto alimenta el widget de tiempos.' },
      'pt-BR': { title: 'Tempo médio de preparo/entrega', help: 'Faixa aproximada. Isso alimenta o widget de tempos.' },
      input: { type: 'range_minutes', min: 5, max: 180, required: false },
    },
    store: { path: 'ops.fulfillment.time_range_min' },
  },
  // G-110: Active channels (marketing)
  {
    id: 'G110_ACTIVE_CHANNELS',
    step: 'G-110',
    mode: 'both',
    modules: ['M_MARKETING'],
    score_area: 'Marketing',
    applies_if: { always: true },
    ui: {
      es: { title: 'Canales activos', help: 'Para darte misiones realistas (no humo).' },
      'pt-BR': { title: 'Canais ativos', help: 'Para te dar missões realistas (sem enrolação).' },
      input: { type: 'multiselect', optionsSource: 'countryProfile.optionPacks.gastro.socialChannels', include_other: true, required: false },
    },
    store: { path: 'marketing.channels' },
  },
];

// Helper to get question by ID
export const getQuestionById = (id: string): GastroQuestion | undefined => {
  return GASTRO_QUESTIONS.find(q => q.id === id);
};

// Helper to check if a question applies based on current data
export const questionApplies = (
  question: GastroQuestion,
  data: Record<string, any>,
  mode: SetupMode
): boolean => {
  // Check mode
  if (question.mode !== 'both' && question.mode !== mode) {
    return false;
  }

  const condition = question.applies_if;

  // Always apply
  if (condition.always) return true;

  // Check channels
  if (condition.channels_any && condition.channels_any.length > 0) {
    const userChannels = data['business.channels'] || [];
    if (!condition.channels_any.some(ch => userChannels.includes(ch))) {
      return false;
    }
  }

  // Check type
  if (condition.type_any && condition.type_any.length > 0) {
    const primaryType = data['business.primary_type_id'];
    if (!condition.type_any.includes(primaryType)) {
      return false;
    }
  }

  // Check integrations
  if (condition.integrations_any && condition.integrations_any.length > 0) {
    for (const cond of condition.integrations_any) {
      const value = data[cond.key];
      if (cond.equals && value !== cond.equals) return false;
      if (cond.in && !cond.in.includes(value)) return false;
    }
  }

  // Check any conditions
  if (condition.any && condition.any.length > 0) {
    for (const cond of condition.any) {
      const value = data[cond.field];
      if (cond.equals && value === cond.equals) return true;
      if (cond.in && cond.in.includes(value)) return true;
    }
    return false;
  }

  return true;
};

// Get active questions for a flow
export const getActiveQuestions = (
  mode: SetupMode,
  data: Record<string, any>
): GastroQuestion[] => {
  const flowOrder = mode === 'full'
    ? [...QUICK_FLOW_ORDER, ...FULL_ADDITIONAL_ORDER]
    : QUICK_FLOW_ORDER;

  return flowOrder
    .map(id => getQuestionById(id))
    .filter((q): q is GastroQuestion => q !== undefined && questionApplies(q, data, mode));
};

// Label mappings for display
export const OPTION_LABELS: Record<string, { es: string; pt: string }> = {
  pos: { es: 'Sistema POS', pt: 'Sistema POS' },
  excel: { es: 'Excel/planilla', pt: 'Excel/planilha' },
  cuaderno: { es: 'Cuaderno/papel', pt: 'Caderno/papel' },
  nada: { es: 'No registro', pt: 'Não registro' },
  no_se: { es: 'No sé', pt: 'Não sei' },
  siempre: { es: 'Siempre', pt: 'Sempre' },
  a_veces: { es: 'A veces', pt: 'Às vezes' },
  nunca: { es: 'Nunca', pt: 'Nunca' },
  bajo: { es: 'Bajo', pt: 'Baixo' },
  medio: { es: 'Medio', pt: 'Médio' },
  alto: { es: 'Alto', pt: 'Alto' },
  ventas: { es: 'Aumentar ventas', pt: 'Aumentar vendas' },
  rentabilidad: { es: 'Mejorar rentabilidad', pt: 'Melhorar rentabilidade' },
  servicio: { es: 'Mejorar servicio', pt: 'Melhorar serviço' },
  reputacion: { es: 'Mejorar reputación', pt: 'Melhorar reputação' },
  delivery: { es: 'Optimizar delivery', pt: 'Otimizar delivery' },
  orden_control: { es: 'Orden y control', pt: 'Ordem e controle' },
  familias: { es: 'Familias', pt: 'Famílias' },
  oficinas: { es: 'Oficinas/empresas', pt: 'Escritórios/empresas' },
  turistas: { es: 'Turistas', pt: 'Turistas' },
  estudiantes: { es: 'Estudiantes', pt: 'Estudantes' },
  premium: { es: 'Premium/alto poder', pt: 'Premium/alto poder' },
  masivo: { es: 'Masivo/popular', pt: 'Massivo/popular' },
  demora: { es: 'Demoras', pt: 'Demoras' },
  precio: { es: 'Precio alto', pt: 'Preço alto' },
  calidad: { es: 'Calidad producto', pt: 'Qualidade produto' },
  atencion: { es: 'Atención', pt: 'Atendimento' },
  errores_pedido: { es: 'Errores en pedido', pt: 'Erros no pedido' },
  otro: { es: 'Otro', pt: 'Outro' },
};

export const getOptionLabel = (value: string, lang: Language = 'es'): string => {
  const labels = OPTION_LABELS[value];
  if (labels) {
    return lang === 'pt-BR' ? labels.pt : labels.es;
  }
  // Title case fallback
  return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
