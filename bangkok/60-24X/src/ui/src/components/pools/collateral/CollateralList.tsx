// src/components/collateral/CollateralList.tsx
import {
    Box,
    VStack,
    HStack,
    Text,
    Progress,
    Button,
  } from '@chakra-ui/react';
  import { formatNumber } from '@/lib/utils';
  import type { UserCollateralData } from '@/types/chain';
  
  interface CollateralListProps {
    collaterals: UserCollateralData[];
    onManage: (collateral: UserCollateralData) => void;
  }
  
  export const CollateralList = ({ collaterals, onManage }: CollateralListProps) => {
    return (
      <VStack spacing={4} align="stretch">
        {collaterals.map((col) => (
          <Box
            key={col.asset.id}
            p={4}
            bg="white"
            rounded="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <HStack justify="space-between" mb={3}>
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">{col.asset.symbol}</Text>
                <Text fontSize="sm" color="gray.600">
                  Balance: {formatNumber(col.balance)} {col.asset.symbol}
                </Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Text fontWeight="semibold">
                  ${formatNumber(Number(col.balance) * Number(col.asset.price))}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  ${formatNumber(col.asset.price)} per token
                </Text>
              </VStack>
            </HStack>
  
            <Box mb={3}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="gray.600">Utilization</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {(Number(col.balance) / Number(col.params.max_ceiling) * 100).toFixed(1)}%
                </Text>
              </HStack>
              <Progress
                value={Number(col.balance) / Number(col.params.max_ceiling) * 100}
                colorScheme="blue"
                rounded="full"
                size="sm"
              />
            </Box>
  
            <HStack justify="space-between" fontSize="sm">
              <Text color="gray.600">
                LTV: {col.params.base_ltv / 100}%
              </Text>
              <Text color="gray.600">
                Liquidation: {col.params.liquidation_threshold / 100}%
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => onManage(col)}
              >
                Manage
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    );
  };
  