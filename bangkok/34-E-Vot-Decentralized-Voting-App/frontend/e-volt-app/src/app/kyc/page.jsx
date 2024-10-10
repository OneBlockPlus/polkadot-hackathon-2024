"use client"
import Link from "next/link";
import { useState } from "react";
import { Web3 } from "web3";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import SuccessModal from "@/components/SuccessModal";


export default function Onboard() {
  const [open, setOpen] = useState(false);

const handleClick = () => {
 const image = document.getElementsByClassName("uploadNIN");
 const input = document.querySelector("input[type='file']");
 input.click();
}

  return (
    <main className=" flex justify-center items-start h-screen py-10">
      <div className="w-[34rem] h-[79vh] border rounded-lg p-6 py-10">
        <div className="flex flex-col justify-start items-center align-middle h-[69vh] overflow-scroll">
        <h2 className="text-xl font-bold non-italic justify-center items-center text-center pb-2 text-wrap form-item">
          Please perform your KYC Verification to access your dashboard.
        </h2>
        <p className="font-normal text-slate-400 text-center form-item">
          Fill the input fields below.
        </p>
        <form className="mt-10">
          <div className=" form-item">
            <label htmlFor="" className="block pb-1.5 font-medium">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Input full name"
              id="fullName"
              className="pt- w-[28rem] pl-5 h-[2.8rem] border-[#8F96A1] border rounded-md"
            />
          </div>

          <div className="pt-4 form-item">
            <label htmlFor="" className="block pb-1.5 font-medium">
              Department
            </label>
            <select
              id="dropdown"
              className="w-[28rem] h-[2.8rem] border-[#8F96A1] border rounded-md pl-5"
            >
              <option
                value=""
                disabled
                selected
                className="text-slate-400"
              >
                Select department
              </option>
              <option value=""></option>
            </select>
          </div>

          <div className="pt-4 form-item">
            <label htmlFor="" className="block pb-1.5 font-medium">
              Matric Number
            </label>
            <input
              type="number"
              placeholder="Input matric number"
              id="matricNumber"
              required
              className="w-[28rem] h-[2.8rem] border-[#8F96A1] border rounded-md pl-5"
            />
          </div>

          <div className="pt-4 form-item">
            <label htmlFor="" className="block pb-1.5 font-medium">
              National Identity Number
            </label>
            <input
              type="number"
              placeholder="Input NIN"
              id="NIN"
              required
              className="w-[28rem] h-[2.8rem] border-[#8F96A1] border rounded-md pl-5"
            />
          </div>

          <div className="pt-4 form-item">
            <label htmlFor="" className="block pb-1.5 font-medium">
              Upload an Image of your NIN
            </label>
            <div className="uploadNIN" onClick={() => handleClick()}></div>
            <input type="file" className="invisible"/>
          </div>

          <div class="flex space-x-4 pt-5 ml-2 form-item">
            <button className="border-[#8F95B1] border text-black w-[12.9rem] h-[2.6rem] rounded-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
              Skip
            </button>
            <button onClick={() => setOpen(true)} className="bg-[#5773fb] text-white w-[12.9rem] h-[2.6rem] rounded-full transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300">
              Proceed
            </button>
          </div>
        </form>
        </div>
      </div>

        {/* voting time */}
        <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
            <SuccessModal btnText="See Live Elections" successMsg="Congratulations! Your kyc details have been successfully collected and attached to your address" routePath="/elections" />
        </Dialog>
    </main>
  );
}
