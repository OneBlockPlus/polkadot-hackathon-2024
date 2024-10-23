import { getApi } from "@/state/api";
import { prepareCall } from "./prepareCall";
import { getAccount } from "./getAccounts";

export const signTransaction = async (tx: any) => {
  console.log("salkd1asljd");
  let api;
  try {
    api = await getApi();
  } catch (e) {
    console.log("salkd2asljd");
    console.log(e);
  }
  console.log(api);
  if (!api) {
    throw new Error("API not found");
  }
  console.log("salk2dasljd");
  const account = await getAccount(tx.address);
  if (!account) {
    throw new Error("Account not found");
  }
  console.log("salkda3sljd");
  const { uxt, address, zkMaterial } = await prepareCall(
    api,
    account,
    tx.method
  );

  const zkLoginCall = api.tx.zkLogin.submitZkloginUnsigned(
    uxt,
    address,
    zkMaterial
  );

  return zkLoginCall.toHex();
};
