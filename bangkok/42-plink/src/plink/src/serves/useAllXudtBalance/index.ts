import {queryXudtCell} from "@/utils/graphql"
// @ts-ignore
import BigNumber from "bignumber.js"
import {useEffect, useState, useRef, useContext} from "react"
import {TokenBalance} from "@/components/ListToken/ListToken"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {XudtCell} from "@/utils/graphql/types"

export const balance = async (addresses: string[], isMainnet: boolean): Promise<TokenBalance[]> => {
    const cells = await queryXudtCell(addresses, isMainnet)

    if (cells.length === 0) {
        console.log('enpty')
        return []
    }

    let list:XudtCell[] = []
    cells.forEach(c => {
        const exist = list.find(l => l.type_id === c.type_id)
        if (!exist) {
            c.amount = c.amount.toString()
            list.push(c)
        } else {
            exist.amount = BigNumber(exist.amount).plus(BigNumber(c.amount)).toString()
        }
    })

    const _list = list.map(_l => {
        const info = _l.addressByTypeId?.token_info || _l.addressByTypeId?.token_infos[0] || undefined

        return {
            amount: _l.amount,
            type: 'xudt',
            chain: 'ckb',

            decimal: info?.decimal || 8,
            name: info?.name || '',
            symbol: info?.symbol || 'Inscription',
            type_id: _l.type_id,
            transaction_hash: (info as any)?.transaction_hash || '',
            transaction_index: (info as any)?.transaction_hash || '',

            address: {
                id: _l.addressByTypeId?.id || '',
                script_args: _l.addressByTypeId?.script_args || '',
                script_code_hash: _l.addressByTypeId?.script_code_hash || '',
                script_hash_type: _l.addressByTypeId?.script_hash_type || ''
            }

        } as TokenBalance
    })

    return _list
}

export default function useAllXudtBalance(addresses: string[]) {
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading')
    const [data, setData] = useState<TokenBalance[]>([])
    const [error, setError] = useState<undefined | any>(undefined)
    const {network} = useContext(CKBContext)


    const historyRef = useRef('')

    useEffect(() => {
        if (!addresses || !addresses.length ||  historyRef.current === addresses.join(',')) return
        historyRef.current = addresses.join(',')
        setStatus('loading')
        setData([]);

        (async () => {
            try {
                const res = await balance(addresses, network === 'mainnet')
                setData(res)
                setStatus('complete')
            } catch (e: any) {
                console.error(e)
                setError(e)
                setStatus('error')
            }
        })()
    }, [addresses])

    return {
        status,
        data,
        error
    }
}
