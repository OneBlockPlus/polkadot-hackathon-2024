import { Box, Heading, Flex, VStack, Button, Input } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../templates/Header/Header"; // Ensure the path is correct
import Footer from "../pages/footer"; // Ensure the path is correct
import { useState } from "react";

function Schemas() {
  const [schemaName, setSchemaName] = useState(""); // For capturing the schema name

  // Hook for redirection
  const navigate = useNavigate();

  return (
    <Flex direction="column" w="100%" minH="100vh" bg="brand.background">
      {/* Header */}
      <Box w="100%">
        <Header />
      </Box>

      {/* Main Content */}
      <Flex justify="center" alignItems="center" flex="1" p={5}>
        <Box
          w="100%"
          maxW="600px"
          bg="white"
          p={6}
          borderRadius="md"
          boxShadow="lg"
          textAlign="center"
        >
          {/* Title */}
          <Heading as="h2" mb={6} color="brand.black">
            Search for an existing Schema to Attest
          </Heading>

          {/* Schema Search Form */}
          <VStack spacing={4}>
            <Input
              placeholder="Search By ID"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              w="100%"
              bg="white"
              borderColor="gray.700"
              color="gray.700"
              _placeholder={{ color: "gray.500" }}
              _focus={{ borderColor: "brand.primary" }}
            />
            <Button
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary" }}
              border="none"
              w="100%"
              onClick={() => navigate("/createschema")}
            >
              Create New Schema
            </Button>
          </VStack>
        </Box>
      </Flex>

      {/* Footer */}
      <Box w="100%">
        <Footer />
      </Box>
    </Flex>
  );
}

export default Schemas;
