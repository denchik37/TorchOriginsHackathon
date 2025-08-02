"use client"

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { cn } from '@/lib/utils'

interface KDEChartProps {
  className?: string
  currentPrice: number
}

export function KDEChart({ className, currentPrice }: KDEChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const d3Container = useRef({ initialized: false }).current

  useEffect(() => {
    if (!chartContainerRef.current || d3Container.initialized) {
      return
    }

    // --- 1. MOCK DATA GENERATION ---
    const generateMockData = () => {
      const data = []
      const numPoints = 400
      // Create a few clusters of data to make the density plot interesting
      for (let i = 0; i < numPoints; i++) {
        let time, price
        const rand = Math.random()
        if (rand < 0.6) { // Cluster 1: Early, low price
          time = d3.randomNormal(20, 10)()
          price = d3.randomNormal(3, 1)()
        } else if (rand < 0.9) { // Cluster 2: Mid-time, rising price
          time = d3.randomNormal(70, 15)()
          price = d3.randomNormal(8, 2)()
        } else { // Outliers
          time = Math.random() * 140
          price = Math.random() * 18
        }
        
        // Ensure data points are within the defined chart bounds
        time = Math.max(0, Math.min(140, time))
        price = Math.max(0, Math.min(18, price))

        data.push({
          time: time,
          price: price,
          stake: Math.random() * 1000 // Random stake size
        })
      }
      return data
    }

    const dataset = generateMockData()

    // --- 2. CHART SETUP ---
    const container = chartContainerRef.current
    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = container.clientWidth - margin.left - margin.right
    const height = container.clientHeight - margin.top - margin.bottom

    // Clear any previous SVG to prevent duplicates on re-render
    d3.select(container).selectAll("*").remove()

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // --- 3. SCALES & AXES ---
    const x = d3.scaleLinear().domain([0, 140]).range([0, width])
    const y = d3.scaleLinear().domain([0, 18]).range([height, 0])
    const opacityScale = d3.scaleLinear().domain(d3.extent(dataset, (d: any) => d.stake) as [number, number] || [0, 1000]).range([0.2, 1.0])

    // Gridlines and Axes
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(null))
      .selectAll("line")
      .attr("stroke", "#1C1C1E")
      .attr("stroke-dasharray", "2,2")

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .select(".domain")
      .attr("stroke", "#8E8E93")
      .selectAll("text")
      .attr("fill", "#8E8E93")

    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 15)
      .text("Time (hours)")
      .attr("fill", "#8E8E93")
      .style("font-size", "14px")
      .style("font-weight", "500")

    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(null))
      .selectAll("line")
      .attr("stroke", "#1C1C1E")
      .attr("stroke-dasharray", "2,2")

    svg.append("g")
      .call(d3.axisLeft(y))
      .select(".domain")
      .attr("stroke", "#8E8E93")
      .selectAll("text")
      .attr("fill", "#8E8E93")

    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .text("Price (USD)")
      .attr("fill", "#8E8E93")
      .style("font-size", "14px")
      .style("font-weight", "500")

    // --- 4. KERNEL DENSITY ESTIMATE (KDE) ---
    const densityData = d3.contourDensity()
      .x((d: any) => x(d.time))
      .y((d: any) => y(d.price))
      .size([width, height])
      .bandwidth(30)(dataset as any)

    // Use purple theme for density colors
    const densityColor = d3.scaleSequential(d3.interpolatePurples)
      .domain([0, d3.max(densityData, (d: any) => d.value) || 0])

    // --- 5. RENDER THE VISUALIZATION ---
    svg.append("g")
      .selectAll("path")
      .data(densityData)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", (d: any) => densityColor(d.value))
      .style("opacity", 0.9)

    const maxDensity = d3.max(densityData, (d: any) => d.value)
    const confidenceThreshold = maxDensity * 0.25
    const confidenceContours = densityData.filter((d: any) => d.value > confidenceThreshold)

    svg.append("g")
      .selectAll("path.confidence")
      .data(confidenceContours)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", "#34C759")
      .attr("fill-opacity", 0.4)
      .attr("stroke", "#34C759")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 1)

    const tooltip = d3.select(container)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("text-align", "center")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("background", "#1C1C1E")
      .style("color", "#EAEAEB")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("border", "1px solid #8E8E93")

    svg.append("g")
      .selectAll("line")
      .data(dataset)
      .enter()
      .append("line")
      .attr("x1", (d: any) => x(d.time))
      .attr("y1", (d: any) => y(d.price - 0.2))
      .attr("x2", (d: any) => x(d.time))
      .attr("y2", (d: any) => y(d.price + 0.2))
      .attr("stroke", "#FF2D55")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", (d: any) => opacityScale(d.stake))
      .on("mouseover", (event: any, d: any) => {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9)
        tooltip.html(`Price: $${d.price.toFixed(2)}<br>Time: ${d.time.toFixed(1)}h<br>Stake: ${d.stake.toFixed(0)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))

    // --- 6. INTERACTIVE METRICS & CROSSHAIR ---
    const focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none")

    focus.append("line")
      .attr("class", "crosshair")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#8E8E93")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")

    focus.append("line")
      .attr("class", "crosshair")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", "#8E8E93")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")

    const metricsGroup = svg.append("g")
      .attr("class", "metrics-box")
      .attr("transform", `translate(${width - 150}, 10)`)
      .style("display", "none")
      .style("font-size", "12px")
      .attr("fill", "#EAEAEB")

    metricsGroup.append("text")
      .attr("class", "label")
      .attr("y", 0)
      .text("Cursor Position:")
      .style("font-weight", "600")

    const timeText = metricsGroup.append("text").attr("y", 15)
    const priceText = metricsGroup.append("text").attr("y", 30)

    metricsGroup.append("text")
      .attr("class", "label")
      .attr("y", 50)
      .text("Nearby Bets:")
      .style("font-weight", "600")

    const countText = metricsGroup.append("text").attr("y", 65)
    const avgPriceText = metricsGroup.append("text").attr("y", 80)
    const avgStakeText = metricsGroup.append("text").attr("y", 95)

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        focus.style("display", null)
        metricsGroup.style("display", null)
      })
      .on("mouseout", () => {
        focus.style("display", "none")
        metricsGroup.style("display", "none")
      })
      .on("mousemove", mousemove)

    function mousemove(event: any) {
      const [pointerX, pointerY] = d3.pointer(event, event.currentTarget)
      focus.select("line.crosshair[y1='0']")
        .attr("x1", pointerX)
        .attr("x2", pointerX)
      focus.select("line.crosshair[x1='0']")
        .attr("y1", pointerY)
        .attr("y2", pointerY)

      const timeVal = x.invert(pointerX)
      const priceVal = y.invert(pointerY)
      timeText.text(`Time: ${timeVal.toFixed(1)}h`)
      priceText.text(`Price: $${priceVal.toFixed(2)}`)

      const radius = 40
      const nearbyPoints = dataset.filter((d: any) => {
        const dx = x(d.time) - pointerX
        const dy = y(d.price) - pointerY
        return dx * dx + dy * dy < radius * radius
      })

      if (nearbyPoints.length > 0) {
        countText.text(`Count: ${nearbyPoints.length}`)
        const avgPrice = d3.mean(nearbyPoints, (d: any) => d.price)
        const avgStake = d3.mean(nearbyPoints, (d: any) => d.stake)
        avgPriceText.text(`Avg Price: $${avgPrice ? avgPrice.toFixed(2) : '0.00'}`)
        avgStakeText.text(`Avg Stake: ${avgStake ? avgStake.toFixed(0) : '0'}`)
      } else {
        countText.text("Count: 0")
        avgPriceText.text("Avg Price: N/A")
        avgStakeText.text("Avg Stake: N/A")
      }
    }

    d3Container.initialized = true

  }, [d3Container])

  return (
    <div className={cn("w-full", className)}>
      <div className="text-sm text-medium-gray mb-2">
        2D Probability Density Distribution (Kernel Density Estimation)
      </div>
      <div ref={chartContainerRef} className="w-full h-[500px] relative" />
    </div>
  )
} 