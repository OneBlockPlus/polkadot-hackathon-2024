import { shorten } from '@did-network/dapp-sdk'
import QRCode from 'react-qr-code'
import { useCopyToClipboard } from 'usehooks-ts'

import rightImg from '@/assets/images/earn/right.png'
import keyImg from '@/assets/images/wallet/key.png'
import { BackButton } from '@/components/common/BackButton'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/api'

const tasks = [{ title: 'Export Private Key', icon: keyImg }]

export default function () {
  const data = useProfile()

  const [copiedValue, copy] = useCopyToClipboard()
  const onCopy = useCallback(async () => {
    await copy(data?.dotWallet ?? '')
  }, [copy, data?.dotWallet])

  if (!data) {
    return null
  }

  return (
    <>
      <BackButton />
      <div className="py-6 mx-auto flex-col-center gap-4 bg-#210C40">
        <QRCode value={data.solWallet} className="rounded  px-4 bg-white" />
        <div className="break-all px-2 py-4 rounded-xl w-4/5">{data.dotWallet}</div>
        <Button onClick={onCopy} className="bg-#210C40 text-$primary border border-$primary">
          Copy Address
        </Button>
      </div>
    </>
  )
}
