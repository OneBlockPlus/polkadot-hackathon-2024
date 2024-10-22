import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { publicProcedure, router } from '../trpc'
import { Prisma } from '@prisma/client'
import { getUserDisplayName } from '../../repo/user'

export const homeRouter = router({
  listApps: publicProcedure
    .input(
      z.object({
        sortBy: z.enum(['forks', 'likes']).default('likes'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { sortBy, sortOrder, limit, cursor } = input

      const orderBy: Prisma.AppOrderByWithRelationInput[] = []
      if (sortBy === 'forks') {
        orderBy.push({ forks: { _count: sortOrder } })
      } else if (sortBy === 'likes') {
        orderBy.push({ likes: { _count: sortOrder } })
      }
      orderBy.push({ createdAt: 'desc' })

      const apps = await prisma.app.findMany({
        take: limit + 1,
        where: {},
        orderBy,
        cursor: cursor ? { id: cursor } : undefined,
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

      let nextCursor: typeof cursor | undefined = undefined
      if (apps.length > limit) {
        const nextItem = apps.pop()
        nextCursor = nextItem?.id
      }

      const items = apps.map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description,
        cover: app.lastCommit?.snapshot ?? '/logo.svg',
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        user: {
          id: app.user.id,
          username: app.user.username,
          displayName: getUserDisplayName(app.user),
          avatar: app.user.avatar,
        },
        commitCount: app._count.commits,
        forkCount: app._count.forks,
        likeCount: app._count.likes,
      }))

      return {
        items,
        nextCursor,
      }
    }),
  getMostCommitedApp: publicProcedure.query(async () => {
    const app = await prisma.app.findFirst({
      take: 1,
      orderBy: {
        commits: {
          _count: 'desc',
        },
      },
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
    if (!app) {
      return null
    }
    return {
      id: app.id,
      name: app.name,
      description: app.description,
      cover: app.lastCommit?.snapshot ?? '/logo.svg',
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      user: {
        id: app.user.id,
        username: app.user.username,
        displayName: getUserDisplayName(app.user),
        avatar: app.user.avatar,
      },
      commitCount: app._count.commits,
      forkCount: app._count.forks,
      likeCount: app._count.likes,
    }
  }),
})
