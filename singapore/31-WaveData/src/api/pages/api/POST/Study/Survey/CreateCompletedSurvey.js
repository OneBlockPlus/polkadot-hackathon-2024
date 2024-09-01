
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}



  let useContract = await import("../../../../../contract/useContract.ts");
  const {api, contract, signerAddress,ParseBigNum, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();
    
  if (req.method !== 'POST') {
    res.status(405).json({ status: 405, error: "Method must have POST request" })
    return;
  }

  const { surveyid, userid, date, studyid } = req.body;

	let survey_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_surveyMap"), [Number(surveyid)]);
  
	let details_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getUserDetails"), [Number(surveyid)]);
  
  
  let credits = ParseBigNum(details_element[1]) + ParseBigNum(survey_element.reward)

  
  await sendTransaction(api,contract,signerAddress, "UpdateUser",[Number(userid), details_element[0], (Number(credits) * 1e18).toFixed(0)]);
  
  await sendTransaction(api,contract,signerAddress, "CreateCompletedSurveys",[Number(surveyid), Number(userid), date, Number(studyid)]);

  res.status(200).json({ status: 200, value: "Created" })

}
