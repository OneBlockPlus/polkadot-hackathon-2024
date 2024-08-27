import { Base } from './visitor.js';
export declare class WithDef extends Base {
    private _def;
    setDef(def: TypeDef): void;
    get def(): TypeDef;
}
export declare class Type extends WithDef {
    readonly name: string;
    constructor(ptr: number, memory: WebAssembly.Memory);
}
export declare enum DefKind {
    Struct = 0,
    Enum = 1,
    Optional = 2,
    Primitive = 3,
    Result = 4,
    Vec = 5,
    UserDefined = 6,
    FixedSizeArray = 7,
    Map = 8
}
type DefVariants = StructDef | EnumDef | OptionalDef | PrimitiveDef | ResultDef | VecDef | UserDefinedDef | MapDef | FixedSizeArrayDef;
export declare class TypeDef {
    private _def;
    private _kind;
    constructor(def: DefVariants, kind: DefKind);
    get isStruct(): boolean;
    get isEnum(): boolean;
    get isOptional(): boolean;
    get isPrimitive(): boolean;
    get isResult(): boolean;
    get isVec(): boolean;
    get isMap(): boolean;
    get isFixedSizeArray(): boolean;
    get isUserDefined(): boolean;
    get asStruct(): StructDef;
    get asEnum(): EnumDef;
    get asOptional(): OptionalDef;
    get asPrimitive(): PrimitiveDef;
    get asResult(): ResultDef;
    get asVec(): VecDef;
    get asUserDefined(): UserDefinedDef;
    get asMap(): MapDef;
    get asFixedSizeArray(): FixedSizeArrayDef;
}
export declare enum EPrimitiveType {
    Null = 0,
    Bool = 1,
    Char = 2,
    Str = 3,
    U8 = 4,
    U16 = 5,
    U32 = 6,
    U64 = 7,
    U128 = 8,
    I8 = 9,
    I16 = 10,
    I32 = 11,
    I64 = 12,
    I128 = 13,
    ActorId = 14,
    CodeId = 15,
    MessageId = 16,
    H256 = 17,
    U256 = 18,
    H160 = 19,
    NonZeroU8 = 20,
    NonZeroU16 = 21,
    NonZeroU32 = 22,
    NonZeroU64 = 23,
    NonZeroU128 = 24,
    NonZeroU256 = 25
}
export declare class PrimitiveDef {
    private value;
    constructor(value: number);
    get isNull(): boolean;
    get isBool(): boolean;
    get isChar(): boolean;
    get isStr(): boolean;
    get isU8(): boolean;
    get isU16(): boolean;
    get isU32(): boolean;
    get isU64(): boolean;
    get isU128(): boolean;
    get isI8(): boolean;
    get isI16(): boolean;
    get isI32(): boolean;
    get isI64(): boolean;
    get isI128(): boolean;
    get isActorId(): boolean;
    get isCodeId(): boolean;
    get isMessageId(): boolean;
    get isH256(): boolean;
    get isU256(): boolean;
    get isH160(): boolean;
    get isNonZeroU8(): boolean;
    get isNonZeroU16(): boolean;
    get isNonZeroU32(): boolean;
    get isNonZeroU64(): boolean;
    get isNonZeroU128(): boolean;
    get isNonZeroU256(): boolean;
}
export declare class OptionalDef extends WithDef {
}
export declare class VecDef extends WithDef {
}
export declare class ResultDef {
    readonly ok: WithDef;
    readonly err: WithDef;
    constructor(ok_ptr: number, err_ptr: number, memory: WebAssembly.Memory);
}
export declare class MapDef {
    readonly key: WithDef;
    readonly value: WithDef;
    constructor(keyPtr: number, valuePtr: number, memory: WebAssembly.Memory);
}
export declare class StructDef extends Base {
    private _fields;
    constructor(ptr: number, memory: WebAssembly.Memory);
    addField(field: StructField): number;
    get fields(): StructField[];
    get isTuple(): boolean;
}
export declare class EnumDef extends Base {
    private _variants;
    constructor(ptr: number, memory: WebAssembly.Memory);
    addVariant(variant: EnumVariant): number;
    get variants(): EnumVariant[];
    get isNesting(): boolean;
}
export declare class StructField extends WithDef {
    readonly name: string;
    constructor(ptr: number, memory: WebAssembly.Memory);
}
export declare class EnumVariant extends WithDef {
    readonly name: string;
    constructor(ptr: number, memory: WebAssembly.Memory);
}
export declare class FixedSizeArrayDef extends WithDef {
    readonly len: number;
    constructor(ptr: number, len: number, memory: WebAssembly.Memory);
}
export declare class UserDefinedDef {
    readonly name: string;
    constructor(ptr: number, len: number, memory: WebAssembly.Memory);
}
export {};
