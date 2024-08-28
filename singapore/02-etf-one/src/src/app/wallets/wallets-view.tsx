import { getWallets } from '@/app/wallets/actions'
import { WalletView } from '@/app/wallets/wallet-view'


export async function WalletsView() {
  const wallets = await getWallets()

  return (
    <>
      {wallets.map((wallet) => (
        <WalletView key={wallet.id} {...wallet} />
      ))}
    </>
  )
}
