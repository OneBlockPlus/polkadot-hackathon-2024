"use client";

import {JwtProvider} from "@/providers/JwtProvider";
import {UserProvider} from "@/providers/UserProvider";
import {FollowProvider} from "@/providers/FollowProvider";
import {PayProvider} from "@/providers/PayProvider";
import {NextUIProvider} from "@nextui-org/react";

export function Provider({children}: {
    children: React.ReactNode
}) {

    return (
        <NextUIProvider>
            <JwtProvider>
                <UserProvider>
                    <FollowProvider>
                        <PayProvider>
                            {children}
                        </PayProvider>
                    </FollowProvider>
                </UserProvider>
            </JwtProvider>
        </NextUIProvider>
    )
}