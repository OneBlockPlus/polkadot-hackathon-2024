import {ccc} from "@ckb-ccc/connector-react"
import {createContext, useEffect, useRef, useState} from "react"
import {Signer} from "@ckb-ccc/core"
import {NetworkConfig} from "@/providers/CKBProvider/network_config"
import network_config from "@/providers/CKBProvider/network_config"
import {Client} from '@ckb-ccc/core'
import {useNavigate} from "react-router-dom"

const cccLib: any = ccc

export type Network = 'mainnet' | 'testnet'

export interface CKBContextType {
    open: () => any
    network: Network
    disconnect: () => any
    wallet?: any
    internalAddress?: string
    address?: string
    addresses?: string[]
    signer?: ccc.Signer | undefined
    setNetwork: (network: Network) => any
    config: NetworkConfig,
    client?: Client
}

export const CKBContext = createContext<CKBContextType>({
    open: () => {
    },
    disconnect: () => {
    },
    setNetwork: (_network: Network) => {
    },
    config: network_config['mainnet'],
    network: 'mainnet'
})

export default function CKBProvider({children}: { children: any }) {
    const {open, disconnect, wallet, setClient, client} = cccLib.useCcc()
    const signer = ccc.useSigner()
    const navigate = useNavigate()

    const [internalAddress, setInternalAddress] = useState<undefined | string>(undefined)
    const [address, setAddress] = useState<undefined | string>(undefined)
    const [addresses, setAddresses] = useState<undefined | string[]>(undefined)
    const [network, _setNetwork] = useState<Network>(localStorage.getItem('ckb_network') as Network || 'mainnet')

    const needRedirect = useRef(false)

    const switchNetwork = (network: Network) => {
        // 需要重新连接
        disconnect()
        navigate('/')
        setTimeout(()=> {
            _setNetwork(network)
            needRedirect.current = true
            open()
        }, 300)
    }

    useEffect(() => {
        if (!signer) {
            setInternalAddress(undefined)
            setAddress(undefined)
            setAddresses(undefined)
            return
        }

        (async () => {
            const internalAddress = await signer.getInternalAddress()
            const address = await signer.getRecommendedAddress()
            const addresses = await signer.getAddresses()
            setInternalAddress(internalAddress)
            setAddress(address)
            setAddresses(addresses)

            if (needRedirect.current) {
                needRedirect.current = false
                navigate(`/address/${address}`)
            }
        })()
    }, [signer])

    useEffect(() => {
        setClient(network === 'testnet' ? new cccLib.ClientPublicTestnet():new cccLib.ClientPublicMainnet())
        localStorage.setItem('ckb_network', network)
    }, [network, setClient])

    return (
        <CKBContext.Provider value={{
            client,
            config: network_config[network],
            network,
            setNetwork: switchNetwork,
            open: () => {
                needRedirect.current = true
                open()
            }, disconnect, wallet, signer, internalAddress, address, addresses
        }}>
            {children}
        </CKBContext.Provider>
    )
}
