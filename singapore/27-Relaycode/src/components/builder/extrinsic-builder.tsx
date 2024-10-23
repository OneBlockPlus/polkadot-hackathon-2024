"use client";
import React, { useState, useEffect, use } from "react";
import { GenericExtrinsic as Extrinsic, getTypeDef } from "@polkadot/types";
import { useApi } from "@/context/api";
import { useKeyring } from "@/context/keyring";
import { Signer } from "@polkadot/api/types";
import { toast } from "sonner";
import { createMethodOptions, createSectionOptions } from "@/lib/parser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";

declare global {
  interface Window {
    injected: {
      enable: () => Promise<string[]>;
      version: string;
      signer: Signer;
    };
  }
}

export interface Method {
  section: string;
  method: string;
  args: any[];
}

interface ExtrinsicBuilderProps {
  onExtrinsicChange: (extrinsic: Extrinsic) => void;
}

const ExtrinsicBuilder: React.FC<ExtrinsicBuilderProps> = ({
  onExtrinsicChange,
}) => {
  const { api } = useApi();
  const { account } = useKeyring();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [dropdownOpenSection, setDropdownOpenSection] = useState(false);
  const [dropdownOpenMethod, setDropdownOpenMethod] = useState(false);
  const [args, setArgs] = useState<{ name: string; value: string | null }[]>(
    []
  );

  useEffect(() => {
    if (api) {
      const sectionOptions = createSectionOptions(api);
      setSections(sectionOptions.map((sectionOption) => sectionOption.value));
    }
  }, [api]);

  useEffect(() => {
    if (api && selectedSection) {
      setMethods(createMethodOptions(api, selectedSection));
    }
  }, [api, selectedSection]);

  useEffect(() => {
    if (api && selectedMethod) {
      const extrinsic = api.tx[selectedMethod.section][selectedMethod.method](
        ...args.map((arg) => arg.value)
      );
      onExtrinsicChange(extrinsic);
    }
  }, [api, selectedMethod, args]);

  const toggleSection = () => setDropdownOpenSection((prevState) => !prevState);
  const toggleMethod = () => setDropdownOpenMethod((prevState) => !prevState);

  const selectSection = (section: string) => {
    setSelectedSection(section);
    setSelectedMethod(null);
  };

  const selectMethod = (method: Method) => {
    setSelectedMethod(method);
    setArgs(
      method.args.map((arg) => ({ name: arg.name.toString(), value: null }))
    );
  };

  const updateArg = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index].value = value;
    setArgs(newArgs);
  };

  const signAndSubmitExtrinsic = async () => {
    if (!selectedMethod || !account || !window.injected || !api) return;

    const { section, method, args } = selectedMethod;

    const extrinsic = api.tx[section][method](
      ...args.map((arg, index) => {
        const input = args[index];
        return input.value || input.placeholder || "";
      })
    );

    const signer = window.injected.signer as Signer;
    api.setSigner(signer);

    try {
      const unsub = await extrinsic.signAndSend(account.address, (result) => {
        toast.info("Extrinsic status: " + result.status.toString);
        if (result.status.isFinalized) {
          toast.success(
            "Extrinsic finalized at block: " +
              result.status.asFinalized.toString()
          );
          unsub();
        }
      });
    } catch (error) {
      toast.error("Error signing and sending extrinsic: " + error);
    }
  };

  return (
    <div>
      <h3>Select Extrinsic</h3>
      <h4>Choose a section:</h4>
      {/* use select from shadcn instead of dropdown */}
      <Select>
        <SelectTrigger>
          <SelectValue>{selectedSection || "Select Section"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sections.map((section, index) => (
            <SelectItem
              key={index}
              onClick={() => selectSection(section)}
              value={section}
            ></SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSection && (
        <>
          <h4>Select Section Method:</h4>
          <Select>
            <SelectTrigger>
              <SelectValue>
                {selectedMethod ? selectedMethod.method : "Select Method"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {methods.length ? (
                methods.map((method, index) => (
                  <SelectItem
                    key={index}
                    onClick={() => selectMethod(method)}
                    value={`${method.section}.${method.method}`}
                  >
                    {method.section}.{method.method}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="No methods" />
              )}
            </SelectContent>
          </Select>
        </>
      )}

      {selectedMethod && (
        <div>
          <h3>Parameters</h3>
          {args.map((arg, index) => (
            <div
              key={index}
              className="grid w-full max-w-sm items-center gap-1.5"
            >
              <Label htmlFor={arg.name}>{arg.name}</Label>
              <Input
                type="text"
                name={arg.name}
                id={arg.name}
                placeholder={`Enter ${arg.name}`}
                onChange={(e) => updateArg(index, e.target.value)}
              />
            </div>
          ))}
          {account && (
            <Button size={"lg"} onClick={signAndSubmitExtrinsic}>
              Sign and Submit
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtrinsicBuilder;
