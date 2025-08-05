const { ethers } = require("hardhat");

module.exports = async (contractAddress) => {
  console.log("🧪 Testing placeBetWithoutValue function...");
  console.log(`📍 Contract Address: ${contractAddress}`);

  try {
    // Get contract instance
    const TestTorchPredictionMarket = await ethers.getContractFactory(
      "TestTorchPredictionMarket",
    );
    const contract = TestTorchPredictionMarket.attach(contractAddress);

    // Check if contract exists
    const code = await ethers.provider.getCode(contractAddress);
    console.log(`📦 Contract code length: ${code.length}`);

    if (code === "0x") {
      console.log("❌ No contract found at this address");
      console.log("💡 This might be due to:");
      console.log("   - Contract still being processed on Hedera");
      console.log("   - Network connectivity issues");
      console.log("   - Incorrect contract address");
      return;
    }

    console.log("✅ Contract found at address");

    // Test parameters
    const targetTimestamp = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const priceMin = 100;
    const priceMax = 200;
    const stakeAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH

    console.log(`📅 Target Timestamp: ${targetTimestamp}`);
    console.log(`📈 Price Range: ${priceMin} - ${priceMax}`);
    console.log(
      `💰 Stake Amount: ${ethers.utils.formatEther(stakeAmount)} ETH`,
    );

    // Try to place the bet
    console.log("\n🚀 Attempting to place bet...");
    const tx = await contract.placeBet(
      targetTimestamp,
      priceMin,
      priceMax,
      { value: stakeAmount }
    );

    console.log("⏳ Waiting for transaction...");
    const receipt = await tx.wait();

    console.log("✅ Bet placed successfully!");
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

    // Try to get bet details
    try {
      const betPlacedEvent = receipt.events?.find(
        (event) => event.event === "BetPlaced",
      );
      if (betPlacedEvent) {
        const betId = betPlacedEvent.args.betId;
        console.log(`🆔 Bet ID: ${betId.toString()}`);

        const bet = await contract.bets(betId);
        console.log("\n📋 Bet Details:");
        console.log(`👤 Bettor: ${bet.bettor}`);
        console.log(`📅 Target Timestamp: ${bet.targetTimestamp}`);
        console.log(`📈 Price Range: ${bet.priceMin} - ${bet.priceMax}`);
        console.log(`💰 Stake: ${ethers.utils.formatEther(bet.stake)} ETH`);
        console.log(`⭐ Quality BPS: ${bet.qualityBps}`);
        console.log(`⚖️ Weight: ${bet.weight}`);
      }
    } catch (error) {
      console.log("⚠️ Could not retrieve bet details:", error.message);
    }

    return tx.hash;
  } catch (error) {
    console.log("❌ Error:", error.message);

    if (error.code === "CALL_EXCEPTION") {
      console.log("\n💡 Possible solutions:");
      console.log("   1. Wait a few minutes and try again");
      console.log("   2. Deploy a fresh contract");
      console.log("   3. Check network connectivity");
      console.log("   4. Verify contract address is correct");
    }
  }
};
