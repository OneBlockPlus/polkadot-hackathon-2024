import { isHex } from '@polkadot/util';

const FixedSizedHash = (value, size) => {
    if (typeof value === 'string') {
        if (!isHex(value)) {
            throw new Error('Value is not a hex string');
        }
        if (value.length !== size * 2 + 2) {
            throw new Error('Value has incorrect length');
        }
    }
    else if (value.length !== size) {
        throw new Error('Value has incorrect length');
    }
    return value;
};
const H160 = (value) => FixedSizedHash(value, 20);
const H256 = (value) => FixedSizedHash(value, 32);
const ActorId = (value) => FixedSizedHash(value, 32);
const CodeId = (value) => FixedSizedHash(value, 32);
const MessageId = (value) => FixedSizedHash(value, 32);

export { ActorId, CodeId, H160, H256, MessageId };
