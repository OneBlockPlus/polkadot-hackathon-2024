import {useEffect, useState, useContext} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"


export default function useDotbit(address?: string) {
    const [bondingDomain, setBondingdomain] = useState<undefined | string>(undefined)
    const [domains, setDomains] = useState<string[]>([])
    const [status, setStatus] = useState<'loading' | 'complete' | 'error'>("loading")
    const [error, setError] = useState<any | null>(null)
    const {network} = useContext(CKBContext)

    useEffect(() => {
        if (!address || network === 'testnet') {
            setStatus("complete")
            setError(null)
            setDomains([])
            setBondingdomain(undefined)
            return
        }

        setStatus("loading")
        fetch(`https://ckb-property-aggregator.unistate.io/?ckbaddress=${address}`)
            .then(res => res.json())
            .catch((e: any) => {
                setError(e)
                setDomains([])
                setBondingdomain(undefined)
                setStatus('error')
            })
            .then(res => {
                setDomains(res.bitAccounts.domainlist)
                setBondingdomain(res.bitAccounts.bondingdomain || undefined)
                setStatus('complete')
            })
            .catch((e: any) => {
                setError(e)
                setDomains([])
                setBondingdomain(undefined)
                setStatus('error')
            })

    }, [address])

    return {
        bondingDomain,
        domains,
        status,
        error
    }
}
