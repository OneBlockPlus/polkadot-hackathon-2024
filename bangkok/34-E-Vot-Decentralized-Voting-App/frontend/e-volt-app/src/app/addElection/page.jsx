"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Web3 } from "web3";
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import SuccessModal from "@/components/SuccessModal";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import { CONTRACT_ABI } from "@/constants/abi";
import { toast } from "react-toastify";
import {
	useWeb3ModalAccount,
	useWeb3ModalProvider,
} from "web3modal-web3js/react";
import { ethers } from "ethers";

const contractAddress = "0xdB148aa6F1B878B55c1155d280dF4f8A07A4DA24"; // Replace with your deployed contract address

const relay = new GelatoRelay();
const GELATO_API = process.env.NEXT_PUBLIC_GELATO_API_KEY;
const now = new Date();
now.setMinutes(now.getMinutes() + 5); // Add 5 minutes
const minDateTime = now.toISOString().slice(0, 16);

export default function AddElection() {
	const [open, setOpen] = useState(false);
	const [loading, setloading] = useState(false);
	const [newElection, setNewElection] = useState({
		title: "",
		startDate: "",
		endDate: "",
	});
	const router = useRouter();
	const { address, chainId, isConnected } = useWeb3ModalAccount();
	const { walletProvider } = useWeb3ModalProvider();

	async function addElection(e) {
		e.preventDefault();
		if(isConnected) {
		try {
			setloading(true)
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
	
			const data = await contract.createElection.populateTransaction(
			newElection.title,
			Math.floor(new Date(newElection.startDate).getTime() / 1000),
			Math.floor(new Date(newElection.endDate).getTime() / 1000)
			);
	
			const user = await signer.getAddress();
			const request = {
			chainId: (await provider.getNetwork()).chainId,
			target: contractAddress,
			data: data.data,
			user: user,
			};
	
			const relayResponse = await relay.sponsoredCallERC2771(
			request,
			provider,
			GELATO_API
			);
			

			setloading(false)
			setOpen(true)
			// const txHash = await getTransactionHash(relayResponse);
			console.log("Election created!", relayResponse);
		} catch (error) {
			setloading(false)
			return toast.error("Error creating election");
			// console.error("Error creating election:", error);
		}
		} else {
		return toast.error("Please connect your wallet");
		}
	}

	const handleClick = () => {
		const image = document.getElementsByClassName("uploadNIN");
		const input = document.querySelector("input[type='file']");
		input.click();
	};

	return (
		<main className=" flex justify-center items-start h-screen py-10">
			<div className="w-[34rem] h-[79vh] border rounded-lg p-6 py-10">
				<div className="flex flex-col justify-start items-center align-middle h-[69vh] overflow-scroll">
					<h2 className="text-xl font-bold non-italic justify-center items-center text-center pb-2 text-wrap form-item">
						Create An Election.
					</h2>
					<p className="font-normal text-slate-400 text-center form-item">
						Fill the input fields below.
					</p>
					<form onSubmit={addElection} className="mt-10">
						<div className=" form-item">
							<label htmlFor="" className="block pb-1.5 font-medium">
								Election Title
							</label>
							<input
								type="text"
								value={newElection.title}
								onChange={(e) =>
									setNewElection({ ...newElection, title: e.target.value })
								}
								placeholder="Input election title"
								id="title"
								className="pt- w-[28rem] pl-5 h-[2.8rem] border-[#8F96A1] border rounded-md"
							/>
						</div>

						<div className="pt-4 form-item">
							<label htmlFor="" className="block pb-1.5 font-medium">
								Start Date
							</label>
							<input
								type="datetime-local"
								min={minDateTime}
								placeholder="Start Date and Time"
								value={newElection.startDate}
								onChange={(e) =>
									setNewElection({ ...newElection, startDate: e.target.value })
								}
								id="startDate"
								required
								className="w-[28rem] h-[2.8rem] border-[#8F96A1] border rounded-md pl-5"
							/>
						</div>

						<div className="pt-4 form-item">
							<label htmlFor="" className="block pb-1.5 font-medium">
								End Date
							</label>
							<input
								type="datetime-local"
								min={minDateTime}
								placeholder="End Date and Time"
								value={newElection.endDate}
								onChange={(e) =>
									setNewElection({ ...newElection, endDate: e.target.value })
								}
								id="endDate"
								required
								className="w-[28rem] h-[2.8rem] border-[#8F96A1] border rounded-md pl-5"
							/>
						</div>

						<div className="flex space-x-4 pt-5 ml-2 form-item">
							<button
								type="button"
								onClick={() => {
									router.back();
								}}
								className="border-[#8F95B1] border text-black w-[12.9rem] h-[2.6rem] rounded-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300"
							>
								Cancel
							</button>
							<button
								type="submit"
								onClick={addElection}
								className="bg-[#5773fb] text-white w-[12.9rem] h-[2.6rem] rounded-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 flex items-center justify-center"
							>
								{loading ? <div className="animate-spin h-[30px] rounded-full border-[#fff] border-4 border-b-[#000000] w-[30px] mr-3" viewBox="0 0 24 24">
								
								</div> : 
								<span>Proceed</span>
								}
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* success modal*/}
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				className="relative z-10"
			>
				<SuccessModal btnText="Add a Candidate" successMsg="Congratulations! You have successfully created an election to allow voters vote in a transparent way" routePath="/addCandidate" />
			</Dialog>
		</main>
	);
}
