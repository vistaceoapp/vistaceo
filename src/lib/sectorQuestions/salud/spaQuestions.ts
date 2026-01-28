// Spa / Centro de Masajes - 70 Ultra-Personalized Questions
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const SPA_COMPLETE: VistaSetupQuestion[] = [
  // IDENTIDAD (8)
  { id: 'SA_SPA_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué tipo de servicios ofrecés?', 'pt-BR': 'Que tipo de serviços você oferece?' }, type: 'multi', required: true, businessTypes: ['spa_masajes'], options: [
    { id: 'massage', label: { es: 'Masajes', 'pt-BR': 'Massagens' }, emoji: '💆', impactScore: 18 },
    { id: 'facial', label: { es: 'Tratamientos faciales', 'pt-BR': 'Tratamentos faciais' }, emoji: '✨', impactScore: 18 },
    { id: 'body', label: { es: 'Tratamientos corporales', 'pt-BR': 'Tratamentos corporais' }, emoji: '🧴', impactScore: 18 },
    { id: 'hydro', label: { es: 'Hidroterapia', 'pt-BR': 'Hidroterapia' }, emoji: '💧', impactScore: 15 },
    { id: 'yoga', label: { es: 'Yoga/Meditación', 'pt-BR': 'Yoga/Meditação' }, emoji: '🧘', impactScore: 12 },
    { id: 'aesthetic', label: { es: 'Estética avanzada', 'pt-BR': 'Estética avançada' }, emoji: '💎', impactScore: 20 },
  ]},
  { id: 'SA_SPA_002', category: 'identity', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Cuál es tu posicionamiento?', 'pt-BR': 'Qual é seu posicionamento?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'economy', label: { es: 'Económico', 'pt-BR': 'Econômico' }, emoji: '💰', impactScore: 10 },
    { id: 'mid', label: { es: 'Precio medio', 'pt-BR': 'Preço médio' }, emoji: '⚖️', impactScore: 15 },
    { id: 'premium', label: { es: 'Premium', 'pt-BR': 'Premium' }, emoji: '✨', impactScore: 20 },
    { id: 'luxury', label: { es: 'Lujo', 'pt-BR': 'Luxo' }, emoji: '💎', impactScore: 22 },
  ]},
  { id: 'SA_SPA_003', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuántas cabinas/salas tenés?', 'pt-BR': 'Quantas cabines/salas você tem?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: '1-2', label: { es: '1-2 cabinas', 'pt-BR': '1-2 cabines' }, emoji: '🚪', impactScore: 10 },
    { id: '3-5', label: { es: '3-5 cabinas', 'pt-BR': '3-5 cabines' }, emoji: '🏥', impactScore: 15 },
    { id: '6-10', label: { es: '6-10 cabinas', 'pt-BR': '6-10 cabines' }, emoji: '🏢', impactScore: 20 },
    { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏬', impactScore: 22 },
  ]},
  { id: 'SA_SPA_004', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Dónde está ubicado tu spa?', 'pt-BR': 'Onde está localizado seu spa?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'hotel', label: { es: 'Dentro de hotel', 'pt-BR': 'Dentro de hotel' }, emoji: '🏨', impactScore: 22 },
    { id: 'standalone', label: { es: 'Local independiente', 'pt-BR': 'Local independente' }, emoji: '🏢', impactScore: 15 },
    { id: 'mall', label: { es: 'Centro comercial', 'pt-BR': 'Shopping center' }, emoji: '🏬', impactScore: 18 },
    { id: 'residential', label: { es: 'Zona residencial', 'pt-BR': 'Zona residencial' }, emoji: '🏘️', impactScore: 12 },
  ]},
  { id: 'SA_SPA_005', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántos m² tiene tu spa?', 'pt-BR': 'Quantos m² tem seu spa?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'small', label: { es: 'Hasta 80m²', 'pt-BR': 'Até 80m²' }, emoji: '📐', impactScore: 10 },
    { id: 'medium', label: { es: '80-200m²', 'pt-BR': '80-200m²' }, emoji: '🏥', impactScore: 15 },
    { id: 'large', label: { es: '200-500m²', 'pt-BR': '200-500m²' }, emoji: '🏢', impactScore: 20 },
    { id: 'mega', label: { es: 'Más de 500m²', 'pt-BR': 'Mais de 500m²' }, emoji: '🏬', impactScore: 22 },
  ]},
  { id: 'SA_SPA_006', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés área húmeda?', 'pt-BR': 'Você tem área molhada?' }, type: 'multi', businessTypes: ['spa_masajes'], options: [
    { id: 'jacuzzi', label: { es: 'Jacuzzi', 'pt-BR': 'Jacuzzi' }, emoji: '🛁', impactScore: 18 },
    { id: 'sauna', label: { es: 'Sauna', 'pt-BR': 'Sauna' }, emoji: '🧖', impactScore: 18 },
    { id: 'steam', label: { es: 'Vapor', 'pt-BR': 'Vapor' }, emoji: '💨', impactScore: 15 },
    { id: 'pool', label: { es: 'Piscina', 'pt-BR': 'Piscina' }, emoji: '🏊', impactScore: 22 },
    { id: 'none', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_007', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cuál es tu filosofía/enfoque?', 'pt-BR': 'Qual é sua filosofia/enfoque?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'holistic', label: { es: 'Holístico/Bienestar', 'pt-BR': 'Holístico/Bem-estar' }, emoji: '🌿', impactScore: 18 },
    { id: 'medical', label: { es: 'Médico/Terapéutico', 'pt-BR': 'Médico/Terapêutico' }, emoji: '🏥', impactScore: 20 },
    { id: 'aesthetic', label: { es: 'Estético/Belleza', 'pt-BR': 'Estético/Beleza' }, emoji: '✨', impactScore: 18 },
    { id: 'relaxation', label: { es: 'Relajación pura', 'pt-BR': 'Relaxamento puro' }, emoji: '😌', impactScore: 15 },
  ]},
  { id: 'SA_SPA_008', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hace cuánto operás?', 'pt-BR': 'Há quanto tempo você opera?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'new', label: { es: 'Menos de 2 años', 'pt-BR': 'Menos de 2 anos' }, emoji: '🌱', impactScore: 8 },
    { id: 'established', label: { es: '2-5 años', 'pt-BR': '2-5 anos' }, emoji: '🌿', impactScore: 15 },
    { id: 'veteran', label: { es: '5-10 años', 'pt-BR': '5-10 anos' }, emoji: '🌳', impactScore: 20 },
    { id: 'legacy', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆', impactScore: 22 },
  ]},

  // OPERACIÓN (10)
  { id: 'SA_SPA_009', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Usás software de gestión?', 'pt-BR': 'Você usa software de gestão?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '💻', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📊', impactScore: 15 },
    { id: 'excel', label: { es: 'Excel/Planillas', 'pt-BR': 'Excel/Planilhas' }, emoji: '📋', impactScore: 10 },
    { id: 'paper', label: { es: 'Papel', 'pt-BR': 'Papel' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'SA_SPA_010', category: 'operation', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cómo gestionás las reservas?', 'pt-BR': 'Como você gerencia as reservas?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'online', label: { es: 'Reservas online', 'pt-BR': 'Reservas online' }, emoji: '🌐', impactScore: 22 },
    { id: 'app', label: { es: 'App/Sistema', 'pt-BR': 'App/Sistema' }, emoji: '📱', impactScore: 18 },
    { id: 'phone', label: { es: 'Teléfono', 'pt-BR': 'Telefone' }, emoji: '📞', impactScore: 12 },
    { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬', impactScore: 15 },
  ]},
  { id: 'SA_SPA_011', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuántas horas abrís?', 'pt-BR': 'Quantas horas você abre?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: '6-8', label: { es: '6-8 horas', 'pt-BR': '6-8 horas' }, emoji: '🕐', impactScore: 10 },
    { id: '8-10', label: { es: '8-10 horas', 'pt-BR': '8-10 horas' }, emoji: '🕕', impactScore: 15 },
    { id: '10-12', label: { es: '10-12 horas', 'pt-BR': '10-12 horas' }, emoji: '🕙', impactScore: 18 },
    { id: 'extended', label: { es: 'Más de 12 horas', 'pt-BR': 'Mais de 12 horas' }, emoji: '🌙', impactScore: 22 },
  ]},
  { id: 'SA_SPA_012', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Abrís fines de semana?', 'pt-BR': 'Você abre fins de semana?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_both', label: { es: 'Sí, ambos días', 'pt-BR': 'Sim, ambos dias' }, emoji: '📅', impactScore: 22 },
    { id: 'yes_saturday', label: { es: 'Solo sábados', 'pt-BR': 'Só sábados' }, emoji: '🗓️', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_013', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Usás productos de marca?', 'pt-BR': 'Você usa produtos de marca?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'premium', label: { es: 'Premium/Lujo', 'pt-BR': 'Premium/Luxo' }, emoji: '💎', impactScore: 22 },
    { id: 'professional', label: { es: 'Profesionales', 'pt-BR': 'Profissionais' }, emoji: '🏆', impactScore: 18 },
    { id: 'mixed', label: { es: 'Mixtos', 'pt-BR': 'Mistos' }, emoji: '🔄', impactScore: 12 },
    { id: 'own', label: { es: 'Propios', 'pt-BR': 'Próprios' }, emoji: '🏷️', impactScore: 15 },
  ]},
  { id: 'SA_SPA_014', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés servicios para parejas?', 'pt-BR': 'Você oferece serviços para casais?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_dedicated', label: { es: 'Sí, sala especial', 'pt-BR': 'Sim, sala especial' }, emoji: '💑', impactScore: 22 },
    { id: 'yes_possible', label: { es: 'Sí, posible', 'pt-BR': 'Sim, possível' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_015', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Ofrecés paquetes/circuitos?', 'pt-BR': 'Você oferece pacotes/circuitos?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '📦', impactScore: 22 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🎁', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_016', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés música ambiente/aromaterapia?', 'pt-BR': 'Você tem música ambiente/aromaterapia?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_complete', label: { es: 'Sí, experiencia completa', 'pt-BR': 'Sim, experiência completa' }, emoji: '🎵', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '🎶', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_017', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés bebidas/snacks?', 'pt-BR': 'Você oferece bebidas/snacks?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_full', label: { es: 'Sí, servicio completo', 'pt-BR': 'Sim, serviço completo' }, emoji: '🍵', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '🥤', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_018', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés área de relajación?', 'pt-BR': 'Você tem área de relaxamento?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_dedicated', label: { es: 'Sí, dedicada', 'pt-BR': 'Sim, dedicada' }, emoji: '😌', impactScore: 22 },
    { id: 'yes_shared', label: { es: 'Sí, compartida', 'pt-BR': 'Sim, compartilhada' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // FINANZAS (10)
  { id: 'SA_SPA_019', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'number', businessTypes: ['spa_masajes'] },
  { id: 'SA_SPA_020', category: 'finance', mode: 'both', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es tu margen promedio?', 'pt-BR': 'Qual é sua margem média?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: '30-40', label: { es: '30-40%', 'pt-BR': '30-40%' }, emoji: '📊', impactScore: 10 },
    { id: '40-50', label: { es: '40-50%', 'pt-BR': '40-50%' }, emoji: '📈', impactScore: 15 },
    { id: '50-60', label: { es: '50-60%', 'pt-BR': '50-60%' }, emoji: '💰', impactScore: 20 },
    { id: '60+', label: { es: 'Más de 60%', 'pt-BR': 'Mais de 60%' }, emoji: '💎', impactScore: 22 },
  ]},
  { id: 'SA_SPA_021', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Que meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['spa_masajes'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 10 },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 12 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 15 },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦', impactScore: 15 },
  ]},
  { id: 'SA_SPA_022', category: 'finance', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Vendés bonos/gift cards?', 'pt-BR': 'Você vende vouchers/gift cards?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🎁', impactScore: 22 },
    { id: 'yes_passive', label: { es: 'Sí, si piden', 'pt-BR': 'Sim, se pedem' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_023', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuál es tu ocupación promedio?', 'pt-BR': 'Qual é sua ocupação média?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'high', label: { es: 'Más del 75%', 'pt-BR': 'Mais de 75%' }, emoji: '🌟', impactScore: 22 },
    { id: 'medium', label: { es: '50-75%', 'pt-BR': '50-75%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 50%', 'pt-BR': 'Menos de 50%' }, emoji: '💛', impactScore: 8 },
  ]},
  { id: 'SA_SPA_024', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Vendés productos retail?', 'pt-BR': 'Você vende produtos retail?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🛍️', impactScore: 22 },
    { id: 'yes_passive', label: { es: 'Sí, exhibidos', 'pt-BR': 'Sim, expostos' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_025', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés membresías/abonos?', 'pt-BR': 'Você tem assinaturas/pacotes?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🎫', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunos clientes', 'pt-BR': 'Sim, alguns clientes' }, emoji: '📋', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_026', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cómo es tu flujo de caja?', 'pt-BR': 'Como é seu fluxo de caixa?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'healthy', label: { es: 'Saludable', 'pt-BR': 'Saudável' }, emoji: '💚', impactScore: 22 },
    { id: 'seasonal', label: { es: 'Estacional', 'pt-BR': 'Sazonal' }, emoji: '📊', impactScore: 15 },
    { id: 'tight', label: { es: 'Ajustado', 'pt-BR': 'Apertado' }, emoji: '💛', impactScore: 10 },
  ]},
  { id: 'SA_SPA_027', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés seguro comercial?', 'pt-BR': 'Você tem seguro comercial?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_028', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cuál es tu servicio más rentable?', 'pt-BR': 'Qual é seu serviço mais rentável?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'massage', label: { es: 'Masajes', 'pt-BR': 'Massagens' }, emoji: '💆', impactScore: 15 },
    { id: 'facial', label: { es: 'Faciales', 'pt-BR': 'Faciais' }, emoji: '✨', impactScore: 18 },
    { id: 'body', label: { es: 'Corporales', 'pt-BR': 'Corporais' }, emoji: '🧴', impactScore: 18 },
    { id: 'packages', label: { es: 'Paquetes', 'pt-BR': 'Pacotes' }, emoji: '📦', impactScore: 22 },
  ]},

  // EQUIPO (8)
  { id: 'SA_SPA_029', category: 'team', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántas personas trabajan?', 'pt-BR': 'Quantas pessoas trabalham?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤', impactScore: 8 },
    { id: '2-4', label: { es: '2-4 personas', 'pt-BR': '2-4 pessoas' }, emoji: '👥', impactScore: 12 },
    { id: '5-10', label: { es: '5-10 personas', 'pt-BR': '5-10 pessoas' }, emoji: '👨‍👩‍👧', impactScore: 18 },
    { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏢', impactScore: 22 },
  ]},
  { id: 'SA_SPA_030', category: 'team', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tu equipo está certificado?', 'pt-BR': 'Sua equipe está certificada?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_all', label: { es: 'Sí, todos', 'pt-BR': 'Sim, todos' }, emoji: '🏆', impactScore: 22 },
    { id: 'yes_most', label: { es: 'Sí, la mayoría', 'pt-BR': 'Sim, a maioria' }, emoji: '🎓', impactScore: 18 },
    { id: 'some', label: { es: 'Algunos', 'pt-BR': 'Alguns' }, emoji: '📋', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_031', category: 'team', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Hay capacitación continua?', 'pt-BR': 'Há treinamento contínuo?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '🎓', impactScore: 22 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📚', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_032', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cómo es la rotación de personal?', 'pt-BR': 'Como é a rotatividade de pessoal?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'low', label: { es: 'Baja', 'pt-BR': 'Baixa' }, emoji: '💚', impactScore: 22 },
    { id: 'medium', label: { es: 'Media', 'pt-BR': 'Média' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alta', 'pt-BR': 'Alta' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'SA_SPA_033', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés recepcionista?', 'pt-BR': 'Você tem recepcionista?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_full', label: { es: 'Sí, tiempo completo', 'pt-BR': 'Sim, tempo integral' }, emoji: '👩‍💼', impactScore: 22 },
    { id: 'yes_part', label: { es: 'Sí, tiempo parcial', 'pt-BR': 'Sim, tempo parcial' }, emoji: '🕐', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_034', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Usás uniformes?', 'pt-BR': 'Você usa uniformes?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_branded', label: { es: 'Sí, con marca', 'pt-BR': 'Sim, com marca' }, emoji: '👔', impactScore: 22 },
    { id: 'yes_standard', label: { es: 'Sí, estándar', 'pt-BR': 'Sim, padrão' }, emoji: '👕', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_035', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés objetivos por terapeuta?', 'pt-BR': 'Você tem metas por terapeuta?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🎯', impactScore: 22 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_SPA_036', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Pagás comisiones?', 'pt-BR': 'Você paga comissões?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '💰', impactScore: 18 },
    { id: 'no', label: { es: 'No, sueldo fijo', 'pt-BR': 'Não, salário fixo' }, emoji: '📋', impactScore: 12 },
  ]},

  // VENTAS/CLIENTES (8)
  { id: 'SA_SPA_037', category: 'sales', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos clientes atendés por día?', 'pt-BR': 'Quantos clientes você atende por dia?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: '1-10', label: { es: '1-10', 'pt-BR': '1-10' }, emoji: '👤', impactScore: 10 },
    { id: '11-25', label: { es: '11-25', 'pt-BR': '11-25' }, emoji: '👥', impactScore: 15 },
    { id: '26-50', label: { es: '26-50', 'pt-BR': '26-50' }, emoji: '🏥', impactScore: 20 },
    { id: '50+', label: { es: 'Más de 50', 'pt-BR': 'Mais de 50' }, emoji: '🏬', impactScore: 22 },
  ]},
  { id: 'SA_SPA_038', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Qué % son clientes recurrentes?', 'pt-BR': 'Que % são clientes recorrentes?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'high', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🌟', impactScore: 22 },
    { id: 'medium', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 40%', 'pt-BR': 'Menos de 40%' }, emoji: '💛', impactScore: 10 },
  ]},
  { id: 'SA_SPA_039', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cómo llegan los clientes nuevos?', 'pt-BR': 'Como chegam os clientes novos?' }, type: 'multi', businessTypes: ['spa_masajes'], options: [
    { id: 'referral', label: { es: 'Referidos', 'pt-BR': 'Indicações' }, emoji: '🤝', impactScore: 22 },
    { id: 'google', label: { es: 'Google', 'pt-BR': 'Google' }, emoji: '🔍', impactScore: 18 },
    { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 18 },
    { id: 'walk_in', label: { es: 'Espontáneo', 'pt-BR': 'Espontâneo' }, emoji: '🚶', impactScore: 10 },
  ]},
  { id: 'SA_SPA_040', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cuál es tu servicio más solicitado?', 'pt-BR': 'Qual é seu serviço mais solicitado?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'relaxing_massage', label: { es: 'Masaje relajante', 'pt-BR': 'Massagem relaxante' }, emoji: '💆', impactScore: 15 },
    { id: 'deep_tissue', label: { es: 'Descontracturante', 'pt-BR': 'Descontrataturante' }, emoji: '💪', impactScore: 18 },
    { id: 'facial', label: { es: 'Facial', 'pt-BR': 'Facial' }, emoji: '✨', impactScore: 18 },
    { id: 'package', label: { es: 'Circuito/Paquete', 'pt-BR': 'Circuito/Pacote' }, emoji: '📦', impactScore: 22 },
  ]},
  { id: 'SA_SPA_041', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Atendés grupos/empresas?', 'pt-BR': 'Você atende grupos/empresas?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🏢', impactScore: 22 },
    { id: 'yes_passive', label: { es: 'Sí, si contactan', 'pt-BR': 'Sim, se contatam' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_042', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Hacés seguimiento post-servicio?', 'pt-BR': 'Você faz acompanhamento pós-serviço?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_system', label: { es: 'Sí, sistematizado', 'pt-BR': 'Sim, sistematizado' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📞', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_043', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Tenés día spa para eventos?', 'pt-BR': 'Você tem day spa para eventos?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🎉', impactScore: 22 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '🎊', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_044', category: 'sales', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuál es tu tasa de cancelación?', 'pt-BR': 'Qual é sua taxa de cancelamento?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'low', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '💚', impactScore: 22 },
    { id: 'medium', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '💛', impactScore: 15 },
    { id: 'high', label: { es: 'Más del 20%', 'pt-BR': 'Mais de 20%' }, emoji: '🔴', impactScore: 5 },
  ]},

  // MARKETING (8)
  { id: 'SA_SPA_045', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Tenés redes sociales activas?', 'pt-BR': 'Você tem redes sociais ativas?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_active', label: { es: 'Sí, muy activas', 'pt-BR': 'Sim, muito ativas' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_regular', label: { es: 'Sí, regulares', 'pt-BR': 'Sim, regulares' }, emoji: '📲', impactScore: 15 },
    { id: 'yes_basic', label: { es: 'Sí, básicas', 'pt-BR': 'Sim, básicas' }, emoji: '📴', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_046', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Tenés página web?', 'pt-BR': 'Você tem site?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_booking', label: { es: 'Sí, con reservas', 'pt-BR': 'Sim, com reservas' }, emoji: '🌐', impactScore: 22 },
    { id: 'yes_info', label: { es: 'Sí, informativa', 'pt-BR': 'Sim, informativo' }, emoji: '📄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_047', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Estás en Google My Business?', 'pt-BR': 'Você está no Google Meu Negócio?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_optimized', label: { es: 'Sí, optimizado', 'pt-BR': 'Sim, otimizado' }, emoji: '🌟', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_048', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Invertís en publicidad?', 'pt-BR': 'Você investe em publicidade?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_consistent', label: { es: 'Sí, constante', 'pt-BR': 'Sim, constante' }, emoji: '💰', impactScore: 22 },
    { id: 'yes_campaigns', label: { es: 'Sí, campañas', 'pt-BR': 'Sim, campanhas' }, emoji: '📢', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_049', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés programa de referidos?', 'pt-BR': 'Você tem programa de indicações?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_formal', label: { es: 'Sí, formal', 'pt-BR': 'Sim, formal' }, emoji: '🎁', impactScore: 22 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_050', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Usás WhatsApp Business?', 'pt-BR': 'Você usa WhatsApp Business?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_catalog', label: { es: 'Sí, con catálogo', 'pt-BR': 'Sim, com catálogo' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_051', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Trabajás con influencers?', 'pt-BR': 'Você trabalha com influenciadores?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '⭐', impactScore: 22 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '🌟', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_052', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Hacés email marketing?', 'pt-BR': 'Você faz email marketing?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '📧', impactScore: 22 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📮', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // REPUTACIÓN (6)
  { id: 'SA_SPA_053', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Tenés reseñas online?', 'pt-BR': 'Você tem avaliações online?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'many_good', label: { es: 'Muchas y buenas', 'pt-BR': 'Muitas e boas' }, emoji: '⭐', impactScore: 22 },
    { id: 'some_good', label: { es: 'Algunas buenas', 'pt-BR': 'Algumas boas' }, emoji: '🌟', impactScore: 15 },
    { id: 'few', label: { es: 'Pocas', 'pt-BR': 'Poucas' }, emoji: '💫', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_054', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '🌟', impactScore: 22 },
    { id: '4-4.5', label: { es: '4.0 - 4.4', 'pt-BR': '4.0 - 4.4' }, emoji: '⭐', impactScore: 15 },
    { id: 'below', label: { es: 'Menos de 4', 'pt-BR': 'Menos de 4' }, emoji: '💛', impactScore: 8 },
  ]},
  { id: 'SA_SPA_055', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Respondés a las reseñas?', 'pt-BR': 'Você responde às avaliações?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 22 },
    { id: 'usually', label: { es: 'Generalmente', 'pt-BR': 'Geralmente' }, emoji: '💬', impactScore: 15 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '😓', impactScore: 8 },
  ]},
  { id: 'SA_SPA_056', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés certificaciones/premios?', 'pt-BR': 'Você tem certificações/prêmios?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🏆', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🥇', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_057', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Aparecés en medios/prensa?', 'pt-BR': 'Você aparece na mídia/imprensa?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_often', label: { es: 'Sí, frecuentemente', 'pt-BR': 'Sim, frequentemente' }, emoji: '📰', impactScore: 22 },
    { id: 'yes_sometimes', label: { es: 'Sí, alguna vez', 'pt-BR': 'Sim, alguma vez' }, emoji: '📝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_058', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés alianzas con hoteles?', 'pt-BR': 'Você tem alianças com hotéis?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🏨', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🤝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // METAS (12)
  { id: 'SA_SPA_059', category: 'goals', mode: 'both', dimension: 'growth', weight: 8, title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'clients', label: { es: 'Más clientes', 'pt-BR': 'Mais clientes' }, emoji: '👥', impactScore: 15 },
    { id: 'revenue', label: { es: 'Aumentar facturación', 'pt-BR': 'Aumentar faturamento' }, emoji: '💰', impactScore: 15 },
    { id: 'expand', label: { es: 'Expandir', 'pt-BR': 'Expandir' }, emoji: '🚀', impactScore: 22 },
    { id: 'brand', label: { es: 'Fortalecer marca', 'pt-BR': 'Fortalecer marca' }, emoji: '✨', impactScore: 18 },
  ]},
  { id: 'SA_SPA_060', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Pensás agregar servicios?', 'pt-BR': 'Você pensa em adicionar serviços?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_soon', label: { es: 'Sí, pronto', 'pt-BR': 'Sim, em breve' }, emoji: '🚀', impactScore: 22 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_SPA_061', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Querés abrir más sedes?', 'pt-BR': 'Você quer abrir mais unidades?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🚀', impactScore: 22 },
    { id: 'maybe', label: { es: 'Quizás', 'pt-BR': 'Talvez' }, emoji: '🤔', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_062', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Cuál es tu mayor desafío?', 'pt-BR': 'Qual é seu maior desafio?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'clients', label: { es: 'Conseguir clientes', 'pt-BR': 'Conseguir clientes' }, emoji: '👥', impactScore: 15 },
    { id: 'team', label: { es: 'Retener equipo', 'pt-BR': 'Reter equipe' }, emoji: '👨‍👩‍👧', impactScore: 15 },
    { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, emoji: '🏢', impactScore: 12 },
    { id: 'costs', label: { es: 'Controlar costos', 'pt-BR': 'Controlar custos' }, emoji: '💰', impactScore: 15 },
  ]},
  { id: 'SA_SPA_063', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Qué área querés mejorar?', 'pt-BR': 'Que área você quer melhorar?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'marketing', label: { es: 'Marketing', 'pt-BR': 'Marketing' }, emoji: '📱', impactScore: 18 },
    { id: 'operations', label: { es: 'Operaciones', 'pt-BR': 'Operações' }, emoji: '⚙️', impactScore: 12 },
    { id: 'experience', label: { es: 'Experiencia cliente', 'pt-BR': 'Experiência cliente' }, emoji: '✨', impactScore: 18 },
    { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, emoji: '👥', impactScore: 15 },
  ]},
  { id: 'SA_SPA_064', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Tenés plan de negocios?', 'pt-BR': 'Você tem plano de negócios?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 22 },
    { id: 'informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_SPA_065', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés tratamientos con tecnología?', 'pt-BR': 'Você oferece tratamentos com tecnologia?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '💻', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🔬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_066', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés línea de productos propia?', 'pt-BR': 'Você tem linha de produtos própria?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🏷️', impactScore: 22 },
    { id: 'planning', label: { es: 'En desarrollo', 'pt-BR': 'Em desenvolvimento' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_067', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Atendés novias/bodas?', 'pt-BR': 'Você atende noivas/casamentos?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_specialized', label: { es: 'Sí, especializado', 'pt-BR': 'Sim, especializado' }, emoji: '👰', impactScore: 22 },
    { id: 'yes_general', label: { es: 'Sí, como servicio', 'pt-BR': 'Sim, como serviço' }, emoji: '💒', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_068', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés servicios a domicilio?', 'pt-BR': 'Você oferece serviços a domicílio?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🚗', impactScore: 22 },
    { id: 'yes_vip', label: { es: 'Sí, solo VIP', 'pt-BR': 'Sim, só VIP' }, emoji: '💎', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_SPA_069', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés ritual/experiencia signature?', 'pt-BR': 'Você tem ritual/experiência signature?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '✨', impactScore: 22 },
    { id: 'developing', label: { es: 'En desarrollo', 'pt-BR': 'Em desenvolvimento' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_SPA_070', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cuál es tu diferenciador?', 'pt-BR': 'Qual é seu diferencial?' }, type: 'single', businessTypes: ['spa_masajes'], options: [
    { id: 'experience', label: { es: 'Experiencia única', 'pt-BR': 'Experiência única' }, emoji: '✨', impactScore: 22 },
    { id: 'products', label: { es: 'Productos premium', 'pt-BR': 'Produtos premium' }, emoji: '💎', impactScore: 18 },
    { id: 'team', label: { es: 'Equipo experto', 'pt-BR': 'Equipe especialista' }, emoji: '🏆', impactScore: 20 },
    { id: 'price', label: { es: 'Precio', 'pt-BR': 'Preço' }, emoji: '💰', impactScore: 12 },
    { id: 'location', label: { es: 'Ubicación', 'pt-BR': 'Localização' }, emoji: '📍', impactScore: 15 },
  ]},
];
