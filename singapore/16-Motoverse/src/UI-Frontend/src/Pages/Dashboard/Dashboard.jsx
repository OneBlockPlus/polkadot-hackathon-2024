import Navbar from "../../Components/LandingPage/Navbar";
import Garage from "./Garage";
import HeroOne from "./HeroOne";
import SideBar from "./SideBar";

const Dashboard = () => {
  return (
   <div>
     <Navbar/>
    <main className="w-full flex items-start h-auto bg-[#F3F3F6]">
      
      <SideBar />

      <section className="w-5/6 md:p-[40px] flex flex-col items-start gap-[40px] box-border font-manrope bg-[#F3F3F6]">
        <HeroOne />
        <Garage />
      </section>
    </main>
   </div>
    
  );
};

export default Dashboard;
