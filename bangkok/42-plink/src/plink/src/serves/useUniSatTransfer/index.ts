import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {useContext} from "react"

export default function useUniSatTransfer() {
    const {network, wallet, signer} = useContext(CKBContext)

    const sendTx = async (psbtHex: string) => {
        if (!signer || wallet?.name !== 'UniSat' || (window as any).unisat === undefined) {
            throw new Error('Please connect UniSat wallet first')
        }

        const unisat = (window as any).unisat
        await unisat.switchNetwork(network === 'testnet' ? 'testnet' : 'livenet')

        return  await unisat.pushPsbt(psbtHex) as string
    }

    return {
        sendTx
    }
}
