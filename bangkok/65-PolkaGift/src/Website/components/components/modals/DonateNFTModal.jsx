import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import UseFormInput from '../UseFormInput';
import { useRouter } from 'next/router';
import { useUtilsContext } from '../../../contexts/UtilsContext';
import { toast } from 'react-toastify';


export default function DonateNFTModal({
	show,
	onHide,
	contract,
	senderAddress,
	sendTransaction,
	type,
	EventID,
	EventWallet,
	SelectedTitle,
	enddate
}) {

	const router = useRouter();
    const {EasyToast} = useUtilsContext();

	const [name, nameInput] = UseFormInput({
		type: 'text',
		placeholder: 'Enter name',
	});
	const [description, descriptionInput] = UseFormInput({
		as: 'textarea',
		placeholder: 'Enter description',
	});
	const [url, urlInput] = UseFormInput({
		type: 'text',
		placeholder: 'Enter image url',
	});

	const [price, priceInput] = UseFormInput({
		type: 'text',
		placeholder: 'Enter Price',
	});
	const [NFTaddress, NFTaddressInput] = UseFormInput({
		type: 'text',
		placeholder: 'Enter NFT address',
	});

	async function createNFT() {
		let Logourl = url;
		var tokenAddress = NFTaddress;
		const ToastId = toast.loading('Donating NFT ...');
  

		const createdObject = {
			title: 'Asset Metadata',
			type: 'object',
			properties: {
				eventID:EventID,
				name: {
					type: 'string',
					description: name,
				},
				description: {
					type: 'string',
					description: description,
				},
				image: {
					type: 'string',
					description: Logourl,
				},
				price: {
					type: 'string',
					description: price
				},
				typeimg: {
					type: 'string',
					description: type
				},
				nftaddress: {
					type: 'string',
					description: tokenAddress
				},
				higherbidadd: {
					type: 'string',
					description: ""
				},
				wallet: {
					type: 'string',
					description:EventWallet
				},
				date: {
					type: 'string',
					description: enddate
				}
			},
			bids: []
		};
		const result = await sendTransaction(contract.claimToken(senderAddress,JSON.stringify(createdObject),EventID));
		await window.document.getElementsByClassName("btn-close")[0].click();
	
		await EasyToast('Donated Successfully!','success',true,ToastId)
            
		window.location.href=`/donation/auction?[${EventID}]`;
		console.log(result);
		

	}

	return (
		<Modal
			show={show}
			onHide={onHide}
			aria-labelledby="contained-modal-title-vcenter"
			size="lg"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					Donate {type} - {SelectedTitle}
				</Modal.Title>

			</Modal.Header>
			<Modal.Body className="show-grid">
				<Form>
					<Form.Group className="mb-3" controlId="formGroupName">
						<Form.Label>Name</Form.Label>
						{nameInput}
					</Form.Group>
					<Form.Group className="mb-3" controlId="formGroupDescription">
						<Form.Label>Description</Form.Label>
						{descriptionInput}
					</Form.Group>
					<Form.Group className="mb-3" controlId="formGroupName">
						<Form.Label>Opening price in DEV</Form.Label>
						{priceInput}

					</Form.Group>

					<Form.Group className="mb-3" controlId="formGroupImageUrl">
						<Form.Label>Enter image URL</Form.Label>
						{urlInput}
					</Form.Group>
					<Form.Group className="mb-3" controlId="formGroupImageUrl">
							<Form.Label>NFT address</Form.Label>
							{NFTaddressInput}
						</Form.Group>
					

					<div className="d-grid">
						<Button variant="primary" onClick={createNFT}>
							Donate {type}
						</Button>
					</div>
				</Form>
			</Modal.Body>
		</Modal>
	);
}
