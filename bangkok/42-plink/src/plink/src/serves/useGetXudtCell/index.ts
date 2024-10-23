import {useContext, useEffect, useState} from "react"
import {TokenInfoWithAddress} from "@/utils/graphql/types"
import {Cell, config as lumosConfig, helpers, Indexer, commons} from "@ckb-lumos/lumos"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {hashType} from "@/serves/useXudtTransfer/lib"
import {CkbHelper, convertToTxSkeleton, createMergeXudtTransaction, createBurnXudtTransaction} from "mobit-sdk"
import {ccc} from "@ckb-ccc/connector-react"

export default function useGetXudtCell(tokenInfo?: TokenInfoWithAddress, addresses?: string[]) {
    const {config, network, signer} = useContext(CKBContext)
    const [data, setData] = useState<Cell[]>([])
    const [status, setStatus] = useState<'loading' | 'error' | 'complete'>('loading')
    const [error, setError] = useState<any | null>(null)

    useEffect(() => {
        if (!tokenInfo || !addresses || addresses.length === 0) {
            setStatus("complete")
            setError(null)
            setData([])
            return
        }

        (async () => {
            setStatus("loading")

            const indexer = new Indexer(config.ckb_indexer, config.ckb_rpc)
            const scriptConfig = network === 'mainnet' ? lumosConfig.MAINNET : lumosConfig.TESTNET
            const senderLocks = addresses.map((address) => {
                return helpers.addressToScript(address, {config: scriptConfig})
            })

            const typeScript: any = {
                codeHash: tokenInfo.address.script_code_hash.replace('\\', '0'),
                hashType: hashType[tokenInfo.address.script_hash_type],
                args: tokenInfo.address.script_args.replace('\\', '0'),
            }

            let collected: Cell[] = []

            try {
                for (const lock of senderLocks) {
                    const collector = indexer.collector({lock: lock, type: typeScript});
                    for await (const cell of collector.collect()) {
                        collected.push(cell)
                    }
                }

                setData(collected)
                setStatus("complete")
            } catch (e) {
                console.warn(e)
                setStatus("error")
                setData([])
                setError(e)
            }
        })()

    }, [tokenInfo?.type_id, addresses, config.ckb_indexer, config.ckb_rpc, network])


    const createMergeXudtCellTx = async () => {
        if (!tokenInfo || !addresses || !addresses.length) return null

        const ckbHelper = new CkbHelper(network === 'mainnet')

        let tx = await createMergeXudtTransaction({
            xudtArgs: tokenInfo.address.script_args.replace('\\', '0'),
            ckbAddresses: addresses,
            collector: ckbHelper.collector,
            isMainnet: network === 'mainnet'
        })

        // const OMNILOCK = lumosConfig.MAINNET.SCRIPTS.OMNILOCK;
        //
        // tx.cellDeps.push({
        //     outPoint: {
        //         txHash: OMNILOCK.TX_HASH,
        //         index: OMNILOCK.INDEX,
        //     },
        //     depType: OMNILOCK.DEP_TYPE,
        // })

        let txSkeleton = await convertToTxSkeleton(tx, ckbHelper.collector)
        const cccLib = ccc as any
        txSkeleton = cccLib.Transaction.fromLumosSkeleton(txSkeleton)
        // txSkeleton =  await commons.common.payFeeByFeeRate(txSkeleton, addresses,1000)

        //
        // (txSkeleton as any).outputs[1].capacity = (txSkeleton as any).outputs[1].capacity - BigInt(100);


        console.log('txSkeleton', txSkeleton)
        return txSkeleton
    }

    const createBurnXudtCellTx = async (burnAmount: bigint) => {
        if (!tokenInfo || !addresses || !addresses.length || burnAmount === BigInt(0)) return null
        const ckbHelper = new CkbHelper(network === 'mainnet')

        let tx = await createBurnXudtTransaction({
            xudtArgs: tokenInfo.address.script_args.replace('\\', '0'),
            ckbAddress: addresses[0],
            burnAmount: burnAmount,
            collector: ckbHelper.collector,
            isMainnet: network === 'mainnet'
        })

        let txSkeleton = await convertToTxSkeleton(tx, ckbHelper.collector)
        const cccLib = ccc as any
        txSkeleton = cccLib.Transaction.fromLumosSkeleton(txSkeleton)

        console.log('txSkeleton', txSkeleton)
        return txSkeleton
    }

    const signAndSend = async (tx: helpers.TransactionSkeletonType) => {
        if (!tokenInfo || !addresses || !addresses.length) return null

        if (!signer) {
            throw new Error('Please connect wallet first.')
        }

        console.log('signer', signer)

        const hash = await signer.sendTransaction(tx as any)
        return hash
    }


    return {
        data,
        status,
        error,
        createMergeXudtCellTx,
        createBurnXudtCellTx,
        signAndSend
    }
}
