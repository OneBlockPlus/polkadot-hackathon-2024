import {useEffect, useState} from "react"

export interface DotbitDetail {
    account: string,
    tx_hash: string,
    account_id_hex: string,
    account_alias: string,
    create_at_unix: number,
    expired_at_unix: number,
    owner_key: string,
    manager_key: string,
    display_name: string,
    records: {
        key: string,
        value: string,
        label: string
    }[]
}

export default function useDotbitDetail(domain?: string) {
    const [data, setData] = useState<undefined | DotbitDetail>(undefined)
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>("loading")
    const [error, setError] = useState<any | null>(null)

    useEffect(() => {
        if (!domain) {
            setStatus("complete")
            setError(null)
            setData(undefined)
            return
        }

        setStatus("loading")
        fetch(`https://ckb-property-aggregator.unistate.io/?bitdomain=${domain}`)
            .then(res => res.json())
            .catch((e: any) => {
                setError(e)
                setData(undefined)
                setStatus('error')
            })
            .then(res => {
                const _data = res.result.data;
                setData({
                    account: domain,
                    tx_hash: _data.out_point.tx_hash,
                    ..._data.account_info,
                    records: res.records.result.data.records || []
                })
                setStatus('complete')
            })
            .catch((e: any) => {
                setError(e)
                setData(undefined)
                setStatus('error')
            })

    }, [domain])

    return {
        data,
        status,
        error
    }
}
