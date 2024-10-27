import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import UseFormInput from '../UseFormInput';
import { useMixedContext } from '../../../contexts/MixedContext';
import { useUtilsContext } from '../../../contexts/UtilsContext';
import { toast } from 'react-toastify';

export default function DirectDonateModal({
	show,
	onHide,
	eventId,
	contract,
	senderAddress,
	sendTransaction,
	toAddress,
	toAddress2,

}) {
	const [Alert, setAlert] = useState('');

	const { BatchMoonbeam } = useUtilsContext();
	const { LoggedType,ReadContractByQuery ,getQuery,polka_SendMoney,CurrentToken,GetEventRaised } = useMixedContext();


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
			if (LoggedType === "metamask") {
				let newToAddress = (eventId.toString().startsWith("p_"))? toAddress2:toAddress
				let to = [];
				let value = [];
				let callData = [];


				//Adding Sending amount to Batch paramaters:

				to.push(newToAddress);
				value.push(`${Number(Amount) * 1e18}`)
				callData.push("0x");


				//Adding Set Event Raised Batch paramaters:
				const Raised = Number(await GetEventRaised(eventId)) + Number(Amount);
				const txData = contract._setEventRaised(eventId, Raised.toString()).encodeABI();

				to.push(window.PolkaGiftAddress);
				value.push(0);
				callData.push(txData)


				ShowAlert("pending", `Please confirm Batch Transaction`);

				await BatchMoonbeam(to, value, callData)

			}else{
				ShowAlert("pending",`Transferring ${Number(Amount)} to event wallet`);
				let newToAddress = (eventId.toString().startsWith("m_"))? toAddress2:toAddress
				await polka_SendMoney(newToAddress,`${Number(Amount) * 1e18}`);
				
				ShowAlert("pending", `Saving information...`);

				let event_raised = await GetEventRaised(eventId)
				const Raised = Number(event_raised) + Number(Amount);

				const result = await sendTransaction('_setEventRaised',[eventId, Raised.toString()]);


			}


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
						<Form.Label>Amount in {CurrentToken}</Form.Label>
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
