import { expect } from "chai";
import { ethers } from "hardhat";

describe("StpProperty", function () {
  it("Should return the right name and symbol", async function () {
    const StpProperty = await ethers.getContractFactory("StpProperty");
    const myStpProperty = await StpProperty.deploy("StpProperty", "STP");

    await myStpProperty.deployed();
    expect(await myStpProperty.name()).to.equal("StpProperty");
    expect(await myStpProperty.symbol()).to.equal("STP");
  });
});