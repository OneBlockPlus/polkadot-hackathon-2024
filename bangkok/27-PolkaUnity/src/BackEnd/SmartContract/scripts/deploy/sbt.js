const hre = require("hardhat");

/* npx hardhat --network arbone run ./scripts/deploy/cessnft.js */
/* npx hardhat --network cesstest run ./scripts/deploy/cessnft.js */
async function main() {
    const OATContract = await hre.ethers.getContractFactory("OATContract")
    const oat = await OATContract.deploy(
        "PolkUnity OAT",
        "OAT",
    )
    console.log("deployed OAT-Contract address:", await oat.getAddress())

    const SBTContract = await hre.ethers.getContractFactory("SBTContract")
    const sbt = await SBTContract.deploy(
        "PolkUnity Credit Score",
        "SBT",
        await oat.getAddress(),
    )

    console.log("deployed SBT-Contract address:", await sbt.getAddress())
}