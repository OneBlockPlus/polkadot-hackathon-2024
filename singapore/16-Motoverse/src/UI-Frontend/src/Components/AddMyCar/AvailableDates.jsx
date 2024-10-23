import { useState, useEffect } from "react";

const AvailableDates = () => {
  const initialData = JSON.parse(localStorage.getItem("AvailableDates")) || {
    option1: { date: "", startTime: "", endTime: "" },
    option2: { date: "", startTime: "", endTime: "" },
  };

  const [dates, setDates] = useState(initialData);

  useEffect(() => {
    localStorage.setItem("AvailableDates", JSON.stringify(dates));
  }, [dates]);

  const handleChange = (e, option, field) => {
    setDates((prevDates) => ({
      ...prevDates,
      [option]: {
        ...prevDates[option],
        [field]: e.target.value,
      },
    }));
  };

  return (
    <div className="self-stretch flex flex-col items-start justify-start gap-[16px]  text-green-900 py-12">
      <div className="self-stretch flex flex-row items-center justify-between">
        <b className="justify-start items-start">
          Available Dates for Verification
        </b>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start text-left text-base font-text">
        <div className="self-stretch flex lg:flex-row flex-col items-start justify-start gap-[60px]">
          <div className="flex-1 flex flex-col items-start justify-start gap-[16px]">
            <div className="self-stretch h-[52px] flex flex-col items-start justify-start gap-[6px]">
              <div className="flex flex-col items-start justify-start">
                <b className="w-full relative inline-block">Option 1</b>
              </div>
              <div className="self-stretch  pl-1 flex flex-row items-start justify-start gap-[10px] text-grey-500">
                <input
                  className="flex-1 relative inline-block h-10 px-2 bg-slate-100 rounded-xl w-auto text-black"
                  type="text"
                  value={dates.option1.date}
                  onChange={(e) => handleChange(e, "option1", "date")}
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-row items-start justify-start gap-[16px]">
              <div className="flex-1 h-[52px] flex flex-col items-start justify-start gap-[6px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="relative">Start Time</b>
                </div>
                <div className="self-stretch pl-1 flex flex-row items-start justify-start text-grey-500">
                  <input
                    className="flex-1 relative inline-block h-10 bg-slate-100 px-2 rounded-xl text-black"
                    type="text"
                    value={dates.option1.startTime}
                    onChange={(e) => handleChange(e, "option1", "startTime")}
                    placeholder="00:00"
                  />
                </div>
              </div>
              <div className="flex-1 h-[52px] flex flex-col items-start justify-start gap-[6px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="relative">End Time</b>
                </div>
                <div className="self-stretch pl-1 flex flex-row items-start justify-start text-grey-500">
                  <input
                    className="flex-1 relative inline-block h-10 bg-slate-100 px-2 rounded-xl text-black"
                    type="text"
                    value={dates.option1.endTime}
                    onChange={(e) => handleChange(e, "option1", "endTime")}
                    placeholder="00:00"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start justify-start gap-[16px]">
            <div className="self-stretch h-[52px] flex flex-col items-start justify-start gap-[6px]">
              <div className="flex flex-col items-start justify-start">
                <b className="w-full relative inline-block">Option 2</b>
              </div>
              <div className="self-stretch  pl-1 flex flex-row items-start justify-start gap-[10px] text-grey-500">
                <input
                  className="flex-1 relative inline-block h-10 px-2 bg-slate-100 rounded-xl text-black"
                  type="text"
                  value={dates.option2.date}
                  onChange={(e) => handleChange(e, "option2", "date")}
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-row items-start justify-start gap-[16px]">
              <div className="flex-1 h-[52px] flex flex-col items-start justify-start gap-[6px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="relative">Start Time</b>
                </div>
                <div className="self-stretch pl-1 flex flex-row items-start justify-start text-grey-500">
                  <input
                    className="flex-1 relative inline-block h-10 bg-slate-100 px-2 rounded-xl text-black"
                    type="text"
                    value={dates.option2.startTime}
                    onChange={(e) => handleChange(e, "option2", "startTime")}
                    placeholder="00:00"
                  />
                </div>
              </div>
              <div className="flex-1 h-[52px] flex flex-col items-start justify-start gap-[6px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="relative">End Time</b>
                </div>
                <div className="self-stretch pl-1 flex flex-row items-start justify-start text-grey-500">
                  <input
                    className="flex-1 relative inline-block h-10 bg-slate-100 px-2 rounded-xl text-black"
                    type="text"
                    value={dates.option2.endTime}
                    onChange={(e) => handleChange(e, "option2", "endTime")}
                    placeholder="00:00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableDates;
