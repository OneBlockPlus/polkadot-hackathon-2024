"use client";

import {
  Box,
  Container,
  Flex,
  HStack,
  Image,
  Link,
  Spacer,
  useColorModeValue,
  Text
} from '@chakra-ui/react';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import NextLink from 'next/link';

export const AppHeader = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      as="header" 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="container.xl" py={4}>
        <Flex align="center">
          <NextLink href="/" passHref>
              <Text fontSize="xl" fontStyle={'italic'} fontWeight="bold">24X</Text>
          </NextLink>

          <HStack spacing={8} mx={8}>
            <NextLink href="/pools" passHref>
              <Text fontSize="sm" fontWeight="medium">Pools</Text>
            </NextLink>
            <NextLink href="/dashboard" passHref>
              <Text fontSize="sm" fontWeight="medium">Dashboard</Text>
            </NextLink>
          </HStack>

          <Spacer />
          <ConnectButton />
        </Flex>
      </Container>
    </Box>
  );
};