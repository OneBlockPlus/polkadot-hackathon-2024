var util = require('@polkadot/util');

const FixedSizedHash = (value, size) => {
    if (typeof value === 'string') {
        if (!util.isHex(value)) {
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

exports.ActorId = ActorId;
exports.CodeId = CodeId;
exports.H160 = H160;
exports.H256 = H256;
exports.MessageId = MessageId;
