import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("StpProperty", () => {
  let stpPropertyContract: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;

  beforeEach(async () => {
    const StpPropertyFactory = await ethers.getContractFactory("StpProperty");
    [owner, address1] = await ethers.getSigners();
    stpPropertyContract = await StpPropertyFactory.deploy(
      "Smart Town Planner",
      "STP"
    );
  });

  it("Should return the right name and symbol", async function () {
    expect(await stpPropertyContract.name()).to.equal("Smart Town Planner");
    expect(await stpPropertyContract.symbol()).to.equal("STP");
  });

  it("Should set the right owner", async () => {
    expect(await stpPropertyContract.owner()).to.equal(await owner.address);
  });

  it("Should mint a property", async () => {
    expect(await stpPropertyContract.createProperty(
      address1.address,
      "10",
      "Downing Street",
      "SW1A 2AA"
    )).to.emit(
      stpPropertyContract,
      "CreateProperty"
    );
  });
});
