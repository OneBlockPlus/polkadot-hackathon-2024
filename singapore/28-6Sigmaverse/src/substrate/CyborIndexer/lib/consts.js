import { u8aToHex } from '@polkadot/util';

const ZERO_ADDRESS = u8aToHex(new Uint8Array(32));

export { ZERO_ADDRESS };
