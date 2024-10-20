import {
  cryptoWaitReady, ed25519PairFromSeed, randomAsU8a
} from "https://deno.land/x/polkadot/util-crypto/mod.ts";
import {u8aToHex, u8aToString} from "https://deno.land/x/polkadot/util/mod.ts";

import {encryptMessage, decryptMessage} from "./message_utils.ts"

await cryptoWaitReady().catch((e) => {
  console.error(e.message);
  Deno.exit(1);
});

const message = "hello";
console.log(`Raw message: ${message}`);

const senderSeed = randomAsU8a();
console.log(`Hexed sender seed: ${u8aToHex(senderSeed)}`);
const senderKeyPair = ed25519PairFromSeed(senderSeed);
console.log(`Hexed sender secret key: ${u8aToHex(senderKeyPair.secretKey)}`);
console.log(`Hexed sender public key: ${u8aToHex(senderKeyPair.publicKey)}`);

const recipientSeed = randomAsU8a();
console.log(`Hexed recipient seed: ${u8aToHex(recipientSeed)}`);
const recipientKeyPair = ed25519PairFromSeed(recipientSeed);
console.log(`Hexed recipient secret key: ${u8aToHex(recipientKeyPair.secretKey)}`);
console.log(`Hexed recipient public key: ${u8aToHex(recipientKeyPair.publicKey)}`);

const encryptedMessage = encryptMessage(message, senderKeyPair.secretKey, recipientKeyPair.publicKey);
console.log(`Hexed encrypted message: ${u8aToHex(encryptedMessage)}`);

const decryptedMessage = decryptMessage(encryptedMessage, recipientKeyPair.secretKey, senderKeyPair.publicKey);
console.log(`Decrypted message: ${u8aToString(decryptedMessage)}`);
