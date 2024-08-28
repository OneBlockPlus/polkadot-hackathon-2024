"use client";

import React, { useState, useEffect } from "react";
import { GenericExtrinsic } from "@polkadot/types";
import ExtrinsicBuilder from "@/components/builder/extrinsic-builder";
import InformationPane from "@/components/builder/information-pane";

const BuilderPage: React.FC = () => {
  const [extrinsic, setExtrinsic] = useState<GenericExtrinsic | null>(null);

  const handleExtrinsicChange = (newExtrinsic: GenericExtrinsic) => {
    setExtrinsic(newExtrinsic);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Extrinsic Builder</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ExtrinsicBuilder onExtrinsicChange={handleExtrinsicChange} />
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
