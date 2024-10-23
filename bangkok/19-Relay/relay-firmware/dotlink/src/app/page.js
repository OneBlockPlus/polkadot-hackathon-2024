"use client";
import { useState, useEffect } from "react";
import { ApiPromise, HttpProvider, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { RFIDReaderInput } from "rfid-reader-input";
import { u8aToHex } from "@polkadot/util";
import { mnemonicToLegacySeed, hdEthereum } from "@polkadot/util-crypto";

const AUTH_TOKEN = "first_device";
const API_ENDPOINT = "http://localhost:3000";
const TESTING_MODE = true;
const address = "5DAmT9DGUX6LDnKKL9K578cf7bxJncHsX3sUYJFz9k55HAmD";
const PAS_DECIMAL = 10_000_000_000;

const SuccessPopup = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl transform transition-all">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-100">Transaction Successful!</h3>
          <p className="mt-2 text-sm text-gray-400">Your transaction has been processed successfully.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full inline-flex justify-center px-4 py-2 bg-green-600 text-sm font-medium text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [amount, setAmount] = useState("");
  const [rfidData, setRfidData] = useState(null);
  const [partialKey, setPartialKey] = useState("");
  const [passcode, setPasscode] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [serialCard, setSerialCard] = useState("");
  const [openCardReaderWindow, setOpenCardReaderWindow] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => setIsHover(true);
  const handleMouseLeave = () => setIsHover(false);

  const boxStyle = {
    filter: isHover ? "drop-shadow(0 0 5em #4fd1c5)" : "",
  };

  const handleOpenRFID = () => {
    setOpenCardReaderWindow(true);
    if (TESTING_MODE) {
      setTimeout(() => {
        setSerialCard("first_user");
        setRfidData({
          relay_id: "5ESEJ93jL4ENsFKweoJuyxqpuyHVZ5wHT5bPfffpom9WbYKr",
          small_pub: "5E4Sx9tvcYqRLmcGu5Poyzdh2tGkkzr75ayux5D4v9FNfvQr",
          large_pub: "5CJob2oNvqi3TQ52bDfYDN3nFssn3ShRvUrc1EMbqUNBnPMW",
          threshold: 20,
          small_part: "version canyon abandon planet",
          large_part: "tenant cement marine artefact",
        });
        setOpenCardReaderWindow(false);
      }, 2000);
    }
  };

  const handleCloseRFID = () => setOpenCardReaderWindow(false);

  const processRFIDData = (serialCard) => {
    return serialCard;
  };

  const handleAmountSubmit = async (e) => {
    e.preventDefault();
    try {
      const rfidData = TESTING_MODE
        ? {
          relay_id: "5ESEJ93jL4ENsFKweoJuyxqpuyHVZ5wHT5bPfffpom9WbYKr",
          small_pub: "5E4Sx9tvcYqRLmcGu5Poyzdh2tGkkzr75ayux5D4v9FNfvQr",
          large_pub: "5CJob2oNvqi3TQ52bDfYDN3nFssn3ShRvUrc1EMbqUNBnPMW",
          threshold: 20,
          small_part: "version canyon abandon planet",
          large_part: "tenant cement marine artefact",
        }
        : await processRFIDData(serialCard);
      setRfidData(rfidData);

      if (amount > rfidData.threshold) {
        const otp = await generateOTP(rfidData.relay_id);
        console.log(`OTP generated: ${otp}`);
      }

      const key = amount > rfidData.threshold ? rfidData.large_part : rfidData.small_part;
      setPartialKey(key);

      let otherPartKey = await fetchPartialKeyFromDB(rfidData.relay_id);
      otherPartKey = otherPartKey.enc_b;

      const fullKey = await reconstructKey(partialKey, otherPartKey, passcode);
      //const privateKey = await convertMnemonicToPrivateKey(fullKey);

      const txn = await sendTransaction(fullKey, amount);
      await storeTransactionHash(rfidData.relay_id, address, txn);
      setTransactionStatus("Transaction successful!");
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("Transaction failed. Please try again.");
    }
  };

  const generateOTP = async (relayId) => {
    const response = await fetch(`${API_ENDPOINT}/api/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ relay_id: relayId }),
    });
    if (!response.ok) {
      throw new Error("Failed to generate OTP");
    }
    return await response.json();
  };

  const storeTransactionHash = async (from, to, txn) => {
    const response = await fetch(`${API_ENDPOINT}/api/storeTx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ from, to, txn }),
    });
    if (!response.ok) {
      throw new Error("Failed to store transaction hash");
    }
  };

  const fetchPartialKeyFromDB = async (accountId) => {
    const response = await fetch(`${API_ENDPOINT}/api/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ relay_id: accountId, amount }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch partial key from DB");
    }
    return response.json();
  };

  const reconstructKey = async (partKey1, partKey2, passcode) => {
    return `${partKey1} ${partKey2} ${passcode}`;
  };

  const convertMnemonicToPrivateKey = async (mnemonic) => {
    const keyringECDSA = new Keyring({ type: "ethereum" });
    const index = 0;
    const ethDerPath = `m/44'/60'/0'/0/${index}`;

    const newPairEth = keyringECDSA.addFromUri(`${mnemonic}/${ethDerPath}`);
    return u8aToHex(
      hdEthereum(mnemonicToLegacySeed(mnemonic, "", false, 64), ethDerPath)
        .secretKey
    );
  };

  const sendTransaction = async (mnemonic, amount) => {
    const wsProvider = new WsProvider("wss://paseo.rpc.amforc.com:443");
    //const wsProvider = new HttpProvider("https://rococo-rpc.polkadot.io/");
    const api = await ApiPromise.create({ provider: wsProvider });

    const keyring = new Keyring({ type: "sr25519" });
    //const account = keyring.addFromUri(privateKey);
    const account = keyring.addFromMnemonic(mnemonic);

    const transaction = api.tx.balances.transferAllowDeath(address, amount * PAS_DECIMAL);
    let txn = await transaction.signAndSend(account);
    // return hash of the transaction
    return txn.toHex();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-75"></div>
        <div className="relative px-4 py-10 bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <img
                src="https://cdn.leonardo.ai/users/ca40e806-f75b-4356-aba3-8fe01fc6dc34/generations/e11b8779-5bf4-4dfc-a6c2-1365cfbd39b9/Leonardo_Phoenix_Create_a_sleek_darkthemed_logo_for_Relay_a_bl_0.jpg"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={boxStyle}
                alt="Relay logo"
                className="w-24 h-24 rounded-full"
              />
            </div>
            <h1 className="text-2xl font-semibold text-center mb-6 text-white">
              {serialCard ? serialCard : "Relay"}
            </h1>
            <form onSubmit={handleAmountSubmit} className="space-y-4">
              <div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={handleOpenRFID}
                className="w-full py-2 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800 mb-2"
              >
                Open RFID Reader
              </button>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Process Transaction
              </button>
            </form>
            {transactionStatus && (
              <p
                className={`mt-4 text-center ${transactionStatus.includes("failed")
                    ? "text-red-500"
                    : "text-green-500"
                  }`}
              >
                {transactionStatus}
              </p>
            )}
          </div>
        </div>
      </div>
      <RFIDReaderInput
        isOpen={openCardReaderWindow}
        onRequestClose={handleCloseRFID}
        handleCodeCardRFID={setSerialCard}
        textBody="Scan your RFID card"
        textTitle="RFID Card"
      />
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
      />
    </div>
  );
}