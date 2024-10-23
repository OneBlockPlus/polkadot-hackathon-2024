"use client";


import {useEffect, useState} from "react";
import {default_avatar_url, IUser} from "@/libs/db/dao/user/userDao";
import UserCardHover from "@/components/user/UserCardHover";

export default function Page() {
  const [user, setUser] = useState<IUser>({
    _id: "-1",
    address: "undefined",
    avatar_url: default_avatar_url,
    create_date: new Date(),
    description: "undefined",
    name: "undefined",
    update_date: new Date(),
  });
  const author = "5H6HscWQxLfU2TcnLn9g81cjhcCN25FxLMSK3qbyYknZ7va4";

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
      <UserCardHover user={user}/>
  )
}