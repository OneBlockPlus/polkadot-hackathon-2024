import { ColumnDef } from '@tanstack/react-table'
import { Transaction } from '@/generated/public/Transaction'
import { OctagonAlert, ShieldCheck, Signature, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PolkaDotSender } from '@/lib/use-polkadot'
import StatusCell from '@/app/transactions/status-cell'
import Identicon from '@polkadot/react-identicon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
}

export const tableColumns = (
  sender: PolkaDotSender,
): ColumnDef<Transaction>[] => {
  return [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
    {
      accessorKey: 'from',
      header: 'From',
      cell: ({ row }) => (
        <div className={'flex gap-2'}>
          <Avatar className="my-auto h-6 w-6 rounded-full">
            <Identicon value={row.original.from} size={24} theme={'polkadot'} />
          </Avatar>
          <p className={''}>{row.original.wallet_name}</p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)

        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: 'to',
      header: 'To',
      cell: ({ row }) => (
        <div className={'flex gap-2'}>
          {row.original.to.length > 20 ? (
            <ShieldCheck size={18} color={'#22c55e'} />
          ) : (
            <OctagonAlert size={18} color={'#ef4444'} />
          )}

          <p className={'max-w-56 truncate'}>{row.original.to}</p>
        </div>
      ),
    },
    {
      accessorKey: 'created_by',
      header: 'Created By',
      cell: () => (
        <Avatar className="h-9 w-9 sm:flex">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
      ),
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const payment = row.original

        return (
          <div className={'flex gap-2'}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() =>
                      sender(payment.from, payment.to, payment.amount)
                    }
                    variant="outline"
                    size="icon">
                    <Signature />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Approve Transaction</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="icon">
              <X />
            </Button>
          </div>
        )
      },
    },
  ]
}
