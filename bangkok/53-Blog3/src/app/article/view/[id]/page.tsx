"use client";

import ArticleReader from "@/components/article/ArticleReader";
import {useEffect, useState} from "react";
import {Spinner} from "@nextui-org/spinner";
import {IArticle} from "@/libs/db/dao/article/articleDAO";

export default function Page({ params }: { params: { id: string } }) {
    const [article, setArticle] = useState<IArticle>({
        _id: undefined,
        abstract: "",
        author: "",
        content: "",
        cover_url: "",
        create_date: undefined,
        is_request_pay: false,
        title: "",
        update_date: undefined
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchArticleContent();
    }, []);

    const fetchArticleContent = () => {
        console.log("fetchArticleContent")
        fetch("/api/article/"+params.id)
            .then((response) => response.json())
            .then((data) => {
                console.log("data:", data)
                const article = data.article;
                console.log("article:", article);
                setArticle(article)
                setIsLoading(false)
            });
    };

    return (
        <>
            {isLoading?<Spinner label="Loading..."/>:<ArticleReader article={article}/>}

        </>
    )
}