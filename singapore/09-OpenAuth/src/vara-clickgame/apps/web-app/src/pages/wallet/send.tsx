import { formatAmount } from '@did-network/dapp-sdk'
import { useOpenAuth } from '@open-auth/sdk-react'

import { BackButton } from '@/components/common/BackButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/hooks/api'

export default function () {
  const { client } = useOpenAuth()
  const profile = useProfile()
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [sig, setSig] = useState('')
  const [loading, setLoading] = useState(false)

  const { balance } = { balance: 0 }
  const error = useMemo(() => {
    if (loading) {
      return 'Sending...'
    }
    if (balance === undefined) {
      return 'Loading...'
    }
    if (!amount || !address) {
      return 'Send'
    }
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return 'Invalid amount'
    }
    if (amountNum > balance) {
      return 'Insufficient balance'
    }
  }, [address, amount, balance, loading])

  const onSend = useCallback(async () => {
    setLoading(true)
    try {
      const { signature } = await client.app.sendVaraMessage('', { destination: address, payload: `${amount}` })
      setSig(signature)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [address, amount, client])

  return (
    <>
      <BackButton />
      <div className="px-4 py-6 mx-auto flex flex-col gap-y-2 bg-#210C40">
        {sig ? (
          <div className="text-center">
            <div className="mb-2 text-xl">Sent successfully!</div>
            <a className="break-words text-xs underline" target="_blank" href={`https://explorer.sonic.game/tx/${sig}`}>
              {sig}
            </a>
          </div>
        ) : (
          <>
            <div>Address</div>
            <Input
              type="text"
              className="bg-transparent border focus:border-$primary"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div>Amount</div>
            <Input
              type="number"
              className="bg-transparent border focus:border-$primary"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="text-sm text-right">Balance: {formatAmount(balance, 9)} VARA</div>
            <Button onClick={onSend} className="bg-#210C40 text-$primary border border-$primary" disabled={!!error}>
              {error ?? 'Send'}
            </Button>
          </>
        )}
      </div>
    </>
  )
}
