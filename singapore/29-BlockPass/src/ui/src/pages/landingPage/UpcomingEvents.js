import React, { useState } from "react";
import { events } from "../../data";
import { motion } from "framer-motion";


const UpcomingEvents = () => {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filters, setFilters] = useState({
    weekdays: "",
    eventType: "",
    category: "",
  });
  const [showLoadMore, setShowLoadMore] = useState(true);

  const handleFilter = (filterType, value) => {
    const updatedFilters = { ...filters, [filterType]: value };
    setFilters(updatedFilters);
    if (value === "All") {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }

    let updatedEvents = events;
    if (value && value !== "All") {
      if (filterType === "weekdays") {
        updatedEvents = updatedEvents.filter(
          (event) => event.weekday === value
        );
      } else if (filterType === "eventType") {
        updatedEvents = updatedEvents.filter(
          (event) => event.eventType === value
        );
      } else if (filterType === "category") {
        updatedEvents = updatedEvents.filter(
          (event) => event.category === value
        );
      }
    }

    setFilteredEvents(updatedEvents);
  };

  const uniqueCategories = [...new Set(events.map((event) => event.category))];
  const uniqueEventTypes = [...new Set(events.map((event) => event.eventType))];
  const uniqueWeekdays = [...new Set(events.map((event) => event.weekday))];

  const handleLoadMore = async () => {
    // '/api/more-events'
    try {
      const moreEventsResponse = await fetch(); // Replace with your actual API endpoint
      const moreEvents = await moreEventsResponse.json();
      setFilteredEvents((prevEvents) => [...prevEvents, ...moreEvents]);
    } catch (error) {
      console.error("Failed to load more events:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className=" mx-auto lg:mx-[177px] p-6">
      <div className="flex  items-center justify-start mb-[77px] ">
        {" "}
        <h2 className="text-3xl font-bold text-center text-gray-800 ">
          Upcoming Events
        </h2>
        <div className="flex relative font-medium text-xs lg:-right-[403px] -right-[2px] sm:-right-[50px] ">
          <div className="mr-4 text-[#1D275F] bg-[#F2F4FF] px-3 py-2  rounded-full transition-colors duration-200 ring-2 ring-white ring-opacity-50 hover:ring-opacity-75">
            <label htmlFor="weekdays" className="mr-2">
              Weekdays
            </label>
            <select
              id="weekdays"
              className="border border-[#F2F4FF] bg-[#F2F4FF] rounded-md px-2 py-1"
              onChange={(e) => handleFilter("weekdays", e.target.value)}
            >
              <option value="All"></option>
              {uniqueWeekdays.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="mr-4 lg:block hidden text-[#1D275F] bg-[#F2F4FF] px-4 py-2  rounded-full transition-colors duration-200 ring-2 ring-white ring-opacity-50 hover:ring-opacity-75">
            <label htmlFor="Event Type" className="mr-2">
              Event Type
            </label>
            <select
              id="eventType"
              className="border border-[#F2F4FF] bg-[#F2F4FF] rounded-md px-2 py-1"
              onChange={(e) => handleFilter("eventType", e.target.value)}
            >
              <option value="All"></option>
              {uniqueEventTypes.map((eventType, index) => (
                <option key={index} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>
          </div>
          <div className="mr-4 lg:block hidden text-[#1D275F] bg-[#F2F4FF] px-4 py-2  rounded-full transition-colors duration-200 ring-2 ring-white ring-opacity-50 hover:ring-opacity-75">
            <label htmlFor="Any Category" className="mr-2">
              Any Category
            </label>
            <select
              id="category"
              className="border border-[#F2F4FF] bg-[#F2F4FF] rounded-md px-2 py-1"
              onChange={(e) => handleFilter("category", e.target.value)}
            >
              <option value="All"></option>
              {uniqueCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            key={event.id}
            className="bg-white rounded-2xl lg:w-[343px]  overflow-hidden shadow-lg"
          >
            <img
              className="w-full h-48 object-cover"
              src={event.imageUrl}
              alt={event.title}
            />
            <div className="flex p-4">
              <div className="flex-none mr-5 align-middle items-center ">
                <p className="text-gray-500 font-semibold">
                  {formatDate(event.date).split(" ")[0]}
                </p>
                <p className="text-black text-3xl font-bold">
                  {formatDate(event.date).split(" ")[1]}
                </p>
              </div>
              <div className="flex-grow text-center flex flex-col justify-center">
                <h3 className="text-sm text-start font-bold mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-700 text-start  text-xs">
                  {event.description}
                </p>
                <p className="text-gray-700 text-start mt-2  text-xs">
                  📍{event.location}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {showLoadMore && (
        <div className="text-center mt-8 mb-8">
          <button
            onClick={handleLoadMore}
            className="text-[#3D37F1] font-bold hover:bg-purple-900/25 px-4 py-2  rounded-full transition-colors duration-200 ring-2 ring-[#3D37F1] ring-opacity-50 hover:ring-opacity-75"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
