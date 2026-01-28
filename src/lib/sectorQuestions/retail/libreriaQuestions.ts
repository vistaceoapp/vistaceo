// =============================================
// LIBRERÍA / PAPELERÍA - Cuestionario Hiper-Personalizado
// Sector: A3_RETAIL | Tipo: LIBRERIA_PAPELERIA
// =============================================

import { UniversalQuestion } from '../../universalQuestionsEngine';

export const LIBRERIA_QUESTIONS: UniversalQuestion[] = [
  // ========== QUICK MODE (12-15 preguntas esenciales) ==========
  
  // 1. Identidad y posicionamiento
  {
    id: 'LIB_Q01_PERFIL',
    category: 'identity',
    mode: 'quick',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es el perfil principal de tu librería?',
      'pt-BR': 'Qual é o perfil principal da sua livraria?'
    },
    type: 'single',
    options: [
      { id: 'general', label: { es: 'Librería general (todo público)', 'pt-BR': 'Livraria geral (todo público)' }, emoji: '📚' },
      { id: 'escolar', label: { es: 'Enfoque escolar/universitario', 'pt-BR': 'Foco escolar/universitário' }, emoji: '🎒' },
      { id: 'papeleria', label: { es: 'Más papelería que libros', 'pt-BR': 'Mais papelaria que livros' }, emoji: '✏️' },
      { id: 'especializada', label: { es: 'Especializada (arte, técnica, infantil)', 'pt-BR': 'Especializada (arte, técnica, infantil)' }, emoji: '🎨' },
      { id: 'oficina', label: { es: 'Insumos de oficina corporativo', 'pt-BR': 'Insumos de escritório corporativo' }, emoji: '🏢' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_Q02_ANTIGUEDAD',
    category: 'identity',
    mode: 'quick',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Cuántos años lleva operando tu librería?',
      'pt-BR': 'Há quantos anos sua livraria está operando?'
    },
    type: 'single',
    options: [
      { id: 'nuevo', label: { es: 'Menos de 1 año', 'pt-BR': 'Menos de 1 ano' }, emoji: '🌱' },
      { id: '1-3', label: { es: '1 a 3 años', 'pt-BR': '1 a 3 anos' }, emoji: '📗' },
      { id: '3-10', label: { es: '3 a 10 años', 'pt-BR': '3 a 10 anos' }, emoji: '📘' },
      { id: '10-25', label: { es: '10 a 25 años', 'pt-BR': '10 a 25 anos' }, emoji: '📙' },
      { id: '25+', label: { es: 'Más de 25 años (tradicional)', 'pt-BR': 'Mais de 25 anos (tradicional)' }, emoji: '📕' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 2. Oferta y precios
  {
    id: 'LIB_Q03_MIX_PRODUCTO',
    category: 'offering',
    mode: 'quick',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu mix de productos aproximado?',
      'pt-BR': 'Qual é seu mix de produtos aproximado?'
    },
    type: 'single',
    options: [
      { id: 'libros_80', label: { es: '80% libros, 20% papelería', 'pt-BR': '80% livros, 20% papelaria' }, emoji: '📚' },
      { id: 'balanceado', label: { es: '50% libros, 50% papelería', 'pt-BR': '50% livros, 50% papelaria' }, emoji: '⚖️' },
      { id: 'papeleria_80', label: { es: '80% papelería, 20% libros', 'pt-BR': '80% papelaria, 20% livros' }, emoji: '✏️' },
      { id: 'tech_incluido', label: { es: 'Incluyo tecnología (impresoras, etc)', 'pt-BR': 'Incluo tecnologia (impressoras, etc)' }, emoji: '🖨️' },
      { id: 'servicios', label: { es: 'Incluyo servicios (fotocopias, encuadernado)', 'pt-BR': 'Incluo serviços (fotocópias, encadernação)' }, emoji: '📄' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_Q04_TICKET_PROMEDIO',
    category: 'offering',
    mode: 'quick',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu ticket promedio por cliente?',
      'pt-BR': 'Qual é seu ticket médio por cliente?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos de $15 USD', 'pt-BR': 'Menos de R$75' }, emoji: '💵' },
      { id: 'medio_bajo', label: { es: '$15-30 USD', 'pt-BR': 'R$75-150' }, emoji: '💰' },
      { id: 'medio', label: { es: '$30-50 USD', 'pt-BR': 'R$150-250' }, emoji: '💎' },
      { id: 'alto', label: { es: '$50-100 USD', 'pt-BR': 'R$250-500' }, emoji: '👑' },
      { id: 'muy_alto', label: { es: 'Más de $100 USD (corporativo)', 'pt-BR': 'Mais de R$500 (corporativo)' }, emoji: '🏆' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 3. Cliente ideal
  {
    id: 'LIB_Q05_CLIENTE_PRINCIPAL',
    category: 'customer',
    mode: 'quick',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Quién es tu cliente principal?',
      'pt-BR': 'Quem é seu cliente principal?'
    },
    type: 'single',
    options: [
      { id: 'estudiantes', label: { es: 'Estudiantes (primaria a universidad)', 'pt-BR': 'Estudantes (primário a universidade)' }, emoji: '🎓' },
      { id: 'padres', label: { es: 'Padres comprando para hijos', 'pt-BR': 'Pais comprando para filhos' }, emoji: '👨‍👩‍👧' },
      { id: 'profesionales', label: { es: 'Profesionales/oficinistas', 'pt-BR': 'Profissionais/escritório' }, emoji: '💼' },
      { id: 'empresas', label: { es: 'Empresas e instituciones', 'pt-BR': 'Empresas e instituições' }, emoji: '🏢' },
      { id: 'lectores', label: { es: 'Lectores ávidos', 'pt-BR': 'Leitores ávidos' }, emoji: '📖' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 4. Ventas y conversión
  {
    id: 'LIB_Q06_TRANSACCIONES_DIA',
    category: 'sales',
    mode: 'quick',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuántas transacciones realizas en un día promedio?',
      'pt-BR': 'Quantas transações você realiza em um dia médio?'
    },
    type: 'single',
    options: [
      { id: 'muy_bajo', label: { es: 'Menos de 20', 'pt-BR': 'Menos de 20' }, emoji: '📉' },
      { id: 'bajo', label: { es: '20-50', 'pt-BR': '20-50' }, emoji: '📊' },
      { id: 'medio', label: { es: '50-100', 'pt-BR': '50-100' }, emoji: '📈' },
      { id: 'alto', label: { es: '100-200', 'pt-BR': '100-200' }, emoji: '🚀' },
      { id: 'muy_alto', label: { es: 'Más de 200', 'pt-BR': 'Mais de 200' }, emoji: '⭐' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 5. Finanzas
  {
    id: 'LIB_Q07_MARGEN_PROMEDIO',
    category: 'finances',
    mode: 'quick',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu margen bruto promedio?',
      'pt-BR': 'Qual é sua margem bruta média?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '📉' },
      { id: 'medio_bajo', label: { es: '20-30%', 'pt-BR': '20-30%' }, emoji: '📊' },
      { id: 'medio', label: { es: '30-40%', 'pt-BR': '30-40%' }, emoji: '📈' },
      { id: 'alto', label: { es: '40-50%', 'pt-BR': '40-50%' }, emoji: '💰' },
      { id: 'muy_alto', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '💎' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 6. Operaciones
  {
    id: 'LIB_Q08_PROVEEDORES',
    category: 'operations',
    mode: 'quick',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Con cuántos proveedores trabajás regularmente?',
      'pt-BR': 'Com quantos fornecedores você trabalha regularmente?'
    },
    type: 'single',
    options: [
      { id: 'pocos', label: { es: '1-5 proveedores principales', 'pt-BR': '1-5 fornecedores principais' }, emoji: '🤝' },
      { id: 'moderado', label: { es: '6-15 proveedores', 'pt-BR': '6-15 fornecedores' }, emoji: '📦' },
      { id: 'muchos', label: { es: '16-30 proveedores', 'pt-BR': '16-30 fornecedores' }, emoji: '🏭' },
      { id: 'muy_muchos', label: { es: 'Más de 30 proveedores', 'pt-BR': 'Mais de 30 fornecedores' }, emoji: '🌐' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 7. Marketing
  {
    id: 'LIB_Q09_CAPTACION',
    category: 'marketing',
    mode: 'quick',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cómo llegan la mayoría de tus clientes nuevos?',
      'pt-BR': 'Como chegam a maioria de seus novos clientes?'
    },
    type: 'single',
    options: [
      { id: 'ubicacion', label: { es: 'Por la ubicación/paso', 'pt-BR': 'Pela localização/passagem' }, emoji: '📍' },
      { id: 'boca_boca', label: { es: 'Recomendación boca a boca', 'pt-BR': 'Recomendação boca a boca' }, emoji: '🗣️' },
      { id: 'escuelas', label: { es: 'Convenios con escuelas/empresas', 'pt-BR': 'Convênios com escolas/empresas' }, emoji: '🏫' },
      { id: 'redes', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
      { id: 'google', label: { es: 'Búsqueda en Google/Maps', 'pt-BR': 'Busca no Google/Maps' }, emoji: '🔍' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 8. Equipo
  {
    id: 'LIB_Q10_EQUIPO',
    category: 'team',
    mode: 'quick',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuántas personas trabajan en tu librería?',
      'pt-BR': 'Quantas pessoas trabalham na sua livraria?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
      { id: 'familiar', label: { es: '2-3 (familiar)', 'pt-BR': '2-3 (familiar)' }, emoji: '👨‍👩‍👧' },
      { id: 'pequeno', label: { es: '4-6 empleados', 'pt-BR': '4-6 funcionários' }, emoji: '👥' },
      { id: 'mediano', label: { es: '7-12 empleados', 'pt-BR': '7-12 funcionários' }, emoji: '👨‍💼' },
      { id: 'grande', label: { es: 'Más de 12', 'pt-BR': 'Mais de 12' }, emoji: '🏢' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 9. Tecnología
  {
    id: 'LIB_Q11_SISTEMA',
    category: 'technology',
    mode: 'quick',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Qué sistema usás para gestionar ventas e inventario?',
      'pt-BR': 'Qual sistema você usa para gerenciar vendas e estoque?'
    },
    type: 'single',
    options: [
      { id: 'manual', label: { es: 'Manual/planillas Excel', 'pt-BR': 'Manual/planilhas Excel' }, emoji: '📝' },
      { id: 'pos_basico', label: { es: 'Sistema POS básico', 'pt-BR': 'Sistema POS básico' }, emoji: '💻' },
      { id: 'pos_completo', label: { es: 'Sistema POS con inventario', 'pt-BR': 'Sistema POS com estoque' }, emoji: '🖥️' },
      { id: 'erp', label: { es: 'ERP completo', 'pt-BR': 'ERP completo' }, emoji: '⚙️' },
      { id: 'multiple', label: { es: 'Múltiples sistemas integrados', 'pt-BR': 'Múltiplos sistemas integrados' }, emoji: '🔗' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 10. Objetivos
  {
    id: 'LIB_Q12_OBJETIVO',
    category: 'goals',
    mode: 'quick',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es tu principal objetivo para este año?',
      'pt-BR': 'Qual é seu principal objetivo para este ano?'
    },
    type: 'single',
    options: [
      { id: 'ventas', label: { es: 'Aumentar ventas', 'pt-BR': 'Aumentar vendas' }, emoji: '📈' },
      { id: 'margen', label: { es: 'Mejorar márgenes', 'pt-BR': 'Melhorar margens' }, emoji: '💰' },
      { id: 'online', label: { es: 'Desarrollar canal online', 'pt-BR': 'Desenvolver canal online' }, emoji: '🛒' },
      { id: 'expansion', label: { es: 'Abrir otra sucursal', 'pt-BR': 'Abrir outra filial' }, emoji: '🏪' },
      { id: 'eficiencia', label: { es: 'Mejorar eficiencia operativa', 'pt-BR': 'Melhorar eficiência operacional' }, emoji: '⚡' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // 11. Estacionalidad
  {
    id: 'LIB_Q13_ESTACIONALIDAD',
    category: 'risks',
    mode: 'quick',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuál es tu temporada más fuerte?',
      'pt-BR': 'Qual é sua temporada mais forte?'
    },
    type: 'single',
    options: [
      { id: 'vuelta_clases', label: { es: 'Vuelta a clases (feb-mar)', 'pt-BR': 'Volta às aulas (jan-fev)' }, emoji: '🎒' },
      { id: 'fin_ano', label: { es: 'Fin de año/Navidad', 'pt-BR': 'Fim de ano/Natal' }, emoji: '🎄' },
      { id: 'todo_ano', label: { es: 'Bastante parejo todo el año', 'pt-BR': 'Bastante uniforme todo o ano' }, emoji: '📊' },
      { id: 'corporativo', label: { es: 'Depende de contratos corporativos', 'pt-BR': 'Depende de contratos corporativos' }, emoji: '📋' }
    ],
    required: true,
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // ========== COMPLETE MODE (68-75 preguntas adicionales) ==========

  // Identidad profunda
  {
    id: 'LIB_C01_DIFERENCIADOR',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Qué te diferencia de otras librerías de la zona?',
      'pt-BR': 'O que te diferencia de outras livrarias da região?'
    },
    type: 'multi',
    options: [
      { id: 'variedad', label: { es: 'Mayor variedad de títulos', 'pt-BR': 'Maior variedade de títulos' }, emoji: '📚' },
      { id: 'precios', label: { es: 'Mejores precios', 'pt-BR': 'Melhores preços' }, emoji: '💰' },
      { id: 'atencion', label: { es: 'Atención personalizada', 'pt-BR': 'Atendimento personalizado' }, emoji: '🤝' },
      { id: 'ubicacion', label: { es: 'Ubicación privilegiada', 'pt-BR': 'Localização privilegiada' }, emoji: '📍' },
      { id: 'servicios', label: { es: 'Servicios adicionales (fotocopias, etc)', 'pt-BR': 'Serviços adicionais (fotocópias, etc)' }, emoji: '📄' },
      { id: 'especializacion', label: { es: 'Especialización en un nicho', 'pt-BR': 'Especialização em um nicho' }, emoji: '🎯' },
      { id: 'credito', label: { es: 'Facilidades de pago/crédito', 'pt-BR': 'Facilidades de pagamento/crédito' }, emoji: '💳' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C02_METROS',
    category: 'identity',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Cuántos metros cuadrados tiene tu local?',
      'pt-BR': 'Quantos metros quadrados tem seu local?'
    },
    type: 'single',
    options: [
      { id: 'pequeno', label: { es: 'Menos de 30m²', 'pt-BR': 'Menos de 30m²' }, emoji: '🏠' },
      { id: 'mediano_chico', label: { es: '30-60m²', 'pt-BR': '30-60m²' }, emoji: '🏪' },
      { id: 'mediano', label: { es: '60-120m²', 'pt-BR': '60-120m²' }, emoji: '🏬' },
      { id: 'grande', label: { es: '120-250m²', 'pt-BR': '120-250m²' }, emoji: '🏢' },
      { id: 'muy_grande', label: { es: 'Más de 250m²', 'pt-BR': 'Mais de 250m²' }, emoji: '🏛️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C03_SUCURSALES',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Cuántas sucursales tenés?',
      'pt-BR': 'Quantas filiais você tem?'
    },
    type: 'single',
    options: [
      { id: 'una', label: { es: 'Solo una ubicación', 'pt-BR': 'Só uma localização' }, emoji: '📍' },
      { id: 'dos', label: { es: '2 sucursales', 'pt-BR': '2 filiais' }, emoji: '📍📍' },
      { id: 'tres_cinco', label: { es: '3-5 sucursales', 'pt-BR': '3-5 filiais' }, emoji: '🏪' },
      { id: 'mas_cinco', label: { es: 'Más de 5 sucursales', 'pt-BR': 'Mais de 5 filiais' }, emoji: '🏢' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Oferta detallada
  {
    id: 'LIB_C04_CATEGORIAS_LIBROS',
    category: 'offering',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué categorías de libros vendés más?',
      'pt-BR': 'Quais categorias de livros você mais vende?'
    },
    type: 'multi',
    options: [
      { id: 'escolares', label: { es: 'Libros escolares/manuales', 'pt-BR': 'Livros escolares/manuais' }, emoji: '📖' },
      { id: 'universitarios', label: { es: 'Textos universitarios', 'pt-BR': 'Textos universitários' }, emoji: '🎓' },
      { id: 'ficcion', label: { es: 'Ficción/novelas', 'pt-BR': 'Ficção/romances' }, emoji: '📕' },
      { id: 'infantil', label: { es: 'Infantil/juvenil', 'pt-BR': 'Infantil/juvenil' }, emoji: '🧒' },
      { id: 'autoayuda', label: { es: 'Autoayuda/desarrollo personal', 'pt-BR': 'Autoajuda/desenvolvimento pessoal' }, emoji: '🧠' },
      { id: 'tecnico', label: { es: 'Técnico/profesional', 'pt-BR': 'Técnico/profissional' }, emoji: '⚙️' },
      { id: 'arte', label: { es: 'Arte/diseño/fotografía', 'pt-BR': 'Arte/design/fotografia' }, emoji: '🎨' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C05_CATEGORIAS_PAPELERIA',
    category: 'offering',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Qué productos de papelería tienen mejor rotación?',
      'pt-BR': 'Quais produtos de papelaria têm melhor rotação?'
    },
    type: 'multi',
    options: [
      { id: 'cuadernos', label: { es: 'Cuadernos/libretas', 'pt-BR': 'Cadernos/agendas' }, emoji: '📓' },
      { id: 'escritura', label: { es: 'Instrumentos de escritura', 'pt-BR': 'Instrumentos de escrita' }, emoji: '✏️' },
      { id: 'arte', label: { es: 'Materiales de arte', 'pt-BR': 'Materiais de arte' }, emoji: '🎨' },
      { id: 'oficina', label: { es: 'Insumos de oficina', 'pt-BR': 'Insumos de escritório' }, emoji: '📎' },
      { id: 'mochilas', label: { es: 'Mochilas/cartucheras', 'pt-BR': 'Mochilas/estojos' }, emoji: '🎒' },
      { id: 'tecnologia', label: { es: 'Accesorios tecnología', 'pt-BR': 'Acessórios tecnologia' }, emoji: '💻' },
      { id: 'regaleria', label: { es: 'Regalería/souvenirs', 'pt-BR': 'Presentes/souvenirs' }, emoji: '🎁' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C06_SERVICIOS',
    category: 'offering',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué servicios adicionales ofrecés?',
      'pt-BR': 'Quais serviços adicionais você oferece?'
    },
    type: 'multi',
    options: [
      { id: 'fotocopias', label: { es: 'Fotocopias/impresiones', 'pt-BR': 'Fotocópias/impressões' }, emoji: '📄' },
      { id: 'encuadernado', label: { es: 'Encuadernado/anillado', 'pt-BR': 'Encadernação/espiral' }, emoji: '📚' },
      { id: 'plastificado', label: { es: 'Plastificado/laminado', 'pt-BR': 'Plastificação/laminação' }, emoji: '✨' },
      { id: 'sellos', label: { es: 'Sellos personalizados', 'pt-BR': 'Carimbos personalizados' }, emoji: '🔖' },
      { id: 'tarjetas', label: { es: 'Tarjetas/invitaciones', 'pt-BR': 'Cartões/convites' }, emoji: '💌' },
      { id: 'pedidos', label: { es: 'Pedidos especiales de libros', 'pt-BR': 'Pedidos especiais de livros' }, emoji: '📦' },
      { id: 'ninguno', label: { es: 'Solo venta de productos', 'pt-BR': 'Só venda de produtos' }, emoji: '🏪' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C07_SKU_COUNT',
    category: 'offering',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Aproximadamente cuántos SKUs (productos únicos) manejás?',
      'pt-BR': 'Aproximadamente quantos SKUs (produtos únicos) você gerencia?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos de 1,000', 'pt-BR': 'Menos de 1.000' }, emoji: '📦' },
      { id: 'medio', label: { es: '1,000-5,000', 'pt-BR': '1.000-5.000' }, emoji: '📚' },
      { id: 'alto', label: { es: '5,000-15,000', 'pt-BR': '5.000-15.000' }, emoji: '🏪' },
      { id: 'muy_alto', label: { es: '15,000-30,000', 'pt-BR': '15.000-30.000' }, emoji: '🏬' },
      { id: 'masivo', label: { es: 'Más de 30,000', 'pt-BR': 'Mais de 30.000' }, emoji: '🏛️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C08_MARCAS_EXCLUSIVAS',
    category: 'offering',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Tenés marcas exclusivas o representaciones?',
      'pt-BR': 'Você tem marcas exclusivas ou representações?'
    },
    type: 'single',
    options: [
      { id: 'si_varias', label: { es: 'Sí, varias marcas exclusivas', 'pt-BR': 'Sim, várias marcas exclusivas' }, emoji: '⭐' },
      { id: 'si_pocas', label: { es: 'Algunas representaciones', 'pt-BR': 'Algumas representações' }, emoji: '🏷️' },
      { id: 'no', label: { es: 'No, trabajo con distribuidores', 'pt-BR': 'Não, trabalho com distribuidores' }, emoji: '📦' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Clientes detallado
  {
    id: 'LIB_C09_SEGMENTO_EDAD',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué rango de edad predomina entre tus clientes?',
      'pt-BR': 'Qual faixa etária predomina entre seus clientes?'
    },
    type: 'single',
    options: [
      { id: 'ninos', label: { es: 'Niños (primaria)', 'pt-BR': 'Crianças (primário)' }, emoji: '🧒' },
      { id: 'adolescentes', label: { es: 'Adolescentes (secundaria)', 'pt-BR': 'Adolescentes (secundário)' }, emoji: '🎒' },
      { id: 'jovenes', label: { es: 'Jóvenes (18-25)', 'pt-BR': 'Jovens (18-25)' }, emoji: '🎓' },
      { id: 'adultos', label: { es: 'Adultos (25-50)', 'pt-BR': 'Adultos (25-50)' }, emoji: '👨‍💼' },
      { id: 'mayores', label: { es: 'Adultos mayores (50+)', 'pt-BR': 'Adultos maiores (50+)' }, emoji: '👴' },
      { id: 'mixto', label: { es: 'Muy variado', 'pt-BR': 'Muito variado' }, emoji: '👥' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C10_CLIENTES_B2B',
    category: 'customer',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué porcentaje de tus ventas son a empresas/instituciones?',
      'pt-BR': 'Qual porcentagem de suas vendas são para empresas/instituições?'
    },
    type: 'single',
    options: [
      { id: 'nada', label: { es: 'Menos del 5%', 'pt-BR': 'Menos de 5%' }, emoji: '👤' },
      { id: 'poco', label: { es: '5-20%', 'pt-BR': '5-20%' }, emoji: '🏠' },
      { id: 'moderado', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '🏢' },
      { id: 'alto', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '🏛️' },
      { id: 'mayoria', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🏭' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C11_FRECUENCIA_COMPRA',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Con qué frecuencia vuelven tus clientes habituales?',
      'pt-BR': 'Com que frequência seus clientes habituais voltam?'
    },
    type: 'single',
    options: [
      { id: 'semanal', label: { es: 'Semanalmente', 'pt-BR': 'Semanalmente' }, emoji: '📅' },
      { id: 'quincenal', label: { es: 'Cada 2 semanas', 'pt-BR': 'A cada 2 semanas' }, emoji: '📆' },
      { id: 'mensual', label: { es: 'Mensualmente', 'pt-BR': 'Mensalmente' }, emoji: '🗓️' },
      { id: 'trimestral', label: { es: 'Cada 2-3 meses', 'pt-BR': 'A cada 2-3 meses' }, emoji: '📊' },
      { id: 'estacional', label: { es: 'Solo en temporadas (clases)', 'pt-BR': 'Só em temporadas (aulas)' }, emoji: '🎒' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C12_CONVENIOS',
    category: 'customer',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Tenés convenios con instituciones educativas?',
      'pt-BR': 'Você tem convênios com instituições educacionais?'
    },
    type: 'single',
    options: [
      { id: 'varios', label: { es: 'Sí, con varias escuelas/colegios', 'pt-BR': 'Sim, com várias escolas/colégios' }, emoji: '🏫' },
      { id: 'pocos', label: { es: 'Algunos convenios', 'pt-BR': 'Alguns convênios' }, emoji: '📋' },
      { id: 'informal', label: { es: 'Relaciones informales', 'pt-BR': 'Relações informais' }, emoji: '🤝' },
      { id: 'no', label: { es: 'No tengo convenios', 'pt-BR': 'Não tenho convênios' }, emoji: '❌' },
      { id: 'buscando', label: { es: 'Estoy buscando establecerlos', 'pt-BR': 'Estou buscando estabelecê-los' }, emoji: '🔍' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Ventas detallado
  {
    id: 'LIB_C13_CANALES_VENTA',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿A través de qué canales vendés?',
      'pt-BR': 'Através de quais canais você vende?'
    },
    type: 'multi',
    options: [
      { id: 'local', label: { es: 'Local físico', 'pt-BR': 'Loja física' }, emoji: '🏪' },
      { id: 'whatsapp', label: { es: 'WhatsApp/pedidos', 'pt-BR': 'WhatsApp/pedidos' }, emoji: '📱' },
      { id: 'web_propia', label: { es: 'Tienda online propia', 'pt-BR': 'Loja online própria' }, emoji: '🌐' },
      { id: 'marketplace', label: { es: 'Marketplaces (ML, etc)', 'pt-BR': 'Marketplaces (ML, etc)' }, emoji: '🛒' },
      { id: 'delivery', label: { es: 'Delivery propio', 'pt-BR': 'Delivery próprio' }, emoji: '🚚' },
      { id: 'corporativo', label: { es: 'Venta corporativa directa', 'pt-BR': 'Venda corporativa direta' }, emoji: '💼' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C14_FACTURACION_MENSUAL',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es tu facturación mensual promedio?',
      'pt-BR': 'Qual é seu faturamento mensal médio?'
    },
    type: 'single',
    options: [
      { id: 'micro', label: { es: 'Menos de $5,000 USD', 'pt-BR': 'Menos de R$25.000' }, emoji: '🌱' },
      { id: 'pequeno', label: { es: '$5,000-15,000 USD', 'pt-BR': 'R$25.000-75.000' }, emoji: '📈' },
      { id: 'mediano', label: { es: '$15,000-40,000 USD', 'pt-BR': 'R$75.000-200.000' }, emoji: '💰' },
      { id: 'grande', label: { es: '$40,000-100,000 USD', 'pt-BR': 'R$200.000-500.000' }, emoji: '💎' },
      { id: 'muy_grande', label: { es: 'Más de $100,000 USD', 'pt-BR': 'Mais de R$500.000' }, emoji: '🏆' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C15_METODOS_PAGO',
    category: 'sales',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Qué métodos de pago aceptás?',
      'pt-BR': 'Quais métodos de pagamento você aceita?'
    },
    type: 'multi',
    options: [
      { id: 'efectivo', label: { es: 'Efectivo', 'pt-BR': 'Dinheiro' }, emoji: '💵' },
      { id: 'debito', label: { es: 'Tarjeta débito', 'pt-BR': 'Cartão débito' }, emoji: '💳' },
      { id: 'credito', label: { es: 'Tarjeta crédito', 'pt-BR': 'Cartão crédito' }, emoji: '💳' },
      { id: 'transferencia', label: { es: 'Transferencia bancaria', 'pt-BR': 'Transferência bancária' }, emoji: '🏦' },
      { id: 'qr', label: { es: 'QR/billeteras digitales', 'pt-BR': 'QR/carteiras digitais' }, emoji: '📱' },
      { id: 'cuotas', label: { es: 'Cuotas sin interés', 'pt-BR': 'Parcelamento sem juros' }, emoji: '📊' },
      { id: 'cuenta_corriente', label: { es: 'Cuenta corriente empresas', 'pt-BR': 'Conta corrente empresas' }, emoji: '📋' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C16_CONVERSION',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: 'De cada 10 personas que entran, ¿cuántas compran?',
      'pt-BR': 'De cada 10 pessoas que entram, quantas compram?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: '2-3 de cada 10', 'pt-BR': '2-3 de cada 10' }, emoji: '📉' },
      { id: 'medio', label: { es: '4-5 de cada 10', 'pt-BR': '4-5 de cada 10' }, emoji: '📊' },
      { id: 'alto', label: { es: '6-7 de cada 10', 'pt-BR': '6-7 de cada 10' }, emoji: '📈' },
      { id: 'muy_alto', label: { es: '8-9 de cada 10', 'pt-BR': '8-9 de cada 10' }, emoji: '🚀' },
      { id: 'casi_todos', label: { es: 'Casi todos compran algo', 'pt-BR': 'Quase todos compram algo' }, emoji: '⭐' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Finanzas detallado
  {
    id: 'LIB_C17_MARGEN_LIBROS',
    category: 'finances',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es tu margen promedio en libros?',
      'pt-BR': 'Qual é sua margem média em livros?'
    },
    type: 'single',
    options: [
      { id: 'muy_bajo', label: { es: 'Menos del 15%', 'pt-BR': 'Menos de 15%' }, emoji: '📉' },
      { id: 'bajo', label: { es: '15-25%', 'pt-BR': '15-25%' }, emoji: '📊' },
      { id: 'medio', label: { es: '25-35%', 'pt-BR': '25-35%' }, emoji: '📈' },
      { id: 'alto', label: { es: '35-45%', 'pt-BR': '35-45%' }, emoji: '💰' },
      { id: 'muy_alto', label: { es: 'Más del 45%', 'pt-BR': 'Mais de 45%' }, emoji: '💎' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C18_MARGEN_PAPELERIA',
    category: 'finances',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es tu margen promedio en papelería?',
      'pt-BR': 'Qual é sua margem média em papelaria?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, emoji: '📉' },
      { id: 'medio_bajo', label: { es: '25-35%', 'pt-BR': '25-35%' }, emoji: '📊' },
      { id: 'medio', label: { es: '35-50%', 'pt-BR': '35-50%' }, emoji: '📈' },
      { id: 'alto', label: { es: '50-65%', 'pt-BR': '50-65%' }, emoji: '💰' },
      { id: 'muy_alto', label: { es: 'Más del 65%', 'pt-BR': 'Mais de 65%' }, emoji: '💎' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C19_COSTOS_FIJOS',
    category: 'finances',
    mode: 'complete',
    dimension: 'finances',
    weight: 8,
    title: {
      es: '¿Cuáles son tus principales costos fijos?',
      'pt-BR': 'Quais são seus principais custos fixos?'
    },
    type: 'multi',
    options: [
      { id: 'alquiler', label: { es: 'Alquiler del local', 'pt-BR': 'Aluguel do local' }, emoji: '🏠' },
      { id: 'sueldos', label: { es: 'Sueldos empleados', 'pt-BR': 'Salários funcionários' }, emoji: '👥' },
      { id: 'servicios', label: { es: 'Servicios (luz, internet)', 'pt-BR': 'Serviços (luz, internet)' }, emoji: '💡' },
      { id: 'sistema', label: { es: 'Software/sistemas', 'pt-BR': 'Software/sistemas' }, emoji: '💻' },
      { id: 'impuestos', label: { es: 'Impuestos y tasas', 'pt-BR': 'Impostos e taxas' }, emoji: '📋' },
      { id: 'financieros', label: { es: 'Costos financieros', 'pt-BR': 'Custos financeiros' }, emoji: '🏦' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C20_RENTABILIDAD',
    category: 'finances',
    mode: 'complete',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu rentabilidad neta mensual aproximada?',
      'pt-BR': 'Qual é sua rentabilidade líquida mensal aproximada?'
    },
    type: 'single',
    options: [
      { id: 'negativa', label: { es: 'Estoy perdiendo dinero', 'pt-BR': 'Estou perdendo dinheiro' }, emoji: '📉' },
      { id: 'equilibrio', label: { es: 'Apenas cubro costos', 'pt-BR': 'Apenas cubro custos' }, emoji: '⚖️' },
      { id: 'baja', label: { es: '1-5% de rentabilidad', 'pt-BR': '1-5% de rentabilidade' }, emoji: '📊' },
      { id: 'media', label: { es: '5-10% de rentabilidad', 'pt-BR': '5-10% de rentabilidade' }, emoji: '📈' },
      { id: 'buena', label: { es: '10-15% de rentabilidad', 'pt-BR': '10-15% de rentabilidade' }, emoji: '💰' },
      { id: 'excelente', label: { es: 'Más del 15%', 'pt-BR': 'Mais de 15%' }, emoji: '💎' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C21_CREDITO_PROVEEDORES',
    category: 'finances',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Qué plazo de crédito te dan tus proveedores principales?',
      'pt-BR': 'Qual prazo de crédito seus fornecedores principais dão?'
    },
    type: 'single',
    options: [
      { id: 'contado', label: { es: 'Contado/anticipado', 'pt-BR': 'À vista/antecipado' }, emoji: '💵' },
      { id: '15_dias', label: { es: '15 días', 'pt-BR': '15 dias' }, emoji: '📅' },
      { id: '30_dias', label: { es: '30 días', 'pt-BR': '30 dias' }, emoji: '📆' },
      { id: '45_60', label: { es: '45-60 días', 'pt-BR': '45-60 dias' }, emoji: '🗓️' },
      { id: '90_mas', label: { es: '90 días o más', 'pt-BR': '90 dias ou mais' }, emoji: '📊' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Operaciones detallado
  {
    id: 'LIB_C22_ROTACION_INVENTARIO',
    category: 'operations',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cada cuánto rotás tu inventario completo?',
      'pt-BR': 'A cada quanto você gira seu estoque completo?'
    },
    type: 'single',
    options: [
      { id: 'mensual', label: { es: 'Mensualmente', 'pt-BR': 'Mensalmente' }, emoji: '🚀' },
      { id: 'bimestral', label: { es: 'Cada 2 meses', 'pt-BR': 'A cada 2 meses' }, emoji: '📈' },
      { id: 'trimestral', label: { es: 'Cada 3 meses', 'pt-BR': 'A cada 3 meses' }, emoji: '📊' },
      { id: 'semestral', label: { es: 'Cada 6 meses', 'pt-BR': 'A cada 6 meses' }, emoji: '📉' },
      { id: 'anual', label: { es: 'Una vez al año o más', 'pt-BR': 'Uma vez ao ano ou mais' }, emoji: '⏳' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C23_STOCK_MUERTO',
    category: 'operations',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Qué porcentaje de tu inventario es stock de baja rotación?',
      'pt-BR': 'Qual porcentagem do seu estoque é de baixa rotação?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '✅' },
      { id: 'moderado', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '📊' },
      { id: 'alto', label: { es: '20-35%', 'pt-BR': '20-35%' }, emoji: '⚠️' },
      { id: 'muy_alto', label: { es: 'Más del 35%', 'pt-BR': 'Mais de 35%' }, emoji: '🚨' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C24_REPOSICION',
    category: 'operations',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cómo gestionás la reposición de stock?',
      'pt-BR': 'Como você gerencia a reposição de estoque?'
    },
    type: 'single',
    options: [
      { id: 'automatico', label: { es: 'Sistema automático con alertas', 'pt-BR': 'Sistema automático com alertas' }, emoji: '🤖' },
      { id: 'manual_sistema', label: { es: 'Revisión manual en sistema', 'pt-BR': 'Revisão manual no sistema' }, emoji: '💻' },
      { id: 'visual', label: { es: 'Control visual del stock', 'pt-BR': 'Controle visual do estoque' }, emoji: '👁️' },
      { id: 'proveedor', label: { es: 'El proveedor sugiere pedidos', 'pt-BR': 'O fornecedor sugere pedidos' }, emoji: '📦' },
      { id: 'intuicion', label: { es: 'Por intuición/experiencia', 'pt-BR': 'Por intuição/experiência' }, emoji: '🧠' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C25_HORARIO',
    category: 'operations',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Cuál es tu horario de atención?',
      'pt-BR': 'Qual é seu horário de atendimento?'
    },
    type: 'single',
    options: [
      { id: 'comercial', label: { es: 'Horario comercial (9-18h)', 'pt-BR': 'Horário comercial (9-18h)' }, emoji: '🏢' },
      { id: 'extendido', label: { es: 'Horario extendido (8-20h)', 'pt-BR': 'Horário estendido (8-20h)' }, emoji: '⏰' },
      { id: 'corrido', label: { es: 'Corrido sin cierre al mediodía', 'pt-BR': 'Corrido sem fechar ao meio-dia' }, emoji: '📅' },
      { id: 'sabados', label: { es: 'Incluye sábados', 'pt-BR': 'Inclui sábados' }, emoji: '📆' },
      { id: 'fines_semana', label: { es: 'Abierto fines de semana', 'pt-BR': 'Aberto fins de semana' }, emoji: '🗓️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Marketing detallado
  {
    id: 'LIB_C26_PRESENCIA_DIGITAL',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué presencia digital tenés?',
      'pt-BR': 'Qual presença digital você tem?'
    },
    type: 'multi',
    options: [
      { id: 'google', label: { es: 'Google My Business', 'pt-BR': 'Google Meu Negócio' }, emoji: '🔍' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘' },
      { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸' },
      { id: 'web', label: { es: 'Sitio web propio', 'pt-BR': 'Site próprio' }, emoji: '🌐' },
      { id: 'whatsapp', label: { es: 'WhatsApp Business', 'pt-BR': 'WhatsApp Business' }, emoji: '📱' },
      { id: 'ninguna', label: { es: 'Muy poca o ninguna', 'pt-BR': 'Muito pouca ou nenhuma' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C27_PROMOCIONES',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Qué tipo de promociones hacés?',
      'pt-BR': 'Que tipo de promoções você faz?'
    },
    type: 'multi',
    options: [
      { id: 'vuelta_clases', label: { es: 'Ofertas vuelta a clases', 'pt-BR': 'Ofertas volta às aulas' }, emoji: '🎒' },
      { id: 'descuentos', label: { es: 'Descuentos por cantidad', 'pt-BR': 'Descontos por quantidade' }, emoji: '💰' },
      { id: 'liquidacion', label: { es: 'Liquidaciones de temporada', 'pt-BR': 'Liquidações de temporada' }, emoji: '🏷️' },
      { id: 'combo', label: { es: 'Combos/packs', 'pt-BR': 'Combos/packs' }, emoji: '📦' },
      { id: 'fidelidad', label: { es: 'Programa de fidelidad', 'pt-BR': 'Programa de fidelidade' }, emoji: '⭐' },
      { id: 'ninguna', label: { es: 'No hago promociones', 'pt-BR': 'Não faço promoções' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C28_PUBLICIDAD',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Invertís en publicidad?',
      'pt-BR': 'Você investe em publicidade?'
    },
    type: 'single',
    options: [
      { id: 'nada', label: { es: 'No invierto en publicidad', 'pt-BR': 'Não invisto em publicidade' }, emoji: '❌' },
      { id: 'poco', label: { es: 'Ocasionalmente, poco', 'pt-BR': 'Ocasionalmente, pouco' }, emoji: '💵' },
      { id: 'redes', label: { es: 'Principalmente en redes sociales', 'pt-BR': 'Principalmente em redes sociais' }, emoji: '📱' },
      { id: 'local', label: { es: 'Publicidad local (volantes, radio)', 'pt-BR': 'Publicidade local (folhetos, rádio)' }, emoji: '📻' },
      { id: 'significativo', label: { es: 'Tengo presupuesto mensual fijo', 'pt-BR': 'Tenho orçamento mensal fixo' }, emoji: '📊' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Retención y CX
  {
    id: 'LIB_C29_FIDELIZACION',
    category: 'retention',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Tenés programa de fidelización?',
      'pt-BR': 'Você tem programa de fidelização?'
    },
    type: 'single',
    options: [
      { id: 'digital', label: { es: 'Sí, sistema digital de puntos', 'pt-BR': 'Sim, sistema digital de pontos' }, emoji: '📱' },
      { id: 'tarjeta', label: { es: 'Tarjeta de sellos/físico', 'pt-BR': 'Cartão de selos/físico' }, emoji: '🎫' },
      { id: 'descuentos', label: { es: 'Descuentos a clientes frecuentes', 'pt-BR': 'Descontos para clientes frequentes' }, emoji: '💰' },
      { id: 'informal', label: { es: 'De manera informal', 'pt-BR': 'De maneira informal' }, emoji: '🤝' },
      { id: 'no', label: { es: 'No tengo programa', 'pt-BR': 'Não tenho programa' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C30_SATISFACCION',
    category: 'retention',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Cómo medís la satisfacción de tus clientes?',
      'pt-BR': 'Como você mede a satisfação dos seus clientes?'
    },
    type: 'single',
    options: [
      { id: 'encuestas', label: { es: 'Encuestas formales', 'pt-BR': 'Pesquisas formais' }, emoji: '📋' },
      { id: 'reviews', label: { es: 'Reviews en Google/redes', 'pt-BR': 'Avaliações no Google/redes' }, emoji: '⭐' },
      { id: 'verbal', label: { es: 'Feedback verbal directo', 'pt-BR': 'Feedback verbal direto' }, emoji: '🗣️' },
      { id: 'no_mido', label: { es: 'No lo mido formalmente', 'pt-BR': 'Não meço formalmente' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C31_QUEJAS',
    category: 'retention',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Cuáles son las quejas más frecuentes?',
      'pt-BR': 'Quais são as reclamações mais frequentes?'
    },
    type: 'multi',
    options: [
      { id: 'precios', label: { es: 'Precios altos', 'pt-BR': 'Preços altos' }, emoji: '💰' },
      { id: 'stock', label: { es: 'Falta de stock', 'pt-BR': 'Falta de estoque' }, emoji: '📦' },
      { id: 'variedad', label: { es: 'Poca variedad', 'pt-BR': 'Pouca variedade' }, emoji: '📚' },
      { id: 'atencion', label: { es: 'Demora en atención', 'pt-BR': 'Demora no atendimento' }, emoji: '⏰' },
      { id: 'espacio', label: { es: 'Local pequeño/desordenado', 'pt-BR': 'Local pequeno/desorganizado' }, emoji: '🏪' },
      { id: 'pocas', label: { es: 'Casi no tengo quejas', 'pt-BR': 'Quase não tenho reclamações' }, emoji: '✅' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Equipo detallado
  {
    id: 'LIB_C32_ROLES',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Qué roles tenés en tu equipo?',
      'pt-BR': 'Quais funções você tem na sua equipe?'
    },
    type: 'multi',
    options: [
      { id: 'vendedores', label: { es: 'Vendedores/atención', 'pt-BR': 'Vendedores/atendimento' }, emoji: '👥' },
      { id: 'cajero', label: { es: 'Cajero dedicado', 'pt-BR': 'Caixa dedicado' }, emoji: '💰' },
      { id: 'repositor', label: { es: 'Repositor/stock', 'pt-BR': 'Repositor/estoque' }, emoji: '📦' },
      { id: 'admin', label: { es: 'Administrativo', 'pt-BR': 'Administrativo' }, emoji: '💼' },
      { id: 'servicios', label: { es: 'Operador de servicios (copias)', 'pt-BR': 'Operador de serviços (cópias)' }, emoji: '📄' },
      { id: 'todos', label: { es: 'Todos hacen de todo', 'pt-BR': 'Todos fazem de tudo' }, emoji: '🔄' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C33_ROTACION_PERSONAL',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cuál es la rotación de personal?',
      'pt-BR': 'Qual é a rotatividade de pessoal?'
    },
    type: 'single',
    options: [
      { id: 'muy_baja', label: { es: 'Muy baja, equipo estable', 'pt-BR': 'Muito baixa, equipe estável' }, emoji: '✅' },
      { id: 'baja', label: { es: 'Baja, algún cambio ocasional', 'pt-BR': 'Baixa, alguma mudança ocasional' }, emoji: '📊' },
      { id: 'moderada', label: { es: 'Moderada, cambios cada año', 'pt-BR': 'Moderada, mudanças a cada ano' }, emoji: '📈' },
      { id: 'alta', label: { es: 'Alta, cuesta retener', 'pt-BR': 'Alta, custa reter' }, emoji: '⚠️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C34_CAPACITACION',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Cómo capacitás a tu equipo?',
      'pt-BR': 'Como você capacita sua equipe?'
    },
    type: 'single',
    options: [
      { id: 'formal', label: { es: 'Capacitación formal periódica', 'pt-BR': 'Capacitação formal periódica' }, emoji: '📚' },
      { id: 'proveedores', label: { es: 'Capacitaciones de proveedores', 'pt-BR': 'Capacitações de fornecedores' }, emoji: '🏭' },
      { id: 'practica', label: { es: 'Aprendizaje en la práctica', 'pt-BR': 'Aprendizagem na prática' }, emoji: '🎯' },
      { id: 'no', label: { es: 'No hay capacitación formal', 'pt-BR': 'Não há capacitação formal' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Tecnología detallada
  {
    id: 'LIB_C35_SOFTWARE_ESPECIFICO',
    category: 'technology',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Usás software específico para librerías?',
      'pt-BR': 'Você usa software específico para livrarias?'
    },
    type: 'single',
    options: [
      { id: 'especifico', label: { es: 'Sí, sistema especializado', 'pt-BR': 'Sim, sistema especializado' }, emoji: '📚' },
      { id: 'generico', label: { es: 'Sistema POS genérico', 'pt-BR': 'Sistema POS genérico' }, emoji: '💻' },
      { id: 'contable', label: { es: 'Solo sistema contable', 'pt-BR': 'Só sistema contábil' }, emoji: '📊' },
      { id: 'excel', label: { es: 'Planillas Excel', 'pt-BR': 'Planilhas Excel' }, emoji: '📝' },
      { id: 'manual', label: { es: 'Todo manual', 'pt-BR': 'Tudo manual' }, emoji: '✏️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C36_CODIGO_BARRAS',
    category: 'technology',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Usás sistema de código de barras?',
      'pt-BR': 'Você usa sistema de código de barras?'
    },
    type: 'single',
    options: [
      { id: 'completo', label: { es: 'Sí, todo tiene código', 'pt-BR': 'Sim, tudo tem código' }, emoji: '📊' },
      { id: 'parcial', label: { es: 'Solo algunos productos', 'pt-BR': 'Só alguns produtos' }, emoji: '📈' },
      { id: 'isbn', label: { es: 'Solo ISBN de libros', 'pt-BR': 'Só ISBN de livros' }, emoji: '📚' },
      { id: 'no', label: { es: 'No uso códigos de barras', 'pt-BR': 'Não uso códigos de barras' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C37_FACTURACION_ELECTRONICA',
    category: 'technology',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Cómo gestionás la facturación electrónica?',
      'pt-BR': 'Como você gerencia a nota fiscal eletrônica?'
    },
    type: 'single',
    options: [
      { id: 'integrado', label: { es: 'Integrada al POS', 'pt-BR': 'Integrada ao POS' }, emoji: '🔗' },
      { id: 'contador', label: { es: 'Lo hace mi contador', 'pt-BR': 'Meu contador faz' }, emoji: '👨‍💼' },
      { id: 'web', label: { es: 'Sistema web separado', 'pt-BR': 'Sistema web separado' }, emoji: '🌐' },
      { id: 'basica', label: { es: 'Solo cuando me lo piden', 'pt-BR': 'Só quando me pedem' }, emoji: '📋' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Competencia
  {
    id: 'LIB_C38_COMPETENCIA_DIRECTA',
    category: 'risks',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Cuántas librerías competidoras hay cerca?',
      'pt-BR': 'Quantas livrarias concorrentes há por perto?'
    },
    type: 'single',
    options: [
      { id: 'ninguna', label: { es: 'Ninguna en la zona', 'pt-BR': 'Nenhuma na região' }, emoji: '🏆' },
      { id: 'pocas', label: { es: '1-2 competidores', 'pt-BR': '1-2 concorrentes' }, emoji: '📊' },
      { id: 'moderada', label: { es: '3-5 competidores', 'pt-BR': '3-5 concorrentes' }, emoji: '📈' },
      { id: 'mucha', label: { es: 'Más de 5 competidores', 'pt-BR': 'Mais de 5 concorrentes' }, emoji: '⚠️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C39_AMENAZA_ONLINE',
    category: 'risks',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuánto te afecta la competencia online (Amazon, ML)?',
      'pt-BR': 'Quanto a concorrência online (Amazon, ML) te afeta?'
    },
    type: 'single',
    options: [
      { id: 'mucho', label: { es: 'Mucho, perdí clientes', 'pt-BR': 'Muito, perdi clientes' }, emoji: '📉' },
      { id: 'moderado', label: { es: 'Moderadamente', 'pt-BR': 'Moderadamente' }, emoji: '📊' },
      { id: 'poco', label: { es: 'Poco, mi cliente prefiere presencial', 'pt-BR': 'Pouco, meu cliente prefere presencial' }, emoji: '📈' },
      { id: 'nada', label: { es: 'No me afecta', 'pt-BR': 'Não me afeta' }, emoji: '✅' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Riesgos y desafíos
  {
    id: 'LIB_C40_MAYOR_DESAFIO',
    category: 'risks',
    mode: 'complete',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es tu mayor desafío actualmente?',
      'pt-BR': 'Qual é seu maior desafio atualmente?'
    },
    type: 'single',
    options: [
      { id: 'ventas', label: { es: 'Aumentar las ventas', 'pt-BR': 'Aumentar as vendas' }, emoji: '📈' },
      { id: 'margenes', label: { es: 'Mejorar los márgenes', 'pt-BR': 'Melhorar as margens' }, emoji: '💰' },
      { id: 'stock', label: { es: 'Gestión de inventario', 'pt-BR': 'Gestão de estoque' }, emoji: '📦' },
      { id: 'digital', label: { es: 'Transformación digital', 'pt-BR': 'Transformação digital' }, emoji: '💻' },
      { id: 'personal', label: { es: 'Encontrar buen personal', 'pt-BR': 'Encontrar bom pessoal' }, emoji: '👥' },
      { id: 'competencia', label: { es: 'Competencia (online/física)', 'pt-BR': 'Concorrência (online/física)' }, emoji: '⚔️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C41_VARIACION_VENTAS',
    category: 'risks',
    mode: 'complete',
    dimension: 'finances',
    weight: 8,
    title: {
      es: '¿Cuánto varían tus ventas entre temporada alta y baja?',
      'pt-BR': 'Quanto variam suas vendas entre temporada alta e baixa?'
    },
    type: 'single',
    options: [
      { id: 'poca', label: { es: 'Menos del 30% de diferencia', 'pt-BR': 'Menos de 30% de diferença' }, emoji: '📊' },
      { id: 'moderada', label: { es: '30-50% de diferencia', 'pt-BR': '30-50% de diferença' }, emoji: '📈' },
      { id: 'alta', label: { es: '50-100% de diferencia', 'pt-BR': '50-100% de diferença' }, emoji: '📉' },
      { id: 'muy_alta', label: { es: 'Más del 100% de diferencia', 'pt-BR': 'Mais de 100% de diferença' }, emoji: '⚠️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },

  // Preguntas adicionales para llegar a 68-75
  {
    id: 'LIB_C42_LIBROS_USADOS',
    category: 'offering',
    mode: 'complete',
    dimension: 'profitability',
    weight: 5,
    title: {
      es: '¿Vendés libros usados o de segunda mano?',
      'pt-BR': 'Você vende livros usados ou de segunda mão?'
    },
    type: 'single',
    options: [
      { id: 'si_importante', label: { es: 'Sí, es parte importante', 'pt-BR': 'Sim, é parte importante' }, emoji: '📚' },
      { id: 'si_poco', label: { es: 'Sí, pero poco', 'pt-BR': 'Sim, mas pouco' }, emoji: '📖' },
      { id: 'no', label: { es: 'No vendo usados', 'pt-BR': 'Não vendo usados' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C43_CONSIGNACION',
    category: 'operations',
    mode: 'complete',
    dimension: 'finances',
    weight: 6,
    title: {
      es: '¿Trabajás con libros en consignación?',
      'pt-BR': 'Você trabalha com livros em consignação?'
    },
    type: 'single',
    options: [
      { id: 'mayoria', label: { es: 'Sí, la mayoría', 'pt-BR': 'Sim, a maioria' }, emoji: '📚' },
      { id: 'algunos', label: { es: 'Algunos títulos', 'pt-BR': 'Alguns títulos' }, emoji: '📖' },
      { id: 'pocos', label: { es: 'Muy pocos', 'pt-BR': 'Muito poucos' }, emoji: '📕' },
      { id: 'no', label: { es: 'Compro todo en firme', 'pt-BR': 'Compro tudo em firme' }, emoji: '💰' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C44_EVENTOS',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Organizás eventos o actividades culturales?',
      'pt-BR': 'Você organiza eventos ou atividades culturais?'
    },
    type: 'single',
    options: [
      { id: 'frecuente', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🎭' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'no_interes', label: { es: 'No, pero me interesa', 'pt-BR': 'Não, mas me interessa' }, emoji: '🤔' },
      { id: 'no', label: { es: 'No organizo eventos', 'pt-BR': 'Não organizo eventos' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C45_DELIVERY',
    category: 'operations',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Ofrecés servicio de delivery?',
      'pt-BR': 'Você oferece serviço de delivery?'
    },
    type: 'single',
    options: [
      { id: 'propio', label: { es: 'Sí, con personal propio', 'pt-BR': 'Sim, com pessoal próprio' }, emoji: '🚚' },
      { id: 'terceros', label: { es: 'A través de apps/terceros', 'pt-BR': 'Através de apps/terceiros' }, emoji: '📱' },
      { id: 'empresas', label: { es: 'Solo para empresas/instituciones', 'pt-BR': 'Só para empresas/instituições' }, emoji: '🏢' },
      { id: 'no', label: { es: 'No ofrezco delivery', 'pt-BR': 'Não ofereço delivery' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C46_LISTAS_ESCOLARES',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Cómo gestionás las listas escolares?',
      'pt-BR': 'Como você gerencia as listas escolares?'
    },
    type: 'single',
    options: [
      { id: 'sistema', label: { es: 'Sistema automatizado', 'pt-BR': 'Sistema automatizado' }, emoji: '💻' },
      { id: 'convenio', label: { es: 'Convenio directo con escuelas', 'pt-BR': 'Convênio direto com escolas' }, emoji: '🏫' },
      { id: 'manual', label: { es: 'Gestión manual por lista', 'pt-BR': 'Gestão manual por lista' }, emoji: '📝' },
      { id: 'no_aplica', label: { es: 'No trabajo mucho con escolares', 'pt-BR': 'Não trabalho muito com escolares' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C47_IMPORTACION',
    category: 'operations',
    mode: 'complete',
    dimension: 'profitability',
    weight: 5,
    title: {
      es: '¿Importás productos directamente?',
      'pt-BR': 'Você importa produtos diretamente?'
    },
    type: 'single',
    options: [
      { id: 'si_regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '🌍' },
      { id: 'si_ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📦' },
      { id: 'no', label: { es: 'No, compro local', 'pt-BR': 'Não, compro local' }, emoji: '🏠' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C48_ECOMMERCE_PROPIO',
    category: 'technology',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Tenés tienda online propia funcionando?',
      'pt-BR': 'Você tem loja online própria funcionando?'
    },
    type: 'single',
    options: [
      { id: 'si_activa', label: { es: 'Sí, con ventas regulares', 'pt-BR': 'Sim, com vendas regulares' }, emoji: '🛒' },
      { id: 'si_poca', label: { es: 'Sí, pero con poca tracción', 'pt-BR': 'Sim, mas com pouca tração' }, emoji: '🌐' },
      { id: 'desarrollo', label: { es: 'En desarrollo', 'pt-BR': 'Em desenvolvimento' }, emoji: '🔧' },
      { id: 'no', label: { es: 'No tengo tienda online', 'pt-BR': 'Não tenho loja online' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C49_OBJETIVO_DIGITAL',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Cuál es tu objetivo principal en lo digital?',
      'pt-BR': 'Qual é seu objetivo principal no digital?'
    },
    type: 'single',
    options: [
      { id: 'vender_online', label: { es: 'Vender online', 'pt-BR': 'Vender online' }, emoji: '🛒' },
      { id: 'visibilidad', label: { es: 'Ganar visibilidad', 'pt-BR': 'Ganhar visibilidade' }, emoji: '👁️' },
      { id: 'comunicar', label: { es: 'Comunicar promociones', 'pt-BR': 'Comunicar promoções' }, emoji: '📢' },
      { id: 'no_prioridad', label: { es: 'No es prioridad ahora', 'pt-BR': 'Não é prioridade agora' }, emoji: '❌' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  },
  {
    id: 'LIB_C50_PROYECCION',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Dónde ves tu librería en 3 años?',
      'pt-BR': 'Onde você vê sua livraria em 3 anos?'
    },
    type: 'single',
    options: [
      { id: 'expansion', label: { es: 'Más sucursales/tamaño', 'pt-BR': 'Mais filiais/tamanho' }, emoji: '📈' },
      { id: 'online', label: { es: 'Fuerte presencia online', 'pt-BR': 'Forte presença online' }, emoji: '🌐' },
      { id: 'especializada', label: { es: 'Más especializada/nicho', 'pt-BR': 'Mais especializada/nicho' }, emoji: '🎯' },
      { id: 'mantener', label: { es: 'Mantener y optimizar', 'pt-BR': 'Manter e otimizar' }, emoji: '⚖️' },
      { id: 'vender', label: { es: 'Posiblemente venderla', 'pt-BR': 'Possivelmente vendê-la' }, emoji: '🏷️' }
    ],
    businessTypes: ['LIBRERIA_PAPELERIA']
  }
];

export default LIBRERIA_QUESTIONS;
