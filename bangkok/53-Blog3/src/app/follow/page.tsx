"use client";

import {useEffect, useState} from "react";
import FollowTable from "@/components/follow/FollowTable";
import {IFollow} from "@/libs/db/dao/follow/followDao";
import {Button} from "@nextui-org/react";
import {Spinner} from "@nextui-org/spinner";

export default function Page() {
    const [followList, setFollowList] = useState<IFollow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchFollowContent();
    }, []);

    const fetchFollowContent = () => {
        setIsLoading(true)
        fetch("/api/follow/")
            .then((response) => response.json())
            .then((data) => {
                console.log("data:", data)
                const follows = data.follows;
                console.log("follows:", follows);
                setFollowList(follows)
                setIsLoading(false)
            });
    };

    return (
        <>
            <Button onPress={fetchFollowContent}>Refresh</Button>
            {isLoading?<Spinner label="Loading..."/>:<FollowTable followList={followList}/>}
        </>
    )
}