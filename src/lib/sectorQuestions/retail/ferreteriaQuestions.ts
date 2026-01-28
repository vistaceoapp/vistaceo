// Ferretería / Herramientas - Complete Questionnaire
// 70 hyper-personalized questions for hardware stores

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const FERRETERIA_QUESTIONS: VistaSetupQuestion[] = [
  // ============ IDENTIDAD Y POSICIONAMIENTO (6) ============
  { id: 'RT_FER_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué tipo de productos vendés principalmente?', 'pt-BR': 'Que tipo de produtos você vende principalmente?' }, type: 'multi', required: true, businessTypes: ['ferreteria'], options: [
    { id: 'tools', label: { es: 'Herramientas manuales y eléctricas', 'pt-BR': 'Ferramentas manuais e elétricas' }, emoji: '🔧' },
    { id: 'fasteners', label: { es: 'Tornillería y fijaciones', 'pt-BR': 'Parafusos e fixações' }, emoji: '🔩' },
    { id: 'plumbing', label: { es: 'Plomería/Sanitarios', 'pt-BR': 'Hidráulica/Sanitários' }, emoji: '🚿' },
    { id: 'electrical', label: { es: 'Material eléctrico', 'pt-BR': 'Material elétrico' }, emoji: '⚡' },
    { id: 'paint', label: { es: 'Pinturas y accesorios', 'pt-BR': 'Tintas e acessórios' }, emoji: '🎨' },
    { id: 'construction', label: { es: 'Materiales de construcción', 'pt-BR': 'Materiais de construção' }, emoji: '🧱' },
    { id: 'garden', label: { es: 'Jardinería', 'pt-BR': 'Jardinagem' }, emoji: '🌿' },
    { id: 'security', label: { es: 'Cerrajería/Seguridad', 'pt-BR': 'Chaveiro/Segurança' }, emoji: '🔐' },
  ]},
  { id: 'RT_FER_002', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Qué tipo de ferretería sos?', 'pt-BR': 'Que tipo de ferragem você é?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'neighborhood', label: { es: 'Ferretería de barrio/tradicional', 'pt-BR': 'Ferragem de bairro/tradicional' }, emoji: '🏪' },
    { id: 'industrial', label: { es: 'Ferretería industrial', 'pt-BR': 'Ferragem industrial' }, emoji: '🏭' },
    { id: 'specialized', label: { es: 'Especializada (herramientas, plomería)', 'pt-BR': 'Especializada (ferramentas, hidráulica)' }, emoji: '🎯' },
    { id: 'big_box', label: { es: 'Gran superficie/Autoservicio', 'pt-BR': 'Grande superfície/Autosserviço' }, emoji: '🏬' },
  ]},
  { id: 'RT_FER_003', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Dónde está ubicado tu local?', 'pt-BR': 'Onde está localizado seu negócio?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'residential', label: { es: 'Barrio residencial', 'pt-BR': 'Bairro residencial' }, emoji: '🏘️' },
    { id: 'commercial', label: { es: 'Zona comercial/industrial', 'pt-BR': 'Zona comercial/industrial' }, emoji: '🏢' },
    { id: 'highway', label: { es: 'Sobre avenida/ruta', 'pt-BR': 'Sobre avenida/rodovia' }, emoji: '🛣️' },
    { id: 'construction_zone', label: { es: 'Zona de construcción activa', 'pt-BR': 'Zona de construção ativa' }, emoji: '🏗️' },
  ]},
  { id: 'RT_FER_004', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuántos años tiene tu ferretería?', 'pt-BR': 'Quantos anos tem sua ferragem?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: '0-3', label: { es: 'Menos de 3 años', 'pt-BR': 'Menos de 3 anos' }, emoji: '🌱' },
    { id: '3-10', label: { es: '3-10 años', 'pt-BR': '3-10 anos' }, emoji: '📈' },
    { id: '10-20', label: { es: '10-20 años', 'pt-BR': '10-20 anos' }, emoji: '🏪' },
    { id: '20+', label: { es: 'Más de 20 años', 'pt-BR': 'Mais de 20 anos' }, emoji: '🏆' },
  ]},
  { id: 'RT_FER_005', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuál es el tamaño de tu local?', 'pt-BR': 'Qual é o tamanho do seu local?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'small', label: { es: 'Hasta 50m²', 'pt-BR': 'Até 50m²' }, emoji: '📐' },
    { id: 'medium', label: { es: '50-150m²', 'pt-BR': '50-150m²' }, emoji: '🏪' },
    { id: 'large', label: { es: '150-400m²', 'pt-BR': '150-400m²' }, emoji: '🏬' },
    { id: 'xlarge', label: { es: 'Más de 400m²', 'pt-BR': 'Mais de 400m²' }, emoji: '🏭' },
  ]},
  { id: 'RT_FER_006', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Qué te diferencia de la competencia?', 'pt-BR': 'O que te diferencia da concorrência?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'stock', label: { es: 'Siempre tengo stock', 'pt-BR': 'Sempre tenho estoque' }, emoji: '📦' },
    { id: 'advice', label: { es: 'Asesoramiento técnico', 'pt-BR': 'Assessoria técnica' }, emoji: '🎓' },
    { id: 'price', label: { es: 'Mejores precios', 'pt-BR': 'Melhores preços' }, emoji: '💰' },
    { id: 'service', label: { es: 'Servicios adicionales (corte, roscado)', 'pt-BR': 'Serviços adicionais (corte, rosqueamento)' }, emoji: '🔧' },
    { id: 'delivery', label: { es: 'Envío rápido', 'pt-BR': 'Entrega rápida' }, emoji: '🚚' },
    { id: 'credit', label: { es: 'Cuenta corriente/Crédito', 'pt-BR': 'Conta corrente/Crédito' }, emoji: '💳' },
  ]},

  // ============ OFERTA Y PRECIOS (8) ============
  { id: 'RT_FER_007', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuántos SKUs/productos diferentes manejás?', 'pt-BR': 'Quantos SKUs/produtos diferentes você gerencia?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: '500-2000', label: { es: '500-2.000 items', 'pt-BR': '500-2.000 itens' }, emoji: '📦' },
    { id: '2000-5000', label: { es: '2.000-5.000 items', 'pt-BR': '2.000-5.000 itens' }, emoji: '🏪' },
    { id: '5000-15000', label: { es: '5.000-15.000 items', 'pt-BR': '5.000-15.000 itens' }, emoji: '🏬' },
    { id: '15000+', label: { es: 'Más de 15.000 items', 'pt-BR': 'Mais de 15.000 itens' }, emoji: '🏭' },
  ]},
  { id: 'RT_FER_008', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'low', label: { es: 'Menos de $5.000', 'pt-BR': 'Menos de R$100' }, emoji: '💵' },
    { id: 'mid_low', label: { es: '$5.000 - $15.000', 'pt-BR': 'R$100 - R$300' }, emoji: '💰' },
    { id: 'mid', label: { es: '$15.000 - $50.000', 'pt-BR': 'R$300 - R$1.000' }, emoji: '💳' },
    { id: 'high', label: { es: 'Más de $50.000', 'pt-BR': 'Mais de R$1.000' }, emoji: '💎' },
  ]},
  { id: 'RT_FER_009', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Qué categoría te genera más facturación?', 'pt-BR': 'Qual categoria te gera mais faturamento?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'tools', label: { es: 'Herramientas', 'pt-BR': 'Ferramentas' }, emoji: '🔧' },
    { id: 'construction', label: { es: 'Construcción/Obra', 'pt-BR': 'Construção/Obra' }, emoji: '🧱' },
    { id: 'plumbing', label: { es: 'Plomería', 'pt-BR': 'Hidráulica' }, emoji: '🚿' },
    { id: 'electrical', label: { es: 'Electricidad', 'pt-BR': 'Eletricidade' }, emoji: '⚡' },
    { id: 'paint', label: { es: 'Pinturas', 'pt-BR': 'Tintas' }, emoji: '🎨' },
    { id: 'fasteners', label: { es: 'Tornillería (volumen)', 'pt-BR': 'Parafusos (volume)' }, emoji: '🔩' },
  ]},
  { id: 'RT_FER_010', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu margen bruto promedio?', 'pt-BR': 'Qual é sua margem bruta média?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: '15-25', label: { es: '15-25%', 'pt-BR': '15-25%' }, emoji: '📊' },
    { id: '25-35', label: { es: '25-35%', 'pt-BR': '25-35%' }, emoji: '📈' },
    { id: '35-45', label: { es: '35-45%', 'pt-BR': '35-45%' }, emoji: '💰' },
    { id: '45+', label: { es: 'Más del 45%', 'pt-BR': 'Mais de 45%' }, emoji: '💎' },
  ]},
  { id: 'RT_FER_011', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Ofrecés servicios adicionales?', 'pt-BR': 'Você oferece serviços adicionais?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'cutting', label: { es: 'Corte de materiales', 'pt-BR': 'Corte de materiais' }, emoji: '✂️' },
    { id: 'threading', label: { es: 'Roscado de caños', 'pt-BR': 'Rosqueamento de canos' }, emoji: '🔩' },
    { id: 'keys', label: { es: 'Duplicado de llaves', 'pt-BR': 'Cópia de chaves' }, emoji: '🔑' },
    { id: 'mixing', label: { es: 'Preparación de pinturas', 'pt-BR': 'Preparação de tintas' }, emoji: '🎨' },
    { id: 'sharpening', label: { es: 'Afilado de herramientas', 'pt-BR': 'Afiação de ferramentas' }, emoji: '🔪' },
    { id: 'none', label: { es: 'Solo venta', 'pt-BR': 'Apenas venda' }, emoji: '🏪' },
  ]},
  { id: 'RT_FER_012', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Vendés a cuenta corriente?', 'pt-BR': 'Você vende em conta corrente?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios clientes', 'pt-BR': 'Sim, vários clientes' }, emoji: '📒' },
    { id: 'yes_few', label: { es: 'Sí, pocos conocidos', 'pt-BR': 'Sim, poucos conhecidos' }, emoji: '📝' },
    { id: 'no', label: { es: 'No, solo contado', 'pt-BR': 'Não, apenas à vista' }, emoji: '💵' },
  ]},
  { id: 'RT_FER_013', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Manejás lista de precios por tipo de cliente?', 'pt-BR': 'Você tem lista de preços por tipo de cliente?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes', label: { es: 'Sí, público/profesional/mayorista', 'pt-BR': 'Sim, público/profissional/atacado' }, emoji: '📋' },
    { id: 'informal', label: { es: 'Descuentos informales', 'pt-BR': 'Descontos informais' }, emoji: '🤝' },
    { id: 'no', label: { es: 'Precio único', 'pt-BR': 'Preço único' }, emoji: '💲' },
  ]},
  { id: 'RT_FER_014', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Qué productos te dan mejor margen?', 'pt-BR': 'Quais produtos te dão melhor margem?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'accessories', label: { es: 'Accesorios pequeños', 'pt-BR': 'Acessórios pequenos' }, emoji: '🔩' },
    { id: 'services', label: { es: 'Servicios (corte, llaves)', 'pt-BR': 'Serviços (corte, chaves)' }, emoji: '✂️' },
    { id: 'branded_tools', label: { es: 'Herramientas de marca', 'pt-BR': 'Ferramentas de marca' }, emoji: '🔧' },
    { id: 'generic', label: { es: 'Productos genéricos', 'pt-BR': 'Produtos genéricos' }, emoji: '📦' },
    { id: 'paint', label: { es: 'Pinturas', 'pt-BR': 'Tintas' }, emoji: '🎨' },
  ]},

  // ============ CLIENTE IDEAL Y DEMANDA (6) ============
  { id: 'RT_FER_015', category: 'sales', mode: 'both', dimension: 'traffic', weight: 9, title: { es: '¿Quién es tu cliente principal?', 'pt-BR': 'Quem é seu cliente principal?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'homeowner', label: { es: 'Propietarios/Hogar', 'pt-BR': 'Proprietários/Casa' }, emoji: '🏠' },
    { id: 'professional', label: { es: 'Profesionales (plomeros, electricistas)', 'pt-BR': 'Profissionais (encanadores, eletricistas)' }, emoji: '👷' },
    { id: 'contractor', label: { es: 'Constructores/Contratistas', 'pt-BR': 'Construtores/Empreiteiros' }, emoji: '🏗️' },
    { id: 'industry', label: { es: 'Industrias/Fábricas', 'pt-BR': 'Indústrias/Fábricas' }, emoji: '🏭' },
    { id: 'reseller', label: { es: 'Revendedores/Ferreterías', 'pt-BR': 'Revendedores/Ferragens' }, emoji: '🏪' },
    { id: 'diy', label: { es: 'Aficionados DIY', 'pt-BR': 'Entusiastas DIY' }, emoji: '🔨' },
  ]},
  { id: 'RT_FER_016', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Qué porcentaje de clientes son profesionales?', 'pt-BR': 'Qual porcentagem de clientes são profissionais?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: '0-20', label: { es: '0-20% (mayormente hogares)', 'pt-BR': '0-20% (principalmente casas)' }, emoji: '🏠' },
    { id: '20-50', label: { es: '20-50%', 'pt-BR': '20-50%' }, emoji: '📊' },
    { id: '50-80', label: { es: '50-80%', 'pt-BR': '50-80%' }, emoji: '👷' },
    { id: '80+', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' }, emoji: '🏭' },
  ]},
  { id: 'RT_FER_017', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cuántos clientes atendés por día?', 'pt-BR': 'Quantos clientes você atende por dia?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: '1-30', label: { es: '1-30 clientes', 'pt-BR': '1-30 clientes' }, emoji: '👤' },
    { id: '31-80', label: { es: '31-80 clientes', 'pt-BR': '31-80 clientes' }, emoji: '👥' },
    { id: '81-150', label: { es: '81-150 clientes', 'pt-BR': '81-150 clientes' }, emoji: '🏪' },
    { id: '150+', label: { es: 'Más de 150', 'pt-BR': 'Mais de 150' }, emoji: '🏬' },
  ]},
  { id: 'RT_FER_018', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cómo te encuentran los clientes nuevos?', 'pt-BR': 'Como os novos clientes te encontram?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'walk_in', label: { es: 'Pasan por la puerta', 'pt-BR': 'Passam pela porta' }, emoji: '🚶' },
    { id: 'referral', label: { es: 'Recomendación', 'pt-BR': 'Recomendação' }, emoji: '💬' },
    { id: 'google', label: { es: 'Google/Maps', 'pt-BR': 'Google/Maps' }, emoji: '🔍' },
    { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
    { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬' },
    { id: 'contractors', label: { es: 'Profesionales los traen', 'pt-BR': 'Profissionais os trazem' }, emoji: '👷' },
  ]},
  { id: 'RT_FER_019', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuál es tu horario de mayor demanda?', 'pt-BR': 'Qual é seu horário de maior demanda?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'morning', label: { es: 'Mañana (7-11)', 'pt-BR': 'Manhã (7-11)' }, emoji: '🌅' },
    { id: 'midday', label: { es: 'Mediodía (11-14)', 'pt-BR': 'Meio-dia (11-14)' }, emoji: '☀️' },
    { id: 'afternoon', label: { es: 'Tarde (14-18)', 'pt-BR': 'Tarde (14-18)' }, emoji: '🌤️' },
    { id: 'evening', label: { es: 'Noche (18-20)', 'pt-BR': 'Noite (18-20)' }, emoji: '🌙' },
    { id: 'saturday', label: { es: 'Sábados', 'pt-BR': 'Sábados' }, emoji: '📅' },
  ]},
  { id: 'RT_FER_020', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuál es la estacionalidad de tu negocio?', 'pt-BR': 'Qual é a sazonalidade do seu negócio?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'spring', label: { es: 'Primavera (jardín, pintura)', 'pt-BR': 'Primavera (jardim, pintura)' }, emoji: '🌸' },
    { id: 'summer', label: { es: 'Verano (piletas, refacción)', 'pt-BR': 'Verão (piscinas, reforma)' }, emoji: '☀️' },
    { id: 'autumn', label: { es: 'Otoño (preparación invierno)', 'pt-BR': 'Outono (preparação inverno)' }, emoji: '🍂' },
    { id: 'winter', label: { es: 'Invierno (calefacción)', 'pt-BR': 'Inverno (aquecimento)' }, emoji: '❄️' },
    { id: 'stable', label: { es: 'Estable todo el año', 'pt-BR': 'Estável o ano todo' }, emoji: '📊' },
  ]},

  // ============ VENTAS Y CONVERSIÓN (6) ============
  { id: 'RT_FER_021', category: 'sales', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Qué canales de venta usás?', 'pt-BR': 'Quais canais de venda você usa?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'counter', label: { es: 'Mostrador/Local', 'pt-BR': 'Balcão/Loja' }, emoji: '🏪' },
    { id: 'phone', label: { es: 'Teléfono', 'pt-BR': 'Telefone' }, emoji: '📞' },
    { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '📱' },
    { id: 'delivery', label: { es: 'Reparto a obra', 'pt-BR': 'Entrega em obra' }, emoji: '🚚' },
    { id: 'ecommerce', label: { es: 'E-commerce/Web', 'pt-BR': 'E-commerce/Web' }, emoji: '🌐' },
    { id: 'marketplace', label: { es: 'MercadoLibre', 'pt-BR': 'Mercado Livre' }, emoji: '🛒' },
  ]},
  { id: 'RT_FER_022', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Qué porcentaje de ventas es por WhatsApp/teléfono?', 'pt-BR': 'Qual porcentagem de vendas é por WhatsApp/telefone?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: '0-20', label: { es: '0-20% (mayormente mostrador)', 'pt-BR': '0-20% (principalmente balcão)' }, emoji: '🏪' },
    { id: '20-40', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📊' },
    { id: '40-60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '📞' },
    { id: '60+', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '📱' },
  ]},
  { id: 'RT_FER_023', category: 'sales', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuánto demora una venta promedio?', 'pt-BR': 'Quanto tempo demora uma venda média?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'quick', label: { es: 'Menos de 5 minutos', 'pt-BR': 'Menos de 5 minutos' }, emoji: '⚡' },
    { id: 'medium', label: { es: '5-15 minutos', 'pt-BR': '5-15 minutos' }, emoji: '⏱️' },
    { id: 'long', label: { es: '15-30 minutos', 'pt-BR': '15-30 minutos' }, emoji: '⏰' },
    { id: 'varied', label: { es: 'Muy variable', 'pt-BR': 'Muito variável' }, emoji: '🔄' },
  ]},
  { id: 'RT_FER_024', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Hacés presupuestos para obras/proyectos?', 'pt-BR': 'Você faz orçamentos para obras/projetos?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'always', label: { es: 'Sí, es muy común', 'pt-BR': 'Sim, é muito comum' }, emoji: '📋' },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄' },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🤏' },
    { id: 'never', label: { es: 'No hago presupuestos', 'pt-BR': 'Não faço orçamentos' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_025', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Qué porcentaje de presupuestos se concretan?', 'pt-BR': 'Qual porcentagem de orçamentos se concretizam?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'high', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '📈' },
    { id: 'medium', label: { es: '30-60%', 'pt-BR': '30-60%' }, emoji: '📊' },
    { id: 'low', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' }, emoji: '📉' },
    { id: 'na', label: { es: 'No aplica', 'pt-BR': 'Não se aplica' }, emoji: '➖' },
  ]},
  { id: 'RT_FER_026', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés clientes que compran regularmente?', 'pt-BR': 'Você tem clientes que compram regularmente?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'many', label: { es: 'Sí, muchos profesionales fijos', 'pt-BR': 'Sim, muitos profissionais fixos' }, emoji: '🔄' },
    { id: 'some', label: { es: 'Algunos regulares', 'pt-BR': 'Alguns regulares' }, emoji: '👥' },
    { id: 'few', label: { es: 'Pocos, mayormente ocasionales', 'pt-BR': 'Poucos, principalmente ocasionais' }, emoji: '🚶' },
  ]},

  // ============ FINANZAS Y MÁRGENES (6) ============
  { id: 'RT_FER_027', category: 'finance', mode: 'both', dimension: 'finances', weight: 9, title: { es: '¿Cuál es tu facturación mensual promedio?', 'pt-BR': 'Qual é seu faturamento mensal médio?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'small', label: { es: 'Hasta $3M', 'pt-BR': 'Até R$60k' }, emoji: '📊' },
    { id: 'medium', label: { es: '$3M - $10M', 'pt-BR': 'R$60k - R$200k' }, emoji: '📈' },
    { id: 'large', label: { es: '$10M - $30M', 'pt-BR': 'R$200k - R$600k' }, emoji: '💰' },
    { id: 'xlarge', label: { es: 'Más de $30M', 'pt-BR': 'Mais de R$600k' }, emoji: '💎' },
  ]},
  { id: 'RT_FER_028', category: 'finance', mode: 'complete', dimension: 'finances', weight: 8, title: { es: '¿Cuánto capital tenés en stock?', 'pt-BR': 'Quanto capital você tem em estoque?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'low', label: { es: 'Menos de $5M', 'pt-BR': 'Menos de R$100k' }, emoji: '📦' },
    { id: 'medium', label: { es: '$5M - $20M', 'pt-BR': 'R$100k - R$400k' }, emoji: '🏪' },
    { id: 'high', label: { es: '$20M - $50M', 'pt-BR': 'R$400k - R$1M' }, emoji: '🏬' },
    { id: 'very_high', label: { es: 'Más de $50M', 'pt-BR': 'Mais de R$1M' }, emoji: '🏭' },
  ]},
  { id: 'RT_FER_029', category: 'finance', mode: 'complete', dimension: 'finances', weight: 8, title: { es: '¿Qué plazo te dan los proveedores?', 'pt-BR': 'Qual prazo os fornecedores te dão?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'cash', label: { es: 'Contado/Bonificado', 'pt-BR': 'À vista/Bonificado' }, emoji: '💵' },
    { id: '15-30', label: { es: '15-30 días', 'pt-BR': '15-30 dias' }, emoji: '📅' },
    { id: '30-60', label: { es: '30-60 días', 'pt-BR': '30-60 dias' }, emoji: '📆' },
    { id: '60+', label: { es: 'Más de 60 días', 'pt-BR': 'Mais de 60 dias' }, emoji: '🗓️' },
  ]},
  { id: 'RT_FER_030', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuánta deuda en cuenta corriente tenés pendiente?', 'pt-BR': 'Quanta dívida em conta corrente você tem pendente?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'none', label: { es: 'No vendo a cuenta', 'pt-BR': 'Não vendo em conta' }, emoji: '❌' },
    { id: 'low', label: { es: 'Menos del 10% mensual', 'pt-BR': 'Menos de 10% mensal' }, emoji: '✅' },
    { id: 'medium', label: { es: '10-25% mensual', 'pt-BR': '10-25% mensal' }, emoji: '⚠️' },
    { id: 'high', label: { es: 'Más del 25%', 'pt-BR': 'Mais de 25%' }, emoji: '🔴' },
  ]},
  { id: 'RT_FER_031', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Quais meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵' },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳' },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳' },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦' },
    { id: 'check', label: { es: 'Cheque', 'pt-BR': 'Cheque' }, emoji: '📝' },
    { id: 'account', label: { es: 'Cuenta corriente', 'pt-BR': 'Conta corrente' }, emoji: '📒' },
  ]},
  { id: 'RT_FER_032', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés contador?', 'pt-BR': 'Você tem contador?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes_monthly', label: { es: 'Sí, servicio mensual', 'pt-BR': 'Sim, serviço mensal' }, emoji: '📊' },
    { id: 'yes_annual', label: { es: 'Solo para balances', 'pt-BR': 'Apenas para balanços' }, emoji: '📅' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},

  // ============ OPERACIONES Y CAPACIDAD (8) ============
  { id: 'RT_FER_033', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Usás sistema de gestión?', 'pt-BR': 'Você usa sistema de gestão?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'complete', label: { es: 'Sí, completo (stock, ventas, proveedores)', 'pt-BR': 'Sim, completo (estoque, vendas, fornecedores)' }, emoji: '💻' },
    { id: 'basic', label: { es: 'Sistema básico/Caja', 'pt-BR': 'Sistema básico/Caixa' }, emoji: '🖥️' },
    { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📊' },
    { id: 'manual', label: { es: 'Manual/Cuaderno', 'pt-BR': 'Manual/Caderno' }, emoji: '📝' },
  ]},
  { id: 'RT_FER_034', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 8, title: { es: '¿Cómo manejás el inventario?', 'pt-BR': 'Como você gerencia o inventário?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'real_time', label: { es: 'Control en tiempo real', 'pt-BR': 'Controle em tempo real' }, emoji: '📡' },
    { id: 'periodic', label: { es: 'Inventario periódico', 'pt-BR': 'Inventário periódico' }, emoji: '📅' },
    { id: 'visual', label: { es: 'Visual (cuando falta, repongo)', 'pt-BR': 'Visual (quando falta, reponho)' }, emoji: '👁️' },
    { id: 'none', label: { es: 'No llevo control', 'pt-BR': 'Não faço controle' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_035', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés problemas de roturas de stock?', 'pt-BR': 'Você tem problemas de falta de estoque?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'never', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '✅' },
    { id: 'sometimes', label: { es: 'A veces en productos clave', 'pt-BR': 'Às vezes em produtos chave' }, emoji: '⚠️' },
    { id: 'often', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, emoji: '🔴' },
  ]},
  { id: 'RT_FER_036', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Con qué frecuencia te reponen los proveedores?', 'pt-BR': 'Com que frequência os fornecedores te repõem?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'daily', label: { es: 'Diario', 'pt-BR': 'Diário' }, emoji: '📦' },
    { id: 'twice_week', label: { es: '2-3 veces/semana', 'pt-BR': '2-3 vezes/semana' }, emoji: '📅' },
    { id: 'weekly', label: { es: 'Semanal', 'pt-BR': 'Semanal' }, emoji: '📆' },
    { id: 'biweekly', label: { es: 'Quincenal o más', 'pt-BR': 'Quinzenal ou mais' }, emoji: '🗓️' },
  ]},
  { id: 'RT_FER_037', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Hacés reparto/delivery?', 'pt-BR': 'Você faz entrega/delivery?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'own', label: { es: 'Sí, vehículo propio', 'pt-BR': 'Sim, veículo próprio' }, emoji: '🚚' },
    { id: 'hired', label: { es: 'Sí, tercerizado', 'pt-BR': 'Sim, terceirizado' }, emoji: '📦' },
    { id: 'customer', label: { es: 'El cliente retira', 'pt-BR': 'O cliente retira' }, emoji: '🚗' },
    { id: 'mixed', label: { es: 'Ambos', 'pt-BR': 'Ambos' }, emoji: '🔄' },
  ]},
  { id: 'RT_FER_038', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántas horas abrís?', 'pt-BR': 'Quantas horas você abre?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: '8', label: { es: '8 horas', 'pt-BR': '8 horas' }, emoji: '🕐' },
    { id: '10', label: { es: '10 horas', 'pt-BR': '10 horas' }, emoji: '🕑' },
    { id: '12', label: { es: '12 horas', 'pt-BR': '12 horas' }, emoji: '🕒' },
    { id: '12+', label: { es: 'Más de 12 horas', 'pt-BR': 'Mais de 12 horas' }, emoji: '🕓' },
  ]},
  { id: 'RT_FER_039', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Abrís los sábados?', 'pt-BR': 'Você abre aos sábados?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'full', label: { es: 'Sí, día completo', 'pt-BR': 'Sim, dia completo' }, emoji: '✅' },
    { id: 'half', label: { es: 'Sí, medio día', 'pt-BR': 'Sim, meio dia' }, emoji: '🌅' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_040', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Tenés depósito separado?', 'pt-BR': 'Você tem depósito separado?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes', label: { es: 'Sí, depósito propio', 'pt-BR': 'Sim, depósito próprio' }, emoji: '🏭' },
    { id: 'back', label: { es: 'Trastienda/Altillo', 'pt-BR': 'Fundos/Mezanino' }, emoji: '🚪' },
    { id: 'no', label: { es: 'Todo en el local', 'pt-BR': 'Tudo na loja' }, emoji: '🏪' },
  ]},

  // ============ MARKETING Y ADQUISICIÓN (5) ============
  { id: 'RT_FER_041', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Tenés presencia digital?', 'pt-BR': 'Você tem presença digital?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'google', label: { es: 'Google My Business', 'pt-BR': 'Google Meu Negócio' }, emoji: '🔍' },
    { id: 'whatsapp', label: { es: 'WhatsApp Business', 'pt-BR': 'WhatsApp Business' }, emoji: '📱' },
    { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '👤' },
    { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸' },
    { id: 'web', label: { es: 'Página web', 'pt-BR': 'Página web' }, emoji: '🌐' },
    { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_042', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Invertís en publicidad?', 'pt-BR': 'Você investe em publicidade?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'no', label: { es: 'No, todo boca a boca', 'pt-BR': 'Não, tudo boca a boca' }, emoji: '💬' },
    { id: 'local', label: { es: 'Publicidad local (radio, volantes)', 'pt-BR': 'Publicidade local (rádio, panfletos)' }, emoji: '📢' },
    { id: 'digital', label: { es: 'Publicidad digital', 'pt-BR': 'Publicidade digital' }, emoji: '📱' },
    { id: 'both', label: { es: 'Ambos', 'pt-BR': 'Ambos' }, emoji: '🔄' },
  ]},
  { id: 'RT_FER_043', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés catálogo de productos online?', 'pt-BR': 'Você tem catálogo de produtos online?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'ecommerce', label: { es: 'Sí, e-commerce completo', 'pt-BR': 'Sim, e-commerce completo' }, emoji: '🛒' },
    { id: 'catalog', label: { es: 'Catálogo sin compra online', 'pt-BR': 'Catálogo sem compra online' }, emoji: '📋' },
    { id: 'partial', label: { es: 'Solo algunos productos', 'pt-BR': 'Apenas alguns produtos' }, emoji: '📝' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_044', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cómo es tu reputación online?', 'pt-BR': 'Como é sua reputação online?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'excellent', label: { es: 'Excelente (4.5+ estrellas)', 'pt-BR': 'Excelente (4.5+ estrelas)' }, emoji: '⭐' },
    { id: 'good', label: { es: 'Buena (4-4.4)', 'pt-BR': 'Boa (4-4.4)' }, emoji: '✅' },
    { id: 'regular', label: { es: 'Regular (3.5-4)', 'pt-BR': 'Regular (3.5-4)' }, emoji: '⚠️' },
    { id: 'no_reviews', label: { es: 'Sin reseñas', 'pt-BR': 'Sem avaliações' }, emoji: '❓' },
  ]},
  { id: 'RT_FER_045', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 5, title: { es: '¿Hacés promociones?', 'pt-BR': 'Você faz promoções?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🏷️' },
    { id: 'occasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '🔄' },
    { id: 'never', label: { es: 'Nunca/Rara vez', 'pt-BR': 'Nunca/Raramente' }, emoji: '❌' },
  ]},

  // ============ EQUIPO Y ROLES (6) ============
  { id: 'RT_FER_046', category: 'team', mode: 'both', dimension: 'team', weight: 8, title: { es: '¿Cuántas personas trabajan en tu ferretería?', 'pt-BR': 'Quantas pessoas trabalham na sua ferragem?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
    { id: '2-3', label: { es: '2-3 personas', 'pt-BR': '2-3 pessoas' }, emoji: '👥' },
    { id: '4-6', label: { es: '4-6 personas', 'pt-BR': '4-6 pessoas' }, emoji: '👨‍👩‍👧' },
    { id: '7-10', label: { es: '7-10 personas', 'pt-BR': '7-10 pessoas' }, emoji: '🏢' },
    { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏭' },
  ]},
  { id: 'RT_FER_047', category: 'team', mode: 'complete', dimension: 'team', weight: 7, title: { es: '¿Es un negocio familiar?', 'pt-BR': 'É um negócio familiar?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes_multi', label: { es: 'Sí, varias generaciones', 'pt-BR': 'Sim, várias gerações' }, emoji: '👨‍👩‍👧‍👦' },
    { id: 'yes_first', label: { es: 'Sí, primera generación', 'pt-BR': 'Sim, primeira geração' }, emoji: '👪' },
    { id: 'mixed', label: { es: 'Mixto (familia + empleados)', 'pt-BR': 'Misto (família + empregados)' }, emoji: '🔄' },
    { id: 'no', label: { es: 'No es familiar', 'pt-BR': 'Não é familiar' }, emoji: '🏢' },
  ]},
  { id: 'RT_FER_048', category: 'team', mode: 'complete', dimension: 'team', weight: 7, title: { es: '¿Tu equipo tiene conocimiento técnico?', 'pt-BR': 'Sua equipe tem conhecimento técnico?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'expert', label: { es: 'Sí, muy capacitados', 'pt-BR': 'Sim, muito capacitados' }, emoji: '🎓' },
    { id: 'basic', label: { es: 'Conocimiento básico', 'pt-BR': 'Conhecimento básico' }, emoji: '📚' },
    { id: 'mixed', label: { es: 'Algunos sí, otros no', 'pt-BR': 'Alguns sim, outros não' }, emoji: '🔄' },
    { id: 'learning', label: { es: 'En capacitación', 'pt-BR': 'Em capacitação' }, emoji: '📖' },
  ]},
  { id: 'RT_FER_049', category: 'team', mode: 'complete', dimension: 'team', weight: 6, title: { es: '¿Tenés problemas para conseguir personal?', 'pt-BR': 'Você tem problemas para conseguir pessoal?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '✅' },
    { id: 'sometimes', label: { es: 'A veces cuesta', 'pt-BR': 'Às vezes é difícil' }, emoji: '⚠️' },
    { id: 'yes', label: { es: 'Sí, muy difícil', 'pt-BR': 'Sim, muito difícil' }, emoji: '🔴' },
    { id: 'na', label: { es: 'N/A (trabajo solo/familia)', 'pt-BR': 'N/A (trabalho sozinho/família)' }, emoji: '👤' },
  ]},
  { id: 'RT_FER_050', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cómo es la rotación de personal?', 'pt-BR': 'Como é a rotatividade de pessoal?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'low', label: { es: 'Baja (años)', 'pt-BR': 'Baixa (anos)' }, emoji: '✅' },
    { id: 'medium', label: { es: 'Media (6-12 meses)', 'pt-BR': 'Média (6-12 meses)' }, emoji: '⚠️' },
    { id: 'high', label: { es: 'Alta (menos de 6 meses)', 'pt-BR': 'Alta (menos de 6 meses)' }, emoji: '🔴' },
    { id: 'na', label: { es: 'N/A', 'pt-BR': 'N/A' }, emoji: '➖' },
  ]},
  { id: 'RT_FER_051', category: 'team', mode: 'complete', dimension: 'team', weight: 5, title: { es: '¿Qué roles tenés cubiertos?', 'pt-BR': 'Quais funções você tem cobertas?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'counter', label: { es: 'Vendedor/Mostrador', 'pt-BR': 'Vendedor/Balcão' }, emoji: '🛒' },
    { id: 'warehouse', label: { es: 'Depósito/Repositor', 'pt-BR': 'Depósito/Repositor' }, emoji: '📦' },
    { id: 'delivery', label: { es: 'Reparto', 'pt-BR': 'Entrega' }, emoji: '🚚' },
    { id: 'admin', label: { es: 'Administración', 'pt-BR': 'Administração' }, emoji: '📋' },
    { id: 'all_me', label: { es: 'Hago todo yo', 'pt-BR': 'Faço tudo eu' }, emoji: '🦸' },
  ]},

  // ============ RETENCIÓN Y EXPERIENCIA (5) ============
  { id: 'RT_FER_052', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Qué porcentaje de clientes vuelven?', 'pt-BR': 'Qual porcentagem de clientes voltam?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'low', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '📉' },
    { id: 'medium', label: { es: '20-50%', 'pt-BR': '20-50%' }, emoji: '📊' },
    { id: 'high', label: { es: '50-70%', 'pt-BR': '50-70%' }, emoji: '📈' },
    { id: 'very_high', label: { es: 'Más del 70%', 'pt-BR': 'Mais de 70%' }, emoji: '🚀' },
  ]},
  { id: 'RT_FER_053', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cómo manejás reclamos?', 'pt-BR': 'Como você lida com reclamações?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'proactive', label: { es: 'Resuelvo rápido y doy algo extra', 'pt-BR': 'Resolvo rápido e dou algo extra' }, emoji: '🎁' },
    { id: 'reactive', label: { es: 'Resuelvo el problema', 'pt-BR': 'Resolvo o problema' }, emoji: '✅' },
    { id: 'minimal', label: { es: 'Solo si insisten', 'pt-BR': 'Apenas se insistirem' }, emoji: '😐' },
    { id: 'few', label: { es: 'Casi no tengo reclamos', 'pt-BR': 'Quase não tenho reclamações' }, emoji: '⭐' },
  ]},
  { id: 'RT_FER_054', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés asesoramiento técnico?', 'pt-BR': 'Você oferece assessoria técnica?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'always', label: { es: 'Sí, es mi diferencial', 'pt-BR': 'Sim, é meu diferencial' }, emoji: '🎓' },
    { id: 'when_asked', label: { es: 'Si preguntan', 'pt-BR': 'Se perguntam' }, emoji: '💬' },
    { id: 'basic', label: { es: 'Solo lo básico', 'pt-BR': 'Apenas o básico' }, emoji: '📚' },
    { id: 'no', label: { es: 'No, solo vendo', 'pt-BR': 'Não, apenas vendo' }, emoji: '🛒' },
  ]},
  { id: 'RT_FER_055', category: 'reputation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés programa de fidelización?', 'pt-BR': 'Você tem programa de fidelização?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes', label: { es: 'Sí, descuentos/beneficios', 'pt-BR': 'Sim, descontos/benefícios' }, emoji: '🎁' },
    { id: 'informal', label: { es: 'Descuentos informales a conocidos', 'pt-BR': 'Descontos informais para conhecidos' }, emoji: '🤝' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_056', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 5, title: { es: '¿Manejás cambios/devoluciones fácilmente?', 'pt-BR': 'Você aceita trocas/devoluções facilmente?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'flexible', label: { es: 'Sí, política flexible', 'pt-BR': 'Sim, política flexível' }, emoji: '✅' },
    { id: 'standard', label: { es: 'Con ticket y en plazo', 'pt-BR': 'Com nota e no prazo' }, emoji: '🧾' },
    { id: 'strict', label: { es: 'Solo productos cerrados', 'pt-BR': 'Apenas produtos fechados' }, emoji: '📦' },
    { id: 'no', label: { es: 'No acepto cambios', 'pt-BR': 'Não aceito trocas' }, emoji: '❌' },
  ]},

  // ============ TECNOLOGÍA E INTEGRACIONES (4) ============
  { id: 'RT_FER_057', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Qué tecnología usás en el día a día?', 'pt-BR': 'Que tecnologia você usa no dia a dia?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'pos', label: { es: 'Sistema POS/Caja', 'pt-BR': 'Sistema POS/Caixa' }, emoji: '🖥️' },
    { id: 'stock', label: { es: 'Control de stock', 'pt-BR': 'Controle de estoque' }, emoji: '📦' },
    { id: 'whatsapp', label: { es: 'WhatsApp Business', 'pt-BR': 'WhatsApp Business' }, emoji: '📱' },
    { id: 'accounting', label: { es: 'Sistema contable', 'pt-BR': 'Sistema contábil' }, emoji: '📊' },
    { id: 'none', label: { es: 'Solo básico', 'pt-BR': 'Apenas básico' }, emoji: '📝' },
  ]},
  { id: 'RT_FER_058', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés lector de código de barras?', 'pt-BR': 'Você tem leitor de código de barras?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes_all', label: { es: 'Sí, todo codificado', 'pt-BR': 'Sim, tudo codificado' }, emoji: '📊' },
    { id: 'yes_partial', label: { es: 'Sí, pero no todo', 'pt-BR': 'Sim, mas não tudo' }, emoji: '📝' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_059', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Usás facturación electrónica?', 'pt-BR': 'Você usa faturamento eletrônico?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes_all', label: { es: 'Sí, todo', 'pt-BR': 'Sim, tudo' }, emoji: '✅' },
    { id: 'yes_partial', label: { es: 'Solo lo que piden', 'pt-BR': 'Apenas o que pedem' }, emoji: '📝' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_060', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Tenés sistema de alertas de stock bajo?', 'pt-BR': 'Você tem sistema de alertas de estoque baixo?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'automatic', label: { es: 'Sí, automático', 'pt-BR': 'Sim, automático' }, emoji: '🤖' },
    { id: 'manual', label: { es: 'Reviso manualmente', 'pt-BR': 'Reviso manualmente' }, emoji: '👁️' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},

  // ============ OBJETIVOS DEL DUEÑO (5) ============
  { id: 'RT_FER_061', category: 'goals', mode: 'both', dimension: 'growth', weight: 9, title: { es: '¿Cuál es tu principal objetivo a 12 meses?', 'pt-BR': 'Qual é seu principal objetivo para 12 meses?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'revenue', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈' },
    { id: 'margin', label: { es: 'Mejorar margen', 'pt-BR': 'Melhorar margem' }, emoji: '💰' },
    { id: 'efficiency', label: { es: 'Ordenar/Sistematizar', 'pt-BR': 'Organizar/Sistematizar' }, emoji: '⚙️' },
    { id: 'expand', label: { es: 'Abrir otra sucursal', 'pt-BR': 'Abrir outra filial' }, emoji: '🏪' },
    { id: 'specialize', label: { es: 'Especializarme', 'pt-BR': 'Especializar' }, emoji: '🎯' },
    { id: 'stability', label: { es: 'Mantener estabilidad', 'pt-BR': 'Manter estabilidade' }, emoji: '⚖️' },
  ]},
  { id: 'RT_FER_062', category: 'goals', mode: 'complete', dimension: 'growth', weight: 8, title: { es: '¿Cuánto querés crecer?', 'pt-BR': 'Quanto você quer crescer?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'stable', label: { es: 'Mantenerme igual', 'pt-BR': 'Manter igual' }, emoji: '⚖️' },
    { id: '10-20', label: { es: '10-20% más', 'pt-BR': '10-20% mais' }, emoji: '📈' },
    { id: '20-40', label: { es: '20-40% más', 'pt-BR': '20-40% mais' }, emoji: '🚀' },
    { id: '40+', label: { es: 'Más del 40%', 'pt-BR': 'Mais de 40%' }, emoji: '💥' },
  ]},
  { id: 'RT_FER_063', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Cuál es tu mayor desafío actual?', 'pt-BR': 'Qual é seu maior desafio atual?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'competition', label: { es: 'Competencia (grandes cadenas)', 'pt-BR': 'Concorrência (grandes redes)' }, emoji: '⚔️' },
    { id: 'margin', label: { es: 'Márgenes bajos', 'pt-BR': 'Margens baixas' }, emoji: '📉' },
    { id: 'stock', label: { es: 'Capital para stock', 'pt-BR': 'Capital para estoque' }, emoji: '💰' },
    { id: 'traffic', label: { es: 'Atraer clientes', 'pt-BR': 'Atrair clientes' }, emoji: '🚶' },
    { id: 'team', label: { es: 'Personal', 'pt-BR': 'Pessoal' }, emoji: '👥' },
    { id: 'systems', label: { es: 'Sistematización', 'pt-BR': 'Sistematização' }, emoji: '💻' },
  ]},
  { id: 'RT_FER_064', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Pensás en vender online?', 'pt-BR': 'Você pensa em vender online?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'already', label: { es: 'Ya vendo online', 'pt-BR': 'Já vendo online' }, emoji: '🌐' },
    { id: 'planning', label: { es: 'Sí, estoy planeándolo', 'pt-BR': 'Sim, estou planejando' }, emoji: '📋' },
    { id: 'interested', label: { es: 'Me interesa pero no sé cómo', 'pt-BR': 'Me interessa mas não sei como' }, emoji: '🤔' },
    { id: 'no', label: { es: 'No me interesa', 'pt-BR': 'Não me interessa' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_065', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Qué te gustaría automatizar?', 'pt-BR': 'O que você gostaria de automatizar?' }, type: 'multi', businessTypes: ['ferreteria'], options: [
    { id: 'stock', label: { es: 'Control de stock', 'pt-BR': 'Controle de estoque' }, emoji: '📦' },
    { id: 'pricing', label: { es: 'Actualización de precios', 'pt-BR': 'Atualização de preços' }, emoji: '💲' },
    { id: 'orders', label: { es: 'Pedidos a proveedores', 'pt-BR': 'Pedidos a fornecedores' }, emoji: '📝' },
    { id: 'billing', label: { es: 'Facturación', 'pt-BR': 'Faturamento' }, emoji: '🧾' },
    { id: 'marketing', label: { es: 'Marketing/Comunicación', 'pt-BR': 'Marketing/Comunicação' }, emoji: '📢' },
    { id: 'nothing', label: { es: 'Nada por ahora', 'pt-BR': 'Nada por enquanto' }, emoji: '➖' },
  ]},

  // ============ RIESGOS Y RESTRICCIONES (5) ============
  { id: 'RT_FER_066', category: 'operation', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuál es tu mayor riesgo actual?', 'pt-BR': 'Qual é seu maior risco atual?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'theft', label: { es: 'Robos/Pérdidas', 'pt-BR': 'Roubos/Perdas' }, emoji: '🔒' },
    { id: 'credit', label: { es: 'Cuentas incobrables', 'pt-BR': 'Contas incobráveis' }, emoji: '💸' },
    { id: 'obsolete', label: { es: 'Stock obsoleto', 'pt-BR': 'Estoque obsoleto' }, emoji: '📦' },
    { id: 'competition', label: { es: 'Competencia desleal', 'pt-BR': 'Concorrência desleal' }, emoji: '⚔️' },
    { id: 'costs', label: { es: 'Aumento de costos', 'pt-BR': 'Aumento de custos' }, emoji: '📈' },
  ]},
  { id: 'RT_FER_067', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Qué restricción te limita más?', 'pt-BR': 'Qual restrição te limita mais?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'capital', label: { es: 'Capital para stock', 'pt-BR': 'Capital para estoque' }, emoji: '💰' },
    { id: 'space', label: { es: 'Espacio físico', 'pt-BR': 'Espaço físico' }, emoji: '📐' },
    { id: 'time', label: { es: 'Mi tiempo', 'pt-BR': 'Meu tempo' }, emoji: '⏰' },
    { id: 'team', label: { es: 'Personal capacitado', 'pt-BR': 'Pessoal capacitado' }, emoji: '👥' },
    { id: 'none', label: { es: 'Ninguna crítica', 'pt-BR': 'Nenhuma crítica' }, emoji: '✅' },
  ]},
  { id: 'RT_FER_068', category: 'operation', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés seguro del negocio?', 'pt-BR': 'Você tem seguro do negócio?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️' },
    { id: 'basic', label: { es: 'Solo lo básico', 'pt-BR': 'Apenas o básico' }, emoji: '📝' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_FER_069', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Tenés sucesión planificada?', 'pt-BR': 'Você tem sucessão planejada?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes', label: { es: 'Sí, familiar/socio preparado', 'pt-BR': 'Sim, familiar/sócio preparado' }, emoji: '✅' },
    { id: 'planning', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '📋' },
    { id: 'no', label: { es: 'No, depende 100% de mí', 'pt-BR': 'Não, depende 100% de mim' }, emoji: '👤' },
    { id: 'na', label: { es: 'Muy pronto para pensar', 'pt-BR': 'Muito cedo para pensar' }, emoji: '⏳' },
  ]},
  { id: 'RT_FER_070', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Tenés competencia de grandes cadenas cerca?', 'pt-BR': 'Você tem concorrência de grandes redes perto?' }, type: 'single', businessTypes: ['ferreteria'], options: [
    { id: 'yes_strong', label: { es: 'Sí, muy fuerte', 'pt-BR': 'Sim, muito forte' }, emoji: '🔴' },
    { id: 'yes_moderate', label: { es: 'Sí, pero no tanto', 'pt-BR': 'Sim, mas não tanto' }, emoji: '⚠️' },
    { id: 'no', label: { es: 'No, soy el referente de la zona', 'pt-BR': 'Não, sou a referência da região' }, emoji: '✅' },
  ]},
];

// Export filtered by mode
export const FERRETERIA_QUICK = FERRETERIA_QUESTIONS.filter(q => q.mode === 'quick' || q.mode === 'both');
export const FERRETERIA_COMPLETE = FERRETERIA_QUESTIONS;
