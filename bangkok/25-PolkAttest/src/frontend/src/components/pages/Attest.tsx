import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
} from "@chakra-ui/react";
import {
  useApi,
  AttestationData,
  SchemaField,
  SchemaData,
} from "../contexts/ApiContext";
import { useWallet } from "../contexts/AccountContext";
import { PinataManager } from "../../utils/pinataManager";

type FormValues = { [key: string]: string | number | boolean };

const pinataManager = new PinataManager(import.meta.env.VITE_PINATA_JWT || "");

function Attest() {
  const { id } = useParams<{ id: string }>();
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [fields, setFields] = useState<FormValues>({ subject: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedFileCIDs, setUploadedFileCIDs] = useState<string[]>([]);

  const { selectedAccount } = useWallet();
  const {
    getById,
    sendTransaction,
    api,
    isQueryLoading,
    isTransactionLoading,
  } = useApi();
  const isInitialized = useRef(false);

  useEffect(() => {
    const fetchSchema = async () => {
      if (!id || !api || isInitialized.current) return;

      try {
        const fetchedSchema = await getById(
          api.query.attestations.schemas,
          Number(id)
        );
        if (fetchedSchema) {
          setSchema(fetchedSchema);
          const initialValues: FormValues = { subject: "" };
          fetchedSchema.fields.forEach((field: SchemaField) => {
            initialValues[field.name] = "";
          });
          setFields(initialValues);
          isInitialized.current = true;
        } else {
          setSchema(null);
        }
      } catch (error) {
        console.error("Error fetching schema:", error);
        setErrorMessage("Failed to fetch schema.");
      }
    };

    fetchSchema();
  }, [id, api, getById]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    fieldName: string
  ) => {
    const { value } = e.target;

    const regex = /^[a-zA-Z0-9 ]*$/;
    if (regex.test(value)) {
      setFields((prevValues) => ({
        ...prevValues,
        [fieldName]: value,
      }));
    }
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    try {
      setUploading(true);

      const cid = await pinataManager.pinFile(file, {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      setFields((prev) => ({ ...prev, [fieldName]: cid }));

      setUploadedFileCIDs((prevCIDs) => [...prevCIDs, cid]);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleInsertAttestation = async () => {
    if (!api) {
      setErrorMessage("API not ready.");
      return;
    }

    if (!selectedAccount) {
      setErrorMessage("Account not selected or wallet not connected.");
      return;
    }

    if (
      Object.values(fields).some((value) => value === "" || value === undefined)
    ) {
      setErrorMessage("All fields are required.");
      return;
    }

    const attestationData: SchemaField[] =
      schema?.fields.map((field) => ({
        name: field.name,
        dataType: field.dataType,
        value: fields[field.name]?.toString() || "",
      })) || [];

    const attestation: AttestationData = {
      id: "",
      schemaId: Number(id),
      subject: fields.subject as string,
      issuer: selectedAccount,
      data: attestationData,
    };

    try {
      await sendTransaction(
        selectedAccount,
        api.tx.attestations.insertAttestation,
        [attestation]
      );
      setSuccessMessage(
        "Transaction is being processed and has been included in a block!"
      );

      setUploadedFileCIDs([]);
    } catch (error) {
      console.error("Error inserting attestation:", error);
      setErrorMessage(`Failed to insert attestation: ${error}`);

      for (const cid of uploadedFileCIDs) {
        try {
          await pinataManager.unpinFile(cid);
          console.log(`File with CID ${cid} unpinned successfully.`);
        } catch (unpinError) {
          console.error(`Error unpinning file with CID ${cid}:`, unpinError);
        }
      }
    }
  };

  return (
    <Flex direction="column" w="100%" minH="100vh" bg="brand.background">
      {(errorMessage || successMessage) && !isTransactionLoading && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          justify="center"
          align="center"
          zIndex="9999"
        >
          <Alert
            status={errorMessage ? "error" : "success"}
            variant="solid"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="fit-content"
            width="400px"
            borderRadius="md"
            boxShadow="lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {errorMessage ? "Error" : "Success"}
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {errorMessage || successMessage}
            </AlertDescription>
            <Button
              mt={4}
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              Close
            </Button>
          </Alert>
        </Flex>
      )}

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
          {isQueryLoading ? (
            <Spinner size="xl" />
          ) : schema ? (
            <>
              <Heading as="h2" mb={6} color="brand.black">
                Attestation for Schema: {schema.name}
              </Heading>
              <Text mb={6} color="brand.gray">
                You are creating an attestation for {schema.name}. Please fill
                in the necessary fields below.
              </Text>

              <form>
                <FormControl mb={4} isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter subject"
                    value={fields.subject as string}
                    onChange={(e) => handleChange(e, "subject")}
                    borderColor="gray.500"
                    bg="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "brand.primary" }}
                    _focusVisible={{ outline: "none" }}
                  />
                </FormControl>

                {schema.fields.map((field: SchemaField) =>
                  field.name && field.dataType ? (
                    <FormControl key={field.name} mb={4} isRequired>
                      <FormLabel>{field.name}</FormLabel>
                      {field.dataType === "string" ? (
                        <Input
                          type="text"
                          placeholder={`Enter ${field.dataType}`}
                          value={fields[field.name] as string}
                          onChange={(e) => handleChange(e, field.name)}
                          borderColor="gray.500"
                          bg="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "brand.primary" }}
                          _focusVisible={{ outline: "none" }}
                        />
                      ) : field.dataType === "number" ? (
                        <Input
                          type="number"
                          placeholder={`Enter ${field.dataType}`}
                          value={fields[field.name] as number}
                          onChange={(e) => handleChange(e, field.name)}
                          borderColor="gray.500"
                          bg="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "brand.primary" }}
                          _focusVisible={{ outline: "none" }}
                        />
                      ) : field.dataType === "boolean" ? (
                        <Select
                          value={fields[field.name] as string}
                          onChange={(e) => handleChange(e, field.name)}
                          placeholder="Select value"
                          borderColor="gray.500"
                          bg="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "brand.primary" }}
                          _focusVisible={{ outline: "none" }}
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </Select>
                      ) : field.dataType === "cid" ? (
                        <>
                          <Input
                            type="text"
                            placeholder="CID will appear here"
                            value={fields[field.name] as string}
                            isReadOnly
                            borderColor="gray.500"
                            bg="white"
                            _placeholder={{ color: "gray.500" }}
                            _focus={{ borderColor: "brand.primary" }}
                            _focusVisible={{ outline: "none" }}
                          />

                          <Button
                            mt={2}
                            w={"120px"}
                            _hover={{
                              backgroundColor: "brand.primary",
                              color: "white",
                            }}
                            onClick={() =>
                              document

                                .getElementById(`${field.dataType}-file-input`)

                                ?.click()
                            }
                            isDisabled={uploading}
                          >
                            {uploading ? <Spinner size="sm" /> : "Upload File"}
                          </Button>

                          <Input
                            id={`${field.dataType}-file-input`}
                            type="file"
                            hidden
                            onChange={(e) => {
                              if (e.target.files?.[0])
                                handleFileUpload(e.target.files[0], field.name);
                            }}
                            borderColor="gray.500"
                            bg="white"
                            _placeholder={{ color: "gray.500" }}
                            _focus={{ borderColor: "brand.primary" }}
                            _focusVisible={{ outline: "none" }}
                          />
                        </>
                      ) : field.dataType === "bytes32" ? (
                        <Input
                          type="text"
                          placeholder={`Enter ${field.dataType} (32-byte string)`}
                          value={fields[field.name] as string}
                          onChange={(e) => handleChange(e, field.name)}
                          borderColor="gray.500"
                          bg="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "brand.primary" }}
                          _focusVisible={{ outline: "none" }}
                        />
                      ) : field.dataType === "address" ? (
                        <Input
                          type="text"
                          placeholder={`Enter ${field.dataType}`}
                          value={fields[field.name] as string}
                          onChange={(e) => handleChange(e, field.name)}
                          borderColor="gray.500"
                          bg="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "brand.primary" }}
                          _focusVisible={{ outline: "none" }}
                        />
                      ) : null}
                    </FormControl>
                  ) : null
                )}
                <Button
                  mt="2rem"
                  bg="brand.primary"
                  color="white"
                  w={{ base: "100%", md: "300px" }}
                  _hover={{ bg: "brand.secondary" }}
                  border="none"
                  onClick={handleInsertAttestation}
                  isDisabled={isTransactionLoading}
                  leftIcon={
                    isTransactionLoading ? <Spinner size="sm" /> : undefined
                  }
                >
                  Submit Attestation
                </Button>
              </form>
            </>
          ) : (
            <Text>Loading schema...</Text>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}

export default Attest;
