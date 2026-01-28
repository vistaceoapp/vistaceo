// =============================================
// SEGUNDA MANO / RE-COMMERCE - CUESTIONARIO HIPER-PERSONALIZADO
// Tiendas de usado, vintage, consignación
// Quick: 15 preguntas | Complete: 70 preguntas
// =============================================

import { GastroQuestion } from '../../gastroQuestionsEngine';

export const SEGUNDA_MANO_QUESTIONS: GastroQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'SEG_ID_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Qué tipo de productos de segunda mano vendés?',
      'pt-BR': 'Que tipo de produtos de segunda mão você vende?'
    },
    type: 'multi',
    options: [
      { id: 'ropa', label: { es: 'Ropa y accesorios', 'pt-BR': 'Roupas e acessórios' }, emoji: '👗' },
      { id: 'electronica', label: { es: 'Electrónica/tecnología', 'pt-BR': 'Eletrônica/tecnologia' }, emoji: '📱' },
      { id: 'muebles', label: { es: 'Muebles y decoración', 'pt-BR': 'Móveis e decoração' }, emoji: '🪑' },
      { id: 'libros', label: { es: 'Libros y medios', 'pt-BR': 'Livros e mídias' }, emoji: '📚' },
      { id: 'vintage', label: { es: 'Antigüedades/vintage', 'pt-BR': 'Antiguidades/vintage' }, emoji: '🕰️' },
      { id: 'lujo', label: { es: 'Artículos de lujo', 'pt-BR': 'Artigos de luxo' }, emoji: '💎' }
    ],
    required: true
  },
  {
    id: 'SEG_ID_02',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es tu modelo de negocio principal?',
      'pt-BR': 'Qual é seu modelo de negócio principal?'
    },
    type: 'single',
    options: [
      { id: 'compra_directa', label: { es: 'Compra directa al dueño', 'pt-BR': 'Compra direta do dono' }, impactScore: 80 },
      { id: 'consignacion', label: { es: 'Consignación (comisión por venta)', 'pt-BR': 'Consignação (comissão por venda)' }, impactScore: 90 },
      { id: 'mixto', label: { es: 'Mixto', 'pt-BR': 'Misto' }, impactScore: 85 },
      { id: 'intercambio', label: { es: 'Intercambio/trade-in', 'pt-BR': 'Troca/trade-in' }, impactScore: 70 }
    ],
    required: true
  },
  {
    id: 'SEG_ID_03',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Verificás autenticidad de productos de marca?',
      'pt-BR': 'Você verifica autenticidade de produtos de marca?'
    },
    type: 'single',
    options: [
      { id: 'profesional', label: { es: 'Sí, verificación profesional', 'pt-BR': 'Sim, verificação profissional' }, impactScore: 100 },
      { id: 'experiencia', label: { es: 'Por experiencia propia', 'pt-BR': 'Por experiência própria' }, impactScore: 70 },
      { id: 'basico', label: { es: 'Chequeo básico', 'pt-BR': 'Checagem básica' }, impactScore: 40 },
      { id: 'no', label: { es: 'No manejamos marcas de lujo', 'pt-BR': 'Não trabalhamos marcas de luxo' }, impactScore: 50 }
    ]
  },

  // ========== CATÁLOGO ==========
  {
    id: 'SEG_OF_01',
    category: 'menu',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Cuántos productos tenés disponibles normalmente?',
      'pt-BR': 'Quantos produtos você tem disponíveis normalmente?'
    },
    type: 'single',
    options: [
      { id: 'small', label: { es: 'Menos de 200', 'pt-BR': 'Menos de 200' }, impactScore: 40 },
      { id: 'medium', label: { es: '200-1000', 'pt-BR': '200-1000' }, impactScore: 60 },
      { id: 'large', label: { es: '1000-5000', 'pt-BR': '1000-5000' }, impactScore: 80 },
      { id: 'mega', label: { es: 'Más de 5000', 'pt-BR': 'Mais de 5000' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'SEG_OF_02',
    category: 'menu',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cuánto tiempo promedio tarda en venderse un producto?',
      'pt-BR': 'Quanto tempo em média um produto demora para vender?'
    },
    type: 'single',
    options: [
      { id: 'rapido', label: { es: 'Menos de 1 semana', 'pt-BR': 'Menos de 1 semana' }, impactScore: 100 },
      { id: 'normal', label: { es: '1-4 semanas', 'pt-BR': '1-4 semanas' }, impactScore: 80 },
      { id: 'lento', label: { es: '1-3 meses', 'pt-BR': '1-3 meses' }, impactScore: 50 },
      { id: 'muy_lento', label: { es: 'Más de 3 meses', 'pt-BR': 'Mais de 3 meses' }, impactScore: 30 }
    ]
  },
  {
    id: 'SEG_OF_03',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Qué categoría te genera más ganancia?',
      'pt-BR': 'Que categoria gera mais lucro?'
    },
    type: 'single',
    options: [
      { id: 'lujo', label: { es: 'Artículos de lujo/diseñador', 'pt-BR': 'Artigos de luxo/designer' }, impactScore: 100 },
      { id: 'vintage', label: { es: 'Vintage/coleccionables', 'pt-BR': 'Vintage/colecionáveis' }, impactScore: 90 },
      { id: 'electronica', label: { es: 'Electrónica', 'pt-BR': 'Eletrônica' }, impactScore: 75 },
      { id: 'ropa', label: { es: 'Ropa común', 'pt-BR': 'Roupas comuns' }, impactScore: 50 },
      { id: 'muebles', label: { es: 'Muebles', 'pt-BR': 'Móveis' }, impactScore: 70 }
    ]
  },

  // ========== ABASTECIMIENTO ==========
  {
    id: 'SEG_AB_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿Cómo conseguís productos para vender?',
      'pt-BR': 'Como você consegue produtos para vender?'
    },
    type: 'multi',
    options: [
      { id: 'particulares', label: { es: 'Particulares que traen', 'pt-BR': 'Particulares que trazem' }, emoji: '🚶' },
      { id: 'recoleccion', label: { es: 'Recolección a domicilio', 'pt-BR': 'Coleta em domicílio' }, emoji: '🚗' },
      { id: 'ferias', label: { es: 'Ferias/mercados', 'pt-BR': 'Feiras/mercados' }, emoji: '🏪' },
      { id: 'subastas', label: { es: 'Subastas/remates', 'pt-BR': 'Leilões' }, emoji: '🔨' },
      { id: 'lotes', label: { es: 'Compra de lotes', 'pt-BR': 'Compra de lotes' }, emoji: '📦' }
    ],
    required: true
  },
  {
    id: 'SEG_AB_02',
    category: 'operation',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué porcentaje de productos que te ofrecen aceptás?',
      'pt-BR': 'Que porcentagem de produtos que oferecem você aceita?'
    },
    type: 'single',
    options: [
      { id: 'selectivo', label: { es: 'Menos del 30% (muy selectivo)', 'pt-BR': 'Menos de 30% (muito seletivo)' }, impactScore: 100 },
      { id: 'moderado', label: { es: '30-50%', 'pt-BR': '30-50%' }, impactScore: 80 },
      { id: 'amplio', label: { es: '50-70%', 'pt-BR': '50-70%' }, impactScore: 60 },
      { id: 'casi_todo', label: { es: 'Más del 70%', 'pt-BR': 'Mais de 70%' }, impactScore: 40 }
    ]
  },

  // ========== VENTAS ==========
  {
    id: 'SEG_VE_01',
    category: 'sales',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu ticket promedio de venta?',
      'pt-BR': 'Qual é seu ticket médio de venda?'
    },
    type: 'number',
    min: 0,
    max: 500000,
    required: true
  },
  {
    id: 'SEG_VE_02',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Dónde vendés principalmente?',
      'pt-BR': 'Onde você vende principalmente?'
    },
    type: 'multi',
    options: [
      { id: 'tienda_fisica', label: { es: 'Tienda física', 'pt-BR': 'Loja física' }, emoji: '🏪' },
      { id: 'marketplace', label: { es: 'Marketplaces (ML, eBay)', 'pt-BR': 'Marketplaces (ML, OLX)' }, emoji: '🛒' },
      { id: 'instagram', label: { es: 'Instagram/redes', 'pt-BR': 'Instagram/redes' }, emoji: '📸' },
      { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬' },
      { id: 'web_propia', label: { es: 'Web propia', 'pt-BR': 'Site próprio' }, emoji: '🌐' }
    ],
    required: true
  },
  {
    id: 'SEG_VE_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Cuál es tu margen promedio (precio venta vs costo)?',
      'pt-BR': 'Qual é sua margem média (preço venda vs custo)?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 100% (duplico precio)', 'pt-BR': 'Mais de 100% (dobro preço)' }, impactScore: 100 },
      { id: 'bueno', label: { es: '50-100%', 'pt-BR': '50-100%' }, impactScore: 80 },
      { id: 'normal', label: { es: '30-50%', 'pt-BR': '30-50%' }, impactScore: 60 },
      { id: 'bajo', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' }, impactScore: 40 }
    ]
  },

  // ========== FINANZAS ==========
  {
    id: 'SEG_FI_01',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuál es tu facturación mensual promedio?',
      'pt-BR': 'Qual é seu faturamento mensal médio?'
    },
    type: 'number',
    min: 0,
    max: 50000000,
    required: true
  },
  {
    id: 'SEG_FI_02',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 8,
    title: {
      es: 'Si trabajás consignación, ¿qué comisión cobrás?',
      'pt-BR': 'Se trabalha consignação, que comissão você cobra?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 40%', 'pt-BR': 'Mais de 40%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '30-40%', 'pt-BR': '30-40%' }, impactScore: 80 },
      { id: 'normal', label: { es: '20-30%', 'pt-BR': '20-30%' }, impactScore: 60 },
      { id: 'bajo', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, impactScore: 40 },
      { id: 'no_aplica', label: { es: 'No trabajo consignación', 'pt-BR': 'Não trabalho consignação' }, impactScore: 50 }
    ]
  },
  {
    id: 'SEG_FI_03',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cuánto capital tenés invertido en stock?',
      'pt-BR': 'Quanto capital você tem investido em estoque?'
    },
    type: 'number',
    min: 0,
    max: 50000000
  },

  // ========== OPERACIONES ==========
  {
    id: 'SEG_OP_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cómo gestionás el inventario y los consignantes?',
      'pt-BR': 'Como você gerencia o estoque e os consignantes?'
    },
    type: 'single',
    options: [
      { id: 'sistema', label: { es: 'Sistema especializado de consignación', 'pt-BR': 'Sistema especializado de consignação' }, impactScore: 100 },
      { id: 'pos', label: { es: 'Sistema POS adaptado', 'pt-BR': 'Sistema POS adaptado' }, impactScore: 70 },
      { id: 'planilla', label: { es: 'Planillas Excel', 'pt-BR': 'Planilhas Excel' }, impactScore: 40 },
      { id: 'manual', label: { es: 'Control manual', 'pt-BR': 'Controle manual' }, impactScore: 20 }
    ],
    required: true
  },
  {
    id: 'SEG_OP_02',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Hacés reparaciones o restauraciones?',
      'pt-BR': 'Você faz reparos ou restaurações?'
    },
    type: 'single',
    options: [
      { id: 'si_inhouse', label: { es: 'Sí, tenemos taller propio', 'pt-BR': 'Sim, temos oficina própria' }, impactScore: 100 },
      { id: 'tercerizado', label: { es: 'Sí, tercerizado', 'pt-BR': 'Sim, terceirizado' }, impactScore: 70 },
      { id: 'basico', label: { es: 'Solo limpieza/arreglos menores', 'pt-BR': 'Só limpeza/reparos menores' }, impactScore: 50 },
      { id: 'no', label: { es: 'No, vendemos tal cual', 'pt-BR': 'Não, vendemos como está' }, impactScore: 30 }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'SEG_EQ_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántas personas trabajan en el negocio?',
      'pt-BR': 'Quantas pessoas trabalham no negócio?'
    },
    type: 'number',
    min: 1,
    max: 30,
    required: true
  },
  {
    id: 'SEG_EQ_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Tenés expertos en valuación de productos?',
      'pt-BR': 'Você tem especialistas em avaliação de produtos?'
    },
    type: 'single',
    options: [
      { id: 'experto', label: { es: 'Sí, con formación especializada', 'pt-BR': 'Sim, com formação especializada' }, impactScore: 100 },
      { id: 'experiencia', label: { es: 'Mucha experiencia práctica', 'pt-BR': 'Muita experiência prática' }, impactScore: 80 },
      { id: 'aprendiendo', label: { es: 'Estamos aprendiendo', 'pt-BR': 'Estamos aprendendo' }, impactScore: 40 }
    ]
  },

  // ========== MARKETING ==========
  {
    id: 'SEG_MK_01',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cómo promocionás tus productos?',
      'pt-BR': 'Como você promove seus produtos?'
    },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram/fotos de productos', 'pt-BR': 'Instagram/fotos de produtos' }, emoji: '📸' },
      { id: 'marketplace', label: { es: 'Listings en marketplaces', 'pt-BR': 'Anúncios em marketplaces' }, emoji: '🛒' },
      { id: 'whatsapp', label: { es: 'Grupos de WhatsApp', 'pt-BR': 'Grupos de WhatsApp' }, emoji: '💬' },
      { id: 'email', label: { es: 'Newsletter a clientes', 'pt-BR': 'Newsletter para clientes' }, emoji: '📧' },
      { id: 'local', label: { es: 'Boca en boca/local', 'pt-BR': 'Boca a boca/local' }, emoji: '🗣️' }
    ],
    required: true
  },

  // ========== OBJETIVOS ==========
  {
    id: 'SEG_OBJ_01',
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
      { id: 'volumen', label: { es: 'Aumentar volumen de productos', 'pt-BR': 'Aumentar volume de produtos' }, impactScore: 80 },
      { id: 'premium', label: { es: 'Especializarme en productos premium', 'pt-BR': 'Me especializar em produtos premium' }, impactScore: 90 },
      { id: 'online', label: { es: 'Potenciar ventas online', 'pt-BR': 'Potenciar vendas online' }, impactScore: 85 },
      { id: 'expansion', label: { es: 'Abrir más locales', 'pt-BR': 'Abrir mais lojas' }, impactScore: 75 },
      { id: 'rotacion', label: { es: 'Mejorar rotación de inventario', 'pt-BR': 'Melhorar rotação de estoque' }, impactScore: 70 }
    ],
    required: true
  },

  // ========== RIESGOS ==========
  {
    id: 'SEG_RI_01',
    category: 'goals',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuál es tu mayor desafío?',
      'pt-BR': 'Qual é seu maior desafio?'
    },
    type: 'single',
    options: [
      { id: 'abastecimiento', label: { es: 'Conseguir buenos productos', 'pt-BR': 'Conseguir bons produtos' }, impactScore: 70 },
      { id: 'valuacion', label: { es: 'Valuar correctamente', 'pt-BR': 'Avaliar corretamente' }, impactScore: 60 },
      { id: 'rotacion', label: { es: 'Productos que no se venden', 'pt-BR': 'Produtos que não vendem' }, impactScore: 55 },
      { id: 'autenticidad', label: { es: 'Verificar autenticidad', 'pt-BR': 'Verificar autenticidade' }, impactScore: 65 },
      { id: 'competencia', label: { es: 'Competencia online/apps', 'pt-BR': 'Concorrência online/apps' }, impactScore: 50 }
    ],
    required: true
  }
];

export default SEGUNDA_MANO_QUESTIONS;
