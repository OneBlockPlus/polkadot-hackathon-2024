import { Box, Button, Flex, Heading, Text, Image } from "@chakra-ui/react";
import legoImage from "../../assets/images/legoimage.png";

function Pallet() {
  return (
    <Flex direction="column" w="100%" minH="100vh" bg="gray.50">
      <Flex justify="space-evenly" alignItems="center" flex="1" p={10} w="100%">
        <Box w="45%" display="flex" justifyContent="center" alignItems="center">
          <Box textAlign="center">
            <Heading as="h2" mb={6}>
              Attestation Pallet
            </Heading>
            <Text mb={6}>
              The Attestation Pallet is a specialized Substrate pallet designed
              for handling the creation, management, and verification of
              attestations. Alongside other essential pallets (such as
              pallet-balances), this custom pallet brings a unique layer of
              functionality to the blockchain. It enables developers to
              integrate attestations directly into their projects, securely
              bringing off-chain events on-chain. The pallet allows users to
              define schemas, generate attestations, and store them immutably,
              ensuring the integrity and authenticity of data across
              decentralized networks.
            </Text>
            <Flex justifyContent={"space-evenly"}>
              <Button
                w={60}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary" }}
                border="none"
                onClick={() =>
                  window.open(
                    "https://github.com/PsyLabsWeb3/Polkadot-Attestations/tree/main/polkattest-node/pallets/pallet-attestations",
                    "_blank"
                  )
                }
              >
                GitHub
              </Button>
              <Button
                w={60}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary" }}
                border="none"
                onClick={() =>
                  window.open(
                    "https://lucianog2000.github.io/docs-polkattest-node/doc/pallet_attestations/",
                    "_blank"
                  )
                }
              >
                Docs
              </Button>
            </Flex>
          </Box>
        </Box>

        <Box w="45%" display="flex" justifyContent="center" alignItems="center">
          <Image src={legoImage} alt="Attestation Pallet Image" />
        </Box>
      </Flex>
    </Flex>
  );
}

export default Pallet;
