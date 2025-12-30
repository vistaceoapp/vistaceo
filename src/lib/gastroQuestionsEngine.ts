// Gastronomy Questions Engine v9 - Ultra-Intelligent Question Filtering
// Complete 70+ Questions with Health Impact Scores
// Now with smart business type filtering - never ask irrelevant questions

import { CountryCode, COUNTRY_PACKS } from './countryPacks';
import { getTypeSpecificQuestions } from './businessTypeQuestions';
import { shouldShowQuestion, filterQuestionOptions } from './businessTypeQuestionRules';

// ============= TYPES =============

// Dimensiones de salud del negocio - 7 dimensiones claras y accionables
export type HealthDimension = 
  | 'reputation'       // Reputación: Google reviews, ratings, percepción pública
  | 'profitability'    // Rentabilidad: pricing, márgenes, food cost
  | 'finances'         // Finanzas: ingresos, costos fijos, flujo de caja
  | 'efficiency'       // Eficiencia: operación, inventario, tiempos, desperdicios
  | 'traffic'          // Tráfico: clientes, canales, dayparts, delivery
  | 'team'             // Equipo: staff, satisfacción, capacitación
  | 'growth'           // Crecimiento: tendencias, oportunidades, expansión
  // Legacy dimensions for backwards compatibility with questions
  | 'market_fit' | 'pricing_position' | 'unit_economics' | 'operational_flow' | 'demand_rhythm';

// Mapeo de dimensiones legacy a las nuevas
export const DIMENSION_MAPPING: Record<string, HealthDimension> = {
  // Legacy -> New
  market_fit: 'reputation',
  pricing_position: 'profitability',
  unit_economics: 'finances',
  operational_flow: 'efficiency',
  demand_rhythm: 'traffic',
  // New (pass-through)
  reputation: 'reputation',
  profitability: 'profitability',
  finances: 'finances',
  efficiency: 'efficiency',
  traffic: 'traffic',
  team: 'team',
  growth: 'growth',
};

// Nuevas dimensiones oficiales
export const CANONICAL_DIMENSIONS: HealthDimension[] = [
  'reputation', 'profitability', 'finances', 'efficiency', 'traffic', 'team', 'growth'
];

export interface QuestionOption {
  id: string;
  label: { es: string; 'pt-BR': string };
  emoji?: string;
  countries?: string[];  // If specified, only show in these countries
  impactScore?: number;  // -20 to +20, how this answer affects health
}

export interface GastroQuestion {
  id: string;
  category: 'identity' | 'operation' | 'sales' | 'menu' | 'finance' | 'team' | 'marketing' | 'reputation' | 'goals';
  mode: 'quick' | 'complete' | 'both';
  dimension: HealthDimension;    // Primary dimension this question affects
  weight: number;               // 1-10, how important this is for the dimension
  title: { es: string; 'pt-BR': string };
  help?: { es: string; 'pt-BR': string };
  type: 'single' | 'multi' | 'number' | 'slider' | 'text';
  options?: QuestionOption[];
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  businessTypes?: string[];     // Only show for these business types
  countries?: string[];         // Only show in these countries
}

// ============= CATEGORY LABELS =============

export const CATEGORY_LABELS: Record<string, { es: string; 'pt-BR': string; icon: string }> = {
  identity: { es: 'Identidad', 'pt-BR': 'Identidade', icon: '🏪' },
  operation: { es: 'Operación', 'pt-BR': 'Operação', icon: '⚙️' },
  sales: { es: 'Ventas', 'pt-BR': 'Vendas', icon: '💰' },
  menu: { es: 'Menú', 'pt-BR': 'Cardápio', icon: '📋' },
  finance: { es: 'Finanzas', 'pt-BR': 'Finanças', icon: '📊' },
  team: { es: 'Equipo', 'pt-BR': 'Equipe', icon: '👥' },
  marketing: { es: 'Marketing', 'pt-BR': 'Marketing', icon: '📣' },
  reputation: { es: 'Reputación', 'pt-BR': 'Reputação', icon: '⭐' },
  goals: { es: 'Objetivos', 'pt-BR': 'Objetivos', icon: '🎯' },
};

// ============= ALL QUESTIONS (70+) =============

export const ALL_GASTRO_QUESTIONS: GastroQuestion[] = [
  // ==========================================
  // OPERATION (15 questions)
  // ==========================================
  {
    id: 'Q_CHANNELS',
    category: 'operation',
    mode: 'both',
    dimension: 'demand_rhythm',
    weight: 9,
    title: { es: '¿Cómo vendés hoy?', 'pt-BR': 'Como você vende hoje?' },
    help: { es: 'Elegí todo lo que aplique', 'pt-BR': 'Selecione tudo que se aplica' },
    type: 'multi',
    required: true,
    options: [
      { id: 'dine_in', label: { es: 'Salón', 'pt-BR': 'Salão' }, emoji: '🍽️', impactScore: 10 },
      { id: 'delivery_apps', label: { es: 'Apps de delivery', 'pt-BR': 'Apps de delivery' }, emoji: '📱', impactScore: 5 },
      { id: 'delivery_own', label: { es: 'Delivery propio', 'pt-BR': 'Delivery próprio' }, emoji: '🛵', impactScore: 8 },
      { id: 'pickup', label: { es: 'Take away', 'pt-BR': 'Take away' }, emoji: '🥡', impactScore: 6 },
      { id: 'catering', label: { es: 'Catering/Eventos', 'pt-BR': 'Catering/Eventos' }, emoji: '🎉', impactScore: 7 },
    ],
  },
  {
    id: 'Q_PEAKS',
    category: 'operation',
    mode: 'both',
    dimension: 'demand_rhythm',
    weight: 8,
    title: { es: '¿Cuándo se te llena más?', 'pt-BR': 'Quando enche mais?' },
    help: { es: 'Elegí tus franjas fuertes', 'pt-BR': 'Escolha suas faixas fortes' },
    type: 'multi',
    options: [
      { id: 'morning', label: { es: 'Mañana (8-12h)', 'pt-BR': 'Manhã (8-12h)' }, emoji: '☀️', impactScore: 5 },
      { id: 'noon', label: { es: 'Mediodía (12-15h)', 'pt-BR': 'Almoço (12-15h)' }, emoji: '🌞', impactScore: 10 },
      { id: 'afternoon', label: { es: 'Tarde (15-19h)', 'pt-BR': 'Tarde (15-19h)' }, emoji: '🌤️', impactScore: 5 },
      { id: 'night', label: { es: 'Noche (19-24h)', 'pt-BR': 'Noite (19-24h)' }, emoji: '🌙', impactScore: 10 },
      { id: 'late_night', label: { es: 'Madrugada (+24h)', 'pt-BR': 'Madrugada (+24h)' }, emoji: '🌃', impactScore: 3 },
    ],
  },
  {
    id: 'Q_PEAK_DAYS',
    category: 'operation',
    mode: 'complete',
    dimension: 'demand_rhythm',
    weight: 6,
    title: { es: '¿Cuáles son tus días más fuertes?', 'pt-BR': 'Quais são seus dias mais fortes?' },
    type: 'multi',
    options: [
      { id: 'mon_thu', label: { es: 'Lunes a Jueves', 'pt-BR': 'Segunda a Quinta' }, emoji: '📅', impactScore: 5 },
      { id: 'friday', label: { es: 'Viernes', 'pt-BR': 'Sexta' }, emoji: '🎉', impactScore: 10 },
      { id: 'saturday', label: { es: 'Sábado', 'pt-BR': 'Sábado' }, emoji: '🥳', impactScore: 10 },
      { id: 'sunday', label: { es: 'Domingo', 'pt-BR': 'Domingo' }, emoji: '☀️', impactScore: 8 },
    ],
  },
  {
    id: 'Q_CAPACITY',
    category: 'operation',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 7,
    title: { es: 'Capacidad del local (asientos)', 'pt-BR': 'Capacidade do local (lugares)' },
    help: { es: 'Aproximado está bien', 'pt-BR': 'Aproximado está bom' },
    type: 'slider',
    min: 0,
    max: 300,
    unit: 'asientos',
  },
  {
    id: 'Q_RESERVATIONS',
    category: 'operation',
    mode: 'complete',
    dimension: 'demand_rhythm',
    weight: 5,
    title: { es: '¿Trabajás con reservas?', 'pt-BR': 'Você trabalha com reservas?' },
    type: 'single',
    options: [
      { id: 'yes_system', label: { es: 'Sí, con sistema', 'pt-BR': 'Sim, com sistema' }, emoji: '📲', impactScore: 15 },
      { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📓', impactScore: 8 },
      { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🤷', impactScore: 3 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: -5 },
    ],
  },
  {
    id: 'Q_TABLE_TURNOVER',
    category: 'operation',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 7,
    title: { es: 'Rotación de mesas por turno', 'pt-BR': 'Giro de mesas por turno' },
    help: { es: '¿Cuántas veces se ocupa la misma mesa?', 'pt-BR': 'Quantas vezes a mesma mesa gira?' },
    type: 'single',
    options: [
      { id: 'low_1', label: { es: '1 vez', 'pt-BR': '1 vez' }, impactScore: -10 },
      { id: 'medium_2', label: { es: '2 veces', 'pt-BR': '2 vezes' }, impactScore: 5 },
      { id: 'high_3', label: { es: '3+ veces', 'pt-BR': '3+ vezes' }, impactScore: 15 },
      { id: 'dont_know', label: { es: 'No sé', 'pt-BR': 'Não sei' }, impactScore: 0 },
    ],
  },
  {
    id: 'Q_SERVICE_TIME',
    category: 'operation',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 6,
    title: { es: 'Tiempo total promedio (sentarse → pagar)', 'pt-BR': 'Tempo total médio (sentar → pagar)' },
    type: 'single',
    options: [
      { id: 'fast_30', label: { es: 'Menos de 30 min', 'pt-BR': 'Menos de 30 min' }, impactScore: 15 },
      { id: 'medium_60', label: { es: '30-60 min', 'pt-BR': '30-60 min' }, impactScore: 10 },
      { id: 'slow_90', label: { es: '60-90 min', 'pt-BR': '60-90 min' }, impactScore: 0 },
      { id: 'very_slow', label: { es: 'Más de 90 min', 'pt-BR': 'Mais de 90 min' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_DELIVERY_PLATFORMS',
    category: 'operation',
    mode: 'complete',
    dimension: 'pricing_position',
    weight: 6,
    title: { es: '¿En qué apps de delivery estás?', 'pt-BR': 'Em quais apps de delivery você está?' },
    type: 'multi',
    options: [
      { id: 'pedidosya', label: { es: 'PedidosYa', 'pt-BR': 'PedidosYa' }, emoji: '🟠', countries: ['AR', 'UY'], impactScore: 3 },
      { id: 'rappi', label: { es: 'Rappi', 'pt-BR': 'Rappi' }, emoji: '🟡', countries: ['AR', 'MX', 'CO', 'CL', 'BR'], impactScore: 3 },
      { id: 'ubereats', label: { es: 'Uber Eats', 'pt-BR': 'Uber Eats' }, emoji: '⚫', impactScore: 3 },
      { id: 'didi', label: { es: 'DiDi Food', 'pt-BR': 'DiDi Food' }, emoji: '🟠', countries: ['MX', 'CL', 'CO', 'CR', 'PA'], impactScore: 3 },
      { id: 'ifood', label: { es: 'iFood', 'pt-BR': 'iFood' }, emoji: '🔴', countries: ['BR'], impactScore: 5 },
      { id: 'doordash', label: { es: 'DoorDash', 'pt-BR': 'DoorDash' }, emoji: '🔴', countries: ['US'], impactScore: 3 },
      { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhum' }, emoji: '❌', impactScore: 0 },
    ],
  },
  {
    id: 'Q_DELIVERY_SHARE',
    category: 'operation',
    mode: 'complete',
    dimension: 'pricing_position',
    weight: 7,
    title: { es: '% de ventas por delivery apps', 'pt-BR': '% de vendas por apps de delivery' },
    help: { es: 'Aproximado', 'pt-BR': 'Aproximado' },
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%',
  },
  {
    id: 'Q_DELIVERY_COMMISSION',
    category: 'operation',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 8,
    title: { es: 'Comisión promedio de apps (%)', 'pt-BR': 'Comissão média dos apps (%)' },
    type: 'single',
    options: [
      { id: 'low_15', label: { es: 'Menos de 15%', 'pt-BR': 'Menos de 15%' }, impactScore: 15 },
      { id: 'medium_20', label: { es: '15-20%', 'pt-BR': '15-20%' }, impactScore: 5 },
      { id: 'high_25', label: { es: '20-30%', 'pt-BR': '20-30%' }, impactScore: -5 },
      { id: 'very_high', label: { es: 'Más de 30%', 'pt-BR': 'Mais de 30%' }, impactScore: -15 },
      { id: 'dont_know', label: { es: 'No sé exacto', 'pt-BR': 'Não sei exato' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_INVENTORY_CONTROL',
    category: 'operation',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 8,
    title: { es: '¿Controlás stock/inventario?', 'pt-BR': 'Você controla estoque?' },
    type: 'single',
    options: [
      { id: 'yes_system', label: { es: 'Sí, con sistema', 'pt-BR': 'Sim, com sistema' }, emoji: '💻', impactScore: 20 },
      { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📓', impactScore: 10 },
      { id: 'partial', label: { es: 'Parcialmente', 'pt-BR': 'Parcialmente' }, emoji: '🤷', impactScore: 0 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: -15 },
    ],
  },
  {
    id: 'Q_WASTE_LEVEL',
    category: 'operation',
    mode: 'both',
    dimension: 'unit_economics',
    weight: 7,
    title: { es: 'Nivel de merma/desperdicio', 'pt-BR': 'Nível de perdas/desperdício' },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Bajo (<5%)', 'pt-BR': 'Baixo (<5%)' }, emoji: '✅', impactScore: 15 },
      { id: 'medium', label: { es: 'Medio (5-10%)', 'pt-BR': 'Médio (5-10%)' }, emoji: '😐', impactScore: 0 },
      { id: 'high', label: { es: 'Alto (>10%)', 'pt-BR': 'Alto (>10%)' }, emoji: '⚠️', impactScore: -15 },
      { id: 'dont_know', label: { es: 'No sé', 'pt-BR': 'Não sei' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_STOCKOUTS',
    category: 'operation',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 6,
    title: { es: '¿Se te acaban productos clave?', 'pt-BR': 'Falta algum produto-chave?' },
    type: 'single',
    options: [
      { id: 'never', label: { es: 'Nunca o casi nunca', 'pt-BR': 'Nunca ou quase nunca' }, impactScore: 15 },
      { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, impactScore: -5 },
      { id: 'often', label: { es: 'Seguido', 'pt-BR': 'Frequentemente' }, impactScore: -15 },
      { id: 'dont_know', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_BOTTLENECK',
    category: 'operation',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 7,
    title: { es: '¿Dónde se traba más tu operación?', 'pt-BR': 'Onde a operação trava mais?' },
    type: 'single',
    options: [
      { id: 'kitchen', label: { es: 'Cocina', 'pt-BR': 'Cozinha' }, emoji: '👨‍🍳', impactScore: -10 },
      { id: 'checkout', label: { es: 'Caja/Cobro', 'pt-BR': 'Caixa' }, emoji: '💳', impactScore: -5 },
      { id: 'floor', label: { es: 'Salón/Atención', 'pt-BR': 'Salão/Atendimento' }, emoji: '🍽️', impactScore: -5 },
      { id: 'delivery', label: { es: 'Delivery', 'pt-BR': 'Entregas' }, emoji: '🛵', impactScore: -8 },
      { id: 'nowhere', label: { es: 'Ningún lado', 'pt-BR': 'Nenhum lugar' }, emoji: '✅', impactScore: 15 },
      { id: 'dont_know', label: { es: 'No sé', 'pt-BR': 'Não sei' }, impactScore: 0 },
    ],
  },
  {
    id: 'Q_SUPPLIERS',
    category: 'operation',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 4,
    title: { es: '¿Cuántos proveedores principales tenés?', 'pt-BR': 'Quantos fornecedores principais?' },
    type: 'single',
    options: [
      { id: '1-3', label: { es: '1-3', 'pt-BR': '1-3' }, impactScore: 5 },
      { id: '4-10', label: { es: '4-10', 'pt-BR': '4-10' }, impactScore: 10 },
      { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, impactScore: 5 },
      { id: 'dont_know', label: { es: 'No sé', 'pt-BR': 'Não sei' }, impactScore: 0 },
    ],
  },

  // ==========================================
  // SALES (12 questions)
  // ==========================================
  {
    id: 'Q_SALES_TRACKING',
    category: 'sales',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 9,
    title: { es: '¿Cómo registrás ventas hoy?', 'pt-BR': 'Como você registra vendas hoje?' },
    type: 'single',
    required: true,
    options: [
      { id: 'pos', label: { es: 'Sistema POS/Caja', 'pt-BR': 'Sistema PDV' }, emoji: '💻', impactScore: 20 },
      { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📊', impactScore: 10 },
      { id: 'notebook', label: { es: 'Cuaderno/Papel', 'pt-BR': 'Caderno/Papel' }, emoji: '📓', impactScore: 0 },
      { id: 'nothing', label: { es: 'Nada formal', 'pt-BR': 'Nada formal' }, emoji: '🤷', impactScore: -15 },
    ],
  },
  {
    id: 'Q_POS_SYSTEM',
    category: 'sales',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 5,
    title: { es: '¿Qué sistema POS usás?', 'pt-BR': 'Qual sistema PDV você usa?' },
    type: 'single',
    options: [
      { id: 'tango', label: { es: 'Tango Gestión', 'pt-BR': 'Tango Gestión' }, countries: ['AR'], impactScore: 10 },
      { id: 'restorando', label: { es: 'Restorando', 'pt-BR': 'Restorando' }, countries: ['AR', 'UY', 'CL'], impactScore: 10 },
      { id: 'totvs', label: { es: 'TOTVS', 'pt-BR': 'TOTVS' }, countries: ['BR'], impactScore: 10 },
      { id: 'ifood_sistema', label: { es: 'Sistema iFood', 'pt-BR': 'Sistema iFood' }, countries: ['BR'], impactScore: 8 },
      { id: 'softrestaurant', label: { es: 'Soft Restaurant', 'pt-BR': 'Soft Restaurant' }, countries: ['MX'], impactScore: 10 },
      { id: 'square', label: { es: 'Square', 'pt-BR': 'Square' }, impactScore: 10 },
      { id: 'toast', label: { es: 'Toast', 'pt-BR': 'Toast' }, impactScore: 10 },
      { id: 'other', label: { es: 'Otro', 'pt-BR': 'Outro' }, impactScore: 5 },
      { id: 'none', label: { es: 'No uso sistema', 'pt-BR': 'Não uso sistema' }, impactScore: -10 },
    ],
  },
  {
    id: 'Q_AVG_TICKET',
    category: 'sales',
    mode: 'both',
    dimension: 'pricing_position',
    weight: 9,
    title: { es: 'Ticket promedio por persona', 'pt-BR': 'Ticket médio por pessoa' },
    help: { es: 'En tu moneda local', 'pt-BR': 'Na sua moeda local' },
    type: 'number',
    min: 0,
    max: 100000,
    required: true,
  },
  {
    id: 'Q_DAILY_TRANSACTIONS',
    category: 'sales',
    mode: 'complete',
    dimension: 'demand_rhythm',
    weight: 7,
    title: { es: 'Transacciones promedio por día', 'pt-BR': 'Transações médias por dia' },
    type: 'single',
    options: [
      { id: '1-20', label: { es: '1-20', 'pt-BR': '1-20' }, impactScore: -5 },
      { id: '21-50', label: { es: '21-50', 'pt-BR': '21-50' }, impactScore: 5 },
      { id: '51-100', label: { es: '51-100', 'pt-BR': '51-100' }, impactScore: 10 },
      { id: '100+', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, impactScore: 15 },
    ],
  },
  {
    id: 'Q_PAYMENT_METHODS',
    category: 'sales',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 4,
    title: { es: '¿Cómo te pagan más?', 'pt-BR': 'Como você recebe mais?' },
    type: 'multi',
    options: [
      { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 3 },
      { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 5 },
      { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 5 },
      { id: 'mercadopago', label: { es: 'Mercado Pago', 'pt-BR': 'Mercado Pago' }, emoji: '🔵', countries: ['AR', 'MX', 'BR'], impactScore: 8 },
      { id: 'pix', label: { es: 'PIX', 'pt-BR': 'PIX' }, emoji: '⚡', countries: ['BR'], impactScore: 10 },
      { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦', impactScore: 5 },
    ],
  },
  {
    id: 'Q_MONTHLY_REVENUE',
    category: 'sales',
    mode: 'both',
    dimension: 'unit_economics',
    weight: 8,
    title: { es: 'Facturación mensual aproximada', 'pt-BR': 'Faturamento mensal aproximado' },
    type: 'single',
    options: [
      { id: 'tier1', label: { es: 'Menos de $2M', 'pt-BR': 'Menos de R$50k' }, impactScore: -5 },
      { id: 'tier2', label: { es: '$2M - $5M', 'pt-BR': 'R$50k - R$150k' }, impactScore: 5 },
      { id: 'tier3', label: { es: '$5M - $15M', 'pt-BR': 'R$150k - R$500k' }, impactScore: 10 },
      { id: 'tier4', label: { es: 'Más de $15M', 'pt-BR': 'Mais de R$500k' }, impactScore: 15 },
      { id: 'prefer_not', label: { es: 'Prefiero no decir', 'pt-BR': 'Prefiro não dizer' }, impactScore: 0 },
    ],
  },
  {
    id: 'Q_REVENUE_TREND',
    category: 'sales',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 7,
    title: { es: 'Tendencia de ventas últimos 3 meses', 'pt-BR': 'Tendência de vendas últimos 3 meses' },
    type: 'single',
    options: [
      { id: 'growing', label: { es: 'Creciendo', 'pt-BR': 'Crescendo' }, emoji: '📈', impactScore: 15 },
      { id: 'stable', label: { es: 'Estable', 'pt-BR': 'Estável' }, emoji: '➡️', impactScore: 5 },
      { id: 'declining', label: { es: 'Bajando', 'pt-BR': 'Caindo' }, emoji: '📉', impactScore: -15 },
      { id: 'dont_know', label: { es: 'No sé', 'pt-BR': 'Não sei' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_COMPETITOR_AWARENESS',
    category: 'sales',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 6,
    title: { es: '¿Conocés los precios de tu competencia?', 'pt-BR': 'Você conhece os preços da concorrência?' },
    type: 'single',
    options: [
      { id: 'yes_track', label: { es: 'Sí, los monitoreo', 'pt-BR': 'Sim, eu acompanho' }, impactScore: 15 },
      { id: 'yes_know', label: { es: 'Sí, más o menos', 'pt-BR': 'Sim, mais ou menos' }, impactScore: 5 },
      { id: 'no', label: { es: 'No mucho', 'pt-BR': 'Não muito' }, impactScore: -10 },
    ],
  },
  {
    id: 'Q_SEASONALITY',
    category: 'sales',
    mode: 'complete',
    dimension: 'demand_rhythm',
    weight: 5,
    title: { es: '¿Tenés estacionalidad marcada?', 'pt-BR': 'Você tem sazonalidade marcada?' },
    type: 'single',
    options: [
      { id: 'summer', label: { es: 'Mejor en verano', 'pt-BR': 'Melhor no verão' }, impactScore: 0 },
      { id: 'winter', label: { es: 'Mejor en invierno', 'pt-BR': 'Melhor no inverno' }, impactScore: 0 },
      { id: 'holidays', label: { es: 'Mejor en fiestas/eventos', 'pt-BR': 'Melhor em festas/eventos' }, impactScore: 5 },
      { id: 'stable', label: { es: 'Parejo todo el año', 'pt-BR': 'Estável o ano todo' }, impactScore: 10 },
      { id: 'dont_know', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_CHANNEL_MIX_MAIN',
    category: 'sales',
    mode: 'complete',
    dimension: 'demand_rhythm',
    weight: 6,
    title: { es: '¿De dónde vienen la mayoría de tus ventas?', 'pt-BR': 'De onde vem a maioria das suas vendas?' },
    type: 'single',
    options: [
      { id: 'dine_in', label: { es: 'Salón', 'pt-BR': 'Salão' }, emoji: '🍽️', impactScore: 10 },
      { id: 'delivery_apps', label: { es: 'Apps de delivery', 'pt-BR': 'Apps de delivery' }, emoji: '📱', impactScore: 0 },
      { id: 'delivery_own', label: { es: 'Delivery propio', 'pt-BR': 'Delivery próprio' }, emoji: '🛵', impactScore: 10 },
      { id: 'pickup', label: { es: 'Take away', 'pt-BR': 'Take away' }, emoji: '🥡', impactScore: 5 },
      { id: 'mixed', label: { es: 'Mixto balanceado', 'pt-BR': 'Misto balanceado' }, emoji: '⚖️', impactScore: 15 },
    ],
  },
  {
    id: 'Q_KNOWS_BREAK_EVEN',
    category: 'sales',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 8,
    title: { es: '¿Sabés cuánto tenés que vender para no perder plata?', 'pt-BR': 'Você sabe quanto precisa vender para não perder dinheiro?' },
    type: 'single',
    options: [
      { id: 'yes_exact', label: { es: 'Sí, con claridad', 'pt-BR': 'Sim, com clareza' }, impactScore: 20 },
      { id: 'yes_approx', label: { es: 'Más o menos', 'pt-BR': 'Mais ou menos' }, impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -15 },
    ],
  },
  {
    id: 'Q_PROFIT_FEEL',
    category: 'sales',
    mode: 'both',
    dimension: 'unit_economics',
    weight: 7,
    title: { es: 'Tu ganancia hoy te parece...', 'pt-BR': 'Seu lucro hoje parece...' },
    type: 'single',
    options: [
      { id: 'good', label: { es: 'Buena', 'pt-BR': 'Bom' }, emoji: '😊', impactScore: 15 },
      { id: 'ok', label: { es: 'Aceptable', 'pt-BR': 'Aceitável' }, emoji: '😐', impactScore: 5 },
      { id: 'low', label: { es: 'Baja', 'pt-BR': 'Baixo' }, emoji: '😟', impactScore: -10 },
      { id: 'dont_know', label: { es: 'No sé', 'pt-BR': 'Não sei' }, impactScore: -5 },
    ],
  },

  // ==========================================
  // MENU (8 questions)
  // ==========================================
  {
    id: 'Q_MENU_SIZE',
    category: 'menu',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 5,
    title: { es: '¿Cuántos productos vendés activamente?', 'pt-BR': 'Quantos produtos você vende ativamente?' },
    type: 'single',
    options: [
      { id: '1-10', label: { es: '1-10 productos', 'pt-BR': '1-10 produtos' }, impactScore: 5 },
      { id: '11-30', label: { es: '11-30 productos', 'pt-BR': '11-30 produtos' }, impactScore: 10 },
      { id: '31-80', label: { es: '31-80 productos', 'pt-BR': '31-80 produtos' }, impactScore: 5 },
      { id: '80+', label: { es: 'Más de 80', 'pt-BR': 'Mais de 80' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_TOP_SELLER',
    category: 'menu',
    mode: 'both',
    dimension: 'market_fit',
    weight: 4,
    title: { es: 'Tu producto/plato estrella', 'pt-BR': 'Seu produto/prato estrela' },
    help: { es: 'El que más se vende', 'pt-BR': 'O que mais vende' },
    type: 'text',
  },
  {
    id: 'Q_MENU_DIGITAL',
    category: 'menu',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 4,
    title: { es: '¿Tenés menú digital?', 'pt-BR': 'Você tem cardápio digital?' },
    type: 'single',
    options: [
      { id: 'qr', label: { es: 'Sí, con QR', 'pt-BR': 'Sim, com QR' }, emoji: '📱', impactScore: 10 },
      { id: 'web', label: { es: 'Sí, en la web', 'pt-BR': 'Sim, no site' }, emoji: '🌐', impactScore: 10 },
      { id: 'pdf', label: { es: 'PDF/Foto', 'pt-BR': 'PDF/Foto' }, emoji: '📄', impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: -5 },
    ],
  },
  {
    id: 'Q_PRICE_UPDATE',
    category: 'menu',
    mode: 'both',
    dimension: 'pricing_position',
    weight: 8,
    title: { es: '¿Cada cuánto actualizás precios?', 'pt-BR': 'Com que frequência atualiza preços?' },
    type: 'single',
    options: [
      { id: 'weekly', label: { es: 'Semanal', 'pt-BR': 'Semanal' }, impactScore: 10 },
      { id: 'monthly', label: { es: 'Mensual', 'pt-BR': 'Mensal' }, impactScore: 15 },
      { id: 'quarterly', label: { es: 'Trimestral', 'pt-BR': 'Trimestral' }, impactScore: 5 },
      { id: 'yearly', label: { es: 'Anual', 'pt-BR': 'Anual' }, impactScore: -10 },
      { id: 'never', label: { es: 'Casi nunca', 'pt-BR': 'Quase nunca' }, impactScore: -20 },
    ],
  },
  {
    id: 'Q_KNOWS_COSTS',
    category: 'menu',
    mode: 'both',
    dimension: 'unit_economics',
    weight: 9,
    title: { es: '¿Sabés el costo de cada producto?', 'pt-BR': 'Você sabe o custo de cada produto?' },
    type: 'single',
    options: [
      { id: 'yes_all', label: { es: 'Sí, de todos', 'pt-BR': 'Sim, de todos' }, impactScore: 20 },
      { id: 'yes_some', label: { es: 'De algunos', 'pt-BR': 'De alguns' }, impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -15 },
    ],
  },
  {
    id: 'Q_MENU_ENGINEERING',
    category: 'menu',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 7,
    title: { es: '¿Sabés cuáles productos te dejan más margen?', 'pt-BR': 'Você sabe quais produtos dão mais margem?' },
    type: 'single',
    options: [
      { id: 'yes', label: { es: 'Sí, claramente', 'pt-BR': 'Sim, claramente' }, impactScore: 15 },
      { id: 'some', label: { es: 'Más o menos', 'pt-BR': 'Mais ou menos' }, impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -10 },
    ],
  },
  {
    id: 'Q_DIFFERENT_PRICES_CHANNELS',
    category: 'menu',
    mode: 'complete',
    dimension: 'pricing_position',
    weight: 6,
    title: { es: '¿Tenés precios diferentes por canal?', 'pt-BR': 'Você tem preços diferentes por canal?' },
    help: { es: 'Salón vs delivery, etc.', 'pt-BR': 'Salão vs delivery, etc.' },
    type: 'single',
    options: [
      { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, impactScore: 15 },
      { id: 'no', label: { es: 'No, mismo precio', 'pt-BR': 'Não, mesmo preço' }, impactScore: -5 },
      { id: 'planning', label: { es: 'Lo estoy pensando', 'pt-BR': 'Estou pensando' }, impactScore: 0 },
    ],
  },
  {
    id: 'Q_PROMOTIONS',
    category: 'menu',
    mode: 'complete',
    dimension: 'demand_rhythm',
    weight: 5,
    title: { es: '¿Hacés promociones regularmente?', 'pt-BR': 'Você faz promoções regularmente?' },
    type: 'single',
    options: [
      { id: 'yes_planned', label: { es: 'Sí, planificadas', 'pt-BR': 'Sim, planejadas' }, impactScore: 15 },
      { id: 'yes_random', label: { es: 'Sí, cuando puedo', 'pt-BR': 'Sim, quando posso' }, impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -5 },
    ],
  },

  // ==========================================
  // FINANCE (10 questions)
  // ==========================================
  {
    id: 'Q_FOOD_COST',
    category: 'finance',
    mode: 'both',
    dimension: 'unit_economics',
    weight: 10,
    title: { es: '% costo de insumos sobre venta', 'pt-BR': '% custo de insumos sobre venda' },
    help: { es: 'Aproximado está bien', 'pt-BR': 'Aproximado está bom' },
    type: 'slider',
    min: 10,
    max: 70,
    unit: '%',
  },
  {
    id: 'Q_LABOR_COST',
    category: 'finance',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 8,
    title: { es: '% costo de personal sobre venta', 'pt-BR': '% custo de pessoal sobre venda' },
    type: 'slider',
    min: 5,
    max: 60,
    unit: '%',
  },
  {
    id: 'Q_FIXED_COSTS_PCT',
    category: 'finance',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 7,
    title: { es: '% costos fijos (alquiler, servicios)', 'pt-BR': '% custos fixos (aluguel, contas)' },
    type: 'slider',
    min: 10,
    max: 50,
    unit: '%',
  },
  {
    id: 'Q_IS_RENTED',
    category: 'finance',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 4,
    title: { es: '¿El local es alquilado o propio?', 'pt-BR': 'O local é alugado ou próprio?' },
    type: 'single',
    options: [
      { id: 'rented', label: { es: 'Alquilado', 'pt-BR': 'Alugado' }, emoji: '🏠', impactScore: 0 },
      { id: 'owned', label: { es: 'Propio', 'pt-BR': 'Próprio' }, emoji: '🔑', impactScore: 15 },
      { id: 'shared', label: { es: 'Compartido', 'pt-BR': 'Compartilhado' }, emoji: '🤝', impactScore: 5 },
    ],
  },
  {
    id: 'Q_KNOWS_MARGINS',
    category: 'finance',
    mode: 'both',
    dimension: 'unit_economics',
    weight: 9,
    title: { es: '¿Tenés claridad sobre tu margen neto?', 'pt-BR': 'Você tem clareza sobre sua margem líquida?' },
    type: 'single',
    options: [
      { id: 'yes', label: { es: 'Sí, lo calculo', 'pt-BR': 'Sim, eu calculo' }, impactScore: 20 },
      { id: 'approx', label: { es: 'Aproximadamente', 'pt-BR': 'Aproximadamente' }, impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -15 },
    ],
  },
  {
    id: 'Q_HAS_ACCOUNTANT',
    category: 'finance',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 4,
    title: { es: '¿Tenés contador/contable?', 'pt-BR': 'Você tem contador?' },
    type: 'single',
    options: [
      { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, impactScore: 10 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -5 },
      { id: 'self', label: { es: 'Lo hago yo', 'pt-BR': 'Faço eu mesmo' }, impactScore: 0 },
    ],
  },
  {
    id: 'Q_CASH_FLOW_STRESS',
    category: 'finance',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 7,
    title: { es: '¿Tenés problemas de flujo de caja?', 'pt-BR': 'Você tem problemas de fluxo de caixa?' },
    type: 'single',
    options: [
      { id: 'never', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, impactScore: 15 },
      { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, impactScore: -5 },
      { id: 'often', label: { es: 'Seguido', 'pt-BR': 'Frequentemente' }, impactScore: -20 },
    ],
  },
  {
    id: 'Q_FINANCING_ACCESS',
    category: 'finance',
    mode: 'complete',
    dimension: 'unit_economics',
    weight: 3,
    title: { es: '¿Tenés acceso a financiamiento si lo necesitás?', 'pt-BR': 'Você tem acesso a financiamento se precisar?' },
    type: 'single',
    options: [
      { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, impactScore: 10 },
      { id: 'maybe', label: { es: 'Tal vez', 'pt-BR': 'Talvez' }, impactScore: 0 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_TAX_SITUATION',
    category: 'finance',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 3,
    title: { es: '¿Cómo es tu situación fiscal?', 'pt-BR': 'Como é sua situação fiscal?' },
    type: 'single',
    options: [
      { id: 'formal', label: { es: 'Formal/en regla', 'pt-BR': 'Formal/em dia' }, impactScore: 10 },
      { id: 'partial', label: { es: 'Parcialmente formal', 'pt-BR': 'Parcialmente formal' }, impactScore: 0 },
      { id: 'informal', label: { es: 'Informal', 'pt-BR': 'Informal' }, impactScore: -10 },
      { id: 'prefer_not', label: { es: 'Prefiero no decir', 'pt-BR': 'Prefiro não dizer' }, impactScore: 0 },
    ],
  },
  {
    id: 'Q_INVESTMENT_PLANS',
    category: 'finance',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 4,
    title: { es: '¿Tenés planes de inversión/expansión?', 'pt-BR': 'Você tem planos de investimento/expansão?' },
    type: 'single',
    options: [
      { id: 'yes_soon', label: { es: 'Sí, próximos 6 meses', 'pt-BR': 'Sim, próximos 6 meses' }, impactScore: 10 },
      { id: 'yes_year', label: { es: 'Sí, próximo año', 'pt-BR': 'Sim, próximo ano' }, impactScore: 5 },
      { id: 'no', label: { es: 'No por ahora', 'pt-BR': 'Não por agora' }, impactScore: 0 },
    ],
  },

  // ==========================================
  // TEAM (8 questions)
  // ==========================================
  {
    id: 'Q_TEAM_SIZE',
    category: 'team',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 6,
    title: { es: '¿Cuántas personas trabajan?', 'pt-BR': 'Quantas pessoas trabalham?' },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤', impactScore: 0 },
      { id: '2-5', label: { es: '2-5 personas', 'pt-BR': '2-5 pessoas' }, emoji: '👥', impactScore: 5 },
      { id: '6-15', label: { es: '6-15 personas', 'pt-BR': '6-15 pessoas' }, emoji: '👨‍👩‍👧‍👦', impactScore: 10 },
      { id: '16-30', label: { es: '16-30 personas', 'pt-BR': '16-30 pessoas' }, emoji: '🏢', impactScore: 10 },
      { id: '30+', label: { es: 'Más de 30', 'pt-BR': 'Mais de 30' }, emoji: '🏭', impactScore: 10 },
    ],
  },
  {
    id: 'Q_SHIFTS',
    category: 'team',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 5,
    title: { es: '¿Cuántos turnos de trabajo tenés?', 'pt-BR': 'Quantos turnos de trabalho você tem?' },
    type: 'single',
    options: [
      { id: '1', label: { es: '1 turno', 'pt-BR': '1 turno' }, impactScore: 0 },
      { id: '2', label: { es: '2 turnos', 'pt-BR': '2 turnos' }, impactScore: 10 },
      { id: '3+', label: { es: '3+ turnos', 'pt-BR': '3+ turnos' }, impactScore: 10 },
    ],
  },
  {
    id: 'Q_HIRING_DIFFICULTY',
    category: 'team',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 6,
    title: { es: '¿Te cuesta contratar/retener personal?', 'pt-BR': 'É difícil contratar/reter pessoal?' },
    type: 'single',
    options: [
      { id: 'no', label: { es: 'No, tengo buen equipo', 'pt-BR': 'Não, tenho bom time' }, emoji: '😊', impactScore: 15 },
      { id: 'little', label: { es: 'Un poco', 'pt-BR': 'Um pouco' }, emoji: '😐', impactScore: 0 },
      { id: 'yes', label: { es: 'Sí, me cuesta mucho', 'pt-BR': 'Sim, é bem difícil' }, emoji: '😟', impactScore: -15 },
    ],
  },
  {
    id: 'Q_TURNOVER',
    category: 'team',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 7,
    title: { es: 'Rotación de personal', 'pt-BR': 'Rotatividade de pessoal' },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Baja (gente queda años)', 'pt-BR': 'Baixa (pessoas ficam anos)' }, impactScore: 15 },
      { id: 'medium', label: { es: 'Normal', 'pt-BR': 'Normal' }, impactScore: 5 },
      { id: 'high', label: { es: 'Alta (cambian seguido)', 'pt-BR': 'Alta (mudam frequentemente)' }, impactScore: -15 },
    ],
  },
  {
    id: 'Q_TRAINING',
    category: 'team',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 5,
    title: { es: '¿Tenés proceso de capacitación?', 'pt-BR': 'Você tem processo de treinamento?' },
    type: 'single',
    options: [
      { id: 'yes_formal', label: { es: 'Sí, formal', 'pt-BR': 'Sim, formal' }, impactScore: 15 },
      { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, impactScore: 5 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_OWNER_ROLE',
    category: 'team',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 5,
    title: { es: '¿Cuál es tu rol principal?', 'pt-BR': 'Qual é seu papel principal?' },
    type: 'single',
    options: [
      { id: 'all', label: { es: 'Hago de todo', 'pt-BR': 'Faço de tudo' }, emoji: '🦸', impactScore: -5 },
      { id: 'manager', label: { es: 'Gerencio/superviso', 'pt-BR': 'Gerencio/supervisiono' }, emoji: '👔', impactScore: 10 },
      { id: 'investor', label: { es: 'Solo inversor', 'pt-BR': 'Só investidor' }, emoji: '💼', impactScore: 15 },
      { id: 'kitchen', label: { es: 'Cocina', 'pt-BR': 'Cozinha' }, emoji: '👨‍🍳', impactScore: 5 },
      { id: 'floor', label: { es: 'Atención', 'pt-BR': 'Atendimento' }, emoji: '🍽️', impactScore: 5 },
    ],
  },
  {
    id: 'Q_WORK_HOURS',
    category: 'team',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 4,
    title: { es: '¿Cuántas horas trabajás por semana en el negocio?', 'pt-BR': 'Quantas horas você trabalha por semana no negócio?' },
    type: 'single',
    options: [
      { id: 'less_20', label: { es: 'Menos de 20h', 'pt-BR': 'Menos de 20h' }, impactScore: 10 },
      { id: '20-40', label: { es: '20-40h', 'pt-BR': '20-40h' }, impactScore: 10 },
      { id: '40-60', label: { es: '40-60h', 'pt-BR': '40-60h' }, impactScore: 0 },
      { id: 'more_60', label: { es: 'Más de 60h', 'pt-BR': 'Mais de 60h' }, impactScore: -10 },
    ],
  },
  {
    id: 'Q_HAS_MANAGER',
    category: 'team',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 5,
    title: { es: '¿Tenés gerente/encargado?', 'pt-BR': 'Você tem gerente/encarregado?' },
    type: 'single',
    options: [
      { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, impactScore: 15 },
      { id: 'no_me', label: { es: 'No, yo hago todo', 'pt-BR': 'Não, eu faço tudo' }, impactScore: -10 },
      { id: 'no_small', label: { es: 'No, somos muy chicos', 'pt-BR': 'Não, somos muito pequenos' }, impactScore: 0 },
    ],
  },

  // ==========================================
  // MARKETING & REPUTATION (10 questions)
  // ==========================================
  {
    id: 'Q_SOCIAL_CHANNELS',
    category: 'marketing',
    mode: 'both',
    dimension: 'market_fit',
    weight: 6,
    title: { es: '¿En qué redes sociales estás activo?', 'pt-BR': 'Em quais redes sociais você está ativo?' },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸', impactScore: 10 },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘', impactScore: 5 },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵', impactScore: 8 },
      { id: 'whatsapp', label: { es: 'WhatsApp Business', 'pt-BR': 'WhatsApp Business' }, emoji: '💬', impactScore: 8 },
      { id: 'google', label: { es: 'Google Business', 'pt-BR': 'Google Business' }, emoji: '🔍', impactScore: 15 },
      { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌', impactScore: -10 },
    ],
  },
  {
    id: 'Q_POSTING_FREQUENCY',
    category: 'marketing',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 5,
    title: { es: 'Frecuencia de publicaciones', 'pt-BR': 'Frequência de posts' },
    type: 'single',
    options: [
      { id: 'daily', label: { es: 'Diario', 'pt-BR': 'Diário' }, impactScore: 15 },
      { id: '3x_week', label: { es: '3x por semana', 'pt-BR': '3x por semana' }, impactScore: 10 },
      { id: 'weekly', label: { es: 'Semanal', 'pt-BR': 'Semanal' }, impactScore: 5 },
      { id: 'rarely', label: { es: 'Casi nunca', 'pt-BR': 'Quase nunca' }, impactScore: -10 },
    ],
  },
  {
    id: 'Q_REVIEWS_RESPONSE',
    category: 'reputation',
    mode: 'both',
    dimension: 'market_fit',
    weight: 8,
    title: { es: '¿Respondés reseñas de clientes?', 'pt-BR': 'Você responde avaliações de clientes?' },
    type: 'single',
    options: [
      { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 20 },
      { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🤷', impactScore: 5 },
      { id: 'never', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌', impactScore: -15 },
    ],
  },
  {
    id: 'Q_REVIEWS_SOURCES',
    category: 'reputation',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 5,
    title: { es: '¿Dónde te dejan reseñas?', 'pt-BR': 'Onde deixam avaliações?' },
    type: 'multi',
    options: [
      { id: 'google', label: { es: 'Google', 'pt-BR': 'Google' }, emoji: '🔍', impactScore: 10 },
      { id: 'tripadvisor', label: { es: 'TripAdvisor', 'pt-BR': 'TripAdvisor' }, emoji: '🦉', impactScore: 8 },
      { id: 'yelp', label: { es: 'Yelp', 'pt-BR': 'Yelp' }, emoji: '⭐', countries: ['US', 'MX'], impactScore: 8 },
      { id: 'ifood', label: { es: 'iFood', 'pt-BR': 'iFood' }, emoji: '🔴', countries: ['BR'], impactScore: 8 },
      { id: 'rappi', label: { es: 'Rappi', 'pt-BR': 'Rappi' }, emoji: '🟡', impactScore: 5 },
      { id: 'none', label: { es: 'No recibo muchas', 'pt-BR': 'Não recebo muitas' }, emoji: '❌', impactScore: -5 },
    ],
  },
  {
    id: 'Q_MARKETING_BUDGET',
    category: 'marketing',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 4,
    title: { es: 'Presupuesto mensual de marketing', 'pt-BR': 'Orçamento mensal de marketing' },
    type: 'single',
    options: [
      { id: 'zero', label: { es: '$0', 'pt-BR': 'R$0' }, impactScore: -5 },
      { id: 'low', label: { es: 'Bajo (<$50k)', 'pt-BR': 'Baixo (<R$1k)' }, impactScore: 5 },
      { id: 'medium', label: { es: 'Medio ($50k-200k)', 'pt-BR': 'Médio (R$1k-5k)' }, impactScore: 10 },
      { id: 'high', label: { es: 'Alto (>$200k)', 'pt-BR': 'Alto (>R$5k)' }, impactScore: 15 },
    ],
  },
  {
    id: 'Q_LOYALTY_PROGRAM',
    category: 'marketing',
    mode: 'complete',
    dimension: 'demand_rhythm',
    weight: 5,
    title: { es: '¿Tenés programa de fidelización?', 'pt-BR': 'Você tem programa de fidelização?' },
    type: 'single',
    options: [
      { id: 'yes_digital', label: { es: 'Sí, digital', 'pt-BR': 'Sim, digital' }, impactScore: 15 },
      { id: 'yes_simple', label: { es: 'Sí, tarjeta/simple', 'pt-BR': 'Sim, cartão/simples' }, impactScore: 8 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, impactScore: -5 },
      { id: 'planning', label: { es: 'Lo estoy pensando', 'pt-BR': 'Estou pensando' }, impactScore: 0 },
    ],
  },
  {
    id: 'Q_REPEAT_CUSTOMERS',
    category: 'reputation',
    mode: 'both',
    dimension: 'market_fit',
    weight: 8,
    title: { es: '¿Qué % de clientes vuelven?', 'pt-BR': 'Qual % de clientes voltam?' },
    type: 'single',
    options: [
      { id: 'high', label: { es: 'Muchos (>50%)', 'pt-BR': 'Muitos (>50%)' }, impactScore: 20 },
      { id: 'medium', label: { es: 'Algunos (30-50%)', 'pt-BR': 'Alguns (30-50%)' }, impactScore: 10 },
      { id: 'low', label: { es: 'Pocos (<30%)', 'pt-BR': 'Poucos (<30%)' }, impactScore: -10 },
      { id: 'dont_know', label: { es: 'No sé', 'pt-BR': 'Não sei' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_CUSTOMER_SEGMENT',
    category: 'marketing',
    mode: 'both',
    dimension: 'market_fit',
    weight: 5,
    title: { es: 'Tu cliente principal hoy', 'pt-BR': 'Seu cliente principal hoje' },
    type: 'multi',
    options: [
      { id: 'families', label: { es: 'Familias', 'pt-BR': 'Famílias' }, emoji: '👨‍👩‍👧', impactScore: 5 },
      { id: 'offices', label: { es: 'Oficinas/corporativo', 'pt-BR': 'Escritórios/corporativo' }, emoji: '💼', impactScore: 8 },
      { id: 'tourists', label: { es: 'Turistas', 'pt-BR': 'Turistas' }, emoji: '✈️', impactScore: 5 },
      { id: 'students', label: { es: 'Estudiantes', 'pt-BR': 'Estudantes' }, emoji: '🎓', impactScore: 3 },
      { id: 'premium', label: { es: 'Premium/alto poder', 'pt-BR': 'Premium/alto poder' }, emoji: '💎', impactScore: 10 },
      { id: 'mass', label: { es: 'Masivo/popular', 'pt-BR': 'Massivo/popular' }, emoji: '👥', impactScore: 5 },
    ],
  },
  {
    id: 'Q_TOP_COMPLAINT',
    category: 'reputation',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 6,
    title: { es: 'Problema #1 que te reclaman', 'pt-BR': 'Problema #1 que reclamam' },
    type: 'single',
    options: [
      { id: 'time', label: { es: 'Demora', 'pt-BR': 'Demora' }, emoji: '⏱️', impactScore: -10 },
      { id: 'price', label: { es: 'Precio', 'pt-BR': 'Preço' }, emoji: '💰', impactScore: -5 },
      { id: 'quality', label: { es: 'Calidad', 'pt-BR': 'Qualidade' }, emoji: '📉', impactScore: -15 },
      { id: 'service', label: { es: 'Atención', 'pt-BR': 'Atendimento' }, emoji: '😤', impactScore: -10 },
      { id: 'errors', label: { es: 'Errores en pedido', 'pt-BR': 'Erros no pedido' }, emoji: '❌', impactScore: -10 },
      { id: 'none', label: { es: 'Casi no recibo quejas', 'pt-BR': 'Quase não recebo reclamações' }, emoji: '✅', impactScore: 15 },
    ],
  },
  {
    id: 'Q_NPS_FEEL',
    category: 'reputation',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 7,
    title: { es: '¿Tus clientes te recomendarían?', 'pt-BR': 'Seus clientes te recomendariam?' },
    type: 'single',
    options: [
      { id: 'yes_definitely', label: { es: 'Sí, seguro', 'pt-BR': 'Sim, com certeza' }, emoji: '🌟', impactScore: 20 },
      { id: 'yes_probably', label: { es: 'Probablemente', 'pt-BR': 'Provavelmente' }, emoji: '👍', impactScore: 10 },
      { id: 'maybe', label: { es: 'Tal vez', 'pt-BR': 'Talvez' }, emoji: '🤷', impactScore: 0 },
      { id: 'no', label: { es: 'No creo', 'pt-BR': 'Não acho' }, emoji: '👎', impactScore: -15 },
    ],
  },

  // ==========================================
  // GOALS (5 questions)
  // ==========================================
  {
    id: 'Q_MAIN_GOAL',
    category: 'goals',
    mode: 'both',
    dimension: 'market_fit',
    weight: 8,
    title: { es: '¿Qué querés mejorar primero (30 días)?', 'pt-BR': 'O que você quer melhorar primeiro (30 dias)?' },
    type: 'single',
    required: true,
    options: [
      { id: 'sales', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈', impactScore: 10 },
      { id: 'profit', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💰', impactScore: 10 },
      { id: 'service', label: { es: 'Mejorar servicio', 'pt-BR': 'Melhorar atendimento' }, emoji: '⭐', impactScore: 10 },
      { id: 'reputation', label: { es: 'Mejorar reputación', 'pt-BR': 'Melhorar reputação' }, emoji: '🌟', impactScore: 10 },
      { id: 'delivery', label: { es: 'Optimizar delivery', 'pt-BR': 'Otimizar delivery' }, emoji: '🛵', impactScore: 10 },
      { id: 'control', label: { es: 'Más orden/control', 'pt-BR': 'Mais ordem/controle' }, emoji: '📋', impactScore: 10 },
    ],
  },
  {
    id: 'Q_GOAL_90D',
    category: 'goals',
    mode: 'complete',
    dimension: 'market_fit',
    weight: 4,
    title: { es: 'Meta 90 días (en 1 frase)', 'pt-BR': 'Meta 90 dias (em 1 frase)' },
    help: { es: 'Ej: "+15% ventas" o "subir rating a 4.6"', 'pt-BR': 'Ex: "+15% vendas" ou "subir nota para 4,6"' },
    type: 'text',
  },
  {
    id: 'Q_BIGGEST_CHALLENGE',
    category: 'goals',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 6,
    title: { es: 'Tu mayor desafío hoy', 'pt-BR': 'Seu maior desafio hoje' },
    type: 'single',
    options: [
      { id: 'sales', label: { es: 'Conseguir más clientes', 'pt-BR': 'Conseguir mais clientes' }, impactScore: -5 },
      { id: 'costs', label: { es: 'Controlar costos', 'pt-BR': 'Controlar custos' }, impactScore: -5 },
      { id: 'team', label: { es: 'Conseguir/retener equipo', 'pt-BR': 'Conseguir/reter equipe' }, impactScore: -5 },
      { id: 'time', label: { es: 'Falta de tiempo', 'pt-BR': 'Falta de tempo' }, impactScore: -5 },
      { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, impactScore: -5 },
      { id: 'digital', label: { es: 'Transformación digital', 'pt-BR': 'Transformação digital' }, impactScore: -5 },
    ],
  },
  {
    id: 'Q_TIME_FOR_ACTIONS',
    category: 'goals',
    mode: 'complete',
    dimension: 'operational_flow',
    weight: 3,
    title: { es: '¿Cuánto tiempo podés dedicar a mejoras semanales?', 'pt-BR': 'Quanto tempo pode dedicar a melhorias semanais?' },
    type: 'single',
    options: [
      { id: 'little', label: { es: 'Poco (<2h)', 'pt-BR': 'Pouco (<2h)' }, impactScore: 0 },
      { id: 'some', label: { es: 'Algo (2-5h)', 'pt-BR': 'Algo (2-5h)' }, impactScore: 5 },
      { id: 'enough', label: { es: 'Suficiente (5-10h)', 'pt-BR': 'Suficiente (5-10h)' }, impactScore: 10 },
      { id: 'much', label: { es: 'Mucho (>10h)', 'pt-BR': 'Muito (>10h)' }, impactScore: 15 },
    ],
  },
  {
    id: 'Q_AUTOPILOT_PREFERENCE',
    category: 'goals',
    mode: 'both',
    dimension: 'operational_flow',
    weight: 3,
    title: { es: '¿Cómo preferís recibir recomendaciones?', 'pt-BR': 'Como prefere receber recomendações?' },
    type: 'single',
    options: [
      { id: 'minimal', label: { es: 'Mínimas, solo lo urgente', 'pt-BR': 'Mínimas, só urgente' }, emoji: '🔕', impactScore: 0 },
      { id: 'balanced', label: { es: 'Balanceado', 'pt-BR': 'Balanceado' }, emoji: '⚖️', impactScore: 5 },
      { id: 'proactive', label: { es: 'Proactivo, quiero todo', 'pt-BR': 'Proativo, quero tudo' }, emoji: '🚀', impactScore: 10 },
    ],
  },
];

// ============= HELPER FUNCTIONS =============

export function getQuestionsForSetup(
  countryCode: CountryCode,
  businessTypeId: string,
  setupMode: 'quick' | 'complete'
): GastroQuestion[] {
  // Get base questions with intelligent filtering
  const baseQuestions = ALL_GASTRO_QUESTIONS.filter(q => {
    // Filter by mode
    if (q.mode !== 'both' && q.mode !== setupMode) return false;
    
    // Filter by country
    if (q.countries && !q.countries.includes(countryCode)) return false;
    
    // Filter by business type if specified on question
    if (q.businessTypes && !q.businessTypes.includes(businessTypeId)) return false;
    
    // ULTRA-INTELLIGENT FILTERING: Use business type rules
    // This is where we check if a dark kitchen should see "seating capacity" questions
    if (!shouldShowQuestion(q, businessTypeId)) {
      return false;
    }
    
    return true;
  }).map(q => {
    // Filter options by country
    let filteredQuestion = { ...q };
    if (q.options) {
      filteredQuestion.options = q.options.filter(opt => 
        !opt.countries || opt.countries.includes(countryCode)
      );
    }
    
    // Apply smart option filtering based on business type
    filteredQuestion = filterQuestionOptions(filteredQuestion, businessTypeId);
    
    return filteredQuestion;
  });

  // Get type-specific questions (5-10% super-focused)
  const typeSpecific = getTypeSpecificQuestions(businessTypeId, countryCode, setupMode);
  
  // Combine: type-specific first, then general
  const allQuestions = [...typeSpecific, ...baseQuestions];
  const seen = new Set<string>();
  return allQuestions.filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

export function getCategoryLabel(categoryId: string, lang: 'es' | 'pt-BR'): string {
  return CATEGORY_LABELS[categoryId]?.[lang] || categoryId;
}

export function getQuestionCountByMode(countryCode: CountryCode, businessTypeId: string): { quick: number; complete: number } {
  const quick = getQuestionsForSetup(countryCode, businessTypeId, 'quick').length;
  const complete = getQuestionsForSetup(countryCode, businessTypeId, 'complete').length;
  return { quick, complete };
}

// ============= HEALTH SCORE ANALYZER =============

// Canonical dimension type for new 7-dimension system
export type CanonicalDimension = 'reputation' | 'profitability' | 'finances' | 'efficiency' | 'traffic' | 'team' | 'growth';

export interface HealthAnalysisResult {
  totalScore: number;
  dimensions: Record<CanonicalDimension, number | null>;
  dimensionDetails: Record<CanonicalDimension, {
    score: number;
    answeredQuestions: number;
    totalQuestions: number;
    maxPossible: number;
    sources: string[];
  }>;
  strengths: string[];
  weaknesses: string[];
  dataQuality: number;  // 0-100, how much data we have
}

// Initialize empty dimension data
function createEmptyDimensionData() {
  return { totalWeight: 0, weightedScore: 0, answered: 0, total: 0, sources: [] as string[] };
}

export function analyzeHealthFromAnswers(
  answers: Record<string, any>,
  countryCode: CountryCode,
  businessTypeId: string,
  setupMode: 'quick' | 'complete',
  googleData?: { rating?: number; reviewCount?: number; placeId?: string }
): HealthAnalysisResult {
  const questions = getQuestionsForSetup(countryCode, businessTypeId, setupMode);
  
  // Initialize dimension scores with NEW 7 dimensions
  const dimensionScores: Record<CanonicalDimension, { 
    totalWeight: number; 
    weightedScore: number;
    answered: number;
    total: number;
    sources: string[];
  }> = {
    reputation: createEmptyDimensionData(),
    profitability: createEmptyDimensionData(),
    finances: createEmptyDimensionData(),
    efficiency: createEmptyDimensionData(),
    traffic: createEmptyDimensionData(),
    team: createEmptyDimensionData(),
    growth: createEmptyDimensionData(),
  };

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Process Google data first (affects reputation)
  if (googleData?.placeId) {
    dimensionScores.reputation.sources.push('Google Business');
    dimensionScores.reputation.totalWeight += 10;
    dimensionScores.reputation.answered += 1;
    dimensionScores.reputation.total += 1;
    
    if (googleData.rating) {
      const ratingScore = (googleData.rating / 5) * 100;
      dimensionScores.reputation.weightedScore += ratingScore * 10;
      
      if (googleData.rating >= 4.3) {
        strengths.push('Excelente reputación en Google');
      } else if (googleData.rating < 3.5) {
        weaknesses.push('Rating de Google por debajo del promedio');
      }
    }
    
    if (googleData.reviewCount && googleData.reviewCount > 100) {
      dimensionScores.reputation.weightedScore += 50;
      strengths.push('Alta visibilidad en Google');
    }
  }

  // Process each question answer - map legacy dimensions to new ones
  questions.forEach(q => {
    const legacyDimension = q.dimension;
    const canonicalDimension = DIMENSION_MAPPING[legacyDimension] as CanonicalDimension;
    
    // Skip if dimension doesn't map to a canonical one
    if (!canonicalDimension || !CANONICAL_DIMENSIONS.includes(canonicalDimension as HealthDimension)) {
      return;
    }
    
    const weight = q.weight;
    const answer = answers[q.id];
    
    dimensionScores[canonicalDimension].total += 1;
    dimensionScores[canonicalDimension].totalWeight += weight;
    
    if (answer === undefined || answer === null || answer === '' || 
        (Array.isArray(answer) && answer.length === 0)) {
      return;
    }
    
    dimensionScores[canonicalDimension].answered += 1;
    dimensionScores[canonicalDimension].sources.push(q.category);
    
    let impactScore = 0;
    
    if (q.type === 'single' && q.options) {
      const selectedOption = q.options.find(opt => opt.id === answer);
      impactScore = selectedOption?.impactScore || 0;
    } else if (q.type === 'multi' && q.options && Array.isArray(answer)) {
      const selectedOptions = q.options.filter(opt => answer.includes(opt.id));
      impactScore = Math.min(20, selectedOptions.reduce((sum, opt) => sum + (opt.impactScore || 0), 0));
    } else if (q.type === 'slider' || q.type === 'number') {
      const min = q.min || 0;
      const max = q.max || 100;
      const value = Number(answer);
      
      if (q.id === 'Q_FOOD_COST') {
        impactScore = value <= 30 ? 15 : value <= 35 ? 5 : value <= 40 ? 0 : -10;
        if (value <= 28) strengths.push('Excelente control de food cost');
        if (value > 40) weaknesses.push('Food cost por encima del promedio');
      } else if (q.id === 'Q_LABOR_COST') {
        impactScore = value <= 25 ? 10 : value <= 35 ? 5 : 0;
      } else if (q.id === 'Q_CAPACITY') {
        impactScore = value > 0 ? 10 : 0;
      } else if (q.id === 'Q_DELIVERY_SHARE') {
        impactScore = value > 50 ? -5 : value > 0 ? 5 : 0;
      } else {
        const normalizedValue = (value - min) / (max - min);
        impactScore = Math.round((0.5 - Math.abs(0.5 - normalizedValue)) * 20);
      }
    }
    
    const normalizedScore = Math.max(0, Math.min(100, 50 + impactScore));
    dimensionScores[canonicalDimension].weightedScore += normalizedScore * weight;
  });

  // Calculate final dimension scores
  const dimensions: Record<CanonicalDimension, number | null> = {
    reputation: null,
    profitability: null,
    finances: null,
    efficiency: null,
    traffic: null,
    team: null,
    growth: null,
  };

  const dimensionDetails = {} as HealthAnalysisResult['dimensionDetails'];
  
  let totalAnswered = 0;
  let totalQuestions = 0;

  (Object.keys(dimensionScores) as CanonicalDimension[]).forEach(dim => {
    const data = dimensionScores[dim];
    totalAnswered += data.answered;
    totalQuestions += data.total;
    
    dimensionDetails[dim] = {
      score: data.totalWeight > 0 ? Math.round(data.weightedScore / data.totalWeight) : 50,
      answeredQuestions: data.answered,
      totalQuestions: data.total,
      maxPossible: data.totalWeight,
      sources: [...new Set(data.sources)],
    };
    
    if (data.answered >= 1 && data.totalWeight > 0) {
      dimensions[dim] = dimensionDetails[dim].score;
    }
  });

  // Calculate total score (weighted average of non-null dimensions)
  const validDimensions = Object.values(dimensions).filter((d): d is number => d !== null);
  const totalScore = validDimensions.length > 0
    ? Math.round(validDimensions.reduce((a, b) => a + b, 0) / validDimensions.length)
    : 50;

  const dataQuality = totalQuestions > 0 
    ? Math.round((totalAnswered / totalQuestions) * 100)
    : 0;

  if (strengths.length === 0 && totalScore >= 60) {
    strengths.push('Negocio en operación activa');
  }
  if (weaknesses.length === 0 && dataQuality < 50) {
    weaknesses.push('Completar más datos para diagnóstico preciso');
  }

  return {
    totalScore,
    dimensions,
    dimensionDetails,
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    dataQuality,
  };
}

// Precision score based on answered questions
export function calculatePrecisionScore(
  answers: Record<string, any>,
  countryCode: CountryCode,
  businessTypeId: string,
  setupMode: 'quick' | 'complete',
  hasGoogle: boolean
): { score: number; level: 'basic' | 'medium' | 'high' | 'pro'; answered: number; total: number } {
  const questions = getQuestionsForSetup(countryCode, businessTypeId, setupMode);
  
  let answered = 0;
  questions.forEach(q => {
    const answer = answers[q.id];
    if (answer !== undefined && answer !== null && answer !== '' && 
        !(Array.isArray(answer) && answer.length === 0)) {
      answered++;
    }
  });
  
  // Google connection adds 3 "virtual" answers
  if (hasGoogle) answered += 3;
  
  const total = questions.length + 3; // +3 for potential Google data
  const percentage = Math.round((answered / total) * 100);
  
  let level: 'basic' | 'medium' | 'high' | 'pro';
  if (percentage >= 80) level = 'pro';
  else if (percentage >= 60) level = 'high';
  else if (percentage >= 40) level = 'medium';
  else level = 'basic';
  
  return { score: percentage, level, answered, total };
}
