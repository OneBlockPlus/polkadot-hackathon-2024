export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	const headers = {
		"accept": "application/fhir+json",
		"x-api-key": "Qi8TXQVe1C2zxiYOdKKm7RQk6qz0h7n19zu1RMg5"
	};
  
    let patient_details =	await (await fetch(`https://fhir.8zhm32ja7p0e.workload-prod-fhiraas.isccloud.io/Patient/${req.query.patient_id}`, {headers})).json();

	res.status(200).json(patient_details);
}

