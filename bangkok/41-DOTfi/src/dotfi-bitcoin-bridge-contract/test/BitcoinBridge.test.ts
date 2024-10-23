import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

describe("BitcoinBridge Contract", function () {
  let bitcoinBridge: any;
  let owner: Signer;
  let bitcoinProcessor: Signer;
  let apiProvider: Signer;
  let user1: Signer;
  let user2: Signer;

  const bridgeAddress = ethers.Wallet.createRandom().address;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
    bitcoinProcessor = (await ethers.getSigners())[0];
    apiProvider = (await ethers.getSigners())[0];
    user1 = (await ethers.getSigners())[0];
    user2 = (await ethers.getSigners())[0];

    const BitcoinBridge = await ethers.getContractFactory("BitcoinBridge");
    const ownerAddress = await owner.getAddress();
    
    bitcoinBridge = await BitcoinBridge.deploy(
      ownerAddress,
      bridgeAddress,
      "0x4Fb1ab865AD774F14E50bd4c1E75e26AED729f79"
    );
    
    await bitcoinBridge.waitForDeployment();
  });

  it("should set the admin, processor, and API provider correctly", async function () {
    await bitcoinBridge.setBitcoinProcessor(await bitcoinProcessor.getAddress());
    await bitcoinBridge.setAPIProvider(await apiProvider.getAddress());

    const isProcessor = await bitcoinBridge.hasRole(await bitcoinBridge.BITCOIN_PROCESSOR_ROLE(), await bitcoinProcessor.getAddress());
    const isAPIProvider = await bitcoinBridge.hasRole(await bitcoinBridge.API_PROVIDER_ROLE(), await apiProvider.getAddress());

    expect(isProcessor).to.be.true;
    expect(isAPIProvider).to.be.true;
  });

  it("should allow users to request account generation", async function () {
    const user1Address = await user1.getAddress();
    const tx = await bitcoinBridge.connect(user1).requestAccountGeneration();
    console.log(tx);
    const hasRequested = await bitcoinBridge.hasRequested(user1Address);
    expect(hasRequested).to.be.true;
  });

  it("should allow API providers to request account generation on behalf of users", async function () {
    await bitcoinBridge.setAPIProvider(await apiProvider.getAddress());
    await bitcoinBridge.connect(apiProvider).requestAccountGenerationByAPI(await user2.getAddress());

    const hasRequested = await bitcoinBridge.hasRequested(await user2.getAddress());
    expect(hasRequested).to.be.true;
  });

  it("should allow the bitcoin processor to set Bitcoin addresses", async function () {
    await bitcoinBridge.setBitcoinProcessor(await bitcoinProcessor.getAddress());
    await bitcoinBridge.connect(user1).requestAccountGeneration();

    await bitcoinBridge.connect(bitcoinProcessor).setBitcoinAddress(0, "bitcoinAddressForUser1");

    const bitcoinAddress = await bitcoinBridge.userBitcoinAddresses(await user1.getAddress());
    expect(bitcoinAddress).to.equal("bitcoinAddressForUser1");
  });

  it("should allow the bitcoin processor to register incoming transactions", async function () {
    await bitcoinBridge.setBitcoinProcessor(await bitcoinProcessor.getAddress());
    await bitcoinBridge.connect(user1).requestAccountGeneration();
    await bitcoinBridge.connect(bitcoinProcessor).setBitcoinAddress(0, "bitcoinAddressForUser1");

    await bitcoinBridge.connect(bitcoinProcessor).registerIncomingTransaction("tx123", await user1.getAddress(), ethers.parseUnits("10", 18));

    const transactions = await bitcoinBridge.getUserIncomingTransactions();
    expect(transactions.length).to.equal(1);
    expect(transactions[0].incomingTxId).to.equal("tx123");
    expect(transactions[0].amount).to.equal(ethers.parseUnits("10", 18));
  });
});
