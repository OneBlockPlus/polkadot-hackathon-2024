import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

import { SENTRY_DSN } from '../constants'

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1,
    profilesSampleRate: 1,
  })
}
