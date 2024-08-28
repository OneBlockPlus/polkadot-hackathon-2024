import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Navbar from "./Components/LandingPage/Navbar.jsx";
import Footer from "./Components/LandingPage/Footer.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import {PolkaProvider} from "./context/PolkaContext.tsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode >
    <BrowserRouter>
      <PolkaProvider>
      <Navbar />
      <App />
      <Toaster richColors closeButton position="top-center" />
      <Footer />
      </PolkaProvider>
    </BrowserRouter>
  </React.StrictMode>
);
