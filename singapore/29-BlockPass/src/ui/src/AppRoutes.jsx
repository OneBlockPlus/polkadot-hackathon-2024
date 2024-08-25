import { Routes, Route } from "react-router-dom";
import Index from "./pages/landingPage/index";
import Create from "./pages/CreateEvent/CreateEvent";
import EventGallery from "./pages/EventGallery/EventGallery";
import EventDetailPage from "./pages/EventGallery/EventDetailPage";
import Tickets from "./pages/MyTicket/MyTickets";
import ProtectedRoute from "./protectedRoute";
import ConnectWalletModal from "./components/ConnectWalletModal";

export default function AppRoutes() {
 
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="create"
        element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        }
      />
      <Route
        path="events"
        element={
          <ProtectedRoute>
            <EventGallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="event/:id"
        element={
          <ProtectedRoute>
            <EventDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="my-tickets"
        element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
