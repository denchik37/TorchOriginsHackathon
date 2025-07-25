// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TorchPredictionMarket {
    constructor() {}

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

    uint256 public constant FEE_BPS = 50; // 0.5% in basis points (bps)
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MIN_BET_AMOUNT = 0.1 ether; // Minimum bet amount
    uint256 public constant MAX_PRICE_RANGE = 1000; // Maximum price range in basis points
    uint256 public protocolFees; // Accumulated fees for admin

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
}
