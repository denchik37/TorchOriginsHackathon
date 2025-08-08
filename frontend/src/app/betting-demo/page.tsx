'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTorchPredictionMarket } from '@/hooks/useTorchPredictionMarket';
import { useMultiWallet } from '@/hooks/useMultiWallet';

export default function BettingDemoPage() {
  const [targetTimestamp, setTargetTimestamp] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [result, setResult] = useState<string>('');

  const { 
    placeBet, 
    simulatePlaceBet, 
    loading, 
    error, 
    isConnected,
    clearError 
  } = useTorchPredictionMarket();

  const { 
    currentWalletState, 
    currentEvmAddress, 
    connectWallet 
  } = useMultiWallet();

  const handleConnectWallet = async () => {
    try {
      setResult('Connecting wallet...');
      await connectWallet('hashpack');
      setResult('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setResult(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSimulateBet = async () => {
    if (!targetTimestamp || !priceMin || !priceMax || !stakeAmount) {
      setResult('Please fill in all fields');
      return;
    }

    try {
      clearError();
      setResult('Simulating bet...');

      const simulation = await simulatePlaceBet(
        targetTimestamp,
        priceMin,
        priceMax,
        stakeAmount
      );

      if (simulation) {
        setResult(`Simulation successful!\nValid: ${simulation.isValid}\nFee: ${simulation.fee}\nWeight: ${simulation.weight}\nError: ${simulation.errorMessage || 'None'}`);
      } else {
        setResult('Simulation failed');
      }
    } catch (error) {
      setResult(`Simulation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePlaceBet = async () => {
    if (!targetTimestamp || !priceMin || !priceMax || !stakeAmount) {
      setResult('Please fill in all fields');
      return;
    }

    if (!isConnected) {
      setResult('Please connect your wallet first');
      return;
    }

    try {
      clearError();
      setResult('Placing bet...');

      const betId = await placeBet(
        targetTimestamp,
        priceMin,
        priceMax,
        stakeAmount
      );

      if (betId) {
        setResult(`Bet placed successfully! Bet ID: ${betId}`);
      } else {
        setResult('Failed to place bet - no bet ID returned');
      }
    } catch (error) {
      setResult(`Bet placement error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Bet Placement Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Status */}
          <div className="p-4 bg-neutral-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Wallet Status</h3>
            <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Address: {currentEvmAddress || 'Not connected'}</p>
            <p>Wallet State: {currentWalletState ? 'Available' : 'Not available'}</p>
            {!isConnected && (
              <Button onClick={handleConnectWallet} className="mt-2">
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Contract Status */}
          <div className="p-4 bg-neutral-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Contract Status</h3>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            {error && <p className="text-red-400">Error: {error}</p>}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Connect your wallet first</li>
              <li>Fill in the bet parameters below</li>
              <li>Test simulation to check if bet is valid</li>
              <li>Place the actual bet</li>
            </ol>
          </div>

          {/* Bet Parameters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Timestamp</label>
              <Input
                type="number"
                value={targetTimestamp}
                onChange={(e) => setTargetTimestamp(e.target.value)}
                placeholder="e.g., 1754472860"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price Min (in wei)</label>
              <Input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="e.g., 100000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price Max (in wei)</label>
              <Input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="e.g., 200000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stake Amount (in HBAR)</label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="e.g., 0.1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSimulateBet} disabled={loading}>
              Simulate Bet
            </Button>
            <Button 
              onClick={handlePlaceBet} 
              disabled={loading || !isConnected}
              className="bg-green-600 hover:bg-green-700"
            >
              Place Bet
            </Button>
          </div>

          {/* Result */}
          {result && (
            <div className="p-4 bg-neutral-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
