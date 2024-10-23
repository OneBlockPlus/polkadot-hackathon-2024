"use client";
import { useEffect } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { useDisclosure, VStack, Text, Button } from "@chakra-ui/react";
import { ConnectModal } from "./ConnectModal";

interface ConnectionGuardProps {
	children: React.ReactNode;
}

export const ConnectionGuard = ({ children }: ConnectionGuardProps) => {
	const { account } = useWallet();
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		if (!account) {
			onOpen();
		}
	}, [account, onOpen]);

	if (!account) {
		return (
			<VStack h="100vh" justify="center" spacing={4}>
				<Text fontSize="xl" fontWeight="medium">
					Please connect your wallet to continue
				</Text>
				<Button colorScheme="blue" onClick={onOpen}>
					Connect Wallet
				</Button>
				<ConnectModal isOpen={isOpen} onClose={onClose} />
			</VStack>
		);
	}

	return <>{children}</>;
};
