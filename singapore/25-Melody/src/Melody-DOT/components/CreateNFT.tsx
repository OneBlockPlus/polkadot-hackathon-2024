"use client";

import { useState, useRef, type ChangeEvent } from "react";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiOutlineLoading } from "react-icons/ai";
import {
	useAccount,
	useWriteContract,
	useWaitForTransactionReceipt,
	usePublicClient,
} from "wagmi";
import { melodyAbi } from "@/contracts/abi";

const formSchema = z.object({
	musicFile: z.any().refine((file) => file instanceof File, {
		message: "Music file is required",
	}),
});

const contractAddress = process.env
	.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

if (!contractAddress) {
	console.error(
		"NEXT_PUBLIC_CONTRACT_ADDRESS is not set in environment variables",
	);
}

export default function CreateNFT() {
	const [musicPreview, setMusicPreview] = useState<string | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [tokenUri, setTokenUri] = useState<string>("");
	const [isSuccess, setIsSuccess] = useState<boolean>(false);

	const { address } = useAccount();
	const publicClient = usePublicClient();

	const { writeContract, data: hash, isPending, error } = useWriteContract();

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	const uploadFile = async (file: File) => {
		if (!file || !address) return;
		try {
			setUploading(true);
			const data = new FormData();
			data.append("file", file);

			// FIRST UPLOAD
			const uploadRequest = await fetch("/api/upload", {
				method: "POST",
				body: data,
			});
			const res = await uploadRequest.json();
			if (res?.IpfsHash) {
				// SECOND Json
				const secDataParams = {
					image: "",
					mediaUri: `ipfs://${res.IpfsHash}`,
					attributes: [],
					name: file.name,
					description: ".",
				};

				const jsonBlob = new Blob([JSON.stringify(secDataParams, null, 2)], {
					type: "application/json",
				});
				const jsonFormData = new FormData();
				jsonFormData.append("file", jsonBlob, "metadata.json");

				// SECOND UPLOAD
				const secondUploadRequest = await fetch("/api/upload", {
					method: "POST",
					body: jsonFormData,
				});
				const secondRes = await secondUploadRequest.json();
				console.log("Second upload response:", secondRes);

				if (secondRes?.IpfsHash) {
					const newTokenUri = `ipfs://${secondRes.IpfsHash}`;
					setTokenUri(newTokenUri);

					// Simulate the transaction first
					try {
						if (!publicClient)
							throw new Error("Public client is not available");
						const { request } = await publicClient.simulateContract({
							account: address,
							address: contractAddress,
							abi: melodyAbi,
							functionName: "mint",
							args: [address, BigInt(1), newTokenUri],
						});

						// If simulation is successful, proceed with the actual transaction
						writeContract(request);
					} catch (simulationError) {
						console.error("Transaction simulation failed:", simulationError);
						alert(
							"Transaction simulation failed. Please check your wallet and try again.",
						);
					}
				}
			} else {
				console.error("No IpfsHash in response.");
				alert("Error uploading file");
			}
		} catch (e) {
			console.error(e);
			alert("Trouble uploading file");
		} finally {
			setUploading(false);
		}
	};

	const handleMusicChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			form.setValue("musicFile", file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setMusicPreview(
					typeof reader.result === "string" ? reader.result : null,
				);
			};
			reader.readAsDataURL(file);
		}
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		if (values.musicFile instanceof File) {
			uploadFile(values.musicFile);
		} else {
			alert("Please select a valid music file.");
		}
	}

	return (
		<main className="w-full m-auto">
			<div className="w-full m-auto sm:max-w-lg p-10 bg-white rounded-xl z-10 mt-24">
				<h1 className="text-4xl font-bold text-gray-700 mb-10 text-center">
					Create NFT
				</h1>
				<div className="text-left">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="musicFile"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
											Music File
										</FormLabel>
										<FormControl>
											<div className="grid w-full max-w-sm items-center gap-1.5">
												<Input
													onChange={(e) => {
														handleMusicChange(e);
														field.onChange(e.target.files?.[0]);
													}}
													type="file"
													accept=".mp3, .wav"
													className="text-sm font-bold text-gray-500 tracking-wide"
												/>
												{musicPreview && (
													<div className="mt-2">
														<audio controls>
															<source src={musicPreview} type="audio/mpeg" />
															Your browser does not support the audio element.
														</audio>
													</div>
												)}
											</div>
										</FormControl>
										<FormDescription>
											<span className="pl-2 text-sm text-gray-300 text-center">
												File type: MP3 or WAV
											</span>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="text-center">
								<Button
									type="submit"
									disabled={uploading || isPending || isConfirming}
								>
									{(uploading || isPending || isConfirming) && (
										<AiOutlineLoading className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isPending
										? "Minting..."
										: isConfirming
											? "Confirming..."
											: "Create"}
								</Button>
							</div>
						</form>
					</Form>
				</div>
				{isConfirmed && (
					<div className="mt-4 text-center text-green-600">
						NFT minted successfully!
					</div>
				)}
				{error && (
					<div className="mt-4 text-center text-red-600">
						Error: {error.message}
					</div>
				)}
			</div>
		</main>
	);
}
