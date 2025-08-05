'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

interface KDEChartProps {
  className?: string;
  currentPrice: number;
}

// Default data structure matching the chart.js implementation
const defaultData = [
  { "targetTimestamp": 1754758053, "priceMin": 0.251, "priceMax": 0.2639, "betWeight": 89.14 },
  { "targetTimestamp": 1754619352, "priceMin": 0.2417, "priceMax": 0.2468, "betWeight": 37.16 },
  { "targetTimestamp": 1754331707, "priceMin": 0.259, "priceMax": 0.2687, "betWeight": 46.73 },
  { "targetTimestamp": 1755075593, "priceMin": 0.245, "priceMax": 0.253, "betWeight": 83.2 },
  { "targetTimestamp": 1754878248, "priceMin": 0.247, "priceMax": 0.2533, "betWeight": 6.46 },
  { "targetTimestamp": 1754726498, "priceMin": 0.2539, "priceMax": 0.2635, "betWeight": 0.7 },
  { "targetTimestamp": 1754194924, "priceMin": 0.253, "priceMax": 0.2661, "betWeight": 44.76 },
  { "targetTimestamp": 1754190900, "priceMin": 0.2538, "priceMax": 0.2669, "betWeight": 25.77 },
  { "targetTimestamp": 1754222045, "priceMin": 0.2456, "priceMax": 0.2614, "betWeight": 47.39 },
  { "targetTimestamp": 1754499425, "priceMin": 0.2353, "priceMax": 0.2515, "betWeight": 89.53 },
  { "targetTimestamp": 1754424699, "priceMin": 0.2624, "priceMax": 0.2779, "betWeight": 89.18 },
  { "targetTimestamp": 1754304235, "priceMin": 0.2491, "priceMax": 0.2625, "betWeight": 70.93 },
  { "targetTimestamp": 1754970076, "priceMin": 0.2497, "priceMax": 0.2614, "betWeight": 57.07 },
  { "targetTimestamp": 1754345576, "priceMin": 0.2344, "priceMax": 0.2447, "betWeight": 59.28 },
  { "targetTimestamp": 1754393317, "priceMin": 0.2558, "priceMax": 0.27, "betWeight": 83.29 },
  { "targetTimestamp": 1754559852, "priceMin": 0.2549, "priceMax": 0.2628, "betWeight": 17.77 },
  { "targetTimestamp": 1754773303, "priceMin": 0.2353, "priceMax": 0.2407, "betWeight": 57.2 },
  { "targetTimestamp": 1754209766, "priceMin": 0.2529, "priceMax": 0.2602, "betWeight": 74.29 },
  { "targetTimestamp": 1754347878, "priceMin": 0.2536, "priceMax": 0.2652, "betWeight": 74.6 },
  { "targetTimestamp": 1754195579, "priceMin": 0.2419, "priceMax": 0.2604, "betWeight": 70.81 },
  { "targetTimestamp": 1754609818, "priceMin": 0.2409, "priceMax": 0.2562, "betWeight": 27.28 },
  { "targetTimestamp": 1754689300, "priceMin": 0.2594, "priceMax": 0.2794, "betWeight": 50.73 },
  { "targetTimestamp": 1754495671, "priceMin": 0.2522, "priceMax": 0.2594, "betWeight": 59.69 },
  { "targetTimestamp": 1755324003, "priceMin": 0.2529, "priceMax": 0.2677, "betWeight": 51.9 },
  { "targetTimestamp": 1754191149, "priceMin": 0.2453, "priceMax": 0.264, "betWeight": 47.76 },
  { "targetTimestamp": 1754931578, "priceMin": 0.2521, "priceMax": 0.2633, "betWeight": 94.69 },
  { "targetTimestamp": 1754204828, "priceMin": 0.2529, "priceMax": 0.271, "betWeight": 13.22 },
  { "targetTimestamp": 1755414606, "priceMin": 0.2465, "priceMax": 0.2517, "betWeight": 32.65 },
  { "targetTimestamp": 1755331363, "priceMin": 0.2403, "priceMax": 0.249, "betWeight": 82.94 },
  { "targetTimestamp": 1754517753, "priceMin": 0.2371, "priceMax": 0.2557, "betWeight": 66.55 },
  { "targetTimestamp": 1754294606, "priceMin": 0.253, "priceMax": 0.2642, "betWeight": 27.5 },
  { "targetTimestamp": 1754431668, "priceMin": 0.2521, "priceMax": 0.2627, "betWeight": 38.71 },
  { "targetTimestamp": 1755315526, "priceMin": 0.2449, "priceMax": 0.2535, "betWeight": 76.07 },
  { "targetTimestamp": 1754820337, "priceMin": 0.2632, "priceMax": 0.2715, "betWeight": 86.43 },
  { "targetTimestamp": 1755262584, "priceMin": 0.2534, "priceMax": 0.2689, "betWeight": 88.83 },
  { "targetTimestamp": 1754323298, "priceMin": 0.2349, "priceMax": 0.2528, "betWeight": 85.9 },
  { "targetTimestamp": 1754198238, "priceMin": 0.2319, "priceMax": 0.2459, "betWeight": 29.09 },
  { "targetTimestamp": 1754725932, "priceMin": 0.2517, "priceMax": 0.2591, "betWeight": 23.92 },
  { "targetTimestamp": 1754232919, "priceMin": 0.2606, "priceMax": 0.2734, "betWeight": 17.76 },
  { "targetTimestamp": 1754203659, "priceMin": 0.2412, "priceMax": 0.2546, "betWeight": 84.37 },
  { "targetTimestamp": 1754383796, "priceMin": 0.2356, "priceMax": 0.2546, "betWeight": 42.53 },
  { "targetTimestamp": 1754361036, "priceMin": 0.2591, "priceMax": 0.2665, "betWeight": 87.74 },
  { "targetTimestamp": 1754213465, "priceMin": 0.2565, "priceMax": 0.2726, "betWeight": 67.17 },
  { "targetTimestamp": 1754296064, "priceMin": 0.2558, "priceMax": 0.2725, "betWeight": 52.66 },
  { "targetTimestamp": 1754401266, "priceMin": 0.228, "priceMax": 0.2438, "betWeight": 94.71 },
  { "targetTimestamp": 1754296424, "priceMin": 0.2498, "priceMax": 0.2569, "betWeight": 71.24 },
  { "targetTimestamp": 1755907541, "priceMin": 0.257, "priceMax": 0.2666, "betWeight": 80.42 },
  { "targetTimestamp": 1754789619, "priceMin": 0.2713, "priceMax": 0.2787, "betWeight": 17.07 },
  { "targetTimestamp": 1754192679, "priceMin": 0.2689, "priceMax": 0.2837, "betWeight": 69.27 },
  { "targetTimestamp": 1754372741, "priceMin": 0.255, "priceMax": 0.2614, "betWeight": 65.78 },
  { "targetTimestamp": 1754348513, "priceMin": 0.2403, "priceMax": 0.2587, "betWeight": 74.54 },
  { "targetTimestamp": 1754385327, "priceMin": 0.236, "priceMax": 0.2531, "betWeight": 14.73 },
  { "targetTimestamp": 1754279688, "priceMin": 0.2435, "priceMax": 0.2509, "betWeight": 50.57 },
  { "targetTimestamp": 1754327671, "priceMin": 0.2518, "priceMax": 0.2634, "betWeight": 37.08 },
  { "targetTimestamp": 1754660924, "priceMin": 0.2361, "priceMax": 0.2545, "betWeight": 95.31 },
  { "targetTimestamp": 1754477569, "priceMin": 0.2402, "priceMax": 0.2456, "betWeight": 17.9 },
  { "targetTimestamp": 1754796744, "priceMin": 0.2412, "priceMax": 0.2516, "betWeight": 30.92 },
  { "targetTimestamp": 1755197105, "priceMin": 0.2376, "priceMax": 0.2569, "betWeight": 27.65 },
  { "targetTimestamp": 1755084657, "priceMin": 0.2593, "priceMax": 0.2739, "betWeight": 45.17 },
  { "targetTimestamp": 1754570028, "priceMin": 0.2689, "priceMax": 0.2863, "betWeight": 61.44 },
  { "targetTimestamp": 1754434502, "priceMin": 0.2386, "priceMax": 0.2506, "betWeight": 88.86 },
  { "targetTimestamp": 1754530009, "priceMin": 0.2465, "priceMax": 0.2598, "betWeight": 66.17 },
  { "targetTimestamp": 1754730637, "priceMin": 0.2406, "priceMax": 0.2567, "betWeight": 6.35 },
  { "targetTimestamp": 1754835405, "priceMin": 0.2447, "priceMax": 0.2578, "betWeight": 25.42 },
  { "targetTimestamp": 1754619084, "priceMin": 0.2363, "priceMax": 0.253, "betWeight": 8.7 },
  { "targetTimestamp": 1754242601, "priceMin": 0.2499, "priceMax": 0.2585, "betWeight": 21.6 },
  { "targetTimestamp": 1754536215, "priceMin": 0.2499, "priceMax": 0.2616, "betWeight": 42.26 },
  { "targetTimestamp": 1754520198, "priceMin": 0.2525, "priceMax": 0.2694, "betWeight": 53.72 },
  { "targetTimestamp": 1754985761, "priceMin": 0.2458, "priceMax": 0.2532, "betWeight": 78.76 },
  { "targetTimestamp": 1754502067, "priceMin": 0.2423, "priceMax": 0.262, "betWeight": 50.03 },
  { "targetTimestamp": 1754373988, "priceMin": 0.2504, "priceMax": 0.2687, "betWeight": 10.13 },
  { "targetTimestamp": 1754195275, "priceMin": 0.2505, "priceMax": 0.2663, "betWeight": 17.51 },
  { "targetTimestamp": 1754270560, "priceMin": 0.2555, "priceMax": 0.2621, "betWeight": 77.4 },
  { "targetTimestamp": 1754183623, "priceMin": 0.2454, "priceMax": 0.2626, "betWeight": 91.17 },
  { "targetTimestamp": 1754820612, "priceMin": 0.2626, "priceMax": 0.2741, "betWeight": 77.77 },
  { "targetTimestamp": 1754187710, "priceMin": 0.248, "priceMax": 0.2567, "betWeight": 23.65 },
  { "targetTimestamp": 1754636352, "priceMin": 0.2664, "priceMax": 0.2747, "betWeight": 24.51 },
  { "targetTimestamp": 1755513243, "priceMin": 0.256, "priceMax": 0.2681, "betWeight": 9.99 },
  { "targetTimestamp": 1755522247, "priceMin": 0.2325, "priceMax": 0.2428, "betWeight": 53.05 },
  { "targetTimestamp": 1754600229, "priceMin": 0.2505, "priceMax": 0.256, "betWeight": 24.31 },
  { "targetTimestamp": 1754672957, "priceMin": 0.2588, "priceMax": 0.2689, "betWeight": 68.82 },
  { "targetTimestamp": 1754358730, "priceMin": 0.2564, "priceMax": 0.2624, "betWeight": 13.51 },
  { "targetTimestamp": 1754824130, "priceMin": 0.2679, "priceMax": 0.2745, "betWeight": 83.71 },
  { "targetTimestamp": 1755999783, "priceMin": 0.2533, "priceMax": 0.2659, "betWeight": 14.58 },
  { "targetTimestamp": 1754186133, "priceMin": 0.2503, "priceMax": 0.2679, "betWeight": 35.79 },
  { "targetTimestamp": 1754187314, "priceMin": 0.2545, "priceMax": 0.269, "betWeight": 0.99 },
  { "targetTimestamp": 1754471235, "priceMin": 0.2475, "priceMax": 0.2638, "betWeight": 13.46 },
  { "targetTimestamp": 1754294872, "priceMin": 0.2504, "priceMax": 0.2566, "betWeight": 16.41 },
  { "targetTimestamp": 1754389429, "priceMin": 0.2312, "priceMax": 0.2475, "betWeight": 84.69 },
  { "targetTimestamp": 1754997011, "priceMin": 0.2424, "priceMax": 0.2559, "betWeight": 99.71 },
  { "targetTimestamp": 1754243194, "priceMin": 0.2256, "priceMax": 0.2322, "betWeight": 63.97 },
  { "targetTimestamp": 1754284106, "priceMin": 0.2505, "priceMax": 0.2667, "betWeight": 16.29 },
  { "targetTimestamp": 1754288607, "priceMin": 0.2437, "priceMax": 0.2549, "betWeight": 21.49 },
  { "targetTimestamp": 1754238901, "priceMin": 0.2359, "priceMax": 0.2458, "betWeight": 85.3 },
  { "targetTimestamp": 1754459925, "priceMin": 0.2586, "priceMax": 0.2781, "betWeight": 16.42 },
  { "targetTimestamp": 1754532266, "priceMin": 0.2658, "priceMax": 0.2807, "betWeight": 19.1 },
  { "targetTimestamp": 1754784962, "priceMin": 0.2507, "priceMax": 0.2562, "betWeight": 26.95 },
  { "targetTimestamp": 1754593286, "priceMin": 0.2566, "priceMax": 0.2638, "betWeight": 27.26 },
  { "targetTimestamp": 1755673261, "priceMin": 0.239, "priceMax": 0.2483, "betWeight": 68.73 },
  { "targetTimestamp": 1754350878, "priceMin": 0.2512, "priceMax": 0.2664, "betWeight": 5.36 }
];

export function KDEChart({ className, currentPrice }: KDEChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const d3Container = useRef({ initialized: false }).current;

  useEffect(() => {
    if (!chartContainerRef.current || !defaultData || defaultData.length === 0) {
      return;
    }

    const processData = (rawData: any[]) => {
      const now = Date.now();
      return rawData.map(d => ({
        time: new Date(d.targetTimestamp * 1000), // Convert seconds to Date object
        price: (d.priceMin + d.priceMax) / 2,
        stake: d.betWeight
      })).filter(d => d.time > new Date()); // Filter for future dates only
    };

    const dataset = processData(defaultData);
    if (dataset.length === 0) return; // Don't render if no future data

    const container = chartContainerRef.current;
    // Reduced margins for compact display
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    d3.select(container).selectAll("*").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
    svg.append("defs").append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const chartArea = svg.append("g")
      .attr("clip-path", `url(#${clipId})`);

    // Add more padding to the domain to "zoom out"
    const timeExtent = d3.extent(dataset, d => d.time.getTime());
    const priceExtent = d3.extent(dataset, d => d.price);
    
    // Check if extents are valid
    if (!timeExtent[0] || !timeExtent[1] || !priceExtent[0] || !priceExtent[1]) {
      return; // Exit if we don't have valid data ranges
    }
    
    const [minTime, maxTime] = timeExtent;
    const timePadding = (maxTime - minTime) * 0.2; // 20% padding

    const [minPrice, maxPrice] = priceExtent;
    const pricePadding = (maxPrice - minPrice) * 0.2; // 20% padding

    const x = d3.scaleTime()
      .domain([new Date(minTime - timePadding), new Date(maxTime + timePadding)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([minPrice - pricePadding, maxPrice + pricePadding])
      .range([height, 0]);
    
    const stakeExtent = d3.extent(dataset, d => d.stake);
    if (!stakeExtent[0] || !stakeExtent[1]) return;
    const opacityScale = d3.scaleLinear().domain([stakeExtent[0], stakeExtent[1]]).range([0.3, 1.0]);

    // Simplified grid with dark theme colors
    svg.append("g").attr("class", "grid-x").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickSize(-height).tickFormat(() => "")).selectAll("line").attr("stroke", "#374151").attr("stroke-opacity", 0.3);
    svg.append("g").call(d3.axisLeft(y).tickSize(-width).tickFormat(() => "")).selectAll("line").attr("stroke", "#374151").attr("stroke-opacity", 0.3);
    
    // Axes with dark theme styling
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(width / 80).tickFormat((d: any) => d3.timeFormat("%b %d")(d)).tickSizeOuter(0))
      .selectAll("text").attr("fill", "#9CA3AF").attr("font-size", "10px");
    svg.append("g").call(d3.axisLeft(y).ticks(height / 40).tickFormat(d3.format("$.3f")))
      .selectAll("text").attr("fill", "#9CA3AF").attr("font-size", "10px");

    // Smaller axis labels
    svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height + margin.bottom - 5).text("Date").attr("fill", "#9CA3AF").attr("font-size", "10px");
    svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -margin.left + 15).text("Price (USD)").attr("fill", "#9CA3AF").attr("font-size", "10px");

    // Convert dataset to the format expected by contourDensity
    const densityPoints = dataset.map(d => [d.time.getTime(), d.price] as [number, number]);
    const densityData = d3.contourDensity()
      .x(d => x(new Date(d[0])))
      .y(d => y(d[1]))
      .size([width, height])
      .bandwidth(25)
      .weight((d: [number, number]) => {
        const index = densityPoints.findIndex(point => point[0] === d[0] && point[1] === d[1]);
        return index >= 0 ? dataset[index].stake : 1;
      })(densityPoints);
    
    // Use a more subtle color scheme for dark theme
    const maxDensityValue = d3.max(densityData, d => d.value);
    if (!maxDensityValue) return;
    
    const densityColor = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxDensityValue]);

    chartArea.append("g").selectAll("path").data(densityData).enter().append("path").attr("d", d3.geoPath()).attr("fill", d => densityColor(d.value)).attr("fill-opacity", 0.6);

    const confidenceThreshold = maxDensityValue * 0.25;
    const confidenceContours = densityData.filter(d => d.value > confidenceThreshold);
    chartArea.append("g").selectAll("path.confidence").data(confidenceContours).enter().append("path").attr("d", d3.geoPath()).attr("fill", "rgb(34 197 94 / 0.3)").attr("stroke", "rgb(34 197 94)").attr("stroke-linejoin", "round").attr("stroke-width", 0.5);

    // Simplified tooltip for compact display
    const tooltip = d3.select(container).append("div").attr("class", "absolute z-10 p-2 text-xs text-white bg-neutral-800 rounded border border-neutral-700 pointer-events-none transition-opacity duration-200").style("opacity", 0);
    chartArea.append("g").selectAll("line").data(dataset).enter().append("line").attr("x1", d => x(d.time)).attr("y1", d => y(d.price - 0.0002)).attr("x2", d => x(d.time)).attr("y2", d => y(d.price + 0.0002)).attr("stroke", "#EF4444").attr("stroke-width", 1).attr("stroke-opacity", d => opacityScale(d.stake))
      .on("mouseover", (event, d) => {
        const dateStr = d.time.toLocaleDateString();
        const timeStr = d.time.toLocaleTimeString();
        tooltip.style("opacity", 1).html(`Price: $${d.price.toFixed(4)}<br>Date: ${dateStr}<br>Time: ${timeStr}<br>Stake: ${d.stake.toFixed(0)}`).style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Simplified crosshair
    const focus = svg.append("g").attr("class", "focus").style("display", "none");
    focus.append("line").attr("class", "crosshair").attr("y1", 0).attr("y2", height).attr("stroke", "#6B7280").attr("stroke-width", 0.5).attr("stroke-dasharray", "2,2");
    focus.append("line").attr("class", "crosshair").attr("x1", 0).attr("x2", width).attr("stroke", "#6B7280").attr("stroke-width", 0.5).attr("stroke-dasharray", "2,2");

    // Compact metrics panel
    const metricsPanel = d3.select(container).append("div")
      .attr("class", "absolute top-2 right-2 p-2 bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 rounded text-xs text-neutral-300 pointer-events-none transition-opacity duration-300")
      .style("opacity", 0);

    svg.append("rect").attr("width", width).attr("height", height).style("fill", "none").style("pointer-events", "all")
      .on("mouseover", () => { focus.style("display", null); metricsPanel.style("opacity", 1); })
      .on("mouseout", () => { focus.style("display", "none"); metricsPanel.style("opacity", 0); })
      .on("mousemove", mousemove);

    function mousemove(event: any) {
      const [pointerX, pointerY] = d3.pointer(event, event.currentTarget);
      focus.selectAll(".crosshair").style("display", "block");
      focus.select("line.crosshair[y1='0']").attr("x1", pointerX).attr("x2", pointerX);
      focus.select("line.crosshair[x1='0']").attr("y1", pointerY).attr("y2", pointerY);

      const timeVal = x.invert(pointerX);
      const priceVal = y.invert(pointerY);
      
      const radius = 30; // Smaller radius for compact display
      const nearbyPoints = dataset.filter(d => {
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
         const avgPrice = d3.mean(nearbyPoints, d => d.price);
         const avgStake = d3.mean(nearbyPoints, d => d.stake);
         
         metricsHtml += `<div class="border-t border-neutral-600 my-2"></div>
         <div class="font-semibold text-neutral-200 mb-2">Nearby Bets (${nearbyPoints.length})</div>
         <div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
            <span class="font-medium text-neutral-400">Avg Price:</span> <span class="text-right">$${avgPrice?.toFixed(4) || '0.0000'}</span>
            <span class="font-medium text-neutral-400">Avg Stake:</span> <span class="text-right">${avgStake?.toFixed(0) || '0'}</span>
         </div>`;
      }
      metricsPanel.html(metricsHtml);
    }

  }, [defaultData]); // Effect dependency on data

  return (
    <div className={cn('w-full', className)}>
      <div className="text-xs text-neutral-400 mb-2">
        Price prediction distribution by date
      </div>
      <div ref={chartContainerRef} className="w-full h-full relative" />
    </div>
  );
}
