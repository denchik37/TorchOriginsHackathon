/**
 * Utility functions for CoinGecko API integration
 */

export interface CoinGeckoHbarData {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
  last_updated_at: number;
}

export interface CoinGeckoResponse {
  'hedera-hashgraph': CoinGeckoHbarData;
}

/**
 * Fetch HBAR price data from CoinGecko API
 */
export async function fetchHbarPrice(): Promise<CoinGeckoResponse> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true'
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Test function to verify API integration
 */
export async function testCoinGeckoAPI(): Promise<void> {
  try {
    console.log('Testing CoinGecko API...');
    const data = await fetchHbarPrice();
    console.log('HBAR Price Data:', data);
    console.log('Current HBAR Price:', data['hedera-hashgraph'].usd);
    console.log('24h Change:', data['hedera-hashgraph'].usd_24h_change);
    console.log('Market Cap:', data['hedera-hashgraph'].usd_market_cap);
  } catch (error) {
    console.error('CoinGecko API test failed:', error);
  }
} 