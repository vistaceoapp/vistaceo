// ============================================
// TURISMO - Cuestionario Ultra-Específico v2
// Sector: Turismo, Hotelería, Ocio y Eventos
// 18 tipos de negocio, ~70 preguntas cada uno
// ============================================

export interface TurismQuestion {
  id: string;
  category: string;
  categoryLabel: { es: string; 'pt-BR': string };
  mode: 'quick' | 'complete' | 'both';
  score_area: 'Reputación' | 'Rentabilidad' | 'Finanzas' | 'Eficiencia' | 'Tráfico' | 'Equipo' | 'Crecimiento';
  title: { es: string; 'pt-BR': string };
  help?: { es: string; 'pt-BR': string };
  type: 'single' | 'multi' | 'number' | 'slider' | 'text' | 'money';
  options?: Array<{ id: string; label: { es: string; 'pt-BR': string }; emoji?: string }>;
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  businessTypes?: string[]; // Si se especifica, solo para estos tipos
}

// IDs de tipos de negocio turismo
export const TURISM_BUSINESS_TYPES = {
  HOTEL_URBANO: 'A2_T001_HOTEL_URBANO',
  HOTEL_BOUTIQUE: 'A2_T002_HOTEL_BOUTIQUE',
  RESORT: 'A2_T003_RESORT_TODO',
  HOSTEL: 'A2_T004_HOSTEL',
  APART_HOTEL: 'A2_T005_APART_HOTEL',
  POSADA: 'A2_T006_POSADA_BB',
  ALQUILER_TEMP: 'A2_T007_ALQUILER_TEMP',
  AGENCIA_VIAJES: 'A2_T008_AGENCIA_VIAJES',
  TOURS: 'A2_T009_TOURS',
  TURISMO_AVENTURA: 'A2_T010_TURISMO_AVENTURA',
  OPERADOR_TURISTICO: 'A2_T011_OPERADOR_TURISTICO',
  PARQUE_TEMATICO: 'A2_T012_PARQUE_TEMATICO',
  ATRACCIONES: 'A2_T013_ATRACCIONES',
  ENTRETENIMIENTO: 'A2_T014_ENTRETENIMIENTO',
  TEATRO: 'A2_T015_TEATRO',
  SALON_EVENTOS: 'A2_T016_SALON_EVENTOS',
  EVENTOS_CORP: 'A2_T017_EVENTOS_CORP',
  PRODUCTORA: 'A2_T018_PRODUCTORA',
};

// Grupos de tipos para preguntas condicionales
const ALOJAMIENTO = [
  TURISM_BUSINESS_TYPES.HOTEL_URBANO,
  TURISM_BUSINESS_TYPES.HOTEL_BOUTIQUE,
  TURISM_BUSINESS_TYPES.RESORT,
  TURISM_BUSINESS_TYPES.HOSTEL,
  TURISM_BUSINESS_TYPES.APART_HOTEL,
  TURISM_BUSINESS_TYPES.POSADA,
  TURISM_BUSINESS_TYPES.ALQUILER_TEMP,
];

const HOTELES = [
  TURISM_BUSINESS_TYPES.HOTEL_URBANO,
  TURISM_BUSINESS_TYPES.HOTEL_BOUTIQUE,
  TURISM_BUSINESS_TYPES.RESORT,
  TURISM_BUSINESS_TYPES.APART_HOTEL,
];

const AGENCIAS_TOURS = [
  TURISM_BUSINESS_TYPES.AGENCIA_VIAJES,
  TURISM_BUSINESS_TYPES.TOURS,
  TURISM_BUSINESS_TYPES.TURISMO_AVENTURA,
  TURISM_BUSINESS_TYPES.OPERADOR_TURISTICO,
];

const ATRACCIONES_PARQUES = [
  TURISM_BUSINESS_TYPES.PARQUE_TEMATICO,
  TURISM_BUSINESS_TYPES.ATRACCIONES,
  TURISM_BUSINESS_TYPES.ENTRETENIMIENTO,
];

const EVENTOS = [
  TURISM_BUSINESS_TYPES.TEATRO,
  TURISM_BUSINESS_TYPES.SALON_EVENTOS,
  TURISM_BUSINESS_TYPES.EVENTOS_CORP,
  TURISM_BUSINESS_TYPES.PRODUCTORA,
];

// ============================================
// PREGUNTAS UNIVERSALES TURISMO (todos los tipos)
// ============================================

const TURISM_UNIVERSAL_QUESTIONS: TurismQuestion[] = [
  // --- OPERACIÓN / IDENTIDAD ---
  {
    id: 'T01_YEARS_OPERATING',
    category: 'identidad',
    categoryLabel: { es: 'Identidad', 'pt-BR': 'Identidade' },
    mode: 'both',
    score_area: 'Crecimiento',
    title: { es: '¿Hace cuánto opera tu negocio?', 'pt-BR': 'Há quanto tempo seu negócio opera?' },
    type: 'single',
    options: [
      { id: '<1y', label: { es: 'Menos de 1 año', 'pt-BR': 'Menos de 1 ano' }, emoji: '🆕' },
      { id: '1-3y', label: { es: '1-3 años', 'pt-BR': '1-3 anos' }, emoji: '📅' },
      { id: '3-10y', label: { es: '3-10 años', 'pt-BR': '3-10 anos' }, emoji: '📈' },
      { id: '10+', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆' },
    ],
  },
  {
    id: 'T02_SEASONALITY',
    category: 'trafico',
    categoryLabel: { es: 'Tráfico', 'pt-BR': 'Tráfego' },
    mode: 'both',
    score_area: 'Tráfico',
    title: { es: '¿Tu negocio es estacional?', 'pt-BR': 'Seu negócio é sazonal?' },
    type: 'single',
    options: [
      { id: 'very_seasonal', label: { es: 'Muy estacional (verano/invierno)', 'pt-BR': 'Muito sazonal (verão/inverno)' }, emoji: '🌞' },
      { id: 'some_peaks', label: { es: 'Algunos picos (feriados, vacaciones)', 'pt-BR': 'Alguns picos (feriados, férias)' }, emoji: '📊' },
      { id: 'stable', label: { es: 'Bastante estable todo el año', 'pt-BR': 'Bastante estável o ano todo' }, emoji: '➖' },
    ],
  },
  {
    id: 'T03_PEAK_SEASON',
    category: 'trafico',
    categoryLabel: { es: 'Tráfico', 'pt-BR': 'Tráfego' },
    mode: 'complete',
    score_area: 'Tráfico',
    title: { es: '¿Cuál es tu temporada alta?', 'pt-BR': 'Qual é sua alta temporada?' },
    help: { es: 'Elegí todos los meses fuertes', 'pt-BR': 'Escolha todos os meses fortes' },
    type: 'multi',
    options: [
      { id: 'jan_feb', label: { es: 'Enero-Febrero', 'pt-BR': 'Janeiro-Fevereiro' }, emoji: '☀️' },
      { id: 'mar_apr', label: { es: 'Marzo-Abril (Semana Santa)', 'pt-BR': 'Março-Abril (Páscoa)' }, emoji: '🐣' },
      { id: 'jul_aug', label: { es: 'Julio-Agosto (Vacaciones)', 'pt-BR': 'Julho-Agosto (Férias)' }, emoji: '✈️' },
      { id: 'dec', label: { es: 'Diciembre (Fiestas)', 'pt-BR': 'Dezembro (Festas)' }, emoji: '🎄' },
      { id: 'weekends', label: { es: 'Fines de semana todo el año', 'pt-BR': 'Finais de semana o ano todo' }, emoji: '📅' },
    ],
  },

  // --- VENTAS / RESERVAS ---
  {
    id: 'T04_BOOKING_CHANNELS',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    score_area: 'Crecimiento',
    title: { es: '¿Por dónde te reservan/compran?', 'pt-BR': 'Por onde reservam/compram?' },
    help: { es: 'Elegí todos los canales', 'pt-BR': 'Escolha todos os canais' },
    type: 'multi',
    required: true,
    options: [
      { id: 'direct_web', label: { es: 'Web/App propia', 'pt-BR': 'Site/App próprio' }, emoji: '🌐' },
      { id: 'phone_whatsapp', label: { es: 'Teléfono/WhatsApp', 'pt-BR': 'Telefone/WhatsApp' }, emoji: '📱' },
      { id: 'walk_in', label: { es: 'Presencial/Walk-in', 'pt-BR': 'Presencial/Walk-in' }, emoji: '🚶' },
      { id: 'otas', label: { es: 'OTAs (Booking, Expedia, etc.)', 'pt-BR': 'OTAs (Booking, Expedia, etc.)' }, emoji: '🏨' },
      { id: 'agencies', label: { es: 'Agencias de viaje', 'pt-BR': 'Agências de viagem' }, emoji: '✈️' },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📲' },
    ],
  },
  {
    id: 'T05_DIRECT_VS_INDIRECT',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: '% de ventas directas (sin comisión)', 'pt-BR': '% de vendas diretas (sem comissão)' },
    help: { es: 'Aproximado está bien', 'pt-BR': 'Aproximado está bom' },
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%',
  },
  {
    id: 'T06_AVG_TICKET',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Ticket promedio por transacción', 'pt-BR': 'Ticket médio por transação' },
    help: { es: 'En tu moneda local', 'pt-BR': 'Na sua moeda local' },
    type: 'money',
  },
  {
    id: 'T07_MONTHLY_TRANSACTIONS',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'complete',
    score_area: 'Tráfico',
    title: { es: 'Transacciones/reservas por mes (promedio)', 'pt-BR': 'Transações/reservas por mês (média)' },
    type: 'single',
    options: [
      { id: '1-20', label: { es: '1-20', 'pt-BR': '1-20' } },
      { id: '21-50', label: { es: '21-50', 'pt-BR': '21-50' } },
      { id: '51-100', label: { es: '51-100', 'pt-BR': '51-100' } },
      { id: '101-300', label: { es: '101-300', 'pt-BR': '101-300' } },
      { id: '300+', label: { es: 'Más de 300', 'pt-BR': 'Mais de 300' } },
    ],
  },
  {
    id: 'T08_SALES_TRACKING',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    score_area: 'Eficiencia',
    title: { es: '¿Cómo gestionás reservas/ventas?', 'pt-BR': 'Como você gerencia reservas/vendas?' },
    type: 'single',
    required: true,
    options: [
      { id: 'pms_crm', label: { es: 'Sistema PMS/CRM', 'pt-BR': 'Sistema PMS/CRM' }, emoji: '💻' },
      { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📊' },
      { id: 'manual', label: { es: 'Cuaderno/Manual', 'pt-BR': 'Caderno/Manual' }, emoji: '📓' },
      { id: 'none', label: { es: 'Sin sistema formal', 'pt-BR': 'Sem sistema formal' }, emoji: '🤷' },
    ],
  },

  // --- FINANZAS ---
  {
    id: 'T09_MONTHLY_REVENUE',
    category: 'finanzas',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    score_area: 'Finanzas',
    title: { es: 'Facturación mensual promedio', 'pt-BR': 'Faturamento mensal médio' },
    type: 'single',
    options: [
      { id: 'tier1', label: { es: 'Menos de $1M', 'pt-BR': 'Menos de R$30k' } },
      { id: 'tier2', label: { es: '$1M - $5M', 'pt-BR': 'R$30k - R$150k' } },
      { id: 'tier3', label: { es: '$5M - $20M', 'pt-BR': 'R$150k - R$600k' } },
      { id: 'tier4', label: { es: 'Más de $20M', 'pt-BR': 'Mais de R$600k' } },
    ],
  },
  {
    id: 'T10_FIXED_COSTS_PCT',
    category: 'finanzas',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    score_area: 'Finanzas',
    title: { es: '% de costos fijos sobre facturación', 'pt-BR': '% de custos fixos sobre faturamento' },
    help: { es: 'Alquiler, sueldos, servicios', 'pt-BR': 'Aluguel, salários, serviços' },
    type: 'slider',
    min: 10,
    max: 80,
    unit: '%',
  },
  {
    id: 'T11_PROFIT_MARGIN',
    category: 'finanzas',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: 'Margen de ganancia estimado', 'pt-BR': 'Margem de lucro estimada' },
    type: 'single',
    options: [
      { id: 'negative', label: { es: 'Negativo/Pérdida', 'pt-BR': 'Negativo/Prejuízo' }, emoji: '📉' },
      { id: '0-10', label: { es: '0-10%', 'pt-BR': '0-10%' }, emoji: '😐' },
      { id: '10-20', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '📊' },
      { id: '20-30', label: { es: '20-30%', 'pt-BR': '20-30%' }, emoji: '📈' },
      { id: '30+', label: { es: 'Más del 30%', 'pt-BR': 'Mais de 30%' }, emoji: '🚀' },
    ],
  },
  {
    id: 'T12_CASH_FLOW',
    category: 'finanzas',
    categoryLabel: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    mode: 'complete',
    score_area: 'Finanzas',
    title: { es: '¿Cómo está tu flujo de caja?', 'pt-BR': 'Como está seu fluxo de caixa?' },
    type: 'single',
    options: [
      { id: 'tight', label: { es: 'Ajustado/Mes a mes', 'pt-BR': 'Apertado/Mês a mês' }, emoji: '😰' },
      { id: 'ok', label: { es: 'Estable pero sin holgura', 'pt-BR': 'Estável mas sem folga' }, emoji: '😐' },
      { id: 'healthy', label: { es: 'Saludable, con reservas', 'pt-BR': 'Saudável, com reservas' }, emoji: '😊' },
      { id: 'strong', label: { es: 'Muy bueno, para invertir', 'pt-BR': 'Muito bom, para investir' }, emoji: '💪' },
    ],
  },

  // --- EQUIPO ---
  {
    id: 'T13_TEAM_SIZE',
    category: 'equipo',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'both',
    score_area: 'Equipo',
    title: { es: 'Tamaño del equipo (empleados)', 'pt-BR': 'Tamanho da equipe (funcionários)' },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
      { id: '2-5', label: { es: '2-5 personas', 'pt-BR': '2-5 pessoas' }, emoji: '👥' },
      { id: '6-15', label: { es: '6-15 personas', 'pt-BR': '6-15 pessoas' }, emoji: '👨‍👩‍👧‍👦' },
      { id: '16-50', label: { es: '16-50 personas', 'pt-BR': '16-50 pessoas' }, emoji: '🏢' },
      { id: '50+', label: { es: 'Más de 50', 'pt-BR': 'Mais de 50' }, emoji: '🏭' },
    ],
  },
  {
    id: 'T14_HIRING_DIFFICULTY',
    category: 'equipo',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'complete',
    score_area: 'Equipo',
    title: { es: '¿Te cuesta conseguir personal?', 'pt-BR': 'É difícil encontrar funcionários?' },
    type: 'single',
    options: [
      { id: 'no', label: { es: 'No, fácil', 'pt-BR': 'Não, fácil' }, emoji: '✅' },
      { id: 'some', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '😐' },
      { id: 'yes', label: { es: 'Sí, bastante', 'pt-BR': 'Sim, bastante' }, emoji: '😰' },
      { id: 'critical', label: { es: 'Es un problema crítico', 'pt-BR': 'É um problema crítico' }, emoji: '🆘' },
    ],
  },
  {
    id: 'T15_STAFF_TURNOVER',
    category: 'equipo',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'complete',
    score_area: 'Equipo',
    title: { es: 'Rotación de personal', 'pt-BR': 'Rotatividade de funcionários' },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Baja (equipo estable)', 'pt-BR': 'Baixa (equipe estável)' }, emoji: '💚' },
      { id: 'medium', label: { es: 'Media (algunos cambios)', 'pt-BR': 'Média (algumas mudanças)' }, emoji: '💛' },
      { id: 'high', label: { es: 'Alta (mucho recambio)', 'pt-BR': 'Alta (muita troca)' }, emoji: '🔴' },
    ],
  },
  {
    id: 'T16_STAFF_TRAINING',
    category: 'equipo',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: '¿Capacitás a tu equipo regularmente?', 'pt-BR': 'Você treina sua equipe regularmente?' },
    type: 'single',
    options: [
      { id: 'yes_formal', label: { es: 'Sí, con programa formal', 'pt-BR': 'Sim, com programa formal' }, emoji: '📚' },
      { id: 'sometimes', label: { es: 'A veces, informal', 'pt-BR': 'Às vezes, informal' }, emoji: '💬' },
      { id: 'no', label: { es: 'No, aprenden trabajando', 'pt-BR': 'Não, aprendem trabalhando' }, emoji: '🔧' },
    ],
  },

  // --- REPUTACIÓN ---
  {
    id: 'T17_REVIEW_PLATFORMS',
    category: 'reputacion',
    categoryLabel: { es: 'Reputación', 'pt-BR': 'Reputação' },
    mode: 'both',
    score_area: 'Reputación',
    title: { es: '¿Dónde te dejan reseñas?', 'pt-BR': 'Onde deixam avaliações?' },
    type: 'multi',
    options: [
      { id: 'google', label: { es: 'Google', 'pt-BR': 'Google' }, emoji: '🔍' },
      { id: 'tripadvisor', label: { es: 'TripAdvisor', 'pt-BR': 'TripAdvisor' }, emoji: '🦉' },
      { id: 'booking', label: { es: 'Booking.com', 'pt-BR': 'Booking.com' }, emoji: '🏨' },
      { id: 'expedia', label: { es: 'Expedia', 'pt-BR': 'Expedia' }, emoji: '✈️' },
      { id: 'airbnb', label: { es: 'Airbnb', 'pt-BR': 'Airbnb' }, emoji: '🏠' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘' },
    ],
  },
  {
    id: 'T18_CURRENT_RATING',
    category: 'reputacion',
    categoryLabel: { es: 'Reputación', 'pt-BR': 'Reputação' },
    mode: 'both',
    score_area: 'Reputación',
    title: { es: 'Tu rating promedio actual', 'pt-BR': 'Sua nota média atual' },
    help: { es: 'En tu plataforma principal', 'pt-BR': 'Na sua plataforma principal' },
    type: 'slider',
    min: 1,
    max: 5,
    unit: '⭐',
  },
  {
    id: 'T19_REVIEWS_REPLY',
    category: 'reputacion',
    categoryLabel: { es: 'Reputación', 'pt-BR': 'Reputação' },
    mode: 'both',
    score_area: 'Reputación',
    title: { es: '¿Respondés las reseñas?', 'pt-BR': 'Você responde as avaliações?' },
    type: 'single',
    options: [
      { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅' },
      { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄' },
      { id: 'negative_only', label: { es: 'Solo negativas', 'pt-BR': 'Só negativas' }, emoji: '⚠️' },
      { id: 'never', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌' },
    ],
  },
  {
    id: 'T20_TOP_COMPLAINT',
    category: 'reputacion',
    categoryLabel: { es: 'Reputación', 'pt-BR': 'Reputação' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: 'Principal queja de clientes', 'pt-BR': 'Principal reclamação dos clientes' },
    type: 'single',
    options: [
      { id: 'price', label: { es: 'Precio', 'pt-BR': 'Preço' }, emoji: '💰' },
      { id: 'service', label: { es: 'Atención/Servicio', 'pt-BR': 'Atendimento/Serviço' }, emoji: '👥' },
      { id: 'cleanliness', label: { es: 'Limpieza', 'pt-BR': 'Limpeza' }, emoji: '🧹' },
      { id: 'location', label: { es: 'Ubicación', 'pt-BR': 'Localização' }, emoji: '📍' },
      { id: 'delays', label: { es: 'Demoras/Tiempos', 'pt-BR': 'Demoras/Tempos' }, emoji: '⏱️' },
      { id: 'none', label: { es: 'Sin quejas frecuentes', 'pt-BR': 'Sem reclamações frequentes' }, emoji: '🎉' },
    ],
  },

  // --- MARKETING / CRECIMIENTO ---
  {
    id: 'T21_MARKETING_CHANNELS',
    category: 'marketing',
    categoryLabel: { es: 'Marketing', 'pt-BR': 'Marketing' },
    mode: 'both',
    score_area: 'Crecimiento',
    title: { es: '¿Dónde hacés marketing?', 'pt-BR': 'Onde você faz marketing?' },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘' },
      { id: 'google_ads', label: { es: 'Google Ads', 'pt-BR': 'Google Ads' }, emoji: '🔍' },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
      { id: 'email', label: { es: 'Email marketing', 'pt-BR': 'Email marketing' }, emoji: '📧' },
      { id: 'none', label: { es: 'No hago marketing', 'pt-BR': 'Não faço marketing' }, emoji: '🤷' },
    ],
  },
  {
    id: 'T22_MARKETING_BUDGET',
    category: 'marketing',
    categoryLabel: { es: 'Marketing', 'pt-BR': 'Marketing' },
    mode: 'complete',
    score_area: 'Crecimiento',
    title: { es: 'Presupuesto mensual de marketing', 'pt-BR': 'Orçamento mensal de marketing' },
    type: 'single',
    options: [
      { id: 'zero', label: { es: '$0', 'pt-BR': 'R$0' } },
      { id: 'low', label: { es: 'Bajo (< $50k/R$1k)', 'pt-BR': 'Baixo (< $50k/R$1k)' } },
      { id: 'medium', label: { es: 'Medio ($50k-200k/R$1-5k)', 'pt-BR': 'Médio ($50k-200k/R$1-5k)' } },
      { id: 'high', label: { es: 'Alto (> $200k/R$5k)', 'pt-BR': 'Alto (> $200k/R$5k)' } },
    ],
  },
  {
    id: 'T23_SOCIAL_FOLLOWERS',
    category: 'marketing',
    categoryLabel: { es: 'Marketing', 'pt-BR': 'Marketing' },
    mode: 'complete',
    score_area: 'Crecimiento',
    title: { es: 'Seguidores en redes (total aprox)', 'pt-BR': 'Seguidores nas redes (total aprox)' },
    type: 'single',
    options: [
      { id: '0-500', label: { es: '0-500', 'pt-BR': '0-500' } },
      { id: '500-2k', label: { es: '500-2.000', 'pt-BR': '500-2.000' } },
      { id: '2k-10k', label: { es: '2.000-10.000', 'pt-BR': '2.000-10.000' } },
      { id: '10k+', label: { es: 'Más de 10.000', 'pt-BR': 'Mais de 10.000' } },
    ],
  },

  // --- OBJETIVOS ---
  {
    id: 'T24_MAIN_GOAL_30D',
    category: 'objetivos',
    categoryLabel: { es: 'Objetivos', 'pt-BR': 'Objetivos' },
    mode: 'both',
    score_area: 'Crecimiento',
    title: { es: '¿Qué querés mejorar en los próximos 30 días?', 'pt-BR': 'O que você quer melhorar nos próximos 30 dias?' },
    type: 'single',
    required: true,
    options: [
      { id: 'more_sales', label: { es: 'Más ventas/reservas', 'pt-BR': 'Mais vendas/reservas' }, emoji: '💰' },
      { id: 'better_margin', label: { es: 'Mejor margen', 'pt-BR': 'Melhor margem' }, emoji: '📈' },
      { id: 'reputation', label: { es: 'Mejorar reputación', 'pt-BR': 'Melhorar reputação' }, emoji: '⭐' },
      { id: 'efficiency', label: { es: 'Más eficiencia operativa', 'pt-BR': 'Mais eficiência operacional' }, emoji: '⚡' },
      { id: 'team', label: { es: 'Mejorar equipo', 'pt-BR': 'Melhorar equipe' }, emoji: '👥' },
    ],
  },
  {
    id: 'T25_GOAL_90D',
    category: 'objetivos',
    categoryLabel: { es: 'Objetivos', 'pt-BR': 'Objetivos' },
    mode: 'complete',
    score_area: 'Crecimiento',
    title: { es: 'Meta a 90 días (una frase)', 'pt-BR': 'Meta a 90 dias (uma frase)' },
    help: { es: 'Ej: "+20% ocupación" o "Rating 4.5+"', 'pt-BR': 'Ex: "+20% ocupação" ou "Nota 4.5+"' },
    type: 'text',
  },
];

// ============================================
// PREGUNTAS ESPECÍFICAS ALOJAMIENTO
// ============================================

const ALOJAMIENTO_QUESTIONS: TurismQuestion[] = [
  // --- CAPACIDAD ---
  {
    id: 'TA01_ROOM_COUNT',
    category: 'capacidad',
    categoryLabel: { es: 'Capacidad', 'pt-BR': 'Capacidade' },
    mode: 'both',
    score_area: 'Eficiencia',
    title: { es: 'Cantidad de habitaciones/unidades', 'pt-BR': 'Quantidade de quartos/unidades' },
    type: 'number',
    min: 1,
    max: 1000,
    unit: 'habitaciones',
    businessTypes: ALOJAMIENTO,
  },
  {
    id: 'TA02_BED_COUNT',
    category: 'capacidad',
    categoryLabel: { es: 'Capacidad', 'pt-BR': 'Capacidade' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: 'Capacidad total (camas)', 'pt-BR': 'Capacidade total (camas)' },
    type: 'number',
    min: 1,
    max: 5000,
    unit: 'camas',
    businessTypes: ALOJAMIENTO,
  },
  {
    id: 'TA03_ROOM_TYPES',
    category: 'capacidad',
    categoryLabel: { es: 'Capacidad', 'pt-BR': 'Capacidade' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: 'Tipos de habitación que ofrecés', 'pt-BR': 'Tipos de quarto que oferece' },
    type: 'multi',
    businessTypes: ALOJAMIENTO,
    options: [
      { id: 'single', label: { es: 'Single/Individual', 'pt-BR': 'Single/Individual' }, emoji: '🛏️' },
      { id: 'double', label: { es: 'Doble', 'pt-BR': 'Duplo' }, emoji: '🛏️🛏️' },
      { id: 'triple', label: { es: 'Triple', 'pt-BR': 'Triplo' }, emoji: '👨‍👩‍👧' },
      { id: 'suite', label: { es: 'Suite', 'pt-BR': 'Suíte' }, emoji: '👑' },
      { id: 'family', label: { es: 'Familiar', 'pt-BR': 'Familiar' }, emoji: '👨‍👩‍👧‍👦' },
      { id: 'dorm', label: { es: 'Dormitorio compartido', 'pt-BR': 'Dormitório compartilhado' }, emoji: '🛌' },
    ],
  },

  // --- OCUPACIÓN ---
  {
    id: 'TA04_AVG_OCCUPANCY',
    category: 'ocupacion',
    categoryLabel: { es: 'Ocupación', 'pt-BR': 'Ocupação' },
    mode: 'both',
    score_area: 'Tráfico',
    title: { es: 'Ocupación promedio anual (%)', 'pt-BR': 'Ocupação média anual (%)' },
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%',
    businessTypes: ALOJAMIENTO,
  },
  {
    id: 'TA05_PEAK_OCCUPANCY',
    category: 'ocupacion',
    categoryLabel: { es: 'Ocupación', 'pt-BR': 'Ocupação' },
    mode: 'complete',
    score_area: 'Tráfico',
    title: { es: 'Ocupación en temporada alta (%)', 'pt-BR': 'Ocupação em alta temporada (%)' },
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%',
    businessTypes: ALOJAMIENTO,
  },
  {
    id: 'TA06_LOW_OCCUPANCY',
    category: 'ocupacion',
    categoryLabel: { es: 'Ocupación', 'pt-BR': 'Ocupação' },
    mode: 'complete',
    score_area: 'Tráfico',
    title: { es: 'Ocupación en temporada baja (%)', 'pt-BR': 'Ocupação em baixa temporada (%)' },
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%',
    businessTypes: ALOJAMIENTO,
  },
  {
    id: 'TA07_AVG_STAY',
    category: 'ocupacion',
    categoryLabel: { es: 'Ocupación', 'pt-BR': 'Ocupação' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Estadía promedio (noches)', 'pt-BR': 'Estadia média (noites)' },
    type: 'slider',
    min: 1,
    max: 30,
    unit: 'noches',
    businessTypes: ALOJAMIENTO,
  },

  // --- TARIFAS ---
  {
    id: 'TA08_ADR',
    category: 'tarifas',
    categoryLabel: { es: 'Tarifas', 'pt-BR': 'Tarifas' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Tarifa promedio por noche (ADR)', 'pt-BR': 'Tarifa média por noite (ADR)' },
    help: { es: 'Average Daily Rate', 'pt-BR': 'Average Daily Rate' },
    type: 'money',
    businessTypes: ALOJAMIENTO,
  },
  {
    id: 'TA09_REVPAR',
    category: 'tarifas',
    categoryLabel: { es: 'Tarifas', 'pt-BR': 'Tarifas' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: '¿Conocés tu RevPAR?', 'pt-BR': 'Você conhece seu RevPAR?' },
    help: { es: 'Revenue per Available Room', 'pt-BR': 'Revenue per Available Room' },
    type: 'single',
    businessTypes: HOTELES,
    options: [
      { id: 'yes_track', label: { es: 'Sí, lo sigo regularmente', 'pt-BR': 'Sim, acompanho regularmente' }, emoji: '📊' },
      { id: 'approx', label: { es: 'Tengo una idea', 'pt-BR': 'Tenho uma ideia' }, emoji: '🤔' },
      { id: 'no', label: { es: 'No lo sigo', 'pt-BR': 'Não acompanho' }, emoji: '❌' },
    ],
  },
  {
    id: 'TA10_DYNAMIC_PRICING',
    category: 'tarifas',
    categoryLabel: { es: 'Tarifas', 'pt-BR': 'Tarifas' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: '¿Usás precios dinámicos?', 'pt-BR': 'Você usa preços dinâmicos?' },
    type: 'single',
    businessTypes: ALOJAMIENTO,
    options: [
      { id: 'yes_auto', label: { es: 'Sí, con software', 'pt-BR': 'Sim, com software' }, emoji: '🤖' },
      { id: 'yes_manual', label: { es: 'Sí, manual por temporada', 'pt-BR': 'Sim, manual por temporada' }, emoji: '📅' },
      { id: 'no', label: { es: 'No, precio fijo', 'pt-BR': 'Não, preço fixo' }, emoji: '➖' },
    ],
  },

  // --- OTAs y DISTRIBUCIÓN ---
  {
    id: 'TA11_OTAS_USED',
    category: 'distribucion',
    categoryLabel: { es: 'Distribución', 'pt-BR': 'Distribuição' },
    mode: 'both',
    score_area: 'Crecimiento',
    title: { es: '¿En qué OTAs estás?', 'pt-BR': 'Em quais OTAs você está?' },
    type: 'multi',
    businessTypes: ALOJAMIENTO,
    options: [
      { id: 'booking', label: { es: 'Booking.com', 'pt-BR': 'Booking.com' }, emoji: '🔵' },
      { id: 'expedia', label: { es: 'Expedia', 'pt-BR': 'Expedia' }, emoji: '🟡' },
      { id: 'airbnb', label: { es: 'Airbnb', 'pt-BR': 'Airbnb' }, emoji: '🔴' },
      { id: 'despegar', label: { es: 'Despegar', 'pt-BR': 'Decolar' }, emoji: '✈️' },
      { id: 'hotels_com', label: { es: 'Hotels.com', 'pt-BR': 'Hotels.com' }, emoji: '🏨' },
      { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌' },
    ],
  },
  {
    id: 'TA12_OTA_COMMISSION',
    category: 'distribucion',
    categoryLabel: { es: 'Distribución', 'pt-BR': 'Distribuição' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: 'Comisión promedio OTAs (%)', 'pt-BR': 'Comissão média OTAs (%)' },
    type: 'slider',
    min: 5,
    max: 30,
    unit: '%',
    businessTypes: ALOJAMIENTO,
  },
  {
    id: 'TA13_CHANNEL_MANAGER',
    category: 'distribucion',
    categoryLabel: { es: 'Distribución', 'pt-BR': 'Distribuição' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: '¿Usás Channel Manager?', 'pt-BR': 'Você usa Channel Manager?' },
    type: 'single',
    businessTypes: ALOJAMIENTO,
    options: [
      { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '✅' },
      { id: 'considering', label: { es: 'Evaluando opciones', 'pt-BR': 'Avaliando opções' }, emoji: '🤔' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
    ],
  },

  // --- SERVICIOS ADICIONALES ---
  {
    id: 'TA14_AMENITIES',
    category: 'servicios',
    categoryLabel: { es: 'Servicios', 'pt-BR': 'Serviços' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: '¿Qué servicios adicionales ofrecés?', 'pt-BR': 'Quais serviços adicionais oferece?' },
    type: 'multi',
    businessTypes: ALOJAMIENTO,
    options: [
      { id: 'breakfast', label: { es: 'Desayuno', 'pt-BR': 'Café da manhã' }, emoji: '🍳' },
      { id: 'restaurant', label: { es: 'Restaurante', 'pt-BR': 'Restaurante' }, emoji: '🍽️' },
      { id: 'pool', label: { es: 'Pileta/Piscina', 'pt-BR': 'Piscina' }, emoji: '🏊' },
      { id: 'spa', label: { es: 'Spa/Wellness', 'pt-BR': 'Spa/Wellness' }, emoji: '💆' },
      { id: 'parking', label: { es: 'Estacionamiento', 'pt-BR': 'Estacionamento' }, emoji: '🅿️' },
      { id: 'tours', label: { es: 'Tours/Excursiones', 'pt-BR': 'Tours/Excursões' }, emoji: '🚐' },
    ],
  },
  {
    id: 'TA15_UPSELL_REVENUE',
    category: 'servicios',
    categoryLabel: { es: 'Servicios', 'pt-BR': 'Serviços' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: '% de ingresos por servicios adicionales', 'pt-BR': '% de receita por serviços adicionais' },
    type: 'slider',
    min: 0,
    max: 50,
    unit: '%',
    businessTypes: ALOJAMIENTO,
  },

  // --- OPERACIÓN HOUSEKEEPING ---
  {
    id: 'TA16_HOUSEKEEPING',
    category: 'operacion',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: 'Limpieza de habitaciones', 'pt-BR': 'Limpeza de quartos' },
    type: 'single',
    businessTypes: ALOJAMIENTO,
    options: [
      { id: 'own_team', label: { es: 'Equipo propio', 'pt-BR': 'Equipe própria' }, emoji: '👥' },
      { id: 'outsourced', label: { es: 'Tercerizado', 'pt-BR': 'Terceirizado' }, emoji: '🏢' },
      { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄' },
    ],
  },
  {
    id: 'TA17_CHECKIN_PROCESS',
    category: 'operacion',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: '¿Cómo es el check-in?', 'pt-BR': 'Como é o check-in?' },
    type: 'single',
    businessTypes: ALOJAMIENTO,
    options: [
      { id: 'self', label: { es: 'Self check-in', 'pt-BR': 'Self check-in' }, emoji: '📱' },
      { id: 'reception_24', label: { es: 'Recepción 24hs', 'pt-BR': 'Recepção 24h' }, emoji: '🏨' },
      { id: 'reception_limited', label: { es: 'Recepción horario limitado', 'pt-BR': 'Recepção horário limitado' }, emoji: '⏰' },
      { id: 'host', label: { es: 'Anfitrión personal', 'pt-BR': 'Anfitrião pessoal' }, emoji: '👋' },
    ],
  },

  // --- ESPECÍFICO HOTEL BOUTIQUE ---
  {
    id: 'TA18_BOUTIQUE_STYLE',
    category: 'identidad',
    categoryLabel: { es: 'Identidad', 'pt-BR': 'Identidade' },
    mode: 'complete',
    score_area: 'Reputación',
    title: { es: 'Estilo/concepto de tu hotel boutique', 'pt-BR': 'Estilo/conceito do seu hotel boutique' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.HOTEL_BOUTIQUE],
    options: [
      { id: 'historic', label: { es: 'Histórico/Patrimonial', 'pt-BR': 'Histórico/Patrimonial' }, emoji: '🏛️' },
      { id: 'design', label: { es: 'Diseño contemporáneo', 'pt-BR': 'Design contemporâneo' }, emoji: '🎨' },
      { id: 'eco', label: { es: 'Eco/Sustentable', 'pt-BR': 'Eco/Sustentável' }, emoji: '🌿' },
      { id: 'luxury', label: { es: 'Lujo discreto', 'pt-BR': 'Luxo discreto' }, emoji: '✨' },
      { id: 'themed', label: { es: 'Temático', 'pt-BR': 'Temático' }, emoji: '🎭' },
    ],
  },
  {
    id: 'TA19_PERSONALIZATION',
    category: 'servicio',
    categoryLabel: { es: 'Servicio', 'pt-BR': 'Serviço' },
    mode: 'complete',
    score_area: 'Reputación',
    title: { es: '¿Personalizás la experiencia del huésped?', 'pt-BR': 'Você personaliza a experiência do hóspede?' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.HOTEL_BOUTIQUE],
    options: [
      { id: 'high', label: { es: 'Mucho (conocemos preferencias)', 'pt-BR': 'Muito (conhecemos preferências)' }, emoji: '⭐' },
      { id: 'some', label: { es: 'Algo (ocasiones especiales)', 'pt-BR': 'Algo (ocasiões especiais)' }, emoji: '🎁' },
      { id: 'basic', label: { es: 'Básico', 'pt-BR': 'Básico' }, emoji: '➖' },
    ],
  },

  // --- ESPECÍFICO RESORT ---
  {
    id: 'TA20_RESORT_MODEL',
    category: 'modelo',
    categoryLabel: { es: 'Modelo', 'pt-BR': 'Modelo' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Modelo de negocio', 'pt-BR': 'Modelo de negócio' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.RESORT],
    options: [
      { id: 'all_inclusive', label: { es: 'All Inclusive', 'pt-BR': 'All Inclusive' }, emoji: '🎯' },
      { id: 'half_board', label: { es: 'Media pensión', 'pt-BR': 'Meia pensão' }, emoji: '🍽️' },
      { id: 'room_only', label: { es: 'Solo habitación', 'pt-BR': 'Só quarto' }, emoji: '🛏️' },
      { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄' },
    ],
  },

  // --- ESPECÍFICO HOSTEL ---
  {
    id: 'TA21_HOSTEL_VIBE',
    category: 'identidad',
    categoryLabel: { es: 'Identidad', 'pt-BR': 'Identidade' },
    mode: 'complete',
    score_area: 'Reputación',
    title: { es: 'Ambiente/Público objetivo', 'pt-BR': 'Ambiente/Público-alvo' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.HOSTEL],
    options: [
      { id: 'party', label: { es: 'Fiesta/Social', 'pt-BR': 'Festa/Social' }, emoji: '🎉' },
      { id: 'chill', label: { es: 'Tranquilo/Relax', 'pt-BR': 'Tranquilo/Relax' }, emoji: '😌' },
      { id: 'adventure', label: { es: 'Aventura/Mochileros', 'pt-BR': 'Aventura/Mochileiros' }, emoji: '🎒' },
      { id: 'digital_nomad', label: { es: 'Nómadas digitales', 'pt-BR': 'Nômades digitais' }, emoji: '💻' },
    ],
  },
  {
    id: 'TA22_HOSTEL_COMMON_AREAS',
    category: 'servicios',
    categoryLabel: { es: 'Servicios', 'pt-BR': 'Serviços' },
    mode: 'complete',
    score_area: 'Reputación',
    title: { es: 'Áreas comunes disponibles', 'pt-BR': 'Áreas comuns disponíveis' },
    type: 'multi',
    businessTypes: [TURISM_BUSINESS_TYPES.HOSTEL],
    options: [
      { id: 'kitchen', label: { es: 'Cocina compartida', 'pt-BR': 'Cozinha compartilhada' }, emoji: '🍳' },
      { id: 'lounge', label: { es: 'Sala de estar', 'pt-BR': 'Sala de estar' }, emoji: '🛋️' },
      { id: 'rooftop', label: { es: 'Rooftop/Terraza', 'pt-BR': 'Rooftop/Terraço' }, emoji: '🌆' },
      { id: 'cowork', label: { es: 'Espacio cowork', 'pt-BR': 'Espaço cowork' }, emoji: '💻' },
      { id: 'bar', label: { es: 'Bar', 'pt-BR': 'Bar' }, emoji: '🍺' },
    ],
  },

  // --- ESPECÍFICO AIRBNB/ALQUILER ---
  {
    id: 'TA23_RENTAL_PROPERTIES',
    category: 'portfolio',
    categoryLabel: { es: 'Portfolio', 'pt-BR': 'Portfólio' },
    mode: 'both',
    score_area: 'Crecimiento',
    title: { es: 'Cantidad de propiedades que gestionás', 'pt-BR': 'Quantidade de propriedades que gerencia' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.ALQUILER_TEMP],
    options: [
      { id: '1', label: { es: '1', 'pt-BR': '1' } },
      { id: '2-5', label: { es: '2-5', 'pt-BR': '2-5' } },
      { id: '6-20', label: { es: '6-20', 'pt-BR': '6-20' } },
      { id: '20+', label: { es: 'Más de 20', 'pt-BR': 'Mais de 20' } },
    ],
  },
  {
    id: 'TA24_PROPERTY_OWNER',
    category: 'modelo',
    categoryLabel: { es: 'Modelo', 'pt-BR': 'Modelo' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: '¿Son propiedades propias o de terceros?', 'pt-BR': 'São propriedades próprias ou de terceiros?' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.ALQUILER_TEMP],
    options: [
      { id: 'own', label: { es: 'Propias', 'pt-BR': 'Próprias' }, emoji: '🏠' },
      { id: 'third_party', label: { es: 'De terceros (gestiono)', 'pt-BR': 'De terceiros (gerencio)' }, emoji: '🤝' },
      { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄' },
    ],
  },
];

// ============================================
// PREGUNTAS ESPECÍFICAS AGENCIAS Y TOURS
// ============================================

const AGENCIAS_TOURS_QUESTIONS: TurismQuestion[] = [
  {
    id: 'TT01_SERVICE_TYPE',
    category: 'servicios',
    categoryLabel: { es: 'Servicios', 'pt-BR': 'Serviços' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: '¿Qué tipo de servicios ofrecés?', 'pt-BR': 'Que tipo de serviços oferece?' },
    type: 'multi',
    businessTypes: AGENCIAS_TOURS,
    options: [
      { id: 'packages', label: { es: 'Paquetes armados', 'pt-BR': 'Pacotes montados' }, emoji: '📦' },
      { id: 'flights', label: { es: 'Vuelos', 'pt-BR': 'Voos' }, emoji: '✈️' },
      { id: 'hotels', label: { es: 'Hoteles', 'pt-BR': 'Hotéis' }, emoji: '🏨' },
      { id: 'day_tours', label: { es: 'Tours de día', 'pt-BR': 'Tours de dia' }, emoji: '🚐' },
      { id: 'multi_day', label: { es: 'Tours multi-día', 'pt-BR': 'Tours multi-dia' }, emoji: '🗺️' },
      { id: 'transfers', label: { es: 'Transfers', 'pt-BR': 'Transfers' }, emoji: '🚗' },
    ],
  },
  {
    id: 'TT02_AVG_GROUP_SIZE',
    category: 'operacion',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: 'Tamaño promedio de grupo', 'pt-BR': 'Tamanho médio do grupo' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.TOURS, TURISM_BUSINESS_TYPES.TURISMO_AVENTURA],
    options: [
      { id: 'private', label: { es: 'Privado (1-4)', 'pt-BR': 'Privado (1-4)' }, emoji: '👤' },
      { id: 'small', label: { es: 'Pequeño (5-12)', 'pt-BR': 'Pequeno (5-12)' }, emoji: '👥' },
      { id: 'medium', label: { es: 'Mediano (13-25)', 'pt-BR': 'Médio (13-25)' }, emoji: '🚌' },
      { id: 'large', label: { es: 'Grande (25+)', 'pt-BR': 'Grande (25+)' }, emoji: '🚍' },
    ],
  },
  {
    id: 'TT03_GUIDES',
    category: 'equipo',
    categoryLabel: { es: 'Equipo', 'pt-BR': 'Equipe' },
    mode: 'complete',
    score_area: 'Equipo',
    title: { es: '¿Cómo es tu equipo de guías?', 'pt-BR': 'Como é sua equipe de guias?' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.TOURS, TURISM_BUSINESS_TYPES.TURISMO_AVENTURA],
    options: [
      { id: 'own', label: { es: 'Propios empleados', 'pt-BR': 'Funcionários próprios' }, emoji: '👥' },
      { id: 'freelance', label: { es: 'Freelance', 'pt-BR': 'Freelance' }, emoji: '🤝' },
      { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄' },
    ],
  },
  {
    id: 'TT04_LANGUAGES',
    category: 'servicio',
    categoryLabel: { es: 'Servicio', 'pt-BR': 'Serviço' },
    mode: 'complete',
    score_area: 'Crecimiento',
    title: { es: 'Idiomas de atención', 'pt-BR': 'Idiomas de atendimento' },
    type: 'multi',
    businessTypes: AGENCIAS_TOURS,
    options: [
      { id: 'spanish', label: { es: 'Español', 'pt-BR': 'Espanhol' }, emoji: '🇪🇸' },
      { id: 'english', label: { es: 'Inglés', 'pt-BR': 'Inglês' }, emoji: '🇬🇧' },
      { id: 'portuguese', label: { es: 'Portugués', 'pt-BR': 'Português' }, emoji: '🇧🇷' },
      { id: 'french', label: { es: 'Francés', 'pt-BR': 'Francês' }, emoji: '🇫🇷' },
      { id: 'german', label: { es: 'Alemán', 'pt-BR': 'Alemão' }, emoji: '🇩🇪' },
    ],
  },
  {
    id: 'TT05_INSURANCE',
    category: 'operacion',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: '¿Incluís seguro de viaje?', 'pt-BR': 'Inclui seguro de viagem?' },
    type: 'single',
    businessTypes: AGENCIAS_TOURS,
    options: [
      { id: 'included', label: { es: 'Incluido', 'pt-BR': 'Incluído' }, emoji: '✅' },
      { id: 'optional', label: { es: 'Opcional', 'pt-BR': 'Opcional' }, emoji: '➕' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
    ],
  },
  {
    id: 'TT06_ADVENTURE_TYPES',
    category: 'servicios',
    categoryLabel: { es: 'Servicios', 'pt-BR': 'Serviços' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Tipo de actividades de aventura', 'pt-BR': 'Tipo de atividades de aventura' },
    type: 'multi',
    businessTypes: [TURISM_BUSINESS_TYPES.TURISMO_AVENTURA],
    options: [
      { id: 'trekking', label: { es: 'Trekking/Senderismo', 'pt-BR': 'Trekking/Trilhas' }, emoji: '🥾' },
      { id: 'rafting', label: { es: 'Rafting/Kayak', 'pt-BR': 'Rafting/Caiaque' }, emoji: '🚣' },
      { id: 'climbing', label: { es: 'Escalada', 'pt-BR': 'Escalada' }, emoji: '🧗' },
      { id: 'diving', label: { es: 'Buceo/Snorkel', 'pt-BR': 'Mergulho/Snorkel' }, emoji: '🤿' },
      { id: 'cycling', label: { es: 'Ciclismo', 'pt-BR': 'Ciclismo' }, emoji: '🚴' },
      { id: 'zipline', label: { es: 'Tirolesa/Canopy', 'pt-BR': 'Tirolesa/Arvorismo' }, emoji: '🪂' },
    ],
  },
  {
    id: 'TT07_CERTIFICATIONS',
    category: 'operacion',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'complete',
    score_area: 'Reputación',
    title: { es: '¿Tenés certificaciones de seguridad?', 'pt-BR': 'Você tem certificações de segurança?' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.TURISMO_AVENTURA],
    options: [
      { id: 'yes_international', label: { es: 'Sí, internacionales', 'pt-BR': 'Sim, internacionais' }, emoji: '🏆' },
      { id: 'yes_local', label: { es: 'Sí, locales', 'pt-BR': 'Sim, locais' }, emoji: '📜' },
      { id: 'in_process', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '⏳' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
    ],
  },
];

// ============================================
// PREGUNTAS ESPECÍFICAS EVENTOS
// ============================================

const EVENTOS_QUESTIONS: TurismQuestion[] = [
  {
    id: 'TE01_VENUE_CAPACITY',
    category: 'capacidad',
    categoryLabel: { es: 'Capacidad', 'pt-BR': 'Capacidade' },
    mode: 'both',
    score_area: 'Eficiencia',
    title: { es: 'Capacidad máxima del venue', 'pt-BR': 'Capacidade máxima do venue' },
    type: 'number',
    min: 10,
    max: 10000,
    unit: 'personas',
    businessTypes: EVENTOS,
  },
  {
    id: 'TE02_EVENT_TYPES',
    category: 'servicios',
    categoryLabel: { es: 'Servicios', 'pt-BR': 'Serviços' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Tipos de eventos que realizás', 'pt-BR': 'Tipos de eventos que realiza' },
    type: 'multi',
    businessTypes: EVENTOS,
    options: [
      { id: 'weddings', label: { es: 'Bodas/Casamientos', 'pt-BR': 'Casamentos' }, emoji: '💒' },
      { id: 'corporate', label: { es: 'Corporativos', 'pt-BR': 'Corporativos' }, emoji: '🏢' },
      { id: 'conferences', label: { es: 'Conferencias', 'pt-BR': 'Conferências' }, emoji: '🎤' },
      { id: 'social', label: { es: 'Sociales (cumpleaños, etc)', 'pt-BR': 'Sociais (aniversários, etc)' }, emoji: '🎉' },
      { id: 'concerts', label: { es: 'Conciertos/Shows', 'pt-BR': 'Shows/Concertos' }, emoji: '🎵' },
      { id: 'exhibitions', label: { es: 'Exposiciones', 'pt-BR': 'Exposições' }, emoji: '🖼️' },
    ],
  },
  {
    id: 'TE03_EVENTS_PER_MONTH',
    category: 'operacion',
    categoryLabel: { es: 'Operación', 'pt-BR': 'Operação' },
    mode: 'both',
    score_area: 'Tráfico',
    title: { es: 'Eventos por mes (promedio)', 'pt-BR': 'Eventos por mês (média)' },
    type: 'single',
    businessTypes: EVENTOS,
    options: [
      { id: '1-4', label: { es: '1-4', 'pt-BR': '1-4' } },
      { id: '5-10', label: { es: '5-10', 'pt-BR': '5-10' } },
      { id: '11-20', label: { es: '11-20', 'pt-BR': '11-20' } },
      { id: '20+', label: { es: 'Más de 20', 'pt-BR': 'Mais de 20' } },
    ],
  },
  {
    id: 'TE04_AVG_EVENT_VALUE',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Valor promedio por evento', 'pt-BR': 'Valor médio por evento' },
    type: 'money',
    businessTypes: EVENTOS,
  },
  {
    id: 'TE05_CATERING_MODEL',
    category: 'servicios',
    categoryLabel: { es: 'Servicios', 'pt-BR': 'Serviços' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: '¿Cómo manejás el catering?', 'pt-BR': 'Como você gerencia o catering?' },
    type: 'single',
    businessTypes: [TURISM_BUSINESS_TYPES.SALON_EVENTOS, TURISM_BUSINESS_TYPES.EVENTOS_CORP],
    options: [
      { id: 'own', label: { es: 'Propio/Interno', 'pt-BR': 'Próprio/Interno' }, emoji: '🍽️' },
      { id: 'exclusive', label: { es: 'Proveedores exclusivos', 'pt-BR': 'Fornecedores exclusivos' }, emoji: '🤝' },
      { id: 'client_choice', label: { es: 'A elección del cliente', 'pt-BR': 'A escolha do cliente' }, emoji: '🔄' },
    ],
  },
  {
    id: 'TE06_BOOKING_LEAD_TIME',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'complete',
    score_area: 'Eficiencia',
    title: { es: 'Anticipación promedio de reservas', 'pt-BR': 'Antecedência média das reservas' },
    type: 'single',
    businessTypes: EVENTOS,
    options: [
      { id: 'days', label: { es: 'Días', 'pt-BR': 'Dias' }, emoji: '📅' },
      { id: '1-3months', label: { es: '1-3 meses', 'pt-BR': '1-3 meses' }, emoji: '🗓️' },
      { id: '3-6months', label: { es: '3-6 meses', 'pt-BR': '3-6 meses' }, emoji: '📆' },
      { id: '6months+', label: { es: 'Más de 6 meses', 'pt-BR': 'Mais de 6 meses' }, emoji: '📅📅' },
    ],
  },
];

// ============================================
// PREGUNTAS ESPECÍFICAS PARQUES/ATRACCIONES
// ============================================

const ATRACCIONES_QUESTIONS: TurismQuestion[] = [
  {
    id: 'TP01_VISITOR_CAPACITY',
    category: 'capacidad',
    categoryLabel: { es: 'Capacidad', 'pt-BR': 'Capacidade' },
    mode: 'both',
    score_area: 'Eficiencia',
    title: { es: 'Capacidad máxima diaria', 'pt-BR': 'Capacidade máxima diária' },
    type: 'number',
    min: 50,
    max: 50000,
    unit: 'visitantes',
    businessTypes: ATRACCIONES_PARQUES,
  },
  {
    id: 'TP02_TICKET_TYPES',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'both',
    score_area: 'Rentabilidad',
    title: { es: 'Tipos de entrada que vendés', 'pt-BR': 'Tipos de ingresso que vende' },
    type: 'multi',
    businessTypes: ATRACCIONES_PARQUES,
    options: [
      { id: 'general', label: { es: 'General', 'pt-BR': 'Geral' }, emoji: '🎟️' },
      { id: 'vip', label: { es: 'VIP/Fast Pass', 'pt-BR': 'VIP/Fast Pass' }, emoji: '⭐' },
      { id: 'combo', label: { es: 'Combos/Packs', 'pt-BR': 'Combos/Pacotes' }, emoji: '📦' },
      { id: 'annual', label: { es: 'Pase anual', 'pt-BR': 'Passe anual' }, emoji: '📆' },
      { id: 'group', label: { es: 'Grupos/Escuelas', 'pt-BR': 'Grupos/Escolas' }, emoji: '👥' },
    ],
  },
  {
    id: 'TP03_DAILY_VISITORS',
    category: 'trafico',
    categoryLabel: { es: 'Tráfico', 'pt-BR': 'Tráfego' },
    mode: 'both',
    score_area: 'Tráfico',
    title: { es: 'Visitantes promedio por día', 'pt-BR': 'Visitantes médios por dia' },
    type: 'single',
    businessTypes: ATRACCIONES_PARQUES,
    options: [
      { id: '0-100', label: { es: '0-100', 'pt-BR': '0-100' } },
      { id: '100-500', label: { es: '100-500', 'pt-BR': '100-500' } },
      { id: '500-2000', label: { es: '500-2.000', 'pt-BR': '500-2.000' } },
      { id: '2000+', label: { es: 'Más de 2.000', 'pt-BR': 'Mais de 2.000' } },
    ],
  },
  {
    id: 'TP04_FNB_REVENUE',
    category: 'ventas',
    categoryLabel: { es: 'Ventas', 'pt-BR': 'Vendas' },
    mode: 'complete',
    score_area: 'Rentabilidad',
    title: { es: '% de ingresos por F&B y merchandising', 'pt-BR': '% de receita por F&B e merchandising' },
    type: 'slider',
    min: 0,
    max: 60,
    unit: '%',
    businessTypes: ATRACCIONES_PARQUES,
  },
  {
    id: 'TP05_REPEAT_VISITORS',
    category: 'trafico',
    categoryLabel: { es: 'Tráfico', 'pt-BR': 'Tráfego' },
    mode: 'complete',
    score_area: 'Crecimiento',
    title: { es: '% de visitantes repetidores', 'pt-BR': '% de visitantes repetidos' },
    type: 'slider',
    min: 0,
    max: 80,
    unit: '%',
    businessTypes: ATRACCIONES_PARQUES,
  },
];

// ============================================
// COMBINAR TODAS LAS PREGUNTAS TURISMO
// ============================================

// Import extended questions for complete coverage
import { TURISMO_EXTENDED_QUESTIONS } from './turismQuestionsExtended';

export const TURISM_COMPLETE_QUESTIONS: TurismQuestion[] = [
  ...TURISM_UNIVERSAL_QUESTIONS,
  ...ALOJAMIENTO_QUESTIONS,
  ...AGENCIAS_TOURS_QUESTIONS,
  ...EVENTOS_QUESTIONS,
  ...ATRACCIONES_QUESTIONS,
  ...TURISMO_EXTENDED_QUESTIONS,
];

// Helper para obtener preguntas por tipo de negocio y modo
export const getTurismQuestionsForBusiness = (
  businessTypeId: string,
  mode: 'quick' | 'complete'
): TurismQuestion[] => {
  return TURISM_COMPLETE_QUESTIONS.filter(q => {
    // Filtrar por modo
    if (q.mode !== 'both' && q.mode !== mode) return false;
    
    // Si no tiene businessTypes, aplica a todos
    if (!q.businessTypes) return true;
    
    // Verificar si el tipo está incluido
    return q.businessTypes.includes(businessTypeId);
  });
};

// Contar preguntas por modo y tipo
export const countTurismQuestions = (businessTypeId: string) => {
  const quick = getTurismQuestionsForBusiness(businessTypeId, 'quick').length;
  const complete = getTurismQuestionsForBusiness(businessTypeId, 'complete').length;
  return { quick, complete };
};
