'use client'

import React, { Children } from 'react'
import { AppHeader } from '@/app/components/AppHeader'
import Image from 'next/image'
import Typography from '@/app/components/Typography'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { getMyTicket } from '@/app/services/ticketService'
import { useParams } from 'next/navigation'

function DetailTicket() {
    const selectedCrypto = {
        symbol: "GLMR",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        price: 26.15
    }
    const { id } = useParams()

    const { data } = useQuery({
        queryKey: ['getTicketData'],
        queryFn: () =>
            getMyTicket(id as string),
    })

    const selectedSeats = data?.seats?.split(', ') || []
    const ticketData = {
        Cinema: `${data?.session.cinema.cinema_name} - at ${data?.session.cinema.cinema_address}`,
        Date: data?.session.date ? `${dayjs(data?.session.date).format('D MMMM YYYY')}, ${data?.session.time}` : "",
        Hall: data?.session?.cinema?.cinema_hall,
        Seats: data?.seats,
    }

    return (
        <>
            <AppHeader
                config={{
                    title: "Your ticket",
                }}
            />


            <div className='w-full justify-center flex mb-4 shadow-xl'>
                <Image
                    src={"https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/tickets/ticket-5d03406d2972727d7c.png"}
                    alt="ticket"
                    width={400}
                    height={400}
                    className='w-3/4 aspect-square rounded-lg'
                />
            </div>
            <Typography className="text-text-secondary-color text-center">Show this code to the gatekeeper at the cinema</Typography>

            <div className='p-4 mt-8'>
                <Typography component='h4' className="font-bold">{data?.movie?.tile || "Movie"}</Typography>
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
                        <tr>
                            <td className="flex capitalize text-sm text-text-secondary-color">Total</td>
                            <td className="pl-5">{selectedSeats.length * selectedCrypto.price} ${selectedCrypto.symbol} ({data?.status || ""})</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default DetailTicket