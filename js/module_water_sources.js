import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const dataURL = "./data/water_sources.json"; // Make sure this path is correct for your setup

async function barchart() {
    const margin = { top: 60, right: 100, bottom: 0, left: 250 }; // Adjust right margin for legend
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Append the SVG object to the body of the page
    const svgContainer = d3.select("#barchart");
    const existingSVG = svgContainer.select("svg");
    if (!existingSVG.empty()) {
        existingSVG.remove();  // Remove the existing SVG if it's there
    }
    const svg = svgContainer
        .append("svg")
        .attr("id", "barchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


  

    // Parse the Data
    const data = await d3.json(dataURL);
    let currentArea = 'Arid area'; // Start with 'Arid area' by default

    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "left")
        .style("padding", "8px")
        .style("background", "white")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("color", "black"); // Set the text color to black

    // Scales and axes
    const y = d3.scaleBand()
        .range([0, height])
        .padding(0.3);

    const x = d3.scaleLinear()
        .range([0, width]);

        svg.append("g")
        .attr("class", "barchart_x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .call(g => g.select(".domain").remove())  // Remove the default axis path
        .call(g => g.selectAll(".tick line").remove());  // Remove the tick lines
    
    

    svg.append("g")
        .attr("class", "barchart_y-axis")
        .call(d3.axisLeft(y).tickSize(0))  // Set tick size to 0 to remove the ticks
        .selectAll("text")
        .attr("transform", "translate(-5)")
        .attr("dy", "0.35em") // Adjust vertical alignment for y-axis labels
        .style("font-family", "Inter")
        // .style("font-size", "14px")
        .style("text-anchor", "end");

        // Remove the y-axis line
    svg.select(".barchart_y-axis path").style("stroke", "none");


    // Function to update the chart
    function updateChart(areaData) {
        // Update the x-axis domain based on the new data
        x.domain([0, d3.max(Object.values(areaData), d => Math.max(d['Dry season'], d['Wet season']))]);

        // Update the x-axis with the new domain
        svg.select(".barchart_x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x));

        // Update the y-axis domain based on the new data
        y.domain(Object.keys(areaData));

        // Update the y-axis with the new domain
        svg.select(".barchart_y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y).tickSize(0));

        // Clear previous bars
        svg.selectAll(".bar-group").remove();

        // Create grouped bars
        const barGroup = svg.selectAll(".bar-group")
            .data(Object.entries(areaData))
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", d => `translate(0, ${y(d[0])})`);

        const seasonColors = { 'Dry season': '#69b3a2', 'Wet season': '#f2a671' };
        const seasons = ['Dry season', 'Wet season'];
        const barWidth = y.bandwidth() / seasons.length;

        seasons.forEach((season, i) => {
            barGroup.append("rect")
                .attr("class", `bar ${season.replace(/\s+/g, '-')}`)
                .attr("x", 0)
                .attr("y", i * barWidth)
                .attr("width", d => x(d[1][season]))
                .attr("height", barWidth - 1)
                .attr("fill", seasonColors[season])
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`<b>Source:</b> ${d[0]}<br><b>${season}:</b> ${d[1][season]}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });
    }

    // Function to handle button clicks
    function handleButtonClick(area) {
        // Update the current area
        currentArea = area;

        // Update the chart with the new data
        updateChart(data[currentArea]['Sources of water']);

        // Remove the 'active' class from all buttons
        d3.selectAll(".segment-button").classed("active", false);

        // Add the 'active' class to the clicked button
        if (currentArea === 'Arid area') {
            d3.select("#aridButton").classed("active", true);
        } else {
            d3.select("#humidButton").classed("active", true);
        }
    }

    // Set initial state
    handleButtonClick('Arid area');

    // Button click events
    d3.select("#aridButton").on("click", () => handleButtonClick('Arid area'));
    d3.select("#humidButton").on("click", () => handleButtonClick('Humid area'));

    // Define legend data
    const legendData = [
        { color: "#69b3a2", label: "Dry Season", key: "Dry-season" },
        { color: "#f2a671", label: "Wet Season", key: "Wet-season" }
    ];

    

    // Create the legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, -40)`); // Move the legend above the chart

    legend.selectAll("rect")
        .data(legendData)
        .enter().append("rect")
        .attr("x", (d, i) => i * 100) // Position rectangles side by side
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", d => d.color)
        .attr("class", d => `legend-rect ${d.key}`)
        .style("cursor", "pointer")
        .on("click", (event, d) => toggleBars(d.key));

    legend.selectAll("text")
        .data(legendData)
        .enter().append("text")
        .attr("x", (d, i) => i * 100 + 20) // Position text next to the corresponding rectangle
        .attr("y", 13) // Align text vertically with the rectangle
        .text(d => d.label)
        .style("cursor", "pointer")
        .style("fill", "white") // Set text color
        .style("font-family", "Inter")
        .style("font-size", "12px") // Set font size
        .on("click", (event, d) => toggleBars(d.key));

    // Function to toggle bars based on legend item clicked
    function toggleBars(season) {
        const bars = svg.selectAll(`.bar.${season}`);
        const isVisible = bars.style("display") !== "none";
        bars.style("display", isVisible ? "none" : "initial");
    }
}

barchart(); // Call the function to render the chart

export { barchart };



