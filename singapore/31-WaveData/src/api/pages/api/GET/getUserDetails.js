

export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}



  let useContract = await import("../../../contract/useContract.ts");
	const {api, contract, signerAddress, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();
	let details_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getUserDetails"), [Number(req.query.userid)]);
  var newUser = {
    id: Number(req.query.userid),
    image: details_element[0],
    credits: Number(details_element[1]),
    accessToken:details_element[5]
  };

  res.status(200).json({ value: newUser })
}
