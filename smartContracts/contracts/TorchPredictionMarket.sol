// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TorchPredictionMarket is Ownable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    constructor() {
        grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(ADMIN_ROLE, msg.sender);
    }

    mapping(address => uint256) public balances;

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

    struct Bet {
        address user;
        uint256 targetTimestamp;
        uint256 priceMin;
        uint256 priceMax;
        uint256 amount; // Amount after fee
        uint256 fee;    // Protocol fee
        bool settled;
    }

    uint256 public betCount;
    mapping(uint256 => Bet) public bets;

    event BetPlaced(
        uint256 indexed betId,
        address indexed user,
        uint256 targetTimestamp,
        uint256 priceMin,
        uint256 priceMax,
        uint256 amount,
        uint256 fee
    );

    event BetResolved(
        uint256 indexed betId,
        address indexed user,
        uint256 targetTimestamp,
        uint256 resolvedPrice,
        bool won,
        uint256 payout
    );

    uint256 public constant FEE_BPS = 50; // 0.5% in basis points (bps)
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MIN_BET_AMOUNT = 0.1 ether; // Minimum bet amount
    uint256 public constant MAX_PRICE_RANGE = 1000; // Maximum price range in basis points
    uint256 public protocolFees; // Accumulated fees for admin

    // Resolved prices mapping: targetTimestamp => resolvedPrice
    mapping(uint256 => uint256) public resolvedPrices;
    mapping(uint256 => bool) public isResolved;


    function placeBet(
        uint256 targetTimestamp,
        uint256 priceMin,
        uint256 priceMax
    ) external payable {
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

        // Store bet
        bets[betCount] = Bet({
            user: msg.sender,
            targetTimestamp: targetTimestamp,
            priceMin: priceMin,
            priceMax: priceMax,
            amount: netAmount,
            fee: fee,
            settled: false
        });

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
                uint256 payout = 0;
                
                if (won) {
                    // Calculate payout (2x the bet amount for winning)
                    payout = bet.amount * 2;
                    // Transfer winnings to user
                    (bool success,) = bet.user.call{value: payout}("");
                    require(success, "Failed to send payout");
                }
                
                // Mark bet as settled
                bet.settled = true;
                
                // Emit resolution event
                emit BetResolved(
                    i,
                    bet.user,
                    targetTimestamp,
                    resolvedPrice,
                    won,
                    payout
                );
            }
        }
    }

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
     * @dev Function to check if an address has ADMIN_ROLE
     * @param admin The address to check
     * @return True if the address has ADMIN_ROLE
     */
    function isAdmin(address admin) external view returns (bool) {
        return hasRole(ADMIN_ROLE, admin);
    }
}
