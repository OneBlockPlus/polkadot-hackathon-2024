import React, {useState, useEffect} from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {CurrencyDollarIcon} from "@heroicons/react/solid";
import useContract from "../../services/useContract";

import Cookies from "js-cookie";
import "./CreateStudy.css";

export default function CreateStudyModal({show, onHide}) {
	const { api, contract, signerAddress, sendTransaction, ReadContractValue, ReadContractByQuery, getMessage, getQuery, getTX } = useContract();
	function DOMRegex(regex) {
		let output = [];
		for (let i of document.querySelectorAll("*")) {
			for (let j of i.attributes) {
				if (regex.test(j.value)) {
					let key_value = j.value;
					output.push(`${key_value} = ${i.checked}`);
				}
			}
		}
		return output.join(";");
	}
	async function CreateStudyHandle(e) {
		e.preventDefault();
		const {title, description, image, createBTN, budget} = e.target;

		let fhir = [];
		let wearable = [];
		eval(DOMRegex(/fhir/));
		eval(DOMRegex(/wearable/));

		let permissionData ={
			...fhir,
			...wearable
		}
		var notificationSuccess = e.target.children[0].firstChild;
		var notificationError = e.target.children[0].lastChild;
		createBTN.children[0].classList.remove("hidden");
		createBTN.children[1].innerText = "";
		createBTN.disabled = true;
		try {
			await sendTransaction(api, signerAddress, "CreateStudy", [Number(Cookies.get("userid")), image.value, title.value, description.value, JSON.stringify(permissionData), 0, 0, ( parseInt(budget.value) * 1e18).toFixed(0)])
			notificationSuccess.style.display = "block";
			createBTN.children[0].classList.add("hidden");
			createBTN.children[1].innerText = "Create Study";
			title.value = "";
			description.value = "";
			image.value = "";
			budget.value = 0;
			createBTN.disabled = false;
			// window.location.reload();
		} catch (error) {
			console.error(error);
		}
		createBTN.children[0].classList.add("hidden");
		createBTN.children[1].innerText = "Create Study";
		createBTN.disabled = false;
	}

	return (
		<Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
			<Modal.Header>
				<Modal.Title id="contained-modal-title-vcenter">Create Study</Modal.Title>
			</Modal.Header>
			<Modal.Body className="show-grid">
				<Form onSubmit={CreateStudyHandle}>
					<Form.Group className="mb-3 grid" controlId="formGroupName">
						<div id="notificationSuccess" name="notificationSuccess" style={{display: "none"}} className="mt-4 text-center bg-gray-200 relative text-gray-500 py-3 px-3 rounded-lg">
							Success!
						</div>
						<div id="notificationError" name="notificationError" style={{display: "none"}} className="mt-4 text-center bg-red-200 relative text-red-600 py-3 px-3 rounded-lg">
							Error! Please try again!
						</div>
					</Form.Group>

					<Form.Group className="mb-3 grid" controlId="formGroupName">
						<Form.Label>Title</Form.Label>
						<input required name="title" placeholder="Title" id="title" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
					</Form.Group>
					<Form.Group className="mb-3 grid" controlId="formGroupName">
						<Form.Label>Description</Form.Label>
						<textarea required name="description" placeholder="Description" id="description" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
					</Form.Group>
					<Form.Group className="mb-3 grid" controlId="formGroupName">
						<Form.Label>Image</Form.Label>
						<input required name="image" placeholder="Image link" id="image" className="border rounded pt-2 pb-2 border-gray-400 pl-4 pr-4" />
					</Form.Group>
					<Form.Group className="mb-3 grid" controlId="formGroupName">
						<Form.Label>Budget</Form.Label>
						<div className="input-group">
							<span className="input-group-addon text-sm pt-2 pb-2 pl-3 pr-3 font-normal -mr-1 leading-none text-gray-700 text-center bg-gray-200 border-gray-400 border rounded">
								<CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
							</span>
							<input required name="budget" placeholder="Budget" id="budget" type="number" className="w-24 text-black pr-2 border-gray-400 border pl-2" />
						</div>
					</Form.Group>
					<Form.Group className="mb-3 grid" controlId="formGroupName">
						<Form.Label>Request data from patient</Form.Label>
						<div hidden={true} style={{border: "1px solid #dee2e6", padding: "0.5rem"}}>
							<span>Fhir Data</span>
							<div className="d-flex flex-wrap mb-2" style={{gap: "1rem"}}>
								<div className="form-check">
									<input className="form-check-input" name="fhir['family']" type="checkbox" />
									<label className="form-check-label">Family Name</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="fhir['given']" type="checkbox" />
									<label className="form-check-label">Given Name</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="fhir['gender']" type="checkbox" />
									<label className="form-check-label">Sex</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="fhir['phone']" type="checkbox" />
									<label className="form-check-label">Phone</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="fhir['about']" type="checkbox" />
									<label className="form-check-label">Patient About</label>
								</div>
							</div>
						</div>
						<div className=" mb-2" style={{border: "1px solid #dee2e6", padding: "0.5rem"}}>
							<div className="d-flex flex-wrap" style={{gap: "1rem"}}>
								<div className="form-check">
									<input className="form-check-input" name="informed" type="checkbox" />
									<label className="form-check-label">Informed Consent</label>
								</div>
								
							</div>
						</div>

						<div className=" mb-2" style={{border: "1px solid #dee2e6", padding: "0.5rem"}}>
							<span>Surveys</span>
							<div className="d-flex flex-wrap" style={{gap: "1rem"}}>
								<div className="form-check">
									<input className="form-check-input" name="survey['SF-36']" type="checkbox" />
									<label className="form-check-label">SF-36</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="survey['EQ5D']" type="checkbox" />
									<label className="form-check-label">EQ5D</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="survey['SWAY']" type="checkbox" />
									<label className="form-check-label">SWAY</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="survey['PSS10']" type="checkbox" />
									<label className="form-check-label">PSS10</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="survey['VAS-score']" type="checkbox" />
									<label className="form-check-label">VAS-score</label>
								</div>
							</div>
						</div>
						<div className=" mb-2" style={{border: "1px solid #dee2e6", padding: "0.5rem"}}>
							<span>Clinical outcome</span>
							<div className="d-flex flex-wrap" style={{gap: "1rem"}}>
								<div className="form-check">
									<input className="form-check-input" name="clinical['Clinical Chemistry']" type="checkbox" />
									<label className="form-check-label">Clinical Chemistry</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="clinical['Hematology']" type="checkbox" />
									<label className="form-check-label">Hematology</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="clinical['Walking test']" type="checkbox" />
									<label className="form-check-label">Walking test</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="clinical['Physician Global Assessment']" type="checkbox" />
									<label className="form-check-label">Physician Global Assessment</label>
								</div>
							</div>
						</div>
						<div className=" mb-2" style={{border: "1px solid #dee2e6", padding: "0.5rem"}}>
							<span>Wearables</span>
							<div className="d-flex flex-wrap" style={{gap: "1rem"}}>
								<div className="form-check">
									<input className="form-check-input" name="wearable['herat']" type="checkbox" />
									<label className="form-check-label">Heart Rate</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="wearable['sleep']" type="checkbox" />
									<label className="form-check-label">Sleep Duration</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" name="wearable['steps']" type="checkbox" />
									<label className="form-check-label">Steps</label>
								</div>
							</div>
						</div>
					</Form.Group>

					<div className="d-grid">
						<Button name="createBTN" type="submit" style={{"display": "flex"}} className="w-[128px] h-12 flex justify-center items-center" variant="outline-dark">
							<i id="LoadingICON" name="LoadingICON" className="select-none block w-12 m-0 fa fa-circle-o-notch fa-spin hidden"></i>
							<span id="buttonText">Create Study</span>
						</Button>
					</div>
				</Form>
			</Modal.Body>
		</Modal>
	);
}

