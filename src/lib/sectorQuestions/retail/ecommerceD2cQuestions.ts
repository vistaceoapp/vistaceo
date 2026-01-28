// E-commerce D2C (Direct to Consumer) - Complete Questionnaire
// 70 hyper-personalized questions for D2C brands

import type { GastroQuestion } from '../../gastroQuestionsEngine';

export const ECOMMERCE_D2C_QUESTIONS: GastroQuestion[] = [
  // ============ IDENTIDAD Y POSICIONAMIENTO (6) ============
  { id: 'RT_D2C_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué tipo de productos vendés?', 'pt-BR': 'Que tipo de produtos você vende?' }, type: 'multi', required: true, businessTypes: ['ecommerce_d2c'], options: [
    { id: 'fashion', label: { es: 'Moda/Indumentaria', 'pt-BR': 'Moda/Vestuário' }, emoji: '👗' },
    { id: 'beauty', label: { es: 'Belleza/Cosmética', 'pt-BR': 'Beleza/Cosmética' }, emoji: '💄' },
    { id: 'food', label: { es: 'Alimentos/Bebidas', 'pt-BR': 'Alimentos/Bebidas' }, emoji: '🍫' },
    { id: 'home', label: { es: 'Hogar/Decoración', 'pt-BR': 'Casa/Decoração' }, emoji: '🏠' },
    { id: 'tech', label: { es: 'Tecnología/Accesorios', 'pt-BR': 'Tecnologia/Acessórios' }, emoji: '📱' },
    { id: 'wellness', label: { es: 'Bienestar/Fitness', 'pt-BR': 'Bem-estar/Fitness' }, emoji: '💪' },
    { id: 'kids', label: { es: 'Niños/Bebés', 'pt-BR': 'Crianças/Bebês' }, emoji: '👶' },
    { id: 'pets', label: { es: 'Mascotas', 'pt-BR': 'Pets' }, emoji: '🐕' },
  ]},
  { id: 'RT_D2C_002', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Qué caracteriza a tu marca?', 'pt-BR': 'O que caracteriza sua marca?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'sustainable', label: { es: 'Sustentable/Eco-friendly', 'pt-BR': 'Sustentável/Eco-friendly' }, emoji: '🌱' },
    { id: 'premium', label: { es: 'Premium/Lujo accesible', 'pt-BR': 'Premium/Luxo acessível' }, emoji: '💎' },
    { id: 'affordable', label: { es: 'Accesible/Económico', 'pt-BR': 'Acessível/Econômico' }, emoji: '💰' },
    { id: 'artisanal', label: { es: 'Artesanal/Hecho a mano', 'pt-BR': 'Artesanal/Feito à mão' }, emoji: '✋' },
    { id: 'innovative', label: { es: 'Innovador/Tecnológico', 'pt-BR': 'Inovador/Tecnológico' }, emoji: '🚀' },
    { id: 'local', label: { es: 'Local/Nacional', 'pt-BR': 'Local/Nacional' }, emoji: '🏠' },
  ]},
  { id: 'RT_D2C_003', category: 'identity', mode: 'complete', dimension: 'growth', weight: 8, title: { es: '¿Cuántos años tiene tu marca?', 'pt-BR': 'Quantos anos tem sua marca?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: '0-1', label: { es: 'Menos de 1 año', 'pt-BR': 'Menos de 1 ano' }, emoji: '🌱' },
    { id: '1-3', label: { es: '1-3 años', 'pt-BR': '1-3 anos' }, emoji: '📈' },
    { id: '3-5', label: { es: '3-5 años', 'pt-BR': '3-5 anos' }, emoji: '🏪' },
    { id: '5+', label: { es: 'Más de 5 años', 'pt-BR': 'Mais de 5 anos' }, emoji: '🏆' },
  ]},
  { id: 'RT_D2C_004', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Producís tus propios productos?', 'pt-BR': 'Você produz seus próprios produtos?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'own_production', label: { es: 'Producción 100% propia', 'pt-BR': 'Produção 100% própria' }, emoji: '🏭' },
    { id: 'mixed', label: { es: 'Mixto (propio + terceros)', 'pt-BR': 'Misto (próprio + terceiros)' }, emoji: '🔄' },
    { id: 'private_label', label: { es: 'Marca blanca/Private label', 'pt-BR': 'Marca branca/Private label' }, emoji: '🏷️' },
    { id: 'dropship', label: { es: 'Dropshipping', 'pt-BR': 'Dropshipping' }, emoji: '📦' },
  ]},
  { id: 'RT_D2C_005', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tenés tienda física también?', 'pt-BR': 'Você tem loja física também?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'online_only', label: { es: 'Solo online', 'pt-BR': 'Apenas online' }, emoji: '🌐' },
    { id: 'showroom', label: { es: 'Showroom/Pop-up', 'pt-BR': 'Showroom/Pop-up' }, emoji: '🏪' },
    { id: 'physical', label: { es: 'Tienda física permanente', 'pt-BR': 'Loja física permanente' }, emoji: '🏬' },
    { id: 'wholesale', label: { es: 'Vendo a tiendas físicas B2B', 'pt-BR': 'Vendo para lojas físicas B2B' }, emoji: '🏭' },
  ]},
  { id: 'RT_D2C_006', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cuál es tu propuesta de valor principal?', 'pt-BR': 'Qual é sua proposta de valor principal?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'quality', label: { es: 'Calidad superior', 'pt-BR': 'Qualidade superior' }, emoji: '⭐' },
    { id: 'price', label: { es: 'Mejor precio directo', 'pt-BR': 'Melhor preço direto' }, emoji: '💰' },
    { id: 'design', label: { es: 'Diseño único', 'pt-BR': 'Design único' }, emoji: '🎨' },
    { id: 'values', label: { es: 'Valores (sustentabilidad, social)', 'pt-BR': 'Valores (sustentabilidade, social)' }, emoji: '🌱' },
    { id: 'convenience', label: { es: 'Conveniencia/Experiencia', 'pt-BR': 'Conveniência/Experiência' }, emoji: '✨' },
    { id: 'customization', label: { es: 'Personalización', 'pt-BR': 'Personalização' }, emoji: '🎯' },
  ]},

  // ============ OFERTA Y PRECIOS (8) ============
  { id: 'RT_D2C_007', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuántos SKUs/productos tenés?', 'pt-BR': 'Quantos SKUs/produtos você tem?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: '1-20', label: { es: '1-20 productos', 'pt-BR': '1-20 produtos' }, emoji: '📦' },
    { id: '21-50', label: { es: '21-50 productos', 'pt-BR': '21-50 produtos' }, emoji: '🏪' },
    { id: '51-200', label: { es: '51-200 productos', 'pt-BR': '51-200 produtos' }, emoji: '🏬' },
    { id: '200+', label: { es: 'Más de 200', 'pt-BR': 'Mais de 200' }, emoji: '🏭' },
  ]},
  { id: 'RT_D2C_008', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'low', label: { es: 'Menos de $15.000', 'pt-BR': 'Menos de R$300' }, emoji: '💵' },
    { id: 'mid_low', label: { es: '$15.000 - $40.000', 'pt-BR': 'R$300 - R$800' }, emoji: '💰' },
    { id: 'mid', label: { es: '$40.000 - $100.000', 'pt-BR': 'R$800 - R$2.000' }, emoji: '💳' },
    { id: 'high', label: { es: 'Más de $100.000', 'pt-BR': 'Mais de R$2.000' }, emoji: '💎' },
  ]},
  { id: 'RT_D2C_009', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu margen bruto promedio?', 'pt-BR': 'Qual é sua margem bruta média?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: '20-35', label: { es: '20-35%', 'pt-BR': '20-35%' }, emoji: '📊' },
    { id: '35-50', label: { es: '35-50%', 'pt-BR': '35-50%' }, emoji: '📈' },
    { id: '50-65', label: { es: '50-65%', 'pt-BR': '50-65%' }, emoji: '💰' },
    { id: '65+', label: { es: 'Más del 65%', 'pt-BR': 'Mais de 65%' }, emoji: '💎' },
  ]},
  { id: 'RT_D2C_010', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Ofrecés envío gratis?', 'pt-BR': 'Você oferece frete grátis?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'always', label: { es: 'Siempre gratis', 'pt-BR': 'Sempre grátis' }, emoji: '🎁' },
    { id: 'threshold', label: { es: 'A partir de cierto monto', 'pt-BR': 'A partir de certo valor' }, emoji: '🎯' },
    { id: 'subscription', label: { es: 'Para suscriptores/miembros', 'pt-BR': 'Para assinantes/membros' }, emoji: '👑' },
    { id: 'never', label: { es: 'Siempre cobro envío', 'pt-BR': 'Sempre cobro frete' }, emoji: '📦' },
  ]},
  { id: 'RT_D2C_011', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Tenés modelo de suscripción?', 'pt-BR': 'Você tem modelo de assinatura?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'yes_main', label: { es: 'Sí, es mi modelo principal', 'pt-BR': 'Sim, é meu modelo principal' }, emoji: '📅' },
    { id: 'yes_option', label: { es: 'Sí, como opción', 'pt-BR': 'Sim, como opção' }, emoji: '🔄' },
    { id: 'planning', label: { es: 'Lo estoy considerando', 'pt-BR': 'Estou considerando' }, emoji: '🤔' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_012', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Cómo manejás los descuentos?', 'pt-BR': 'Como você gerencia os descontos?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'never', label: { es: 'Nunca hago descuentos', 'pt-BR': 'Nunca faço descontos' }, emoji: '🚫' },
    { id: 'strategic', label: { es: 'Solo en fechas clave', 'pt-BR': 'Apenas em datas chave' }, emoji: '📅' },
    { id: 'regular', label: { es: 'Promociones frecuentes', 'pt-BR': 'Promoções frequentes' }, emoji: '🏷️' },
    { id: 'members', label: { es: 'Solo para miembros/VIP', 'pt-BR': 'Apenas para membros/VIP' }, emoji: '👑' },
  ]},
  { id: 'RT_D2C_013', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Qué métodos de pago aceptás?', 'pt-BR': 'Quais métodos de pagamento você aceita?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'cards', label: { es: 'Tarjetas (débito/crédito)', 'pt-BR': 'Cartões (débito/crédito)' }, emoji: '💳' },
    { id: 'mp', label: { es: 'MercadoPago', 'pt-BR': 'MercadoPago' }, emoji: '📱' },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦' },
    { id: 'installments', label: { es: 'Cuotas sin interés', 'pt-BR': 'Parcelas sem juros' }, emoji: '📅' },
    { id: 'crypto', label: { es: 'Cripto', 'pt-BR': 'Cripto' }, emoji: '₿' },
    { id: 'bnpl', label: { es: 'BNPL (Compra ahora, paga después)', 'pt-BR': 'BNPL (Compre agora, pague depois)' }, emoji: '🛒' },
  ]},
  { id: 'RT_D2C_014', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cuánto te cuestan los medios de pago?', 'pt-BR': 'Quanto custam os meios de pagamento?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'low', label: { es: 'Menos del 4%', 'pt-BR': 'Menos de 4%' }, emoji: '✅' },
    { id: 'medium', label: { es: '4-6%', 'pt-BR': '4-6%' }, emoji: '📊' },
    { id: 'high', label: { es: '6-10%', 'pt-BR': '6-10%' }, emoji: '⚠️' },
    { id: 'very_high', label: { es: 'Más del 10%', 'pt-BR': 'Mais de 10%' }, emoji: '🔴' },
  ]},

  // ============ CLIENTE IDEAL Y DEMANDA (6) ============
  { id: 'RT_D2C_015', category: 'sales', mode: 'both', dimension: 'traffic', weight: 9, title: { es: '¿Quién es tu cliente ideal?', 'pt-BR': 'Quem é seu cliente ideal?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'young_women', label: { es: 'Mujeres jóvenes (18-35)', 'pt-BR': 'Mulheres jovens (18-35)' }, emoji: '👩' },
    { id: 'young_men', label: { es: 'Hombres jóvenes (18-35)', 'pt-BR': 'Homens jovens (18-35)' }, emoji: '👨' },
    { id: 'parents', label: { es: 'Padres/Madres', 'pt-BR': 'Pais/Mães' }, emoji: '👨‍👩‍👧' },
    { id: 'professionals', label: { es: 'Profesionales', 'pt-BR': 'Profissionais' }, emoji: '👔' },
    { id: 'health_conscious', label: { es: 'Conscientes de salud', 'pt-BR': 'Conscientes de saúde' }, emoji: '💪' },
    { id: 'eco_conscious', label: { es: 'Eco-conscientes', 'pt-BR': 'Eco-conscientes' }, emoji: '🌱' },
  ]},
  { id: 'RT_D2C_016', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos pedidos procesás por mes?', 'pt-BR': 'Quantos pedidos você processa por mês?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: '1-50', label: { es: '1-50 pedidos', 'pt-BR': '1-50 pedidos' }, emoji: '📦' },
    { id: '51-200', label: { es: '51-200 pedidos', 'pt-BR': '51-200 pedidos' }, emoji: '🏪' },
    { id: '201-500', label: { es: '201-500 pedidos', 'pt-BR': '201-500 pedidos' }, emoji: '🏬' },
    { id: '500+', label: { es: 'Más de 500', 'pt-BR': 'Mais de 500' }, emoji: '🏭' },
  ]},
  { id: 'RT_D2C_017', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Vendés a todo el país o zona específica?', 'pt-BR': 'Você vende para todo o país ou zona específica?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'local', label: { es: 'Solo mi ciudad/zona', 'pt-BR': 'Apenas minha cidade/zona' }, emoji: '🏘️' },
    { id: 'national', label: { es: 'Todo el país', 'pt-BR': 'Todo o país' }, emoji: '🗺️' },
    { id: 'latam', label: { es: 'LATAM', 'pt-BR': 'LATAM' }, emoji: '🌎' },
    { id: 'global', label: { es: 'Global', 'pt-BR': 'Global' }, emoji: '🌍' },
  ]},
  { id: 'RT_D2C_018', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cuál es la estacionalidad de tu negocio?', 'pt-BR': 'Qual é a sazonalidade do seu negócio?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'hot_sale', label: { es: 'Hot Sale/CyberMonday', 'pt-BR': 'Black Friday/Cyber Monday' }, emoji: '🔥' },
    { id: 'holidays', label: { es: 'Navidad/Fin de año', 'pt-BR': 'Natal/Fim de ano' }, emoji: '🎄' },
    { id: 'mothers', label: { es: 'Día de la Madre', 'pt-BR': 'Dia das Mães' }, emoji: '💐' },
    { id: 'seasonal', label: { es: 'Cambios de temporada', 'pt-BR': 'Mudanças de temporada' }, emoji: '🍂' },
    { id: 'stable', label: { es: 'Estable todo el año', 'pt-BR': 'Estável o ano todo' }, emoji: '📊' },
  ]},
  { id: 'RT_D2C_019', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Qué porcentaje son clientes recurrentes?', 'pt-BR': 'Qual porcentagem são clientes recorrentes?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'low', label: { es: 'Menos del 15%', 'pt-BR': 'Menos de 15%' }, emoji: '📉' },
    { id: 'medium', label: { es: '15-30%', 'pt-BR': '15-30%' }, emoji: '📊' },
    { id: 'high', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '📈' },
    { id: 'very_high', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '🚀' },
  ]},
  { id: 'RT_D2C_020', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuál es tu frecuencia de recompra promedio?', 'pt-BR': 'Qual é sua frequência de recompra média?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'monthly', label: { es: 'Mensual', 'pt-BR': 'Mensal' }, emoji: '📅' },
    { id: 'quarterly', label: { es: '2-3 meses', 'pt-BR': '2-3 meses' }, emoji: '📆' },
    { id: 'biannual', label: { es: '4-6 meses', 'pt-BR': '4-6 meses' }, emoji: '🗓️' },
    { id: 'annual', label: { es: 'Anual o más', 'pt-BR': 'Anual ou mais' }, emoji: '📊' },
    { id: 'one_time', label: { es: 'Mayormente compra única', 'pt-BR': 'Principalmente compra única' }, emoji: '1️⃣' },
  ]},

  // ============ MARKETING Y ADQUISICIÓN (10) ============
  { id: 'RT_D2C_021', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 9, title: { es: '¿Cuáles son tus principales canales de adquisición?', 'pt-BR': 'Quais são seus principais canais de aquisição?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'instagram', label: { es: 'Instagram (orgánico)', 'pt-BR': 'Instagram (orgânico)' }, emoji: '📸' },
    { id: 'meta_ads', label: { es: 'Meta Ads (FB/IG)', 'pt-BR': 'Meta Ads (FB/IG)' }, emoji: '📢' },
    { id: 'google_ads', label: { es: 'Google Ads', 'pt-BR': 'Google Ads' }, emoji: '🔍' },
    { id: 'seo', label: { es: 'SEO/Orgánico', 'pt-BR': 'SEO/Orgânico' }, emoji: '🌐' },
    { id: 'influencers', label: { es: 'Influencers', 'pt-BR': 'Influencers' }, emoji: '⭐' },
    { id: 'referral', label: { es: 'Referidos/WOM', 'pt-BR': 'Indicados/WOM' }, emoji: '💬' },
    { id: 'email', label: { es: 'Email marketing', 'pt-BR': 'Email marketing' }, emoji: '📧' },
    { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
  ]},
  { id: 'RT_D2C_022', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 9, title: { es: '¿Cuánto invertís en marketing mensualmente?', 'pt-BR': 'Quanto você investe em marketing mensalmente?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'nothing', label: { es: 'Nada (solo orgánico)', 'pt-BR': 'Nada (apenas orgânico)' }, emoji: '🌱' },
    { id: 'low', label: { es: 'Hasta $100.000', 'pt-BR': 'Até R$2.000' }, emoji: '📊' },
    { id: 'medium', label: { es: '$100.000 - $500.000', 'pt-BR': 'R$2.000 - R$10.000' }, emoji: '📈' },
    { id: 'high', label: { es: 'Más de $500.000', 'pt-BR': 'Mais de R$10.000' }, emoji: '💰' },
  ]},
  { id: 'RT_D2C_023', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Cuál es tu CAC (Costo de Adquisición de Cliente)?', 'pt-BR': 'Qual é seu CAC (Custo de Aquisição de Cliente)?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'low', label: { es: 'Menos de $5.000', 'pt-BR': 'Menos de R$100' }, emoji: '✅' },
    { id: 'medium', label: { es: '$5.000 - $15.000', 'pt-BR': 'R$100 - R$300' }, emoji: '📊' },
    { id: 'high', label: { es: '$15.000 - $40.000', 'pt-BR': 'R$300 - R$800' }, emoji: '⚠️' },
    { id: 'very_high', label: { es: 'Más de $40.000', 'pt-BR': 'Mais de R$800' }, emoji: '🔴' },
    { id: 'unknown', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, emoji: '❓' },
  ]},
  { id: 'RT_D2C_024', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Cuál es tu ROAS en paid ads?', 'pt-BR': 'Qual é seu ROAS em mídia paga?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'negative', label: { es: 'Negativo (<1x)', 'pt-BR': 'Negativo (<1x)' }, emoji: '🔴' },
    { id: 'breakeven', label: { es: 'Breakeven (1-2x)', 'pt-BR': 'Breakeven (1-2x)' }, emoji: '⚠️' },
    { id: 'good', label: { es: 'Bueno (2-4x)', 'pt-BR': 'Bom (2-4x)' }, emoji: '✅' },
    { id: 'excellent', label: { es: 'Excelente (4x+)', 'pt-BR': 'Excelente (4x+)' }, emoji: '🚀' },
    { id: 'no_ads', label: { es: 'No hago paid ads', 'pt-BR': 'Não faço mídia paga' }, emoji: '🌱' },
  ]},
  { id: 'RT_D2C_025', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Trabajás con influencers?', 'pt-BR': 'Você trabalha com influencers?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'paid', label: { es: 'Sí, pago (colaboraciones)', 'pt-BR': 'Sim, pago (colaborações)' }, emoji: '💰' },
    { id: 'gifting', label: { es: 'Sí, gifting/canje', 'pt-BR': 'Sim, gifting/permuta' }, emoji: '🎁' },
    { id: 'affiliate', label: { es: 'Sí, afiliados', 'pt-BR': 'Sim, afiliados' }, emoji: '🤝' },
    { id: 'planning', label: { es: 'Lo estoy considerando', 'pt-BR': 'Estou considerando' }, emoji: '🤔' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_026', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuántos seguidores tenés en tu red principal?', 'pt-BR': 'Quantos seguidores você tem na sua rede principal?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'small', label: { es: 'Menos de 5k', 'pt-BR': 'Menos de 5k' }, emoji: '🌱' },
    { id: 'growing', label: { es: '5k - 20k', 'pt-BR': '5k - 20k' }, emoji: '📈' },
    { id: 'established', label: { es: '20k - 100k', 'pt-BR': '20k - 100k' }, emoji: '⭐' },
    { id: 'large', label: { es: 'Más de 100k', 'pt-BR': 'Mais de 100k' }, emoji: '🚀' },
  ]},
  { id: 'RT_D2C_027', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Tenés estrategia de email marketing?', 'pt-BR': 'Você tem estratégia de email marketing?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'advanced', label: { es: 'Sí, automatizado + campañas', 'pt-BR': 'Sim, automatizado + campanhas' }, emoji: '🤖' },
    { id: 'basic', label: { es: 'Sí, envíos manuales', 'pt-BR': 'Sim, envios manuais' }, emoji: '📧' },
    { id: 'abandoned_cart', label: { es: 'Solo carritos abandonados', 'pt-BR': 'Apenas carrinhos abandonados' }, emoji: '🛒' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_028', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuál es tu tasa de conversión web?', 'pt-BR': 'Qual é sua taxa de conversão web?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'low', label: { es: 'Menos del 1%', 'pt-BR': 'Menos de 1%' }, emoji: '📉' },
    { id: 'average', label: { es: '1-2%', 'pt-BR': '1-2%' }, emoji: '📊' },
    { id: 'good', label: { es: '2-4%', 'pt-BR': '2-4%' }, emoji: '📈' },
    { id: 'excellent', label: { es: 'Más del 4%', 'pt-BR': 'Mais de 4%' }, emoji: '🚀' },
    { id: 'unknown', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, emoji: '❓' },
  ]},
  { id: 'RT_D2C_029', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Generás contenido regularmente?', 'pt-BR': 'Você gera conteúdo regularmente?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'daily', label: { es: 'Diariamente', 'pt-BR': 'Diariamente' }, emoji: '📅' },
    { id: 'several_week', label: { es: 'Varias veces/semana', 'pt-BR': 'Várias vezes/semana' }, emoji: '📆' },
    { id: 'weekly', label: { es: 'Semanalmente', 'pt-BR': 'Semanalmente' }, emoji: '🗓️' },
    { id: 'irregular', label: { es: 'Irregular', 'pt-BR': 'Irregular' }, emoji: '🔄' },
  ]},
  { id: 'RT_D2C_030', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés programa de referidos?', 'pt-BR': 'Você tem programa de indicados?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'yes', label: { es: 'Sí, con incentivos', 'pt-BR': 'Sim, com incentivos' }, emoji: '🎁' },
    { id: 'informal', label: { es: 'Informal/Manual', 'pt-BR': 'Informal/Manual' }, emoji: '💬' },
    { id: 'planning', label: { es: 'Lo estoy planeando', 'pt-BR': 'Estou planejando' }, emoji: '📋' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},

  // ============ OPERACIONES Y TECNOLOGÍA (10) ============
  { id: 'RT_D2C_031', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 9, title: { es: '¿Qué plataforma de e-commerce usás?', 'pt-BR': 'Que plataforma de e-commerce você usa?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'shopify', label: { es: 'Shopify', 'pt-BR': 'Shopify' }, emoji: '🛒' },
    { id: 'tiendanube', label: { es: 'Tiendanube/Nuvemshop', 'pt-BR': 'Tiendanube/Nuvemshop' }, emoji: '☁️' },
    { id: 'woocommerce', label: { es: 'WooCommerce', 'pt-BR': 'WooCommerce' }, emoji: '🔌' },
    { id: 'vtex', label: { es: 'VTEX', 'pt-BR': 'VTEX' }, emoji: '🏢' },
    { id: 'custom', label: { es: 'Desarrollo propio', 'pt-BR': 'Desenvolvimento próprio' }, emoji: '💻' },
    { id: 'social', label: { es: 'Solo redes (IG Shop)', 'pt-BR': 'Apenas redes (IG Shop)' }, emoji: '📱' },
  ]},
  { id: 'RT_D2C_032', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 8, title: { es: '¿Cómo manejás el fulfillment?', 'pt-BR': 'Como você gerencia o fulfillment?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'in_house', label: { es: 'In-house (yo mismo)', 'pt-BR': 'In-house (eu mesmo)' }, emoji: '🏠' },
    { id: '3pl', label: { es: '3PL/Fulfillment center', 'pt-BR': '3PL/Centro de fulfillment' }, emoji: '🏭' },
    { id: 'hybrid', label: { es: 'Híbrido', 'pt-BR': 'Híbrido' }, emoji: '🔄' },
    { id: 'dropship', label: { es: 'Dropshipping', 'pt-BR': 'Dropshipping' }, emoji: '📦' },
  ]},
  { id: 'RT_D2C_033', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Qué servicios de envío usás?', 'pt-BR': 'Que serviços de envio você usa?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'correo', label: { es: 'Correo nacional', 'pt-BR': 'Correios' }, emoji: '📮' },
    { id: 'courier', label: { es: 'Couriers privados', 'pt-BR': 'Couriers privados' }, emoji: '🚚' },
    { id: 'moto', label: { es: 'Moto/Bici (mismo día)', 'pt-BR': 'Moto/Bike (mesmo dia)' }, emoji: '🛵' },
    { id: 'pickup', label: { es: 'Puntos de retiro', 'pt-BR': 'Pontos de retirada' }, emoji: '📍' },
    { id: 'international', label: { es: 'Internacional (DHL, FedEx)', 'pt-BR': 'Internacional (DHL, FedEx)' }, emoji: '✈️' },
  ]},
  { id: 'RT_D2C_034', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuál es tu tiempo de envío promedio?', 'pt-BR': 'Qual é seu tempo de envio médio?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'same_day', label: { es: 'Mismo día', 'pt-BR': 'Mesmo dia' }, emoji: '⚡' },
    { id: 'next_day', label: { es: '1-2 días', 'pt-BR': '1-2 dias' }, emoji: '🚀' },
    { id: '3-5', label: { es: '3-5 días', 'pt-BR': '3-5 dias' }, emoji: '📦' },
    { id: 'week', label: { es: '5-7 días', 'pt-BR': '5-7 dias' }, emoji: '📅' },
    { id: 'long', label: { es: 'Más de 7 días', 'pt-BR': 'Mais de 7 dias' }, emoji: '⏳' },
  ]},
  { id: 'RT_D2C_035', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cómo manejás el inventario?', 'pt-BR': 'Como você gerencia o inventário?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'integrated', label: { es: 'Integrado con e-commerce', 'pt-BR': 'Integrado com e-commerce' }, emoji: '🔗' },
    { id: 'separate', label: { es: 'Sistema separado', 'pt-BR': 'Sistema separado' }, emoji: '💻' },
    { id: 'manual', label: { es: 'Excel/Manual', 'pt-BR': 'Excel/Manual' }, emoji: '📊' },
    { id: 'none', label: { es: 'No llevo control formal', 'pt-BR': 'Não tenho controle formal' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_036', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu tasa de devoluciones?', 'pt-BR': 'Qual é sua taxa de devoluções?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'low', label: { es: 'Menos del 3%', 'pt-BR': 'Menos de 3%' }, emoji: '✅' },
    { id: 'average', label: { es: '3-8%', 'pt-BR': '3-8%' }, emoji: '📊' },
    { id: 'high', label: { es: '8-15%', 'pt-BR': '8-15%' }, emoji: '⚠️' },
    { id: 'very_high', label: { es: 'Más del 15%', 'pt-BR': 'Mais de 15%' }, emoji: '🔴' },
  ]},
  { id: 'RT_D2C_037', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Qué herramientas usás además del e-commerce?', 'pt-BR': 'Que ferramentas você usa além do e-commerce?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'email_tool', label: { es: 'Email (Mailchimp, Klaviyo)', 'pt-BR': 'Email (Mailchimp, Klaviyo)' }, emoji: '📧' },
    { id: 'analytics', label: { es: 'Analytics avanzados', 'pt-BR': 'Analytics avançados' }, emoji: '📊' },
    { id: 'crm', label: { es: 'CRM', 'pt-BR': 'CRM' }, emoji: '👥' },
    { id: 'reviews', label: { es: 'Sistema de reviews', 'pt-BR': 'Sistema de avaliações' }, emoji: '⭐' },
    { id: 'chat', label: { es: 'Chat/Atención (Zendesk)', 'pt-BR': 'Chat/Atendimento (Zendesk)' }, emoji: '💬' },
    { id: 'none', label: { es: 'Solo lo básico', 'pt-BR': 'Apenas o básico' }, emoji: '📝' },
  ]},
  { id: 'RT_D2C_038', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Usás automatizaciones?', 'pt-BR': 'Você usa automações?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'advanced', label: { es: 'Sí, muy automatizado', 'pt-BR': 'Sim, muito automatizado' }, emoji: '🤖' },
    { id: 'basic', label: { es: 'Algunas básicas', 'pt-BR': 'Algumas básicas' }, emoji: '⚙️' },
    { id: 'no', label: { es: 'Todo manual', 'pt-BR': 'Tudo manual' }, emoji: '✋' },
  ]},
  { id: 'RT_D2C_039', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Tenés integración con contabilidad?', 'pt-BR': 'Você tem integração com contabilidade?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'integrated', label: { es: 'Sí, automático', 'pt-BR': 'Sim, automático' }, emoji: '🔗' },
    { id: 'export', label: { es: 'Exporto datos manualmente', 'pt-BR': 'Exporto dados manualmente' }, emoji: '📊' },
    { id: 'contador', label: { es: 'Mi contador lo maneja', 'pt-BR': 'Meu contador cuida' }, emoji: '👔' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_040', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Usás IA en tu negocio?', 'pt-BR': 'Você usa IA no seu negócio?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'content', label: { es: 'Generación de contenido', 'pt-BR': 'Geração de conteúdo' }, emoji: '✍️' },
    { id: 'support', label: { es: 'Atención al cliente', 'pt-BR': 'Atendimento ao cliente' }, emoji: '💬' },
    { id: 'ads', label: { es: 'Optimización de ads', 'pt-BR': 'Otimização de anúncios' }, emoji: '📢' },
    { id: 'personalization', label: { es: 'Personalización/Recomendaciones', 'pt-BR': 'Personalização/Recomendações' }, emoji: '🎯' },
    { id: 'none', label: { es: 'No uso IA', 'pt-BR': 'Não uso IA' }, emoji: '❌' },
  ]},

  // ============ EQUIPO (5) ============
  { id: 'RT_D2C_041', category: 'team', mode: 'both', dimension: 'team', weight: 8, title: { es: '¿Cuántas personas trabajan en tu marca?', 'pt-BR': 'Quantas pessoas trabalham na sua marca?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
    { id: '2-3', label: { es: '2-3 personas', 'pt-BR': '2-3 pessoas' }, emoji: '👥' },
    { id: '4-10', label: { es: '4-10 personas', 'pt-BR': '4-10 pessoas' }, emoji: '👨‍👩‍👧' },
    { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏢' },
  ]},
  { id: 'RT_D2C_042', category: 'team', mode: 'complete', dimension: 'team', weight: 7, title: { es: '¿Qué roles tenés cubiertos?', 'pt-BR': 'Quais funções você tem cobertas?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'marketing', label: { es: 'Marketing/Social media', 'pt-BR': 'Marketing/Social media' }, emoji: '📱' },
    { id: 'operations', label: { es: 'Operaciones/Fulfillment', 'pt-BR': 'Operações/Fulfillment' }, emoji: '📦' },
    { id: 'support', label: { es: 'Atención al cliente', 'pt-BR': 'Atendimento ao cliente' }, emoji: '💬' },
    { id: 'design', label: { es: 'Diseño/Producto', 'pt-BR': 'Design/Produto' }, emoji: '🎨' },
    { id: 'finance', label: { es: 'Finanzas/Admin', 'pt-BR': 'Finanças/Admin' }, emoji: '📊' },
    { id: 'all_me', label: { es: 'Hago todo yo', 'pt-BR': 'Faço tudo eu' }, emoji: '🦸' },
  ]},
  { id: 'RT_D2C_043', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tercerizás alguna función?', 'pt-BR': 'Você terceiriza alguma função?' }, type: 'multi', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'ads', label: { es: 'Publicidad/Ads', 'pt-BR': 'Publicidade/Anúncios' }, emoji: '📢' },
    { id: 'content', label: { es: 'Contenido/Fotos', 'pt-BR': 'Conteúdo/Fotos' }, emoji: '📸' },
    { id: 'accounting', label: { es: 'Contabilidad', 'pt-BR': 'Contabilidade' }, emoji: '📊' },
    { id: 'logistics', label: { es: 'Logística', 'pt-BR': 'Logística' }, emoji: '📦' },
    { id: 'production', label: { es: 'Producción', 'pt-BR': 'Produção' }, emoji: '🏭' },
    { id: 'none', label: { es: 'Nada', 'pt-BR': 'Nada' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_044', category: 'team', mode: 'complete', dimension: 'team', weight: 5, title: { es: '¿Cuánto tiempo dedicás a la marca por semana?', 'pt-BR': 'Quanto tempo você dedica à marca por semana?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'part_time', label: { es: 'Menos de 20hs (es mi side project)', 'pt-BR': 'Menos de 20h (é meu projeto paralelo)' }, emoji: '⏰' },
    { id: 'full_time', label: { es: '40hs (es mi trabajo full time)', 'pt-BR': '40h (é meu trabalho full time)' }, emoji: '💼' },
    { id: 'all_in', label: { es: 'Más de 50hs (le dedico todo)', 'pt-BR': 'Mais de 50h (dedico tudo)' }, emoji: '🔥' },
  ]},
  { id: 'RT_D2C_045', category: 'team', mode: 'complete', dimension: 'team', weight: 5, title: { es: '¿Tenés socios?', 'pt-BR': 'Você tem sócios?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'solo', label: { es: 'No, soy único dueño', 'pt-BR': 'Não, sou único dono' }, emoji: '👤' },
    { id: 'partner', label: { es: 'Sí, 1 socio', 'pt-BR': 'Sim, 1 sócio' }, emoji: '🤝' },
    { id: 'multiple', label: { es: 'Sí, varios socios', 'pt-BR': 'Sim, vários sócios' }, emoji: '👥' },
    { id: 'investors', label: { es: 'Tengo inversores', 'pt-BR': 'Tenho investidores' }, emoji: '💰' },
  ]},

  // ============ FINANZAS (5) ============
  { id: 'RT_D2C_046', category: 'finance', mode: 'both', dimension: 'finances', weight: 9, title: { es: '¿Cuál es tu facturación mensual promedio?', 'pt-BR': 'Qual é seu faturamento mensal médio?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'small', label: { es: 'Hasta $1M', 'pt-BR': 'Até R$20k' }, emoji: '📊' },
    { id: 'growing', label: { es: '$1M - $5M', 'pt-BR': 'R$20k - R$100k' }, emoji: '📈' },
    { id: 'established', label: { es: '$5M - $20M', 'pt-BR': 'R$100k - R$400k' }, emoji: '💰' },
    { id: 'scale', label: { es: 'Más de $20M', 'pt-BR': 'Mais de R$400k' }, emoji: '💎' },
  ]},
  { id: 'RT_D2C_047', category: 'finance', mode: 'complete', dimension: 'finances', weight: 8, title: { es: '¿Cómo financiás el stock/producción?', 'pt-BR': 'Como você financia o estoque/produção?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'own', label: { es: 'Capital propio', 'pt-BR': 'Capital próprio' }, emoji: '💰' },
    { id: 'reinvest', label: { es: 'Reinvierto ventas', 'pt-BR': 'Reinvisto vendas' }, emoji: '🔄' },
    { id: 'credit', label: { es: 'Crédito/Préstamo', 'pt-BR': 'Crédito/Empréstimo' }, emoji: '🏦' },
    { id: 'presale', label: { es: 'Preventa', 'pt-BR': 'Pré-venda' }, emoji: '📅' },
    { id: 'investors', label: { es: 'Inversores', 'pt-BR': 'Investidores' }, emoji: '👔' },
  ]},
  { id: 'RT_D2C_048', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Sos rentable actualmente?', 'pt-BR': 'Você é rentável atualmente?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'profitable', label: { es: 'Sí, tengo ganancia neta', 'pt-BR': 'Sim, tenho lucro líquido' }, emoji: '✅' },
    { id: 'breakeven', label: { es: 'En breakeven', 'pt-BR': 'Em breakeven' }, emoji: '⚖️' },
    { id: 'reinvesting', label: { es: 'Reinvierto todo (crecimiento)', 'pt-BR': 'Reinvisto tudo (crescimento)' }, emoji: '📈' },
    { id: 'loss', label: { es: 'Pierdo dinero aún', 'pt-BR': 'Ainda perco dinheiro' }, emoji: '📉' },
  ]},
  { id: 'RT_D2C_049', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Conocés tu LTV (Lifetime Value)?', 'pt-BR': 'Você conhece seu LTV (Lifetime Value)?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'yes', label: { es: 'Sí, lo trackeo', 'pt-BR': 'Sim, faço tracking' }, emoji: '📊' },
    { id: 'estimated', label: { es: 'Tengo una idea aproximada', 'pt-BR': 'Tenho uma ideia aproximada' }, emoji: '🤔' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_050', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuánto tenés en stock actualmente?', 'pt-BR': 'Quanto você tem em estoque atualmente?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'light', label: { es: 'Poco (hago bajo demanda)', 'pt-BR': 'Pouco (faço sob demanda)' }, emoji: '🪶' },
    { id: 'normal', label: { es: '1-2 meses de venta', 'pt-BR': '1-2 meses de venda' }, emoji: '📦' },
    { id: 'heavy', label: { es: '3+ meses de venta', 'pt-BR': '3+ meses de venda' }, emoji: '🏭' },
    { id: 'dropship', label: { es: 'No tengo stock (dropship)', 'pt-BR': 'Não tenho estoque (dropship)' }, emoji: '📲' },
  ]},

  // ============ OBJETIVOS Y RIESGOS (10) ============
  { id: 'RT_D2C_051', category: 'goals', mode: 'both', dimension: 'growth', weight: 9, title: { es: '¿Cuál es tu principal objetivo a 12 meses?', 'pt-BR': 'Qual é seu principal objetivo para 12 meses?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'revenue', label: { es: 'Aumentar facturación', 'pt-BR': 'Aumentar faturamento' }, emoji: '📈' },
    { id: 'profit', label: { es: 'Ser rentable/Mejorar margen', 'pt-BR': 'Ser rentável/Melhorar margem' }, emoji: '💰' },
    { id: 'scale', label: { es: 'Escalar (team, procesos)', 'pt-BR': 'Escalar (equipe, processos)' }, emoji: '🚀' },
    { id: 'expand', label: { es: 'Expandir a otros mercados', 'pt-BR': 'Expandir para outros mercados' }, emoji: '🌍' },
    { id: 'products', label: { es: 'Lanzar nuevos productos', 'pt-BR': 'Lançar novos produtos' }, emoji: '✨' },
    { id: 'retail', label: { es: 'Entrar a retail físico', 'pt-BR': 'Entrar no varejo físico' }, emoji: '🏬' },
  ]},
  { id: 'RT_D2C_052', category: 'goals', mode: 'complete', dimension: 'growth', weight: 8, title: { es: '¿Cuánto querés crecer?', 'pt-BR': 'Quanto você quer crescer?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'stable', label: { es: 'Mantenerme', 'pt-BR': 'Manter' }, emoji: '⚖️' },
    { id: 'moderate', label: { es: '20-50% más', 'pt-BR': '20-50% mais' }, emoji: '📈' },
    { id: 'aggressive', label: { es: '50-100% más', 'pt-BR': '50-100% mais' }, emoji: '🚀' },
    { id: 'hyper', label: { es: '2x o más', 'pt-BR': '2x ou mais' }, emoji: '💥' },
  ]},
  { id: 'RT_D2C_053', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Cuál es tu mayor desafío actual?', 'pt-BR': 'Qual é seu maior desafio atual?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'acquisition', label: { es: 'Conseguir clientes rentables', 'pt-BR': 'Conseguir clientes rentáveis' }, emoji: '🎯' },
    { id: 'retention', label: { es: 'Retener clientes', 'pt-BR': 'Reter clientes' }, emoji: '🔄' },
    { id: 'margin', label: { es: 'Mejorar márgenes', 'pt-BR': 'Melhorar margens' }, emoji: '📈' },
    { id: 'operations', label: { es: 'Escalar operaciones', 'pt-BR': 'Escalar operações' }, emoji: '⚙️' },
    { id: 'differentiation', label: { es: 'Diferenciarme', 'pt-BR': 'Diferenciar-me' }, emoji: '⭐' },
    { id: 'capital', label: { es: 'Capital/Flujo de caja', 'pt-BR': 'Capital/Fluxo de caixa' }, emoji: '💰' },
  ]},
  { id: 'RT_D2C_054', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Considerás levantar inversión?', 'pt-BR': 'Você considera levantar investimento?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'yes', label: { es: 'Sí, activamente buscando', 'pt-BR': 'Sim, ativamente buscando' }, emoji: '🔍' },
    { id: 'considering', label: { es: 'Lo estoy considerando', 'pt-BR': 'Estou considerando' }, emoji: '🤔' },
    { id: 'bootstrap', label: { es: 'No, prefiero bootstrappear', 'pt-BR': 'Não, prefiro bootstrappear' }, emoji: '💪' },
    { id: 'have', label: { es: 'Ya tengo inversores', 'pt-BR': 'Já tenho investidores' }, emoji: '✅' },
  ]},
  { id: 'RT_D2C_055', category: 'operation', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuál es tu mayor riesgo?', 'pt-BR': 'Qual é seu maior risco?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'cac', label: { es: 'CAC muy alto', 'pt-BR': 'CAC muito alto' }, emoji: '📈' },
    { id: 'cash', label: { es: 'Flujo de caja', 'pt-BR': 'Fluxo de caixa' }, emoji: '💰' },
    { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, emoji: '⚔️' },
    { id: 'inventory', label: { es: 'Inventario (quiebre/exceso)', 'pt-BR': 'Inventário (ruptura/excesso)' }, emoji: '📦' },
    { id: 'platform', label: { es: 'Dependencia de plataformas (Meta, etc)', 'pt-BR': 'Dependência de plataformas (Meta, etc)' }, emoji: '📱' },
  ]},
  { id: 'RT_D2C_056', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Qué te limita más?', 'pt-BR': 'O que mais te limita?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'capital', label: { es: 'Capital', 'pt-BR': 'Capital' }, emoji: '💰' },
    { id: 'time', label: { es: 'Mi tiempo', 'pt-BR': 'Meu tempo' }, emoji: '⏰' },
    { id: 'team', label: { es: 'Equipo/Talento', 'pt-BR': 'Equipe/Talento' }, emoji: '👥' },
    { id: 'knowledge', label: { es: 'Conocimiento técnico', 'pt-BR': 'Conhecimento técnico' }, emoji: '🎓' },
    { id: 'production', label: { es: 'Capacidad de producción', 'pt-BR': 'Capacidade de produção' }, emoji: '🏭' },
    { id: 'nothing', label: { es: 'Nada crítico', 'pt-BR': 'Nada crítico' }, emoji: '✅' },
  ]},
  { id: 'RT_D2C_057', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'excellent', label: { es: '4.5+ estrellas', 'pt-BR': '4.5+ estrelas' }, emoji: '⭐' },
    { id: 'good', label: { es: '4-4.4 estrellas', 'pt-BR': '4-4.4 estrelas' }, emoji: '✅' },
    { id: 'regular', label: { es: '3.5-4 estrellas', 'pt-BR': '3.5-4 estrelas' }, emoji: '⚠️' },
    { id: 'no_reviews', label: { es: 'No tengo sistema de reviews', 'pt-BR': 'Não tenho sistema de avaliações' }, emoji: '❓' },
  ]},
  { id: 'RT_D2C_058', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cómo manejás el servicio al cliente?', 'pt-BR': 'Como você gerencia o atendimento ao cliente?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'proactive', label: { es: 'Proactivo (seguimiento, check-in)', 'pt-BR': 'Proativo (acompanhamento, check-in)' }, emoji: '💬' },
    { id: 'reactive', label: { es: 'Reactivo (cuando preguntan)', 'pt-BR': 'Reativo (quando perguntam)' }, emoji: '📞' },
    { id: 'automated', label: { es: 'Mayormente automatizado', 'pt-BR': 'Principalmente automatizado' }, emoji: '🤖' },
    { id: 'basic', label: { es: 'Básico/Mínimo', 'pt-BR': 'Básico/Mínimo' }, emoji: '📝' },
  ]},
  { id: 'RT_D2C_059', category: 'reputation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés estrategia de UGC (User Generated Content)?', 'pt-BR': 'Você tem estratégia de UGC (User Generated Content)?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'active', label: { es: 'Sí, pido y republico activamente', 'pt-BR': 'Sim, peço e republico ativamente' }, emoji: '📸' },
    { id: 'passive', label: { es: 'Republico lo que llega', 'pt-BR': 'Republico o que chega' }, emoji: '🔄' },
    { id: 'no', label: { es: 'No lo trabajo', 'pt-BR': 'Não trabalho isso' }, emoji: '❌' },
  ]},
  { id: 'RT_D2C_060', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 5, title: { es: '¿Tenés comunidad activa?', 'pt-BR': 'Você tem comunidade ativa?' }, type: 'single', businessTypes: ['ecommerce_d2c'], options: [
    { id: 'yes', label: { es: 'Sí, muy engagada', 'pt-BR': 'Sim, muito engajada' }, emoji: '🔥' },
    { id: 'growing', label: { es: 'En construcción', 'pt-BR': 'Em construção' }, emoji: '🌱' },
    { id: 'followers', label: { es: 'Tengo seguidores pero no comunidad', 'pt-BR': 'Tenho seguidores mas não comunidade' }, emoji: '👥' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
];

// Export filtered by mode
export const ECOMMERCE_D2C_QUICK = ECOMMERCE_D2C_QUESTIONS.filter(q => q.mode === 'quick' || q.mode === 'both');
export const ECOMMERCE_D2C_COMPLETE = ECOMMERCE_D2C_QUESTIONS;
