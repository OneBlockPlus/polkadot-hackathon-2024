"use client";

import {useState, useEffect} from "react";
import ArticleTable from "@/components/article/ArticleTable";
import {Spinner} from "@nextui-org/spinner";
import {Button} from "@nextui-org/react";

export default function FollowArticleTable() {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFollowArticle = () => {
        fetch("/api/article/")
            .then((response) => response.json())
            .then((data) => {
                // console.log("data:", data)
                setIsLoading(false);
                setArticles(data.articles);
            });
    };

    useEffect(() => {
        fetchFollowArticle();
    }, []);


    return (
        <>
            <Button onPress={fetchFollowArticle}>Refresh</Button>
            {isLoading ? <Spinner label="Loading..."/>:<ArticleTable articleList={articles}/>}
        </>
    )
}