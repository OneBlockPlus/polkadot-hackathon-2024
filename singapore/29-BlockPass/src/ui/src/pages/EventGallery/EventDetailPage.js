import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // assuming you're using React Router for routing
import { useConnectWallet } from "@subwallet-connect/react";
import {  fetchEventsFromContract } from "../../contractAPI";


const EventDetailPage = () => {
  const { id } = useParams();
  const [{ wallet },] = useConnectWallet();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (wallet) {
        const fetchedEvents = await fetchEventsFromContract(wallet);
        
        // Find the specific event by ID
        const eventDetails = fetchedEvents.find((event) => event.id === id);

        if (eventDetails) {
          setEvent({
            title: eventDetails.title,
            date: eventDetails.date,
            startTime: eventDetails.startTime,
            endTime: eventDetails.endTime,
            location: eventDetails.location,
            imageUrl: eventDetails.imageUrl,
            description: eventDetails.description,
            category: eventDetails.category,
            moreInformation: eventDetails.moreInformation,
            ticketPrice: eventDetails.ticketPrice,
            maxTickets: eventDetails.maxTickets,
            host: shortenAddress(eventDetails.host), // Set the host
            registered: eventDetails.registered,
          });
        }
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [wallet, id]);
  if (isLoading) {
    return <p className="ml-3">Loading...</p>;
  }

  if (!event) {
    return <p>Event not found</p>;
  }

  const isPastEvent = new Date(event.date) < new Date();

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 relative">
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
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-60 object-cover rounded-lg"
            />
            <div className="flex p-4">
              <div className="flex-none mr-5 align-middle items-center">
                <p className="text-gray-100 font-semibold">
                  {formatDate(event.date).split(" ")[0]}
                </p>
                <p className="text-gray-100 text-3xl font-bold">
                  {formatDate(event.date).split(" ")[1]}
                </p>
              </div>
              <div className="flex-grow text-center flex flex-col justify-center">
                <h3 className="text-2xl text-start font-bold mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-100 mb-2 text-start text-lg">
                  🪩 {event.category}
                </p>
                <p className="text-gray-100 text-start text-xs">
                  {event.description}
                </p>
                <p className="text-gray-200 text-start mt-2 text-lg">
                  📍{event.location}
                </p>
              </div>
            </div>

            <p className="text-md text-gray-300 mt-2">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              <br />
              {event.startTime} - {event.endTime}
            </p>

            <div className="mt-3">
              <h3 className="text-xl text-gray-300 font-semibold">
                Hosted By
              </h3>
              <hr className="my-1 border-gray-600" />
              <p className="mt-1 text-gray-100 text-sm">{event.host}</p>
              <p className="my-4 text-gray-300">
                {event.maxTickets} Tickets Available
              </p>
              <hr className="mt-1 border-gray-600" />
            </div>
            <div className="mt-6">
              <button
                className={`w-full py-3 rounded-lg text-lg font-semibold ${
                  isPastEvent
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-purple-800 hover:bg-purple-900"
                }`}
                disabled={isPastEvent}
              >
                {isPastEvent ? "Past Event" : "Register"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-7">
            <h2 className="text-2xl mt-3 font-bold">About Event</h2>
            <hr className="mt-1 border-gray-600/10" />
            <p className="mt-4 text-gray-700">🎉 {event.description} 🎉</p>
            <p className="mt-4 font-medium text-gray-700">
              {event.moreInformation}
            </p>
            <div className="mt-7 font-medium">
              <ul>
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  📆 Date:{" "}
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </li>
                <br />
                <br />
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  ⏰ Time: {event.startTime} - {event.endTime}
                </li>
                <br />
                <br />
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  📍 Location: {event.location}
                </li>
                <br />
                <br />
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  🎟️ Price: {event.ticketPrice} 
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
