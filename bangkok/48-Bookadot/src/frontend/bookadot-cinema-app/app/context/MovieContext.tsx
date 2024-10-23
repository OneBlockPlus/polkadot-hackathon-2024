"use client";

import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { PartialMovie } from "../interfaces/Movie";

type MovieContextType = {
    detailMovieData: PartialMovie | undefined;
    setDetailMovieData: (data: PartialMovie) => void;
};

const MovieContext = createContext<MovieContextType>({
    detailMovieData: undefined,
    setDetailMovieData: () => { }
});

export function MovieContextProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [detailMovieData, setGlobalDetailMovieData] = useState<MovieContextType['detailMovieData']>(undefined);
    const setDetailMovieData = useCallback((data: PartialMovie) => setGlobalDetailMovieData(data), [])

    return (
        <MovieContext.Provider value={{
            detailMovieData: detailMovieData,
            setDetailMovieData
        }}>
            {children}
        </MovieContext.Provider>
    );
}

export function useMovieContext() {
    return useContext(MovieContext);
}