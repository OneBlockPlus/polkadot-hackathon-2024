"use client";

import { Children, useState } from "react";
import { MovieCard } from "@app/components/MovieCard";
import { Filter } from "@app/components/Icon";
import Typography from "@app/components/Typography";
import { useQuery } from '@tanstack/react-query'
import { getMovies } from "@app/services/movieService";
import { DEFAULT_QUERY, IPaginationQuery, QueryResult } from "@app/interfaces/Query";
import { IMovie } from "@app/interfaces/Movie";
import { Pagination } from "flowbite-react";

export default function Home() {
    const [queryParams, setQueryParams] = useState<IPaginationQuery>(DEFAULT_QUERY);
    const { data: movieData } = useQuery<QueryResult<IMovie[]>>({
        queryKey: ['getMovies', queryParams._page],
        queryFn: () =>
            getMovies(queryParams),
    })

    return (
        <div>
            <div className="flex justify-between items-center">
                <Typography component="h2" className="text-2xl font-bold">Now in cinemas</Typography>

                <span className="cursor-pointer">
                    <Filter />
                </span>
            </div>


            {
                movieData && movieData.data && movieData.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Children.toArray(
                                movieData.data.map((movie) => (
                                    <div className="pt-4">
                                        <MovieCard {...movie} />
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex overflow-x-auto sm:justify-center">
                            <Pagination
                                currentPage={queryParams._page}
                                totalPages={Math.ceil((movieData?.total || 0) / queryParams._limit)}
                                onPageChange={(page) => setQueryParams({ ...queryParams, _page: page })}
                            />
                        </div>
                    </>
                ) : (
                    <Typography component="p" className="text-center mt-5">No data</Typography>
                )
            }
        </div>
    );
}
