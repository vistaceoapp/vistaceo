// Zapatería / Calzado - 70 Ultra-Personalized Questions
// Categories: identity, operation, sales, menu, finance, team, marketing, reputation, goals

import type { GastroQuestion } from '../../gastroQuestionsEngine';

export const CALZADO_COMPLETE: GastroQuestion[] = [
  // IDENTIDAD (7)
  { id: 'RT_CAL_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué tipo de calzado vendés principalmente?', 'pt-BR': 'Que tipo de calçado você vende principalmente?' }, type: 'multi', required: true, businessTypes: ['zapateria_calzado'], options: [
    { id: 'casual', label: { es: 'Casual/Urbano', 'pt-BR': 'Casual/Urbano' }, emoji: '👟', impactScore: 15 },
    { id: 'formal', label: { es: 'Formal/Vestir', 'pt-BR': 'Formal/Social' }, emoji: '👞', impactScore: 12 },
    { id: 'sport', label: { es: 'Deportivo', 'pt-BR': 'Esportivo' }, emoji: '🏃', impactScore: 15 },
    { id: 'kids', label: { es: 'Infantil', 'pt-BR': 'Infantil' }, emoji: '👶', impactScore: 12 },
    { id: 'work', label: { es: 'Trabajo/Seguridad', 'pt-BR': 'Trabalho/Segurança' }, emoji: '🥾', impactScore: 10 },
  ]},
  { id: 'RT_CAL_002', category: 'identity', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Cuál es tu segmento de precio?', 'pt-BR': 'Qual é seu segmento de preço?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'economy', label: { es: 'Económico', 'pt-BR': 'Econômico' }, emoji: '💰', impactScore: 10 },
    { id: 'mid', label: { es: 'Precio medio', 'pt-BR': 'Preço médio' }, emoji: '⚖️', impactScore: 15 },
    { id: 'premium', label: { es: 'Premium', 'pt-BR': 'Premium' }, emoji: '✨', impactScore: 18 },
    { id: 'luxury', label: { es: 'Lujo/Diseño', 'pt-BR': 'Luxo/Design' }, emoji: '💎', impactScore: 20 },
  ]},
  { id: 'RT_CAL_003', category: 'identity', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Vendés marcas propias o reconocidas?', 'pt-BR': 'Você vende marcas próprias ou reconhecidas?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'own', label: { es: 'Marca propia', 'pt-BR': 'Marca própria' }, emoji: '🏷️', impactScore: 18 },
    { id: 'brands', label: { es: 'Marcas reconocidas', 'pt-BR': 'Marcas reconhecidas' }, emoji: '⭐', impactScore: 15 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 15 },
    { id: 'exclusive', label: { es: 'Distribuidor exclusivo', 'pt-BR': 'Distribuidor exclusivo' }, emoji: '🔗', impactScore: 20 },
  ]},
  { id: 'RT_CAL_004', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿A qué público apuntás?', 'pt-BR': 'Qual público você atende?' }, type: 'multi', businessTypes: ['zapateria_calzado'], options: [
    { id: 'women', label: { es: 'Mujer', 'pt-BR': 'Feminino' }, emoji: '👠', impactScore: 15 },
    { id: 'men', label: { es: 'Hombre', 'pt-BR': 'Masculino' }, emoji: '👞', impactScore: 12 },
    { id: 'kids', label: { es: 'Niños', 'pt-BR': 'Infantil' }, emoji: '👶', impactScore: 12 },
    { id: 'unisex', label: { es: 'Unisex', 'pt-BR': 'Unissex' }, emoji: '👟', impactScore: 10 },
  ]},
  { id: 'RT_CAL_005', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuántos m² tiene tu local?', 'pt-BR': 'Quantos m² tem sua loja?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'small', label: { es: 'Hasta 30m²', 'pt-BR': 'Até 30m²' }, emoji: '📐', impactScore: 8 },
    { id: 'medium', label: { es: '30-80m²', 'pt-BR': '30-80m²' }, emoji: '🏪', impactScore: 12 },
    { id: 'large', label: { es: '80-200m²', 'pt-BR': '80-200m²' }, emoji: '🏢', impactScore: 18 },
    { id: 'mega', label: { es: 'Más de 200m²', 'pt-BR': 'Mais de 200m²' }, emoji: '🏬', impactScore: 20 },
  ]},
  { id: 'RT_CAL_006', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Dónde está ubicado tu local?', 'pt-BR': 'Onde está localizada sua loja?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'mall', label: { es: 'Shopping/Centro comercial', 'pt-BR': 'Shopping center' }, emoji: '🏬', impactScore: 18 },
    { id: 'commercial', label: { es: 'Calle comercial', 'pt-BR': 'Rua comercial' }, emoji: '🏢', impactScore: 15 },
    { id: 'neighborhood', label: { es: 'Barrio', 'pt-BR': 'Bairro' }, emoji: '🏘️', impactScore: 12 },
    { id: 'outlet', label: { es: 'Outlet', 'pt-BR': 'Outlet' }, emoji: '🏪', impactScore: 15 },
  ]},
  { id: 'RT_CAL_007', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Vendés accesorios de calzado?', 'pt-BR': 'Você vende acessórios de calçado?' }, type: 'multi', businessTypes: ['zapateria_calzado'], options: [
    { id: 'socks', label: { es: 'Medias/Calcetines', 'pt-BR': 'Meias' }, emoji: '🧦', impactScore: 12 },
    { id: 'care', label: { es: 'Cuidado/Limpieza', 'pt-BR': 'Cuidado/Limpeza' }, emoji: '✨', impactScore: 15 },
    { id: 'insoles', label: { es: 'Plantillas', 'pt-BR': 'Palmilhas' }, emoji: '👣', impactScore: 15 },
    { id: 'bags', label: { es: 'Bolsos/Carteras', 'pt-BR': 'Bolsas/Carteiras' }, emoji: '👜', impactScore: 12 },
    { id: 'none', label: { es: 'No vendo accesorios', 'pt-BR': 'Não vendo acessórios' }, emoji: '❌', impactScore: 5 },
  ]},

  // OPERACIÓN (8)
  { id: 'RT_CAL_008', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántas referencias/modelos manejás?', 'pt-BR': 'Quantas referências/modelos você trabalha?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'small', label: { es: 'Menos de 100', 'pt-BR': 'Menos de 100' }, emoji: '📦', impactScore: 8 },
    { id: 'medium', label: { es: '100-300', 'pt-BR': '100-300' }, emoji: '🏪', impactScore: 15 },
    { id: 'large', label: { es: '300-600', 'pt-BR': '300-600' }, emoji: '🏢', impactScore: 18 },
    { id: 'mega', label: { es: 'Más de 600', 'pt-BR': 'Mais de 600' }, emoji: '🏬', impactScore: 20 },
  ]},
  { id: 'RT_CAL_009', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cómo gestionás el stock por talle?', 'pt-BR': 'Como você gerencia o estoque por tamanho?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'system', label: { es: 'Sistema/Software', 'pt-BR': 'Sistema/Software' }, emoji: '💻', impactScore: 20 },
    { id: 'pos', label: { es: 'POS con inventario', 'pt-BR': 'POS com inventário' }, emoji: '📊', impactScore: 18 },
    { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📋', impactScore: 12 },
    { id: 'manual', label: { es: 'Manual', 'pt-BR': 'Manual' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'RT_CAL_010', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Ofrecés servicio de reparación?', 'pt-BR': 'Você oferece serviço de reparo?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_inhouse', label: { es: 'Sí, propio', 'pt-BR': 'Sim, próprio' }, emoji: '🔧', impactScore: 20 },
    { id: 'yes_external', label: { es: 'Sí, tercerizado', 'pt-BR': 'Sim, terceirizado' }, emoji: '🤝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_011', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés espacio de prueba cómodo?', 'pt-BR': 'Você tem espaço de prova confortável?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_premium', label: { es: 'Sí, muy cómodo', 'pt-BR': 'Sim, muito confortável' }, emoji: '🛋️', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '🪑', impactScore: 12 },
    { id: 'limited', label: { es: 'Limitado', 'pt-BR': 'Limitado' }, emoji: '📐', impactScore: 8 },
  ]},
  { id: 'RT_CAL_012', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Política de devoluciones?', 'pt-BR': 'Política de devoluções?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'full', label: { es: 'Devolución total', 'pt-BR': 'Devolução total' }, emoji: '💰', impactScore: 18 },
    { id: 'exchange', label: { es: 'Solo cambio', 'pt-BR': 'Só troca' }, emoji: '🔄', impactScore: 15 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '📝', impactScore: 12 },
    { id: 'no', label: { es: 'No acepto', 'pt-BR': 'Não aceito' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_013', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Vendés online?', 'pt-BR': 'Você vende online?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'ecommerce', label: { es: 'E-commerce propio', 'pt-BR': 'E-commerce próprio' }, emoji: '🌐', impactScore: 20 },
    { id: 'marketplace', label: { es: 'Marketplaces', 'pt-BR': 'Marketplaces' }, emoji: '🛒', impactScore: 18 },
    { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_014', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántas horas abrís?', 'pt-BR': 'Quantas horas você abre?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: '6-8', label: { es: '6-8 horas', 'pt-BR': '6-8 horas' }, emoji: '🕐', impactScore: 10 },
    { id: '8-10', label: { es: '8-10 horas', 'pt-BR': '8-10 horas' }, emoji: '🕒', impactScore: 15 },
    { id: '10-12', label: { es: '10-12 horas', 'pt-BR': '10-12 horas' }, emoji: '🕕', impactScore: 18 },
    { id: 'mall', label: { es: 'Horario shopping', 'pt-BR': 'Horário shopping' }, emoji: '🏬', impactScore: 18 },
  ]},
  { id: 'RT_CAL_015', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés vidriera profesional?', 'pt-BR': 'Você tem vitrine profissional?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_pro', label: { es: 'Sí, profesional', 'pt-BR': 'Sim, profissional' }, emoji: '✨', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básica' }, emoji: '🪟', impactScore: 12 },
    { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌', impactScore: 5 },
  ]},

  // FINANZAS (8)
  { id: 'RT_CAL_016', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'number', businessTypes: ['zapateria_calzado'] },
  { id: 'RT_CAL_017', category: 'finance', mode: 'both', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu margen bruto promedio?', 'pt-BR': 'Qual é sua margem bruta média?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: '25-35', label: { es: '25-35%', 'pt-BR': '25-35%' }, emoji: '📊', impactScore: 8 },
    { id: '35-45', label: { es: '35-45%', 'pt-BR': '35-45%' }, emoji: '📈', impactScore: 12 },
    { id: '45-55', label: { es: '45-55%', 'pt-BR': '45-55%' }, emoji: '💰', impactScore: 18 },
    { id: '55+', label: { es: 'Más de 55%', 'pt-BR': 'Mais de 55%' }, emoji: '💎', impactScore: 22 },
  ]},
  { id: 'RT_CAL_018', category: 'finance', mode: 'complete', dimension: 'efficiency', weight: 8, title: { es: '¿Qué porcentaje de stock queda sin vender?', 'pt-BR': 'Que porcentagem de estoque fica sem vender?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'low', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: '10-25%', 'pt-BR': '10-25%' }, emoji: '💛', impactScore: 15 },
    { id: 'high', label: { es: '25-40%', 'pt-BR': '25-40%' }, emoji: '🟠', impactScore: 8 },
    { id: 'very_high', label: { es: 'Más del 40%', 'pt-BR': 'Mais de 40%' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'RT_CAL_019', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Que meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['zapateria_calzado'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 10 },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 12 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 15 },
    { id: 'installments', label: { es: 'Cuotas', 'pt-BR': 'Parcelamento' }, emoji: '📊', impactScore: 18 },
    { id: 'qr', label: { es: 'QR/Billetera', 'pt-BR': 'QR/Carteira' }, emoji: '📱', impactScore: 15 },
  ]},
  { id: 'RT_CAL_020', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cómo es tu relación con proveedores?', 'pt-BR': 'Como é sua relação com fornecedores?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'credit_60', label: { es: 'Crédito +60 días', 'pt-BR': 'Crédito +60 dias' }, emoji: '🌟', impactScore: 20 },
    { id: 'credit_30', label: { es: 'Crédito 30 días', 'pt-BR': 'Crédito 30 dias' }, emoji: '💚', impactScore: 15 },
    { id: 'consignment', label: { es: 'Consignación', 'pt-BR': 'Consignação' }, emoji: '🤝', impactScore: 18 },
    { id: 'cash', label: { es: 'Contado', 'pt-BR': 'À vista' }, emoji: '💵', impactScore: 8 },
  ]},
  { id: 'RT_CAL_021', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuánto pagás de alquiler?', 'pt-BR': 'Quanto você paga de aluguel?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'own', label: { es: 'Local propio', 'pt-BR': 'Local próprio' }, emoji: '🏠', impactScore: 20 },
    { id: 'low', label: { es: 'Bajo para la zona', 'pt-BR': 'Baixo para a região' }, emoji: '💚', impactScore: 15 },
    { id: 'average', label: { es: 'Promedio', 'pt-BR': 'Médio' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alto', 'pt-BR': 'Alto' }, emoji: '🔴', impactScore: 8 },
  ]},
  { id: 'RT_CAL_022', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Hacés liquidaciones?', 'pt-BR': 'Você faz liquidações?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'planned', label: { es: 'Sí, planificadas', 'pt-BR': 'Sim, planejadas' }, emoji: '📅', impactScore: 18 },
    { id: 'seasonal', label: { es: 'Sí, fin temporada', 'pt-BR': 'Sim, fim de temporada' }, emoji: '🍂', impactScore: 15 },
    { id: 'frequent', label: { es: 'Sí, frecuentes', 'pt-BR': 'Sim, frequentes' }, emoji: '🔥', impactScore: 10 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🐢', impactScore: 12 },
  ]},
  { id: 'RT_CAL_023', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés seguro comercial?', 'pt-BR': 'Você tem seguro comercial?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // EQUIPO (6)
  { id: 'RT_CAL_024', category: 'team', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántas personas trabajan en el local?', 'pt-BR': 'Quantas pessoas trabalham na loja?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤', impactScore: 8 },
    { id: '2-3', label: { es: '2-3 personas', 'pt-BR': '2-3 pessoas' }, emoji: '👥', impactScore: 12 },
    { id: '4-6', label: { es: '4-6 personas', 'pt-BR': '4-6 pessoas' }, emoji: '👨‍👩‍👧', impactScore: 18 },
    { id: '7+', label: { es: '7 o más', 'pt-BR': '7 ou mais' }, emoji: '🏢', impactScore: 20 },
  ]},
  { id: 'RT_CAL_025', category: 'team', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tu equipo conoce bien los productos?', 'pt-BR': 'Sua equipe conhece bem os produtos?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'expert', label: { es: 'Expertos', 'pt-BR': 'Especialistas' }, emoji: '🎓', impactScore: 20 },
    { id: 'good', label: { es: 'Buen conocimiento', 'pt-BR': 'Bom conhecimento' }, emoji: '📚', impactScore: 15 },
    { id: 'basic', label: { es: 'Básico', 'pt-BR': 'Básico' }, emoji: '📝', impactScore: 10 },
  ]},
  { id: 'RT_CAL_026', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés comisión por ventas?', 'pt-BR': 'Você tem comissão por vendas?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_fixed', label: { es: 'Sí, % fijo', 'pt-BR': 'Sim, % fixo' }, emoji: '📊', impactScore: 18 },
    { id: 'yes_tiered', label: { es: 'Sí, escalado', 'pt-BR': 'Sim, escalonado' }, emoji: '📈', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_027', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cómo es la rotación de personal?', 'pt-BR': 'Como é a rotatividade de pessoal?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'low', label: { es: 'Baja', 'pt-BR': 'Baixa' }, emoji: '💚', impactScore: 18 },
    { id: 'medium', label: { es: 'Media', 'pt-BR': 'Média' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alta', 'pt-BR': 'Alta' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'RT_CAL_028', category: 'team', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tu equipo usa uniforme?', 'pt-BR': 'Sua equipe usa uniforme?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_brand', label: { es: 'Sí, con marca', 'pt-BR': 'Sim, com marca' }, emoji: '👔', impactScore: 18 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '👕', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '🔄', impactScore: 8 },
  ]},
  { id: 'RT_CAL_029', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tu equipo tiene metas de venta?', 'pt-BR': 'Sua equipe tem metas de venda?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_individual', label: { es: 'Sí, individuales', 'pt-BR': 'Sim, individuais' }, emoji: '🎯', impactScore: 20 },
    { id: 'yes_team', label: { es: 'Sí, grupales', 'pt-BR': 'Sim, grupais' }, emoji: '👥', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // VENTAS (7)
  { id: 'RT_CAL_030', category: 'sales', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos clientes atendés por día?', 'pt-BR': 'Quantos clientes você atende por dia?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: '1-15', label: { es: '1-15 clientes', 'pt-BR': '1-15 clientes' }, emoji: '👤', impactScore: 8 },
    { id: '16-40', label: { es: '16-40 clientes', 'pt-BR': '16-40 clientes' }, emoji: '👥', impactScore: 15 },
    { id: '41-80', label: { es: '41-80 clientes', 'pt-BR': '41-80 clientes' }, emoji: '🏢', impactScore: 18 },
    { id: '80+', label: { es: 'Más de 80', 'pt-BR': 'Mais de 80' }, emoji: '🔥', impactScore: 22 },
  ]},
  { id: 'RT_CAL_031', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu tasa de conversión?', 'pt-BR': 'Qual é sua taxa de conversão?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'high', label: { es: 'Alta (+35%)', 'pt-BR': 'Alta (+35%)' }, emoji: '🌟', impactScore: 20 },
    { id: 'medium', label: { es: 'Media (20-35%)', 'pt-BR': 'Média (20-35%)' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Baja (-20%)', 'pt-BR': 'Baixa (-20%)' }, emoji: '💛', impactScore: 10 },
    { id: 'unknown', label: { es: 'No la mido', 'pt-BR': 'Não meço' }, emoji: '❓', impactScore: 5 },
  ]},
  { id: 'RT_CAL_032', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Vendés productos complementarios?', 'pt-BR': 'Você vende produtos complementares?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🛍️', impactScore: 20 },
    { id: 'yes_passive', label: { es: 'Sí, si preguntan', 'pt-BR': 'Sim, se perguntam' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_033', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Qué porcentaje son clientes recurrentes?', 'pt-BR': 'Que porcentagem são clientes recorrentes?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'high', label: { es: 'Más del 40%', 'pt-BR': 'Mais de 40%' }, emoji: '🌟', impactScore: 20 },
    { id: 'medium', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '💛', impactScore: 10 },
    { id: 'unknown', label: { es: 'No lo sé', 'pt-BR': 'Não sei' }, emoji: '❓', impactScore: 5 },
  ]},
  { id: 'RT_CAL_034', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuál es tu día más fuerte?', 'pt-BR': 'Qual é seu dia mais forte?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'weekend', label: { es: 'Fin de semana', 'pt-BR': 'Fim de semana' }, emoji: '📅', impactScore: 15 },
    { id: 'weekday', label: { es: 'Día de semana', 'pt-BR': 'Dia de semana' }, emoji: '💼', impactScore: 12 },
    { id: 'payday', label: { es: 'Días de cobro', 'pt-BR': 'Dias de pagamento' }, emoji: '💰', impactScore: 18 },
    { id: 'even', label: { es: 'Parejo', 'pt-BR': 'Distribuído' }, emoji: '⚖️', impactScore: 15 },
  ]},
  { id: 'RT_CAL_035', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Ofrecés envío a domicilio?', 'pt-BR': 'Você oferece entrega em domicílio?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_free', label: { es: 'Sí, gratis', 'pt-BR': 'Sim, grátis' }, emoji: '🚚', impactScore: 20 },
    { id: 'yes_paid', label: { es: 'Sí, con costo', 'pt-BR': 'Sim, com custo' }, emoji: '📦', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_036', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Asesorás sobre talles/hormas?', 'pt-BR': 'Você assessora sobre tamanhos/formas?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_expert', label: { es: 'Sí, expertos', 'pt-BR': 'Sim, especialistas' }, emoji: '👣', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💬', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // MARKETING (7)
  { id: 'RT_CAL_037', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Tenés redes sociales activas?', 'pt-BR': 'Você tem redes sociais ativas?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_active', label: { es: 'Sí, muy activas', 'pt-BR': 'Sim, muito ativas' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_regular', label: { es: 'Sí, regulares', 'pt-BR': 'Sim, regulares' }, emoji: '📲', impactScore: 15 },
    { id: 'yes_basic', label: { es: 'Sí, básicas', 'pt-BR': 'Sim, básicas' }, emoji: '📴', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_038', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Hacés fotos de producto?', 'pt-BR': 'Você faz fotos de produto?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_pro', label: { es: 'Sí, profesionales', 'pt-BR': 'Sim, profissionais' }, emoji: '📸', impactScore: 20 },
    { id: 'yes_semi', label: { es: 'Sí, semi-pro', 'pt-BR': 'Sim, semi-pro' }, emoji: '📷', impactScore: 15 },
    { id: 'phone', label: { es: 'Celular', 'pt-BR': 'Celular' }, emoji: '📱', impactScore: 10 },
    { id: 'provider', label: { es: 'Uso del proveedor', 'pt-BR': 'Uso do fornecedor' }, emoji: '📦', impactScore: 12 },
  ]},
  { id: 'RT_CAL_039', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Tenés programa de fidelización?', 'pt-BR': 'Você tem programa de fidelização?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_digital', label: { es: 'Sí, digital', 'pt-BR': 'Sim, digital' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_card', label: { es: 'Sí, tarjeta', 'pt-BR': 'Sim, cartão' }, emoji: '💳', impactScore: 15 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💬', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_040', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Invertís en publicidad?', 'pt-BR': 'Você investe em publicidade?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_constant', label: { es: 'Sí, constante', 'pt-BR': 'Sim, constante' }, emoji: '💰', impactScore: 20 },
    { id: 'yes_campaigns', label: { es: 'Sí, campañas', 'pt-BR': 'Sim, campanhas' }, emoji: '📢', impactScore: 15 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🐢', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_041', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Usás WhatsApp Business?', 'pt-BR': 'Você usa WhatsApp Business?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_catalog', label: { es: 'Sí, con catálogo', 'pt-BR': 'Sim, com catálogo' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💬', impactScore: 15 },
    { id: 'personal', label: { es: 'WA personal', 'pt-BR': 'WA pessoal' }, emoji: '📲', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_042', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés email marketing?', 'pt-BR': 'Você faz email marketing?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '📧', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📬', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_043', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Participás en eventos/ferias?', 'pt-BR': 'Você participa de eventos/feiras?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🎪', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📅', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // REPUTACIÓN (6)
  { id: 'RT_CAL_044', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Tenés reseñas online?', 'pt-BR': 'Você tem avaliações online?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'many_good', label: { es: 'Muchas y buenas', 'pt-BR': 'Muitas e boas' }, emoji: '⭐', impactScore: 20 },
    { id: 'some_good', label: { es: 'Algunas buenas', 'pt-BR': 'Algumas boas' }, emoji: '🌟', impactScore: 15 },
    { id: 'few', label: { es: 'Pocas', 'pt-BR': 'Poucas' }, emoji: '💫', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_045', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '🌟', impactScore: 20 },
    { id: '4-4.5', label: { es: '4.0 - 4.4', 'pt-BR': '4.0 - 4.4' }, emoji: '⭐', impactScore: 15 },
    { id: '3.5-4', label: { es: '3.5 - 3.9', 'pt-BR': '3.5 - 3.9' }, emoji: '💛', impactScore: 10 },
    { id: 'below', label: { es: 'Menos de 3.5', 'pt-BR': 'Menos de 3.5' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'RT_CAL_046', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Respondés a comentarios?', 'pt-BR': 'Você responde a comentários?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 20 },
    { id: 'usually', label: { es: 'Generalmente', 'pt-BR': 'Geralmente' }, emoji: '💬', impactScore: 15 },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄', impactScore: 10 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'RT_CAL_047', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés clientes embajadores?', 'pt-BR': 'Você tem clientes embaixadores?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_many', label: { es: 'Sí, muchos', 'pt-BR': 'Sim, muitos' }, emoji: '💜', impactScore: 20 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '💚', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_048', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés packaging de marca?', 'pt-BR': 'Você tem embalagem de marca?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_premium', label: { es: 'Sí, premium', 'pt-BR': 'Sim, premium' }, emoji: '🎁', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📦', impactScore: 15 },
    { id: 'generic', label: { es: 'Genérico', 'pt-BR': 'Genérico' }, emoji: '🛍️', impactScore: 8 },
  ]},
  { id: 'RT_CAL_049', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cuántos años tiene tu negocio?', 'pt-BR': 'Quantos anos tem seu negócio?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'new', label: { es: 'Menos de 2 años', 'pt-BR': 'Menos de 2 anos' }, emoji: '🌱', impactScore: 10 },
    { id: 'growing', label: { es: '2-5 años', 'pt-BR': '2-5 anos' }, emoji: '📈', impactScore: 15 },
    { id: 'established', label: { es: '5-15 años', 'pt-BR': '5-15 anos' }, emoji: '🏢', impactScore: 18 },
    { id: 'veteran', label: { es: 'Más de 15 años', 'pt-BR': 'Mais de 15 anos' }, emoji: '🏆', impactScore: 20 },
  ]},

  // METAS (7)
  { id: 'RT_CAL_050', category: 'goals', mode: 'both', dimension: 'growth', weight: 8, title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'sales', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈', impactScore: 15 },
    { id: 'margin', label: { es: 'Mejorar margen', 'pt-BR': 'Melhorar margem' }, emoji: '💰', impactScore: 15 },
    { id: 'expand', label: { es: 'Expandir', 'pt-BR': 'Expandir' }, emoji: '🚀', impactScore: 18 },
    { id: 'digital', label: { es: 'Crecer online', 'pt-BR': 'Crescer online' }, emoji: '💻', impactScore: 18 },
    { id: 'brand', label: { es: 'Fortalecer marca', 'pt-BR': 'Fortalecer marca' }, emoji: '✨', impactScore: 15 },
  ]},
  { id: 'RT_CAL_051', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Pensás abrir más locales?', 'pt-BR': 'Você pensa em abrir mais lojas?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_soon', label: { es: 'Sí, pronto', 'pt-BR': 'Sim, em breve' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'maybe', label: { es: 'Quizás', 'pt-BR': 'Talvez' }, emoji: '🤔', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_052', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Qué área querés mejorar?', 'pt-BR': 'Que área você quer melhorar?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'marketing', label: { es: 'Marketing', 'pt-BR': 'Marketing' }, emoji: '📱', impactScore: 15 },
    { id: 'operations', label: { es: 'Operaciones', 'pt-BR': 'Operações' }, emoji: '📦', impactScore: 15 },
    { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, emoji: '👥', impactScore: 12 },
    { id: 'finance', label: { es: 'Finanzas', 'pt-BR': 'Finanças' }, emoji: '💰', impactScore: 12 },
    { id: 'customer', label: { es: 'Experiencia cliente', 'pt-BR': 'Experiência cliente' }, emoji: '🤝', impactScore: 15 },
  ]},
  { id: 'RT_CAL_053', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Cuál es tu mayor desafío?', 'pt-BR': 'Qual é seu maior desafio?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, emoji: '🏢', impactScore: 12 },
    { id: 'traffic', label: { es: 'Atraer clientes', 'pt-BR': 'Atrair clientes' }, emoji: '👥', impactScore: 15 },
    { id: 'stock', label: { es: 'Gestión de stock', 'pt-BR': 'Gestão de estoque' }, emoji: '📦', impactScore: 12 },
    { id: 'cash', label: { es: 'Flujo de caja', 'pt-BR': 'Fluxo de caixa' }, emoji: '💸', impactScore: 15 },
    { id: 'sizes', label: { es: 'Curva de talles', 'pt-BR': 'Curva de tamanhos' }, emoji: '📊', impactScore: 15 },
  ]},
  { id: 'RT_CAL_054', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Tenés plan de negocios?', 'pt-BR': 'Você tem plano de negócios?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_documented', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 20 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_055', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Considerás vender online?', 'pt-BR': 'Você considera vender online?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'already', label: { es: 'Ya vendo', 'pt-BR': 'Já vendo' }, emoji: '🌐', impactScore: 20 },
    { id: 'planning', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '📋', impactScore: 15 },
    { id: 'interested', label: { es: 'Me interesa', 'pt-BR': 'Me interessa' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_056', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Querés ser distribuidor exclusivo?', 'pt-BR': 'Você quer ser distribuidor exclusivo?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'already', label: { es: 'Ya soy', 'pt-BR': 'Já sou' }, emoji: '🔗', impactScore: 20 },
    { id: 'yes', label: { es: 'Sí, me interesa', 'pt-BR': 'Sim, me interessa' }, emoji: '🎯', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // ESPECÍFICAS CALZADO (14 adicionales)
  { id: 'RT_CAL_057', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Manejás curva de talles completa?', 'pt-BR': 'Você trabalha com curva completa de tamanhos?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_full', label: { es: 'Sí, completa', 'pt-BR': 'Sim, completa' }, emoji: '📊', impactScore: 20 },
    { id: 'yes_main', label: { es: 'Sí, principales', 'pt-BR': 'Sim, principais' }, emoji: '📈', impactScore: 15 },
    { id: 'limited', label: { es: 'Limitada', 'pt-BR': 'Limitada' }, emoji: '📉', impactScore: 8 },
  ]},
  { id: 'RT_CAL_058', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés medidor de pies?', 'pt-BR': 'Você tem medidor de pés?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_digital', label: { es: 'Sí, digital', 'pt-BR': 'Sim, digital' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📏', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_059', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Vendés calzado ortopédico?', 'pt-BR': 'Você vende calçado ortopédico?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_specialty', label: { es: 'Sí, especialidad', 'pt-BR': 'Sim, especialidade' }, emoji: '👣', impactScore: 20 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🦶', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_060', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Vendés al por mayor?', 'pt-BR': 'Você vende no atacado?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_main', label: { es: 'Sí, importante', 'pt-BR': 'Sim, importante' }, emoji: '📦', impactScore: 18 },
    { id: 'yes_minor', label: { es: 'Sí, marginal', 'pt-BR': 'Sim, marginal' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_061', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Importás directamente?', 'pt-BR': 'Você importa diretamente?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '✈️', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📦', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_062', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuánto es tu merma anual?', 'pt-BR': 'Quanto é sua perda anual?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'low', label: { es: 'Menos del 2%', 'pt-BR': 'Menos de 2%' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: '2-5%', 'pt-BR': '2-5%' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Más del 5%', 'pt-BR': 'Mais de 5%' }, emoji: '🔴', impactScore: 5 },
    { id: 'unknown', label: { es: 'No sé', 'pt-BR': 'Não sei' }, emoji: '❓', impactScore: 8 },
  ]},
  { id: 'RT_CAL_063', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés sistema anti-robo?', 'pt-BR': 'Você tem sistema anti-furto?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_electronic', label: { es: 'Sí, electrónico', 'pt-BR': 'Sim, eletrônico' }, emoji: '🔒', impactScore: 20 },
    { id: 'yes_camera', label: { es: 'Sí, cámaras', 'pt-BR': 'Sim, câmeras' }, emoji: '📹', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_CAL_064', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Vendés productos veganos/eco?', 'pt-BR': 'Você vende produtos veganos/eco?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_main', label: { es: 'Sí, principal', 'pt-BR': 'Sim, principal' }, emoji: '🌿', impactScore: 20 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🌱', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_065', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Ofrecés gift cards?', 'pt-BR': 'Você oferece gift cards?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_digital', label: { es: 'Sí, digitales', 'pt-BR': 'Sim, digitais' }, emoji: '📱', impactScore: 18 },
    { id: 'yes_physical', label: { es: 'Sí, físicas', 'pt-BR': 'Sim, físicas' }, emoji: '🎁', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_066', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés depósito separado?', 'pt-BR': 'Você tem depósito separado?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_same', label: { es: 'Sí, en local', 'pt-BR': 'Sim, no local' }, emoji: '📦', impactScore: 15 },
    { id: 'yes_external', label: { es: 'Sí, externo', 'pt-BR': 'Sim, externo' }, emoji: '🏢', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_067', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés catálogos/lookbooks?', 'pt-BR': 'Você faz catálogos/lookbooks?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_pro', label: { es: 'Sí, profesionales', 'pt-BR': 'Sim, profissionais' }, emoji: '📕', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básicos', 'pt-BR': 'Sim, básicos' }, emoji: '📄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_068', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés línea escolar?', 'pt-BR': 'Você tem linha escolar?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_main', label: { es: 'Sí, principal', 'pt-BR': 'Sim, principal' }, emoji: '🎒', impactScore: 18 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '👟', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_CAL_069', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Vendés pares sueltos/desparejados?', 'pt-BR': 'Você vende pares únicos/desparelhados?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '👟', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'RT_CAL_070', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Considerás franquiciar?', 'pt-BR': 'Você considera franquear?' }, type: 'single', businessTypes: ['zapateria_calzado'], options: [
    { id: 'yes_ready', label: { es: 'Sí, listo', 'pt-BR': 'Sim, pronto' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
];
