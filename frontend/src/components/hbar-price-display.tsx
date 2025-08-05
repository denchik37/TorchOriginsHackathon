'use client';

import React from 'react';
import Image from 'next/image';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useHbarPrice } from '@/hooks/useHbarPrice';

interface HbarPriceDisplayProps {
  showChange?: boolean;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HbarPriceDisplay({ 
  showChange = true, 
  showIcon = true, 
  className = '',
  size = 'md' 
}: HbarPriceDisplayProps) {
  const { price, priceChangePercentage24h, isLoading, error } = useHbarPrice();

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const imageSizes = {
    sm: { width: 12, height: 12 },
    md: { width: 16, height: 16 },
    lg: { width: 20, height: 20 }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <RefreshCw className={`${iconSizes[size]} animate-spin text-medium-gray`} />
        <span className={`${sizeClasses[size]} text-medium-gray`}>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <span className={`${sizeClasses[size]} text-red-500`}>Price unavailable</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {showIcon && (
        <Image 
          src="/hedera.svg" 
          alt="Hedera" 
          width={imageSizes[size].width} 
          height={imageSizes[size].height} 
          className="flex-shrink-0"
        />
      )}
      <span className={`${sizeClasses[size]} text-light-gray`}>
        ${price.toFixed(4)}
      </span>
      {showChange && priceChangePercentage24h !== 0 && (
        <div className={`flex items-center space-x-1 ${priceChangePercentage24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {priceChangePercentage24h > 0 ? (
            <TrendingUp className={iconSizes[size]} />
          ) : (
            <TrendingDown className={iconSizes[size]} />
          )}
          <span className={`${sizeClasses[size]}`}>
            {Math.abs(priceChangePercentage24h).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
} 