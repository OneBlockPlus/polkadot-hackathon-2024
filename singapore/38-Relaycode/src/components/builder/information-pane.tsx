import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface InformationPaneProps {
  extrinsic: any;
  onExtrinsicChange: (extrinsic: any) => void;
}

const InformationPane: React.FC<InformationPaneProps> = ({
  extrinsic,
  onExtrinsicChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [sectionHex, setSectionHex] = useState("");
  const [functionHex, setFunctionHex] = useState("");
  const [argsHex, setArgsHex] = useState<Array<{ name: string; hex: string }>>(
    []
  );
  const [encodedCallData, setEncodedCallData] = useState("");
  const [encodedCallHash, setEncodedCallHash] = useState("");

  useEffect(() => {
    if (extrinsic) {
      setSectionHex(extrinsic.method.sectionIndex.toString(16));
      setFunctionHex(extrinsic.method.methodIndex.toString(16));
      setArgsHex(
        extrinsic.method.args.map((arg: any, index: number) => ({
          name: extrinsic.method.meta.args[index].name,
          hex: arg.toHex(),
        }))
      );
      setEncodedCallData(extrinsic.method.toHex());
      setEncodedCallHash(extrinsic.method.hash.toHex());
    }
  }, [extrinsic]);

  const handleSectionHexChange = (value: string) => {
    setSectionHex(value);
    updateExtrinsicFromHex();
  };

  const handleFunctionHexChange = (value: string) => {
    setFunctionHex(value);
    updateExtrinsicFromHex();
  };

  const handleArgHexChange = (index: number, value: string) => {
    const newArgsHex = [...argsHex];
    newArgsHex[index].hex = value;
    setArgsHex(newArgsHex);
    updateExtrinsicFromHex();
  };

  const updateExtrinsicFromHex = () => {
    // This function needs to be implemented to update the extrinsic based on hex values
    // It will depend on how Dedot handles creating extrinsics from raw hex data
    // You might need to consult Dedot documentation or community for the exact implementation
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="editing-mode"
          checked={editing}
          onCheckedChange={setEditing}
        />
        <Label htmlFor="editing-mode">Enable Editing</Label>
      </div>

      <div>
        <Label htmlFor="section-hex">Section Hex</Label>
        <Input
          id="section-hex"
          value={sectionHex}
          onChange={(e) => handleSectionHexChange(e.target.value)}
          disabled={!editing}
        />
      </div>

      <div>
        <Label htmlFor="function-hex">Function Hex</Label>
        <Input
          id="function-hex"
          value={functionHex}
          onChange={(e) => handleFunctionHexChange(e.target.value)}
          disabled={!editing}
        />
      </div>

      {argsHex.map((arg, index) => (
        <div key={index}>
          <Label htmlFor={`arg-hex-${index}`}>{arg.name} Hex</Label>
          <Input
            id={`arg-hex-${index}`}
            value={arg.hex}
            onChange={(e) => handleArgHexChange(index, e.target.value)}
            disabled={!editing}
          />
        </div>
      ))}

      <div>
        <Label htmlFor="encoded-call-data">Encoded Call Data</Label>
        <Textarea id="encoded-call-data" value={encodedCallData} readOnly />
      </div>

      <div>
        <Label htmlFor="encoded-call-hash">Encoded Call Hash</Label>
        <Input id="encoded-call-hash" value={encodedCallHash} readOnly />
      </div>
    </div>
  );
};

export default InformationPane;
