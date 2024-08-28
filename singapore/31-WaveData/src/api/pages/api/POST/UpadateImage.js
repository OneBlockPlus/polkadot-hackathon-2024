import {ethers} from 'ethers'
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}


    let useContract = await import("../../../contract/useContract.ts");
    const {api, contract, signerAddress, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();
  
    if (req.method !== 'POST') {
      res.status(405).json({ status: 405, error: "Method must have POST request" })
      return;
    }
  
    const { userid, image } = req.body;
    let details_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getUserDetails"), [Number(userid)]);
  
    console.log(details_element);
	
    await sendTransaction(api,contract,signerAddress, "UpdateUser",[Number(userid), image, Number(details_element[1])]);
    res.status(200).json({ status: 200, value: "Updated!" })
  
  }
  