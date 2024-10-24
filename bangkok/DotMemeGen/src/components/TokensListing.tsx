import { Pagination, Table } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkOutlined } from "@ant-design/icons";

import Address from "./Address";
import dayjs from "dayjs";
import Link from "next/link";
import nextApiClientFetch from "../utils/nextApiClientFetch";
import { ICoin, LISTING_LIMIT } from "../types";

interface Props {
  className?: string;
}

const TokensListing = ({ className }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [tokensData, setTokensData] = useState<ICoin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getAllTokens = async () => {
    setLoading(true);
    const { data, error } = await nextApiClientFetch<{
      data: ICoin[];
      totalCount: number;
    }>("/api/getAllCoins", {
      page: page || 1,
    });
    if (data) {
      setTokensData(data?.data || []);
      setTotalCount(data?.totalCount || 0);
    } else {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAllTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => (
        <div>{dayjs(createdAt).format("D MMM 'YY")}</div>
      ),
    },
    {
      title: "Author",
      dataIndex: "proposer",
      key: "proposer",
      render: (proposer: string) => (
        <Address address={proposer} maxLength={8} />
      ),
    },
    {
      title: "Minted Addresses",
      dataIndex: "mintCount",
      key: "namintCountme",
    },
    {
      title: "Total Supply",
      dataIndex: "totalSupply",
      key: "totalSupply",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string) => <div>{title}</div>,
    },
    {
      title: "Redirect",
      dataIndex: "",
      key: "redirect",
      render: (data: ICoin) => (
        <Link
          href={`/meme-tokens/${data?.name}`}
          className="text-primaryButton text-base cursor-pointer hover:text-primaryButton"
        >
          <LinkOutlined />
        </Link>
      ),
    },
  ];

  return (
    <div className={className}>
      <label className="text-2xl font-semibold text-primaryText">
        Meme Tokens ({totalCount || 0})
      </label>
      <Table
        dataSource={tokensData?.map((item) => {
          return { ...item, key: item?.name };
        })}
        columns={columns}
        className="mt-4"
        pagination={false}
        loading={loading}
      />
      <div className="flex items-center justify-center mt-6">
        {totalCount > 10 && (
          <Pagination
            pageSize={LISTING_LIMIT}
            current={typeof page == "string" ? Number(page) : page || 1}
            total={totalCount}
            onChange={(page) => router.push(`/?page=${page}`)}
          />
        )}
      </div>
    </div>
  );
};

export default TokensListing;
