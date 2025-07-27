"use client"

import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatAddress } from '@/lib/utils'

interface BetHistoryProps {
  className?: string
}

// Mock data for bet history
const mockBetHistory = [
  {
    id: 1,
    user: '0xe7a...72d',
    amount: 1.67,
    range: '0.27-0.28',
    date: 'Aug 1, 13:00',
    avatar: '🟣'
  },
  {
    id: 2,
    user: '0x908...ef0',
    amount: 10.12,
    range: '0.1-0.2',
    date: 'Aug 8, 00:00',
    avatar: '🟡'
  },
  {
    id: 3,
    user: '0x458...ef1',
    amount: 431.54,
    range: '0.37-0.5',
    date: 'Aug 1, 23:59',
    avatar: '🔴'
  },
  {
    id: 4,
    user: '0x271...415',
    amount: 0.78,
    range: '0.24-0.24',
    date: 'Aug 3, 21:15',
    avatar: '🌈'
  },
  {
    id: 5,
    user: '0x203...C6E',
    amount: 1.36,
    range: '1-2',
    date: 'Dec 31, 20:02',
    avatar: '🟢'
  }
]

export function BetHistory({ className }: BetHistoryProps) {
  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Range</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date, UTC</th>
            </tr>
          </thead>
          <tbody>
            {mockBetHistory.map((bet) => (
              <tr key={bet.id} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {bet.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-mono">{bet.user}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{bet.amount}</td>
                <td className="py-3 px-4 text-sm">{bet.range}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{bet.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm">
          &lt; Prev
        </Button>
        <span className="text-sm text-muted-foreground">Page 1 of 5</span>
        <Button variant="outline" size="sm">
          Next &gt;
        </Button>
      </div>
    </div>
  )
} 