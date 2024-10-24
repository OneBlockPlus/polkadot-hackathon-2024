"use client";

import React from "react";
import { Layout, Skeleton } from "antd";
import dynamic from "next/dynamic";

const CreateMemeCoin = dynamic(() => import("../components/CreateMemeToken"), {
  ssr: false,
  loading: () => <Skeleton.Button active />,
});

const Navbar = dynamic(() => import("../components/Navbar"), {
  ssr: false,
});

const TokensListing = dynamic(() => import("../components/TokensListing"), {
  ssr: false,
});

const { Content } = Layout;

const LandingPage = () => {
  return (
    <Layout style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <Navbar />
      <Content
        style={{
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CreateMemeCoin className="w-full flex items-end justify-end" />
        <TokensListing className="w-full" />
      </Content>

      <style jsx>{`
        .table-row-light {
          background-color: #f9f9f9;
        }
        .table-row-dark {
          background-color: #e0e0e0;
        }
        .ant-table-tbody > tr:hover {
          background-color: #d3d3d3;
        }
      `}</style>
    </Layout>
  );
};

export default LandingPage;
