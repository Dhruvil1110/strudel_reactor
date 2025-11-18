import { useEffect, useRef } from "react";
import console_monkey_patch, { getD3Data } from "../console-monkey-patch";
import * as d3 from "d3";

export default function Graph() {
    const ref = useRef(null);

    useEffect(() => {
        const svg = d3.select(ref.current);    // Select the SVG element
        const width = svg.node().clientWidth;  // Get SVG width
        const height = svg.node().clientHeight;  // Get SVG height

        svg.selectAll("*").remove();   // Clear previous contents

        // Set up x scale
        const xScale = d3.scaleLinear()
            .domain([0, 50])          
            .range([40, width - 10]); 
        // Set up y scale
        const yScale = d3.scaleLinear()
            .domain([0, 30])           
            .range([height - 30, 10]); 

        
        const xAxis = d3.axisBottom(xScale).ticks(10); // Create x-axis
        const yAxis = d3.axisLeft(yScale).ticks(10);   // Create y-axis

        // Get data from custom console event
        svg.append("g")
            .attr("transform", `translate(0, ${height - 30})`)
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#888");

        svg.append("g")
            .attr("transform", `translate(40, 0)`)
            .call(yAxis)
            .selectAll("text")
            .style("fill", "#888");

        svg.selectAll("path, line")
            .style("stroke", "#444")
            .style("color", "#444");
    }, []);

    return (
        <div className="panel graph-panel">
            <div style={{ padding: "10px" }}>
                <svg
                    ref={ref}
                    width="100%"
                    height="300px"
                    style={{ border: "1px solid #555", background: "#111" }}
                ></svg>
            </div>
        </div>
    );
}
