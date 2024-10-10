"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeightV2 = exports.convertWeight = exports.encodeSalt = exports.createBluePrintWithId = exports.createBluePrintTx = exports.withMeta = exports.EMPTY_SALT = void 0;
const types_1 = require("@polkadot/types");
const util_1 = require("@polkadot/util");
const util_crypto_1 = require("@polkadot/util-crypto");
exports.EMPTY_SALT = new Uint8Array();
function withMeta(meta, creator) {
    creator.meta = meta;
    return creator;
}
exports.withMeta = withMeta;
function createBluePrintTx(meta, fn) {
    return withMeta(meta, (options, ...params) => fn(options, params));
}
exports.createBluePrintTx = createBluePrintTx;
function createBluePrintWithId(fn) {
    return (constructorOrId, options, ...params) => fn(constructorOrId, options, params);
}
exports.createBluePrintWithId = createBluePrintWithId;
function encodeSalt(salt = (0, util_crypto_1.randomAsU8a)()) {
    return salt instanceof types_1.Bytes
        ? salt
        : salt?.length
            ? (0, util_1.compactAddLength)((0, util_1.u8aToU8a)(salt))
            : exports.EMPTY_SALT;
}
exports.encodeSalt = encodeSalt;
function convertWeight(weight) {
    const [refTime, proofSize] = isWeightV2(weight)
        ? [weight.refTime.toBn(), weight.proofSize.toBn()]
        : [(0, util_1.bnToBn)(weight), undefined];
    return {
        v1Weight: refTime,
        v2Weight: { proofSize, refTime }
    };
}
exports.convertWeight = convertWeight;
function isWeightV2(weight) {
    return !!weight.proofSize;
}
exports.isWeightV2 = isWeightV2;
