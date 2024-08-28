import React, {useState, useEffect} from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Bar} from "react-chartjs-2";
import {Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, Tooltip} from "chart.js";
import GraphChartLine from "../Card/graphChartLine";
import GraphChartBar from "../Card/graphChartBar";
import useContract from "../../services/useContract";


export default function ViewControbutiors({show,setShow, onHide, id}) {
	ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, Tooltip);
	const {  api,contract, signerAddress, sendTransaction,ReadContractValue,ReadContractByQuery,getMessage,getQuery,getTX } = useContract();

	const [contributor, setContributor] = useState({});
	const [FHIRS_COLSAll, setFHIRS_COLSAll] = useState([]);
	const [FHIRS_ANSAll, setFHIRS_ANSAll] = useState([]);

	const [LineCharts, setLineCharts] = useState([]);
	const [BarCharts, setBarCharts] = useState([]);

	async function LoadData() {
		if (typeof window?.contract !== "undefined" && api !== null) {
			let element = await ReadContractByQuery(api,signerAddress, getQuery("_ongoingMap"),[Number(id)])
			let user_element = await ReadContractByQuery(api,signerAddress, getQuery("getUserDetails"),[Number(element.userId)])			
			let fhir_element = await ReadContractByQuery(api, signerAddress, getQuery("_fhirMap"), [Number(user_element[6])]);

			let given_permission = eval("(" + element.givenPermission + ")");
			let FHIRS_COLS = [];
			let FHIRS_ANS = [];

			if (given_permission.family)
				FHIRS_COLS.push({
					id: "family_name",
					title: "Family Name"
				});
			if (given_permission.given)
				FHIRS_COLS.push({
					id: "given_name",
					title: "Given Name"
				});
			if (given_permission.gender)
				FHIRS_COLS.push({
					id: "gender",
					title: "Gender"
				});
			if (given_permission.phone)
				FHIRS_COLS.push({
					id: "phone",
					title: "Phone"
				});
			if (given_permission.about)
				FHIRS_COLS.push({
					id: "about",
					title: "About"
				});

			if (given_permission.family)
				FHIRS_ANS.push({
					id: "family_name",
					title: fhir_element.familyName
				});
			if (given_permission.given)
				FHIRS_ANS.push({
					id: "given_name",
					title: fhir_element.givenName
				});
			if (given_permission.gender)
				FHIRS_ANS.push({
					id: "gender",
					title: fhir_element.gender
				});
			if (given_permission.phone)
				FHIRS_ANS.push({
					id: "phone",
					title: fhir_element.phone
				});
			if (given_permission.about)
				FHIRS_ANS.push({
					id: "about",
					title: fhir_element.about
				});
			setContributor({
				id: id,
				user_id: Number(element.userId),
				photo: user_element[0],
				name: user_element[2],
				family_name: fhir_element.familyName,
				givenname: fhir_element.givenName,
				identifier: fhir_element.identifier,
				phone: fhir_element.phone,
				gender: fhir_element.gender,
				about: fhir_element.about,
				patient_id: fhir_element.patientId,
				joined: element.date,
				given_permission: given_permission
			});
			setFHIRS_COLSAll(FHIRS_COLS);
			setFHIRS_ANSAll(FHIRS_ANS);
			//Charts
			let chart_all_liner = [];
			let chart_all_bar = [];
			if (given_permission.blood) {
				let bloodData = await GetOneValueTypesWearableData(Number(element.userId), user_element[5], 3001);
				chart_all_liner.push({
					id: "blood",
					title: "Weekly Blood Date",
					labels: Object.keys(bloodData),
					data: Object.values(bloodData)
				});
			}
			if (given_permission.sleep) {
				let sleepData = await GetSleepWearableData(Number(element.userId), user_element[5]);
				chart_all_bar.push({
					id: "sleep",
					title: "Weekly Sleep Duration",
					labels: Object.keys(sleepData),
					data: Object.values(sleepData)
				});
			}
			if (given_permission.steps) {
				let stepsData = await GetOneValueTypesWearableData(Number(element.userId), user_element[5], 1000);
				chart_all_bar.push({
					id: "steps",
					title: "Weekly Steps",
					labels: Object.keys(stepsData),
					data: Object.values(stepsData)
				});
			}
			if (given_permission.calories) {
				let caloriesData = await GetOneValueTypesWearableData(Number(element.userId), user_element[5], 1010);
				chart_all_bar.push({
					id: "calories",
					title: "Weekly Calories Burned",
					labels: Object.keys(caloriesData),
					data: Object.values(caloriesData)
				});
			}

			setLineCharts(chart_all_liner);
			setBarCharts(chart_all_bar);
		}
	}
	function getFormattedDate(date) {
		let year = date.getFullYear();
		let month = (1 + date.getMonth()).toString().padStart(2, "0");
		let day = date.getDate().toString().padStart(2, "0");

		return month + "/" + day + "/" + year;
	}
	async function GetSleepWearableData(userid, userToken) {
		var today = new Date();
		var startDate = getFormattedDate(new Date("2023-01-11"));
		var endDate = getFormattedDate(new Date("2023-01-17"));
		let response = await (
			await fetch(
				`https://wavedata-polkadot-singapore-api.onrender.com/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${userToken}&body_startDay=${startDate}&body_endDay=${endDate}&body_valueTypes=2002,2003,2005`
			)
		).json();
		let parsed = JSON.parse(response.value);

		let allsources = {};
		let onedate = 0;
		let lastdate = "";
		for (let i = 0; i < parsed[0].dataSources[0].data.length; i++) {
			const element = parsed[0].dataSources[0].data[i];

			let startdate = element["day"];
			let sleptDuration = Number(element["value"]);

			if (lastdate === startdate) {
				onedate += sleptDuration;
			} else {
				if (lastdate !== "") {
					allsources[lastdate] = onedate;
				}

				onedate = 0;
				onedate += sleptDuration;
				lastdate = startdate;
			}
		}
		if (lastdate !== "") {
			allsources[lastdate] = onedate;
		}
		return allsources;
	}
	async function GetOneValueTypesWearableData(userid, userToken, valueTypes) {
		var today = new Date();
		var startDate = getFormattedDate(new Date("2023-01-11"));
		var endDate = getFormattedDate(new Date("2023-01-17"));
		let response = await (
			await fetch(
				`https://wavedata-polkadot-singapore-api.onrender.com/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${userToken}&body_startDay=${startDate}&body_endDay=${endDate}&body_valueTypes=${valueTypes}`
			)
		).json();
		let parsed = JSON.parse(response.value);

		let alldates = {};
		for (let i = 0; i < parsed[0].dataSources[0].data.length; i++) {
			const element = parsed[0].dataSources[0].data[i];

			let startdate = element["day"];
			let datePoint = Number(element["value"]);
			alldates[startdate] = datePoint;
		}
		return alldates;
	}

	useEffect(async () => {
		await LoadData();
	}, []);
	return (
		<Modal
			show={show}
			onHide={onHide}
			onShow={() => {
				LoadData();
			}}
			size="lg"
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header>
				<Modal.Title id="contained-modal-title-vcenter">Contributor</Modal.Title>
			</Modal.Header>
			<Modal.Body className="show-grid">
				<Form>
					<div className="flex mb-3">
						<img src={contributor.photo} style={{height: "10rem", width: "10rem"}} className="mr-3" />
						<div className="d-flex flex-column">
							<label className="form-label">{contributor.name}</label>
							<label className="form-label">{contributor.patient_id}</label>
							<label className="form-label">{contributor.identifier}</label>
						</div>
					</div>
					<div className="mb-3 grid">
						<label className="fa-2x form-label">FHIR</label>
						<hr />
						<div className="d-flex">
							<div className="d-flex flex flex-column pl-3" style={{gap: "0.5rem", minWidth: "7rem"}}>
								{FHIRS_COLSAll.map(({id, title}) => {
									return (
										<label className="form-label" key={id}>
											{title}
										</label>
									);
								})}
							</div>
							<div className="d-flex flex flex-column pl-3" style={{gap: "0.5rem", color: "#948e8e"}}>
								{FHIRS_ANSAll.map(({id, title}) => {
									return (
										<label className="form-label" style={{whiteSpace: "break-spaces"}} key={id}>
											{title}
										</label>
									);
								})}
							</div>
						</div>
					</div>

					<div className="mb-3 grid">
						<label className="fa-2x form-label">WEARABLE</label>
						<hr />
						{LineCharts.map(({id, title, labels, data}) => {
							return (
								<div key={id} className="d-flex flex-column">
									<GraphChartLine labels={labels} data={data} chartTitle={title} />
								</div>
							);
						})}
						{BarCharts.map(({id, title, labels, data}) => {
							return (
								<div key={id} className="d-flex flex-column">
									<GraphChartBar labels={labels} data={data} chartTitle={title} />
								</div>
							);
						})}
					</div>

					<div className="d-grid">
						<Button onClick={() => setShow(false)} style={{"display": "flex"}} className="w-[128px] h-12 flex justify-center items-center" variant="outline-dark">
							<span id="buttonText">Close</span>
						</Button>
					</div>
				</Form>
			</Modal.Body>
		</Modal>
	);
}

