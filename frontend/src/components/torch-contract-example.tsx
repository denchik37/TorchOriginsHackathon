import React, { useState, useEffect } from 'react';
import { useTorchPredictionMarket } from '../hooks/useTorchPredictionMarket';

export function TorchContractExample() {
  const {
    // State
    contract,
    loading,
    error,
    isConnected,
    accountId,
    evmAddress,

    // View functions
    getConstants,
    getStats,
    getNextBetId,
    getBet,
    simulatePlaceBet,
    isPaused,
    getOwner,

    // Write functions
    placeBet,
    claimBet,
    pause,
    unpause,

    // Utility functions
    clearError
  } = useTorchPredictionMarket();

  const [constants, setConstants] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [nextBetId, setNextBetId] = useState<string | null>(null);
  const [paused, setPaused] = useState<boolean | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<any>(null);

  // Form state for placing bets
  const [betForm, setBetForm] = useState({
    targetTimestamp: '',
    priceMin: '',
    priceMax: '',
    stakeAmount: ''
  });

  // Load initial data
  useEffect(() => {
    if (contract) {
      loadContractData();
    }
  }, [contract]);

  const loadContractData = async () => {
    try {
      const [constantsData, statsData, nextId, pausedStatus, ownerAddress] = await Promise.all([
        getConstants(),
        getStats(),
        getNextBetId(),
        isPaused(),
        getOwner()
      ]);

      setConstants(constantsData);
      setStats(statsData);
      setNextBetId(nextId);
      setPaused(pausedStatus);
      setOwner(ownerAddress);
    } catch (err) {
      console.error('Failed to load contract data:', err);
    }
  };

  const handleSimulateBet = async () => {
    if (!betForm.targetTimestamp || !betForm.priceMin || !betForm.priceMax || !betForm.stakeAmount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const sim = await simulatePlaceBet(
        betForm.targetTimestamp,
        betForm.priceMin,
        betForm.priceMax,
        betForm.stakeAmount
      );
      setSimulation(sim);
    } catch (err) {
      console.error('Failed to simulate bet:', err);
    }
  };

  const handlePlaceBet = async () => {
    if (!betForm.targetTimestamp || !betForm.priceMin || !betForm.priceMax || !betForm.stakeAmount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const betId = await placeBet(
        betForm.targetTimestamp,
        betForm.priceMin,
        betForm.priceMax,
        betForm.stakeAmount
      );
      alert(`Bet placed successfully! Bet ID: ${betId}`);
      
      // Reload data
      await loadContractData();
    } catch (err) {
      console.error('Failed to place bet:', err);
    }
  };

  const handleClaimBet = async () => {
    const betId = prompt('Enter bet ID to claim:');
    if (!betId) return;

    try {
      await claimBet(betId);
      alert('Bet claimed successfully!');
    } catch (err) {
      console.error('Failed to claim bet:', err);
    }
  };

  const handlePauseContract = async () => {
    try {
      await pause();
      alert('Contract paused successfully!');
      setPaused(true);
    } catch (err) {
      console.error('Failed to pause contract:', err);
    }
  };

  const handleUnpauseContract = async () => {
    try {
      await unpause();
      alert('Contract unpaused successfully!');
      setPaused(false);
    } catch (err) {
      console.error('Failed to unpause contract:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Wallet Not Connected</h2>
        <p className="text-yellow-700">Please connect your wallet to interact with the contract.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Contract Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Connected:</span> {isConnected ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Account ID:</span> {accountId || 'N/A'}
          </div>
          <div>
            <span className="font-medium">EVM Address:</span> {evmAddress || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Contract:</span> {contract ? 'Initialized' : 'Not initialized'}
          </div>
          <div>
            <span className="font-medium">Paused:</span> {paused === null ? 'Loading...' : paused ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Owner:</span> {owner || 'Loading...'}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Clear Error
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">Loading...</p>
        </div>
      )}

      {constants && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Contract Constants</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Batch Size:</span> {constants.batchSize}</div>
            <div><span className="font-medium">Fee BPS:</span> {constants.feeBps}</div>
            <div><span className="font-medium">Max Days Ahead:</span> {constants.maxDaysAhead}</div>
            <div><span className="font-medium">Max Stake:</span> {constants.maxStake}</div>
            <div><span className="font-medium">Min Days Ahead:</span> {constants.minDaysAhead}</div>
            <div><span className="font-medium">Min Stake:</span> {constants.minStake}</div>
          </div>
        </div>
      )}

      {stats && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Contract Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="font-medium">Total Bets:</span> {stats.totalBets}</div>
            <div><span className="font-medium">Total Fees:</span> {stats.totalFees}</div>
            <div><span className="font-medium">Contract Balance:</span> {stats.contractBalance}</div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Place Bet</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Timestamp
            </label>
            <input
              type="number"
              value={betForm.targetTimestamp}
              onChange={(e) => setBetForm(prev => ({ ...prev, targetTimestamp: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Unix timestamp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Min (in wei)
            </label>
            <input
              type="number"
              value={betForm.priceMin}
              onChange={(e) => setBetForm(prev => ({ ...prev, priceMin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum price"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Max (in wei)
            </label>
            <input
              type="number"
              value={betForm.priceMax}
              onChange={(e) => setBetForm(prev => ({ ...prev, priceMax: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Maximum price"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stake Amount (in ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={betForm.stakeAmount}
              onChange={(e) => setBetForm(prev => ({ ...prev, stakeAmount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.001"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSimulateBet}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Simulate Bet
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>

      {simulation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Bet Simulation</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Valid:</span> {simulation.isValid ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">Fee:</span> {simulation.fee}</div>
            <div><span className="font-medium">Stake Net:</span> {simulation.stakeNet}</div>
            <div><span className="font-medium">Weight:</span> {simulation.weight}</div>
            <div><span className="font-medium">Bucket:</span> {simulation.bucket}</div>
            {!simulation.isValid && (
              <div className="col-span-2">
                <span className="font-medium">Error:</span> {simulation.errorMessage}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-orange-800 mb-4">Admin Actions</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleClaimBet}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Claim Bet
          </button>
          <button
            onClick={handlePauseContract}
            disabled={paused === true}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            Pause Contract
          </button>
          <button
            onClick={handleUnpauseContract}
            disabled={paused === false}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Unpause Contract
          </button>
        </div>
      </div>

      {nextBetId && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Next Bet ID</h3>
          <p className="text-indigo-700">{nextBetId}</p>
        </div>
      )}
    </div>
  );
}
