"use client";
import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { BigNumber, ethers } from "ethers";
import BatchABI from '../contracts/contract/artifacts/contracts/precompiles/Batch.sol/Batch.json'

import { toast } from 'react-toastify';


const AppContext = createContext({
	BatchMoonbeam: async () => { },
	EasyToast: (message, type, UpdateType = false, ToastId = '') => { },
});

export function UtilsProvider({ children }) {
	
	

	async function EasyToast(message, type, UpdateType = false, ToastId = '') {
		if (UpdateType) {
		  toast.update(ToastId, {
			render: message,
			type: type,
			isLoading: false,
			autoClose: 1000,
			closeButton: true,
			closeOnClick: true,
			draggable: true
		  });
		}
	  }
	

	async function BatchMoonbeam(tos,values,callDatas) {
		let gasLimit = [];
			

		//Sending Batch Transaction
		let batchAdd = "0x0000000000000000000000000000000000000808";
		let targetSigner = new ethers.providers.Web3Provider(window.ethereum).getSigner();
		let BatchContract = new ethers.Contract(batchAdd, BatchABI.abi, targetSigner);

		await (await BatchContract.batchAll(tos, values, callDatas, gasLimit)).wait();
	}
	return (
		<AppContext.Provider value={{ BatchMoonbeam:BatchMoonbeam,EasyToast:EasyToast }}>
			{children}
		</AppContext.Provider>
	);
}

export const useUtilsContext = () => useContext(AppContext);