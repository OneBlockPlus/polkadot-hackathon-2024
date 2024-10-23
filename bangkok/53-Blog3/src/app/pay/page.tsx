"use client";

import {useEffect, useState} from "react";
import {IPay} from "@/libs/db/dao/pay/payDao";
import PayTable from "@/components/pay/PayTable";
import {Spinner} from "@nextui-org/spinner";

export default function Page() {
    const [payList, setPayList] = useState<IPay[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPayContent = () => {
        fetch("/api/pay/")
            .then((response) => response.json())
            .then((data) => {
                const payList = data.data;
                setPayList(payList)
                setIsLoading(false)
            });
    };
    useEffect(() => {
        fetchPayContent();
    }, []);

    return (
        <>
            {isLoading?<p><Spinner label="Loading..."/></p>:<PayTable payList={payList}/>}
        </>
    )
}