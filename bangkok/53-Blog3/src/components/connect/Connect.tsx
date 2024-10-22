"use client";

import ConnectButton from "@/components/connect/ConnectButton"
import ShowAccount from "./ShowAccount";
import {useContext} from "react";
import {UserContext} from "@/providers/UserProvider";

export default function SignIn() {
    const {isConnect, user} = useContext(UserContext);
    return (
        <>
            {isConnect ? (
                <ShowAccount user={user}/>
            ): (
                <ConnectButton/>
            )}
        </>
    )
}