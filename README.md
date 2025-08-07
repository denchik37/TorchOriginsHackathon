# 🔥 Torch

> A decentralized, AI-powered prediction market protocol for crypto price discovery, built on **Hedera**

![License](https://img.shields.io/github/license/denchik37/TorchOriginsHackathon)
![Issues](https://img.shields.io/github/issues/denchik37/TorchOriginsHackathon)
![Pull Requests](https://img.shields.io/github/issues-pr/denchik37/TorchOriginsHackathon)
![Deploy](https://img.shields.io/badge/deploy-Hedera_Mainnet-2ea44f)

---

## 📚 Table of Contents

- [🌍 What Is Torch?](#-what-is-torch)
- [💎 Value Proposition](#-value-proposition)
- [🏁 Hackathon Scope](#hackathon-scope)
- [🧱 Monorepo Structure](#-monorepo-structure)
- [📁 Projects Overview](#-projects-overview)
- [📚 How It Works: TorchPredictionMarket Step-by-Step](#-how-it-works-torchpredictionmarket-step-by-step)
  - [🧾 Step 1: Place Bets](#-step-1-place-bets)
  - [🧮 Step 2: Weighting Bets Based on Precision](#-step-2-weighting-bets-based-on-precision)
  - [🔮 Step 3: Oracle Resolves Actual Price](#-step-3-oracle-resolves-actual-price)
  - [✅ Step 4: Contract Processes Results](#-step-4-contract-processes-results)
  - [🏆 Step 5 – Winnings](#-step-5--winnings)
- [🛠️ Installation](#-installation)
- [🤝 Team](#-team)
- [🔗 Resources](#-resources)

---

## 🌍 What Is Torch?

**Torch** is a decentralized prediction system for high-resolution, real-time **crypto price forecasting**.

Unlike conventional markets focused on **binary outcomes** (like _Polymarket_), Torch allows users to predict **price ranges across future timepoints**, creating a **dynamic price–time probability surface**.

Torch blends **AI agents** and **human traders** in an **InfoFi-aligned ecosystem**, rewarding **early**, **sharp**, and **high-conviction** predictions.

#

## 💎 Value Proposition

| Problem                                         | Torch’s Solution                                    |
|------------------------------------------------|----------------------------------------------------|
| ❌ Crypto traders lack continuous, high-resolution price forecasts | ✅ Torch builds a real-time price–time signal        |
| ❌ Existing markets (e.g. Polymarket) are binary or categorical   | ✅ Torch enables continuous predictions on a full probability surface |
| ❌ Fragmented market signals and incentives                        | ✅ Torch aligns humans and AI agents via economic incentives |

##
---

## Hackathon Scope

We’re building a working Torch prototype as part of a hackathon.

- ✅ Core smart contracts for prediction lifecycle and payout logic  
- ✅ Graph subgraph indexing for event querying  
- ✅ Wallet authenticated frontend  
- ✅ Realistic price resolution and reward distribution  

### 📄 Functional & Contract Specs  
[Google Doc](https://docs.google.com/document/d/1aKkVzq7iILSpPRT327vxOGVfcCCzwlWwrrcCx9HPXnA/edit)

### 🎨 Design & Frontend Specs  
[Google Doc](https://docs.google.com/document/d/15gglInxKkXICz9hhw3A2YnUqXs00CRjPEVfndv7MCPY/edit)

> ⚠️ Work in progress

---

## 🧱 Monorepo Structure

```
torchpredictionmarket/
├── frontend/          # React Frontend
├── smartContracts/    # Hedera-compatible Solidity contracts
├── torch-subgraph/    # Subgraph indexing smart contract events
├── LICENSE
└── README.md          
```

#

## 📁 Projects Overview

| Project         | Description |
|-----------------|-------------|
| [`frontend/`](./frontend) | React frontend with wallet connect, core integration of Smart Contract & Subgraph, prediction UI |
| [`smartContracts/`](./smartContracts) | Core Solidity smart contracts for placing, resolving, and claiming predictions |
| [`torch-subgraph/`](./torch-subgraph) | Graph protocol subgraph for indexing `BetPlaced`, `BetFinalized`, and `BetClaimed` events |

---

### 📚 **How It Works: TorchPredictionMarket** Step-by-Step

#### Example: Alice, Bob, and Charlie Predict HBAR’s Price for Tomorrow

##### 🧾 Step 1: Place Bets

| User     | Predicted Range | USD Range | Bet | Sharpness | Expected |
|----------|------------------|-----------|-----|-----------|----------|
| Alice    | 2900–3100 BPS    | $0.29–0.31| 10 HBAR | Tight    | ✅ Win   |
| Bob      | 2700–3300 BPS    | $0.27–0.33| 10 HBAR | Wide     | ✅ Win   |
| Charlie  | 3500–4000 BPS    | $0.35–0.40| 10 HBAR | Off-target | ❌ Lose |

##### 🧮 Step 2: Weighting Bets Based on Precision

| User     | Width BPS | Sharpness Multiplier | Net Stake | Weight |
|----------|-----------|----------------------|-----------|--------|
| Alice    | 200       | 0.5x                 | 9.95 HBAR | 4.975  |
| Bob      | 600       | 0.3x                 | 9.95 HBAR | 2.985  |
| Charlie  | 500       | 0.5x                 | 9.95 HBAR | 4.975  |

##### 🔮 Step 3: Oracle Resolves Actual Price

```solidity
setPriceForTimestamp(targetTimestamp, 3000);
```

##### ✅ Step 4: Contract Processes Results

```solidity
processBatch(targetTimestamp);
```
##### 🏆 Step 5 – Winnings

| User     | Weight | Result   | Winnings     |
|----------|--------|----------|--------------|
| Alice    | 4.975  | ✅ Win   | 18.66 HBAR   |
| Bob      | 2.985  | ✅ Win   | 11.19 HBAR   |
| Charlie  | 4.975  | ❌ Lose  | 0 HBAR       |

#
---

## 🛠 Installation

### 🔐 Setup Environment

```bash
git clone https://github.com/denchik37/TorchOriginsHackathon
cd TorchOriginsHackathon
```

### 📦 Install Dependencies (per folder)

```bash
cd smartContracts && npm install
cd torch-subgraph && npm install
cd frontend && npm install
```
---

## 🤝 Team

| Name             | Role                  | Contact / Profile                  |
|------------------|-----------------------|----------------------------------|
| Denis Igin | PM, Marketing  | [GitHub](https://github.com/denchik37) |
| Balut Catalin-Mihai         | Smart contract developer     | [Github](https://github.com/CatalinBalut) |
| Sebastien Guibert      | Frontend developer     | [Github](https://github.com/Cascou)   |
| Sebastian Balaj       | Sebastien Guibert     | [Github](https://github.com/balajsebastian)   |
| Hatif Osmani      | Frontend developer     | [Github](https://github.com/hatif03)   |


#

## 🔗 Resources

| Resource    | URL |
|-------------|-----|
| 🌐 Web       | [https://torch.bet](https://torch.bet) |
| 📄 Litepaper | [https://torch-1.gitbook.io/litepaper](https://torch-1.gitbook.io/litepaper) |
| ✍️ Blog      | [https://medium.com/torch-token-price-forecasting](https://medium.com/torch-token-price-forecasting) |
| 🐦 X (Twitter) | [https://x.com/torchbet](https://x.com/torchbet) |

---




