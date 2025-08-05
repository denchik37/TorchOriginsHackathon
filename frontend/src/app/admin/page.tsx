'use client';

import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useUser,
} from '@clerk/nextjs';
import Image from 'next/image';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const mockBetHistory = [
  {
    id: 1,
    user: '0xAb5801a7D398351b8bE11C439e05C5b3259aec9B',
    amount: 1.67,
    range: '0.27-0.28',
    date: 'Aug 1, 13:00',
    avatar: '🟣',
  },
  {
    id: 2,
    user: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    amount: 10.12,
    range: '0.1-0.2',
    date: 'Aug 8, 00:00',
    avatar: '🟡',
  },
  {
    id: 3,
    user: '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF',
    amount: 431.54,
    range: '0.37-0.5',
    date: 'Aug 1, 23:59',
    avatar: '🔴',
  },
  {
    id: 4,
    user: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
    amount: 0.78,
    range: '0.24-0.24',
    date: 'Aug 3, 21:15',
    avatar: '🌈',
  },
  {
    id: 5,
    user: '0x1234567890abcdef1234567890abcdef12345678',
    amount: 1.36,
    range: '1-2',
    date: 'Dec 31, 20:02',
    avatar: '🟢',
  },
];

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
          <div className="max-w-lg mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm bg-dark-slate px-2 py-1 rounded text-light-gray">
                    Crypto
                  </span>
                  <span className="text-sm text-medium-gray">
                    <span className="text-white">20</span> active bets
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Image src="/hedera.svg" alt="Logo" width={65} height={65} />
                  <div>
                    <h2 className="text-xl font-bold text-light-gray">
                      Predict HBAR token price in USD
                    </h2>

                    <Button asChild size="sm" variant="link" className="px-0">
                      <a href="https://torch.bet/" target="_blank" rel="noopener noreferrer">
                        Current price:
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                      </tr>
                    </thead>
                    <tbody>
                      {mockBetHistory.map((bet) => (
                        <tr key={bet.id} className="border-b border-white/5 hover:bg-dark-slate/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">123</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-light-gray">{bet.amount}</td>
                          <td className="py-3 px-4 text-sm text-light-gray">{bet.range}</td>
                          <td className="py-3 px-4 text-sm text-medium-gray">{bet.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-vibrant-purple text-vibrant-purple hover:bg-vibrant-purple hover:text-white"
                  >
                    &lt; Prev
                  </Button>

                  <span className="text-sm text-medium-gray">Page 1 of 5</span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-vibrant-purple text-vibrant-purple hover:bg-vibrant-purple hover:text-white"
                  >
                    Next &gt;
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
