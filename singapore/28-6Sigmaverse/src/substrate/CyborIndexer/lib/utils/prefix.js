import { hexToU8a, compactFromU8aLim, u8aToString } from '@polkadot/util';

function getServiceNamePrefix(payload, withBytesLength = false) {
    const _payload = hexToU8a(payload);
    const [offset, limit] = compactFromU8aLim(_payload);
    const prefix = u8aToString(_payload.subarray(offset, limit + offset));
    return withBytesLength ? { service: prefix, bytesLength: limit + offset } : prefix;
}
function getFnNamePrefix(payload, withBytesLength = false) {
    const _payload = hexToU8a(payload);
    const [sOff, sLim] = compactFromU8aLim(_payload);
    const serviceOffset = sOff + sLim;
    const [offset, limit] = compactFromU8aLim(_payload.subarray(serviceOffset));
    const prefix = u8aToString(_payload.subarray(serviceOffset + offset, serviceOffset + offset + limit));
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

export { getCtorNamePrefix, getFnNamePrefix, getServiceNamePrefix };
