import { buildTrackId, IPayload } from '@/contexts/common.tsx'
import { useAccounts } from '@/contexts/dot/AccountsContext.tsx'

const JOB_POOL_ID = 104
const JOB_POLICY_ID = 1
const JOB_SPEC_VERSION = 1

export default function useSubmitTask(payload: IPayload) {
  const { api, account, wallet } = useAccounts()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const submit = useCallback(() => {
    if (!account || !wallet || !api) {
      return
    }
    console.info('submit task:', payload)

    const rawInput = { e2e: false, v: 1, data: payload }
    const trackId = buildTrackId()

    ;(async () => {
      const txPromise = api.tx.offchainComputingPool.createJob(
        JOB_POOL_ID,
        JOB_POLICY_ID,
        trackId,
        null,
        JOB_SPEC_VERSION,
        JSON.stringify(rawInput),
        null
      )
      console.info('txPromise:', txPromise.toHex())
      const unsub = await txPromise.signAndSend(account.address, { signer: wallet.signer }, ({ status }) => {
        if (status.isReady) {
          setIsLoading(true)
        }
        if (status.isFinalized) {
          unsub()
          console.info('tx hash', status.asFinalized.toHuman())
          setIsLoading(false)
          setIsSuccess(true)
        }
      })
    })()

    return trackId
  }, [account, api, payload, wallet])
  return {
    submit,
    isLoading,
    isSuccess,
  }
}
