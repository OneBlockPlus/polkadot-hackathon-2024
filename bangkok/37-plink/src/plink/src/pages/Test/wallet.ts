
import { SporeConfig, getSporeConfig, isScriptIdEquals } from '@spore-sdk/core';
import { defaultEmptyWitnessArgs, updateWitnessArgs } from '@spore-sdk/core';
import { hd, helpers, HexString, RPC } from '@ckb-lumos/lumos';
import { Address, Hash, Script } from '@ckb-lumos/base';
import { omnilock } from '@ckb-lumos/common-scripts';
import { bytes, number } from '@ckb-lumos/codec';

export interface OmnilockWallet {
    lock: Script;
    address: Address;
    createLock(lockArgs?: HexString): Script;
    isLockAuthEquals(targetLock: Script): boolean;
    signMessage(message: Hash): Promise<Hash> | Hash;
    signTransaction(txSkeleton: helpers.TransactionSkeletonType): Promise<helpers.TransactionSkeletonType>;
    signAndSendTransaction(txSkeleton: helpers.TransactionSkeletonType): Promise<Hash>;
}

/**
 * Create an Omnilock Wallet.
 * This method can be seen as a meta function to create complex Omnilock Based Wallets.
 * Detailed instructions of the Omnilock: https://blog.cryptape.com/omnilock-a-universal-lock-that-powers-interoperability-1
 */
export function createOmnilockWallet(props: {
    lockAuth: HexString;
    lockArgs?: HexString;
    config?: SporeConfig;
    signMessage(message: Hash): Promise<Hash> | Hash;
}): OmnilockWallet {
    const config = props.config ?? getSporeConfig();

    // Generate a lock script from the private key
    const lock = createOmnilockLock(props);

    // Generate address from the lock script
    const address = helpers.encodeToAddress(lock, {
        config: config.lumos,
    });

    // Create an Omnilock lock script based on the current wallet's lock.
    function createLock(lockArgs?: HexString): Script {
        return createOmnilockLock({
            lockAuth: props.lockAuth,
            config: props.config,
            lockArgs,
        });
    }

    // Check if the target lock script has the same auth as the wallet's lock
    function isLockAuthEquals(targetLock: Script): boolean {
        return isScriptIdEquals(lock, targetLock) && targetLock.args.startsWith(props.lockAuth);
    }

    // Sign for a message
    async function signMessage(message: HexString): Promise<Hash> {
        return props.signMessage(message);
    }

    // Sign prepared signing entries,
    // and then fill signatures into Transaction.witnesses
    async function signTransaction(
        txSkeleton: helpers.TransactionSkeletonType,
    ): Promise<helpers.TransactionSkeletonType> {
        const signingEntries = txSkeleton.get('signingEntries');
        const signatures = new Map<HexString, Hash>();
        const inputs = txSkeleton.get('inputs');

        let witnesses = txSkeleton.get('witnesses');
        for (let i = 0; i < signingEntries.size; i++) {
            const entry = signingEntries.get(i)!;
            if (entry.type === 'witness_args_lock') {
                const input = inputs.get(entry.index);
                if (!input || !isLockAuthEquals(input.cellOutput.lock)) {
                    continue;
                }
                if (!signatures.has(entry.message)) {
                    const newSignature = await signMessage(entry.message);
                    signatures.set(entry.message, newSignature);
                }

                const signature = signatures.get(entry.message)!;
                const witness = witnesses.get(entry.index, defaultEmptyWitnessArgs);
                witnesses = witnesses.set(entry.index, updateWitnessArgs(witness, 'lock', signature));
            }
        }

        return txSkeleton.set('witnesses', witnesses);
    }

    // Sign the transaction and send it via RPC
    async function signAndSendTransaction(txSkeleton: helpers.TransactionSkeletonType): Promise<Hash> {
        // Create an RPC instance from a node url defined in the SporeConfig
        const rpc = new RPC(config.ckbNodeUrl);

        // Sign transaction
        txSkeleton = omnilock.prepareSigningEntries(txSkeleton, { config: config.lumos });
        txSkeleton = await signTransaction(txSkeleton);

        // Convert to Transaction
        const tx = helpers.createTransactionFromSkeleton(txSkeleton);
        console.log(JSON.stringify(tx, null, 2));

        // Send transaction
        return await rpc.sendTransaction(tx, 'passthrough');
    }

    return {
        lock,
        address,
        createLock,
        isLockAuthEquals,
        signMessage,
        signTransaction,
        signAndSendTransaction,
    };
}

/**
 * Create an Omnilock wallet with the default auth info of Secp256k1Blake160 Sign-all.
 *
 * The Secp256k1Blake160 Sign-all is represented as 0x00.
 * Refer to: https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0042-omnilock/0042-omnilock.md#authentication
 */
export function createOmnilockSecp256k1Wallet(props: {
    privateKey: HexString;
    lockArgs?: HexString;
    config?: SporeConfig;
}): OmnilockWallet {
    const { privateKey, lockArgs, config } = props;

    function signMessage(message: HexString): Hash {
        const sig = hd.key.signRecoverable(message, privateKey);
        return bytes.hexify(
            omnilock.OmnilockWitnessLock.pack({
                signature: sig,
            }),
        );
    }

    const blake160 = hd.key.privateKeyToBlake160(privateKey);
    const lockAuth = `0x00${removeHexPrefix(blake160)}`;
    return createOmnilockWallet({
        signMessage,
        lockAuth,
        lockArgs,
        config,
    });
}

/**
 * Create an Omnilock lock script.
 */
export function createOmnilockLock(props: { lockAuth: HexString; lockArgs?: HexString; config?: SporeConfig }): Script {
    const config = props.config ?? getSporeConfig();
    const Omnilock = config.lumos.SCRIPTS.OMNILOCK!;
    const omnilockArgs = props.lockArgs ?? '0x00';

    return {
        codeHash: Omnilock.CODE_HASH,
        hashType: Omnilock.HASH_TYPE,
        args: `${props.lockAuth}${removeHexPrefix(omnilockArgs)}`,
    };
}

/**
 * Create ACP Omnilock args with minimalCkb and minimalUdt parameters.
 * minCkb: The minimal required digit of payment CKBytes.
 */
export function createOmnilockAcpArgs(props: {
    minCkb: number,
}): HexString {
    const minimalCkb = bytes.hexify(number.Uint8.pack(props.minCkb ?? 0));
    return `0x02${removeHexPrefix(minimalCkb)}00`;
}

export function getInfoFromOmnilockArgs(args: HexString) {
    args = removeHexPrefix(args);

    // Omnilock args
    const lockArgs = args.slice(42);

    // Function to cut lockArgs content
    let startIndex = 0;
    function getFromLockArgs(length: number) {
        const content = lockArgs.slice(startIndex, startIndex + length);
        startIndex += length;
        return content;
    }

    // Omnilock args flag
    const flag = number.Uint8.unpack(`0x${getFromLockArgs(2)}`);
    const flagArray: number[] = [];
    for (let i = 7; i >= 0; i--) {
        flagArray.push((flag >> i) & 1);
    }

    // Is "administrator mode" enabled
    let adminListCellTypeId: Hash | undefined;
    if (flagArray[7] === 1) {
        adminListCellTypeId = `0x${getFromLockArgs(64)}`;
    }

    // Is "anyone-can-pay mode" enabled
    let minCkb: number | undefined;
    let minUdt: number | undefined;
    if (flagArray[6] === 1) {
        const ckb = getFromLockArgs(2);
        const udt = getFromLockArgs(2);
        minCkb = number.Uint8.unpack(`0x${ckb}`);
        minUdt = number.Uint8.unpack(`0x${udt}`);
    }

    return {
        lockArgs,
        flag,
        flagArray,
        adminListCellTypeId,
        minCkb,
        minUdt,
    };
}

function removeHexPrefix(str: string): string {
    return str.startsWith('0x') ? str.slice(2) : str;
}
