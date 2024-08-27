import * as blake from 'blakejs'

export function bytesToBlakeTwo256Hash(bytes: Uint8Array): string {
  const hashBytes = blake.blake2b(bytes, undefined, 32);

  const hashHex = Array.from(hashBytes).map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');

  return hashHex;
}

export function stringToBlakeTwo256Hash(inputString: string): string {
  // Convert string to Uint8Array
  const inputBytes = new TextEncoder().encode(inputString);

  return bytesToBlakeTwo256Hash(inputBytes);
}