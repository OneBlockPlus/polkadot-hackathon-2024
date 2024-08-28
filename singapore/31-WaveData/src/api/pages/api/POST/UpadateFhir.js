import {ethers} from "ethers";
export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	let useContract = await import("../../../contract/useContract.ts");
	const {api, contract, signerAddress, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();

	if (req.method !== "POST") {
		res.status(405).json({status: 405, error: "Method must have POST request"});
		return;
	}
  const headers = {
		"accept": "application/fhir+json",
		"x-api-key": "Qi8TXQVe1C2zxiYOdKKm7RQk6qz0h7n19zu1RMg5"
	};

	const {userid, givenname, identifier, patientid} = req.body;
	let patient_details = await (await fetch(`https://fhir.8zhm32ja7p0e.workload-prod-fhiraas.isccloud.io/Patient/${Number(patientid)}`, {headers})).json();
	let diagnostic_details = await (await fetch(`https://fhir.8zhm32ja7p0e.workload-prod-fhiraas.isccloud.io/DiagnosticReport?patient=${Number(patientid)}`, {headers})).json();
	let allDiagnostic = await diagnostic_details.entry;

	
	let DiseasesDiagnostic = allDiagnostic[allDiagnostic.length - 1]["resource"]["presentedForm"][0]["data"];
	
	let decodedDisease = useContract.base64DecodeUnicode(DiseasesDiagnostic);
	await sendTransaction(api,contract,signerAddress, "UpdateFhir",[Number(userid), patient_details["name"][0]['family'], givenname, identifier, patient_details["telecom"][0]["value"].toString(), patient_details["gender"], decodedDisease, patientid]);

	res.status(200).json({status: 200, value: "Updated!"});
}
