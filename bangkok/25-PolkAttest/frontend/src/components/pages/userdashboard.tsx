import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import Header from "../templates/Header/Header"; // Asegúrate de que la ruta sea correcta
import Footer from "../pages/footer"; // Asegúrate de que la ruta sea correcta

function UserDashboard() {
  return (
    <Flex direction="column" w="100%" minH="100vh" bg="gray.50">
      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <Flex
        justify="space-evenly" // Distribuye el espacio uniformemente entre las secciones
        alignItems="center" // Alinea verticalmente al centro
        flex="1"
        p={10}
        w="100%"
      >
        {/* Sección "My Schemas" */}
        <Box
          w="45%" // Asegura que ambas secciones tengan el mismo ancho
          bg="white"
          borderRadius="lg"
          p={6}
          boxShadow="md"
          textAlign="center"
        >
          <Heading as="h2" mb={6}>
            My Schemas
          </Heading>
          <Text mb={4}>
            View and manage all your schemas in one place. Create, edit, and verify schemas to be used in your attestations.
          </Text>
          <Button
            bg="brand.primary" // Color rosa
            color="white" // Texto blanco
            _hover={{ bg: "brand.secondary" }} // Hover morado
            border="none"
          >
            Manage Schemas
          </Button>
        </Box>

        {/* Sección "My Attestations" */}
        <Box
          w="45%" // Asegura que ambas secciones tengan el mismo ancho
          bg="white"
          borderRadius="lg"
          p={6}
          boxShadow="md"
          textAlign="center"
        >
          <Heading as="h2" mb={6}>
            My Attestations
          </Heading>
          <Text mb={4}>
            View and manage all your attestations. Create new attestations and verify the authenticity of your data.
          </Text>
          <Button
            bg="brand.primary" // Color rosa
            color="white" // Texto blanco
            _hover={{ bg: "brand.secondary" }} // Hover morado
            border="none"
          >
            Manage Attestations
          </Button>
        </Box>
      </Flex>

      {/* Footer */}
      <Footer />
    </Flex>
  );
}

export default UserDashboard;
