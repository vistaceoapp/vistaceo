# QA Real — Checklist asistido VISTACEO

> Esta guía es para **prueba manual con 1-2 usuarios reales**. El backend
> está instrumentado: si activás QA mode, cada interacción queda registrada
> y exportable como reporte técnico.

## 1. Activar QA mode

En la URL de la app, agregá `?qa=1` o en consola:
```js
localStorage.setItem('qa_mode','1');
window.__vistaceoQA.start('QA_REAL_USER_01', { userId: '<uid>', businessId: '<bid>' });
```

Al terminar, exportá el reporte:
```js
const r = window.__vistaceoQA.export();
console.log(r.markdown);
window.__vistaceoQA.stop();
```

## 2. Usuarios sugeridos

- **QA_REAL_USER_01** — Café Providencia, Chile (cafetería/gastronomía local)
- **QA_REAL_USER_02** — Consultora de procesos y tecnología, Argentina (servicio profesional)

## 3. Escenarios por módulo

### Setup
- [ ] Setup Rápido con todos los campos completos
- [ ] Setup Completo (si aplica)
- [ ] "No sé / Quiero aclarar algo" vacío → debe quedar `classification_status = uncertain`
- [ ] "No sé / Quiero aclarar algo" con texto → clarificación persiste

### Inicio (Dashboard)
- [ ] DashboardHero carga sin `[object Object]`, `undefined` ni JSON crudo
- [ ] Salud del negocio muestra dimensión real (no 0 falso)
- [ ] Acción del día es específica al negocio

### Chat CEO
- [ ] Mensaje nuevo con dato real → se persiste aprendizaje (ver `signals` + `brain_events`)
- [ ] Respuesta no genérica, no incluye URLs crudas ni JSON

### Radar
- [ ] Radar interno muestra oportunidades específicas con evidencia
- [ ] Radar externo muestra fuente real (URL clickeable, no cruda)
- [ ] Aplicar oportunidad → genera misión y emite `opportunity_applied`

### Misiones
- [ ] Misión recomendada tiene 3-8 pasos completos (qué, cómo, por qué, métrica)
- [ ] Completar paso emite `mission_step_completed`
- [ ] No hay pasos vacíos ni "TODO"

### Analíticas
- [ ] Diagnóstico, reputación, competencia, insights, evolución, métricas
- [ ] Sin 0 falso, sin competidores inventados, sin reseñas inventadas

### Predicciones
- [ ] Predicciones tienen evidencia y banda de incertidumbre
- [ ] No prometen porcentajes inventados

### Admin
- [ ] Eventos en `brain_events` y `admin_audit_log` legibles
- [ ] Contadores de brain consistentes (`total_signals` real, `confidence_score` > 0)

### Multi-formato
- [ ] Mobile (375x812) — sin overflow, sin texto cortado
- [ ] Desktop (1440x900)

### Resiliencia
- [ ] Edge Function failure simulado (network offline) → fallback premium contextual
- [ ] Self-healing/repair: contenido viejo legacy se oculta o se reemplaza

## 4. Backfill seguro (post-deploy)

### Brain counters
```sql
-- Dry run primero
SELECT * FROM public.backfill_brain_signal_counters(true);
-- Apply
SELECT * FROM public.backfill_brain_signal_counters(false);
```

### Migración de contenido legacy
Desde un panel admin o consola con sesión admin activa:
```ts
import { migrateLegacyBusinessesToNewIntelligence } from '@/lib/migrate-legacy-businesses';
const plan = await migrateLegacyBusinessesToNewIntelligence({ dryRun: true });
console.log(plan);
// Si todo se ve bien:
await migrateLegacyBusinessesToNewIntelligence({ dryRun: false });
```

## 5. Verificaciones SQL útiles

```sql
-- Eventos recientes por business
SELECT event_type, source_module, created_at FROM public.brain_events
WHERE business_id = '<bid>' ORDER BY created_at DESC LIMIT 50;

-- Signals vs counters
SELECT b.id, b.name, bb.total_signals, bb.confidence_score,
       (SELECT count(*) FROM signals s WHERE s.business_id = b.id) AS real_signals
FROM businesses b LEFT JOIN business_brains bb ON bb.business_id = b.id;

-- Clasificaciones inciertas
SELECT business_id, primary_business_type, classification_status, classification_fallback_reason
FROM business_brains WHERE classification_status = 'uncertain';

-- Contenido marcado legacy
SELECT 'missions' AS t, count(*) FROM missions WHERE legacy_status IS NOT NULL
UNION ALL SELECT 'opportunities', count(*) FROM opportunities WHERE legacy_status IS NOT NULL
UNION ALL SELECT 'predictions', count(*) FROM predictions WHERE legacy_status IS NOT NULL
UNION ALL SELECT 'business_insights', count(*) FROM business_insights WHERE legacy_status IS NOT NULL;
```

## 6. Criterio de cierre

Solo cerrar QA real cuando, para cada usuario:
- 0 leaks (`[object Object]`, `undefined`, JSON crudo, URLs crudas, `Q_AI`, `market_signal`)
- Brain `confidence_score > 0` con signals reales
- `classification_status` ≠ `uncertain` o tiene `classification_fallback_reason` justificado
- ≥ 1 `prediction_generated` o `prediction_regenerated` reciente
- ≥ 1 `business_insight_generated` o `business_insight_regenerated` reciente
- Reporte `exportQAReport()` sin `fail` críticos
