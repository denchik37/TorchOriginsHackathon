export interface User {
  id: string;
  bets: Bet[];
  totalBets: number;
  totalStaked: number;
  totalPayout: number;
}

export interface Bet {
  id: string;
  user: User;
  stake: string;
  priceMin: string;
  priceMax: string;
  timestamp: number;
}
