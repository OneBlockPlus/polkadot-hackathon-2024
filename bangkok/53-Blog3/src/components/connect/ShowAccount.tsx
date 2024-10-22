"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from '@nextui-org/react'
import DisconnectButton from "@/components/connect/DisconnectButton";
import UserCard from "@/components/user/UserCard";
import {IUser} from "@/libs/db/dao/user/userDao";

interface SignInInfoProps {
    user: IUser,
}

export default function ShowAccount(props: SignInInfoProps) {
    return (
        <Dropdown className="bg-[#c2c2c2] min-w-[7.75rem] h-[2.4rem] rounded-lg">
            <DropdownTrigger>
                <Button as="div" variant="bordered">
                    <UserCard user={props.user}/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu variant="flat" className="text-center">
                <DropdownItem key="disconnect">
                    <DisconnectButton/>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}