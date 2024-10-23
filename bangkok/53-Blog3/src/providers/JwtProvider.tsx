"use client";

import {createContext, Dispatch, SetStateAction, useState} from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const JwtContext = createContext<IJwtProvider>();

export interface IJwtProvider {
    jwtToken:string,
    setJwtToken:Dispatch<SetStateAction<string>>,
}

export function JwtProvider({children}: {
    children: React.ReactNode
}){
    const [jwtToken, setJwtToken] = useState("");
    const value:IJwtProvider = {
        jwtToken:jwtToken,
        setJwtToken:setJwtToken,
    }
    return(
        <JwtContext.Provider value={value}>
            {children}
        </JwtContext.Provider>
    )
}