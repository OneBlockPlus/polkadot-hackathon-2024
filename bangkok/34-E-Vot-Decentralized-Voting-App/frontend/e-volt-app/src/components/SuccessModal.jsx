'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export default function SuccessModal ({routePath, btnText, successMsg}) {
    const [loading, setLoading] = useState(false);
    const [voteSuccessful, setVoteSuccessful] = useState(false);
    const router = useRouter()

    const handleRouting = () => {
        router.push(routePath)
    }

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
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 flex flex-col justify-center items-center">
                            <img src="./assets/success.png" alt="" />
                            <DialogTitle as="h3" className="text-[20px] font-semibold leading-6 text-gray-900 mt-8">
                                Hooray!!!
                            </DialogTitle>
                            <div className="mt-2 flex flex-col justify-center items-center">
                                <p className="text-sm text-gray-500">
                                {successMsg}
                                </p>
                            </div>
                        </div>
                    </div>
                </div> 
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    
                    <button
                        type="button"
                        data-autofocus
                        onClick={handleRouting}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300"
                    >
                       {btnText}
                    </button>
                </div>
            </DialogPanel>
            </div>
        </div>
        </>
    )
}