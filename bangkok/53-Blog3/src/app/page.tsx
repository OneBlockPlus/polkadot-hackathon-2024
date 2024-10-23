"use client";

import {Button} from "@nextui-org/button";
import {useEffect, useState} from "react";
import {Link, Divider} from "@nextui-org/react";
import ArticleCardList from "@/components/article/ArticleCardList";
import {CircularProgress} from "@nextui-org/react";

export default function Page() {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLatestArticle = () => {
        fetch("/api/article/")
            .then((response) => response.json())
            .then((data) => {
                // console.log("data:", data)
                setIsLoading(false);
                setArticles(data.articles);
            });
    };

    useEffect(() => {
        fetchLatestArticle();
    }, []);

    return (
        <>
            {isLoading ? (
                <div className="grid justify-items-center">
                    <CircularProgress label="Loading..." className="text-white/90"/>
                </div>
            ) : (
                <>
                    <div className="content-center">
                        <ArticleCardList articles={articles}/>
                    </div>
                    <Divider className="my-4"/>
                    <div className="grid justify-items-center">
                        <Button as={Link} color="primary" href="/article/edit">New Article</Button>
                    </div>
                </>
            )}
        </>
    );
}