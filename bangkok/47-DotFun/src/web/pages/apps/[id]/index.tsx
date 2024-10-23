import AppSandbox from '@/components/AppSandbox'
import { trpc } from '@/utils/trpc'
import { format } from 'date-fns'
import { IconEdit, IconGitFork, IconHeart, IconHeartFilled, IconShare } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { ScrollArea } from '@/components/ui/scroll-area'
import ActivityCalendar from 'react-activity-calendar'
import { CollapsibleSection } from '@/components/CollapsibleSection'

import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { comicFont } from '@/utils/fonts'
import { useIsMyApp } from '@/hooks/useIsMyApp'
import { useCallback } from 'react'
import { skipToken } from '@tanstack/react-query'

export default function AppDetail() {
  const router = useRouter()
  const { userId } = useAuth()
  const { id } = router.query as { id?: string }
  const { isMyOwnApp } = useIsMyApp(id)
  const { data: app } = trpc.app.getApp.useQuery(id ? { id } : skipToken)
  const trpcUtils = trpc.useUtils()
  const { data: commits } = trpc.app.getAppCommits.useQuery(id ? { appId: id } : skipToken, {
    select: (data) => [...data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())],
  })
  const { mutateAsync: forkApp } = trpc.user.app.forkApp.useMutation()
  const { data: liked } = trpc.user.like.alreadyLiked.useQuery(userId && id ? { appId: id } : skipToken)
  const { mutate: likeApp, isPending: isLikeActionPending } = trpc.user.like.like.useMutation({
    onSettled: async (_, __, variables) => {
      await Promise.all([
        trpcUtils.user.like.alreadyLiked.refetch(variables),
        trpcUtils.app.getApp.refetch({ id: variables.appId }),
      ])
    },
  })
  const { mutate: unlikeApp, isPending: isUnlikeActionPending } = trpc.user.like.unlike.useMutation({
    onSettled: async (_, __, variables) => {
      await Promise.all([
        trpcUtils.user.like.alreadyLiked.refetch(variables),
        trpcUtils.app.getApp.refetch({ id: variables.appId }),
      ])
    },
  })

  const onForkApp = useCallback(async () => {
    try {
      const { appId } = await forkApp({
        appId: id,
      })
      if (appId) {
        await router.push(`/apps/${appId}`)
      }
    } catch (e) {
      console.error(e)
    }
  }, [forkApp, id, router])

  const onEditeApp = useCallback(async () => {
    await router.push(`/apps/${id}/edit`)
  }, [id, router])

  if (!id) {
    return null
  }

  return (
    <div className="flex h-full gap-2 py-4 flex-col lg:flex-row">
      <div className="flex-1 flex flex-col gap-2 px-3 lg:px-8">
        {app && commits && (
          <ScrollArea className="px-2 lg:px-4">
            {/* title and created at */}
            <div className="flex gap-6 items-center">
              <img src={app.cover} className="object-cover size-32 overflow-hidden rounded-md shrink-0" alt="" />
              <div className="flex flex-col">
                <div className={cn(comicFont.className, 'font-bold text-3xl py-2')}>{app?.name}</div>
                <div className="text-sm flex gap-1">
                  <span className="text-foreground/60">Created On:</span>
                  <span>{format(app?.createdAt, 'MM/dd/yyyy, hh:mm:ss a')}</span>
                </div>
                <div className="flex gap-3 py-2 flex-wrap lg:flex-nowrap">
                  <button
                    className="border px-4 py-2 rounded-md text-sm  border-foreground/20 "
                    onClick={() => {
                      if (isLikeActionPending || isUnlikeActionPending) {
                        return
                      }
                      if (!userId) {
                        toast('Log in first')
                        return
                      }
                      if (liked) {
                        unlikeApp({ appId: id })
                      } else {
                        likeApp({ appId: id })
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isLikeActionPending || isUnlikeActionPending ? (
                        isLikeActionPending ? (
                          <IconHeartFilled className=" text-red-500" />
                        ) : (
                          <IconHeart />
                        )
                      ) : liked ? (
                        <IconHeartFilled className=" text-red-500" />
                      ) : (
                        <IconHeart />
                      )}

                      <span>{liked ? 'Unlike' : 'Like'}</span>
                    </div>
                  </button>

                  <button
                    className="border px-4 py-2 rounded-md text-sm  border-foreground/20 "
                    onClick={async () => {
                      if (!userId) {
                        toast('Login first to perform operation')
                        return
                      }
                      if (isMyOwnApp) {
                        await onEditeApp()
                      } else {
                        await onForkApp()
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isMyOwnApp ? (
                        <>
                          <IconEdit />
                          <span>Edit</span>
                        </>
                      ) : (
                        <>
                          <IconGitFork />
                          <span>Fork</span>
                        </>
                      )}
                    </div>
                  </button>

                  <button className="border px-4 py-2 rounded-md text-sm  border-foreground/20 ">
                    <div className="flex items-center gap-2">
                      <IconShare />
                      <span>Share</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {/* description */}
            <CollapsibleSection header="Description">
              <div className="p-4 bg-secondary rounded-sm text-foreground/60">{app.description}</div>
            </CollapsibleSection>

            {/* Statistics */}
            <CollapsibleSection header="Statistics">
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-secondary rounded-md flex-1">
                  <span className="text-foreground/60 text-sm ">Commits</span>
                  <div>{app.commitCount}</div>
                </div>
                <div className="px-4 py-2 bg-secondary rounded-md flex-1">
                  <span className="text-foreground/60 text-sm ">Likes</span>
                  <div>
                    {isLikeActionPending
                      ? app.likeCount + 1
                      : isUnlikeActionPending
                        ? app.likeCount - 1
                        : app.likeCount}
                  </div>
                </div>
                <div className="px-4 py-2 bg-secondary rounded-md flex-1">
                  <span className="text-foreground/60 text-sm ">Forks</span>
                  <div>{app.forkCount}</div>
                </div>
                <div className="px-4 py-2 bg-secondary rounded-md flex-1">
                  <span className="text-foreground/60 text-sm truncate">Current Viewers</span>
                  <div>{app.viewCount}</div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Creater */}
            <CollapsibleSection header="Creator">
              <Link href={`/users/${app.user.id}`}>
                <div className="flex gap-4 p-4 bg-secondary rounded-md cursor-pointer">
                  <img src={app.user.avatar} className="size-20 overflow-hidden rounded-full object-cover" alt="" />
                  <div className="flex flex-col">
                    <div className="text-xl"> {app.user.displayName}</div>
                    <div className="text-foreground/60">Creator</div>
                    <div className="py-2">{app.user.bio}</div>
                  </div>
                </div>
              </Link>
            </CollapsibleSection>

            {/* Recent Commits */}
            <CollapsibleSection header="Recent Commits">
              <div className="flex flex-col w-width gap-2">
                {commits.map((commit) => (
                  <div className="flex gap-4 p-4 bg-secondary rounded-md items-center" key={commit.id}>
                    <img
                      src={commit.snapshot}
                      className="size-20 overflow-hidden rounded-md object-cover shrink-0"
                      alt=""
                    />
                    <div className="flex flex-col text-foreground/60">
                      <div className="text-sm break-all">{commit.prompt}</div>
                      <div className="py-2 text-xs">{format(commit.createdAt, 'MM/dd/yyyy, hh:mm:ss a')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Commit Activity */}
            <CollapsibleSection header="Commit Activity">
              <div className="flex items-center w-full bg-secondary p-4 rounded-md [&>*:first-child]:w-full ">
                <ActivityCalendar
                  hideTotalCount={true}
                  hideColorLegend={true}
                  theme={{
                    light: ['hsla(0,0%,98%,0.2)', 'hsl(148,61%,57%)'],
                    dark: ['hsla(0,0%,98%,0.2)', 'hsl(148,61%,57%)'],
                  }}
                  data={Array.from(
                    commits
                      .reduce(
                        (prev, curr) => {
                          const date = format(curr.createdAt, 'yyyy-MM-dd')
                          prev.set(date, (prev.get(date) ?? 0) + 1)
                          return prev
                        },
                        new Map<string, number>(
                          Array.from({ length: 365 }, (_, i) => [
                            format(Date.now() - i * 24 * 60 * 60 * 1000, 'yyyy-MM-dd'),
                            0,
                          ]),
                        ),
                      )
                      .entries(),
                  )
                    .map(([date, count]) => ({ date, count, level: Math.min(4, count) }))
                    .sort((a, b) => a.date.localeCompare(b.date))}
                />
              </div>
            </CollapsibleSection>
          </ScrollArea>
        )}
      </div>
      <div className="flex-1">
        <AppSandbox appId={id} />
      </div>
    </div>
  )
}
