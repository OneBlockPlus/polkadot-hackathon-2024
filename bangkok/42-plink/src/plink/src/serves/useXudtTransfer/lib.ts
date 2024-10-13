import {BI, Cell, config, helpers, Indexer, commons} from '@ckb-lumos/lumos';
import {blockchain, values} from '@ckb-lumos/base';
import {bytes, molecule, number} from '@ckb-lumos/codec';
import {Byte32, Bytes, BytesOpt} from '@ckb-lumos/codec/lib/blockchain';
import {fetchTypeIdCellDeps} from "@rgbpp-sdk/ckb"
import {queryAddressInfoWithAddress} from "@/utils/graphql";
import {TokenInfo} from "@/utils/graphql/types";

const {table, option, vector} = molecule;

const {Uint8} = number;

const Script = table(
    {
        codeHash: Byte32,
        hashType: Uint8,
        args: Bytes,
    },
    ['codeHash', 'hashType', 'args'],
);
const ScriptOpt = option(Script);
const ScriptVecOpt = option(vector(Script));

export const xudtWitnessType = table(
    {
        owner_script: ScriptOpt,
        owner_signature: BytesOpt,
        raw_extension_data: ScriptVecOpt,
        extension_data: vector(Bytes),
    },
    ['owner_script', 'owner_signature', 'raw_extension_data', 'extension_data'],
);

export type CellDep = any
type  TransactionSkeletonType = helpers.TransactionSkeletonType

export const hashType: any = {
    '0': 'data',
    '1': 'type',
    '2': 'data1',
    '3': 'data2'
}

const OMNILOCK = config.MAINNET.SCRIPTS.OMNILOCK


export async function transferTokenToAddress(
    fromAddresses: string[],
    amount: string,
    receiverAddress: string,
    tokenInfo: TokenInfo,
    indexer: Indexer,
    feeRate: number,
    network :'mainnet' | 'testnet',
    fee = 0,
): Promise<TransactionSkeletonType> {

    console.log('fee', fee)
    const scriptConfig = network === 'mainnet' ? config.MAINNET : config.TESTNET
    const tokenDetail = await queryAddressInfoWithAddress([tokenInfo.type_id], network === 'mainnet')

    if (!tokenDetail[0]) {
        throw new Error('Token not found')
    }

    const typeScript: any = {
        codeHash: tokenDetail[0].address.script_code_hash.replace('\\', '0'),
        hashType: hashType[tokenDetail[0].address.script_hash_type],
        args: tokenDetail[0].address.script_args.replace('\\', '0'),
    }

    const senderLockScript = helpers.addressToScript(fromAddresses[0], { config: scriptConfig })
    // console.log('senderLockScript', senderLockScript)
    const receiverLockScript = helpers.addressToScript(receiverAddress, { config: scriptConfig });
    // console.log('receiverLockScript', receiverLockScript)

    const lockDeps = OMNILOCK;


    let txSkeleton = helpers.TransactionSkeleton({cellProvider: indexer});

    txSkeleton = addCellDep(txSkeleton, {
        outPoint: {
            txHash: lockDeps.TX_HASH,
            index: lockDeps.INDEX,
        },
        depType: lockDeps.DEP_TYPE,
    });

    // omni_lock need to add a SECP256K1_BLAKE160 dep cell
    txSkeleton = addCellDep(txSkeleton, {
        outPoint: {
            txHash: config.MAINNET.SCRIPTS.SECP256K1_BLAKE160.TX_HASH,
            index: "0x0",
        },
        depType: 'depGroup',
    });

    const xdutDeps = await fetchTypeIdCellDeps(true, {xudt: true})

    // console.log('xdutDepsxdutDeps', xdutDeps)

    txSkeleton = addCellDep(txSkeleton, xdutDeps[0]);

    // build xudt output cell
    const targetOutput: Cell = {
        cellOutput: {
            capacity: '0x0',
            lock: receiverLockScript,
            type: typeScript,
        },
        data: bytes.hexify(number.Uint128LE.pack(amount)),
    };

    const targetOutputCapacity = helpers.minimalCellCapacity(targetOutput);
    targetOutput.cellOutput.capacity = '0x' + targetOutputCapacity.toString(16);

    console.log('targetOutputCapacity', targetOutputCapacity.toString())


    // additional 0.001 ckb for tx fee
    // the tx fee could calculated by tx size
    // this is just a simple example
    // todo calculate fee
    // const neededCapacity = BI.from(capacity.toString(10)).add(100000);

    const targetXudtCellNeededCapacity = BI.from(targetOutputCapacity.toString(10));
    console.log('targetXudtCellNeededCapacity', targetXudtCellNeededCapacity.toString())


    let xudtCollectedCapSum = BI.from(0);
    let xudtCollectedAmount = BI.from(0);
    const collected: Cell[] = [];

    const senderLocks = fromAddresses.map((address) => {
        return helpers.addressToScript(address, { config: scriptConfig })
    })


    let xudtCollectBreak = false
    for (const lock of senderLocks) {
        if (xudtCollectBreak) break

        const collector = indexer.collector({lock: lock, type: typeScript});
        console.log('xudt cells ->', collector)
        for await (const cell of collector.collect()) {
            xudtCollectedCapSum = xudtCollectedCapSum.add(cell.cellOutput.capacity);
            xudtCollectedAmount = xudtCollectedAmount.add(number.Uint128LE.unpack(cell.data) as any);
            console.log('cell', cell)
            collected.push(cell);
            if (xudtCollectedAmount >= BI.from(amount)) {
                xudtCollectBreak = true
                break;
            }
        }
    }

    console.log('collected inputs', collected)

    // const collector = indexer.collector({lock: senderLockScript, type: typeScript});
    // console.log('xudt cells ->', collector)
    // for await (const cell of collector.collect()) {
    //     xudtCollectedCapSum = xudtCollectedCapSum.add(cell.cellOutput.capacity);
    //     xudtCollectedAmount = xudtCollectedAmount.add(number.Uint128LE.unpack(cell.data));
    //     console.log('cell', cell)
    //     collected.push(cell);
    //     if (xudtCollectedAmount >= BI.from(amount)) break;
    // }

    console.log('xudtCollectedCapSum', xudtCollectedCapSum.toString())

    // 判断xudt是否需要找零
    let xudtChangeOutputTokenAmount = BI.from(0);
    let xudtChangeOutput: Cell | null = null
    let changeXudtOutputNeededCapacity = BI.from(0);
    if (xudtCollectedAmount.gt(BI.from(amount))) {
        xudtChangeOutputTokenAmount = xudtCollectedAmount.sub(BI.from(amount));
        xudtChangeOutput = {
            cellOutput: {
                capacity: '0x0',
                lock: senderLockScript,
                type: typeScript,
            },
            data: bytes.hexify(number.Uint128LE.pack(xudtChangeOutputTokenAmount.toString(10))),
        };

        // xudt找零cell的最小capacity
        changeXudtOutputNeededCapacity = BI.from(helpers.minimalCellCapacity(xudtChangeOutput));
        console.log('changeOutputNeededCapacity', changeXudtOutputNeededCapacity.toString(10))
        xudtChangeOutput.cellOutput.capacity = changeXudtOutputNeededCapacity.toHexString();
    }


    // fee 0.001
    let extraNeededCapacity = targetXudtCellNeededCapacity.add(changeXudtOutputNeededCapacity).sub(xudtCollectedCapSum).add(fee);
    console.log('extraNeededCapacity', extraNeededCapacity.toString(10))

    if (
        extraNeededCapacity.gt(0) ||
        xudtCollectedCapSum.sub(targetXudtCellNeededCapacity).sub(fee).lt(changeXudtOutputNeededCapacity)
    ) {

        if (xudtCollectedCapSum.sub(targetXudtCellNeededCapacity).sub(fee).lt(changeXudtOutputNeededCapacity)) {
            extraNeededCapacity = xudtCollectedCapSum
                .sub(targetXudtCellNeededCapacity)
                .sub(changeXudtOutputNeededCapacity)
                .sub(fee)
                .mul(-1)
            console.log('extraNeededCapacity after', extraNeededCapacity.toString(10))
            console.log('targetXudtCellNeededCapacity after', targetXudtCellNeededCapacity.toString(10))
        }

        let extraCollectedCapSum = BI.from(0);
        const extraCollectedCells: Cell[] = [];

        let ckbCollectBreak = false
        for (const lock of senderLocks) {
            if (ckbCollectBreak) break

            const collector = indexer.collector({lock: lock, type: 'empty'});
            console.log('ckb cells ->', collector)
            for await (const cell of collector.collect()) {
                extraCollectedCapSum = extraCollectedCapSum.add(cell.cellOutput.capacity);
                extraCollectedCells.push(cell);
                console.log('ckb cell', cell)
                if (extraCollectedCapSum.gte(extraNeededCapacity)) {
                    ckbCollectBreak = true
                    break;
                }
            }
        }
        // const collector = indexer.collector({lock: senderLockScript, type: 'empty'});
        // console.log('ckb cells ->', collector)
        // for await (const cell of collector.collect()) {
        //     extraCollectedCapSum = extraCollectedCapSum.add(cell.cellOutput.capacity);
        //     extraCollectedCells.push(cell);
        //     console.log('ckb cell', cell)
        //     if (extraCollectedCapSum.gte(extraNeededCapacity)) {
        //         console.log('break', extraCollectedCapSum >= extraNeededCapacity)
        //         break;
        //     }
        // }

        console.log('extraCollectedSum', extraCollectedCapSum.toString(10))
        console.log('extraNeededCapacity', extraNeededCapacity.toString(10))

        if (extraCollectedCapSum.lt(extraNeededCapacity)) {
            console.log(`Not enough CKB for change, ${extraCollectedCapSum} < ${extraNeededCapacity}`)
            throw new Error(`Not enough CKB for change, extra needed: ${extraNeededCapacity.div(10**8).toString(10)} CKB`);
        }

        txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...extraCollectedCells));

        const ckbChangeCapacity = extraCollectedCapSum.sub(extraNeededCapacity);
        console.log('extraCollectedCapSum', extraCollectedCapSum.toString(10))
        console.log('ckbChangeCapacity', ckbChangeCapacity.toString(10))
        if (ckbChangeCapacity.gt(6100000000)) {
            const ckbChangeOutput: Cell = {
                cellOutput: {
                    capacity: ckbChangeCapacity.toHexString(),
                    lock: senderLockScript,
                },
                data: '0x',
            };
            txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(ckbChangeOutput));
        } else {
            if (!!xudtChangeOutput) {
                // 扣完手续费之后ckb剩余不足61个转到xudt找零cell上
                xudtChangeOutput.cellOutput.capacity = changeXudtOutputNeededCapacity.add(ckbChangeCapacity).toHexString();
            } else {
                // 全额发送xudt不找零, 扣完手续费之后ckb剩余不足61个直接送给对方
                targetOutput.cellOutput.capacity = targetXudtCellNeededCapacity.add(ckbChangeCapacity).toHexString();
            }
        }
    } else {
        // xudt input cell 的 capacity 减去 target cell capacity
        if (!!xudtChangeOutput) {
            xudtChangeOutput.cellOutput.capacity = xudtCollectedCapSum
                .sub(targetXudtCellNeededCapacity)
                .sub(fee)
                .toHexString();
        } else {
            targetOutput.cellOutput.capacity = xudtCollectedCapSum
                .sub(fee)
                .toHexString();
        }
    }

    txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...collected));
    if (!!xudtChangeOutput) {
        txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(targetOutput, xudtChangeOutput!));
    } else {
        txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(targetOutput));
    }



    /* 65-byte zeros in hex */
    const lockWitness =
        '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

    const inputTypeWitness = xudtWitnessType.pack({extension_data: []});
    const outputTypeWitness = xudtWitnessType.pack({extension_data: []});
    const witnessArgs = blockchain.WitnessArgs.pack({
        lock: lockWitness,
        inputType: inputTypeWitness,
        outputType: outputTypeWitness,
    });
    const witness = bytes.hexify(witnessArgs);
    txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.set(0, witness));

    const inputs = txSkeleton.get('inputs').toArray().map((input) => {
        return Number(input.cellOutput.capacity.toString())
    });
    const outputs = txSkeleton.get('outputs').toArray().map((out) => {
        return Number(out.cellOutput.capacity.toString())
    });
    console.log('inputs cap', inputs)
    console.log('outputs cap', outputs)

    if (fee === 0) {
        const txSize = commons.common.__tests__.getTransactionSize(txSkeleton);
        console.log(txSize)
        const _fee = (txSize + 300) * (feeRate / 1000)
        return await transferTokenToAddress(fromAddresses, amount, receiverAddress, tokenInfo, indexer, feeRate, network, _fee)
    } else {
        return txSkeleton
    }

    // txSkeleton = await commons.common.payFeeByFeeRate(
    //     txSkeleton,
    //     fromAddresses,
    //     feeRate,
    // );
    //
    // const inputs = txSkeleton.get('inputs').toArray().map((input) => {
    //     return Number(input.cellOutput.capacity.toString())
    // });
    // const outputs = txSkeleton.get('outputs').toArray().map((out) => {
    //     return Number(out.cellOutput.capacity.toString())
    // });
    // console.log('inputs cap', inputs)
    // console.log('outputs cap', outputs)
    //
    // return txSkeleton
}

export function addCellDep(txSkeleton: TransactionSkeletonType, newCellDep: CellDep): TransactionSkeletonType {
    const cellDep = txSkeleton.get('cellDeps').find((cellDep) => {
        return (
            cellDep.depType === newCellDep.depType &&
            new values.OutPointValue(cellDep.outPoint, {validate: false}).equals(
                new values.OutPointValue(newCellDep.outPoint, {validate: false}),
            )
        );
    });

    if (!cellDep) {
        txSkeleton = txSkeleton.update('cellDeps', (cellDeps) => {
            return cellDeps.push({
                outPoint: newCellDep.outPoint,
                depType: newCellDep.depType,
            });
        });
    }

    return txSkeleton;
}
