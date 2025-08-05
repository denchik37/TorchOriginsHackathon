'use client';

import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useUser,
} from '@clerk/nextjs';

import { useId } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateUTC } from '@/lib/utils';

import MockData from './mock_bet_data.json';

interface Bet {
  targetTimestamp: number;
  priceMin: number;
  priceMax: number;
  betWeight: number;
}

export default function AdminPageWrapper() {
  return (
    <ClerkProvider>
      <AdminPage />
    </ClerkProvider>
  );
}

function AdminPage() {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

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

  if (!isAdmin) {
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
      <SignedIn>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-medium-gray">
                        Min price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-medium-gray">
                        Max price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-medium-gray">
                        Date, UTC
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-medium-gray">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-medium-gray">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MockData.map((bet: Bet, index: number) => {
                      const key = `${bet.priceMin}-${bet.priceMax}-${bet.targetTimestamp}`;
                      return (
                        <tr key={key} className="border-b border-white/5 hover:bg-dark-slate/50">
                          <td className="py-3 px-4">{bet.priceMin.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-light-gray">
                            {bet.priceMax.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-light-gray">
                            {formatDateUTC(bet.targetTimestamp)}
                          </td>
                          <td className="py-3 px-4 text-sm text-medium-gray">
                            {index % 2 === 0 ? (
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
                              defaultValue={bet.betWeight.toFixed(2)}
                              step="0.01"
                              min="0"
                              max="100"
                              id={`bet-weight-${useId()}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </SignedIn>

      <SignedOut>
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
      </SignedOut>
    </div>
  );
}
