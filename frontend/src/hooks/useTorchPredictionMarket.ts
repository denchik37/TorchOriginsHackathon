import { useState, useCallback, useEffect } from 'react';
import { useWallet, useAccountId, useEvmAddress } from '@buidlerlabs/hashgraph-react-wallets';
import { HashpackConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';
import { ethers } from 'ethers';
import TorchPredictionMarketABI from '../../abi/TorchPredictionMarket.json';

// Contract address - you'll need to update this with your deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6e612d342DBaa17EA17c4a8Fe95553C0594E052B';

// Types based on the contract ABI
export interface Bet {
  bettor: string;
  targetTimestamp: string;
  priceMin: string;
  priceMax: string;
  stake: string;
  qualityBps: string;
  weight: string;
  finalized: boolean;
  claimed: boolean;
  actualPrice: string;
  won: boolean;
}

export interface BetSimulation {
  fee: string;
  stakeNet: string;
  sharpnessBps: string;
  timeBps: string;
  qualityBps: string;
  weight: string;
  bucket: string;
  isValid: boolean;
  errorMessage: string;
}

export interface BucketInfo {
  totalBets: string;
  totalWinningWeight: string;
  nextProcessIndex: string;
  aggregationComplete: boolean;
}

export interface BucketStats {
  totalStaked: string;
  totalWeight: string;
  price: string;
}

export interface BatchInfo {
  nextBatchStart: string;
  nextBatchEnd: string;
  remainingBets: string;
  canProcess: boolean;
}

export interface ContractStats {
  totalBets: string;
  totalFees: string;
  contractBalance: string;
}

export function useTorchPredictionMarket() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wallet hooks
  const wallet = useWallet(HashpackConnector);
  const accountId = useAccountId({ connector: HashpackConnector });
  const evmAddress = useEvmAddress({ connector: HashpackConnector });

  // Initialize contract
  useEffect(() => {
    const initializeContract = async () => {
      console.log('Initializing contract...');
      console.log('Wallet:', wallet);
      console.log('EVM Address:', evmAddress.data);
      
      if (wallet && evmAddress.data) {
        try {
          // For now, we'll use a mock implementation
          // This will be enhanced once we have proper wallet integration
          console.log('Wallet connected, using mock contract for now');
          setError('Using mock contract - real contract integration pending');
          setContract(null); // We'll use mock functions instead
        } catch (err) {
          console.error('Contract initialization error:', err);
          setError(`Failed to initialize contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } else {
        console.log('Wallet or EVM address not available');
        setContract(null);
      }
    };

    initializeContract();
  }, [wallet, evmAddress.data]);

  // Helper function to handle contract calls
  const executeContractCall = useCallback(async <T>(
    callFn: () => Promise<T>,
    loadingMessage = 'Transaction in progress...'
  ): Promise<T> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFn();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // ===== VIEW FUNCTIONS =====

  // Get contract constants
  const getConstants = useCallback(async () => {
    if (!contract) return null;

    try {
      const [
        batchSize,
        bpsDenom,
        feeBps,
        maxDaysAhead,
        maxStake,
        minDaysAhead,
        minStake,
        secondsPerDay
      ] = await Promise.all([
        contract.BATCH_SIZE(),
        contract.BPS_DENOM(),
        contract.FEE_BPS(),
        contract.MAX_DAYS_AHEAD(),
        contract.MAX_STAKE(),
        contract.MIN_DAYS_AHEAD(),
        contract.MIN_STAKE(),
        contract.SECONDS_PER_DAY()
      ]);

      return {
        batchSize: batchSize.toString(),
        bpsDenom: bpsDenom.toString(),
        feeBps: feeBps.toString(),
        maxDaysAhead: maxDaysAhead.toString(),
        maxStake: maxStake.toString(),
        minDaysAhead: minDaysAhead.toString(),
        minStake: minStake.toString(),
        secondsPerDay: secondsPerDay.toString()
      };
    } catch (err) {
      setError(`Failed to get constants: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get contract stats
  const getStats = useCallback(async (): Promise<ContractStats | null> => {
    if (!contract) return null;

    try {
      const [totalBets, totalFees, contractBalance] = await contract.getStats();
      return {
        totalBets: totalBets.toString(),
        totalFees: totalFees.toString(),
        contractBalance: contractBalance.toString()
      };
    } catch (err) {
      setError(`Failed to get stats: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get next bet ID
  const getNextBetId = useCallback(async (): Promise<string | null> => {
    if (!contract) return null;

    try {
      const nextBetId = await contract.nextBetId();
      return nextBetId.toString();
    } catch (err) {
      setError(`Failed to get next bet ID: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get bet by ID
  const getBet = useCallback(async (betId: string): Promise<Bet | null> => {
    if (!contract) return null;

    try {
      const bet = await contract.getBet(betId);
      return {
        bettor: bet.bettor,
        targetTimestamp: bet.targetTimestamp.toString(),
        priceMin: bet.priceMin.toString(),
        priceMax: bet.priceMax.toString(),
        stake: bet.stake.toString(),
        qualityBps: bet.qualityBps.toString(),
        weight: bet.weight.toString(),
        finalized: bet.finalized,
        claimed: bet.claimed,
        actualPrice: bet.actualPrice.toString(),
        won: bet.won
      };
    } catch (err) {
      setError(`Failed to get bet: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get bucket info
  const getBucketInfo = useCallback(async (bucket: string): Promise<BucketInfo | null> => {
    if (!contract) return null;

    try {
      const bucketInfo = await contract.getBucketInfo(bucket);
      return {
        totalBets: bucketInfo.totalBets.toString(),
        totalWinningWeight: bucketInfo.totalWinningWeight.toString(),
        nextProcessIndex: bucketInfo.nextProcessIndex.toString(),
        aggregationComplete: bucketInfo.aggregationComplete
      };
    } catch (err) {
      setError(`Failed to get bucket info: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get bucket stats
  const getBucketStats = useCallback(async (bucket: string): Promise<BucketStats | null> => {
    if (!contract) return null;

    try {
      const [totalStaked, totalWeight, price] = await contract.getBucketStats(bucket);
      return {
        totalStaked: totalStaked.toString(),
        totalWeight: totalWeight.toString(),
        price: price.toString()
      };
    } catch (err) {
      setError(`Failed to get bucket stats: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get batch info
  const getBatchInfo = useCallback(async (bucket: string): Promise<BatchInfo | null> => {
    if (!contract) return null;

    try {
      const batchInfo = await contract.getBatchInfo(bucket);
      return {
        nextBatchStart: batchInfo.nextBatchStart.toString(),
        nextBatchEnd: batchInfo.nextBatchEnd.toString(),
        remainingBets: batchInfo.remainingBets.toString(),
        canProcess: batchInfo.canProcess
      };
    } catch (err) {
      setError(`Failed to get batch info: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get price at timestamp
  const getPriceAtTimestamp = useCallback(async (timestamp: string): Promise<string | null> => {
    if (!contract) return null;

    try {
      const price = await contract.getPriceAtTimestamp(timestamp);
      return price.toString();
    } catch (err) {
      setError(`Failed to get price at timestamp: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Check if prices are set for bucket
  const arePricesSetForBucket = useCallback(async (bucket: string): Promise<boolean | null> => {
    if (!contract) return null;

    try {
      const areSet = await contract.arePricesSetForBucket(bucket);
      return areSet;
    } catch (err) {
      setError(`Failed to check if prices are set: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get bucket index for timestamp
  const getBucketIndex = useCallback(async (targetTimestamp: string): Promise<string | null> => {
    if (!contract) return null;

    try {
      const bucketIndex = await contract.bucketIndex(targetTimestamp);
      return bucketIndex.toString();
    } catch (err) {
      setError(`Failed to get bucket index: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get time multiplier
  const getTimeMultiplier = useCallback(async (targetTimestamp: string): Promise<string | null> => {
    if (!contract) return null;

    try {
      const multiplier = await contract.getTimeMultiplier(targetTimestamp);
      return multiplier.toString();
    } catch (err) {
      setError(`Failed to get time multiplier: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get sharpness multiplier
  const getSharpnessMultiplier = useCallback(async (priceMin: string, priceMax: string): Promise<string | null> => {
    if (!contract) return null;

    try {
      const multiplier = await contract.getSharpnessMultiplier(priceMin, priceMax);
      return multiplier.toString();
    } catch (err) {
      setError(`Failed to get sharpness multiplier: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Simulate place bet
  const simulatePlaceBet = useCallback(async (
    targetTimestamp: string,
    priceMin: string,
    priceMax: string,
    stakeAmount: string
  ): Promise<BetSimulation | null> => {
    console.log('Simulating bet with parameters:', {
      targetTimestamp,
      priceMin,
      priceMax,
      stakeAmount
    });

    // Mock simulation for now
    const mockSimulation: BetSimulation = {
      fee: ethers.utils.parseEther('0.001').toString(), // 0.001 HBAR fee
      stakeNet: ethers.utils.parseEther(stakeAmount).sub(ethers.utils.parseEther('0.001')).toString(),
      sharpnessBps: '5000', // 50%
      timeBps: '3000', // 30%
      qualityBps: '15000', // 150%
      weight: ethers.utils.parseEther(stakeAmount).mul(150).div(100).toString(),
      bucket: '1',
      isValid: true,
      errorMessage: ''
    };

    console.log('Mock simulation result:', mockSimulation);
    return mockSimulation;
  }, []);

  // ===== WRITE FUNCTIONS =====

  // Place a single bet
  const placeBet = useCallback(async (
    targetTimestamp: string,
    priceMin: string,
    priceMax: string,
    value: string
  ): Promise<string | null> => {
    return executeContractCall(async () => {
      console.log('Placing bet with parameters:', {
        targetTimestamp,
        priceMin,
        priceMax,
        value
      });

      // Mock bet placement for now
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Generate a mock bet ID
      const mockBetId = Math.floor(Math.random() * 1000000).toString();
      console.log('Mock bet placed successfully with ID:', mockBetId);
      
      return mockBetId;
    }, 'Placing bet...');
  }, [executeContractCall]);

  // Place batch bets
  const placeBatchBets = useCallback(async (
    targetTimestamps: string[],
    priceMins: string[],
    priceMaxs: string[],
    value: string
  ): Promise<string[] | null> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.placeBatchBets(targetTimestamps, priceMins, priceMaxs, {
        value: ethers.utils.parseEther(value)
      });
      
      const receipt = await tx.wait();
      
      // Find the BetPlaced events
      const betPlacedEvents = receipt.events?.filter(
        (event: any) => event.event === 'BetPlaced'
      );
      
      if (betPlacedEvents && betPlacedEvents.length > 0) {
        return betPlacedEvents.map((event: any) => event.args.betId.toString());
      }
      
      throw new Error('BetPlaced events not found in transaction receipt');
    }, 'Placing batch bets...');
  }, [contract, executeContractCall]);

  // Claim bet
  const claimBet = useCallback(async (betId: string): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.claimBet(betId);
      await tx.wait();
      return true;
    }, 'Claiming bet...');
  }, [contract, executeContractCall]);

  // Process batch
  const processBatch = useCallback(async (bucket: string): Promise<{ processedCount: string; winningWeight: string } | null> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.processBatch(bucket);
      const receipt = await tx.wait();
      
      // Find the BatchProcessed event
      const batchProcessedEvent = receipt.events?.find(
        (event: any) => event.event === 'BatchProcessed'
      );
      
      if (batchProcessedEvent) {
        return {
          processedCount: batchProcessedEvent.args.processedCount.toString(),
          winningWeight: batchProcessedEvent.args.winningWeight.toString()
        };
      }
      
      throw new Error('BatchProcessed event not found in transaction receipt');
    }, 'Processing batch...');
  }, [contract, executeContractCall]);

  // Set price for timestamp (owner only)
  const setPriceForTimestamp = useCallback(async (timestamp: string, price: string): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.setPriceForTimestamp(timestamp, price);
      await tx.wait();
      return true;
    }, 'Setting price for timestamp...');
  }, [contract, executeContractCall]);

  // Set prices for timestamps (owner only)
  const setPricesForTimestamps = useCallback(async (timestamps: string[], prices: string[]): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.setPricesForTimestamps(timestamps, prices);
      await tx.wait();
      return true;
    }, 'Setting prices for timestamps...');
  }, [contract, executeContractCall]);

  // Emergency withdraw
  const emergencyWithdraw = useCallback(async (): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.emergencyWithdraw();
      await tx.wait();
      return true;
    }, 'Emergency withdrawing...');
  }, [contract, executeContractCall]);

  // Withdraw fees (owner only)
  const withdrawFees = useCallback(async (): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.withdrawFees();
      await tx.wait();
      return true;
    }, 'Withdrawing fees...');
  }, [contract, executeContractCall]);

  // Pause contract (owner only)
  const pause = useCallback(async (): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.pause();
      await tx.wait();
      return true;
    }, 'Pausing contract...');
  }, [contract, executeContractCall]);

  // Unpause contract (owner only)
  const unpause = useCallback(async (): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.unpause();
      await tx.wait();
      return true;
    }, 'Unpausing contract...');
  }, [contract, executeContractCall]);

  // Transfer ownership (owner only)
  const transferOwnership = useCallback(async (newOwner: string): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.transferOwnership(newOwner);
      await tx.wait();
      return true;
    }, 'Transferring ownership...');
  }, [contract, executeContractCall]);

  // Renounce ownership (owner only)
  const renounceOwnership = useCallback(async (): Promise<boolean> => {
    return executeContractCall(async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.renounceOwnership();
      await tx.wait();
      return true;
    }, 'Renouncing ownership...');
  }, [contract, executeContractCall]);

  // Check if contract is paused
  const isPaused = useCallback(async (): Promise<boolean | null> => {
    if (!contract) return null;

    try {
      const paused = await contract.paused();
      return paused;
    } catch (err) {
      setError(`Failed to check if contract is paused: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get contract owner
  const getOwner = useCallback(async (): Promise<string | null> => {
    if (!contract) return null;

    try {
      const owner = await contract.owner();
      return owner;
    } catch (err) {
      setError(`Failed to get owner: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get total fees collected
  const getTotalFeesCollected = useCallback(async (): Promise<string | null> => {
    if (!contract) return null;

    try {
      const totalFees = await contract.totalFeesCollected();
      return totalFees.toString();
    } catch (err) {
      setError(`Failed to get total fees collected: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  // Get start timestamp
  const getStartTimestamp = useCallback(async (): Promise<string | null> => {
    if (!contract) return null;

    try {
      const startTimestamp = await contract.startTimestamp();
      return startTimestamp.toString();
    } catch (err) {
      setError(`Failed to get start timestamp: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [contract]);

  return {
    // State
    contract,
    loading,
    error,
    isConnected: !!wallet && !!evmAddress.data,
    accountId: accountId.data,
    evmAddress: evmAddress.data,

    // View functions
    getConstants,
    getStats,
    getNextBetId,
    getBet,
    getBucketInfo,
    getBucketStats,
    getBatchInfo,
    getPriceAtTimestamp,
    arePricesSetForBucket,
    getBucketIndex,
    getTimeMultiplier,
    getSharpnessMultiplier,
    simulatePlaceBet,
    isPaused,
    getOwner,
    getTotalFeesCollected,
    getStartTimestamp,

    // Write functions
    placeBet,
    placeBatchBets,
    claimBet,
    processBatch,
    setPriceForTimestamp,
    setPricesForTimestamps,
    emergencyWithdraw,
    withdrawFees,
    pause,
    unpause,
    transferOwnership,
    renounceOwnership,

    // Utility functions
    clearError: () => setError(null)
  };
}
