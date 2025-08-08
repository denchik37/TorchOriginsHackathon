// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import {TorchPredictionMarket} from "../../src/TorchPredictionMarket.sol";

contract PlaceBatch24Script is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("MAINNET_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        
        address marketAddress = vm.envAddress("MAINNET_MARKET_ADDRESS_V4");
        console.log("Using market at:", marketAddress);
        
        TorchPredictionMarket market = TorchPredictionMarket(marketAddress);
        
        // Get current timestamp
        uint256 currentTimestamp = block.timestamp;
        console.log("Current timestamp:", currentTimestamp);
        
        // Define the 10 bets from mock data (bets 231-240)
        BetData[] memory bets = new BetData[](10);
        
        // Bet 1: 1756715383, 0.005436 ETH, 3157-3303 BPS
        bets[0] = BetData({
            dayOffset: 2,
            priceMin: 3157,
            priceMax: 3303,
            stakeAmount: 0.005436 ether
        });
        
        // Bet 2: 1756717079, 0.003924 ETH, 3082-3254 BPS
        bets[1] = BetData({
            dayOffset: 2,
            priceMin: 3082,
            priceMax: 3254,
            stakeAmount: 0.003924 ether
        });
        
        // Bet 3: 1756757485, 0.009616 ETH, 3123-3242 BPS
        bets[2] = BetData({
            dayOffset: 2,
            priceMin: 3123,
            priceMax: 3242,
            stakeAmount: 0.009616 ether
        });
        
        // Bet 4: 1756758865, 0.00267 ETH, 3169-3213 BPS
        bets[3] = BetData({
            dayOffset: 2,
            priceMin: 3169,
            priceMax: 3213,
            stakeAmount: 0.00267 ether
        });
        
        // Bet 5: 1756766764, 0.02369 ETH, 3225-3290 BPS
        bets[4] = BetData({
            dayOffset: 2,
            priceMin: 3225,
            priceMax: 3290,
            stakeAmount: 0.02369 ether
        });
        
        // Bet 6: 1756785134, 0.0022 ETH, 3149-3236 BPS
        bets[5] = BetData({
            dayOffset: 2,
            priceMin: 3149,
            priceMax: 3236,
            stakeAmount: 0.0022 ether
        });
        
        // Bet 7: 1756788434, 0.001386 ETH, 3112-3269 BPS
        bets[6] = BetData({
            dayOffset: 2,
            priceMin: 3112,
            priceMax: 3269,
            stakeAmount: 0.001386 ether
        });
        
        console.log("=== Placing Batch 24 (10 Bets) ===");
        
        // Prepare arrays for batch placement
        uint256[] memory targetTimestamps = new uint256[](bets.length);
        uint256[] memory priceMins = new uint256[](bets.length);
        uint256[] memory priceMaxs = new uint256[](bets.length);
        uint256[] memory stakeAmounts = new uint256[](bets.length);
        uint256 totalValue = 0;
        
        // Calculate total value and prepare arrays
        for (uint256 i = 0; i < bets.length; i++) {
            BetData memory bet = bets[i];
            
            // Calculate target timestamp starting from current time
            // Add MIN_DAYS_AHEAD + dayOffset to ensure it's at least 1 day ahead
            uint256 targetTimestamp = currentTimestamp + ((market.MIN_DAYS_AHEAD() + bet.dayOffset) * market.SECONDS_PER_DAY());
            
            targetTimestamps[i] = targetTimestamp;
            priceMins[i] = bet.priceMin;
            priceMaxs[i] = bet.priceMax;
            stakeAmounts[i] = bet.stakeAmount;
            totalValue += bet.stakeAmount;
            
            console.log("--- Bet");
            console.log(i + 1);
            console.log("---");
            console.log("Day offset:", bet.dayOffset);
            console.log("Target timestamp:", targetTimestamp);
            console.log("Price range:");
            console.log(bet.priceMin);
            console.log("-");
            console.log(bet.priceMax);
            console.log("BPS");
            console.log("Stake amount:", bet.stakeAmount);
        }
        
        console.log("Total value to send:", totalValue);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Place all bets in a single batch transaction
        uint256[] memory betIds = market.placeBatchBets{value: totalValue}(
            targetTimestamps,
            priceMins,
            priceMaxs,
            stakeAmounts
        );
        
        console.log("All bets placed with IDs:");
        for (uint256 i = 0; i < betIds.length; i++) {
            console.log("Bet", i + 1, "ID:", betIds[i]);
        }
        
        vm.stopBroadcast();
        
        console.log("=== All 10 bets placed successfully! ===");
        
        // Get final stats
        (uint256 totalBets, uint256 totalFees, uint256 contractBalance) = market.getStats();
        console.log("Total bets in contract:", totalBets);
        console.log("Total fees collected:", totalFees);
        console.log("Contract balance:", contractBalance);
    }
    
    struct BetData {
        uint256 dayOffset;
        uint256 priceMin;
        uint256 priceMax;
        uint256 stakeAmount;
    }
}
