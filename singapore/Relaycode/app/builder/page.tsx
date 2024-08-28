"use client";

import React, { useState, useEffect } from "react";
import { DedotClient, WsProvider } from "dedot";
import { PolkadotApi } from "@dedot/chaintypes";
import ExtrinsicBuilder from "@/components/builder/extrinsic-builder";
import InformationPane from "@/components/builder/information-pane";

const BuilderPage: React.FC = () => {
  const [client, setClient] = useState<DedotClient<PolkadotApi> | null>(null);
  const [extrinsic, setExtrinsic] = useState<any>(null);

  useEffect(() => {
    const initClient = async () => {
      const provider = new WsProvider("wss://rpc.polkadot.io");
      const newClient = await DedotClient.new<PolkadotApi>(provider);
      setClient(newClient);
    };

    initClient();

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  const handleExtrinsicChange = (newExtrinsic: any) => {
    setExtrinsic(newExtrinsic);
  };

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Extrinsic Builder</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ExtrinsicBuilder
            client={client}
            onExtrinsicChange={handleExtrinsicChange}
          />
        </div>
        <div>
          <InformationPane
            extrinsic={extrinsic}
            onExtrinsicChange={handleExtrinsicChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
