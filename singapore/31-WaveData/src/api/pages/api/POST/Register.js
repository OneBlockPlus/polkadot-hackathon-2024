
export async function GenerateAccessToken(fullname) {
	return "daf69cba6bb256a687c8c73e229f54d3";
}
export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	let useContract = await import("../../../contract/useContract.ts");
	const {api, contract, signerAddress, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();
	if (req.method !== "POST") {
		res.status(405).json({status: 405, error: "Register must have POST request"});
		return;
	}
	const {fullname, email,birth_date, password} = req.body;
	const result = await ReadContractByQuery(api,signerAddress, getQuery(contract,"CheckEmail"),[email])
    
	if (result !== "False") {
		res.status(403).json({status: 403, error: "Account already exists!"});
		return;
	}
	let accessToken =""
	
	await sendTransaction(api,contract,signerAddress, "CreateAccount",[fullname, email, password, accessToken,"",birth_date]);
	res.status(200).json({status: 200, value: "Registered!"});
}

