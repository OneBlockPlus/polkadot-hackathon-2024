// @ts-ignore
import BigNumber from "bignumber.js"
import {useEffect, useState, useContext} from "react"
import {TokenBalance} from "@/components/ListToken/ListToken"
import {SporesWithChainInfo} from "@/serves/useSpores"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {RgbppSDK} from "mobit-sdk"


const queryAssets = async (btcAddress: string, isMainnet: boolean = true): Promise<{
    xudts: TokenBalance[],
    dobs: SporesWithChainInfo[],
    btc: TokenBalance
}> => {
    const sdk = new RgbppSDK(isMainnet, isMainnet ? undefined : 'Testnet3')
    const json = await sdk.fetchAssetsAndQueryDetails(btcAddress)

    console.log('layer 1 assets', json)

    const list = {
        xudts: [] as TokenBalance[],
        dobs: [] as SporesWithChainInfo[],
        btc: {
            decimal: 8,
            name: 'Bitcoin',
            symbol: 'BTC',
            type_id: '',
            amount: json.balance.total_satoshi.toString(),
            type: 'btc',
            chain: 'btc'
        } as TokenBalance
    }

    if (json.assets.xudtCells.length) {
        let tokens: string[] = []
        json.assets.xudtCells.forEach((t: any) => {
            if (!tokens.includes(t.type_id)) {
                tokens.push(t.type_id)
            }
        })

        tokens.forEach((t) => {
            const cells = json.assets.xudtCells.filter((c: any) => c.type_id === t)
            const balance = cells.reduce((acc: BigNumber, c: any) => acc.plus(c.amount), new BigNumber(0))
            const info = cells[0].addressByTypeId.token_info || cells[0].addressByTypeId.inscription_infos[0] || undefined

            list.xudts.push({
                name: info?.name || 'Inscription',
                symbol: info.symbol || '',
                decimal: info?.decimal || 0,
                type_id: cells[0].type_id,
                amount: balance.toString(),
                type: 'xudt',
                chain: 'btc',
                address: {
                    id: '',
                    script_args: cells[0].addressByTypeId.script_args.replace('\\', '0'),
                    script_code_hash: '',
                    script_hash_type: ''
                },
                addressByInscriptionId: null
            })
        })
    }

    if (json.assets.sporeActions && json.assets.sporeActions.length) {
        json.assets.sporeActions.forEach((t: any) => {
            list.dobs.push({
                id: t.spore.id,
                content: t.spore.content,
                cluster_id: t.spore.cluster_id,
                is_burned: t.spore.is_burned,
                owner_address: t.spore.owner_address,
                content_type: t.spore.content_type,
                created_at: t.spore.created_at,
                updated_at: t.spore.updated_at,
                chain: 'btc',
                addressByTypeId: {
                    id: '',
                    script_args: t.spore.addressByTypeId.script_args,
                    script_code_hash: t.spore.addressByTypeId.script_code_hash,
                    script_hash_type: t.spore.addressByTypeId.script_hash_type
                }
            } as any)
        })
    }

    console.log('list', list)
    return list
}

const btcEmpty: TokenBalance = {
    decimal: 8,
    name: 'Bitcoin',
    symbol: 'BTC',
    type_id: '',
    amount: '0',
    type: 'btc',
    chain: 'btc',
    address: {
        id: '',
        script_args: '',
        script_code_hash: '',
        script_hash_type: ''
    },
    addressByInscriptionId: null
}

export default function useLayer1Assets(btcAddress?: string, polling?: boolean) {
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading')
    const [xudts, setXudts] = useState<TokenBalance[]>([])
    const [dobs, setDobs] = useState<SporesWithChainInfo[]>([])
    const [btc, setBtc] = useState<TokenBalance | undefined>(undefined)
    const [error, setError] = useState<undefined | any>(undefined)
    const {network} = useContext(CKBContext)

    const pollingInterval = 1000 * 30 // 30s 一次

    useEffect(() => {
        if (!btcAddress) {
            setStatus('complete')
            setXudts([])
            setDobs([])
            setBtc(undefined)
            return
        }

        setStatus('loading')
        setXudts([])
        queryAssets(btcAddress, network === 'mainnet')
            .then(res => {
                setXudts(res.xudts)
                setDobs(res.dobs)
                setBtc(res.btc)
                setStatus('complete')
            })
            .catch((e: any) => {
                console.error(e)
                setStatus('complete')
                setXudts([])
                setDobs([])
                setBtc(undefined)
                setStatus('error')
                setError(e)
            })
    }, [btcAddress])


    useEffect(() => {
        if (polling) {
            const interval = setInterval(() => {
                if (btcAddress) {
                    queryAssets(btcAddress, network === 'mainnet')
                        .then(res => {
                            setXudts(res.xudts)
                            setDobs(res.dobs)
                            setBtc(res.btc)
                        })
                        .catch((e: any) => {
                            console.error(e)
                        })
                }
            }, pollingInterval)
            return () => clearInterval(interval)
        }
    }, [polling, network, btcAddress])

    return {
        status,
        xudts,
        dobs,
        error,
        btc
    }
}
