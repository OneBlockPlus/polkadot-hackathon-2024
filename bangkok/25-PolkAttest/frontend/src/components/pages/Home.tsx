import { Flex, Box } from "@chakra-ui/react";
import Header from "../templates/Header/Header";
import MainSection from "../pages/mainsection"; // Importación de MainSection
import DataSection from "../pages/datasection"; // Asegúrate de que la ruta sea correcta
import HowItWorks from "./howitworks";
import Footer from "../pages/footer"; // Importación del Footer
import Pallet from "../pages/pallet"

function Home() {
  return (
    <Flex flexDirection="column" w="100%" minH="100vh">
      {/* Header */}
      <Header />

      {/* Main Section con el degradado y los títulos */}
      <MainSection />

      {/* Sección de Pallet */}
      <Box >
        <Pallet />
      </Box>

      {/* Sección de Pallet */}
      <Box >
        <HowItWorks />
      </Box>

      {/* Sección de datos */}
      <Box >
        <DataSection />
      </Box>

      {/* Footer */}
      <Footer />
    </Flex>
  );
}

export default Home;
