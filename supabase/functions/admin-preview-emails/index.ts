import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

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

    const results: any[] = []
    for (const [name, entry] of Object.entries(TEMPLATES)) {
      const displayName = entry.displayName || name
      if (!entry.previewData) {
        results.push({ templateName: name, displayName, subject: '', html: '', status: 'preview_data_required' })
        continue
      }
      try {
        const html = await renderAsync(React.createElement(entry.component, entry.previewData))
        const subject = typeof entry.subject === 'function' ? entry.subject(entry.previewData) : entry.subject
        results.push({ templateName: name, displayName, subject, html, status: 'ready', to: entry.to || null, previewData: entry.previewData })
      } catch (err) {
        results.push({ templateName: name, displayName, subject: '', html: '', status: 'render_failed', errorMessage: String(err) })
      }
    }
    return json({ templates: results })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
