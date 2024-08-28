import icon from '@/assets/images/header/leaderboard.png'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Header } from '@/components/layout/Header'
import { useLeaderboard, useProfile } from '@/hooks/api'
import { cn } from '@/lib/utils'

export default function () {
  const leaderboard = useLeaderboard()
  const profile = useProfile()
  if (!leaderboard || !profile) {
    return null
  }

  return (
    <>
      <Header title="Leaderboard" subtitle={`Total users: ${leaderboard.meta.totalUser}`} icon={icon} />
      <div className="h-full text-lg w-full text-lg flex flex-col gap-y-4 mb-16">
        {leaderboard.data.map((row, index) => (
          <Row row={row} rank={index + 1} key={`leaderboard-${index}`} />
        ))}
      </div>
      <div className="fixed w-full left-0 bottom-26 px-2">
        <Row
          row={{ avatar: profile.openauth.avatar ?? '', username: profile.username ?? '', points: profile.points }}
          rank={leaderboard.meta.myRanking}
          isSelf={true}
        />
      </div>
    </>
  )
}

function Row({
  rank,
  row,
  isSelf = false,
}: {
  row: { avatar: string; username: string; points: number }
  rank: number
  isSelf?: boolean
}) {
  return (
    <div
      className={cn(
        ' border px-4 py-3 flex-row flex-center rounded-lg',
        isSelf ? 'border-$primary bg-#0C0C2A' : 'border-white bg-[#212155ff]'
      )}
    >
      <div className="flex-1 text-left flex items-center gap-x-2">
        <div
          className={cn(
            'font-bold w-10 flex-col-center leading-tight',
            isSelf ? 'text-shadow-sm-primary' : 'text-shadow-sm'
          )}
        >
          <div>No.</div>
          <div>{rank >= 100 ? '100+' : rank}</div>
        </div>
        <UserAvatar src={row.avatar} />
        <div className="font-bold text-ellipsis ">{row.username}</div>
      </div>
      <div className="flex items-center justify-end font-bold">{row.points}</div>
    </div>
  )
}
