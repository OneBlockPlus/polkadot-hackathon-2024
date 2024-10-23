import { _testRouter, router } from './trpc'
import { appRouter as app } from './routers/app'
import { authRouter as auth } from './routers/auth'
import { healthRouter as health } from './routers/health'
import { homeRouter as home } from './routers/home'
import { userRouter as user } from './routers/user'

export const appRouter = router({ app, auth, health, home, user })

export const testRouter = _testRouter({ app, auth, health, home, user })

export type AppRouter = typeof appRouter
