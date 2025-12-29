// Complete Gastronomy Questions Bank v1
// All questions for Diagnóstico Profundo + Setup Inteligente

import { 
  GastroQuestion, 
  QuestionInputOption, 
  COUNTRY_PROFILES, 
  CHANNEL_OPTIONS,
  type Language 
} from './gastroSetupQuestions';

// Complete question bank with ALL questions
export const COMPLETE_GASTRO_QUESTIONS: GastroQuestion[] = [
  // ==================
  // SETUP INTELIGENTE (SI-*)
  // ==================
  {
    id: 'SI01_GOOGLE_CHOICE',
    step: 'SI-01',
    mode: 'both',
    modules: ['M_ATENCION', 'M_REPUTACION'],
    score_area: 'Reputación',
    applies_if: { always: true },
    ui: {
      es: { title: 'Conectar Google (recomendado)', help: 'Trae reseñas, horarios y señales públicas.' },
      'pt-BR': { title: 'Conectar Google (recomendado)', help: 'Traz avaliações, horários e sinais públicos.' },
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
    store: { path: 'integrations.google.status' },
  },
  {
    id: 'SI02_MODE',
    step: 'SI-02',
    mode: 'both',
    modules: [],
    score_area: 'Identidad',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cómo querés empezar?', help: 'Rápido = tablero útil ya. Completo = más precisión.' },
      'pt-BR': { title: 'Como você quer começar?', help: 'Rápido = painel útil já. Completo = mais precisão.' },
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
  
  // ==================
  // CANALES (G-01)
  // ==================
  {
    id: 'G01_CHANNELS',
    step: 'G-01',
    mode: 'both',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cómo vendés hoy?', help: 'Elegí todo lo que aplique.' },
      'pt-BR': { title: 'Como você vende hoje?', help: 'Selecione tudo que se aplica.' },
      input: { type: 'multiselect', required: true, options: CHANNEL_OPTIONS },
    },
    store: { path: 'business.channels' },
  },

  // ==================
  // IDENTIDAD (G-10..)
  // ==================
  {
    id: 'G10_LEGAL_ENTITY',
    step: 'G-10',
    mode: 'full',
    modules: ['M_DOCUMENTOS', 'M_FINANZAS'],
    score_area: 'Identidad',
    applies_if: { channels_any: ['institutional', 'catering_events'] },
    ui: {
      es: { title: '¿Facturás como persona o empresa?', help: 'Para ajustar documentos y pagos.' },
      'pt-BR': { title: 'Você fatura como pessoa ou empresa?', help: 'Para ajustar documentos e pagamentos.' },
      input: { type: 'single_select', options: ['persona', 'empresa', 'no_se'], required: false },
    },
    store: { path: 'business.legal.entity_type' },
  },
  {
    id: 'G11_OPENING_DATE',
    step: 'G-11',
    mode: 'full',
    modules: ['M_ANALITICA'],
    score_area: 'Identidad',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Hace cuánto está abierto?', help: 'Para comparar con negocios similares.' },
      'pt-BR': { title: 'Há quanto tempo está aberto?', help: 'Para comparar com negócios semelhantes.' },
      input: { type: 'single_select', options: ['<6m', '6-12m', '1-3y', '3y+', 'no_se'], required: false },
    },
    store: { path: 'business.age_bucket' },
  },

  // ==================
  // HORARIOS / DEMANDA (G-20..)
  // ==================
  {
    id: 'G20_SCHEDULE_SIMPLE',
    step: 'G-20',
    mode: 'quick',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { integrations_any: [{ key: 'integrations.google.status', in: ['not_listed', 'skipped'] }] },
    ui: {
      es: { title: 'Horarios (rápido)', help: 'Con esto saco tus picos y capacidad.' },
      'pt-BR': { title: 'Horários (rápido)', help: 'Com isso eu estimo seus picos e capacidade.' },
      input: { type: 'schedule_quick', required: false },
    },
    store: { path: 'ops.schedule.quick' },
  },
  {
    id: 'G21_SCHEDULE_DETAILED',
    step: 'G-21',
    mode: 'full',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { always: true },
    ui: {
      es: { title: 'Horarios exactos', help: 'Por día. Si tenés picos, los marco en tu tablero.' },
      'pt-BR': { title: 'Horários exatos', help: 'Por dia. Se você tem picos, eu marco no seu painel.' },
      input: { type: 'schedule_detailed', required: false, prefill_from_google_if_connected: true },
    },
    store: { path: 'ops.schedule.detailed' },
  },
  {
    id: 'G22_PEAKS',
    step: 'G-22',
    mode: 'both',
    modules: ['M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cuándo se te llena más?', help: 'Elegí tus franjas fuertes.' },
      'pt-BR': { title: 'Quando enche mais?', help: 'Escolha suas faixas fortes.' },
      input: { type: 'multiselect', options: ['mañana', 'mediodía', 'tarde', 'noche', 'madrugada', 'fin_semana'], required: false },
    },
    store: { path: 'demand.peaks' },
  },

  // ==================
  // SALÓN / CAPACIDAD (G-30..)
  // ==================
  {
    id: 'G30_SEATING_CAPACITY',
    step: 'G-30',
    mode: 'both',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { channels_any: ['dine_in'] },
    ui: {
      es: { title: 'Capacidad en el local', help: 'Aprox. asientos o mesas.' },
      'pt-BR': { title: 'Capacidade no local', help: 'Aprox. lugares/mesas.' },
      input: { type: 'number_or_range', unit: 'seats_or_tables', required: false },
    },
    store: { path: 'ops.dine_in.capacity' },
  },
  {
    id: 'G31_TABLE_TURNOVER',
    step: 'G-31',
    mode: 'full',
    modules: ['M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { channels_any: ['dine_in'] },
    ui: {
      es: { title: 'Rotación de mesas (aprox.)', help: '¿Cuántas veces se ocupa la misma mesa por turno?' },
      'pt-BR': { title: 'Giro de mesas (aprox.)', help: 'Quantas vezes a mesma mesa gira por turno?' },
      input: { type: 'single_select', options: ['baja', 'media', 'alta', 'no_se'], required: false },
    },
    store: { path: 'ops.dine_in.turnover_bucket' },
  },
  {
    id: 'G32_SERVICE_TIME',
    step: 'G-32',
    mode: 'full',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { channels_any: ['dine_in'] },
    ui: {
      es: { title: 'Tiempo total promedio (sentarse → pagar)', help: 'Rango aproximado.' },
      'pt-BR': { title: 'Tempo total médio (sentar → pagar)', help: 'Faixa aproximada.' },
      input: { type: 'range_minutes', min: 15, max: 240, required: false },
    },
    store: { path: 'ops.dine_in.total_time_min_range' },
  },

  // ==================
  // DELIVERY / LOGÍSTICA (G-40..)
  // ==================
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
  {
    id: 'G42_DELIVERY_APPS_COMMISSION',
    step: 'G-42',
    mode: 'full',
    modules: ['M_FINANZAS'],
    score_area: 'Finanzas',
    applies_if: { channels_any: ['delivery_apps'] },
    ui: {
      es: { title: 'Comisión promedio (%)', help: 'Si no sabés exacto, poné un rango.' },
      'pt-BR': { title: 'Comissão média (%)', help: 'Se não souber exato, coloque uma faixa.' },
      input: { type: 'percent_or_bucket', buckets: ['bajo', 'medio', 'alto', 'no_se'], percentRange: [15, 35], required: false },
    },
    store: { path: 'delivery.apps.commission_percent' },
  },
  {
    id: 'G43_DELIVERY_OWN_RADIUS',
    step: 'G-43',
    mode: 'full',
    modules: ['M_LOGISTICA', 'M_OPERACIONES'],
    score_area: 'Operación',
    applies_if: { channels_any: ['delivery_own'] },
    ui: {
      es: { title: 'Radio de entrega (propio)', help: 'En km o zonas.' },
      'pt-BR': { title: 'Raio de entrega (próprio)', help: 'Em km ou regiões.' },
      input: { type: 'text', required: false, placeholder_es: 'Ej: 5 km o zona centro', placeholder_pt: 'Ex: 5 km ou zona centro' },
    },
    store: { path: 'delivery.own.radius' },
  },
  {
    id: 'G44_DELIVERY_TIME',
    step: 'G-44',
    mode: 'both',
    modules: ['M_LOGISTICA', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { channels_any: ['delivery_own', 'delivery_apps', 'pickup'] },
    ui: {
      es: { title: 'Tiempo promedio de preparación/entrega', help: 'Rango aproximado.' },
      'pt-BR': { title: 'Tempo médio de preparo/entrega', help: 'Faixa aproximada.' },
      input: { type: 'range_minutes', min: 5, max: 180, required: false },
    },
    store: { path: 'ops.fulfillment.time_range_min' },
  },

  // ==================
  // VENTAS / POS (G-50..)
  // ==================
  {
    id: 'G50_SALES_TRACKING_METHOD',
    step: 'G-50',
    mode: 'both',
    modules: ['M_VENTAS_POS'],
    score_area: 'Ventas',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cómo registrás ventas hoy?', help: 'No importa si es simple.' },
      'pt-BR': { title: 'Como você registra vendas hoje?', help: 'Não importa se é simples.' },
      input: { type: 'single_select', options: ['pos', 'excel', 'cuaderno', 'nada', 'no_se'], required: true },
    },
    store: { path: 'sales.tracking.method' },
  },
  {
    id: 'G51_POS_VENDOR',
    step: 'G-51',
    mode: 'full',
    modules: ['M_VENTAS_POS'],
    score_area: 'Ventas',
    applies_if: { any: [{ field: 'sales.tracking.method', equals: 'pos' }] },
    ui: {
      es: { title: '¿Qué POS/caja usás?', help: 'Así después conectamos.' },
      'pt-BR': { title: 'Qual PDV você usa?', help: 'Assim depois conectamos.' },
      input: { type: 'single_select', optionsSource: 'countryProfile.optionPacks.gastro.posVendors', include_other: true, required: false },
    },
    store: { path: 'sales.pos.vendor' },
  },
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
  {
    id: 'G53_MONTHLY_REVENUE',
    step: 'G-53',
    mode: 'both',
    modules: ['M_FINANZAS', 'M_ANALITICA'],
    score_area: 'Finanzas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Facturación mensual (aprox.)', help: 'Aunque sea un rango.' },
      'pt-BR': { title: 'Faturamento mensal (aprox.)', help: 'Mesmo em faixa.' },
      input: { type: 'money_or_range', currencyFrom: 'countryProfile.currency.code', showUsdEstimate: true, required: false },
    },
    store: { path: 'finance.monthly_revenue' },
  },
  {
    id: 'G54_ORDERS_PER_DAY',
    step: 'G-54',
    mode: 'full',
    modules: ['M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Órdenes/tickets por día (normal)', help: 'No hace falta exacto.' },
      'pt-BR': { title: 'Pedidos/cupons por dia (normal)', help: 'Não precisa ser exato.' },
      input: { type: 'number_or_range', required: false },
    },
    store: { path: 'sales.orders_per_day' },
  },
  {
    id: 'G55_CHANNEL_MIX',
    step: 'G-55',
    mode: 'full',
    modules: ['M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Mix por canal (%)', help: 'Arrastrá para que sume 100%.' },
      'pt-BR': { title: 'Mix por canal (%)', help: 'Arraste para somar 100%.' },
      input: { type: 'percent_allocation_100', channelsFrom: 'business.channels', required: false },
    },
    store: { path: 'sales.channel_mix_percent' },
  },

  // ==================
  // OFERTA / MENÚ (G-60..)
  // ==================
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
  {
    id: 'G62_SIGNATURE_ITEM',
    step: 'G-62',
    mode: 'full',
    modules: ['M_MARKETING'],
    score_area: 'Marketing',
    applies_if: { always: true },
    ui: {
      es: { title: 'Tu producto/plato "estrella"', help: 'El que querés empujar.' },
      'pt-BR': { title: 'Seu produto/prato "estrela"', help: 'O que você quer empurrar.' },
      input: { type: 'text', required: false },
    },
    store: { path: 'offer.signature_item' },
  },
  {
    id: 'G63_MENU_LINK',
    step: 'G-63',
    mode: 'quick',
    modules: ['M_MARKETING'],
    score_area: 'Marketing',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Tenés menú/carta online?', help: 'Un link ya mejora visibilidad.' },
      'pt-BR': { title: 'Você tem cardápio online?', help: 'Um link já melhora visibilidade.' },
      input: { type: 'url_or_no', required: false },
    },
    store: { path: 'offer.menu_url' },
  },

  // ==================
  // COSTOS / UNIT ECONOMICS (G-70..)
  // ==================
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
  {
    id: 'G72_FIXED_COSTS',
    step: 'G-72',
    mode: 'full',
    modules: ['M_FINANZAS'],
    score_area: 'Finanzas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Costos fijos mensuales (aprox.)', help: 'Alquiler + servicios + otros.' },
      'pt-BR': { title: 'Custos fixos mensais (aprox.)', help: 'Aluguel + contas + outros.' },
      input: { type: 'money_multi_optional', fields: ['rent', 'utilities', 'other_fixed'], currencyFrom: 'countryProfile.currency.code', showUsdEstimate: true, required: false },
    },
    store: { path: 'finance.fixed_costs' },
  },
  {
    id: 'G73_PROFIT_FEEL',
    step: 'G-73',
    mode: 'quick',
    modules: ['M_FINANZAS'],
    score_area: 'Finanzas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Tu ganancia hoy te parece…', help: 'Solo para calibrar el tablero inicial.' },
      'pt-BR': { title: 'Seu lucro hoje parece…', help: 'Apenas para calibrar o painel inicial.' },
      input: { type: 'single_select', options: ['baja', 'ok', 'alta', 'no_se'], required: false },
    },
    store: { path: 'finance.profit_feel_bucket' },
  },

  // ==================
  // INVENTARIO / MERMA (G-80..)
  // ==================
  {
    id: 'G80_INVENTORY_CONTROL',
    step: 'G-80',
    mode: 'both',
    modules: ['M_INVENTARIO'],
    score_area: 'Operación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Controlás stock/inventario?', help: 'Aunque sea básico, me sirve.' },
      'pt-BR': { title: 'Você controla estoque?', help: 'Mesmo básico, ajuda.' },
      input: { type: 'single_select', options: ['si', 'parcial', 'no', 'no_se'], required: false },
    },
    store: { path: 'inventory.control.level' },
  },
  {
    id: 'G81_WASTE_LEVEL',
    step: 'G-81',
    mode: 'both',
    modules: ['M_INVENTARIO', 'M_FINANZAS'],
    score_area: 'Finanzas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Merma / desperdicio hoy', help: 'Te lo traduzco a USD/mes estimado.' },
      'pt-BR': { title: 'Perdas / desperdício hoje', help: 'Eu traduzo para USD/mês estimado.' },
      input: { type: 'single_select', options: ['baja', 'media', 'alta', 'no_se'], required: false },
    },
    store: { path: 'inventory.waste.level' },
  },
  {
    id: 'G82_STOCKOUTS',
    step: 'G-82',
    mode: 'full',
    modules: ['M_INVENTARIO'],
    score_area: 'Operación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Se te acaba algo clave?', help: 'Sí/No y qué. Afecta ventas.' },
      'pt-BR': { title: 'Falta algum item-chave?', help: 'Sim/Não e qual. Afeta vendas.' },
      input: { type: 'yes_no_with_text', required: false },
    },
    store: { path: 'inventory.stockouts' },
  },
  {
    id: 'G83_SUPPLIERS_COUNT',
    step: 'G-83',
    mode: 'full',
    modules: ['M_INVENTARIO', 'M_FINANZAS'],
    score_area: 'Operación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Cuántos proveedores principales tenés?', help: 'Rango aproximado.' },
      'pt-BR': { title: 'Quantos fornecedores principais você tem?', help: 'Faixa aproximada.' },
      input: { type: 'single_select', options: ['1-3', '4-10', '10+', 'no_se'], required: false },
    },
    store: { path: 'inventory.suppliers.count_bucket' },
  },

  // ==================
  // RESERVAS (G-90..)
  // ==================
  {
    id: 'G90_TAKES_RESERVATIONS',
    step: 'G-90',
    mode: 'both',
    modules: ['M_RESERVAS', 'M_ATENCION'],
    score_area: 'Operación',
    applies_if: { channels_any: ['dine_in'] },
    ui: {
      es: { title: '¿Tomás reservas?', help: 'Si sí, te armo widget de reservas.' },
      'pt-BR': { title: 'Você aceita reservas?', help: 'Se sim, eu monto widget de reservas.' },
      input: { type: 'single_select', options: ['si', 'no', 'a_veces'], required: false },
    },
    store: { path: 'reservations.enabled' },
  },
  {
    id: 'G91_RESERVATION_TOOL',
    step: 'G-91',
    mode: 'full',
    modules: ['M_RESERVAS'],
    score_area: 'Operación',
    applies_if: { any: [{ field: 'reservations.enabled', in: ['si', 'a_veces'] }] },
    ui: {
      es: { title: '¿Dónde te reservan?', help: 'WhatsApp, Instagram, web o plataforma.' },
      'pt-BR': { title: 'Por onde reservam?', help: 'WhatsApp, Instagram, site ou plataforma.' },
      input: { type: 'multiselect', optionsSource: 'countryProfile.optionPacks.gastro.reservationTools', include_other: true, required: false },
    },
    store: { path: 'reservations.tools' },
  },
  {
    id: 'G92_NO_SHOW_LEVEL',
    step: 'G-92',
    mode: 'full',
    modules: ['M_RESERVAS', 'M_FINANZAS'],
    score_area: 'Ventas',
    applies_if: { any: [{ field: 'reservations.enabled', in: ['si', 'a_veces'] }] },
    ui: {
      es: { title: 'No-show (faltan sin avisar)', help: 'Aprox. para estimar pérdida mensual.' },
      'pt-BR': { title: 'No-show (faltam sem avisar)', help: 'Aprox. para estimar perda mensal.' },
      input: { type: 'single_select', options: ['bajo', 'medio', 'alto', 'no_se'], required: false },
    },
    store: { path: 'reservations.no_show.level' },
  },

  // ==================
  // REPUTACIÓN (G-100..)
  // ==================
  {
    id: 'G100_REVIEWS_SOURCES',
    step: 'G-100',
    mode: 'full',
    modules: ['M_ATENCION', 'M_MARKETING'],
    score_area: 'Reputación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Dónde te dejan reseñas además de Google?', help: 'Solo para activar widgets correctos.' },
      'pt-BR': { title: 'Onde deixam avaliações além do Google?', help: 'Só para ativar widgets corretos.' },
      input: { type: 'multiselect', optionsSource: 'countryProfile.optionPacks.gastro.reviewSources', include_other: true, required: false },
    },
    store: { path: 'reputation.review_sources' },
  },
  {
    id: 'G101_REVIEWS_REPLY_HABIT',
    step: 'G-101',
    mode: 'both',
    modules: ['M_ATENCION'],
    score_area: 'Reputación',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Respondés reseñas?', help: 'Esto impacta directo en reputación.' },
      'pt-BR': { title: 'Você responde avaliações?', help: 'Isso impacta direto reputação.' },
      input: { type: 'single_select', options: ['siempre', 'a_veces', 'nunca'], required: false },
    },
    store: { path: 'reputation.reply_habit' },
  },
  {
    id: 'G102_REVIEW_REPLY_SLA',
    step: 'G-102',
    mode: 'full',
    modules: ['M_ATENCION'],
    score_area: 'Reputación',
    applies_if: { always: true },
    ui: {
      es: { title: 'Tiempo objetivo para responder reseñas', help: 'Ej: 24h, 48h, 1 semana.' },
      'pt-BR': { title: 'Tempo objetivo para responder avaliações', help: 'Ex: 24h, 48h, 1 semana.' },
      input: { type: 'single_select', options: ['24h', '48h', '1_semana', 'no_se'], required: false },
    },
    store: { path: 'reputation.reply_sla' },
  },

  // ==================
  // MARKETING (G-110..)
  // ==================
  {
    id: 'G110_ACTIVE_CHANNELS',
    step: 'G-110',
    mode: 'both',
    modules: ['M_MARKETING'],
    score_area: 'Marketing',
    applies_if: { always: true },
    ui: {
      es: { title: 'Canales activos', help: 'Para darte misiones realistas.' },
      'pt-BR': { title: 'Canais ativos', help: 'Para te dar missões realistas.' },
      input: { type: 'multiselect', optionsSource: 'countryProfile.optionPacks.gastro.socialChannels', include_other: true, required: false },
    },
    store: { path: 'marketing.channels' },
  },
  {
    id: 'G111_POSTING_FREQUENCY',
    step: 'G-111',
    mode: 'full',
    modules: ['M_MARKETING'],
    score_area: 'Marketing',
    applies_if: { always: true },
    ui: {
      es: { title: 'Frecuencia de publicaciones', help: 'Solo para ajustar expectativas.' },
      'pt-BR': { title: 'Frequência de posts', help: 'Apenas para ajustar expectativas.' },
      input: { type: 'single_select', options: ['nunca', 'semanal', '3x_semana', 'diario'], required: false },
    },
    store: { path: 'marketing.post_frequency' },
  },
  {
    id: 'G112_MARKETING_BUDGET',
    step: 'G-112',
    mode: 'full',
    modules: ['M_MARKETING', 'M_FINANZAS'],
    score_area: 'Marketing',
    applies_if: { always: true },
    ui: {
      es: { title: 'Presupuesto mensual de marketing (si tenés)', help: 'Puede ser 0.' },
      'pt-BR': { title: 'Orçamento mensal de marketing (se tiver)', help: 'Pode ser 0.' },
      input: { type: 'money_optional', currencyFrom: 'countryProfile.currency.code', showUsdEstimate: true, required: false },
    },
    store: { path: 'marketing.budget_monthly' },
  },

  // ==================
  // EQUIPO (G-120..)
  // ==================
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
  {
    id: 'G121_HIRING_PAIN',
    step: 'G-121',
    mode: 'full',
    modules: ['M_OPERACIONES'],
    score_area: 'Equipo',
    applies_if: { always: true },
    ui: {
      es: { title: '¿Te cuesta contratar/retener?', help: 'Ajusta misiones y alertas.' },
      'pt-BR': { title: 'É difícil contratar/reter?', help: 'Ajusta missões e alertas.' },
      input: { type: 'single_select', options: ['no', 'un_poco', 'mucho', 'no_se'], required: false },
    },
    store: { path: 'team.hiring_pain' },
  },

  // ==================
  // CLIENTES (G-130..)
  // ==================
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

  // ==================
  // OBJETIVOS (G-140..)
  // ==================
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
  {
    id: 'G141_GOAL_90D',
    step: 'G-141',
    mode: 'full',
    modules: ['M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { always: true },
    ui: {
      es: { title: 'Meta 90 días (en 1 frase)', help: 'Ej: "+15% ventas" o "subir rating a 4.6".' },
      'pt-BR': { title: 'Meta 90 dias (em 1 frase)', help: 'Ex: "+15% vendas" ou "subir nota para 4,6".' },
      input: { type: 'text', required: false },
    },
    store: { path: 'goals.goal_90d_text' },
  },

  // ==================
  // PACKS POR SUBTIPO (GX_*)
  // ==================
  {
    id: 'GX_RESTAURANT_KITCHEN_BOTTLENECK',
    step: 'GX-R1',
    mode: 'full',
    modules: ['M_OPERACIONES', 'M_ANALITICA'],
    score_area: 'Operación',
    applies_if: { type_any: ['A1_T001_RESTAURANTE', 'A1_T002_ALTA_COCINA', 'A1_T003_BISTRO_BRASSERIE'] },
    ui: {
      es: { title: '¿Dónde se traba más tu operación?', help: 'Esto define misiones de tiempos.' },
      'pt-BR': { title: 'Onde a operação trava mais?', help: 'Isso define missões de tempo.' },
      input: { type: 'single_select', options: ['cocina', 'caja', 'salon', 'delivery', 'stock', 'personal', 'no_se'], required: false },
    },
    store: { path: 'ops.bottleneck' },
  },
  {
    id: 'GX_BAR_BEVERAGE_MIX',
    step: 'GX-B1',
    mode: 'full',
    modules: ['M_ANALITICA', 'M_FINANZAS'],
    score_area: 'Oferta',
    applies_if: { type_any: ['A1_T020_BAR', 'A1_T021_PUB', 'A1_T022_CERVECERIA_BAR', 'A1_T024_WINE_BAR'] },
    ui: {
      es: { title: 'Mix de bebidas (aprox.)', help: 'Sirve para precios y margen.' },
      'pt-BR': { title: 'Mix de bebidas (aprox.)', help: 'Ajuda em preço e margem.' },
      input: { type: 'single_select', options: ['cerveza', 'tragos', 'vino', 'sin_alcohol', 'mixto', 'no_se'], required: false },
    },
    store: { path: 'offer.bar.mix_bucket' },
  },
  {
    id: 'GX_BAKERY_PRODUCTION_SCHEDULE',
    step: 'GX-P1',
    mode: 'full',
    modules: ['M_OPERACIONES', 'M_INVENTARIO'],
    score_area: 'Operación',
    applies_if: { type_any: ['A1_T017_PANADERIA', 'A1_T018_PASTELERIA_REPOSTERIA'] },
    ui: {
      es: { title: '¿Producís todos los días o por tandas?', help: 'Afecta merma y staffing.' },
      'pt-BR': { title: 'Você produz todo dia ou por lotes?', help: 'Afeta perdas e equipe.' },
      input: { type: 'single_select', options: ['diario', 'tandas', 'mixto', 'no_se'], required: false },
    },
    store: { path: 'offer.production.mode' },
  },
  {
    id: 'GX_ICECREAM_SEASONALITY',
    step: 'GX-H1',
    mode: 'full',
    modules: ['M_ANALITICA'],
    score_area: 'Ventas',
    applies_if: { type_any: ['A1_T019_HELADERIA'] },
    ui: {
      es: { title: 'Estacionalidad', help: '¿Cuándo se vende mucho más?' },
      'pt-BR': { title: 'Sazonalidade', help: 'Quando vende muito mais?' },
      input: { type: 'single_select', options: ['verano', 'invierno', 'todo_el_ano', 'no_se'], required: false },
    },
    store: { path: 'sales.seasonality.bucket' },
  },
  {
    id: 'GX_GHOST_KITCHEN_BRANDS',
    step: 'GX-G1',
    mode: 'full',
    modules: ['M_MARKETING', 'M_ANALITICA'],
    score_area: 'Marketing',
    applies_if: { type_any: ['A1_T028_GHOST_KITCHEN'] },
    ui: {
      es: { title: '¿Cuántas marcas/menús virtuales manejás?', help: 'Para entender complejidad.' },
      'pt-BR': { title: 'Quantas marcas/cardápios virtuais você tem?', help: 'Para entender complexidade.' },
      input: { type: 'single_select', options: ['1', '2-3', '4+', 'no_se'], required: false },
    },
    store: { path: 'ghost.virtual_brands.count_bucket' },
  },
  {
    id: 'GX_CATERING_EVENTS_PER_MONTH',
    step: 'GX-C1',
    mode: 'full',
    modules: ['M_DOCUMENTOS', 'M_FINANZAS'],
    score_area: 'Ventas',
    applies_if: { channels_any: ['catering_events'], type_any: ['A1_T030_CATERING_BANQUETERIA'] },
    ui: {
      es: { title: 'Eventos por mes (aprox.)', help: 'Para estimar pipeline.' },
      'pt-BR': { title: 'Eventos por mês (aprox.)', help: 'Para estimar pipeline.' },
      input: { type: 'number_or_range', required: false },
    },
    store: { path: 'catering.events_per_month' },
  },
  {
    id: 'GX_INSTITUTIONAL_RATIONS_PER_DAY',
    step: 'GX-I1',
    mode: 'full',
    modules: ['M_OPERACIONES', 'M_DOCUMENTOS'],
    score_area: 'Operación',
    applies_if: { channels_any: ['institutional'], type_any: ['A1_T031_COMEDOR_INSTITUCIONAL'] },
    ui: {
      es: { title: 'Raciones por día (aprox.)', help: 'Sirve para capacidad y compras.' },
      'pt-BR': { title: 'Refeições por dia (aprox.)', help: 'Ajuda em capacidade e compras.' },
      input: { type: 'number_or_range', required: false },
    },
    store: { path: 'institutional.rations_per_day' },
  },
];

// Get total questions count for precision calculation
export const getTotalQuestionsForBusiness = (
  data: Record<string, any>,
  mode: 'quick' | 'full'
): number => {
  return COMPLETE_GASTRO_QUESTIONS.filter(q => {
    // Check mode
    if (q.mode !== 'both' && q.mode !== mode) return false;
    
    const condition = q.applies_if;
    if (condition.always) return true;
    
    // Check channels
    if (condition.channels_any) {
      const channels = data['business.channels'] || [];
      if (!condition.channels_any.some(ch => channels.includes(ch))) return false;
    }
    
    // Check type
    if (condition.type_any) {
      const type = data['business.primary_type_id'];
      if (!condition.type_any.includes(type)) return false;
    }
    
    return true;
  }).length;
};

// Get answered questions count
export const getAnsweredQuestionsCount = (
  data: Record<string, any>,
  mode: 'quick' | 'full'
): number => {
  let count = 0;
  
  COMPLETE_GASTRO_QUESTIONS.forEach(q => {
    // Check if applies
    if (q.mode !== 'both' && q.mode !== mode) return;
    
    const condition = q.applies_if;
    let applies = condition.always;
    
    if (condition.channels_any) {
      const channels = data['business.channels'] || [];
      applies = condition.channels_any.some(ch => channels.includes(ch));
    }
    
    if (!applies) return;
    
    // Check if answered
    const value = data[q.store.path];
    if (value !== undefined && value !== null && value !== '' && 
        !(Array.isArray(value) && value.length === 0)) {
      count++;
    }
  });
  
  return count;
};

// Calculate precision score
export const calculatePrecisionScore = (
  data: Record<string, any>,
  mode: 'quick' | 'full'
): number => {
  const total = getTotalQuestionsForBusiness(data, mode);
  const answered = getAnsweredQuestionsCount(data, mode);
  
  if (total === 0) return 0;
  return Math.round((answered / total) * 100);
};
