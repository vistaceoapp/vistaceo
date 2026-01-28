// Tienda de Moda / Indumentaria - 70 Ultra-Personalized Questions
// Categories: identity, operation, sales, menu, finance, team, marketing, reputation, goals

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const MODA_COMPLETE: VistaSetupQuestion[] = [
  // IDENTIDAD (6)
  { id: 'RT_MOD_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué tipo de ropa vendés principalmente?', 'pt-BR': 'Que tipo de roupa você vende principalmente?' }, type: 'multi', required: true, businessTypes: ['moda_indumentaria'], options: [
    { id: 'women', label: { es: 'Mujer', 'pt-BR': 'Feminino' }, emoji: '👗', impactScore: 15 },
    { id: 'men', label: { es: 'Hombre', 'pt-BR': 'Masculino' }, emoji: '👔', impactScore: 12 },
    { id: 'kids', label: { es: 'Niños', 'pt-BR': 'Infantil' }, emoji: '👶', impactScore: 12 },
    { id: 'teens', label: { es: 'Teens/Juvenil', 'pt-BR': 'Teens/Juvenil' }, emoji: '🧑', impactScore: 12 },
    { id: 'unisex', label: { es: 'Unisex', 'pt-BR': 'Unissex' }, emoji: '👕', impactScore: 10 },
  ]},
  { id: 'RT_MOD_002', category: 'identity', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Cuál es tu posicionamiento de precio?', 'pt-BR': 'Qual é seu posicionamento de preço?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'economy', label: { es: 'Económico/Popular', 'pt-BR': 'Econômico/Popular' }, emoji: '💰', impactScore: 10 },
    { id: 'mid', label: { es: 'Precio medio', 'pt-BR': 'Preço médio' }, emoji: '⚖️', impactScore: 15 },
    { id: 'premium', label: { es: 'Premium', 'pt-BR': 'Premium' }, emoji: '✨', impactScore: 18 },
    { id: 'luxury', label: { es: 'Lujo', 'pt-BR': 'Luxo' }, emoji: '💎', impactScore: 20 },
  ]},
  { id: 'RT_MOD_003', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Vendés marcas propias o multimarca?', 'pt-BR': 'Você vende marcas próprias ou multimarcas?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'own', label: { es: 'Marca propia', 'pt-BR': 'Marca própria' }, emoji: '🏷️', impactScore: 20 },
    { id: 'multi', label: { es: 'Multimarca', 'pt-BR': 'Multimarcas' }, emoji: '🛍️', impactScore: 15 },
    { id: 'franchise', label: { es: 'Franquicia/Exclusiva', 'pt-BR': 'Franquia/Exclusiva' }, emoji: '🔗', impactScore: 18 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 15 },
  ]},
  { id: 'RT_MOD_004', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu estilo predominante?', 'pt-BR': 'Qual é seu estilo predominante?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'casual', label: { es: 'Casual/Urbano', 'pt-BR': 'Casual/Urbano' }, emoji: '👕', impactScore: 12 },
    { id: 'formal', label: { es: 'Formal/Ejecutivo', 'pt-BR': 'Formal/Executivo' }, emoji: '👔', impactScore: 15 },
    { id: 'sport', label: { es: 'Deportivo/Athleisure', 'pt-BR': 'Esportivo/Athleisure' }, emoji: '🏃', impactScore: 15 },
    { id: 'boho', label: { es: 'Bohemio/Alternativo', 'pt-BR': 'Boho/Alternativo' }, emoji: '🌸', impactScore: 12 },
    { id: 'trendy', label: { es: 'Trendy/Fast fashion', 'pt-BR': 'Trendy/Fast fashion' }, emoji: '🔥', impactScore: 18 },
  ]},
  { id: 'RT_MOD_005', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuántos m² tiene tu local?', 'pt-BR': 'Quantos m² tem sua loja?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'small', label: { es: 'Hasta 40m²', 'pt-BR': 'Até 40m²' }, emoji: '📐', impactScore: 8 },
    { id: 'medium', label: { es: '40-100m²', 'pt-BR': '40-100m²' }, emoji: '🏪', impactScore: 12 },
    { id: 'large', label: { es: '100-300m²', 'pt-BR': '100-300m²' }, emoji: '🏢', impactScore: 18 },
    { id: 'flagship', label: { es: 'Más de 300m²', 'pt-BR': 'Mais de 300m²' }, emoji: '🏬', impactScore: 20 },
  ]},
  { id: 'RT_MOD_006', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Dónde está ubicada tu tienda?', 'pt-BR': 'Onde está localizada sua loja?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'mall', label: { es: 'Shopping/Centro comercial', 'pt-BR': 'Shopping center' }, emoji: '🏬', impactScore: 18 },
    { id: 'commercial', label: { es: 'Calle comercial', 'pt-BR': 'Rua comercial' }, emoji: '🏢', impactScore: 15 },
    { id: 'neighborhood', label: { es: 'Barrio/Local', 'pt-BR': 'Bairro/Local' }, emoji: '🏘️', impactScore: 12 },
    { id: 'outlet', label: { es: 'Outlet/Galería', 'pt-BR': 'Outlet/Galeria' }, emoji: '🏪', impactScore: 15 },
  ]},

  // OPERACIÓN (8)
  { id: 'RT_MOD_007', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántas colecciones/temporadas manejás?', 'pt-BR': 'Quantas coleções/temporadas você trabalha?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: '2', label: { es: '2 (Verano/Invierno)', 'pt-BR': '2 (Verão/Inverno)' }, emoji: '☀️', impactScore: 12 },
    { id: '4', label: { es: '4 estacionales', 'pt-BR': '4 estacionais' }, emoji: '🍂', impactScore: 18 },
    { id: 'continuous', label: { es: 'Continuo/Fast fashion', 'pt-BR': 'Contínuo/Fast fashion' }, emoji: '🔄', impactScore: 20 },
    { id: 'basic', label: { es: 'Básicos sin temporada', 'pt-BR': 'Básicos sem temporada' }, emoji: '📦', impactScore: 10 },
  ]},
  { id: 'RT_MOD_008', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cómo gestionás el stock?', 'pt-BR': 'Como você gerencia o estoque?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'system', label: { es: 'Sistema/Software', 'pt-BR': 'Sistema/Software' }, emoji: '💻', impactScore: 20 },
    { id: 'pos', label: { es: 'POS con inventario', 'pt-BR': 'POS com inventário' }, emoji: '📊', impactScore: 18 },
    { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📋', impactScore: 12 },
    { id: 'visual', label: { es: 'Visual/Manual', 'pt-BR': 'Visual/Manual' }, emoji: '👁️', impactScore: 5 },
  ]},
  { id: 'RT_MOD_009', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés probadores?', 'pt-BR': 'Você tem provadores?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🚪', impactScore: 18 },
    { id: 'yes_few', label: { es: 'Sí, pocos', 'pt-BR': 'Sim, poucos' }, emoji: '📐', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_010', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Ofrecés servicio de arreglos/ajustes?', 'pt-BR': 'Você oferece serviço de ajustes?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_inhouse', label: { es: 'Sí, en casa', 'pt-BR': 'Sim, na loja' }, emoji: '✂️', impactScore: 20 },
    { id: 'yes_external', label: { es: 'Sí, tercerizado', 'pt-BR': 'Sim, terceirizado' }, emoji: '🤝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_011', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cómo manejás las devoluciones?', 'pt-BR': 'Como você lida com devoluções?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'full_refund', label: { es: 'Devolución total', 'pt-BR': 'Devolução total' }, emoji: '💰', impactScore: 18 },
    { id: 'exchange', label: { es: 'Solo cambio', 'pt-BR': 'Só troca' }, emoji: '🔄', impactScore: 15 },
    { id: 'credit', label: { es: 'Crédito/Nota', 'pt-BR': 'Crédito/Nota' }, emoji: '📝', impactScore: 12 },
    { id: 'no_returns', label: { es: 'No acepto', 'pt-BR': 'Não aceito' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_012', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tenés vidriera/vitrina profesional?', 'pt-BR': 'Você tem vitrine profissional?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_rotating', label: { es: 'Sí, roto mensualmente', 'pt-BR': 'Sim, rodo mensalmente' }, emoji: '✨', impactScore: 20 },
    { id: 'yes_seasonal', label: { es: 'Sí, por temporada', 'pt-BR': 'Sim, por temporada' }, emoji: '🍂', impactScore: 15 },
    { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básica' }, emoji: '🪟', impactScore: 10 },
    { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_013', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántas horas abrís por día?', 'pt-BR': 'Quantas horas você abre por dia?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: '6-8', label: { es: '6-8 horas', 'pt-BR': '6-8 horas' }, emoji: '🕐', impactScore: 10 },
    { id: '8-10', label: { es: '8-10 horas', 'pt-BR': '8-10 horas' }, emoji: '🕒', impactScore: 15 },
    { id: '10-12', label: { es: '10-12 horas', 'pt-BR': '10-12 horas' }, emoji: '🕕', impactScore: 18 },
    { id: 'mall', label: { es: 'Horario shopping', 'pt-BR': 'Horário shopping' }, emoji: '🏬', impactScore: 18 },
  ]},
  { id: 'RT_MOD_014', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Vendés online?', 'pt-BR': 'Você vende online?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_ecommerce', label: { es: 'Sí, e-commerce propio', 'pt-BR': 'Sim, e-commerce próprio' }, emoji: '🌐', impactScore: 20 },
    { id: 'yes_marketplace', label: { es: 'Sí, marketplaces', 'pt-BR': 'Sim, marketplaces' }, emoji: '🛒', impactScore: 18 },
    { id: 'yes_social', label: { es: 'Sí, redes sociales', 'pt-BR': 'Sim, redes sociais' }, emoji: '📱', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // FINANZAS (8)
  { id: 'RT_MOD_015', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'number', businessTypes: ['moda_indumentaria'] },
  { id: 'RT_MOD_016', category: 'finance', mode: 'both', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu margen bruto promedio?', 'pt-BR': 'Qual é sua margem bruta média?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: '30-40', label: { es: '30-40%', 'pt-BR': '30-40%' }, emoji: '📊', impactScore: 8 },
    { id: '40-50', label: { es: '40-50%', 'pt-BR': '40-50%' }, emoji: '📈', impactScore: 12 },
    { id: '50-60', label: { es: '50-60%', 'pt-BR': '50-60%' }, emoji: '💰', impactScore: 18 },
    { id: '60+', label: { es: 'Más de 60%', 'pt-BR': 'Mais de 60%' }, emoji: '💎', impactScore: 22 },
  ]},
  { id: 'RT_MOD_017', category: 'finance', mode: 'complete', dimension: 'efficiency', weight: 8, title: { es: '¿Qué porcentaje de stock queda al fin de temporada?', 'pt-BR': 'Que porcentagem de estoque sobra no fim da temporada?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'low', label: { es: 'Menos del 15%', 'pt-BR': 'Menos de 15%' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: '15-30%', 'pt-BR': '15-30%' }, emoji: '💛', impactScore: 15 },
    { id: 'high', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '🟠', impactScore: 8 },
    { id: 'very_high', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'RT_MOD_018', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Que meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['moda_indumentaria'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 10 },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 12 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 15 },
    { id: 'installments', label: { es: 'Cuotas sin interés', 'pt-BR': 'Parcelamento sem juros' }, emoji: '📊', impactScore: 18 },
    { id: 'qr', label: { es: 'QR/Billetera', 'pt-BR': 'QR/Carteira' }, emoji: '📱', impactScore: 15 },
  ]},
  { id: 'RT_MOD_019', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuánto invertís en stock por temporada?', 'pt-BR': 'Quanto você investe em estoque por temporada?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'low', label: { es: 'Conservador', 'pt-BR': 'Conservador' }, emoji: '🐢', impactScore: 10 },
    { id: 'medium', label: { es: 'Moderado', 'pt-BR': 'Moderado' }, emoji: '⚖️', impactScore: 15 },
    { id: 'aggressive', label: { es: 'Agresivo', 'pt-BR': 'Agressivo' }, emoji: '🚀', impactScore: 18 },
    { id: 'variable', label: { es: 'Variable según ventas', 'pt-BR': 'Variável segundo vendas' }, emoji: '📊', impactScore: 15 },
  ]},
  { id: 'RT_MOD_020', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cómo es tu relación con proveedores?', 'pt-BR': 'Como é sua relação com fornecedores?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'credit_60', label: { es: 'Crédito +60 días', 'pt-BR': 'Crédito +60 dias' }, emoji: '🌟', impactScore: 20 },
    { id: 'credit_30', label: { es: 'Crédito 30 días', 'pt-BR': 'Crédito 30 dias' }, emoji: '💚', impactScore: 15 },
    { id: 'consignment', label: { es: 'Consignación', 'pt-BR': 'Consignação' }, emoji: '🤝', impactScore: 18 },
    { id: 'cash', label: { es: 'Contado', 'pt-BR': 'À vista' }, emoji: '💵', impactScore: 8 },
  ]},
  { id: 'RT_MOD_021', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuánto pagás de alquiler?', 'pt-BR': 'Quanto você paga de aluguel?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'own', label: { es: 'Local propio', 'pt-BR': 'Local próprio' }, emoji: '🏠', impactScore: 20 },
    { id: 'low', label: { es: 'Bajo para la zona', 'pt-BR': 'Baixo para a região' }, emoji: '💚', impactScore: 15 },
    { id: 'average', label: { es: 'Promedio', 'pt-BR': 'Médio' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alto', 'pt-BR': 'Alto' }, emoji: '🔴', impactScore: 8 },
  ]},
  { id: 'RT_MOD_022', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Hacés liquidaciones/sales?', 'pt-BR': 'Você faz liquidações/promoções?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_planned', label: { es: 'Sí, planificadas', 'pt-BR': 'Sim, planejadas' }, emoji: '📅', impactScore: 18 },
    { id: 'yes_seasonal', label: { es: 'Sí, fin temporada', 'pt-BR': 'Sim, fim de temporada' }, emoji: '🍂', impactScore: 15 },
    { id: 'yes_frequent', label: { es: 'Sí, frecuentes', 'pt-BR': 'Sim, frequentes' }, emoji: '🔥', impactScore: 10 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🐢', impactScore: 12 },
  ]},

  // EQUIPO (6)
  { id: 'RT_MOD_023', category: 'team', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántas personas trabajan en la tienda?', 'pt-BR': 'Quantas pessoas trabalham na loja?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤', impactScore: 8 },
    { id: '2-3', label: { es: '2-3 personas', 'pt-BR': '2-3 pessoas' }, emoji: '👥', impactScore: 12 },
    { id: '4-6', label: { es: '4-6 personas', 'pt-BR': '4-6 pessoas' }, emoji: '👨‍👩‍👧', impactScore: 18 },
    { id: '7+', label: { es: '7 o más', 'pt-BR': '7 ou mais' }, emoji: '🏢', impactScore: 20 },
  ]},
  { id: 'RT_MOD_024', category: 'team', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tu equipo recibe capacitación en moda/tendencias?', 'pt-BR': 'Sua equipe recebe capacitação em moda/tendências?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '🎓', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📚', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_025', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés comisión por ventas?', 'pt-BR': 'Você tem comissão por vendas?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_fixed', label: { es: 'Sí, % fijo', 'pt-BR': 'Sim, % fixo' }, emoji: '📊', impactScore: 18 },
    { id: 'yes_tiered', label: { es: 'Sí, escalado', 'pt-BR': 'Sim, escalonado' }, emoji: '📈', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_026', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cómo es la rotación de personal?', 'pt-BR': 'Como é a rotatividade de pessoal?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'low', label: { es: 'Baja (años)', 'pt-BR': 'Baixa (anos)' }, emoji: '💚', impactScore: 18 },
    { id: 'medium', label: { es: 'Media (meses)', 'pt-BR': 'Média (meses)' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alta', 'pt-BR': 'Alta' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'RT_MOD_027', category: 'team', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tu equipo viste la marca/uniforme?', 'pt-BR': 'Sua equipe veste a marca/uniforme?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_brand', label: { es: 'Sí, nuestra ropa', 'pt-BR': 'Sim, nossa roupa' }, emoji: '👗', impactScore: 20 },
    { id: 'yes_uniform', label: { es: 'Sí, uniforme', 'pt-BR': 'Sim, uniforme' }, emoji: '👔', impactScore: 15 },
    { id: 'dress_code', label: { es: 'Dress code', 'pt-BR': 'Dress code' }, emoji: '👕', impactScore: 12 },
    { id: 'no', label: { es: 'Sin reglas', 'pt-BR': 'Sem regras' }, emoji: '🔄', impactScore: 8 },
  ]},
  { id: 'RT_MOD_028', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Usás turnos rotativos?', 'pt-BR': 'Você usa turnos rotativos?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🔄', impactScore: 15 },
    { id: 'fixed', label: { es: 'No, horario fijo', 'pt-BR': 'Não, horário fixo' }, emoji: '⏰', impactScore: 12 },
    { id: 'na', label: { es: 'N/A (trabajo solo)', 'pt-BR': 'N/A (trabalho sozinho)' }, emoji: '👤', impactScore: 10 },
  ]},

  // VENTAS/CLIENTES (6)
  { id: 'RT_MOD_029', category: 'sales', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos clientes atendés por día?', 'pt-BR': 'Quantos clientes você atende por dia?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: '1-20', label: { es: '1-20 clientes', 'pt-BR': '1-20 clientes' }, emoji: '👤', impactScore: 8 },
    { id: '21-50', label: { es: '21-50 clientes', 'pt-BR': '21-50 clientes' }, emoji: '👥', impactScore: 15 },
    { id: '51-100', label: { es: '51-100 clientes', 'pt-BR': '51-100 clientes' }, emoji: '🏢', impactScore: 18 },
    { id: '100+', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, emoji: '🔥', impactScore: 22 },
  ]},
  { id: 'RT_MOD_030', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu tasa de conversión?', 'pt-BR': 'Qual é sua taxa de conversão?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'high', label: { es: 'Alta (+30%)', 'pt-BR': 'Alta (+30%)' }, emoji: '🌟', impactScore: 20 },
    { id: 'medium', label: { es: 'Media (15-30%)', 'pt-BR': 'Média (15-30%)' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Baja (-15%)', 'pt-BR': 'Baixa (-15%)' }, emoji: '💛', impactScore: 10 },
    { id: 'unknown', label: { es: 'No la mido', 'pt-BR': 'Não meço' }, emoji: '❓', impactScore: 5 },
  ]},
  { id: 'RT_MOD_031', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Qué porcentaje son clientes recurrentes?', 'pt-BR': 'Que porcentagem são clientes recorrentes?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'high', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '🌟', impactScore: 20 },
    { id: 'medium', label: { es: '25-50%', 'pt-BR': '25-50%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, emoji: '💛', impactScore: 10 },
    { id: 'unknown', label: { es: 'No lo sé', 'pt-BR': 'Não sei' }, emoji: '❓', impactScore: 5 },
  ]},
  { id: 'RT_MOD_032', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cuál es tu día más fuerte?', 'pt-BR': 'Qual é seu dia mais forte?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'weekend', label: { es: 'Fin de semana', 'pt-BR': 'Fim de semana' }, emoji: '📅', impactScore: 15 },
    { id: 'weekday', label: { es: 'Día de semana', 'pt-BR': 'Dia de semana' }, emoji: '💼', impactScore: 12 },
    { id: 'payday', label: { es: 'Días de cobro', 'pt-BR': 'Dias de pagamento' }, emoji: '💰', impactScore: 18 },
    { id: 'even', label: { es: 'Parejo', 'pt-BR': 'Distribuído' }, emoji: '⚖️', impactScore: 15 },
  ]},
  { id: 'RT_MOD_033', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Vendés accesorios complementarios?', 'pt-BR': 'Você vende acessórios complementares?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '👜', impactScore: 20 },
    { id: 'yes_passive', label: { es: 'Sí, si preguntan', 'pt-BR': 'Sim, se perguntam' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_034', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés personal shopper/asesoría?', 'pt-BR': 'Você oferece personal shopper/consultoria?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_formal', label: { es: 'Sí, servicio formal', 'pt-BR': 'Sim, serviço formal' }, emoji: '👩‍💼', impactScore: 20 },
    { id: 'yes_informal', label: { es: 'Sí, cuando piden', 'pt-BR': 'Sim, quando pedem' }, emoji: '💬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // MARKETING (6)
  { id: 'RT_MOD_035', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Tenés redes sociales activas?', 'pt-BR': 'Você tem redes sociais ativas?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_active', label: { es: 'Sí, muy activas', 'pt-BR': 'Sim, muito ativas' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_regular', label: { es: 'Sí, regulares', 'pt-BR': 'Sim, regulares' }, emoji: '📲', impactScore: 15 },
    { id: 'yes_basic', label: { es: 'Sí, básicas', 'pt-BR': 'Sim, básicas' }, emoji: '📴', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_036', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Hacés fotos profesionales de producto?', 'pt-BR': 'Você faz fotos profissionais de produto?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_pro', label: { es: 'Sí, profesionales', 'pt-BR': 'Sim, profissionais' }, emoji: '📸', impactScore: 20 },
    { id: 'yes_semi', label: { es: 'Sí, semi-pro', 'pt-BR': 'Sim, semi-pro' }, emoji: '📷', impactScore: 15 },
    { id: 'phone', label: { es: 'Celular', 'pt-BR': 'Celular' }, emoji: '📱', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_037', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Trabajás con influencers?', 'pt-BR': 'Você trabalha com influenciadores?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '⭐', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '🌟', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_038', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés programa de fidelización?', 'pt-BR': 'Você tem programa de fidelização?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_digital', label: { es: 'Sí, digital', 'pt-BR': 'Sim, digital' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_card', label: { es: 'Sí, tarjeta', 'pt-BR': 'Sim, cartão' }, emoji: '💳', impactScore: 15 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💬', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_039', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Participás en eventos de moda?', 'pt-BR': 'Você participa de eventos de moda?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_organizer', label: { es: 'Sí, organizo', 'pt-BR': 'Sim, organizo' }, emoji: '🎪', impactScore: 20 },
    { id: 'yes_participant', label: { es: 'Sí, participo', 'pt-BR': 'Sim, participo' }, emoji: '👗', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_040', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Invertís en publicidad paga?', 'pt-BR': 'Você investe em publicidade paga?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_consistent', label: { es: 'Sí, constante', 'pt-BR': 'Sim, constante' }, emoji: '💰', impactScore: 20 },
    { id: 'yes_campaigns', label: { es: 'Sí, campañas', 'pt-BR': 'Sim, campanhas' }, emoji: '📢', impactScore: 15 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🐢', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // REPUTACIÓN (6)
  { id: 'RT_MOD_041', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Tenés reseñas en Google/redes?', 'pt-BR': 'Você tem avaliações no Google/redes?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'many_good', label: { es: 'Muchas y buenas', 'pt-BR': 'Muitas e boas' }, emoji: '⭐', impactScore: 20 },
    { id: 'some_good', label: { es: 'Algunas buenas', 'pt-BR': 'Algumas boas' }, emoji: '🌟', impactScore: 15 },
    { id: 'few', label: { es: 'Pocas', 'pt-BR': 'Poucas' }, emoji: '💫', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_042', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '🌟', impactScore: 20 },
    { id: '4-4.5', label: { es: '4.0 - 4.4', 'pt-BR': '4.0 - 4.4' }, emoji: '⭐', impactScore: 15 },
    { id: '3.5-4', label: { es: '3.5 - 3.9', 'pt-BR': '3.5 - 3.9' }, emoji: '💛', impactScore: 10 },
    { id: 'below', label: { es: 'Menos de 3.5', 'pt-BR': 'Menos de 3.5' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'RT_MOD_043', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Respondés a comentarios/mensajes?', 'pt-BR': 'Você responde a comentários/mensagens?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 20 },
    { id: 'usually', label: { es: 'Generalmente', 'pt-BR': 'Geralmente' }, emoji: '💬', impactScore: 15 },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄', impactScore: 10 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'RT_MOD_044', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés clientes embajadores/fans?', 'pt-BR': 'Você tem clientes embaixadores/fãs?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_many', label: { es: 'Sí, muchos', 'pt-BR': 'Sim, muitos' }, emoji: '💜', impactScore: 20 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '💚', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_045', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés algún premio/reconocimiento?', 'pt-BR': 'Você tem algum prêmio/reconhecimento?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🏆', impactScore: 20 },
    { id: 'yes_one', label: { es: 'Sí, alguno', 'pt-BR': 'Sim, algum' }, emoji: '🥇', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_046', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Apareció tu marca en prensa/medios?', 'pt-BR': 'Sua marca apareceu na mídia?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_often', label: { es: 'Sí, frecuentemente', 'pt-BR': 'Sim, frequentemente' }, emoji: '📰', impactScore: 20 },
    { id: 'yes_sometimes', label: { es: 'Sí, alguna vez', 'pt-BR': 'Sim, alguma vez' }, emoji: '📝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // METAS (6)
  { id: 'RT_MOD_047', category: 'goals', mode: 'both', dimension: 'growth', weight: 8, title: { es: '¿Cuál es tu objetivo principal este año?', 'pt-BR': 'Qual é seu objetivo principal este ano?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'sales', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈', impactScore: 15 },
    { id: 'margin', label: { es: 'Mejorar margen', 'pt-BR': 'Melhorar margem' }, emoji: '💰', impactScore: 15 },
    { id: 'expand', label: { es: 'Expandir/Nuevo local', 'pt-BR': 'Expandir/Nova loja' }, emoji: '🚀', impactScore: 18 },
    { id: 'digital', label: { es: 'Crecer online', 'pt-BR': 'Crescer online' }, emoji: '💻', impactScore: 18 },
    { id: 'brand', label: { es: 'Fortalecer marca', 'pt-BR': 'Fortalecer marca' }, emoji: '✨', impactScore: 15 },
  ]},
  { id: 'RT_MOD_048', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Pensás abrir más locales?', 'pt-BR': 'Você pensa em abrir mais lojas?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_soon', label: { es: 'Sí, pronto', 'pt-BR': 'Sim, em breve' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'maybe', label: { es: 'Quizás', 'pt-BR': 'Talvez' }, emoji: '🤔', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_049', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Querés lanzar marca propia?', 'pt-BR': 'Você quer lançar marca própria?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'have', label: { es: 'Ya tengo', 'pt-BR': 'Já tenho' }, emoji: '🏷️', impactScore: 20 },
    { id: 'planning', label: { es: 'Sí, en proceso', 'pt-BR': 'Sim, em processo' }, emoji: '📋', impactScore: 18 },
    { id: 'interested', label: { es: 'Me interesa', 'pt-BR': 'Me interessa' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_050', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Qué área querés mejorar más?', 'pt-BR': 'Que área você quer melhorar mais?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'marketing', label: { es: 'Marketing/Redes', 'pt-BR': 'Marketing/Redes' }, emoji: '📱', impactScore: 15 },
    { id: 'operations', label: { es: 'Operaciones/Stock', 'pt-BR': 'Operações/Estoque' }, emoji: '📦', impactScore: 15 },
    { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, emoji: '👥', impactScore: 12 },
    { id: 'finance', label: { es: 'Finanzas', 'pt-BR': 'Finanças' }, emoji: '💰', impactScore: 12 },
    { id: 'customer', label: { es: 'Experiencia cliente', 'pt-BR': 'Experiência cliente' }, emoji: '🤝', impactScore: 15 },
  ]},
  { id: 'RT_MOD_051', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Cuál es tu mayor desafío?', 'pt-BR': 'Qual é seu maior desafio?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, emoji: '🏢', impactScore: 12 },
    { id: 'traffic', label: { es: 'Atraer clientes', 'pt-BR': 'Atrair clientes' }, emoji: '👥', impactScore: 15 },
    { id: 'stock', label: { es: 'Gestión de stock', 'pt-BR': 'Gestão de estoque' }, emoji: '📦', impactScore: 12 },
    { id: 'cash', label: { es: 'Flujo de caja', 'pt-BR': 'Fluxo de caixa' }, emoji: '💸', impactScore: 15 },
    { id: 'trends', label: { es: 'Seguir tendencias', 'pt-BR': 'Seguir tendências' }, emoji: '🔥', impactScore: 12 },
  ]},
  { id: 'RT_MOD_052', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Tenés plan de negocios formal?', 'pt-BR': 'Você tem plano de negócios formal?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_documented', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 20 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // PREGUNTAS ESPECÍFICAS MODA (18 adicionales para llegar a 70)
  { id: 'RT_MOD_053', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Importás ropa directamente?', 'pt-BR': 'Você importa roupa diretamente?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '✈️', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📦', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_054', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés línea sustentable/eco?', 'pt-BR': 'Você tem linha sustentável/eco?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_main', label: { es: 'Sí, principal', 'pt-BR': 'Sim, principal' }, emoji: '🌿', impactScore: 20 },
    { id: 'yes_some', label: { es: 'Sí, algunos productos', 'pt-BR': 'Sim, alguns produtos' }, emoji: '🌱', impactScore: 15 },
    { id: 'planning', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '💭', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_055', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Ofrecés gift cards/vouchers?', 'pt-BR': 'Você oferece gift cards/vouchers?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_digital', label: { es: 'Sí, digitales', 'pt-BR': 'Sim, digitais' }, emoji: '📱', impactScore: 18 },
    { id: 'yes_physical', label: { es: 'Sí, físicas', 'pt-BR': 'Sim, físicas' }, emoji: '🎁', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_056', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Hacés control de tallas?', 'pt-BR': 'Você faz controle de tamanhos?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_system', label: { es: 'Sí, por sistema', 'pt-BR': 'Sim, por sistema' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_057', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Vendés al por mayor?', 'pt-BR': 'Você vende no atacado?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_main', label: { es: 'Sí, es importante', 'pt-BR': 'Sim, é importante' }, emoji: '📦', impactScore: 18 },
    { id: 'yes_minor', label: { es: 'Sí, marginal', 'pt-BR': 'Sim, marginal' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_058', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés sistema anti-robo?', 'pt-BR': 'Você tem sistema anti-furto?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_electronic', label: { es: 'Sí, electrónico', 'pt-BR': 'Sim, eletrônico' }, emoji: '🔒', impactScore: 20 },
    { id: 'yes_camera', label: { es: 'Sí, cámaras', 'pt-BR': 'Sim, câmeras' }, emoji: '📹', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_059', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés seguro comercial?', 'pt-BR': 'Você tem seguro comercial?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_060', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés lookbooks/catálogos?', 'pt-BR': 'Você faz lookbooks/catálogos?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_pro', label: { es: 'Sí, profesionales', 'pt-BR': 'Sim, profissionais' }, emoji: '📕', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básicos', 'pt-BR': 'Sim, básicos' }, emoji: '📄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_061', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés experiencia de compra premium?', 'pt-BR': 'Você oferece experiência de compra premium?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_full', label: { es: 'Sí, completa', 'pt-BR': 'Sim, completa' }, emoji: '✨', impactScore: 20 },
    { id: 'yes_some', label: { es: 'Sí, algunos elementos', 'pt-BR': 'Sim, alguns elementos' }, emoji: '🌟', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_062', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés depósito/stock separado?', 'pt-BR': 'Você tem depósito/estoque separado?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_same', label: { es: 'Sí, en local', 'pt-BR': 'Sim, no local' }, emoji: '📦', impactScore: 15 },
    { id: 'yes_external', label: { es: 'Sí, externo', 'pt-BR': 'Sim, externo' }, emoji: '🏢', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_063', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuánto es tu merma anual?', 'pt-BR': 'Quanto é sua perda anual?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'low', label: { es: 'Menos del 2%', 'pt-BR': 'Menos de 2%' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: '2-5%', 'pt-BR': '2-5%' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Más del 5%', 'pt-BR': 'Mais de 5%' }, emoji: '🔴', impactScore: 5 },
    { id: 'unknown', label: { es: 'No sé', 'pt-BR': 'Não sei' }, emoji: '❓', impactScore: 8 },
  ]},
  { id: 'RT_MOD_064', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés packaging branded?', 'pt-BR': 'Você tem embalagem branded?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_premium', label: { es: 'Sí, premium', 'pt-BR': 'Sim, premium' }, emoji: '🎁', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📦', impactScore: 15 },
    { id: 'generic', label: { es: 'Genérico', 'pt-BR': 'Genérico' }, emoji: '🛍️', impactScore: 8 },
  ]},
  { id: 'RT_MOD_065', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Aceptás reservas/apartados?', 'pt-BR': 'Você aceita reservas?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '📋', impactScore: 15 },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_066', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tu equipo tiene objetivos de venta?', 'pt-BR': 'Sua equipe tem metas de venda?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_individual', label: { es: 'Sí, individuales', 'pt-BR': 'Sim, individuais' }, emoji: '🎯', impactScore: 20 },
    { id: 'yes_team', label: { es: 'Sí, grupales', 'pt-BR': 'Sim, grupais' }, emoji: '👥', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_067', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés envío gratis?', 'pt-BR': 'Você oferece frete grátis?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_always', label: { es: 'Sí, siempre', 'pt-BR': 'Sim, sempre' }, emoji: '🚚', impactScore: 20 },
    { id: 'yes_minimum', label: { es: 'Sí, monto mínimo', 'pt-BR': 'Sim, valor mínimo' }, emoji: '💰', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_068', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Usás WhatsApp Business?', 'pt-BR': 'Você usa WhatsApp Business?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_catalog', label: { es: 'Sí, con catálogo', 'pt-BR': 'Sim, com catálogo' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💬', impactScore: 15 },
    { id: 'personal', label: { es: 'WA personal', 'pt-BR': 'WA pessoal' }, emoji: '📲', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'RT_MOD_069', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés valores de marca definidos?', 'pt-BR': 'Você tem valores de marca definidos?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_communicated', label: { es: 'Sí, comunicados', 'pt-BR': 'Sim, comunicados' }, emoji: '📢', impactScore: 20 },
    { id: 'yes_internal', label: { es: 'Sí, internos', 'pt-BR': 'Sim, internos' }, emoji: '💭', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'RT_MOD_070', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Considerás franquiciar tu marca?', 'pt-BR': 'Você considera franquear sua marca?' }, type: 'single', businessTypes: ['moda_indumentaria'], options: [
    { id: 'yes_ready', label: { es: 'Sí, estoy listo', 'pt-BR': 'Sim, estou pronto' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
];
