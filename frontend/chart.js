'use client'; // This directive is necessary for using hooks like useEffect and useRef in Next.js App Router

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// The data is now passed as a prop to the component for better reusability.
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
            return rawData.map(d => {
                const originalWeight = parseInt(d.weight);
                return {
                    time: new Date(parseInt(d.targetTimestamp) * 1000),
                    price: (parseInt(d.priceMin) + parseInt(d.priceMax)) / 2 / 10000,
                    stake: Math.sqrt(originalWeight), // Use square root to scale weights for better visualization
                    originalWeight: originalWeight // Keep original weight for tooltips
                };
            }).filter(d => d.time > now);
        };

        const dataset = processData(data);
        if (dataset.length === 0) return;

        const container = chartContainerRef.current;
        const margin = { top: 20, right: 40, bottom: 60, left: 60 };
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
            .attr("stdDeviation", "4.5")
            .attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        const chartArea = svg.append("g")
            .attr("clip-path", `url(#${clipId})`);

        const [minTime, maxTime] = d3.extent(dataset, d => d.time);
        const timePadding = (maxTime.getTime() - minTime.getTime()) * 0.2; 

        const [minPrice, maxPrice] = d3.extent(dataset, d => d.price);
        const pricePadding = (maxPrice - minPrice) * 0.2;

        const x = d3.scaleTime()
            .domain([new Date(minTime.getTime() - timePadding), new Date(maxTime.getTime() + timePadding)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([minPrice - pricePadding, maxPrice + pricePadding])
            .range([height, 0]);
            
        const opacityScale = d3.scaleLinear().domain(d3.extent(dataset, d => d.stake)).range([0.4, 1.0]);

        svg.append("g").attr("class", "grid-x").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickSize(-height).tickFormat("")).selectAll("line").attr("stroke", "currentColor").attr("stroke-opacity", 0.1);
        svg.append("g").call(d3.axisLeft(y).tickSize(-width).tickFormat("")).selectAll("line").attr("stroke", "currentColor").attr("stroke-opacity", 0.1);
        
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(width / 100).tickFormat(d3.timeFormat("%b %d"))).attr("class", "text-slate-500");
        svg.append("g").call(d3.axisLeft(y).ticks(height / 40).tickFormat(d3.format("$.3f"))).attr("class", "text-slate-500");

        svg.selectAll(".domain").attr("stroke", "currentColor").attr("stroke-opacity", 0.2);

        svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height + margin.bottom - 15).text("Target Date").attr("class", "text-sm font-medium text-slate-600");
        svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -margin.left + 20).text("Price (USD)").attr("class", "text-sm font-medium text-slate-600");

        const densityData = d3.contourDensity().x(d => x(d.time)).y(d => y(d.price)).size([width, height]).bandwidth(35).weight(d => d.stake)(dataset);
        
        const smokyBlueInterpolator = d3.interpolateRgb("rgba(71, 144, 202, 0.1)", "#4790ca");
        const densityColor = d3.scaleSequential(smokyBlueInterpolator)
            .domain([0, d3.max(densityData, d => d.value)]);

        chartArea.append("g")
            .attr("filter", `url(#${filterId})`)
            .selectAll("path")
            .data(densityData)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .attr("fill", d => densityColor(d.value))
            .attr("fill-opacity", 0.9);

        const maxDensity = d3.max(densityData, d => d.value);
        const confidenceThreshold = maxDensity * 0.25;
        const confidenceContours = densityData.filter(d => d.value > confidenceThreshold);
        chartArea.append("g").selectAll("path.confidence").data(confidenceContours).enter().append("path").attr("d", d3.geoPath()).attr("fill", "rgb(16 185 129 / 0.4)").attr("stroke", "rgb(5 150 105)").attr("stroke-linejoin", "round").attr("stroke-width", 1);

        const tooltip = d3.select(container).append("div").attr("class", "absolute z-10 p-2 text-xs text-white bg-slate-800 rounded-md shadow-lg pointer-events-none transition-opacity duration-200").style("opacity", 0);
        const timeFormat = d3.timeFormat("%b %d, %Y");

        chartArea.append("g").selectAll("line").data(dataset).enter().append("line")
            .attr("x1", d => x(d.time))
            .attr("y1", d => y(d.price - 0.0004))
            .attr("x2", d => x(d.time))
            .attr("y2", d => y(d.price + 0.0004))
            .attr("stroke", "#f43f5e")
            .attr("stroke-width", 2.5)
            .attr("stroke-opacity", d => opacityScale(d.stake))
            .attr("stroke-linecap", "round")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).html(`Price: $${d.price.toFixed(4)}<br>Date: ${timeFormat(d.time)}<br>Weight: ${d.originalWeight.toFixed(0)}`).style("left", `${event.pageX + 15}px`).style("top", `${event.pageY - 15}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        const focus = svg.append("g").attr("class", "focus").style("display", "none");
        focus.append("line").attr("class", "crosshair").attr("y1", 0).attr("y2", height).attr("stroke", "#94a3b8").attr("stroke-width", 0.5).attr("stroke-dasharray", "3,3");
        focus.append("line").attr("class", "crosshair").attr("x1", 0).attr("x2", width).attr("stroke", "#94a3b8").attr("stroke-width", 0.5).attr("stroke-dasharray", "3,3");

        const metricsPanel = d3.select(container).append("div")
            .attr("class", "absolute top-4 right-4 p-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg text-xs text-slate-700 pointer-events-none transition-opacity duration-300")
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
            
            const radius = 40;
            const nearbyPoints = dataset.filter(d => {
                const dx = x(d.time) - pointerX;
                const dy = y(d.price) - pointerY;
                return dx * dx + dy * dy < radius * radius;
            });

            let metricsHtml = `<div class="font-semibold text-slate-800 mb-2">Live Metrics</div>`;
            metricsHtml += `<div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
                <span class="font-medium text-slate-500">Date:</span> <span class="text-right">${timeFormat(timeVal)}</span>
                <span class="font-medium text-slate-500">Price:</span> <span class="text-right">$${priceVal.toFixed(4)}</span>
            </div>`;

            if (nearbyPoints.length > 0) {
                 metricsHtml += `<div class="border-t border-slate-200 my-2"></div>
                 <div class="font-semibold text-slate-800 mb-2">Nearby Bets (${nearbyPoints.length})</div>
                 <div class="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
                    <span class="font-medium text-slate-500">Avg Price:</span> <span class="text-right">$${d3.mean(nearbyPoints, d => d.price).toFixed(4)}</span>
                    <span class="font-medium text-slate-500">Avg Weight:</span> <span class="text-right">${d3.mean(nearbyPoints, d => d.originalWeight).toFixed(0)}</span>
                 </div>`;
            }
            metricsPanel.html(metricsHtml);
        }

    }, [data]); // Effect dependency on data prop

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-white/60 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-slate-800">Token Probability Distribution</h1>
                <p className="text-sm text-slate-500">Aggregated price predictions with high-confidence zone ({'>'}75%)</p>
            </div>
            <div ref={chartContainerRef} className="w-full h-[500px] relative" />
        </div>
    );
};

// --- HOW TO USE IN NEXT.JS ---
// 1. Save this code as a component, e.g., `/components/KdePriceChart.js`
// 2. In your Next.js page (e.g., `/app/page.js`), import the component and your data.
/*
import KdePriceChart from '@/components/KdePriceChart';

const betData = [
    // ... your new data array here ...
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-slate-100">
      <KdePriceChart data={betData} />
    </main>
  );
}
*/
// 3. Make sure you have d3 installed in your project:
//    npm install d3
//    or
//    yarn add d3
// 4. Ensure you have Tailwind CSS configured in your Next.js project.

export default KdePriceChart;
