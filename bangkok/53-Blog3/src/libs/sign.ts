import { u8aToHex } from '@polkadot/util';
import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';

export function isValidSignature(
    signedMessage: string | Uint8Array, signature: string | Uint8Array, address: string | Uint8Array | null | undefined
) {
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);

    return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
};