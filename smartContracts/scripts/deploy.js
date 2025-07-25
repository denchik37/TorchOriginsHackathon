const hre = require("hardhat");

async function main() {
  const TorchPredictionMarket = await hre.ethers.getContractFactory("TorchPredictionMarket");
  const contract = await TorchPredictionMarket.deploy();
  await contract.deployed();
  console.log("TorchPredictionMarket deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 