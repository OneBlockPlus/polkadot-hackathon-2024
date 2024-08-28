import { usePolkaContext } from "../../context/PolkaContext";

const Steps = () => {
  const { setSelectedTabSteps } = usePolkaContext();

  const handleTabStepOne = async () => {
    setSelectedTabSteps(0);
  };

  const handleTabStepTwo = async () => {
    setSelectedTabSteps(1);
  };

  const handleTabStepThree = async () => {
    setSelectedTabSteps(2);
  };


  return (
    <div className="w-full lg:w-[400px] rounded-xl bg-[#ecedff] flex flex-col items-start justify-start p-4 box-border gap-[40px]">
      <div className="self-stretch flex flex-col items-start gap-[20px]">
        <h3 className="font-manrope font-bold text-3xl leading-[120% items-start]">
          Steps to Create a Collection
        </h3>
        <p className="font-manrope font-[400]">
          Follow these steps to create a collection
        </p>
      </div>

      <div className="flex flex-col items-start self-stretch">

        <div className="flex items-start justify-center gap-[2px]">
          <div
            className="w-10 h-10 rounded-51xl hover:bg-blue-700 bg-green-200  flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabStepOne}
          >
            <h1 className="relative text-white">1</h1>
          </div>
          <h1 className="text-xl font-medium font-manrope"> Create collection with Polkadot Wallet</h1>
        </div>

        <div className="self-stretch py-1 flex items-start justify-start box-border">
          <div className="self-stretch h-[50px] pl-5 relative box-border border-r-[1px] border-solid border-green-200" />
        </div>

        <div className="flex items-start justify-center gap-[12px]">
          <div
            className="w-10 h-10 rounded-51xl hover:bg-blue-700 bg-green-200  flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabStepTwo}
          >
            <h1 className="relative text-white">2</h1>
          </div>
          <h1 className="text-xl font-medium font-manrope"> Set Metadata</h1>
        </div>

        <div className="self-stretch flex items-start justify-start py-1 box-border">
          <div className="self-stretch h-[50px] pl-5 relative box-border border-r-[1px] border-solid border-green-200" />
        </div>


        <div className="flex items-start justify-center gap-[12px]">
          <div
            className="w-10 h-10 rounded-51xl hover:bg-blue-700 bg-green-200  flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabStepThree}
          >
            <h1 className="relative text-white">3</h1>
          </div>
          <h1 className="text-xl font-medium font-manrope"> Secure Metadata with Crust
            <span className="block pt-1">(optional) more Security</span>
          </h1>
        </div>

      </div>





      {/* <div className="self-stretch flex flex-col items-start justify-start text-base text-white-10 font-text">
        <div className="flex flex-row items-center justify-start gap-[12px]">
          <div
            className="w-10 h-10 rounded-51xl hover:bg-blue-700 bg-green-200  flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabVehicleInfo}
          >
            <div className="relative">1</div>
          </div>
          <div className="flex-1 relative text-green-900">
            Create Collection
          </div>
        </div>
        <div className="self-stretch h-5 flex flex-row items-start justify-start py-1 px-5 box-border">
          <div className="self-stretch w-px relative box-border border-r-[1px] border-solid border-green-200" />
        </div>
        <div className="flex flex-row items-center justify-start gap-[12px]">
          <div
            className="w-10 rounded-51xl bg-green-200 hover:bg-blue-700 h-10 flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabUploadEvidence}
          >
            <div className="relative">2</div>
          </div>
          <div className="flex-1 relative text-green-900"></div>
        </div>
        <div className="w-10 h-5 flex flex-row items-center justify-center py-1 px-0 box-border">
          <div className="self-stretch w-px relative box-border border-r-[1px] border-solid border-green-200" />
        </div>
        <div className="flex flex-row items-center justify-start gap-[12px] text-bg">
          <div
            className="w-10 rounded-51xl bg-green-200 hover:bg-blue-700 h-10 flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabGeneralInfo}
          >
            <div className="relative">3</div>
          </div>
          <div className="flex-1 relative text-green-900">
            General Information
          </div>
        </div>
        <div className="w-10 h-5 flex flex-row items-center justify-center py-1 px-0 box-border">
          <div className="self-stretch w-px relative box-border border-r-[1px] border-solid border-green-200" />
        </div>
        <div className="flex flex-row items-center justify-start gap-[12px]">
          <div
            className="w-10 rounded-51xl bg-green-200 hover:bg-blue-700 h-10 flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabMint}
          >
            <div className="relative">4</div>
          </div>
          <div className="flex-1 relative text-green-900">Mint NFT</div>
        </div>
      </div> */}
    </div>
  );
};

export default Steps;
