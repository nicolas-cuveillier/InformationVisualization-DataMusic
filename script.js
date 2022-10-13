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
    .attr("width", (width + margin.left + margin.right)/2)
    .attr("height", (height + margin.top + margin.bottom) / 2);


    d3.csv("final.csv").then(function(data){
        const x = d3
        .scaleLinear()
        .domain([0, 10])
        .range([0, width/2]);
        
        console.log(data[1])

        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(5, ${height/2})`)
            .call(d3.axisBottom(x));

        const y = d3
            .scaleBand()
            .domain([0, 10])
            .range([0, height/2])
            .padding(1);
      
          svg
            .append("g")
            .attr("id", "gYAxis").attr("transform", `translate(8,3)`)
            .call(d3.axisLeft(y));
        
    });

}

function createDualAxisLineChart(id){
    const svg = d3
    .select(id)
    .attr("width", (width + margin.left + margin.right)/2)
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
    .attr("width", width/3)
    .attr("height", height + margin.top + margin.bottom);
}