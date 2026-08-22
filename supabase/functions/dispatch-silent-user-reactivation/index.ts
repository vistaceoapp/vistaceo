import { sendAppEmail } from '../_shared/transactional-email-templates/send-app-email.ts'
// dispatch-silent-user-reactivation
// Corre cada 6h. Envía UN email de reactivación a usuarios que:
// - Completaron setup
// - Su último login fue hace >= 7 días
// - No recibieron ya este email
// - No están en suppressed_emails
// Idempotente via silent_reactivation_sends (UNIQUE user_id + stage).

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VARIANTS = 4

function hashStringToInt(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return Math.abs(h | 0)
}
function pickVariant(email: string, stage: string): number {
  return hashStringToInt(`${email}::${stage}`) % VARIANTS
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const APP_BASE_URL = Deno.env.get('SITE_URL') || 'https://www.vistaceo.com'
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  const now = new Date()
  const stage = 'silent7'
  const cutoffMax = new Date(now.getTime() - 7 * 86400_000).toISOString()   // último login <= hace 7d
  const cutoffMin = new Date(now.getTime() - 45 * 86400_000).toISOString()  // pero no más allá de 45d

  const summary = { sent: 0, skipped: 0, errors: 0 }

  const { data: candidates, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, last_login_at, login_count')
    .lte('last_login_at', cutoffMax)
    .gte('last_login_at', cutoffMin)
    .limit(300)

  if (error) {
    console.error('[silent-react] query failed', error)
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  if (!candidates || candidates.length === 0) {
    return new Response(JSON.stringify({ ok: true, summary, note: 'no candidates' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const userIds = candidates.map(p => p.id)
  const emails = candidates.map(p => (p.email || '').toLowerCase()).filter(Boolean)

  // Solo usuarios con al menos un business setup_completed
  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_id, name, setup_completed')
    .in('owner_id', userIds)
    .eq('setup_completed', true)

  const completed = new Map<string, { name: string }>()
  for (const b of biz || []) {
    if (!completed.has(b.owner_id as string)) completed.set(b.owner_id as string, { name: (b.name as string) || '' })
  }

  const { data: alreadySent } = await supabase
    .from('silent_reactivation_sends')
    .select('user_id')
    .in('user_id', userIds)
    .eq('stage', stage)
  const sentSet = new Set((alreadySent || []).map(r => r.user_id))

  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('email')
    .in('email', emails)
  const suppSet = new Set((suppressed || []).map(r => r.email.toLowerCase()))

  for (const p of candidates) {
    const email = (p.email || '').toLowerCase()
    if (!email || !email.includes('@')) { summary.skipped++; continue }
    if (/^(asd|test|prueba|jsj|jaja)/i.test(email.split('@')[0])) { summary.skipped++; continue }
    if (!completed.has(p.id)) { summary.skipped++; continue }        // solo post-setup
    if (sentSet.has(p.id)) { summary.skipped++; continue }
    if (suppSet.has(email)) { summary.skipped++; continue }

    const variant = pickVariant(email, stage)
    const firstName = (p.full_name || '').split(' ')[0] || email.split('@')[0]
    const days = p.last_login_at
      ? Math.floor((now.getTime() - new Date(p.last_login_at).getTime()) / 86400_000)
      : 7

    try {
      const { error: reserveErr } = await supabase
        .from('silent_reactivation_sends')
        .insert({ user_id: p.id, recipient_email: email, stage, variant })
      if (reserveErr) { summary.skipped++; continue }

      const result = await sendAppEmail({
        templateName: 'user-silent-reactivation',
        recipientEmail: email,
        idempotencyKey: `silent-${stage}-${p.id}`,
        templateData: {
          firstName,
          appUrl: `${APP_BASE_URL}/app`,
          variant,
          recipientEmail: email,
          trackingId: `${stage}-v${variant}-${p.id.slice(0, 8)}`,
          businessName: completed.get(p.id)?.name || '',
          daysSinceLastLogin: days,
        },
      })

      if (!result.ok) {
        console.error('[silent-react] send failed', email, result.reason)
        await supabase.from('silent_reactivation_sends').delete().eq('user_id', p.id).eq('stage', stage)
        summary.errors++
        continue
      }

      summary.sent++
    } catch (err) {
      console.error('[silent-react] exception', email, err)
      summary.errors++
    }
  }

  return new Response(JSON.stringify({ ok: true, ranAt: now.toISOString(), summary }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
