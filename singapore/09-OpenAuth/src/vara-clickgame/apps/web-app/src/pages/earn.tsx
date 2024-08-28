import { NavLink } from 'react-router-dom'

import doneImg from '@/assets/images/earn/done.png'
import faucetImg from '@/assets/images/earn/faucet.png'
import loadingImg from '@/assets/images/earn/loading.png'
import rightImg from '@/assets/images/earn/right.png'
import telegramImg from '@/assets/images/earn/telegram.png'
import walletImg from '@/assets/images/earn/wallet.png'
import icon from '@/assets/images/header/earn.png'
import earnImg from '@/assets/images/tabs/earn.png'
import { Header } from '@/components/layout/Header'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useProfile, useTasks } from '@/hooks/api'
import { cn } from '@/lib/utils'
import { useSonicClient } from '@/store'

export default function () {
  const data = useProfile()
  const { data: myTasks, refetch } = useTasks()
  const { sonicClient } = useSonicClient()

  const submitVerification = useCallback(
    async (type: 'RequestAirdrop' | 'SendTransaction' | 'ReceiveTransaction') => {
      await sonicClient.api.verifyAction({ type })
      await refetch()
    },
    [refetch, sonicClient]
  )

  const tasks = useMemo(() => {
    const TASKS = [
      {
        type: 'RequestAirdrop',
        title: 'Request Airdrop in Faucet',
        icon: faucetImg,
        description: (disabled: boolean) => (
          <div className="flex-center gap-x-2">
            <div>
              <span>Request airdrop in </span>
              <a
                className="underline font-bold"
                href={`https://faucet.sonic.game/#/?wallet=${data?.solWallet}`}
                target="_blank"
              >
                Vara Faucet
              </a>
              <span> to get free SOL.</span>
            </div>
            <button
              className={cn(
                'bg-$primary focus:bg-$primary font-semibold text-black p-2 rounded text-xs',
                disabled ? 'opacity-60' : ''
              )}
              onClick={() => submitVerification('RequestAirdrop')}
              disabled={disabled}
            >
              Verify
            </button>
          </div>
        ),
      },
      {
        type: 'SendTransaction',
        title: 'Send a transaction',
        icon: walletImg,
        description: (disabled: boolean) => (
          <div className="flex-center gap-x-2">
            <div>
              <span>Send a transaction on the </span>
              <NavLink to="/wallet/send" className="underline font-semibold">
                Wallet
              </NavLink>
              <span> page to earn points.</span>
            </div>
            <button
              className={cn(
                'bg-$primary focus:bg-$primary font-semibold text-black p-2 rounded text-xs',
                disabled ? 'opacity-60' : ''
              )}
              onClick={() => submitVerification('SendTransaction')}
              disabled={disabled}
            >
              Verify
            </button>
          </div>
        ),
      },
      {
        type: 'ReceiveTransaction',
        title: 'Receive a transaction',
        icon: walletImg,
        description: (disabled: boolean) => (
          <div className="flex-center gap-x-2">
            <div>
              <span>Receive any external transfer to complete this quest.</span>
            </div>
            <button
              className={cn(
                'bg-$primary focus:bg-$primary font-semibold text-black p-2 rounded text-xs',
                disabled ? 'opacity-60' : ''
              )}
              onClick={() => submitVerification('ReceiveTransaction')}
              disabled={disabled}
            >
              Verify
            </button>
          </div>
        ),
      },
      {
        title: 'Join Odyssey for more',
        icon: telegramImg,
        description: (disabled: boolean) => (
          <div>
            <span>Join the </span>
            <a href="https://odyssey.sonic.game/" target="_blank" className="underline font-semibold">
              Vara Odyssey
            </a>
            <span>. Earn Your Ring Rewards!</span>
          </div>
        ),
      },
    ]
    return TASKS.map((task) => {
      const myTask = myTasks?.find((i) => i.type === task.type)
      const status = myTask?.status ?? 'Idle'
      const points = myTask?.points
      return {
        ...task,
        description: task.description(status !== 'Idle'),
        points,
        status,
      }
    })
  }, [submitVerification, data?.solWallet, myTasks])

  return (
    <>
      <Header title="Earn" subtitle="Complete quests to earn more rewards!" icon={icon} />
      <div className="mt-10 h-full w-full flex flex-col gap-y-6">
        {tasks.map(({ title, points, icon, description, status }, index) => (
          <Collapsible key={`task-${index}`}>
            <CollapsibleTrigger className="bg-#003428 border border-$primary pl-4 pr-2 py-3 flex-row flex-center rounded-lg w-full">
              <div className="flex-1 text-left flex items-center gap-x-4">
                <img src={icon} alt="" className="h-8 bg-#2F1F55 rounded" />
                <div className="flex flex-col gap-y-2">
                  <div className="font-bold text-sm">{title}</div>
                  <div className="text-$primary flex items-center gap-x-1 text-sm font-bold">
                    <img src={earnImg} className="w-4" alt="" /> +{points ?? '?'}
                  </div>
                </div>
              </div>
              <img src={{ Pending: loadingImg, Verified: doneImg }[status] ?? rightImg} className="w-6" alt="" />
            </CollapsibleTrigger>
            <CollapsibleContent className="py-2 transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down text-sm">
              <div className="px-4 bg-#003428 border border-$primary pl-4 pr-2 py-3 flex-row flex-center rounded-lg w-full">
                {description}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </>
  )
}
