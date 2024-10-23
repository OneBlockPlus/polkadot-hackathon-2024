import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import UseFormInput from '../UseFormInput';
import { useUtilsContext } from '../../../contexts/UtilsContext';
import { toast } from 'react-toastify';

export default function DirectDonateModal({
	show,
	onHide,
	eventId,
	contract,
	senderAddress,
	sendTransaction,
	EventWallet,

}) {
	const [Alert, setAlert] = useState('');

    const { BatchMoonbeam } = useUtilsContext();
    const {EasyToast} = useUtilsContext();

	const sleep = (milliseconds) => {
		return new Promise(resolve => setTimeout(resolve, milliseconds))
	}


	const [Amount, AmountInput] = UseFormInput({
		type: 'text',
		placeholder: 'Amount',
	});

	function ShowAlert(type, TextAlert) {

		var workingalertELM = document.getElementById("workingalert");
		var alertELM = document.getElementById("alert");
		var successalertELM = document.getElementById("successalert");
		workingalertELM.style.display = 'none';
		alertELM.style.display = 'none';
		successalertELM.style.display = 'none';
		setAlert(TextAlert);
		if (type == "pending") {
			workingalertELM.style.display = 'flex';
		} else if (type == "success") {
			successalertELM.style.display = 'flex';

		} else if (type == "error") {
			alertELM.style.display = 'flex';
		}
		
	}

	async function DonateCoin() {

		var DonateBTN = document.getElementById("DonateBTN");
		DonateBTN.disabled = true;

		try {
			let to = [];
			let value = [];
			let callData = [];
			
			
			//Adding Sending amount to Batch paramaters:
			
			to.push(EventWallet);
			value.push(`${Number(Amount) * 1e18}`)
			callData.push("0x");


			//Adding Set Event Raised Batch paramaters:
			const Raised = Number(await contract.getEventRaised(eventId).call()) + Number(Amount);
			const txData = contract._setEventRaised(eventId, Raised.toString()).encodeABI();

			to.push(window.PolkaGiftAddress);
			value.push(0);
			callData.push(txData)

			
			ShowAlert("pending", `Please confirm Batch Transaction`);

			await BatchMoonbeam(to,value,callData)


			ShowAlert("success", `Success!`);

			await sleep(300)
			window.document.getElementsByClassName("btn-close")[0].click();
			DonateBTN.disabled = false;
			window.location.reload();
		} catch (e) {
			console.error(e);

			ShowAlert("error", `Error! Please try again!`);
			return;
		}

	}

	return (
		<Modal
			show={show}
			onHide={onHide}
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					Donate Coin
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="show-grid">
				<Form>
					<div id='alert' style={{ display: 'none' }} className="alert alert-danger" role="alert">
						{Alert}
					</div>
					<div id='workingalert' style={{ display: 'none' }} className="alert alert-warning" role="alert">
						{Alert}
					</div>
					<div id='successalert' style={{ display: 'none' }} className="alert alert-success" role="alert">
						{Alert}
					</div>


					<Form.Group className="mb-3" controlId="formGroupName">
						<Form.Label>Amount in DEV</Form.Label>
						{AmountInput}

					</Form.Group>
					<div className="d-grid">
						<Button variant="primary" id="DonateBTN" onClick={DonateCoin}>
							Donate
						</Button>

					</div>
				</Form>
			</Modal.Body>

		</Modal>

	);
}
