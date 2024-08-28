import { GearApi, HexString } from '@gear-js/api';
import { SignerOptions, SubmittableExtrinsic } from '@polkadot/api/types';
import { IKeyringPair, ISubmittableResult } from '@polkadot/types/types';
import { TypeRegistry } from '@polkadot/types';
export interface IMethodReturnType<T> {
    /**
     * ## The id of the sent message.
     */
    msgId: HexString;
    /**
     * ## The blockhash of the block that contains the transaction.
     */
    blockHash: HexString;
    /**
     * ## The transaction hash.
     */
    txHash: HexString;
    /**
     * ## A promise that resolves when the block with the transaction is finalized.
     */
    isFinalized: Promise<boolean>;
    /**
     * ## A promise that resolves into the response from the program.
     * @param rawResult (optional) If true, the response will be the raw bytes of the function result, otherwise it will be decoded.
     */
    response: <Raw extends boolean = false>(rawResult?: Raw) => Promise<Raw extends true ? HexString : T>;
}
export declare class TransactionBuilder<ResponseType> {
    private _api;
    private _registry;
    private _responseType;
    private _account;
    private _signerOptions;
    private _tx;
    private _voucher;
    readonly programId: HexString;
    constructor(api: GearApi, registry: TypeRegistry, extrinsic: 'send_message', payload: unknown, payloadType: string, responseType: string, programId: HexString);
    constructor(api: GearApi, registry: TypeRegistry, extrinsic: 'upload_program', payload: unknown, payloadType: string, responseType: string, code: Uint8Array | ArrayBufferLike | HexString);
    constructor(api: GearApi, registry: TypeRegistry, extrinsic: 'create_program', payload: unknown, payloadType: string, responseType: string, codeId: HexString);
    private _getGas;
    private _getValue;
    private _setTxArg;
    /** ## Get submittable extrinsic */
    get extrinsic(): SubmittableExtrinsic<'promise', ISubmittableResult>;
    /** ## Get payload of the transaction */
    get payload(): HexString;
    /**
     * ## Calculate gas for transaction
     * @param allowOtherPanics Allow panics in other contracts to be triggered (default: false)
     * @param increaseGas Increase the gas limit by a percentage from 0 to 100 (default: 0)
     * @returns
     */
    calculateGas(allowOtherPanics?: boolean, increaseGas?: number): Promise<this>;
    /**
     * ## Set account for transaction
     * @param account
     * @param signerOptions
     */
    withAccount(account: string | IKeyringPair, signerOptions?: Partial<SignerOptions>): this;
    /**
     * ## Set value for transaction
     * @param value
     */
    withValue(value: bigint): Promise<this>;
    /**
     * ## Set gas for transaction
     * @param gas
     */
    withGas(gas: bigint): Promise<this>;
    /**
     * ## Use voucher for transaction
     * @param id Voucher id
     */
    withVoucher(id: HexString): this;
    /**
     * ## Get transaction fee
     */
    transactionFee(): Promise<bigint>;
    /**
     * ## Sign and send transaction
     */
    signAndSend(): Promise<IMethodReturnType<ResponseType>>;
}
