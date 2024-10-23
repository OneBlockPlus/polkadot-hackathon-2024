import { Box, Text, Image, Flex } from "@chakra-ui/react";
import polkadot from "../../assets/images/polkadot.png";

function SecuredByPolkadot() {
  return (
    <Box
      bg="#1A1A1A"
      p={4}
      borderRadius="md"
      display="inline-block"
      border="1px solid black"
    >
      <Flex alignItems="center">
        <Text color="gray.200" fontSize="md" mr={2}>
          Powered by
        </Text>

        <a
          href="https://polkadot.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={polkadot} />
        </a>
      </Flex>
    </Box>
  );
}

export default SecuredByPolkadot;
