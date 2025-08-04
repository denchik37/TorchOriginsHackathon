/*-
 *
 * Hedera Hardhat Example Project
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const { ethers } = require("hardhat");

module.exports = async () => {
  // Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
  let wallet = (await ethers.getSigners())[0];

  console.log("Deploying TestTorchPredictionMarket contract...");
  console.log("Deployer address:", wallet.address);

  // Initialize a contract factory object
  // name of contract as first parameter
  // wallet/signer used for signing the contract calls/transactions with this contract
  const TestTorchPredictionMarket = await ethers.getContractFactory(
    "TestTorchPredictionMarket",
    wallet,
  );

  // Using already initialized contract factory object with our contract, we can invoke deploy function to deploy the contract.
  // No constructor parameters needed for TestTorchPredictionMarket
  console.log("🚀 Deploying contract...");
  const testTorchPredictionMarket = await TestTorchPredictionMarket.deploy();

  console.log("⏳ Waiting for deployment transaction...");
  // We use wait to receive the transaction (deployment) receipt, which contains contractAddress
  const receipt = await testTorchPredictionMarket.deployTransaction.wait();
  const contractAddress = receipt.contractAddress;

  console.log("✅ TestTorchPredictionMarket deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Network: ${network.name}`);
  console.log(`👤 Deployer: ${wallet.address}`);
  console.log(`📝 Transaction Hash: ${receipt.transactionHash}`);
  console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

  // Log some initial contract state
  try {
    const nextBetId = await testTorchPredictionMarket.nextBetId();
    console.log(`🆔 Next Bet ID: ${nextBetId}`);
  } catch (error) {
    console.log(
      "⚠️ Could not read contract state immediately (this is normal on Hedera)",
    );
  }

  return contractAddress;
};
