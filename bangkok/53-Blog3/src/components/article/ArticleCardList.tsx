import {IArticle} from "@/libs/db/dao/article/articleDAO";
import React from "react";
import ArticleCard from "@/components/article/ArticleCard";
import {IUserInsert} from "@/libs/db/dao/user/userInsertDAO";
import {Date} from "@polkadot/types-codec";
import {shortAddress} from "@/libs/helper";

interface ArticleCardListProps {
    articles: IArticle[],
}

export default function ArticleCardList(props: ArticleCardListProps) {
    return (
        <div className="flex gap-4">
            {
                props.articles.map((article: IArticle) => (
                        <ArticleCard key={article._id.toString()} article={article}/>
                    )
                )
            }
        </div>
    )
}