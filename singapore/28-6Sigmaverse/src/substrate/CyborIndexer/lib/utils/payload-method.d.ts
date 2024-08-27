export declare enum PayloadMethod {
    toNumber = "toNumber",
    toBigInt = "toBigInt",
    toString = "toString",
    toHex = "toHex",
    toJSON = "toJSON"
}
export declare function getPayloadMethod(type: string): PayloadMethod;
