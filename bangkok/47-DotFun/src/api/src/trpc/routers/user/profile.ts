import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { protectedProcedure, publicProcedure, router } from '../../trpc'
import { TRPCError } from '@trpc/server'
import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns'
import { getUserDisplayName } from '../../../repo/user'

export const profileRouter = router({
  getProfile: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const id = input.id ?? ctx.user?.userId
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          apps: { include: { lastCommit: true } },
          commits: { include: { app: true } },
          likes: true,
          followings: true,
          followers: true,
          _count: {
            select: {
              likes: true,
              commits: true,
              apps: true,
            },
          },
        },
      })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Generate activities from commits
      const activities = user.commits.map((commit) => ({
        title: `Made a commit to ${commit.app.name}`,
        createdAt: commit.createdAt,
      }))

      // Generate heatmap data
      const today = new Date()
      const oneYearAgo = subDays(today, 365)
      const commitsByDate = await prisma.commit.groupBy({
        by: ['createdAt'],
        where: {
          userId: user.id,
          createdAt: { gte: startOfDay(oneYearAgo) },
        },
        _count: { id: true },
      })

      const commitCountByDate = new Map(commitsByDate.map((i) => [format(i.createdAt, 'yyyy-MM-dd'), i._count.id]))

      const activitiesHeatmap = eachDayOfInterval({
        start: oneYearAgo,
        end: today,
      }).map((date) => ({
        date: format(date, 'yyyy-MM-dd'),
        count: commitCountByDate.get(format(date, 'yyyy-MM-dd')) ?? 0,
      }))

      return {
        id: user.id,
        avatar: user.avatar ?? '/logo.svg',
        username: user.username,
        displayName: getUserDisplayName(user),
        bio: user.bio,
        joinedAt: user.createdAt,
        polkadotWallet: user.polkadotWallet,
        appsCount: user._count.apps,
        commitsCount: user._count.commits,
        likesCount: user._count.likes,
        apps: user.apps.map((app) => ({
          cover: app.lastCommit?.snapshot ?? '/logo.svg',
          id: app.id,
          name: app.name,
          description: app.description,
          commitCount: 0,
          forkCount: 0,
          likeCount: 0,
          user: {
            id: user.id,
            username: user.username,
            displayName: getUserDisplayName(user),
            avatar: user.avatar,
          },
        })),
        activities,
        activitiesHeatmap,
      }
    }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        avatar: z.string().optional(),
        username: z.string().optional(),
        bio: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user
      const updatedUser = await prisma.user.update({ where: { id: userId }, data: input })
      return { ...updatedUser }
    }),
})
