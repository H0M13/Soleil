import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS || "";

  const StpProperty = await ethers.getContractFactory("StpProperty");
  const stpProperty = await StpProperty.attach(contractAddress);

  const address1 = process.env.ADDRESS_1 || "";

  await stpProperty.createProperty(
    address1,
    "10",
    "Downing Street",
    "SW1A 2AA"
  );

  console.log(
    `Smart Town Planner contract at address ${contractAddress} seeded`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
