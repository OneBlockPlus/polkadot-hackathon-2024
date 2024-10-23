"use client"

import { AppHeader } from "@/app/components/AppHeader"
import DatePicker from "@/app/components/DatePicker"
import MovieTab from "@/app/components/MovieTab"
import { DoubleArrow } from "@/app/components/Icon"
import SessionTable from "@/app/components/SessionTable"
import Typography from "@/app/components/Typography"
import { useMovieContext } from "@/app/context/MovieContext"
import dayjs from "dayjs"
import { ToggleSwitch } from "flowbite-react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { QueryResult } from "@/app/interfaces/Query"
import { ISession, PartialSession, PartialSessionGroupedByCinema } from "@/app/interfaces/Session"
import { getMovieSession } from "@/app/services/sessionService"
import { groupSessionsByCinema } from "@/app/utils/helper"

const DATE_FORMAT_PATTERN = 'YYYY-MM-DD'

function Sessions() {
    const searchParam = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = new URLSearchParams(searchParam.toString())
    const pathParams = useParams()
    const { detailMovieData: movieData } = useMovieContext()

    const isSortedByTimeDesc = searchParam.get('time') === 'asc' ? false : true
    const isGroupedByCinema = searchParam.get('group_by') === 'cinema' ? true : false
    const [sortParams, setSortParams] = useState({
        isTimeDesc: isSortedByTimeDesc,
        isGroupedByCinema: isGroupedByCinema,
        date: dayjs().format(DATE_FORMAT_PATTERN)
    })

    const { data: sessionResponse } = useQuery<QueryResult<PartialSession[]>>({
        queryKey: ['getSession', pathParams.code as string],
        queryFn: () =>
            getMovieSession({
                "_limit": 100,
                "_page": 1,
                "movie_code": pathParams.code as string,
                "_sort": "createdAt",
                "_order": searchParam.get('time')
            }),
    })

    const sessionList = sortParams.isGroupedByCinema ?
        groupSessionsByCinema((sessionResponse?.data || []) as ISession[]) :
        sessionResponse?.data

    const onSortedByTime = useCallback(() => {
        const _isTimeDesc = !sortParams.isTimeDesc
        setSortParams(prev => ({ ...prev, isTimeDesc: _isTimeDesc }))
        searchParams.set("time", _isTimeDesc ? "desc" : "asc");
        router.push(`${pathname}?${searchParams.toString()}`);
    }, [sortParams.isTimeDesc])

    const onGroupedByCinema = useCallback(() => {
        const _isGroupedByCinema = !sortParams.isGroupedByCinema
        setSortParams(prev => ({ ...prev, isGroupedByCinema: _isGroupedByCinema }))
        !_isGroupedByCinema ?
            searchParams.delete("group_by") :
            searchParams.set("group_by", "cinema");
        router.push(`${pathname}?${searchParams.toString()}`);
    }, [sortParams.isGroupedByCinema])

    const onFilterByDate = useCallback((date: Date) => {
        const _date = dayjs(date).format(DATE_FORMAT_PATTERN)
        setSortParams(prev => ({ ...prev, date: _date }))
        searchParams.set("date", _date);
        router.push(`${pathname}?${searchParams.toString()}`);
    }, [sortParams.date])

    return (
        <>
            <AppHeader
                config={{
                    title: movieData?.title || "Movie"
                }}
            />
            <MovieTab />

            <div className="flex py-4">
                <div className="flex flex-col items-center w-1/3 relative">
                    <DatePicker
                        onSelectedDateChanged={onFilterByDate}
                        value={sortParams.date}
                    />
                </div>

                <div
                    className="flex flex-col items-center w-1/3 cursor-pointer"
                    onClick={onSortedByTime}
                >
                    <DoubleArrow />
                    <Typography
                        component="p"
                        className="text-sm font-bold pt-1"
                    >
                        Time &nbsp;
                        {
                            sortParams.isTimeDesc ? <>&darr;</> : <>&uarr;</>
                        }
                    </Typography>
                </div>

                <div className="flex flex-col items-center w-1/3">
                    <ToggleSwitch
                        onChange={onGroupedByCinema}
                        checked={sortParams.isGroupedByCinema}
                        color="bookadot_primary"
                    />
                    <Typography
                        component="p"
                        className="text-sm font-bold pt-1"
                    >By Cinema</Typography>
                </div>
            </div>

            <SessionTable
                isGroupedByCinema={sortParams.isGroupedByCinema}
                sessionList={(sessionList || []) as PartialSessionGroupedByCinema[]}
            />
        </>
    )
}

export default Sessions