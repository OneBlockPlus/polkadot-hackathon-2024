import hre from 'hardhat';

const baseURI =
    'https://green-elderly-sheep-310.mypinata.cloud/ipfs/QmPv5aSX2skY1zhn6K6rrfkcJSidSRJiAchUv6qxZ3KzPK/';

async function main() {
    const CNFT = await hre.ethers.getContractFactory('CNFT');
    const CNFTDeployed = await CNFT.deploy(baseURI);
    await CNFTDeployed.deployTransaction.wait(5);
    console.log(`Deployed CNFT to ${CNFTDeployed.address}`);

    // const EntryPoint = await hre.ethers.getContractFactory('FigoEntryPoint');
    // const EntryPointDeployed = await EntryPoint.deploy();
    // await EntryPointDeployed.deployTransaction.wait(5);
    // console.log(`EntryPoint deployed to ${EntryPointDeployed.address}`);

    // const Treasury = await hre.ethers.getContractFactory('FigoTreasury');
    // const TreasuryDeployed = await Treasury.deploy(EntryPointDeployed.address);
    // await TreasuryDeployed.deployTransaction.wait(5);
    // console.log(`Treasury deployed to ${TreasuryDeployed.address}`);

    // const NFCWallet = await hre.ethers.getContractFactory('NFCWallet');
    // const NFCWalletDeployed = await NFCWallet.deploy(EntryPointDeployed.address);
    // await NFCWalletDeployed.deployTransaction.wait(5);
    // console.log(`NFCWallet deployed to ${NFCWalletDeployed.address}`);

    // const NFCWalletFactory = await hre.ethers.getContractFactory('NFCWalletFactory');
    // const FactoryDeployed = await NFCWalletFactory.deploy(EntryPointDeployed.address);
    // await FactoryDeployed.deployTransaction.wait(5);
    // console.log(`Factory deployed to ${FactoryDeployed.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
