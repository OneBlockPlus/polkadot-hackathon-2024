import { Link, Flex, Button, Select, Text } from "@chakra-ui/react";
import { useWallet } from "../../contexts/AccountContext";
import { useLocation } from "react-router-dom";

interface Account {
  address: string;
  // Add other properties if needed
}

function Header() {
  const {
    allAccounts,
    selectedAccount,
    handleConnectWallet,
    handleSelectAccount,
    formatAccount,
  } = useWallet();

  const location = useLocation();
  const currentPath = location.pathname;
  const buttonAndSelectWidth = "11rem";

  return (
    <Flex
      as="header"
      w="100%"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg="white"
      color="black"
      position="relative"
    >
      {/* Logo PolkAttest */}
      <Link
        href="/"
        fontSize="2xl"
        fontWeight="bold"
        _hover={{ textDecoration: "none" }}
      >
        PolkAttest
      </Link>

      <Flex gap="2rem" justify="center" flex="1" position="relative">
        {/* Condicionamos el enlace "Home" para que no aparezca en el path "/" */}
        {currentPath !== "/" && (
          <Link
            href="/"
            fontSize="lg"
            fontWeight="medium"
            color="gray.500"
            _hover={{ textDecoration: "none" }}
          >
            Home
          </Link>
        )}

        <Link
          href="/userdashboard"
          fontSize="lg"
          fontWeight="medium"
          color="gray.500"
          _hover={{ textDecoration: "none" }}
        >
          My Dashboard
        </Link>

        <Link
          href="/schemas"
          fontSize="lg"
          fontWeight="medium"
          color="gray.500"
          _hover={{ textDecoration: "none" }}
        >
          Create Schema
        </Link>
        <Link
          href="/attestations"
          fontSize="lg"
          fontWeight="medium"
          color="gray.500"
          _hover={{ textDecoration: "none" }}
        >
          Attest
        </Link>
        <Link
          href="/scan"
          fontSize="lg"
          fontWeight="medium"
          color="gray.500"
          _hover={{ textDecoration: "none" }}
        >
          Scan
        </Link>
      </Flex>

      {/* Estado de la cuenta conectada */}
      <Text
        position="absolute"
        right="230px"
        top="50%"
        transform="translateY(-50%)"
        color="gray.700"
      >
        {allAccounts.length > 0 && !selectedAccount ? (
          <strong>Please select your wallet account.</strong>
        ) : (
          ""
        )}
      </Text>

      {allAccounts.length === 0 ? (
        <Button width={buttonAndSelectWidth} onClick={handleConnectWallet}>
          Connect Wallet
        </Button>
      ) : null}

      {allAccounts.length > 0 ? (
        <Select
          onChange={handleSelectAccount}
          bgColor="gray.300"
          maxWidth="11rem"
          placeholder="Select Account"
          size="lg"
          variant="filled"
          _hover={{
            color: "black",
            boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
            transition: "0.4s",
          }}
        >
          {allAccounts.map((account: Account) => (
            <option
              key={account.address}
              value={account.address}
              style={{
                color: "black",
              }}
            >
              {formatAccount(account.address)}
            </option>
          ))}
        </Select>
      ) : null}
    </Flex>
  );
}

export default Header;
