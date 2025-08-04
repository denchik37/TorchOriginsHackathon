'use client';

import React from 'react';
import { X, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BetPlacedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewExplorer: () => void;
}

export function BetPlacedModal({ isOpen, onClose, onViewExplorer }: BetPlacedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-slate rounded-lg p-6 w-96 max-w-[90vw] relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-2">Bet placed</h3>

        {/* Description */}
        <div className="text-center text-gray-300 mb-6 space-y-1">
          <p>The transaction has been completed.</p>
          <p>You can close this window now.</p>
        </div>

        {/* View in Explorer Button */}
        <Button
          onClick={onViewExplorer}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View in explorer
        </Button>
      </div>
    </div>
  );
}
