import { useState, useEffect } from "react";
import useContract from "../services/useContract";
import Cookies from 'js-cookie'
function Payment() {
	const [tabIndex, setTabIndex] = useState(0);
	const [privatekey, setprivatekey] = useState("");
	const {  api,contract, signerAddress, sendTransaction,ReadContractValue,ReadContractByQuery,getMessage,getQuery,getTX } = useContract();
 
	const TABS = [
		{
			id: "transactions",
			title: "Transactions"
		},
		{
			id: "paymentmethod",
			title: "Payment method"
		}
	];
	const [screenSize, getDimension] = useState({
		dynamicWidth: window.innerWidth,
		dynamicHeight: window.innerHeight
	});
	async function fetchData() {
		if (contract) {
			let userid = Cookies.get("userid");
			let userdetails = await ReadContractByQuery(api,signerAddress, getQuery("getUserDetails"),[Number(userid)]);
			setprivatekey(userdetails[4].substring(0,10) + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
		}
	}

	useEffect(async () => {
		const setDimension = () => {
			getDimension({
				dynamicWidth: window.innerWidth,
				dynamicHeight: window.innerHeight
			});
		};

		window.addEventListener("resize", setDimension);
		fetchData();
	}, [contract]);

	async function UpdatePayments(e) {
		e.preventDefault();
		const { privatekey, SaveBTN } = e.target;
		SaveBTN.children[0].classList.remove("hidden")
		SaveBTN.children[1].innerText = ""
		SaveBTN.disabled = true;


		try {
			let userid = Cookies.get("userid");
		 
			// await sendTransaction(api,signerAddress, "UpdatePrivatekey",[parseInt(userid), privatekey.value]);
			  
			SaveBTN.children[0].classList.add("hidden")
			SaveBTN.children[1].innerText = "Save"
   
			SaveBTN.disabled = false;
			window.location.reload();
			

		} catch (error) {
		}
		SaveBTN.children[0].classList.add("hidden")
		SaveBTN.children[1].innerText = "Save";
		SaveBTN.disabled = false;
	}

	return (
		<>
			<div className="bg-white border border-gray-400 rounded-lg flex mt-4 px-4">
				{TABS.map(({ id, title }, index) => {
					const IS_LAST = index ===TABS.length - 1;
					const ACTIVE = index ===tabIndex;

					return (
						<>
							<div className="self-stretch w-[1px] bg-gray-400" />
							<button key={id} onClick={() => setTabIndex(index)} className={`flex items-center h-14 p-4 ${ACTIVE ? "bg-gray-100" : "bg-white"}`}>
								<p className={`${ACTIVE ? "text-orange-500" : "text-black"} font-medium`}>{title}</p>
							</button>
							{IS_LAST && <div className="self-stretch w-[1px] bg-gray-400" />}
						</>
					);
				})}
			</div>
			{tabIndex ===0 && (
				<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
					<h2 className="m-0">Transactions</h2>
					<table>
						<thead className="border-b border-b-gray-400">
							<tr>
								<th className="text-left font-normal py-3 px-3">Date</th>
								<th className="text-left font-normal py-3 px-3">Description</th>
								<th className="text-left font-normal py-3 px-3 w-56">Status</th>
								<th className="text-left font-normal py-3 px-3 w-32">Amount</th>
							</tr>
						</thead>
					</table>
				</div>
			)}
			{tabIndex ===1 && (
				<form method="POST" onSubmit={UpdatePayments} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
					<h2 className="mb-3">Payment</h2>
					<div className="mb-2 ">
						<label className="flex flex-col font-semibold mt-1 ">
							Private Key
							<input
								type="text"
								autoComplete="off"
								defaultValue={privatekey}
								name="privatekey"
								className="mt-1 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400 "
								placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
							/>
						</label>
					</div>
					<div className={`flex items-center justify-between items-end ${screenSize.dynamicWidth < 800 ? "flex-wrap" : ""}`}>
						<button type="submit" id="SaveBTN" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600">
							<i id="LoadingICON" name="LoadingICON" className="select-none block w-12 m-0 fa fa-circle-o-notch fa-spin hidden"></i>
							<p className="text-white ml-1">Save</p>
						</button>
					</div>
				</form>
			)}
		</>
	);
}

export default Payment;

