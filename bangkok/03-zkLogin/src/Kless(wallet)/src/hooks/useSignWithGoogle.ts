import { zkLoginAuthenticate } from "@/utils/login";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { generateNonce, generateRandomness } from "@mysten/zklogin";
import { useMutation } from "@tanstack/react-query";
import { decodeJwt } from "jose";

import { hexToU8a, stringToU8a, u8aToBn } from "@polkadot/util";
import { randomAsHex } from "@polkadot/util-crypto";

export const useSignInWithGoogle = () => {
  const mutation = useMutation({
    mutationKey: ["signInWithGoogle"],
    mutationFn: async ({
      sub,
      epoch = 999999,
      prompt,
    }: {
      sub?: string;
      epoch?: number;
      prompt?: boolean;
    } = {}) => {
      const privateKey = randomAsHex(32);
      const ephkeypair = Ed25519Keypair.fromSecretKey(hexToU8a(privateKey));
      const randomness = generateRandomness().substring(0, 32);

      const nonce = generateNonce(
        ephkeypair.getPublicKey() as any,
        Number(epoch),
        randomness
      );

      console.log("signing in with google...");
      const jwt = await zkLoginAuthenticate({
        prompt,
        nonce,
        sub,
      });
      const decodedJWT = decodeJwt(jwt);

      const salt = u8aToBn(stringToU8a(`1/${decodedJWT.email}`)).toString();
      const keyStr = Ed25519Keypair.fromSecretKey(hexToU8a(privateKey))
        .getPublicKey()
        .toBase64();

      return {
        type: "zkLogin" as const,
        salt,
        lastUnlockedOn: null,
        selected: true,
        createdAt: Date.now(),
        jwt,
        decodedJWT: decodedJWT,
        email: decodedJWT.email,
        nickName: decodedJWT.email,
        keyStr: keyStr,
        ephPrivateKey: privateKey,
        epoch: epoch.toString(),
        nonce,
        randomness,
        sub: decodedJWT.sub,
      };
    },
  });

  return mutation;
};
