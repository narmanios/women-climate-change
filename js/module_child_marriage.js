import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function linechart_one() {
    const dataURL = "/data/droughts_child_marriage.json";

    // Fetch the data from the JSON file
    const data = await d3.json(dataURL);

    // Set dimensions and margins for the graph
    const margin = { top: 80, right: 80, bottom: 50, left: 100 },
        width = 960 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // Remove any existing SVG before appending a new one
    d3.select("#linechart_child_marriage").select("svg").remove();

    // Append the SVG object to the body of the page
    const svg = d3.select("#linechart_child_marriage")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d['Frequency of drought episodes']))
        .range([0, width]);

    const xAxisGroup = svg.append("g")
        .call(d3.axisRight(x).tickSize(4.0).tickFormat(d => d > 4.0 ? d : ""))  // Exclude "0"
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("dy", "1em")
        .attr("dx", "-1.5em")

        .attr("fill", "white");

    // Add label for X axis below the axis
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + 40) // Position below the x-axis
        .attr("fill", "white")
        .attr("font-size", "14px")  // Increased font size for the Y axis title
        .attr("text-anchor", "middle")
        .text("Frequency of drought episodes");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['Proportion of women married before 18 (%)'])])
        .range([height, 0]);

    const yAxisGroup = svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickFormat(d => d > 0 ? d : ""))  // Exclude "0"
        .selectAll("text")
        .attr("dx", "-0.5em")
        .attr("fill", "white");

    // Add label for Y axis
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("fill", "white")
        .attr("font-size", "14px")

        .attr("text-anchor", "middle")
        .text("Proportion of women married before 18 (%)");

    // Color scale for wealth quintiles
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d['Wealth quintile']))
        .range(["#FFA100", "#FFE34E", "#79A778", "#22911F", "#37B333"]);

    // Group data by wealth quintile
    const groupedData = d3.group(data, d => d['Wealth quintile']);

    // Draw lines
    groupedData.forEach((value, key) => {
        svg.append("path")
            .datum(value)
            .attr("fill", "none")
            .attr("stroke", color(key))
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => x(d['Frequency of drought episodes']))
                .y(d => y(d['Proportion of women married before 18 (%)']))
            );
    });

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 750},-30)`);  // Positioning the legend

    legend.selectAll("rect")
        .data(color.domain())
        .enter().append("rect")
        .attr("x", (d, i) => i * 100)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);

    legend.selectAll("text")
        .data(color.domain())
        .enter().append("text")
        .attr("x", (d, i) => i * 100 + 20)
        .attr("y", 8)
        .attr("dy", ".35em")
        .attr("fill", "white")
        .text(d => d);
}

linechart_one(); // Call the function to render the chart

export { linechart_one };
