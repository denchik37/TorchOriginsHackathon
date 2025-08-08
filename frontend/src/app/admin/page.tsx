'use client';

import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ClerkProvider, SignInButton, SignOutButton, useUser } from '@clerk/nextjs';

import type { Bet } from '@/lib/types';

import { formatDateUTC, formatTinybarsToHbar } from '@/lib/utils';
import { fetchHbarPriceAtTimestamp, type CoinGeckoResponse } from '@/lib/coingecko';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const GET_BETS = gql`
  query {
    bets(orderBy: timestamp, orderDirection: desc) {
      id
      stake
      priceMin
      priceMax
      timestamp
      targetTimestamp
    }
  }
`;

export default function AdminPageWrapper() {
  return (
    <ClerkProvider>
      <AdminPage />
    </ClerkProvider>
  );
}

function AdminPage() {
  const { data, loading } = useQuery(GET_BETS);
  const { user, isLoaded, isSignedIn } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const [resolutionPrices, setResolutionPrices] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAdmin || loading) return;

    const fetchPrices = async () => {
      try {
        const timestamps = data.bets.map((bet: Bet) => bet.timestamp);
        const start = Math.min(...timestamps);
        const end = Math.max(...timestamps);

        const { usd: prices } = await fetchHbarPriceAtTimestamp(start, end);
        setResolutionPrices(prices);
      } catch (err) {
        console.error('Error fetching prices:', err);
      }
    };

    fetchPrices();
  }, [isLoaded, loading, isSignedIn, isAdmin]);

  const findClosestPrice = (timestamp: number): number | null => {
    if (!resolutionPrices.length) return null;

    const targetMs = timestamp * 1000;
    let closest = resolutionPrices[0];
    let minDiff = Math.abs(targetMs - closest[0]);

    for (let i = 1; i < resolutionPrices.length; i++) {
      const [timestamp, price] = resolutionPrices[i];
      const diff = Math.abs(timestamp - targetMs);
      if (diff < minDiff) {
        closest = [timestamp, price];
        minDiff = diff;
      }
    }

    return closest?.[1] ?? null;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex flex-col items-center justify-center my-12 w-full space-y-2 ">
          <h1 className="text-2xl font-semibold text-text-high-em">Loading...</h1>
          <p className="text-text-low-em">Please wait while we check your access permissions.</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex flex-col items-center justify-center my-12 w-full space-y-2 ">
          <h1 className="text-2xl font-semibold text-text-high-em">
            You need to sign in to access the admin dashboard.
          </h1>
          <p className="text-text-low-em">
            Please sign in with an account that has admin privileges.
          </p>

          <Button variant="torch" className="w-48" asChild>
            <SignInButton />
          </Button>
        </div>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-black">
        <Header />

        <div className="flex flex-col items-center justify-center my-12 w-full space-y-2 ">
          <h1 className="text-2xl font-semibold text-text-high-em">Access Denied</h1>
          <p className="text-text-low-em">
            You do not have permission to access the admin dashboard.
          </p>
          <Button variant="torch" className="w-48" asChild>
            <SignOutButton />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
              <table className="min-w-[800px] w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-medium-gray">Min price</th>
                    <th className="text-left py-3 px-4 font-medium text-medium-gray">Max price</th>
                    <th className="text-left py-3 px-4 font-medium text-medium-gray">Date, UTC</th>
                    <th className="text-left py-3 px-4 font-medium text-medium-gray">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-medium-gray">
                      Resolution price
                    </th>
                  </tr>
                </thead>
                <tbody className="max-h-[600px] overflow-y-auto">
                  {data?.bets?.map((bet: Bet) => {
                    const resolution = findClosestPrice(bet.targetTimestamp);
                    const isInRange =
                      resolution !== null &&
                      resolution >= bet.priceMin &&
                      resolution <= bet.priceMax;
                    const key = `${bet.priceMin}-${bet.priceMax}-${bet.targetTimestamp}`;

                    return (
                      <tr key={key} className="border-b border-white/5 hover:bg-dark-slate/50">
                        <td className="py-3 px-4">{formatTinybarsToHbar(bet.priceMin)}</td>
                        <td className="py-3 px-4 text-sm text-light-gray">
                          {formatTinybarsToHbar(bet.priceMax)}
                        </td>
                        <td className="py-3 px-4 text-sm text-light-gray">
                          {formatDateUTC(bet.timestamp)}
                        </td>
                        <td className="py-3 px-4 text-sm text-medium-gray">
                          {isInRange ? (
                            <span className="text-green-500">Win</span>
                          ) : (
                            <span className="text-red-500">Loss</span>
                          )}
                        </td>

                        <td>
                          <input
                            type="number"
                            className="w-24 px-2 py-1 bg-transparent border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Price"
                            defaultValue={resolution?.toFixed(3)}
                            step="0.01"
                            min="0"
                            max="100"
                            id={`bet-weight-${key}`}
                          />
                        </td>

                        {/* <td className="text-center">
                          <Button className="w-full" variant="outline">
                            Fetch price
                          </Button>
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="torch" className="w-48">
                Submit prices
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
