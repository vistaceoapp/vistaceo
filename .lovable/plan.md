

## Plan — Hero VISTACEO: nuevo copy + escena 3D "Orb" premium

### 1. Copy del hero (desktop y mobile)

Reemplazar el H1 actual de tres líneas por una versión más corta, contundente y perfectamente legible en ambos formatos.

**Headline (H1):**
> **Un CEO digital con IA**
> **impulsando tu negocio**
> **o servicio · 24/7**

- Tipografía actual (Inter/Codec Pro semibold), tracking ajustado.
- Tamaño fluido: `clamp(2.2rem, 5.6vw, 4.8rem)` para que en mobile no quiebre raro y en desktop tenga peso editorial.
- "24/7" tratado como acento con el gradiente VISTACEO (#2692DC → #746CE6) para anclaje visual.
- En mobile (<640px): el `<br>` se controla con `<span class="block">` para asegurar tres líneas limpias sin huérfanas.
- Subtítulo se mantiene corto y se reposiciona para no competir con el headline.

### 2. Diagnóstico del hero 3D actual

`IntelligenceFlow` (912 líneas) intenta resolver demasiadas cosas: pista, entidades, transformaciones, outputs flotando, anillos. En mobile se ve apretado y en desktop sigue leyéndose como diagrama detrás del copy. El veil blanco al 92% además mata casi toda la escena del lado izquierdo.

### 3. Nuevo enfoque visual — "Executive Orb"

Reemplazar el sistema diagramático por **una sola pieza protagónica**: un orbe de cristal premium (estilo voxr.ai / Apple Vision / Linear) que respira, con señales orbitando y cristalizándose en micro-cards ejecutivas. Menos elementos, más impacto.

**Componente nuevo:** `src/components/landing/HeroOrb.tsx`

**Estructura de la escena:**

```text
                  ┌──────────────────────────────┐
   COPY (left)    │                              │
   ▓▓▓▓▓▓▓▓▓▓     │      ◌  micro-card           │
   ▓▓▓▓▓▓▓▓▓▓     │   ◌      ╔════════╗          │
   ▓▓▓▓▓▓▓        │          ║  ORB   ║   ◌      │
   [CTA]          │     ◌    ║ glass  ║          │
                  │          ╚════════╝   micro-c │
                  │      ◌                        │
                  └──────────────────────────────┘
```

**Capas del orb (de adentro hacia afuera):**

1. **Núcleo** — esfera de cristal blanco perlado con highlight especular suave, isotipo VISTACEO embebido, breathing 6s.
2. **Anillo iridiscente** — gradiente cónico celeste→lavanda rotando muy lento (40s), conic-gradient + mask radial.
3. **Halo difuso** — radial-gradient violeta/celeste muy bajo en opacidad para luz ambiente.
4. **Órbitas de señales** — 5–7 puntos discretos viajando en elipses (ventas, reseña, riesgo, competencia, tendencia, anomalía, oportunidad), cada uno con su tinte sutil. Sin etiquetas mientras orbitan.
5. **Micro-cards de salida** — 3 chips de cristal que aparecen escalonados: *"Oportunidad activa"*, *"Insight nuevo"*, *"Predicción semanal"*. Cada uno aparece cuando una señal "toca" el orb, fade-in 600ms con cubic-bezier suave, queda visible 4s, fade-out, rota la próxima.

**Materialidad:**
- `backdrop-filter: blur(20px)` real para las micro-cards.
- Bordes con `box-shadow` interior + exterior (glass premium real, no fake).
- Sombra de contacto bajo el orb con radial-gradient muy suave.
- Cero negro, cero saturación alta. Solo blanco perla, gris hielo, lavanda muy clara, acentos celeste-violeta.

**Motion:**
- Un solo `requestAnimationFrame` loop compartido para órbitas (mejor performance que múltiples Framer).
- `prefers-reduced-motion`: orbe estático con halo respirando, micro-cards visibles fijas.
- IntersectionObserver: pausa el RAF cuando sale del viewport.

### 4. Layout responsivo del hero

**Desktop (lg+):**
- Grid 12 columnas: copy ocupa `col-span-6`, orb ocupa `col-span-6` (ya no es full-bleed). Esto resuelve el problema del veil que tapaba la escena.
- Orb centrado verticalmente en la columna derecha, ~520px de alto.

**Mobile (<lg):**
- Layout vertical: copy arriba, orb abajo (~360px de alto).
- Solo 3 órbitas visibles (vs 5–7 en desktop), 1 sola micro-card rotando.
- Sin parallax de cursor.

### 5. Cleanup

- `IntelligenceFlow` queda en el repo pero **se desconecta** del hero (no se borra por si querés volver). El import se reemplaza por `HeroOrb`.
- Se elimina el veil blanco gigante del lado izquierdo (ya no necesario porque el orb está contenido en su columna).
- Se elimina el `min-h-[100svh]` agresivo y se usa `min-h-[88svh]` para que el scroll-indicator tenga lugar.

### 6. Archivos afectados

- ✏️ `src/components/landing/sections/HeroSection.tsx` *(o el HeroSection que esté activo en LandingMinimalista — usaremos el de `LandingMinimalista.tsx` directamente)*
- ✏️ `src/pages/LandingMinimalista.tsx` — nuevo copy + reemplazo de `IntelligenceFlow` por `HeroOrb` en la sección hero.
- 🆕 `src/components/landing/HeroOrb.tsx` — escena nueva, ~250 líneas, optimizada.

### 7. Criterios de validación

- ✅ El headline lee perfecto en 320px, 390px, 768px, 1280px y 1920px.
- ✅ El orb se siente **objeto**, no diagrama.
- ✅ Cero superposición entre copy y orb en cualquier breakpoint.
- ✅ FPS estable en mobile (un solo RAF, sin filters caros en mobile).
- ✅ Respeta `prefers-reduced-motion`.

