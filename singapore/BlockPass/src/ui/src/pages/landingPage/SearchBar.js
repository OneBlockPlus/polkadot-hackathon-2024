import React from 'react';

const SearchBar = () => {
  return (
    <div className="bg-[#242565]  h-[140px] px-[48px] py-[30px] flex items-center justify-center rounded-3xl shadow-md">
      <div className="grid grid-cols-3 gap-4 items-center w-full text-white">
        <div className="col-span-1 flex flex-col items-start">
          <label htmlFor="event-search" className="text-sm font-semibold">
            Search Event
          </label>
          <input
            type="text"
            name="event-search"
            id="event-search"
            className="mt-1 p-2 block w-full text-sm bg-[#242565] font-bold text-white border-b-2 border-white focus:outline-none focus:border-pink-500"
            placeholder="Konser Jazz"
          />
        </div>
        <div className="col-span-1 flex flex-col items-start ">
          <label htmlFor="place" className="text-sm font-semibold">
            Place
          </label>
          <input
            type="text"
            name="place"
            id="place"
            className="mt-1 p-2 block w-full text-sm bg-[#242565] font-bold text-white border-b-2 border-white focus:outline-none focus:border-pink-500"
            placeholder="Indonesia"
          />
        </div>
        <div className="col-span-1 flex flex-col items-start font-semibold">
          <label htmlFor="time" className="text-sm font-semibold">
            Time
          </label>
          <select
            id="time"
            name="time"
            className="mt-1 block w-full p-2 text-sm bg-[#242565] text-white border-b-2 border-white focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            <option>Any date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
