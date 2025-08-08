'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Enhanced KDE calculation with adaptive bandwidth
function calculateAdaptiveBandwidth(data, xScale, yScale) {
  const n = data.length;
  if (n < 2) return 35;
  
  const localDensities = data.map((d, i) => {
    const distances = data.map((other, j) => {
      if (i === j) return Infinity;
      const dx = xScale(d.time) - xScale(other.time);
      const dy = yScale(d.price) - yScale(other.price);
      return Math.sqrt(dx * dx + dy * dy);
    });
    return Math.min(...distances);
  });
  
  const medianDistance = d3.median(localDensities) || 35;
  const adaptiveBandwidth = Math.max(20, Math.min(60, medianDistance * 0.8));
  
  return adaptiveBandwidth;
}

// Improved weight scaling function
function calculateWeightScale(weights) {
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  
  const logWeights = weights.map(w => Math.log(w + 1));
  const logMin = Math.log(minWeight + 1);
  const logMax = Math.log(maxWeight + 1);
  
  return weights.map(w => {
    const logW = Math.log(w + 1);
    return Math.pow((logW - logMin) / (logMax - logMin), 0.7);
  });
}

const defaultData = [
    { "targetTimestamp": "1754835153", "weight": "223875", "priceMin": "2547", "priceMax": "2603", "payout": "0" },
    { "targetTimestamp": "1754833380", "weight": "74625", "priceMin": "1636", "priceMax": "1868", "payout": "0" },
    { "targetTimestamp": "1754830000", "weight": "149250", "priceMin": "2889", "priceMax": "3054", "payout": "0" },
    { "targetTimestamp": "1754831787", "weight": "149250", "priceMin": "2620", "priceMax": "2811", "payout": "0" },
    { "targetTimestamp": "1754830107", "weight": "149250", "priceMin": "2549", "priceMax": "2731", "payout": "0" },
    { "targetTimestamp": "1754829199", "weight": "223875", "priceMin": "2600", "priceMax": "2693", "payout": "0" },
    { "targetTimestamp": "1754828779", "weight": "223875", "priceMin": "2555", "priceMax": "2628", "payout": "0" },
    { "targetTimestamp": "1754821626", "weight": "149250", "priceMin": "2625", "priceMax": "2683", "payout": "0" },
    { "targetTimestamp": "1754821566", "weight": "99500", "priceMin": "2646", "priceMax": "2808", "payout": "0" },
    { "targetTimestamp": "1754892147", "weight": "44775", "priceMin": "2000", "priceMax": "2500", "payout": "0" },
    { "targetTimestamp": "1754833380", "weight": "74625", "priceMin": "1636", "priceMax": "1868", "payout": "0" },
    { "targetTimestamp": "1754830000", "weight": "149250", "priceMin": "2889", "priceMax": "3054", "payout": "0" },
    { "targetTimestamp": "1754831787", "weight": "149250", "priceMin": "2620", "priceMax": "2811", "payout": "0" },
    { "targetTimestamp": "1754830107", "weight": "149250", "priceMin": "2549", "priceMax": "2731", "payout": "0" },
    { "targetTimestamp": "1754829199", "weight": "223875", "priceMin": "2600", "priceMax": "2693", "payout": "0" },
    { "targetTimestamp": "1754828779", "weight": "223875", "priceMin": "2555", "priceMax": "2628", "payout": "0" },
    { "targetTimestamp": "1754821626", "weight": "149250", "priceMin": "2625", "priceMax": "2683", "payout": "0" },
    { "targetTimestamp": "1754821566", "weight": "99500", "priceMin": "2646", "priceMax": "2808", "payout": "0" },
    { "targetTimestamp": "1754835153", "weight": "223875", "priceMin": "2547", "priceMax": "2603", "payout": "0" },
    { "targetTimestamp": "1754892147", "weight": "44775", "priceMin": "2000", "priceMax": "2500", "payout": "0" },
    { "targetTimestamp": "1754727262", "weight": "9950000", "priceMin": "1500", "priceMax": "2500", "payout": "0" }
];

const KdePriceChart = ({ data = defaultData }) => {
    const chartContainerRef = useRef(null);
    const d3Container = useRef({ initialized: false }).current;

    useEffect(() => {
        if (!chartContainerRef.current || !data || data.length === 0) {
            return;
        }

        const processData = (rawData) => {
            const now = new Date();
            const processed = rawData.map(d => {
                const originalWeight = parseInt(d.weight);
                return {
                    time: new Date(parseInt(d.targetTimestamp) * 1000),
                    price: (parseInt(d.priceMin) + parseInt(d.priceMax)) / 2 / 10000,
                    stake: originalWeight,
                    originalWeight: originalWeight,
                    priceRange: (parseInt(d.priceMax) - parseInt(d.priceMin)) / 10000
                };
            }).filter(d => d.time > now);

            // Remove outliers using IQR method
            const prices = processed.map(d => d.price);
            const sortedPrices = prices.sort((a, b) => a - b);
            const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
            const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;

            return processed.filter(d => d.price >= lowerBound && d.price <= upperBound);
        };

        const dataset = processData(data);
        if (dataset.length === 0) return;

        const container = chartContainerRef.current;
        const margin = { top: 25, right: 50, bottom: 70, left: 70 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;

        d3.select(container).selectAll("*").remove();

        const svg = d3.select(container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        const defs = svg.append("defs");

        const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
        defs.append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("width", width)
            .attr("height", height);
        
        const filterId = `glow-${Math.random().toString(36).substr(2, 9)}`;
        const filter = defs.append("filter").attr("id", filterId);
        filter.append("feGaussianBlur")
            .attr("stdDeviation", "3")
            .attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        const chartArea = svg.append("g")
            .attr("clip-path", `url(#${clipId})`);

        const [minTime, maxTime] = d3.extent(dataset, d => d.time);
        const timePadding = (maxTime.getTime() - minTime.getTime()) * 0.15;

        const [minPrice, maxPrice] = d3.extent(dataset, d => d.price);
        const pricePadding = (maxPrice - minPrice) * 0.15;

        const x = d3.scaleTime()
            .domain([new Date(minTime.getTime() - timePadding), new Date(maxTime.getTime() + timePadding)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([minPrice - pricePadding, maxPrice + pricePadding])
            .range([height, 0]);

        // Enhanced weight scaling
        const weightScale = calculateWeightScale(dataset.map(d => d.stake));
        const opacityScale = d3.scaleLinear().domain([0, 1]).range([0.3, 1.0]);

        // Enhanced grid
        svg.append("g").attr("class", "grid-x").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickSize(-height).tickFormat("")).selectAll("line").attr("stroke", "currentColor").attr("stroke-opacity", 0.15).attr("stroke-width", 0.5);
        svg.append("g").call(d3.axisLeft(y).tickSize(-width).tickFormat("")).selectAll("line").attr("stroke", "currentColor").attr("stroke-opacity", 0.15).attr("stroke-width", 0.5);
        
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(width / 100).tickFormat(d3.timeFormat("%b %d"))).attr("class", "text-slate-500");
        svg.append("g").call(d3.axisLeft(y).ticks(height / 40).tickFormat(d3.format("$.3f"))).attr("class", "text-slate-500");

        svg.selectAll(".domain").attr("stroke", "currentColor").attr("stroke-opacity", 0.2);

        svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height + margin.bottom - 15).text("Target Date").attr("class", "text-sm font-medium text-slate-600");
        svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -margin.left + 20).text("Price (USD)").attr("class", "text-sm font-medium text-slate-600");

        // Enhanced KDE calculation with adaptive bandwidth
        const adaptiveBandwidth = calculateAdaptiveBandwidth(dataset, x, y);
        const densityData = d3.contourDensity()
            .x(d => x(d.time))
            .y(d => y(d.price))
            .size([width, height])
            .bandwidth(adaptiveBandwidth)
            .weight((d) => {
                const index = dataset.indexOf(d);
                return weightScale[index] || 0;
            })(dataset);
        
        // Enhanced color scheme with multiple levels
        const maxDensityValue = d3.max(densityData, d => d.value);
        
        const lowDensityColor = d3.scaleSequential(d3.interpolateRgb("rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.3)"))
            .domain([0, maxDensityValue * 0.3]);
        
        const mediumDensityColor = d3.scaleSequential(d3.interpolateRgb("rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.6)"))
            .domain([maxDensityValue * 0.3, maxDensityValue * 0.7]);
        
        const highDensityColor = d3.scaleSequential(d3.interpolateRgb("rgba(59, 130, 246, 0.6)", "rgba(59, 130, 246, 0.9)"))
            .domain([maxDensityValue * 0.7, maxDensityValue]);

        chartArea.append("g")
            .attr("filter", `url(#${filterId})`)
            .selectAll("path")
            .data(densityData)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .attr("fill", d => {
                if (d.value <= maxDensityValue * 0.3) return lowDensityColor(d.value);
                if (d.value <= maxDensityValue * 0.7) return mediumDensityColor(d.value);
                return highDensityColor(d.value);
            })
            .attr("fill-opacity", 0.95);

        // Enhanced confidence contours with multiple levels
        const confidenceLevels = [0.25, 0.5, 0.75];
        const contourColors = ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.7)'];
        const contourStrokes = ['rgb(5, 150, 105)', 'rgb(4, 120, 87)', 'rgb(6, 95, 70)'];

        confidenceLevels.forEach((level, i) => {
            const threshold = maxDensityValue * level;
            const contours = densityData.filter(d => d.value > threshold);
            
            chartArea.append("g").selectAll(`path.confidence-${i}`).data(contours).enter().append("path")
                .attr("d", d3.geoPath())
                .attr("fill", contourColors[i])
                .attr("stroke", contourStrokes[i])
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 1.5)
                .attr("stroke-opacity", 0.8);
        });

        const tooltip = d3.select(container).append("div").attr("class", "absolute z-10 p-3 text-sm text-white bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-700 shadow-xl pointer-events-none transition-opacity duration-200").style("opacity", 0);
        const timeFormat = d3.timeFormat("%b %d, %Y at %I:%M %p");

        // Enhanced bet markers
        chartArea.append("g").selectAll("circle").data(dataset).enter().append("circle")
            .attr("cx", d => x(d.time))
            .attr("cy", d => y(d.price))
            .attr("r", d => {
                const index = dataset.indexOf(d);
                return Math.max(2, Math.min(6, weightScale[index] * 4));
            })
            .attr("fill", "#ef4444")
            .attr("stroke", "#dc2626")
            .attr("stroke-width", 1)
            .attr("opacity", d => {
                const index = dataset.indexOf(d);
                return opacityScale(weightScale[index]);
            })
            .on("mouseover", (event, d) => {
                const index = dataset.indexOf(d);
                tooltip.style("opacity", 1).html(`
                    <div class="font-semibold text-red-400 mb-2">Bet Details</div>
                    <div class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
                        <span class="font-medium text-slate-400">Price:</span> 
                        <span class="text-right font-mono">$${d.price.toFixed(4)}</span>
                        <span class="font-medium text-slate-400">Date:</span> 
                        <span class="text-right">${timeFormat(d.time)}</span>
                        <span class="font-medium text-slate-400">Weight:</span> 
                        <span class="text-right font-mono">${d.originalWeight.toLocaleString()}</span>
                        <span class="font-medium text-slate-400">Range:</span> 
                        <span class="text-right font-mono">±$${d.priceRange.toFixed(4)}</span>
                    </div>
                `).style("left", `${event.pageX + 15}px`).style("top", `${event.pageY - 15}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        const focus = svg.append("g").attr("class", "focus").style("display", "none");
        focus.append("line").attr("class", "crosshair").attr("y1", 0).attr("y2", height).attr("stroke", "#94a3b8").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");
        focus.append("line").attr("class", "crosshair").attr("x1", 0).attr("x2", width).attr("stroke", "#94a3b8").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");

        const metricsPanel = d3.select(container).append("div")
            .attr("class", "absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg text-sm text-slate-700 pointer-events-none transition-opacity duration-300")
            .style("opacity", 0);

        svg.append("rect").attr("width", width).attr("height", height).style("fill", "none").style("pointer-events", "all")
            .on("mouseover", () => { focus.style("display", null); metricsPanel.style("opacity", 1); })
            .on("mouseout", () => { focus.style("display", "none"); metricsPanel.style("opacity", 0); })
            .on("mousemove", mousemove);

        function mousemove(event) {
            const [pointerX, pointerY] = d3.pointer(event, this);
            focus.selectAll(".crosshair").style("display", "block");
            focus.select("line.crosshair[y1='0']").attr("x1", pointerX).attr("x2", pointerX);
            focus.select("line.crosshair[x1='0']").attr("y1", pointerY).attr("y2", pointerY);

            const timeVal = x.invert(pointerX);
            const priceVal = y.invert(pointerY);
            
            const radius = 50;
            const nearbyPoints = dataset.filter(d => {
                const dx = x(d.time) - pointerX;
                const dy = y(d.price) - pointerY;
                return dx * dx + dy * dy < radius * radius;
            });

            let metricsHtml = `<div class="font-semibold text-slate-800 mb-3">Live Analysis</div>`;
            metricsHtml += `<div class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
                <span class="font-medium text-slate-500">Cursor Date:</span> 
                <span class="text-right font-mono">${timeFormat(timeVal)}</span>
                <span class="font-medium text-slate-500">Cursor Price:</span> 
                <span class="text-right font-mono">$${priceVal.toFixed(4)}</span>
            </div>`;

            if (nearbyPoints.length > 0) {
                const avgPrice = d3.mean(nearbyPoints, d => d.price);
                const totalWeight = d3.sum(nearbyPoints, d => d.originalWeight);
                const priceStd = d3.deviation(nearbyPoints, d => d.price);

                metricsHtml += `<div class="border-t border-slate-200 my-3"></div>
                 <div class="font-semibold text-slate-800 mb-2">Nearby Bets (${nearbyPoints.length})</div>
                 <div class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
                    <span class="font-medium text-slate-500">Avg Price:</span> 
                    <span class="text-right font-mono">$${avgPrice?.toFixed(4) || '0.0000'}</span>
                    <span class="font-medium text-slate-500">Total Weight:</span> 
                    <span class="text-right font-mono">${totalWeight?.toLocaleString() || '0'}</span>
                    <span class="font-medium text-slate-500">Price Std Dev:</span> 
                    <span class="text-right font-mono">$${priceStd?.toFixed(4) || '0.0000'}</span>
                 </div>`;
            }
            metricsPanel.html(metricsHtml);
        }

    }, [data]);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-slate-800">Enhanced Token Probability Distribution</h1>
                <p className="text-sm text-slate-500">Advanced KDE analysis with adaptive bandwidth and multi-level confidence contours</p>
            </div>
            <div ref={chartContainerRef} className="w-full h-[500px] relative" />
        </div>
    );
};

export default KdePriceChart;
