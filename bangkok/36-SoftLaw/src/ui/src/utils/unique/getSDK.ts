import { Sdk } from "@unique-nft/sdk/full";

export const getUniqueSDK = async (_account: any) => {
  const sdk = new Sdk({
    baseUrl: "https://rest.unique.network/opal/v1",
    signer: _account,
  });
  return sdk;
};
