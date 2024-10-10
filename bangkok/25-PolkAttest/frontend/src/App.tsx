
import "./App.css";


import Home from "./components/pages/Home"; // Página Home
import Schemas from "./components/pages/schemas"; // Página Schemas
import Attestations from "./components/pages/attestations"; // Página Attestations
import CreateSchema from "./components/pages/createSchema";
import Scan from "./components/pages/scan";
import MakeAttestation from "./components/pages/makeattestation"
import UserDashboard from "./components/pages/userdashboard";
import { ChakraProvider, Flex } from "@chakra-ui/react"; // ChakraProvider importado
import theme from "./theme/theme"; // Importa tu theme personalizado

// Añadir react-router-dom para gestionar las rutas
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



function App() {
  

  return (
    <ChakraProvider theme={theme}>
      {" "}
      {/* Envolvemos el contenido en ChakraProvider */}
      <Router>
        {" "}
        {/* Añadimos Router para manejar las rutas */}
        <Flex w="100%" h="100%">
          <Routes>
            {" "}
            {/* Definimos las rutas aquí */}
            <Route path="/" element={<Home />} />{" "}
            {/* Ruta para la página Home */}
            <Route path="/schemas" element={<Schemas />} />{" "}
            {/* Ruta para la página Schemas */}
            <Route path="/attestations" element={<Attestations />} />{" "}
            {/* Ruta para la página Attestations */}
            <Route path="/createSchema" element={<CreateSchema />} />{" "}
            {/* Ruta para la página createSchema */}
            <Route path="/scan" element={<Scan />} />{" "}
            {/* Ruta para la página makeAttestation */}
            <Route path="/makeattestation" element={<MakeAttestation />} />{" "}
            {/* Ruta para la página MakeAttestation */}
            <Route path="/userdashboard" element={<UserDashboard />} />{" "}
            {/* Ruta para la página MakeAttestation */}
          </Routes>
        </Flex>
      </Router>
    </ChakraProvider>
  );
}

export default App;
