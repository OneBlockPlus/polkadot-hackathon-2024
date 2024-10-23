'use client';

import React, {useEffect, useState} from "react";
import MDEditor from '@uiw/react-md-editor';
import { IArticle } from "@/libs/db/dao/article/articleDAO";
import UserCard from "@/components/user/UserCard";
import {default_avatar_url, IUser} from "@/libs/db/dao/user/userDao";
import FollowAuthorButton from "@/components/author/FollowAuthorButton";

interface IArticleReaderProps {
    article:IArticle
}

export default function ArticleReader(props:IArticleReaderProps) {
    const {title, author, abstract, content} = props.article;
    const [user, setUser] = useState<IUser>({
        _id: "-1",
        address: "undefined",
        avatar_url: default_avatar_url,
        create_date: new Date(),
        description: "undefined",
        name: "undefined",
        update_date: new Date(),
    });
    // console.log("props:", props)

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
    useEffect(() => {
        handler()
    }, []);
    return (
        <div className="container">
            <div className="text-white/90">Article Title: {title}</div>
            <div className="text-white/90">Abstract: {abstract}</div>
            <UserCard user={user}/>
            <FollowAuthorButton author={author}/>
            <MDEditor.Markdown source={content} style={{whiteSpace: 'pre-wrap'}}/>
        </div>
    );
}
