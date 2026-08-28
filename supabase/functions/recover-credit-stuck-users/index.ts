import { sendAppEmail } from '../_shared/transactional-email-templates/send-app-email.ts'
// recover-credit-stuck-users
// One-shot endpoint: finds owners whose ONLY business(es) are empty placeholders
// (setup_completed = false AND zero signals) — proxy for users who couldn't finish
// setup because the AI gateway ran out of credits — and sends them a single
// personalised recovery email via send-transactional-email.
//
// Idempotent via setup_reminder_sends UNIQUE(user_id, stage='credit_recovery').
// Trigger manually:
//   POST /functions/v1/recover-credit-stuck-users
//   { "dryRun": true }   → returns the candidate list without sending
//   { "dryRun": false }  → actually sends
//
// Optional: { "since": "2026-06-15T00:00:00Z" } to scope by signup date.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const APP_BASE_URL = Deno.env.get('SITE_URL') || 'https://www.vistaceo.com'
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  let body: any = {}
  try { body = await req.json() } catch { /* empty body OK */ }
  const dryRun = body?.dryRun !== false // default to dry run for safety
  const since = body?.since || new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()

  // 1. Recent businesses without completed setup
  const { data: stuck, error: stuckErr } = await supabase
    .from('businesses')
    .select('id, owner_id, name, category, created_at, setup_completed')
    .eq('setup_completed', false)
    .gte('created_at', since)
    .limit(2000)

  if (stuckErr) {
    return new Response(JSON.stringify({ ok: false, error: stuckErr.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!stuck || stuck.length === 0) {
    return new Response(JSON.stringify({ ok: true, candidates: [], summary: { found: 0, sent: 0, skipped: 0, errors: 0 } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const ownerIds = Array.from(new Set(stuck.map(b => b.owner_id).filter(Boolean)))

  // Exclude owners who DO have any completed business
  const { data: completedRows } = await supabase
    .from('businesses')
    .select('owner_id')
    .in('owner_id', ownerIds)
    .eq('setup_completed', true)
  const completedOwners = new Set((completedRows || []).map(r => r.owner_id))

  // Owners with zero signals across all their businesses
  const { data: signalRows } = await supabase
    .from('signals')
    .select('business_id')
    .in('business_id', stuck.map(b => b.id))
  const businessesWithSignals = new Set((signalRows || []).map(r => r.business_id))

  const eligibleOwners = new Map<string, { businessName: string; businessCategory: string | null; createdAt: string }>()
  for (const b of stuck) {
    if (!b.owner_id) continue
    if (completedOwners.has(b.owner_id)) continue
    if (businessesWithSignals.has(b.id)) continue
    if (!eligibleOwners.has(b.owner_id)) {
      eligibleOwners.set(b.owner_id, { businessName: b.name || '', businessCategory: (b as any).category || null, createdAt: b.created_at })
    }
  }

  if (eligibleOwners.size === 0) {
    return new Response(JSON.stringify({ ok: true, candidates: [], summary: { found: 0, sent: 0, skipped: 0, errors: 0 } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userIds = Array.from(eligibleOwners.keys())
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds)

  const { data: alreadySent } = await supabase
    .from('setup_reminder_sends')
    .select('user_id')
    .in('user_id', userIds)
    .eq('stage', 'credit_recovery')
  const sentSet = new Set((alreadySent || []).map(r => r.user_id))

  const emails = (profiles || []).map(p => (p.email || '').toLowerCase()).filter(Boolean)
  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('email')
    .in('email', emails)
  const suppressedSet = new Set((suppressed || []).map(r => r.email.toLowerCase()))

  const summary = { found: 0, sent: 0, skipped: 0, errors: 0 }
  const candidates: any[] = []

  for (const p of profiles || []) {
    const email = (p.email || '').toLowerCase()
    if (!email || !email.includes('@')) { summary.skipped++; continue }
    if (/^(asd|test|prueba|jsj|jaja)/i.test(email.split('@')[0])) { summary.skipped++; continue }
    if (sentSet.has(p.id)) { summary.skipped++; continue }
    if (suppressedSet.has(email)) { summary.skipped++; continue }

    const firstName = (p.full_name || '').split(' ')[0] || email.split('@')[0]
    summary.found++
    candidates.push({ user_id: p.id, email, firstName })

    if (dryRun) continue

    try {
      const { error: reserveErr } = await supabase
        .from('setup_reminder_sends')
        .insert({ user_id: p.id, recipient_email: email, stage: 'credit_recovery', variant: 0 })
      if (reserveErr) { summary.skipped++; continue }

      const result = await sendAppEmail({
        templateName: 'user-credit-recovery',
        recipientEmail: email,
        idempotencyKey: `credit-recovery-${p.id}`,
        templateData: {
          firstName,
          setupUrl: `${APP_BASE_URL}/setup`,
          recipientEmail: email,
          trackingId: `credit-recovery-${p.id.slice(0, 8)}`,
          businessName: eligibleOwners.get(p.id)?.businessName || '',
          businessCategory: eligibleOwners.get(p.id)?.businessCategory || null,
          // Sin negocio cargado no hay anclas posibles: no bloquear el envío.
          qualityGateMinAnchors: eligibleOwners.get(p.id)?.businessName ? 1 : 0,
        },
      })

      if (!result.ok) {
        console.error('[recover-credit] send failed', email, result.reason)
        await supabase.from('setup_reminder_sends').delete()
          .eq('user_id', p.id).eq('stage', 'credit_recovery')
        summary.errors++
        continue
      }
      summary.sent++
      console.log('[recover-credit] sent', email)
    } catch (err) {
      console.error('[recover-credit] exception', email, err)
      summary.errors++
    }
  }

  return new Response(JSON.stringify({ ok: true, dryRun, summary, candidates }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
