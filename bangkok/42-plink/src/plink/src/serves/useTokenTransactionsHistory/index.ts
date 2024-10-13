import {useEffect, useState, useContext} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {TransactionHistory} from "@/components/ListHistory/ListHistory"
import {TokenInfoWithAddress} from "@/utils/graphql/types"
import {utils} from '@ckb-lumos/lumos'
import {hashType} from "@/serves/useXudtTransfer/lib"

export default function useTokenTransactions(token?: TokenInfoWithAddress | null, address?: string, pageSize?: number) {
    const {config} = useContext(CKBContext)

    const [data, setData] = useState<TransactionHistory[]>([])
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading')
    const [error, setError] = useState<undefined | any>(undefined)
    const [page, setPage] = useState(1)
    const size = pageSize || 5

    useEffect(() => {
        if (!address || !token) {
            setData([])
            setStatus('complete')
            setError(undefined)
        } else {
            setStatus('loading')
            setData([])
            const typeScriptHash = utils.computeScriptHash({
                codeHash: token.address.script_code_hash.replace('\\', '0'),
                hashType: hashType[token.address.script_hash_type],
                args: token.address.script_args.replace('\\', '0'),
            })

            fetch(`${config.explorer_api}/udt_transactions/${typeScriptHash}?page=${page}&page_size=${size}&address_hash=${address!}&sort=time.desc`, {
                method: 'GET',
                headers: {
                    "Accept": 'application/vnd.api+json',
                    "Content-Type": 'application/vnd.api+json',
                }
            })
                .then(async (res) => {
                    const json = await res.json()
                    if (json.data) {
                        setData(json.data)
                        setStatus('complete')
                    } else {
                        setData([])
                        setStatus('complete')
                    }
                })
                .catch((e: any) => {
                    console.warn(e)
                    setData([])
                    setStatus('error')
                    setError(e)
                })
        }
    }, [address, page, config, token])

    return {
        setPage,
        page,
        data,
        status,
        error
    }
}
