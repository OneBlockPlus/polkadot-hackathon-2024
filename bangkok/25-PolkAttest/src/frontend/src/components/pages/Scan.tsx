import {
  Box,
  Heading,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import SearchById, { SearchType } from "./SearchById";
import { useEffect, useState } from "react";
import { useWallet } from "../contexts/AccountContext";
import { AttestationData, SchemaData, useApi } from "../contexts/ApiContext";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

function Scan() {
  const { formatAccount } = useWallet();

  const [schemas, setSchemas] = useState<SchemaData[]>([]);
  const [hasFetchedSchemas, setHasFetchedSchemas] = useState(false);
  const [attestations, setAttestations] = useState<AttestationData[]>([]);
  const [hasFetchedAttestations, setHasFetchedAttestations] = useState(false);
  const { getAll, api } = useApi();

  useEffect(() => {
    setHasFetchedSchemas(false);
    setHasFetchedAttestations(false);
  }, []);

  useEffect(() => {
    const fetchSchemas = async () => {
      if (api) {
        try {
          const schemas = await getAll(api.query.attestations.schemas.entries);
          setSchemas(schemas);
          setHasFetchedSchemas(true);
        } catch (error) {
          console.error("Error fetching schemas:", error);
        }
      }
    };

    const fetchAttestations = async () => {
      if (api) {
        try {
          const attestations = await getAll(
            api.query.attestations.attestations.entries
          );
          setAttestations(attestations);
          setHasFetchedAttestations(true);
        } catch (error) {
          console.error("Error fetching attestations:", error);
        }
      }
    };

    if (!hasFetchedSchemas) {
      fetchSchemas();
    }
    if (!hasFetchedAttestations) {
      fetchAttestations();
    }
  }, [api, hasFetchedSchemas, hasFetchedAttestations]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const sortByIdDescending = (
    a: { id?: string },
    b: { id?: string }
  ): number => {
    const idA = a.id ? parseInt(a.id, 10) : 0;
    const idB = b.id ? parseInt(b.id, 10) : 0;
    return idB - idA;
  };

  const sortedSchemas = schemas.slice().sort(sortByIdDescending);
  const sortedAttestations = attestations.slice().sort(sortByIdDescending);

  return (
    <Flex direction="column" w="100%" minH="100vh" bg="brand.background">
      <Flex justify="center" flex="1" p={10} gap={10} wrap="wrap">
        <Box
          w={{ base: "100%", md: "90%" }}
          bg="white"
          p={6}
          borderRadius="md"
          boxShadow="lg"
        >
          <Tabs
            variant="soft-rounded"
            colorScheme="pink"
            sx={{
              ".chakra-tabs__tab:focus": { outline: "none" },
              ".chakra-tabs__tab[aria-selected=true]": {
                color: "brand.primary",
              },
            }}
          >
            <TabList>
              <Tab>Schemas</Tab>
              <Tab>Attestations</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Heading as="h3" mb={4} color="brand.black">
                  Schemas
                </Heading>
                <SearchById
                  searchType={SearchType.SCHEMA}
                  onSearchResult={(result) =>
                    result ? setSchemas([result]) : setSchemas(schemas)
                  }
                />
                <Box overflowX="auto">
                  <Table variant="simple" size="md" mt={4} minWidth="600px">
                    <Thead bg="brand.primary">
                      <Tr>
                        <Th color="white" textAlign="center" width="10%">
                          ID
                        </Th>
                        <Th color="white" textAlign="center" width="30%">
                          Name
                        </Th>
                        <Th color="white" textAlign="center" width="30%">
                          Issuer
                        </Th>
                        <Th color="white" textAlign="center" width="20%">
                          Number of Fields
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {api && !hasFetchedSchemas ? (
                        <Tr>
                          <Td colSpan={4} textAlign="center">
                            <Spinner size="xl" color="pink.500" />
                          </Td>
                        </Tr>
                      ) : api && sortedSchemas.length > 0 ? (
                        sortedSchemas.map((schema) => (
                          <Tr key={schema.id}>
                            <Td textAlign="center">{schema.id}</Td>
                            <Td textAlign="center">{schema.name}</Td>
                            <Td textAlign="center" whiteSpace="nowrap">
                              {formatAccount(
                                encodeAddress(decodeAddress(schema.issuer))
                              )}
                              <IconButton
                                aria-label="Copy Issuer Address"
                                icon={<CopyIcon />}
                                size="xs"
                                ml={2}
                                onClick={() =>
                                  copyToClipboard(
                                    encodeAddress(decodeAddress(schema.issuer))
                                  )
                                }
                              />
                            </Td>
                            <Td textAlign="center">{schema.fields.length}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={4} textAlign="center">
                            Here you will find your created schemas. You can use
                            the ID to create attestations based on them.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              <TabPanel>
                <Heading as="h3" mb={4} color="brand.black">
                  Attestations
                </Heading>
                <SearchById
                  searchType={SearchType.ATTESTATION}
                  onSearchResult={(result) =>
                    result
                      ? setAttestations([result])
                      : setAttestations(attestations)
                  }
                />
                <Box overflowX="auto">
                  <Table variant="simple" size="md" mt={4} minWidth="600px">
                    <Thead bg="brand.primary">
                      <Tr>
                        <Th color="white" textAlign="center" width="10%">
                          ID
                        </Th>
                        <Th color="white" textAlign="center" width="20%">
                          Schema ID
                        </Th>
                        <Th color="white" textAlign="center" width="20%">
                          Subject
                        </Th>
                        <Th color="white" textAlign="center" width="30%">
                          Issuer
                        </Th>
                        <Th color="white" textAlign="center" width="20%">
                          Number of Fields
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {api && !hasFetchedAttestations ? (
                        <Tr>
                          <Td colSpan={5} textAlign="center">
                            <Spinner size="xl" color="pink.500" />
                          </Td>
                        </Tr>
                      ) : api && sortedAttestations.length > 0 ? (
                        sortedAttestations.map((attestation) => (
                          <Tr key={attestation.id}>
                            <Td textAlign="center">{attestation.id}</Td>
                            <Td textAlign="center">{attestation.schemaId}</Td>
                            <Td textAlign="center">{attestation.subject}</Td>
                            <Td textAlign="center" whiteSpace="nowrap">
                              {formatAccount(
                                encodeAddress(decodeAddress(attestation.issuer))
                              )}
                              <IconButton
                                aria-label="Copy Issuer Address"
                                icon={<CopyIcon />}
                                size="xs"
                                ml={2}
                                onClick={() =>
                                  copyToClipboard(
                                    encodeAddress(
                                      decodeAddress(attestation.issuer)
                                    )
                                  )
                                }
                              />
                            </Td>
                            <Td textAlign="center">
                              {attestation.data.length}
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={5} textAlign="center">
                            Here you will find your created attestations. You
                            can register new ones and leave a record of your
                            data.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Scan;
