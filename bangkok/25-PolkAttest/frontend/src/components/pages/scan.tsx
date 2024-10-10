import {
    Box,
    Heading,
    Flex,
    Input,
    VStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
  } from "@chakra-ui/react";
  import Header from "../templates/Header/Header"; // Ensure the path is correct
  import Footer from "../pages/footer"; // Ensure the path is correct
  import { useState } from "react";
  
  function Scan() {
    // States for searching
    const [searchAttestation, setSearchAttestation] = useState("");
    const [searchSchema, setSearchSchema] = useState("");
  
    // Sample data for attestations and schemas (replace with actual data)
    const attestations = [
      { id: 1, subject: "Subject 1", issuer: "Issuer 1", timestamp: "2024-09-10" },
      { id: 2, subject: "Subject 2", issuer: "Issuer 2", timestamp: "2024-09-11" },
    ];
  
    const schemas = [
      { id: "Schema 1", description: "Description of schema 1", owner: "Owner 1" },
      { id: "Schema 2", description: "Description of schema 2", owner: "Owner 2" },
    ];
  
    return (
      <Flex direction="column" w="100%" minH="100vh" bg="brand.background">
        {/* Header */}
        <Box w="100%">
          <Header />
        </Box>
  
        {/* Main Content with two columns */}
        <Flex justify="center" flex="1" p={10} gap={10} wrap="wrap">
          {/* Left Column - Attestations */}
          <Box
            w={{ base: "100%", md: "45%" }} // Responsive width
            bg="white"
            p={6}
            borderRadius="md"
            boxShadow="lg"
          >
            <Heading as="h3" mb={4} color="brand.black">
              Attestations
            </Heading>
  
            {/* Search Attestations */}
            <Input
              placeholder="Search by X"
              value={searchAttestation}
              onChange={(e) => setSearchAttestation(e.target.value)}
              mb={4}
              bg="white"
              borderColor="gray.500"
              color="gray.700"
              _placeholder={{ color: "gray.500" }}
              _focus={{ borderColor: "brand.primary" }}
            />
  
            {/* Attestations Table */}
            <Table variant="simple" size="md">
              <Thead bg="pink.500">
                <Tr>
                  <Th color="white" textAlign="center">ID</Th>
                  <Th color="white" textAlign="center">Subject</Th>
                  <Th color="white" textAlign="center">Issuer</Th>
                  <Th color="white" textAlign="center">Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {attestations.map((attestation) => (
                  <Tr key={attestation.id}>
                    <Td textAlign="center">{attestation.id}</Td>
                    <Td textAlign="center">{attestation.subject}</Td>
                    <Td textAlign="center">{attestation.issuer}</Td>
                    <Td textAlign="center">{attestation.timestamp}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
  
          {/* Right Column - Schemas */}
          <Box
            w={{ base: "100%", md: "45%" }} // Responsive width
            bg="white"
            p={6}
            borderRadius="md"
            boxShadow="lg"
          >
            <Heading as="h3" mb={4} color="brand.black">
              Schemas
            </Heading>
  
            {/* Search Schemas */}
            <Input
              placeholder="Search by ID"
              value={searchSchema}
              onChange={(e) => setSearchSchema(e.target.value)}
              mb={4}
              bg="white"
              borderColor="gray.500"
              color="gray.700"
              _placeholder={{ color: "gray.500" }}
              _focus={{ borderColor: "brand.primary" }}
            />
  
            {/* Schemas Table */}
            <Table variant="simple" size="md">
              <Thead bg="pink.500">
                <Tr>
                  <Th color="white" textAlign="center">ID</Th>
                  <Th color="white" textAlign="center">Description</Th>
                  <Th color="white" textAlign="center">Owner</Th>
                </Tr>
              </Thead>
              <Tbody>
                {schemas.map((schema) => (
                  <Tr key={schema.id}>
                    <Td textAlign="center">{schema.id}</Td>
                    <Td textAlign="center">{schema.description}</Td>
                    <Td textAlign="center">{schema.owner}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Flex>
  
        {/* Footer */}
        <Box w="100%">
          <Footer />
        </Box>
      </Flex>
    );
  }
  
  export default Scan;
  