'use client';

import { gql, useQuery } from '@apollo/client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cn, formatTinybarsToHbar } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { KDEChartModal } from './kde-chart-modal';

interface KDEChartProps {
  className?: string;
  currentPrice: number;
  enableZoom?: boolean;
}

const GET_BETS = gql`
  query {
    bets(first: 100, orderBy: timestamp, orderDirection: desc) {
      targetTimestamp
      weight
      priceMin
      priceMax
      payout
    }
  }
`;

export function KDEChart({ className, currentPrice, enableZoom = false }: KDEChartProps) {
  const { data } = useQuery(GET_BETS);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const d3Container = useRef({ initialized: false }).current;

  useEffect(() => {
    if (!chartContainerRef.current || !data?.bets || data?.bets?.length === 0) {
      return;
    }

    const processData = (rawData: any[]) => {
      const now = new Date();
      return rawData
        .map((d) => {
          const originalWeight = parseInt(d.weight);
          const minPrice = formatTinybarsToHbar(d.priceMin);
          const maxPrice = formatTinybarsToHbar(d.priceMax);
          
          return {
            time: new Date(parseInt(d.targetTimestamp) * 1000),
            price: (Number(minPrice) + Number(maxPrice)) / 2,
            stake: Math.sqrt(originalWeight), // Use square root to scale weights for better visualization
            originalWeight: originalWeight // Keep original weight for tooltips
          };
        })
        .filter((d) => d.time > now); // Filter for future dates only
    };

    const dataset = processData(data.bets);
    if (dataset.length === 0) return; // Don't render if no future data

    const container = chartContainerRef.current;
    // Reduced margins for compact display
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(container).selectAll('*').remove();

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = svg.append('defs');

    const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
    defs.append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    const filterId = `glow-${Math.random().toString(36).substr(2, 9)}`;
    const filter = defs.append('filter').attr('id', filterId);
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const chartArea = svg.append('g').attr('clip-path', `url(#${clipId})`);

    // Add more padding to the domain to "zoom out"
    const timeExtent = d3.extent(dataset, (d) => d.time);
    const priceExtent = d3.extent(dataset, (d) => d.price);
    const stakeExtent = d3.extent(dataset, (d) => d.stake);

    // Check if extents are valid
    if (!timeExtent[0] || !timeExtent[1] || !priceExtent[0] || !priceExtent[1] || !stakeExtent[0] || !stakeExtent[1]) {
      return; // Exit if we don't have valid data ranges
    }

    const [minTime, maxTime] = timeExtent;
    const timePadding = (maxTime.getTime() - minTime.getTime()) * 0.2; // 20% padding

    const [minPrice, maxPrice] = priceExtent;
    const pricePadding = (maxPrice - minPrice) * 0.2; // 20% padding

    const x = d3
      .scaleTime()
      .domain([new Date(minTime.getTime() - timePadding), new Date(maxTime.getTime() + timePadding)])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([minPrice - pricePadding, maxPrice + pricePadding])
      .range([height, 0]);

    const opacityScale = d3.scaleLinear()
      .domain([stakeExtent[0], stakeExtent[1]])
      .range([0.4, 1.0]);

    // Zoom functionality can be added back later if needed
    // For now, we'll keep the chart simple and functional

    // Simplified grid with dark theme colors
    svg
      .append('g')
      .attr('class', 'axis grid-x')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#374151')
      .attr('stroke-opacity', 0.3);
    svg
      .append('g')
      .attr('class', 'axis grid-y')
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#374151')
      .attr('stroke-opacity', 0.3);

    // Axes with dark theme styling
    svg
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickFormat((d: any) => d3.timeFormat('%b %d')(d))
          .tickSizeOuter(0)
      )
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px');
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .call(
        d3
          .axisLeft(y)
          .ticks(height / 40)
          .tickFormat((d: any) => d3.format('$.3f')(d))
      )
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px');

    // Smaller axis labels
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .text('Date')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px');
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .text('Price (USD)')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px');

    // Use the density calculation logic from chart.js
    const densityData = d3
      .contourDensity()
      .x((d: any) => x(d.time))
      .y((d: any) => y(d.price))
      .size([width, height])
      .bandwidth(35)
      .weight((d: any) => d.stake)(dataset as any);

    // Use smoky blue interpolator from chart.js
    const maxDensityValue = d3.max(densityData, (d) => d.value);
    if (!maxDensityValue) return;
    
    const smokyBlueInterpolator = d3.interpolateRgb('rgba(71, 144, 202, 0.1)', '#4790ca');
    const densityColor = d3.scaleSequential(smokyBlueInterpolator)
      .domain([0, maxDensityValue]);

    // Add density visualization with filter effect
    chartArea
      .append('g')
      .attr('filter', `url(#${filterId})`)
      .selectAll('path')
      .data(densityData)
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('fill', (d) => densityColor(d.value))
      .attr('fill-opacity', 0.9);

    // Add confidence contours
    const confidenceThreshold = maxDensityValue * 0.25;
    const confidenceContours = densityData.filter((d) => d.value > confidenceThreshold);
    chartArea
      .append('g')
      .selectAll('path.confidence')
      .data(confidenceContours)
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('fill', 'rgb(16 185 129 / 0.4)')
      .attr('stroke', 'rgb(5 150 105)')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 1);

    // Enhanced tooltip for compact display
    const tooltip = d3
      .select(container)
      .append('div')
      .attr(
        'class',
        'absolute z-10 p-2 text-xs text-white bg-neutral-800 rounded border border-neutral-700 pointer-events-none transition-opacity duration-200'
      )
      .style('opacity', 0);

    // Make red markers more visible with enhanced styling from chart.js
    chartArea
      .append('g')
      .selectAll('line')
      .data(dataset)
      .enter()
      .append('line')
      .attr('x1', (d) => x(d.time))
      .attr('y1', (d) => y(d.price - 0.0004))
      .attr('x2', (d) => x(d.time))
      .attr('y2', (d) => y(d.price + 0.0004))
      .attr('stroke', '#f43f5e')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', (d) => opacityScale(d.stake))
      .attr('stroke-linecap', 'round')
      .on('mouseover', (event, d) => {
        const timeFormat = d3.timeFormat('%b %d, %Y');
        tooltip
          .style('opacity', 1)
          .html(
            `Price: $${d.price.toFixed(4)}<br>Date: ${timeFormat(d.time)}<br>Weight: ${d.originalWeight.toFixed(0)}`
          )
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 15}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    // Simplified crosshair
    const focus = svg.append('g').attr('class', 'focus').style('display', 'none');
    focus
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3');
    focus
      .append('line')
      .attr('class', 'crosshair')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3');

    // Compact metrics panel
    const metricsPanel = d3
      .select(container)
      .append('div')
      .attr(
        'class',
        'absolute top-2 right-2 p-2 bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 rounded text-xs text-neutral-300 pointer-events-none transition-opacity duration-300'
      )
      .style('opacity', 0);

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => {
        focus.style('display', null);
        metricsPanel.style('opacity', 1);
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        metricsPanel.style('opacity', 0);
      })
      .on('mousemove', mousemove);

    function mousemove(event: any) {
      const [pointerX, pointerY] = d3.pointer(event, event.currentTarget);
      focus.selectAll('.crosshair').style('display', 'block');
      focus.select("line.crosshair[y1='0']").attr('x1', pointerX).attr('x2', pointerX);
      focus.select("line.crosshair[x1='0']").attr('y1', pointerY).attr('y2', pointerY);

      const timeVal = x.invert(pointerX);
      const priceVal = y.invert(pointerY);

      const radius = 40;
      const nearbyPoints = dataset.filter((d) => {
        const dx = x(d.time) - pointerX;
        const dy = y(d.price) - pointerY;
        return dx * dx + dy * dy < radius * radius;
      });

      const timeFormat = d3.timeFormat('%b %d, %Y');
      let metricsHtml = `<div class="font-semibold text-neutral-200 mb-2">Live Metrics</div>`;
      metricsHtml += `<div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
        <span class="font-medium text-neutral-400">Date:</span> <span class="text-right">${timeFormat(timeVal)}</span>
        <span class="font-medium text-neutral-400">Price:</span> <span class="text-right">$${priceVal.toFixed(4)}</span>
      </div>`;

      if (nearbyPoints.length > 0) {
        const avgPrice = d3.mean(nearbyPoints, (d) => d.price);
        const avgWeight = d3.mean(nearbyPoints, (d) => d.originalWeight);

        metricsHtml += `<div class="border-t border-neutral-600 my-2"></div>
         <div class="font-semibold text-neutral-200 mb-2">Nearby Bets (${nearbyPoints.length})</div>
         <div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
            <span class="font-medium text-neutral-400">Avg Price:</span> <span class="text-right">$${avgPrice?.toFixed(4) || '0.0000'}</span>
            <span class="font-medium text-neutral-400">Avg Weight:</span> <span class="text-right">${avgWeight?.toFixed(0) || '0'}</span>
         </div>`;
      }
      metricsPanel.html(metricsHtml);
    }
  }, [data]); // Effect dependency on data

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-neutral-400">Price prediction distribution by date</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs h-7 px-2 text-neutral-400 hover:text-neutral-200 border-neutral-600 hover:border-neutral-500"
        >
          <Maximize2 className="h-3 w-3 mr-1" />
          Expand
        </Button>
      </div>
      <div ref={chartContainerRef} className="w-full h-full relative" />

      <KDEChartModal
        currentPrice={currentPrice}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
