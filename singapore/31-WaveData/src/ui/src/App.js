import Cookies from 'js-cookie'
import * as React from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  BrowserRouter,
} from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import { DBProvider } from './contextx/DBContext';
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import Payment from "./pages/Payment";
import SurveyDetails from "./pages/SurveyDetails";
import Team from "./pages/Team";
import StudyDetails from "./pages/StudyDetails";
import Studies from "./pages/Study";

import ResetAll from './pages/ResetAll';

import './assets/bootstrap.css';
export default function App() {

  return (<>
    <DBProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resetall" element={<ResetAll />} />

          <Route element={<DashboardLayout />}>
            <Route
              path="/studies"
              element={
                <RequireAuth>
                  <Studies />
                </RequireAuth>
              }
            />
            <Route
              path="/studies/:id"
              element={
                <RequireAuth>
                  <StudyDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/studies/:id/survey/:id"
              element={
                <RequireAuth>
                  <SurveyDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/team"
              element={
                <RequireAuth>
                  <Team />
                </RequireAuth>
              }
            />
            <Route
              path="/payment"
              element={
                <RequireAuth>
                  <Payment />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter >

    </DBProvider>

  </>
  );

  function RequireAuth({ children }) {
    let location = useLocation();
    if (Cookies.get("login") ==="true") {
      return children;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


}
