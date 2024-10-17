import {
  Box,
  Heading,
  Flex,
  VStack,
  Button,
  Text,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom"; // Import the useNavigate hook for navigation
import Header from "../templates/Header/Header"; // Adjust the path as needed
import Footer from "../pages/footer"; // Adjust the path as needed
import { useState } from "react";

function Attestations() {
  const [schemasList, setSchemasList] = useState(["Schema 1", "Schema 2", "Schema 3"]); // Example schemas

  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <Flex
      direction="column"
      w="100%"
      minH="100vh"
      bg="brand.background"
      color="brand.black"
    >
      {/* Header */}
      <Box w="100%">
        <Header />
      </Box>

      {/* Main content */}
      <Flex
        justify="center"
        alignItems="center"
        flex="1"
        direction="column"
        p={5}
      >
        <Box
          w="100%"
          maxW="600px"
          textAlign="center"
          bg="white"
          p={6}
          borderRadius="md"
          boxShadow="lg"
        >
          <Heading as="h2" mb={6} color="brand.black">
            Choose your schema to attest
          </Heading>

          {/* List of schemas */}
          <VStack spacing={4} w="100%">
            {schemasList.map((schema, index) => (
              <Box
                key={index}
                w="100%"
                p={4}
                bg="white"
                borderWidth="1px"
                borderRadius="md"
                boxShadow="sm"
                textAlign="center"
                color="brand.black"
                _hover={{ bg: "brand.grayLight", cursor: "pointer" }}
              >
                {schema}
              </Box>
            ))}
          </VStack>

          {/* Button to create a new schema */}
          <Button
            mt={8}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary" }}
            border="none"
            w={{ base: "100%", md: "300px" }}
            onClick={() => navigate("/createschema")} // Navigate to /createschema on click
          >
            Create a New Schema to Attest
          </Button>
        </Box>
      </Flex>

      {/* Footer */}
      <Box w="100%">
        <Footer />
      </Box>
    </Flex>
  );
}

export default Attestations;
