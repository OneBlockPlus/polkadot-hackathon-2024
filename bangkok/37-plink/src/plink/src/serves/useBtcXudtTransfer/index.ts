import {BtcHelper, CkbHelper, transferCombined} from "mobit-sdk"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {useContext} from "react"
import useBtcWallet from "@/serves/useBtcWallet"

let unisat = (window as any).unisat

export default function useBtcXudtTransfer() {

    const {network} = useContext(CKBContext)
    const {isBtcWallet, getSignPsbtWallet} = useBtcWallet()

    const signAndSend = async ({from, to, args, amount, feeRate}: {
        from: string
        to: string
        args: string
        amount: string
        feeRate: number
    }) => {
        if (!isBtcWallet) {
            throw new Error('not supported wallet')
        }

        const btcHelper = new BtcHelper(unisat, network === 'mainnet' ? 0 : 1, network !== 'mainnet' ? 'Testnet3' : undefined)
        const ckbHelper = new CkbHelper(network === 'mainnet')
        const wallet = getSignPsbtWallet()!

        try {
            const {btcTxId, ckbTxHash} = await transferCombined({
                toBtcAddress: to,
                xudtTypeArgs: args,
                transferAmount: BigInt(amount),
                collector: ckbHelper.collector,
                isMainnet: ckbHelper.isMainnet,
                fromBtcAccount: from,
                fromBtcAccountPubkey: await wallet.getPublicKey(),
                btcService: btcHelper.btcService,
                btcDataSource: btcHelper.btcDataSource,
                wallet,
            }, feeRate)

            return btcTxId
        } catch (e) {
            throw e
        }
    }


    return {signAndSend}
}
