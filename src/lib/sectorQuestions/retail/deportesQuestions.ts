// =============================================
// DEPORTES Y OUTDOOR - Cuestionario Hiper-Personalizado
// Sector: A3_RETAIL | Tipo: DEPORTES_OUTDOOR
// =============================================

import { UniversalQuestion } from '../../universalQuestionsEngine';

export const DEPORTES_QUESTIONS: UniversalQuestion[] = [
  // ========== QUICK MODE (12-15 preguntas esenciales) ==========
  
  {
    id: 'DEP_Q01_PERFIL',
    category: 'identity',
    mode: 'quick',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es el enfoque principal de tu tienda deportiva?',
      'pt-BR': 'Qual é o foco principal da sua loja esportiva?'
    },
    type: 'single',
    options: [
      { id: 'multideporte', label: { es: 'Multideporte (general)', 'pt-BR': 'Multiesporte (geral)' }, emoji: '🏅' },
      { id: 'futbol', label: { es: 'Especializada en fútbol', 'pt-BR': 'Especializada em futebol' }, emoji: '⚽' },
      { id: 'running', label: { es: 'Running/atletismo', 'pt-BR': 'Corrida/atletismo' }, emoji: '🏃' },
      { id: 'fitness', label: { es: 'Fitness/gym', 'pt-BR': 'Fitness/academia' }, emoji: '💪' },
      { id: 'outdoor', label: { es: 'Outdoor/camping', 'pt-BR': 'Outdoor/camping' }, emoji: '⛺' },
      { id: 'ciclismo', label: { es: 'Ciclismo', 'pt-BR': 'Ciclismo' }, emoji: '🚴' },
      { id: 'natacion', label: { es: 'Natación/acuáticos', 'pt-BR': 'Natação/aquáticos' }, emoji: '🏊' },
      { id: 'ropa', label: { es: 'Principalmente ropa deportiva', 'pt-BR': 'Principalmente roupa esportiva' }, emoji: '👕' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q02_ANTIGUEDAD',
    category: 'identity',
    mode: 'quick',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Cuántos años lleva operando tu tienda?',
      'pt-BR': 'Há quantos anos sua loja está operando?'
    },
    type: 'single',
    options: [
      { id: 'nuevo', label: { es: 'Menos de 1 año', 'pt-BR': 'Menos de 1 ano' }, emoji: '🌱' },
      { id: '1-3', label: { es: '1 a 3 años', 'pt-BR': '1 a 3 anos' }, emoji: '🏃' },
      { id: '3-10', label: { es: '3 a 10 años', 'pt-BR': '3 a 10 anos' }, emoji: '🏅' },
      { id: '10+', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q03_MIX_PRODUCTO',
    category: 'offering',
    mode: 'quick',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu mix de productos principal?',
      'pt-BR': 'Qual é seu mix de produtos principal?'
    },
    type: 'single',
    options: [
      { id: 'calzado', label: { es: 'Principalmente calzado', 'pt-BR': 'Principalmente calçado' }, emoji: '👟' },
      { id: 'ropa', label: { es: 'Principalmente ropa', 'pt-BR': 'Principalmente roupa' }, emoji: '👕' },
      { id: 'equipamiento', label: { es: 'Equipamiento deportivo', 'pt-BR': 'Equipamento esportivo' }, emoji: '🎾' },
      { id: 'accesorios', label: { es: 'Accesorios/suplementos', 'pt-BR': 'Acessórios/suplementos' }, emoji: '🎒' },
      { id: 'balanceado', label: { es: 'Mix balanceado', 'pt-BR': 'Mix balanceado' }, emoji: '⚖️' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q04_TICKET_PROMEDIO',
    category: 'sales',
    mode: 'quick',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu ticket promedio de venta?',
      'pt-BR': 'Qual é seu ticket médio de venda?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos de $40 USD', 'pt-BR': 'Menos de R$200' }, emoji: '💵' },
      { id: 'medio_bajo', label: { es: '$40-80 USD', 'pt-BR': 'R$200-400' }, emoji: '💰' },
      { id: 'medio', label: { es: '$80-150 USD', 'pt-BR': 'R$400-750' }, emoji: '💎' },
      { id: 'alto', label: { es: '$150-300 USD', 'pt-BR': 'R$750-1500' }, emoji: '👑' },
      { id: 'muy_alto', label: { es: 'Más de $300 USD', 'pt-BR': 'Mais de R$1500' }, emoji: '🏆' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q05_CLIENTE_PRINCIPAL',
    category: 'customer',
    mode: 'quick',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Quién es tu cliente principal?',
      'pt-BR': 'Quem é seu cliente principal?'
    },
    type: 'single',
    options: [
      { id: 'amateur', label: { es: 'Deportistas amateur/recreativos', 'pt-BR': 'Esportistas amadores/recreativos' }, emoji: '🏃' },
      { id: 'profesional', label: { es: 'Deportistas profesionales/serios', 'pt-BR': 'Esportistas profissionais/sérios' }, emoji: '🏅' },
      { id: 'casual', label: { es: 'Uso casual/lifestyle', 'pt-BR': 'Uso casual/lifestyle' }, emoji: '👟' },
      { id: 'clubes', label: { es: 'Clubes/equipos', 'pt-BR': 'Clubes/times' }, emoji: '⚽' },
      { id: 'escuelas', label: { es: 'Escuelas/colegios', 'pt-BR': 'Escolas/colégios' }, emoji: '🎒' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q06_TRANSACCIONES',
    category: 'sales',
    mode: 'quick',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuántas ventas hacés en un día promedio?',
      'pt-BR': 'Quantas vendas você faz em um dia médio?'
    },
    type: 'single',
    options: [
      { id: 'muy_bajo', label: { es: 'Menos de 10', 'pt-BR': 'Menos de 10' }, emoji: '📉' },
      { id: 'bajo', label: { es: '10-30', 'pt-BR': '10-30' }, emoji: '📊' },
      { id: 'medio', label: { es: '30-60', 'pt-BR': '30-60' }, emoji: '📈' },
      { id: 'alto', label: { es: '60-100', 'pt-BR': '60-100' }, emoji: '🚀' },
      { id: 'muy_alto', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, emoji: '⭐' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q07_MARGEN',
    category: 'finances',
    mode: 'quick',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu margen bruto promedio?',
      'pt-BR': 'Qual é sua margem bruta média?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, emoji: '📉' },
      { id: 'medio_bajo', label: { es: '25-35%', 'pt-BR': '25-35%' }, emoji: '📊' },
      { id: 'medio', label: { es: '35-45%', 'pt-BR': '35-45%' }, emoji: '📈' },
      { id: 'alto', label: { es: '45-55%', 'pt-BR': '45-55%' }, emoji: '💰' },
      { id: 'muy_alto', label: { es: 'Más del 55%', 'pt-BR': 'Mais de 55%' }, emoji: '💎' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q08_MARCAS',
    category: 'offering',
    mode: 'quick',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Con qué tipo de marcas trabajás principalmente?',
      'pt-BR': 'Com que tipo de marcas você trabalha principalmente?'
    },
    type: 'single',
    options: [
      { id: 'premium', label: { es: 'Premium (Nike, Adidas, etc)', 'pt-BR': 'Premium (Nike, Adidas, etc)' }, emoji: '⭐' },
      { id: 'mix', label: { es: 'Mix premium y alternativas', 'pt-BR': 'Mix premium e alternativas' }, emoji: '⚖️' },
      { id: 'alternativas', label: { es: 'Marcas alternativas', 'pt-BR': 'Marcas alternativas' }, emoji: '🏷️' },
      { id: 'propias', label: { es: 'Marcas propias/importadas', 'pt-BR': 'Marcas próprias/importadas' }, emoji: '🏭' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q09_EQUIPO',
    category: 'team',
    mode: 'quick',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuántas personas trabajan en tu tienda?',
      'pt-BR': 'Quantas pessoas trabalham na sua loja?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
      { id: 'pequeno', label: { es: '2-4 personas', 'pt-BR': '2-4 pessoas' }, emoji: '👥' },
      { id: 'mediano', label: { es: '5-10 personas', 'pt-BR': '5-10 pessoas' }, emoji: '👨‍💼' },
      { id: 'grande', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏢' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q10_CAPTACION',
    category: 'marketing',
    mode: 'quick',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cómo llegan la mayoría de tus clientes?',
      'pt-BR': 'Como chegam a maioria dos seus clientes?'
    },
    type: 'single',
    options: [
      { id: 'ubicacion', label: { es: 'Ubicación/paso', 'pt-BR': 'Localização/passagem' }, emoji: '📍' },
      { id: 'boca_boca', label: { es: 'Recomendación', 'pt-BR': 'Recomendação' }, emoji: '🗣️' },
      { id: 'redes', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
      { id: 'clubes', label: { es: 'Convenios con clubes', 'pt-BR': 'Convênios com clubes' }, emoji: '⚽' },
      { id: 'eventos', label: { es: 'Eventos deportivos', 'pt-BR': 'Eventos esportivos' }, emoji: '🏆' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q11_SISTEMA',
    category: 'technology',
    mode: 'quick',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Qué sistema usás para gestionar ventas?',
      'pt-BR': 'Qual sistema você usa para gerenciar vendas?'
    },
    type: 'single',
    options: [
      { id: 'manual', label: { es: 'Manual/planillas', 'pt-BR': 'Manual/planilhas' }, emoji: '📝' },
      { id: 'pos_basico', label: { es: 'POS básico', 'pt-BR': 'POS básico' }, emoji: '💻' },
      { id: 'pos_completo', label: { es: 'POS con inventario', 'pt-BR': 'POS com estoque' }, emoji: '🖥️' },
      { id: 'erp', label: { es: 'Sistema ERP', 'pt-BR': 'Sistema ERP' }, emoji: '⚙️' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_Q12_OBJETIVO',
    category: 'goals',
    mode: 'quick',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es tu principal objetivo este año?',
      'pt-BR': 'Qual é seu principal objetivo este ano?'
    },
    type: 'single',
    options: [
      { id: 'ventas', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈' },
      { id: 'margen', label: { es: 'Mejorar márgenes', 'pt-BR': 'Melhorar margens' }, emoji: '💰' },
      { id: 'online', label: { es: 'Crecer en online', 'pt-BR': 'Crescer no online' }, emoji: '🛒' },
      { id: 'expansion', label: { es: 'Abrir sucursal', 'pt-BR': 'Abrir filial' }, emoji: '🏪' },
      { id: 'especializacion', label: { es: 'Especializarme más', 'pt-BR': 'Especializar-me mais' }, emoji: '🎯' }
    ],
    required: true,
    businessTypes: ['DEPORTES_OUTDOOR']
  },

  // ========== COMPLETE MODE (55+ preguntas adicionales) ==========

  {
    id: 'DEP_C01_DIFERENCIADOR',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Qué te diferencia de la competencia?',
      'pt-BR': 'O que te diferencia da concorrência?'
    },
    type: 'multi',
    options: [
      { id: 'variedad', label: { es: 'Mayor variedad', 'pt-BR': 'Maior variedade' }, emoji: '📦' },
      { id: 'especializacion', label: { es: 'Especialización', 'pt-BR': 'Especialização' }, emoji: '🎯' },
      { id: 'precios', label: { es: 'Mejores precios', 'pt-BR': 'Melhores preços' }, emoji: '💰' },
      { id: 'atencion', label: { es: 'Atención experta', 'pt-BR': 'Atendimento especialista' }, emoji: '🤝' },
      { id: 'exclusivas', label: { es: 'Productos exclusivos', 'pt-BR': 'Produtos exclusivos' }, emoji: '⭐' },
      { id: 'servicio_tecnico', label: { es: 'Servicio técnico', 'pt-BR': 'Serviço técnico' }, emoji: '🔧' },
      { id: 'comunidad', label: { es: 'Comunidad/eventos', 'pt-BR': 'Comunidade/eventos' }, emoji: '👥' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C02_DEPORTES_TOP',
    category: 'offering',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Qué deportes representan más ventas?',
      'pt-BR': 'Quais esportes representam mais vendas?'
    },
    type: 'multi',
    options: [
      { id: 'futbol', label: { es: 'Fútbol', 'pt-BR': 'Futebol' }, emoji: '⚽' },
      { id: 'running', label: { es: 'Running/atletismo', 'pt-BR': 'Corrida/atletismo' }, emoji: '🏃' },
      { id: 'fitness', label: { es: 'Fitness/gym', 'pt-BR': 'Fitness/academia' }, emoji: '💪' },
      { id: 'tenis', label: { es: 'Tenis/padel', 'pt-BR': 'Tênis/padel' }, emoji: '🎾' },
      { id: 'natacion', label: { es: 'Natación', 'pt-BR': 'Natação' }, emoji: '🏊' },
      { id: 'ciclismo', label: { es: 'Ciclismo', 'pt-BR': 'Ciclismo' }, emoji: '🚴' },
      { id: 'outdoor', label: { es: 'Outdoor/camping', 'pt-BR': 'Outdoor/camping' }, emoji: '⛺' },
      { id: 'basket', label: { es: 'Básquet', 'pt-BR': 'Basquete' }, emoji: '🏀' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C03_SERVICIOS',
    category: 'offering',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Qué servicios adicionales ofrecés?',
      'pt-BR': 'Quais serviços adicionais você oferece?'
    },
    type: 'multi',
    options: [
      { id: 'estampado', label: { es: 'Estampado/personalización', 'pt-BR': 'Estampagem/personalização' }, emoji: '👕' },
      { id: 'reparacion', label: { es: 'Reparación equipamiento', 'pt-BR': 'Reparo equipamento' }, emoji: '🔧' },
      { id: 'alquiler', label: { es: 'Alquiler de equipos', 'pt-BR': 'Aluguel de equipamentos' }, emoji: '📦' },
      { id: 'asesoramiento', label: { es: 'Asesoramiento técnico', 'pt-BR': 'Assessoria técnica' }, emoji: '💡' },
      { id: 'encordado', label: { es: 'Encordado raquetas', 'pt-BR': 'Encordoamento raquetes' }, emoji: '🎾' },
      { id: 'ninguno', label: { es: 'Solo venta', 'pt-BR': 'Só venda' }, emoji: '🏪' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C04_SKU',
    category: 'offering',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Cuántos productos diferentes manejás?',
      'pt-BR': 'Quantos produtos diferentes você gerencia?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos de 500', 'pt-BR': 'Menos de 500' }, emoji: '📦' },
      { id: 'medio', label: { es: '500-2,000', 'pt-BR': '500-2.000' }, emoji: '📚' },
      { id: 'alto', label: { es: '2,000-5,000', 'pt-BR': '2.000-5.000' }, emoji: '🏪' },
      { id: 'muy_alto', label: { es: 'Más de 5,000', 'pt-BR': 'Mais de 5.000' }, emoji: '🏬' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C05_UNIFORMES',
    category: 'offering',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Vendés uniformes para equipos/clubes?',
      'pt-BR': 'Você vende uniformes para times/clubes?'
    },
    type: 'single',
    options: [
      { id: 'principal', label: { es: 'Sí, es parte importante', 'pt-BR': 'Sim, é parte importante' }, emoji: '⚽' },
      { id: 'complemento', label: { es: 'Sí, como complemento', 'pt-BR': 'Sim, como complemento' }, emoji: '👕' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'no', label: { es: 'No trabajo con uniformes', 'pt-BR': 'Não trabalho com uniformes' }, emoji: '❌' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C06_PERFIL_DEPORTISTA',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué nivel de deportista comprá más?',
      'pt-BR': 'Qual nível de esportista compra mais?'
    },
    type: 'single',
    options: [
      { id: 'principiante', label: { es: 'Principiantes', 'pt-BR': 'Iniciantes' }, emoji: '🌱' },
      { id: 'recreativo', label: { es: 'Recreativos regulares', 'pt-BR': 'Recreativos regulares' }, emoji: '🏃' },
      { id: 'amateur', label: { es: 'Amateur competitivo', 'pt-BR': 'Amador competitivo' }, emoji: '🏅' },
      { id: 'profesional', label: { es: 'Profesionales/elite', 'pt-BR': 'Profissionais/elite' }, emoji: '🏆' },
      { id: 'variado', label: { es: 'Muy variado', 'pt-BR': 'Muito variado' }, emoji: '📊' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C07_EDAD_CLIENTE',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Qué rango de edad predomina?',
      'pt-BR': 'Qual faixa etária predomina?'
    },
    type: 'single',
    options: [
      { id: 'ninos', label: { es: 'Niños/adolescentes', 'pt-BR': 'Crianças/adolescentes' }, emoji: '🧒' },
      { id: 'jovenes', label: { es: 'Jóvenes (18-30)', 'pt-BR': 'Jovens (18-30)' }, emoji: '🏃' },
      { id: 'adultos', label: { es: 'Adultos (30-50)', 'pt-BR': 'Adultos (30-50)' }, emoji: '👨' },
      { id: 'mayores', label: { es: 'Adultos mayores (50+)', 'pt-BR': 'Adultos maiores (50+)' }, emoji: '👴' },
      { id: 'variado', label: { es: 'Muy variado', 'pt-BR': 'Muito variado' }, emoji: '👥' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C08_CONVENIOS',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Tenés convenios con clubes o instituciones?',
      'pt-BR': 'Você tem convênios com clubes ou instituições?'
    },
    type: 'single',
    options: [
      { id: 'muchos', label: { es: 'Sí, varios convenios', 'pt-BR': 'Sim, vários convênios' }, emoji: '📋' },
      { id: 'algunos', label: { es: 'Algunos convenios', 'pt-BR': 'Alguns convênios' }, emoji: '🤝' },
      { id: 'informal', label: { es: 'Relaciones informales', 'pt-BR': 'Relações informais' }, emoji: '👥' },
      { id: 'no', label: { es: 'No tengo convenios', 'pt-BR': 'Não tenho convênios' }, emoji: '❌' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C09_CANALES',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿A través de qué canales vendés?',
      'pt-BR': 'Através de quais canais você vende?'
    },
    type: 'multi',
    options: [
      { id: 'local', label: { es: 'Tienda física', 'pt-BR': 'Loja física' }, emoji: '🏪' },
      { id: 'web', label: { es: 'E-commerce propio', 'pt-BR': 'E-commerce próprio' }, emoji: '🌐' },
      { id: 'marketplace', label: { es: 'Marketplaces', 'pt-BR': 'Marketplaces' }, emoji: '🛒' },
      { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '📱' },
      { id: 'instagram', label: { es: 'Instagram Shop', 'pt-BR': 'Instagram Shop' }, emoji: '📸' },
      { id: 'eventos', label: { es: 'Eventos deportivos', 'pt-BR': 'Eventos esportivos' }, emoji: '🏆' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C10_FACTURACION',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es tu facturación mensual promedio?',
      'pt-BR': 'Qual é seu faturamento mensal médio?'
    },
    type: 'single',
    options: [
      { id: 'micro', label: { es: 'Menos de $10,000 USD', 'pt-BR': 'Menos de R$50.000' }, emoji: '🌱' },
      { id: 'pequeno', label: { es: '$10,000-30,000 USD', 'pt-BR': 'R$50.000-150.000' }, emoji: '📈' },
      { id: 'mediano', label: { es: '$30,000-80,000 USD', 'pt-BR': 'R$150.000-400.000' }, emoji: '💰' },
      { id: 'grande', label: { es: '$80,000-200,000 USD', 'pt-BR': 'R$400.000-1M' }, emoji: '💎' },
      { id: 'muy_grande', label: { es: 'Más de $200,000 USD', 'pt-BR': 'Mais de R$1M' }, emoji: '🏆' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C11_MARGEN_CATEGORIA',
    category: 'finances',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué categoría te deja mejor margen?',
      'pt-BR': 'Qual categoria te dá melhor margem?'
    },
    type: 'single',
    options: [
      { id: 'calzado', label: { es: 'Calzado', 'pt-BR': 'Calçado' }, emoji: '👟' },
      { id: 'ropa', label: { es: 'Ropa deportiva', 'pt-BR': 'Roupa esportiva' }, emoji: '👕' },
      { id: 'equipamiento', label: { es: 'Equipamiento', 'pt-BR': 'Equipamento' }, emoji: '🎾' },
      { id: 'accesorios', label: { es: 'Accesorios', 'pt-BR': 'Acessórios' }, emoji: '🎒' },
      { id: 'suplementos', label: { es: 'Suplementos/nutrición', 'pt-BR': 'Suplementos/nutrição' }, emoji: '💪' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C12_ESTACIONALIDAD',
    category: 'risks',
    mode: 'complete',
    dimension: 'finances',
    weight: 8,
    title: {
      es: '¿Cuál es tu temporada más fuerte?',
      'pt-BR': 'Qual é sua temporada mais forte?'
    },
    type: 'single',
    options: [
      { id: 'inicio_temporada', label: { es: 'Inicio temporadas deportivas', 'pt-BR': 'Início temporadas esportivas' }, emoji: '⚽' },
      { id: 'verano', label: { es: 'Verano (outdoor)', 'pt-BR': 'Verão (outdoor)' }, emoji: '☀️' },
      { id: 'invierno', label: { es: 'Invierno (indoor/gym)', 'pt-BR': 'Inverno (indoor/academia)' }, emoji: '❄️' },
      { id: 'fiestas', label: { es: 'Navidad/regalos', 'pt-BR': 'Natal/presentes' }, emoji: '🎄' },
      { id: 'parejo', label: { es: 'Bastante parejo', 'pt-BR': 'Bastante uniforme' }, emoji: '📊' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C13_PROVEEDORES',
    category: 'operations',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Con cuántos proveedores trabajás?',
      'pt-BR': 'Com quantos fornecedores você trabalha?'
    },
    type: 'single',
    options: [
      { id: 'pocos', label: { es: '1-5 principales', 'pt-BR': '1-5 principais' }, emoji: '🤝' },
      { id: 'moderado', label: { es: '6-15 proveedores', 'pt-BR': '6-15 fornecedores' }, emoji: '📦' },
      { id: 'muchos', label: { es: '16-30 proveedores', 'pt-BR': '16-30 fornecedores' }, emoji: '🏭' },
      { id: 'muy_muchos', label: { es: 'Más de 30', 'pt-BR': 'Mais de 30' }, emoji: '🌐' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C14_TALLES',
    category: 'operations',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cómo gestionás la variedad de talles/tallas?',
      'pt-BR': 'Como você gerencia a variedade de tamanhos?'
    },
    type: 'single',
    options: [
      { id: 'completo', label: { es: 'Stock completo de talles', 'pt-BR': 'Estoque completo de tamanhos' }, emoji: '✅' },
      { id: 'comunes', label: { es: 'Solo talles más comunes', 'pt-BR': 'Só tamanhos mais comuns' }, emoji: '📊' },
      { id: 'pedido', label: { es: 'Talles especiales por pedido', 'pt-BR': 'Tamanhos especiais por pedido' }, emoji: '📋' },
      { id: 'problema', label: { es: 'Es un problema constante', 'pt-BR': 'É um problema constante' }, emoji: '⚠️' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C15_PRESENCIA_DIGITAL',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué presencia digital tenés?',
      'pt-BR': 'Qual presença digital você tem?'
    },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram activo', 'pt-BR': 'Instagram ativo' }, emoji: '📸' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘' },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
      { id: 'youtube', label: { es: 'YouTube', 'pt-BR': 'YouTube' }, emoji: '▶️' },
      { id: 'google', label: { es: 'Google My Business', 'pt-BR': 'Google Meu Negócio' }, emoji: '🔍' },
      { id: 'web', label: { es: 'Sitio web', 'pt-BR': 'Site' }, emoji: '🌐' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C16_COMUNIDAD',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Participás en la comunidad deportiva local?',
      'pt-BR': 'Você participa da comunidade esportiva local?'
    },
    type: 'multi',
    options: [
      { id: 'sponsor', label: { es: 'Sponsor de equipos', 'pt-BR': 'Patrocinador de times' }, emoji: '⚽' },
      { id: 'eventos', label: { es: 'Organizo eventos', 'pt-BR': 'Organizo eventos' }, emoji: '🏆' },
      { id: 'carreras', label: { es: 'Participo en carreras/torneos', 'pt-BR': 'Participo em corridas/torneios' }, emoji: '🏃' },
      { id: 'grupos', label: { es: 'Grupos de entrenamiento', 'pt-BR': 'Grupos de treino' }, emoji: '👥' },
      { id: 'no', label: { es: 'No participo activamente', 'pt-BR': 'Não participo ativamente' }, emoji: '❌' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C17_FIDELIZACION',
    category: 'retention',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Tenés programa de fidelización?',
      'pt-BR': 'Você tem programa de fidelização?'
    },
    type: 'single',
    options: [
      { id: 'digital', label: { es: 'Sí, sistema digital', 'pt-BR': 'Sim, sistema digital' }, emoji: '📱' },
      { id: 'descuentos', label: { es: 'Descuentos a frecuentes', 'pt-BR': 'Descontos para frequentes' }, emoji: '💰' },
      { id: 'clubes', label: { es: 'Beneficios para clubes', 'pt-BR': 'Benefícios para clubes' }, emoji: '⚽' },
      { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C18_COMPETENCIA',
    category: 'risks',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Quién es tu principal competencia?',
      'pt-BR': 'Quem é sua principal concorrência?'
    },
    type: 'single',
    options: [
      { id: 'grandes', label: { es: 'Grandes cadenas (Nike Store, etc)', 'pt-BR': 'Grandes redes (Nike Store, etc)' }, emoji: '🏬' },
      { id: 'locales', label: { es: 'Otras tiendas locales', 'pt-BR': 'Outras lojas locais' }, emoji: '🏪' },
      { id: 'online', label: { es: 'E-commerce (ML, Amazon)', 'pt-BR': 'E-commerce (ML, Amazon)' }, emoji: '🌐' },
      { id: 'outlets', label: { es: 'Outlets/descuento', 'pt-BR': 'Outlets/desconto' }, emoji: '🏷️' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C19_DESAFIO',
    category: 'risks',
    mode: 'complete',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es tu mayor desafío actual?',
      'pt-BR': 'Qual é seu maior desafio atual?'
    },
    type: 'single',
    options: [
      { id: 'competencia', label: { es: 'Competencia de grandes', 'pt-BR': 'Concorrência de grandes' }, emoji: '🏬' },
      { id: 'margenes', label: { es: 'Márgenes apretados', 'pt-BR': 'Margens apertadas' }, emoji: '💰' },
      { id: 'stock', label: { es: 'Gestión de inventario', 'pt-BR': 'Gestão de estoque' }, emoji: '📦' },
      { id: 'digital', label: { es: 'Presencia digital', 'pt-BR': 'Presença digital' }, emoji: '📱' },
      { id: 'diferenciacion', label: { es: 'Diferenciarme', 'pt-BR': 'Diferenciar-me' }, emoji: '⭐' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  },
  {
    id: 'DEP_C20_PROYECCION',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Dónde ves tu tienda en 3 años?',
      'pt-BR': 'Onde você vê sua loja em 3 anos?'
    },
    type: 'single',
    options: [
      { id: 'expansion', label: { es: 'Más sucursales', 'pt-BR': 'Mais filiais' }, emoji: '📈' },
      { id: 'online', label: { es: 'Fuerte en online', 'pt-BR': 'Forte no online' }, emoji: '🌐' },
      { id: 'especializada', label: { es: 'Más especializada', 'pt-BR': 'Mais especializada' }, emoji: '🎯' },
      { id: 'comunidad', label: { es: 'Hub de comunidad', 'pt-BR': 'Hub de comunidade' }, emoji: '👥' },
      { id: 'mantener', label: { es: 'Mantener y optimizar', 'pt-BR': 'Manter e otimizar' }, emoji: '⚖️' }
    ],
    businessTypes: ['DEPORTES_OUTDOOR']
  }
];

export default DEPORTES_QUESTIONS;
