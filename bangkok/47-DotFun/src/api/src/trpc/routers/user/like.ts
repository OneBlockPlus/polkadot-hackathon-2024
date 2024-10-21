import { protectedProcedure, router } from '../../trpc'
import { z } from 'zod'
import { prisma } from '../../../utils/prisma'

export const likeRouter = router({
  like: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user
      const { appId } = input
      const like = await prisma.like.upsert({
        where: { userId_appId: { userId, appId } },
        update: {},
        create: { userId, appId },
      })
      return { id: like.id }
    }),

  alreadyLiked: protectedProcedure.input(z.object({ appId: z.string() })).query(async ({ ctx, input }) => {
    const { userId } = ctx.user
    const { appId } = input
    const like = await prisma.like.findFirst({ where: { userId, appId } })
    return Boolean(like)
  }),

  unlike: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user
      const { appId } = input
      const { count } = await prisma.like.deleteMany({ where: { userId, appId } })
      return { count }
    }),
})
