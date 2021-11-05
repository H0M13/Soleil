import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("PoolManager", () => {
  let poolManagerContract: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;

  beforeEach(async () => {
    const poolManagerFactory = await ethers.getContractFactory("PoolManager");
    [owner, address1] = await ethers.getSigners();
    poolManagerContract = await poolManagerFactory.deploy();
  });

  it("Should set the right owner", async () => {
    expect(await poolManagerContract.owner()).to.equal(await owner.address);
  });
});
