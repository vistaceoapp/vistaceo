// Arquitectura e Ingeniería B2B Questions - Complete Questionnaire
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const arquitecturaQuestions: VistaSetupQuestion[] = [
  // ============================================
  // CATEGORÍA: IDENTITY (Identidad y Posicionamiento)
  // ============================================
  {
    id: 'b2b_arq_identity_001',
    category: 'identity',
    type: 'single',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el enfoque principal del estudio?',
      'pt-BR': 'Qual é o foco principal do escritório?'
    },
    options: [
      { id: 'residencial', label: { es: 'Arquitectura residencial', 'pt-BR': 'Arquitetura residencial' }, emoji: '🏠', impactScore: 7 },
      { id: 'comercial', label: { es: 'Arquitectura comercial/oficinas', 'pt-BR': 'Arquitetura comercial/escritórios' }, emoji: '🏢', impactScore: 8 },
      { id: 'industrial', label: { es: 'Proyectos industriales', 'pt-BR': 'Projetos industriais' }, emoji: '🏭', impactScore: 8 },
      { id: 'institucional', label: { es: 'Proyectos institucionales/públicos', 'pt-BR': 'Projetos institucionais/públicos' }, emoji: '🏛️', impactScore: 9 },
      { id: 'interiorismo', label: { es: 'Diseño de interiores', 'pt-BR': 'Design de interiores' }, emoji: '🎨', impactScore: 7 },
      { id: 'integral', label: { es: 'Estudio integral multi-escala', 'pt-BR': 'Escritório integral multi-escala' }, emoji: '🌟', impactScore: 10 }
    ]
  },
  {
    id: 'b2b_arq_identity_002',
    category: 'identity',
    type: 'number',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    required: true,
    title: {
      es: '¿Cuántos años de trayectoria tiene el estudio?',
      'pt-BR': 'Quantos anos de trajetória tem o escritório?'
    },
    min: 0,
    max: 100,
    unit: 'años'
  },
  {
    id: 'b2b_arq_identity_003',
    category: 'identity',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Qué servicios profesionales ofrece el estudio?',
      'pt-BR': 'Quais serviços profissionais o escritório oferece?'
    },
    options: [
      { id: 'diseno', label: { es: 'Diseño arquitectónico', 'pt-BR': 'Projeto arquitetônico' }, emoji: '📐' },
      { id: 'ingenieria', label: { es: 'Ingeniería estructural', 'pt-BR': 'Engenharia estrutural' }, emoji: '🔧' },
      { id: 'direccion', label: { es: 'Dirección de obra', 'pt-BR': 'Direção de obra' }, emoji: '👷' },
      { id: 'urbanismo', label: { es: 'Planificación urbana', 'pt-BR': 'Planejamento urbano' }, emoji: '🗺️' },
      { id: 'paisajismo', label: { es: 'Paisajismo', 'pt-BR': 'Paisagismo' }, emoji: '🌳' },
      { id: 'renders', label: { es: 'Visualización 3D/Renders', 'pt-BR': 'Visualização 3D/Renders' }, emoji: '🖼️' },
      { id: 'bim', label: { es: 'Modelado BIM', 'pt-BR': 'Modelagem BIM' }, emoji: '💻' },
      { id: 'sustentable', label: { es: 'Arquitectura sustentable', 'pt-BR': 'Arquitetura sustentável' }, emoji: '🌱' }
    ]
  },
  {
    id: 'b2b_arq_identity_004',
    category: 'identity',
    type: 'multi',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Qué certificaciones o reconocimientos tiene el estudio?',
      'pt-BR': 'Quais certificações ou reconhecimentos o escritório possui?'
    },
    options: [
      { id: 'colegio', label: { es: 'Colegio de Arquitectos', 'pt-BR': 'Conselho de Arquitetura' }, emoji: '🎓' },
      { id: 'leed', label: { es: 'Certificación LEED', 'pt-BR': 'Certificação LEED' }, emoji: '🌿' },
      { id: 'bim', label: { es: 'Certificación BIM', 'pt-BR': 'Certificação BIM' }, emoji: '💻' },
      { id: 'premios', label: { es: 'Premios de arquitectura', 'pt-BR': 'Prêmios de arquitetura' }, emoji: '🏆' },
      { id: 'publicaciones', label: { es: 'Publicaciones destacadas', 'pt-BR': 'Publicações destacadas' }, emoji: '📰' },
      { id: 'ninguna', label: { es: 'Sin certificaciones formales', 'pt-BR': 'Sem certificações formais' }, emoji: '📝' }
    ]
  },
  {
    id: 'b2b_arq_identity_005',
    category: 'identity',
    type: 'single',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Cuál es el diferenciador principal del estudio?',
      'pt-BR': 'Qual é o diferencial principal do escritório?'
    },
    options: [
      { id: 'diseno', label: { es: 'Excelencia en diseño', 'pt-BR': 'Excelência em design' }, emoji: '🎨' },
      { id: 'tecnico', label: { es: 'Rigor técnico', 'pt-BR': 'Rigor técnico' }, emoji: '📐' },
      { id: 'sustentable', label: { es: 'Enfoque sustentable', 'pt-BR': 'Foco sustentável' }, emoji: '🌱' },
      { id: 'precio', label: { es: 'Competitividad en precio', 'pt-BR': 'Competitividade em preço' }, emoji: '💰' },
      { id: 'velocidad', label: { es: 'Velocidad de entrega', 'pt-BR': 'Velocidade de entrega' }, emoji: '⚡' },
      { id: 'innovacion', label: { es: 'Innovación tecnológica', 'pt-BR': 'Inovação tecnológica' }, emoji: '🚀' }
    ]
  },

  // ============================================
  // CATEGORÍA: MENU (Servicios y Precios)
  // ============================================
  {
    id: 'b2b_arq_menu_001',
    category: 'menu',
    type: 'single',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el modelo de pricing predominante?',
      'pt-BR': 'Qual é o modelo de precificação predominante?'
    },
    options: [
      { id: 'porcentaje', label: { es: 'Porcentaje del costo de obra', 'pt-BR': 'Porcentagem do custo de obra' }, emoji: '📊' },
      { id: 'm2', label: { es: 'Precio por m²', 'pt-BR': 'Preço por m²' }, emoji: '📐' },
      { id: 'hora', label: { es: 'Por hora profesional', 'pt-BR': 'Por hora profissional' }, emoji: '⏱️' },
      { id: 'fijo', label: { es: 'Fee fijo por proyecto', 'pt-BR': 'Fee fixo por projeto' }, emoji: '💰' },
      { id: 'mixto', label: { es: 'Mixto según etapa', 'pt-BR': 'Misto conforme etapa' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_arq_menu_002',
    category: 'menu',
    type: 'single',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el fee promedio como % del costo de obra?',
      'pt-BR': 'Qual é o fee médio como % do custo de obra?'
    },
    options: [
      { id: 'bajo', label: { es: 'Menos del 5%', 'pt-BR': 'Menos de 5%' }, emoji: '💵' },
      { id: 'estandar', label: { es: '5-8%', 'pt-BR': '5-8%' }, emoji: '📊' },
      { id: 'premium', label: { es: '8-12%', 'pt-BR': '8-12%' }, emoji: '💎' },
      { id: 'alta_complejidad', label: { es: '12-15%', 'pt-BR': '12-15%' }, emoji: '🏆' },
      { id: 'top', label: { es: 'Más del 15%', 'pt-BR': 'Mais de 15%' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_arq_menu_003',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es el tamaño promedio de proyecto (m²)?',
      'pt-BR': 'Qual é o tamanho médio de projeto (m²)?'
    },
    options: [
      { id: 'pequeno', label: { es: 'Menos de 200 m²', 'pt-BR': 'Menos de 200 m²' }, emoji: '🏠' },
      { id: 'mediano_bajo', label: { es: '200-500 m²', 'pt-BR': '200-500 m²' }, emoji: '🏡' },
      { id: 'mediano', label: { es: '500-2.000 m²', 'pt-BR': '500-2.000 m²' }, emoji: '🏢' },
      { id: 'grande', label: { es: '2.000-10.000 m²', 'pt-BR': '2.000-10.000 m²' }, emoji: '🏬' },
      { id: 'muy_grande', label: { es: 'Más de 10.000 m²', 'pt-BR': 'Mais de 10.000 m²' }, emoji: '🏗️' }
    ]
  },
  {
    id: 'b2b_arq_menu_004',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Cuál es el valor promedio de proyecto?',
      'pt-BR': 'Qual é o valor médio de projeto?'
    },
    options: [
      { id: 'bajo', label: { es: 'Menos de $10k USD', 'pt-BR': 'Menos de R$ 50k' }, emoji: '💵' },
      { id: 'medio_bajo', label: { es: '$10k-30k USD', 'pt-BR': 'R$ 50k-150k' }, emoji: '💰' },
      { id: 'medio', label: { es: '$30k-100k USD', 'pt-BR': 'R$ 150k-500k' }, emoji: '💎' },
      { id: 'alto', label: { es: '$100k-300k USD', 'pt-BR': 'R$ 500k-1.5M' }, emoji: '🏆' },
      { id: 'muy_alto', label: { es: 'Más de $300k USD', 'pt-BR': 'Mais de R$ 1.5M' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_arq_menu_005',
    category: 'menu',
    type: 'slider',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Qué % de la facturación viene de dirección de obra?',
      'pt-BR': 'Qual % do faturamento vem de direção de obra?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_arq_menu_006',
    category: 'menu',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Qué servicios adicionales ofrecen?',
      'pt-BR': 'Quais serviços adicionais oferecem?'
    },
    options: [
      { id: 'tramites', label: { es: 'Gestión de permisos/trámites', 'pt-BR': 'Gestão de licenças/trâmites' }, emoji: '📋' },
      { id: 'presupuestos', label: { es: 'Estimación de costos', 'pt-BR': 'Estimativa de custos' }, emoji: '💰' },
      { id: 'licitacion', label: { es: 'Apoyo en licitaciones', 'pt-BR': 'Apoio em licitações' }, emoji: '📝' },
      { id: 'asbuilt', label: { es: 'Documentación as-built', 'pt-BR': 'Documentação as-built' }, emoji: '📐' },
      { id: 'mantenimiento', label: { es: 'Consultoría post-entrega', 'pt-BR': 'Consultoria pós-entrega' }, emoji: '🔧' }
    ]
  },

  // ============================================
  // CATEGORÍA: SALES (Ventas y Conversión)
  // ============================================
  {
    id: 'b2b_arq_sales_001',
    category: 'sales',
    type: 'single',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la principal fuente de nuevos proyectos?',
      'pt-BR': 'Qual é a principal fonte de novos projetos?'
    },
    options: [
      { id: 'referidos', label: { es: 'Referidos de clientes', 'pt-BR': 'Indicações de clientes' }, emoji: '🤝' },
      { id: 'constructoras', label: { es: 'Constructoras/desarrolladores', 'pt-BR': 'Construtoras/incorporadoras' }, emoji: '🏗️' },
      { id: 'licitaciones', label: { es: 'Licitaciones/concursos', 'pt-BR': 'Licitações/concursos' }, emoji: '📋' },
      { id: 'digital', label: { es: 'Marketing digital/web', 'pt-BR': 'Marketing digital/web' }, emoji: '💻' },
      { id: 'networking', label: { es: 'Networking profesional', 'pt-BR': 'Networking profissional' }, emoji: '👔' }
    ]
  },
  {
    id: 'b2b_arq_sales_002',
    category: 'sales',
    type: 'number',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántos proyectos nuevos inician por año?',
      'pt-BR': 'Quantos projetos novos iniciam por ano?'
    },
    min: 1,
    max: 200,
    unit: 'proyectos/año'
  },
  {
    id: 'b2b_arq_sales_003',
    category: 'sales',
    type: 'slider',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cuál es la tasa de conversión de propuestas?',
      'pt-BR': 'Qual é a taxa de conversão de propostas?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_arq_sales_004',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuánto tiempo toma cerrar un proyecto típico?',
      'pt-BR': 'Quanto tempo leva para fechar um projeto típico?'
    },
    options: [
      { id: 'rapido', label: { es: 'Menos de 2 semanas', 'pt-BR': 'Menos de 2 semanas' }, emoji: '⚡' },
      { id: 'normal', label: { es: '2-4 semanas', 'pt-BR': '2-4 semanas' }, emoji: '📅' },
      { id: 'medio', label: { es: '1-2 meses', 'pt-BR': '1-2 meses' }, emoji: '📆' },
      { id: 'largo', label: { es: '2-4 meses', 'pt-BR': '2-4 meses' }, emoji: '🗓️' },
      { id: 'muy_largo', label: { es: 'Más de 4 meses', 'pt-BR': 'Mais de 4 meses' }, emoji: '🐢' }
    ]
  },
  {
    id: 'b2b_arq_sales_005',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Participan en concursos de arquitectura?',
      'pt-BR': 'Participam em concursos de arquitetura?'
    },
    options: [
      { id: 'frecuente', label: { es: 'Sí, frecuentemente', 'pt-BR': 'Sim, frequentemente' }, emoji: '🏆' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📋' },
      { id: 'selectivo', label: { es: 'Solo concursos selectos', 'pt-BR': 'Só concursos selecionados' }, emoji: '🎯' },
      { id: 'no', label: { es: 'No participamos', 'pt-BR': 'Não participamos' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: FINANCE (Finanzas y Márgenes)
  // ============================================
  {
    id: 'b2b_arq_finance_001',
    category: 'finance',
    type: 'single',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la facturación anual del estudio?',
      'pt-BR': 'Qual é o faturamento anual do escritório?'
    },
    options: [
      { id: 'muy_chico', label: { es: 'Menos de $100k USD', 'pt-BR': 'Menos de R$ 500k' }, emoji: '🌱' },
      { id: 'chico', label: { es: '$100k-300k USD', 'pt-BR': 'R$ 500k-1.5M' }, emoji: '📈' },
      { id: 'mediano', label: { es: '$300k-800k USD', 'pt-BR': 'R$ 1.5M-4M' }, emoji: '💼' },
      { id: 'grande', label: { es: '$800k-2M USD', 'pt-BR': 'R$ 4M-10M' }, emoji: '🏆' },
      { id: 'muy_grande', label: { es: 'Más de $2M USD', 'pt-BR': 'Mais de R$ 10M' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_arq_finance_002',
    category: 'finance',
    type: 'slider',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el margen operativo del estudio?',
      'pt-BR': 'Qual é a margem operacional do escritório?'
    },
    min: 0,
    max: 50,
    unit: '%'
  },
  {
    id: 'b2b_arq_finance_003',
    category: 'finance',
    type: 'slider',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué porcentaje de la facturación son sueldos?',
      'pt-BR': 'Qual porcentagem do faturamento são salários?'
    },
    min: 20,
    max: 80,
    unit: '%'
  },
  {
    id: 'b2b_arq_finance_004',
    category: 'finance',
    type: 'single',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cómo manejan la cobranza de proyectos?',
      'pt-BR': 'Como gerenciam a cobrança de projetos?'
    },
    options: [
      { id: 'anticipo', label: { es: 'Anticipo + cuotas por avance', 'pt-BR': 'Adiantamento + parcelas por avanço' }, emoji: '📊' },
      { id: 'mensual', label: { es: 'Fee mensual fijo', 'pt-BR': 'Fee mensal fixo' }, emoji: '📅' },
      { id: 'hitos', label: { es: 'Por hitos/entregables', 'pt-BR': 'Por marcos/entregáveis' }, emoji: '🎯' },
      { id: 'final', label: { es: 'Mayormente al final', 'pt-BR': 'Maioria no final' }, emoji: '🏁' }
    ]
  },
  {
    id: 'b2b_arq_finance_005',
    category: 'finance',
    type: 'single',
    mode: 'complete',
    dimension: 'finances',
    weight: 6,
    title: {
      es: '¿Cuál es el nivel de morosidad?',
      'pt-BR': 'Qual é o nível de inadimplência?'
    },
    options: [
      { id: 'bajo', label: { es: 'Menos del 5%', 'pt-BR': 'Menos de 5%' }, emoji: '✅' },
      { id: 'moderado', label: { es: '5-15%', 'pt-BR': '5-15%' }, emoji: '⚠️' },
      { id: 'alto', label: { es: '15-30%', 'pt-BR': '15-30%' }, emoji: '🔴' },
      { id: 'critico', label: { es: 'Más del 30%', 'pt-BR': 'Mais de 30%' }, emoji: '🚨' }
    ]
  },

  // ============================================
  // CATEGORÍA: OPERATION (Operaciones)
  // ============================================
  {
    id: 'b2b_arq_operation_001',
    category: 'operation',
    type: 'multi',
    mode: 'both',
    dimension: 'efficiency',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué software de diseño utilizan?',
      'pt-BR': 'Qual software de design utilizam?'
    },
    options: [
      { id: 'autocad', label: { es: 'AutoCAD', 'pt-BR': 'AutoCAD' }, emoji: '📐' },
      { id: 'revit', label: { es: 'Revit (BIM)', 'pt-BR': 'Revit (BIM)' }, emoji: '🏗️' },
      { id: 'archicad', label: { es: 'ArchiCAD', 'pt-BR': 'ArchiCAD' }, emoji: '💻' },
      { id: 'sketchup', label: { es: 'SketchUp', 'pt-BR': 'SketchUp' }, emoji: '🎨' },
      { id: 'rhino', label: { es: 'Rhino/Grasshopper', 'pt-BR': 'Rhino/Grasshopper' }, emoji: '🔷' },
      { id: '3ds', label: { es: '3DS Max', 'pt-BR': '3DS Max' }, emoji: '🖼️' },
      { id: 'vectorworks', label: { es: 'Vectorworks', 'pt-BR': 'Vectorworks' }, emoji: '✏️' }
    ]
  },
  {
    id: 'b2b_arq_operation_002',
    category: 'operation',
    type: 'number',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿Cuántos proyectos tienen activos simultáneamente?',
      'pt-BR': 'Quantos projetos têm ativos simultaneamente?'
    },
    min: 1,
    max: 100,
    unit: 'proyectos'
  },
  {
    id: 'b2b_arq_operation_003',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Trabajan con metodología BIM?',
      'pt-BR': 'Trabalham com metodologia BIM?'
    },
    options: [
      { id: 'completo', label: { es: 'Sí, BIM completo en todos los proyectos', 'pt-BR': 'Sim, BIM completo em todos os projetos' }, emoji: '✅' },
      { id: 'parcial', label: { es: 'BIM en proyectos selectos', 'pt-BR': 'BIM em projetos selecionados' }, emoji: '📊' },
      { id: 'transicion', label: { es: 'En transición a BIM', 'pt-BR': 'Em transição para BIM' }, emoji: '🔄' },
      { id: 'no', label: { es: 'Todavía no usamos BIM', 'pt-BR': 'Ainda não usamos BIM' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_arq_operation_004',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cómo gestionan la documentación de proyectos?',
      'pt-BR': 'Como gerenciam a documentação de projetos?'
    },
    options: [
      { id: 'plataforma', label: { es: 'Plataforma de gestión (Procore, etc.)', 'pt-BR': 'Plataforma de gestão (Procore, etc.)' }, emoji: '💻' },
      { id: 'cloud', label: { es: 'Cloud colaborativo (BIM 360, etc.)', 'pt-BR': 'Cloud colaborativo (BIM 360, etc.)' }, emoji: '☁️' },
      { id: 'drive', label: { es: 'Drive/Dropbox estructurado', 'pt-BR': 'Drive/Dropbox estruturado' }, emoji: '📁' },
      { id: 'servidor', label: { es: 'Servidor local', 'pt-BR': 'Servidor local' }, emoji: '🖥️' },
      { id: 'mixto', label: { es: 'Combinación de herramientas', 'pt-BR': 'Combinação de ferramentas' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_arq_operation_005',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Tienen procesos de control de calidad formalizados?',
      'pt-BR': 'Têm processos de controle de qualidade formalizados?'
    },
    options: [
      { id: 'iso', label: { es: 'Sí, con certificación ISO', 'pt-BR': 'Sim, com certificação ISO' }, emoji: '✅' },
      { id: 'formal', label: { es: 'Procesos internos formalizados', 'pt-BR': 'Processos internos formalizados' }, emoji: '📋' },
      { id: 'basico', label: { es: 'Control básico de entregables', 'pt-BR': 'Controle básico de entregáveis' }, emoji: '📝' },
      { id: 'informal', label: { es: 'Revisión informal', 'pt-BR': 'Revisão informal' }, emoji: '👁️' }
    ]
  },

  // ============================================
  // CATEGORÍA: TEAM (Equipo)
  // ============================================
  {
    id: 'b2b_arq_team_001',
    category: 'team',
    type: 'number',
    mode: 'both',
    dimension: 'team',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuántas personas trabajan en el estudio?',
      'pt-BR': 'Quantas pessoas trabalham no escritório?'
    },
    min: 1,
    max: 500,
    unit: 'personas'
  },
  {
    id: 'b2b_arq_team_002',
    category: 'team',
    type: 'single',
    mode: 'both',
    dimension: 'team',
    weight: 9,
    title: {
      es: '¿Cómo está compuesto el equipo técnico?',
      'pt-BR': 'Como está composta a equipe técnica?'
    },
    options: [
      { id: 'arquitectos', label: { es: 'Mayormente arquitectos', 'pt-BR': 'Maioria arquitetos' }, emoji: '📐' },
      { id: 'multidisciplinario', label: { es: 'Multidisciplinario (arq + ing)', 'pt-BR': 'Multidisciplinar (arq + eng)' }, emoji: '👥' },
      { id: 'especializado', label: { es: 'Con especialistas (sustentabilidad, etc.)', 'pt-BR': 'Com especialistas (sustentabilidade, etc.)' }, emoji: '🎯' },
      { id: 'delineantes', label: { es: 'Arquitectos + dibujantes', 'pt-BR': 'Arquitetos + desenhistas' }, emoji: '✏️' }
    ]
  },
  {
    id: 'b2b_arq_team_003',
    category: 'team',
    type: 'number',
    mode: 'complete',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántos socios/directores tiene el estudio?',
      'pt-BR': 'Quantos sócios/diretores tem o escritório?'
    },
    min: 1,
    max: 20,
    unit: 'socios'
  },
  {
    id: 'b2b_arq_team_004',
    category: 'team',
    type: 'slider',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuál es la rotación anual del equipo?',
      'pt-BR': 'Qual é a rotação anual da equipe?'
    },
    min: 0,
    max: 50,
    unit: '%'
  },
  {
    id: 'b2b_arq_team_005',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cuál es la modalidad de trabajo?',
      'pt-BR': 'Qual é a modalidade de trabalho?'
    },
    options: [
      { id: 'presencial', label: { es: '100% presencial en estudio', 'pt-BR': '100% presencial no escritório' }, emoji: '🏢' },
      { id: 'hibrido', label: { es: 'Híbrido (2-3 días presencial)', 'pt-BR': 'Híbrido (2-3 dias presencial)' }, emoji: '🔄' },
      { id: 'remoto', label: { es: 'Mayormente remoto', 'pt-BR': 'Maioria remoto' }, emoji: '🏠' },
      { id: 'flexible', label: { es: 'Totalmente flexible', 'pt-BR': 'Totalmente flexível' }, emoji: '💻' }
    ]
  },
  {
    id: 'b2b_arq_team_006',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Cuál es el mayor desafío con el equipo?',
      'pt-BR': 'Qual é o maior desafio com a equipe?'
    },
    options: [
      { id: 'conseguir', label: { es: 'Conseguir talento calificado', 'pt-BR': 'Conseguir talento qualificado' }, emoji: '🔍' },
      { id: 'retener', label: { es: 'Retener al equipo', 'pt-BR': 'Reter a equipe' }, emoji: '🤝' },
      { id: 'capacitar', label: { es: 'Actualizar en nuevas tecnologías', 'pt-BR': 'Atualizar em novas tecnologias' }, emoji: '📚' },
      { id: 'productividad', label: { es: 'Mejorar productividad', 'pt-BR': 'Melhorar produtividade' }, emoji: '📈' },
      { id: 'ninguno', label: { es: 'Equipo estable', 'pt-BR': 'Equipe estável' }, emoji: '✅' }
    ]
  },

  // ============================================
  // CATEGORÍA: MARKETING (Marketing y Adquisición)
  // ============================================
  {
    id: 'b2b_arq_marketing_001',
    category: 'marketing',
    type: 'single',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuánto invierten en marketing anualmente?',
      'pt-BR': 'Quanto investem em marketing anualmente?'
    },
    options: [
      { id: 'nada', label: { es: 'Prácticamente nada', 'pt-BR': 'Praticamente nada' }, emoji: '🚫' },
      { id: 'minimo', label: { es: 'Menos de $2k USD', 'pt-BR': 'Menos de R$ 10k' }, emoji: '💵' },
      { id: 'moderado', label: { es: '$2k-10k USD', 'pt-BR': 'R$ 10k-50k' }, emoji: '📊' },
      { id: 'significativo', label: { es: '$10k-30k USD', 'pt-BR': 'R$ 50k-150k' }, emoji: '📈' },
      { id: 'alto', label: { es: 'Más de $30k USD', 'pt-BR': 'Mais de R$ 150k' }, emoji: '🚀' }
    ]
  },
  {
    id: 'b2b_arq_marketing_002',
    category: 'marketing',
    type: 'multi',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué canales de marketing utilizan?',
      'pt-BR': 'Quais canais de marketing utilizam?'
    },
    options: [
      { id: 'instagram', label: { es: 'Instagram / Pinterest', 'pt-BR': 'Instagram / Pinterest' }, emoji: '📸' },
      { id: 'linkedin', label: { es: 'LinkedIn', 'pt-BR': 'LinkedIn' }, emoji: '💼' },
      { id: 'web', label: { es: 'Sitio web con portfolio', 'pt-BR': 'Site com portfólio' }, emoji: '🌐' },
      { id: 'publicaciones', label: { es: 'Publicaciones en revistas', 'pt-BR': 'Publicações em revistas' }, emoji: '📰' },
      { id: 'premios', label: { es: 'Participación en premios', 'pt-BR': 'Participação em prêmios' }, emoji: '🏆' },
      { id: 'ninguno', label: { es: 'Sin marketing activo', 'pt-BR': 'Sem marketing ativo' }, emoji: '🚫' }
    ]
  },
  {
    id: 'b2b_arq_marketing_003',
    category: 'marketing',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Tienen portfolio digital actualizado?',
      'pt-BR': 'Têm portfólio digital atualizado?'
    },
    options: [
      { id: 'excelente', label: { es: 'Sí, profesional y actualizado', 'pt-BR': 'Sim, profissional e atualizado' }, emoji: '🌟' },
      { id: 'basico', label: { es: 'Básico pero funcional', 'pt-BR': 'Básico mas funcional' }, emoji: '📋' },
      { id: 'desactualizado', label: { es: 'Desactualizado', 'pt-BR': 'Desatualizado' }, emoji: '⏳' },
      { id: 'no', label: { es: 'No tenemos portfolio digital', 'pt-BR': 'Não temos portfólio digital' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: REPUTATION (Retención y CX)
  // ============================================
  {
    id: 'b2b_arq_reputation_001',
    category: 'reputation',
    type: 'slider',
    mode: 'both',
    dimension: 'reputation',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué porcentaje de clientes vuelve a contratar?',
      'pt-BR': 'Qual porcentagem de clientes volta a contratar?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_arq_reputation_002',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Miden satisfacción de clientes?',
      'pt-BR': 'Medem satisfação de clientes?'
    },
    options: [
      { id: 'formal', label: { es: 'Sí, encuestas formales', 'pt-BR': 'Sim, pesquisas formais' }, emoji: '📊' },
      { id: 'informal', label: { es: 'Feedback informal', 'pt-BR': 'Feedback informal' }, emoji: '💬' },
      { id: 'no', label: { es: 'No medimos', 'pt-BR': 'Não medimos' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_arq_reputation_003',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuál es el principal problema reportado por clientes?',
      'pt-BR': 'Qual é o principal problema reportado por clientes?'
    },
    options: [
      { id: 'plazos', label: { es: 'Demoras en entregas', 'pt-BR': 'Atrasos em entregas' }, emoji: '⏰' },
      { id: 'comunicacion', label: { es: 'Falta de comunicación', 'pt-BR': 'Falta de comunicação' }, emoji: '📞' },
      { id: 'cambios', label: { es: 'Dificultad con cambios', 'pt-BR': 'Dificuldade com mudanças' }, emoji: '🔄' },
      { id: 'costos', label: { es: 'Costos adicionales', 'pt-BR': 'Custos adicionais' }, emoji: '💰' },
      { id: 'ninguno', label: { es: 'Sin problemas recurrentes', 'pt-BR': 'Sem problemas recorrentes' }, emoji: '✅' }
    ]
  },

  // ============================================
  // CATEGORÍA: GOALS (Objetivos del Dueño)
  // ============================================
  {
    id: 'b2b_arq_goals_001',
    category: 'goals',
    type: 'single',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el objetivo principal para los próximos 12 meses?',
      'pt-BR': 'Qual é o objetivo principal para os próximos 12 meses?'
    },
    options: [
      { id: 'crecer', label: { es: 'Crecer en facturación', 'pt-BR': 'Crescer em faturamento' }, emoji: '📈' },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💰' },
      { id: 'posicionar', label: { es: 'Posicionar marca/reputación', 'pt-BR': 'Posicionar marca/reputação' }, emoji: '🏆' },
      { id: 'especializar', label: { es: 'Especializarse en un nicho', 'pt-BR': 'Especializar-se em um nicho' }, emoji: '🎯' },
      { id: 'tecnologia', label: { es: 'Actualizar tecnología (BIM, etc.)', 'pt-BR': 'Atualizar tecnologia (BIM, etc.)' }, emoji: '💻' },
      { id: 'equipo', label: { es: 'Fortalecer equipo', 'pt-BR': 'Fortalecer equipe' }, emoji: '👥' }
    ]
  },
  {
    id: 'b2b_arq_goals_002',
    category: 'goals',
    type: 'slider',
    mode: 'both',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuánto quieren crecer en facturación este año?',
      'pt-BR': 'Quanto querem crescer em faturamento este ano?'
    },
    min: -20,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_arq_goals_003',
    category: 'goals',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿En qué tipologías quieren expandirse?',
      'pt-BR': 'Em quais tipologias querem expandir-se?'
    },
    options: [
      { id: 'residencial_lujo', label: { es: 'Residencial de lujo', 'pt-BR': 'Residencial de luxo' }, emoji: '🏰' },
      { id: 'corporativo', label: { es: 'Oficinas corporativas', 'pt-BR': 'Escritórios corporativos' }, emoji: '🏢' },
      { id: 'hoteleria', label: { es: 'Hotelería', 'pt-BR': 'Hotelaria' }, emoji: '🏨' },
      { id: 'retail', label: { es: 'Retail/Comercial', 'pt-BR': 'Varejo/Comercial' }, emoji: '🛒' },
      { id: 'salud', label: { es: 'Equipamiento de salud', 'pt-BR': 'Equipamento de saúde' }, emoji: '🏥' },
      { id: 'industrial', label: { es: 'Industrial/Logística', 'pt-BR': 'Industrial/Logística' }, emoji: '🏭' },
      { id: 'mantener', label: { es: 'Mantener foco actual', 'pt-BR': 'Manter foco atual' }, emoji: '✅' }
    ]
  },
  {
    id: 'b2b_arq_goals_004',
    category: 'goals',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Planean inversiones en tecnología?',
      'pt-BR': 'Planejam investimentos em tecnologia?'
    },
    options: [
      { id: 'grande', label: { es: 'Sí, inversión significativa en BIM/software', 'pt-BR': 'Sim, investimento significativo em BIM/software' }, emoji: '🚀' },
      { id: 'moderada', label: { es: 'Inversión moderada', 'pt-BR': 'Investimento moderado' }, emoji: '💻' },
      { id: 'minima', label: { es: 'Solo actualizaciones', 'pt-BR': 'Só atualizações' }, emoji: '🔧' },
      { id: 'no', label: { es: 'Sin inversiones planeadas', 'pt-BR': 'Sem investimentos planejados' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_arq_goals_005',
    category: 'goals',
    type: 'text',
    mode: 'complete',
    dimension: 'growth',
    weight: 4,
    title: {
      es: '¿Cuál es el mayor desafío que enfrentan actualmente?',
      'pt-BR': 'Qual é o maior desafio que enfrentam atualmente?'
    }
  }
];
