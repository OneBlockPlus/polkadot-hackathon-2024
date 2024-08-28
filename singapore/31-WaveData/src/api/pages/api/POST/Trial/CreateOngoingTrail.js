import {ethers} from 'ethers'
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}


    let useContract = await import("../../../../contract/useContract.ts");
    const {api, contract, signerAddress, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();
    
    if (req.method !== 'POST') {
      res.status(405).json({ status: 405, error: "Method must have POST request" })
      return;
    }
  
    const { trialid,userid,given_permission } = req.body;
 
    await sendTransaction(api,contract,signerAddress, "CreateOngoingTrail",[Number(trialid),Number(userid),(new Date()).toISOString(),given_permission ]);
           
    res.status(200).json({ status: 200, value: "Created" })
  
  }
  