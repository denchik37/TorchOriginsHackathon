// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import {TorchPredictionMarket} from "../src/TorchPredictionMarket.sol";

contract DeployTorchPredictionMarketScript is Script {
    function run() external returns (address) {
        // Load the private key from the .env file
        uint256 deployerPrivateKey = vm.envUint("OPERATOR_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        console.log("Deploying TorchPredictionMarket...");
        console.log("Deployer address:", deployerAddress);
        console.log("Current timestamp:", block.timestamp);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        TorchPredictionMarket predictionMarket = new TorchPredictionMarket();
        
        vm.stopBroadcast();
        
        console.log("TorchPredictionMarket deployed to:", address(predictionMarket));
        console.log("Contract owner:", predictionMarket.owner());
        console.log("Start timestamp:", predictionMarket.startTimestamp());
        console.log("Contract balance:", address(predictionMarket).balance);
        
        // Log some contract constants for reference
        console.log("=== Contract Constants ===");
        console.log("SECONDS_PER_DAY:", predictionMarket.SECONDS_PER_DAY());
        console.log("FEE_BPS:", predictionMarket.FEE_BPS());
        console.log("BPS_DENOM:", predictionMarket.BPS_DENOM());
        console.log("MIN_STAKE:", predictionMarket.MIN_STAKE());
        console.log("MAX_STAKE:", predictionMarket.MAX_STAKE());
        console.log("MAX_DAYS_AHEAD:", predictionMarket.MAX_DAYS_AHEAD());
        console.log("MIN_DAYS_AHEAD:", predictionMarket.MIN_DAYS_AHEAD());
        console.log("BATCH_SIZE:", predictionMarket.BATCH_SIZE());
        
        return address(predictionMarket);
    }
} 