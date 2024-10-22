import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { protectedProcedure, router } from '../../trpc'
import { sha256 } from '../../../utils/crypto'
import { commitQueue } from '../../../queue/queue'
import { RedisTool } from '../../../service/redis'

export const appRouter = router({
  createApp: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.user
    const appId = sha256(`${userId}-${Date.now()}`).slice(0, 20)
    await RedisTool.setAppUserId(appId, userId)
    return { appId }
  }),
  createCommit: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        prompt: z.string().min(1).max(30000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user
      const { appId, prompt } = input

      let app = await prisma.app.findUnique({ where: { id: appId } })
      if (app === null) {
        const appUserId = await RedisTool.getAppUserId(appId)
        if (appUserId === userId) {
          app = await prisma.app.create({ data: { id: appId, userId } })
        } else {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'App not found' })
        }
      }

      if (app.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create a commit for this app',
        })
      }

      const commit = await prisma.commit.create({ data: { appId: app.id, userId, prompt } })
      const job = await commitQueue.add({ commitId: commit.id })
      return { commitId: commit.id, jobId: job.id }
    }),

  forkApp: protectedProcedure
    .input(
      z.object({
        appId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user
      const sourceApp = await prisma.app.findUnique({
        where: { id: input.appId },
        include: { lastCommit: true },
      })
      if (!sourceApp) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Source app not found' })
      }

      const appId = sha256(`${userId}-${Date.now()}`).slice(0, 20)
      const newApp = await prisma.app.create({
        data: {
          id: appId,
          name: sourceApp.name,
          description: sourceApp.description,
          userId,
          upstreamAppId: sourceApp.id,
        },
      })

      if (sourceApp.lastCommit) {
        const commit = await prisma.commit.create({
          data: {
            ...sourceApp.lastCommit,
            id: undefined,
            createdAt: undefined,
            appId: newApp.id,
            userId,
          },
        })
        await prisma.app.update({
          where: { id: newApp.id },
          data: { lastCommitId: commit.id },
        })
      }

      return { appId }
    }),
})
