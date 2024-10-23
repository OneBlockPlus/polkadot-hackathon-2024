import {
  Box,
  Heading,
  Flex,
  VStack,
  Button,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SchemaData, useApi } from "../contexts/ApiContext";
import { useWallet } from "../contexts/AccountContext";
import { decodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";
import SearchById, { SearchType } from "./SearchById";

function SelectSchemaToAttest() {
  const [schemasList, setSchemasList] = useState<SchemaData[]>([]);
  const [hasFetchedSchemas, setHasFetchedSchemas] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { getAllByIssuer, api } = useApi();
  const { selectedAccount } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    setHasFetchedSchemas(false);
    setIsLoading(true);
  }, [selectedAccount]);

  useEffect(() => {
    const fetchSchemas = async () => {
      if (api && selectedAccount) {
        try {
          const hexAccount = u8aToHex(decodeAddress(selectedAccount));
          const schemas = await getAllByIssuer(
            api.query.attestations.schemas.entries,
            hexAccount
          );
          setSchemasList(schemas);
        } catch (error) {
          console.error("Error fetching schemas:", error);
        } finally {
          setHasFetchedSchemas(true);
          setIsLoading(false);
        }
      }
    };

    if (!hasFetchedSchemas) {
      fetchSchemas();
    }
  }, [api, getAllByIssuer, hasFetchedSchemas, selectedAccount]);

  return (
    <Flex
      direction="column"
      w="100%"
      minH="100vh"
      bg="brand.background"
      color="brand.black"
    >
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

          {api && isLoading ? (
            <Spinner size="xl" color="pink.500" />
          ) : (
            <VStack spacing={4} w="100%">
              {api && schemasList?.length > 0 ? (
                schemasList?.map((schema: SchemaData) => (
                  <Box
                    key={schema.id}
                    w="100%"
                    p={4}
                    bg="white"
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="sm"
                    textAlign="center"
                    color="brand.black"
                    _hover={{ bg: "brand.grayLight", cursor: "pointer" }}
                    onClick={() => navigate(`/attest/${schema.id}`)}
                  >
                    <Text fontWeight="bold">{schema.name}</Text>
                  </Box>
                ))
              ) : (
                <Text>No schemas found.</Text>
              )}
            </VStack>
          )}
          <Text mb={2} fontWeight="bold" color="gray.700" marginTop={12}>
            Search for an existing Schema to Attest
          </Text>
          <SearchById searchType={SearchType.SCHEMA} />
          <Button
            mt={8}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary" }}
            border="none"
            w={"100%"}
            onClick={() => navigate("/create-schema")}
          >
            Create a New Schema to Attest
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
}

export default SelectSchemaToAttest;
