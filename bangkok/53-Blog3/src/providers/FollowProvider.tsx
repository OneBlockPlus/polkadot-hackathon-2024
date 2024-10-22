"use client";

import {createContext, Dispatch, SetStateAction, useState} from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const FollowContext = createContext<IFollowProvider>();

export interface IFollowProvider {
    followList:string[], // 关注列表
    setFollowList:Dispatch<SetStateAction<string[]>>,
    fanList:string[], // 粉丝列表
    setFanList:Dispatch<SetStateAction<string[]>>,
}

export function FollowProvider({children}: {
    children: React.ReactNode
}){
    const [followList, setFollowList] = useState<string[]>([]);
    const [fanList, setFanList] = useState<string[]>([]);
    const value:IFollowProvider = {
        followList:followList,
        setFollowList:setFollowList,
        fanList:fanList,
        setFanList:setFanList,
    }
    return(
        <FollowContext.Provider value={value}>
            {children}
        </FollowContext.Provider>
    )
}
