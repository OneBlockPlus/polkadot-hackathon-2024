import React, { useState, useEffect } from "react";
import { DedotClient } from "dedot";
import { PolkadotApi } from "@dedot/chaintypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ExtrinsicBuilderProps {
  client: DedotClient<PolkadotApi>;
  onExtrinsicChange: (extrinsic: any) => void;
}

const ExtrinsicBuilder: React.FC<ExtrinsicBuilderProps> = ({
  client,
  onExtrinsicChange,
}) => {
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [methods, setMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [args, setArgs] = useState<any[]>([]);

  useEffect(() => {
    if (client) {
      const availableSections = Object.keys(client.tx);
      setSections(availableSections);
    }
  }, [client]);

  useEffect(() => {
    if (client && selectedSection) {
      const availableMethods = Object.keys(client.tx[selectedSection]);
      setMethods(availableMethods);
    }
  }, [client, selectedSection]);

  useEffect(() => {
    if (
      client &&
      selectedSection &&
      selectedMethod &&
      client.tx[selectedSection][selectedMethod]?.meta
    ) {
      const methodArgs = client.tx[selectedSection][selectedMethod].meta.fields;
      setArgs(
        methodArgs.map((arg) => ({
          name: arg.name,
          type: arg.typeName,
          value: "",
        }))
      );
    }
  }, [client, selectedSection, selectedMethod]);

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    setSelectedMethod("");
    setArgs([]);
  };

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value);
  };

  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index].value = value;
    setArgs(newArgs);
  };

  const buildExtrinsic = () => {
    if (client && selectedSection && selectedMethod) {
      const extrinsic = client.tx[selectedSection][selectedMethod](
        ...args.map((arg) => arg.value)
      );
      onExtrinsicChange(extrinsic);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="section-select">Select Section</Label>
        <Select onValueChange={handleSectionChange}>
          <SelectTrigger id="section-select">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSection && (
        <div>
          <Label htmlFor="method-select">Select Method</Label>
          <Select onValueChange={handleMethodChange}>
            <SelectTrigger id="method-select">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {methods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {args.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Arguments</h3>
          {args.map((arg, index) => (
            <div key={index}>
              <Label htmlFor={`arg-${index}`}>
                {arg.name} ({arg.type})
              </Label>
              <Input
                id={`arg-${index}`}
                type="text"
                value={arg.value}
                onChange={(e) => handleArgChange(index, e.target.value)}
                placeholder={`Enter ${arg.name}`}
              />
            </div>
          ))}
        </div>
      )}

      <Button onClick={buildExtrinsic}>Build Extrinsic</Button>
    </div>
  );
};

export default ExtrinsicBuilder;
