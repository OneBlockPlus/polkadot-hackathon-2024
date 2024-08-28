import React from "react";
import { usePolkaContext } from "../../context/PolkaContext";
import Garage from "./Garage";
import Settings  from "./Settings";
import Verification from "./Verification";
import MenuDashboard from "./Menu";
import Marketplace from "./Marketplace"

const Admc = () => {
  const {selectedTabDashboard} = usePolkaContext();

  const renderTabContent = () => {
    switch (selectedTabDashboard) {
      case 0:
        return <Marketplace/>
      case 1:
        return <Garage />;  
      // case 2:
      //   return  <Verification/>
      // case 3:
      //   return <Settings/>
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-auto min-h-screen bg-[#F3F3F6] overflow-hidden text-center items-start text-[27px] text-black font-text">
      <div className="w-full flex items-start h-auto min-[2000px]:px-xl bg-[#F3F3F6] gap-[31px]">
        <MenuDashboard/>
        {/* py-10 px-m lg:px-xl gap-[31px] */}
        <div className="md:pt-[35px] w-120rem">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Admc;
