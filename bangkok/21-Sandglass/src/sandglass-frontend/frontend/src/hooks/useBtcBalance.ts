import { useEffect, useState } from 'react'

import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { formatBalance, TokenData, useInkathon } from '@scio-labs/use-inkathon'
import { BalanceData, BalanceFormatterOptions } from '@scio-labs/use-inkathon/helpers'

const parseBalanceData = (
  api: ApiPromise,
  data?: any,
  formatterOptions?: BalanceFormatterOptions,
): BalanceData => {
  // Get the token decimals and symbol
  const tokenDecimals = 12
  const tokenSymbol = 'Btc'

  // Get the balance
  const freeBalance: BN = new BN(data?.free || 0)
  const reservedBalance: BN = new BN(data?.reserved || 0)
  const balance = reservedBalance.add(freeBalance)

  // Calculate the reducible balance (see: https://substrate.stackexchange.com/a/3009/3470)
  const miscFrozenBalance: BN = new BN(data?.miscFrozen || 0)
  const feeFrozenBalance: BN = new BN(data?.feeFrozen || 0)
  const reducibleBalance = freeBalance.sub(
    miscFrozenBalance.gt(feeFrozenBalance) ? miscFrozenBalance : feeFrozenBalance,
  )

  const d: TokenData = {
    tokenDecimals: tokenDecimals,
    tokenSymbol: tokenSymbol,
  }

  // Format the balance
  const freeBalanceFormatted = formatBalance(api, freeBalance, formatterOptions, d)
  const reservedBalanceFormatted = formatBalance(api, reservedBalance, formatterOptions, d)
  const reducibleBalanceFormatted = formatBalance(api, reducibleBalance, formatterOptions, d)
  const balanceFormatted = formatBalance(api, balance, formatterOptions, d)

  return {
    tokenDecimals,
    tokenSymbol,
    freeBalance,
    freeBalanceFormatted,
    reservedBalance,
    reservedBalanceFormatted,
    reducibleBalance,
    reducibleBalanceFormatted,
    balance,
    balanceFormatted,
  }
}

export const getBalance = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
  formatterOptions?: BalanceFormatterOptions,
): Promise<BalanceData> => {
  if (!address) {
    const { tokenDecimals, tokenSymbol } = parseBalanceData(api)
    return {
      tokenDecimals,
      tokenSymbol,
    }
  }

  // Query the chain and parse data
  const result: any = await api.query.tokens.accounts(address, { VToken: 'BTC' })
  const balanceData = parseBalanceData(api, result, formatterOptions)

  return balanceData
}

const watchBalance = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
  callback: (data: BalanceData) => void,
  formatterOptions?: BalanceFormatterOptions,
): Promise<VoidFunction | null> => {
  const { tokenDecimals, tokenSymbol } = parseBalanceData(api)
  if (!address) {
    callback({
      tokenDecimals,
      tokenSymbol,
    })
    return null
  }

  // Query the chain, parse data, and call the callback
  const unsubscribe: any = await api.query.tokens.accounts(
    address,
    { VToken: 'BTC' },
    (data: any) => {
      const balanceData = parseBalanceData(api, data, formatterOptions)
      callback(balanceData)
    },
  )
  return unsubscribe
}

/**
 * Hook that returns the native token balance of the given `address`.
 */
export const useBtcBalance = (
  address?: string | AccountId,
  watch?: boolean,
  formatterOptions?: BalanceFormatterOptions,
): BalanceData => {
  const { api } = useInkathon()
  const [balanceData, setBalanceData] = useState<BalanceData>({
    tokenSymbol: 'VBTC',
    tokenDecimals: 12,
  } satisfies BalanceData)
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateBalanceData = (data: BalanceData) => {
      setBalanceData(() => data)
    }

    if (!api) {
      updateBalanceData({} as BalanceData)
      return
    }

    if (watch) {
      watchBalance(api, address, updateBalanceData, formatterOptions).then((unsubscribe) => {
        setUnsubscribes((prev) => [...prev, unsubscribe])
      })
    } else {
      getBalance(api, address, formatterOptions).then(updateBalanceData)
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe?.())
      setUnsubscribes(() => [])
    }
  }, [api, address])

  return balanceData
}
