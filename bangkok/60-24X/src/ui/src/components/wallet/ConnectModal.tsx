"use client";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	VStack,
	Button,
	Text,
	Image,
	Box,
	Alert,
	AlertIcon,
} from "@chakra-ui/react";
import { useWallet } from "@/providers/WalletProvider";
import { useEffect } from "react";

interface ConnectModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const ConnectModal = ({ isOpen, onClose }: ConnectModalProps) => {
	const { connect, isConnecting, error, accounts } = useWallet();

	useEffect(() => {
		if (accounts.length > 0) {
			onClose();
		}
	}, [accounts, onClose]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Connect Wallet</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack spacing={4} align="stretch">
						{error && (
							<Alert status="error" rounded="md">
								<AlertIcon />
								{error.message}
							</Alert>
						)}

						<Button
							onClick={connect}
							isLoading={isConnecting}
							loadingText="Connecting..."
							size="lg"
							colorScheme="blue"
							leftIcon={
								<Image
									src="https://cryptologos.cc/logos/polkadot-new-dot-logo.png" // Add this image to your public folder
									alt="Polkadot.js"
									boxSize="28px"
								/>
							}
							justifyContent="flex-start"
							paddingLeft="14px"
						>
							<VStack align="start" spacing={0}>
								<Text>Polkadot.js</Text>
								<Text fontSize="xs" color="whiteAlpha.800">
									Connect to your Polkadot.js Extension
								</Text>
							</VStack>
						</Button>

						<Box pt={4}>
							<Text fontSize="sm" color="gray.500">
								New to Polkadot?{" "}
								<Button
									variant="link"
									colorScheme="blue"
									onClick={() =>
										window.open(
											"https://support.polkadot.network/support/solutions/articles/65000098878-how-to-create-a-dot-account",
											"_blank"
										)
									}
								>
									Learn how to create a wallet →
								</Button>
							</Text>
						</Box>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
