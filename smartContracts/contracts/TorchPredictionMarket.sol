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
    uint256 public protocolFees; // Accumulated fees for admin

    function placeBet(
        uint256 targetTimestamp,
        uint256 priceMin,
        uint256 priceMax
    ) external payable {
        require(msg.value > 0, "Bet amount must be > 0");
        require(targetTimestamp > block.timestamp, "Target time must be in the future");
        require(priceMin < priceMax, "Invalid price range");

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
