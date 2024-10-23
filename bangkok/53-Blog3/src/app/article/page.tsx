"use client";

import React, { useState, useEffect } from "react";
import {Button, Link} from "@nextui-org/react";
import ArticleTable from "@/components/article/ArticleTable";
import ArticleCardList from "@/components/article/ArticleCardList";

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

  if (isLoading) {
      return (
          <>
              Loading
          </>
      );
  }else {
      // return (
      //     <Button type="primary" onClick={() => {
      //         console.log("articles:", articles)
      //     }}>Test</Button>
      // )
      return (
          <>
              <Button as={Link} color="primary" href="/article/edit">New Article</Button>
              <ArticleCardList articles={articles}/>
              <ArticleTable articleList={articles}/>
          </>
      );
  }
}