import { Box, Flex, Text } from "@chakra-ui/react";

function Footer() {
  return (
    <Box as="footer" w="100%" bg="gray.900" color="white" py="4rem">
      <Flex
        maxW="1200px"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={["column", "column", "row"]} // Columna en móviles, fila en pantallas grandes
        textAlign="center"
        gap="2rem"
      >
        {/* Columna 1 */}
        <Box flex="1">
          <Text fontSize="lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          </Text>
        </Box>

        {/* Columna 2 */}
        <Box flex="1">
          <Text fontSize="lg">
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </Box>

        {/* Columna 3 */}
        <Box flex="1">
          <Text fontSize="lg">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Footer;
