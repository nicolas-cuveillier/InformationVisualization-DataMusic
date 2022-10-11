const margin = { top: 20, right: 30, bottom: 40, left: 90 };
const width = 600 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

function init() {
    createCustomLineChart("#customLineChart")
    createDualAxisLineChart("#dualLineChart")
    createSankeyDiagram("#sankey")
    createHeatmap("#heatMap")
}

function createCustomLineChart(id){
    const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", (height + margin.top + margin.bottom) / 2);
}

function createDualAxisLineChart(id){
    const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", (height + margin.top + margin.bottom) / 2);
}

function createHeatmap(id){
    const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", (height + margin.top + margin.bottom) / 2);
}

function createSankeyDiagram(id){
    const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
}