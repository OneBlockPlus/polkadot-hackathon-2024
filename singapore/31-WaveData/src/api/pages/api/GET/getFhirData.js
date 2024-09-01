export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	const headers = {
		"accept": "application/fhir+json",
		"x-api-key": "FLD8rH3oH574iF4tmRdLo4hUBWEzooD23yr3RxTd"
	};
  
    let patient_details =	await (await fetch(`https://fhir.kecqr0ds8j10.workload-prod-fhiraas.isccloud.io/Patient/${req.query.patient_id}`, {headers})).json();

	res.status(200).json(patient_details);
}

