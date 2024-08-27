import { GearApi, HexString, UserMessageSent } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types/create';
import { Program, TypeDef, WasmParser } from './parser/index.js';
import { TransactionBuilder } from './transaction-builder.js';
interface SailsService {
    readonly functions: Record<string, SailsServiceFunc>;
    readonly queries: Record<string, SailsServiceQuery>;
    readonly events: Record<string, SailsServiceEvent>;
}
interface ISailsFuncArg {
    /** ### Argument name */
    name: string;
    /** ### Argument type */
    type: any;
    /** ### Argument type definition */
    typeDef: TypeDef;
}
interface ISailsServiceFuncParams {
    /** ### List of argument names and types  */
    readonly args: ISailsFuncArg[];
    /** ### Function return type */
    readonly returnType: any;
    /** ### Function return type definition */
    readonly returnTypeDef: TypeDef;
    /** ### Encode payload to hex string */
    readonly encodePayload: (...args: any[]) => HexString;
    /** ### Decode payload from hex string */
    readonly decodePayload: <T extends any = any>(bytes: HexString) => T;
    /** ### Decode function result */
    readonly decodeResult: <T extends any = any>(result: HexString) => T;
}
type SailsServiceQuery = ISailsServiceFuncParams & (<T>(origin: string, value?: bigint, atBlock?: HexString, ...args: unknown[]) => Promise<T>);
type SailsServiceFunc = ISailsServiceFuncParams & (<T>(...args: unknown[]) => TransactionBuilder<T>);
interface SailsServiceEvent {
    /** ### Event type */
    readonly type: any;
    /** ###  */
    readonly typeDef: TypeDef;
    /** ### Check if event is of this type */
    readonly is: (event: UserMessageSent) => boolean;
    /** ### Decode event payload */
    readonly decode: (payload: HexString) => any;
    /** ### Subscribe to event
     * @returns Promise with unsubscribe function
     */
    readonly subscribe: <T>(cb: (event: T) => void | Promise<void>) => Promise<() => void>;
}
interface ISailsCtorFuncParams {
    /** ### List of argument names and types  */
    readonly args: ISailsFuncArg[];
    /** ### Encode payload to hex string */
    readonly encodePayload: (...args: any[]) => HexString;
    /** ### Decode payload from hex string */
    readonly decodePayload: <T>(bytes: HexString) => T;
    /** ### Create transaction builder from code */
    readonly fromCode: (code: Uint8Array | Buffer, ...args: unknown[]) => TransactionBuilder<any>;
    /** ### Create transaction builder from code id */
    readonly fromCodeId: (codeId: HexString, ...args: unknown[]) => TransactionBuilder<any>;
}
export declare class Sails {
    private _parser;
    private _program;
    private _scaleTypes;
    private _registry;
    private _api?;
    private _programId?;
    constructor(parser: WasmParser);
    /** #### Create new Sails instance */
    static new(): Promise<Sails>;
    /** ### Set api to use for transactions */
    setApi(api: GearApi): this;
    /** ### Set program id to interact with */
    setProgramId(programId: HexString): this;
    /** ### Get program id */
    get programId(): `0x${string}`;
    /**
     * ### Parse IDL from string
     * @param idl - IDL string
     */
    parseIdl(idl: string): this;
    private generateScaleCodeTypes;
    /** #### Scale code types from the parsed IDL */
    get scaleCodecTypes(): Record<string, any>;
    /** #### Registry with registered types from the parsed IDL */
    get registry(): TypeRegistry;
    private _getFunctions;
    private _getEvents;
    /** #### Services with functions and events from the parsed IDL */
    get services(): Record<string, SailsService>;
    /** #### Constructor functions with arguments from the parsed IDL */
    get ctors(): Record<string, ISailsCtorFuncParams>;
    /** #### Parsed IDL */
    get program(): Program;
    /** #### Get type definition by name */
    getTypeDef(name: string): TypeDef;
}
export {};
