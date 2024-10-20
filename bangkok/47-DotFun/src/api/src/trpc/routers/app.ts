import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { publicProcedure, router } from '../trpc'
import { getUserDisplayName } from '../../repo/user'
import { RedisTool } from '../../service/redis'

export const appRouter = router({
  getApp: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id: appId } = input
      const app = await prisma.app.findUnique({
        where: { id: appId },
        include: {
          user: true,
          lastCommit: true,
          _count: {
            select: {
              forks: true,
              likes: true,
              commits: true,
            },
          },
        },
      })

      let user = app ? app.user : null
      if (!user) {
        const appUserId = await RedisTool.getAppUserId(appId)
        if (appUserId) {
          user = await prisma.user.findUnique({ where: { id: appUserId } })
        }
      }

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'App not found' })
      }

      const now = Date.now()
      return {
        id: appId,
        name: app?.name ?? '',
        description: app?.description ?? '',
        cover: app?.lastCommit?.snapshot ?? '/logo.svg',
        createdAt: app?.createdAt ?? now,
        updatedAt: app?.updatedAt ?? now,
        user: {
          id: user.id,
          username: user.username,
          displayName: getUserDisplayName(user),
          bio: user.bio,
          avatar: user.avatar ?? '/logo.svg',
        },
        commitCount: app?._count.commits ?? 0,
        forkCount: app?._count.forks ?? 0,
        likeCount: app?._count.likes ?? 0,
        viewCount: 0,
      }
    }),

  getAppCommits: publicProcedure
    .input(
      z.object({
        appId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const commits = await prisma.commit.findMany({
        where: { appId: input.appId },
        orderBy: { createdAt: 'desc' },
      })
      return commits.map((commit) => ({
        id: commit.id,
        createdAt: commit.createdAt,
        prompt: commit.prompt,
        code: commit.code,
        snapshot: commit.snapshot ?? '/logo.svg',
      }))
    }),

  getCommitById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const commit = await prisma.commit.findUnique({ where: { id: input.id } })
    if (!commit) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Commit not found' })
    }
    return {
      id: commit.id,
      appId: commit.appId,
      userId: commit.userId,
      prompt: commit.prompt,
      code: commit.code,
      snapshot: commit.snapshot ?? '/logo.svg',
      createdAt: commit.createdAt,
    }
  }),
})
