import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function linechart_one() {
    const dataURL = "/data/droughts_child_marriage.json";

    // Fetch the data from the JSON file
    const data = await d3.json(dataURL);

    // Sort data by wealth quintile in descending order
    data.sort((a, b) => {
        const order = ["Richest", "Richer", "Middle", "Poorer", "Poorest"];
        return order.indexOf(a["Wealth quintile"]) - order.indexOf(b["Wealth quintile"]);
    });

    // Set dimensions and margins for the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Remove any existing SVG before appending a new one
    d3.select("#areachart_child_marriage").select("svg").remove();

    // Append the SVG object to the body of the page
    const svg = d3.select("#linechart_child_marriage")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleBand()
        .domain(data.map(d => d["Wealth quintile"]))
        .range([0, width])
        .padding(0.1);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Proportion of women married before 18 (%)"])])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + "%"));

    // Define the area generator
    const areaGenerator = d3.area()
        .x(d => x(d["Wealth quintile"]) + x.bandwidth() / 2) // Center the area in the band
        .y0(height)
        .y1(d => y(d["Proportion of women married before 18 (%)"]));

    // Add the area
    svg.append("path")
        .datum(data)
        .attr("fill", "#cce5df")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 1.5)
        .attr("d", areaGenerator);

    // Create a tooltip
    const tooltip = d3.select("body").append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("position", "absolute")
        .style("color", "black"); // Set tooltip text color to black

    // Add dots and tooltips
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d["Wealth quintile"]) + x.bandwidth() / 2)
        .attr("cy", d => y(d["Proportion of women married before 18 (%)"]))
        .attr("r", 5)
        .attr("fill", "#69b3a2")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Wealth quintile: ${d["Wealth quintile"]}<br>Proportion married before 18: ${d["Proportion of women married before 18 (%)"]}%`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

linechart_one(); // Call the function to render the chart




export { linechart_one }
