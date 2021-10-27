import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS || "";

  const StpProperty = await ethers.getContractFactory("StpProperty");
  const stpProperty = await StpProperty.attach(contractAddress);

  const baseUri = process.env.BASE_URI || "";
  
  await stpProperty.setBaseURI(
    baseUri
  );

  console.log(
    `Smart Town Planner base URI set to ${baseUri}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
