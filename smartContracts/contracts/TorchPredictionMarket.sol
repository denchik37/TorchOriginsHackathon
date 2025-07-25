// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ITorchPredictionMarket.sol";

contract TorchPredictionMarket is ITorchPredictionMarket, Ownable, AccessControl, ReentrancyGuard, Pausable {
    // ==============================================================
    // |                    Roles & Constructor                     |
    // ==============================================================
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    constructor() {
        grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(ADMIN_ROLE, msg.sender);
    }

    // ==============================================================
    // |                    Constants                               |
    // ==============================================================

    // Fee constants
    uint256 constant FEE_BPS = 50; // 0.5% in basis points (bps)
    uint256 constant BPS_DENOMINATOR = 10000;
    
    // Bet validation constants
    uint256 constant MIN_BET_AMOUNT = 0.1 ether; // Minimum bet amount
    uint256 constant MAX_PRICE_RANGE = 1000; // Maximum price range in basis points
    
    // Scoring constants
    uint256 constant SHARPNESS_BASE = 1000; // Base for sharpness calculation
    uint256 constant LEAD_TIME_BASE = 1000; // Base for lead time calculation
    uint256 constant QUALITY_DENOMINATOR = 10000; // Denominator for quality calculations

    // ==============================================================
    // |                    State Variables                         |
    // ==============================================================

    mapping(address => uint256) public balances;
    uint256 public betCount;
    mapping(uint256 => Bet) public bets;

    // Phase 4: Scoring & Rewards
    uint256 public protocolFees; // Accumulated fees for admin

    // Daily pools tracking
    mapping(uint256 => uint256) public dailyPoolTotal; // day => total pool amount
    mapping(uint256 => uint256) public dailyPoolQuality; // day => total quality-weighted amount
    mapping(uint256 => mapping(uint256 => bool)) public dailyBetProcessed; // day => betId => processed

    // Phase 5: UX, Security & Polish
    // Leaderboard tracking
    mapping(address => LeaderboardEntry) public leaderboard;
    address[] public topWinners; // Top 10 winners by net payout
    
    // Bet history tracking
    mapping(address => uint256[]) public userBets; // user => array of bet IDs
    mapping(address => uint256) public userBetCount; // user => number of bets placed

    // Resolved prices mapping: targetTimestamp => resolvedPrice
    mapping(uint256 => uint256) public resolvedPrices;
    mapping(uint256 => bool) public isResolved;

    // ==============================================================
    // |                    User Functions                          |
    // ==============================================================

    // Function to deposit Ether into this contract.
    // Call this function along with some Ether.
    // The balance of this contract will be automatically updated.
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // Call this function along with some Ether.
    // The function will throw an error since this function is not payable.
    function notPayable() public {}

    // Function to withdraw all Ether from this contract.
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    // Function to transfer Ether from this contract to address from input
    function transfer(address payable _to, uint256 _amount) public {
        // Note that "to" is declared as payable
        (bool success,) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether");
    }

    // ==============================================================
    // |                    Core Betting Functions                  |
    // ==============================================================

    function placeBet(
        uint256 targetTimestamp,
        uint256 priceMin,
        uint256 priceMax
    ) external payable whenNotPaused nonReentrant {
        require(msg.value >= MIN_BET_AMOUNT, "Bet amount too low");
        require(targetTimestamp > block.timestamp, "Target time must be in the future");
        require(targetTimestamp <= block.timestamp + 7 days, "Target time too far in future");
        require(priceMin < priceMax, "Invalid price range");
        require(priceMin > 0, "Price must be positive");
        
        // Validate price range is reasonable (not too wide)
        uint256 priceRange = ((priceMax - priceMin) * BPS_DENOMINATOR) / priceMin;
        require(priceRange <= MAX_PRICE_RANGE, "Price range too wide");

        // Calculate fee and net amount
        uint256 fee = (msg.value * FEE_BPS) / BPS_DENOMINATOR;
        uint256 netAmount = msg.value - fee;
        protocolFees += fee;

        // Phase 4: Calculate quality metrics
        uint256 sharpness = calculateSharpness(priceMin, priceMax);
        uint256 leadTime = calculateLeadTime(targetTimestamp);
        uint256 quality = (sharpness * leadTime) / QUALITY_DENOMINATOR;

        // Store bet
        bets[betCount] = Bet({
            user: msg.sender,
            targetTimestamp: targetTimestamp,
            priceMin: priceMin,
            priceMax: priceMax,
            amount: netAmount,
            fee: fee,
            settled: false,
            quality: quality,
            sharpness: sharpness,
            leadTime: leadTime,
            claimed: false
        });

        // Phase 5: Track user bet history
        userBets[msg.sender].push(betCount);
        userBetCount[msg.sender]++;

        emit BetPlaced(
            betCount,
            msg.sender,
            targetTimestamp,
            priceMin,
            priceMax,
            netAmount,
            fee
        );

        betCount++;
    }

    // ==============================================================
    // |                    Internal Functions                      |
    // ==============================================================

    /**
     * @dev Calculate sharpness multiplier based on price range
     * @param priceMin Minimum price in the range
     * @param priceMax Maximum price in the range
     * @return Sharpness multiplier (higher = more precise prediction)
     */
    function calculateSharpness(uint256 priceMin, uint256 priceMax) internal pure returns (uint256) {
        uint256 range = ((priceMax - priceMin) * SHARPNESS_BASE) / priceMin;
        // Inverse relationship: smaller range = higher sharpness
        if (range == 0) return SHARPNESS_BASE;
        return SHARPNESS_BASE / range;
    }

    /**
     * @dev Calculate lead time multiplier based on how early the bet was placed
     * @param targetTimestamp The target timestamp for the bet
     * @return Lead time multiplier (higher = earlier prediction)
     */
    function calculateLeadTime(uint256 targetTimestamp) internal view returns (uint256) {
        uint256 timeUntilTarget = targetTimestamp - block.timestamp;
        uint256 daysUntilTarget = timeUntilTarget / 1 days;
        
        // Higher multiplier for earlier predictions (up to 7 days)
        if (daysUntilTarget >= 7) return LEAD_TIME_BASE * 2;
        if (daysUntilTarget >= 3) return (LEAD_TIME_BASE * 3) / 2;
        if (daysUntilTarget >= 1) return (LEAD_TIME_BASE * 4) / 3;
        return LEAD_TIME_BASE;
    }

    /**
     * @dev Updates the leaderboard for a user, including total payout, total bets, and winning bets.
     * @param user The address of the user to update.
     * @param payout The total payout amount for the user.
     */
    function updateLeaderboard(address user, uint256 payout) internal {
        LeaderboardEntry storage entry = leaderboard[user];
        entry.totalPayout += payout;
        entry.totalBets++;
        if (payout > 0) {
            entry.winningBets++;
        }
    }

    // ==============================================================
    // |                    Admin Functions                         |
    // ==============================================================

    /**
     * @dev Admin function to resolve bets for a specific targetTimestamp
     * @param targetTimestamp The timestamp for which to resolve bets
     * @param resolvedPrice The final price at the target timestamp
     */
    function resolveBets(uint256 targetTimestamp, uint256 resolvedPrice) external onlyRole(ADMIN_ROLE) {
        require(targetTimestamp <= block.timestamp, "Cannot resolve future timestamps");
        require(!isResolved[targetTimestamp], "Already resolved for this timestamp");
        require(resolvedPrice > 0, "Resolved price must be positive");

        // Store the resolved price
        resolvedPrices[targetTimestamp] = resolvedPrice;
        isResolved[targetTimestamp] = true;

        // Process all bets for this timestamp
        for (uint256 i = 0; i < betCount; i++) {
            Bet storage bet = bets[i];
            
            // Check if this bet is for the target timestamp and not yet settled
            if (bet.targetTimestamp == targetTimestamp && !bet.settled) {
                bool won = (resolvedPrice >= bet.priceMin && resolvedPrice <= bet.priceMax);
                
                // Mark bet as settled
                bet.settled = true;
                
                // Phase 4: Track daily pools for quality-based payouts
                if (won) {
                    uint256 dailyKey = targetTimestamp / 1 days;
                    dailyPoolTotal[dailyKey] += bet.amount;
                    dailyPoolQuality[dailyKey] += bet.amount * bet.quality;
                }
                
                // Emit resolution event
                emit BetResolved(
                    i,
                    bet.user,
                    targetTimestamp,
                    resolvedPrice,
                    won,
                    0 // Payout will be calculated when claimed
                );
            }
        }
    }

    // ==============================================================
    // |                    Owner Functions                         |
    // ==============================================================

    /**
     * @dev Owner function to withdraw accumulated protocol fees
     */
    function withdrawFees() external onlyOwner {
        require(protocolFees > 0, "No fees to withdraw");
        uint256 amount = protocolFees;
        protocolFees = 0;
        (bool success,) = owner().call{value: amount}("");
        require(success, "Failed to send fees");
    }

    /**
     * @dev Owner function to grant ADMIN_ROLE to an address
     * @param admin The address to grant admin role to
     */
    function grantAdminRole(address admin) external onlyOwner {
        grantRole(ADMIN_ROLE, admin);
    }

    /**
     * @dev Owner function to revoke ADMIN_ROLE from an address
     * @param admin The address to revoke admin role from
     */
    function revokeAdminRole(address admin) external onlyOwner {
        revokeRole(ADMIN_ROLE, admin);
    }

    /**
     * @dev Pause the contract for safety
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ==============================================================
    // |                    View Functions                          |
    // ==============================================================

    /**
     * @dev Function to check if an address has ADMIN_ROLE
     * @param admin The address to check
     * @return True if the address has ADMIN_ROLE
     */
    function isAdmin(address admin) external view returns (bool) {
        return hasRole(ADMIN_ROLE, admin);
    }

    /**
     * @dev Get all bets for a user
     * @param user The address of the user
     * @return Array of bet IDs for the user
     */
    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }

    /**
     * @dev Get bet details for UI display
     * @param betId The ID of the bet
     * @return user The address of the bet user
     * @return targetTimestamp The target timestamp for the bet
     * @return priceMin The minimum price in the range
     * @return priceMax The maximum price in the range
     * @return amount The bet amount after fees
     * @return settled Whether the bet has been settled
     * @return claimed Whether the payout has been claimed
     * @return quality The quality score of the bet
     */
    function getBetDetails(uint256 betId) external view returns (
        address user,
        uint256 targetTimestamp,
        uint256 priceMin,
        uint256 priceMax,
        uint256 amount,
        bool settled,
        bool claimed,
        uint256 quality
    ) {
        require(betId < betCount, "Invalid bet ID");
        Bet storage bet = bets[betId];
        return (
            bet.user,
            bet.targetTimestamp,
            bet.priceMin,
            bet.priceMax,
            bet.amount,
            bet.settled,
            bet.claimed,
            bet.quality
        );
    }

    /**
     * @dev Get open bets for a user (not settled)
     * @param user The address of the user
     * @return Array of bet IDs that are not yet settled
     */
    function getOpenBets(address user) external view returns (uint256[] memory) {
        uint256[] memory allBets = userBets[user];
        uint256[] memory openBets = new uint256[](allBets.length);
        uint256 openCount = 0;
        
        for (uint256 i = 0; i < allBets.length; i++) {
            if (!bets[allBets[i]].settled) {
                openBets[openCount] = allBets[i];
                openCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](openCount);
        for (uint256 i = 0; i < openCount; i++) {
            result[i] = openBets[i];
        }
        
        return result;
    }

    /**
     * @dev Get closed bets for a user (settled)
     * @param user The address of the user
     * @return Array of bet IDs that are settled
     */
    function getClosedBets(address user) external view returns (uint256[] memory) {
        uint256[] memory allBets = userBets[user];
        uint256[] memory closedBets = new uint256[](allBets.length);
        uint256 closedCount = 0;
        
        for (uint256 i = 0; i < allBets.length; i++) {
            if (bets[allBets[i]].settled) {
                closedBets[closedCount] = allBets[i];
                closedCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](closedCount);
        for (uint256 i = 0; i < closedCount; i++) {
            result[i] = closedBets[i];
        }
        
        return result;
    }

    /**
     * @dev Get leaderboard entry for a user
     * @param user The address of the user
     * @return totalPayout The total payout amount for the user
     * @return totalBets The total number of bets placed by the user
     * @return winningBets The number of winning bets for the user
     */
    function getLeaderboardEntry(address user) external view returns (
        uint256 totalPayout,
        uint256 totalBets,
        uint256 winningBets
    ) {
        LeaderboardEntry storage entry = leaderboard[user];
        return (entry.totalPayout, entry.totalBets, entry.winningBets);
    }
}
