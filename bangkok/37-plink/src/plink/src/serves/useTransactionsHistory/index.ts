import {useEffect, useState, useContext} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider";
import {TransactionHistory} from "@/components/ListHistory/ListHistory"

export default function useTransactions(address?: string, pageSize?: number) {
    const {config} = useContext(CKBContext)

    const [data, setData] = useState<TransactionHistory[]>([])
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading')
    const [error, setError] = useState<undefined | any>(undefined)
    const [page, setPage] = useState(1)
    const size = pageSize || 5

    useEffect(() => {
        if (!address) {
            setData([])
            setStatus('complete')
            setError(undefined)
        } else {
            setStatus('loading')
            setData([])
            fetch(`${config.explorer_api}/address_transactions/${address}?page=${page}&page_size=${size}&sort=time.desc`, {
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
    }, [address, page, config])


    return {
        setPage,
        page,
        data,
        status,
        error
    }
}
