import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Unauthorized' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
    const { data: userRes } = await userClient.auth.getUser()
    if (!userRes?.user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(url, service)
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', userRes.user.id).eq('role', 'admin').maybeSingle()
    if (!roles) return json({ error: 'Forbidden' }, 403)

    // Pull setup progress + business + owner profile
    const { data: progress, error } = await admin
      .from('business_setup_progress')
      .select('id, business_id, current_step, setup_data, precision_score, completed_at, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500)
    if (error) throw error

    const businessIds = [...new Set((progress || []).map((p: any) => p.business_id).filter(Boolean))]
    const { data: businesses } = await admin
      .from('businesses')
      .select('id, name, category, country, owner_id, setup_completed, created_at')
      .in('id', businessIds.length ? businessIds : ['00000000-0000-0000-0000-000000000000'])

    const ownerIds = [...new Set((businesses || []).map((b: any) => b.owner_id).filter(Boolean))]
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', ownerIds.length ? ownerIds : ['00000000-0000-0000-0000-000000000000'])

    const bizMap = new Map((businesses || []).map((b: any) => [b.id, b]))
    const profMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    const rows = (progress || []).map((p: any) => {
      const b = bizMap.get(p.business_id) as any
      const prof = b ? profMap.get(b.owner_id) : null
      return {
        id: p.id,
        business_id: p.business_id,
        business_name: b?.name || '—',
        category: b?.category || null,
        country: b?.country || null,
        setup_completed: !!b?.setup_completed,
        owner_email: prof?.email || null,
        owner_name: prof?.full_name || null,
        current_step: p.current_step,
        precision_score: p.precision_score,
        completed_at: p.completed_at,
        updated_at: p.updated_at,
        created_at: p.created_at,
        setup_data: p.setup_data || {},
      }
    })

    return json({ rows, count: rows.length })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
