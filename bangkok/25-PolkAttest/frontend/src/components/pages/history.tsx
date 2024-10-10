import { Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

function History() {
  return (
    <Flex flexDirection="column" w="100%" h="100vh" bg="#e6e9fc" justifyContent="center" alignItems="center" p="2rem">
      {/* Título de la página */}
      <Heading fontSize="3rem" mb="2rem" color="black">
        Attestations History
      </Heading>

      {/* Tabla */}
      <Box w="80%" bg="white" borderRadius="8px" boxShadow="lg" p="1rem">
        <Table variant="simple" size="md">
          <Thead>
            <Tr bg="pink.500">
              <Th color="white" textAlign="center">ID</Th>
              <Th color="white" textAlign="center">Schema</Th>
              <Th color="white" textAlign="center">Owner Address</Th>
              <Th color="white" textAlign="center">Timestamp</Th>
            </Tr>
          </Thead>
          <Tbody>
            {[...Array(5)].map((_, index) => (
              <Tr key={index}>
                <Td textAlign="center">aDbjks35dns...</Td>
                <Td textAlign="center">#234</Td>
                <Td textAlign="center">aDbjks35dns...</Td>
                <Td textAlign="center">2024-08-21 18:42:05 UTC</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Paginación */}
        <Flex justifyContent="center" alignItems="center" mt="1.5rem">
          <IconButton
            aria-label="Previous page"
            icon={<ChevronLeftIcon />}
            isRound
            variant="ghost"
            sx={{
              color: "#7204FF",  // Aplicamos color morado directamente al icono
              _hover: { bg: "#FF2670", color: "white" },  // Hover con color rosa y texto blanco
            }}
          />
          <Box mx="1rem" color="gray.500">
            Page 1 - 37
          </Box>
          <IconButton
            aria-label="Next page"
            icon={<ChevronRightIcon />}
            isRound
            variant="ghost"
            sx={{
              color: "#7204FF",  // Aplicamos color morado directamente al icono
              _hover: { bg: "#FF2670", color: "white" },  // Hover con color rosa y texto blanco
            }}
          />
        </Flex>
      </Box>
    </Flex>
  );
}

export default History;
