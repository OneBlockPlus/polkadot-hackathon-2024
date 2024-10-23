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

export default function VotingModal ({onCloseModal, info, emitVoteSuccess}) {
    const [loading, setLoading] = useState(false);
    const [voteSuccessful, setVoteSuccessful] = useState(false);
    const [open, setOpen] = useState(true);
    const router = useRouter();
	const { address, chainId, isConnected } = useWeb3ModalAccount();
	const { walletProvider } = useWeb3ModalProvider();
    
    const voteForCandidate = async (e) => {
        e.preventDefault();
        if (isConnected) {
            try {
                setLoading(true);
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const user = await signer.getAddress();
                const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
                const candidateId = ethers.keccak256(ethers.toUtf8Bytes(info.title));
                const data = await contract.vote.populateTransaction(
                    info.election_id,
                    candidateId
                );
    
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
    
                setLoading(false);
                setVoteSuccessful(true);
                emitVoteSuccess()
                console.log("Voted successfully!", relayResponse);
            } catch (error) {
                setLoading(false);
                console.error("Error voting:", error);
                setVoteSuccessful(false);
            }   
        } else {
            return toast.error("Please connect your wallet");
        }
    };

    return (
        <>
        <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
                <div className="bg-white px-4 py-16">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0">
                            <DialogTitle as="h3" className="text-[20px] font-semibold leading-6 text-gray-900">
                                {!voteSuccessful ? `Vote `: `Voted for `}{info.title} for {info.post}
                            </DialogTitle>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                Are you sure you want to vote this candidate? Once you confirm your vote,this action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                </div> 
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                    type="button"
                    onClick={voteForCandidate}
                    className="w-full flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 min-w-[10vw]"
                >
                    {loading ? <div className="animate-spin h-[30px] rounded-full border-[#fff] border-4 border-b-[#000000] w-[30px] mr-3" viewBox="0 0 24 24">
                    
                        </div> : 
                        <span>Confirm Vote</span>
                    }
                </button>
                {!loading && <button
                    type="button"
                    data-autofocus
                    onClick={onCloseModal}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                    Cancel
                </button>}
                </div>
            </DialogPanel>
            </div>
        </div>
        </>
    )
}