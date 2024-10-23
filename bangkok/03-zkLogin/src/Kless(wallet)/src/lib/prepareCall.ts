import { SerializedAccount } from "@/background/db";
import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { createPair } from "@polkadot/keyring";
import {
  ZkloginSupportJwkJwkId,
  ZkloginSupportJwkJwkProvider,
  ZkloginSupportZkInputZkLoginInputs,
  ZkloginSupportZkMaterial,
} from "@polkadot/types/lookup";
import { ISubmittableResult } from "@polkadot/types/types";
import { hexToU8a } from "@polkadot/util";
import {
  ed25519PairFromSeed as ed25519FromSeed,
  ethereumEncode,
} from "@polkadot/util-crypto";

export const prepareCall = async (
  api: ApiPromise,
  account: SerializedAccount,
  call: SubmittableExtrinsic<"promise", ISubmittableResult> | "string"
) => {
  if (typeof call === "string") {
    const _call = api.createType("Call", call);
    call = api.tx[_call.section][_call.method](..._call.args);
  }

  const jwkProvider = api.createType<ZkloginSupportJwkJwkProvider>(
    "ZkloginSupportJwkJwkProvider",
    "Google"
  );

  const googleJwkId = api.createType<ZkloginSupportJwkJwkId>(
    "ZkloginSupportJwkJwkId",
    {
      provider: jwkProvider,
      kid: JSON.parse(atob(account.jwt.split(".")[0])).kid,
    }
  );
  const inputs = api.createType<ZkloginSupportZkInputZkLoginInputs>(
    "ZkloginSupportZkInputZkLoginInputs",
    account.proof
  );

  const signingKeypair = createPair(
    { toSS58: (address) => ethereumEncode(address), type: "ed25519" },
    ed25519FromSeed(hexToU8a(account.ephPrivateKey))
  );

  const zkMaterial = api.createType<ZkloginSupportZkMaterial>(
    "ZkloginSupportZkMaterial",
    {
      source: googleJwkId,
      inputs: inputs,
      ephkeyExpireAt: account.epoch,
      ephPubkey: signingKeypair.publicKey,
    }
  );

  const { nonce }: any = await api.query.system.account(account.address);
  const uxt = call.sign(signingKeypair, {
    blockHash: api.genesisHash,
    genesisHash: api.genesisHash,
    nonce: nonce,
    runtimeVersion: api.runtimeVersion,
  });

  return {
    uxt: uxt.toU8a(),
    zkMaterial,
    address: account.address,
  };
};
