import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function linechart_violence() {
  const dataURL = "/data/domestic_violence_reports.json";

  // Fetch the data from the JSON file
  const data = await d3.json(dataURL);

  // Parse the date / time
  const parseTime = d3.timeParse("%m/%d/%y");
  data.forEach(function (d) {
    d.date = parseTime(d.Homicides);
    d.value = +d["Family violence calls"];
  });

  // Set dimensions and margins for the graph
  const margin = { top: 20, right: 80, bottom: 50, left: 40 },
    width = 560 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // Remove any existing SVG before appending a new one
  d3.select("#linechart_violence").select("svg").remove();

  // Append the SVG object to the body of the page
  const svg = d3
    .select("#linechart_violence")
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add X axis
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);
  const xAxisGroup = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0)); // No tick lines, retain text
  xAxisGroup
    .select(".domain")
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,2");

  xAxisGroup
    .selectAll("text")
    .style("font-family", "Arial")
    .style("font-size", "10px")
    .attr("fill", "grey")
    .attr("dy", "15px");

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([height, 0]);
  const yAxisGroup = svg.append("g").call(
    d3
      .axisLeft(y)
      .tickValues(d3.range(0, d3.max(data, (d) => d.value) + 20, 20))
      .tickSize(-width)
  );

  // Remove the top line by not extending the domain above the highest tick
  yAxisGroup.select(".domain").remove(); // Removes the main y-axis line entirely
  yAxisGroup
    .selectAll(".tick line")
    .attr("stroke", "#ccc") // Light gray color for grid lines
    .attr("stroke-dasharray", "2,2"); // Dashed lines for aesthetics

  yAxisGroup
    .selectAll("text")
    .style("font-family", "Arial")
    .style("font-size", "12px")
    .attr("fill", "grey")
    .attr("dx", "-5px");

  // Draw the line
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#D13F00")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.value))
    );

  // Tooltip setup
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "10px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("text-align", "center")
    .style("pointer-events", "none")
    .style("color", "black"); // Make tooltip text black

  // Add circles for each data point for tooltips
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 3) // Adjusted the radius to make smaller dots
    .attr("cx", (d) => x(d.date))
    .attr("cy", (d) => y(d.value))
    .attr("fill", "#D13F00")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(`Date: ${d.date.toLocaleDateString()} <br/> Calls: ${d.value}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

linechart_violence();

export { linechart_violence };
