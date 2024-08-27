exports.PayloadMethod = void 0;
(function (PayloadMethod) {
    PayloadMethod["toNumber"] = "toNumber";
    PayloadMethod["toBigInt"] = "toBigInt";
    PayloadMethod["toString"] = "toString";
    PayloadMethod["toHex"] = "toHex";
    PayloadMethod["toJSON"] = "toJSON";
})(exports.PayloadMethod || (exports.PayloadMethod = {}));
function getPayloadMethod(type) {
    switch (type) {
        case 'u8':
        case 'u16':
        case 'i8':
        case 'i16':
        case 'u32':
        case 'i32':
            return exports.PayloadMethod.toNumber;
        case 'u64':
        case 'u128':
        case 'i64':
        case 'i128':
        case 'U256':
            return exports.PayloadMethod.toBigInt;
        case 'String':
            return exports.PayloadMethod.toString;
        case 'H256':
            return exports.PayloadMethod.toHex;
        default:
            return exports.PayloadMethod.toJSON;
    }
}

exports.getPayloadMethod = getPayloadMethod;
