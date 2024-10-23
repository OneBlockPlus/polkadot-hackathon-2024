import {commons, helpers, Indexer, config as lumosConfig} from '@ckb-lumos/lumos'
import {useContext, useMemo} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {ccc} from "@ckb-ccc/connector-react"

export default function useCkbTransfer() {
    const {signer, config, network} = useContext(CKBContext)

    const scriptConfig = useMemo(() => {
        return network === 'testnet' ? lumosConfig.TESTNET : lumosConfig.MAINNET
    }, [network])

    const build = async ({
                             froms,
                             to,
                             amount,
                             payeeAddresses,
                             feeRate
                         }: { froms: string[], to: string, amount: string, payeeAddresses: string[], feeRate: number }) => {


        const indexer = new Indexer(config.ckb_indexer, config.ckb_rpc);
        const _txSkeleton = helpers.TransactionSkeleton({cellProvider: indexer})
        const txSkeleton = await commons.common.transfer(
            _txSkeleton,
            froms,
            to,
            BigInt(amount),
            undefined,
            undefined,
            {config: scriptConfig}
        )

        return await commons.common.payFeeByFeeRate(
            txSkeleton,
            payeeAddresses,
            feeRate,
            undefined,
            {config: scriptConfig}
        )
    }

    const calculateFee = async (feeRate: number, tx: helpers.TransactionSkeletonType, payeeAddresses: string[]) => {
        const newTxSkeleton = await commons.common.payFeeByFeeRate(
            tx,
            payeeAddresses,
            feeRate)

        const txSize = await commons.common.__tests__.getTransactionSize(newTxSkeleton!)
        const fee = (txSize + 4) * feeRate / 1000

        return fee + ''
    }

    const calculateSize = async (tx: helpers.TransactionSkeletonType) => {
        const size = await commons.common.__tests__.getTransactionSize(tx!)
        return size.toString()
    }

    const signAndSend = async ({
                                   to,
                                   amount,
                                   feeRate,
                                   sendAll
                               }: { to: string, amount: string, feeRate: number, sendAll?: boolean }) => {
        if (!signer) {
            throw new Error('Please connect wallet first')
        }

        const indexer = new Indexer(config.ckb_indexer, config.ckb_rpc);
        const _txSkeleton = helpers.TransactionSkeleton({cellProvider: indexer})
        let txSkeleton = await commons.common.transfer(
            _txSkeleton,
            (await signer.getAddresses()),
            to,
            BigInt(amount),
            undefined,
            undefined,
            {config: scriptConfig}
        )

        console.log('transfer tx before', txSkeleton)

        txSkeleton = await commons.common.payFeeByFeeRate(
            txSkeleton,
            [sendAll ? to : await signer.getRecommendedAddress()],
            feeRate,
            undefined,
            {config: scriptConfig}
        )

        const cccLib = ccc as any
        const tx = cccLib.Transaction.fromLumosSkeleton(txSkeleton);


        console.log('cccLib.Transaction', cccLib.Transaction)
        const hash = await signer.sendTransaction(tx)
        return hash
    }


    return {
        build,
        calculateFee,
        calculateSize,
        signAndSend
    }
}
