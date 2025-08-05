import { useState, useEffect } from 'react';
import { fetchHbarPrice, type CoinGeckoResponse } from '@/lib/coingecko';

interface HbarPriceData {
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
}

export function useHbarPrice() {
  const [priceData, setPriceData] = useState<HbarPriceData>({
    price: 0,
    priceChange24h: 0,
    priceChangePercentage24h: 0,
    lastUpdated: new Date(),
    isLoading: true,
    error: null,
  });

  const fetchHbarPriceData = async () => {
    try {
      setPriceData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data: CoinGeckoResponse = await fetchHbarPrice();
      
      if (data['hedera-hashgraph']) {
        const hbarData = data['hedera-hashgraph'];
        setPriceData({
          price: hbarData.usd,
          priceChange24h: hbarData.usd_24h_change || 0,
          priceChangePercentage24h: hbarData.usd_24h_change || 0,
          lastUpdated: new Date(),
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('HBAR price data not found');
      }
    } catch (error) {
      setPriceData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch HBAR price',
      }));
    }
  };

  useEffect(() => {
    // Fetch initial price
    fetchHbarPriceData();

    // Set up interval to fetch price every 30 seconds
    const interval = setInterval(fetchHbarPriceData, 30000);

    return () => clearInterval(interval);
  }, []);

  return priceData;
} 