"use client";

import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { PartialUser } from "../interfaces/User";

type UserContextType = {
    isLoggedIn: boolean;
    setIsLoggedIn: (status: boolean) => void;
    userDetail: PartialUser | undefined;
    setUserDetail: (data: PartialUser) => void;
};

const UserContext = createContext<UserContextType>({
    isLoggedIn: true,
    setIsLoggedIn: () => { },
    userDetail: undefined,
    setUserDetail: () => { }
});

export function UserContextProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [userDetail, setGlobalUserDetail] = useState<PartialUser>();
    const setUserDetail = useCallback((data: PartialUser) => setGlobalUserDetail(data), [])

    const [isLoggedIn, setGlobalIsLoggedIn] = useState<boolean>(false);
    const setIsLoggedIn = useCallback((status: boolean) => setGlobalIsLoggedIn(status), []);
    return (
        <UserContext.Provider value={{
            isLoggedIn,
            setIsLoggedIn,
            userDetail,
            setUserDetail
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    return useContext(UserContext);
}