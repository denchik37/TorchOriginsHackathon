'use client';

import { gql, useQuery } from '@apollo/client';

import type { Bet } from '@/lib/types';
import { formatAddress, formatDateUTC } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

const GET_BETS = gql`
  query {
    bets(first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        id
      }
      stake
      priceMin
      priceMax
      timestamp
    }
  }
`;

interface BetHistoryProps {
  className?: string;
}

export function BetHistory({ className }: BetHistoryProps) {
  const { data, loading, error } = useQuery(GET_BETS);

  if (loading) return <div className="text-light-gray">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-medium-gray">User</th>
              <th className="text-left py-3 px-4 font-medium text-medium-gray">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-medium-gray">Range</th>
              <th className="text-left py-3 px-4 font-medium text-medium-gray">Date, UTC</th>
            </tr>
          </thead>
          <tbody>
            {data.bets.map((bet: Bet) => (
              <tr key={bet.id} className="border-b border-white/5 hover:bg-dark-slate/50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <Tooltip content={bet.user.id}>
                      <span className="text-sm font-mono text-light-gray">
                        {formatAddress(bet.user.id, 2)}
                      </span>
                    </Tooltip>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-light-gray">{bet.stake}</td>
                <td className="py-3 px-4 text-sm text-light-gray">
                  {bet.priceMin} - {bet.priceMax}
                </td>
                <td className="py-3 px-4 text-sm text-medium-gray">
                  {formatDateUTC(bet.timestamp)}
                </td>
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
    </div>
  );
}
