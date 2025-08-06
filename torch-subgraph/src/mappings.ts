import {
  BetPlaced as BetPlacedEvent,
  BetFinalized as BetFinalizedEvent,
  BetClaimed as BetClaimedEvent,
  FeeCollected as FeeCollectedEvent,
  TorchPredictionMarket
} from "../generated/TorchPredictionMarket/TorchPredictionMarket"
import { Bet, Fee, User } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleBetPlaced(event: BetPlacedEvent): void {
  let id = event.params.betId.toString()
  let entity = new Bet(id)

  entity.user = event.params.bettor.toHexString()
  entity.bucket = event.params.bucket.toI32()
  entity.stake = event.params.stake
  entity.priceMin = event.params.priceMin
  entity.priceMax = event.params.priceMax
  entity.targetTimestamp = event.params.targetTimestamp

  // Fetch full bet data from contract
  let contract = TorchPredictionMarket.bind(event.address)
  let betResult = contract.getBet(event.params.betId)

  entity.qualityBps = betResult.qualityBps
  entity.weight = betResult.weight
  entity.finalized = betResult.finalized
  entity.claimed = betResult.claimed
  entity.actualPrice = betResult.actualPrice
  entity.won = betResult.won
  entity.payout = BigInt.zero() // will be updated on claim

  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update User stats
  let userId = event.params.bettor.toHexString()
  let user = User.load(userId)
  if (!user) {
    user = new User(userId)
    user.totalBets = 0
    user.totalWon = 0
    user.totalStaked = BigInt.zero()
    user.totalPayout = BigInt.zero()
  }
  user.totalBets += 1
  user.totalStaked = user.totalStaked.plus(event.params.stake)
  user.save()
}

export function handleBetFinalized(event: BetFinalizedEvent): void {
  let bet = Bet.load(event.params.betId.toString())
  if (!bet) return

  bet.actualPrice = event.params.actualPrice
  bet.won = event.params.won
  bet.finalized = true
  bet.payout = event.params.payout

  bet.save()

  if (bet.won) {
    let user = User.load(bet.user)!
    user.totalWon += 1
    user.save()
  }
}

export function handleBetClaimed(event: BetClaimedEvent): void {
  let bet = Bet.load(event.params.betId.toString())
  if (!bet) return

  bet.claimed = true
  bet.payout = event.params.payout
  bet.save()

  let user = User.load(bet.user)!
  user.totalPayout = user.totalPayout.plus(event.params.payout)
  user.save()
}

export function handleFeeCollected(event: FeeCollectedEvent): void {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let entity = new Fee(id)
  entity.amount = event.params.amount
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}
