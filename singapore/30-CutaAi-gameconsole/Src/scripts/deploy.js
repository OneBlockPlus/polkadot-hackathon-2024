const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the BytesUtils library
    const BytesUtils = await hre.ethers.getContractFactory("BytesUtils");
    const bytesUtils = await BytesUtils.deploy(); // Deploy the library
    await bytesUtils.waitForDeployment(); // Wait until the library is deployed
    const bytesUtilsAddress = await bytesUtils.getAddress();
    // const bytesUtilsAddress = "0xe090647D7bD469B634da047f17Edb72091979D17";
    console.log("BytesUtils deployed to:", bytesUtilsAddress);

    // Deploy other libraries similarly
    const DidUtils = await hre.ethers.getContractFactory("DidUtils", {
        libraries: {
            BytesUtils: bytesUtilsAddress,
        },
    });
    const didUtils = await DidUtils.deploy();
    await didUtils.waitForDeployment();
    const didUtilsAddress = await didUtils.getAddress();
    // const didUtilsAddress = "0x30D07FE3F525CA7b7bC9E781EaFC833AAD088211";
    console.log("DidUtils deployed to:", didUtilsAddress);

    const KeyUtils = await hre.ethers.getContractFactory("KeyUtils");
    const keyUtils = await KeyUtils.deploy();
    await keyUtils.waitForDeployment();
    const keyUtilsAddress = await keyUtils.getAddress();
    // const keyUtilsAddress = "0x23cffae14e1EC2A9095a78585a81DE1260d2dB06"
    console.log("KeyUtils deployed to:", keyUtilsAddress);

    const ZeroCopySink = await hre.ethers.getContractFactory("ZeroCopySink");
    const zeroCopySink = await ZeroCopySink.deploy();
    await zeroCopySink.waitForDeployment();
    const zeroCopySinkAddress = await zeroCopySink.getAddress();
    // const zeroCopySinkAddress = "0x30e0ba8188Da935d4cc444cd5e077E5595942f59"
    console.log("ZeroCopySink deployed to:", zeroCopySinkAddress);

    const ZeroCopySource = await hre.ethers.getContractFactory("ZeroCopySource");
    const zeroCopySource = await ZeroCopySource.deploy();
    await zeroCopySource.waitForDeployment();
    const zeroCopySourceAddress = await zeroCopySource.getAddress();
    // const zeroCopySourceAddress = "0xca9187C263BbfFcd7D1C4f3eE72711Db430fFd1e"
    console.log("ZeroCopySource deployed to:", zeroCopySourceAddress);

    const StorageUtils = await hre.ethers.getContractFactory("StorageUtils", {
        libraries: {
            DidUtils: didUtilsAddress,
            KeyUtils: keyUtilsAddress,
        },
    });
    const storageUtils = await StorageUtils.deploy();
    await storageUtils.waitForDeployment();
    const storageUtilsAddress = await storageUtils.getAddress();
    // const storageUtilsAddress = "0x4EDe0250703D9EdCd291A4a64B43A1ea44DedbA1"
    console.log("StorageUtils deployed to:", storageUtilsAddress);

    // Link the libraries to the main contract
    const DIDContractV2 = await hre.ethers.getContractFactory("DIDContractV2", {
        libraries: {
            BytesUtils: bytesUtilsAddress,
            DidUtils: didUtilsAddress,
            KeyUtils: keyUtilsAddress,
            StorageUtils: storageUtilsAddress,
        },
    });

    const didContractV2 = await DIDContractV2.deploy(); // Deploy the main contract
    await didContractV2.waitForDeployment(); // Wait until the main contract is deployed
    const didContractV2Address = await didContractV2.getAddress();
    // const didContractV2Address = "0xb0e472eAA8e7D2d88e5337c14d891BE8a52112Bd";
    console.log("DIDContractV2 deployed to:", didContractV2Address);

    // 自动验证合约代码
    await hre.run("verify:verify", {
        address: didContractV2Address,
        constructorArguments: [],
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});