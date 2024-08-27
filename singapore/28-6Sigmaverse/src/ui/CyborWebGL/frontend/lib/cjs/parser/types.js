var util = require('./util.js');
var visitor = require('./visitor.js');

class WithDef extends visitor.Base {
    _def;
    setDef(def) {
        if (this._def)
            throw new Error('def already set');
        this._def = def;
    }
    get def() {
        return this._def;
    }
}
class Type extends WithDef {
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = util.getName(ptr, this.offset, memory);
        this.name = name;
        this.offset = offset;
    }
}
exports.DefKind = void 0;
(function (DefKind) {
    DefKind[DefKind["Struct"] = 0] = "Struct";
    DefKind[DefKind["Enum"] = 1] = "Enum";
    DefKind[DefKind["Optional"] = 2] = "Optional";
    DefKind[DefKind["Primitive"] = 3] = "Primitive";
    DefKind[DefKind["Result"] = 4] = "Result";
    DefKind[DefKind["Vec"] = 5] = "Vec";
    DefKind[DefKind["UserDefined"] = 6] = "UserDefined";
    DefKind[DefKind["FixedSizeArray"] = 7] = "FixedSizeArray";
    DefKind[DefKind["Map"] = 8] = "Map";
})(exports.DefKind || (exports.DefKind = {}));
class TypeDef {
    _def;
    _kind;
    constructor(def, kind) {
        this._def = def;
        this._kind = kind;
    }
    get isStruct() {
        return this._kind === exports.DefKind.Struct;
    }
    get isEnum() {
        return this._kind === exports.DefKind.Enum;
    }
    get isOptional() {
        return this._kind === exports.DefKind.Optional;
    }
    get isPrimitive() {
        return this._kind === exports.DefKind.Primitive;
    }
    get isResult() {
        return this._kind === exports.DefKind.Result;
    }
    get isVec() {
        return this._kind === exports.DefKind.Vec;
    }
    get isMap() {
        return this._kind === exports.DefKind.Map;
    }
    get isFixedSizeArray() {
        return this._kind === exports.DefKind.FixedSizeArray;
    }
    get isUserDefined() {
        return this._kind === exports.DefKind.UserDefined;
    }
    get asStruct() {
        if (!this.isStruct)
            throw new Error('not a struct');
        return this._def;
    }
    get asEnum() {
        if (!this.isEnum)
            throw new Error('not a enum');
        return this._def;
    }
    get asOptional() {
        if (!this.isOptional)
            throw new Error('not a optional');
        return this._def;
    }
    get asPrimitive() {
        if (!this.isPrimitive)
            throw new Error('not a primitive');
        return this._def;
    }
    get asResult() {
        if (!this.isResult)
            throw new Error('not a result');
        return this._def;
    }
    get asVec() {
        if (!this.isVec)
            throw new Error('not a vec');
        return this._def;
    }
    get asUserDefined() {
        if (!this.isUserDefined)
            throw new Error('not a user defined');
        return this._def;
    }
    get asMap() {
        if (!this.isMap)
            throw new Error('not a map');
        return this._def;
    }
    get asFixedSizeArray() {
        if (!this.isFixedSizeArray)
            throw new Error('not a fixed size array');
        return this._def;
    }
}
exports.EPrimitiveType = void 0;
(function (EPrimitiveType) {
    EPrimitiveType[EPrimitiveType["Null"] = 0] = "Null";
    EPrimitiveType[EPrimitiveType["Bool"] = 1] = "Bool";
    EPrimitiveType[EPrimitiveType["Char"] = 2] = "Char";
    EPrimitiveType[EPrimitiveType["Str"] = 3] = "Str";
    EPrimitiveType[EPrimitiveType["U8"] = 4] = "U8";
    EPrimitiveType[EPrimitiveType["U16"] = 5] = "U16";
    EPrimitiveType[EPrimitiveType["U32"] = 6] = "U32";
    EPrimitiveType[EPrimitiveType["U64"] = 7] = "U64";
    EPrimitiveType[EPrimitiveType["U128"] = 8] = "U128";
    EPrimitiveType[EPrimitiveType["I8"] = 9] = "I8";
    EPrimitiveType[EPrimitiveType["I16"] = 10] = "I16";
    EPrimitiveType[EPrimitiveType["I32"] = 11] = "I32";
    EPrimitiveType[EPrimitiveType["I64"] = 12] = "I64";
    EPrimitiveType[EPrimitiveType["I128"] = 13] = "I128";
    EPrimitiveType[EPrimitiveType["ActorId"] = 14] = "ActorId";
    EPrimitiveType[EPrimitiveType["CodeId"] = 15] = "CodeId";
    EPrimitiveType[EPrimitiveType["MessageId"] = 16] = "MessageId";
    EPrimitiveType[EPrimitiveType["H256"] = 17] = "H256";
    EPrimitiveType[EPrimitiveType["U256"] = 18] = "U256";
    EPrimitiveType[EPrimitiveType["H160"] = 19] = "H160";
    EPrimitiveType[EPrimitiveType["NonZeroU8"] = 20] = "NonZeroU8";
    EPrimitiveType[EPrimitiveType["NonZeroU16"] = 21] = "NonZeroU16";
    EPrimitiveType[EPrimitiveType["NonZeroU32"] = 22] = "NonZeroU32";
    EPrimitiveType[EPrimitiveType["NonZeroU64"] = 23] = "NonZeroU64";
    EPrimitiveType[EPrimitiveType["NonZeroU128"] = 24] = "NonZeroU128";
    EPrimitiveType[EPrimitiveType["NonZeroU256"] = 25] = "NonZeroU256";
})(exports.EPrimitiveType || (exports.EPrimitiveType = {}));
class PrimitiveDef {
    value;
    constructor(value) {
        this.value = value;
    }
    get isNull() {
        return this.value === exports.EPrimitiveType.Null;
    }
    get isBool() {
        return this.value === exports.EPrimitiveType.Bool;
    }
    get isChar() {
        return this.value === exports.EPrimitiveType.Char;
    }
    get isStr() {
        return this.value === exports.EPrimitiveType.Str;
    }
    get isU8() {
        return this.value === exports.EPrimitiveType.U8;
    }
    get isU16() {
        return this.value === exports.EPrimitiveType.U16;
    }
    get isU32() {
        return this.value === exports.EPrimitiveType.U32;
    }
    get isU64() {
        return this.value === exports.EPrimitiveType.U64;
    }
    get isU128() {
        return this.value === exports.EPrimitiveType.U128;
    }
    get isI8() {
        return this.value === exports.EPrimitiveType.I8;
    }
    get isI16() {
        return this.value === exports.EPrimitiveType.I16;
    }
    get isI32() {
        return this.value === exports.EPrimitiveType.I32;
    }
    get isI64() {
        return this.value === exports.EPrimitiveType.I64;
    }
    get isI128() {
        return this.value === exports.EPrimitiveType.I128;
    }
    get isActorId() {
        return this.value === exports.EPrimitiveType.ActorId;
    }
    get isCodeId() {
        return this.value === exports.EPrimitiveType.CodeId;
    }
    get isMessageId() {
        return this.value === exports.EPrimitiveType.MessageId;
    }
    get isH256() {
        return this.value === exports.EPrimitiveType.H256;
    }
    get isU256() {
        return this.value === exports.EPrimitiveType.U256;
    }
    get isH160() {
        return this.value === exports.EPrimitiveType.H160;
    }
    get isNonZeroU8() {
        return this.value === exports.EPrimitiveType.NonZeroU8;
    }
    get isNonZeroU16() {
        return this.value === exports.EPrimitiveType.NonZeroU16;
    }
    get isNonZeroU32() {
        return this.value === exports.EPrimitiveType.NonZeroU32;
    }
    get isNonZeroU64() {
        return this.value === exports.EPrimitiveType.NonZeroU64;
    }
    get isNonZeroU128() {
        return this.value === exports.EPrimitiveType.NonZeroU128;
    }
    get isNonZeroU256() {
        return this.value === exports.EPrimitiveType.NonZeroU256;
    }
}
class OptionalDef extends WithDef {
}
class VecDef extends WithDef {
}
class ResultDef {
    ok;
    err;
    constructor(ok_ptr, err_ptr, memory) {
        this.ok = new WithDef(ok_ptr, memory);
        this.err = new WithDef(err_ptr, memory);
    }
}
class MapDef {
    key;
    value;
    constructor(keyPtr, valuePtr, memory) {
        this.key = new WithDef(keyPtr, memory);
        this.value = new WithDef(valuePtr, memory);
    }
}
class StructDef extends visitor.Base {
    _fields;
    constructor(ptr, memory) {
        super(ptr, memory);
        this._fields = new Map();
    }
    addField(field) {
        const id = field.rawPtr;
        this._fields.set(id, field);
        return id;
    }
    get fields() {
        return Array.from(this._fields.values());
    }
    get isTuple() {
        return this.fields.every((f) => f.name === '');
    }
}
class EnumDef extends visitor.Base {
    _variants;
    constructor(ptr, memory) {
        super(ptr, memory);
        this._variants = new Map();
    }
    addVariant(variant) {
        const id = variant.rawPtr;
        this._variants.set(id, variant);
        return id;
    }
    get variants() {
        return Array.from(this._variants.values());
    }
    get isNesting() {
        return this.variants.some((v) => !!v.def);
    }
}
class StructField extends WithDef {
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = util.getName(ptr, this.offset, memory);
        this.name = name;
        this.offset = offset;
    }
}
class EnumVariant extends WithDef {
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = util.getName(ptr, this.offset, memory);
        this.name = name;
        this.offset = offset;
    }
}
class FixedSizeArrayDef extends WithDef {
    len;
    constructor(ptr, len, memory) {
        super(ptr, memory);
        this.len = len;
    }
}
class UserDefinedDef {
    name;
    constructor(ptr, len, memory) {
        this.name = util.getText(ptr, len, memory);
    }
}

exports.EnumDef = EnumDef;
exports.EnumVariant = EnumVariant;
exports.FixedSizeArrayDef = FixedSizeArrayDef;
exports.MapDef = MapDef;
exports.OptionalDef = OptionalDef;
exports.PrimitiveDef = PrimitiveDef;
exports.ResultDef = ResultDef;
exports.StructDef = StructDef;
exports.StructField = StructField;
exports.Type = Type;
exports.TypeDef = TypeDef;
exports.UserDefinedDef = UserDefinedDef;
exports.VecDef = VecDef;
exports.WithDef = WithDef;
