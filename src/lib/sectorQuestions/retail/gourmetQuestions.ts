// =============================================
// GOURMET / DELICATESSEN - CUESTIONARIO HIPER-PERSONALIZADO
// Productos gourmet, importados, delicatessen
// Quick: 15 preguntas | Complete: 70 preguntas
// =============================================

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const GOURMET_QUESTIONS: VistaSetupQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'GOU_ID_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es el enfoque principal de tu tienda gourmet?',
      'pt-BR': 'Qual é o foco principal da sua loja gourmet?'
    },
    type: 'single',
    options: [
      { id: 'importados', label: { es: 'Productos importados', 'pt-BR': 'Produtos importados' }, impactScore: 90 },
      { id: 'artesanales', label: { es: 'Productos artesanales locales', 'pt-BR': 'Produtos artesanais locais' }, impactScore: 85 },
      { id: 'vinos', label: { es: 'Vinos y bebidas premium', 'pt-BR': 'Vinhos e bebidas premium' }, impactScore: 80 },
      { id: 'quesos', label: { es: 'Quesos y fiambres', 'pt-BR': 'Queijos e frios' }, impactScore: 75 },
      { id: 'integral', label: { es: 'Delicatessen integral', 'pt-BR': 'Delicatessen integral' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'GOU_ID_02',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: {
      es: '¿Cuántos años lleva tu tienda operando?',
      'pt-BR': 'Quantos anos sua loja está operando?'
    },
    type: 'number',
    min: 0,
    max: 100,
    required: true
  },
  {
    id: 'GOU_ID_03',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Tenés alguna certificación o reconocimiento?',
      'pt-BR': 'Você tem alguma certificação ou reconhecimento?'
    },
    type: 'multi',
    options: [
      { id: 'sommelier', label: { es: 'Sommelier certificado', 'pt-BR': 'Sommelier certificado' }, emoji: '🍷' },
      { id: 'organico', label: { es: 'Certificación orgánica', 'pt-BR': 'Certificação orgânica' }, emoji: '🌿' },
      { id: 'premio', label: { es: 'Premios del sector', 'pt-BR': 'Prêmios do setor' }, emoji: '🏆' },
      { id: 'ninguna', label: { es: 'Ninguna por ahora', 'pt-BR': 'Nenhuma por agora' }, emoji: '❌' }
    ]
  },

  // ========== CATÁLOGO Y PRODUCTOS ==========
  {
    id: 'GOU_OF_01',
    category: 'menu',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Cuántas referencias/productos manejás?',
      'pt-BR': 'Quantas referências/produtos você gerencia?'
    },
    type: 'single',
    options: [
      { id: 'boutique', label: { es: 'Boutique (<200)', 'pt-BR': 'Boutique (<200)' }, impactScore: 60 },
      { id: 'mediano', label: { es: 'Mediano (200-1000)', 'pt-BR': 'Médio (200-1000)' }, impactScore: 80 },
      { id: 'amplio', label: { es: 'Amplio (1000-3000)', 'pt-BR': 'Amplo (1000-3000)' }, impactScore: 90 },
      { id: 'mega', label: { es: 'Muy amplio (+3000)', 'pt-BR': 'Muito amplo (+3000)' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'GOU_OF_02',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Qué categoría te genera más ventas?',
      'pt-BR': 'Que categoria gera mais vendas?'
    },
    type: 'single',
    options: [
      { id: 'vinos', label: { es: 'Vinos y espumantes', 'pt-BR': 'Vinhos e espumantes' }, impactScore: 90 },
      { id: 'quesos', label: { es: 'Quesos y fiambres', 'pt-BR': 'Queijos e frios' }, impactScore: 85 },
      { id: 'conservas', label: { es: 'Conservas y aceites', 'pt-BR': 'Conservas e azeites' }, impactScore: 70 },
      { id: 'chocolates', label: { es: 'Chocolates y dulces', 'pt-BR': 'Chocolates e doces' }, impactScore: 75 },
      { id: 'cafe', label: { es: 'Café y té premium', 'pt-BR': 'Café e chá premium' }, impactScore: 65 }
    ]
  },
  {
    id: 'GOU_OF_03',
    category: 'menu',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Ofrecés productos de origen controlado (DOC, DOP)?',
      'pt-BR': 'Você oferece produtos de origem controlada (DOC, DOP)?'
    },
    type: 'single',
    options: [
      { id: 'especializado', label: { es: 'Sí, es nuestro diferencial', 'pt-BR': 'Sim, é nosso diferencial' }, impactScore: 100 },
      { id: 'algunos', label: { es: 'Algunos productos selectos', 'pt-BR': 'Alguns produtos selecionados' }, impactScore: 70 },
      { id: 'pocos', label: { es: 'Muy pocos', 'pt-BR': 'Muito poucos' }, impactScore: 40 },
      { id: 'no', label: { es: 'No manejamos', 'pt-BR': 'Não trabalhamos' }, impactScore: 20 }
    ]
  },

  // ========== CLIENTE ==========
  {
    id: 'GOU_CL_01',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántos clientes atendés por semana?',
      'pt-BR': 'Quantos clientes você atende por semana?'
    },
    type: 'number',
    min: 0,
    max: 2000,
    required: true
  },
  {
    id: 'GOU_CL_02',
    category: 'sales',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Quién es tu cliente principal?',
      'pt-BR': 'Quem é seu cliente principal?'
    },
    type: 'single',
    options: [
      { id: 'particulares', label: { es: 'Consumidor final', 'pt-BR': 'Consumidor final' }, impactScore: 70 },
      { id: 'restaurantes', label: { es: 'Restaurantes/hoteles', 'pt-BR': 'Restaurantes/hotéis' }, impactScore: 90 },
      { id: 'empresas', label: { es: 'Empresas (regalos corporativos)', 'pt-BR': 'Empresas (presentes corporativos)' }, impactScore: 85 },
      { id: 'mixto', label: { es: 'Mix equilibrado', 'pt-BR': 'Mix equilibrado' }, impactScore: 100 }
    ]
  },
  {
    id: 'GOU_CL_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Armás canastas/boxes personalizadas?',
      'pt-BR': 'Você monta cestas/boxes personalizadas?'
    },
    type: 'single',
    options: [
      { id: 'especialidad', label: { es: 'Sí, es una de nuestras especialidades', 'pt-BR': 'Sim, é uma das nossas especialidades' }, impactScore: 100 },
      { id: 'disponible', label: { es: 'Sí, cuando lo piden', 'pt-BR': 'Sim, quando pedem' }, impactScore: 70 },
      { id: 'predefinidas', label: { es: 'Solo canastas predefinidas', 'pt-BR': 'Só cestas predefinidas' }, impactScore: 50 },
      { id: 'no', label: { es: 'No ofrecemos', 'pt-BR': 'Não oferecemos' }, impactScore: 30 }
    ]
  },

  // ========== VENTAS ==========
  {
    id: 'GOU_VE_01',
    category: 'sales',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu ticket promedio?',
      'pt-BR': 'Qual é seu ticket médio?'
    },
    type: 'number',
    min: 0,
    max: 1000000,
    required: true
  },
  {
    id: 'GOU_VE_02',
    category: 'sales',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Tenés degustaciones o catas?',
      'pt-BR': 'Você tem degustações ou provas?'
    },
    type: 'single',
    options: [
      { id: 'regular', label: { es: 'Sí, eventos regulares', 'pt-BR': 'Sim, eventos regulares' }, impactScore: 100 },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, impactScore: 70 },
      { id: 'permanente', label: { es: 'Degustación permanente en tienda', 'pt-BR': 'Degustação permanente na loja' }, impactScore: 90 },
      { id: 'no', label: { es: 'No hacemos', 'pt-BR': 'Não fazemos' }, impactScore: 30 }
    ]
  },
  {
    id: 'GOU_VE_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Vendés online/e-commerce?',
      'pt-BR': 'Você vende online/e-commerce?'
    },
    type: 'single',
    options: [
      { id: 'completo', label: { es: 'Sí, tienda online completa', 'pt-BR': 'Sim, loja online completa' }, impactScore: 100 },
      { id: 'basico', label: { es: 'WhatsApp/redes sociales', 'pt-BR': 'WhatsApp/redes sociais' }, impactScore: 60 },
      { id: 'marketplace', label: { es: 'En marketplaces', 'pt-BR': 'Em marketplaces' }, impactScore: 70 },
      { id: 'no', label: { es: 'Solo tienda física', 'pt-BR': 'Só loja física' }, impactScore: 40 }
    ]
  },

  // ========== FINANZAS ==========
  {
    id: 'GOU_FI_01',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu margen bruto promedio?',
      'pt-BR': 'Qual é sua margem bruta média?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 40%', 'pt-BR': 'Mais de 40%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '30-40%', 'pt-BR': '30-40%' }, impactScore: 80 },
      { id: 'normal', label: { es: '25-30%', 'pt-BR': '25-30%' }, impactScore: 60 },
      { id: 'bajo', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, impactScore: 30 }
    ],
    required: true
  },
  {
    id: 'GOU_FI_02',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuánto capital tenés invertido en stock?',
      'pt-BR': 'Quanto capital você tem investido em estoque?'
    },
    type: 'number',
    min: 0,
    max: 100000000
  },
  {
    id: 'GOU_FI_03',
    category: 'finance',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuál es tu rotación de productos perecederos?',
      'pt-BR': 'Qual é sua rotação de produtos perecíveis?'
    },
    type: 'single',
    options: [
      { id: 'diaria', label: { es: 'Diaria/semanal', 'pt-BR': 'Diária/semanal' }, impactScore: 100 },
      { id: 'quincenal', label: { es: 'Quincenal', 'pt-BR': 'Quinzenal' }, impactScore: 70 },
      { id: 'mensual', label: { es: 'Mensual', 'pt-BR': 'Mensal' }, impactScore: 50 },
      { id: 'problema', label: { es: 'Tengo problemas de merma', 'pt-BR': 'Tenho problemas de perda' }, impactScore: 20 }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'GOU_OP_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cómo gestionás la cadena de frío?',
      'pt-BR': 'Como você gerencia a cadeia de frio?'
    },
    type: 'single',
    options: [
      { id: 'profesional', label: { es: 'Cámaras y control de temperatura automatizado', 'pt-BR': 'Câmaras e controle de temperatura automatizado' }, impactScore: 100 },
      { id: 'basico', label: { es: 'Heladeras comerciales', 'pt-BR': 'Geladeiras comerciais' }, impactScore: 60 },
      { id: 'mixto', label: { es: 'Mixto según producto', 'pt-BR': 'Misto segundo produto' }, impactScore: 70 },
      { id: 'no_aplica', label: { es: 'No manejo productos fríos', 'pt-BR': 'Não trabalho produtos frios' }, impactScore: 50 }
    ],
    required: true
  },
  {
    id: 'GOU_OP_02',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Importás productos directamente?',
      'pt-BR': 'Você importa produtos diretamente?'
    },
    type: 'single',
    options: [
      { id: 'directo', label: { es: 'Sí, importación directa', 'pt-BR': 'Sim, importação direta' }, impactScore: 100 },
      { id: 'distribuidor', label: { es: 'A través de distribuidores', 'pt-BR': 'Através de distribuidores' }, impactScore: 60 },
      { id: 'mixto', label: { es: 'Mixto', 'pt-BR': 'Misto' }, impactScore: 80 },
      { id: 'local', label: { es: 'Solo productos locales', 'pt-BR': 'Só produtos locais' }, impactScore: 50 }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'GOU_EQ_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántas personas trabajan en la tienda?',
      'pt-BR': 'Quantas pessoas trabalham na loja?'
    },
    type: 'number',
    min: 1,
    max: 30,
    required: true
  },
  {
    id: 'GOU_EQ_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Tu equipo tiene conocimiento especializado (sommelier, etc)?',
      'pt-BR': 'Sua equipe tem conhecimento especializado (sommelier, etc)?'
    },
    type: 'single',
    options: [
      { id: 'certificado', label: { es: 'Sí, con certificaciones', 'pt-BR': 'Sim, com certificações' }, impactScore: 100 },
      { id: 'experiencia', label: { es: 'Mucha experiencia práctica', 'pt-BR': 'Muita experiência prática' }, impactScore: 80 },
      { id: 'basico', label: { es: 'Conocimiento básico', 'pt-BR': 'Conhecimento básico' }, impactScore: 50 },
      { id: 'no', label: { es: 'Estamos aprendiendo', 'pt-BR': 'Estamos aprendendo' }, impactScore: 30 }
    ]
  },

  // ========== MARKETING ==========
  {
    id: 'GOU_MK_01',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cómo captas nuevos clientes?',
      'pt-BR': 'Como você capta novos clientes?'
    },
    type: 'multi',
    options: [
      { id: 'recomendacion', label: { es: 'Boca en boca/recomendación', 'pt-BR': 'Boca a boca/recomendação' }, emoji: '🗣️' },
      { id: 'instagram', label: { es: 'Instagram/redes sociales', 'pt-BR': 'Instagram/redes sociais' }, emoji: '📸' },
      { id: 'eventos', label: { es: 'Eventos y catas', 'pt-BR': 'Eventos e degustações' }, emoji: '🍷' },
      { id: 'prensa', label: { es: 'Prensa gastronómica', 'pt-BR': 'Imprensa gastronômica' }, emoji: '📰' },
      { id: 'ubicacion', label: { es: 'Ubicación/tráfico peatonal', 'pt-BR': 'Localização/tráfego pedestre' }, emoji: '📍' }
    ],
    required: true
  },

  // ========== OBJETIVOS ==========
  {
    id: 'GOU_OBJ_01',
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
      { id: 'crecimiento', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, impactScore: 80 },
      { id: 'online', label: { es: 'Desarrollar canal online', 'pt-BR': 'Desenvolver canal online' }, impactScore: 85 },
      { id: 'b2b', label: { es: 'Crecer en clientes corporativos', 'pt-BR': 'Crescer em clientes corporativos' }, impactScore: 90 },
      { id: 'expansion', label: { es: 'Abrir más locales', 'pt-BR': 'Abrir mais lojas' }, impactScore: 75 },
      { id: 'importacion', label: { es: 'Importar productos exclusivos', 'pt-BR': 'Importar produtos exclusivos' }, impactScore: 70 }
    ],
    required: true
  },

  // ========== RIESGOS ==========
  {
    id: 'GOU_RI_01',
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
      { id: 'importacion', label: { es: 'Restricciones/costos de importación', 'pt-BR': 'Restrições/custos de importação' }, impactScore: 70 },
      { id: 'merma', label: { es: 'Merma de productos perecederos', 'pt-BR': 'Perda de produtos perecíveis' }, impactScore: 60 },
      { id: 'competencia', label: { es: 'Competencia de supermercados', 'pt-BR': 'Concorrência de supermercados' }, impactScore: 55 },
      { id: 'capital', label: { es: 'Capital de trabajo/stock', 'pt-BR': 'Capital de giro/estoque' }, impactScore: 65 },
      { id: 'nicho', label: { es: 'Mercado nicho pequeño', 'pt-BR': 'Mercado nicho pequeno' }, impactScore: 50 }
    ],
    required: true
  }
];

export default GOURMET_QUESTIONS;
