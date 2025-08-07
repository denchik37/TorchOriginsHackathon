'use client';
import { useState } from 'react';
import { useWallet } from '@buidlerlabs/hashgraph-react-wallets';
import { HashpackConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';
import { gql, useQuery } from '@apollo/client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

import { User, Bet } from '@/lib/types';
import { formatDateUTC, getRemainingDaysBetweenTimestamps } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';

import NoBetsContainer from '@/components/no-bets-container';
import NoWalletConnectedContainer from '@/components/no-wallet-connected-container';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      bets {
        id
        won
        claimed
        finalized
        payout
        timestamp
        targetTimestamp
      }
    }
  }
`;

type Data = {
  user: User;
};

const getBetStatus = (bet: Bet): 'active' | 'won' | 'lost' | 'unredeemed' => {
  if (!bet.finalized) return 'active';
  if (bet.won && !bet.claimed) return 'unredeemed';
  if (bet.won) return 'won';
  return 'lost';
};

const getStatusIcon = (bet: Bet) => {
  const status = getBetStatus(bet);
  switch (status) {
    case 'active':
      return <Clock className="w-4 h-4 text-vibrant-purple" />;
    case 'won':
      return <CheckCircle className="w-4 h-4 text-bright-green" />;
    case 'lost':
      return <XCircle className="w-4 h-4 text-medium-gray" />;
    case 'unredeemed':
      return <CheckCircle className="w-4 h-4 text-bright-green" />;
  }
};

const getStatusText = (bet: Bet) => {
  const status = getBetStatus(bet);
  switch (status) {
    case 'active':
      return 'Active';
    case 'won':
    case 'unredeemed':
      return 'Won';
    case 'lost':
      return 'Lost';
  }
};
const getCardBackground = (bet: Bet) => {
  const status = getBetStatus(bet);
  switch (status) {
    case 'won':
    case 'unredeemed':
      return 'bg-bright-green/10 border-bright-green/20';
    case 'lost':
      return 'bg-magenta/10 border-magenta/20';
    default:
      return 'bg-dark-slate border-border';
  }
};

export default function MyBetsPage() {
  const { isConnected } = useWallet(HashpackConnector);
  const [activeCategory, setActiveCategory] = useState('all');
  const { data, error, loading } = useQuery<Data>(GET_USER, {
    variables: { id: '0x40ade76a75066c6f6ef4dd18aa6218592dea0799' },
  });

  const user = data?.user;
  const bets = user?.bets ?? [];

  const wonBets = bets.filter((bet) => bet.won);
  const lostBets = bets.filter((bet) => !bet.won && bet.finalized);
  const unredeemedBets = bets.filter((bet) => !bet.claimed && bet.finalized);
  const unredeemedAmount = unredeemedBets.reduce((sum, bet) => sum + bet.payout || 0, 0);

  const categories = [
    { id: 'all', label: 'All Bets', count: bets.length },
    {
      id: 'active',
      label: 'Active',
      count: bets.filter((bet) => !bet.finalized).length,
    },
    {
      id: 'unredeemed',
      label: 'Unredeemed',
      count: unredeemedBets.length,
    },
    {
      id: 'complete',
      label: 'Complete',
      count: bets.filter((bet) => bet.finalized).length,
    },
  ];

  const filteredBets = bets.filter((bet) => {
    const status = getBetStatus(bet);
    return activeCategory === 'all' || status === activeCategory;
  });

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <NoWalletConnectedContainer />
        ) : (
          <>
            {!bets.length && <NoBetsContainer />}

            {bets.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Bet Categories */}
                <div className="flex space-x-2">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category.id
                          ? 'bg-vibrant-purple text-white'
                          : 'bg-dark-slate text-light-gray hover:bg-dark-slate/80'
                      }`}
                    >
                      {category.label} {category.count}
                    </button>
                  ))}
                </div>

                {/* Bet Summary */}
                <div className="flex space-x-4">
                  <div className="px-4 py-2 bg-bright-green rounded-full text-sm font-medium text-white">
                    Won {wonBets.length}
                  </div>
                  <div className="px-4 py-2 bg-magenta rounded-full text-sm font-medium text-white">
                    Lost {lostBets.length}
                  </div>
                </div>

                {/* Unredeemed Winnings */}
                {unredeemedAmount > 0 && (
                  <div className="bg-dark-slate border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-bright-green rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">H</span>
                      </div>
                      <span className="text-light-gray font-medium">
                        You have unredeemed {unredeemedAmount} HBAR
                      </span>
                    </div>
                    <Button className="bg-bright-green hover:bg-bright-green/90 text-white">
                      Redeem all
                    </Button>
                  </div>
                )}

                {/* Bet Cards */}
                <div className="space-y-4">
                  {filteredBets.map((bet) => {
                    const status = getBetStatus(bet);
                    const remainingDays = getRemainingDaysBetweenTimestamps(
                      bet.timestamp,
                      bet.targetTimestamp
                    );

                    return (
                      <Card key={bet.id} className={`${getCardBackground(bet)}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-magenta rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">H</span>
                                </div>
                                <div>
                                  <div className="text-light-gray font-medium">
                                    {formatDateUTC(bet.timestamp)}
                                  </div>
                                  <div className="text-medium-gray text-sm">
                                    {bet.priceMin} - {bet.priceMax}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="text-light-gray text-sm">Bet: {bet.stake} HBAR</div>
                                {bet.payout && (
                                  <div className="text-light-gray text-sm">
                                    {status === 'won' || status === 'unredeemed'
                                      ? `You won: ${bet.payout} HBAR`
                                      : `Can win: ${bet.payout} HBAR`}
                                  </div>
                                )}
                                {status === 'active' && (
                                  <div className="text-medium-gray text-sm">
                                    Last bet: 25 Jul, 17:57 UTC
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(bet)}
                                <span className="text-light-gray text-sm font-medium">
                                  {status === 'active' && remainingDays
                                    ? `${remainingDays} days remaining`
                                    : getStatusText(bet)}
                                </span>
                              </div>

                              {status === 'won' && bet.claimed && (
                                <div className="flex items-center space-x-1 text-bright-green text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Redeemed</span>
                                </div>
                              )}

                              {status === 'unredeemed' && (
                                <Button
                                  size="sm"
                                  className="bg-bright-green hover:bg-bright-green/90 text-white"
                                >
                                  Redeem
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
