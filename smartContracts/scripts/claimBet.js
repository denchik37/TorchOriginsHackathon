const { ethers } = require("hardhat");

module.exports = async (contractAddress, betId) => {
  console.log("💰 Claiming bet winnings...");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🆔 Bet ID: ${betId}`);

  try {
    // Get contract instance
    const TorchPredictionMarket = await ethers.getContractFactory("TorchPredictionMarket");
    const contract = TorchPredictionMarket.attach(contractAddress);

    // Get bet details first
    const bet = await contract.getBet(betId);
    console.log(`👤 Bettor: ${bet.bettor}`);
    console.log(`📅 Target Timestamp: ${bet.targetTimestamp}`);
    console.log(`📈 Price Range: ${bet.priceMin} - ${bet.priceMax}`);
    console.log(`💰 Stake: ${ethers.utils.formatEther(bet.stake)} ETH`);
    console.log(`🏁 Finalized: ${bet.finalized}`);
    console.log(`🎯 Won: ${bet.won}`);
    console.log(`💰 Claimed: ${bet.claimed}`);

    if (!bet.finalized) {
      console.log("❌ Bet is not finalized yet");
      return;
    }

    if (bet.claimed) {
      console.log("❌ Bet already claimed");
      return;
    }

    if (!bet.won) {
      console.log("❌ Bet did not win - no payout available");
      return;
    }

    // Claim bet
    console.log("⏳ Claiming bet...");
    const tx = await contract.claimBet(betId);
    
    console.log("⏳ Waiting for transaction...");
    const receipt = await tx.wait();
    
    console.log("✅ Bet claimed successfully!");
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

    // Get updated bet details
    const updatedBet = await contract.getBet(betId);
    console.log(`💰 Claimed: ${updatedBet.claimed}`);

    return tx.hash;

  } catch (error) {
    console.log("❌ Error:", error.message);
    
    if (error.code === 'CALL_EXCEPTION') {
      console.log("\n💡 Possible solutions:");
      console.log("   1. Make sure you're the bet owner");
      console.log("   2. Check that bet is finalized");
      console.log("   3. Check that bet has not been claimed");
      console.log("   4. Verify contract address is correct");
    }
  }
}; 