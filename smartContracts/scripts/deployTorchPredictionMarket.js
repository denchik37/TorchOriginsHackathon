const { ethers, network } = require("hardhat");

module.exports = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy TorchPredictionMarket
  console.log("🚀 Deploying TorchPredictionMarket...");
  const TorchPredictionMarket = await ethers.getContractFactory("TorchPredictionMarket");
  const predictionMarket = await TorchPredictionMarket.deploy();
  await predictionMarket.deployed();
  console.log("✅ TorchPredictionMarket deployed to:", predictionMarket.address);

  console.log("\n📋 Deployment Summary:");
  console.log("📍 TorchPredictionMarket:", predictionMarket.address);
  console.log("👤 Deployer:", deployer.address);
  console.log("🔗 Network:", network.name);

  return {
    predictionMarket: predictionMarket.address
  };
}; 