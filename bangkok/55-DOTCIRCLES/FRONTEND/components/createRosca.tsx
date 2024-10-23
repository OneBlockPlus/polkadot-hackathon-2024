"use client";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { myAddress } from "@/app/lib/mock";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";

import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import { useEffect, useState } from "react";
import { NameMap } from "@/app/lib/mock";

export default function CreateRosca() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  const [circleName, setCircleName] = useState("");
  const [startBy, setStartBy] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionFrequency, setContributionFrequency] = useState("");
  const [minParticipants, setMinParticipants] = useState("");
  const [randomOrder, setRandomOrder] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([
    "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
    "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
  ]);

  useEffect(() => {
    const initApi = async () => {
      try {
        // Initialize the provider to connect to the node
        const provider = new WsProvider(process.env.NEXT_PUBLIC_RPC);

        // Create the API and wait until ready
        const api = await ApiPromise.create({ provider });
        await api.isReady;

        // Update state
        setApi(api);
        setIsApiReady(true);
      } catch (error) {
        console.error("Failed to initialize API", error);
      }
    };

    initApi();

    // Cleanup when the component unmounts
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  const handleCreate = async () => {
    if (!isApiReady) {
      console.log("API is not ready");
      return;
    }

    try {
      const extensions = await web3Enable("DOTCIRCLES");
      const acc = await web3FromAddress(myAddress);

      const tx = api!.tx.rosca.createRosca(
        randomOrder,
        selectedParticipants,
        minParticipants,
        contributionAmount,
        contributionFrequency,
        startBy,
        null,
        circleName
      );

      const hash = await tx.signAndSend(myAddress, {
        signer: acc.signer,
        nonce: -1,
      });
    } catch (error) {
      console.error("Failed to submit extrinsic", error);
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">
        Create a new circle
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Saving Circle Information
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Enter Saving Circle name"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  variant="bordered"
                />
                <Checkbox
                  isSelected={randomOrder}
                  onChange={(e) => setRandomOrder(e.target.checked)}
                  classNames={{
                    label: "text-small",
                  }}
                >
                  Random Order
                </Checkbox>
                <Input
                  label="Start"
                  placeholder="Enter start by block"
                  value={startBy}
                  onChange={(e) => setStartBy(e.target.value)}
                  variant="bordered"
                />
                <Input
                  label="Contribution Amount"
                  placeholder="Enter contribution frequency"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  variant="bordered"
                />
                <Input
                  label="Contribution Frequency"
                  placeholder="Enter contribution frequency"
                  value={contributionFrequency}
                  onChange={(e) => setContributionFrequency(e.target.value)}
                  variant="bordered"
                />
                <CheckboxGroup
                  label="Select participants"
                  color="warning"
                  value={selectedParticipants}
                  onValueChange={setSelectedParticipants}
                >
                  <Checkbox value="5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY">
                    Alice Simmons
                  </Checkbox>
                  <Checkbox value="5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc">
                    Bob Jacobs
                  </Checkbox>
                  <Checkbox value="5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y">
                    Charlie Rush
                  </Checkbox>
                  <Checkbox value="5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy">
                    Dave Broad
                  </Checkbox>
                </CheckboxGroup>
                <Input
                  label="Min Participants"
                  placeholder="Enter minimum participants"
                  value={minParticipants}
                  onChange={(e) => setMinParticipants(e.target.value)}
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleCreate}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
