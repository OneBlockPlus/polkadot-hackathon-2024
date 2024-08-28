import { useOpenAuth } from '@open-auth/sdk-react'

import { LoginCard } from '@/openauth/components/LoginCard'
import { ProfileCard } from '@/openauth/components/ProfileCard'

export default function () {
  const { profile } = useOpenAuth()
  return (
    <div className="py-20">
      <div className="flex-center">{profile ? <ProfileCard /> : <LoginCard />}</div>
    </div>
  )
}
