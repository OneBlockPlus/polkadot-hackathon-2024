import countries from "./countries.json";
import tokens from "./tokens.json";
import addFileCrust from "././../../utils/crust/addFile";
import placeStorageOrder from "./../../utils/crust/storage";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { typesBundleForPolkadot} from "@crustio/type-definitions";
import { usePolkaContext } from "../../context/PolkaContext";

const CarDetailForm = () => {
  const { carDetails, setCarDetails, setSelectedTabAddmycar,  setDetailsHash } = usePolkaContext();
  const {
    vehicleStatus,
    vehicleCondition,
    license,
    vin,
    country,
    model,
    make,
    interior,
    exterior,
    mileage,
    token,
    price,
    duration,
    selectedCurrencies,
    message,
  } = carDetails;

  // Handlers for form inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCarDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

 

  const handleCheckboxChange = (currency) => {
    setCarDetails((prevState) => {
      const updatedCurrencies = prevState.selectedCurrencies.includes(currency)
        ? prevState.selectedCurrencies.filter((c) => c !== currency)
        : [...prevState.selectedCurrencies, currency];

      return {
        ...prevState,
        selectedCurrencies: updatedCurrencies,
      };
    });
  };

  const handleNextTab = () => {
    handleUpload();
    setSelectedTabAddmycar(1);
  };

  const testCrust = async () => {
    const crustChainEndpoint = "wss://rpc-rocky.crust.network";
    const api = new ApiPromise({
      provider: new WsProvider(crustChainEndpoint),
      typesBundle: typesBundleForPolkadot,
    });

    try {
      console.log("testing");
      const carDetail = JSON.parse(localStorage.getItem("CarDetail"));
      console.log(carDetail);
      const carDetailString = JSON.stringify(carDetail);
      console.log(carDetailString);
      const crust = await addFileCrust(carDetailString);
      console.log("crust", crust);

      const cid = crust?.cid;
      console.log(cid);
      const storage = await placeStorageOrder(cid);
      console.log(storage);

      await api.isReadyOrError;
      console.log(await api.query.market.filesV2(cid));
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpload = async () => {
    const metadataJSON = JSON.stringify(carDetails);

    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const body = JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `metadata.json`,
      },
      pinataContent: metadataJSON,
    });

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: body,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log("Uploaded to IPFS:", data);

      setCarDetails((prevState) => ({
        ...prevState,
        metadataCID: data.IpfsHash,
      }));

      let hash = data.IpfsHash
      let urlhash =  `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${hash}`
      setDetailsHash(urlhash)

        console.log(
          "Details CID with pinata:",
          `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${hash}`
        );
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
    }}


  return (
    <div className="w-full relative min-h-screen bg-white-50 overflow-hidden text-center text-[27px] text-black font-text">
      <div className="self-stretch flex flex-col lg:flex-row md:flex-row items-start justify-start py-10 px-s lg:px-s gap-[31px] text-left text-20xl font-manrope-25px-regular mb-6 ">
        <div className="w-full flex flex-col items-start justify-start gap-5 lg:gap-8 text-base lg:text-lg font-karla-text-bold">
          <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-m gap-[60px]">
            <b className="relative text-3xl leading-[120%] font-manrope-25px-regular text-center">
              Vehicle Details
            </b>
            <div className="self-stretch flex flex-col items-start justify-start gap-[12px] text-green-900">
              <div className="self-stretch flex lg:flex-row flex-col sm:flex-col md:flex-col items-start justify-start gap-[29px]">
                <div className="flex-1 flex flex-col  items-start justify-start gap-[6px] min-w-[280px]">
                  <div className="flex flex-col items-start justify-start">
                    <b className="w-[335px] relative inline-block">
                      License plate
                    </b>
                  </div>
                  <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                    <input
                      type="text"
                      name="license"
                      value={license}
                      className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                      placeholder="Enter Liecense No."
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                  <div className="flex flex-col items-start justify-start">
                    <b className="w-[335px] relative inline-block">Country</b>
                  </div>
                  <div className="self-stretch rounded-xl  flex flex-row items-start justify-start  gap-[10px] text-grey-500">
                    <select
                    name="country"
                      className="flex-1 rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                      value={country}
                      onChange={handleInputChange}
                    >
                      {countries.map((country, index) => (
                        <option key={index} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="min-w-full flex flex-row items-center justify-start gap-[20px]">
                <div className="flex-1 relative box-border h-px border-t-[1px] border-solid border-green-200" />
                <div className="relative">or</div>
                <div className="flex-1 relative box-border h-px border-t-[1px] border-solid border-green-200" />
              </div>
              <div className="w-[351px] flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="w-[335px] relative inline-block">VIN</b>
                </div>
                <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                  <input
                    type="text"
                    name="vin"
                    value={vin}
                    className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter VIN of your Vehicle"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[16px] text-green-900">
              <div className="self-stretch flex lg:flex-row flex-col sm:flex-col md:flex-col items-start justify-start gap-[29px]">
                <div className="flex-1 flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                  <div className="flex flex-col items-start justify-start">
                    <b className="w-[335px] relative inline-block">Make</b>
                  </div>
                  <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                    <input
                      type="text"
                      name="make"
                      value={make}
                      className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                      placeholder="Make"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                  <div className="flex flex-col items-start justify-start">
                    <b className="w-[335px] relative inline-block">Model</b>
                  </div>
                  <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                    <input
                      type="text"
                      name="model"
                      value={model}
                      className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                      placeholder="Model of the Vehicle"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="self-stretch flex lg:flex-row flex-col sm:flex-col md:flex-col items-start justify-start gap-[29px]">
                <div className="flex-1 flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                  <div className="flex flex-col items-start justify-start">
                    <b className="w-[335px] relative inline-block">
                      Odometer Mileage
                    </b>
                  </div>
                  <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                    <input
                      type="text"
                      name="mileage"
                      value={mileage}
                      className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                      placeholder="Odometer Mileage"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                  <div className="flex flex-col items-start justify-start">
                    <b className="w-[335px] relative inline-block">Style</b>
                  </div>
                  <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                    <input
                      type="text"
                      className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                      placeholder="Style of your Vehicle"
                    />
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="w-[335px] relative inline-block">
                    Exterior Color
                  </b>
                </div>
                <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                  <input
                    type="text"
                    name="exterior"
                    value={exterior}
                    className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter Exterior colour"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="w-[335px] relative inline-block">
                    Interior Color
                  </b>
                </div>
                <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                  <input
                    type="text"
                    name="interior"
                    value={interior}
                    className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter Interior colour"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-4">
              <b className="self-stretch">
                Is this vehicle on an active loan or lease?
              </b>
              <div className="self-stretch flex flex-col items-start justify-start gap-4 text-green-900">
                <label className="w-full flex items-center gap-3">
                  <input
                    type="radio"
                    name="vehicleStatus"
                    value="loaned"
                    checked={vehicleStatus === "loaned"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <span>Yes, Loaned</span>
                </label>
                <label className="w-full flex items-center gap-3">
                  <input
                    type="radio"
                    name="vehicleStatus"
                    value="leased"
                    checked={vehicleStatus === "leased"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <span>Yes, Leased</span>
                </label>
                <label className="w-full flex items-center gap-3">
                  <input
                    type="radio"
                    name="vehicleStatus"
                    value="owned"
                    checked={vehicleStatus === "owned"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <span>No, I own this vehicle</span>
                </label>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-4">
              <b className="self-stretch">What is the condition of the car?</b>
              <div className="self-stretch flex flex-col items-start justify-start gap-4 text-green-900">
                <label className="w-full flex items-start gap-3">
                  <input
                    type="radio"
                    name="vehicleCondition"
                    value="excellent"
                    checked={vehicleCondition === "excellent"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <div>
                    <b>Excellent</b>
                    <p className="m-0">
                      Looks new and is in excellent mechanical condition with
                      clean vehicle history.
                    </p>
                  </div>
                </label>
                <label className="w-full flex items-start gap-3">
                  <input
                    type="radio"
                    name="vehicleCondition"
                    value="good"
                    checked={vehicleCondition === "good"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <div>
                    <b>Good</b>
                    <p className="m-0">
                      Above average with only minor cosmetic defects and no
                      major mechanical problems.
                    </p>
                  </div>
                </label>
                <label className="w-full flex items-start gap-3">
                  <input
                    type="radio"
                    name="vehicleCondition"
                    value="fair"
                    checked={vehicleCondition === "fair"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <div>
                    <b>Fair</b>
                    <p className="m-0">
                      May have some repairable cosmetic defects or minor
                      mechanical problems.
                    </p>
                  </div>
                </label>
                <label className="w-full flex items-start gap-3">
                  <input
                    type="radio"
                    name="vehicleCondition"
                    value="poor"
                    checked={vehicleCondition === "poor"}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <div>
                    <b>Poor</b>
                    <p className="m-0">
                      Below average which may include major cosmetic or
                      mechanical problems.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="self-stretch relative box-border h-px border-t-[1px] border-solid border-green-200" />
          <div className="self-stretch flex flex-col items-start justify-start py-m px-0 gap-[60px]">
            <div className="self-stretch flex flex-col items-start justify-start text-center font-manrope-25px-regular">
              <div className="self-stretch flex flex-row items-center justify-start">
                <b className="relative leading-[120%] text-5xl ">Set a Price</b>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
              <b className="relative">
                {make} • {model} • {country} • {interior} • {vehicleCondition}
        
              </b>
              <div className="w-full relative rounded-xl bg-white flex flex-col lg:flex-row items-start justify-start p-5 box-border gap-5 text-left text-base text-grey-500 font-karla-text-bold">
                <div className="flex-1 bg-springgreen flex flex-col items-start justify-start gap-3">
                  <b className="relative text-lg lg:text-xl">
                    Current Listing Prices
                  </b>
                  <div className="flex flex-row items-start justify-start gap-3 text-3xl lg:text-6xl text-green-900 font-manrope-25px-regular">
                    <div className="relative font-semibold">$2,283</div>
                    <div className="relative font-semibold">–</div>
                    <div className="relative font-semibold">$5,683</div>
                  </div>
                </div>
                <div className="flex-1 bg-springgreen flex flex-col items-start justify-start gap-3">
                  <b className="relative text-lg lg:text-xl">Recommended</b>
                  <div className="flex flex-row items-start justify-start text-3xl lg:text-6xl text-blue-700 font-manrope-25px-regular">
                    <div className="relative font-semibold">$3,547</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[20px] text-green-900">
              <div className="self-stretch flex flex-col items-start justify-start">
                <div className="self-stretch flex flex-col items-start justify-start">
                  <div className="self-stretch flex lg:flex-row flex-col items-start justify-start gap-[20px]">
                    <div className="self-stretch w-[280px] flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                      <div className="self-stretch flex flex-col items-start justify-start">
                        <b className="self-stretch relative">Currency</b>
                      </div>
                      <div className="self-stretch flex-1 rounded-xl  flex flex-row items-start justify-start  gap-[10px] text-grey-500">
                        <select
                        name="token"
                          className="flex-1 rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                          value={token}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a token</option>
                          {tokens.map((token) => (
                            <option
                              key={token.name}
                              value={token.name}
                              className="flex items-center"
                            >
                              {token.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-start justify-start gap-[6px] ">
                      <div className="flex flex-col items-start justify-start">
                        <b className="w-[335px] relative inline-block">
                          Asking Price
                        </b>
                      </div>
                      <div className="self-stretch rounded-xl  bg-green-10 flex flex-row items-center justify-start p-3 gap-[12px] text-6xl font-manrope-25px-regular">
                        <img
                          className="w-14 relative rounded-[39px] h-14 overflow-hidden shrink-0 bg-white"
                          alt=""
                          src="/images/kusama.png"
                        />
                        <div className="flex-1 relative font-semibold">
                          <input
                            type="number"
                            name="price"
                            value={price}
                            className="rounded-xl lg:w-80 w-60 p-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent font-thin text-black "
                            placeholder="Price "
                            onChange={handleInputChange}
                          />
                        </div>
                        {/* <div className="relative text-base font-karla-text-bold">
                            ( ~ $3,890)
                          </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-[12px] text-black">
                <b className="relative">Other Accepting Currency</b>
                <div className="self-stretch flex flex-row items-start justify-start gap-1 text-green-900">
                  <label className="w-full flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="Ethereum"
                      checked={selectedCurrencies.includes("Ethereum")}
                      onChange={() => handleCheckboxChange("Ethereum")}
                      className="h-4 w-4"
                    />
                    <span>Ethereum</span>
                  </label>
                  <label className="w-full flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="Tehther USD"
                      checked={selectedCurrencies.includes("Tehther USD")}
                      onChange={() => handleCheckboxChange("Tehther USD")}
                      className="h-4 w-4"
                    />
                    <span>TUSD</span>
                  </label>
                  <label className="w-full flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="USDC"
                      checked={selectedCurrencies.includes("USDC")}
                      onChange={() => handleCheckboxChange("USDC")}
                      className="h-4 w-4"
                    />
                    <span>USDC</span>
                  </label>
                  <label className="w-full flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="MTOV"
                      checked={selectedCurrencies.includes("MTOV")}
                      onChange={() => handleCheckboxChange("MTOV")}
                      className="h-4 w-4"
                    />
                    <span>MTOV</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-row items-start justify-start gap-[20px] text-green-900">
              <div className="w-[280px] flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
                <div className="flex flex-col items-start justify-start">
                  <b className="self-stretch relative">Listing Duration</b>
                </div>
                <div className="self-stretch rounded-xl flex flex-row items-start justify-start  text-grey-500">
                  <input
                    type="number"
                    name="duration"
                    value={duration}
                    onChange={handleInputChange}
                    className="flex-1 self-stretch rounded-xl p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="In Months"
                  />
                </div>
              </div>
            </div>
            <div className="self-stretch relative box-border h-px border-t-[1px] border-solid border-green-200" />
            <div className="self-stretch flex flex-col items-start justify-start gap-[12px] text-center text-20xl font-manrope-25px-regular">
              <div className="self-stretch flex flex-col items-start justify-start">
                <div className="self-stretch flex flex-row items-center justify-start">
                  <b className="relative leading-[120%]">Other</b>
                </div>
              </div>
              <div className="self-stretch relative text-base font-karla-text-bold text-green-900 text-left">
                Tell potential buyers what makes your car special. New tires?
                Recent oil change? Let them know all about it. Being upfront
                about any issues will also build trust with buyers.
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start text-grey-500">
              <div className="self-stretch rounded-xl bg-white-10 h-30 flex flex-row items-start justify-start p-3 box-border">
                <textarea
                name="message"
                  className="flex-1 relative resize-none bg-transparent outline-none border-none font-light text-black"
                  value={message}
                  onChange={handleInputChange}
                  placeholder="I am selling my 2002 Toyota Sienna. Please contact me with any questions."
                  rows={5}
                />
              </div>
            </div>

            {/* <button
              id="metaDataButton"
              className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
              onClick={handleUpload}
            >
              Upload to IPFS
            </button>
            <button
              id="metaDataButton"
              className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
              onClick={testCrust}
            >
              Upload with Crust
            </button> */}
            <button
              className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
              onClick={handleNextTab}
            >
              Go to Upload Evidence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailForm;
