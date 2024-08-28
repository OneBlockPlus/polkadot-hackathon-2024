import { useNavigate } from 'react-router-dom'

import rightImg from '@/assets/images/earn/right.png'
import { Button } from '@/components/ui/button'

export function BackButton() {
  const nav = useNavigate()
  return (
    <Button className="flex-center text-lg mb-2 gap-x-1 px-2 py-2 bg-#210C40" variant="ghost" onClick={() => nav(-1)}>
      <img src={rightImg} alt="" className="transform-rotate-180 w-5" />
      BACK
    </Button>
  )
}
