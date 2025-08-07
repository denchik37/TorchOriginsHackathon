'use client';

import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KDEChart } from './kde-chart';

interface KDEChartModalProps {
  currentPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

export function KDEChartModal({ currentPrice, isOpen, onClose }: KDEChartModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl w-[95vw] h-[90vh] max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800/50">
          <h2 className="text-lg font-semibold text-neutral-200">
            KDE Chart - Detailed View
          </h2>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="text-neutral-400 hover:text-neutral-200 border-neutral-600 hover:border-neutral-500 h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-neutral-400 px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 5}
                className="text-neutral-400 hover:text-neutral-200 border-neutral-600 hover:border-neutral-500 h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="text-neutral-400 hover:text-neutral-200 border-neutral-600 hover:border-neutral-500 h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Chart Container with Scroll */}
        <div className="p-4 h-full overflow-auto">
          <div 
            className="w-full h-full"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              minHeight: `${100 / zoomLevel}%`,
              minWidth: `${100 / zoomLevel}%`
            }}
          >
            <KDEChart 
              currentPrice={currentPrice} 
              className="w-full h-full"
              enableZoom={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
