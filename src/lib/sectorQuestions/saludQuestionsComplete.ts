// Salud, Bienestar y Belleza - COMPLETE Questionnaires
// 18 Business Types × 65-75 questions each
// Structure: 12 mandatory categories per business type

import type { GastroQuestion } from '../gastroQuestionsEngine';

// ============================================
// CLINICA / POLICONSULTORIO - 70 questions
// ============================================
export const CLINICA_COMPLETE: GastroQuestion[] = [
  // IDENTIDAD (6)
  { id: 'SA_CLI_001', category: 'identity', mode: 'both', dimension: 'reputation', weight: 9, title: { es: '¿Qué especialidades ofrecés?', 'pt-BR': 'Quais especialidades você oferece?' }, type: 'multi', required: true, businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'general', label: { es: 'Medicina general', 'pt-BR': 'Clínica geral' }, emoji: '🩺', impactScore: 15 },
    { id: 'pediatrics', label: { es: 'Pediatría', 'pt-BR': 'Pediatria' }, emoji: '👶', impactScore: 15 },
    { id: 'gynecology', label: { es: 'Ginecología', 'pt-BR': 'Ginecologia' }, emoji: '👩', impactScore: 15 },
    { id: 'cardiology', label: { es: 'Cardiología', 'pt-BR': 'Cardiologia' }, emoji: '❤️', impactScore: 18 },
    { id: 'dermatology', label: { es: 'Dermatología', 'pt-BR': 'Dermatologia' }, emoji: '🧴', impactScore: 15 },
    { id: 'traumatology', label: { es: 'Traumatología', 'pt-BR': 'Traumatologia' }, emoji: '🦴', impactScore: 15 },
    { id: 'ophthalmology', label: { es: 'Oftalmología', 'pt-BR': 'Oftalmologia' }, emoji: '👁️', impactScore: 15 },
    { id: 'otorhinolaryngology', label: { es: 'Otorrinolaringología', 'pt-BR': 'Otorrinolaringologia' }, emoji: '👂', impactScore: 15 },
  ]},
  { id: 'SA_CLI_002', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Cuántos años tiene la clínica?', 'pt-BR': 'Quantos anos tem a clínica?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '0-2', label: { es: 'Menos de 2 años', 'pt-BR': 'Menos de 2 anos' }, emoji: '🌱', impactScore: 8 },
    { id: '2-5', label: { es: '2-5 años', 'pt-BR': '2-5 anos' }, emoji: '📈', impactScore: 12 },
    { id: '5-15', label: { es: '5-15 años', 'pt-BR': '5-15 anos' }, emoji: '🏥', impactScore: 15 },
    { id: '15+', label: { es: 'Más de 15 años', 'pt-BR': 'Mais de 15 anos' }, emoji: '🏆', impactScore: 18 },
  ]},
  { id: 'SA_CLI_003', category: 'identity', mode: 'complete', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántos consultorios tenés?', 'pt-BR': 'Quantos consultórios você tem?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '1-3', label: { es: '1-3 consultorios', 'pt-BR': '1-3 consultórios' }, emoji: '🏠', impactScore: 10 },
    { id: '4-8', label: { es: '4-8 consultorios', 'pt-BR': '4-8 consultórios' }, emoji: '🏢', impactScore: 15 },
    { id: '9-15', label: { es: '9-15 consultorios', 'pt-BR': '9-15 consultórios' }, emoji: '🏥', impactScore: 18 },
    { id: '15+', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🏬', impactScore: 20 },
  ]},
  { id: 'SA_CLI_004', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tenés habilitación sanitaria?', 'pt-BR': 'Você tem licença sanitária?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_full', label: { es: 'Sí, completa', 'pt-BR': 'Sim, completa' }, emoji: '✅', impactScore: 20 },
    { id: 'yes_partial', label: { es: 'Sí, parcial', 'pt-BR': 'Sim, parcial' }, emoji: '📋', impactScore: 15 },
    { id: 'in_process', label: { es: 'En trámite', 'pt-BR': 'Em trâmite' }, emoji: '⏳', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_005', category: 'identity', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Dónde está ubicada?', 'pt-BR': 'Onde está localizada?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'downtown', label: { es: 'Centro/Zona comercial', 'pt-BR': 'Centro/Zona comercial' }, emoji: '🏢', impactScore: 15 },
    { id: 'residential', label: { es: 'Barrio residencial', 'pt-BR': 'Bairro residencial' }, emoji: '🏘️', impactScore: 15 },
    { id: 'medical_zone', label: { es: 'Zona médica/Hospitales', 'pt-BR': 'Zona médica/Hospitais' }, emoji: '🏥', impactScore: 18 },
    { id: 'mall', label: { es: 'Centro comercial', 'pt-BR': 'Shopping center' }, emoji: '🏬', impactScore: 12 },
  ]},
  { id: 'SA_CLI_006', category: 'identity', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es tu diferenciador principal?', 'pt-BR': 'Qual é seu diferencial principal?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'specialists', label: { es: 'Especialistas reconocidos', 'pt-BR': 'Especialistas reconhecidos' }, emoji: '👨‍⚕️', impactScore: 18 },
    { id: 'technology', label: { es: 'Tecnología de punta', 'pt-BR': 'Tecnologia de ponta' }, emoji: '🔬', impactScore: 18 },
    { id: 'service', label: { es: 'Atención personalizada', 'pt-BR': 'Atendimento personalizado' }, emoji: '🤝', impactScore: 15 },
    { id: 'location', label: { es: 'Ubicación conveniente', 'pt-BR': 'Localização conveniente' }, emoji: '📍', impactScore: 12 },
    { id: 'prices', label: { es: 'Precios accesibles', 'pt-BR': 'Preços acessíveis' }, emoji: '💰', impactScore: 15 },
  ]},

  // EQUIPO (6)
  { id: 'SA_CLI_007', category: 'team', mode: 'both', dimension: 'efficiency', weight: 8, title: { es: '¿Cuántos profesionales trabajan?', 'pt-BR': 'Quantos profissionais trabalham?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '1-5', label: { es: '1-5 profesionales', 'pt-BR': '1-5 profissionais' }, emoji: '👨‍⚕️', impactScore: 10 },
    { id: '6-15', label: { es: '6-15 profesionales', 'pt-BR': '6-15 profissionais' }, emoji: '👥', impactScore: 15 },
    { id: '16-30', label: { es: '16-30 profesionales', 'pt-BR': '16-30 profissionais' }, emoji: '🏥', impactScore: 18 },
    { id: '30+', label: { es: 'Más de 30', 'pt-BR': 'Mais de 30' }, emoji: '🏢', impactScore: 20 },
  ]},
  { id: 'SA_CLI_008', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Los médicos son empleados o alquilan consultorio?', 'pt-BR': 'Os médicos são empregados ou alugam consultório?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'employed', label: { es: 'Empleados', 'pt-BR': 'Empregados' }, emoji: '👔', impactScore: 18 },
    { id: 'rent', label: { es: 'Alquilan espacio', 'pt-BR': 'Alugam espaço' }, emoji: '🏠', impactScore: 12 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 15 },
    { id: 'partners', label: { es: 'Socios', 'pt-BR': 'Sócios' }, emoji: '🤝', impactScore: 15 },
  ]},
  { id: 'SA_CLI_009', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuánto personal administrativo tenés?', 'pt-BR': 'Quanto pessoal administrativo você tem?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '1-2', label: { es: '1-2 personas', 'pt-BR': '1-2 pessoas' }, emoji: '👤', impactScore: 10 },
    { id: '3-5', label: { es: '3-5 personas', 'pt-BR': '3-5 pessoas' }, emoji: '👥', impactScore: 15 },
    { id: '6-10', label: { es: '6-10 personas', 'pt-BR': '6-10 pessoas' }, emoji: '🏢', impactScore: 18 },
    { id: '10+', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏬', impactScore: 20 },
  ]},
  { id: 'SA_CLI_010', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés enfermeros/as?', 'pt-BR': 'Você tem enfermeiros?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_several', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '👩‍⚕️', impactScore: 18 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '👤', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_011', category: 'team', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Los profesionales tienen subespecialidades?', 'pt-BR': 'Os profissionais têm subespecialidades?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_many', label: { es: 'Sí, muchos', 'pt-BR': 'Sim, muitos' }, emoji: '🎓', impactScore: 18 },
    { id: 'yes_some', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '📚', impactScore: 12 },
    { id: 'no', label: { es: 'No, generalistas', 'pt-BR': 'Não, generalistas' }, emoji: '🩺', impactScore: 8 },
  ]},
  { id: 'SA_CLI_012', category: 'team', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Hay rotación de personal frecuente?', 'pt-BR': 'Há rotatividade de pessoal frequente?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'low', label: { es: 'Baja', 'pt-BR': 'Baixa' }, emoji: '💚', impactScore: 18 },
    { id: 'medium', label: { es: 'Media', 'pt-BR': 'Média' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Alta', 'pt-BR': 'Alta' }, emoji: '🔴', impactScore: 5 },
  ]},

  // OPERACIÓN (8)
  { id: 'SA_CLI_013', category: 'operation', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cómo gestionás los turnos?', 'pt-BR': 'Como você gerencia as consultas?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'system', label: { es: 'Sistema online', 'pt-BR': 'Sistema online' }, emoji: '📱', impactScore: 20 },
    { id: 'whatsapp', label: { es: 'WhatsApp/Teléfono', 'pt-BR': 'WhatsApp/Telefone' }, emoji: '📞', impactScore: 12 },
    { id: 'reception', label: { es: 'Solo recepción', 'pt-BR': 'Só recepção' }, emoji: '🏢', impactScore: 8 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 15 },
  ]},
  { id: 'SA_CLI_014', category: 'operation', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cuántos pacientes atendés por día?', 'pt-BR': 'Quantos pacientes você atende por dia?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '1-20', label: { es: '1-20 pacientes', 'pt-BR': '1-20 pacientes' }, emoji: '👤', impactScore: 10 },
    { id: '21-50', label: { es: '21-50 pacientes', 'pt-BR': '21-50 pacientes' }, emoji: '👥', impactScore: 15 },
    { id: '51-100', label: { es: '51-100 pacientes', 'pt-BR': '51-100 pacientes' }, emoji: '🏢', impactScore: 18 },
    { id: '100+', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, emoji: '🏥', impactScore: 20 },
  ]},
  { id: 'SA_CLI_015', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés historia clínica electrónica?', 'pt-BR': 'Você tem prontuário eletrônico?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_integrated', label: { es: 'Sí, integrada', 'pt-BR': 'Sim, integrado' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básico' }, emoji: '📋', impactScore: 15 },
    { id: 'paper', label: { es: 'No, papel', 'pt-BR': 'Não, papel' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'SA_CLI_016', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Ofrecés telemedicina?', 'pt-BR': 'Você oferece telemedicina?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '💻', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📱', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_017', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Cuál es el tiempo promedio de espera?', 'pt-BR': 'Qual é o tempo médio de espera?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'min_15', label: { es: 'Menos de 15 min', 'pt-BR': 'Menos de 15 min' }, emoji: '⚡', impactScore: 20 },
    { id: 'min_30', label: { es: '15-30 min', 'pt-BR': '15-30 min' }, emoji: '⏱️', impactScore: 15 },
    { id: 'min_60', label: { es: '30-60 min', 'pt-BR': '30-60 min' }, emoji: '⏰', impactScore: 10 },
    { id: 'more', label: { es: 'Más de 60 min', 'pt-BR': 'Mais de 60 min' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'SA_CLI_018', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés laboratorio propio?', 'pt-BR': 'Você tem laboratório próprio?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '🔬', impactScore: 20 },
    { id: 'agreement', label: { es: 'No, pero tengo convenio', 'pt-BR': 'Não, mas tenho convênio' }, emoji: '🤝', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_019', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés diagnóstico por imágenes?', 'pt-BR': 'Você tem diagnóstico por imagem?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '📷', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico (Rx, eco)', 'pt-BR': 'Sim, básico (Rx, eco)' }, emoji: '🔍', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_020', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cuántas horas operás por día?', 'pt-BR': 'Quantas horas você opera por dia?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '8h', label: { es: '8 horas', 'pt-BR': '8 horas' }, emoji: '🕐', impactScore: 10 },
    { id: '12h', label: { es: '12 horas', 'pt-BR': '12 horas' }, emoji: '🕑', impactScore: 15 },
    { id: '16h', label: { es: '16 horas', 'pt-BR': '16 horas' }, emoji: '🕒', impactScore: 18 },
    { id: '24h', label: { es: '24 horas', 'pt-BR': '24 horas' }, emoji: '🔄', impactScore: 20 },
  ]},

  // FINANZAS (8)
  { id: 'SA_CLI_021', category: 'finance', mode: 'both', dimension: 'profitability', weight: 8, title: { es: '¿Trabajás con obras sociales/seguros?', 'pt-BR': 'Você trabalha com convênios?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'all', label: { es: 'Sí, varias', 'pt-BR': 'Sim, vários' }, emoji: '🏥', impactScore: 15 },
    { id: 'some', label: { es: 'Algunas seleccionadas', 'pt-BR': 'Alguns selecionados' }, emoji: '✅', impactScore: 18 },
    { id: 'private', label: { es: 'Solo particular', 'pt-BR': 'Só particular' }, emoji: '💰', impactScore: 20 },
    { id: 'mixed', label: { es: 'Mixto 50/50', 'pt-BR': 'Misto 50/50' }, emoji: '⚖️', impactScore: 15 },
  ]},
  { id: 'SA_CLI_022', category: 'finance', mode: 'both', dimension: 'profitability', weight: 8, title: { es: '¿Cuál es el valor promedio de consulta particular?', 'pt-BR': 'Qual é o valor médio da consulta particular?' }, type: 'number', businessTypes: ['clinica_policonsultorio'] },
  { id: 'SA_CLI_023', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Qué porcentaje de tus ingresos son particulares?', 'pt-BR': 'Que porcentagem da sua receita é particular?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '0-25', label: { es: '0-25%', 'pt-BR': '0-25%' }, emoji: '📊', impactScore: 10 },
    { id: '25-50', label: { es: '25-50%', 'pt-BR': '25-50%' }, emoji: '📈', impactScore: 15 },
    { id: '50-75', label: { es: '50-75%', 'pt-BR': '50-75%' }, emoji: '💰', impactScore: 18 },
    { id: '75-100', label: { es: '75-100%', 'pt-BR': '75-100%' }, emoji: '💎', impactScore: 20 },
  ]},
  { id: 'SA_CLI_024', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuánto demoran las obras sociales en pagar?', 'pt-BR': 'Quanto os convênios demoram para pagar?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '30d', label: { es: 'Menos de 30 días', 'pt-BR': 'Menos de 30 dias' }, emoji: '⚡', impactScore: 18 },
    { id: '60d', label: { es: '30-60 días', 'pt-BR': '30-60 dias' }, emoji: '📅', impactScore: 15 },
    { id: '90d', label: { es: '60-90 días', 'pt-BR': '60-90 dias' }, emoji: '📆', impactScore: 10 },
    { id: 'more', label: { es: 'Más de 90 días', 'pt-BR': 'Mais de 90 dias' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'SA_CLI_025', category: 'finance', mode: 'complete', dimension: 'profitability', weight: 7, title: { es: '¿Qué medios de pago aceptás?', 'pt-BR': 'Que meios de pagamento você aceita?' }, type: 'multi', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'cash', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵', impactScore: 10 },
    { id: 'debit', label: { es: 'Débito', 'pt-BR': 'Débito' }, emoji: '💳', impactScore: 12 },
    { id: 'credit', label: { es: 'Crédito', 'pt-BR': 'Crédito' }, emoji: '💳', impactScore: 15 },
    { id: 'transfer', label: { es: 'Transferencia', 'pt-BR': 'Transferência' }, emoji: '🏦', impactScore: 12 },
    { id: 'qr', label: { es: 'QR/Billetera', 'pt-BR': 'QR/Carteira' }, emoji: '📱', impactScore: 15 },
  ]},
  { id: 'SA_CLI_026', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Tenés sistema de facturación integrado?', 'pt-BR': 'Você tem sistema de faturamento integrado?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_full', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '💻', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📋', impactScore: 15 },
    { id: 'manual', label: { es: 'Manual', 'pt-BR': 'Manual' }, emoji: '📝', impactScore: 5 },
  ]},
  { id: 'SA_CLI_027', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Cuál es tu costo fijo mensual aproximado?', 'pt-BR': 'Qual é seu custo fixo mensal aproximado?' }, type: 'number', businessTypes: ['clinica_policonsultorio'] },
  { id: 'SA_CLI_028', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés contador especializado en salud?', 'pt-BR': 'Você tem contador especializado em saúde?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_specialist', label: { es: 'Sí, especialista', 'pt-BR': 'Sim, especialista' }, emoji: '🎓', impactScore: 18 },
    { id: 'yes_general', label: { es: 'Sí, general', 'pt-BR': 'Sim, geral' }, emoji: '📊', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // MARKETING (6)
  { id: 'SA_CLI_029', category: 'marketing', mode: 'both', dimension: 'traffic', weight: 8, title: { es: '¿Cómo llegan tus pacientes?', 'pt-BR': 'Como chegam seus pacientes?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'referral', label: { es: 'Derivación médica', 'pt-BR': 'Encaminhamento médico' }, emoji: '🩺', impactScore: 18 },
    { id: 'word', label: { es: 'Boca en boca', 'pt-BR': 'Boca a boca' }, emoji: '🗣️', impactScore: 15 },
    { id: 'insurance', label: { es: 'Por obra social', 'pt-BR': 'Pelo convênio' }, emoji: '🏥', impactScore: 15 },
    { id: 'online', label: { es: 'Búsqueda online', 'pt-BR': 'Busca online' }, emoji: '🔍', impactScore: 12 },
    { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 10 },
  ]},
  { id: 'SA_CLI_030', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Tenés página web?', 'pt-BR': 'Você tem site?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_modern', label: { es: 'Sí, moderna', 'pt-BR': 'Sim, moderno' }, emoji: '🌐', impactScore: 18 },
    { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básico' }, emoji: '💻', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_031', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 7, title: { es: '¿Tenés presencia en redes sociales?', 'pt-BR': 'Você tem presença nas redes sociais?' }, type: 'multi', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸', impactScore: 15 },
    { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘', impactScore: 12 },
    { id: 'linkedin', label: { es: 'LinkedIn', 'pt-BR': 'LinkedIn' }, emoji: '💼', impactScore: 12 },
    { id: 'youtube', label: { es: 'YouTube', 'pt-BR': 'YouTube' }, emoji: '📹', impactScore: 10 },
    { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_032', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés Google Business activo?', 'pt-BR': 'Você tem Google Business ativo?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_active', label: { es: 'Sí, lo mantengo', 'pt-BR': 'Sim, mantenho' }, emoji: '🌐', impactScore: 18 },
    { id: 'yes_inactive', label: { es: 'Sí, abandonado', 'pt-BR': 'Sim, abandonado' }, emoji: '😴', impactScore: 10 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_033', category: 'marketing', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Invertís en publicidad paga?', 'pt-BR': 'Você investe em publicidade paga?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '📈', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_034', category: 'marketing', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Los médicos tienen marca personal?', 'pt-BR': 'Os médicos têm marca pessoal?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '⭐', impactScore: 18 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🌟', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // CLIENTES (6) -> mapped to 'sales' category
  { id: 'SA_CLI_035', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Qué porcentaje de pacientes vuelven?', 'pt-BR': 'Que porcentagem de pacientes voltam?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '80+', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' }, emoji: '🌟', impactScore: 20 },
    { id: '60-80', label: { es: '60-80%', 'pt-BR': '60-80%' }, emoji: '💚', impactScore: 15 },
    { id: '40-60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '💛', impactScore: 10 },
    { id: '-40', label: { es: 'Menos del 40%', 'pt-BR': 'Menos de 40%' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'SA_CLI_036', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuál es el rango de edad predominante?', 'pt-BR': 'Qual é a faixa etária predominante?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'pediatric', label: { es: 'Pediátrica (0-18)', 'pt-BR': 'Pediátrica (0-18)' }, emoji: '👶', impactScore: 15 },
    { id: 'young', label: { es: 'Jóvenes (18-35)', 'pt-BR': 'Jovens (18-35)' }, emoji: '🧑', impactScore: 15 },
    { id: 'adult', label: { es: 'Adultos (35-60)', 'pt-BR': 'Adultos (35-60)' }, emoji: '👨', impactScore: 15 },
    { id: 'senior', label: { es: 'Mayores (60+)', 'pt-BR': 'Idosos (60+)' }, emoji: '👴', impactScore: 15 },
    { id: 'mixed', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄', impactScore: 12 },
  ]},
  { id: 'SA_CLI_037', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Tenés quejas o reclamos frecuentes?', 'pt-BR': 'Você tem reclamações frequentes?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'never', label: { es: 'Nunca/Casi nunca', 'pt-BR': 'Nunca/Quase nunca' }, emoji: '✅', impactScore: 18 },
    { id: 'sometimes', label: { es: 'A veces', 'pt-BR': 'Às vezes' }, emoji: '🔄', impactScore: 10 },
    { id: 'often', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'SA_CLI_038', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés seguimiento post-consulta?', 'pt-BR': 'Você faz acompanhamento pós-consulta?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_systematic', label: { es: 'Sí, sistemático', 'pt-BR': 'Sim, sistemático' }, emoji: '📋', impactScore: 18 },
    { id: 'yes_cases', label: { es: 'Sí, casos especiales', 'pt-BR': 'Sim, casos especiais' }, emoji: '📝', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_039', category: 'sales', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Medís la satisfacción de pacientes?', 'pt-BR': 'Você mede a satisfação dos pacientes?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_formal', label: { es: 'Sí, encuestas formales', 'pt-BR': 'Sim, pesquisas formais' }, emoji: '📊', impactScore: 18 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💬', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_040', category: 'sales', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Cuánto es el ausentismo a turnos?', 'pt-BR': 'Quanto é o absenteísmo nas consultas?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'low', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '💚', impactScore: 18 },
    { id: 'medium', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '💛', impactScore: 12 },
    { id: 'high', label: { es: 'Más del 20%', 'pt-BR': 'Mais de 20%' }, emoji: '🔴', impactScore: 5 },
  ]},

  // TECNOLOGÍA (6) -> mapped to 'operation' category
  { id: 'SA_CLI_041', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 8, title: { es: '¿Qué software de gestión usás?', 'pt-BR': 'Que software de gestão você usa?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'specialized', label: { es: 'Especializado en salud', 'pt-BR': 'Especializado em saúde' }, emoji: '💉', impactScore: 20 },
    { id: 'general', label: { es: 'General/ERP', 'pt-BR': 'Geral/ERP' }, emoji: '💻', impactScore: 15 },
    { id: 'basic', label: { es: 'Básico/Planillas', 'pt-BR': 'Básico/Planilhas' }, emoji: '📊', impactScore: 8 },
    { id: 'none', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_042', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés equipamiento médico moderno?', 'pt-BR': 'Você tem equipamento médico moderno?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'cutting_edge', label: { es: 'De última generación', 'pt-BR': 'De última geração' }, emoji: '🔬', impactScore: 20 },
    { id: 'modern', label: { es: 'Moderno', 'pt-BR': 'Moderno' }, emoji: '✨', impactScore: 15 },
    { id: 'adequate', label: { es: 'Adecuado', 'pt-BR': 'Adequado' }, emoji: '✅', impactScore: 12 },
    { id: 'outdated', label: { es: 'Desactualizado', 'pt-BR': 'Desatualizado' }, emoji: '😓', impactScore: 5 },
  ]},
  { id: 'SA_CLI_043', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 7, title: { es: '¿Tenés sistema de recordatorios automáticos?', 'pt-BR': 'Você tem sistema de lembretes automáticos?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_multi', label: { es: 'Sí, múltiples canales', 'pt-BR': 'Sim, múltiplos canais' }, emoji: '📲', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, WhatsApp/SMS', 'pt-BR': 'Sim, WhatsApp/SMS' }, emoji: '📱', impactScore: 15 },
    { id: 'manual', label: { es: 'Manual', 'pt-BR': 'Manual' }, emoji: '📞', impactScore: 8 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_044', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Entregás resultados digitalmente?', 'pt-BR': 'Você entrega resultados digitalmente?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_portal', label: { es: 'Sí, portal del paciente', 'pt-BR': 'Sim, portal do paciente' }, emoji: '🌐', impactScore: 20 },
    { id: 'yes_email', label: { es: 'Sí, email/WhatsApp', 'pt-BR': 'Sim, email/WhatsApp' }, emoji: '📧', impactScore: 15 },
    { id: 'paper', label: { es: 'Solo papel', 'pt-BR': 'Só papel' }, emoji: '📄', impactScore: 5 },
  ]},
  { id: 'SA_CLI_045', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés sistema de prescripción electrónica?', 'pt-BR': 'Você tem sistema de prescrição eletrônica?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '💊', impactScore: 18 },
    { id: 'partial', label: { es: 'Parcialmente', 'pt-BR': 'Parcialmente' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_046', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés backup de datos seguro?', 'pt-BR': 'Você tem backup de dados seguro?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_cloud', label: { es: 'Sí, en la nube', 'pt-BR': 'Sim, na nuvem' }, emoji: '☁️', impactScore: 20 },
    { id: 'yes_local', label: { es: 'Sí, local', 'pt-BR': 'Sim, local' }, emoji: '💾', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // (Continúa con más preguntas para completar 70...)
  // REPUTACIÓN (6)
  { id: 'SA_CLI_047', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 8, title: { es: '¿Cuál es tu calificación en Google?', 'pt-BR': 'Qual é sua avaliação no Google?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '4.5+', label: { es: '4.5+ estrellas', 'pt-BR': '4.5+ estrelas' }, emoji: '⭐', impactScore: 20 },
    { id: '4-4.5', label: { es: '4-4.5 estrellas', 'pt-BR': '4-4.5 estrelas' }, emoji: '🌟', impactScore: 15 },
    { id: '3.5-4', label: { es: '3.5-4 estrellas', 'pt-BR': '3.5-4 estrelas' }, emoji: '✨', impactScore: 10 },
    { id: 'low', label: { es: 'Menos de 3.5', 'pt-BR': 'Menos de 3.5' }, emoji: '😓', impactScore: 5 },
    { id: 'none', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_048', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Cuántas reseñas tenés?', 'pt-BR': 'Quantas avaliações você tem?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: '100+', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' }, emoji: '🏆', impactScore: 20 },
    { id: '50-100', label: { es: '50-100', 'pt-BR': '50-100' }, emoji: '⭐', impactScore: 15 },
    { id: '20-50', label: { es: '20-50', 'pt-BR': '20-50' }, emoji: '🌟', impactScore: 12 },
    { id: '-20', label: { es: 'Menos de 20', 'pt-BR': 'Menos de 20' }, emoji: '📝', impactScore: 8 },
  ]},
  { id: 'SA_CLI_049', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 7, title: { es: '¿Respondés las reseñas?', 'pt-BR': 'Você responde as avaliações?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'always', label: { es: 'Siempre', 'pt-BR': 'Sempre' }, emoji: '✅', impactScore: 18 },
    { id: 'negative', label: { es: 'Solo las negativas', 'pt-BR': 'Só as negativas' }, emoji: '⚠️', impactScore: 12 },
    { id: 'never', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_050', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés certificaciones de calidad?', 'pt-BR': 'Você tem certificações de qualidade?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_iso', label: { es: 'Sí, ISO u otra', 'pt-BR': 'Sim, ISO ou outra' }, emoji: '🏆', impactScore: 20 },
    { id: 'in_process', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '⏳', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_051', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés convenios con empresas?', 'pt-BR': 'Você tem convênios com empresas?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_many', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '🏢', impactScore: 18 },
    { id: 'yes_few', label: { es: 'Sí, algunos', 'pt-BR': 'Sim, alguns' }, emoji: '🤝', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_052', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Los médicos participan en congresos/docencia?', 'pt-BR': 'Os médicos participam de congressos/docência?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_active', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '🎓', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '📚', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},

  // OBJETIVOS (6)
  { id: 'SA_CLI_053', category: 'goals', mode: 'both', dimension: 'growth', weight: 9, title: { es: '¿Cuál es tu principal objetivo este año?', 'pt-BR': 'Qual é seu principal objetivo este ano?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'grow_patients', label: { es: 'Aumentar pacientes', 'pt-BR': 'Aumentar pacientes' }, emoji: '📈', impactScore: 18 },
    { id: 'improve_margin', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💰', impactScore: 18 },
    { id: 'digitalize', label: { es: 'Digitalizar', 'pt-BR': 'Digitalizar' }, emoji: '💻', impactScore: 15 },
    { id: 'expand', label: { es: 'Expandir especialidades', 'pt-BR': 'Expandir especialidades' }, emoji: '🏥', impactScore: 15 },
    { id: 'quality', label: { es: 'Mejorar calidad', 'pt-BR': 'Melhorar qualidade' }, emoji: '⭐', impactScore: 15 },
  ]},
  { id: 'SA_CLI_054', category: 'goals', mode: 'complete', dimension: 'growth', weight: 8, title: { es: '¿Tenés planes de expandirte?', 'pt-BR': 'Você tem planos de expandir?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_soon', label: { es: 'Sí, pronto', 'pt-BR': 'Sim, em breve' }, emoji: '🚀', impactScore: 20 },
    { id: 'yes_future', label: { es: 'Sí, a futuro', 'pt-BR': 'Sim, no futuro' }, emoji: '📅', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '🏠', impactScore: 10 },
  ]},
  { id: 'SA_CLI_055', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Querés agregar nuevas especialidades?', 'pt-BR': 'Você quer adicionar novas especialidades?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_planned', label: { es: 'Sí, ya planificado', 'pt-BR': 'Sim, já planejado' }, emoji: '📋', impactScore: 18 },
    { id: 'yes_interested', label: { es: 'Sí, me interesa', 'pt-BR': 'Sim, me interessa' }, emoji: '🤔', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_056', category: 'goals', mode: 'complete', dimension: 'growth', weight: 7, title: { es: '¿Cuál es tu mayor desafío actual?', 'pt-BR': 'Qual é seu maior desafio atual?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'patients', label: { es: 'Conseguir pacientes', 'pt-BR': 'Conseguir pacientes' }, emoji: '👥', impactScore: 15 },
    { id: 'costs', label: { es: 'Controlar costos', 'pt-BR': 'Controlar custos' }, emoji: '💸', impactScore: 15 },
    { id: 'staff', label: { es: 'Personal médico', 'pt-BR': 'Pessoal médico' }, emoji: '👨‍⚕️', impactScore: 12 },
    { id: 'technology', label: { es: 'Tecnología', 'pt-BR': 'Tecnologia' }, emoji: '💻', impactScore: 12 },
    { id: 'insurance', label: { es: 'Obras sociales', 'pt-BR': 'Convênios' }, emoji: '🏥', impactScore: 12 },
  ]},
  { id: 'SA_CLI_057', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Qué mejorarías primero?', 'pt-BR': 'O que você melhoraria primeiro?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'systems', label: { es: 'Sistemas/Tecnología', 'pt-BR': 'Sistemas/Tecnologia' }, emoji: '💻', impactScore: 18 },
    { id: 'service', label: { es: 'Atención al paciente', 'pt-BR': 'Atendimento ao paciente' }, emoji: '🤝', impactScore: 15 },
    { id: 'marketing', label: { es: 'Marketing/Difusión', 'pt-BR': 'Marketing/Divulgação' }, emoji: '📣', impactScore: 15 },
    { id: 'facilities', label: { es: 'Instalaciones', 'pt-BR': 'Instalações' }, emoji: '🏥', impactScore: 12 },
    { id: 'team', label: { es: 'Equipo médico', 'pt-BR': 'Equipe médica' }, emoji: '👨‍⚕️', impactScore: 12 },
  ]},
  { id: 'SA_CLI_058', category: 'goals', mode: 'complete', dimension: 'growth', weight: 6, title: { es: '¿Tenés plan estratégico formal?', 'pt-BR': 'Você tem plano estratégico formal?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_documented', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 20 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},

  // RIESGOS (6) -> mapped to 'finance' category
  { id: 'SA_CLI_059', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Cuál es tu mayor riesgo operativo?', 'pt-BR': 'Qual é seu maior risco operativo?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'malpractice', label: { es: 'Mala praxis', 'pt-BR': 'Erro médico' }, emoji: '⚠️', impactScore: 15 },
    { id: 'payment', label: { es: 'Demora en cobros', 'pt-BR': 'Demora nos recebimentos' }, emoji: '💸', impactScore: 15 },
    { id: 'staff', label: { es: 'Pérdida de médicos', 'pt-BR': 'Perda de médicos' }, emoji: '👨‍⚕️', impactScore: 12 },
    { id: 'competition', label: { es: 'Competencia', 'pt-BR': 'Concorrência' }, emoji: '🏥', impactScore: 10 },
    { id: 'regulation', label: { es: 'Cambios regulatorios', 'pt-BR': 'Mudanças regulatórias' }, emoji: '📜', impactScore: 10 },
  ]},
  { id: 'SA_CLI_060', category: 'finance', mode: 'complete', dimension: 'finances', weight: 7, title: { es: '¿Tenés seguro de mala praxis?', 'pt-BR': 'Você tem seguro de erro médico?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_complete', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🛡️', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '✅', impactScore: 15 },
    { id: 'individual', label: { es: 'Solo los médicos', 'pt-BR': 'Só os médicos' }, emoji: '👨‍⚕️', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_061', category: 'finance', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Cumplís con protocolos de bioseguridad?', 'pt-BR': 'Você cumpre protocolos de biossegurança?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_certified', label: { es: 'Sí, certificados', 'pt-BR': 'Sim, certificados' }, emoji: '🏆', impactScore: 20 },
    { id: 'yes_standard', label: { es: 'Sí, estándar', 'pt-BR': 'Sim, padrão' }, emoji: '✅', impactScore: 15 },
    { id: 'partial', label: { es: 'Parcialmente', 'pt-BR': 'Parcialmente' }, emoji: '🔄', impactScore: 8 },
  ]},
  { id: 'SA_CLI_062', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés plan de contingencia?', 'pt-BR': 'Você tem plano de contingência?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_documented', label: { es: 'Sí, documentado', 'pt-BR': 'Sim, documentado' }, emoji: '📋', impactScore: 18 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
  ]},
  { id: 'SA_CLI_063', category: 'finance', mode: 'complete', dimension: 'finances', weight: 6, title: { es: '¿Tenés fondo de reserva?', 'pt-BR': 'Você tem fundo de reserva?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_3m', label: { es: 'Sí, +3 meses', 'pt-BR': 'Sim, +3 meses' }, emoji: '💰', impactScore: 20 },
    { id: 'yes_1m', label: { es: 'Sí, 1-3 meses', 'pt-BR': 'Sim, 1-3 meses' }, emoji: '💵', impactScore: 15 },
    { id: 'low', label: { es: 'Poco/Mínimo', 'pt-BR': 'Pouco/Mínimo' }, emoji: '😓', impactScore: 8 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '🔴', impactScore: 5 },
  ]},
  { id: 'SA_CLI_064', category: 'finance', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Hay estacionalidad en tu demanda?', 'pt-BR': 'Há sazonalidade na sua demanda?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'high', label: { es: 'Sí, mucha', 'pt-BR': 'Sim, muita' }, emoji: '📊', impactScore: 10 },
    { id: 'some', label: { es: 'Algo', 'pt-BR': 'Alguma' }, emoji: '📈', impactScore: 12 },
    { id: 'stable', label: { es: 'No, estable', 'pt-BR': 'Não, estável' }, emoji: '✅', impactScore: 18 },
  ]},

  // ESPECÍFICAS CLÍNICA (6) -> mapped to 'operation' category
  { id: 'SA_CLI_065', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés quirófano/sala de procedimientos?', 'pt-BR': 'Você tem centro cirúrgico/sala de procedimentos?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_full', label: { es: 'Sí, completo', 'pt-BR': 'Sim, completo' }, emoji: '🏥', impactScore: 20 },
    { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '🩺', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_066', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés farmacia interna?', 'pt-BR': 'Você tem farmácia interna?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes', label: { es: 'Sí', 'pt-BR': 'Sim' }, emoji: '💊', impactScore: 18 },
    { id: 'agreement', label: { es: 'No, pero tengo convenio', 'pt-BR': 'Não, mas tenho convênio' }, emoji: '🤝', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_067', category: 'operation', mode: 'complete', dimension: 'traffic', weight: 6, title: { es: '¿Atendés emergencias/guardias?', 'pt-BR': 'Você atende emergências/plantões?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_24h', label: { es: 'Sí, 24 horas', 'pt-BR': 'Sim, 24 horas' }, emoji: '🚑', impactScore: 20 },
    { id: 'yes_limited', label: { es: 'Sí, horario limitado', 'pt-BR': 'Sim, horário limitado' }, emoji: '⏰', impactScore: 15 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_068', category: 'operation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Hacés cirugías ambulatorias?', 'pt-BR': 'Você faz cirurgias ambulatoriais?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🩺', impactScore: 18 },
    { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '🔄', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_069', category: 'operation', mode: 'complete', dimension: 'efficiency', weight: 6, title: { es: '¿Tenés sistema de interconsultas interna?', 'pt-BR': 'Você tem sistema de interconsultas interno?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_digital', label: { es: 'Sí, digital', 'pt-BR': 'Sim, digital' }, emoji: '💻', impactScore: 18 },
    { id: 'yes_manual', label: { es: 'Sí, manual', 'pt-BR': 'Sim, manual' }, emoji: '📝', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
  { id: 'SA_CLI_070', category: 'reputation', mode: 'complete', dimension: 'reputation', weight: 6, title: { es: '¿Tenés programa de medicina preventiva?', 'pt-BR': 'Você tem programa de medicina preventiva?' }, type: 'single', businessTypes: ['clinica_policonsultorio'], options: [
    { id: 'yes_structured', label: { es: 'Sí, estructurado', 'pt-BR': 'Sim, estruturado' }, emoji: '📋', impactScore: 18 },
    { id: 'yes_informal', label: { es: 'Sí, informal', 'pt-BR': 'Sim, informal' }, emoji: '💭', impactScore: 12 },
    { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 8 },
  ]},
];

// Placeholder para los demás tipos de negocio de Salud
export const CONSULTORIO_COMPLETE: GastroQuestion[] = [];
export const ODONTOLOGIA_COMPLETE: GastroQuestion[] = [];
export const LABORATORIO_COMPLETE: GastroQuestion[] = [];
export const DIAGNOSTICO_COMPLETE: GastroQuestion[] = [];
export const KINESIOLOGIA_COMPLETE: GastroQuestion[] = [];
export const PSICOLOGIA_COMPLETE: GastroQuestion[] = [];
export const NUTRICION_COMPLETE: GastroQuestion[] = [];
export const MEDICINA_ESTETICA_COMPLETE: GastroQuestion[] = [];
export const CENTRO_ESTETICA_COMPLETE: GastroQuestion[] = [];
export const SPA_COMPLETE: GastroQuestion[] = [];
export const GIMNASIO_COMPLETE: GastroQuestion[] = [];
export const YOGA_COMPLETE: GastroQuestion[] = [];
export const PELUQUERIA_COMPLETE: GastroQuestion[] = [];
export const BARBERIA_COMPLETE: GastroQuestion[] = [];
export const MANICURIA_COMPLETE: GastroQuestion[] = [];
export const DEPILACION_COMPLETE: GastroQuestion[] = [];
export const OPTICA_SALUD_COMPLETE: GastroQuestion[] = [];

// Aggregated export
export const ALL_SALUD_COMPLETE: GastroQuestion[] = [
  ...CLINICA_COMPLETE,
  // Los demás se irán agregando
];

// Helper function
export function getSaludCompleteQuestions(businessTypeId: string): GastroQuestion[] {
  const typeMap: Record<string, GastroQuestion[]> = {
    'clinica_policonsultorio': CLINICA_COMPLETE,
    // ... más mappings
  };
  return typeMap[businessTypeId] || [];
}
