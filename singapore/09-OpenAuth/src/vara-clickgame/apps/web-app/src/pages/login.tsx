import { useLogInWithTikTok } from '@open-auth/sdk-react'

import VaraIcon from '@/assets/images/tabs/v.png'
import TikTokIcon from '@/assets/images/tiktok.png'
import { Button } from '@/components/ui/button'

export default function () {
  const { loading, logInWithTikTok } = useLogInWithTikTok()

  const onLogin = useCallback(() => {
    logInWithTikTok()
  }, [logInWithTikTok])
  return (
    <div className="h-90vh flex-col-center px-6 pb-16">
      <img src={VaraIcon} alt="" className="w-32 h-32 mb-4" />
      <div className="text-3xl font-bold mb-12">Vara Wallet</div>
      <Button
        onClick={onLogin}
        className="bg-#000000 text-white border w-full py-6 text-lg gap-x-1 mb-10"
        disabled={loading}
      >
        <img src={TikTokIcon} className="w-10 h-10" alt="" />
        <div>Log In With TikTok</div>
      </Button>

      <div className="absolute bottom-10 flex justify-between w-full left-0 px-4 text-sm underline">
        <a target="_blank" href="https://www.termsfeed.com/live/b402aa5d-ccc7-4018-b691-56480be3d691">
          Terms of Service
        </a>
        <a target="_blank" href="https://www.termsfeed.com/live/42420f56-808f-4601-943e-323459d8db5e">
          Privacy Policy
        </a>
      </div>
    </div>
  )
}
