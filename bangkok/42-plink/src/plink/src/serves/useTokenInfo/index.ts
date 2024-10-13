import {useEffect, useState, useContext} from "react"
import {queryAddressInfoWithAddress} from "@/utils/graphql"
import {TokenInfoWithAddress} from "@/utils/graphql/types"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"

export default function useTokenInfo(tokenId: string) {
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading')
    const [data, setData] = useState<TokenInfoWithAddress | null>(null)
    const [error, setError] = useState<undefined | any>(undefined)
    const {network} = useContext(CKBContext)

    useEffect(() => {
        setStatus('loading')
        queryAddressInfoWithAddress([tokenId], network === 'mainnet')
            .then(res => {
                if (!!res[0]) {
                    setData(res[0])
                }
                setStatus('complete')
            })
            .catch((e: any) => {
                setError(e)
                setStatus('error')
            })
    }, [tokenId])

    return {
        data,
        status,
        error
    }
}
