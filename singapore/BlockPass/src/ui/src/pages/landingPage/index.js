import Navbar from "./Navbar";
import Hero from "./Hero";
import SearchBar from './SearchBar';
import UpcomingEvents from "./UpcomingEvents";
import Cta from './cta'
import BrandShowcase from './BrandShowcase'
import Footer from './Footer'

import backgroundImage from "../../assets/backgroundImage.png";
// import Features from './Features'
// import Contact from './Contact'

const Index = () => {
  return (
    <div>
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <Navbar />
        <Hero />
      </div>
      <div className="container relative -top-20 mx-auto px-6 py-6">
        <SearchBar />
      </div>
      <UpcomingEvents/>
      <Cta/>
      <BrandShowcase/>
      <Footer/> 
      
        {/* 
        <Features/>
        <Contact/>
         */}
    </div>
  );
};

export default Index;
