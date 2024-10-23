import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Avatar,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    User,
    Tooltip
} from "@nextui-org/react";
import {IUser} from "@/libs/db/dao/user/userDao";
import {shortAddress} from "@/libs/helper";
import UserCard from "@/components/user/UserCard";
import {UserTwitterCard} from "@/components/user/UserTwitterCard";

export interface IUserCardWithDropdownProps {
    user: IUser;
}

export default function UserCardHover(props: IUserCardWithDropdownProps) {
    const [isFollowed, setIsFollowed] = React.useState(false);
    const {name, address, avatar_url, description} = props.user;

    return (
        <>
            <UserTwitterCard />
            <Tooltip
                showArrow
                placement="right"
                content="I am a tooltip"
                classNames={{
                    base: [
                        // arrow color
                        "before:bg-neutral-400 dark:before:bg-white",
                    ],
                    content: [
                        "py-2 px-4 shadow-xl",
                        "text-black bg-gradient-to-br from-white to-neutral-400",
                    ],
                }}
            >
                <UserCard user={props.user}/>
            </Tooltip>
        </>
    );
}
