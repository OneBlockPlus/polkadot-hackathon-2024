import {ethers} from "ethers";
import wearableinfo from "../../../../contract/wearableinfo.json";
export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	var myHeaders = new Headers();
	myHeaders.append("AppAuthorization", wearableinfo.AppAuthorization);
	myHeaders.append("Content-Type", wearableinfo["Content-Type"]);
	myHeaders.append("Authorization", wearableinfo.Authorization);

	var urlencoded = new URLSearchParams();
	urlencoded.append("authenticationToken", req.query.token);

	var allQueries = [];

	for (let i = 0; i < Object.keys(req.query).length; i++) {
		const element = req.query[Object.keys(req.query)[i]];
		let key = Object.keys(req.query)[i];
		let item = {};
		item[key] = element;
		allQueries.push(item);
	}
	let bodies = [];
	for (let i = 0; i < allQueries.length; i++) {
		let key = Object.keys(allQueries[i])[0];
		if (key.includes("body_")) {
			let newkey = key.replace("body_", "");
			let item = allQueries[i][key];
			urlencoded.append(newkey, item);
			bodies.push(item);
		}
	}
	var requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: urlencoded,
		redirect: "follow"
	};

	let output = await (await fetch(req.query.url, requestOptions)).text();
	
	res.status(200).json({value: output});
}
