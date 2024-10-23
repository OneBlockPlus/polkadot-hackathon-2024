"use client";

import ArticleReader from "@/components/article/ArticleReader";
import {useEffect, useState} from "react";

export default function Page({ params }: { params: { id: string } }) {
    const [article, setArticle] = useState(undefined);

    useEffect(() => {
        fetchArticleContent();
    }, []);

    const fetchArticleContent = () => {
        fetch("/api/article/"+params.id)
            .then((response) => response.json())
            .then((data) => {
                // console.log("data:", data)
                const article = data.article;
                // console.log("article:", article);
                setArticle(article)
            });
    };

    return (
        <>
            <ArticleReader article={article}/>
        </>
    )
}