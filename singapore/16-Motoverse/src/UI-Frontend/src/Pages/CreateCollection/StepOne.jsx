import Button from "../../Components/Common/Buttons/Button";
import createCollection from "../../utils/nft/collection/create";
import { usePolkaContext } from "../../context/PolkaContext";

const StepOne = () => {
  const { setSelectedTabSteps } = usePolkaContext();
  const { api, selectedAccount } = usePolkaContext();

  const handleCreateCollection = async (event) => {
    event.preventDefault();
    if (!api) {
      alert("Api is not connected");
    } else if (!selectedAccount) {
      alert("Connect a Wallet");
    } else {
      try {
        const collection = await createCollection(api, selectedAccount);
        console.log(collection);
        handleNextTab()
        return collection;
      } catch (e) {
        console.log(e);
      }
    }
  };
  const handleNextTab = () => {
    setSelectedTabSteps(1);
  };
  return (
    <div>
      {" "}
      <p>Create Collection with a Polkadot Wallet</p>
      <button onClick={handleCreateCollection} 
         className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
      cta="Create Collection " >Create Collection</button>

      {/* <button
        className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
        onClick={handleNextTab}
      >
        Next
      </button> */}
    </div>
  );
};

export default StepOne;
