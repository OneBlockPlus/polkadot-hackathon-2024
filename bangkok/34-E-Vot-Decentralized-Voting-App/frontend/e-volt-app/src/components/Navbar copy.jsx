"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {Web3} from "web3";

export default function Onboard() {
    const btnRef = useRef(null);

    // connect to injected provider
    const web3 = new Web3(window.ethereum)

    // ask the user to connect the account
    async function connect(){
      const accounts = await web3.eth.requestAccounts()
      console.log(accounts)

    }

    return (
        <header>
            <navbar className="flex h-[10vh] justify-around items-center fixed top-0 right-0 min-w-[100vw] bg-[#ffffff] border-b-2">
            <div className="logo mr-[-10px]">
                <img src="/assets/Logo.png" alt="logo" />
            </div>

            <div className="flex ml-20 ">
                <ul className="flex ">
                <li className="px-8 font-medium">
                    <Link href="/">Dashboard</Link>
                </li>
                <li className="px-8 font-medium">
                    <Link href="/">Vote</Link>
                </li>
                <li className="px-8 font-medium">
                    <Link href="/">KYC</Link>
                </li>
                </ul>
            </div>

            <div>
                {/* <div className="flex items-center justify-center space-x-4 bg-[#9747FF] text-white rounded-lg w-[9rem] h-[2.5rem] ml-20 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 z-50"> */}
                    <w3m-button />
                {/* </div> */}
                {/* <button onClick={handleConnect} className="space-x-4 bg-[#9747FF] text-white rounded-lg w-[9rem] h-[2.5rem] ml-20 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 z-50">
                {/* <w3m-button /> 
                </button> */}
            </div>
            </navbar>
        </header>
    )
}