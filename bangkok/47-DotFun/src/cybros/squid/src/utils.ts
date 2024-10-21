import * as ss58 from "@subsquid/ss58"

export {u8aToString, hexToString, hexToU8a, stringToHex, u8aToHex} from "@polkadot/util"

export const ss58Prefix = 42;

export function decodeSS58Address(bytes: Uint8Array) {
  return ss58.codec(ss58Prefix).encode(bytes)
}

export function* splitIntoBatches<T>(
  list: T[],
  maxBatchSize: number
): Generator<T[]> {
  if (list.length <= maxBatchSize) {
    yield list;
  } else {
    let offset = 0;
    while (list.length - offset > maxBatchSize) {
      yield list.slice(offset, offset + maxBatchSize);
      offset += maxBatchSize;
    }
    yield list.slice(offset);
  }
}
