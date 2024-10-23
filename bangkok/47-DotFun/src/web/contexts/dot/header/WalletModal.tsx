import { Animator, BleepsOnAnimator } from '@arwes/react'
import { shorten } from '@did-network/dapp-sdk'
import { Account, BaseWallet } from '@polkadot-onboard/core'
import { useWallets } from '@polkadot-onboard/react'

import { Button } from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import ModalLayout from '@/components/layout/ModalLayout'
import { useAccounts } from '@/contexts/dot/AccountsContext'
import { BleepNames } from '@/types.ts'

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { account } = useAccounts()
  const { wallets } = useWallets()

  return (
    <Modal>
      <Animator merge>
        <BleepsOnAnimator<BleepNames> transitions={{ entering: 'open' }} continuous />
        <Animator merge unmountOnExited>
          <ModalLayout title={account ? 'My Wallet' : 'Connect Wallet'} onClose={onClose}>
            <div className="flex-col-center">
              {wallets?.map((wallet: BaseWallet, index) => (
                <Wallet key={index} walletInfo={wallet} closeModals={onClose} />
              ))}
            </div>
          </ModalLayout>
        </Animator>
      </Animator>
    </Modal>
  )
}

const Wallet = ({ walletInfo, closeModals }: { walletInfo: BaseWallet; closeModals: any }) => {
  const { setAccount, setWallet, wallet, account } = useAccounts()
  const { walletAccounts, connectToWallet } = useWalletAccounts(walletInfo)

  const isConnected = walletInfo === wallet

  const connectWallet = useCallback(async () => {
    await connectToWallet(walletInfo)
    setWallet(walletInfo)
  }, [connectToWallet, setWallet, walletInfo])

  return (
    <div className={`w-full mt-4 flex flex-row justify-between items-center py-4 px-4`}>
      <div className="flex flex-row items-center gap-2 text-base">
        <img src={walletInfo.metadata.iconUrl} alt="" className="h-7" />
        {walletInfo.metadata.title}
      </div>
      <div className="flex flex-col">
        {isConnected ? (
          walletAccounts.map((i: Account) => (
            <Button
              frame="hexagon"
              key={i.address}
              onClick={() => {
                setAccount(i)
                closeModals()
              }}
              className={`w-50 my-1 ${i.address === account?.address ? 'font-bold underline' : ''}`}
            >
              {i.name || shorten(i.address, 6, 6)}
            </Button>
          ))
        ) : (
          <Button frame="hexagon" type="text" onClick={connectWallet}>
            <span className="!underline">Connect</span>
          </Button>
        )}
      </div>
    </div>
  )
}

const useWalletAccounts = (walletInfo: BaseWallet) => {
  const { account, wallet } = useAccounts()
  const [walletAccounts, setWalletAccounts] = useState<Account[]>([])

  const connectToWallet = useCallback(
    async (wallet: BaseWallet) => {
      if (walletAccounts.length > 0) {
        return
      }

      await wallet.connect()
      const accounts = await wallet.getAccounts()
      setWalletAccounts([...accounts])
    },
    [walletAccounts]
  )

  useEffect(() => {
    ;(async () => {
      if (wallet?.metadata.title === walletInfo.metadata.title) {
        await connectToWallet(wallet)
      }
    })()
  }, [account, wallet, connectToWallet, wallet?.metadata.title, walletInfo.metadata.title])

  return { walletAccounts, connectToWallet }
}
