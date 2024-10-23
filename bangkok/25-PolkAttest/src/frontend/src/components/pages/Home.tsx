import { Flex, Box } from "@chakra-ui/react";
import MainSection from "../pages/mainsection";
import DataSection from "../pages/datasection";
import HowItWorks from "./howitworks";
import Pallet from "../pages/pallet";
import WhyAtt from "./whyatt";
import Architecture from "./architecture";

function Home() {
  return (
    <Flex flexDirection="column" w="100%" minH="100vh">
      {/* Main Section con el degradado y los títulos */}
      <MainSection />

      {/* Sección de Pallet */}
      <Box>
        <Pallet />
      </Box>

      {/* Sección de WhyAtt */}
      <Box>
        <WhyAtt />
      </Box>

      {/* Sección de Architecture */}
      <Box>
        <Architecture />
      </Box>

      {/* Sección de How it works */}
      <Box>
        <HowItWorks />
      </Box>

      {/* Sección de datos */}
      <Box>
        <DataSection />
      </Box>
    </Flex>
  );
}

export default Home;
