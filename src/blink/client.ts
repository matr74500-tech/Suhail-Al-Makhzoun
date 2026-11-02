import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'inventory-arabic-app-jxlm95s8',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_Lo5hZoSDhAj_9O59YWZaab33qGrKoPxi',
  authRequired: false,
  auth: { mode: 'managed' },
})
