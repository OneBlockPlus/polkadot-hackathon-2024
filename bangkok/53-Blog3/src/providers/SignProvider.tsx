"use client";

import {createContext, Dispatch, SetStateAction, useState} from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const SignContext = createContext<ISignProvider>();

export interface ISignProvider {
    isSignIn:boolean,
    setIsSignIn:Dispatch<SetStateAction<boolean>>,
    address:string,
    setAddress:Dispatch<SetStateAction<string>>,
    signature:string,
    setSignature:Dispatch<SetStateAction<string>>,
}

export function SignProvider({children}: {
    children: React.ReactNode
}){
    const [isSignIn, setIsSignIn] = useState(false);
    const [address, setAddress] = useState("");
    const [signature, setSignature] = useState("");
    const value:ISignProvider = {
        isSignIn:isSignIn,
        setIsSignIn:setIsSignIn,
        address:address,
        setAddress:setAddress,
        signature:signature,
        setSignature:setSignature,
    }
    return(
        <SignContext.Provider value={value}>
            {children}
        </SignContext.Provider>
    )
}