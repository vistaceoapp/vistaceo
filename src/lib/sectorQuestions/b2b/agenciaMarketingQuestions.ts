// Agencia de Marketing Digital B2B Questions
// 68 preguntas hiper-personalizadas
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const agenciaMarketingQuestions: VistaSetupQuestion[] = [
  // ========== IDENTIDAD (8) ==========
  {
    id: 'B2B_MKT_IDENTITY_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué servicios de marketing ofrecés principalmente?',
      'pt-BR': 'Que serviços de marketing você oferece principalmente?'
    },
    type: 'multi',
    options: [
      { id: 'performance', label: { es: 'Performance / Paid media', 'pt-BR': 'Performance / Mídia paga' }, emoji: '📈' },
      { id: 'seo', label: { es: 'SEO / Contenido', 'pt-BR': 'SEO / Conteúdo' }, emoji: '🔍' },
      { id: 'social', label: { es: 'Social media management', 'pt-BR': 'Gestão de redes sociais' }, emoji: '📱' },
      { id: 'branding', label: { es: 'Branding / Diseño', 'pt-BR': 'Branding / Design' }, emoji: '🎨' },
      { id: 'web', label: { es: 'Desarrollo web', 'pt-BR': 'Desenvolvimento web' }, emoji: '💻' },
      { id: 'estrategia', label: { es: 'Estrategia digital', 'pt-BR': 'Estratégia digital' }, emoji: '🎯' },
      { id: 'automation', label: { es: 'Marketing automation', 'pt-BR': 'Automação de marketing' }, emoji: '🤖' },
      { id: 'influencers', label: { es: 'Influencer marketing', 'pt-BR': 'Marketing de influência' }, emoji: '⭐' }
    ]
  },
  {
    id: 'B2B_MKT_IDENTITY_02',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    required: true,
    title: {
      es: '¿Cuántos años llevás con la agencia?',
      'pt-BR': 'Há quantos anos você tem a agência?'
    },
    type: 'single',
    options: [
      { id: 'menos_2', label: { es: 'Menos de 2 años', 'pt-BR': 'Menos de 2 anos' }, emoji: '🌱' },
      { id: '2_5', label: { es: '2-5 años', 'pt-BR': '2-5 anos' }, emoji: '📈' },
      { id: '5_10', label: { es: '5-10 años', 'pt-BR': '5-10 anos' }, emoji: '⭐' },
      { id: 'mas_10', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_MKT_IDENTITY_03',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿En qué industrias te especializás?',
      'pt-BR': 'Em quais indústrias você se especializa?'
    },
    type: 'multi',
    options: [
      { id: 'ecommerce', label: { es: 'E-commerce', 'pt-BR': 'E-commerce' }, emoji: '🛒' },
      { id: 'saas', label: { es: 'SaaS / Tech', 'pt-BR': 'SaaS / Tech' }, emoji: '💻' },
      { id: 'retail', label: { es: 'Retail físico', 'pt-BR': 'Varejo físico' }, emoji: '🏪' },
      { id: 'servicios', label: { es: 'Servicios profesionales', 'pt-BR': 'Serviços profissionais' }, emoji: '💼' },
      { id: 'salud', label: { es: 'Salud / Bienestar', 'pt-BR': 'Saúde / Bem-estar' }, emoji: '🏥' },
      { id: 'educacion', label: { es: 'Educación', 'pt-BR': 'Educação' }, emoji: '📚' },
      { id: 'generalista', label: { es: 'Generalista', 'pt-BR': 'Generalista' }, emoji: '🌐' }
    ]
  },
  {
    id: 'B2B_MKT_IDENTITY_04',
    category: 'identity',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuántas personas tiene tu equipo?',
      'pt-BR': 'Quantas pessoas tem sua equipe?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '1️⃣' },
      { id: '2_5', label: { es: '2-5 personas', 'pt-BR': '2-5 pessoas' }, emoji: '👥' },
      { id: '6_15', label: { es: '6-15 personas', 'pt-BR': '6-15 pessoas' }, emoji: '👨‍👩‍👧‍👦' },
      { id: '16_30', label: { es: '16-30 personas', 'pt-BR': '16-30 pessoas' }, emoji: '🏢' },
      { id: 'mas_30', label: { es: 'Más de 30', 'pt-BR': 'Mais de 30' }, emoji: '🏛️' }
    ]
  },
  {
    id: 'B2B_MKT_IDENTITY_05',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Sos partner certificado de alguna plataforma?',
      'pt-BR': 'Você é parceiro certificado de alguma plataforma?'
    },
    type: 'multi',
    options: [
      { id: 'google', label: { es: 'Google Partner', 'pt-BR': 'Google Partner' }, emoji: '🔍' },
      { id: 'meta', label: { es: 'Meta Business Partner', 'pt-BR': 'Meta Business Partner' }, emoji: '📘' },
      { id: 'hubspot', label: { es: 'HubSpot Partner', 'pt-BR': 'HubSpot Partner' }, emoji: '🟠' },
      { id: 'shopify', label: { es: 'Shopify Partner', 'pt-BR': 'Shopify Partner' }, emoji: '🛍️' },
      { id: 'ninguno', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_IDENTITY_06',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Cuál es tu modelo de agencia?',
      'pt-BR': 'Qual é seu modelo de agência?'
    },
    type: 'single',
    options: [
      { id: 'full_service', label: { es: 'Full service', 'pt-BR': 'Full service' }, emoji: '🎯' },
      { id: 'especializada', label: { es: 'Especializada en un servicio', 'pt-BR': 'Especializada em um serviço' }, emoji: '🔧' },
      { id: 'boutique', label: { es: 'Boutique / premium', 'pt-BR': 'Boutique / premium' }, emoji: '💎' },
      { id: 'growth', label: { es: 'Growth / performance', 'pt-BR': 'Growth / performance' }, emoji: '📈' }
    ]
  },
  {
    id: 'B2B_MKT_IDENTITY_07',
    category: 'identity',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Qué herramientas usás principalmente?',
      'pt-BR': 'Que ferramentas você usa principalmente?'
    },
    type: 'multi',
    options: [
      { id: 'semrush', label: { es: 'Semrush / Ahrefs', 'pt-BR': 'Semrush / Ahrefs' }, emoji: '🔍' },
      { id: 'hubspot', label: { es: 'HubSpot', 'pt-BR': 'HubSpot' }, emoji: '🟠' },
      { id: 'meta_ads', label: { es: 'Meta Ads Manager', 'pt-BR': 'Meta Ads Manager' }, emoji: '📘' },
      { id: 'google_ads', label: { es: 'Google Ads', 'pt-BR': 'Google Ads' }, emoji: '🔍' },
      { id: 'figma', label: { es: 'Figma / Adobe', 'pt-BR': 'Figma / Adobe' }, emoji: '🎨' },
      { id: 'analytics', label: { es: 'GA4 / Data Studio', 'pt-BR': 'GA4 / Data Studio' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_MKT_IDENTITY_08',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Has ganado premios del sector?',
      'pt-BR': 'Você ganhou prêmios do setor?'
    },
    type: 'single',
    options: [
      { id: 'varios', label: { es: 'Varios premios', 'pt-BR': 'Vários prêmios' }, emoji: '🏆' },
      { id: 'alguno', label: { es: 'Algún premio', 'pt-BR': 'Algum prêmio' }, emoji: '🥇' },
      { id: 'nominaciones', label: { es: 'Nominaciones', 'pt-BR': 'Indicações' }, emoji: '📋' },
      { id: 'ninguno', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌' }
    ]
  },

  // ========== OFERTA Y PRECIOS (8) ==========
  {
    id: 'B2B_MKT_OFFER_01',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es tu modelo de pricing principal?',
      'pt-BR': 'Qual é seu modelo de pricing principal?'
    },
    type: 'single',
    options: [
      { id: 'retainer', label: { es: 'Retainer mensual fijo', 'pt-BR': 'Retainer mensal fixo' }, emoji: '📅' },
      { id: 'porcentaje', label: { es: '% del ad spend', 'pt-BR': '% do ad spend' }, emoji: '📊' },
      { id: 'proyecto', label: { es: 'Por proyecto', 'pt-BR': 'Por projeto' }, emoji: '📦' },
      { id: 'performance', label: { es: 'Por performance / resultados', 'pt-BR': 'Por performance / resultados' }, emoji: '🎯' },
      { id: 'mixto', label: { es: 'Mixto (base + variable)', 'pt-BR': 'Misto (base + variável)' }, emoji: '🔀' }
    ]
  },
  {
    id: 'B2B_MKT_OFFER_02',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu fee mensual promedio por cliente?',
      'pt-BR': 'Qual é seu fee mensal médio por cliente?'
    },
    type: 'single',
    options: [
      { id: 'menos_1k', label: { es: 'Menos de $1,000 USD', 'pt-BR': 'Menos de $1.000 USD' }, emoji: '💵' },
      { id: '1k_3k', label: { es: '$1,000 - $3,000 USD', 'pt-BR': '$1.000 - $3.000 USD' }, emoji: '💰' },
      { id: '3k_7k', label: { es: '$3,000 - $7,000 USD', 'pt-BR': '$3.000 - $7.000 USD' }, emoji: '💎' },
      { id: '7k_15k', label: { es: '$7,000 - $15,000 USD', 'pt-BR': '$7.000 - $15.000 USD' }, emoji: '👑' },
      { id: 'mas_15k', label: { es: 'Más de $15,000 USD', 'pt-BR': 'Mais de $15.000 USD' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_MKT_OFFER_03',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es tu ticket mínimo de entrada?',
      'pt-BR': 'Qual é seu ticket mínimo de entrada?'
    },
    type: 'single',
    options: [
      { id: 'menos_500', label: { es: 'Menos de $500/mes', 'pt-BR': 'Menos de $500/mês' }, emoji: '💵' },
      { id: '500_1500', label: { es: '$500 - $1,500/mes', 'pt-BR': '$500 - $1.500/mês' }, emoji: '💰' },
      { id: '1500_3000', label: { es: '$1,500 - $3,000/mes', 'pt-BR': '$1.500 - $3.000/mês' }, emoji: '💎' },
      { id: 'mas_3000', label: { es: 'Más de $3,000/mes', 'pt-BR': 'Mais de $3.000/mês' }, emoji: '👑' }
    ]
  },
  {
    id: 'B2B_MKT_OFFER_04',
    category: 'menu',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuál es tu permanencia mínima de contrato?',
      'pt-BR': 'Qual é sua permanência mínima de contrato?'
    },
    type: 'single',
    options: [
      { id: 'sin_permanencia', label: { es: 'Sin permanencia', 'pt-BR': 'Sem permanência' }, emoji: '🆓' },
      { id: '3_meses', label: { es: '3 meses', 'pt-BR': '3 meses' }, emoji: '📅' },
      { id: '6_meses', label: { es: '6 meses', 'pt-BR': '6 meses' }, emoji: '📆' },
      { id: '12_meses', label: { es: '12 meses', 'pt-BR': '12 meses' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_MKT_OFFER_05',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Cobrás setup / onboarding?',
      'pt-BR': 'Você cobra setup / onboarding?'
    },
    type: 'single',
    options: [
      { id: 'si_siempre', label: { es: 'Sí, siempre', 'pt-BR': 'Sim, sempre' }, emoji: '💰' },
      { id: 'depende', label: { es: 'Depende del tamaño', 'pt-BR': 'Depende do tamanho' }, emoji: '🔀' },
      { id: 'diluido', label: { es: 'Lo diluyo en los primeros meses', 'pt-BR': 'Diluo nos primeiros meses' }, emoji: '📅' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '🎁' }
    ]
  },
  {
    id: 'B2B_MKT_OFFER_06',
    category: 'menu',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Ofrecés paquetes predefinidos?',
      'pt-BR': 'Você oferece pacotes predefinidos?'
    },
    type: 'single',
    options: [
      { id: 'si_varios', label: { es: 'Sí, varios paquetes claros', 'pt-BR': 'Sim, vários pacotes claros' }, emoji: '📦' },
      { id: 'algunos', label: { es: 'Algunos servicios empaquetados', 'pt-BR': 'Alguns serviços empacotados' }, emoji: '📋' },
      { id: 'custom', label: { es: 'Todo es custom', 'pt-BR': 'Tudo é customizado' }, emoji: '🎨' }
    ]
  },
  {
    id: 'B2B_MKT_OFFER_07',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Manejás el presupuesto de ads del cliente?',
      'pt-BR': 'Você gerencia o orçamento de ads do cliente?'
    },
    type: 'single',
    options: [
      { id: 'si_facturado', label: { es: 'Sí, facturado a nosotros', 'pt-BR': 'Sim, faturado para nós' }, emoji: '💳' },
      { id: 'si_cliente', label: { es: 'Sí, pero paga el cliente directo', 'pt-BR': 'Sim, mas paga o cliente direto' }, emoji: '💰' },
      { id: 'ambos', label: { es: 'Ambos modelos', 'pt-BR': 'Ambos modelos' }, emoji: '🔀' },
      { id: 'no_manejo', label: { es: 'No manejamos ads', 'pt-BR': 'Não gerenciamos ads' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_OFFER_08',
    category: 'menu',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Tenés servicios white label para otras agencias?',
      'pt-BR': 'Você tem serviços white label para outras agências?'
    },
    type: 'single',
    options: [
      { id: 'si_fuerte', label: { es: 'Sí, es parte importante', 'pt-BR': 'Sim, é parte importante' }, emoji: '🏢' },
      { id: 'si_algo', label: { es: 'Sí, algo', 'pt-BR': 'Sim, algo' }, emoji: '📊' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' }
    ]
  },

  // ... (continuing with remaining categories)
  // For brevity, I'll include key questions from each category

  // ========== CLIENTE Y DEMANDA (8) ==========
  {
    id: 'B2B_MKT_CLIENT_01',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuántos clientes activos tenés actualmente?',
      'pt-BR': 'Quantos clientes ativos você tem atualmente?'
    },
    type: 'single',
    options: [
      { id: 'menos_5', label: { es: 'Menos de 5', 'pt-BR': 'Menos de 5' }, emoji: '🌱' },
      { id: '5_15', label: { es: '5-15', 'pt-BR': '5-15' }, emoji: '📈' },
      { id: '15_30', label: { es: '15-30', 'pt-BR': '15-30' }, emoji: '⭐' },
      { id: 'mas_30', label: { es: 'Más de 30', 'pt-BR': 'Mais de 30' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_MKT_CLIENT_02',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cómo llegan la mayoría de tus clientes?',
      'pt-BR': 'Como chegam a maioria dos seus clientes?'
    },
    type: 'multi',
    options: [
      { id: 'referidos', label: { es: 'Referidos', 'pt-BR': 'Indicações' }, emoji: '🤝' },
      { id: 'inbound', label: { es: 'Inbound (contenido, SEO)', 'pt-BR': 'Inbound (conteúdo, SEO)' }, emoji: '📝' },
      { id: 'paid', label: { es: 'Publicidad propia', 'pt-BR': 'Publicidade própria' }, emoji: '📈' },
      { id: 'linkedin', label: { es: 'LinkedIn / redes', 'pt-BR': 'LinkedIn / redes' }, emoji: '💼' },
      { id: 'outbound', label: { es: 'Prospección outbound', 'pt-BR': 'Prospecção outbound' }, emoji: '📞' },
      { id: 'eventos', label: { es: 'Eventos / networking', 'pt-BR': 'Eventos / networking' }, emoji: '🎤' }
    ]
  },
  {
    id: 'B2B_MKT_CLIENT_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuál es tu tasa de churn mensual?',
      'pt-BR': 'Qual é sua taxa de churn mensal?'
    },
    type: 'single',
    options: [
      { id: 'menos_3', label: { es: 'Menos del 3%', 'pt-BR': 'Menos de 3%' }, emoji: '🏆' },
      { id: '3_5', label: { es: '3-5%', 'pt-BR': '3-5%' }, emoji: '⭐' },
      { id: '5_10', label: { es: '5-10%', 'pt-BR': '5-10%' }, emoji: '📊' },
      { id: 'mas_10', label: { es: 'Más del 10%', 'pt-BR': 'Mais de 10%' }, emoji: '😰' }
    ]
  },
  {
    id: 'B2B_MKT_CLIENT_04',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Cuánto tiempo promedio permanecen tus clientes?',
      'pt-BR': 'Quanto tempo em média permanecem seus clientes?'
    },
    type: 'single',
    options: [
      { id: 'menos_6', label: { es: 'Menos de 6 meses', 'pt-BR': 'Menos de 6 meses' }, emoji: '😰' },
      { id: '6_12', label: { es: '6-12 meses', 'pt-BR': '6-12 meses' }, emoji: '📊' },
      { id: '12_24', label: { es: '12-24 meses', 'pt-BR': '12-24 meses' }, emoji: '⭐' },
      { id: 'mas_24', label: { es: 'Más de 24 meses', 'pt-BR': 'Mais de 24 meses' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_MKT_CLIENT_05',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Cuánto tiempo tarda tu ciclo de venta?',
      'pt-BR': 'Quanto tempo leva seu ciclo de venda?'
    },
    type: 'single',
    options: [
      { id: 'menos_2sem', label: { es: 'Menos de 2 semanas', 'pt-BR': 'Menos de 2 semanas' }, emoji: '⚡' },
      { id: '2_4sem', label: { es: '2-4 semanas', 'pt-BR': '2-4 semanas' }, emoji: '📅' },
      { id: '1_2meses', label: { es: '1-2 meses', 'pt-BR': '1-2 meses' }, emoji: '📆' },
      { id: 'mas_2meses', label: { es: 'Más de 2 meses', 'pt-BR': 'Mais de 2 meses' }, emoji: '🐢' }
    ]
  },
  {
    id: 'B2B_MKT_CLIENT_06',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Cuál es tu ratio de conversión de propuestas?',
      'pt-BR': 'Qual é sua taxa de conversão de propostas?'
    },
    type: 'single',
    options: [
      { id: 'menos_20', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '😰' },
      { id: '20_40', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📊' },
      { id: '40_60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '📈' },
      { id: 'mas_60', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🎯' }
    ]
  },
  {
    id: 'B2B_MKT_CLIENT_07',
    category: 'sales',
    mode: 'complete',
    dimension: 'profitability',
    weight: 5,
    title: {
      es: '¿Hacés upsell de servicios adicionales?',
      'pt-BR': 'Você faz upsell de serviços adicionais?'
    },
    type: 'single',
    options: [
      { id: 'sistemático', label: { es: 'Sí, proceso sistemático', 'pt-BR': 'Sim, processo sistemático' }, emoji: '📈' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'raro', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🌧️' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_CLIENT_08',
    category: 'sales',
    mode: 'complete',
    dimension: 'reputation',
    weight: 4,
    title: {
      es: '¿Tenés programa formal de referidos?',
      'pt-BR': 'Você tem programa formal de indicações?'
    },
    type: 'single',
    options: [
      { id: 'si_incentivos', label: { es: 'Sí, con incentivos', 'pt-BR': 'Sim, com incentivos' }, emoji: '🎁' },
      { id: 'informal', label: { es: 'Informal', 'pt-BR': 'Informal' }, emoji: '🤝' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' }
    ]
  },

  // ========== FINANZAS (8) ==========
  {
    id: 'B2B_MKT_FINANCE_01',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es tu facturación mensual promedio?',
      'pt-BR': 'Qual é seu faturamento mensal médio?'
    },
    type: 'single',
    options: [
      { id: 'menos_10k', label: { es: 'Menos de $10K USD', 'pt-BR': 'Menos de $10K USD' }, emoji: '🌱' },
      { id: '10k_30k', label: { es: '$10K - $30K USD', 'pt-BR': '$10K - $30K USD' }, emoji: '📈' },
      { id: '30k_80k', label: { es: '$30K - $80K USD', 'pt-BR': '$30K - $80K USD' }, emoji: '⭐' },
      { id: 'mas_80k', label: { es: 'Más de $80K USD', 'pt-BR': 'Mais de $80K USD' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_MKT_FINANCE_02',
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
      { id: 'menos_30', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' }, emoji: '😰' },
      { id: '30_50', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '📊' },
      { id: '50_70', label: { es: '50-70%', 'pt-BR': '50-70%' }, emoji: '📈' },
      { id: 'mas_70', label: { es: 'Más del 70%', 'pt-BR': 'Mais de 70%' }, emoji: '🤩' }
    ]
  },
  {
    id: 'B2B_MKT_FINANCE_03',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 8,
    title: {
      es: '¿Cuánto representa tu cliente más grande del total?',
      'pt-BR': 'Quanto representa seu cliente maior do total?'
    },
    type: 'single',
    options: [
      { id: 'menos_15', label: { es: 'Menos del 15%', 'pt-BR': 'Menos de 15%' }, emoji: '✅' },
      { id: '15_30', label: { es: '15-30%', 'pt-BR': '15-30%' }, emoji: '📊' },
      { id: '30_50', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '😰' },
      { id: 'mas_50', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_MKT_FINANCE_04',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cuál es tu plazo de cobro promedio?',
      'pt-BR': 'Qual é seu prazo de recebimento médio?'
    },
    type: 'single',
    options: [
      { id: 'anticipado', label: { es: 'Anticipo antes del mes', 'pt-BR': 'Antecipação antes do mês' }, emoji: '✅' },
      { id: '15_dias', label: { es: '15 días', 'pt-BR': '15 dias' }, emoji: '📅' },
      { id: '30_dias', label: { es: '30 días', 'pt-BR': '30 dias' }, emoji: '📆' },
      { id: 'mas_30', label: { es: 'Más de 30 días', 'pt-BR': 'Mais de 30 dias' }, emoji: '😰' }
    ]
  },
  {
    id: 'B2B_MKT_FINANCE_05',
    category: 'finance',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cuánto representa el costo de personal?',
      'pt-BR': 'Quanto representa o custo de pessoal?'
    },
    type: 'single',
    options: [
      { id: 'menos_40', label: { es: 'Menos del 40%', 'pt-BR': 'Menos de 40%' }, emoji: '✅' },
      { id: '40_60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '📊' },
      { id: '60_80', label: { es: '60-80%', 'pt-BR': '60-80%' }, emoji: '😰' },
      { id: 'mas_80', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_MKT_FINANCE_06',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 5,
    title: {
      es: '¿Cuántos meses de runway tenés?',
      'pt-BR': 'Quantos meses de runway você tem?'
    },
    type: 'single',
    options: [
      { id: 'menos_2', label: { es: 'Menos de 2 meses', 'pt-BR': 'Menos de 2 meses' }, emoji: '🔥' },
      { id: '2_4', label: { es: '2-4 meses', 'pt-BR': '2-4 meses' }, emoji: '😰' },
      { id: '4_6', label: { es: '4-6 meses', 'pt-BR': '4-6 meses' }, emoji: '📊' },
      { id: 'mas_6', label: { es: 'Más de 6 meses', 'pt-BR': 'Mais de 6 meses' }, emoji: '✅' }
    ]
  },
  {
    id: 'B2B_MKT_FINANCE_07',
    category: 'finance',
    mode: 'complete',
    dimension: 'profitability',
    weight: 5,
    title: {
      es: '¿Cuánto gastás en herramientas/software?',
      'pt-BR': 'Quanto você gasta em ferramentas/software?'
    },
    type: 'single',
    options: [
      { id: 'menos_500', label: { es: 'Menos de $500/mes', 'pt-BR': 'Menos de $500/mês' }, emoji: '💵' },
      { id: '500_1500', label: { es: '$500 - $1,500/mes', 'pt-BR': '$500 - $1.500/mês' }, emoji: '💰' },
      { id: '1500_3000', label: { es: '$1,500 - $3,000/mes', 'pt-BR': '$1.500 - $3.000/mês' }, emoji: '💎' },
      { id: 'mas_3000', label: { es: 'Más de $3,000/mes', 'pt-BR': 'Mais de $3.000/mês' }, emoji: '👑' }
    ]
  },
  {
    id: 'B2B_MKT_FINANCE_08',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 4,
    title: {
      es: '¿Tenés estacionalidad en ingresos?',
      'pt-BR': 'Você tem sazonalidade em receitas?'
    },
    type: 'single',
    options: [
      { id: 'muy_marcada', label: { es: 'Muy marcada', 'pt-BR': 'Muito marcada' }, emoji: '🎢' },
      { id: 'algo', label: { es: 'Algo', 'pt-BR': 'Algo' }, emoji: '🌊' },
      { id: 'estable', label: { es: 'Bastante estable', 'pt-BR': 'Bastante estável' }, emoji: '📊' }
    ]
  },

  // ========== OPERACIONES (8) ==========
  {
    id: 'B2B_MKT_OPS_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuántos clientes maneja cada account manager?',
      'pt-BR': 'Quantos clientes cada account manager gerencia?'
    },
    type: 'single',
    options: [
      { id: 'menos_5', label: { es: 'Menos de 5', 'pt-BR': 'Menos de 5' }, emoji: '🎯' },
      { id: '5_10', label: { es: '5-10', 'pt-BR': '5-10' }, emoji: '📊' },
      { id: '10_15', label: { es: '10-15', 'pt-BR': '10-15' }, emoji: '📈' },
      { id: 'mas_15', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_MKT_OPS_02',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Con qué frecuencia entregás reportes?',
      'pt-BR': 'Com que frequência você entrega relatórios?'
    },
    type: 'single',
    options: [
      { id: 'semanal', label: { es: 'Semanalmente', 'pt-BR': 'Semanalmente' }, emoji: '📅' },
      { id: 'quincenal', label: { es: 'Cada 2 semanas', 'pt-BR': 'A cada 2 semanas' }, emoji: '📆' },
      { id: 'mensual', label: { es: 'Mensualmente', 'pt-BR': 'Mensalmente' }, emoji: '📊' },
      { id: 'tiempo_real', label: { es: 'Dashboard en tiempo real', 'pt-BR': 'Dashboard em tempo real' }, emoji: '🎯' }
    ]
  },
  {
    id: 'B2B_MKT_OPS_03',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Tenés procesos de onboarding estandarizados?',
      'pt-BR': 'Você tem processos de onboarding padronizados?'
    },
    type: 'single',
    options: [
      { id: 'muy_estructurado', label: { es: 'Muy estructurado', 'pt-BR': 'Muito estruturado' }, emoji: '📚' },
      { id: 'parcial', label: { es: 'Parcialmente', 'pt-BR': 'Parcialmente' }, emoji: '📋' },
      { id: 'basico', label: { es: 'Básico', 'pt-BR': 'Básico' }, emoji: '📝' },
      { id: 'no', label: { es: 'No, cada cliente es diferente', 'pt-BR': 'Não, cada cliente é diferente' }, emoji: '🎨' }
    ]
  },
  {
    id: 'B2B_MKT_OPS_04',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Usás herramientas de gestión de proyectos?',
      'pt-BR': 'Você usa ferramentas de gestão de projetos?'
    },
    type: 'multi',
    options: [
      { id: 'asana', label: { es: 'Asana / Monday', 'pt-BR': 'Asana / Monday' }, emoji: '📋' },
      { id: 'clickup', label: { es: 'ClickUp', 'pt-BR': 'ClickUp' }, emoji: '✅' },
      { id: 'notion', label: { es: 'Notion', 'pt-BR': 'Notion' }, emoji: '📝' },
      { id: 'trello', label: { es: 'Trello', 'pt-BR': 'Trello' }, emoji: '📌' },
      { id: 'hojas', label: { es: 'Hojas de cálculo', 'pt-BR': 'Planilhas' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_MKT_OPS_05',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Qué porcentaje de tu trabajo es creativo vs analítico?',
      'pt-BR': 'Que porcentagem do seu trabalho é criativo vs analítico?'
    },
    type: 'single',
    options: [
      { id: 'mas_creativo', label: { es: '70%+ creativo', 'pt-BR': '70%+ criativo' }, emoji: '🎨' },
      { id: 'equilibrado', label: { es: '50/50', 'pt-BR': '50/50' }, emoji: '⚖️' },
      { id: 'mas_analitico', label: { es: '70%+ analítico', 'pt-BR': '70%+ analítico' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_MKT_OPS_06',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Tenés SOPs documentados?',
      'pt-BR': 'Você tem SOPs documentados?'
    },
    type: 'single',
    options: [
      { id: 'completos', label: { es: 'Completos y actualizados', 'pt-BR': 'Completos e atualizados' }, emoji: '📚' },
      { id: 'parciales', label: { es: 'Algunos procesos', 'pt-BR': 'Alguns processos' }, emoji: '📋' },
      { id: 'basicos', label: { es: 'Muy básicos', 'pt-BR': 'Muito básicos' }, emoji: '📝' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_OPS_07',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 4,
    title: {
      es: '¿Cuál es tu mayor cuello de botella?',
      'pt-BR': 'Qual é seu maior gargalo?'
    },
    type: 'single',
    options: [
      { id: 'creativo', label: { es: 'Producción creativa', 'pt-BR': 'Produção criativa' }, emoji: '🎨' },
      { id: 'ventas', label: { es: 'Conseguir clientes', 'pt-BR': 'Conseguir clientes' }, emoji: '📈' },
      { id: 'talento', label: { es: 'Encontrar talento', 'pt-BR': 'Encontrar talento' }, emoji: '👥' },
      { id: 'comunicacion', label: { es: 'Comunicación con clientes', 'pt-BR': 'Comunicação com clientes' }, emoji: '💬' },
      { id: 'ninguno', label: { es: 'Ninguno significativo', 'pt-BR': 'Nenhum significativo' }, emoji: '✅' }
    ]
  },
  {
    id: 'B2B_MKT_OPS_08',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 4,
    title: {
      es: '¿Usás IA en tu trabajo diario?',
      'pt-BR': 'Você usa IA no seu trabalho diário?'
    },
    type: 'single',
    options: [
      { id: 'intensivo', label: { es: 'Intensivamente', 'pt-BR': 'Intensivamente' }, emoji: '🤖' },
      { id: 'moderado', label: { es: 'Moderadamente', 'pt-BR': 'Moderadamente' }, emoji: '💻' },
      { id: 'poco', label: { es: 'Poco', 'pt-BR': 'Pouco' }, emoji: '📝' },
      { id: 'no', label: { es: 'Casi nada', 'pt-BR': 'Quase nada' }, emoji: '❌' }
    ]
  },

  // ========== EQUIPO (8) ==========
  {
    id: 'B2B_MKT_TEAM_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la composición de tu equipo?',
      'pt-BR': 'Qual é a composição da sua equipe?'
    },
    type: 'multi',
    options: [
      { id: 'accounts', label: { es: 'Account managers', 'pt-BR': 'Account managers' }, emoji: '👔' },
      { id: 'creativos', label: { es: 'Diseñadores / creativos', 'pt-BR': 'Designers / criativos' }, emoji: '🎨' },
      { id: 'media', label: { es: 'Media buyers', 'pt-BR': 'Media buyers' }, emoji: '📈' },
      { id: 'seo', label: { es: 'SEO / Content', 'pt-BR': 'SEO / Conteúdo' }, emoji: '🔍' },
      { id: 'dev', label: { es: 'Desarrolladores', 'pt-BR': 'Desenvolvedores' }, emoji: '💻' },
      { id: 'analytics', label: { es: 'Analytics', 'pt-BR': 'Analytics' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_MKT_TEAM_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Qué modelo de trabajo tenés?',
      'pt-BR': 'Que modelo de trabalho você tem?'
    },
    type: 'single',
    options: [
      { id: 'presencial', label: { es: 'Presencial', 'pt-BR': 'Presencial' }, emoji: '🏢' },
      { id: 'hibrido', label: { es: 'Híbrido', 'pt-BR': 'Híbrido' }, emoji: '🔀' },
      { id: 'remoto', label: { es: 'Full remoto', 'pt-BR': 'Full remoto' }, emoji: '🏠' }
    ]
  },
  {
    id: 'B2B_MKT_TEAM_03',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Trabajás con freelancers?',
      'pt-BR': 'Você trabalha com freelancers?'
    },
    type: 'single',
    options: [
      { id: 'mayoria', label: { es: 'Mayoría freelancers', 'pt-BR': 'Maioria freelancers' }, emoji: '🌐' },
      { id: 'mixto', label: { es: 'Mix interno + freelancers', 'pt-BR': 'Mix interno + freelancers' }, emoji: '🔀' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'no', label: { es: 'Todo interno', 'pt-BR': 'Tudo interno' }, emoji: '🏢' }
    ]
  },
  {
    id: 'B2B_MKT_TEAM_04',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cuál es tu rotación de personal anual?',
      'pt-BR': 'Qual é sua rotatividade de pessoal anual?'
    },
    type: 'single',
    options: [
      { id: 'menos_10', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '✅' },
      { id: '10_25', label: { es: '10-25%', 'pt-BR': '10-25%' }, emoji: '📊' },
      { id: '25_50', label: { es: '25-50%', 'pt-BR': '25-50%' }, emoji: '😰' },
      { id: 'mas_50', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_MKT_TEAM_05',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Cómo formás a tu equipo?',
      'pt-BR': 'Como você treina sua equipe?'
    },
    type: 'single',
    options: [
      { id: 'programa', label: { es: 'Programa formal de capacitación', 'pt-BR': 'Programa formal de capacitação' }, emoji: '📚' },
      { id: 'cursos', label: { es: 'Cursos externos pagados', 'pt-BR': 'Cursos externos pagos' }, emoji: '🎓' },
      { id: 'mentoring', label: { es: 'Mentoring interno', 'pt-BR': 'Mentoring interno' }, emoji: '👨‍🏫' },
      { id: 'autodidacta', label: { es: 'Autodidactas', 'pt-BR': 'Autodidatas' }, emoji: '📖' }
    ]
  },
  {
    id: 'B2B_MKT_TEAM_06',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 4,
    title: {
      es: '¿Qué rol te cuesta más cubrir?',
      'pt-BR': 'Que função é mais difícil de preencher?'
    },
    type: 'single',
    options: [
      { id: 'media', label: { es: 'Media buyers / performance', 'pt-BR': 'Media buyers / performance' }, emoji: '📈' },
      { id: 'creativo', label: { es: 'Creativos de calidad', 'pt-BR': 'Criativos de qualidade' }, emoji: '🎨' },
      { id: 'seo', label: { es: 'SEO especializado', 'pt-BR': 'SEO especializado' }, emoji: '🔍' },
      { id: 'accounts', label: { es: 'Account managers', 'pt-BR': 'Account managers' }, emoji: '👔' },
      { id: 'ninguno', label: { es: 'Ninguno en particular', 'pt-BR': 'Nenhum em particular' }, emoji: '✅' }
    ]
  },
  {
    id: 'B2B_MKT_TEAM_07',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 4,
    title: {
      es: '¿Hacés reuniones de equipo regulares?',
      'pt-BR': 'Você faz reuniões de equipe regulares?'
    },
    type: 'single',
    options: [
      { id: 'diarias', label: { es: 'Diarias (daily)', 'pt-BR': 'Diárias (daily)' }, emoji: '📅' },
      { id: 'semanales', label: { es: 'Semanales', 'pt-BR': 'Semanais' }, emoji: '📆' },
      { id: 'quincenales', label: { es: 'Quincenales', 'pt-BR': 'Quinzenais' }, emoji: '📊' },
      { id: 'esporadicas', label: { es: 'Esporádicas', 'pt-BR': 'Esporádicas' }, emoji: '🌧️' }
    ]
  },
  {
    id: 'B2B_MKT_TEAM_08',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 3,
    title: {
      es: '¿Tenés plan de carrera definido?',
      'pt-BR': 'Você tem plano de carreira definido?'
    },
    type: 'single',
    options: [
      { id: 'si_claro', label: { es: 'Sí, muy claro', 'pt-BR': 'Sim, muito claro' }, emoji: '📈' },
      { id: 'basico', label: { es: 'Básico', 'pt-BR': 'Básico' }, emoji: '📋' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
      { id: 'no_aplica', label: { es: 'No aplica (equipo pequeño)', 'pt-BR': 'Não se aplica (equipe pequena)' }, emoji: '1️⃣' }
    ]
  },

  // ========== MARKETING (8) ==========
  {
    id: 'B2B_MKT_MKT_01',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Hacés marketing para tu propia agencia?',
      'pt-BR': 'Você faz marketing para sua própria agência?'
    },
    type: 'single',
    options: [
      { id: 'intensivo', label: { es: 'Sí, muy activamente', 'pt-BR': 'Sim, muito ativamente' }, emoji: '🔥' },
      { id: 'moderado', label: { es: 'Moderadamente', 'pt-BR': 'Moderadamente' }, emoji: '📊' },
      { id: 'poco', label: { es: 'Poco, priorizo clientes', 'pt-BR': 'Pouco, priorizo clientes' }, emoji: '📉' },
      { id: 'nada', label: { es: 'Casi nada', 'pt-BR': 'Quase nada' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_MKT_02',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Qué canales usás para tu agencia?',
      'pt-BR': 'Que canais você usa para sua agência?'
    },
    type: 'multi',
    options: [
      { id: 'linkedin', label: { es: 'LinkedIn', 'pt-BR': 'LinkedIn' }, emoji: '💼' },
      { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📷' },
      { id: 'blog', label: { es: 'Blog / SEO', 'pt-BR': 'Blog / SEO' }, emoji: '📝' },
      { id: 'youtube', label: { es: 'YouTube', 'pt-BR': 'YouTube' }, emoji: '🎥' },
      { id: 'podcast', label: { es: 'Podcast', 'pt-BR': 'Podcast' }, emoji: '🎙️' },
      { id: 'ads', label: { es: 'Paid ads', 'pt-BR': 'Anúncios pagos' }, emoji: '📈' }
    ]
  },
  {
    id: 'B2B_MKT_MKT_03',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Tenés casos de éxito publicados?',
      'pt-BR': 'Você tem casos de sucesso publicados?'
    },
    type: 'single',
    options: [
      { id: 'muchos', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '📚' },
      { id: 'varios', label: { es: '5-10', 'pt-BR': '5-10' }, emoji: '📊' },
      { id: 'pocos', label: { es: '1-5', 'pt-BR': '1-5' }, emoji: '📝' },
      { id: 'ninguno', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_MKT_04',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Publicás contenido regularmente?',
      'pt-BR': 'Você publica conteúdo regularmente?'
    },
    type: 'single',
    options: [
      { id: 'diario', label: { es: 'Diariamente', 'pt-BR': 'Diariamente' }, emoji: '🔥' },
      { id: 'semanal', label: { es: 'Semanalmente', 'pt-BR': 'Semanalmente' }, emoji: '📅' },
      { id: 'mensual', label: { es: 'Algunas veces al mes', 'pt-BR': 'Algumas vezes ao mês' }, emoji: '📆' },
      { id: 'esporadico', label: { es: 'Esporádicamente', 'pt-BR': 'Esporadicamente' }, emoji: '🌧️' }
    ]
  },
  {
    id: 'B2B_MKT_MKT_05',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Tenés newsletter?',
      'pt-BR': 'Você tem newsletter?'
    },
    type: 'single',
    options: [
      { id: 'si_activa', label: { es: 'Sí, activa con buenos resultados', 'pt-BR': 'Sim, ativa com bons resultados' }, emoji: '📧' },
      { id: 'si_irregular', label: { es: 'Sí, pero irregular', 'pt-BR': 'Sim, mas irregular' }, emoji: '📝' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_MKT_06',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Das charlas o webinars?',
      'pt-BR': 'Você dá palestras ou webinars?'
    },
    type: 'single',
    options: [
      { id: 'frecuente', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, emoji: '🎤' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'rara_vez', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🌧️' },
      { id: 'nunca', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_MKT_07',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 4,
    title: {
      es: '¿Cuánto invertís en tu propio marketing?',
      'pt-BR': 'Quanto você investe no seu próprio marketing?'
    },
    type: 'single',
    options: [
      { id: 'nada', label: { es: 'Nada', 'pt-BR': 'Nada' }, emoji: '💧' },
      { id: 'poco', label: { es: 'Menos de $500/mes', 'pt-BR': 'Menos de $500/mês' }, emoji: '💵' },
      { id: 'moderado', label: { es: '$500 - $2,000/mes', 'pt-BR': '$500 - $2.000/mês' }, emoji: '💰' },
      { id: 'alto', label: { es: 'Más de $2,000/mes', 'pt-BR': 'Mais de $2.000/mês' }, emoji: '💎' }
    ]
  },
  {
    id: 'B2B_MKT_MKT_08',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 4,
    title: {
      es: '¿Tenés sitio web actualizado?',
      'pt-BR': 'Você tem site atualizado?'
    },
    type: 'single',
    options: [
      { id: 'moderno', label: { es: 'Sí, moderno y completo', 'pt-BR': 'Sim, moderno e completo' }, emoji: '🌐' },
      { id: 'ok', label: { es: 'Funcional pero mejorable', 'pt-BR': 'Funcional mas melhorável' }, emoji: '📊' },
      { id: 'desactualizado', label: { es: 'Desactualizado', 'pt-BR': 'Desatualizado' }, emoji: '😰' },
      { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌' }
    ]
  },

  // ========== REPUTACIÓN (8) ==========
  {
    id: 'B2B_MKT_REP_01',
    category: 'reputation',
    mode: 'both',
    dimension: 'reputation',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el NPS de tus clientes?',
      'pt-BR': 'Qual é o NPS dos seus clientes?'
    },
    type: 'single',
    options: [
      { id: 'excelente', label: { es: '70+ (Excelente)', 'pt-BR': '70+ (Excelente)' }, emoji: '🌟' },
      { id: 'bueno', label: { es: '50-70 (Bueno)', 'pt-BR': '50-70 (Bom)' }, emoji: '⭐' },
      { id: 'ok', label: { es: '30-50', 'pt-BR': '30-50' }, emoji: '📊' },
      { id: 'bajo', label: { es: 'Menos de 30', 'pt-BR': 'Menos de 30' }, emoji: '😰' },
      { id: 'no_mido', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, emoji: '❓' }
    ]
  },
  {
    id: 'B2B_MKT_REP_02',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Tenés reviews en Google / Clutch?',
      'pt-BR': 'Você tem reviews no Google / Clutch?'
    },
    type: 'single',
    options: [
      { id: 'muchas', label: { es: 'Más de 20 reviews', 'pt-BR': 'Mais de 20 reviews' }, emoji: '🌟' },
      { id: 'varias', label: { es: '10-20 reviews', 'pt-BR': '10-20 reviews' }, emoji: '⭐' },
      { id: 'pocas', label: { es: '1-10 reviews', 'pt-BR': '1-10 reviews' }, emoji: '📝' },
      { id: 'ninguna', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_REP_03',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Cuál es la razón principal de churn?',
      'pt-BR': 'Qual é a principal razão de churn?'
    },
    type: 'single',
    options: [
      { id: 'resultados', label: { es: 'Resultados insuficientes', 'pt-BR': 'Resultados insuficientes' }, emoji: '📉' },
      { id: 'precio', label: { es: 'Precio / presupuesto', 'pt-BR': 'Preço / orçamento' }, emoji: '💰' },
      { id: 'servicio', label: { es: 'Calidad de servicio', 'pt-BR': 'Qualidade de serviço' }, emoji: '⭐' },
      { id: 'comunicacion', label: { es: 'Problemas de comunicación', 'pt-BR': 'Problemas de comunicação' }, emoji: '💬' },
      { id: 'cliente', label: { es: 'Cambios internos del cliente', 'pt-BR': 'Mudanças internas do cliente' }, emoji: '🏢' },
      { id: 'no_hay', label: { es: 'Casi no hay churn', 'pt-BR': 'Quase não há churn' }, emoji: '✅' }
    ]
  },
  {
    id: 'B2B_MKT_REP_04',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Hacés encuestas de satisfacción?',
      'pt-BR': 'Você faz pesquisas de satisfação?'
    },
    type: 'single',
    options: [
      { id: 'periodicas', label: { es: 'Periódicas (mensual/trimestral)', 'pt-BR': 'Periódicas (mensal/trimestral)' }, emoji: '📊' },
      { id: 'ocasionales', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'cierre', label: { es: 'Solo al cierre', 'pt-BR': 'Só no encerramento' }, emoji: '✅' },
      { id: 'nunca', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_REP_05',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Cuántos clientes te recomiendan activamente?',
      'pt-BR': 'Quantos clientes te recomendam ativamente?'
    },
    type: 'single',
    options: [
      { id: 'mayoria', label: { es: 'La mayoría (70%+)', 'pt-BR': 'A maioria (70%+)' }, emoji: '🌟' },
      { id: 'bastantes', label: { es: 'Bastantes (40-70%)', 'pt-BR': 'Bastantes (40-70%)' }, emoji: '⭐' },
      { id: 'algunos', label: { es: 'Algunos (20-40%)', 'pt-BR': 'Alguns (20-40%)' }, emoji: '📊' },
      { id: 'pocos', label: { es: 'Pocos (<20%)', 'pt-BR': 'Poucos (<20%)' }, emoji: '📉' }
    ]
  },
  {
    id: 'B2B_MKT_REP_06',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Tenés testimoniales en video?',
      'pt-BR': 'Você tem depoimentos em vídeo?'
    },
    type: 'single',
    options: [
      { id: 'varios', label: { es: 'Varios', 'pt-BR': 'Vários' }, emoji: '🎥' },
      { id: 'algunos', label: { es: 'Algunos', 'pt-BR': 'Alguns' }, emoji: '📹' },
      { id: 'ninguno', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_MKT_REP_07',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 4,
    title: {
      es: '¿Cómo manejás las quejas de clientes?',
      'pt-BR': 'Como você lida com reclamações de clientes?'
    },
    type: 'single',
    options: [
      { id: 'proceso', label: { es: 'Proceso formal documentado', 'pt-BR': 'Processo formal documentado' }, emoji: '📋' },
      { id: 'caso_caso', label: { es: 'Caso a caso, sin proceso', 'pt-BR': 'Caso a caso, sem processo' }, emoji: '🔀' },
      { id: 'evito', label: { es: 'Trato de evitarlas', 'pt-BR': 'Tento evitá-las' }, emoji: '🙈' }
    ]
  },
  {
    id: 'B2B_MKT_REP_08',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 4,
    title: {
      es: '¿Estás en algún ranking de agencias?',
      'pt-BR': 'Você está em algum ranking de agências?'
    },
    type: 'single',
    options: [
      { id: 'top', label: { es: 'Sí, en posiciones destacadas', 'pt-BR': 'Sim, em posições destacadas' }, emoji: '🏆' },
      { id: 'aparece', label: { es: 'Aparezco pero no destacado', 'pt-BR': 'Apareço mas não destacado' }, emoji: '📋' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' }
    ]
  },

  // ========== OBJETIVOS (8) ==========
  {
    id: 'B2B_MKT_GOALS_01',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es tu principal objetivo para los próximos 12 meses?',
      'pt-BR': 'Qual é seu principal objetivo para os próximos 12 meses?'
    },
    type: 'single',
    options: [
      { id: 'mas_clientes', label: { es: 'Conseguir más clientes', 'pt-BR': 'Conseguir mais clientes' }, emoji: '📈' },
      { id: 'subir_ticket', label: { es: 'Subir ticket promedio', 'pt-BR': 'Aumentar ticket médio' }, emoji: '💰' },
      { id: 'reducir_churn', label: { es: 'Reducir churn', 'pt-BR': 'Reduzir churn' }, emoji: '🔄' },
      { id: 'escalar', label: { es: 'Escalar operación', 'pt-BR': 'Escalar operação' }, emoji: '🚀' },
      { id: 'especializar', label: { es: 'Especializar servicios', 'pt-BR': 'Especializar serviços' }, emoji: '🎯' },
      { id: 'rentabilizar', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💎' }
    ]
  },
  {
    id: 'B2B_MKT_GOALS_02',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Qué % de crecimiento esperás?',
      'pt-BR': 'Que % de crescimento você espera?'
    },
    type: 'single',
    options: [
      { id: 'mantener', label: { es: 'Mantener nivel actual', 'pt-BR': 'Manter nível atual' }, emoji: '📊' },
      { id: '10_30', label: { es: '10-30%', 'pt-BR': '10-30%' }, emoji: '📈' },
      { id: '30_50', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '🚀' },
      { id: 'mas_50', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_MKT_GOALS_03',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Pensás expandir a nuevos servicios?',
      'pt-BR': 'Você pensa em expandir para novos serviços?'
    },
    type: 'single',
    options: [
      { id: 'si_concreto', label: { es: 'Sí, ya tengo definido cuáles', 'pt-BR': 'Sim, já tenho definido quais' }, emoji: '🎯' },
      { id: 'explorando', label: { es: 'Estoy explorando opciones', 'pt-BR': 'Estou explorando opções' }, emoji: '🔍' },
      { id: 'no', label: { es: 'No, foco en lo actual', 'pt-BR': 'Não, foco no atual' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_MKT_GOALS_04',
    category: 'goals',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cuántas personas querés agregar al equipo?',
      'pt-BR': 'Quantas pessoas você quer adicionar à equipe?'
    },
    type: 'single',
    options: [
      { id: 'ninguna', label: { es: 'Ninguna, optimizar actual', 'pt-BR': 'Nenhuma, otimizar atual' }, emoji: '✅' },
      { id: '1_3', label: { es: '1-3 personas', 'pt-BR': '1-3 pessoas' }, emoji: '👤' },
      { id: '4_10', label: { es: '4-10 personas', 'pt-BR': '4-10 pessoas' }, emoji: '👥' },
      { id: 'mas_10', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏢' }
    ]
  },
  {
    id: 'B2B_MKT_GOALS_05',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Pensás vender o asociarte con otra agencia?',
      'pt-BR': 'Você pensa em vender ou se associar com outra agência?'
    },
    type: 'single',
    options: [
      { id: 'vender', label: { es: 'Sí, busco vender', 'pt-BR': 'Sim, busco vender' }, emoji: '💰' },
      { id: 'asociar', label: { es: 'Sí, busco socio/asociación', 'pt-BR': 'Sim, busco sócio/associação' }, emoji: '🤝' },
      { id: 'no', label: { es: 'No, quiero crecer independiente', 'pt-BR': 'Não, quero crescer independente' }, emoji: '🚀' }
    ]
  },
  {
    id: 'B2B_MKT_GOALS_06',
    category: 'goals',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Qué querés automatizar?',
      'pt-BR': 'O que você quer automatizar?'
    },
    type: 'multi',
    options: [
      { id: 'reportes', label: { es: 'Reportes', 'pt-BR': 'Relatórios' }, emoji: '📊' },
      { id: 'onboarding', label: { es: 'Onboarding de clientes', 'pt-BR': 'Onboarding de clientes' }, emoji: '🚀' },
      { id: 'facturacion', label: { es: 'Facturación', 'pt-BR': 'Faturamento' }, emoji: '💰' },
      { id: 'campañas', label: { es: 'Optimización de campañas', 'pt-BR': 'Otimização de campanhas' }, emoji: '🤖' },
      { id: 'contenido', label: { es: 'Creación de contenido', 'pt-BR': 'Criação de conteúdo' }, emoji: '📝' }
    ]
  },
  {
    id: 'B2B_MKT_GOALS_07',
    category: 'goals',
    mode: 'complete',
    dimension: 'profitability',
    weight: 4,
    title: {
      es: '¿Cuál sería tu facturación ideal mensual?',
      'pt-BR': 'Qual seria seu faturamento ideal mensal?'
    },
    type: 'single',
    options: [
      { id: '30k', label: { es: '$30K USD', 'pt-BR': '$30K USD' }, emoji: '💵' },
      { id: '50k', label: { es: '$50K USD', 'pt-BR': '$50K USD' }, emoji: '💰' },
      { id: '100k', label: { es: '$100K USD', 'pt-BR': '$100K USD' }, emoji: '💎' },
      { id: 'mas_100k', label: { es: 'Más de $100K USD', 'pt-BR': 'Mais de $100K USD' }, emoji: '👑' }
    ]
  },
  {
    id: 'B2B_MKT_GOALS_08',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 4,
    title: {
      es: '¿Cuál es tu mayor desafío actual?',
      'pt-BR': 'Qual é seu maior desafio atual?'
    },
    type: 'single',
    options: [
      { id: 'ventas', label: { es: 'Conseguir clientes', 'pt-BR': 'Conseguir clientes' }, emoji: '📈' },
      { id: 'retener', label: { es: 'Retener clientes', 'pt-BR': 'Reter clientes' }, emoji: '🔄' },
      { id: 'talento', label: { es: 'Encontrar talento', 'pt-BR': 'Encontrar talento' }, emoji: '👥' },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💰' },
      { id: 'diferenciacion', label: { es: 'Diferenciarme', 'pt-BR': 'Diferenciar-me' }, emoji: '🎯' },
      { id: 'tiempo', label: { es: 'Falta de tiempo', 'pt-BR': 'Falta de tempo' }, emoji: '⏰' }
    ]
  }
];
