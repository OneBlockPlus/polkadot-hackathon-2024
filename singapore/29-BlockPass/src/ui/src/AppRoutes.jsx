import { Routes, Route } from "react-router-dom";

import Index from "./pages/landingPage/index";
import Event from "./pages/CreateEvent/CreateEvent";
// import Tickets from "./pages/MyTicket/MyTickets";
// import Gallery from "./pages/EventGallery/EventGallery"; To be implemented later or add some later

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="create" element={<Event />} />
      
      {/*<Route path="my-tickets" element={<Tickets />} />
      <Route path="gallery" element={<Gallery />} /> */}
    </Routes>
  );
}
