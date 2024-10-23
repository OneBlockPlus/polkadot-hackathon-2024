// src/app/pools/[poolId]/page.tsx
'use client';

import { useState } from 'react';
import { usePoolDetail } from '@/hooks/usePoolDetail';
import { useWallet } from '@/providers/WalletProvider';
import { useToast } from '@chakra-ui/react';
import {
  Box,
  Container,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Input,
  Alert,
  AlertIcon,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  ArrowUpIcon,
  ArrowDownIcon 
} from '@chakra-ui/icons';
import { formatNumber, hexToAscii } from '@/lib/utils';
import Link from 'next/link';

interface PoolDetailPageProps {
  params: {
    poolId: string;
  };
}

export default function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { poolId } = params;
  const { pools, position, isLoading, operations, refetch } = usePoolDetail();
  const pool = pools?.find(p => p.id === Number(poolId));
  const { account } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeOperation, setActiveOperation] = useState<'mint' | 'burn'>('mint');

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="stretch">
          <Box p={6} bg="white" rounded="xl" shadow="sm">
            <Text>Loading pool details...</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  if (!pool) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          Pool not found
        </Alert>
      </Container>
    );
  }

  const handleOperation = async () => {
    if (!amount || isProcessing) return;

    try {
      setIsProcessing(true);
      const tx = activeOperation === 'mint' 
        ? await operations.mint(amount, poolId)
        : await operations.burn(amount, poolId);

      // Handle transaction
      await tx.signAndSend(account!.address, { signer: account!.signer }, ({ status }) => {
        if (status.isInBlock) {
          toast({
            title: 'Transaction successful',
            description: `${activeOperation === 'mint' ? 'Minted' : 'Burned'} ${amount} ${pool.synthetic_asset.symbol}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          setAmount('');
          onClose();
          refetch.position();
          refetch.pool();
        }
      });
    } catch (error) {
      toast({
        title: 'Transaction failed',
        description: error instanceof Error ? error.message : 'Failed to process transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const utilization = Number(pool.total_debt) / Number(pool.params.debt_ceiling) * 100;

  console.log("params on page", pool);

  return (
    <>
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box bg="white" p={6} rounded="xl" shadow="sm">
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            <VStack align="start" spacing={2}>
              <HStack>
                <Text fontSize="2xl" fontWeight="bold">{hexToAscii(pool.synthetic_asset.name)}</Text>
                <Badge colorScheme={(pool.params.is_minting_allowed || pool.params.isMintingAllowed) ? 'green' : 'red'}>
                  {(pool.params.is_minting_allowed || pool.params.isMintingAllowed) ? 'Minting Enabled' : 'Minting Disabled'}
                </Badge>
              </HStack>
              <Text color="gray.600">Synthetic {hexToAscii(pool.synthetic_asset.symbol)}</Text>
            </VStack>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Stat>
                <StatLabel>Price</StatLabel>
                <StatNumber>${formatNumber(Number(pool.synthetic_asset.price) / 10 ** 8)}</StatNumber>
                <StatHelpText>Current Oracle Price</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Debt</StatLabel>
                <StatNumber>${formatNumber((Number(pool.total_debt) / 10 ** pool.synthetic_asset.decimals) || 0)}</StatNumber>
                <StatHelpText>{(utilization || 0).toFixed(2)}% Utilized</StatHelpText>
              </Stat>
            </Grid>
          </Grid>

          <Divider my={4} />

          <HStack spacing={4} justify="flex-end">
            <Button
              leftIcon={<ArrowUpIcon />}
              colorScheme="blue"
              onClick={() => {
                setActiveOperation('mint');
                onOpen();
              }}
              isDisabled={!pool.params.is_minting_allowed}
            >
              Mint
            </Button>
            <Button
              leftIcon={<ArrowDownIcon />}
              variant="outline"
              colorScheme="blue"
              onClick={() => {
                setActiveOperation('burn');
                onOpen();
              }}
              isDisabled={!pool.params.is_burning_allowed}
            >
              Burn
            </Button>
          </HStack>
        </Box>

        {/* Position Overview */}
        {position && (
          <Box bg="white" p={6} rounded="xl" shadow="sm">
            <Text fontSize="xl" fontWeight="semibold" mb={4}>Your Position</Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
              <Stat>
                <StatLabel>Debt</StatLabel>
                <StatNumber>${formatNumber(Number(position.debt) / 10 ** pool.synthetic_asset.decimals)}</StatNumber>
                <StatHelpText>{hexToAscii(pool.synthetic_asset.name)} Minted</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Collateral Value</StatLabel>
                <StatNumber>${formatNumber(position.total_collateral_value)}</StatNumber>
                <StatHelpText>{position.collateral.length} Asset{position.collateral.length !== 1 ? 's' : ''}</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Health Factor</StatLabel>
                <StatNumber color={Number(position.health_factor) >= 1.1 ? 'green.500' : 'red.500'}>
                  {formatNumber(position.health_factor)}
                </StatNumber>
                <StatHelpText>
                  {Number(position.health_factor) >= 1.1 ? 'Safe' : 'At Risk'}
                </StatHelpText>
              </Stat>
            </Grid>

            <Box mt={6}>
              <Link href={`/pools/${poolId}/collateral`}>
                <Button colorScheme="blue" variant="outline" size="sm">
                  Manage Collateral
                </Button>
              </Link>
            </Box>
          </Box>
        )}

        {/* Collateral Assets */}
        {(position?.collateral?.length || 0) > 0 && (
          <Box bg="white" p={6} rounded="xl" shadow="sm">
            <Text fontSize="xl" fontWeight="semibold" mb={4}>Collateral Assets</Text>
            <VStack spacing={4} align="stretch">
              {position?.collateral.map((col) => (
                <Box
                  key={col.asset.id}
                  p={4}
                  bg="gray.50"
                  rounded="lg"
                >
                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <VStack align="start">
                      <Text fontWeight="medium">{hexToAscii(col.asset.name)}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {formatNumber(Number(col.balance) / 10 ** col.asset.decimals)} tokens
                      </Text>
                    </VStack>
                    <VStack align="center">
                      <Text fontWeight="medium">
                        ${formatNumber(Number(col.balance) * Number(col.asset.price))}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        ${formatNumber(col.asset.price)} per token
                      </Text>
                    </VStack>
                    <VStack align="end">
                      <Text fontWeight="medium">
                        {col.params.base_ltv / 100}% LTV
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {col.params.liquidation_threshold / 100}% Liquidation
                      </Text>
                    </VStack>
                  </Grid>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>

      {/* Operation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {activeOperation === 'mint' ? 'Mint' : 'Burn'} {hexToAscii(pool.synthetic_asset.symbol)}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount to ${activeOperation}`}
              />
              {amount && (
                <Text fontSize="sm" color="gray.600">
                  ≈ ${formatNumber(Number(amount) * Number(pool.synthetic_asset.price) / 10 ** (pool.synthetic_asset.decimals + 8))}
                </Text>
              )}
              <Button
                colorScheme="blue"
                width="full"
                onClick={handleOperation}
                isLoading={isProcessing}
                loadingText="Processing..."
                isDisabled={!amount || Number(amount) <= 0}
              >
                {activeOperation === 'mint' ? 'Mint' : 'Burn'} {hexToAscii(pool.synthetic_asset.symbol)}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
    </>
  );
}