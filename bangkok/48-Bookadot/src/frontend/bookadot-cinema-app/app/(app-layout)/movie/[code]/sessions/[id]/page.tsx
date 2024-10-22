"use client"

import React from 'react'
import BookingBoard from '@/app/components/BookingBoard'
import { AppHeader } from '@/app/components/AppHeader'
import { useMovieContext } from '@/app/context/MovieContext'
import { useBookingContext } from '@/app/context/BookingContext'
import { Expand, Compress, Calendar, Clock, SmallX, Screen, ScreenSmall } from "@/app/components/Icon";
import Typography from '@/app/components/Typography'
import { Button } from 'flowbite-react'
import { usePathname, useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { getOccupiedSeats } from '@/app/services/sessionService'

function SessionDetail() {
    const { detailMovieData: movieData } = useMovieContext()

    const router = useRouter()
    const pathname = usePathname()
    const { sessionData } = useBookingContext()
    const bookingContext = useBookingContext()
    const [isPreviewMode, setIsPreviewMode] = React.useState(true)

    const { data: occupiedSeats } = useQuery<any>({
        queryKey: ['getOccupiedSeats', sessionData?.id],
        queryFn: () =>
            getOccupiedSeats(sessionData?.id),
    })

    return (
        <>
            <AppHeader
                config={{
                    title: sessionData?.cinema_name || sessionData?.cinema?.cinema_name || "Cinema",
                    subtitle: movieData?.title || "Movie"
                }}
                rightIcon={
                    isPreviewMode ? (
                        <Expand onClick={() => setIsPreviewMode(prev => !prev)} />
                    ) : (
                        <Compress onClick={() => setIsPreviewMode(prev => !prev)} />
                    )
                }
            />


            <div className="flex justify-evenly my-4">
                <div className="border border-light-border-color py-2 rounded-lg w-5/12">
                    <div className="flex items-center justify-center">
                        <Calendar />
                        <Typography>{dayjs(sessionData?.date || Date.now()).format('MMM, DD')}</Typography>
                    </div>
                </div>
                <div className='border border-light-border-color py-2 rounded-lg w-5/12'>
                    <div className="flex items-center justify-center">
                        <Clock />
                        <Typography>{sessionData?.time}</Typography>
                    </div>
                </div>
            </div>

            <div className='flex justify-center gap-3 mb-24'>
                <div className='flex items-center gap-2'>
                    <div className="circle available"></div>
                    <Typography component="p">Available</Typography>
                </div>
                <div className='flex items-center gap-2'>
                    <SmallX />
                    <Typography component="p">Occupied</Typography>
                </div>
                <div className='flex items-center gap-2'>
                    <div className="circle chosen"></div>
                    <Typography component="p">Chosen</Typography>
                </div>

            </div>

            <Typography
                component="h5"
                className="text-center uppercase text-text-secondary-color"
            >
                Screen
            </Typography>
            <div
                className='flex justify-center my-2'
            >
                {!isPreviewMode ? (
                    <Screen
                        style={{
                            minWidth: "593px",
                        }}
                    />
                ) : (
                    <ScreenSmall />
                )}
            </div>


            <BookingBoard
                onClick={() => {
                    if (isPreviewMode) {
                        setIsPreviewMode(prev => !prev)
                    }
                }}
                selectedPlaces={bookingContext.selectedSeats}
                setSelectedPlaces={(places) => {
                    bookingContext.setSelectedSeats(places);
                }}
                isPreviewMode={isPreviewMode}
                capacity={sessionData?.cinema?.cinema_capacity}
                occupiedPlaces={occupiedSeats}
            />


            <div className='absolute bottom-4 w-full px-4'>
                <Button
                    size="xl"
                    className="w-full mt-4" color="bookadot-primary"
                    onClick={() => router.push(`${pathname}/checkout`)}
                    disabled={bookingContext.selectedSeats.length === 0}
                >
                    Checkout {bookingContext.selectedSeats.length > 0 && `${bookingContext.selectedSeats.length} ticket(s)`}
                </Button>
            </div>
        </>
    )
}

export default SessionDetail