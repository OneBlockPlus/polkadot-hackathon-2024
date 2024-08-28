import React from 'react'
import { MultiSelect } from '@/components/multi-select'
import { WalletSelection } from '@/app/teams/actions'


type MultiSelectOption = {
  className: string | undefined
  selectedWallets: string[]
  setSelectedWallets: (value: string[]) => void
  wallets: WalletSelection[]
}

export function SelectWallets({
  className,
  selectedWallets,
  setSelectedWallets,
  wallets,
}: MultiSelectOption) {
  const walletsList = wallets.map((wallet) => ({
    value: wallet.value,
    label: wallet.label!,
  }))

  return (
    <MultiSelect
      options={walletsList}
      onValueChange={setSelectedWallets}
      defaultValue={selectedWallets}
      placeholder="Select frameworks"
      variant="inverted"
      animation={2}
      maxCount={2}
      className={className}
    />
  )
}
