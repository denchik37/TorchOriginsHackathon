'use client'; // This directive is necessary for using hooks like useEffect and useRef in Next.js App Router

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// The main React component for the chart
const KdePriceChart = () => {
    // useRef to get a reference to the SVG container div
    const chartContainerRef = useRef(null);
    // useRef to store static values that D3 needs, to avoid re-calculating on every render
    const d3Container = useRef({ initialized: false }).current;

    // useEffect hook to encapsulate all D3 logic
    // This runs only once after the component mounts, thanks to the empty dependency array []
    useEffect(() => {
        // Prevent D3 from re-initializing on hot reloads in development
        if (!chartContainerRef.current || d3Container.initialized) {
            return;
        }

        // --- 1. MOCK DATA GENERATION ---
        // This function creates a plausible-looking dataset for the bets.
        const generateMockData = () => {
            const data = [];
            const numPoints = 400;
            // Create a few clusters of data to make the density plot interesting
            for (let i = 0; i < numPoints; i++) {
                let time, price;
                const rand = Math.random();
                if (rand < 0.6) { // Cluster 1: Early, low price
                    time = d3.randomNormal(20, 10)();
                    price = d3.randomNormal(3, 1)();
                } else if (rand < 0.9) { // Cluster 2: Mid-time, rising price
                    time = d3.randomNormal(70, 15)();
                    price = d3.randomNormal(8, 2)();
                } else { // Outliers
                    time = Math.random() * 140;
                    price = Math.random() * 18;
                }
                
                // Ensure data points are within the defined chart bounds
                time = Math.max(0, Math.min(140, time));
                price = Math.max(0, Math.min(18, price));

                data.push({
                    time: time,
                    price: price,
                    stake: Math.random() * 1000 // Random stake size
                });
            }
            return data;
        };

        const dataset = generateMockData();

        // --- 2. CHART SETUP ---
        const container = chartContainerRef.current;
        const margin = { top: 20, right: 30, bottom: 60, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;

        // Clear any previous SVG to prevent duplicates on re-render
        d3.select(container).selectAll("*").remove();

        const svg = d3.select(container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // --- 3. SCALES & AXES ---
        const x = d3.scaleLinear().domain([0, 140]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 18]).range([height, 0]);
        const opacityScale = d3.scaleLinear().domain(d3.extent(dataset, d => d.stake)).range([0.2, 1.0]);

        // Gridlines and Axes
        svg.append("g").attr("class", "grid").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickSize(-height).tickFormat("")).selectAll("line").attr("stroke", "#e2e8f0").attr("stroke-dasharray", "2,2");
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).select(".domain").attr("stroke", "#475569");
        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height + margin.bottom - 15).text("Time (hours)").attr("fill", "#475569").style("font-size", "14px").style("font-weight", "500");
        svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-width).tickFormat("")).selectAll("line").attr("stroke", "#e2e8f0").attr("stroke-dasharray", "2,2");
        svg.append("g").call(d3.axisLeft(y)).select(".domain").attr("stroke", "#475569");
        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -margin.left + 20).text("Price (USD)").attr("fill", "#475569").style("font-size", "14px").style("font-weight", "500");

        // --- 4. KERNEL DENSITY ESTIMATE (KDE) ---
        const densityData = d3.contourDensity().x(d => x(d.time)).y(d => y(d.price)).size([width, height]).bandwidth(30)(dataset);
        const densityColor = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(densityData, d => d.value)]);

        // --- 5. RENDER THE VISUALIZATION ---
        svg.append("g").selectAll("path").data(densityData).enter().append("path").attr("d", d3.geoPath()).attr("fill", d => densityColor(d.value)).style("opacity", 0.9);

        const maxDensity = d3.max(densityData, d => d.value);
        const confidenceThreshold = maxDensity * 0.25;
        const confidenceContours = densityData.filter(d => d.value > confidenceThreshold);
        svg.append("g").selectAll("path.confidence").data(confidenceContours).enter().append("path").attr("d", d3.geoPath()).attr("fill", "#16a34a").attr("fill-opacity", 0.4).attr("stroke", "#15803d").attr("stroke-linejoin", "round").attr("stroke-width", 1);

        const tooltip = d3.select(container).append("div").attr("class", "tooltip").style("opacity", 0).style("position", "absolute").style("text-align", "center").style("padding", "8px").style("font-size", "12px").style("background", "#1f2937").style("color", "#f9fafb").style("border-radius", "8px").style("pointer-events", "none");
        svg.append("g").selectAll("line").data(dataset).enter().append("line").attr("x1", d => x(d.time)).attr("y1", d => y(d.price - 0.2)).attr("x2", d => x(d.time)).attr("y2", d => y(d.price + 0.2)).attr("stroke", "#ef4444").attr("stroke-width", 1.5).attr("stroke-opacity", d => opacityScale(d.stake))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Price: $${d.price.toFixed(2)}<br>Time: ${d.time.toFixed(1)}h<br>Stake: ${d.stake.toFixed(0)}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

        // --- 6. INTERACTIVE METRICS & CROSSHAIR ---
        const focus = svg.append("g").attr("class", "focus").style("display", "none");
        focus.append("line").attr("class", "crosshair").attr("y1", 0).attr("y2", height).attr("stroke", "#475569").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");
        focus.append("line").attr("class", "crosshair").attr("x1", 0).attr("x2", width).attr("stroke", "#475569").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");

        const metricsGroup = svg.append("g").attr("class", "metrics-box").attr("transform", `translate(${width - 150}, 10)`).style("display", "none").style("font-size", "12px").attr("fill", "#334155");
        metricsGroup.append("text").attr("class", "label").attr("y", 0).text("Cursor Position:").style("font-weight", "600");
        const timeText = metricsGroup.append("text").attr("y", 15);
        const priceText = metricsGroup.append("text").attr("y", 30);
        metricsGroup.append("text").attr("class", "label").attr("y", 50).text("Nearby Bets:").style("font-weight", "600");
        const countText = metricsGroup.append("text").attr("y", 65);
        const avgPriceText = metricsGroup.append("text").attr("y", 80);
        const avgStakeText = metricsGroup.append("text").attr("y", 95);

        svg.append("rect").attr("width", width).attr("height", height).style("fill", "none").style("pointer-events", "all")
            .on("mouseover", () => { focus.style("display", null); metricsGroup.style("display", null); })
            .on("mouseout", () => { focus.style("display", "none"); metricsGroup.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove(event) {
            const [pointerX, pointerY] = d3.pointer(event, this);
            focus.select("line.crosshair[y1='0']").attr("x1", pointerX).attr("x2", pointerX);
            focus.select("line.crosshair[x1='0']").attr("y1", pointerY).attr("y2", pointerY);

            const timeVal = x.invert(pointerX);
            const priceVal = y.invert(pointerY);
            timeText.text(`Time: ${timeVal.toFixed(1)}h`);
            priceText.text(`Price: $${priceVal.toFixed(2)}`);

            const radius = 40;
            const nearbyPoints = dataset.filter(d => {
                const dx = x(d.time) - pointerX;
                const dy = y(d.price) - pointerY;
                return dx * dx + dy * dy < radius * radius;
            });

            if (nearbyPoints.length > 0) {
                countText.text(`Count: ${nearbyPoints.length}`);
                avgPriceText.text(`Avg Price: $${d3.mean(nearbyPoints, d => d.price).toFixed(2)}`);
                avgStakeText.text(`Avg Stake: ${d3.mean(nearbyPoints, d => d.stake).toFixed(0)}`);
            } else {
                countText.text("Count: 0");
                avgPriceText.text("Avg Price: N/A");
                avgStakeText.text("Avg Stake: N/A");
            }
        }

        d3Container.initialized = true;

    }, [d3Container]); // Empty dependency array ensures this effect runs only once on mount.

    // The component's rendered output
    return (
        <div className="container mx-auto p-4 lg:p-8 bg-white rounded-2xl shadow-lg max-w-5xl">
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Token Probability Distribution</h1>
            <p className="text-center text-slate-500 mb-6">Green highlight shows high-confidence areas (&gt;75% cumulative probability)</p>
            <div ref={chartContainerRef} className="w-full h-[500px] relative" />
        </div>
    );
};

// --- HOW TO USE IN NEXT.JS ---
// 1. Save this code as a component, e.g., `/components/KdePriceChart.js`
// 2. In your Next.js page (e.g., `/app/page.js`), import and use it like this:
/*
import KdePriceChart from '@/components/KdePriceChart';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <KdePriceChart />
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