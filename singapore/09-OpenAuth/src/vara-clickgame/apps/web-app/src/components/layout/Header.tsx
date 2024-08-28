import { UserAvatar } from '@/components/common/UserAvatar'

export function Header({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) {
  return (
    <div className="flex items-center gap-6 mb-4 font-mosaic">
      <UserAvatar src={icon} className="w-12 h-12 rounded" />
      <div>
        <div className="text-shadow text-4xl">{title}</div>
        <div className="text-xl text-#D0D0D0">{subtitle}</div>
      </div>
    </div>
  )
}
