// Generate test input for demo job executor

import {parse} from "https://deno.land/std/flags/mod.ts";
import {
  cryptoWaitReady, ed25519PairFromSeed, randomAsU8a
} from "https://deno.land/x/polkadot/util-crypto/mod.ts";
import {u8aToHex, hexToU8a, stringToHex} from "https://deno.land/x/polkadot/util/mod.ts";
import {encryptMessage} from "./message_utils.ts";

const parsedArgs = parse(Deno.args, {
  alias: {
    senderSeed: "s",
    recipientPublicKey: "pk"
  },
  boolean: [
    "e2e",
  ],
  string: [
    "senderSeed",
    "receiverPublicKey",
    "data",
  ],
  default: {
    senderSeed: "0x2de0738993e4675d5ea79b07cf03791e39890b11bf69d8d79ca90f244fbb862d",
    receiverPublicKey: "0x8e4e79005931e3a0e304d6f50ca233a4c5f5acda73f9507506a96307143424b5",
    data: "Hello",
  },
});

// pool should add metadata like this
// {"e2ePublicKey":"0x8e4e79005931e3a0e304d6f50ca233a4c5f5acda73f9507506a96307143424b5"}

await cryptoWaitReady().catch((e) => {
  console.error(e.message);
  Deno.exit(1);
});

const senderKeyPair = (() => {
  const seedFromArg = parsedArgs.senderSeed.toString().trim();
  if (seedFromArg !== undefined && seedFromArg.length > 0) {
    return ed25519PairFromSeed(hexToU8a(seedFromArg));
  }

  const seed = randomAsU8a();
  console.log(`Hexed sender seed: ${u8aToHex(seed)}`);

  return ed25519PairFromSeed(seed);
})();

const data = parsedArgs.data
if (parsedArgs.e2e) {
  console.log("E2E enabled");

  const encryptedData = u8aToHex(
    encryptMessage(data, senderKeyPair.secretKey, parsedArgs.receiverPublicKey)
  );
  const rawInput = {
    e2e: true,
    senderPublicKey: u8aToHex(senderKeyPair.publicKey),
    encryptedData,
  };
  const input = stringToHex(JSON.stringify(rawInput));

  console.log(`Raw input: ${JSON.stringify(rawInput, null, 2)}`);
  console.log(`Hexed input: ${input}`);
} else {
  const rawInput = {
    e2e: false,
    data,
  };
  const input = stringToHex(JSON.stringify(rawInput));

  console.log(`Raw input: ${JSON.stringify(rawInput, null, 2)}`);
  console.log(`Hexed input: ${input}`);
}
