"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { formatAddress } from "@/lib/utils";

interface BetHistoryProps {
	className?: string;
}

// Mock data for bet history
const mockBetHistory = [
	{
		id: 1,
		user: "0xAb5801a7D398351b8bE11C439e05C5b3259aec9B",
		amount: 1.67,
		range: "0.27-0.28",
		date: "Aug 1, 13:00",
		avatar: "🟣",
	},
	{
		id: 2,
		user: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
		amount: 10.12,
		range: "0.1-0.2",
		date: "Aug 8, 00:00",
		avatar: "🟡",
	},
	{
		id: 3,
		user: "0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
		amount: 431.54,
		range: "0.37-0.5",
		date: "Aug 1, 23:59",
		avatar: "🔴",
	},
	{
		id: 4,
		user: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
		amount: 0.78,
		range: "0.24-0.24",
		date: "Aug 3, 21:15",
		avatar: "🌈",
	},
	{
		id: 5,
		user: "0x1234567890abcdef1234567890abcdef12345678",
		amount: 1.36,
		range: "1-2",
		date: "Dec 31, 20:02",
		avatar: "🟢",
	},
];

export function BetHistory({ className }: BetHistoryProps) {
	return (
		<div className={className}>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border">
							<th className="text-left py-3 px-4 font-medium text-medium-gray">
								User
							</th>
							<th className="text-left py-3 px-4 font-medium text-medium-gray">
								Amount
							</th>
							<th className="text-left py-3 px-4 font-medium text-medium-gray">
								Range
							</th>
							<th className="text-left py-3 px-4 font-medium text-medium-gray">
								Date, UTC
							</th>
						</tr>
					</thead>
					<tbody>
						{mockBetHistory.map((bet) => (
							<tr
								key={bet.id}
								className="border-b border-white/5 hover:bg-dark-slate/50"
							>
								<td className="py-3 px-4">
									<div className="flex items-center space-x-3">
										<Avatar className="w-8 h-8">
											<AvatarFallback className="text-xs">
												{bet.avatar}
											</AvatarFallback>
										</Avatar>

										<Tooltip content={bet.user}>
											<span className="text-sm font-mono text-light-gray">
												{formatAddress(bet.user)}
											</span>
										</Tooltip>
									</div>
								</td>
								<td className="py-3 px-4 text-sm text-light-gray">
									{bet.amount}
								</td>
								<td className="py-3 px-4 text-sm text-light-gray">
									{bet.range}
								</td>
								<td className="py-3 px-4 text-sm text-medium-gray">
									{bet.date}
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
