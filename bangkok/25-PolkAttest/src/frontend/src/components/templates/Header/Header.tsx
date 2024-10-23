import { Link, Flex, Button, Select, Text, Image } from "@chakra-ui/react";
import { useWallet } from "../../contexts/AccountContext";
import { useLocation } from "react-router-dom";
import icon from "../../../assets/images/polkattestlogo.png";

interface Account {
  address: string;
}

function Header() {
  const {
    allAccounts,
    selectedAccount,
    isWalletConnected,
    handleConnectWallet,
    handleSelectAccount,
    formatAccount,
  } = useWallet();

  const location = useLocation();
  const currentPath = location.pathname;
  const buttonAndSelectWidth = "12rem";

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
      <Image src={icon} h={8} mr={2}></Image>
      <Link
        href="/"
        fontSize="2xl"
        fontWeight="bold"
        _hover={{ textDecoration: "none" }}
      >
        Polkattest
      </Link>

      <Flex gap="2rem" justify="center" flex="1" position="relative">
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
          href="/user-dashboard"
          fontSize="lg"
          fontWeight="medium"
          color="gray.500"
          _hover={{ textDecoration: "none" }}
        >
          My Dashboard
        </Link>

        <Link
          href="/create-schema"
          fontSize="lg"
          fontWeight="medium"
          color="gray.500"
          _hover={{ textDecoration: "none" }}
        >
          Create Schema
        </Link>

        <Link
          href="/attest"
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

      <Text
        position="absolute"
        right="230px"
        top="50%"
        transform="translateY(-50%)"
        color="gray.700"
      >
        {isWalletConnected && !selectedAccount && allAccounts.length > 0 ? (
          <strong>Please select your account.</strong>
        ) : null}
      </Text>

      {isWalletConnected && allAccounts.length ? (
        <Select
          onChange={handleSelectAccount}
          bgColor="gray.300"
          maxWidth={buttonAndSelectWidth}
          placeholder={
            allAccounts.length > 0 ? "Select Account" : "No accounts"
          }
          size="lg"
          variant="filled"
          value={selectedAccount || ""}
          isDisabled={allAccounts.length === 0}
          _hover={{
            boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
            transition: "0.4s",
            backgroundColor: "brand.secondary",
            color: "white",
          }}
        >
          {allAccounts.length > 0 &&
            allAccounts.map((account: Account, index: number) => (
              <option
                key={index}
                value={account.address}
                style={{
                  color: "black",
                }}
              >
                {formatAccount(account.address)}
              </option>
            ))}
        </Select>
      ) : (
        <Button
          _hover={{ backgroundColor: "brand.primary", color: "white" }}
          width={buttonAndSelectWidth}
          onClick={handleConnectWallet}
        >
          Connect Wallet
        </Button>
      )}
    </Flex>
  );
}

export default Header;
