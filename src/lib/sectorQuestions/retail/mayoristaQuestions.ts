// =============================================
// MAYORISTA / DISTRIBUIDOR - CUESTIONARIO HIPER-PERSONALIZADO
// Venta B2B, distribución, importación
// Quick: 15 preguntas | Complete: 70 preguntas
// =============================================

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const MAYORISTA_QUESTIONS: VistaSetupQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'MAY_ID_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Qué tipo de mayorista/distribuidor sos?',
      'pt-BR': 'Que tipo de atacadista/distribuidor você é?'
    },
    type: 'single',
    options: [
      { id: 'importador', label: { es: 'Importador/distribuidor exclusivo', 'pt-BR': 'Importador/distribuidor exclusivo' }, impactScore: 100 },
      { id: 'mayorista', label: { es: 'Mayorista tradicional', 'pt-BR': 'Atacadista tradicional' }, impactScore: 80 },
      { id: 'cash_carry', label: { es: 'Cash & Carry / Autoservicio', 'pt-BR': 'Cash & Carry / Autosserviço' }, impactScore: 70 },
      { id: 'fabricante', label: { es: 'Fabricante con venta directa', 'pt-BR': 'Fabricante com venda direta' }, impactScore: 90 },
      { id: 'dropshipper', label: { es: 'Dropshipper/intermediario', 'pt-BR': 'Dropshipper/intermediário' }, impactScore: 50 }
    ],
    required: true
  },
  {
    id: 'MAY_ID_02',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Qué rubros/categorías distribuís?',
      'pt-BR': 'Que categorias você distribui?'
    },
    type: 'multi',
    options: [
      { id: 'alimentos', label: { es: 'Alimentos y bebidas', 'pt-BR': 'Alimentos e bebidas' }, emoji: '🍎' },
      { id: 'limpieza', label: { es: 'Limpieza y hogar', 'pt-BR': 'Limpeza e lar' }, emoji: '🧹' },
      { id: 'electronica', label: { es: 'Electrónica/tecnología', 'pt-BR': 'Eletrônica/tecnologia' }, emoji: '📱' },
      { id: 'textil', label: { es: 'Textil/indumentaria', 'pt-BR': 'Têxtil/vestuário' }, emoji: '👕' },
      { id: 'ferreteria', label: { es: 'Ferretería/construcción', 'pt-BR': 'Ferragens/construção' }, emoji: '🔧' },
      { id: 'farmacia', label: { es: 'Farmacia/cosmética', 'pt-BR': 'Farmácia/cosméticos' }, emoji: '💊' },
      { id: 'otro', label: { es: 'Otros rubros', 'pt-BR': 'Outros ramos' }, emoji: '📦' }
    ],
    required: true
  },
  {
    id: 'MAY_ID_03',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Tenés exclusividad de alguna marca importante?',
      'pt-BR': 'Você tem exclusividade de alguma marca importante?'
    },
    type: 'single',
    options: [
      { id: 'varias', label: { es: 'Sí, varias marcas exclusivas', 'pt-BR': 'Sim, várias marcas exclusivas' }, impactScore: 100 },
      { id: 'algunas', label: { es: 'Algunas marcas', 'pt-BR': 'Algumas marcas' }, impactScore: 70 },
      { id: 'ninguna', label: { es: 'No, multimarca sin exclusividad', 'pt-BR': 'Não, multimarca sem exclusividade' }, impactScore: 40 }
    ]
  },
  {
    id: 'MAY_ID_04',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Cuál es tu área de cobertura geográfica?',
      'pt-BR': 'Qual é sua área de cobertura geográfica?'
    },
    type: 'single',
    options: [
      { id: 'local', label: { es: 'Local/ciudad', 'pt-BR': 'Local/cidade' }, impactScore: 40 },
      { id: 'regional', label: { es: 'Regional/provincial', 'pt-BR': 'Regional/estadual' }, impactScore: 60 },
      { id: 'nacional', label: { es: 'Nacional', 'pt-BR': 'Nacional' }, impactScore: 80 },
      { id: 'internacional', label: { es: 'Internacional', 'pt-BR': 'Internacional' }, impactScore: 100 }
    ]
  },

  // ========== CATÁLOGO Y PRECIOS ==========
  {
    id: 'MAY_OF_01',
    category: 'menu',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Cuántos SKUs activos manejás?',
      'pt-BR': 'Quantos SKUs ativos você gerencia?'
    },
    type: 'single',
    options: [
      { id: 'small', label: { es: 'Menos de 500', 'pt-BR': 'Menos de 500' }, impactScore: 40 },
      { id: 'medium', label: { es: '500-2000', 'pt-BR': '500-2000' }, impactScore: 60 },
      { id: 'large', label: { es: '2000-10000', 'pt-BR': '2000-10000' }, impactScore: 80 },
      { id: 'mega', label: { es: 'Más de 10000', 'pt-BR': 'Mais de 10000' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'MAY_OF_02',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu margen bruto promedio?',
      'pt-BR': 'Qual é sua margem bruta média?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 25%', 'pt-BR': 'Mais de 25%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '15-25%', 'pt-BR': '15-25%' }, impactScore: 80 },
      { id: 'normal', label: { es: '10-15%', 'pt-BR': '10-15%' }, impactScore: 60 },
      { id: 'bajo', label: { es: '5-10%', 'pt-BR': '5-10%' }, impactScore: 40 },
      { id: 'muy_bajo', label: { es: 'Menos del 5%', 'pt-BR': 'Menos de 5%' }, impactScore: 20 }
    ],
    required: true
  },
  {
    id: 'MAY_OF_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Tenés lista de precios diferenciada por tipo de cliente?',
      'pt-BR': 'Você tem lista de preços diferenciada por tipo de cliente?'
    },
    type: 'single',
    options: [
      { id: 'multiple', label: { es: 'Sí, múltiples listas', 'pt-BR': 'Sim, múltiplas listas' }, impactScore: 100 },
      { id: 'basica', label: { es: 'Básica con descuentos', 'pt-BR': 'Básica com descontos' }, impactScore: 60 },
      { id: 'unica', label: { es: 'Lista única', 'pt-BR': 'Lista única' }, impactScore: 30 }
    ]
  },
  {
    id: 'MAY_OF_04',
    category: 'sales',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Cuál es tu pedido mínimo?',
      'pt-BR': 'Qual é seu pedido mínimo?'
    },
    type: 'number',
    min: 0,
    max: 10000000
  },

  // ========== CLIENTES ==========
  {
    id: 'MAY_CL_01',
    category: 'sales',
    mode: 'both',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuántos clientes activos tenés?',
      'pt-BR': 'Quantos clientes ativos você tem?'
    },
    type: 'single',
    options: [
      { id: 'small', label: { es: 'Menos de 100', 'pt-BR': 'Menos de 100' }, impactScore: 40 },
      { id: 'medium', label: { es: '100-500', 'pt-BR': '100-500' }, impactScore: 60 },
      { id: 'large', label: { es: '500-2000', 'pt-BR': '500-2000' }, impactScore: 80 },
      { id: 'mega', label: { es: 'Más de 2000', 'pt-BR': 'Mais de 2000' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'MAY_CL_02',
    category: 'sales',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Qué tipo de clientes atendés principalmente?',
      'pt-BR': 'Que tipo de clientes você atende principalmente?'
    },
    type: 'multi',
    options: [
      { id: 'minoristas', label: { es: 'Minoristas/comercios', 'pt-BR': 'Varejistas/comércios' }, emoji: '🏪' },
      { id: 'kioscos', label: { es: 'Kioscos/almacenes', 'pt-BR': 'Bancas/armazéns' }, emoji: '🏠' },
      { id: 'supermercados', label: { es: 'Supermercados/cadenas', 'pt-BR': 'Supermercados/redes' }, emoji: '🛒' },
      { id: 'horeca', label: { es: 'HoReCa (hoteles, restaurantes)', 'pt-BR': 'HoReCa (hotéis, restaurantes)' }, emoji: '🍽️' },
      { id: 'industria', label: { es: 'Industria/fabricantes', 'pt-BR': 'Indústria/fabricantes' }, emoji: '🏭' },
      { id: 'gobierno', label: { es: 'Gobierno/instituciones', 'pt-BR': 'Governo/instituições' }, emoji: '🏛️' }
    ],
    required: true
  },
  {
    id: 'MAY_CL_03',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 8,
    title: {
      es: '¿Cuál es el ticket promedio de pedido?',
      'pt-BR': 'Qual é o ticket médio de pedido?'
    },
    type: 'number',
    min: 0,
    max: 100000000
  },
  {
    id: 'MAY_CL_04',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Cuál es tu tasa de retención de clientes anual?',
      'pt-BR': 'Qual é sua taxa de retenção de clientes anual?'
    },
    type: 'single',
    options: [
      { id: 'excelente', label: { es: 'Más del 90%', 'pt-BR': 'Mais de 90%' }, impactScore: 100 },
      { id: 'buena', label: { es: '80-90%', 'pt-BR': '80-90%' }, impactScore: 80 },
      { id: 'normal', label: { es: '70-80%', 'pt-BR': '70-80%' }, impactScore: 60 },
      { id: 'baja', label: { es: 'Menos del 70%', 'pt-BR': 'Menos de 70%' }, impactScore: 40 }
    ]
  },

  // ========== VENTAS Y FUERZA COMERCIAL ==========
  {
    id: 'MAY_VE_01',
    category: 'team',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántos vendedores/preventistas tenés?',
      'pt-BR': 'Quantos vendedores/representantes você tem?'
    },
    type: 'number',
    min: 0,
    max: 500,
    required: true
  },
  {
    id: 'MAY_VE_02',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cómo toman pedidos tus vendedores?',
      'pt-BR': 'Como seus vendedores recebem pedidos?'
    },
    type: 'single',
    options: [
      { id: 'app', label: { es: 'App móvil con sincronización', 'pt-BR': 'App móvel com sincronização' }, impactScore: 100 },
      { id: 'tablet', label: { es: 'Tablet/notebook', 'pt-BR': 'Tablet/notebook' }, impactScore: 80 },
      { id: 'papel', label: { es: 'Papel/nota manual', 'pt-BR': 'Papel/nota manual' }, impactScore: 30 },
      { id: 'telefono', label: { es: 'Teléfono/WhatsApp', 'pt-BR': 'Telefone/WhatsApp' }, impactScore: 50 }
    ]
  },
  {
    id: 'MAY_VE_03',
    category: 'marketing',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Tenés e-commerce B2B para clientes?',
      'pt-BR': 'Você tem e-commerce B2B para clientes?'
    },
    type: 'single',
    options: [
      { id: 'completo', label: { es: 'Sí, completo con precios y stock', 'pt-BR': 'Sim, completo com preços e estoque' }, impactScore: 100 },
      { id: 'basico', label: { es: 'Básico/catálogo online', 'pt-BR': 'Básico/catálogo online' }, impactScore: 60 },
      { id: 'desarrollo', label: { es: 'En desarrollo', 'pt-BR': 'Em desenvolvimento' }, impactScore: 40 },
      { id: 'no', label: { es: 'No tenemos', 'pt-BR': 'Não temos' }, impactScore: 20 }
    ]
  },
  {
    id: 'MAY_VE_04',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Con qué frecuencia visitan los vendedores a cada cliente?',
      'pt-BR': 'Com que frequência os vendedores visitam cada cliente?'
    },
    type: 'single',
    options: [
      { id: 'diario', label: { es: 'Diario/varias veces semana', 'pt-BR': 'Diário/várias vezes semana' }, impactScore: 100 },
      { id: 'semanal', label: { es: 'Semanal', 'pt-BR': 'Semanal' }, impactScore: 80 },
      { id: 'quincenal', label: { es: 'Quincenal', 'pt-BR': 'Quinzenal' }, impactScore: 60 },
      { id: 'mensual', label: { es: 'Mensual o menos', 'pt-BR': 'Mensal ou menos' }, impactScore: 40 }
    ]
  },

  // ========== FINANZAS ==========
  {
    id: 'MAY_FI_01',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    title: {
      es: '¿Cuál es tu facturación mensual promedio?',
      'pt-BR': 'Qual é seu faturamento mensal médio?'
    },
    type: 'number',
    min: 0,
    max: 1000000000,
    required: true
  },
  {
    id: 'MAY_FI_02',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Qué plazo de pago das a tus clientes en promedio?',
      'pt-BR': 'Que prazo de pagamento você dá aos seus clientes em média?'
    },
    type: 'single',
    options: [
      { id: 'contado', label: { es: 'Contado', 'pt-BR': 'À vista' }, impactScore: 100 },
      { id: '7_dias', label: { es: '7 días', 'pt-BR': '7 dias' }, impactScore: 90 },
      { id: '15_dias', label: { es: '15 días', 'pt-BR': '15 dias' }, impactScore: 75 },
      { id: '30_dias', label: { es: '30 días', 'pt-BR': '30 dias' }, impactScore: 60 },
      { id: '60_dias', label: { es: '60 días o más', 'pt-BR': '60 dias ou mais' }, impactScore: 40 }
    ],
    required: true
  },
  {
    id: 'MAY_FI_03',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuál es tu porcentaje de morosidad?',
      'pt-BR': 'Qual é sua porcentagem de inadimplência?'
    },
    type: 'single',
    options: [
      { id: 'excelente', label: { es: 'Menos del 2%', 'pt-BR': 'Menos de 2%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '2-5%', 'pt-BR': '2-5%' }, impactScore: 80 },
      { id: 'normal', label: { es: '5-10%', 'pt-BR': '5-10%' }, impactScore: 50 },
      { id: 'alto', label: { es: 'Más del 10%', 'pt-BR': 'Mais de 10%' }, impactScore: 20 }
    ],
    required: true
  },
  {
    id: 'MAY_FI_04',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cuánto capital tenés inmovilizado en inventario?',
      'pt-BR': 'Quanto capital você tem imobilizado em estoque?'
    },
    type: 'number',
    min: 0,
    max: 500000000
  },

  // ========== OPERACIONES Y LOGÍSTICA ==========
  {
    id: 'MAY_OP_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿Cuántos m² de depósito tenés?',
      'pt-BR': 'Quantos m² de depósito você tem?'
    },
    type: 'number',
    min: 0,
    max: 100000,
    unit: 'm²',
    required: true
  },
  {
    id: 'MAY_OP_02',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Tenés flota de reparto propia?',
      'pt-BR': 'Você tem frota de entrega própria?'
    },
    type: 'single',
    options: [
      { id: 'propia', label: { es: 'Sí, 100% propia', 'pt-BR': 'Sim, 100% própria' }, impactScore: 80 },
      { id: 'mixta', label: { es: 'Mixta (propia + terceros)', 'pt-BR': 'Mista (própria + terceiros)' }, impactScore: 90 },
      { id: 'terceros', label: { es: 'Solo terceros', 'pt-BR': 'Só terceiros' }, impactScore: 60 },
      { id: 'retiro', label: { es: 'Solo retiro en depósito', 'pt-BR': 'Só retirada no depósito' }, impactScore: 40 }
    ]
  },
  {
    id: 'MAY_OP_03',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Usás sistema WMS para gestión de depósito?',
      'pt-BR': 'Você usa sistema WMS para gestão de depósito?'
    },
    type: 'single',
    options: [
      { id: 'avanzado', label: { es: 'Sí, WMS avanzado', 'pt-BR': 'Sim, WMS avançado' }, impactScore: 100 },
      { id: 'basico', label: { es: 'Sistema básico', 'pt-BR': 'Sistema básico' }, impactScore: 60 },
      { id: 'excel', label: { es: 'Planillas Excel', 'pt-BR': 'Planilhas Excel' }, impactScore: 30 },
      { id: 'manual', label: { es: 'Control manual', 'pt-BR': 'Controle manual' }, impactScore: 10 }
    ]
  },
  {
    id: 'MAY_OP_04',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuántos pedidos procesás por día en promedio?',
      'pt-BR': 'Quantos pedidos você processa por dia em média?'
    },
    type: 'number',
    min: 0,
    max: 5000
  },

  // ========== EQUIPO ==========
  {
    id: 'MAY_EQ_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántos empleados tenés en total?',
      'pt-BR': 'Quantos funcionários você tem no total?'
    },
    type: 'number',
    min: 1,
    max: 1000,
    required: true
  },
  {
    id: 'MAY_EQ_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cómo está distribuido el equipo?',
      'pt-BR': 'Como está distribuída a equipe?'
    },
    type: 'text',
    help: {
      es: 'Ej: 10 ventas, 5 depósito, 3 admin',
      'pt-BR': 'Ex: 10 vendas, 5 depósito, 3 admin'
    }
  },
  {
    id: 'MAY_EQ_03',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Tenés supervisor de ventas/jefe comercial?',
      'pt-BR': 'Você tem supervisor de vendas/chefe comercial?'
    },
    type: 'single',
    options: [
      { id: 'si', label: { es: 'Sí, estructura jerárquica', 'pt-BR': 'Sim, estrutura hierárquica' }, impactScore: 100 },
      { id: 'parcial', label: { es: 'Parcialmente', 'pt-BR': 'Parcialmente' }, impactScore: 60 },
      { id: 'no', label: { es: 'No, todos reportan a gerencia', 'pt-BR': 'Não, todos reportam à gerência' }, impactScore: 30 }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'MAY_OBJ_01',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es tu objetivo principal?',
      'pt-BR': 'Qual é seu objetivo principal?'
    },
    type: 'single',
    options: [
      { id: 'expansion', label: { es: 'Expansión geográfica', 'pt-BR': 'Expansão geográfica' }, impactScore: 80 },
      { id: 'clientes', label: { es: 'Captar más clientes', 'pt-BR': 'Captar mais clientes' }, impactScore: 85 },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, impactScore: 90 },
      { id: 'eficiencia', label: { es: 'Optimizar operaciones', 'pt-BR': 'Otimizar operações' }, impactScore: 75 },
      { id: 'digital', label: { es: 'Digitalización', 'pt-BR': 'Digitalização' }, impactScore: 70 }
    ],
    required: true
  },
  {
    id: 'MAY_OBJ_02',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Planeás agregar nuevas líneas de productos?',
      'pt-BR': 'Você planeja adicionar novas linhas de produtos?'
    },
    type: 'single',
    options: [
      { id: 'si_corto', label: { es: 'Sí, en los próximos 6 meses', 'pt-BR': 'Sim, nos próximos 6 meses' }, impactScore: 100 },
      { id: 'si_largo', label: { es: 'Sí, en 1-2 años', 'pt-BR': 'Sim, em 1-2 anos' }, impactScore: 70 },
      { id: 'no', label: { es: 'No, enfocados en actual', 'pt-BR': 'Não, focados no atual' }, impactScore: 50 }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'MAY_RI_01',
    category: 'goals',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuál es tu mayor desafío actual?',
      'pt-BR': 'Qual é seu maior desafio atual?'
    },
    type: 'single',
    options: [
      { id: 'cobranzas', label: { es: 'Cobranzas/morosidad', 'pt-BR': 'Cobranças/inadimplência' }, impactScore: 70 },
      { id: 'competencia', label: { es: 'Competencia/guerra de precios', 'pt-BR': 'Concorrência/guerra de preços' }, impactScore: 60 },
      { id: 'stock', label: { es: 'Gestión de stock', 'pt-BR': 'Gestão de estoque' }, impactScore: 50 },
      { id: 'logistica', label: { es: 'Costos logísticos', 'pt-BR': 'Custos logísticos' }, impactScore: 55 },
      { id: 'proveedores', label: { es: 'Dependencia de proveedores', 'pt-BR': 'Dependência de fornecedores' }, impactScore: 65 }
    ],
    required: true
  },
  {
    id: 'MAY_RI_02',
    category: 'goals',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Qué porcentaje de tu venta depende de tu cliente más grande?',
      'pt-BR': 'Que porcentagem da sua venda depende do seu maior cliente?'
    },
    type: 'single',
    options: [
      { id: 'diversificado', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, impactScore: 100 },
      { id: 'balanceado', label: { es: '10-20%', 'pt-BR': '10-20%' }, impactScore: 70 },
      { id: 'concentrado', label: { es: '20-40%', 'pt-BR': '20-40%' }, impactScore: 40 },
      { id: 'muy_concentrado', label: { es: 'Más del 40%', 'pt-BR': 'Mais de 40%' }, impactScore: 20 }
    ]
  }
];

export default MAYORISTA_QUESTIONS;
