import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BridgeFactory", function () {
  let bridgeFactory: any;
  let admin: HardhatEthersSigner, addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;

  beforeEach(async function () {
    [admin, addr1, addr2] = await ethers.getSigners();

    const BridgeFactory = await ethers.getContractFactory("BridgeFactory");
    bridgeFactory = await BridgeFactory.deploy(admin.address);
    await bridgeFactory.waitForDeployment();
  });

  it("should set the deployer as admin", async function () {
    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    expect(await bridgeFactory.hasRole(adminRole, admin.address)).to.be.true;
  });

  it("should allow admin to set a contract deployer", async function () {
    await bridgeFactory.connect(admin).setContractDeployer(addr1.address);
    const deployerRole = ethers.keccak256(ethers.toUtf8Bytes("CONTRACT_DEPLOYER_ROLE"));
    expect(await bridgeFactory.hasRole(deployerRole, addr1.address)).to.be.true;
  });

  it("should allow contract deployer to deploy a token", async function () {
    await bridgeFactory.connect(admin).setContractDeployer(addr1.address);
    await bridgeFactory.connect(addr1).deployToken("Test Token", "TT", 18, 1000000);
  });

  it("should restrict non-deployer from deploying a token", async function () {
    await expect(bridgeFactory.connect(addr2).deployToken("Test Token", "TT", 18, 1000000)).to.be.revertedWith("Not a contract deployer");
  });
});
