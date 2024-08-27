import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom"; 
import { useConnectWallet } from "@subwallet-connect/react";

import backgroundImage from "../../src/assets/backgroundImage.png";


export default function ConnectWalletModal() {
  const [{ wallet } = {}, connect] = useConnectWallet();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleConnect = () => {
    if (!wallet) {
      connect();
    }
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/"); // Navigate to home when the dialog is closed
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-10">
      <DialogBackdrop
        transition
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100/10 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon
                    aria-hidden="true"
                    className="h-8 w-8 text-green-600"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-2xl font-semibold leading-6 text-gray-900"
                  >
                    Connect Wallet
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      You must connect your wallet to access this page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-4 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => {
                  handleConnect();
                  handleClose(); // Close the dialog and navigate after connecting
                }}
                className="inline-flex w-full justify-center rounded-md bg-purple-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 sm:ml-3 sm:w-auto"
              >
                Connect
              </button>
              <button
                type="button"
                data-autofocus
                onClick={handleClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500/20 px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-500/10 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
