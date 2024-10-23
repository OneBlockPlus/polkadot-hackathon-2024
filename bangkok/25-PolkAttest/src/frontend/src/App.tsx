import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import theme from "./theme/theme";
import Layout from "./components/templates/Layout";

import Home from "./components/pages/Home";
import SelectSchemaToAttest from "./components/pages/SelectSchemaToAttest";
import CreateSchema from "./components/pages/CreateSchema";
import Scan from "./components/pages/Scan";
import Attest from "./components/pages/Attest";
import UserDashboard from "./components/pages/UserDashboard";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="create-schema" element={<CreateSchema />} />
            <Route path="scan" element={<Scan />} />
            <Route path="attest" element={<SelectSchemaToAttest />} />
            <Route path="attest/:id" element={<Attest />} />
            <Route path="user-dashboard" element={<UserDashboard />} />
          </Route>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
