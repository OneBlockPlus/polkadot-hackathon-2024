import { Profile } from '@/utils/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { comicFont } from '@/utils/fonts'

import { UpdateProfileDialog } from './UpdateProfileDialog'
import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ProfileCardProps {
  profile: Profile | undefined
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { userId } = useAuth()

  const isMyProfile = useMemo(() => {
    return userId === profile?.id
  }, [profile, userId])

  if (!profile) {
    return null
  }

  return (
    <div className="flex items-center flex-col shrink-0 w-80 rounded-md pt-10 pb-2 mx-8 bg-secondary h-fit">
      <img src={profile.avatar} className="size-20 overflow-hidden rounded-full object-cover" alt="" />
      <div className={cn(comicFont.className, 'pt-2 text-xl')}>{profile.displayName}</div>
      {isMyProfile && <UpdateProfileDialog profile={profile} />}
      <div className="text-foreground/80 text-xs flex-items-center justify-center flex pb-4 w-full line-clamp-3">
        {profile.bio}
      </div>

      <div className="text-foreground/60 text-xs">
        Joined on {profile.joinedAt && format(profile.joinedAt, 'dd/MM/yyyy')}
      </div>
      <div className="flex gap-2 w-full h-16 px-4 my-4">
        <div className="flex-1 bg-background rounded-md flex flex-col py-2 items-center justify-center gap-1">
          <div className="text-foreground/80 text-xs">Apps</div>
          <div className=""> {profile.appsCount}</div>
        </div>
        <div className="flex-1 bg-background rounded-md flex flex-col py-2 items-center justify-center gap-1">
          <div className="text-foreground/80 text-xs">Commits</div>
          <div className=""> {profile.commitsCount}</div>
        </div>
        <div className="flex-1 bg-background rounded-md flex flex-col py-2 items-center justify-center gap-1">
          <div className="text-foreground/80 text-xs">Likes</div>
          <div className=""> {profile.likesCount}</div>
        </div>
      </div>
    </div>
  )
}
