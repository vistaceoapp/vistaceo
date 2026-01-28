
# Plan: Completar todos los cuestionarios hiper-personalizados

## Resumen Ejecutivo
Completar los 180 cuestionarios de tipos de negocio (10 sectores × 18 tipos) en ambas versiones Quick (12-15 preguntas) y Complete (68-75 preguntas). Actualmente solo ~30% esta implementado con preguntas específicas; el resto usa preguntas genéricas de fallback.

## Estado Actual

### Sectores COMPLETOS (18/18 tipos):
- **Gastronomía (A1)**: 18 tipos - COMPLETO
- **Turismo (A2)**: 18 tipos - COMPLETO

### Sectores PARCIALES (preguntas universales, no específicas por tipo):
- **Educación (A5)**: Preguntas universales para todos los tipos
- **B2B (A6)**: Preguntas universales para todos los tipos  
- **Transporte (A9)**: Preguntas universales para todos los tipos
- **Agro (A10)**: Preguntas universales para todos los tipos

### Sectores con POCOS tipos implementados:
- **Retail (A3)**: Solo 5/18 tipos (Almacén, Supermercado, Moda, Calzado, Hogar)
- **Salud (A4)**: Solo 1/18 tipo (Clínica)
- **Hogar/Servicios (A7)**: Solo 2/18 tipos (Plomería, Electricidad)
- **Construcción (A8)**: Solo 1/18 tipo (Constructora Residencial)

## Estructura de Cada Cuestionario

Cada tipo de negocio necesita:
- **Modo Quick**: 12-15 preguntas esenciales
- **Modo Complete**: 68-75 preguntas detalladas

Las 12 categorías obligatorias:
1. Identidad y posicionamiento
2. Oferta y precios
3. Cliente ideal y demanda
4. Ventas y conversión
5. Finanzas y márgenes
6. Operaciones y capacidad
7. Marketing y adquisición
8. Retención y experiencia (CX)
9. Equipo y roles
10. Tecnología e integraciones
11. Objetivos del dueño
12. Riesgos, estacionalidad y restricciones

Las 7 dimensiones de salud:
- Crecimiento, Equipo, Tráfico, Rentabilidad, Finanzas, Eficiencia, Reputación

## Plan de Implementación

### Fase 1: Retail (A3) - 13 tipos faltantes
Crear cuestionarios específicos para:
- Electrónica y Tecnología
- Ferretería / Herramientas
- Librería / Papelería
- Juguetería y Hobbies
- Deportes y Outdoor
- Belleza y Perfumería
- Pet Shop
- Gourmet / Delicatessen
- Segunda Mano / Re-commerce
- E-commerce Marca Propia (D2C)
- Seller en Marketplaces
- Suscripción / Cajas Mensuales
- Mayorista / Distribuidor

### Fase 2: Salud (A4) - 17 tipos faltantes
Crear cuestionarios específicos para:
- Consultorio Médico
- Centro Odontológico
- Laboratorio de Análisis
- Centro Diagnóstico
- Kinesiología / Rehabilitación
- Psicología / Salud Mental
- Nutrición / Dietética
- Medicina Estética
- Centro de Estética
- Spa / Masajes
- Gimnasio / Fitness
- Yoga / Pilates
- Peluquería / Salón
- Barbería
- Manicuría / Uñas
- Depilación
- Óptica / Contactología

### Fase 3: Hogar/Servicios (A7) - 16 tipos faltantes
Crear cuestionarios específicos para:
- Gasista
- Cerrajería
- Pintura
- Carpintería
- Albañilería
- Jardinería
- Limpieza Hogar
- Fumigación
- Mudanzas
- Climatización
- Seguridad Hogar
- Electrodomésticos
- Tapicería
- Vidriería
- Herrería
- Mantenimiento Integral

### Fase 4: Construcción (A8) - 17 tipos faltantes
Crear cuestionarios específicos para:
- Constructora Comercial
- Arquitectura
- Ingeniería Civil
- Inmobiliaria Ventas
- Inmobiliaria Alquileres
- Desarrolladora
- Reformas Integrales
- Demolición
- Movimiento de Suelos
- Estructuras Metálicas
- Instalaciones Especiales
- Impermeabilización
- Pisos y Revestimientos
- Techos y Cubiertas
- Piscinas
- Paisajismo
- Project Management

### Fase 5: Convertir preguntas universales a específicas

**Educación (A5)** - Crear variaciones específicas para:
- Jardín/Inicial
- Escuela Primaria/Secundaria
- Instituto Terciario
- Universidad/Posgrado
- Instituto de Idiomas
- Apoyo Escolar
- Preparación Exámenes
- Programación/Tech
- Diseño/Creatividad
- Marketing/Negocios
- Cursos de Oficios
- Capacitación Corporativa
- E-learning/Plataforma
- Clases Particulares
- Artes Escénicas
- Academia de Música
- Academia de Danza
- Academia Deportiva

**B2B (A6)** - Similar para 18 tipos profesionales

**Transporte (A9)** - Similar para 18 tipos logísticos

**Agro (A10)** - Similar para 18 tipos agroindustriales

## Principios de Diseño

1. **Hiper-personalización**: Cada pregunta debe ser específica del tipo de negocio
2. **No preguntas genéricas**: Si dos tipos son muy similares (ej: Hotel Urbano vs Hotel Boutique), compartir 80% de preguntas pero diferenciar en 20% clave
3. **Idiomas**: Español (es) + Portugués (pt-BR) obligatorio
4. **Mapeo a Brain**: Cada respuesta alimenta el Cerebro del Negocio
5. **Mission Triggers**: Preguntas gatillan misiones específicas según respuestas

## Archivos a Crear/Modificar

```text
src/lib/sectorQuestions/
├── retailQuestionsComplete.ts      // Expandir 13 tipos
├── saludQuestionsComplete.ts       // Expandir 17 tipos  
├── hogarQuestionsComplete.ts       // Expandir 16 tipos
├── construccionQuestionsComplete.ts // Expandir 17 tipos
├── educacionQuestionsComplete.ts   // Crear variaciones 18 tipos
├── b2bQuestionsComplete.ts         // Crear variaciones 18 tipos
├── transporteQuestionsComplete.ts  // Crear variaciones 18 tipos
├── agroQuestionsComplete.ts        // Crear variaciones 18 tipos
└── index.ts                        // Actualizar exports
```

## Detalles Técnicos

### Interfaz de Pregunta (UniversalQuestion)
```typescript
interface UniversalQuestion {
  id: string;
  category: string;
  mode: 'quick' | 'complete' | 'both';
  dimension: 'reputation' | 'profitability' | 'finances' | 'efficiency' | 'traffic' | 'team' | 'growth';
  weight: number;
  title: { es: string; 'pt-BR': string };
  help?: { es: string; 'pt-BR': string };
  type: 'single' | 'multi' | 'number' | 'slider' | 'text' | 'money';
  options?: Array<{
    id: string;
    label: { es: string; 'pt-BR': string };
    emoji?: string;
    impactScore?: number;
  }>;
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  businessTypes?: string[];
}
```

### Actualizar universalQuestionsEngine.ts
- Agregar imports de nuevos archivos
- Actualizar mapeos de IDs
- Eliminar fallbacks a preguntas genéricas

## Estimación

- **Total tipos faltantes**: ~130 cuestionarios específicos
- **Preguntas por tipo**: ~70 promedio (Quick + Complete)
- **Total preguntas nuevas**: ~9,100 preguntas

## Criterio de Éxito

- 0% de usuarios reciben preguntas genéricas de fallback
- Cada tipo de negocio tiene cuestionario 100% específico
- Tiempo de setup reduce al mostrar solo preguntas relevantes
- Precision Score del Brain aumenta por datos más específicos
