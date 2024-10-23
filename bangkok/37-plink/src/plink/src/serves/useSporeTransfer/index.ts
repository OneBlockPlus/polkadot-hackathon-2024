import {predefinedSporeConfigs, transferSpore} from '@spore-sdk/core'
import {useContext} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {config as lumosConfig, helpers, Indexer} from "@ckb-lumos/lumos"
import {ccc} from "@ckb-ccc/connector-react"
import {Spores} from "@/utils/graphql/types";
import {Script} from "@ckb-lumos/base";

const hashType: any = {
    '0': 'data',
    '1': 'type',
    '2': 'data1',
    '3': 'data2'
}

export default function useSporeTransfer() {
    const {signer, network, config} = useContext(CKBContext)

    const build = async ({payeeAddresses, to, spore, feeRate}: {
        payeeAddresses: string[],
        to: string,
        spore: Spores,
        feeRate: number
    }) => {

        // const type: Script = {
        //     codeHash: '0x685a60219309029d01310311dba953d67029170ca4848a4ff638e57002130a0d',
        //     hashType: 'data1',
        //     args: '0xce237260e07530db728f5cc5a149da080b9e6d11932a357c8f89f7f8319308dc'
        // }

        const type: Script = {
            codeHash: spore.addressByTypeId.script_code_hash.replace('\\', '0'),
            hashType: hashType[ spore.addressByTypeId.script_hash_type],
            args: spore.addressByTypeId.script_args.replace('\\', '0'),
        }

        const scriptConfig = network === 'testnet' ? lumosConfig.TESTNET : lumosConfig.MAINNET
        const sporeConfig = network === 'testnet' ? predefinedSporeConfigs.Testnet : predefinedSporeConfigs.Mainnet

        const indexer = new Indexer(config.ckb_indexer, config.ckb_rpc);
        const spores: any = []
        const collector = indexer.collector({type: type});
        for await (const cell of collector.collect()) {
            spores.push(cell);
        }

        if (!spores[0]) {
            throw new Error('Cannot find spore');
        }

        const toLock = helpers.addressToScript(to, {config: scriptConfig})
        const {txSkeleton} = await transferSpore({
            outPoint: spores[0].outPoint!,
            fromInfos: payeeAddresses,
            toLock,
            config: sporeConfig,
            feeRate: feeRate.toString(),
            useCapacityMarginAsFee: false
        })

        return txSkeleton
    }

    const send = async (txSkeleton: helpers.TransactionSkeletonType) => {
        if (!signer) {
            throw new Error('please set signer')
        }

        const tx = ccc.Transaction.fromLumosSkeleton(txSkeleton)
        return await signer.sendTransaction(tx)
    }

    return {
        build,
        send
    }

}
