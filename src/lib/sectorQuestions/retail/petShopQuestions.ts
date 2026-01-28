// Pet Shop - Complete Questionnaire  
// 70 hyper-personalized questions for pet stores

import type { GastroQuestion } from '../../gastroQuestionsEngine';

export const PET_SHOP_QUESTIONS: GastroQuestion[] = [
  // ============ IDENTIDAD Y POSICIONAMIENTO (6) ============
  { id: 'RT_PET_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué productos y servicios ofrecés?', 'pt-BR': 'Que produtos e serviços você oferece?' }, type: 'multi', required: true, businessTypes: ['pet_shop'], options: [
    { id: 'food', label: { es: 'Alimentos (balanceados, snacks)', 'pt-BR': 'Alimentos (rações, petiscos)' }, emoji: '🍖' },
    { id: 'accessories', label: { es: 'Accesorios (collares, correas, camas)', 'pt-BR': 'Acessórios (coleiras, guias, camas)' }, emoji: '🦮' },
    { id: 'hygiene', label: { es: 'Higiene (shampoos, cepillos)', 'pt-BR': 'Higiene (shampoos, escovas)' }, emoji: '🛁' },
    { id: 'grooming', label: { es: 'Peluquería/Grooming', 'pt-BR': 'Banho e tosa/Grooming' }, emoji: '✂️' },
    { id: 'veterinary', label: { es: 'Farmacia/Medicamentos', 'pt-BR': 'Farmácia/Medicamentos' }, emoji: '💊' },
    { id: 'toys', label: { es: 'Juguetes', 'pt-BR': 'Brinquedos' }, emoji: '🎾' },
    { id: 'live_animals', label: { es: 'Venta de mascotas', 'pt-BR': 'Venda de pets' }, emoji: '🐕' },
    { id: 'daycare', label: { es: 'Guardería/Hotel', 'pt-BR': 'Creche/Hotel' }, emoji: '🏠' },
  ]},
  { id: 'RT_PET_002', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Qué tipo de mascotas atendés principalmente?', 'pt-BR': 'Que tipo de pets você atende principalmente?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'dogs', label: { es: 'Perros', 'pt-BR': 'Cachorros' }, emoji: '🐕' },
    { id: 'cats', label: { es: 'Gatos', 'pt-BR': 'Gatos' }, emoji: '🐈' },
    { id: 'birds', label: { es: 'Aves', 'pt-BR': 'Aves' }, emoji: '🐦' },
    { id: 'fish', label: { es: 'Peces/Acuarismo', 'pt-BR': 'Peixes/Aquarismo' }, emoji: '🐠' },
    { id: 'rodents', label: { es: 'Roedores (hamster, conejos)', 'pt-BR': 'Roedores (hamster, coelhos)' }, emoji: '🐹' },
    { id: 'exotic', label: { es: 'Exóticos (reptiles, etc)', 'pt-BR': 'Exóticos (répteis, etc)' }, emoji: '🦎' },
  ]},
  { id: 'RT_PET_003', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Dónde está ubicado tu local?', 'pt-BR': 'Onde está localizado seu negócio?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'residential', label: { es: 'Barrio residencial', 'pt-BR': 'Bairro residencial' }, emoji: '🏘️' },
    { id: 'commercial', label: { es: 'Zona comercial', 'pt-BR': 'Zona comercial' }, emoji: '🏢' },
    { id: 'mall', label: { es: 'Shopping/Centro comercial', 'pt-BR': 'Shopping/Centro comercial' }, emoji: '🏬' },
    { id: 'veterinary_area', label: { es: 'Cerca de veterinarias', 'pt-BR': 'Perto de veterinárias' }, emoji: '🏥' },
  ]},
  { id: 'RT_PET_004', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuántos años tiene tu pet shop?', 'pt-BR': 'Quantos anos tem seu pet shop?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: '0-2', label: { es: 'Menos de 2 años', 'pt-BR': 'Menos de 2 anos' }, emoji: '🌱' },
    { id: '2-5', label: { es: '2-5 años', 'pt-BR': '2-5 anos' }, emoji: '📈' },
    { id: '5-10', label: { es: '5-10 años', 'pt-BR': '5-10 anos' }, emoji: '🏪' },
    { id: '10+', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆' },
  ]},
  { id: 'RT_PET_005', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuál es el tamaño de tu local?', 'pt-BR': 'Qual é o tamanho do seu local?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'small', label: { es: 'Hasta 40m²', 'pt-BR': 'Até 40m²' }, emoji: '📐' },
    { id: 'medium', label: { es: '40-100m²', 'pt-BR': '40-100m²' }, emoji: '🏪' },
    { id: 'large', label: { es: '100-200m²', 'pt-BR': '100-200m²' }, emoji: '🏬' },
    { id: 'xlarge', label: { es: 'Más de 200m²', 'pt-BR': 'Mais de 200m²' }, emoji: '🏭' },
  ]},
  { id: 'RT_PET_006', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Qué te diferencia de la competencia?', 'pt-BR': 'O que te diferencia da concorrência?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'quality', label: { es: 'Productos premium/naturales', 'pt-BR': 'Produtos premium/naturais' }, emoji: '⭐' },
    { id: 'service', label: { es: 'Servicio de peluquería', 'pt-BR': 'Serviço de banho e tosa' }, emoji: '✂️' },
    { id: 'advice', label: { es: 'Asesoramiento especializado', 'pt-BR': 'Assessoria especializada' }, emoji: '🎓' },
    { id: 'delivery', label: { es: 'Delivery rápido', 'pt-BR': 'Delivery rápido' }, emoji: '🚚' },
    { id: 'price', label: { es: 'Mejores precios', 'pt-BR': 'Melhores preços' }, emoji: '💰' },
    { id: 'variety', label: { es: 'Variedad de marcas', 'pt-BR': 'Variedade de marcas' }, emoji: '📦' },
  ]},

  // ============ OFERTA Y PRECIOS (8) ============
  { id: 'RT_PET_007', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Qué marcas de alimentos trabajás?', 'pt-BR': 'Que marcas de alimentos você trabalha?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'premium', label: { es: 'Premium (Royal Canin, Pro Plan)', 'pt-BR': 'Premium (Royal Canin, Pro Plan)' }, emoji: '👑' },
    { id: 'super_premium', label: { es: 'Super Premium (Taste of Wild, Acana)', 'pt-BR': 'Super Premium (Taste of Wild, Acana)' }, emoji: '💎' },
    { id: 'standard', label: { es: 'Estándar (Dog Chow, Cat Chow)', 'pt-BR': 'Padrão (Dog Chow, Cat Chow)' }, emoji: '🏷️' },
    { id: 'economic', label: { es: 'Económicas', 'pt-BR': 'Econômicas' }, emoji: '💵' },
    { id: 'natural', label: { es: 'Naturales/BARF', 'pt-BR': 'Naturais/BARF' }, emoji: '🥩' },
    { id: 'veterinary', label: { es: 'Líneas veterinarias', 'pt-BR': 'Linhas veterinárias' }, emoji: '💊' },
  ]},
  { id: 'RT_PET_008', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'low', label: { es: 'Menos de $8.000', 'pt-BR': 'Menos de R$150' }, emoji: '💵' },
    { id: 'mid_low', label: { es: '$8.000 - $20.000', 'pt-BR': 'R$150 - R$400' }, emoji: '💰' },
    { id: 'mid', label: { es: '$20.000 - $50.000', 'pt-BR': 'R$400 - R$1.000' }, emoji: '💳' },
    { id: 'high', label: { es: 'Más de $50.000', 'pt-BR': 'Mais de R$1.000' }, emoji: '💎' },
  ]},
  { id: 'RT_PET_009', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Qué categoría te genera más facturación?', 'pt-BR': 'Qual categoria te gera mais faturamento?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'food', label: { es: 'Alimentos', 'pt-BR': 'Alimentos' }, emoji: '🍖' },
    { id: 'grooming', label: { es: 'Peluquería/Grooming', 'pt-BR': 'Banho e tosa' }, emoji: '✂️' },
    { id: 'accessories', label: { es: 'Accesorios', 'pt-BR': 'Acessórios' }, emoji: '🦮' },
    { id: 'pharmacy', label: { es: 'Farmacia/Medicamentos', 'pt-BR': 'Farmácia/Medicamentos' }, emoji: '💊' },
    { id: 'live_animals', label: { es: 'Venta de mascotas', 'pt-BR': 'Venda de pets' }, emoji: '🐕' },
  ]},
  { id: 'RT_PET_010', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu margen bruto promedio?', 'pt-BR': 'Qual é sua margem bruta média?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: '15-25', label: { es: '15-25%', 'pt-BR': '15-25%' }, emoji: '📊' },
    { id: '25-35', label: { es: '25-35%', 'pt-BR': '25-35%' }, emoji: '📈' },
    { id: '35-45', label: { es: '35-45%', 'pt-BR': '35-45%' }, emoji: '💰' },
    { id: '45+', label: { es: 'Más del 45%', 'pt-BR': 'Mais de 45%' }, emoji: '💎' },
  ]},
  { id: 'RT_PET_011', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Qué te da mejor margen?', 'pt-BR': 'O que te dá melhor margem?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'grooming', label: { es: 'Servicios (peluquería)', 'pt-BR': 'Serviços (banho e tosa)' }, emoji: '✂️' },
    { id: 'accessories', label: { es: 'Accesorios', 'pt-BR': 'Acessórios' }, emoji: '🦮' },
    { id: 'premium_food', label: { es: 'Alimentos premium', 'pt-BR': 'Alimentos premium' }, emoji: '👑' },
    { id: 'pharmacy', label: { es: 'Medicamentos', 'pt-BR': 'Medicamentos' }, emoji: '💊' },
    { id: 'toys', label: { es: 'Juguetes', 'pt-BR': 'Brinquedos' }, emoji: '🎾' },
  ]},
  { id: 'RT_PET_012', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Ofrecés suscripción/plan mensual de alimentos?', 'pt-BR': 'Você oferece assinatura/plano mensal de alimentos?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes', label: { es: 'Sí, tengo plan de suscripción', 'pt-BR': 'Sim, tenho plano de assinatura' }, emoji: '📅' },
    { id: 'informal', label: { es: 'Informalmente (me avisan y entrego)', 'pt-BR': 'Informalmente (me avisam e entrego)' }, emoji: '💬' },
    { id: 'planning', label: { es: 'Lo estoy considerando', 'pt-BR': 'Estou considerando' }, emoji: '🤔' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_013', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Quais meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵' },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳' },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳' },
    { id: 'qr', label: { es: 'QR/Billetera virtual', 'pt-BR': 'QR/Carteira virtual' }, emoji: '📱' },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦' },
  ]},
  { id: 'RT_PET_014', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cuántos SKUs/productos manejás?', 'pt-BR': 'Quantos SKUs/produtos você gerencia?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'small', label: { es: 'Hasta 200', 'pt-BR': 'Até 200' }, emoji: '📦' },
    { id: 'medium', label: { es: '200-500', 'pt-BR': '200-500' }, emoji: '🏪' },
    { id: 'large', label: { es: '500-1000', 'pt-BR': '500-1000' }, emoji: '🏬' },
    { id: 'xlarge', label: { es: 'Más de 1000', 'pt-BR': 'Mais de 1000' }, emoji: '🏭' },
  ]},

  // ============ CLIENTE IDEAL Y DEMANDA (6) ============
  { id: 'RT_PET_015', category: 'sales', mode: 'both', dimension: 'traffic', weight: 9, title: { es: '¿Quién es tu cliente típico?', 'pt-BR': 'Quem é seu cliente típico?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'families', label: { es: 'Familias con hijos', 'pt-BR': 'Famílias com filhos' }, emoji: '👨‍👩‍👧' },
    { id: 'young_singles', label: { es: 'Jóvenes solteros', 'pt-BR': 'Jovens solteiros' }, emoji: '🧑' },
    { id: 'elderly', label: { es: 'Adultos mayores', 'pt-BR': 'Idosos' }, emoji: '👴' },
    { id: 'professionals', label: { es: 'Profesionales pet lovers', 'pt-BR': 'Profissionais pet lovers' }, emoji: '👔' },
    { id: 'breeders', label: { es: 'Criadores', 'pt-BR': 'Criadores' }, emoji: '🏆' },
    { id: 'rescuers', label: { es: 'Rescatistas/Proteccionistas', 'pt-BR': 'Resgatadores/Protetores' }, emoji: '❤️' },
  ]},
  { id: 'RT_PET_016', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos clientes atendés por día?', 'pt-BR': 'Quantos clientes você atende por dia?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: '1-20', label: { es: '1-20 clientes', 'pt-BR': '1-20 clientes' }, emoji: '👤' },
    { id: '21-50', label: { es: '21-50 clientes', 'pt-BR': '21-50 clientes' }, emoji: '👥' },
    { id: '51-100', label: { es: '51-100 clientes', 'pt-BR': '51-100 clientes' }, emoji: '🏪' },
    { id: '100+', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, emoji: '🏬' },
  ]},
  { id: 'RT_PET_017', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cómo te encuentran los clientes nuevos?', 'pt-BR': 'Como os novos clientes te encontram?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'walk_in', label: { es: 'Pasan por el local', 'pt-BR': 'Passam pela loja' }, emoji: '🚶' },
    { id: 'referral', label: { es: 'Recomendación de otros dueños', 'pt-BR': 'Recomendação de outros donos' }, emoji: '💬' },
    { id: 'google', label: { es: 'Google/Maps', 'pt-BR': 'Google/Maps' }, emoji: '🔍' },
    { id: 'social', label: { es: 'Instagram/Facebook', 'pt-BR': 'Instagram/Facebook' }, emoji: '📱' },
    { id: 'vet_referral', label: { es: 'Derivación de veterinarios', 'pt-BR': 'Indicação de veterinários' }, emoji: '🏥' },
    { id: 'parks', label: { es: 'Me conocen del parque/paseo', 'pt-BR': 'Me conhecem do parque/passeio' }, emoji: '🌳' },
  ]},
  { id: 'RT_PET_018', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cuántas mascotas tiene en promedio cada cliente?', 'pt-BR': 'Quantos pets tem em média cada cliente?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: '1', label: { es: '1 mascota', 'pt-BR': '1 pet' }, emoji: '🐕' },
    { id: '2', label: { es: '2 mascotas', 'pt-BR': '2 pets' }, emoji: '🐕🐈' },
    { id: '3+', label: { es: '3 o más', 'pt-BR': '3 ou mais' }, emoji: '🐾' },
    { id: 'varied', label: { es: 'Muy variado', 'pt-BR': 'Muito variado' }, emoji: '🔄' },
  ]},
  { id: 'RT_PET_019', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuál es la estacionalidad de tu negocio?', 'pt-BR': 'Qual é a sazonalidade do seu negócio?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'summer', label: { es: 'Verano (pipetas, grooming)', 'pt-BR': 'Verão (pipetas, banho e tosa)' }, emoji: '☀️' },
    { id: 'winter', label: { es: 'Invierno (ropa, camas)', 'pt-BR': 'Inverno (roupas, camas)' }, emoji: '❄️' },
    { id: 'holidays', label: { es: 'Fiestas (regalos, disfraces)', 'pt-BR': 'Festas (presentes, fantasias)' }, emoji: '🎄' },
    { id: 'back_to_school', label: { es: 'Vuelta de vacaciones (guarderías)', 'pt-BR': 'Volta de férias (creches)' }, emoji: '📚' },
    { id: 'stable', label: { es: 'Estable todo el año', 'pt-BR': 'Estável o ano todo' }, emoji: '📊' },
  ]},
  { id: 'RT_PET_020', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Permitís que entren mascotas al local?', 'pt-BR': 'Você permite que pets entrem na loja?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'always', label: { es: 'Sí, siempre bienvenidas', 'pt-BR': 'Sim, sempre bem-vindos' }, emoji: '🐕' },
    { id: 'controlled', label: { es: 'Sí, pero con control', 'pt-BR': 'Sim, mas com controle' }, emoji: '🦮' },
    { id: 'grooming_only', label: { es: 'Solo para peluquería', 'pt-BR': 'Apenas para banho e tosa' }, emoji: '✂️' },
    { id: 'no', label: { es: 'No, solo dueños', 'pt-BR': 'Não, apenas donos' }, emoji: '🚫' },
  ]},

  // ============ VENTAS Y CONVERSIÓN (6) ============
  { id: 'RT_PET_021', category: 'sales', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Qué canales de venta usás?', 'pt-BR': 'Quais canais de venda você usa?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'physical', label: { es: 'Local físico', 'pt-BR': 'Loja física' }, emoji: '🏪' },
    { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '📱' },
    { id: 'ecommerce', label: { es: 'E-commerce propio', 'pt-BR': 'E-commerce próprio' }, emoji: '🌐' },
    { id: 'marketplace', label: { es: 'MercadoLibre', 'pt-BR': 'Mercado Livre' }, emoji: '🛒' },
    { id: 'instagram', label: { es: 'Instagram Shop', 'pt-BR': 'Instagram Shop' }, emoji: '📸' },
    { id: 'delivery_apps', label: { es: 'Apps de delivery (Rappi, etc)', 'pt-BR': 'Apps de delivery (Rappi, etc)' }, emoji: '🛵' },
  ]},
  { id: 'RT_PET_022', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Qué porcentaje es delivery vs local?', 'pt-BR': 'Qual porcentagem é delivery vs loja?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'mostly_store', label: { es: '80%+ en local', 'pt-BR': '80%+ na loja' }, emoji: '🏪' },
    { id: 'balanced', label: { es: '50/50', 'pt-BR': '50/50' }, emoji: '⚖️' },
    { id: 'mostly_delivery', label: { es: '60%+ delivery', 'pt-BR': '60%+ delivery' }, emoji: '🚚' },
    { id: 'all_delivery', label: { es: '90%+ delivery', 'pt-BR': '90%+ delivery' }, emoji: '📦' },
  ]},
  { id: 'RT_PET_023', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Hacés venta cruzada efectivamente?', 'pt-BR': 'Você faz venda cruzada efetivamente?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'always', label: { es: 'Sí, siempre sugiero complementos', 'pt-BR': 'Sim, sempre sugiro complementos' }, emoji: '✅' },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄' },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🤏' },
    { id: 'no', label: { es: 'No lo hago', 'pt-BR': 'Não faço' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_024', category: 'sales', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuánto demora una venta promedio?', 'pt-BR': 'Quanto tempo demora uma venda média?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'quick', label: { es: 'Menos de 5 min (saben qué quieren)', 'pt-BR': 'Menos de 5 min (sabem o que querem)' }, emoji: '⚡' },
    { id: 'medium', label: { es: '5-15 minutos', 'pt-BR': '5-15 minutos' }, emoji: '⏱️' },
    { id: 'long', label: { es: '15-30 min (consultas, consejos)', 'pt-BR': '15-30 min (consultas, conselhos)' }, emoji: '⏰' },
    { id: 'varied', label: { es: 'Muy variado', 'pt-BR': 'Muito variado' }, emoji: '🔄' },
  ]},
  { id: 'RT_PET_025', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cómo manejás la reposición de alimentos?', 'pt-BR': 'Como você gerencia a reposição de alimentos?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'proactive', label: { es: 'Les aviso cuando se les debe acabar', 'pt-BR': 'Aviso quando deve estar acabando' }, emoji: '📱' },
    { id: 'automated', label: { es: 'Tengo sistema de suscripción', 'pt-BR': 'Tenho sistema de assinatura' }, emoji: '🤖' },
    { id: 'reactive', label: { es: 'Cuando vienen o piden', 'pt-BR': 'Quando vêm ou pedem' }, emoji: '🏪' },
    { id: 'na', label: { es: 'No vendo alimentos', 'pt-BR': 'Não vendo alimentos' }, emoji: '➖' },
  ]},
  { id: 'RT_PET_026', category: 'sales', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cómo reservan turnos de peluquería?', 'pt-BR': 'Como reservam horários de banho e tosa?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'online', label: { es: 'Sistema online/App', 'pt-BR': 'Sistema online/App' }, emoji: '📱' },
    { id: 'whatsapp', label: { es: 'Por WhatsApp', 'pt-BR': 'Por WhatsApp' }, emoji: '💬' },
    { id: 'phone', label: { es: 'Por teléfono', 'pt-BR': 'Por telefone' }, emoji: '📞' },
    { id: 'walk_in', label: { es: 'Sin turno previo', 'pt-BR': 'Sem agendamento prévio' }, emoji: '🚶' },
    { id: 'na', label: { es: 'No ofrezco peluquería', 'pt-BR': 'Não ofereço banho e tosa' }, emoji: '➖' },
  ]},

  // ============ FINANZAS Y MÁRGENES (6) ============
  { id: 'RT_PET_027', category: 'finance', mode: 'both', dimension: 'finances', weight: 9, title: { es: '¿Cuál es tu facturación mensual promedio?', 'pt-BR': 'Qual é seu faturamento mensal médio?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'small', label: { es: 'Hasta $2M', 'pt-BR': 'Até R$40k' }, emoji: '📊' },
    { id: 'medium', label: { es: '$2M - $6M', 'pt-BR': 'R$40k - R$120k' }, emoji: '📈' },
    { id: 'large', label: { es: '$6M - $15M', 'pt-BR': 'R$120k - R$300k' }, emoji: '💰' },
    { id: 'xlarge', label: { es: 'Más de $15M', 'pt-BR': 'Mais de R$300k' }, emoji: '💎' },
  ]},
  { id: 'RT_PET_028', category: 'finance', mode: 'complete', dimension: 'finances', weight: 8, title: { es: '¿Cuánto capital tenés en stock?', 'pt-BR': 'Quanto capital você tem em estoque?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'low', label: { es: 'Hasta $1M', 'pt-BR': 'Até R$20k' }, emoji: '📦' },
    { id: 'medium', label: { es: '$1M - $3M', 'pt-BR': 'R$20k - R$60k' }, emoji: '🏪' },
    { id: 'high', label: { es: '$3M - $8M', 'pt-BR': 'R$60k - R$160k' }, emoji: '🏬' },
    { id: 'very_high', label: { es: 'Más de $8M', 'pt-BR': 'Mais de R$160k' }, emoji: '🏭' },
  ]},
  { id: 'RT_PET_029', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Qué plazo te dan los proveedores?', 'pt-BR': 'Qual prazo os fornecedores te dão?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'cash', label: { es: 'Contado', 'pt-BR': 'À vista' }, emoji: '💵' },
    { id: '15-30', label: { es: '15-30 días', 'pt-BR': '15-30 dias' }, emoji: '📅' },
    { id: '30-45', label: { es: '30-45 días', 'pt-BR': '30-45 dias' }, emoji: '📆' },
    { id: '60+', label: { es: 'Más de 45 días', 'pt-BR': 'Mais de 45 dias' }, emoji: '🗓️' },
  ]},
  { id: 'RT_PET_030', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Cuánto rotás el stock de alimentos?', 'pt-BR': 'Quanto você gira o estoque de alimentos?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'fast', label: { es: 'Muy rápido (semanal)', 'pt-BR': 'Muito rápido (semanal)' }, emoji: '⚡' },
    { id: 'normal', label: { es: 'Normal (2-3 semanas)', 'pt-BR': 'Normal (2-3 semanas)' }, emoji: '📦' },
    { id: 'slow', label: { es: 'Lento (mensual)', 'pt-BR': 'Lento (mensal)' }, emoji: '🐢' },
    { id: 'na', label: { es: 'No vendo alimentos', 'pt-BR': 'Não vendo alimentos' }, emoji: '➖' },
  ]},
  { id: 'RT_PET_031', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cómo cobrás los servicios (peluquería)?', 'pt-BR': 'Como você cobra os serviços (banho e tosa)?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'fixed', label: { es: 'Precio fijo por tamaño', 'pt-BR': 'Preço fixo por tamanho' }, emoji: '💲' },
    { id: 'variable', label: { es: 'Según raza y estado del pelo', 'pt-BR': 'Conforme raça e estado do pelo' }, emoji: '🔄' },
    { id: 'hourly', label: { es: 'Por hora de trabajo', 'pt-BR': 'Por hora de trabalho' }, emoji: '⏰' },
    { id: 'na', label: { es: 'No ofrezco servicios', 'pt-BR': 'Não ofereço serviços' }, emoji: '➖' },
  ]},
  { id: 'RT_PET_032', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés contador?', 'pt-BR': 'Você tem contador?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes_monthly', label: { es: 'Sí, servicio mensual', 'pt-BR': 'Sim, serviço mensal' }, emoji: '📊' },
    { id: 'yes_annual', label: { es: 'Solo para balances', 'pt-BR': 'Apenas para balanços' }, emoji: '📅' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},

  // ============ OPERACIONES Y CAPACIDAD (8) ============
  { id: 'RT_PET_033', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Usás sistema de gestión?', 'pt-BR': 'Você usa sistema de gestão?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'complete', label: { es: 'Sí, completo (stock, ventas, clientes)', 'pt-BR': 'Sim, completo (estoque, vendas, clientes)' }, emoji: '💻' },
    { id: 'basic', label: { es: 'Sistema básico/Caja', 'pt-BR': 'Sistema básico/Caixa' }, emoji: '🖥️' },
    { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📊' },
    { id: 'manual', label: { es: 'Manual', 'pt-BR': 'Manual' }, emoji: '📝' },
  ]},
  { id: 'RT_PET_034', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 8, title: { es: '¿Tenés historial de cada mascota?', 'pt-BR': 'Você tem histórico de cada pet?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'system', label: { es: 'Sí, en sistema', 'pt-BR': 'Sim, no sistema' }, emoji: '💻' },
    { id: 'manual', label: { es: 'Sí, en fichas/cuaderno', 'pt-BR': 'Sim, em fichas/caderno' }, emoji: '📋' },
    { id: 'whatsapp', label: { es: 'Solo el chat de WhatsApp', 'pt-BR': 'Apenas o chat do WhatsApp' }, emoji: '📱' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_035', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuántos turnos de peluquería podés hacer por día?', 'pt-BR': 'Quantos atendimentos de banho e tosa você pode fazer por dia?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: '1-5', label: { es: '1-5 mascotas', 'pt-BR': '1-5 pets' }, emoji: '🐕' },
    { id: '6-10', label: { es: '6-10 mascotas', 'pt-BR': '6-10 pets' }, emoji: '🐕🐈' },
    { id: '10-20', label: { es: '10-20 mascotas', 'pt-BR': '10-20 pets' }, emoji: '🏪' },
    { id: '20+', label: { es: 'Más de 20', 'pt-BR': 'Mais de 20' }, emoji: '🏬' },
    { id: 'na', label: { es: 'No ofrezco peluquería', 'pt-BR': 'Não ofereço banho e tosa' }, emoji: '➖' },
  ]},
  { id: 'RT_PET_036', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Con qué frecuencia reponés stock?', 'pt-BR': 'Com que frequência você repõe estoque?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'daily', label: { es: 'Diario (productos frescos)', 'pt-BR': 'Diário (produtos frescos)' }, emoji: '📦' },
    { id: 'twice_week', label: { es: '2-3 veces/semana', 'pt-BR': '2-3 vezes/semana' }, emoji: '📅' },
    { id: 'weekly', label: { es: 'Semanal', 'pt-BR': 'Semanal' }, emoji: '📆' },
    { id: 'biweekly', label: { es: 'Quincenal', 'pt-BR': 'Quinzenal' }, emoji: '🗓️' },
  ]},
  { id: 'RT_PET_037', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Hacés delivery?', 'pt-BR': 'Você faz delivery?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'own', label: { es: 'Sí, propio', 'pt-BR': 'Sim, próprio' }, emoji: '🚚' },
    { id: 'third_party', label: { es: 'Sí, tercerizado (Rappi, etc)', 'pt-BR': 'Sim, terceirizado (Rappi, etc)' }, emoji: '🛵' },
    { id: 'both', label: { es: 'Ambos', 'pt-BR': 'Ambos' }, emoji: '🔄' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_038', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántas horas abrís?', 'pt-BR': 'Quantas horas você abre?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: '8', label: { es: '8 horas', 'pt-BR': '8 horas' }, emoji: '🕐' },
    { id: '10', label: { es: '10 horas', 'pt-BR': '10 horas' }, emoji: '🕑' },
    { id: '12', label: { es: '12 horas', 'pt-BR': '12 horas' }, emoji: '🕒' },
    { id: '12+', label: { es: 'Más de 12 horas', 'pt-BR': 'Mais de 12 horas' }, emoji: '🕓' },
  ]},
  { id: 'RT_PET_039', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Abrís domingos?', 'pt-BR': 'Você abre aos domingos?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '✅' },
    { id: 'half', label: { es: 'Medio día', 'pt-BR': 'Meio dia' }, emoji: '🌅' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_040', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Tenés espacio de espera para mascotas?', 'pt-BR': 'Você tem espaço de espera para pets?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes', label: { es: 'Sí, jaulas/kennel', 'pt-BR': 'Sim, gaiolas/canil' }, emoji: '🏠' },
    { id: 'limited', label: { es: 'Limitado', 'pt-BR': 'Limitado' }, emoji: '📐' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
    { id: 'na', label: { es: 'No ofrezco servicios', 'pt-BR': 'Não ofereço serviços' }, emoji: '➖' },
  ]},

  // ============ EQUIPO Y ROLES (6) ============
  { id: 'RT_PET_041', category: 'team', mode: 'both', dimension: 'team', weight: 8, title: { es: '¿Cuántas personas trabajan en tu pet shop?', 'pt-BR': 'Quantas pessoas trabalham no seu pet shop?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
    { id: '2-3', label: { es: '2-3 personas', 'pt-BR': '2-3 pessoas' }, emoji: '👥' },
    { id: '4-6', label: { es: '4-6 personas', 'pt-BR': '4-6 pessoas' }, emoji: '👨‍👩‍👧' },
    { id: '7+', label: { es: '7 o más', 'pt-BR': '7 ou mais' }, emoji: '🏢' },
  ]},
  { id: 'RT_PET_042', category: 'team', mode: 'complete', dimension: 'team', weight: 7, title: { es: '¿Qué roles tenés cubiertos?', 'pt-BR': 'Quais funções você tem cobertas?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'sales', label: { es: 'Vendedor/Atención', 'pt-BR': 'Vendedor/Atendimento' }, emoji: '🛒' },
    { id: 'groomer', label: { es: 'Peluquero/Groomer', 'pt-BR': 'Tosador/Groomer' }, emoji: '✂️' },
    { id: 'bather', label: { es: 'Bañador', 'pt-BR': 'Banhista' }, emoji: '🛁' },
    { id: 'delivery', label: { es: 'Delivery/Repartidor', 'pt-BR': 'Delivery/Entregador' }, emoji: '🚚' },
    { id: 'admin', label: { es: 'Administrativo', 'pt-BR': 'Administrativo' }, emoji: '📋' },
    { id: 'all_me', label: { es: 'Hago todo yo', 'pt-BR': 'Faço tudo eu' }, emoji: '🦸' },
  ]},
  { id: 'RT_PET_043', category: 'team', mode: 'complete', dimension: 'team', weight: 7, title: { es: '¿Tu equipo tiene conocimiento de mascotas?', 'pt-BR': 'Sua equipe tem conhecimento de pets?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'expert', label: { es: 'Sí, muy capacitados', 'pt-BR': 'Sim, muito capacitados' }, emoji: '🎓' },
    { id: 'basic', label: { es: 'Conocimiento básico', 'pt-BR': 'Conhecimento básico' }, emoji: '📚' },
    { id: 'learning', label: { es: 'En capacitación', 'pt-BR': 'Em capacitação' }, emoji: '📖' },
    { id: 'no', label: { es: 'No, solo venden', 'pt-BR': 'Não, apenas vendem' }, emoji: '🛒' },
  ]},
  { id: 'RT_PET_044', category: 'team', mode: 'complete', dimension: 'team', weight: 6, title: { es: '¿Es un negocio familiar?', 'pt-BR': 'É um negócio familiar?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '👪' },
    { id: 'mixed', label: { es: 'Familia + empleados', 'pt-BR': 'Família + empregados' }, emoji: '🔄' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '🏢' },
  ]},
  { id: 'RT_PET_045', category: 'team', mode: 'complete', dimension: 'team', weight: 6, title: { es: '¿Cuesta conseguir groomers capacitados?', 'pt-BR': 'É difícil conseguir groomers capacitados?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'no', label: { es: 'No, encuentro fácil', 'pt-BR': 'Não, encontro fácil' }, emoji: '✅' },
    { id: 'sometimes', label: { es: 'A veces cuesta', 'pt-BR': 'Às vezes é difícil' }, emoji: '⚠️' },
    { id: 'yes', label: { es: 'Sí, muy difícil', 'pt-BR': 'Sim, muito difícil' }, emoji: '🔴' },
    { id: 'na', label: { es: 'No ofrezco peluquería', 'pt-BR': 'Não ofereço banho e tosa' }, emoji: '➖' },
  ]},
  { id: 'RT_PET_046', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Cómo es la rotación de personal?', 'pt-BR': 'Como é a rotatividade de pessoal?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'low', label: { es: 'Baja (años)', 'pt-BR': 'Baixa (anos)' }, emoji: '✅' },
    { id: 'medium', label: { es: 'Media (6-12 meses)', 'pt-BR': 'Média (6-12 meses)' }, emoji: '⚠️' },
    { id: 'high', label: { es: 'Alta (menos de 6 meses)', 'pt-BR': 'Alta (menos de 6 meses)' }, emoji: '🔴' },
    { id: 'na', label: { es: 'N/A', 'pt-BR': 'N/A' }, emoji: '➖' },
  ]},

  // ============ MARKETING Y RETENCIÓN (6) ============
  { id: 'RT_PET_047', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿En qué redes sociales tenés presencia?', 'pt-BR': 'Em quais redes sociais você tem presença?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸' },
    { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '👤' },
    { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
    { id: 'google', label: { es: 'Google My Business', 'pt-BR': 'Google Meu Negócio' }, emoji: '🔍' },
    { id: 'whatsapp', label: { es: 'WhatsApp Business', 'pt-BR': 'WhatsApp Business' }, emoji: '📱' },
    { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_048', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Publicás fotos de mascotas después del grooming?', 'pt-BR': 'Você publica fotos de pets depois do banho e tosa?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'always', label: { es: 'Siempre (con permiso)', 'pt-BR': 'Sempre (com permissão)' }, emoji: '📸' },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄' },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🤏' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_049', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Qué porcentaje de clientes son recurrentes?', 'pt-BR': 'Qual porcentagem de clientes são recorrentes?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'low', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' }, emoji: '📉' },
    { id: 'medium', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '📊' },
    { id: 'high', label: { es: '50-70%', 'pt-BR': '50-70%' }, emoji: '📈' },
    { id: 'very_high', label: { es: 'Más del 70%', 'pt-BR': 'Mais de 70%' }, emoji: '🚀' },
  ]},
  { id: 'RT_PET_050', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'excellent', label: { es: '4.5+ estrellas', 'pt-BR': '4.5+ estrelas' }, emoji: '⭐' },
    { id: 'good', label: { es: '4-4.4 estrellas', 'pt-BR': '4-4.4 estrelas' }, emoji: '✅' },
    { id: 'regular', label: { es: '3.5-4 estrellas', 'pt-BR': '3.5-4 estrelas' }, emoji: '⚠️' },
    { id: 'no_reviews', label: { es: 'Sin reseñas', 'pt-BR': 'Sem avaliações' }, emoji: '❓' },
  ]},
  { id: 'RT_PET_051', category: 'reputation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés programa de fidelización?', 'pt-BR': 'Você tem programa de fidelização?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes', label: { es: 'Sí, puntos/descuentos', 'pt-BR': 'Sim, pontos/descontos' }, emoji: '🎁' },
    { id: 'subscription', label: { es: 'Suscripción de alimentos', 'pt-BR': 'Assinatura de alimentos' }, emoji: '📅' },
    { id: 'informal', label: { es: 'Descuentos informales', 'pt-BR': 'Descontos informais' }, emoji: '🤝' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_052', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Recordás el nombre de las mascotas?', 'pt-BR': 'Você lembra o nome dos pets?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'always', label: { es: 'Sí, siempre (los tengo en sistema)', 'pt-BR': 'Sim, sempre (tenho no sistema)' }, emoji: '🐾' },
    { id: 'regulars', label: { es: 'Solo los regulares', 'pt-BR': 'Apenas os regulares' }, emoji: '💬' },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🤏' },
  ]},

  // ============ OBJETIVOS Y RIESGOS (8) ============
  { id: 'RT_PET_053', category: 'goals', mode: 'both', dimension: 'growth', weight: 9, title: { es: '¿Cuál es tu principal objetivo a 12 meses?', 'pt-BR': 'Qual é seu principal objetivo para 12 meses?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'revenue', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈' },
    { id: 'services', label: { es: 'Expandir servicios (peluquería, guardería)', 'pt-BR': 'Expandir serviços (banho e tosa, creche)' }, emoji: '✂️' },
    { id: 'delivery', label: { es: 'Potenciar delivery/online', 'pt-BR': 'Potencializar delivery/online' }, emoji: '🚚' },
    { id: 'expand', label: { es: 'Abrir otra sucursal', 'pt-BR': 'Abrir outra filial' }, emoji: '🏪' },
    { id: 'efficiency', label: { es: 'Ordenar/Sistematizar', 'pt-BR': 'Organizar/Sistematizar' }, emoji: '⚙️' },
    { id: 'stability', label: { es: 'Mantener estabilidad', 'pt-BR': 'Manter estabilidade' }, emoji: '⚖️' },
  ]},
  { id: 'RT_PET_054', category: 'goals', mode: 'complete', dimension: 'growth', weight: 8, title: { es: '¿Cuánto querés crecer?', 'pt-BR': 'Quanto você quer crescer?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'stable', label: { es: 'Mantenerme igual', 'pt-BR': 'Manter igual' }, emoji: '⚖️' },
    { id: '10-25', label: { es: '10-25% más', 'pt-BR': '10-25% mais' }, emoji: '📈' },
    { id: '25-50', label: { es: '25-50% más', 'pt-BR': '25-50% mais' }, emoji: '🚀' },
    { id: '50+', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '💥' },
  ]},
  { id: 'RT_PET_055', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Cuál es tu mayor desafío actual?', 'pt-BR': 'Qual é seu maior desafio atual?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'competition', label: { es: 'Competencia (cadenas, online)', 'pt-BR': 'Concorrência (redes, online)' }, emoji: '⚔️' },
    { id: 'margin', label: { es: 'Márgenes bajos en alimentos', 'pt-BR': 'Margens baixas em alimentos' }, emoji: '📉' },
    { id: 'traffic', label: { es: 'Conseguir clientes nuevos', 'pt-BR': 'Conseguir clientes novos' }, emoji: '🚶' },
    { id: 'team', label: { es: 'Personal (groomers)', 'pt-BR': 'Pessoal (groomers)' }, emoji: '👥' },
    { id: 'stock', label: { es: 'Gestión de stock', 'pt-BR': 'Gestão de estoque' }, emoji: '📦' },
    { id: 'differentiation', label: { es: 'Diferenciarme', 'pt-BR': 'Diferenciar-me' }, emoji: '🎯' },
  ]},
  { id: 'RT_PET_056', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Considerás agregar servicios?', 'pt-BR': 'Você considera adicionar serviços?' }, type: 'multi', businessTypes: ['pet_shop'], options: [
    { id: 'grooming', label: { es: 'Peluquería (si no tengo)', 'pt-BR': 'Banho e tosa (se não tenho)' }, emoji: '✂️' },
    { id: 'daycare', label: { es: 'Guardería/Hotel', 'pt-BR': 'Creche/Hotel' }, emoji: '🏠' },
    { id: 'veterinary', label: { es: 'Veterinaria', 'pt-BR': 'Veterinária' }, emoji: '🏥' },
    { id: 'training', label: { es: 'Adiestramiento', 'pt-BR': 'Adestramento' }, emoji: '🎓' },
    { id: 'paseo', label: { es: 'Paseo de mascotas', 'pt-BR': 'Passeio de pets' }, emoji: '🦮' },
    { id: 'none', label: { es: 'No por ahora', 'pt-BR': 'Não por enquanto' }, emoji: '➖' },
  ]},
  { id: 'RT_PET_057', category: 'operation', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuál es tu mayor riesgo?', 'pt-BR': 'Qual é seu maior risco?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'incident', label: { es: 'Incidente con mascota (escape, lesión)', 'pt-BR': 'Incidente com pet (fuga, lesão)' }, emoji: '⚠️' },
    { id: 'expiry', label: { es: 'Vencimientos de productos', 'pt-BR': 'Vencimentos de produtos' }, emoji: '📅' },
    { id: 'competition', label: { es: 'Competencia online', 'pt-BR': 'Concorrência online' }, emoji: '🌐' },
    { id: 'dependency', label: { es: 'Dependencia de proveedores', 'pt-BR': 'Dependência de fornecedores' }, emoji: '📦' },
    { id: 'staff', label: { es: 'Perder personal clave', 'pt-BR': 'Perder pessoal chave' }, emoji: '👥' },
  ]},
  { id: 'RT_PET_058', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés seguro de responsabilidad civil?', 'pt-BR': 'Você tem seguro de responsabilidade civil?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🛡️' },
    { id: 'planning', label: { es: 'Lo estoy evaluando', 'pt-BR': 'Estou avaliando' }, emoji: '🤔' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' },
  ]},
  { id: 'RT_PET_059', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Qué restricción te limita más?', 'pt-BR': 'Qual restrição te limita mais?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'capital', label: { es: 'Capital para stock', 'pt-BR': 'Capital para estoque' }, emoji: '💰' },
    { id: 'space', label: { es: 'Espacio físico', 'pt-BR': 'Espaço físico' }, emoji: '📐' },
    { id: 'time', label: { es: 'Mi tiempo', 'pt-BR': 'Meu tempo' }, emoji: '⏰' },
    { id: 'team', label: { es: 'Personal capacitado', 'pt-BR': 'Pessoal capacitado' }, emoji: '👥' },
    { id: 'none', label: { es: 'Ninguna crítica', 'pt-BR': 'Nenhuma crítica' }, emoji: '✅' },
  ]},
  { id: 'RT_PET_060', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 5, title: { es: '¿Tenés competencia de grandes cadenas cerca?', 'pt-BR': 'Você tem concorrência de grandes redes perto?' }, type: 'single', businessTypes: ['pet_shop'], options: [
    { id: 'yes_strong', label: { es: 'Sí, muy fuerte', 'pt-BR': 'Sim, muito forte' }, emoji: '🔴' },
    { id: 'yes_moderate', label: { es: 'Sí, pero me diferencio', 'pt-BR': 'Sim, mas me diferencio' }, emoji: '⚠️' },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '✅' },
  ]},
];

// Export filtered by mode
export const PET_SHOP_QUICK = PET_SHOP_QUESTIONS.filter(q => q.mode === 'quick' || q.mode === 'both');
export const PET_SHOP_COMPLETE = PET_SHOP_QUESTIONS;
