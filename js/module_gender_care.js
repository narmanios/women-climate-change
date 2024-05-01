import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function linechart_caretaking() {
    const dataURL = "/data/gender_care.json";

    // Fetch the data from the JSON file
    const data = await d3.json(dataURL);

    // Combine all data points into a single array and sort by female_pct
    const combinedData = Object.entries(data).flatMap(([country, values]) =>
        values.map(d => ({ country, ...d }))
    ).sort((a, b) => a['female'] - b['female']);

    // Set dimensions and margins for the graph
    const margin = { top: 80, right: 80, bottom: 50, left: 80 },
        width = 1060 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // Remove any existing SVG before appending a new one
    d3.select("#linechart_caretaking").select("svg").remove();

    // Append the SVG object to the body of the page
    const svg = d3.select("#linechart_caretaking")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, combinedData.length - 1])
        .range([0, width]);

    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        // .call(d3.axisBottom(x).tickSize(0))
        .select("path").style("display", "none")
        .selectAll("text")
        .attr("dy", "1em")
        // .attr("dx", "-1.5em")
        .attr("fill", "white");





// Add Y axis
const y = d3.scaleLinear()
    .domain([0, d3.max(combinedData, d => Math.max(d['male'], d['female']))])
    .range([height - 0, 20]); 

const yAxis = d3.axisLeft(y).tickSize(0).ticks(10);
const yAxisGroup = svg.append("g").call(yAxis)
        .select("path").style("display", "none");

// Calculate the y positions for each tick on the y-axis
const yTicks = yAxis.scale().ticks();
yTicks.forEach(tick => {
    svg.append("line")
        .attr("class", "horizontal-line")
        .attr("x1", 0)
        .attr("y1", y(tick))
        .attr("x2", width)
        .attr("y2", y(tick))
        .attr("stroke", "white")
        .attr("stroke-dasharray", "3")
        .attr("opacity", 0.5);
});



    // Remove Y axis line
    yAxisGroup.select(".path").style("display", "none");



    // Add label for Y axis
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text("Unpaid hours working");

        

    // Define color for men and women
    const color = {
        "male": "#FFE34E", // Assigning steelblue color for men
        "female": "#23DB1D"   // Assigning salmon color for women
    };

    // Draw lines connecting female_pct and male_pct
    svg.selectAll(".connection-line")
        .data(combinedData)
        .enter().append("line")
        .attr("class", "connection-line")
        .attr("x1", (d, i) => x(i)) // x-coordinate for female_pct
        .attr("y1", d => y(d['female'])) // y-coordinate for female_pct
        .attr("x2", (d, i) => x(i)) // x-coordinate for male_pct
        .attr("y2", d => y(d['male'])) // y-coordinate for male_pct
        .attr("stroke", "gray") // Color of the line
        .attr("stroke-width", 1) // Thickness of the line
        // .attr("stroke-dasharray", "4") // Dashed line style

// Draw circles for female_pct with tooltips
svg.selectAll(".female-circle")
    .data(combinedData)
    .enter().append("circle")
    .attr("class", "female-circle")
    .attr("cx", (d, i) => x(i)) // x-coordinate for female_pct
    .attr("cy", d => y(d['female'])) // y-coordinate for female_pct
    .attr("r", 5) // Radius of the circle
    .attr("fill", color["female"]) // Assigning color for female_pct
    .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 7); // Increase radius on mouseover
        
        const tooltipText = `${d.country}:\n\n Female - ${d['female'].toFixed(1)} hours,\nMale - ${d['male'].toFixed(1)} hours`;
        const textWidth = 200; // Width of the tooltip rectangle
        const lineHeight = 20; // Height of each line
        const lines = wrapText(tooltipText, textWidth); // Wrap text into lines
        
        const tooltipHeight = lines.length * lineHeight + 10; // Calculate tooltip height
        
        const tooltip = svg.append("g")
            .attr("class", "tooltip")
            .attr("transform", `translate(${x(combinedData.indexOf(d)) - textWidth / 2},${y(d['female']) - tooltipHeight - 20})`);

        tooltip.append("rect")
            .attr("width", textWidth)
            .attr("height", tooltipHeight) // Set height based on text lines
            .attr("fill", "white")
            .attr("stroke", "grey");

            lines.forEach((line, index) => {
                tooltip.append("text")
                    .attr("x", 10) // Set x-coordinate to start from the left
                    .attr("y", lineHeight * (index + 1))
                    .attr("text-anchor", "start") // Align text to the left
                    .attr("alignment-baseline", "middle")
                    .attr("fill", "black")
                    .attr("font-size", "12px") // Set font size
                    .text(line);
            });
        })
    .on("mouseout", function(event, d) {
        d3.select(this).attr("r", 5); // Reset radius on mouseout
        svg.select(".tooltip").remove();
    });

// Function to wrap text
function wrapText(text, width) {
    const words = text.split(/\s+/);
    let line = "";
    const lines = [];
    words.forEach(word => {
        const testLine = line + word + " ";
        const testWidth = getTextWidth(testLine, "14px Arial");
        if (testWidth > width) {
            lines.push(line);
            line = word + " ";
        } else {
            line = testLine;
        }
    });
    lines.push(line);
    return lines;
}

// Function to calculate text width
function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}



// Draw circles for male_pct with tooltips
svg.selectAll(".male-circle")
    .data(combinedData)
    .enter().append("circle")
    .attr("class", "male-circle")
    .attr("cx", (d, i) => x(i)) // x-coordinate for male_pct
    .attr("cy", d => y(d['male'])) // y-coordinate for male_pct
    .attr("r", 5) // Radius of the circle
    .attr("fill", color["male"]) // Assigning color for male_pct
    .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 7); // Increase radius on mouseover
        
        const tooltipText = `${d.country}:\n\nFemale - ${d['female'].toFixed(1)} hours,\nMale - ${d['male'].toFixed(1)} hours`;
        const textWidth = 200; // Width of the tooltip rectangle
        const lineHeight = 20; // Height of each line
        const lines = wrapText(tooltipText, textWidth); // Wrap text into lines
        
        const tooltipHeight = lines.length * lineHeight + 10; // Calculate tooltip height
        
        const tooltip = svg.append("g")
            .attr("class", "tooltip")
            .attr("transform", `translate(${x(combinedData.indexOf(d)) - textWidth / 2},${y(d['male']) + 20})`);

        tooltip.append("rect")
            .attr("width", textWidth)
            .attr("height", tooltipHeight) // Set height based on text lines
            .attr("fill", "white")
            .attr("stroke", "grey");

            lines.forEach((line, index) => {
                tooltip.append("text")
                    .attr("x", 10) // Set x-coordinate to start from the left
                    .attr("y", lineHeight * (index + 1))
                    .attr("text-anchor", "start") // Align text to the left
                    .attr("alignment-baseline", "middle")
                    .attr("fill", "black")
                    .attr("font-size", "12px") // Set font size
                    .text(line);
            });
        })
    .on("mouseout", function(event, d) {
        d3.select(this).attr("r", 5); // Reset radius on mouseout
        svg.select(".tooltip").remove();
    });




    // Add legend for male and female
    const legend = svg.append("g")
    .attr("transform", `translate(${0}, -10)`); 

    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", color["male"]);

    legend.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .attr("fill", "white")
        .text("Male");

    legend.append("circle")
        .attr("cx", 70)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", color["female"]);

    legend.append("text")
        .attr("x", 80)
        .attr("y", 5)
        .attr("fill", "white")
        .text("Female");
}

linechart_caretaking(); // Call the function to render the chart

export { linechart_caretaking };
