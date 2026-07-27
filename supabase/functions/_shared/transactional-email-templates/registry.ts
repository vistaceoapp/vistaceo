/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as adminUserSignup } from './admin-user-signup.tsx'
import { template as adminSetupCompleted } from './admin-setup-completed.tsx'
import { template as userWelcome } from './user-welcome.tsx'
import { template as userActivated } from './user-activated.tsx'
import { template as userProActivated } from './user-pro-activated.tsx'
import { templateDay1 as userIncompleteDay1, templateDay3 as userIncompleteDay3 } from './user-incomplete-reminder.tsx'
import { template as userCreditRecovery } from './user-credit-recovery.tsx'
import { template as userSilentReactivation } from './user-silent-reactivation.tsx'
import { template as userPromo24h } from './user-promo-24h.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'admin-user-signup': adminUserSignup,
  'admin-setup-completed': adminSetupCompleted,
  'user-welcome': userWelcome,
  'user-activated': userActivated,
  'user-pro-activated': userProActivated,
  'user-incomplete-reminder-day1': userIncompleteDay1,
  'user-incomplete-reminder-day3': userIncompleteDay3,
  'user-credit-recovery': userCreditRecovery,
  'user-silent-reactivation': userSilentReactivation,
  'user-promo-24h': userPromo24h,
}
