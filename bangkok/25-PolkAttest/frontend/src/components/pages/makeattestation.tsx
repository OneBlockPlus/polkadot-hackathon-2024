import { Box, Heading, Flex, VStack, Button, Input, Text } from "@chakra-ui/react";
import Header from "../templates/Header/Header";
import Footer from "../pages/footer";
import { useState } from "react";

function MakeAttestation() {
  // Example of schema for demonstration purposes
  const schema = {
    name: "Example Schema",
    fields: [
      { name: "Field 1", type: "String" },
      { name: "Field 2", type: "Number" },
    ],
  };

  const [attestationData, setAttestationData] = useState({});

  const handleInputChange = (fieldName, value) => {
    setAttestationData({
      ...attestationData,
      [fieldName]: value,
    });
  };

  const handleAttestationSubmit = () => {
    console.log("Attestation submitted:", attestationData);
    // Add logic to submit attestation
  };

  return (
    <Flex direction="column" w="100%" minH="100vh" bg="brand.background">
      {/* Header */}
      <Box w="100%">
        <Header />
      </Box>

      {/* Main content */}
      <Flex justify="center" alignItems="center" flex="1" direction="column" p={5}>
        <Box
          w="100%"
          maxW="600px"
          textAlign="center"
          bg="white"
          p={6}
          borderRadius="md"
          boxShadow="lg"
        >
          <Heading as="h2" mb={4} color="brand.black">
            {schema ? `Attest on ${schema.name}` : "No schema selected"}
          </Heading>

          {schema ? (
            <VStack spacing={4}>
              {/* Fields from schema */}
              {schema.fields.map((field, index) => (
                <Input
                  key={index}
                  placeholder={field.name}
                  value={attestationData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  bg="white"
                  borderColor="gray.500"
                  color="gray.700"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "brand.primary" }}
                />
              ))}

              {/* Submit button */}
              <Button
                mt="2rem"
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary" }}
                border="none"
                onClick={handleAttestationSubmit}
              >
                Attest
              </Button>
            </VStack>
          ) : (
            <Text color="gray.600">Please select a schema to make an attestation.</Text>
          )}
        </Box>
      </Flex>

      {/* Footer */}
      <Box w="100%">
        <Footer />
      </Box>
    </Flex>
  );
}

export default MakeAttestation;
