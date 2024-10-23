import { useEffect, useState } from 'react'

import { ApiPromise } from '@polkadot/api'
import { useInkathon } from '@scio-labs/use-inkathon'

export type OrderData = {
  orderId: number
  baseCurrencyId: string
  baseAmount: number
  targetCurrencyId: string
  targetAmount: number
}

export const parseOrderData = async (api: ApiPromise, data?: any): Promise<OrderData[]> => {
  // Query the chain and parse data

  const orders: OrderData[] = []
  data.forEach((item: any) => {
    console.log(`("@@@ data key: ${item[0]},  value: ${item[1].toString()}`)

    const o = JSON.parse(item[1].toString())

    const baseItem = o.baseCurrencyId
    const baseFirstKey = Object.keys(baseItem)[0]
    const strBaseCurrencyId = baseItem[baseFirstKey]

    const targetItem = o.targetCurrencyId
    const targetFirstKey = Object.keys(targetItem)[0]
    const strTargetCurrencyId = targetItem[targetFirstKey]

    orders.push({
      orderId: parseInt(item[0].toHuman()),
      baseCurrencyId: strBaseCurrencyId,
      baseAmount: o.baseAmount,
      targetCurrencyId: strTargetCurrencyId,
      targetAmount: o.targetAmount,
    })
  })

  orders.sort((a, b) => a.orderId - b.orderId)

  return orders
}

export const getOrder = async (api: ApiPromise): Promise<OrderData[]> => {
  // Query the chain and parse data
  const allEntries: any = await api.query.swap.orders.entries()

  const orders = parseOrderData(api, allEntries)

  return orders
}

/**
 * Hook that returns the native token order of the given `address`.
 */
export const useOrder = (watch?: boolean): any => {
  const { api } = useInkathon()
  const [orderData, setOrderData] = useState<OrderData[]>([])
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateOrderData = (data: OrderData[]) => {
      setOrderData(() => data)
    }

    if (!api) {
      updateOrderData({} as OrderData[])
      return
    }

    getOrder(api).then(updateOrderData)
  }, [api])

  return orderData
}
