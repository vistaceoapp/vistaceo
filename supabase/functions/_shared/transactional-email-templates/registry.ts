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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'admin-user-signup': adminUserSignup,
  'admin-setup-completed': adminSetupCompleted,
  'user-welcome': userWelcome,
  'user-activated': userActivated,
  'user-pro-activated': userProActivated,
}
