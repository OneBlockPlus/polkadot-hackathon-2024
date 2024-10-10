import { Box, Flex, Heading, keyframes } from "@chakra-ui/react";

// Definir los keyframes de la animación
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function MainSection() {
  return (
    <Flex
      flexDirection="column"
      w="100%"
      h="calc(100vh - 4rem)"  // Ajusta según la altura del Header
      bgGradient="linear(to-r, #7204ff, #FF2670)" // El gradiente inicial
      backgroundSize="200% 200%" // Para permitir el movimiento del gradiente
      animation={`${gradientAnimation} 10s ease infinite`} // Aplicar la animación
      justifyContent="center"
      alignItems="center"
    >
      <Box textAlign="center">
        <Heading fontSize="4rem" color="white">
          PolkAttest Chain
        </Heading>
        <Heading as="h2" fontSize="2rem" color="white" mt="1rem">
          Substrate-based Attestation Blockchain
        </Heading>
      </Box>
    </Flex>
  );
}

export default MainSection;
