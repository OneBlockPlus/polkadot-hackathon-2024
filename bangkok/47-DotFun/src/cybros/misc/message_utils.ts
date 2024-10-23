import type {HexString} from 'https://deno.land/x/polkadot/util/types.ts';
import {
    assertReturn, u8aConcat, u8aToU8a,
} from "https://deno.land/x/polkadot/util/mod.ts";
import {randomAsU8a} from "https://deno.land/x/polkadot/util-crypto/mod.ts";

import {naclBox, naclBoxOpen} from "./tweetnacl.ts";
import * as ed2curve from './ed2curve.mjs';

function convertSecretKeyToCurve25519(secretKey: Uint8Array): Uint8Array {
    return ed2curve.convertSecretKey(secretKey);
}

function convertPublicKeyToCurve25519(publicKey: Uint8Array): Uint8Array {
    return assertReturn(ed2curve.convertPublicKey(publicKey), 'Unable to convert publicKey to ed25519');
}

export function encryptMessage(
    message: HexString | string | Uint8Array,
    secretKey: HexString | string | Uint8Array,
    recipientPublicKey: HexString | string | Uint8Array,
    nonce: Uint8Array = randomAsU8a(24)
): Uint8Array {
    const sealed = naclBox(
        u8aToU8a(message),
        nonce,
        convertPublicKeyToCurve25519(u8aToU8a(recipientPublicKey)),
        convertSecretKeyToCurve25519(u8aToU8a(secretKey)),
    );

    return u8aConcat(nonce, sealed);
}

export function decryptMessage(
    encryptedMessageWithNonce: HexString | string | Uint8Array,
    secretKey: HexString | string | Uint8Array,
    senderPublicKey: HexString | string | Uint8Array
): Uint8Array | null {
    const messageU8a = u8aToU8a(encryptedMessageWithNonce);
    return naclBoxOpen(
        messageU8a.slice(24, messageU8a.length),
        messageU8a.slice(0, 24),
        convertPublicKeyToCurve25519(u8aToU8a(senderPublicKey)),
        convertSecretKeyToCurve25519(u8aToU8a(secretKey))
    );
}
