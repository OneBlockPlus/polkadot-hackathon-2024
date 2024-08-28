import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import styles from './avatars.module.css'
import { cn } from '@/lib/utils'
import { TeamMember } from '@/generated/public/TeamMember'


export default function TeamMembers({ members }: { members: TeamMember[] }) {
  return (
    <div className={styles.avatars}>
      {members?.map((member) => (
        <Avatar
          key={member.id}
          className={cn('avatar h-9 w-9 sm:flex', styles.avatar)}>
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>{member.name}</AvatarFallback>
        </Avatar>
      ))}

    </div>
  )
}
