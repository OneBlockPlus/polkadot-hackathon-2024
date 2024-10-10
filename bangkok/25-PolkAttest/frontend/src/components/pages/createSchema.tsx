import {
  Box,
  Heading,
  Flex,
  VStack,
  Button,
  Input,
  Select,
  HStack,
  Switch,
  Text,
} from "@chakra-ui/react";

import Header from "../templates/Header/Header"; // Ajusta la ruta según tu estructura
import Footer from "../pages/footer"; // Ajusta la ruta según tu estructura

import { useEffect, useState } from "react";

// POLKADOT API
import { ApiPromise, WsProvider } from "@polkadot/api";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { useWallet } from "../contexts/AccountContext";
import { web3FromAddress } from "@polkadot/extension-dapp";

// Datos de ejemplo para la creación de una attestacion
const attestationData = {
  id: "666",
  schemaId: "651651",
  subject: "exampleAttestation",
  issuer: "BOBxlk4598hf9",
  data: [
    {
      name: "BobExample",
      dataType: "u32",
      value: "50040504"
    },
    {
      name: "BOB String",
      dataType: "STRING",
      value: "Hola BOB"
    }
  ]
};

function CreateSchema() {
  const {selectedAccount} = useWallet();

  const [schemaFields, setSchemaFields] = useState([
    { fieldName: "", fieldType: "", isArray: false },
  ]); // Campos iniciales
  const [resolverAddress, setResolverAddress] = useState(""); // Dirección del resolver contract
  const [isRevocable, setIsRevocable] = useState(false); // Si es revocable

  // Manejador para agregar un nuevo campo al schema
  const handleAddField = () => {
    setSchemaFields([
      ...schemaFields,
      { fieldName: "", fieldType: "", isArray: false },
    ]);
  };

  // Manejador para eliminar el último campo del schema
  const handleRemoveLastField = () => {
    if (schemaFields.length > 1) {
      setSchemaFields(schemaFields.slice(0, -1)); // Elimina el último campo del array
    }
  };

  // Manejador para actualizar los campos del schema
  const handleFieldChange = (index, field, value) => {
    const updatedFields = schemaFields.map((fieldItem, i) =>
      i === index ? { ...fieldItem, [field]: value } : fieldItem
    );
    setSchemaFields(updatedFields);
  };

  // Manejador para crear el schema (simulación)
  const handleCreateSchema = () => {
    const schemaData = {
      fields: schemaFields,
      resolver: resolverAddress,
      revocable: isRevocable,
    };
    console.log("Schema Created:", schemaData);
    // Aquí iría la llamada para insertar el schema usando tu pallet
  };

  const [api, setApi] = useState<ApiPromise | null>(null);

  const setupApi = async () => {
    // POLKADOT ASSETS HUB RPC FOR NON LOCAL DEVELOPMENT UNTIL WE HAVE OUR OWN NODE
  // const wsProvider = new WsProvider(
  //   "wss://polkadot-asset-hub-rpc.polkadot.io"
  // );
    // USE THIS FOR LOCAL DEVELOPMENT WITH THE NODE RUNNING
    const wsProvider = new WsProvider("ws://127.0.0.1:9944");
    const api = await ApiPromise.create({ provider: wsProvider });
    setApi(api);

    // Get the chain & node information information via rpc calls
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
    ]);

    console.log(
      `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
    );
  };

  useEffect(() => {
    setupApi();
  }, []);

//CONNECT TO THE POLKADOT API AND GET THE BLOCK TIMESTAMP & ATTESTATIONS
  useEffect(() => {
    if (api) {
      console.log("PolkAttest is connected");
      console.log(api);

      const getBlock = async () => {
        const block = await api.query.timestamp.now();
        console.log("Block:", block.toPrimitive());
      };

      const getAttestations = async () => {
        const attestations = await api.query.attestations.attestations();
        console.log("Attestations:", attestations.toHuman());
      };

     
      getAttestations();

      getBlock();


    }
  }, [api]);


  //CREATE ATTESTATION
  const handleInsertAttestation = async () =>{


    if (!api){
      console.log("API not ready")
      return;
    }

    if (!selectedAccount){
      console.log("Account not selected")
      return;
    }

    const injector = await web3FromAddress(selectedAccount);

        // Insertamos una nueva attestacion
        await api?.tx.attestations.insertAttestation(
          attestationData
             ).signAndSend(selectedAccount, { signer: injector.signer });

  }

  //GET ATTESTATIONS WITH EXTRINSIC CALL
  const handleGetAttestations = async () => {

    if (!api){
      console.log("API not ready")
      return;
    }
    if (!selectedAccount){
      console.log("Account not selected")
      return;
    }

    const injector = await web3FromAddress(selectedAccount);

    const attestations = await api.tx.attestations.getAttestations().signAndSend(selectedAccount, { signer: injector.signer });
    console.log("Attestations:", attestations.toHuman);

  }

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

      {/* Contenido principal */}
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
          <Heading as="h2" mb={4} color="brand.black">
            Create a Schema
          </Heading>
          <Text mb={6} color="gray.600">
            Include fields that are essential for your schema's functionality.
          </Text>

          <VStack mt="4rem" spacing={4} align="stretch">
            {/* Campos del schema */}
            {schemaFields.map((field, index) => (
              <HStack key={index} spacing={3}>
                <Input
                  placeholder="Field name"
                  value={field.fieldName}
                  onChange={(e) =>
                    handleFieldChange(index, "fieldName", e.target.value)
                  }
                  bg="white"
                  borderColor="gray.500"
                  color="gray.700"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "brand.primary" }}
                />
                <Select
                  placeholder="Select type"
                  value={field.fieldType}
                  onChange={(e) =>
                    handleFieldChange(index, "fieldType", e.target.value)
                  }
                  bg="white" // Fondo claro para la lista desplegable
                  borderColor="gray.500"
                  color="black" // Texto negro
                  _hover={{ bg: "brand.grayLight" }} // Hover con fondo claro
                  _focus={{ borderColor: "brand.primary" }}
                  sx={{
                    option: {
                      bg: "white", // Fondo blanco para las opciones
                      color: "black", // Texto negro para las opciones
                    },
                  }}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="address">Address</option>
                  <option value="bytes32">Bytes32</option>
                </Select>
                <HStack
                  borderWidth="2px"
                  borderColor={field.isArray ? "transparent" : "brand.primary"} // Trazo rosa cuando no está activado
                  bg={field.isArray ? "brand.primary" : "transparent"} // Fondo rosa cuando está activado
                  p={2}
                  borderRadius="full" // Hacemos el borde circular para un look similar a un switch
                  transition="background-color 0.3s ease"
                  _hover={{ bg: !field.isArray && "#FFD4E2" }} // Hover rosa claro cuando no está activado
                >
                  <Text color={field.isArray ? "white" : "brand.primary"}>
                    Array
                  </Text>{" "}
                  {/* Texto cambia a blanco si está activado */}
                  <Switch
                    isChecked={field.isArray}
                    onChange={(e) =>
                      handleFieldChange(index, "isArray", e.target.checked)
                    }
                    colorScheme="pink"
                    sx={{
                      "span.chakra-switch__track": {
                        bg: field.isArray ? "pink.500" : "transparent", // Cambiamos el track
                      },
                      "span.chakra-switch__thumb": {
                        bg: "white", // El círculo del switch en blanco
                        border: field.isArray
                          ? "2px solid brand.secondary"
                          : "2px solid #FF2670", // Trazo rosa cuando está desactivado
                      },
                    }}
                  />
                </HStack>
              </HStack>
            ))}

            {/* Botones para agregar y eliminar campos */}
            <HStack spacing={4} alignSelf="flex-start">
              <Button
                onClick={handleAddField}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary" }}
                border="none"
              >
                + Add field
              </Button>
              <Button
                onClick={handleRemoveLastField}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary" }}
                border="none"
                disabled={schemaFields.length <= 1} // Desactivar si solo queda un campo
              >
                - Last Field
              </Button>
            </HStack>

            {/* Resolver Address */}
            <Box mt="2rem">
              <Text mb={2} fontWeight="bold" color="gray.700">
                Resolver Address
              </Text>
              <Text fontSize="sm" mb={2} color="gray.600">
                Optional contract that runs with each attestation of this type.
                This can be used to verify, restrict, or apply custom logic on
                attestations.
              </Text>
              <Input
                placeholder="ex: 0x0000000000000000000000000000000000000000"
                value={resolverAddress}
                onChange={(e) => setResolverAddress(e.target.value)}
                bg="white"
                borderColor="gray.500"
                color="gray.700"
                _placeholder={{ color: "gray.500" }}
                _focus={{ borderColor: "brand.primary" }}
              />
            </Box>

            {/* Is Revocable */}
            <Box mt="2rem">
              <Text mb={2} fontWeight="bold" color="gray.700">
                Is Revocable
              </Text>
              <Text fontSize="sm" mb={2} color="gray.600">
                Specify if attestations created under this schema can be
                revoked.
              </Text>
              <HStack justify="center" spacing={4}>
                <Button
                  bg={isRevocable ? "brand.secondary" : "gray.200"}
                  color={isRevocable ? "white" : "black"}
                  _hover={isRevocable ? { bg: "brand.primary" } : {}}
                  onClick={() => setIsRevocable(true)}
                >
                  Yes
                </Button>
                <Button
                  bg={!isRevocable ? "brand.secondary" : "gray.200"}
                  color={!isRevocable ? "white" : "black"}
                  _hover={!isRevocable ? { bg: "brand.primary" } : {}}
                  onClick={() => setIsRevocable(false)}
                >
                  No
                </Button>
              </HStack>
            </Box>

            {/* Botón para crear el schema */}
            <Button
              mt="2rem"
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary" }}
              border="none"
              onClick={handleInsertAttestation}
            >
              Create Attestation
            </Button>
             {/* Botón para traer attestaciones mediante extrinsic call */}
             <Button
              mt="2rem"
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary" }}
              border="none"
              onClick={handleGetAttestations}
            >
              Get Attestations
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

export default CreateSchema;
