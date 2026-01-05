import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const dataURL = "/data/homicides.json";

async function barchart_two() {
  const margin = { top: 20, right: 80, bottom: 20, left: 40 };
  const width = 560 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svgContainer = d3.select("#barchart_two");
  const existingSVG = svgContainer.select("svg");
  if (!existingSVG.empty()) {
    existingSVG.remove(); // Remove the existing SVG if it's there
  }
  const svg = svgContainer
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )

    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Load the data from JSON
  const jsonData = await d3.json(dataURL);

  // X axis
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(jsonData.map((d) => d.Homicides))
    .padding(0.2);
  const xAxisGroup = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0)); // Set tick size to 0 to remove the tick lines

  // Change color of the x-axis line
  xAxisGroup.select(".domain").attr("stroke", "#ccc"); // Red color for the x-axis line

  xAxisGroup
    .selectAll("text")
    .attr("dy", "1em") // Moves text down from the x-axis
    // .style("text-anchor", "end")
    .style("font-family", "Arial")
    .style("color", "grey")
    .style("font-size", "14px");

  // Add Y axis
  const minYValue = 1395;
  const maxYValue = d3.max(jsonData, (d) => d.Rates);
  const y = d3
    .scaleLinear()
    .domain([minYValue, maxYValue])
    .range([height, 0])
    .nice();
  const yAxisGroup = svg.append("g").call(d3.axisLeft(y).tickSize(0));

  // Change color of the y-axis line
  yAxisGroup.select(".domain").attr("stroke", "#ccc"); // Blue color for the y-axis line

  yAxisGroup
    .selectAll("text")
    .attr("dx", "-0.5em") // Moves text left from the y-axis
    .style("font-family", "Arial")
    .style("color", "grey")
    .style("font-size", "12px");

  // Bars
  svg
    .selectAll("mybar")
    .data(jsonData)
    .join("rect")
    .attr("x", (d) => x(d.Homicides))
    .attr("y", (d) => y(d.Rates))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.Rates))
    .attr("fill", "#69b3a2");
}

// Call the function to render the chart
barchart_two();

export { barchart_two };
