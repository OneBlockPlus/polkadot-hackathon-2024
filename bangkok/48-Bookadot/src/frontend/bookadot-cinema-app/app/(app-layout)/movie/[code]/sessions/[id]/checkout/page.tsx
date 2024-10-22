"use client"

import { AppHeader } from '@/app/components/AppHeader'
import Typography from '@/app/components/Typography'
import { useBookingContext } from '@/app/context/BookingContext'
import { useMovieContext } from '@/app/context/MovieContext'
import { getBookingSignature, saveTicketData } from '@/app/services/ticketService'
import { useWriteBookadotPropertyBook } from '@/app/utils/bookadot-sdk'
import { publicClient } from '@/app/utils/wagmiConfig'
import { useMutation } from '@tanstack/react-query'
import { Accordion, Button, Label, Radio } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React, { Children, useState } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import { useAppKit } from '@reown/appkit/react'
import dayjs from 'dayjs'

function Checkout() {
    const { detailMovieData: movieData } = useMovieContext()
    const { selectedSeats, sessionData, setSelectedSeats, setSessionData } = useBookingContext()
    const router = useRouter()
    const { address, isConnected } = useAccount()
    const { open: openWalletModal } = useAppKit()
    const { writeContractAsync } = useWriteBookadotPropertyBook()

    const ticketData = {
        Cinema: `${sessionData?.cinema_name || sessionData?.cinema?.cinema_name || "Cinema"}\n${sessionData?.cinema_address || sessionData?.cinema?.cinema_address || "Address"}`,
        Date: sessionData?.date ? `${dayjs(sessionData?.date).format('D MMMM YYYY')}, ${sessionData?.time}` : "",
        Hall: sessionData?.cinema_hall || sessionData?.cinema?.cinema_hall || "Hall",
        Seats: selectedSeats.join(', '),
    }
    const SUPPORTED_CRYPTO = [
        {
            symbol: "GLMR",
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            price: 26.15
        },
        // {
        //     symbol: "USDT",
        //     address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        //     price: 5.23
        // }
    ]
    const [selectedCrypto, setSelectedCrypto] = useState(SUPPORTED_CRYPTO[0])

    const { isPending, mutateAsync } = useMutation({
        mutationKey: ["checkout"],
        mutationFn: async (data: any) => {
            if (!isConnected) {
                openWalletModal()
                return
            }
            const ticketData = await getBookingSignature(data)

            const txHash = await writeContractAsync({
                address: ticketData.ticket.session.contract.property_address,
                args: [
                    ticketData.param,
                    ticketData.signature
                ],
                value: ticketData.ticket.amount
            })
            toast.info("Submitted transaction. Waiting for confirmation...")
            await publicClient.waitForTransactionReceipt({
                hash: txHash
            })
            ticketData.ticket.txHash = txHash
            return ticketData.ticket
        },
        onError: (error) => {
            console.log({ error });
            // @ts-ignore
            toast.error("Failed to book ticket. " + (error.shortMessage || ""))
            return false
        },
        onSettled: async (ticketData) => {
            if (!ticketData) return
            ticketData.status = 'paid'
            await saveTicketData(ticketData)
            toast.success("Payment successful.\nThanks for using Bookadot!")
            setSelectedSeats([])
            setSessionData(undefined)
            router.push(`/my-ticket/${ticketData.id}`)
        },
    });

    const onPay = async () => {
        mutateAsync({
            "token": selectedCrypto.address,
            "seats": selectedSeats.join(","),
            "owner": address,
            session_id: sessionData?.id
        })
    }

    return (
        <>
            <AppHeader
                config={{
                    title: "Pay for your ticket",
                }}
            />
            <div className='bg-foreground-color p-4'>
                <Typography component='h4' className="font-bold">{movieData?.title}</Typography>
                <table className="mt-4 border-spacing-y-3 border-separate">
                    <tbody>
                        {
                            Children.toArray(Object.entries(ticketData).map(([key, value]) => (
                                <tr>
                                    <td className="flex capitalize text-sm text-text-secondary-color">{key}</td>
                                    <td className="pl-5">{value}</td>
                                </tr>
                            )))
                        }
                        <hr />
                        <tr>
                            <td className="flex capitalize text-sm text-text-secondary-color">Price per ticket</td>
                            <td className="pl-5">{selectedCrypto.price} ${selectedCrypto.symbol}</td>
                        </tr>
                        <tr>
                            <td className="flex capitalize text-sm text-text-secondary-color">Total</td>
                            <td className="pl-5">{selectedSeats.length * selectedCrypto.price} ${selectedCrypto.symbol}</td>
                        </tr>
                    </tbody>
                </table>

                <hr className='my-6' />

                <Typography component='h5' className="font-bold mb-3">Select payment method</Typography>
                <Accordion>
                    <Accordion.Panel>
                        <Accordion.Title>Crypto</Accordion.Title>
                        <Accordion.Content>
                            <div className="flex max-w-md flex-col gap-4">
                                {
                                    Children.toArray(SUPPORTED_CRYPTO.map((c, i) => (
                                        <div className="flex items-center gap-2">
                                            <Radio onClick={() => setSelectedCrypto(c)} id={c.symbol} name="crypto" value={c.symbol} defaultChecked={i == 0} />
                                            <Label htmlFor={c.symbol}>{c.symbol}</Label>
                                        </div>

                                    )))
                                }
                            </div>
                        </Accordion.Content>
                    </Accordion.Panel>
                    <Accordion.Panel>
                        <Accordion.Title disabled>Digital Wallet (Coming Soon)</Accordion.Title>
                    </Accordion.Panel>
                    <Accordion.Panel>
                        <Accordion.Title disabled>Credit Card (Coming Soon)</Accordion.Title>
                    </Accordion.Panel>
                </Accordion>
            </div>


            <Button
                size="xl"
                className="w-full mt-4" color="bookadot-primary"
                onClick={onPay}
                disabled={isPending}
            >
                Pay {selectedSeats.length * selectedCrypto.price} ${selectedCrypto.symbol}
            </Button>
        </>
    )
}

export default Checkout