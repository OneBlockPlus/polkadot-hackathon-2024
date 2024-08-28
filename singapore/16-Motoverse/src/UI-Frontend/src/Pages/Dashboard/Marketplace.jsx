import React, { useEffect, useState } from "react";
import { usePolkaContext } from "../../context/PolkaContext";
import MarketCard from "./MarketCard";
import Input from "../../Components/Common/Input";
import Button from "../../Components/Common/Buttons/Button";
import { web3FromSource } from "@polkadot/extension-dapp";

const Marketplace = () => {
  const {
    setCarDetails,
    carDetails,
    setOwnerInfo,
    setImagesLinks,
    selectedAccount,
  } = usePolkaContext();
  const [collectionId, setCollectionId] = useState("");
  const [itemId, setItemId] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const { api, getApi } = usePolkaContext();
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    const fetchApi = async () => {
      await getApi();
    };
    fetchApi();
  }, [getApi]);

  const fetchIPFSData = async (metadata) => {
    try {
      const vehicleDetailsResponse = await fetch(metadata.vehicleDetails);
      const vehicleOwnerResponse = await fetch(metadata.vehicleOwner);
      const vehicleImagesResponse = await fetch(metadata.vehicleImages);

      // Check if responses are okay and parse as JSON
      if (!vehicleDetailsResponse.ok)
        throw new Error("Failed to fetch vehicle details");
      if (!vehicleOwnerResponse.ok)
        throw new Error("Failed to fetch vehicle owner");
      if (!vehicleImagesResponse.ok)
        throw new Error("Failed to fetch vehicle images");

      const vehicleDetails = await vehicleDetailsResponse.json();
      const vehicleOwner = await vehicleOwnerResponse.json();
      const vehicleImages = await vehicleImagesResponse.json();

      console.log("Vehicle Details:", vehicleDetails);
      console.log("Vehicle Owner:", vehicleOwner);
      console.log("Vehicle Images:", vehicleImages);

      return { vehicleDetails, vehicleOwner, vehicleImages };
    } catch (error) {
      console.error("Error fetching IPFS data:", error);
      setError("Failed to fetch IPFS data. Please try again.");
    }
  };

  const getNFTs = async (e) => {
    e.preventDefault();

    if (!api) {
      alert("API not available");
      return;
    }

    try {
      const nftMetadataResult = await api.query.nfts.itemMetadataOf(
        collectionId,
        itemId
      );

      if (nftMetadataResult.isEmpty) {
        setError(
          "The NFT does not exist. Please try a different collection or item ID."
        );
        return;
      }

      const metadata = nftMetadataResult.toHuman();
      console.log("Metadata URL:", metadata.data);

      const response = await fetch(metadata.data);

      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Failed to fetch data from URL");
      }

      // Parse the response as JSON
      const jsonData = await response.json();
      console.log("Fetched JSON Data:", jsonData);

      // Fetch and handle the data from IPFS
      const fetchedData = await fetchIPFSData(jsonData);

      if (fetchedData) {
        setCarDetails(fetchedData.vehicleDetails);
        setOwnerInfo(fetchedData.vehicleOwner);
        setImagesLinks(fetchedData.vehicleImages);

        setData([jsonData]);
        setError("");
      }

      setIsDataFetched(true); //
    } catch (error) {
      console.error("Error fetching the NFT:", error);
      setError(
        "An error occurred while fetching the NFT. Please try again later."
      );
    }
  };

  const [newOwner, setNewOwner] = useState(null);
  // transfer: Send an item to a new owner.
  const transfer = async (e) => {
    e.preventDefault();

    const injector = await web3FromSource(selectedAccount.meta.source);
    const unsub = await api.tx.nfts
      .transfer(collectionId, itemId, newOwner)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;
              console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
              alert(`Error: ${section}.${name}: ${docs.join(" ")}`);
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
              alert(`Error: ${dispatchError.toString()}`);
            }
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Events:");

            // Procesar eventos para mostrar información en lenguaje humano
            events.forEach(({ event: { method, section, data } }) => {
              const humanData = data.toHuman();
              console.log(`\t ${section}.${method}: ${humanData}`);

              // Mostrar una alerta con los datos relevantes
              alert(
                `Event: ${section}.${method}\nData: ${JSON.stringify(humanData, null, 2)}`
              );
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );
    console.log(transfer);
  };

  // transfer_ownership: Alter the owner of a
  //collection, moving all associated deposits. (Ownership of
  // individual items will not be affected.)
  const transferOwnnership = async (e) => {
    e.preventDefault();
    const injector = await web3FromSource(selectedAccount.meta.source);

    const unsub = await api.tx.nfts
      .transferOwnnership(collectionId, itemId, newOwner)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;
              console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
              alert(`Error: ${section}.${name}: ${docs.join(" ")}`);
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
              alert(`Error: ${dispatchError.toString()}`);
            }
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Events:");

            // Procesar eventos para mostrar información en lenguaje humano
            events.forEach(({ event: { method, section, data } }) => {
              const humanData = data.toHuman();
              console.log(`\t ${section}.${method}: ${humanData}`);

              // Mostrar una alerta con los datos relevantes
              alert(
                `Event: ${section}.${method}\nData: ${JSON.stringify(humanData, null, 2)}`
              );
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );
  };

  // set_price: Set the price for an item.
  const setPrice = async (e) => {
    e.preventDefault();
    const injector = await web3FromSource(selectedAccount.meta.source);

    const unsub = await api.tx.nfts
      .setPrice(collectionId, itemId, 1, 0)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;
              console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
              alert(`Error: ${section}.${name}: ${docs.join(" ")}`);
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
              alert(`Error: ${dispatchError.toString()}`);
            }
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Events:");

            // Procesar eventos para mostrar información en lenguaje humano
            events.forEach(({ event: { method, section, data } }) => {
              const humanData = data.toHuman();
              console.log(`\t ${section}.${method}: ${humanData}`);

              // Mostrar una alerta con los datos relevantes
              alert(
                `Event: ${section}.${method}\nData: ${JSON.stringify(humanData, null, 2)}`
              );
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );
    // console.log(transfer)
  };

  // buy_item: Buy an item.
  const buyNFT = async (e) => {
    e.preventDefault();
    const injector = await web3FromSource(selectedAccount.meta.source);

    console.log(api.tx.nfts);

    const unsub = await api.tx.nfts
      .buyItem(collectionId, itemId, 120000000000000, 0)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;
              console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
              alert(`Error: ${section}.${name}: ${docs.join(" ")}`);
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
              alert(`Error: ${dispatchError.toString()}`);
            }
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Events:");

            // Procesar eventos para mostrar información en lenguaje humano
            events.forEach(({ event: { method, section, data } }) => {
              const humanData = data.toHuman();
              console.log(`\t ${section}.${method}: ${humanData}`);

              // Mostrar una alerta con los datos relevantes
              alert(
                `Event: ${section}.${method}\nData: ${JSON.stringify(humanData, null, 2)}`
              );
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );
  };

  // create_swap: Create an offer to swap an NFT for another NFT and optionally some fungibles.
  const createSwap = async (e) => {
    e.preventDefault();
    const injector = await web3FromSource(selectedAccount.meta.source);

    const unsub = await api.tx.nfts
      .createSwap(collectionId, itemId, 12, 0)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;
              console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
              alert(`Error: ${section}.${name}: ${docs.join(" ")}`);
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
              alert(`Error: ${dispatchError.toString()}`);
            }
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Events:");

            // Procesar eventos para mostrar información en lenguaje humano
            events.forEach(({ event: { method, section, data } }) => {
              const humanData = data.toHuman();
              console.log(`\t ${section}.${method}: ${humanData}`);

              // Mostrar una alerta con los datos relevantes
              alert(
                `Event: ${section}.${method}\nData: ${JSON.stringify(humanData, null, 2)}`
              );
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );
  };

  // Handle transaction status, common for all actions
  const handleTransactionStatus = (status, events, dispatchError) => {
    console.log(`Transaction status: ${status.type}`);

    if (dispatchError) {
      if (dispatchError.isModule) {
        const decoded = api.registry.findMetaError(dispatchError.asModule);
        const { docs, name, section } = decoded;
        console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
        alert(`Error: ${section}.${name}: ${docs.join(" ")}`);
      } else {
        console.error(`Error: ${dispatchError.toString()}`);
        alert(`Error: ${dispatchError.toString()}`);
      }
    }

    if (status.isInBlock) {
      console.log(`Included at block hash: ${status.asInBlock}`);
      console.log("Events:");

      // Process events to display human-readable information
      events.forEach(({ event: { method, section, data } }) => {
        const humanData = data.toHuman();
        console.log(`\t ${section}.${method}: ${humanData}`);

        // Show an alert with relevant data
        alert(
          `Event: ${section}.${method}\nData: ${JSON.stringify(humanData, null, 2)}`
        );
      });
    } else if (status.isFinalized) {
      console.log(`Finalized block hash: ${status.asFinalized}`);
    }
  };

  return (
    <div className="mx-auto self-stretch w-full flex flex-col p-4 items-center gap-4 rounded-2xl bg-white">
      <div className="flex flex-col items-start gap-10 font-manrope">
        <h3 className="text-4xl font-bold">
          gm! Welcome to Motoverse Marketplace.
        </h3>

        {isDataFetched && carDetails ? <MarketCard /> : ""}

        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full max-w-md">
          <label
            className="block text-black text-sm font-bold"
            htmlFor="collectionId"
          >
            Collection ID:
          </label>
          <Input
            id="collectionId"
            type="number"
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full max-w-md h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md focus:outline-none focus:ring-0"
            placeholder="Enter Collection ID"
          />
        </div>

        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full max-w-md">
          <label
            className="block text-black text-sm font-bold mt-4"
            htmlFor="itemId"
          >
            Item ID:
          </label>
          <Input
            id="itemId"
            type="number"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full max-w-md h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md focus:outline-none focus:ring-0"
            placeholder="Enter Item ID"
          />
        </div>

        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full max-w-md">
         

        <Button
          onClick={getNFTs}
          cta="Search NFT"
          className="w-full max-w-md"
        />

        {error && (
          <div className="text-red-600">
            <p className="text-xl">{error}</p>
          </div>
        )}

        
      </div>
      <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full max-w-md">
      <label
            className="block text-black text-sm font-bold mt-4"
            htmlFor="itemId"
          >
            New Owner:
          </label>
          <Input
            id="newOwner"
            type="text"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="w-full h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md focus:outline-none focus:ring-0"
            placeholder="Enter newOwner"
          />
        </div>
        <Button onClick={transfer} cta="Transfer" className="w-full" />
       
      </div>

      {/* <div className="flex">
      <Button onClick={setPrice} cta="Set Price" className="w-full" />
        <Button onClick={buyNFT} cta="Buy NFT" className="w-full" />
        <Button
          onClick={transferOwnnership}
          cta="Transfer Collection Ownership"
          className="w-full"
        />
        <Button onClick={createSwap} cta="Create Swap" className="w-full" />
      </div> */}
    </div>
  );
};

export default Marketplace;
