var util = require('@polkadot/util');

const ZERO_ADDRESS = util.u8aToHex(new Uint8Array(32));

exports.ZERO_ADDRESS = ZERO_ADDRESS;
