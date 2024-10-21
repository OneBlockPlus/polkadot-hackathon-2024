import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import { keyframes } from "@emotion/react"; // Importamos keyframes para la animación

// Animación de gradiente
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

function DataSection() {
  const navigate = useNavigate(); // Hook para redirigir

  return (
    <Flex
      w="100%"
      h="100vh"
      bgGradient="linear(to-r, #000000, #7204ff)"
      bgSize="200% 200%"
      animation={`${gradientAnimation} 15s ease infinite`} // Añadimos la animación
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      color="white"
      p="2rem"
    >
      {/* Título */}
      <Heading fontSize="3rem" mb="2rem">
        Attestations
      </Heading>

      {/* Sección de estadísticas */}
      <Flex
        w="100%"
        maxW="1200px"
        justifyContent="space-around"
        alignItems="center"
        mb="4rem"
        textAlign="center"
        flexWrap="wrap"
      >
        <Box>
          <Heading fontSize="4rem" mb="1rem">
            10000
          </Heading>
          <Text fontSize="1.5rem">Attestations</Text>
        </Box>

        <Box>
          <Heading fontSize="4rem" mb="1rem">
            2343
          </Heading>
          <Text fontSize="1.5rem">Unique Attestors</Text>
        </Box>
      </Flex>

      {/* Botones */}
      <Flex justifyContent="center" alignItems="center" gap="2rem" flexWrap="wrap">
        {/* Botón Make Attestation */}
        <Button
          bg="pink.500"
          color="white"
          size="lg"
          _hover={{ bg: "pink.600" }}
          onClick={() => navigate("/attestations")} // Redirige a la página Attestation
        >
          Make Attestation
        </Button>

        {/* Botón Create New Schema */}
        <Button
          bg="pink.500"
          color="white"
          size="lg"
          _hover={{ bg: "pink.600" }}
          onClick={() => navigate("/createschema")} // Redirige a la página CreateSchema
        >
          Create New Schema
        </Button>
      </Flex>
    </Flex>
  );
}

export default DataSection;
