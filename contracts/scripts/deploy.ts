// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // DAI on Rinkeby
  const DAI_ADDRESS = "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea";

  const soleilTokenFactory = await ethers.getContractFactory("SoleilToken");
  const soleilTokenContract = await soleilTokenFactory.deploy();

  await soleilTokenContract.deployed();
  
  console.log("Soleil Token contract deployed to:", soleilTokenContract.address);

  const poolManagerFactory = await ethers.getContractFactory("PoolManager");
  const poolManagerContract = await poolManagerFactory.deploy(
    soleilTokenContract.address,
    DAI_ADDRESS,
    process.env.CHAINLINK_NODE_ADDRESS || ""
  );

  await poolManagerContract.deployed();

  console.log("Soleil Pool Manager contract deployed to:", poolManagerContract.address);

  await soleilTokenContract.grantRole(
    await soleilTokenContract.MINTER_ROLE(),
    poolManagerContract.address
  );

  console.log("Minter role granted to pool manager contract");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
