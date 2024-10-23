// src/components/pools/CollateralManagement.tsx
import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  useDisclosure,
  Alert,
  AlertIcon,
  Tooltip,
  Divider,
  Progress,
} from '@chakra-ui/react';
import { InfoIcon, AddIcon, MinusIcon } from '@chakra-ui/icons';
import { formatNumber } from '@/lib/utils';
import type { CollateralPosition } from '@/types/pool';
import { useCollateralOperations } from '@/hooks/useCollateralOperations';

interface CollateralManagementProps {
  pool_id: string;
  collateral: CollateralPosition[];
  onUpdate: () => void;
}

export function CollateralManagement({ pool_id, collateral, onUpdate }: CollateralManagementProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAsset, setSelectedAsset] = useState<CollateralPosition | null>(null);
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  
  const { 
    deposit_collateral,
    withdraw_collateral,
    is_processing,
    error 
  } = useCollateralOperations(pool_id);

  const handleOperation = async () => {
    if (!selectedAsset || !amount) return;

    try {
      if (operationType === 'deposit') {
        await deposit_collateral(selectedAsset.asset.id, amount);
      } else {
        await withdraw_collateral(selectedAsset.asset.id, amount);
      }
      onClose();
      setAmount('');
      onUpdate();
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const openModal = (asset: CollateralPosition, type: 'deposit' | 'withdraw') => {
    setSelectedAsset(asset);
    setOperationType(type);
    setAmount('');
    onOpen();
  };

  const total_collateral_value = collateral.reduce(
    (sum, col) => sum + (Number(col.balance) * Number(col.asset.price)),
    0
  );

  console.log("collateral", collateral);

  return (
    <Box bg="white" rounded="xl" shadow="sm" p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="semibold">Collateral Assets</Text>
            <Text color="gray.600" fontSize="sm">
              Total Value: ${formatNumber(total_collateral_value)}
            </Text>
          </VStack>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Asset</Th>
                <Th isNumeric>Balance</Th>
                <Th isNumeric>Value</Th>
                <Th isNumeric>LTV</Th>
                <Th isNumeric>Liquidation</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {collateral.map((col) => {
                const value = Number(col.balance) * Number(col.asset.price);
                const value_percentage = (value / total_collateral_value) * 100;
                
                return (
                  <Tr key={col.asset.id}>
                    <Td>
                      <HStack>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{col.asset.symbol}</Text>
                          <Text fontSize="sm" color="gray.600">
                            ${formatNumber(col.asset.price)}
                          </Text>
                        </VStack>
                        <Badge 
                          colorScheme={col.params.is_enabled ? 'green' : 'red'}
                          ml={2}
                        >
                          {col.params.is_enabled ? 'Active' : 'Paused'}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <VStack align="end" spacing={0}>
                        <Text>{formatNumber(col.balance)}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {formatNumber(value_percentage, 1)}% of total
                        </Text>
                      </VStack>
                    </Td>
                    <Td isNumeric>
                      ${formatNumber(value)}
                    </Td>
                    <Td isNumeric>
                      <Tooltip 
                        label="Maximum borrowing capacity against this collateral"
                        placement="top"
                      >
                        <Text>{col.params.base_ltv / 100}%</Text>
                      </Tooltip>
                    </Td>
                    <Td isNumeric>
                      <Tooltip 
                        label={`Liquidation starts at ${col.params.liquidation_threshold / 100}% with ${col.params.liquidation_penalty / 100}% penalty`}
                        placement="top"
                      >
                        <Text>{col.params.liquidation_threshold / 100}%</Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <HStack spacing={2} justify="flex-end">
                        <Button
                          size="sm"
                          leftIcon={<AddIcon />}
                          onClick={() => openModal(col, 'deposit')}
                          isDisabled={!col.params.is_enabled}
                        >
                          Deposit
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<MinusIcon />}
                          variant="outline"
                          onClick={() => openModal(col, 'withdraw')}
                          isDisabled={!col.params.is_enabled || Number(col.balance) === 0}
                        >
                          Withdraw
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        {/* Operation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {operationType === 'deposit' ? 'Deposit' : 'Withdraw'} {selectedAsset?.asset.symbol}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                {selectedAsset && (
                  <>
                    <Box w="full">
                      <Text mb={2} fontSize="sm" color="gray.600">
                        {operationType === 'deposit' ? 'Amount to deposit' : 'Amount to withdraw'}
                      </Text>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                      {amount && (
                        <Text mt={1} fontSize="sm" color="gray.600">
                          ≈ ${formatNumber(Number(amount) * Number(selectedAsset.asset.price))}
                        </Text>
                      )}
                    </Box>

                    <Box w="full" p={4} bg="gray.50" rounded="md">
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.600">Max LTV</Text>
                          <Text fontSize="sm">{selectedAsset.params.base_ltv / 100}%</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.600">Liquidation at</Text>
                          <Text fontSize="sm">{selectedAsset.params.liquidation_threshold / 100}%</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.600">Liquidation Penalty</Text>
                          <Text fontSize="sm">{selectedAsset.params.liquidation_penalty / 100}%</Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {error && (
                      <Alert status="error" rounded="md">
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}

                    <Button
                      colorScheme="blue"
                      width="full"
                      onClick={handleOperation}
                      isLoading={is_processing}
                      loadingText="Processing..."
                      isDisabled={!amount || Number(amount) <= 0}
                    >
                      {operationType === 'deposit' ? 'Deposit' : 'Withdraw'} {selectedAsset.asset.symbol}
                    </Button>
                  </>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}