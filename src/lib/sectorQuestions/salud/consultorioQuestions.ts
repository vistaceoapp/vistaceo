// Consultorio Médico - 70 Ultra-Personalized Questions
// Categories: identity, operation, sales, menu, finance, team, marketing, reputation, goals

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const CONSULTORIO_COMPLETE: VistaSetupQuestion[] = [
  // IDENTIDAD (7)
  { id: 'SA_CON_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Cuál es tu especialidad médica?', 'pt-BR': 'Qual é sua especialidade médica?' }, type: 'single', required: true, businessTypes: ['consultorio_medico'], options: [
    { id: 'general', label: { es: 'Medicina general', 'pt-BR': 'Clínica geral' }, emoji: '🩺', impactScore: 12 },
    { id: 'pediatric', label: { es: 'Pediatría', 'pt-BR': 'Pediatria' }, emoji: '👶', impactScore: 15 },
    { id: 'internal', label: { es: 'Medicina interna', 'pt-BR': 'Medicina interna' }, emoji: '🏥', impactScore: 15 },
    { id: 'cardio', label: { es: 'Cardiología', 'pt-BR': 'Cardiologia' }, emoji: '❤️', impactScore: 18 },
    { id: 'derma', label: { es: 'Dermatología', 'pt-BR': 'Dermatologia' }, emoji: '🧴', impactScore: 18 },
    { id: 'gine', label: { es: 'Ginecología', 'pt-BR': 'Ginecologia' }, emoji: '👩', impactScore: 18 },
    { id: 'other', label: { es: 'Otra especialidad', 'pt-BR': 'Outra especialidade' }, emoji: '⚕️', impactScore: 15 },
  ]},
  { id: 'SA_CON_002', category: 'identity', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Atendés con obras sociales/seguros?', 'pt-BR': 'Você atende com convênios/planos?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_many', label: { es: 'Sí, muchas', 'pt-BR': 'Sim, muitos' }, emoji: '📋', impactScore: 18 },
    { id: 'yes_few', label: { es: 'Sí, algunas', 'pt-BR': 'Sim, alguns' }, emoji: '📝', impactScore: 15 },
    { id: 'private_only', label: { es: 'Solo particular', 'pt-BR': 'Só particular' }, emoji: '💰', impactScore: 12 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 15 },
  ]},
  { id: 'SA_CON_003', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 8, title: { es: '¿Dónde está ubicado tu consultorio?', 'pt-BR': 'Onde está localizado seu consultório?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'clinic', label: { es: 'Clínica/Sanatorio', 'pt-BR': 'Clínica/Hospital' }, emoji: '🏥', impactScore: 18 },
    { id: 'medical_building', label: { es: 'Edificio médico', 'pt-BR': 'Edifício médico' }, emoji: '🏢', impactScore: 15 },
    { id: 'commercial', label: { es: 'Local comercial', 'pt-BR': 'Local comercial' }, emoji: '🏪', impactScore: 12 },
    { id: 'home', label: { es: 'Casa/Departamento', 'pt-BR': 'Casa/Apartamento' }, emoji: '🏠', impactScore: 10 },
  ]},
  { id: 'SA_CON_004', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuántos años de experiencia tenés?', 'pt-BR': 'Quantos anos de experiência você tem?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'junior', label: { es: 'Menos de 5 años', 'pt-BR': 'Menos de 5 anos' }, emoji: '🌱', impactScore: 10 },
    { id: 'mid', label: { es: '5-15 años', 'pt-BR': '5-15 anos' }, emoji: '📈', impactScore: 15 },
    { id: 'senior', label: { es: '15-25 años', 'pt-BR': '15-25 anos' }, emoji: '🏢', impactScore: 18 },
    { id: 'expert', label: { es: 'Más de 25 años', 'pt-BR': 'Mais de 25 anos' }, emoji: '🏆', impactScore: 20 },
  ]},
  { id: 'SA_CON_005', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tenés subespecialidades?', 'pt-BR': 'Você tem subespecialidades?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_many', label: { es: 'Sí, varias', 'pt-BR': 'Sim, várias' }, emoji: '🎓', impactScore: 20 },
    { id: 'yes_one', label: { es: 'Sí, una', 'pt-BR': 'Sim, uma' }, emoji: '📚', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_CON_006', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántos m² tiene tu consultorio?', 'pt-BR': 'Quantos m² tem seu consultório?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'small', label: { es: 'Hasta 30m²', 'pt-BR': 'Até 30m²' }, emoji: '📐', impactScore: 8 },
    { id: 'medium', label: { es: '30-60m²', 'pt-BR': '30-60m²' }, emoji: '🏠', impactScore: 12 },
    { id: 'large', label: { es: '60-100m²', 'pt-BR': '60-100m²' }, emoji: '🏢', impactScore: 18 },
    { id: 'complex', label: { es: 'Más de 100m²', 'pt-BR': 'Mais de 100m²' }, emoji: '🏥', impactScore: 20 },
  ]},
  { id: 'SA_CON_007', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Atendés pacientes pediátricos y adultos?', 'pt-BR': 'Você atende pacientes pediátricos e adultos?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'both', label: { es: 'Ambos', 'pt-BR': 'Ambos' }, emoji: '👨‍👩‍👧', impactScore: 15 },
    { id: 'adults', label: { es: 'Solo adultos', 'pt-BR': 'Só adultos' }, emoji: '👤', impactScore: 12 },
    { id: 'pediatric', label: { es: 'Solo pediátricos', 'pt-BR': 'Só pediátricos' }, emoji: '👶', impactScore: 15 },
  ]},

  // OPERACIÓN (8)
  { id: 'SA_CON_008', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántos pacientes atendés por día?', 'pt-BR': 'Quantos pacientes você atende por dia?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'low', label: { es: '1-8 pacientes', 'pt-BR': '1-8 pacientes' }, emoji: '👤', impactScore: 8 },
    { id: 'medium', label: { es: '9-15 pacientes', 'pt-BR': '9-15 pacientes' }, emoji: '👥', impactScore: 15 },
    { id: 'high', label: { es: '16-25 pacientes', 'pt-BR': '16-25 pacientes' }, emoji: '🏢', impactScore: 18 },
    { id: 'very_high', label: { es: 'Más de 25', 'pt-BR': 'Mais de 25' }, emoji: '🔥', impactScore: 20 },
  ]},
  { id: 'SA_CON_009', category: 'operation', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cómo gestionás los turnos?', 'pt-BR': 'Como você gerencia as consultas?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'system', label: { es: 'Sistema/Software', 'pt-BR': 'Sistema/Software' }, emoji: '💻', impactScore: 20 },
    { id: 'online', label: { es: 'Agenda online', 'pt-BR': 'Agenda online' }, emoji: '📱', impactScore: 18 },
    { id: 'phone', label: { es: 'Teléfono/WhatsApp', 'pt-BR': 'Telefone/WhatsApp' }, emoji: '📞', impactScore: 12 },
    { id: 'manual', label: { es: 'Manual/Agenda papel', 'pt-BR': 'Manual/Agenda papel' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'SA_CON_010', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Ofrecés telemedicina?', 'pt-BR': 'Você oferece telemedicina?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📱', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_011', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Usás historia clínica electrónica?', 'pt-BR': 'Você usa prontuário eletrônico?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📊', impactScore: 15 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 12 },
    { id: 'paper', label: { es: 'Solo papel', 'pt-BR': 'Só papel' }, emoji: '📋', impactScore: 5 },
  ]},
  { id: 'SA_CON_012', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuánto dura una consulta promedio?', 'pt-BR': 'Quanto dura uma consulta em média?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'short', label: { es: '15-20 minutos', 'pt-BR': '15-20 minutos' }, emoji: '⏱️', impactScore: 12 },
    { id: 'medium', label: { es: '20-30 minutos', 'pt-BR': '20-30 minutos' }, emoji: '⏰', impactScore: 15 },
    { id: 'long', label: { es: '30-45 minutos', 'pt-BR': '30-45 minutos' }, emoji: '🕐', impactScore: 18 },
    { id: 'extended', label: { es: 'Más de 45 minutos', 'pt-BR': 'Mais de 45 minutos' }, emoji: '🕒', impactScore: 15 },
  ]},
  { id: 'SA_CON_013', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántos días por semana atendés?', 'pt-BR': 'Quantos dias por semana você atende?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: '2-3', label: { es: '2-3 días', 'pt-BR': '2-3 dias' }, emoji: '📅', impactScore: 10 },
    { id: '4-5', label: { es: '4-5 días', 'pt-BR': '4-5 dias' }, emoji: '📆', impactScore: 15 },
    { id: '6', label: { es: '6 días', 'pt-BR': '6 dias' }, emoji: '🗓️', impactScore: 18 },
    { id: 'variable', label: { es: 'Variable', 'pt-BR': 'Variável' }, emoji: '🔄', impactScore: 12 },
  ]},
  { id: 'SA_CON_014', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés equipamiento diagnóstico?', 'pt-BR': 'Você tem equipamento de diagnóstico?' }, type: 'multi', businessTypes: ['consultorio_medico'], options: [
    { id: 'ecg', label: { es: 'ECG', 'pt-BR': 'ECG' }, emoji: '❤️', impactScore: 15 },
    { id: 'echo', label: { es: 'Ecógrafo', 'pt-BR': 'Ultrassom' }, emoji: '🔊', impactScore: 18 },
    { id: 'spirometry', label: { es: 'Espirómetro', 'pt-BR': 'Espirômetro' }, emoji: '🌬️', impactScore: 15 },
    { id: 'basic', label: { es: 'Solo básico', 'pt-BR': 'Só básico' }, emoji: '🩺', impactScore: 10 },
  ]},
  { id: 'SA_CON_015', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés sala de espera dedicada?', 'pt-BR': 'Você tem sala de espera dedicada?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_comfortable', label: { es: 'Sí, cómoda', 'pt-BR': 'Sim, confortável' }, emoji: '🛋️', impactScore: 18 },
    { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básica' }, emoji: '🪑', impactScore: 12 },
    { id: 'shared', label: { es: 'Compartida', 'pt-BR': 'Compartilhada' }, emoji: '🔄', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // FINANZAS (8)
  { id: 'SA_CON_016', category: 'finance', mode: 'both', dimension: 'profitability', weight: 9, title: { es: '¿Cuál es tu valor de consulta particular?', 'pt-BR': 'Qual é seu valor de consulta particular?' }, type: 'number', businessTypes: ['consultorio_medico'] },
  { id: 'SA_CON_017', category: 'finance', mode: 'both', dimension: 'profitability', weight: 8, title: { es: '¿Qué porcentaje de tus ingresos son particulares?', 'pt-BR': 'Que porcentagem de sua renda é particular?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'low', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, emoji: '📊', impactScore: 10 },
    { id: 'medium', label: { es: '25-50%', 'pt-BR': '25-50%' }, emoji: '📈', impactScore: 15 },
    { id: 'high', label: { es: '50-75%', 'pt-BR': '50-75%' }, emoji: '💰', impactScore: 18 },
    { id: 'very_high', label: { es: 'Más del 75%', 'pt-BR': 'Mais de 75%' }, emoji: '💎', impactScore: 20 },
  ]},
  { id: 'SA_CON_018', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cómo cobrás las obras sociales?', 'pt-BR': 'Como você recebe dos convênios?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'direct', label: { es: 'Pago directo', 'pt-BR': 'Pagamento direto' }, emoji: '💰', impactScore: 18 },
    { id: 'claim', label: { es: 'Por facturación', 'pt-BR': 'Por faturamento' }, emoji: '📋', impactScore: 12 },
    { id: 'both', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 15 },
    { id: 'na', label: { es: 'No atiendo OS', 'pt-BR': 'Não atendo convênios' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_CON_019', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Que meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['consultorio_medico'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 10 },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦', impactScore: 15 },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 12 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 15 },
    { id: 'qr', label: { es: 'QR/Billetera', 'pt-BR': 'QR/Carteira' }, emoji: '📱', impactScore: 15 },
  ]},
  { id: 'SA_CON_020', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuánto pagás de alquiler?', 'pt-BR': 'Quanto você paga de aluguel?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'own', label: { es: 'Consultorio propio', 'pt-BR': 'Consultório próprio' }, emoji: '🏠', impactScore: 20 },
    { id: 'low', label: { es: 'Bajo para la zona', 'pt-BR': 'Baixo para a região' }, emoji: '💚', impactScore: 15 },
    { id: 'average', label: { es: 'Promedio', 'pt-BR': 'Médio' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alto', 'pt-BR': 'Alto' }, emoji: '🔴', impactScore: 8 },
  ]},
  { id: 'SA_CON_021', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés seguro de mala praxis?', 'pt-BR': 'Você tem seguro de erro médico?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_022', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Facturás electrónicamente?', 'pt-BR': 'Você emite nota fiscal eletrônica?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_automatic', label: { es: 'Sí, automático', 'pt-BR': 'Sim, automático' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📝', impactScore: 15 },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_023', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés contador/asesor fiscal?', 'pt-BR': 'Você tem contador/assessor fiscal?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '📊', impactScore: 18 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // EQUIPO (6)
  { id: 'SA_CON_024', category: 'team', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Tenés personal administrativo?', 'pt-BR': 'Você tem pessoal administrativo?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_fulltime', label: { es: 'Sí, tiempo completo', 'pt-BR': 'Sim, tempo integral' }, emoji: '👩‍💼', impactScore: 20 },
    { id: 'yes_parttime', label: { es: 'Sí, medio tiempo', 'pt-BR': 'Sim, meio período' }, emoji: '👤', impactScore: 15 },
    { id: 'shared', label: { es: 'Compartido', 'pt-BR': 'Compartilhado' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_025', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Trabajás con otros profesionales?', 'pt-BR': 'Você trabalha com outros profissionais?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_integrated', label: { es: 'Sí, equipo integrado', 'pt-BR': 'Sim, equipe integrada' }, emoji: '👥', impactScore: 20 },
    { id: 'yes_referral', label: { es: 'Sí, derivaciones', 'pt-BR': 'Sim, encaminhamentos' }, emoji: '🔄', impactScore: 15 },
    { id: 'solo', label: { es: 'Solo', 'pt-BR': 'Sozinho' }, emoji: '👤', impactScore: 10 },
  ]},
  { id: 'SA_CON_026', category: 'team', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Hacés capacitación continua?', 'pt-BR': 'Você faz educação continuada?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regular', 'pt-BR': 'Sim, regular' }, emoji: '🎓', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasional', 'pt-BR': 'Sim, ocasional' }, emoji: '📚', impactScore: 15 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🐢', impactScore: 8 },
  ]},
  { id: 'SA_CON_027', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés enfermería/asistente?', 'pt-BR': 'Você tem enfermagem/assistente?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_dedicated', label: { es: 'Sí, dedicada', 'pt-BR': 'Sim, dedicada' }, emoji: '👩‍⚕️', impactScore: 20 },
    { id: 'yes_shared', label: { es: 'Sí, compartida', 'pt-BR': 'Sim, compartilhada' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_028', category: 'team', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Participás en congresos/sociedades?', 'pt-BR': 'Você participa de congressos/sociedades?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🎤', impactScore: 20 },
    { id: 'yes_member', label: { es: 'Sí, como miembro', 'pt-BR': 'Sim, como membro' }, emoji: '📋', impactScore: 15 },
    { id: 'occasionally', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_029', category: 'team', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Publicás artículos científicos?', 'pt-BR': 'Você publica artigos científicos?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '📝', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // VENTAS/PACIENTES (7)
  { id: 'SA_CON_030', category: 'sales', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cómo llegan nuevos pacientes?', 'pt-BR': 'Como chegam novos pacientes?' }, type: 'multi', businessTypes: ['consultorio_medico'], options: [
    { id: 'referral', label: { es: 'Recomendación', 'pt-BR': 'Recomendação' }, emoji: '🗣️', impactScore: 18 },
    { id: 'insurance', label: { es: 'Obra social/Seguro', 'pt-BR': 'Convênio' }, emoji: '📋', impactScore: 15 },
    { id: 'online', label: { es: 'Búsqueda online', 'pt-BR': 'Busca online' }, emoji: '🔍', impactScore: 15 },
    { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 12 },
  ]},
  { id: 'SA_CON_031', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Qué porcentaje son pacientes recurrentes?', 'pt-BR': 'Que porcentagem são pacientes recorrentes?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'high', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🌟', impactScore: 20 },
    { id: 'medium', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '💚', impactScore: 15 },
    { id: 'low', label: { es: 'Menos del 40%', 'pt-BR': 'Menos de 40%' }, emoji: '💛', impactScore: 10 },
  ]},
  { id: 'SA_CON_032', category: 'sales', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuánto tiempo de espera tienen tus pacientes?', 'pt-BR': 'Quanto tempo de espera seus pacientes têm?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'short', label: { es: 'Menos de 15 min', 'pt-BR': 'Menos de 15 min' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: '15-30 min', 'pt-BR': '15-30 min' }, emoji: '💛', impactScore: 15 },
    { id: 'long', label: { es: '30-60 min', 'pt-BR': '30-60 min' }, emoji: '🟠', impactScore: 10 },
    { id: 'very_long', label: { es: 'Más de 60 min', 'pt-BR': 'Mais de 60 min' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'SA_CON_033', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Cuánto anticipan los turnos?', 'pt-BR': 'Com quanto tempo marcam consultas?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'same_day', label: { es: 'Mismo día', 'pt-BR': 'Mesmo dia' }, emoji: '⚡', impactScore: 15 },
    { id: 'days', label: { es: '1-7 días', 'pt-BR': '1-7 dias' }, emoji: '📅', impactScore: 15 },
    { id: 'weeks', label: { es: '1-4 semanas', 'pt-BR': '1-4 semanas' }, emoji: '📆', impactScore: 18 },
    { id: 'months', label: { es: 'Más de 1 mes', 'pt-BR': 'Mais de 1 mês' }, emoji: '🗓️', impactScore: 12 },
  ]},
  { id: 'SA_CON_034', category: 'sales', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tasa de ausentismo?', 'pt-BR': 'Taxa de ausências?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'low', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '💚', impactScore: 20 },
    { id: 'medium', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '💛', impactScore: 15 },
    { id: 'high', label: { es: '20-30%', 'pt-BR': '20-30%' }, emoji: '🟠', impactScore: 10 },
    { id: 'very_high', label: { es: 'Más del 30%', 'pt-BR': 'Mais de 30%' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'SA_CON_035', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Enviás recordatorios de turnos?', 'pt-BR': 'Você envia lembretes de consultas?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_auto', label: { es: 'Sí, automáticos', 'pt-BR': 'Sim, automáticos' }, emoji: '🤖', impactScore: 20 },
    { id: 'yes_manual', label: { es: 'Sí, manuales', 'pt-BR': 'Sim, manuais' }, emoji: '📱', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_036', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Ofrecés procedimientos/prácticas?', 'pt-BR': 'Você oferece procedimentos/práticas?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🏥', impactScore: 20 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🩺', impactScore: 15 },
    { id: 'consult_only', label: { es: 'Solo consultas', 'pt-BR': 'Só consultas' }, emoji: '💬', impactScore: 10 },
  ]},

  // MARKETING (6)
  { id: 'SA_CON_037', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Tenés presencia online?', 'pt-BR': 'Você tem presença online?' }, type: 'multi', businessTypes: ['consultorio_medico'], options: [
    { id: 'website', label: { es: 'Sitio web', 'pt-BR': 'Site' }, emoji: '🌐', impactScore: 18 },
    { id: 'google', label: { es: 'Google Mi Negocio', 'pt-BR': 'Google Meu Negócio' }, emoji: '📍', impactScore: 20 },
    { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸', impactScore: 15 },
    { id: 'doctoralia', label: { es: 'Doctoralia/Portal', 'pt-BR': 'Doctoralia/Portal' }, emoji: '👨‍⚕️', impactScore: 18 },
    { id: 'none', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_038', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Publicás contenido educativo?', 'pt-BR': 'Você publica conteúdo educativo?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '📝', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_039', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Usás WhatsApp para comunicarte?', 'pt-BR': 'Você usa WhatsApp para se comunicar?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_business', label: { es: 'Sí, Business', 'pt-BR': 'Sim, Business' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_personal', label: { es: 'Sí, personal', 'pt-BR': 'Sim, pessoal' }, emoji: '📲', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_040', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Das charlas/webinars?', 'pt-BR': 'Você dá palestras/webinars?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🎤', impactScore: 20 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '💬', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_041', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Invertís en publicidad online?', 'pt-BR': 'Você investe em publicidade online?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '💰', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📢', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_042', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés tarjetas de presentación?', 'pt-BR': 'Você tem cartões de visita?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_pro', label: { es: 'Sí, profesionales', 'pt-BR': 'Sim, profissionais' }, emoji: '💼', impactScore: 15 },
    { id: 'yes_basic', label: { es: 'Sí, básicas', 'pt-BR': 'Sim, básicos' }, emoji: '📇', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // REPUTACIÓN (6)
  { id: 'SA_CON_043', category: 'reputation', mode: 'both', dimension: 'reputation', weight: 8, title: { es: '¿Tenés reseñas online?', 'pt-BR': 'Você tem avaliações online?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'many_good', label: { es: 'Muchas y buenas', 'pt-BR': 'Muitas e boas' }, emoji: '⭐', impactScore: 20 },
    { id: 'some_good', label: { es: 'Algunas buenas', 'pt-BR': 'Algumas boas' }, emoji: '🌟', impactScore: 15 },
    { id: 'few', label: { es: 'Pocas', 'pt-BR': 'Poucas' }, emoji: '💫', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_044', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu rating promedio?', 'pt-BR': 'Qual é sua avaliação média?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '🌟', impactScore: 20 },
    { id: '4-4.5', label: { es: '4.0 - 4.4', 'pt-BR': '4.0 - 4.4' }, emoji: '⭐', impactScore: 15 },
    { id: '3.5-4', label: { es: '3.5 - 3.9', 'pt-BR': '3.5 - 3.9' }, emoji: '💛', impactScore: 10 },
    { id: 'below', label: { es: 'Menos de 3.5', 'pt-BR': 'Menos de 3.5' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'SA_CON_045', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Respondés a las reseñas?', 'pt-BR': 'Você responde às avaliações?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 20 },
    { id: 'usually', label: { es: 'Generalmente', 'pt-BR': 'Geralmente' }, emoji: '💬', impactScore: 15 },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄', impactScore: 10 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'SA_CON_046', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tus pacientes te recomiendan?', 'pt-BR': 'Seus pacientes te recomendam?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_often', label: { es: 'Sí, frecuentemente', 'pt-BR': 'Sim, frequentemente' }, emoji: '🗣️', impactScore: 20 },
    { id: 'yes_sometimes', label: { es: 'Sí, a veces', 'pt-BR': 'Sim, às vezes' }, emoji: '💬', impactScore: 15 },
    { id: 'rarely', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🤔', impactScore: 8 },
  ]},
  { id: 'SA_CON_047', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés reconocimientos/premios?', 'pt-BR': 'Você tem reconhecimentos/prêmios?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🏆', impactScore: 20 },
    { id: 'yes_one', label: { es: 'Sí, alguno', 'pt-BR': 'Sim, algum' }, emoji: '🥇', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_048', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Aparecés en medios/prensa?', 'pt-BR': 'Você aparece na mídia/imprensa?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_often', label: { es: 'Sí, frecuentemente', 'pt-BR': 'Sim, frequentemente' }, emoji: '📰', impactScore: 20 },
    { id: 'yes_sometimes', label: { es: 'Sí, a veces', 'pt-BR': 'Sim, às vezes' }, emoji: '📝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // METAS (7)
  { id: 'SA_CON_049', category: 'goals', mode: 'both', dimension: 'growth', weight: 8, title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'patients', label: { es: 'Más pacientes', 'pt-BR': 'Mais pacientes' }, emoji: '👥', impactScore: 15 },
    { id: 'income', label: { es: 'Mejorar ingresos', 'pt-BR': 'Melhorar renda' }, emoji: '💰', impactScore: 15 },
    { id: 'reputation', label: { es: 'Fortalecer reputación', 'pt-BR': 'Fortalecer reputação' }, emoji: '⭐', impactScore: 15 },
    { id: 'balance', label: { es: 'Equilibrio vida-trabajo', 'pt-BR': 'Equilíbrio vida-trabalho' }, emoji: '⚖️', impactScore: 12 },
    { id: 'expand', label: { es: 'Expandir/Crecer', 'pt-BR': 'Expandir/Crescer' }, emoji: '🚀', impactScore: 18 },
  ]},
  { id: 'SA_CON_050', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Pensás abrir más consultorios?', 'pt-BR': 'Você pensa em abrir mais consultórios?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_soon', label: { es: 'Sí, pronto', 'pt-BR': 'Sim, em breve' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'maybe', label: { es: 'Quizás', 'pt-BR': 'Talvez' }, emoji: '🤔', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_051', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Qué área querés mejorar?', 'pt-BR': 'Que área você quer melhorar?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'marketing', label: { es: 'Visibilidad/Marketing', 'pt-BR': 'Visibilidade/Marketing' }, emoji: '📱', impactScore: 15 },
    { id: 'operations', label: { es: 'Operaciones', 'pt-BR': 'Operações' }, emoji: '⚙️', impactScore: 15 },
    { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, emoji: '👥', impactScore: 12 },
    { id: 'finance', label: { es: 'Finanzas', 'pt-BR': 'Finanças' }, emoji: '💰', impactScore: 12 },
    { id: 'patient_exp', label: { es: 'Experiencia paciente', 'pt-BR': 'Experiência paciente' }, emoji: '🤝', impactScore: 15 },
  ]},
  { id: 'SA_CON_052', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Cuál es tu mayor desafío?', 'pt-BR': 'Qual é seu maior desafio?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'patients', label: { es: 'Conseguir pacientes', 'pt-BR': 'Conseguir pacientes' }, emoji: '👥', impactScore: 15 },
    { id: 'time', label: { es: 'Gestión del tiempo', 'pt-BR': 'Gestão do tempo' }, emoji: '⏰', impactScore: 12 },
    { id: 'admin', label: { es: 'Tareas administrativas', 'pt-BR': 'Tarefas administrativas' }, emoji: '📋', impactScore: 12 },
    { id: 'pricing', label: { es: 'Establecer precios', 'pt-BR': 'Estabelecer preços' }, emoji: '💰', impactScore: 15 },
    { id: 'insurance', label: { es: 'Obras sociales/Seguros', 'pt-BR': 'Convênios' }, emoji: '📄', impactScore: 12 },
  ]},
  { id: 'SA_CON_053', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Tenés plan de negocios?', 'pt-BR': 'Você tem plano de negócios?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_documented', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 20 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_054', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Querés digitalizar más tu práctica?', 'pt-BR': 'Você quer digitalizar mais sua prática?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_priority', label: { es: 'Sí, es prioridad', 'pt-BR': 'Sim, é prioridade' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_interested', label: { es: 'Sí, me interesa', 'pt-BR': 'Sim, me interessa' }, emoji: '📱', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_055', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Considerás hacer docencia?', 'pt-BR': 'Você considera dar aulas?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'already', label: { es: 'Ya hago', 'pt-BR': 'Já faço' }, emoji: '🎓', impactScore: 20 },
    { id: 'yes_interested', label: { es: 'Me interesa', 'pt-BR': 'Me interessa' }, emoji: '📚', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // ESPECÍFICAS CONSULTORIO (15 adicionales)
  { id: 'SA_CON_056', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés recetas electrónicas?', 'pt-BR': 'Você usa receitas eletrônicas?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_integrated', label: { es: 'Sí, integrado', 'pt-BR': 'Sim, integrado' }, emoji: '💊', impactScore: 20 },
    { id: 'yes_separate', label: { es: 'Sí, separado', 'pt-BR': 'Sim, separado' }, emoji: '📝', impactScore: 15 },
    { id: 'paper', label: { es: 'Solo papel', 'pt-BR': 'Só papel' }, emoji: '📄', impactScore: 8 },
  ]},
  { id: 'SA_CON_057', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés seguimiento post-consulta?', 'pt-BR': 'Você faz acompanhamento pós-consulta?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_systematic', label: { es: 'Sí, sistemático', 'pt-BR': 'Sim, sistemático' }, emoji: '📱', impactScore: 20 },
    { id: 'yes_when_needed', label: { es: 'Sí, cuando corresponde', 'pt-BR': 'Sim, quando necessário' }, emoji: '📞', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_058', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Atendés urgencias?', 'pt-BR': 'Você atende urgências?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_24h', label: { es: 'Sí, 24h', 'pt-BR': 'Sim, 24h' }, emoji: '🚨', impactScore: 18 },
    { id: 'yes_hours', label: { es: 'Sí, en horario', 'pt-BR': 'Sim, no horário' }, emoji: '⏰', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_CON_059', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés certificaciones especiales?', 'pt-BR': 'Você tem certificações especiais?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_many', label: { es: 'Sí, varias', 'pt-BR': 'Sim, várias' }, emoji: '🎓', impactScore: 20 },
    { id: 'yes_one', label: { es: 'Sí, alguna', 'pt-BR': 'Sim, alguma' }, emoji: '📜', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_060', category: 'sales', mode: 'complete', dimension: 'profitability', weight: 6, title: { es: '¿Vendés productos/suplementos?', 'pt-BR': 'Você vende produtos/suplementos?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_important', label: { es: 'Sí, importante', 'pt-BR': 'Sim, importante' }, emoji: '💊', impactScore: 18 },
    { id: 'yes_minor', label: { es: 'Sí, marginal', 'pt-BR': 'Sim, marginal' }, emoji: '📦', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_CON_061', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés convenio con laboratorios?', 'pt-BR': 'Você tem convênio com laboratórios?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🔬', impactScore: 18 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🧪', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_062', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés acceso a interconsultas?', 'pt-BR': 'Você tem acesso a interconsultas?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_network', label: { es: 'Sí, red armada', 'pt-BR': 'Sim, rede estruturada' }, emoji: '🔗', impactScore: 20 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '📞', impactScore: 15 },
    { id: 'limited', label: { es: 'Limitado', 'pt-BR': 'Limitado' }, emoji: '🔄', impactScore: 10 },
  ]},
  { id: 'SA_CON_063', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés costos fijos altos?', 'pt-BR': 'Você tem custos fixos altos?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'low', label: { es: 'Bajos', 'pt-BR': 'Baixos' }, emoji: '💚', impactScore: 18 },
    { id: 'medium', label: { es: 'Medios', 'pt-BR': 'Médios' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Altos', 'pt-BR': 'Altos' }, emoji: '🔴', impactScore: 8 },
  ]},
  { id: 'SA_CON_064', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés visitas domiciliarias?', 'pt-BR': 'Você faz visitas domiciliares?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🏠', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '🚗', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_CON_065', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés lista de espera?', 'pt-BR': 'Você tem lista de espera?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_managed', label: { es: 'Sí, gestionada', 'pt-BR': 'Sim, gerenciada' }, emoji: '📋', impactScore: 18 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '📝', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 10 },
  ]},
  { id: 'SA_CON_066', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés identidad visual/logo?', 'pt-BR': 'Você tem identidade visual/logo?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_pro', label: { es: 'Sí, profesional', 'pt-BR': 'Sim, profissional' }, emoji: '🎨', impactScore: 18 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '🖼️', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_067', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés protocolos estandarizados?', 'pt-BR': 'Você tem protocolos padronizados?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_documented', label: { es: 'Sí, documentados', 'pt-BR': 'Sim, documentados' }, emoji: '📋', impactScore: 20 },
    { id: 'yes_informal', label: { es: 'Sí, informales', 'pt-BR': 'Sim, informais' }, emoji: '📝', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CON_068', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Aceptás pacientes sin turno?', 'pt-BR': 'Você aceita pacientes sem marcação?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_always', label: { es: 'Sí, siempre', 'pt-BR': 'Sim, sempre' }, emoji: '✅', impactScore: 15 },
    { id: 'yes_if_space', label: { es: 'Sí, si hay lugar', 'pt-BR': 'Sim, se houver vaga' }, emoji: '🔄', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 12 },
  ]},
  { id: 'SA_CON_069', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Pensás crear una clínica?', 'pt-BR': 'Você pensa em criar uma clínica?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'yes_planning', label: { es: 'Sí, planeando', 'pt-BR': 'Sim, planejando' }, emoji: '🏥', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CON_070', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Te especializás en alguna población?', 'pt-BR': 'Você se especializa em alguma população?' }, type: 'single', businessTypes: ['consultorio_medico'], options: [
    { id: 'elderly', label: { es: 'Adultos mayores', 'pt-BR': 'Idosos' }, emoji: '👴', impactScore: 15 },
    { id: 'women', label: { es: 'Salud femenina', 'pt-BR': 'Saúde feminina' }, emoji: '👩', impactScore: 15 },
    { id: 'sports', label: { es: 'Deportistas', 'pt-BR': 'Esportistas' }, emoji: '🏃', impactScore: 15 },
    { id: 'general', label: { es: 'General', 'pt-BR': 'Geral' }, emoji: '👥', impactScore: 12 },
  ]},
];
