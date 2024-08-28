import { Avatar, AvatarImage } from '@/components/ui/avatar'
import PokaDotAvatar from '@/app/acme/layouts/PolkaDotAvatar'
import { auth } from '@/auth/auth'


export default async function UserAvatar() {
  const session = await auth()
  return (
    <div>
      <Avatar className="h-6 w-6 sm:flex">
        {session?.user.public_address ?
          <PokaDotAvatar address={session?.user.public_address} />:
          <AvatarImage src="/avatars/01.png" alt="Avatar" />}
      </Avatar>
    </div>
  )
}