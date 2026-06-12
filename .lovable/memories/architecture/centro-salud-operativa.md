---
name: Centro de Salud Operativa
description: /admin/salud + tabla ops_incidents + sensores frontend + edge function report-incident para observabilidad y auto-healing
type: feature
---

Sistema de observabilidad + auto-healing para detectar y resolver:
- Errores JS (window.onerror, unhandledrejection, ErrorBoundary)
- Fallos de red (fetch ≥500, timeouts)
- Demoras (LCP > 4s, longtask > 250ms vía PerformanceObserver)
- Problemas de blog (futuro: hero con texto, TOC faltante, SEO incompleto)
- Auto-fixes con registro de estrategia y resultado

## Componentes

- **Tabla**: `ops_incidents` (RLS admin-only para SELECT/UPDATE/DELETE, INSERT autenticado)
- **Edge function**: `report-incident` — deduplica por fingerprint, incrementa `occurrences`
- **Hook**: `useAppSensors` montado en `AppLayout`
- **Página**: `/admin/salud` con tabs En vivo / Resueltos + métricas + realtime

## Fases completas

- Fase 2: `blog-health-scan` (cron cada 2 días, 4am) — SEO/estructura del blog sin IA
- Fase 3: `blog-autoheal` — reparación con IA mínima + versionado en `blog_autoheal_runs`
- Fase 4: `ops-watchdog` (cron cada 30 min) — ping OPTIONS a funciones críticas (vistaceo-chat, ai-forge-artifact, analyze-patterns, generate-mission-plan, generate-opportunity-plan, report-incident, dashboard-prepare); reporta caídas como incidente crítico, cierra incidentes como `fixed` (watchdog_recovery_check) cuando la función vuelve, y auto-resuelve incidentes no críticos sin recurrencia en 72h (`auto_resolved_stale`). Sin IA, costo cero.

## Lecciones (no repetir)

- Un import roto en `_shared/brain-core` tumba TODAS las funciones que lo importan (BOOT_ERROR 503). Tras editar `_shared`, correr `deno check` sobre las funciones afectadas antes de desplegar.
- Pasos de misión generados por IA usan `{title, how}`; la app espera `{text, howTo}`. Normalizar siempre (RadarPage `normalizeForgedSteps` + blindaje en `MissionStepsView`).
- Conversión oportunidad→misión debe ser instantánea: insertar con pasos locales y enriquecer con IA en segundo plano sin pisar progreso del usuario.

