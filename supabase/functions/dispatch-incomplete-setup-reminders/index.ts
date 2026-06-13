// dispatch-incomplete-setup-reminders
// Corre cada hora vía pg_cron. Envía hasta 2 recordatorios por usuario sin
// negocio completado:
//   - day1: ~26h después del signup (saltea fin de semana → ~"1 día hábil")
//   - day3: ~72h después del signup
// Asigna variante A/B/C/D de forma determinista (hash del email) para A/B test.
// Idempotente: tabla `setup_reminder_sends` con UNIQUE(user_id, stage).

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VARIANTS_PER_STAGE = 4

function hashStringToInt(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h | 0)
}

function pickVariant(email: string, stage: string): number {
  return hashStringToInt(`${email}::${stage}`) % VARIANTS_PER_STAGE
}

function isWeekendUTC(d: Date): boolean {
  const day = d.getUTCDay() // 0=Sun, 6=Sat
  return day === 0 || day === 6
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const APP_BASE_URL = Deno.env.get('SITE_URL') || 'https://www.vistaceo.com'

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  const now = new Date()
  const isWeekend = isWeekendUTC(now)

  // Ventanas: damos margen amplio para que un cron horario no se "pierda" usuarios.
  // day1: signups entre 24h y 60h atrás (si pasó el fin de semana, los del viernes caen lunes)
  // day3: signups entre 70h y 96h atrás
  const day1Min = new Date(now.getTime() - 60 * 3600 * 1000).toISOString()
  const day1Max = new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
  const day3Min = new Date(now.getTime() - 96 * 3600 * 1000).toISOString()
  const day3Max = new Date(now.getTime() - 70 * 3600 * 1000).toISOString()

  const summary = { day1: { sent: 0, skipped: 0, errors: 0 }, day3: { sent: 0, skipped: 0, errors: 0 } }

  async function runStage(stage: 'day1' | 'day3', minIso: string, maxIso: string) {
    // En fin de semana NO mandamos day1 (lo enviamos el lunes hábil).
    if (stage === 'day1' && isWeekend) {
      return
    }

    // Candidatos: profiles creados en la ventana
    const { data: candidates, error: profErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .gte('created_at', minIso)
      .lte('created_at', maxIso)
      .limit(500)

    if (profErr) {
      console.error('[reminder]', stage, 'profile query failed', profErr)
      return
    }
    if (!candidates || candidates.length === 0) return

    const userIds = candidates.map((p) => p.id)
    const emails = candidates.map((p) => (p.email || '').toLowerCase()).filter(Boolean)

    // Excluir: ya tienen al menos un business completado
    const { data: completed } = await supabase
      .from('businesses')
      .select('owner_id')
      .in('owner_id', userIds)
      .eq('setup_completed', true)
    const completedSet = new Set((completed || []).map((b) => b.owner_id))

    // Excluir: ya recibieron ESTA etapa
    const { data: alreadySent } = await supabase
      .from('setup_reminder_sends')
      .select('user_id')
      .in('user_id', userIds)
      .eq('stage', stage)
    const sentSet = new Set((alreadySent || []).map((r) => r.user_id))

    // Excluir: emails suprimidos
    const { data: suppressed } = await supabase
      .from('suppressed_emails')
      .select('email')
      .in('email', emails)
    const suppressedSet = new Set((suppressed || []).map((r) => r.email.toLowerCase()))

    for (const p of candidates) {
      const email = (p.email || '').toLowerCase()
      if (!email || !email.includes('@')) { summary[stage].skipped++; continue }
      // Filtros básicos contra emails de prueba evidentes
      if (/^(asd|test|prueba|jsj|jaja)/i.test(email.split('@')[0])) { summary[stage].skipped++; continue }
      if (completedSet.has(p.id)) { summary[stage].skipped++; continue }
      if (sentSet.has(p.id)) { summary[stage].skipped++; continue }
      if (suppressedSet.has(email)) { summary[stage].skipped++; continue }

      const variant = pickVariant(email, stage)
      const firstName = (p.full_name || '').split(' ')[0] || email.split('@')[0]
      const templateName = stage === 'day1' ? 'user-incomplete-reminder-day1' : 'user-incomplete-reminder-day3'

      try {
        // Reservar el envío PRIMERO (UNIQUE evita race conditions con crons concurrentes)
        const { error: reserveErr } = await supabase
          .from('setup_reminder_sends')
          .insert({
            user_id: p.id,
            recipient_email: email,
            stage,
            variant,
          })
        if (reserveErr) {
          // Probablemente UNIQUE violation → otro proceso ya lo hizo
          summary[stage].skipped++
          continue
        }

        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SERVICE_KEY}`,
            apikey: SERVICE_KEY,
          },
          body: JSON.stringify({
            templateName,
            recipientEmail: email,
            idempotencyKey: `incomplete-${stage}-${p.id}`,
            templateData: {
              firstName,
              setupUrl: `${APP_BASE_URL}/setup`,
              variant,
              recipientEmail: email,
              trackingId: `${stage}-v${variant}-${p.id.slice(0, 8)}`,
            },
          }),
        })

        if (!res.ok) {
          const errText = await res.text().catch(() => '')
          console.error('[reminder] send failed', stage, email, res.status, errText)
          // Rollback reserva para reintentar en próxima corrida
          await supabase
            .from('setup_reminder_sends')
            .delete()
            .eq('user_id', p.id)
            .eq('stage', stage)
          summary[stage].errors++
          continue
        }

        summary[stage].sent++
        console.log('[reminder] sent', { stage, email, variant })
      } catch (err) {
        console.error('[reminder] exception', stage, email, err)
        summary[stage].errors++
      }
    }
  }

  await runStage('day1', day1Min, day1Max)
  await runStage('day3', day3Min, day3Max)

  return new Response(JSON.stringify({ ok: true, ranAt: now.toISOString(), summary }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
