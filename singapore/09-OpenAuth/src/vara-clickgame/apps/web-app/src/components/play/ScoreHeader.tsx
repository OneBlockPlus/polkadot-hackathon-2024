import { useAtomValue } from 'jotai'

import homeImg from '@/assets/images/header/v.png'
import { useProfile } from '@/hooks/api'
import { clickCountAtom } from '@/store'
import { START_TIME } from '@/utils/telegram'

export function ScoreHeader() {
  const clickCount = useAtomValue(clickCountAtom)
  const profile = useProfile()

  const clickNumer = useMemo(() => {
    if (!profile) {
      return '-'
    }
    const clicks = profile.clicks
    const isSame = clicks.bufferStartTime === START_TIME
    console.debug('isSame', isSame, clicks.bufferStartTime, START_TIME)
    return clickCount + (isSame ? clicks.count - clicks.bufferCount : clicks.count)
  }, [clickCount, profile])

  return (
    <div className="mx-4 py-2 flex-center text-black bg-#0E0E0E text-4xl font-400 border border-$primary rounded-xl text-shadow gap-4">
      <img src={homeImg} className="w-16 h-16 mx-4" alt="" />
      <div className="flex-1 font-mosaic">
        <div>Your Points:</div>
        <div>{clickNumer}</div>
      </div>
    </div>
  )
}
