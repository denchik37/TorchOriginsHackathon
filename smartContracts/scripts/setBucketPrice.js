const { ethers } = require("hardhat");

module.exports = async (contractAddress, bucket, price) => {
  console.log("🔧 Setting bucket price...");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`📦 Bucket: ${bucket}`);
  console.log(`💰 Price: ${price}`);

  try {
    // Get contract instance
    const TorchPredictionMarket = await ethers.getContractFactory("TorchPredictionMarket");
    const contract = TorchPredictionMarket.attach(contractAddress);

    // Set bucket price
    console.log("⏳ Setting price...");
    const tx = await contract.setBucketPrice(bucket, price);
    
    console.log("⏳ Waiting for transaction...");
    const receipt = await tx.wait();
    
    console.log("✅ Price set successfully!");
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

    return tx.hash;

  } catch (error) {
    console.log("❌ Error:", error.message);
    
    if (error.code === 'CALL_EXCEPTION') {
      console.log("\n💡 Possible solutions:");
      console.log("   1. Make sure you're the contract owner");
      console.log("   2. Check that price is greater than 0");
      console.log("   3. Verify contract address is correct");
    }
  }
}; 