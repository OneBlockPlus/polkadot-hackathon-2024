import { useOpenAuth } from '@open-auth/sdk-react'
import { IconEye } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function ProfileCard() {
  const { globalConfig, client, profile, logOut } = useOpenAuth()
  const [solanaPK, setSolanaPK] = useState('')

  const { data: walletData } = useQuery({
    queryKey: ['getUserWallet', profile?.id],
    queryFn: () => client.user.getWallets(),
    enabled: !!profile && client.user.isAuthorized(),
  })

  const onExportPrivateKey = useCallback(async () => {
    const privateKey = await client.user.exportSolanaPrivateKey()
    setSolanaPK(privateKey)
  }, [client.user])

  if (!profile || !walletData) {
    return null
  }

  return (
    <Card className="px-12 py-10 shadow">
      <CardHeader>
        <CardTitle className="text-2xl">
          <span className="font-400">Welcome to</span>
          {' '}
          <span className="font-bold">{globalConfig?.brand}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="mx-auto flex flex-col gap-y-6">
        <div>
          <img src={profile.avatar ?? ''} className="h-12 w-12" alt="" />
        </div>
        <div>
          <div className="text-sm opacity-60">User ID:</div>
          <div>{profile.id.toString()}</div>
        </div>
        <div>
          <div className="text-sm opacity-60">Display Name:</div>
          <div>{profile.displayName}</div>
        </div>
        <div>
          <div className="text-sm opacity-60">Solana Wallet:</div>
          <div>{walletData?.solWallet}</div>
        </div>
        <div>
          <div className="text-sm opacity-60">Ethereum Wallet:</div>
          <div>{walletData?.ethWallet}</div>
        </div>
        <div>
          <div className="text-sm opacity-60">Polkadot Wallet:</div>
          <div>{walletData?.dotWallet}</div>
        </div>
        <div className="">
          <div className="text-sm opacity-60">Solana Private Key:</div>
          <div className="flex-center gap-x-2">
            <Input value={solanaPK} readOnly />
            <Button variant="outline" onClick={onExportPrivateKey}>
              <IconEye />
            </Button>
          </div>
        </div>
        <div>
          <Button onClick={logOut}>Log Out</Button>
        </div>
      </CardContent>
    </Card>
  )
}
