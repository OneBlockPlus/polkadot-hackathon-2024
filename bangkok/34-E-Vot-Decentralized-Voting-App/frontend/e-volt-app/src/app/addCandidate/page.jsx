"use client";
import Link from "next/link";
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

const contractAddress = "0xdB148aa6F1B878B55c1155d280dF4f8A07A4DA24";

const relay = new GelatoRelay();
const GELATO_API = process.env.NEXT_PUBLIC_GELATO_API_KEY;
const now = new Date();


export default function AddCandidate() {
  const [newCandidate, setNewCandidate] = useState("");
	const [electionIdForCandidate, setElectionIdForCandidate] = useState("");
  const [open, setOpen] = useState(false);
	const [loading, setloading] = useState(false);
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false);
	const { address, chainId, isConnected } = useWeb3ModalAccount();

const handleClick = () => {
 const image = document.getElementsByClassName("uploadNIN");
 const input = document.querySelector("input[type='file']");
 input.click();
}

const handleGoback = () => {
  // if (isMounted) {
    router.back();
  // }
}

const addCandidate = async (e) => {
  e.preventDefault();
  if(isConnected) {
    try {
      setloading(true)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  
      const data = await contract.addCandidate.populateTransaction(
        electionIdForCandidate,
        newCandidate
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
      console.log("Candidate added!", relayResponse);
    } catch (error) {
      setloading(false)
      return toast.error("Error adding candidate");
    }
  } else {
    return toast.error("Please connect your wallet");
  }
}


  return (
    <main className=" flex justify-center items-start h-screen py-10">
      <div className="w-[34rem] h-[79vh] border rounded-lg p-6 py-10">
        <div className="flex flex-col justify-start items-center align-middle h-[69vh] overflow-scroll">
        <h2 className="text-xl font-bold non-italic justify-center items-center text-center pb-2 text-wrap form-item">
         Add Candidate
        </h2>
        <p className="font-normal text-slate-400 text-center form-item">
          Fill the input fields below.
        </p>
        <form className="mt-10">
          <div className=" form-item">
            <label htmlFor="" className="block pb-1.5 font-medium">
              Election ID
            </label>
            <input
              type="text"
              placeholder="Input election id"
              id="id"
              value={electionIdForCandidate}
					    onChange={(e) => setElectionIdForCandidate(e.target.value)}
              className="pt- w-[28rem] pl-5 h-[2.8rem] border-[#8F96A1] border rounded-md"
            />
          </div>
          <div className=" form-item mt-4">
            <label htmlFor="" className="block pb-1.5 font-medium">
              Candidate Name
            </label>
            <input
              type="text"
              placeholder="Input candidate name"
              id="name"
              value={newCandidate}
					    onChange={(e) => setNewCandidate(e.target.value)}
              className="pt- w-[28rem] pl-5 h-[2.8rem] border-[#8F96A1] border rounded-md"
            />
          </div>

          <div className="flex space-x-4 pt-5 ml-2 form-item">
            <button onClick={handleGoback} className="border-[#8F95B1] border text-black w-[12.9rem] h-[2.6rem] rounded-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
              Cancel
            </button>
            <button onClick={addCandidate} className="bg-[#5773fb] text-white w-[12.9rem] h-[2.6rem] rounded-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 flex items-center justify-center">
            {loading ? <div className="animate-spin h-[30px] rounded-full border-[#fff] border-4 border-b-[#000000] w-[30px] mr-3" viewBox="0 0 24 24">
								
								</div> : 
								<span>Proceed</span>
								}
            </button>
          </div>
        </form>
        </div>
      </div>

        {/* voting time */}
        <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
            <SuccessModal btnText="Accredit Voter" successMsg="Congratulations! You have successfully added a candidate to contest in a transparent election" routePath="/accreditVoter" />
        </Dialog>
    </main>
  );
}
