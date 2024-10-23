import { parse } from "https://deno.land/std/flags/mod.ts";
import { u8aToHex, stringToHex } from "https://deno.land/x/polkadot/util/mod.ts";
import { Keyring } from "https://deno.land/x/polkadot/keyring/mod.ts";
import { cryptoWaitReady } from "https://deno.land/x/polkadot/util-crypto/mod.ts";
import { KeypairType } from "https://deno.land/x/polkadot/util-crypto/types.ts";
import { ApiPromise, createSubstrateApi } from "./deno_lib/substrate.ts";

async function insertKey(
  api: ApiPromise,
  sUri: string, keyType: string, keyringType: KeypairType,
  dryRun: boolean
) {
    const keyring = new Keyring({ type: keyringType }).addFromUri(sUri);
    const publicKey = u8aToHex(keyring.publicKey);

    if (dryRun) {
        return;
    }

    await api.rpc.author.insertKey(keyType, sUri, publicKey);
    const inserted = (await api.rpc.author.hasKey(publicKey, keyType)).toJSON() as boolean;

    if (inserted) {
        console.log(`Set "${keyType}" successful, public key "${publicKey}"`)
    } else {
        console.log(`Set "${keyType}" failed, public key "${publicKey}"`)
    }

    // // This is for Babe
    // const encodedKeyType = stringToHex(keyType.split('').reverse().join(''));
    // const owner = await api.query.session.keyOwner([encodedKeyType, publicKey]);
    // if (!owner.isSome) {
    //     console.warn(`Session key not found on-chain: ${keyType}-${publicKey}`);
    // }

    return inserted;
}

const parsedArgs = parse(Deno.args, {
    alias: {
        "configPath": "c",
        "dryRun": "dry-run",
    },
    boolean: [
        "dryRun",
    ],
    string: [
        "configPath",
    ],
    default: {
        dryRun: false,
    },
});

const dryRun = parsedArgs.dryRun;
const config = (() => {
    const configPath = parsedArgs.configPath;
    if (configPath === undefined) {
        console.error("`-c CONFIG_FILE_PATH` is required");
        Deno.exit(1)
    }

    try {
        const config = Deno.readTextFileSync(configPath);
        return JSON.parse(config);
    } catch (e) {
        console.error("Load config error");
        console.error(e.message);
        Deno.exit(1)
    }
})();

await cryptoWaitReady().catch((e) => {
    console.error("Crypto module initialize failed.");
    console.error(e.message);
    Deno.exit(1);
});

if (dryRun) {
    console.log("Dry run mode enabled, will not actually insert keys.");
}

for (const {rpcUrl, keys} of config) {
    const api = createSubstrateApi(rpcUrl);
    if (api === null) {
        console.error(`Couldn't connect to "${rpcUrl}", skipped.`);
        continue;
    }

    await api.isReady.catch((e) => console.error(e));
    if (api.isConnected) {
        console.log(`Connected to "${rpcUrl}"`);
    } else {
        console.error(`Couldn't connect to "${rpcUrl}", skipped.`);
        continue;
    }

    for (const {sUri, keyType, keyringType} of keys) {
        await insertKey(api, sUri, keyType, keyringType, dryRun);
    }
}

Deno.exit(0)
