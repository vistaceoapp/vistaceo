import { createEmailWebhookHandler } from 'npm:@lovable.dev/email-js@0.1.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Notification-only mirror of terminal delivery outcomes into the project's
// own tables. Lovable enforces suppression at send time — these rows are a
// convenience view for the app (admin panels, reporting), never a send gate.

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

const REASON_TO_STATUS: Record<Reason, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}

const REASON_TO_MESSAGE: Record<Reason, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

function client() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

async function record(
  reason: Reason,
  event: { event_id: string; data: { recipient: string; message_id?: string } },
) {
  const supabase = client()
  const normalizedEmail = event.data.recipient.toLowerCase()

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert(
      { email: normalizedEmail, reason, metadata: null },
      { onConflict: 'email' },
    )

  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      event_id: event.event_id,
      code: suppressError.code,
      message: suppressError.message,
    })
    throw new Error('Failed to write suppression')
  }

  const { error: logError } = await supabase.from('email_send_log').insert({
    message_id: event.data.message_id ?? null,
    template_name: 'system',
    recipient_email: normalizedEmail,
    status: REASON_TO_STATUS[reason],
    error_message: REASON_TO_MESSAGE[reason],
    metadata: null,
  })

  if (logError) {
    console.error('Failed to insert email_send_log', {
      event_id: event.event_id,
      code: logError.code,
      message: logError.message,
    })
    throw new Error('Failed to write send log')
  }
}

const handler = createEmailWebhookHandler({
  apiKey: Deno.env.get('LOVABLE_API_KEY')!,
  on: {
    'email.bounced': async (event) => {
      await record('bounce', event as any)
    },
    'email.complaint': async (event) => {
      await record('complaint', event as any)
    },
    'email.unsubscribed': async (event) => {
      await record('unsubscribe', event as any)
    },
  },
})

Deno.serve((req) => handler(req))
