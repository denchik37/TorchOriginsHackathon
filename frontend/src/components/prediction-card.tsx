"use client";

import React, { useState } from "react";
import Image from "next/image";

import { ExternalLink, Minus, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KDEChart } from "@/components/kde-chart";
import { PriceRangeSelector } from "@/components/price-range-selector";
import { BetHistory } from "@/components/bet-history";
import { BetPlacingModal } from "@/components/bet-placing-modal";
import { BetPlacedModal } from "@/components/bet-placed-modal";

interface PredictionCardProps {
  className?: string;
}

export function PredictionCard({ className }: PredictionCardProps) {
  const [activeTab, setActiveTab] = useState("bet");
  const [selectedRange, setSelectedRange] = useState({
    min: 0.2475,
    max: 0.2843,
  });
  const [depositAmount, setDepositAmount] = useState("");
  const [resolutionDate, setResolutionDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  ); // Tomorrow
  const [resolutionTime, setResolutionTime] = useState("13:00");
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isBetPlaced, setIsBetPlaced] = useState(false);

  // Mock data for the KDE chart
  const forecastData = [
    { date: "Aug 1", price: 0.2645, confidence: 85 },
    { date: "Aug 2", price: 0.268, confidence: 78 },
    { date: "Aug 3", price: 0.2715, confidence: 72 },
    { date: "Aug 4", price: 0.275, confidence: 68 },
    { date: "Aug 5", price: 0.2785, confidence: 65 },
    { date: "Aug 6", price: 0.282, confidence: 62 },
    { date: "Aug 7", price: 0.2855, confidence: 58 },
    { date: "Aug 8", price: 0.289, confidence: 55 },
  ];

  const currentPrice = 0.2645;
  const totalBets = 1300;
  const activeBets = 375;
  const balance = 540;

  const handleRangeChange = (min: number, max: number) => {
    setSelectedRange({ min, max });
  };

  const handleMaxDeposit = () => {
    setDepositAmount(balance.toString());
  };

  const handlePlaceBet = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;

    setIsPlacingBet(true);

    // Simulate bet placement process
    setTimeout(() => {
      setIsPlacingBet(false);
      setIsBetPlaced(true);
    }, 3000);
  };

  const handleViewExplorer = () => {
    // Open transaction in explorer (mock implementation)
    window.open("https://explorer.hedera.com", "_blank");
  };

  const closeBetPlacingModal = () => {
    setIsPlacingBet(false);
  };

  const closeBetPlacedModal = () => {
    setIsBetPlaced(false);
    // Reset form
    setDepositAmount("");
  };

  const calculateMultipliers = () => {
    // Mock calculation for bet quality multipliers
    const sharpness = 0.5; // Based on range width
    const leadTime = 1.5; // Based on time to resolution
    const betQuality = sharpness * leadTime;
    return { sharpness, leadTime, betQuality };
  };

  // Date manipulation functions
  const incrementDate = () => {
    const newDate = new Date(resolutionDate);
    newDate.setDate(newDate.getDate() + 1);
    setResolutionDate(newDate);
  };

  const decrementDate = () => {
    const newDate = new Date(resolutionDate);
    newDate.setDate(newDate.getDate() - 1);
    // Don't allow dates in the past
    if (newDate > new Date()) {
      setResolutionDate(newDate);
    }
  };

  // Time manipulation functions
  const incrementTime = () => {
    const [hours, minutes] = resolutionTime.split(":").map(Number);
    let newHours = hours + 1;
    if (newHours >= 24) {
      newHours = 0;
    }
    setResolutionTime(
      `${newHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  };

  const decrementTime = () => {
    const [hours, minutes] = resolutionTime.split(":").map(Number);
    let newHours = hours - 1;
    if (newHours < 0) {
      newHours = 23;
    }
    setResolutionTime(
      `${newHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[date.getMonth()];
  };

  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  const { sharpness, leadTime, betQuality } = calculateMultipliers();
  const protocolFee = parseFloat(depositAmount || "0") * 0.005; // 0.5%
  const hasValidAmount = depositAmount && parseFloat(depositAmount) > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm bg-dark-slate px-2 py-1 rounded text-light-gray">
            Crypto
          </span>
          <span className="text-sm text-medium-gray">
            <span className="text-white">{activeBets}</span> active bets
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Image src="/hedera.svg" alt="Logo" width={65} height={65} />
          <div>
            <h2 className="text-xl font-bold text-light-gray">
              Predict HBAR token price in USD
            </h2>

            <Button asChild size="sm" variant="link" className="px-0">
              <a
                href="https://torch.bet/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Current price: ${currentPrice}
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bet">Bet</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <hr className="border-white/5 -mx-6 my-4" />

          <TabsContent value="bet" className="space-y-6">
            {/* Resolution Time Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-medium-gray">
                Select resolution time
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 d-flex flex-col items-center justify-center p-4 gap-2 rounded-lg text-center">
                  <span className="text-sm font-medium text-medium-gray">
                    Date
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-800"
                      onClick={decrementDate}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <div className="flex-1 text-center">
                      <div className="text-xl font-bold">
                        {formatDate(resolutionDate)} {formatDay(resolutionDate)}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-800"
                      onClick={incrementDate}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {resolutionDate.getFullYear()}
                  </div>
                </div>

                <div className="bg-neutral-900 d-flex flex-col items-center justify-center p-4 gap-2 rounded-lg text-center">
                  <span className="text-sm font-medium text-medium-gray">
                    Date
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-800"
                      onClick={decrementTime}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <div className="text-xl font-bold flex-1">
                      {resolutionTime}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-800"
                      onClick={incrementTime}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">UTC</div>
                </div>
              </div>
            </div>

            {/* Price Range Selection */}
            <PriceRangeSelector
              minPrice={0.2}
              maxPrice={0.34}
              currentPrice={currentPrice}
              totalBets={totalBets}
              onRangeChange={handleRangeChange}
            />

            {/* Bet Quality Multipliers */}
            <div className="p-3 bg-neutral-900 rounded-lg space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-medium-gray">Sharpness:</span>
                  <span className="text-bright-green">
                    {sharpness}x (10..20%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-medium-gray">Lead time:</span>
                  <span className="text-bright-green">
                    {leadTime}x (2..4 days)
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-medium-gray">Bet quality:</span>
                  <span className="text-bright-green">
                    {betQuality}x (weight)
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-white/5 -mx-6" />

            {/* Deposit Amount */}
            <div>
              <label
                htmlFor="depositNumber"
                className="text-sm font-medium text-medium-gray"
              >
                Deposit amount
              </label>

              <div className="bg-neutral-900 p-4 rounded-lg my-2">
                <div className="relative">
                  <Input
                    id="depositNumber"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="pr-20"
                    placeholder="0.0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    {!hasValidAmount && (
                      <AlertTriangle className="w-4 h-4 text-magenta" />
                    )}
                    <span className="text-sm font-medium text-magenta">H</span>
                    <span className="text-sm text-medium-gray">HBAR</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-sm">
                  <span className="text-medium-gray">Balance: {balance}</span>
                  <button
                    type="button"
                    onClick={handleMaxDeposit}
                    className="text-vibrant-purple hover:underline"
                  >
                    Use MAX
                  </button>
                </div>
              </div>

              {/* Protocol Fee */}
              <div className="flex justify-between py-3 px-4 border border-white/5 rounded-lg text-sm">
                <span className="text-medium-gray">Protocol fee:</span>
                <span className="text-white">
                  0.5%{" "}
                  <span className="text-medium-gray">
                    ({protocolFee.toFixed(4)} HBAR)
                  </span>
                </span>
              </div>
            </div>

            {/* Warning Message */}
            {hasValidAmount && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-100">
                    Betting on prediction markets bears significant risk of
                    losing funds. Only contribute what you can afford to lose.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              className="w-full bg-vibrant-purple hover:bg-vibrant-purple/90 text-white"
              size="lg"
              onClick={handlePlaceBet}
              disabled={!hasValidAmount}
            >
              {hasValidAmount ? "Bet" : "Enter Amount"}
            </Button>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <KDEChart currentPrice={currentPrice} className="h-80" />
          </TabsContent>

          <TabsContent value="history">
            <BetHistory />
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Bet Placing Modal */}
      <BetPlacingModal
        isOpen={isPlacingBet}
        onClose={closeBetPlacingModal}
        onViewExplorer={handleViewExplorer}
      />

      {/* Bet Placed Modal */}
      <BetPlacedModal
        isOpen={isBetPlaced}
        onClose={closeBetPlacedModal}
        onViewExplorer={handleViewExplorer}
      />
    </Card>
  );
}
