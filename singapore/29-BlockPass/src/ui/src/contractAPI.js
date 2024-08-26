

import { ethers } from "ethers";
import { contractInstance } from "./constants"; // Your smart contract instance

export const fetchEventsFromContract = async (wallet) => {
  try {
    if (!wallet || wallet.type !== "evm") {
      console.log("Wallet is not connected or provider is not available");
      return [];
    }

    // Create ethers provider for EVM-based interaction
    const ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any");
    const contract = contractInstance.connect(ethersProvider.getSigner());

    // Fetch number of events from contract
    const eventCount = await contract.nextEventId();

    const fetchedEvents = [];
    for (let i = 0; i < eventCount; i++) {
      const event = await contract.events(i);
      fetchedEvents.push(event);
    }

    console.log(fetchedEvents)
    return fetchedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const createEvent = async (wallet, eventDetails, ticketName, ticketSymbol) => {
  try {
    if (!wallet || wallet.type !== "evm") {
      console.log("Wallet is not connected or provider is not available");
      return;
    }

    const ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any");
    const contract = contractInstance.connect(ethersProvider.getSigner());

    const tx = await contract.createEvent(eventDetails, ticketName, ticketSymbol);
    await tx.wait();
    
    console.log("Event created successfully!");
  } catch (error) {
    console.error("Error creating event:", error);
  }
};

export const getEventDetails = async (wallet, eventId) => {
  try {
    if (!wallet || wallet.type !== "evm") {
      console.log("Wallet is not connected or provider is not available");
      return null;
    }

    const ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any");
    const contract = contractInstance.connect(ethersProvider.getSigner());

    const eventDetails = await contract.getEventDetails(eventId);
    return eventDetails;
  } catch (error) {
    console.error("Error getting event details:", error);
    return null;
  }
};
