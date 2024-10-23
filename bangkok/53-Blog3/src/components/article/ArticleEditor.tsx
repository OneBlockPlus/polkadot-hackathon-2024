'use client';

import React, {useContext, useState} from "react";
import MDEditor from '@uiw/react-md-editor';
import {IArticle} from "@/libs/db/dao/article/articleDAO";
import {Button, Input} from "@nextui-org/react";
import {IArticleUpdate} from "@/libs/db/dao/article/articleUpdateDAO";
import {IArticleInsert} from "@/libs/db/dao/article/articleInsertDAO";
import {UserContext} from "@/providers/UserProvider";
import toast from "react-hot-toast";
import {Date} from "@polkadot/types-codec";

interface IArticleEditorProps {
    isCreate: boolean, // 是否是新建的博文
    article?: IArticle
}

const DEFAULT_COVER_URL_LIST = [""];
const DEFAULT_COVER_AVATAR_LIST = [""];

const pickRandom = (list: string[]) => {
    return list[Math.floor((Math.random() * list.length))]
}

export default function ArticleEditor(props: IArticleEditorProps) {
    const [title, setTitle] = useState(props.article ? props.article.title : "New Article");
    const [content, setContent] = useState(props.article ? props.article.content : "# New Article\n## Content");
    const [abstract, setAbstract] = useState(
        props.article ?
            props.article.abstract :
            pickRandom(DEFAULT_COVER_AVATAR_LIST)
    );
    const [coverUrl, setCoverUrl] = useState(
        props.article ?
            props.article.cover_url :
            pickRandom(DEFAULT_COVER_URL_LIST)
    );
    const articleId = props.article ? props.article._id.toString() : "undefined";
    const {address} = useContext(UserContext);
    const {isCreate} = props;

    const successHandler = () => {
        toast.success('Submit Success!')
    };

    const createHandler = () => {
        const articleInsert: IArticleInsert = {
            author: address,
            title: title,
            abstract: abstract,
            cover_url: coverUrl,
            content: content,
            is_request_pay: false,
            create_date: new Date(),
            update_date: new Date()
        };
        console.log("articleInsert:", articleInsert)
        fetch("/api/article/", {
            method: "POST",
            body: JSON.stringify(articleInsert),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                successHandler()
            });
    }
    const updateHandler = () => {
        const {article} = props;
        const updateArticle: IArticleUpdate = {
            content: content,
            title: title,
            abstract: abstract,
            cover_url: coverUrl,
            id: article._id.toString(),
            update_date: new Date(),
        }
        fetch("/api/article/" + updateArticle.id, {
            method: "UPDATE",
            body: JSON.stringify(updateArticle),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                successHandler()
            });
    }
    const uploadHandler = isCreate ? createHandler : updateHandler;

    return (
        <>
            <div className="container">
                <div className="text-white/90">Article Id: {articleId}</div>
                <Input placeholder="Title" value={title} onChange={(e) => {
                    setTitle(e.target.value)
                }}/>
                <Input placeholder="Abstract" value={abstract} onChange={(e) => {
                    setAbstract(e.target.value)
                }}/>
                <Input placeholder="Cover Url" value={coverUrl} onChange={(e) => {
                    setCoverUrl(e.target.value)
                }}/>
                <MDEditor
                    value={content}
                    onChange={(e) => {
                        setContent(e ? e : "")
                    }}
                />
                <Button color="primary" onClick={uploadHandler}>Submit</Button>
            </div>
        </>
    );
}
