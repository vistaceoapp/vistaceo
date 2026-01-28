// =============================================
// BELLEZA Y PERFUMERÍA - CUESTIONARIO HIPER-PERSONALIZADO
// Cosméticos, fragancias, cuidado personal
// Quick: 15 preguntas | Complete: 70 preguntas
// =============================================

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const BELLEZA_PERFUMERIA_QUESTIONS: VistaSetupQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'BEL_ID_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es el enfoque principal de tu tienda?',
      'pt-BR': 'Qual é o foco principal da sua loja?'
    },
    type: 'single',
    options: [
      { id: 'perfumeria', label: { es: 'Perfumería/fragancias', 'pt-BR': 'Perfumaria/fragrâncias' }, impactScore: 80 },
      { id: 'cosmetica', label: { es: 'Cosmética/maquillaje', 'pt-BR': 'Cosmética/maquiagem' }, impactScore: 85 },
      { id: 'skincare', label: { es: 'Skincare/cuidado de piel', 'pt-BR': 'Skincare/cuidado da pele' }, impactScore: 90 },
      { id: 'capilar', label: { es: 'Cuidado capilar', 'pt-BR': 'Cuidado capilar' }, impactScore: 75 },
      { id: 'integral', label: { es: 'Tienda integral (todo)', 'pt-BR': 'Loja integral (tudo)' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'BEL_ID_02',
    category: 'identity',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Qué segmento de precio manejás principalmente?',
      'pt-BR': 'Que segmento de preço você trabalha principalmente?'
    },
    type: 'single',
    options: [
      { id: 'lujo', label: { es: 'Lujo/premium (Chanel, Dior)', 'pt-BR': 'Luxo/premium (Chanel, Dior)' }, impactScore: 100 },
      { id: 'prestige', label: { es: 'Prestige (Estée Lauder, Lancôme)', 'pt-BR': 'Prestige (Estée Lauder, Lancôme)' }, impactScore: 85 },
      { id: 'masstige', label: { es: 'Masstige (MAC, Clinique)', 'pt-BR': 'Masstige (MAC, Clinique)' }, impactScore: 70 },
      { id: 'masivo', label: { es: 'Masivo (L\'Oréal, Maybelline)', 'pt-BR': 'Massivo (L\'Oréal, Maybelline)' }, impactScore: 50 },
      { id: 'mixto', label: { es: 'Mix de segmentos', 'pt-BR': 'Mix de segmentos' }, impactScore: 75 }
    ],
    required: true
  },
  {
    id: 'BEL_ID_03',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Sos distribuidor autorizado de marcas?',
      'pt-BR': 'Você é distribuidor autorizado de marcas?'
    },
    type: 'single',
    options: [
      { id: 'exclusivo', label: { es: 'Sí, exclusivo de varias marcas', 'pt-BR': 'Sim, exclusivo de várias marcas' }, impactScore: 100 },
      { id: 'algunas', label: { es: 'Algunas marcas autorizadas', 'pt-BR': 'Algumas marcas autorizadas' }, impactScore: 70 },
      { id: 'mayorista', label: { es: 'Compro a mayoristas', 'pt-BR': 'Compro de atacadistas' }, impactScore: 40 },
      { id: 'mixto', label: { es: 'Mixto', 'pt-BR': 'Misto' }, impactScore: 55 }
    ]
  },

  // ========== CATÁLOGO Y PRODUCTOS ==========
  {
    id: 'BEL_OF_01',
    category: 'menu',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Cuántas referencias/SKUs manejás?',
      'pt-BR': 'Quantas referências/SKUs você gerencia?'
    },
    type: 'single',
    options: [
      { id: 'small', label: { es: 'Menos de 500', 'pt-BR': 'Menos de 500' }, impactScore: 40 },
      { id: 'medium', label: { es: '500-2000', 'pt-BR': '500-2000' }, impactScore: 60 },
      { id: 'large', label: { es: '2000-5000', 'pt-BR': '2000-5000' }, impactScore: 80 },
      { id: 'mega', label: { es: 'Más de 5000', 'pt-BR': 'Mais de 5000' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'BEL_OF_02',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Qué categoría te genera más margen?',
      'pt-BR': 'Que categoria gera mais margem?'
    },
    type: 'single',
    options: [
      { id: 'perfumes', label: { es: 'Perfumes/fragancias', 'pt-BR': 'Perfumes/fragrâncias' }, impactScore: 90 },
      { id: 'maquillaje', label: { es: 'Maquillaje', 'pt-BR': 'Maquiagem' }, impactScore: 80 },
      { id: 'skincare', label: { es: 'Skincare', 'pt-BR': 'Skincare' }, impactScore: 85 },
      { id: 'capilar', label: { es: 'Productos capilares', 'pt-BR': 'Produtos capilares' }, impactScore: 60 },
      { id: 'accesorios', label: { es: 'Accesorios (brochas, espejos)', 'pt-BR': 'Acessórios (pincéis, espelhos)' }, impactScore: 70 }
    ]
  },
  {
    id: 'BEL_OF_03',
    category: 'menu',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Ofrecés productos naturales/orgánicos?',
      'pt-BR': 'Você oferece produtos naturais/orgânicos?'
    },
    type: 'single',
    options: [
      { id: 'especializado', label: { es: 'Sí, es nuestro diferencial', 'pt-BR': 'Sim, é nosso diferencial' }, impactScore: 100 },
      { id: 'amplio', label: { es: 'Sí, buena selección', 'pt-BR': 'Sim, boa seleção' }, impactScore: 80 },
      { id: 'algunos', label: { es: 'Algunos productos', 'pt-BR': 'Alguns produtos' }, impactScore: 50 },
      { id: 'no', label: { es: 'No manejamos esa línea', 'pt-BR': 'Não trabalhamos essa linha' }, impactScore: 30 }
    ]
  },

  // ========== CLIENTE ==========
  {
    id: 'BEL_CL_01',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántos clientes atendés por día en promedio?',
      'pt-BR': 'Quantos clientes você atende por dia em média?'
    },
    type: 'number',
    min: 0,
    max: 500,
    required: true
  },
  {
    id: 'BEL_CL_02',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuál es tu perfil de cliente principal?',
      'pt-BR': 'Qual é seu perfil de cliente principal?'
    },
    type: 'single',
    options: [
      { id: 'jovenes', label: { es: 'Jóvenes (18-25)', 'pt-BR': 'Jovens (18-25)' }, impactScore: 70 },
      { id: 'adultas', label: { es: 'Adultas (25-40)', 'pt-BR': 'Adultas (25-40)' }, impactScore: 90 },
      { id: 'maduras', label: { es: 'Maduras (40+)', 'pt-BR': 'Maduras (40+)' }, impactScore: 85 },
      { id: 'mixto', label: { es: 'Mix equilibrado', 'pt-BR': 'Mix equilibrado' }, impactScore: 80 }
    ]
  },
  {
    id: 'BEL_CL_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Qué porcentaje de tus clientes son recurrentes?',
      'pt-BR': 'Que porcentagem dos seus clientes são recorrentes?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, impactScore: 100 },
      { id: 'medio', label: { es: '40-60%', 'pt-BR': '40-60%' }, impactScore: 70 },
      { id: 'bajo', label: { es: '20-40%', 'pt-BR': '20-40%' }, impactScore: 40 },
      { id: 'muy_bajo', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, impactScore: 20 }
    ]
  },

  // ========== VENTAS ==========
  {
    id: 'BEL_VE_01',
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
    max: 500000,
    required: true
  },
  {
    id: 'BEL_VE_02',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Qué porcentaje de ventas son online vs tienda física?',
      'pt-BR': 'Que porcentagem das vendas são online vs loja física?'
    },
    type: 'single',
    options: [
      { id: 'solo_fisica', label: { es: '100% tienda física', 'pt-BR': '100% loja física' }, impactScore: 50 },
      { id: 'mayoria_fisica', label: { es: '70-99% física', 'pt-BR': '70-99% física' }, impactScore: 60 },
      { id: 'equilibrado', label: { es: '50-50', 'pt-BR': '50-50' }, impactScore: 80 },
      { id: 'mayoria_online', label: { es: '70%+ online', 'pt-BR': '70%+ online' }, impactScore: 90 },
      { id: 'solo_online', label: { es: '100% online', 'pt-BR': '100% online' }, impactScore: 70 }
    ]
  },
  {
    id: 'BEL_VE_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Ofrecés asesoría personalizada de belleza?',
      'pt-BR': 'Você oferece consultoria personalizada de beleza?'
    },
    type: 'single',
    options: [
      { id: 'profesional', label: { es: 'Sí, con especialistas certificados', 'pt-BR': 'Sim, com especialistas certificados' }, impactScore: 100 },
      { id: 'equipo', label: { es: 'Sí, equipo capacitado', 'pt-BR': 'Sim, equipe capacitada' }, impactScore: 80 },
      { id: 'basico', label: { es: 'Básica', 'pt-BR': 'Básica' }, impactScore: 50 },
      { id: 'autoservicio', label: { es: 'Autoservicio', 'pt-BR': 'Autosserviço' }, impactScore: 30 }
    ]
  },

  // ========== FINANZAS ==========
  {
    id: 'BEL_FI_01',
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
      { id: 'alto', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '40-50%', 'pt-BR': '40-50%' }, impactScore: 80 },
      { id: 'normal', label: { es: '30-40%', 'pt-BR': '30-40%' }, impactScore: 60 },
      { id: 'bajo', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' }, impactScore: 30 }
    ],
    required: true
  },
  {
    id: 'BEL_FI_02',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuánto capital tenés en inventario?',
      'pt-BR': 'Quanto capital você tem em estoque?'
    },
    type: 'number',
    min: 0,
    max: 100000000
  },
  {
    id: 'BEL_FI_03',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cuál es tu rotación de inventario promedio?',
      'pt-BR': 'Qual é sua rotação de estoque média?'
    },
    type: 'single',
    options: [
      { id: 'alta', label: { es: 'Menos de 30 días', 'pt-BR': 'Menos de 30 dias' }, impactScore: 100 },
      { id: 'buena', label: { es: '30-60 días', 'pt-BR': '30-60 dias' }, impactScore: 80 },
      { id: 'normal', label: { es: '60-90 días', 'pt-BR': '60-90 dias' }, impactScore: 50 },
      { id: 'lenta', label: { es: 'Más de 90 días', 'pt-BR': 'Mais de 90 dias' }, impactScore: 20 }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'BEL_OP_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Tenés sistema de gestión de inventario?',
      'pt-BR': 'Você tem sistema de gestão de estoque?'
    },
    type: 'single',
    options: [
      { id: 'avanzado', label: { es: 'Sí, ERP completo', 'pt-BR': 'Sim, ERP completo' }, impactScore: 100 },
      { id: 'pos', label: { es: 'Sistema POS con stock', 'pt-BR': 'Sistema POS com estoque' }, impactScore: 70 },
      { id: 'basico', label: { es: 'Planillas/básico', 'pt-BR': 'Planilhas/básico' }, impactScore: 40 },
      { id: 'no', label: { es: 'No tengo sistema', 'pt-BR': 'Não tenho sistema' }, impactScore: 10 }
    ],
    required: true
  },
  {
    id: 'BEL_OP_02',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Tenés problemas de vencimiento de productos?',
      'pt-BR': 'Você tem problemas de vencimento de produtos?'
    },
    type: 'single',
    options: [
      { id: 'no', label: { es: 'No, control excelente', 'pt-BR': 'Não, controle excelente' }, impactScore: 100 },
      { id: 'minimo', label: { es: 'Mínimo (<1%)', 'pt-BR': 'Mínimo (<1%)' }, impactScore: 80 },
      { id: 'moderado', label: { es: 'Moderado (1-3%)', 'pt-BR': 'Moderado (1-3%)' }, impactScore: 50 },
      { id: 'problema', label: { es: 'Es un problema (>3%)', 'pt-BR': 'É um problema (>3%)' }, impactScore: 20 }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'BEL_EQ_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántas personas trabajan en tienda?',
      'pt-BR': 'Quantas pessoas trabalham na loja?'
    },
    type: 'number',
    min: 1,
    max: 50,
    required: true
  },
  {
    id: 'BEL_EQ_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Tu equipo tiene capacitación en productos?',
      'pt-BR': 'Sua equipe tem capacitação em produtos?'
    },
    type: 'single',
    options: [
      { id: 'continua', label: { es: 'Sí, capacitación continua de marcas', 'pt-BR': 'Sim, capacitação contínua de marcas' }, impactScore: 100 },
      { id: 'periodica', label: { es: 'Periódica', 'pt-BR': 'Periódica' }, impactScore: 70 },
      { id: 'inicial', label: { es: 'Solo al ingresar', 'pt-BR': 'Só ao entrar' }, impactScore: 40 },
      { id: 'no', label: { es: 'No tenemos programa', 'pt-BR': 'Não temos programa' }, impactScore: 20 }
    ]
  },

  // ========== MARKETING ==========
  {
    id: 'BEL_MK_01',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuáles son tus canales de marketing principales?',
      'pt-BR': 'Quais são seus canais de marketing principais?'
    },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸' },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
      { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬' },
      { id: 'email', label: { es: 'Email marketing', 'pt-BR': 'Email marketing' }, emoji: '📧' },
      { id: 'local', label: { es: 'Marketing local/boca en boca', 'pt-BR': 'Marketing local/boca a boca' }, emoji: '🗣️' }
    ],
    required: true
  },
  {
    id: 'BEL_MK_02',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Trabajás con influencers de belleza?',
      'pt-BR': 'Você trabalha com influencers de beleza?'
    },
    type: 'single',
    options: [
      { id: 'activo', label: { es: 'Sí, programa activo', 'pt-BR': 'Sim, programa ativo' }, impactScore: 100 },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, impactScore: 60 },
      { id: 'no', label: { es: 'No trabajamos con influencers', 'pt-BR': 'Não trabalhamos com influencers' }, impactScore: 30 }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'BEL_OBJ_01',
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
      { id: 'crecimiento', label: { es: 'Crecer ventas', 'pt-BR': 'Crescer vendas' }, impactScore: 80 },
      { id: 'online', label: { es: 'Potenciar canal online', 'pt-BR': 'Potenciar canal online' }, impactScore: 85 },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, impactScore: 90 },
      { id: 'expansion', label: { es: 'Abrir más locales', 'pt-BR': 'Abrir mais lojas' }, impactScore: 75 },
      { id: 'marca', label: { es: 'Desarrollar marca propia', 'pt-BR': 'Desenvolver marca própria' }, impactScore: 70 }
    ],
    required: true
  },

  // ========== RIESGOS ==========
  {
    id: 'BEL_RI_01',
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
      { id: 'competencia', label: { es: 'Competencia online/grandes cadenas', 'pt-BR': 'Concorrência online/grandes redes' }, impactScore: 70 },
      { id: 'falsificaciones', label: { es: 'Productos falsificados en el mercado', 'pt-BR': 'Produtos falsificados no mercado' }, impactScore: 60 },
      { id: 'inventario', label: { es: 'Gestión de inventario/vencimientos', 'pt-BR': 'Gestão de estoque/vencimentos' }, impactScore: 50 },
      { id: 'personal', label: { es: 'Conseguir personal capacitado', 'pt-BR': 'Conseguir pessoal capacitado' }, impactScore: 55 },
      { id: 'marcas', label: { es: 'Acceso a marcas premium', 'pt-BR': 'Acesso a marcas premium' }, impactScore: 65 }
    ],
    required: true
  }
];

export default BELLEZA_PERFUMERIA_QUESTIONS;
