// src/app/pools/[poolId]/collateral/page.tsx
'use client';

import { useCollateralOperations } from '@/hooks/useCollateralOperations';
import { CollateralList } from '@/components/pools/collateral/CollateralList';
import { CollateralOperation } from '@/components/pools/collateral/CollateralOperations';
import { useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import type { UserCollateralData } from '@/types/pool';
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Grid,
  Divider,
  Progress,
  Icon,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { 
  InfoIcon, 
  WarningIcon, 
  CheckCircleIcon,
  ArrowBackIcon 
} from '@chakra-ui/icons';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface CollateralPageProps {
  params: {
    poolId: string;
  };
}

export default function CollateralPage({ params }: CollateralPageProps) {
  const { poolId } = params;
  const { 
    deposit_collateral,
    withdraw_collateral,
    is_processing,
    error
  } = useCollateralOperations(poolId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCollateral, setSelectedCollateral] = useState<UserCollateralData | null>(null);
  const toast = useToast();

  const handleManageCollateral = (collateral: UserCollateralData) => {
    setSelectedCollateral(collateral);
    onOpen();
  };

  const getHealthStatus = () => {
    if (!position) return null;
    const healthFactor = Number(position.health_factor);

    if (healthFactor >= 2) {
      return { color: 'green', status: 'Safe', icon: CheckCircleIcon };
    } else if (healthFactor >= 1.5) {
      return { color: 'yellow', status: 'Moderate', icon: InfoIcon };
    } else {
      return { color: 'red', status: 'At Risk', icon: WarningIcon };
    }
  };

  const handleCollateralOperation = async (
    type: 'deposit' | 'withdraw',
    assetId: string,
    amount: string
  ) => {
    try {
      const operation = type === 'deposit' ? operations.deposit : operations.withdraw;
      const tx = await operation(assetId, amount);

      // Here you would handle the transaction submission and confirmation
      toast({
        title: 'Transaction Submitted',
        description: `${type === 'deposit' ? 'Depositing' : 'Withdrawing'} ${amount} collateral`,
        status: 'info',
        duration: 5000,
      });

      onClose();
      await refetch();
    } catch (err) {
      toast({
        title: 'Transaction Failed',
        description: err instanceof Error ? err.message : 'Failed to process transaction',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Box>
              <Text fontSize="2xl" fontWeight="bold">Collateral Management</Text>
              <Text color="gray.600">Loading position data...</Text>
            </Box>
          </HStack>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
            {[1, 2, 3].map((i) => (
              <Box key={i} p={6} bg="white" rounded="xl" shadow="sm">
                <VStack align="stretch" spacing={4}>
                  <Box height="20px" bg="gray.200" rounded="md" animate="pulse" />
                  <Box height="32px" bg="gray.200" rounded="md" animate="pulse" />
                  <Box height="16px" bg="gray.200" rounded="md" animate="pulse" />
                </VStack>
              </Box>
            ))}
          </Grid>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">Failed to load collateral data</Text>
            <Text>{error.message}</Text>
            <Button size="sm" onClick={refetch}>Retry</Button>
          </VStack>
        </Alert>
      </Container>
    );
  }

  const healthStatus = getHealthStatus();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">Collateral Management</Text>
            <Text color="gray.600">Manage your collateral positions and health factor</Text>
          </VStack>
          <Link href={`/pools/${poolId}`}>
            <Button leftIcon={<ArrowBackIcon />} variant="outline">
              Back to Pool
            </Button>
          </Link>
        </HStack>

        {/* Position Overview */}
        {position && (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
            <Stat bg="white" p={6} rounded="xl" shadow="sm">
              <StatLabel>Total Collateral Value</StatLabel>
              <StatNumber>${formatNumber(position.total_collateral_value)}</StatNumber>
              <StatHelpText>
                {position.collateral_assets.length} Active Position{position.collateral_assets.length !== 1 ? 's' : ''}
              </StatHelpText>
            </Stat>

            <Stat bg="white" p={6} rounded="xl" shadow="sm">
              <StatLabel>Total Debt</StatLabel>
              <StatNumber>${formatNumber(position.debt_amount)}</StatNumber>
              <StatHelpText>Current borrowed amount</StatHelpText>
            </Stat>

            <Stat bg="white" p={6} rounded="xl" shadow="sm">
              <StatLabel>Health Factor</StatLabel>
              <HStack>
                <StatNumber color={`${healthStatus?.color}.500`}>
                  {formatNumber(position.health_factor)}
                </StatNumber>
                <Badge colorScheme={healthStatus?.color}>{healthStatus?.status}</Badge>
              </HStack>
              <StatHelpText display="flex" alignItems="center" gap={1}>
                <Icon as={healthStatus?.icon} />
                {Number(position.health_factor) < 1.5 ? 'At risk of liquidation' : 'Position is healthy'}
              </StatHelpText>
            </Stat>
          </Grid>
        )}

        {/* Active Collateral Positions */}
        {position && position.collateral_assets.length > 0 && (
          <Box>
            <Text fontSize="xl" fontWeight="semibold" mb={4}>Active Collateral</Text>
            <CollateralList 
              collaterals={position.collateral_assets}
              onManage={handleManageCollateral}
            />
          </Box>
        )}

        {/* Available Collateral Options */}
        {available_collaterals.length > 0 && (
          <Box>
            <Text fontSize="xl" fontWeight="semibold" mb={4}>Available Collateral Types</Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              {available_collaterals.map((collateral) => (
                <Box
                  key={collateral.asset.id}
                  p={4}
                  bg="white"
                  rounded="xl"
                  shadow="sm"
                  border="1px"
                  borderColor="gray.200"
                >
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">{collateral.asset.symbol}</Text>
                      <Badge colorScheme={collateral.params.is_enabled ? 'green' : 'gray'}>
                        {collateral.params.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </HStack>
                    
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">
                        Max LTV: {collateral.params.base_ltv / 100}%
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Liquidation Threshold: {collateral.params.liquidation_threshold / 100}%
                      </Text>
                    </VStack>

                    <Button
                      size="sm"
                      colorScheme="blue"
                      isDisabled={!collateral.params.is_enabled}
                      onClick={() => handleManageCollateral(collateral as UserCollateralData)}
                    >
                      Add Collateral
                    </Button>
                  </VStack>
                </Box>
              ))}
            </Grid>
          </Box>
        )}

        {/* Operation Modal */}
        {selectedCollateral && (
          <CollateralOperation
            collateral={selectedCollateral}
            isOpen={isOpen}
            onClose={onClose}
            onDeposit={(assetId, amount) => handleCollateralOperation('deposit', assetId, amount)}
            onWithdraw={(assetId, amount) => handleCollateralOperation('withdraw', assetId, amount)}
          />
        )}

        {/* Health Factor Info */}
        <Alert status="info" variant="subtle" rounded="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium">About Health Factor</Text>
            <Text fontSize="sm">
              Your health factor represents the safety of your position. Keep it above 1.5 to avoid liquidation risks.
              The higher the number, the safer your position.
            </Text>
          </VStack>
        </Alert>
      </VStack>
    </Container>
  );
}