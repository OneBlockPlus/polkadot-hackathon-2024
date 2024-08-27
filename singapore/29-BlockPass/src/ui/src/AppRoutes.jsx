import { Routes, Route } from "react-router-dom";

import Index from "./pages/landingPage/index";
import Create from "./pages/CreateEvent/CreateEvent";
import EventGallery from "./pages/EventGallery/EventGallery";
import EventDetailPage from "./pages/EventGallery/EventDetailPage";
import Tickets from "./pages/MyTicket/MyTickets";

// To be implemented later or add some later

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="create" element={<Create />} />
      <Route path="events" element={<EventGallery />} />
      <Route path="event/:id" element={<EventDetailPage />} />
      <Route path="my-tickets" element={<Tickets />} />
      
    </Routes>
  );
}
