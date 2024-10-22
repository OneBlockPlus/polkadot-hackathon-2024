import React from "react";
import MyFanTable from "@/components/follow/MyFanTable";
import MyFollowTable from "@/components/follow/MyFollowTable";

export default function Page() {
    return (
        <>
            <div className="title">User Page</div>
            <div className="flex gap-4">
                <MyFanTable/>
                <MyFollowTable/>
            </div>
        </>
    )
}