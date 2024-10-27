
import Modal from 'react-bootstrap/Modal';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMixedContext } from '../../../contexts/MixedContext';

export default function ViewmodalShow({
	show,
	onHide,
	id,
	title
}) {
	const { contract,contract2, signerAddress, GetNftBidsByTokenId,CurrentToken } = useMixedContext();
	const router = useRouter();
	const [list, setList] = useState([]);



	async function fetchContractData() {
		try {
			if (contract && id) {
				const arr = await GetNftBidsByTokenId(id);
				setList(arr.reverse());
				if (document.getElementById("Loading"))
					document.getElementById("Loading").style = "display:none";
				if (document.getElementById("Loadingtable")) {
					var element = document.getElementById("Loadingtable");
					element.style = "display:block";
					(element).setAttribute("id", "");
				}

			}
		} catch (error) {
			console.error(error);
		}
	}
	useEffect(() => {
		fetchContractData();

	}, [contract,contract2]);

	return (
		<Modal
			show={show}
			onHide={onHide}
			onShow={fetchContractData}
			aria-labelledby="contained-modal-title-vcenter"
			size="xl"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					View Bid - {title}
				</Modal.Title>

			</Modal.Header>
			<Modal.Body className="show-grid">
				<div id='Loadingtable' style={{ display: 'none' }} className="">
					<div className='tableHeader'>
						<div className='tableHeaderContainer'>
							<div className='tableheaderDateContainer' >
								<h6 className="header" >Date</h6>
							</div>
							<div className="tableheaderUserContainer" >
								<h6 className="header" >User Name</h6>
							</div>
							<div className="tableheaderBidContainer" >
								<h6 className="header" >Bid</h6>
							</div>
						</div>
					</div> {list.map((listItem) => (
						<div key={listItem.Id} className='tableFullRowContainer'>
							<div className='tableRowContainer'>
								<div className='tableRowCellContainer'>
									<div className='tableRowCellDateContainer'>
										<h7 className="cell">{listItem.time}</h7>
									</div>
									<div className='tableRowCellUserContainer'>
										<h7 className="cell">{listItem.name}</h7>
									</div>
									<div className="tableRowCellBidContainer">
										<h7 className="cell">{listItem.bidprice} {CurrentToken}</h7>
									</div>
								</div>
							</div>
						</div>))}
				</div>
			</Modal.Body>
		</Modal>
	);
}
