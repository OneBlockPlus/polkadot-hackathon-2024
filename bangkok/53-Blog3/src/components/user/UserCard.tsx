import {Button, User} from "@nextui-org/react";
import {default_avatar_url, IUser} from "@/libs/db/dao/user/userDao";
import {shortAddress} from "@/libs/helper";

export interface IUserCardProps {
    user: IUser,
}

export default function UserCard(props: IUserCardProps) {
    const {name, address, avatar_url, description} = props.user;
    const url = avatar_url?avatar_url:default_avatar_url;
    return (
        <div className="flex flex-grow gap-2 items-center">
            <User
                className="text-white"
                name={name}
                description={description}
                avatarProps={{
                    src: url
                }}
                title={address}
            />
        </div>
    )
}