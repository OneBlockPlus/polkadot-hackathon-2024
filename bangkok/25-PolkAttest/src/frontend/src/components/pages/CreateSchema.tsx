import { useState } from "react";
import {
  Box,
  Heading,
  Flex,
  VStack,
  Button,
  Input,
  Select,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useWallet } from "../contexts/AccountContext";
import { useApi, SchemaField, SchemaData } from "../contexts/ApiContext";

function CreateSchema() {
  const { selectedAccount } = useWallet();
  const { sendTransaction, api, isTransactionLoading } = useApi();

  const [schemaName, setSchemaName] = useState("");
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([
    { name: "", dataType: "", value: "" },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name: boolean; fields: boolean[] }>({
    name: false,
    fields: [false],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInput = (value: string) => /^[a-zA-Z0-9\s]+$/.test(value);

  const validateForm = () => {
    const nameError = !schemaName.trim();
    const fieldsError = schemaFields.map((field) => !field.name.trim());

    setErrors({ name: nameError, fields: fieldsError });
    return !nameError && !fieldsError.includes(true);
  };

  const handleAddField = () => {
    setSchemaFields([...schemaFields, { name: "", dataType: "", value: "" }]);
    setErrors((prev) => ({ ...prev, fields: [...prev.fields, false] }));
  };

  const handleRemoveLastField = () => {
    if (schemaFields.length > 1) {
      setSchemaFields(schemaFields.slice(0, -1));
      setErrors((prev) => ({ ...prev, fields: prev.fields.slice(0, -1) }));
    }
  };

  const handleFieldChange = (index: number, field: string, value: string) => {
    if (value === "" || validateInput(value)) {
      setSchemaFields((prevFields) =>
        prevFields.map((fieldItem, i) =>
          i === index ? { ...fieldItem, [field]: value } : fieldItem
        )
      );
    }
  };

  const handleInsertSchema = async () => {
    if (!api) {
      setErrorMessage("API not ready.");
      return;
    }

    if (!selectedAccount) {
      setErrorMessage("Account not selected or wallet not connected.");
      return;
    }

    if (!validateForm()) return;

    const schemaData: SchemaData = {
      name: schemaName,
      fields: schemaFields,
    };

    setIsSubmitting(true);
    try {
      await sendTransaction(selectedAccount, api.tx.attestations.insertSchema, [
        schemaData,
      ]);
      setSuccessMessage(
        "Transaction is being processed and has been included in a block!"
      );
    } catch (error) {
      console.error("Error inserting schema:", error);
      setErrorMessage(`Failed to insert schema: ${error}`);
    } finally {
      setIsSubmitting(false);
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
              height={30}
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
          <Heading as="h2" mb={6} color="brand.black">
            Create a Schema
          </Heading>
          <FormControl isInvalid={errors.name} isRequired mb={4}>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Schema name"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              borderColor="gray.500"
              bg="white"
              _placeholder={{ color: "gray.500" }}
              _focus={{ borderColor: "brand.primary" }}
              _focusVisible={{ outline: "none" }}
            />
            <FormErrorMessage>Schema name is required.</FormErrorMessage>
            <FormLabel mt="1rem">
              Include fields that are essential for your schema's functionality.
            </FormLabel>
          </FormControl>

          <VStack spacing={4}>
            {schemaFields.map((field, index) => (
              <FormControl
                key={index}
                isInvalid={errors.fields[index]}
                isRequired
              >
                <HStack spacing={3}>
                  <Input
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) =>
                      handleFieldChange(index, "name", e.target.value)
                    }
                    borderColor="gray.500"
                    bg="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "brand.primary" }}
                    _focusVisible={{ outline: "none" }}
                  />
                  <Select
                    w={200}
                    placeholder="Select type"
                    value={field.dataType}
                    onChange={(e) =>
                      handleFieldChange(index, "dataType", e.target.value)
                    }
                    borderColor="gray.500"
                    bg="white"
                    _hover={{ bg: "brand.grayLight" }}
                    _focus={{ borderColor: "brand.primary" }}
                    _focusVisible={{ outline: "none" }}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="address">Address</option>
                    <option value="bytes32">Bytes32</option>
                    <option value="cid">CID</option>
                  </Select>
                </HStack>
                <FormErrorMessage>Field name is required.</FormErrorMessage>
              </FormControl>
            ))}
          </VStack>

          <HStack mt={4} spacing={4} justifyContent={"center"}>
            <Button
              _hover={{ backgroundColor: "brand.primary", color: "white" }}
              _focusVisible={{ boxShadow: "none", outline: "none" }}
              onClick={handleAddField}
            >
              + Add Field
            </Button>
            <Button
              _hover={{ backgroundColor: "brand.primary", color: "white" }}
              _focusVisible={{ boxShadow: "none", outline: "none" }}
              onClick={handleRemoveLastField}
              isDisabled={schemaFields.length <= 1}
            >
              - Remove Last Field
            </Button>
          </HStack>

          <Button
            mt="2rem"
            bg="brand.primary"
            color="white"
            w={{ base: "100%", md: "300px" }}
            _hover={{ bg: "brand.secondary" }}
            border="none"
            onClick={handleInsertSchema}
            isDisabled={isSubmitting || isTransactionLoading}
            leftIcon={
              isSubmitting || isTransactionLoading ? (
                <Spinner size="sm" />
              ) : undefined
            }
          >
            Create Schema
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
}

export default CreateSchema;
