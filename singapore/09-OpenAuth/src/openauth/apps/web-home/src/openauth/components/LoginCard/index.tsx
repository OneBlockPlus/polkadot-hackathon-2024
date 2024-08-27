import { useLogInWithDiscord, useLogInWithEthereum, useLogInWithGithub, useLogInWithGoogle, useLogInWithHuggingface, useLogInWithSolana, useLogInWithTikTok, useOpenAuth } from '@open-auth/sdk-react'
import { IconBrandDiscord, IconBrandGithub, IconBrandGoogle, IconBrandTelegram, IconBrandTiktok, IconCurrencyEthereum, IconCurrencySolana, IconLoader2, IconMoodSmileBeam, IconUser } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function LoginCard() {
  const { globalConfig } = useOpenAuth()
  const { logInWithEthereum, loading: loadingETH } = useLogInWithEthereum()
  const { logInWithSolana, loading: loadingSOL } = useLogInWithSolana()
  const { logInWithGoogle, loading: loadingGoogle } = useLogInWithGoogle()
  const { logInWithDiscord, loading: loadingDiscord } = useLogInWithDiscord()
  const { logInWithTikTok, loading: loadingTikTok } = useLogInWithTikTok()
  const { logInWithGithub, loading: loadingGithub } = useLogInWithGithub()
  const { logInWithHuggingface, loading: loadingHuggingface } = useLogInWithHuggingface()

  const onConnectETH = useCallback(async () => {
    try {
      await logInWithEthereum()
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [logInWithEthereum])
  const onConnectSOL = useCallback(async () => {
    try {
      await logInWithSolana()
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [logInWithSolana])

  const onConnectGG = useCallback(async () => {
    try {
      logInWithGoogle()
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [logInWithGoogle])

  const onConnectDiscord = useCallback(async () => {
    try {
      logInWithDiscord()
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [logInWithDiscord])

  const onConnectTikTok = useCallback(async () => {
    try {
      logInWithTikTok()
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [logInWithTikTok])

  const onConnectGithub = useCallback(async () => {
    try {
      logInWithGithub()
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [logInWithGithub])

  const onConnectHF = useCallback(async () => {
    try {
      logInWithHuggingface()
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [logInWithHuggingface])

  return (
    <Card className="px-16 py-10 shadow">
      <CardHeader>
        <CardTitle className="text-2xl">
          <span className="font-400">Welcome to</span>
          {' '}
          <span className="font-bold">{globalConfig?.brand}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="mx-auto flex flex-col items-center justify-center gap-4">
        <Button className="w-full px-6 py-6 text-base" onClick={onConnectSOL} disabled={loadingSOL}>
          <div className="w-50 flex items-center justify-start gap-2">
            {loadingSOL ? <IconLoader2 size={20} className="animate-spin" /> : <IconCurrencySolana size={20} />}
            <span>Sign in with Solana</span>
          </div>
        </Button>
        <Button className="w-full px-6 py-6 text-base" onClick={onConnectETH} disabled={loadingETH}>
          <div className="w-50 flex items-center justify-start gap-2">
            {loadingETH ? <IconLoader2 size={20} className="animate-spin" /> : <IconCurrencyEthereum size={20} />}
            <span>Sign in with Ethereum</span>
          </div>
        </Button>
        <Button className="w-full px-6 py-6 text-base" onClick={onConnectGG} disabled={loadingGoogle}>
          <div className="w-50 flex items-center justify-start gap-2">
            {loadingGoogle ? <IconLoader2 size={20} className="animate-spin" /> : <IconBrandGoogle size={20} />}
            <span>Sign in with Google</span>
          </div>
        </Button>
        <Button className="w-full px-6 py-6 text-base" onClick={onConnectDiscord} disabled={loadingDiscord}>
          <div className="w-50 flex items-center justify-start gap-2">
            {loadingDiscord ? <IconLoader2 size={20} className="animate-spin" /> : <IconBrandDiscord size={20} />}
            <span>Sign in with Discord</span>
          </div>
        </Button>
        <Button className="w-full px-6 py-6 text-base" onClick={onConnectTikTok} disabled={loadingTikTok}>
          <div className="w-50 flex items-center justify-start gap-2">
            {loadingTikTok ? <IconLoader2 size={20} className="animate-spin" /> : <IconBrandTiktok size={20} />}
            <span>Sign in with TikTok</span>
          </div>
        </Button>
        <Button className="w-full px-6 py-6 text-base" onClick={onConnectGithub} disabled={loadingGithub}>
          <div className="w-50 flex items-center justify-start gap-2">
            {loadingGithub ? <IconLoader2 size={20} className="animate-spin" /> : <IconBrandGithub size={20} />}
            <span>Sign in with GitHub</span>
          </div>
        </Button>
        <Button className="w-full px-6 py-6 text-base" onClick={onConnectHF} disabled={loadingHuggingface}>
          <div className="w-50 flex items-center justify-start gap-2">
            {loadingHuggingface ? <IconLoader2 size={20} className="animate-spin" /> : <IconMoodSmileBeam size={20} />}
            <span>Sign in with HF</span>
          </div>
        </Button>
        <TelegramDialog />
        <UsernameDialog />
      </CardContent>
    </Card>
  )
}

export function TelegramDialog() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState('')
  const { config, client, logIn } = useOpenAuth()

  const onLogInTelegram = useCallback(async () => {
    setLoading(true)
    try {
      const { token } = await client.user.logInWithTelegram({ appId: config.appId, data })
      logIn(token)
    } catch (error: any) {
      toast.error(error.message)
    }
    setLoading(false)
  }, [client.user, config.appId, data, logIn])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full px-6 py-6 text-base">
          <div className="w-50 flex items-center justify-start gap-2">
            {loading ? <IconLoader2 size={20} className="animate-spin" /> : <IconBrandTelegram size={20} />}
            <span>Sign in with Telegram</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input Telegram Mini App initData</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input value={data} onChange={e => setData(e.target.value)} className="w-full" />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onLogInTelegram} disabled={loading}>
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type LoginType = 'login' | 'register'

export function UsernameDialog() {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<LoginType>('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { config, client, logIn } = useOpenAuth()

  const onLogInUsername = useCallback(async () => {
    setLoading(true)
    try {
      const { token } = await client.user.logInWithUsername({ appId: config.appId, username, password, type })
      logIn(token)
    } catch (error: any) {
      console.error(error)
    }
    setLoading(false)
  }, [client.user, config.appId, username, password, type, logIn])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full px-6 py-6 text-base">
          <div className="w-50 flex items-center justify-start gap-2">
            {loading ? <IconLoader2 size={20} className="animate-spin" /> : <IconUser size={20} />}
            <span>Sign in with Username</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input username and password</DialogTitle>
        </DialogHeader>
        <div className="flex-col-center gap-y-4 py-4">
          <Tabs defaultValue="account" className="w-full" value={type} onValueChange={e => setType(e as LoginType)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            value={username}
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
            className="w-full"
          />
          <Input
            value={password}
            type="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onLogInUsername} disabled={loading}>
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
