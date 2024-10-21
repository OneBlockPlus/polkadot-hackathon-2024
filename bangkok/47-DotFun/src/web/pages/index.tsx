import { trpc } from '@/utils/trpc'
import startPng from '@/assets/images/start.png'
import { AppCard } from '@/components/AppCard'
import MascotIcon from '@/assets/images/mascot.svg'
import { LayoutGroup, motion, useInView } from 'framer-motion'
import { IconLoader2 } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { comicFont } from '@/utils/fonts'

export default function Web() {
  const [sortBy, setSortBy] = useState<'likes' | 'forks'>('likes')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { data, hasNextPage, fetchNextPage, isFetching } = trpc.home.listApps.useInfiniteQuery(
    {
      limit: 20,
      sortBy,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: (prev) => prev,
    },
  )
  const { profile } = useAuth()
  const { data: kingOfCommits } = trpc.home.getMostCommitedApp.useQuery()
  const router = useRouter()
  const loadedApps = data?.pages.flatMap((page) => page.items) || []
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [category, setCategory] = useState<'All' | 'Featured'>('All')
  const { mutateAsync: createApp } = trpc.user.app.createApp.useMutation()

  const isInView = useInView(loadMoreRef)

  useEffect(() => {
    if (isInView) {
      if (hasNextPage) {
        fetchNextPage()
      }
    }
  }, [fetchNextPage, hasNextPage, isInView])

  const onStart = async () => {
    if (!profile) {
      toast('You need login first to create an App')
      return
    }
    const { appId } = await createApp()
    await router.push(`/apps/${appId}/edit`)
  }

  return (
    <div className="flex-col gap-4 flex px-2 lg:px-4 py-6 w-full">
      <div className="items-center w-full flex flex-col px-2 lg:px-6 pt-20">
        <div className="w-full flex justify-between flex-col lg:flex-row gap-2">
          <div className=" flex-grow border-b lg:mr-8 flex flex-col justify-end">
            <div className="flex gap-4 relative lg:w-fit w-full justify-between lg:justify-start h-12">
              <LayoutGroup>
                <div
                  className={cn(
                    'cursor-pointer flex-1 flex justify-center items-center py-1 text-primary/60 relative ',
                    category === 'All' && 'text-primary',
                  )}
                  onClick={() => setCategory('All')}
                >
                  All Apps
                  {category === 'All' && (
                    <motion.div layoutId="selected" className={cn('absolute w-full bg-neon h-[2px] bottom-0')} />
                  )}
                </div>
                <div
                  className={cn(
                    'cursor-pointer flex-1 flex justify-center items-center py-1 text-primary/60 relative',
                    category === 'Featured' && 'text-primary',
                  )}
                  onClick={() => setCategory('Featured')}
                >
                  Featured
                  {category === 'Featured' && (
                    <motion.div layoutId="selected" className={cn('absolute w-full bg-neon h-[2px] bottom-0 ')} />
                  )}
                </div>
              </LayoutGroup>
            </div>
          </div>

          {category === 'All' && (
            <div className="flex gap-4 shrink-0 justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger className="border px-2 py-2 rounded-md text-sm text-nowrap  flex-1 border-foreground/20">
                  <div className="flex items-center gap-2">
                    <span>Sort By: {sortBy === 'likes' ? 'Stars' : 'Forks'}</span>
                    <ChevronDownIcon />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSortBy('likes')}> Stars </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy('forks')}> Forks </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="border px-2 py-2 rounded-md text-sm text-nowrap flex-1 border-foreground/20">
                  <div className="flex items-center gap-2">
                    <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    <ChevronDownIcon />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSortOrder('asc')}> Ascending </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortOrder('desc')}> Descending </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full mt-6 px-2 lg:px-4">
          {loadedApps.map((app) => (
            <AppCard key={app.id} {...app} />
          ))}
        </div>
        <motion.div ref={loadMoreRef} className="pt-4 w-full">
          {isFetching ? (
            <div className="flex gap-2 items-center justify-center">
              <span className=" animate-spin">{<IconLoader2 size={20} />}</span>
              Loading more...
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-full relative">
              <hr className="w-full h-px my-8 bg-neon border-0 " />
              <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-neon rounded-md left-1/2">
                End of the list
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
