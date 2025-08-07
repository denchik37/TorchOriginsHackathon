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
      return rawData
        .map((d) => {
          const minPrice = formatTinybarsToHbar(d.priceMin);
          const maxPrice = formatTinybarsToHbar(d.priceMax);

          return {
            time: new Date(d.targetTimestamp * 1000),
            price: (Number(minPrice) + Number(maxPrice)) / 2,
            stake: d.weight,
          };
        })
        .filter((d) => d.time > new Date()); // Filter for future dates only
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

    const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
    svg
      .append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    const chartArea = svg.append('g').attr('clip-path', `url(#${clipId})`);

    // Add more padding to the domain to "zoom out"
    const timeExtent = d3.extent(dataset, (d) => d.time.getTime());
    const priceExtent = d3.extent(dataset, (d) => d.price);

    // Check if extents are valid
    if (!timeExtent[0] || !timeExtent[1] || !priceExtent[0] || !priceExtent[1]) {
      return; // Exit if we don't have valid data ranges
    }

    const [minTime, maxTime] = timeExtent;
    const timePadding = (maxTime - minTime) * 0.3; // 30% padding for more space

    const [minPrice, maxPrice] = priceExtent;
    const pricePadding = (maxPrice - minPrice) * 0.3; // 30% padding for more space

    const x = d3
      .scaleTime()
      .domain([new Date(minTime - timePadding), new Date(maxTime + timePadding)])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([minPrice - pricePadding, maxPrice + pricePadding])
      .range([height, 0]);

    const stakeExtent = d3.extent(dataset, (d) => d.stake);
    if (!stakeExtent[0] || !stakeExtent[1]) return;
    const opacityScale = d3
      .scaleLinear()
      .domain([stakeExtent[0], stakeExtent[1]])
      .range([0.3, 1.0]);

    // Add zoom behavior if enabled
    if (enableZoom) {
      const zoom = d3
        .zoom()
        .scaleExtent([0.5, 10]) // Allow zoom from 0.5x to 10x
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .extent([
          [0, 0],
          [width, height],
        ])
        .on('zoom', (event) => {
          const { transform } = event;

          // Update scales with zoom transform
          const xZoomed = transform.rescaleX(x);
          const yZoomed = transform.rescaleY(y);

          // Clear and redraw axes to avoid DOM manipulation issues
          svg.selectAll('.axis').remove();

          // Redraw grid lines
          svg
            .append('g')
            .attr('class', 'axis grid-x')
            .attr('transform', `translate(0,${height})`)
            .call(
              d3
                .axisBottom(xZoomed)
                .tickSize(-height)
                .tickFormat(() => '') as any
            )
            .selectAll('line')
            .attr('stroke', '#374151')
            .attr('stroke-opacity', 0.3);

          svg
            .append('g')
            .attr('class', 'axis grid-y')
            .call(
              d3
                .axisLeft(yZoomed)
                .tickSize(-width)
                .tickFormat(() => '') as any
            )
            .selectAll('line')
            .attr('stroke', '#374151')
            .attr('stroke-opacity', 0.3);

          // Redraw main axes
          svg
            .append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(
              d3
                .axisBottom(xZoomed)
                .ticks(width / 80)
                .tickFormat((d: any) => d3.timeFormat('%b %d')(d as Date))
                .tickSizeOuter(0) as any
            )
            .selectAll('text')
            .attr('fill', '#9CA3AF')
            .attr('font-size', '10px');

          svg
            .append('g')
            .attr('class', 'axis y-axis')
            .call(
              d3
                .axisLeft(yZoomed)
                .ticks(height / 40)
                .tickFormat((d: any) => d3.format('$.3f')(d)) as any
            )
            .selectAll('text')
            .attr('fill', '#9CA3AF')
            .attr('font-size', '10px');

          // Update density plot with new scales
          const densityDataZoomed = d3
            .contourDensity()
            .x((d) => xZoomed(new Date(d[0])))
            .y((d) => yZoomed(d[1]))
            .size([width, height])
            .bandwidth(25)
            .weight((d: [number, number]) => {
              const index = densityPoints.findIndex(
                (point) => point[0] === d[0] && point[1] === d[1]
              );
              return index >= 0 ? dataset[index].stake : 1;
            })(densityPoints);

          // Update density visualization
          chartArea.selectAll('path').remove();

          // Re-add density layers with zoomed data
          chartArea
            .append('g')
            .selectAll('path')
            .data(densityDataZoomed)
            .enter()
            .append('path')
            .attr('d', d3.geoPath())
            .attr('fill', (d) => densityColor(d.value))
            .attr('fill-opacity', 0.8)
            .style('filter', 'drop-shadow(0 0 8px rgba(71, 144, 202, 0.6))');

          chartArea
            .append('g')
            .selectAll('path')
            .data(densityDataZoomed)
            .enter()
            .append('path')
            .attr('d', d3.geoPath())
            .attr('fill', (d) => densityColor(d.value))
            .attr('fill-opacity', 0.3)
            .style('filter', 'blur(4px)');

          // Update confidence contours
          const confidenceThreshold = (maxDensityValue || 0) * 0.25;
          const confidenceContours = densityDataZoomed.filter((d) => d.value > confidenceThreshold);
          chartArea
            .append('g')
            .selectAll('path.confidence')
            .data(confidenceContours)
            .enter()
            .append('path')
            .attr('class', 'confidence')
            .attr('d', d3.geoPath())
            .attr('fill', 'rgb(34 197 94 / 0.3)')
            .attr('stroke', 'rgb(34 197 94)')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-width', 0.5);

          // Update red markers
          chartArea.selectAll('line').remove();
          chartArea
            .append('g')
            .selectAll('line')
            .data(dataset)
            .enter()
            .append('line')
            .attr('x1', (d) => xZoomed(d.time))
            .attr('y1', (d) => yZoomed(d.price - 0.0003))
            .attr('x2', (d) => xZoomed(d.time))
            .attr('y2', (d) => yZoomed(d.price + 0.0003))
            .attr('stroke', '#EF4444')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', (d) => Math.max(0.6, opacityScale(d.stake)))
            .style('filter', 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.8))')
            .on('mouseover', (event, d) => {
              const dateStr = d.time.toLocaleDateString();
              const timeStr = d.time.toLocaleTimeString();
              tooltip
                .style('opacity', 1)
                .html(
                  `Price: $${d.price.toFixed(4)}<br>Date: ${dateStr}<br>Time: ${timeStr}<br>Stake: ${d.stake.toFixed(0)}`
                )
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`);
            })
            .on('mouseout', () => tooltip.style('opacity', 0));
        });

      // Apply zoom to the main SVG with proper type casting
      d3.select(container)
        .select('svg')
        .call(zoom as any);
    }

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

    // Convert dataset to the format expected by contourDensity
    const densityPoints = dataset.map((d) => [d.time.getTime(), d.price] as [number, number]);
    const densityData = d3
      .contourDensity()
      .x((d) => x(new Date(d[0])))
      .y((d) => y(d[1]))
      .size([width, height])
      .bandwidth(25)
      .weight((d: [number, number]) => {
        const index = densityPoints.findIndex((point) => point[0] === d[0] && point[1] === d[1]);
        return index >= 0 ? dataset[index].stake : 1;
      })(densityPoints);

    // Use blue color scheme for glowy, smoky effect with #4790ca variants
    const maxDensityValue = d3.max(densityData, (d) => d.value);
    if (!maxDensityValue) return;

    // Create custom color interpolator using #4790ca variants
    const customBlueInterpolator = (t: number) => {
      // Start with a lighter variant of #4790ca and interpolate to the base color
      const lightBlue = d3.color('#8BB8E8')!; // Lighter variant of #4790ca
      const baseBlue = d3.color('#4790ca')!;
      const darkBlue = d3.color('#2A5A8A')!; // Darker variant of #4790ca

      if (t < 0.5) {
        // Interpolate from light to base blue
        return d3.interpolate(lightBlue, baseBlue)(t * 2);
      } else {
        // Interpolate from base to dark blue
        return d3.interpolate(baseBlue, darkBlue)((t - 0.5) * 2);
      }
    };

    const densityColor = d3.scaleSequential(customBlueInterpolator).domain([0, maxDensityValue]);

    // Add glowy, smoky effect with multiple layers
    chartArea
      .append('g')
      .selectAll('path')
      .data(densityData)
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('fill', (d) => densityColor(d.value))
      .attr('fill-opacity', 0.8)
      .style('filter', 'drop-shadow(0 0 8px rgba(71, 144, 202, 0.6))');

    // Add additional smoky layer for depth
    chartArea
      .append('g')
      .selectAll('path')
      .data(densityData)
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('fill', (d) => densityColor(d.value))
      .attr('fill-opacity', 0.3)
      .style('filter', 'blur(4px)');

    const confidenceThreshold = maxDensityValue * 0.25;
    const confidenceContours = densityData.filter((d) => d.value > confidenceThreshold);
    chartArea
      .append('g')
      .selectAll('path.confidence')
      .data(confidenceContours)
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('fill', 'rgb(34 197 94 / 0.3)')
      .attr('stroke', 'rgb(34 197 94)')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 0.5);

    // Enhanced tooltip for compact display
    const tooltip = d3
      .select(container)
      .append('div')
      .attr(
        'class',
        'absolute z-10 p-2 text-xs text-white bg-neutral-800 rounded border border-neutral-700 pointer-events-none transition-opacity duration-200'
      )
      .style('opacity', 0);

    // Make red markers more visible with enhanced styling
    chartArea
      .append('g')
      .selectAll('line')
      .data(dataset)
      .enter()
      .append('line')
      .attr('x1', (d) => x(d.time))
      .attr('y1', (d) => y(d.price - 0.0003)) // Slightly longer lines
      .attr('x2', (d) => x(d.time))
      .attr('y2', (d) => y(d.price + 0.0003))
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 2) // Thicker stroke
      .attr('stroke-opacity', (d) => Math.max(0.6, opacityScale(d.stake))) // Minimum opacity
      .style('filter', 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.8))') // Red glow effect
      .on('mouseover', (event, d) => {
        const dateStr = d.time.toLocaleDateString();
        const timeStr = d.time.toLocaleTimeString();
        tooltip
          .style('opacity', 1)
          .html(
            `Price: $${d.price.toFixed(4)}<br>Date: ${dateStr}<br>Time: ${timeStr}<br>Stake: ${d.stake.toFixed(0)}`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    // Simplified crosshair
    const focus = svg.append('g').attr('class', 'focus').style('display', 'none');
    focus
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#6B7280')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2');
    focus
      .append('line')
      .attr('class', 'crosshair')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('stroke', '#6B7280')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2');

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

      const radius = 30; // Smaller radius for compact display
      const nearbyPoints = dataset.filter((d) => {
        const dx = x(d.time) - pointerX;
        const dy = y(d.price) - pointerY;
        return dx * dx + dy * dy < radius * radius;
      });

      let metricsHtml = `<div class="font-semibold text-neutral-200 mb-2">Live Metrics</div>`;
      metricsHtml += `<div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
        <span class="font-medium text-neutral-400">Date:</span> <span class="text-right">${timeVal.toLocaleDateString()}</span>
        <span class="font-medium text-neutral-400">Time:</span> <span class="text-right">${timeVal.toLocaleTimeString()}</span>
        <span class="font-medium text-neutral-400">Price:</span> <span class="text-right">$${priceVal.toFixed(4)}</span>
      </div>`;

      if (nearbyPoints.length > 0) {
        const avgPrice = d3.mean(nearbyPoints, (d) => d.price);
        const avgStake = d3.mean(nearbyPoints, (d) => d.stake);

        metricsHtml += `<div class="border-t border-neutral-600 my-2"></div>
         <div class="font-semibold text-neutral-200 mb-2">Nearby Bets (${nearbyPoints.length})</div>
         <div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
            <span class="font-medium text-neutral-400">Avg Price:</span> <span class="text-right">$${avgPrice?.toFixed(4) || '0.0000'}</span>
            <span class="font-medium text-neutral-400">Avg Stake:</span> <span class="text-right">${avgStake?.toFixed(0) || '0'}</span>
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
