import {BtcHelper, CkbHelper, convertToTxSkeleton, leapFromCkbToBtcTransaction} from "mobit-sdk"
import {CKBContext,} from "@/providers/CKBProvider/CKBProvider"
import {useContext, useMemo} from "react"
import {BtcApiUtxo} from '@rgbpp-sdk/service'
import {ccc} from "@ckb-ccc/connector-react"
import {helpers} from "@ckb-lumos/lumos"
import useBtcWallet from '@/serves/useBtcWallet'

export type BtcUtxo =  BtcApiUtxo

export default function useLeapXudtToLayer1() {
    const {network, address, signer} = useContext(CKBContext)
    const {isBtcWallet, getSignPsbtWallet} = useBtcWallet()

    const btcHelper = useMemo(() => {
        if (!isBtcWallet) return null
        const wallet = getSignPsbtWallet()!
        return new BtcHelper(wallet, network === 'mainnet' ? 0 : 1, network !== 'mainnet' ? 'Testnet3' : undefined)
    }, [network, isBtcWallet])

    const getUTXO = async (props: { btcAddress: string }) => {
        if (!btcHelper) {
            console.warn('not supported wallet')
            return []
        }

        const utxos = await btcHelper.btcService.getBtcUtxos(props.btcAddress, {
            only_non_rgbpp_utxos: true,
            only_confirmed: true,
            min_satoshi: 546
        })

        return utxos as BtcUtxo[]
    }

    const buildLeapTx = async (props: {
        outIndex: number,
        btcTxId: string,
        transferAmount: bigint,
        xudtTypeArgs: string
        feeRate?: bigint,
    }) => {
        if (!signer) {
            throw new Error('Please connect wallet')
        }

        if (!isBtcWallet) {
            throw new Error('Unsupported wallet')
        }

        const ckbHelper = new CkbHelper(network === 'mainnet')

        const tx = await leapFromCkbToBtcTransaction({
            outIndex: props.outIndex,
            btcTxId: props.btcTxId,
            xudtTypeArgs: props.xudtTypeArgs,
            transferAmount: props.transferAmount,
            isMainnet: network === 'mainnet',
            btcTestnetType: network !== 'mainnet' ?  'Testnet3' : undefined,
            collector: ckbHelper.collector,
            ckbAddress: address!,
        }, props.feeRate)

        const skeleton = await convertToTxSkeleton(tx, ckbHelper.collector)

        console.log('tx', skeleton)
        return skeleton
    }

    const leap = async (tx:helpers.TransactionSkeletonType) => {
        if (!signer) {
            throw new Error('Please connect wallet')
        }

        return await signer.sendTransaction(ccc.Transaction.fromLumosSkeleton(tx))
    }

    return {buildLeapTx, getUTXO, leap}
}
