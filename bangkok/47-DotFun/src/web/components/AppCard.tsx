import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { IconGitFork, IconStar } from '@tabler/icons-react'
import { CommitIcon } from '@radix-ui/react-icons'
import { comicFont } from '@/utils/fonts'

interface Props extends HTMLAttributes<HTMLDivElement> {
  id: string
  name: string | null
  description: string | null
  cover: string
  user: {
    id: string
    username: string | null
    displayName: string | null
    avatar: string | null
  }
  commitCount: number
  forkCount: number
  likeCount: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const AppCard = forwardRef<HTMLDivElement, Props>(
  ({ name, description, id, cover, forkCount, likeCount, commitCount, user, className, size = 'md' }: Props, ref) => {
    return (
      <Link href={`/apps/${id}`}>
        <Card
          className={cn(
            'overflow-hidden bg-background hover:bg-secondary transition-all cursor-pointer hover:shadow-lg border-0 ring-0 ring-brickred',
            className,
          )}
          ref={ref}
        >
          <CardContent className={cn('py-4 w-full', size === 'sm' && 'px-2')}>
            <div className="flex gap-3  w-full ">
              <div
                className={cn(
                  'size-24 lg:size-40 flex items-center rounded-lg overflow-hidden flex-shrink-0',
                  size === 'sm' && '!size-24',
                )}
              >
                <img className="object-cover size-full" src={cover} alt="" />
              </div>
              <div className={cn('flex flex-col gap-1 h-24 lg:h-40 flex-1 overflow-hidden', size === 'sm' && '!h-24')}>
                <div className={cn(comicFont.className, 'font-bold text-2xl shrink-0 truncate')}>{name ?? '-'}</div>
                <div className="text-sm text-secondary-foreground/70 shrink-0">
                  Created by: <span className="text-foreground">{user.displayName}</span>
                </div>
                <p className="line-clamp-3 w-full text-sm text-foreground/70">{description}</p>
                <div className="flex w-full items-center justify-between py-1 gap-1">
                  <div
                    className={cn(
                      'flex text-nowrap bg-background flex-1  items-center text-sm justify-center gap-1 rounded-md px-2 py-1',
                      size === 'sm' && 'text-xs px-1',
                    )}
                  >
                    <CommitIcon className="w-5 h-5 text-neon" />
                    <span className="text-foreground font-bold ">{commitCount}</span>
                    <span className="text-foreground/70 ">Commits</span>
                  </div>
                  <div
                    className={cn(
                      'flex text-nowrap bg-background flex-1  items-center text-sm justify-center gap-1 rounded-md px-2 py-1',
                      size === 'sm' && 'text-xs px-1',
                    )}
                  >
                    <IconGitFork className="w-5 h-5 text-neon" />
                    <span className="text-foreground font-bold">{forkCount}</span>
                    <span className={cn('text-foreground/70 ')}>Forks</span>
                  </div>
                  <div
                    className={cn(
                      'flex text-nowrap bg-background flex-1  items-center text-sm justify-center gap-1 rounded-md px-2 py-1',
                      size === 'sm' && 'text-xs px-1',
                    )}
                  >
                    <IconStar className="w-5 h-5 text-neon" />
                    <span className="text-foreground  font-bold ">{likeCount}</span>
                    <span className="text-foreground/70 ">Stars</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  },
)
