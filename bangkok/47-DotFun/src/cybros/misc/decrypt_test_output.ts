// Generate test input for demo job executor

import {parse} from "https://deno.land/std/flags/mod.ts";
import {cryptoWaitReady, ed25519PairFromSeed, randomAsU8a} from "https://deno.land/x/polkadot/util-crypto/mod.ts";
import {hexToU8a, u8aToHex, u8aToString} from "https://deno.land/x/polkadot/util/mod.ts";
import {decryptMessage } from "./message_utils.ts";

const parsedArgs = parse(Deno.args, {
  alias: {
    recipientSeed: "s",
    senderPublicKey: "pk",
    input: "i",
  },
  string: [
    "recipientSeed",
    "senderPublicKey",
    "input",
  ],
  default: {
    recipientSeed: "0xb9dcde336271d0aa8a8957c40d987b23dac1bb107e65c24913f962a8e2e51cbe",
    senderPublicKey: "0x41f30e043bca2a11d0823f75812d4730f93ac63ce7dca6d76d22aedd5cd45a71",
    input: "0x6fcdf8a936ffcff8a1430c86d25c11f3773a4235e2292cbcb79d5e936fb41a24bfa8864fae3edc44a14fd2e605aa5df082"
  },
});

await cryptoWaitReady().catch((e) => {
  console.error(e.message);
  Deno.exit(1);
});

const recipientKeyPair = (() => {
  const seedFromArg = parsedArgs.recipientSeed.toString().trim();
  if (seedFromArg !== undefined && seedFromArg.length > 0) {
    return ed25519PairFromSeed(hexToU8a(seedFromArg));
  }

  const seed = randomAsU8a();
  console.log(`Hexed recipient seed: ${u8aToHex(seed)}`);

  return ed25519PairFromSeed(seed);
})();

console.log(`Hexed recipient secret key: ${u8aToHex(recipientKeyPair.secretKey)}`);
console.log(`Hexed recipient public key: ${u8aToHex(recipientKeyPair.publicKey)}`);

const decryptedInput = decryptMessage(parsedArgs.input, recipientKeyPair.secretKey, parsedArgs.senderPublicKey);
console.log(`Decrypted input: ${u8aToString(decryptedInput)}`)
