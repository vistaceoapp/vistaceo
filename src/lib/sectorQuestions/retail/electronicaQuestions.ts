// Electrónica y Tecnología - 70 Ultra-Personalized Questions
import type { GastroQuestion } from '../../gastroQuestionsEngine';

export const ELECTRONICA_COMPLETE: GastroQuestion[] = [
  // IDENTIDAD (8)
  { id: 'RT_ELE_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué tipo de productos electrónicos vendés?', 'pt-BR': 'Que tipo de produtos eletrônicos você vende?' }, type: 'multi', required: true, businessTypes: ['electronica_tecnologia'], options: [
    { id: 'phones', label: { es: 'Celulares/Smartphones', 'pt-BR': 'Celulares/Smartphones' }, emoji: '📱', impactScore: 18 },
    { id: 'computers', label: { es: 'Computadoras/Notebooks', 'pt-BR': 'Computadores/Notebooks' }, emoji: '💻', impactScore: 18 },
    { id: 'audio', label: { es: 'Audio/Auriculares', 'pt-BR': 'Áudio/Fones' }, emoji: '🎧', impactScore: 15 },
    { id: 'gaming', label: { es: 'Gaming/Consolas', 'pt-BR': 'Gaming/Consoles' }, emoji: '🎮', impactScore: 15 },
    { id: 'appliances', label: { es: 'Electrodomésticos', 'pt-BR': 'Eletrodomésticos' }, emoji: '🏠', impactScore: 12 },
    { id: 'accessories', label: { es: 'Accesorios', 'pt-BR': 'Acessórios' }, emoji: '🔌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_002', category: 'identity', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Vendés productos nuevos o usados?', 'pt-BR': 'Você vende produtos novos ou usados?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'new_only', label: { es: 'Solo nuevos', 'pt-BR': 'Só novos' }, emoji: '✨', impactScore: 15 },
    { id: 'used_only', label: { es: 'Solo usados/refurbished', 'pt-BR': 'Só usados/recondicionados' }, emoji: '♻️', impactScore: 12 },
    { id: 'both', label: { es: 'Ambos', 'pt-BR': 'Ambos' }, emoji: '🔄', impactScore: 18 },
  ]},
  { id: 'RT_ELE_003', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Sos distribuidor autorizado de alguna marca?', 'pt-BR': 'Você é distribuidor autorizado de alguma marca?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_multiple', label: { es: 'Sí, varias marcas', 'pt-BR': 'Sim, várias marcas' }, emoji: '🏆', impactScore: 22 },
    { id: 'yes_one', label: { es: 'Sí, una marca', 'pt-BR': 'Sim, uma marca' }, emoji: '🥇', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_004', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuántos m² tiene tu local?', 'pt-BR': 'Quantos m² tem sua loja?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'small', label: { es: 'Hasta 30m²', 'pt-BR': 'Até 30m²' }, emoji: '📐', impactScore: 8 },
    { id: 'medium', label: { es: '30-80m²', 'pt-BR': '30-80m²' }, emoji: '🏪', impactScore: 12 },
    { id: 'large', label: { es: '80-200m²', 'pt-BR': '80-200m²' }, emoji: '🏢', impactScore: 18 },
    { id: 'mega', label: { es: 'Más de 200m²', 'pt-BR': 'Mais de 200m²' }, emoji: '🏬', impactScore: 20 },
  ]},
  { id: 'RT_ELE_005', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Dónde está ubicada tu tienda?', 'pt-BR': 'Onde está localizada sua loja?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'mall', label: { es: 'Shopping/Centro comercial', 'pt-BR': 'Shopping center' }, emoji: '🏬', impactScore: 18 },
    { id: 'tech_zone', label: { es: 'Zona tecnológica/Galería', 'pt-BR': 'Zona tecnológica/Galeria' }, emoji: '💻', impactScore: 20 },
    { id: 'commercial', label: { es: 'Calle comercial', 'pt-BR': 'Rua comercial' }, emoji: '🏢', impactScore: 15 },
    { id: 'online_only', label: { es: 'Solo online', 'pt-BR': 'Só online' }, emoji: '🌐', impactScore: 18 },
  ]},
  { id: 'RT_ELE_006', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu segmento principal?', 'pt-BR': 'Qual é seu segmento principal?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'consumer', label: { es: 'Consumidor final', 'pt-BR': 'Consumidor final' }, emoji: '👤', impactScore: 15 },
    { id: 'business', label: { es: 'Empresas/B2B', 'pt-BR': 'Empresas/B2B' }, emoji: '🏢', impactScore: 18 },
    { id: 'gamers', label: { es: 'Gamers', 'pt-BR': 'Gamers' }, emoji: '🎮', impactScore: 15 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 12 },
  ]},
  { id: 'RT_ELE_007', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hace cuánto estás en el rubro?', 'pt-BR': 'Há quanto tempo você está no ramo?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'new', label: { es: 'Menos de 2 años', 'pt-BR': 'Menos de 2 anos' }, emoji: '🌱', impactScore: 8 },
    { id: 'established', label: { es: '2-5 años', 'pt-BR': '2-5 anos' }, emoji: '🌿', impactScore: 15 },
    { id: 'veteran', label: { es: '5-10 años', 'pt-BR': '5-10 anos' }, emoji: '🌳', impactScore: 18 },
    { id: 'legacy', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆', impactScore: 22 },
  ]},
  { id: 'RT_ELE_008', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés presencia online?', 'pt-BR': 'Você tem presença online?' }, type: 'multi', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'ecommerce', label: { es: 'E-commerce propio', 'pt-BR': 'E-commerce próprio' }, emoji: '🌐', impactScore: 20 },
    { id: 'marketplace', label: { es: 'Marketplaces', 'pt-BR': 'Marketplaces' }, emoji: '🛒', impactScore: 18 },
    { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 12 },
    { id: 'none', label: { es: 'Solo físico', 'pt-BR': 'Só físico' }, emoji: '🏪', impactScore: 5 },
  ]},

  // OPERACIÓN (10)
  { id: 'RT_ELE_009', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cómo gestionás el inventario?', 'pt-BR': 'Como você gerencia o inventário?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'erp', label: { es: 'Sistema ERP', 'pt-BR': 'Sistema ERP' }, emoji: '💻', impactScore: 22 },
    { id: 'pos', label: { es: 'POS con inventario', 'pt-BR': 'POS com inventário' }, emoji: '📊', impactScore: 18 },
    { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📋', impactScore: 10 },
    { id: 'manual', label: { es: 'Manual', 'pt-BR': 'Manual' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'RT_ELE_010', category: 'operation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Ofrecés servicio técnico?', 'pt-BR': 'Você oferece assistência técnica?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_inhouse', label: { es: 'Sí, propio', 'pt-BR': 'Sim, próprio' }, emoji: '🔧', impactScore: 22 },
    { id: 'yes_partner', label: { es: 'Sí, tercerizado', 'pt-BR': 'Sim, terceirizado' }, emoji: '🤝', impactScore: 15 },
    { id: 'warranty_only', label: { es: 'Solo garantías', 'pt-BR': 'Só garantias' }, emoji: '📋', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_011', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés control de números de serie?', 'pt-BR': 'Você tem controle de números de série?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_system', label: { es: 'Sí, sistematizado', 'pt-BR': 'Sim, sistematizado' }, emoji: '💻', impactScore: 22 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📝', impactScore: 15 },
    { id: 'partial', label: { es: 'Solo algunos productos', 'pt-BR': 'Só alguns produtos' }, emoji: '🔄', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_012', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cómo manejás las garantías?', 'pt-BR': 'Como você lida com garantias?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'extended', label: { es: 'Extendida propia', 'pt-BR': 'Estendida própria' }, emoji: '🛡️', impactScore: 22 },
    { id: 'manufacturer', label: { es: 'Solo fabricante', 'pt-BR': 'Só fabricante' }, emoji: '🏭', impactScore: 15 },
    { id: 'basic', label: { es: 'Básica legal', 'pt-BR': 'Básica legal' }, emoji: '📋', impactScore: 10 },
  ]},
  { id: 'RT_ELE_013', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuánto demora tu reposición de stock?', 'pt-BR': 'Quanto tempo leva para repor estoque?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'fast', label: { es: '1-3 días', 'pt-BR': '1-3 dias' }, emoji: '⚡', impactScore: 22 },
    { id: 'normal', label: { es: '4-7 días', 'pt-BR': '4-7 dias' }, emoji: '📦', impactScore: 15 },
    { id: 'slow', label: { es: '1-2 semanas', 'pt-BR': '1-2 semanas' }, emoji: '🐢', impactScore: 10 },
    { id: 'import', label: { es: 'Importación (+2 semanas)', 'pt-BR': 'Importação (+2 semanas)' }, emoji: '✈️', impactScore: 8 },
  ]},
  { id: 'RT_ELE_014', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés productos en exhibición?', 'pt-BR': 'Você tem produtos em exposição?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_all', label: { es: 'Sí, todos funcionando', 'pt-BR': 'Sim, todos funcionando' }, emoji: '✨', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '📱', impactScore: 15 },
    { id: 'dummy', label: { es: 'Solo dummies', 'pt-BR': 'Só dummies' }, emoji: '📦', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_015', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés configuración/setup?', 'pt-BR': 'Você oferece configuração/setup?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_free', label: { es: 'Sí, gratis', 'pt-BR': 'Sim, grátis' }, emoji: '🎁', impactScore: 22 },
    { id: 'yes_paid', label: { es: 'Sí, con costo', 'pt-BR': 'Sim, com custo' }, emoji: '💰', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_016', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés sistema anti-robo?', 'pt-BR': 'Você tem sistema anti-furto?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🔒', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📹', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_017', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Hacés envíos?', 'pt-BR': 'Você faz entregas?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_own', label: { es: 'Sí, logística propia', 'pt-BR': 'Sim, logística própria' }, emoji: '🚚', impactScore: 20 },
    { id: 'yes_third', label: { es: 'Sí, tercerizado', 'pt-BR': 'Sim, terceirizado' }, emoji: '📦', impactScore: 18 },
    { id: 'pickup', label: { es: 'Solo retiro', 'pt-BR': 'Só retirada' }, emoji: '🏪', impactScore: 10 },
  ]},
  { id: 'RT_ELE_018', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántas horas abrís?', 'pt-BR': 'Quantas horas você abre?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: '8-10', label: { es: '8-10 horas', 'pt-BR': '8-10 horas' }, emoji: '🕐', impactScore: 12 },
    { id: '10-12', label: { es: '10-12 horas', 'pt-BR': '10-12 horas' }, emoji: '🕕', impactScore: 18 },
    { id: 'mall', label: { es: 'Horario shopping', 'pt-BR': 'Horário shopping' }, emoji: '🏬', impactScore: 15 },
    { id: '24x7', label: { es: 'Online 24/7', 'pt-BR': 'Online 24/7' }, emoji: '🌐', impactScore: 20 },
  ]},

  // FINANZAS (10)
  { id: 'RT_ELE_019', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'number', businessTypes: ['electronica_tecnologia'] },
  { id: 'RT_ELE_020', category: 'finance', mode: 'both', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu margen promedio?', 'pt-BR': 'Qual é sua margem média?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: '5-10', label: { es: '5-10%', 'pt-BR': '5-10%' }, emoji: '📊', impactScore: 8 },
    { id: '10-15', label: { es: '10-15%', 'pt-BR': '10-15%' }, emoji: '📈', impactScore: 12 },
    { id: '15-25', label: { es: '15-25%', 'pt-BR': '15-25%' }, emoji: '💰', impactScore: 18 },
    { id: '25+', label: { es: 'Más de 25%', 'pt-BR': 'Mais de 25%' }, emoji: '💎', impactScore: 22 },
  ]},
  { id: 'RT_ELE_021', category: 'finance', mode: 'complete', dimension: 'finances', weight: 8, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Que meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 10 },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 12 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 15 },
    { id: 'installments', label: { es: 'Cuotas', 'pt-BR': 'Parcelamento' }, emoji: '📊', impactScore: 20 },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦', impactScore: 15 },
  ]},
  { id: 'RT_ELE_022', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Ofrecés financiamiento propio?', 'pt-BR': 'Você oferece financiamento próprio?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '💳', impactScore: 20 },
    { id: 'partner', label: { es: 'Con financiera', 'pt-BR': 'Com financeira' }, emoji: '🏦', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_023', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuánto stock tenés en valor?', 'pt-BR': 'Quanto estoque você tem em valor?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'low', label: { es: 'Conservador', 'pt-BR': 'Conservador' }, emoji: '🐢', impactScore: 10 },
    { id: 'medium', label: { es: 'Moderado', 'pt-BR': 'Moderado' }, emoji: '⚖️', impactScore: 15 },
    { id: 'high', label: { es: 'Alto', 'pt-BR': 'Alto' }, emoji: '📦', impactScore: 18 },
    { id: 'variable', label: { es: 'Variable', 'pt-BR': 'Variável' }, emoji: '📊', impactScore: 12 },
  ]},
  { id: 'RT_ELE_024', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cómo comprás a proveedores?', 'pt-BR': 'Como você compra de fornecedores?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'credit_60', label: { es: 'Crédito +60 días', 'pt-BR': 'Crédito +60 dias' }, emoji: '🌟', impactScore: 22 },
    { id: 'credit_30', label: { es: 'Crédito 30 días', 'pt-BR': 'Crédito 30 dias' }, emoji: '💚', impactScore: 18 },
    { id: 'cash', label: { es: 'Contado', 'pt-BR': 'À vista' }, emoji: '💵', impactScore: 10 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 15 },
  ]},
  { id: 'RT_ELE_025', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés seguro de mercadería?', 'pt-BR': 'Você tem seguro de mercadoria?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_026', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cuánto es tu merma/robo anual?', 'pt-BR': 'Quanto é sua perda/furto anual?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'low', label: { es: 'Menos del 1%', 'pt-BR': 'Menos de 1%' }, emoji: '💚', impactScore: 22 },
    { id: 'medium', label: { es: '1-3%', 'pt-BR': '1-3%' }, emoji: '💛', impactScore: 15 },
    { id: 'high', label: { es: 'Más del 3%', 'pt-BR': 'Mais de 3%' }, emoji: '🔴', impactScore: 5 },
    { id: 'unknown', label: { es: 'No sé', 'pt-BR': 'Não sei' }, emoji: '❓', impactScore: 8 },
  ]},
  { id: 'RT_ELE_027', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Importás directamente?', 'pt-BR': 'Você importa diretamente?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '✈️', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📦', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_028', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cómo es tu flujo de caja?', 'pt-BR': 'Como é seu fluxo de caixa?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'healthy', label: { es: 'Saludable', 'pt-BR': 'Saudável' }, emoji: '💚', impactScore: 22 },
    { id: 'seasonal', label: { es: 'Estacional', 'pt-BR': 'Sazonal' }, emoji: '📊', impactScore: 15 },
    { id: 'tight', label: { es: 'Ajustado', 'pt-BR': 'Apertado' }, emoji: '💛', impactScore: 10 },
    { id: 'critical', label: { es: 'Crítico', 'pt-BR': 'Crítico' }, emoji: '🔴', impactScore: 5 },
  ]},

  // EQUIPO (8)
  { id: 'RT_ELE_029', category: 'team', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántas personas trabajan?', 'pt-BR': 'Quantas pessoas trabalham?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤', impactScore: 8 },
    { id: '2-4', label: { es: '2-4 personas', 'pt-BR': '2-4 pessoas' }, emoji: '👥', impactScore: 12 },
    { id: '5-10', label: { es: '5-10 personas', 'pt-BR': '5-10 pessoas' }, emoji: '👨‍👩‍👧', impactScore: 18 },
    { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏢', impactScore: 22 },
  ]},
  { id: 'RT_ELE_030', category: 'team', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tu equipo tiene conocimiento técnico?', 'pt-BR': 'Sua equipe tem conhecimento técnico?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'expert', label: { es: 'Experto', 'pt-BR': 'Especialista' }, emoji: '🎓', impactScore: 22 },
    { id: 'good', label: { es: 'Bueno', 'pt-BR': 'Bom' }, emoji: '📚', impactScore: 18 },
    { id: 'basic', label: { es: 'Básico', 'pt-BR': 'Básico' }, emoji: '📖', impactScore: 12 },
    { id: 'none', label: { es: 'Vendedores solamente', 'pt-BR': 'Só vendedores' }, emoji: '💼', impactScore: 8 },
  ]},
  { id: 'RT_ELE_031', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés comisiones por ventas?', 'pt-BR': 'Você tem comissões por vendas?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_tiered', label: { es: 'Sí, escalonadas', 'pt-BR': 'Sim, escalonadas' }, emoji: '📈', impactScore: 22 },
    { id: 'yes_fixed', label: { es: 'Sí, fijas', 'pt-BR': 'Sim, fixas' }, emoji: '📊', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_032', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cómo es la rotación de personal?', 'pt-BR': 'Como é a rotatividade de pessoal?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'low', label: { es: 'Baja', 'pt-BR': 'Baixa' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: 'Media', 'pt-BR': 'Média' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alta', 'pt-BR': 'Alta' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'RT_ELE_033', category: 'team', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hay capacitación de productos?', 'pt-BR': 'Há treinamento de produtos?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '🎓', impactScore: 22 },
    { id: 'yes_launch', label: { es: 'Sí, en lanzamientos', 'pt-BR': 'Sim, em lançamentos' }, emoji: '🚀', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_034', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés técnicos de servicio?', 'pt-BR': 'Você tem técnicos de serviço?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_dedicated', label: { es: 'Sí, dedicados', 'pt-BR': 'Sim, dedicados' }, emoji: '🔧', impactScore: 22 },
    { id: 'yes_shared', label: { es: 'Sí, compartidos', 'pt-BR': 'Sim, compartilhados' }, emoji: '🤝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_035', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Usás uniformes/dress code?', 'pt-BR': 'Você usa uniformes/dress code?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_uniform', label: { es: 'Sí, uniforme', 'pt-BR': 'Sim, uniforme' }, emoji: '👔', impactScore: 18 },
    { id: 'dress_code', label: { es: 'Dress code', 'pt-BR': 'Dress code' }, emoji: '👕', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '🔄', impactScore: 10 },
  ]},
  { id: 'RT_ELE_036', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés objetivos de venta por vendedor?', 'pt-BR': 'Você tem metas de venda por vendedor?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🎯', impactScore: 20 },
    { id: 'team_only', label: { es: 'Solo grupales', 'pt-BR': 'Só grupais' }, emoji: '👥', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // VENTAS (8)
  { id: 'RT_ELE_037', category: 'sales', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos clientes atendés por día?', 'pt-BR': 'Quantos clientes você atende por dia?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: '1-20', label: { es: '1-20', 'pt-BR': '1-20' }, emoji: '👤', impactScore: 8 },
    { id: '21-50', label: { es: '21-50', 'pt-BR': '21-50' }, emoji: '👥', impactScore: 15 },
    { id: '51-100', label: { es: '51-100', 'pt-BR': '51-100' }, emoji: '🏢', impactScore: 18 },
    { id: '100+', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, emoji: '🔥', impactScore: 22 },
  ]},
  { id: 'RT_ELE_038', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Cuál es tu tasa de conversión?', 'pt-BR': 'Qual é sua taxa de conversão?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'high', label: { es: 'Alta (+40%)', 'pt-BR': 'Alta (+40%)' }, emoji: '🌟', impactScore: 22 },
    { id: 'medium', label: { es: 'Media (20-40%)', 'pt-BR': 'Média (20-40%)' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Baja (-20%)', 'pt-BR': 'Baixa (-20%)' }, emoji: '💛', impactScore: 10 },
    { id: 'unknown', label: { es: 'No mido', 'pt-BR': 'Não meço' }, emoji: '❓', impactScore: 5 },
  ]},
  { id: 'RT_ELE_039', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Qué porcentaje son clientes recurrentes?', 'pt-BR': 'Que porcentagem são clientes recorrentes?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'high', label: { es: 'Más del 40%', 'pt-BR': 'Mais de 40%' }, emoji: '🌟', impactScore: 22 },
    { id: 'medium', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '💛', impactScore: 10 },
  ]},
  { id: 'RT_ELE_040', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Vendés accesorios/complementos?', 'pt-BR': 'Você vende acessórios/complementos?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🔌', impactScore: 22 },
    { id: 'yes_passive', label: { es: 'Sí, si piden', 'pt-BR': 'Sim, se pedem' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_041', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuál es tu época más fuerte?', 'pt-BR': 'Qual é sua época mais forte?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'holidays', label: { es: 'Fiestas', 'pt-BR': 'Festas' }, emoji: '🎄', impactScore: 15 },
    { id: 'back_school', label: { es: 'Vuelta a clases', 'pt-BR': 'Volta às aulas' }, emoji: '📚', impactScore: 15 },
    { id: 'cyber', label: { es: 'Cyber/Black Friday', 'pt-BR': 'Cyber/Black Friday' }, emoji: '💻', impactScore: 18 },
    { id: 'even', label: { es: 'Parejo', 'pt-BR': 'Distribuído' }, emoji: '⚖️', impactScore: 12 },
  ]},
  { id: 'RT_ELE_042', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Vendés garantías extendidas?', 'pt-BR': 'Você vende garantias estendidas?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🛡️', impactScore: 22 },
    { id: 'yes_passive', label: { es: 'Sí, si piden', 'pt-BR': 'Sim, se pedem' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_043', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Vendés a empresas/instituciones?', 'pt-BR': 'Você vende para empresas/instituições?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_main', label: { es: 'Sí, es importante', 'pt-BR': 'Sim, é importante' }, emoji: '🏢', impactScore: 20 },
    { id: 'yes_minor', label: { es: 'Sí, marginal', 'pt-BR': 'Sim, marginal' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_044', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Ofrecés trade-in/canje?', 'pt-BR': 'Você oferece trade-in/troca?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🔄', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},

  // MARKETING (8)
  { id: 'RT_ELE_045', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Tenés redes sociales activas?', 'pt-BR': 'Você tem redes sociais ativas?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_active', label: { es: 'Sí, muy activas', 'pt-BR': 'Sim, muito ativas' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_regular', label: { es: 'Sí, regulares', 'pt-BR': 'Sim, regulares' }, emoji: '📲', impactScore: 15 },
    { id: 'yes_basic', label: { es: 'Sí, básicas', 'pt-BR': 'Sim, básicas' }, emoji: '📴', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_046', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Invertís en publicidad online?', 'pt-BR': 'Você investe em publicidade online?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_consistent', label: { es: 'Sí, constante', 'pt-BR': 'Sim, constante' }, emoji: '💰', impactScore: 22 },
    { id: 'yes_campaigns', label: { es: 'Sí, campañas', 'pt-BR': 'Sim, campanhas' }, emoji: '📢', impactScore: 18 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🐢', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_047', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Hacés reviews/unboxings?', 'pt-BR': 'Você faz reviews/unboxings?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_video', label: { es: 'Sí, en video', 'pt-BR': 'Sim, em vídeo' }, emoji: '📹', impactScore: 22 },
    { id: 'yes_photo', label: { es: 'Sí, fotos', 'pt-BR': 'Sim, fotos' }, emoji: '📸', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_048', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Trabajás con influencers tech?', 'pt-BR': 'Você trabalha com influenciadores tech?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '⭐', impactScore: 20 },
    { id: 'occasionally', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_049', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés newsletter/mailing?', 'pt-BR': 'Você tem newsletter/mailing?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '📧', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📮', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_050', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés programa de fidelización?', 'pt-BR': 'Você tem programa de fidelização?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_digital', label: { es: 'Sí, digital', 'pt-BR': 'Sim, digital' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💳', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_051', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Usás WhatsApp Business?', 'pt-BR': 'Você usa WhatsApp Business?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_catalog', label: { es: 'Sí, con catálogo', 'pt-BR': 'Sim, com catálogo' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_052', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Participás en ferias tech?', 'pt-BR': 'Você participa de feiras tech?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🎪', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},

  // REPUTACIÓN (6)
  { id: 'RT_ELE_053', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Tenés reseñas online?', 'pt-BR': 'Você tem avaliações online?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'many_good', label: { es: 'Muchas y buenas', 'pt-BR': 'Muitas e boas' }, emoji: '⭐', impactScore: 22 },
    { id: 'some_good', label: { es: 'Algunas buenas', 'pt-BR': 'Algumas boas' }, emoji: '🌟', impactScore: 15 },
    { id: 'few', label: { es: 'Pocas', 'pt-BR': 'Poucas' }, emoji: '💫', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_054', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '🌟', impactScore: 22 },
    { id: '4-4.5', label: { es: '4.0 - 4.4', 'pt-BR': '4.0 - 4.4' }, emoji: '⭐', impactScore: 15 },
    { id: '3.5-4', label: { es: '3.5 - 3.9', 'pt-BR': '3.5 - 3.9' }, emoji: '💛', impactScore: 10 },
    { id: 'below', label: { es: 'Menos de 3.5', 'pt-BR': 'Menos de 3.5' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'RT_ELE_055', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Respondés a reseñas?', 'pt-BR': 'Você responde às avaliações?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 22 },
    { id: 'usually', label: { es: 'Generalmente', 'pt-BR': 'Geralmente' }, emoji: '💬', impactScore: 15 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '😓', impactScore: 8 },
  ]},
  { id: 'RT_ELE_056', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Qué % de reclamos resolvés satisfactoriamente?', 'pt-BR': 'Que % de reclamações você resolve satisfatoriamente?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'high', label: { es: 'Más del 90%', 'pt-BR': 'Mais de 90%' }, emoji: '💚', impactScore: 22 },
    { id: 'medium', label: { es: '70-90%', 'pt-BR': '70-90%' }, emoji: '💛', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 70%', 'pt-BR': 'Menos de 70%' }, emoji: '🔴', impactScore: 8 },
  ]},
  { id: 'RT_ELE_057', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés certificaciones/premios?', 'pt-BR': 'Você tem certificações/prêmios?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🏆', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_058', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Aparecés en prensa/medios tech?', 'pt-BR': 'Você aparece em mídia tech?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '📰', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},

  // METAS (12)
  { id: 'RT_ELE_059', category: 'goals', mode: 'both', dimension: 'growth', weight: 8, title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'sales', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈', impactScore: 15 },
    { id: 'margin', label: { es: 'Mejorar margen', 'pt-BR': 'Melhorar margem' }, emoji: '💰', impactScore: 15 },
    { id: 'online', label: { es: 'Crecer online', 'pt-BR': 'Crescer online' }, emoji: '🌐', impactScore: 18 },
    { id: 'expand', label: { es: 'Abrir más locales', 'pt-BR': 'Abrir mais lojas' }, emoji: '🚀', impactScore: 20 },
  ]},
  { id: 'RT_ELE_060', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Pensás agregar nuevas categorías?', 'pt-BR': 'Você pensa em adicionar novas categorias?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_soon', label: { es: 'Sí, pronto', 'pt-BR': 'Sim, em breve' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_061', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Querés ser distribuidor oficial?', 'pt-BR': 'Você quer ser distribuidor oficial?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'have', label: { es: 'Ya soy', 'pt-BR': 'Já sou' }, emoji: '🏆', impactScore: 22 },
    { id: 'planning', label: { es: 'Sí, en proceso', 'pt-BR': 'Sim, em processo' }, emoji: '📋', impactScore: 18 },
    { id: 'interested', label: { es: 'Me interesa', 'pt-BR': 'Me interessa' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_062', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Cuál es tu mayor desafío?', 'pt-BR': 'Qual é seu maior desafio?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'competition', label: { es: 'Competencia online', 'pt-BR': 'Concorrência online' }, emoji: '🌐', impactScore: 15 },
    { id: 'margin', label: { es: 'Márgenes bajos', 'pt-BR': 'Margens baixas' }, emoji: '📉', impactScore: 15 },
    { id: 'stock', label: { es: 'Gestión de stock', 'pt-BR': 'Gestão de estoque' }, emoji: '📦', impactScore: 12 },
    { id: 'tech', label: { es: 'Obsolescencia', 'pt-BR': 'Obsolescência' }, emoji: '⏳', impactScore: 12 },
  ]},
  { id: 'RT_ELE_063', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Qué área querés mejorar?', 'pt-BR': 'Que área você quer melhorar?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'service', label: { es: 'Servicio técnico', 'pt-BR': 'Assistência técnica' }, emoji: '🔧', impactScore: 15 },
    { id: 'digital', label: { es: 'Presencia digital', 'pt-BR': 'Presença digital' }, emoji: '📱', impactScore: 18 },
    { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, emoji: '👥', impactScore: 12 },
    { id: 'operations', label: { es: 'Operaciones', 'pt-BR': 'Operações' }, emoji: '⚙️', impactScore: 12 },
  ]},
  { id: 'RT_ELE_064', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Tenés plan de negocios?', 'pt-BR': 'Você tem plano de negócios?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 20 },
    { id: 'informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_065', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Considerás franquiciar?', 'pt-BR': 'Você considera franquear?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🚀', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_ELE_066', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés programa de reciclaje e-waste?', 'pt-BR': 'Você tem programa de reciclagem e-waste?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '♻️', impactScore: 20 },
    { id: 'planning', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_067', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés soporte post-venta?', 'pt-BR': 'Você oferece suporte pós-venda?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_dedicated', label: { es: 'Sí, dedicado', 'pt-BR': 'Sim, dedicado' }, emoji: '🎧', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_068', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Vendés servicios adicionales?', 'pt-BR': 'Você vende serviços adicionais?' }, type: 'multi', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'install', label: { es: 'Instalación', 'pt-BR': 'Instalação' }, emoji: '🔧', impactScore: 15 },
    { id: 'training', label: { es: 'Capacitación', 'pt-BR': 'Treinamento' }, emoji: '🎓', impactScore: 15 },
    { id: 'maintenance', label: { es: 'Mantenimiento', 'pt-BR': 'Manutenção' }, emoji: '⚙️', impactScore: 18 },
    { id: 'none', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_ELE_069', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés acuerdos con bancos/financieras?', 'pt-BR': 'Você tem acordos com bancos/financeiras?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🏦', impactScore: 22 },
    { id: 'yes_one', label: { es: 'Sí, alguno', 'pt-BR': 'Sim, algum' }, emoji: '💳', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_ELE_070', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cuál es tu diferenciador principal?', 'pt-BR': 'Qual é seu diferencial principal?' }, type: 'single', businessTypes: ['electronica_tecnologia'], options: [
    { id: 'price', label: { es: 'Precio', 'pt-BR': 'Preço' }, emoji: '💰', impactScore: 12 },
    { id: 'service', label: { es: 'Servicio', 'pt-BR': 'Serviço' }, emoji: '🤝', impactScore: 18 },
    { id: 'expertise', label: { es: 'Conocimiento', 'pt-BR': 'Conhecimento' }, emoji: '🎓', impactScore: 20 },
    { id: 'stock', label: { es: 'Stock/Variedad', 'pt-BR': 'Estoque/Variedade' }, emoji: '📦', impactScore: 15 },
  ]},
];
