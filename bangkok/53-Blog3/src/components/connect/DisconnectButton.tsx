"use client";

import {JwtContext} from "@/providers/JwtProvider";
import {useContext} from "react";
import {Button} from "@nextui-org/react";
import {ISignProvider, UserContext} from "@/providers/UserProvider";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import cookie from 'react-cookies';

export default function DisconnectButton() {
    const {setJwtToken} = useContext(JwtContext);
    const {setSignature, setIsConnect, setAddress} = useContext<ISignProvider>(UserContext);

    const logOutHandler = async () => {
        setIsConnect(false);
        setAddress("");
        setSignature("");
        setJwtToken("");
        cookie.remove("jwtToken");
        localStorage.removeItem('ConnectInfo');
    }
    return <Button onPress={logOutHandler}>LogOut</Button>
}