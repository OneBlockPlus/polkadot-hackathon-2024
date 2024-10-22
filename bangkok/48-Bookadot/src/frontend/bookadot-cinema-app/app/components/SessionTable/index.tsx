import { Children } from "react";
import { List } from "flowbite-react";
import Typography from "../Typography";
import { Mark } from "../Icon";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookingContext } from "@/app/context/BookingContext";
import { PartialSession, PartialSessionGroupedByCinema } from "@/app/interfaces/Session";
import { convertPricesToObject } from "@/app/utils/helper";

function SessionTable({
    sessionList,
    isGroupedByCinema
}: {
    sessionList: PartialSessionGroupedByCinema[],
    isGroupedByCinema: boolean
}) {
    const searchParam = useSearchParams()
    const params = new URLSearchParams(searchParam.toString())
    const router = useRouter()
    const bookingContext = useBookingContext()

    const onSelectSession = (sessionData: PartialSession) => {
        bookingContext.setSessionData(sessionData)
        router.push(`sessions/${sessionData.id}?${params.toString()}`);
    }

    return (
        <List unstyled className="w-full">
            <List.Item>
                <div className="flex items-center bg-foreground-color py-2">
                    <div className="w-1/3 text-sm text-center text-text-secondary-color">Time</div>
                    <div className="mr-4"></div>
                    <div className="w-1/6 text-sm text-text-secondary-color">Adult</div>
                    <div className="w-1/6 text-sm text-text-secondary-color">Child</div>
                    <div className="w-1/6 text-sm text-text-secondary-color">Student</div>
                    <div className="w-1/6 text-sm text-text-secondary-color">V.I.P</div>
                </div>
            </List.Item>


            {Children.toArray(
                sessionList.map((movieOrCinema) => (
                    isGroupedByCinema ? (
                        <>
                            <CinemaRow cinemaData={movieOrCinema} />
                            {
                                movieOrCinema?.sessions?.map((sessionData: any) => (
                                    <SessionRow sessionData={sessionData} onSelectSession={onSelectSession} />
                                ))
                            }
                        </>
                    ) : (
                        <SessionRow sessionData={movieOrCinema as PartialSession} onSelectSession={onSelectSession} />
                    )
                ))
            )}
        </List>
    )
}

function CinemaRow({ cinemaData }: { cinemaData: any }) {
    return (
        <List.Item className="w-full flex justify-between px-4 py-3 mt-0 border-b-2 border-b-border-color">
            <div>
                <Typography component="p" className="text-lg font-bold">{cinemaData.cinema_name}</Typography>
                <Typography component="span" className="text-sm text-text-secondary-color">{cinemaData.cinema_address}</Typography>
            </div>
            <div>
                <Typography component="p" className="text-sm text-text-secondary-color flex items-center gap-1">
                    <Mark />
                    {cinemaData.cinema_distance}
                </Typography>
            </div>
        </List.Item>
    )
}

function SessionRow({ sessionData, onSelectSession }: { sessionData: PartialSession, onSelectSession: any }) {
    const priceData = convertPricesToObject(sessionData?.price || [])
    return (
        <List.Item
            className="flex items-center border-b-2 border-b-border-color p-4 cursor-pointer"
            onClick={() => onSelectSession(sessionData)}
        >
            <div className="w-1/4">
                <Typography component="p" className="text-lg font-bold text-center">
                    {sessionData?.time || "00:00"}
                </Typography>
                <Typography component="p" className="text-sm font-medium text-text-secondary-color text-center">
                    {sessionData?.cinema?.cinema_type}
                </Typography>
            </div>
            <hr className="rotate-90 w-10 bg-border-color mx-1" />
            <div className="w-1/6">
                <TicketPrice price={priceData.adult} />
            </div>
            <div className="w-1/6">
                <TicketPrice price={priceData.child} />
            </div>
            <div className="w-1/6">
                <TicketPrice price={priceData.student} />
            </div>
            <div className="w-1/6">
                <TicketPrice price={priceData.vip} />
            </div>
        </List.Item>
    )
}

const TicketPrice = ({ price }: any) => {
    return (
        <div className="flex items-center gap-1">
            <Typography component="p" className="text-sm">
                {price ? `$${price}` : "."}
            </Typography>
        </div>
    )
}

export default SessionTable