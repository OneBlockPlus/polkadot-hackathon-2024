import { cryptoWaitReady, mnemonicGenerate } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/api";

// Generate a new wallet with user specified mnemonic length. Default is 12.
export async function generateNewWallet(len: 12 | 15 | 18 | 21 | 24 = 12) {
    await cryptoWaitReady();

    const mnemonic = mnemonicGenerate(len);

    const keyring = new Keyring({type: "sr25519"});

    const pair = keyring.addFromMnemonic(mnemonic);

    return { mnemonic, address: pair.address, publicKey: pair.publicKey.toString };
}

// Split mnemonic into 2 parts, the first part is the first 3 words, the second part is the rest words.
export function splitMnemonic(mnemonic: string) {
    const splited = mnemonic.split(" ");
    return {
        first: splited.slice(0, 3).join("_"),
        second: splited.slice(3).join("_")
    };
}