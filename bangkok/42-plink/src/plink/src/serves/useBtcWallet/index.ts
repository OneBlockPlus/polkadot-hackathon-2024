import {useContext, useMemo} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {AbstractWallet, JoyIDWallet, OKXWallet, UniSatWallet} from 'mobit-wallet'
import {isBtcAddress} from "@/utils/common"
import {NetworkConfig} from "mobit-wallet"


export default function useBtcWallet() {
    const {wallet, network, internalAddress} = useContext(CKBContext)
    const feeRate = 10

    const isBtcWallet = useMemo<boolean>(() => {
        const supportedWallets = ['UniSat', 'OKX Wallet', 'JoyID']
        return !!internalAddress
            && isBtcAddress(internalAddress, network === 'mainnet')
            && !!wallet
            && supportedWallets.includes(wallet.name)
            && !!wallet.signers.length
            && wallet.signers.some((s: { name: string, signer: any }) => s.name === 'BTC')
    }, [internalAddress, network, wallet])

    const getSignPsbtWallet = (): AbstractWallet | undefined => {
        if (!isBtcWallet) {
            console.warn("Not supported wallet")
            return undefined
        }

        const opts: NetworkConfig = {
            type: network === 'mainnet' ? 0 : 1,
            testnetType: network !== "mainnet" ? "Testnet3" : undefined
        }

        if (wallet.name === "UniSat") {
            return new UniSatWallet(opts)
        } else if (wallet.name === "JoyID") {
            return new JoyIDWallet(opts)
        } else if (wallet.name === "OKX Wallet") {
            return new OKXWallet(opts)
        } else {
            return undefined
        }
    }

    const createUTXO = async (props: { btcAddress: string, feeRate: number }) => {
        if (!isBtcWallet) {
            throw new Error('Not supported wallet')
        }

        const wallet = getSignPsbtWallet()!

        const txid = await wallet.sendBitcoin({
            address: props.btcAddress,
            amount: 546,
            feeRate: props.feeRate
        })

        return txid as string
    }


    return {
        isBtcWallet,
        getSignPsbtWallet,
        createUTXO,
        feeRate
    }
}
