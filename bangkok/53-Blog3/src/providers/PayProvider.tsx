"use client";

import {createContext, Dispatch, SetStateAction, useState} from 'react';
import {IPay} from "@/libs/db/dao/pay/payDao";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const PayContext = createContext<IPayProvider>();

export interface IPayProvider {
    payList:IPay[],
    setPayList:Dispatch<SetStateAction<IPay[]>>,
    receiveList:IPay[],
    setReceiveList:Dispatch<SetStateAction<IPay[]>>,
}

export function PayProvider({children}: {
    children: React.ReactNode
}){
    const [payList, setPayList] = useState<IPay[]>([]);
    const [receiveList, setReceiveList] = useState<IPay[]>([]);
    const value:IPayProvider = {
        payList:payList,
        setPayList:setPayList,
        receiveList:receiveList,
        setReceiveList:setReceiveList,
    }
    return(
        <PayContext.Provider value={value}>
            {children}
        </PayContext.Provider>
    )
}