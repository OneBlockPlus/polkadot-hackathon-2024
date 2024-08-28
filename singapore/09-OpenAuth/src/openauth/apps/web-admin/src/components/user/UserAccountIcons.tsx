import type { User } from '@open-auth/sdk-core'
import { IconBrandDiscord, IconBrandGithub, IconBrandGoogle, IconBrandTelegram, IconBrandTiktok, IconCurrencyEthereum, IconCurrencySolana, IconMail, IconMoodSmileBeam, IconPasswordUser } from '@tabler/icons-react'

export function UserAccountIcons({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-1">
      {user.email && <IconMail size={20} />}
      {user.google && <IconBrandGoogle size={20} />}
      {user.discord && <IconBrandDiscord size={20} />}
      {user.github && <IconBrandGithub size={20} />}
      {user.tiktok && <IconBrandTiktok size={20} />}
      {user.huggingface && <IconMoodSmileBeam size={20} />}
      {user.telegram && <IconBrandTelegram size={20} />}
      {user.ethAddress && <IconCurrencyEthereum size={20} />}
      {user.solAddress && <IconCurrencySolana size={20} />}
      {user.username && <IconPasswordUser size={20} />}
    </div>
  )
}
