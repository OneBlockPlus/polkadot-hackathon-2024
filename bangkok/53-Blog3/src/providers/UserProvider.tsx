"use client";

import {createContext, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {default_avatar_url, IUser} from "@/libs/db/dao/user/userDao";
import {shortAddress} from "@/libs/helper";
// import {IUserInsert} from "@/libs/db/dao/user/userInsertDAO";

export const UserContext = createContext<ISignProvider>();

export interface ISignProvider {
    isConnect: boolean,
    setIsConnect: Dispatch<SetStateAction<boolean>>,
    address: string,
    setAddress: Dispatch<SetStateAction<string>>,
    signature: string,
    setSignature: Dispatch<SetStateAction<string>>,
    user: IUser,
    setUser: Dispatch<SetStateAction<IUser>>,
}

export function UserProvider({children}: {
    children: React.ReactNode
}) {
    const [isConnect, setIsConnect] = useState(false);
    const [address, setAddress] = useState("");
    const [signature, setSignature] = useState("");
    const [user, setUser] = useState<IUser>({
        _id: "-1",
        address: "undefined",
        avatar_url: default_avatar_url,
        create_date: new Date(),
        description: "undefined",
        name: "undefined",
        update_date: new Date(),
    })
    // console.log("user:", user)


    const handler = () => {
        if (window) {
            // todo 需要校验connectInfo相关的钱包签名
            const address = localStorage.getItem('ConnectInfo');
            if (address) {
                // 获取用户信息
                fetch("/api/user/" + address)
                    .then((response) => response.json())
                    .then((data) => {
                        // console.log("user api result:", data)
                        if (data.data) {
                            setUser(data.data);
                            setIsConnect(true);
                            setAddress(address);
                        } else {
                            const userInsert: IUserInsert = {
                                address: address,
                                avatar_url: default_avatar_url,
                                create_date: new Date(),
                                description: "no description",
                                name: shortAddress(address as `0x${string}`),
                                update_date: new Date(),
                            };
                            fetch("/api/user/", {
                                method: "POST",
                                body: JSON.stringify(userInsert),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    console.log("set user success:", data)
                                    if (data.data) {
                                        setUser(data.data);
                                        setIsConnect(true);
                                        setAddress(address);
                                    }
                                });
                        }
                    });
            }
        }
    }

    useEffect(() => {
        handler()
    }, []);

    const value: ISignProvider = {
        isConnect: isConnect,
        setIsConnect: setIsConnect,
        address: address,
        setAddress: setAddress,
        signature: signature,
        setSignature: setSignature,
        user: user,
        setUser: setUser,
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}