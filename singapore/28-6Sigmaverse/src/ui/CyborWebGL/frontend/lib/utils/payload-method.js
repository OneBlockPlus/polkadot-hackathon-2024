var PayloadMethod;
(function (PayloadMethod) {
    PayloadMethod["toNumber"] = "toNumber";
    PayloadMethod["toBigInt"] = "toBigInt";
    PayloadMethod["toString"] = "toString";
    PayloadMethod["toHex"] = "toHex";
    PayloadMethod["toJSON"] = "toJSON";
})(PayloadMethod || (PayloadMethod = {}));
function getPayloadMethod(type) {
    switch (type) {
        case 'u8':
        case 'u16':
        case 'i8':
        case 'i16':
        case 'u32':
        case 'i32':
            return PayloadMethod.toNumber;
        case 'u64':
        case 'u128':
        case 'i64':
        case 'i128':
        case 'U256':
            return PayloadMethod.toBigInt;
        case 'String':
            return PayloadMethod.toString;
        case 'H256':
            return PayloadMethod.toHex;
        default:
            return PayloadMethod.toJSON;
    }
}

export { PayloadMethod, getPayloadMethod };
