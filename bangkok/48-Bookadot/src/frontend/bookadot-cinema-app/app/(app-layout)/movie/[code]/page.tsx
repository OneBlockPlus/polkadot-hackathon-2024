"use client";

import { AppHeader } from "@/app/components/AppHeader";
import MovieTab from "@/app/components/MovieTab";
import Typography from "@/app/components/Typography";
import { VideoJSPlayer } from "@/app/components/VideoPlayer";
import { useMovieContext } from "@/app/context/MovieContext";
import { PartialMovie } from "@/app/interfaces/Movie";
import { getMovie } from "@/app/services/movieService";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Button } from "flowbite-react";
import { useParams, useRouter } from 'next/navigation';
import { Children, useCallback, useEffect, useRef } from "react";
import Player from "video.js/dist/types/player";

function Movie() {
    const router = useRouter()
    const param = useParams()
    const movieContext = useMovieContext()
    const playerRef = useRef<Player | null>(null);
    const { data: _movieData } = useQuery<PartialMovie[]>({
        queryKey: ['getDetailMovie', param.code as string],
        queryFn: () =>
            getMovie(param.code as string),
    })

    const movieData = _movieData?.[0] || {}

    const movieAttributes = {
        "Age": (movieData.age + "+") || "",
        "Runtime": movieData.runtime || "",
        "Release Date": movieData.release_date ? dayjs(movieData.release_date, 'YYYY-MM-DD').format('DD MMMM YYYY') : "",
        "Language": movieData.spoken_languages?.map((lang) => lang.name).join(', ') || "",
        "Genre": movieData.genre_data?.map((g) => g.name).join(', '),
        "Company": movieData.production_companies?.map((c) => c.name).join(', ') || "",
    }


    useEffect(() => {
        if (_movieData?.[0] && !movieContext.detailMovieData) {
            movieContext.setDetailMovieData(_movieData?.[0])
        }
    }, [_movieData?.[0]])

    const handleReady = useCallback((player: Player) => {
        playerRef.current = player;
    }, []);

    return (
        <>
            <AppHeader
                config={{
                    title: movieData?.title || "Movie",
                }}
            />
            <MovieTab />

            <div className="w-full mt-1 relative">
                <VideoJSPlayer
                    options={{
                        loop: false,
                        autoplay: false,
                        controls: true,
                        responsive: true,
                        fluid: true,
                        techOrder: ["youtube"],
                        sources: [
                            {
                                type: "video/youtube",
                                src: `https://www.youtube.com/watch?v=${movieData.videos?.results[0]?.key ||
                                    "L3oOldViIgY"
                                    }`,
                            },
                        ],
                    }}
                    onReady={handleReady}
                />

                {/* <div className={classNames("absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10", { 'hidden': true })}>
                    <div className="rounded-full w-16 h-16 bg-text-secondary-color shadow-xl backdrop-blur-xl flex justify-center items-center cursor-pointer">
                        <Play />
                    </div>
                </div> */}
            </div>

            <div className="flex items-center">
                <div className="w-1/2 text-center py-3 px-4">
                    <Typography component="p" className="font-bold text-xl">{movieData?.popularity || "0.0"}</Typography>
                    <Typography component="p" className="text-sm text-text-secondary-color">Popularity</Typography>
                </div>
                <hr className="rotate-90 w-10 h-full" />
                <div className="w-1/2 text-center py-3 px-4">
                    <Typography component="p" className="font-bold text-xl">{movieData?.vote_average || "0.0"}</Typography>
                    <Typography component="p" className="text-sm text-text-secondary-color">Vote</Typography>
                </div>
            </div>

            <div className="p-4">
                <Typography component="h4" className="text-sm mt-5">
                    {movieData?.overview}
                </Typography>

                <table className="mt-4 border-spacing-y-3 border-separate">
                    <tbody>
                        {
                            Children.toArray(Object.entries(movieAttributes).map(([key, value]) => (
                                <tr>
                                    <td className="flex capitalize text-sm text-text-secondary-color">{key}</td>
                                    <td className="pl-5">{value}</td>
                                </tr>
                            )))
                        }
                    </tbody>
                </table>

                <Button
                    size="xl"
                    className="w-full mt-4" color="bookadot-primary"
                    onClick={() => router.push(`/movie/${param.code}/sessions`)}
                >
                    Select Session
                </Button>
            </div>
        </>
    )
}

export default Movie