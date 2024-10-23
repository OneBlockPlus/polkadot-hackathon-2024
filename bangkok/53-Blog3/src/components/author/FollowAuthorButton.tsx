"use client";

import {useContext, useEffect, useState} from "react";
import {Button, Popover, PopoverContent, PopoverTrigger} from "@nextui-org/react";
import {IFollowInsert} from "@/libs/db/dao/follow/followInsertDao";
import {FollowContext, IFollowProvider} from "@/providers/FollowProvider";
import {UserContext} from "@/providers/UserProvider";
import {updateFollowList} from "@/libs/follow/follow";

interface IArticleEditorProps {
    author: string,
}

export default function FollowAuthorButton(props: IArticleEditorProps) {
    const [isDisabled, setIsDisabled] = useState(true)
    const {followList, setFollowList} = useContext<IFollowProvider>(FollowContext);
    const {address, isConnect} = useContext(UserContext);

    const handler = () => {
        // console.log("address:",address)
        // console.log("followList:",followList)
        // console.log("props.author:",props.author)
        if (!isConnect) {
            setIsDisabled(true)
        } else {
            setIsDisabled(followList.indexOf(props.author) != -1)
        }
    }

    useEffect(() => {
        handler()
    }, [address, isConnect, followList])

    const onClick = async () => {
        const followInsert: IFollowInsert = {
            fans: address,
            author: props.author,
            create_date: new Date(),
        };
        console.log("followInsert:", followInsert)
        fetch("/api/follow/", {
            method: "POST",
            body: JSON.stringify(followInsert),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then(async (data) => {
                console.log("followInsert success:", data.follow)
                const newFollowList = await updateFollowList(address)
                setFollowList(newFollowList);
                // success()
            });
    }
    return (
        <Button color="primary" isDisabled={isDisabled} onPress={onClick}>Follow</Button>
    );
}
