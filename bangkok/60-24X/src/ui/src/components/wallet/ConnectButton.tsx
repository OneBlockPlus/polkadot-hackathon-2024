"use client";

import {
	Button,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Text,
	HStack,
	Avatar,
	Box,
	Icon,
	useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useWallet } from "@/providers/WalletProvider";
import { ConnectModal } from "./ConnectModal";
import { FiLogOut } from "react-icons/fi";

export const ConnectButton = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { account, disconnect } = useWallet();

	if (!account) {
		return (
			<>
				<Button
					onClick={onOpen}
					colorScheme="blue"
					size="md"
					rounded="xl"
				>
					Connect Wallet
				</Button>
				<ConnectModal isOpen={isOpen} onClose={onClose} />
			</>
		);
	}

	return (
		<Menu>
			<MenuButton
				as={Button}
				rightIcon={<ChevronDownIcon />}
				variant="outline"
				rounded="xl"
			>
				<HStack spacing="3">
					<Avatar size="xs" bg="blue.500" />
					<Box>
						<Text fontSize="sm" fontWeight="medium">
							{account.meta.name}
						</Text>
						<Text fontSize="xs" color="gray.500">
							{(account.address).slice(0, 6)}...{(account.address).slice(-4)}
						</Text>
					</Box>
				</HStack>
			</MenuButton>
			<MenuList>
				<MenuItem
					icon={<CopyIcon />}
					onClick={() =>
						navigator.clipboard.writeText(account.address)
					}
				>
					Copy Address
				</MenuItem>
				<MenuItem
					icon={<ExternalLinkIcon />}
					onClick={() =>
						window.open(
							`https://polkadot.js.org/apps/#/accounts/${account.address}`,
							"_blank"
						)
					}
				>
					View on Polkadot.js
				</MenuItem>
				<MenuItem icon={<Icon as={FiLogOut} />} onClick={disconnect}>
					Disconnect
				</MenuItem>
			</MenuList>
		</Menu>
	);
};
