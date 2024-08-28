import { usePrevious } from '@did-network/dapp-sdk'
import { useAtom } from 'jotai'
import { useEffect } from 'react'

import biu from '@/assets/images/click/biu.png'
import bg from '@/assets/images/click/click_bg.png'
import { cn } from '@/lib/utils'
import { clickCountAtom, useSonicClient } from '@/store'
import { START_TIME } from '@/utils/telegram'

export function ClickPanel() {
  const { sonicClient } = useSonicClient()
  const [count, setCount] = useAtom(clickCountAtom)
  const [position, setPosition] = useState<any>(null)
  const animationRef = useRef<any>(null)
  const containerRef = useRef<any>(null)

  const onClick = useCallback(() => setCount((count) => count + 1), [setCount])
  const prevCount = usePrevious(count)
  useEffect(() => {
    if (prevCount === undefined || count === 0) {
      return
    }
    setPosition(-100)
    const handler = setTimeout(async () => {
      if (!sonicClient.api.isAuthorized()) {
        return
      }
      const startTime = START_TIME
      const secret = 'sonic' + startTime.toString()
      const payloadString = startTime + 'soonic' + count
      const enc = new TextEncoder()
      const algorithm = { name: 'HMAC', hash: 'SHA-256' }
      const key = await crypto.subtle.importKey('raw', enc.encode(secret), algorithm, false, ['sign', 'verify'])
      const signature = await crypto.subtle.sign(algorithm.name, key, enc.encode(payloadString))
      const v = btoa(String.fromCharCode(...new Uint8Array(signature)))
      await sonicClient.api.submitClick({ count, startTime, v })
    }, 300)
    return () => clearTimeout(handler)
  }, [count, prevCount, sonicClient.api])

  useEffect(() => {
    if (position !== null) {
      const animate = () => {
        setPosition((prevPosition: any) => {
          const newPosition = prevPosition + 20
          if (newPosition > (containerRef.current?.clientWidth || 0) + 100) {
            cancelAnimationFrame(animationRef.current)
            return null
          }
          return newPosition
        })
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [position])

  return (
    <div className="flex-col-center h-40vh relative overflow-hidden" onClick={onClick} ref={containerRef}>
      <img src={bg} alt="" className="w-1/2" />
      <img src={biu} alt="" className={cn('w-1/4 flying-image')} style={{ left: `${position ?? -200}px` }} />
    </div>
  )
}
