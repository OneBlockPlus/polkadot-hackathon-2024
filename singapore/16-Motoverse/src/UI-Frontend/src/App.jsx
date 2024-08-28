import { Routes, Route } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import Login from "./Components/Login";
import InputField from "./Components/InputField";
import FrameComponent1 from "./Components/FrameComponent1";
import Password from "./Components/Password";
import Dashboard from "./Pages/Dashboard/index";
import HeroOne from "./Pages/Dashboard/HeroOne";
import Humberger from "./Components/Humberger";
import DashUnlocked from "./Pages/Dashboard/DashUnlocked";
import DashProgress from "./Pages/Dashboard/DashProgress";
import LandingPage from "./Components/LandingPage/Page";
import Admc from "./Pages/addMyCar";
import HowItWorks from "./Components/LandingPage/HowItWorks";
import Tech from "./Components/LandingPage/Tech";
import CreateCollection from "./Pages/CreateCollection";
import Steps from "./Pages/CreateCollection/Steps";

function App() {
  return (
    <Theme>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tech" element={<Tech/>} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Password" element={<Password />} />
        <Route path="/InputField" element={<InputField />} />
        <Route path="/FrameComponent1" element={<FrameComponent1 />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/DashProgress" element={<DashProgress />} />
        <Route path="/DashUnlocked" element={<DashUnlocked />} />
        <Route path="/HeroOne" element={<HeroOne />} />
        <Route path="/Humberger" element={<Humberger />} />
        <Route path="/AddMyCar" element={<Admc />} />
        <Route path="/about" element={<HowItWorks/>} />
        <Route path="/CreateCollection" element={<CreateCollection/>}/>
        <Route path="/Steps" element={<Steps/>}/>
      </Routes>
    </Theme>
  );
}

export default App;
