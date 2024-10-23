import {useContext, useEffect} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import {bytifyRawString, createCluster, createSpore, predefinedSporeConfigs} from '@spore-sdk/core'
import {config as lumsCoinfg, helpers} from "@ckb-lumos/lumos";
import {BI} from '@ckb-lumos/bi';
import {getInfoFromOmnilockArgs} from "@/pages/Test/wallet";
import {ccc} from "@ckb-ccc/connector-react"
import useLeapXudtToLayer1 from "@/serves/useLeapXudtToLayer1";
import {isBtcAddress} from "@/utils/common";
import DialogLeapXudtToLayer2 from "@/components/Dialogs/DialogLeapXudtToLayer2/DialogLeapXudtToLayer2";

export default function Test() {
    const {
        network,
        address,
        addresses,
        internalAddress,
        signer, // 没链接钱包是undefined
    } = useContext(CKBContext) // ccc 的 api

    const handleCreateSpore = async () => {
        if (!address || !signer) return

        const config = predefinedSporeConfigs.Aggron4;

        const scriptConfig = network === 'mainnet' ? lumsCoinfg.MAINNET : lumsCoinfg.TESTNET

        console.log('scriptConfig', scriptConfig)

        const toLock = helpers.addressToScript(address, {config: scriptConfig})

        console.log('toLock', toLock)

        let {txSkeleton} = await createSpore({
            data: {
                contentType: 'text/plain',
                content: bytifyRawString('spore text content'),
                clusterId: '0x6c7df3eee9af40d4e0f27356e7dcb02a54e33f7d81a40af57d0de1f3856ab750',
            },
            toLock: toLock,
            fromInfos: [address],
            cluster: {
                capacityMargin: (clusterCell, margin) => {
                    const args = getInfoFromOmnilockArgs(clusterCell.cellOutput.lock.args);
                    const minCkb = args.minCkb !== void 0
                        ? BI.from(10).pow(args.minCkb)
                        : BI.from(0);

                    return margin.add(minCkb as any);
                },

                updateWitness: '0x',
            },
            config
        });

        console.log('txSkeleton', txSkeleton)
        const cccLib = ccc as any
        const __tx = cccLib.Transaction.fromLumosSkeleton(txSkeleton)
        console.log(__tx)
        const txHash = await signer.sendTransaction(__tx)

        return txHash
    }
    const handleCreateCluster = async () => {
        if (!address || !signer) return

        const config = predefinedSporeConfigs.Aggron4;

        const scriptConfig = network === 'mainnet' ? lumsCoinfg.MAINNET : lumsCoinfg.TESTNET

        const toLock = helpers.addressToScript(address, {config: scriptConfig})

        let {txSkeleton} = await createCluster({
            data: {
                name: 'Test omnilock acp cluster',
                description: 'An public cluster with omnilock',
            },
            toLock: toLock,
            fromInfos: [address],
            config
        });

        console.log('txSkeleton', txSkeleton)
        const cccLib = ccc as any
        const __tx = cccLib.Transaction.fromLumosSkeleton(txSkeleton)
        console.log("__tx", __tx)
        const txHash = await signer.sendTransaction(__tx)

        return txHash
    }


    const {getUTXO} = useLeapXudtToLayer1()

    useEffect(() => {
        (async () => {
            if (!!internalAddress && isBtcAddress(internalAddress, network === 'mainnet')) {
                const utxos = await getUTXO({btcAddress: internalAddress}).then(console.log)
                console.log(utxos)
            }
        })()
    }, [internalAddress]);
    return <div>
        <div onClick={handleCreateSpore}>create spore</div>
        <div onClick={handleCreateCluster}>handleCreateCluster</div>
        <div onClick={e => {

        }}>prepareUTXO
        </div>
        <div>
            <DialogLeapXudtToLayer2 token={{
                type_id: '',
                symbol: 'XUDT',
                name: 'XUDT',
                amount: '0',
                decimal: 8,
                type: 'xudt',
                chain: 'ckb',
                address: {
                    id: '',
                    script_args: '',
                    script_code_hash: '',
                    script_hash_type: ''
                },
                addressByInscriptionId: null
            }}>
                <div>test</div>
            </DialogLeapXudtToLayer2>
        </div>
    </div>
}
