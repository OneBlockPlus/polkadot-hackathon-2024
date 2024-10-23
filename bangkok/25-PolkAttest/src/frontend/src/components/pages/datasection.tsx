import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";
import { AttestationData, useApi } from "../contexts/ApiContext";

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
  const navigate = useNavigate();
  const { getAll, api } = useApi();
  const [attestations, setAttestations] = useState<AttestationData[]>([]);
  const [hasFetchedAttestations, setHasFetchedAttestations] = useState(false);

  const [issuersAttestations, setIssuersAttestations] = useState<number>(0);

  useEffect(() => {
    const fetchAttestations = async () => {
      if (api) {
        try {
          const attestations = await getAll(
            api.query.attestations.attestations.entries
          );
          setAttestations(attestations);
          setHasFetchedAttestations(true);
          const uniqueIssuers = new Set(
            attestations.map((attestation) => attestation.issuer)
          );
          setIssuersAttestations(uniqueIssuers.size);
        } catch (error) {
          console.error("Error fetching attestations:", error);
        }
      }
    };

    if (!hasFetchedAttestations) {
      fetchAttestations();
    }
  }, [api, hasFetchedAttestations]);

  return (
    <Flex
      w="100%"
      h="100vh"
      bgGradient="linear(to-r, #000000, #7204ff)"
      bgSize="200% 200%"
      animation={`${gradientAnimation} 15s ease infinite`}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      color="white"
      p="2rem"
    >
      <Heading fontSize="3rem" mb="2rem">
        Attestations
      </Heading>

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
            {attestations.length}
          </Heading>
          <Text fontSize="1.5rem">Attestations</Text>
        </Box>

        <Box>
          <Heading fontSize="4rem" mb="1rem">
            {issuersAttestations}
          </Heading>
          <Text fontSize="1.5rem">Unique Attesters</Text>
        </Box>
      </Flex>

      <Flex
        justifyContent="center"
        alignItems="center"
        gap="2rem"
        flexWrap="wrap"
      >
        <Button
          w={60}
          bg="pink.500"
          color="white"
          size="lg"
          _hover={{ bg: "brand.secondary" }}
          onClick={() => navigate("/create-schema")}
        >
          Create New Schema
        </Button>

        <Button
          w={60}
          bg="pink.500"
          color="white"
          size="lg"
          _hover={{ bg: "brand.secondary" }}
          onClick={() => navigate("/attest")}
        >
          Make Attestation
        </Button>
      </Flex>
    </Flex>
  );
}

export default DataSection;
