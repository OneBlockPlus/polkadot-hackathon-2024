import { ethers } from "ethers";
import { contractInstance } from "./constants"; // Your smart contract instance

export const fetchEventsFromContract = async (wallet) => {
  try {
    if (!wallet || wallet.type !== "evm") {
      console.log("Wallet is not connected or provider is not available");
      return [];
    }

    // Create ethers provider for EVM-based interaction
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );
    const contract = contractInstance.connect(ethersProvider.getSigner());

    // Fetch number of events from contract
    const eventCount = await contract.nextEventId();

    const fetchedEvents = [];
    for (let i = 0; i < eventCount; i++) {
      const event = await contract.events(i);

      const transformedEvent = {
        id: event[0].toString(), 
        title: event[1][0], 
        date: event[1][1], 
        startTime: event[1][2], 
        endTime: event[1][3], 
        location: event[1][4], 
        imageUrl: event[1][5], 
        description: event[1][6], 
        category: event[1][7],  
        moreInformation: event[1][8], 
        ticketPrice: ethers.utils.formatEther(event[1][9]), 
        maxTickets: event[1][10].toNumber(), 
        ticketsSold: event[2].toNumber(), 
        registered: event[3], 
        active: event[4], 
        ticketNFTAddress: event[5], 
        host: event[6], 
      };

      fetchedEvents.push(transformedEvent);
    }
    console.log(fetchedEvents);
    return fetchedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const createEvent = async (
  wallet,
  eventDetails,
  ticketName,
  ticketSymbol
) => {
  try {
    if (!wallet || wallet.type !== "evm") {
      console.log("Wallet is not connected or provider is not available");
      return;
    }

    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );
    const contract = contractInstance.connect(ethersProvider.getSigner());

    const tx = await contract.createEvent(
      eventDetails,
      ticketName,
      ticketSymbol
    );
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

    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );
    const contract = contractInstance.connect(ethersProvider.getSigner());

    const eventDetails = await contract.getEventDetails(eventId);
    return eventDetails;
  } catch (error) {
    console.error("Error getting event details:", error);
    return null;
  }
};
