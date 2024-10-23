// @ts-ignore

import {useCallback, useContext, useEffect, useRef, useState} from "react"
import {TokenBalance} from "@/components/ListToken/ListToken"
import {TokenInfoWithAddress} from "@/utils/graphql/types"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"

import {Collector} from '@/libs/rgnpp_collector'
import {leToU128} from '@rgbpp-sdk/ckb'
import {addressToScript} from '@nervosnetwork/ckb-sdk-utils'
import {hashType} from "@/serves/useXudtTransfer/lib";

const emptyToken: TokenInfoWithAddress = {
    decimal: 0,
    name: '',
    symbol: '--',
    type_id: '',
    address: {
        id: '',
        script_args: '',
        script_code_hash: '',
        script_hash_type: '',
    },
    addressByInscriptionId: null
}

export const getXudtBalance = async (addresses: string[], tokenType: CKBComponents.Script, collector: Collector) => {
    const _locks = addresses.map(address => addressToScript(address))
    let _sum = BigInt(0)

    for (let i = 0; i < _locks.length; i++) {
        const xudtCells = await collector.getCells({
            lock: _locks[i],
            type: tokenType,
        });

        _sum += xudtCells.reduce((prev, current) => {
            return prev + leToU128(current.outputData)
        }, BigInt(0))
    }

    return _sum.toString()
}

export default function useXudtBalance(addresses?: string[], token?: TokenInfoWithAddress) {
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading')
    const [data, setData] = useState<TokenBalance>({...emptyToken, amount: '0', type: 'xudt', chain: 'ckb'})
    const [error, setError] = useState<undefined | any>(undefined)
    const {config} = useContext(CKBContext)

    const refresh = useCallback(async () => {
        if (!addresses || !addresses.length || !token) {
            setStatus('complete')
            setData({...emptyToken, amount: '0', type: 'xudt', chain: 'ckb'})
            return
        }

        setStatus('loading')

        const collector = new Collector({
            ckbNodeUrl: config.ckb_rpc,
            ckbIndexerUrl: config.ckb_indexer!,
        })

        const balance = await getXudtBalance(addresses, {
            codeHash: token.address.script_code_hash.replace('\\', '0'),
            hashType: hashType[token.address.script_hash_type],
            args: token.address.script_args.replace('\\', '0')
        }, collector)

        setData({
            ...token,
            amount: balance,
            type: 'xudt',
            chain: 'ckb'
        })
        setStatus('complete')
    }, [addresses, token, config])

    useEffect(() => {
        refresh()
    }, [addresses, token, config, refresh])


    return {
        status,
        data,
        error,
        refresh
    }
}
