"use client";

import { Badge } from "flowbite-react";
import Typography from "../Typography";
import Link from "next/link";
import Image from "next/image";
import { PartialMovie } from "@/app/interfaces/Movie";
import { getImageUrl } from "@/app/services/request";

export const MovieCard = (movieData: PartialMovie) => {
    return (
        <Link href={`/movie/${movieData?.code || '#'}`}>
            <div className="w-full flex flex-col relative">
                <Badge size="sm" className="absolute top-1 right-1 z-10" color="bookadot-primary">
                    {movieData?.vote_average?.toFixed(1) || "0.0"}
                </Badge>
                <Image
                    src={getImageUrl(movieData?.poster_path || "#")}
                    alt={movieData?.title || "movie"}
                    width={100}
                    height={250}
                    className="rounded-lg w-full aspect-[0.713]"
                />
                <div className="mt-1">
                    <Typography component="p" className="font-bold">
                        {movieData?.title || ""}
                    </Typography>
                    <Typography component="p" className="text-sm mt-1 text-gray-500">
                        {movieData?.genre_data?.at(0)?.name || ""}
                    </Typography>
                </div>
            </div>
        </Link>
    );
};
