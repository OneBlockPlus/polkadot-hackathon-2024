var util = require('@polkadot/util');

function getServiceNamePrefix(payload, withBytesLength = false) {
    const _payload = util.hexToU8a(payload);
    const [offset, limit] = util.compactFromU8aLim(_payload);
    const prefix = util.u8aToString(_payload.subarray(offset, limit + offset));
    return withBytesLength ? { service: prefix, bytesLength: limit + offset } : prefix;
}
function getFnNamePrefix(payload, withBytesLength = false) {
    const _payload = util.hexToU8a(payload);
    const [sOff, sLim] = util.compactFromU8aLim(_payload);
    const serviceOffset = sOff + sLim;
    const [offset, limit] = util.compactFromU8aLim(_payload.subarray(serviceOffset));
    const prefix = util.u8aToString(_payload.subarray(serviceOffset + offset, serviceOffset + offset + limit));
    return withBytesLength ? { fn: prefix, bytesLength: offset + limit } : prefix;
}
function getCtorNamePrefix(payload, withBytesLength = false) {
    if (withBytesLength) {
        const { service, bytesLength } = getServiceNamePrefix(payload, true);
        return { ctor: service, bytesLength };
    }
    else {
        return getServiceNamePrefix(payload);
    }
}

exports.getCtorNamePrefix = getCtorNamePrefix;
exports.getFnNamePrefix = getFnNamePrefix;
exports.getServiceNamePrefix = getServiceNamePrefix;
