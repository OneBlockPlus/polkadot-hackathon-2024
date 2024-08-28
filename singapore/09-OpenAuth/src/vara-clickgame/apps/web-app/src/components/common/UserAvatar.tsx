import avatarImg from '@/assets/images/avatar.png'
import { cn } from '@/lib/utils'

export function UserAvatar({ className = '', src = '' }: { className?: string; src?: string }) {
  return <img src={src.length > 0 ? src : avatarImg} alt="" className={cn('w-10 h-10 rounded-lg', className)} />
}
