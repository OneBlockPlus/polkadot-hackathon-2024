import { initTRPC, TRPCError } from '@trpc/server'
import SuperJSON from 'superjson'
import { Context, InnerContext } from './context'
import { UserRole } from '@repo/schema'

export const { router, procedure: publicProcedure } = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape
  },
})

export const { router: _testRouter } = initTRPC.context<InnerContext>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape
  },
})

export const protectedProcedure = publicProcedure.use((opts) => {
  const { ctx } = opts
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next({ ctx: { user: ctx.user } })
})

export const adminProtectedProcedure = publicProcedure.use((opts) => {
  const { ctx } = opts
  if (!ctx.user || ![UserRole.Admin, UserRole.SuperAdmin].includes(ctx.user.userRole)) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next({ ctx: { user: ctx.user } })
})
