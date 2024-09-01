
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}



  let useContract = await import("../../../../../contract/useContract.ts");
  const {api, contract, signerAddress, sendTransaction, ReadContractByQuery,ParseBigNum, getMessage, getQuery} = await useContract.default();
    
  if (req.method !== 'POST') {
    res.status(405).json({ status: 405, error: "Method must have POST request" })
    return;
  }

  const { userid,amount,walletAddress } = req.body;

  await sendTransaction(api,contract,signerAddress, "transfer",[ (Number(amount) * 1e18).toFixed(0),walletAddress]);
  
  let details_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getUserDetails"), [Number(userid)]);
  
  await sendTransaction(api,contract,signerAddress, "UpdateUser",[Number(userid), image, ((ParseBigNum(details_element[1]) - amount) * 1e18).toFixed(0)]);
  
  res.status(200).json({ status: 200, value: "Updated" })

}
