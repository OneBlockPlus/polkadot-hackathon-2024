import React from "react";
import { Button, Form, Input, InputNumber, Modal, Skeleton, Spin } from "antd";
import { useState } from "react";
import dynamic from "next/dynamic";
import queueNotification from "./QueueNotification";
import { web3FromSource } from "@polkadot/extension-dapp";
import classNames from "classnames";
import useUserDetailsContext from "../context";
import { useApiContext } from "../context/ApiContext";
import nextApiClientFetch from "../utils/nextApiClientFetch";
import { NotificationStatus } from "../types";
import executeTx from "../utils/executed";
const ConnectWallet = dynamic(() => import("./ConnectWallet"), {
  ssr: false,
  loading: () => <Skeleton.Button active />,
});

const TextEditor = dynamic(() => import("./TextEditor"), {
  ssr: false,
  loading: () => <Skeleton active />,
});

const network = process.env.PUBLIC_NETWORK;

const CreateMemeCoin = ({ className }: { className?: string }) => {
  const { loginAddress, accounts } = useUserDetailsContext();
  const { api, apiReady } = useApiContext();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [content, setContent] = useState("");
  const [laoding, setLoading] = useState(false);

  const handleOffChainCall = async (values: {
    symbol: string;
    logoUrl: string;
    totalSupply: number;
    mintLimit: number;
    title: string;
    content: string;
  }) => {
    const { data, error } = await nextApiClientFetch<{ message: string }>(
      "/api/createCoin",
      {
        name: values.symbol,
        logoImage: values.logoUrl,
        totalSupply: values.totalSupply,
        limit: values.mintLimit,
        title: values.title,
        content: values.content,
        proposer: loginAddress,
      },
    );
    if (data) {
      queueNotification({
        header: "Success!",
        message: data?.message || "hello",
        status: NotificationStatus.SUCCESS,
      });
      setIsModalVisible(false);
    }
    if (error) {
      queueNotification({
        header: "Error!",
        message: error || "",
        status: NotificationStatus.ERROR,
      });
      console.error("Error Creating Meme Token:", error);
    }
  };

  const handleSubmit = async (values: {
    symbol: string;
    logoUrl: string;
    totalSupply: number;
    mintLimit: number;
    title: string;
    content: string;
  }) => {
    if (!api || !apiReady) return;
    setLoading(true);

    const payload = {
      p: process.env.CURRENT_NET,
      op: "deploy",
      tick: values?.symbol,
      max: `${values?.totalSupply}`,
      lim: `${values?.mintLimit}`,
    };
    const remarkTx = api.tx.system.remarkWithEvent(JSON.stringify(payload));

    const injector = await web3FromSource(
      accounts.find((acc) => acc.address === loginAddress)?.meta?.source,
    );
    const signer = injector.signer;

    await executeTx({
      api: api,
      apiReady: true,
      network: network || "polkadot",
      tx: remarkTx,
      address: loginAddress,
      params: { signer },
      onSuccess: async (txHash: string) => {
        setIsModalVisible(true);
        await handleOffChainCall(values);
        console.log({ txHash });
        setLoading(false);
      },
      errorMessageFallback: "Token creation failed.",
      onFailed: async (err) => {
        setLoading(false);
        queueNotification({
          header: "Error!",
          message: err,
          status: NotificationStatus.ERROR,
        });
      },
    });
  };

  return (
    <div className={className}>
      <Button
        onClick={() => setIsModalVisible(!isModalVisible)}
        className={classNames(
          "h-12 bg-primaryButton text-white text-base font-medium w-[300px] tracking-wide cursor-pointer",
        )}
      >
        Create Meme Token
      </Button>

      <Modal
        title="Create MEME Token"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <div
          style={{
            padding: "10px 10px",
          }}
        >
          {!loginAddress?.length ? (
            <ConnectWallet className="w-full flex items-center -ml-2 mt-2" />
          ) : (
            <Spin spinning={laoding}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ textAlign: "left" }}
              >
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                    { required: true, message: "Please enter the title" },
                  ]}
                >
                  <Input
                    placeholder="e.g., MEME Token"
                    className="h-10 w-full"
                  />
                </Form.Item>
                <Form.Item
                  label="Content"
                  name="content"
                  rules={[
                    { required: true, message: "Please enter the content" },
                  ]}
                >
                  <TextEditor
                    value={content}
                    onChange={setContent}
                    height={200}
                    isPreview={false}
                  />
                </Form.Item>

                <Form.Item
                  label="Token Symbol"
                  name="symbol"
                  rules={[
                    {
                      required: true,
                      message: "Invalid character found!",
                      validator(rule, value, callback) {
                        const format = /^[a-zA-Z0-9_@-]*$/;

                        if (callback && !format.test(value)) {
                          callback(rule?.message?.toString());
                        } else {
                          callback();
                        }
                      },
                    },
                  ]}
                >
                  <Input placeholder="e.g., DOT, KSM" className="h-10 w-full" />
                </Form.Item>
                <Form.Item
                  label="Token Logo URL"
                  name="logoUrl"
                  rules={[
                    { required: true, message: "Please enter the logo URL" },
                  ]}
                >
                  <Input
                    placeholder="e.g., https://example.com/logo.png"
                    className="h-10 w-full"
                  />
                </Form.Item>

                <Form.Item
                  label="Total Supply"
                  name="totalSupply"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the total supply",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 1000000"
                    className="w-full h-10"
                    min={1}
                  />
                </Form.Item>

                <Form.Item
                  label="Limit per Mint"
                  name="mintLimit"
                  rules={[
                    { required: true, message: "Please enter the mint limit" },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 100"
                    className="w-full h-10"
                    min={1}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-10 text-base font-medium bg-primaryButton"
                  >
                    Create Token
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreateMemeCoin;
