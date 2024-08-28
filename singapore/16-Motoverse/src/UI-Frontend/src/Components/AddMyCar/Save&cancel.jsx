/* eslint-disable react/prop-types */
const SaveAndcancel = ({ onNext, onPrevious }) => {
  return (
    <div className="w-full box-border flex flex-col sm:flex-row items-center justify-between py-4 px-6 sm:px-32 text-base text-green-900 border-t-[1px] border-solid border-green-200 ">
      <div
        className="w-full sm:w-auto rounded-3xl box-border flex flex-row items-center justify-center py-2.5 px-4 cursor-pointer border-[1px] border-solid border-darkslategray mb-2 lg:mb-0 md:mb-0"
        onClick={onPrevious}
      >
        <div className="relative text-center">Go Back</div>
      </div>
      <div
        className="w-full sm:w-auto rounded-3xl bg-blue-500 flex flex-row items-center justify-center py-2.5 px-4 text-left text-white cursor-pointer"
        onClick={onNext}
      >
        <div className="relative text-center">Save & Next</div>
      </div>
    </div>
  );
};

export default SaveAndcancel;
