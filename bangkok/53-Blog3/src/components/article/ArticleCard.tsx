"use client";

import {IArticle} from "@/libs/db/dao/article/articleDAO";
import Link from "next/link";
import {Card, CardHeader, CardFooter, Image} from "@nextui-org/react";
import {default_avatar_url, IUser} from "@/libs/db/dao/user/userDao";
import {useEffect, useState} from "react";
import UserCard from "@/components/user/UserCard";
import UserCardHover from "@/components/user/UserCardHover";

interface ArticleCardProps {
    article: IArticle,
}

const defaultImgUrl = "https://nextui.org/images/card-example-5.jpeg";

export default function ArticleCard(props:ArticleCardProps) {
    const {author, title, cover_url, abstract} = props.article;
    const [user, setUser] = useState<IUser>({
        _id: "-1",
        address: "undefined",
        avatar_url: default_avatar_url,
        create_date: new Date(),
        description: "undefined",
        name: "undefined",
        update_date: new Date(),
    });
    const imgUrl = cover_url?cover_url:defaultImgUrl;

    const handler = () => {
        // 获取用户信息
        fetch("/api/user/" + author)
            .then((response) => response.json())
            .then((data) => {
                if (data.data) {
                    setUser(data.data);
                }
            });
    }

    useEffect(() => {handler()}, [])

    return (
        <Link href={"/article/view/"+props.article._id}>
            <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-7">
                <CardHeader className="absolute z-10 top-1 flex-col items-start">
                    <h4 className="text-white/90 font-medium text-xl">{title}</h4>
                    <p className="text-tiny text-white/60 uppercase font-bold">{abstract}</p>
                </CardHeader>
                <Image
                    removeWrapper
                    alt="Relaxing app background"
                    className="z-0 w-full h-full object-cover"
                    src={imgUrl}
                />
                <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                    <div className="flex flex-grow gap-2 items-center">
                        <UserCard user={user}/>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )

}