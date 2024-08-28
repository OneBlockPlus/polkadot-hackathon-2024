require('./payload-method.js');

const getScaleCodecDef = (type, asString = false) => {
    if (type.isPrimitive) {
        const primitive = type.asPrimitive;
        if (primitive.isBool)
            return 'bool';
        if (primitive.isChar)
            return 'char';
        if (primitive.isNull)
            return 'Null';
        if (primitive.isStr)
            return 'String';
        if (primitive.isI8)
            return 'i8';
        if (primitive.isI16)
            return 'i16';
        if (primitive.isI32)
            return 'i32';
        if (primitive.isI64)
            return 'i64';
        if (primitive.isI128)
            return 'i128';
        if (primitive.isU8 || primitive.isNonZeroU8)
            return 'u8';
        if (primitive.isU16 || primitive.isNonZeroU16)
            return 'u16';
        if (primitive.isU32 || primitive.isNonZeroU32)
            return 'u32';
        if (primitive.isU64 || primitive.isNonZeroU64)
            return 'u64';
        if (primitive.isU128 || primitive.isNonZeroU128)
            return 'u128';
        if (primitive.isU256 || primitive.isNonZeroU256)
            return 'U256';
        if (primitive.isActorId || primitive.isCodeId || primitive.isMessageId)
            return '[u8;32]';
        if (primitive.isH256)
            return 'H256';
        if (primitive.isH160)
            return 'H160';
    }
    if (type.isOptional) {
        return `Option<${getScaleCodecDef(type.asOptional.def)}>`;
    }
    if (type.isResult) {
        return `Result<${getScaleCodecDef(type.asResult.ok.def)}, ${getScaleCodecDef(type.asResult.err.def)}>`;
    }
    if (type.isVec) {
        return `Vec<${getScaleCodecDef(type.asVec.def)}>`;
    }
    if (type.isFixedSizeArray) {
        return `[${getScaleCodecDef(type.asFixedSizeArray.def)}; ${type.asFixedSizeArray.len}]`;
    }
    if (type.isMap) {
        return `BTreeMap<${getScaleCodecDef(type.asMap.key.def)}, ${getScaleCodecDef(type.asMap.value.def)}>`;
    }
    if (type.isUserDefined) {
        return type.asUserDefined.name;
    }
    if (type.isStruct) {
        if (type.asStruct.isTuple) {
            return `(${type.asStruct.fields.map(({ def }) => getScaleCodecDef(def)).join(', ')})`;
        }
        const result = {};
        for (const field of type.asStruct.fields) {
            result[field.name] = getScaleCodecDef(field.def);
        }
        return asString ? JSON.stringify(result) : result;
    }
    if (type.isEnum) {
        if (!type.asEnum.isNesting) {
            return { _enum: type.asEnum.variants.map((v) => v.name) };
        }
        const result = {};
        for (const variant of type.asEnum.variants) {
            result[variant.name] = variant.def ? getScaleCodecDef(variant.def) : 'Null';
        }
        return { _enum: result };
    }
    throw new Error('Unknown type :: ' + JSON.stringify(type));
};

exports.getScaleCodecDef = getScaleCodecDef;
