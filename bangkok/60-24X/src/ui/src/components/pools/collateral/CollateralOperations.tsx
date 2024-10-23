// src/components/collateral/CollateralOperation.tsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { UserCollateralData } from '@/types/pool';
import { formatNumber } from '@/lib/utils';

interface CollateralOperationProps {
  collateral: UserCollateralData;
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (asset_id: string, amount: string) => Promise<any>;
  onWithdraw: (asset_id: string, amount: string) => Promise<any>;
}

export const CollateralOperation = ({
  collateral,
  isOpen,
  onClose,
  onDeposit,
  onWithdraw,
}: CollateralOperationProps) => {
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'deposit' | 'withdraw'>('deposit');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const handleOperation = async () => {
    try {
      setIsProcessing(true);
      const tx = operation === 'deposit' 
        ? await onDeposit(collateral.asset.id, amount)
        : await onWithdraw(collateral.asset.id, amount);

      toast({
        title: 'Transaction submitted',
        description: `${operation === 'deposit' ? 'Deposited' : 'Withdrawn'} ${amount} ${collateral.asset.symbol}`,
        status: 'success',
        duration: 5000,
      });

      onClose();
      setAmount('');
    } catch (error) {
      toast({
        title: 'Transaction failed',
        description: error instanceof Error ? error.message : 'Operation failed',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage {collateral.asset.symbol}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <HStack width="full">
              <Button
                flex={1}
                colorScheme={operation === 'deposit' ? 'blue' : 'gray'}
                onClick={() => setOperation('deposit')}
              >
                Deposit
              </Button>
              <Button
                flex={1}
                colorScheme={operation === 'withdraw' ? 'blue' : 'gray'}
                onClick={() => setOperation('withdraw')}
              >
                Withdraw
              </Button>
            </HStack>

            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${collateral.asset.symbol} amount`}
            />

            {amount && (
              <Text fontSize="sm" color="gray.600">
                ≈ ${formatNumber(Number(amount) * Number(collateral.asset.price))}
              </Text>
            )}

            <Alert status="info" rounded="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">
                  Max LTV: {collateral.params.base_ltv / 100}%
                </Text>
                <Text fontSize="sm">
                  Liquidation at {collateral.params.liquidation_threshold / 100}%
                </Text>
              </VStack>
            </Alert>

            <Button
              width="full"
              colorScheme="blue"
              onClick={handleOperation}
              isLoading={isProcessing}
              loadingText="Processing..."
              isDisabled={!amount || Number(amount) <= 0}
            >
              {operation === 'deposit' ? 'Deposit' : 'Withdraw'} {collateral.asset.symbol}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};