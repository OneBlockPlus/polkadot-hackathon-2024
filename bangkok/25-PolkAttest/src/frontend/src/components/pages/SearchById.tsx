import {
  Box,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useApi } from "../contexts/ApiContext";
import { SearchIcon } from "@chakra-ui/icons";

enum SearchType {
  SCHEMA = "schema",
  ATTESTATION = "attestation",
}

interface SearchByIdProps {
  searchType: SearchType;
  onSearchResult?: (result: any) => void;
}

function SearchById({ searchType, onSearchResult }: SearchByIdProps) {
  const [itemId, setItemId] = useState("");
  const { getById, api } = useApi();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSearch = async () => {
    if (itemId.trim() === "") {
      setErrorMessage("Please enter a valid ID.");
      setItemId("");
      if (onSearchResult) {
        onSearchResult(null);
      }
      return;
    }
    if (!api) {
      setErrorMessage("API not ready.");
      setItemId("");
      if (onSearchResult) {
        onSearchResult(null);
      }
      return;
    }
    try {
      const query =
        searchType === SearchType.SCHEMA
          ? api.query.attestations.schemas
          : api.query.attestations.attestations;

      const item = await getById(query, Number(itemId));
      if (item) {
        if (onSearchResult) {
          onSearchResult(item);
        }
        if (location.pathname.match("/attest")) {
          navigate(`/attest/${itemId}`);
        }
        setErrorMessage(null);
      } else {
        setErrorMessage(
          `${
            searchType.charAt(0).toUpperCase() + searchType.slice(1)
          } not found.`
        );
        setItemId("");
        if (onSearchResult) {
          onSearchResult(null);
        }
      }
    } catch (error) {
      setErrorMessage("Error fetching data. Please try again.");
      setItemId("");
      console.error(error);
      if (onSearchResult) {
        onSearchResult(null);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <VStack spacing={4}>
      <InputGroup>
        <Input
          placeholder={
            errorMessage
              ? errorMessage
              : `Search By ${
                  searchType.charAt(0).toUpperCase() + searchType.slice(1)
                } ID`
          }
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          onKeyPress={handleKeyPress}
          w="100%"
          bg="transparent"
          color="gray.700"
          _placeholder={{ color: errorMessage ? "red.500" : "gray.500" }}
          _focus={{
            borderColor: "brand.primary",
            boxShadow: "2px 2px 2px 4px brand.primary",
            outline: "none",
          }}
          _focusVisible={{
            outline: "none",
          }}
          borderRadius="md"
          pr="4.5rem"
        />
        <InputRightElement width="4.5rem">
          <Box
            bg="brand.primary"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100%"
            w="100%"
            cursor="pointer"
            onClick={handleSearch}
            _hover={{ bg: "brand.secondary" }}
          >
            <SearchIcon color="white" />
          </Box>
        </InputRightElement>
      </InputGroup>
    </VStack>
  );
}

export default SearchById;
export { SearchType };
