import {IFollow} from "@/libs/db/dao/follow/followDao";

export async function updateFollowList(address: string) {
    let followList: string[] = [];
    await fetch("/api/user/follow_list/" + address)
        .then((response) => response.json())
        .then((data) => {
            followList = data.data.map((follow: IFollow) => {
                return follow.author
            })
        });
    return followList
}