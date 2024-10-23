import Hero from "./Hero";
import Hero2 from "./Hero2";
import About from "./Tech";
import Products from "./Products";
import HowItWorks from "./HowItWorks";
import Testmonials from "./Testmonials";
import Team from "./Team";
import MtvsDao from "./MtvsDao";

const LandingPage = () => {
  return (
    <div className="w-full max-w-full bg-white-100 flex flex-col min-[2000px]:[&>*]:px-[5vw] ">
      <Hero />
      <Hero2 />
      <About />
      <Products />
      <HowItWorks />
      <MtvsDao />
      <Testmonials />
      <Team />
    </div>
  );
};

export default LandingPage;
