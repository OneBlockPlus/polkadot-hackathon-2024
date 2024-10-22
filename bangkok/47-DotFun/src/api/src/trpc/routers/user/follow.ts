import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { protectedProcedure, router } from '../../trpc'

export const followRouter = router({
  follow: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId: followerId } = ctx.user
      const { userId: followingId } = input
      if (followerId === input.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot follow yourself' })
      }
      const follow = await prisma.follow.create({
        data: { followerId, followingId },
      })
      return {
        followingId: follow.followingId,
        followerId: follow.followerId,
      }
    }),

  unfollow: protectedProcedure
    .input(
      z.object({
        followingId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user
      const { count } = await prisma.follow.deleteMany({
        where: {
          followerId: userId,
          followingId: input.followingId,
        },
      })
      return { count }
    }),
})
