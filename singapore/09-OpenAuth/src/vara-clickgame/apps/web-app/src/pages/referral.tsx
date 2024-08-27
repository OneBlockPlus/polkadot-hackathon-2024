import rightImg from '@/assets/images/earn/right.png'
import icon from '@/assets/images/header/leaderboard.png'
import chestImg from '@/assets/images/referral/chest.png'
import earnImg from '@/assets/images/tabs/earn.png'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Header } from '@/components/layout/Header'
import { useProfile, useReferrals } from '@/hooks/api'
import { APP_ID, IS_TELEGRAM } from '@/utils/telegram'

export default function () {
  const referrals = useReferrals()
  const profile = useProfile()

  if (!profile || !referrals) {
    return null
  }

  return (
    <>
      <Header title="Referral" subtitle="Invite friends to play and earn!" icon={icon} />
      <div className="h-full w-full">
        <a
          target="_blank"
          href={
            IS_TELEGRAM
              ? `https://t.me/share/url?url=https://t.me/${APP_ID}?start=${profile.openauth.referCode}`
              : `https://t.me/${APP_ID}?start=${profile.openauth.referCode}`
          }
          className="bg-#2A2E48 border border-$primary pl-4 pr-1 py-3 flex-row flex-center rounded-lg"
        >
          <div className="flex-1 text-left flex items-center gap-x-4">
            <img src={chestImg} alt="" className="w-10" />
            <div className="flex flex-col gap-y-2">
              <div className="text-lg font-bold leading-none">Invite a friend</div>
              <div className="flex items-center gap-x-1 text-sm font-bold leading-none">
                <img src={earnImg} className="w-4" alt="" />
                <span className="text-$primary">+2000</span>
                <span className="opacity-50">per verified invitation</span>
              </div>
            </div>
          </div>
          <img src={rightImg} className="w-6" alt="" />
        </a>
        <div className="mt-12">
          <div className="text-xl font-bold mb-4 flex-center justify-between">
            <div>Total Rewards:</div>
            <div className="text-$primary flex-center gap-x-1">
              <img src={earnImg} alt="" className="h-6" />
              {referrals.meta.totalUser * 2000}
            </div>
          </div>
          {referrals.data.length === 0 && (
            <div className="bg-#2A2E48 border border-white px-4 py-3 flex-row flex-center rounded-lg">
              <div className="py-2 font-bold">You haven't invited anyone yet</div>
            </div>
          )}
          <div className="h-full text-lg font-bold w-full">
            {referrals.data.map((row) => (
              <div
                key={row.username}
                className="bg-#2A2E48 border border-white mb-4 px-4 py-3 flex-row flex-center rounded-lg"
              >
                <div className="flex-1 text-left flex justify-between items-center gap-x-4">
                  <div className="flex-center gap-x-2">
                    <UserAvatar src={row.avatar} />
                    {row.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
