import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES } from './registry.ts'
import { sendTemplateEmail } from './send-email.ts'
import { emailQualityCheck } from '../brain-core/email-quality-gate.ts'

// Server-only helper used by every feature that sends an app email.
// Wraps the managed send helper with the project's own behaviour:
//   - dedupe on the idempotency key (email_send_log.message_id)
//   - email quality gate for reactivation/recovery style emails
//   - email_send_log rows for sent / suppressed / failed outcomes
// Delivery, retries, rate limits and suppression are enforced by Lovable.

export interface SendAppEmailOptions {
  templateName: string
  recipientEmail?: string
  idempotencyKey?: string
  templateData?: Record<string, any>
  replyTo?: string
}

export interface SendAppEmailResult {
  ok: boolean
  sent: boolean
  deduped?: boolean
  reason?: string
  details?: string[]
  status?: number
}

function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

async function logSend(
  supabase: ReturnType<typeof admin>,
  row: {
    message_id: string
    template_name: string
    recipient_email: string
    status: 'sent' | 'suppressed' | 'failed'
    error_message?: string
  },
) {
  const { error } = await supabase.from('email_send_log').insert(row)
  if (error) {
    console.error('[send-app-email] failed to write email_send_log', {
      code: error.code,
      message: error.message,
      template_name: row.template_name,
      status: row.status,
    })
  }
}

export async function sendAppEmail(
  options: SendAppEmailOptions,
): Promise<SendAppEmailResult> {
  const { templateName, templateData = {}, replyTo } = options

  if (!templateName) {
    return { ok: false, sent: false, reason: 'template_name_required', status: 400 }
  }

  const template = TEMPLATES[templateName]
  if (!template) {
    return { ok: false, sent: false, reason: 'template_not_found', status: 404 }
  }

  const effectiveRecipient = template.to || options.recipientEmail
  if (!effectiveRecipient) {
    return { ok: false, sent: false, reason: 'recipient_required', status: 400 }
  }

  const messageId = options.idempotencyKey || crypto.randomUUID()
  const supabase = admin()

  // Dedupe: same idempotency key already handled → do not send again.
  const { data: existingSend } = await supabase
    .from('email_send_log')
    .select('id, status')
    .eq('message_id', messageId)
    .limit(1)
    .maybeSingle()

  if (existingSend) {
    console.log('[send-app-email] dedupe hit', { templateName, status: existingSend.status })
    return { ok: true, sent: false, deduped: true, reason: 'deduped' }
  }

  // Email Quality Gate — bloquea emails genéricos, spammy o sin personalización
  // mínima. Solo aplica a emails de reactivación/recovery; los transaccionales
  // puros no requieren personalización profunda.
  const isRecoveryLike = /reactiv|recovery|reminder|silent|reengagement/i.test(templateName)
  const resolvedSubject =
    typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  if (isRecoveryLike) {
    try {
      const plainText = await renderAsync(
        React.createElement(template.component, templateData),
        { plainText: true },
      )
      const anchors = {
        businessName: (templateData?.businessName as string) ?? (templateData?.name as string) ?? null,
        sector: (templateData?.sector as string) ?? null,
        subSector: (templateData?.subSector as string) ?? null,
        country: (templateData?.countryCode as string) ?? (templateData?.country as string) ?? null,
        city: (templateData?.city as string) ?? null,
        customer: (templateData?.customer as string) ?? null,
        channel: (templateData?.channel as string) ?? null,
        offer: (templateData?.offer as string) ?? null,
        mainFriction: (templateData?.friction as string) ?? null,
        mainGoal: (templateData?.goal as string) ?? null,
      }
      const gate = emailQualityCheck({
        subject: resolvedSubject,
        body: plainText,
        anchors,
        kind: 'reactivation',
        minAnchors: 1,
      })
      if (!gate.ok) {
        console.warn('[send-app-email] blocked by quality gate', {
          templateName,
          reasons: gate.reasons,
          personalizationScore: gate.personalizationScore,
        })
        await logSend(supabase, {
          message_id: messageId,
          template_name: templateName,
          recipient_email: effectiveRecipient,
          status: 'failed',
          error_message: `quality_gate_blocked: ${gate.reasons.slice(0, 3).join('; ')}`,
        })
        return {
          ok: false,
          sent: false,
          reason: 'quality_gate_blocked',
          details: gate.reasons,
          status: 200,
        }
      }
    } catch (gateErr) {
      console.warn('[send-app-email] quality gate error (allowing)', gateErr)
    }
  }

  try {
    const result = await sendTemplateEmail(templateName, effectiveRecipient, {
      templateData,
      idempotencyKey: messageId,
      replyTo,
    })

    if (!result.sent) {
      await logSend(supabase, {
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: 'suppressed',
      })
      console.log('[send-app-email] recipient suppressed', { templateName })
      return { ok: true, sent: false, reason: result.reason }
    }

    await logSend(supabase, {
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'sent',
    })
    return { ok: true, sent: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[send-app-email] send failed', { templateName, error: errorMsg })
    await logSend(supabase, {
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: errorMsg.slice(0, 1000),
    })
    return { ok: false, sent: false, reason: 'send_failed', details: [errorMsg], status: 500 }
  }
}
