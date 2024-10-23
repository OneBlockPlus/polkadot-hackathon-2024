
import Modal from 'react-bootstrap/Modal';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useContract from '../../../services/useContract';
import { useUtilsContext } from '../../../contexts/UtilsContext';

export default function ViewmodalShow({
	show,
	onHide,
	id,
	title
}) {
	const { contract, signerAddress } = useContract();
	const router = useRouter();
	const [list, setList] = useState([]);

	function addZero(num) {
		return num < 10 ? `0${num}` : num;
	}
	function AmPM(num) {
		return num < 12 ? 'AM' : 'PM';
	}
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	async function fetchContractData() {
		try {
			if (contract && id) {
				const arr = [];
				const totalBids = await contract.getBidsSearchToken(id).call();
				for (let i = 0; i < Number(10); i++) {
					const obj = await totalBids[i];
					let object = {};
					try { object = await JSON.parse(obj) } catch { }
					if (object.title) {
						var pricedes1 = 0;
						try { pricedes1 = formatter.format(Number(object.properties.bid.description * 1.10)) } catch (ex) { }
						const BidId = Number(await contract.getBidIdByUri(obj).call());
						const Datetime = new Date(object.properties.time.description);

						let currentdate = `${addZero(Datetime.getDate())}/${addZero(Datetime.getMonth() + 1)}/${addZero(Datetime.getFullYear())} ${addZero(Datetime.getHours())}:${addZero(Datetime.getMinutes())}:${addZero(Datetime.getSeconds())} ${AmPM(Datetime.getHours())}`
						arr.push({
							Id: BidId,
							name: object.properties.username.description.toString(),
							time: currentdate,
							bidprice: object.properties.bid.description,
							bidpriceusd: pricedes1
						});
					}
				}
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

	}, [contract]);

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
										<h7 className="cell">{listItem.bidprice} DEV</h7>
									</div>
								</div>
							</div>
						</div>))}
				</div>
			</Modal.Body>
		</Modal>
	);
}
