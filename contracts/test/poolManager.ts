import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import erc20 from "../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json";

const CumulativePaymentTree = require("./cumulative-payment-tree.js");

describe("PoolManager", () => {
  let poolManagerContract: Contract;
  let soleilTokenContract: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;
  let address2: SignerWithAddress;

  const DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const DAI_SLOT = 2;

  beforeEach(async () => {
    const soleilTokenFactory = await ethers.getContractFactory("SoleilToken");
    soleilTokenContract = await soleilTokenFactory.deploy();

    [owner, address1, address2] = await ethers.getSigners();

    const poolManagerFactory = await ethers.getContractFactory("PoolManager");
    poolManagerContract = await poolManagerFactory.deploy(
      soleilTokenContract.address,
      DAI_ADDRESS,
      address2.address
    );
  });

  it("Should set the right owner", async () => {
    expect(await poolManagerContract.owner()).to.equal(await owner.address);
  });

  it("Should set the soleilTokenContract correctly", async () => {
    expect(await poolManagerContract.sllToken()).to.equal(
      soleilTokenContract.address
    );
  });

  it("The owner should be able to mint tokens", async () => {
    await soleilTokenContract.mint(poolManagerContract.address, 100);
    expect(
      await soleilTokenContract.balanceOf(poolManagerContract.address)
    ).to.equal(100);
  });

  it("After granting the poolManagerContract the MINTER_ROLE role it should be able to mint tokens", async () => {
    await soleilTokenContract.grantRole(
      soleilTokenContract.MINTER_ROLE(),
      poolManagerContract.address
    );
    await soleilTokenContract.mint(address1.address, 100);
    expect(await soleilTokenContract.balanceOf(address1.address)).to.equal(100);
    expect(
      await soleilTokenContract.hasRole(
        soleilTokenContract.MINTER_ROLE(),
        poolManagerContract.address
      )
    ).to.equal(true);
  });

  it("Should be able to get DAI balance for proof with address", async () => {
    const site1 = "0x4010e200a18FD8756d55105c2F8Fd88DDBD810ce"
    const site2 = "0x4282040aE3a28C967612b580C8516a48b8f3A663"
    const earnings1 = "0x0de86fab3c3f42d9"
    const earnings2 = "0x39f58b9bafbd73fe"

    const testData = [
      {
        address: site1,
        earnings: earnings1,
      },
      {
        address: site2,
        earnings: earnings2,
      },
    ];

    const paymentTree = new CumulativePaymentTree(testData);

    const merkleRoot = paymentTree.getHexRoot();

    await poolManagerContract.connect(address2).submitDaiMerkleRoot(merkleRoot);

    // Test for verification success on site1 with proof1
    const proof1 = paymentTree.hexProofForPayee(
      site1,
      1
    );
    const daiBalance1 = await poolManagerContract.daiBalanceForProofWithAddress(
      site1,
      proof1
    );
    expect(daiBalance1.toHexString()).to.equal(earnings1);

    // Test for verification success on site2 with proof2
    const proof2 = paymentTree.hexProofForPayee(
      site2,
      1
    );
    const daiBalance2 = await poolManagerContract.daiBalanceForProofWithAddress(
      site2,
      proof2
    );
    expect(daiBalance2.toHexString()).to.equal(earnings2);

    // Test for a verification failure with site2 and proof1
    const daiBalance3 = await poolManagerContract.daiBalanceForProofWithAddress(
      site2,
      proof1
    );
    expect(daiBalance3.toHexString()).to.equal("0x00");
  });

  it("Should be able to set DAI payout schedule correctly", async () => {
    const amountOfDaiToSubmit = "1500";
    const numDays = 100;
    const secondAmountOfDaiToSubmit = "1000";
    const secondNumDays = 20;

    // Manipulate DAI balance locally through storage slots
    const Dai = new ethers.Contract(DAI_ADDRESS, erc20.abi, ethers.provider);
    const locallyManipulatedBalance = ethers.utils.parseUnits("100000");

    // Get storage slot index
    const index = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [address1.address, DAI_SLOT] // key, slot
    );

    // Manipulate local balance (needs to be bytes32 string)
    await setStorageAt(
      DAI_ADDRESS,
      index.toString(),
      toBytes32(locallyManipulatedBalance).toString()
    );

    // Address 1 now has 100,000 DAI to test with
    expect(await Dai.balanceOf(address1.address)).to.equal(
      ethers.utils.parseUnits("100000")
    );

    // Approve the pool manager contract to transfer 1500 of those DAI
    await Dai.connect(address1).approve(
      poolManagerContract.address,
      ethers.utils.parseUnits(amountOfDaiToSubmit)
    );

    // Use the DAI to set a payout schedule of 1500 DAI over 100 days
    await expect(
      poolManagerContract
        .connect(address1)
        .setDaiPayoutSchedule(
          ethers.utils.parseUnits(amountOfDaiToSubmit),
          numDays
        )
    )
      .to.emit(poolManagerContract, "DaiPayoutScheduleSet")
      .withArgs(ethers.utils.parseUnits(amountOfDaiToSubmit), numDays);

    // Check that the timestampToDaiToDistribute mapping and the
    // addressToTimestampToDaiToDistribute mapping are set correctly.
    // => 15 DAI per day for the next 100 days.
    const secondsSinceEpoch = Math.round(new Date().getTime() / 1000);
    const secondsInDay = 86400;
    const fullDaysSinceEpoch = Math.floor(
      secondsSinceEpoch / secondsInDay
    );
    for (let i = 0; i < numDays; i++) {
      expect(
        await poolManagerContract.timestampToDaiToDistribute(
          (fullDaysSinceEpoch + i + 1) * secondsInDay
        )
      ).to.equal(ethers.utils.parseUnits("15"));
      expect(
        await poolManagerContract.addressToTimestampToDaiToDistribute(
          address1.address,
          (fullDaysSinceEpoch + i + 1) * secondsInDay
        )
      ).to.equal(ethers.utils.parseUnits("15"));
    }

    // Approve the pool manager contract to transfer an extra 1000 DAI
    await Dai.connect(address1).approve(
      poolManagerContract.address,
      ethers.utils.parseUnits(secondAmountOfDaiToSubmit)
    );

    // Use the DAI to set a payout schedule of 1000 DAI over 20 days
    await expect(
      poolManagerContract
        .connect(address1)
        .setDaiPayoutSchedule(
          ethers.utils.parseUnits(secondAmountOfDaiToSubmit),
          secondNumDays
        )
    )
      .to.emit(poolManagerContract, "DaiPayoutScheduleSet")
      .withArgs(ethers.utils.parseUnits(secondAmountOfDaiToSubmit), secondNumDays);

    // Check that the timestampToDaiToDistribute mapping and the
    // addressToTimestampToDaiToDistribute mapping are set correctly.
    // => 65 DAI per day for the next 20 days, 15 DAI for the 80 days after that.
    for (let i = 0; i < secondNumDays; i++) {
      expect(
        await poolManagerContract.timestampToDaiToDistribute(
          (fullDaysSinceEpoch + i + 1) * secondsInDay
        )
      ).to.equal(ethers.utils.parseUnits("65"));
      expect(
        await poolManagerContract.addressToTimestampToDaiToDistribute(
          address1.address,
          (fullDaysSinceEpoch + i + 1) * secondsInDay
        )
      ).to.equal(ethers.utils.parseUnits("65"));
    }

    for (let i = secondNumDays; i < numDays; i++) {
      expect(
        await poolManagerContract.timestampToDaiToDistribute(
          (fullDaysSinceEpoch + i + 1) * secondsInDay
        )
      ).to.equal(ethers.utils.parseUnits("15"));
      expect(
        await poolManagerContract.addressToTimestampToDaiToDistribute(
          address1.address,
          (fullDaysSinceEpoch + i + 1) * secondsInDay
        )
      ).to.equal(ethers.utils.parseUnits("15"));
    }
  });

  const toBytes32 = (bn: any) => {
    return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
  };

  const setStorageAt = async (address: string, index: string, value: any) => {
    await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
    await ethers.provider.send("evm_mine", []); // Just mines to the next block
  };
});
