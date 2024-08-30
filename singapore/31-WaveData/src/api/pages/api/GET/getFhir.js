export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	let useContract = await import("../../../contract/useContract.ts");
	const {api, contract, signerAddress, sendTransaction, ReadContractByQuery, getMessage, getQuery} = await useContract.default();
	
	let userdetails = await ReadContractByQuery(api, signerAddress, getQuery(contract,"getUserDetails"), [Number(req.query.userid)]);
	let fhir_element = await ReadContractByQuery(api, signerAddress, getQuery(contract,"_fhirMap"), [Number(userdetails[6])]);
	
	var bDate = new Date(fhir_element.birthDate);
	var nDate =new Date()
	let currentAge = nDate.getFullYear()- bDate.getFullYear();

	var newFhir = {
		id: Number(fhir_element.userId),
		family_name: fhir_element.familyName,
		given_name: fhir_element.givenName,
		identifier: fhir_element.identifier,
		phone: fhir_element.phone,
		gender: fhir_element.gender,
		birth_date: fhir_element.birthDate,
		age:currentAge,
		about: fhir_element.about,
		patient_id: fhir_element.patientId,
		walletaddress: userdetails[4] ,
		image: fhir_element.image,
		credits: fhir_element.credits
	};
	if (newFhir.patient_id === "") {
		newFhir = null;
	}

	res.status(200).json({value: newFhir});
}

