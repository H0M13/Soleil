import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("PoolManager", () => {
  let poolManagerContract: Contract;
  let soleilTokenContract: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;

  beforeEach(async () => {
    const soleilTokenFactory = await ethers.getContractFactory("SoleilToken");
    soleilTokenContract = await soleilTokenFactory.deploy();

    const poolManagerFactory = await ethers.getContractFactory("PoolManager");
    poolManagerContract = await poolManagerFactory.deploy(soleilTokenContract.address);

    [owner, address1] = await ethers.getSigners();
  });

  it("Should set the right owner", async () => {
    expect(await poolManagerContract.owner()).to.equal(await owner.address);
  });

  it("Owner should be allowed to set the allowed tokens", async () => {
    await poolManagerContract.addAllowedTokens("0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea");
    const allowedToken = await poolManagerContract.allowedTokens(0)
    expect(allowedToken.toLowerCase()).to.equal("0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea".toLowerCase());
  });

  it("Should set the soleilTokenContract correctly", async () => {
    expect(await poolManagerContract.soleilToken()).to.equal(soleilTokenContract.address);
  });

  it("The owner should be able to mint tokens", async () => {
    await soleilTokenContract.mint(poolManagerContract.address, 100);
    expect(await soleilTokenContract.balanceOf(poolManagerContract.address)).to.equal(100);
  });

  it("After granting the poolManagerContract the MINTER_ROLE role it should be able to mint tokens", async () => {
    await soleilTokenContract.grantRole(soleilTokenContract.MINTER_ROLE(), poolManagerContract.address);
    await soleilTokenContract.mint(address1.address, 100);
    expect(await soleilTokenContract.balanceOf(address1.address)).to.equal(100);
    expect(await soleilTokenContract.hasRole(soleilTokenContract.MINTER_ROLE(), poolManagerContract.address)).to.equal(true);
  });
});
