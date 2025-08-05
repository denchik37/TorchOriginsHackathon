import { useState, useEffect, useRef } from 'react';
import { fetchHbarPrice, type CoinGeckoResponse } from '@/lib/coingecko';

interface HbarPriceData {
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
  isStale: boolean; // Indicates if we're showing cached data
}

export function useHbarPrice() {
  const [priceData, setPriceData] = useState<HbarPriceData>({
    price: 0,
    priceChange24h: 0,
    priceChangePercentage24h: 0,
    lastUpdated: new Date(),
    isLoading: true,
    error: null,
    isStale: false,
  });

  // Keep track of the last successful data
  const lastSuccessfulData = useRef<Omit<HbarPriceData, 'isLoading' | 'error' | 'isStale'>>({
    price: 0,
    priceChange24h: 0,
    priceChangePercentage24h: 0,
    lastUpdated: new Date(),
  });

  const fetchHbarPriceData = async (isRetry = false) => {
    try {
      // Only show loading state on initial load, not on retries
      if (!isRetry) {
        setPriceData(prev => ({ ...prev, isLoading: true, error: null }));
      }
      
      const data: CoinGeckoResponse = await fetchHbarPrice();
      
      if (data['hedera-hashgraph']) {
        const hbarData = data['hedera-hashgraph'];
        const newData = {
          price: hbarData.usd,
          priceChange24h: hbarData.usd_24h_change || 0,
          priceChangePercentage24h: hbarData.usd_24h_change || 0,
          lastUpdated: new Date(),
          isLoading: false,
          error: null,
          isStale: false,
        };

        // Update last successful data
        lastSuccessfulData.current = {
          price: hbarData.usd,
          priceChange24h: hbarData.usd_24h_change || 0,
          priceChangePercentage24h: hbarData.usd_24h_change || 0,
          lastUpdated: new Date(),
        };

        setPriceData(newData);
      } else {
        throw new Error('HBAR price data not found');
      }
    } catch (error) {
      // If we have previous data, show it as stale instead of error
      if (lastSuccessfulData.current.price > 0) {
        setPriceData(prev => ({
          ...lastSuccessfulData.current,
          isLoading: false,
          error: null,
          isStale: true, // Mark as stale to indicate it's cached data
        }));
      } else {
        // Only show error if we have no previous data
        setPriceData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch HBAR price',
          isStale: false,
        }));
      }
    }
  };

  // Retry function for manual retry
  const retryFetch = () => {
    fetchHbarPriceData(true);
  };

  useEffect(() => {
    // Fetch initial price
    fetchHbarPriceData();

    // Set up interval to fetch price every 30 seconds
    const interval = setInterval(() => fetchHbarPriceData(true), 30000);

    return () => clearInterval(interval);
  }, []);

  return { ...priceData, retryFetch };
} 