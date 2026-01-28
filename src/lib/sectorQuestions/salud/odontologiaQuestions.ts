// Centro Odontológico / Dental - 70 Ultra-Personalized Questions
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const ODONTOLOGIA_COMPLETE: VistaSetupQuestion[] = [
  // IDENTIDAD (8)
  { id: 'SA_ODO_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué especialidades ofrecés?', 'pt-BR': 'Que especialidades você oferece?' }, type: 'multi', required: true, businessTypes: ['centro_odontologico'], options: [
    { id: 'general', label: { es: 'Odontología general', 'pt-BR': 'Odontologia geral' }, emoji: '🦷', impactScore: 15 },
    { id: 'ortho', label: { es: 'Ortodoncia', 'pt-BR': 'Ortodontia' }, emoji: '😁', impactScore: 18 },
    { id: 'implants', label: { es: 'Implantes', 'pt-BR': 'Implantes' }, emoji: '🔩', impactScore: 20 },
    { id: 'endo', label: { es: 'Endodoncia', 'pt-BR': 'Endodontia' }, emoji: '🔬', impactScore: 15 },
    { id: 'perio', label: { es: 'Periodoncia', 'pt-BR': 'Periodontia' }, emoji: '🩺', impactScore: 15 },
    { id: 'aesthetic', label: { es: 'Estética dental', 'pt-BR': 'Estética dental' }, emoji: '✨', impactScore: 18 },
    { id: 'pediatric', label: { es: 'Odontopediatría', 'pt-BR': 'Odontopediatria' }, emoji: '👶', impactScore: 15 },
  ]},
  { id: 'SA_ODO_002', category: 'identity', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Cuántos consultorios/sillones tenés?', 'pt-BR': 'Quantos consultórios/cadeiras você tem?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: '1', label: { es: '1 sillón', 'pt-BR': '1 cadeira' }, emoji: '🪑', impactScore: 10 },
    { id: '2-3', label: { es: '2-3 sillones', 'pt-BR': '2-3 cadeiras' }, emoji: '🏥', impactScore: 15 },
    { id: '4-6', label: { es: '4-6 sillones', 'pt-BR': '4-6 cadeiras' }, emoji: '🏢', impactScore: 20 },
    { id: '7+', label: { es: '7 o más', 'pt-BR': '7 ou mais' }, emoji: '🏬', impactScore: 22 },
  ]},
  { id: 'SA_ODO_003', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Cuál es tu posicionamiento?', 'pt-BR': 'Qual é seu posicionamento?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'economy', label: { es: 'Económico/Popular', 'pt-BR': 'Econômico/Popular' }, emoji: '💰', impactScore: 10 },
    { id: 'mid', label: { es: 'Precio medio', 'pt-BR': 'Preço médio' }, emoji: '⚖️', impactScore: 15 },
    { id: 'premium', label: { es: 'Premium', 'pt-BR': 'Premium' }, emoji: '✨', impactScore: 20 },
    { id: 'luxury', label: { es: 'Alta gama', 'pt-BR': 'Alto padrão' }, emoji: '💎', impactScore: 22 },
  ]},
  { id: 'SA_ODO_004', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Dónde está ubicado el consultorio?', 'pt-BR': 'Onde está localizado o consultório?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'medical_building', label: { es: 'Edificio médico', 'pt-BR': 'Prédio médico' }, emoji: '🏥', impactScore: 18 },
    { id: 'commercial', label: { es: 'Zona comercial', 'pt-BR': 'Zona comercial' }, emoji: '🏢', impactScore: 15 },
    { id: 'residential', label: { es: 'Zona residencial', 'pt-BR': 'Zona residencial' }, emoji: '🏘️', impactScore: 12 },
    { id: 'mall', label: { es: 'Centro comercial', 'pt-BR': 'Shopping center' }, emoji: '🏬', impactScore: 18 },
  ]},
  { id: 'SA_ODO_005', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Hace cuánto ejercés?', 'pt-BR': 'Há quanto tempo você atende?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'new', label: { es: 'Menos de 3 años', 'pt-BR': 'Menos de 3 anos' }, emoji: '🌱', impactScore: 8 },
    { id: 'established', label: { es: '3-10 años', 'pt-BR': '3-10 anos' }, emoji: '🌿', impactScore: 15 },
    { id: 'veteran', label: { es: '10-20 años', 'pt-BR': '10-20 anos' }, emoji: '🌳', impactScore: 20 },
    { id: 'legacy', label: { es: 'Más de 20 años', 'pt-BR': 'Mais de 20 anos' }, emoji: '🏆', impactScore: 22 },
  ]},
  { id: 'SA_ODO_006', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántos m² tiene tu consultorio?', 'pt-BR': 'Quantos m² tem seu consultório?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'small', label: { es: 'Hasta 40m²', 'pt-BR': 'Até 40m²' }, emoji: '📐', impactScore: 8 },
    { id: 'medium', label: { es: '40-80m²', 'pt-BR': '40-80m²' }, emoji: '🏥', impactScore: 15 },
    { id: 'large', label: { es: '80-150m²', 'pt-BR': '80-150m²' }, emoji: '🏢', impactScore: 18 },
    { id: 'clinic', label: { es: 'Más de 150m²', 'pt-BR': 'Mais de 150m²' }, emoji: '🏬', impactScore: 22 },
  ]},
  { id: 'SA_ODO_007', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tu consultorio tiene nombre/marca?', 'pt-BR': 'Seu consultório tem nome/marca?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_brand', label: { es: 'Sí, marca registrada', 'pt-BR': 'Sim, marca registrada' }, emoji: '®️', impactScore: 22 },
    { id: 'yes_name', label: { es: 'Sí, nombre comercial', 'pt-BR': 'Sim, nome comercial' }, emoji: '🏷️', impactScore: 15 },
    { id: 'personal', label: { es: 'Mi nombre', 'pt-BR': 'Meu nome' }, emoji: '👨‍⚕️', impactScore: 12 },
  ]},
  { id: 'SA_ODO_008', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cuál es tu especialidad principal?', 'pt-BR': 'Qual é sua especialidade principal?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'general', label: { es: 'Generalista', 'pt-BR': 'Generalista' }, emoji: '🦷', impactScore: 12 },
    { id: 'ortho', label: { es: 'Ortodoncia', 'pt-BR': 'Ortodontia' }, emoji: '😁', impactScore: 18 },
    { id: 'implants', label: { es: 'Implantología', 'pt-BR': 'Implantologia' }, emoji: '🔩', impactScore: 22 },
    { id: 'aesthetic', label: { es: 'Estética', 'pt-BR': 'Estética' }, emoji: '✨', impactScore: 20 },
    { id: 'pediatric', label: { es: 'Odontopediatría', 'pt-BR': 'Odontopediatria' }, emoji: '👶', impactScore: 15 },
  ]},

  // OPERACIÓN (10)
  { id: 'SA_ODO_009', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Usás software de gestión?', 'pt-BR': 'Você usa software de gestão?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '💻', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📊', impactScore: 15 },
    { id: 'excel', label: { es: 'Excel/Planillas', 'pt-BR': 'Excel/Planilhas' }, emoji: '📋', impactScore: 10 },
    { id: 'paper', label: { es: 'Papel', 'pt-BR': 'Papel' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'SA_ODO_010', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Tenés historia clínica digital?', 'pt-BR': 'Você tem prontuário digital?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completa', 'pt-BR': 'Sim, completo' }, emoji: '💻', impactScore: 22 },
    { id: 'yes_partial', label: { es: 'Sí, parcial', 'pt-BR': 'Sim, parcial' }, emoji: '📊', impactScore: 15 },
    { id: 'no', label: { es: 'No, papel', 'pt-BR': 'Não, papel' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'SA_ODO_011', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés radiografía digital?', 'pt-BR': 'Você tem radiografia digital?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_3d', label: { es: 'Sí, 3D/Tomografía', 'pt-BR': 'Sim, 3D/Tomografia' }, emoji: '🔬', impactScore: 22 },
    { id: 'yes_digital', label: { es: 'Sí, digital', 'pt-BR': 'Sim, digital' }, emoji: '📸', impactScore: 18 },
    { id: 'analog', label: { es: 'Analógica', 'pt-BR': 'Analógica' }, emoji: '📷', impactScore: 10 },
    { id: 'third_party', label: { es: 'Tercerizo', 'pt-BR': 'Terceirizo' }, emoji: '🤝', impactScore: 12 },
  ]},
  { id: 'SA_ODO_012', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cómo gestionás los turnos?', 'pt-BR': 'Como você gerencia as consultas?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'online', label: { es: 'Agenda online', 'pt-BR': 'Agenda online' }, emoji: '🌐', impactScore: 22 },
    { id: 'app', label: { es: 'App/Sistema', 'pt-BR': 'App/Sistema' }, emoji: '📱', impactScore: 18 },
    { id: 'phone', label: { es: 'Teléfono', 'pt-BR': 'Telefone' }, emoji: '📞', impactScore: 12 },
    { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬', impactScore: 15 },
  ]},
  { id: 'SA_ODO_013', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tenés equipamiento de última generación?', 'pt-BR': 'Você tem equipamentos de última geração?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_all', label: { es: 'Sí, todo', 'pt-BR': 'Sim, tudo' }, emoji: '✨', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🔬', impactScore: 15 },
    { id: 'standard', label: { es: 'Estándar', 'pt-BR': 'Padrão' }, emoji: '🦷', impactScore: 10 },
    { id: 'updating', label: { es: 'Actualizando', 'pt-BR': 'Atualizando' }, emoji: '🔄', impactScore: 12 },
  ]},
  { id: 'SA_ODO_014', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés laboratorio propio?', 'pt-BR': 'Você tem laboratório próprio?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🔬', impactScore: 22 },
    { id: 'partner', label: { es: 'No, tercerizo', 'pt-BR': 'Não, terceirizo' }, emoji: '🤝', impactScore: 12 },
  ]},
  { id: 'SA_ODO_015', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántas horas abrís por día?', 'pt-BR': 'Quantas horas você abre por dia?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: '4-6', label: { es: '4-6 horas', 'pt-BR': '4-6 horas' }, emoji: '🕐', impactScore: 10 },
    { id: '6-8', label: { es: '6-8 horas', 'pt-BR': '6-8 horas' }, emoji: '🕕', impactScore: 15 },
    { id: '8-10', label: { es: '8-10 horas', 'pt-BR': '8-10 horas' }, emoji: '🕙', impactScore: 18 },
    { id: '10+', label: { es: 'Más de 10 horas', 'pt-BR': 'Mais de 10 horas' }, emoji: '🌙', impactScore: 20 },
  ]},
  { id: 'SA_ODO_016', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Atendés emergencias?', 'pt-BR': 'Você atende emergências?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_24', label: { es: 'Sí, 24h', 'pt-BR': 'Sim, 24h' }, emoji: '🚨', impactScore: 22 },
    { id: 'yes_extended', label: { es: 'Sí, horario extendido', 'pt-BR': 'Sim, horário estendido' }, emoji: '🕐', impactScore: 18 },
    { id: 'business_hours', label: { es: 'Solo horario comercial', 'pt-BR': 'Só horário comercial' }, emoji: '🏥', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_017', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Usás CAD/CAM para restauraciones?', 'pt-BR': 'Você usa CAD/CAM para restaurações?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_inhouse', label: { es: 'Sí, propio', 'pt-BR': 'Sim, próprio' }, emoji: '💻', impactScore: 22 },
    { id: 'yes_partner', label: { es: 'Sí, tercerizado', 'pt-BR': 'Sim, terceirizado' }, emoji: '🤝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_018', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés esterilización propia?', 'pt-BR': 'Você tem esterilização própria?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_autoclave', label: { es: 'Sí, autoclave clase B', 'pt-BR': 'Sim, autoclave classe B' }, emoji: '🔥', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básica' }, emoji: '✅', impactScore: 15 },
    { id: 'third_party', label: { es: 'Tercerizada', 'pt-BR': 'Terceirizada' }, emoji: '🤝', impactScore: 10 },
  ]},

  // FINANZAS (10)
  { id: 'SA_ODO_019', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu ticket promedio?', 'pt-BR': 'Qual é seu ticket médio?' }, type: 'number', businessTypes: ['centro_odontologico'] },
  { id: 'SA_ODO_020', category: 'finance', mode: 'both', dimension: 'finances', weight: 8, title: { es: '¿Trabajás con obras sociales/seguros?', 'pt-BR': 'Você trabalha com convênios/planos?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'many', label: { es: 'Sí, muchas', 'pt-BR': 'Sim, muitos' }, emoji: '🏥', impactScore: 18 },
    { id: 'some', label: { es: 'Sí, algunas', 'pt-BR': 'Sim, alguns' }, emoji: '📋', impactScore: 15 },
    { id: 'few', label: { es: 'Pocas', 'pt-BR': 'Poucos' }, emoji: '📝', impactScore: 12 },
    { id: 'private', label: { es: 'Solo particular', 'pt-BR': 'Só particular' }, emoji: '💰', impactScore: 20 },
  ]},
  { id: 'SA_ODO_021', category: 'finance', mode: 'complete', dimension: 'finances', weight: 8, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Que meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['centro_odontologico'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 10 },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 12 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 15 },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦', impactScore: 15 },
    { id: 'financing', label: { es: 'Financiamiento', 'pt-BR': 'Financiamento' }, emoji: '📊', impactScore: 20 },
  ]},
  { id: 'SA_ODO_022', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Ofrecés planes de pago?', 'pt-BR': 'Você oferece planos de pagamento?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_own', label: { es: 'Sí, propios', 'pt-BR': 'Sim, próprios' }, emoji: '💰', impactScore: 22 },
    { id: 'yes_third', label: { es: 'Sí, financiera', 'pt-BR': 'Sim, financeira' }, emoji: '🏦', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_023', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuál es tu ocupación de sillón?', 'pt-BR': 'Qual é sua ocupação de cadeira?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'high', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' }, emoji: '🌟', impactScore: 22 },
    { id: 'medium', label: { es: '50-80%', 'pt-BR': '50-80%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 50%', 'pt-BR': 'Menos de 50%' }, emoji: '💛', impactScore: 8 },
  ]},
  { id: 'SA_ODO_024', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuál es tu costo fijo mensual?', 'pt-BR': 'Qual é seu custo fixo mensal?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'low', label: { es: 'Bajo', 'pt-BR': 'Baixo' }, emoji: '💚', impactScore: 18 },
    { id: 'medium', label: { es: 'Moderado', 'pt-BR': 'Moderado' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alto', 'pt-BR': 'Alto' }, emoji: '🔴', impactScore: 8 },
  ]},
  { id: 'SA_ODO_025', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés seguro de mala praxis?', 'pt-BR': 'Você tem seguro de má prática?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_026', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cuál es tu tratamiento más rentable?', 'pt-BR': 'Qual é seu tratamento mais rentável?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'implants', label: { es: 'Implantes', 'pt-BR': 'Implantes' }, emoji: '🔩', impactScore: 22 },
    { id: 'ortho', label: { es: 'Ortodoncia', 'pt-BR': 'Ortodontia' }, emoji: '😁', impactScore: 18 },
    { id: 'aesthetic', label: { es: 'Estética', 'pt-BR': 'Estética' }, emoji: '✨', impactScore: 18 },
    { id: 'prosthetics', label: { es: 'Prótesis', 'pt-BR': 'Próteses' }, emoji: '🦷', impactScore: 15 },
    { id: 'general', label: { es: 'General', 'pt-BR': 'Geral' }, emoji: '🏥', impactScore: 10 },
  ]},
  { id: 'SA_ODO_027', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cómo es tu flujo de caja?', 'pt-BR': 'Como é seu fluxo de caixa?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'healthy', label: { es: 'Saludable', 'pt-BR': 'Saudável' }, emoji: '💚', impactScore: 22 },
    { id: 'variable', label: { es: 'Variable', 'pt-BR': 'Variável' }, emoji: '📊', impactScore: 15 },
    { id: 'tight', label: { es: 'Ajustado', 'pt-BR': 'Apertado' }, emoji: '💛', impactScore: 10 },
  ]},
  { id: 'SA_ODO_028', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés contador/asesor?', 'pt-BR': 'Você tem contador/assessor?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '📊', impactScore: 18 },
    { id: 'sometimes', label: { es: 'Solo para impuestos', 'pt-BR': 'Só para impostos' }, emoji: '📋', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // EQUIPO (8)
  { id: 'SA_ODO_029', category: 'team', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántas personas trabajan?', 'pt-BR': 'Quantas pessoas trabalham?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤', impactScore: 8 },
    { id: '2-3', label: { es: '2-3 personas', 'pt-BR': '2-3 pessoas' }, emoji: '👥', impactScore: 12 },
    { id: '4-6', label: { es: '4-6 personas', 'pt-BR': '4-6 pessoas' }, emoji: '👨‍👩‍👧', impactScore: 18 },
    { id: '7+', label: { es: '7 o más', 'pt-BR': '7 ou mais' }, emoji: '🏢', impactScore: 22 },
  ]},
  { id: 'SA_ODO_030', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés asistente dental?', 'pt-BR': 'Você tem assistente dental?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_dedicated', label: { es: 'Sí, dedicada', 'pt-BR': 'Sim, dedicada' }, emoji: '👩‍⚕️', impactScore: 22 },
    { id: 'yes_shared', label: { es: 'Sí, compartida', 'pt-BR': 'Sim, compartilhada' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_031', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés recepcionista?', 'pt-BR': 'Você tem recepcionista?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_full', label: { es: 'Sí, tiempo completo', 'pt-BR': 'Sim, tempo integral' }, emoji: '👩‍💼', impactScore: 22 },
    { id: 'yes_part', label: { es: 'Sí, tiempo parcial', 'pt-BR': 'Sim, tempo parcial' }, emoji: '🕐', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_032', category: 'team', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tu equipo recibe capacitación continua?', 'pt-BR': 'Sua equipe recebe capacitação contínua?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '🎓', impactScore: 22 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📚', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_033', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cómo es la rotación de personal?', 'pt-BR': 'Como é a rotatividade de pessoal?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'low', label: { es: 'Baja', 'pt-BR': 'Baixa' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: 'Media', 'pt-BR': 'Média' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alta', 'pt-BR': 'Alta' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'SA_ODO_034', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés especialistas asociados?', 'pt-BR': 'Você tem especialistas associados?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '👨‍⚕️', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🤝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_ODO_035', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Usás uniformes?', 'pt-BR': 'Você usa uniformes?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_branded', label: { es: 'Sí, con marca', 'pt-BR': 'Sim, com marca' }, emoji: '👔', impactScore: 20 },
    { id: 'yes_scrubs', label: { es: 'Sí, scrubs', 'pt-BR': 'Sim, scrubs' }, emoji: '🩺', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_036', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés objetivos por profesional?', 'pt-BR': 'Você tem metas por profissional?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🎯', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},

  // VENTAS/PACIENTES (8)
  { id: 'SA_ODO_037', category: 'sales', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos pacientes atendés por día?', 'pt-BR': 'Quantos pacientes você atende por dia?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: '1-5', label: { es: '1-5', 'pt-BR': '1-5' }, emoji: '👤', impactScore: 8 },
    { id: '6-10', label: { es: '6-10', 'pt-BR': '6-10' }, emoji: '👥', impactScore: 15 },
    { id: '11-20', label: { es: '11-20', 'pt-BR': '11-20' }, emoji: '🏥', impactScore: 18 },
    { id: '20+', label: { es: 'Más de 20', 'pt-BR': 'Mais de 20' }, emoji: '🏬', impactScore: 22 },
  ]},
  { id: 'SA_ODO_038', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Qué % son pacientes recurrentes?', 'pt-BR': 'Que % são pacientes recorrentes?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'high', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🌟', impactScore: 22 },
    { id: 'medium', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 40%', 'pt-BR': 'Menos de 40%' }, emoji: '💛', impactScore: 10 },
  ]},
  { id: 'SA_ODO_039', category: 'sales', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuál es tu tasa de ausentismo?', 'pt-BR': 'Qual é sua taxa de faltas?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'low', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '💚', impactScore: 22 },
    { id: 'medium', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '💛', impactScore: 15 },
    { id: 'high', label: { es: 'Más del 20%', 'pt-BR': 'Mais de 20%' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'SA_ODO_040', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cómo llegan los pacientes nuevos?', 'pt-BR': 'Como chegam os pacientes novos?' }, type: 'multi', businessTypes: ['centro_odontologico'], options: [
    { id: 'referral', label: { es: 'Derivación', 'pt-BR': 'Indicação' }, emoji: '🤝', impactScore: 20 },
    { id: 'google', label: { es: 'Google', 'pt-BR': 'Google' }, emoji: '🔍', impactScore: 18 },
    { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 15 },
    { id: 'insurance', label: { es: 'Obra social', 'pt-BR': 'Convênio' }, emoji: '🏥', impactScore: 12 },
    { id: 'walk_in', label: { es: 'Espontáneo', 'pt-BR': 'Espontâneo' }, emoji: '🚶', impactScore: 10 },
  ]},
  { id: 'SA_ODO_041', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Cuál es tu tratamiento más solicitado?', 'pt-BR': 'Qual é seu tratamento mais solicitado?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'general', label: { es: 'Limpieza/Control', 'pt-BR': 'Limpeza/Controle' }, emoji: '🦷', impactScore: 12 },
    { id: 'restorations', label: { es: 'Restauraciones', 'pt-BR': 'Restaurações' }, emoji: '🔧', impactScore: 15 },
    { id: 'ortho', label: { es: 'Ortodoncia', 'pt-BR': 'Ortodontia' }, emoji: '😁', impactScore: 18 },
    { id: 'aesthetic', label: { es: 'Blanqueamiento', 'pt-BR': 'Clareamento' }, emoji: '✨', impactScore: 18 },
    { id: 'implants', label: { es: 'Implantes', 'pt-BR': 'Implantes' }, emoji: '🔩', impactScore: 22 },
  ]},
  { id: 'SA_ODO_042', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Hacés seguimiento post-tratamiento?', 'pt-BR': 'Você faz acompanhamento pós-tratamento?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_system', label: { es: 'Sí, sistematizado', 'pt-BR': 'Sim, sistematizado' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📞', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_043', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés plan de prevención?', 'pt-BR': 'Você oferece plano de prevenção?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🛡️', impactScore: 20 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_ODO_044', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Recordás turnos a pacientes?', 'pt-BR': 'Você lembra consultas aos pacientes?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_auto', label: { es: 'Sí, automático', 'pt-BR': 'Sim, automático' }, emoji: '🤖', impactScore: 22 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📞', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // MARKETING (8)
  { id: 'SA_ODO_045', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Tenés redes sociales activas?', 'pt-BR': 'Você tem redes sociais ativas?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_active', label: { es: 'Sí, muy activas', 'pt-BR': 'Sim, muito ativas' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_regular', label: { es: 'Sí, regulares', 'pt-BR': 'Sim, regulares' }, emoji: '📲', impactScore: 15 },
    { id: 'yes_basic', label: { es: 'Sí, básicas', 'pt-BR': 'Sim, básicas' }, emoji: '📴', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_046', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Tenés página web?', 'pt-BR': 'Você tem site?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completa', 'pt-BR': 'Sim, completo' }, emoji: '🌐', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básico' }, emoji: '📄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_047', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Estás en Google My Business?', 'pt-BR': 'Você está no Google Meu Negócio?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_optimized', label: { es: 'Sí, optimizado', 'pt-BR': 'Sim, otimizado' }, emoji: '🌟', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_048', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Invertís en publicidad online?', 'pt-BR': 'Você investe em publicidade online?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_consistent', label: { es: 'Sí, constante', 'pt-BR': 'Sim, constante' }, emoji: '💰', impactScore: 22 },
    { id: 'yes_campaigns', label: { es: 'Sí, campañas', 'pt-BR': 'Sim, campanhas' }, emoji: '📢', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_049', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Mostrás casos antes/después?', 'pt-BR': 'Você mostra casos antes/depois?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '📸', impactScore: 22 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📷', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_050', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés programa de referidos?', 'pt-BR': 'Você tem programa de indicações?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_formal', label: { es: 'Sí, formal', 'pt-BR': 'Sim, formal' }, emoji: '🎁', impactScore: 22 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_051', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Usás WhatsApp Business?', 'pt-BR': 'Você usa WhatsApp Business?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_catalog', label: { es: 'Sí, con catálogo', 'pt-BR': 'Sim, com catálogo' }, emoji: '📱', impactScore: 22 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '💬', impactScore: 15 },
    { id: 'personal', label: { es: 'WA personal', 'pt-BR': 'WA pessoal' }, emoji: '📲', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_052', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Hacés contenido educativo?', 'pt-BR': 'Você faz conteúdo educativo?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_video', label: { es: 'Sí, en video', 'pt-BR': 'Sim, em vídeo' }, emoji: '📹', impactScore: 22 },
    { id: 'yes_posts', label: { es: 'Sí, posts', 'pt-BR': 'Sim, posts' }, emoji: '📸', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // REPUTACIÓN (6)
  { id: 'SA_ODO_053', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Tenés reseñas online?', 'pt-BR': 'Você tem avaliações online?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'many_good', label: { es: 'Muchas y buenas', 'pt-BR': 'Muitas e boas' }, emoji: '⭐', impactScore: 22 },
    { id: 'some_good', label: { es: 'Algunas buenas', 'pt-BR': 'Algumas boas' }, emoji: '🌟', impactScore: 15 },
    { id: 'few', label: { es: 'Pocas', 'pt-BR': 'Poucas' }, emoji: '💫', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_054', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '🌟', impactScore: 22 },
    { id: '4-4.5', label: { es: '4.0 - 4.4', 'pt-BR': '4.0 - 4.4' }, emoji: '⭐', impactScore: 15 },
    { id: '3.5-4', label: { es: '3.5 - 3.9', 'pt-BR': '3.5 - 3.9' }, emoji: '💛', impactScore: 10 },
    { id: 'below', label: { es: 'Menos de 3.5', 'pt-BR': 'Menos de 3.5' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'SA_ODO_055', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Respondés a las reseñas?', 'pt-BR': 'Você responde às avaliações?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 22 },
    { id: 'usually', label: { es: 'Generalmente', 'pt-BR': 'Geralmente' }, emoji: '💬', impactScore: 15 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '😓', impactScore: 8 },
  ]},
  { id: 'SA_ODO_056', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés certificaciones/membresías?', 'pt-BR': 'Você tem certificações/membreias?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_many', label: { es: 'Sí, varias', 'pt-BR': 'Sim, várias' }, emoji: '🏆', impactScore: 22 },
    { id: 'yes_some', label: { es: 'Sí, algunas', 'pt-BR': 'Sim, algumas' }, emoji: '🥇', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_057', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Aparecés en rankings/medios?', 'pt-BR': 'Você aparece em rankings/mídia?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '📰', impactScore: 22 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_ODO_058', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Participás en congresos/cursos?', 'pt-BR': 'Você participa de congressos/cursos?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_speaker', label: { es: 'Sí, como expositor', 'pt-BR': 'Sim, como palestrante' }, emoji: '🎤', impactScore: 22 },
    { id: 'yes_attendee', label: { es: 'Sí, como asistente', 'pt-BR': 'Sim, como assistente' }, emoji: '🎓', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // METAS (12)
  { id: 'SA_ODO_059', category: 'goals', mode: 'both', dimension: 'growth', weight: 8, title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'patients', label: { es: 'Más pacientes', 'pt-BR': 'Mais pacientes' }, emoji: '👥', impactScore: 15 },
    { id: 'revenue', label: { es: 'Aumentar facturación', 'pt-BR': 'Aumentar faturamento' }, emoji: '💰', impactScore: 15 },
    { id: 'specialize', label: { es: 'Especializar', 'pt-BR': 'Especializar' }, emoji: '🎯', impactScore: 18 },
    { id: 'expand', label: { es: 'Expandir', 'pt-BR': 'Expandir' }, emoji: '🚀', impactScore: 20 },
  ]},
  { id: 'SA_ODO_060', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Pensás agregar especialidades?', 'pt-BR': 'Você pensa em adicionar especialidades?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_soon', label: { es: 'Sí, pronto', 'pt-BR': 'Sim, em breve' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_ODO_061', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Querés abrir más consultorios?', 'pt-BR': 'Você quer abrir mais consultórios?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🚀', impactScore: 22 },
    { id: 'maybe', label: { es: 'Quizás', 'pt-BR': 'Talvez' }, emoji: '🤔', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_062', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Cuál es tu mayor desafío?', 'pt-BR': 'Qual é seu maior desafio?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'patients', label: { es: 'Conseguir pacientes', 'pt-BR': 'Conseguir pacientes' }, emoji: '👥', impactScore: 15 },
    { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, emoji: '🏢', impactScore: 12 },
    { id: 'prices', label: { es: 'Precios/Costos', 'pt-BR': 'Preços/Custos' }, emoji: '💰', impactScore: 15 },
    { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, emoji: '👨‍⚕️', impactScore: 12 },
    { id: 'technology', label: { es: 'Tecnología', 'pt-BR': 'Tecnologia' }, emoji: '💻', impactScore: 15 },
  ]},
  { id: 'SA_ODO_063', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Qué área querés mejorar?', 'pt-BR': 'Que área você quer melhorar?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'marketing', label: { es: 'Marketing', 'pt-BR': 'Marketing' }, emoji: '📱', impactScore: 15 },
    { id: 'operations', label: { es: 'Operaciones', 'pt-BR': 'Operações' }, emoji: '⚙️', impactScore: 12 },
    { id: 'technology', label: { es: 'Tecnología', 'pt-BR': 'Tecnologia' }, emoji: '💻', impactScore: 18 },
    { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, emoji: '👥', impactScore: 12 },
  ]},
  { id: 'SA_ODO_064', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Tenés plan de negocios?', 'pt-BR': 'Você tem plano de negócios?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 22 },
    { id: 'informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_ODO_065', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Usás alineadores invisibles?', 'pt-BR': 'Você usa alinhadores invisíveis?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '😁', impactScore: 22 },
    { id: 'planning', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_066', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés diseño digital de sonrisa?', 'pt-BR': 'Você faz design digital de sorriso?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '✨', impactScore: 22 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_ODO_067', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés escáner intraoral?', 'pt-BR': 'Você tem scanner intraoral?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '📱', impactScore: 22 },
    { id: 'planning', label: { es: 'Planeando', 'pt-BR': 'Planejando' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_ODO_068', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Atendés turismo dental?', 'pt-BR': 'Você atende turismo dental?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '✈️', impactScore: 22 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_ODO_069', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Ofrecés sedación consciente?', 'pt-BR': 'Você oferece sedação consciente?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '💉', impactScore: 22 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_ODO_070', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Cuál es tu diferenciador principal?', 'pt-BR': 'Qual é seu diferencial principal?' }, type: 'single', businessTypes: ['centro_odontologico'], options: [
    { id: 'technology', label: { es: 'Tecnología', 'pt-BR': 'Tecnologia' }, emoji: '💻', impactScore: 20 },
    { id: 'experience', label: { es: 'Experiencia', 'pt-BR': 'Experiência' }, emoji: '🏆', impactScore: 18 },
    { id: 'price', label: { es: 'Precio', 'pt-BR': 'Preço' }, emoji: '💰', impactScore: 12 },
    { id: 'service', label: { es: 'Atención', 'pt-BR': 'Atendimento' }, emoji: '🤝', impactScore: 18 },
    { id: 'location', label: { es: 'Ubicación', 'pt-BR': 'Localização' }, emoji: '📍', impactScore: 15 },
  ]},
];
