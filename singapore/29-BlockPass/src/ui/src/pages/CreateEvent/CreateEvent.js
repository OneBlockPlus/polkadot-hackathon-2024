import React, { useState } from "react";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { typesBundleForPolkadot } from "@crustio/type-definitions";
import { Keyring } from "@polkadot/keyring";
import { motion } from "framer-motion";
import logo from "../../assets/logos/logo.png";
import { Link } from "react-router-dom";
import { useConnectWallet } from "@subwallet-connect/react";
import { createEvent } from "../../contractAPI";

const crustChainEndpoint = "wss://rpc-rocky.crust.network";
const ipfsW3GW = "https://crustipfs.xyz";
const crustSeeds = process.env.REACT_APP_SEED;

const CreateEventForm = () => {
  const [formData, setFormData] = useState({
    eventName: "",
    category: "",
    description: "",
    moreInformation: "",
    ticketPrice: "",
    availableSeats: "",
    location: "",
    startTime: "",
    endTime: "",
    dateOfEvent: "",
    banner: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [{ wallet},] = useConnectWallet();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure positive values for ticketPrice and availableSeats
    if ((name === "ticketPrice" || name === "availableSeats") && value < 0) {
      return;
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, banner: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({ ...prevData, banner: null }));
    setImagePreview(null);
    document.getElementById("banner").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.banner) {
      alert("Please select a banner to upload.");
      setIsSubmitting(false);
      return;
    }

     // Log the form data to the console
  console.log("Form Data Submitted:", formData);

    try {
      const api = new ApiPromise({
        provider: new WsProvider(crustChainEndpoint),
        typesBundle: typesBundleForPolkadot,
      });

      await api.isReady;

      const uploadBannerToCrust = async (file) => {
        const fileContent = await file.arrayBuffer();
        const buffer = btoa(fileContent);

        // Create IPFS instance and upload
        const pair = ethers.Wallet.createRandom();
        const sig = await pair.signMessage(pair.address);
        const authHeaderRaw = `eth-${pair.address}:${sig}`;
        const authHeader = btoa(authHeaderRaw).toString("base64");
        const ipfsRemote = create({
          url: `${ipfsW3GW}/api/v0`,
          headers: {
            authorization: `Basic ${authHeader}`,
          },
        });

        const rst = await addFile(ipfsRemote, buffer);

        await placeStorageOrder(api, rst.cid, rst.size);

        const addedAmount = 100;
        await addPrepaid(api, rst.cid, addedAmount);

        return rst.cid;
      };

      const addFile = async (ipfs, fileContent) => {
        const cid = await ipfs.add(fileContent);
        const fileStat = await ipfs.files.stat(`/ipfs/${cid.path}`);
        return {
          cid: cid.path,
          size: fileStat.cumulativeSize,
        };
      };

      const placeStorageOrder = async (api, fileCid, fileSize) => {
        const tips = 0;
        const memo = "";
        const tx = api.tx.market.placeStorageOrder(
          fileCid,
          fileSize,
          tips,
          memo
        );

        const kr = new Keyring({ type: "sr25519" });
        const krp = kr.addFromUri(crustSeeds);

        return new Promise((resolve, reject) => {
          tx.signAndSend(krp, ({ events = [], status }) => {
            // console.log(`💸  Tx status: ${status.type}, nonce: ${tx.nonce}`);

            if (status.isInBlock) {
              events.forEach(({ event: { method } }) => {
                if (method === "ExtrinsicSuccess") {
                  // console.log(`✅  Place storage order success!`);
                  resolve(true);
                }
              });
            }
          }).catch(reject);
        });
      };

      const addPrepaid = async (api, fileCid, amount) => {
        const tx = api.tx.market.addPrepaid(fileCid, amount);

        const kr = new Keyring({ type: "sr25519" });
        const krp = kr.addFromUri(crustSeeds);

        return new Promise((resolve, reject) => {
          tx.signAndSend(krp, ({ events = [], status }) => {
            // console.log(`💸  Tx status: ${status.type}, nonce: ${tx.nonce}`);

            if (status.isInBlock) {
              events.forEach(({ event: { method } }) => {
                if (method === "ExtrinsicSuccess") {
                  // console.log(`✅  Add prepaid success!`);
                  resolve(true);
                }
              });
            }
          }).catch(reject);
        });
      };

      const bannerCid = await uploadBannerToCrust(formData.banner);

      async function getOrderState(cid) {
        await api.isReadyOrError;
        return await api.query.market.filesV2(cid);
      }

      console.log(getOrderState(bannerCid));
      setUploadStatus(`Banner uploaded successfully with CID: ${bannerCid}`);
      const ticketPriceInWei = ethers.utils.parseUnits(formData.ticketPrice, 18);
      const eventDet = [
        formData.eventName,
        formData.dateOfEvent,
        formData.startTime,
        formData.endTime,
        formData.location,
        bannerCid,
        formData.description,
        formData.category,
        formData.moreInformation,
        ticketPriceInWei.toString(),
        formData.availableSeats,
      ];
      await createEvent(wallet, eventDet, "BlockPass", "BPS");

      setFormData({
        eventName: "",
        category: "",
        description: "",
        moreInformation: "",
        ticketPrice: "",
        availableSeats: "",
        location: "",
        startTime: "",
        endTime: "",
        dateOfEvent: "",
        banner: null,
      });
      setImagePreview(null);
      e.target.reset();
    } catch (error) {
      console.error("Error uploading banner:", error);
      setUploadStatus("Failed to upload banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const content = {
  //   name: formData.eventName || "Untitled Event",
  //   category: formData.category || "Uncategorized",
  //   description: formData.description || "No description provided.",
  //   moreInformation: formData.moreInformation || "",
  //   ticketPrice: formData.ticketPrice || 0,
  //   availableSeats: formData.availableSeats || "0",
  //   location: formData.location || "TBA",
  //   startTime: formData.startTime || new Date().toISOString().slice(0, 10),
  //   endTime: formData.endTime || new Date().toISOString().slice(0, 10),
  //   dateOfEvent: formData.dateOfEvent || "00:00",
  // };

  // console.log(content);

  // try {
  //   const start_date = formData.startTime;
  //   const end_date = formData.endTime;
  //   const epochTime_start = Date.parse(start_date) / 1000;
  //   const epochTime_end = Date.parse(end_date) / 1000;
  //   const salesEndTime = epochTime_end - epochTime_start;

  // const result = await createEvent(
  //   formData.availableSeats,
  //   epochTime_start,
  //   salesEndTime,
  //   formData.ticketPrice,
  //   meta_url,
  //   formData.category,
  // );
  // console.log(result);

  // const formatAddress = (address) => {
  //   if (address.length > 0) {
  //     return `${address.slice(0, 6)}...${address.slice(-4)}`;
  //   }
  //   return "";
  // };

  return (
    <>
      <nav className="container flex justify-between lg:relative mx-auto items-center px-8 py-4">
        {/* Logo and Brand Name */}
        <Link to="/">
          <motion.div
            whileHover={{
              scale: 1.1,
            }}
            className="flex items-center"
          >
            <img src={logo} alt="BlockPass Logo" className="h-8 mr-2 " />
            <span className="text-black font-semibold text-lg">
              Block<span className="text-[#F5167E]">Pass</span>{" "}
            </span>
          </motion.div>
        </Link>
        {/* Hamburger Button */}
        <button
          className="md:hidden text-black hover:text-[#F5167E] focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-black/30 md:bg-transparent p-4 md:p-0 md:mr-16 z-10`}
        >
          {["Home", "All Events", "My tickets"].map((text, index) => (
            <Link
              key={index}
              to={
                text === "All Events"
                  ? "/events"
                  : `/${text.toLowerCase().replace(/\s+/g, "-")}` &&
                    text === "Home"
                  ? "/"
                  : `/${text.toLowerCase().replace(/\s+/g, "-")}` &&
                    text === "My tickets"
                  ? "/my-tickets"
                  : `/${text.toLowerCase().replace(/\s+/g, "-")}`
              }
              className="block md:inline-block text-black hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
            >
              {text}
            </Link>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto my-10 p-8 relative">
        <div
          className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <h2 className="text-3xl font-bold text-start text-gray-800 mb-1">
          Create An Event
        </h2>
        <p className="mb-5 text-gray-500">
          Your Best Event Place for booking and management
        </p>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="eventName"
            className="block text-sm  font-medium text-gray-700 mb-2"
          >
            Event Name <span className="text-red-700">*</span>
          </label>
          <input
            id="eventName"
            name="eventName"
            type="text"
            required
            onChange={handleChange}
            placeholder="Input event name/title"
            className="mb-4 p-2 w-full border-2 border-gray-300  flex-auto rounded-md  bg-white/5"
          />
          <label
            htmlFor="ticketPrice"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ticket Price <span className="text-red-700">*</span>
          </label>
          <input
            id="ticketPrice"
            name="ticketPrice"
            type="number"
            min="1"
            required
            onChange={handleChange}
            placeholder="e.g. 1DOT"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="availableSeats"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Available Seats <span className="text-red-700">*</span>
          </label>
          <input
            id="availableSeats"
            name="availableSeats"
            type="number"
            min="1"
            required
            onChange={handleChange}
            placeholder="e.g. 100"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Location <span className="text-red-700">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Start Time <span className="text-red-700">*</span>
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            End Time <span className="text-red-700">*</span>
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="dateOfEvent"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date of Event <span className="text-red-700">*</span>
          </label>
          <input
            id="dateOfEvent"
            name="dateOfEvent"
            type="date"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category <span className="text-red-700">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            onChange={handleChange}
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
          >
            <option value="">Select category</option>
            <option value="Blockchain Events">Blockchain Events</option>
          </select>

          <label
            htmlFor="shortDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Short Description <span className="text-red-700">*</span>
          </label>
          <textarea
            id="shortDescription"
            name="description"
            required
            onChange={handleChange}
            placeholder="e.g. event targeted at teens in tech/health industry"
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
            rows="3"
          ></textarea>

          <label
            htmlFor="moreInformation"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            More Information <span className="text-red-700">*</span>
          </label>
          <textarea
            id="moreInformation"
            name="moreInformation"
            required
            onChange={handleChange}
            placeholder="e.g. event targeted at teens in tech/health industry"
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
            rows="3"
          ></textarea>

          <label
            htmlFor="banner"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Event Banner <span className="text-red-700">*</span>
          </label>
          <input
            id="banner"
            name="banner"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
          />

          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Banner Preview"
                className="max-w-full h-auto"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                Remove Image
              </button>
            </div>
          )}

          <div className="flex justify-center">
            <motion.button
              whileHover={{
                scale: 1.1,
              }}
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] text-white p-2 px-6 font-semibold shadow-sm hover:shadow-lg ring-1 ring-[#ff80b5] hover:bg-gradient-to-tr hover:from-[#f5167e] hover:to-[#6366f1] transition-all ease-in duration-100 mt-5 rounded-full"
            >
              {isSubmitting ? "Submitting..." : "Create Event"}
            </motion.button>
          </div>
          {uploadStatus && <p>{uploadStatus}</p>}
        </form>
      </div>
    </>
  );
};

export default CreateEventForm;
