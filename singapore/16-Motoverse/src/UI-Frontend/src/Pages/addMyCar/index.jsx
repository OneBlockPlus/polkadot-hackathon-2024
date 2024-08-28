/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import UploadImage from "../../Components/AddMyCar/UploadImages/Upload";
import MintNFTComponent from "../../Components/AddMyCar/Mint";
import AddCarSideBar from "../../Components/AddMyCar/AddCarSideBar";
import { usePolkaContext } from "../../context/PolkaContext";
import CarDetailForm from "../../Components/AddMyCar/CarDetailForm";
import DetailForm from "../../Components/AddMyCar/DetailForm";

const Admc = () => {
  const {selectedTabAddmycar} = usePolkaContext();

  const renderTabContent = () => {
    switch (selectedTabAddmycar) {
      case 0:
        return <CarDetailForm />; 
      case 1:
        return <UploadImage  />;
      case 2:
        return  <DetailForm /> 
      case 3:
        return <MintNFTComponent  />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full relative min-h-screen bg-white-50 overflow-hidden text-center text-[27px] text-black font-text">
      <div className="self-stretch flex flex-col lg:flex-row md:flex-row items-start justify-start py-10 px-m lg:px-xl gap-[31px] text-left text-20xl font-manrope-25px-regular mb-6">
        <AddCarSideBar />
        <div className="flex-1">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Admc;
