const margin = { top: 40, right: 40, bottom: 40, left: 90 };
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
    .attr("width", (width + margin.left + margin.right)/2 + 100)
    .attr("height", (height + margin.top + margin.bottom) / 2);


    d3.json("final.json").then(function(data){

        const x = d3
            .scaleLinear()
            .domain([0,40])
            .range([0, (width + margin.right)/2 + 50]);
        
        //console.log(data)

        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(20, ${height/2})`)
            .call(d3.axisBottom(x).tickFormat(function(d, i) {
                return d + " - " + (d + 5)
            }));

        const y = d3
            .scaleLinear() //TODO change scale
            .domain([50,0])
            .range([0, height/2 - margin.top]);
      
        svg
            .append("g")
            .attr("id", "gYAxis").attr("transform", `translate(20,20)`)
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal().domain([0,5]).range(['red','blue', 'yellow','green', 'black', 'orange'])
        var line = d3.line()
            .x(function(d){return d.Tracks;})
            .y(function(d){return d.Sales;})

        // group the data: I want to draw one line per group
        var sumstat = d3.group(data, d => d.Genre)
        console.log(sumstat)
        //TODO make this work (sorting)
        /*if(sumstat) {
            sumstat.array.forEach(element => {
                element.sort((a, b) => a.Tracks - b.Tracks)
            });
        }*/

        svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", line);


        var tmp = data.filter(d => d.Genre == "Pop").sort((a, b) => a.Tracks - b.Tracks)
        
        //Works only for Pop + need to sort according to nbr of Tracks. Needs to be upgrade with multiple lines
        /*svg
            .append("path")
            .datum(tmp)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Tracks) })
            .y(function(d) { return y(parseInt(d.Sales))}));

        //plot the circles
        svg
            .selectAll("circle.circleValues") 
            .data(tmp, (d) => d.FIELD1) 
            .join("circle")
            .attr("class", "circleValues itemValue")
            .attr("cx", (d) => x(d.Tracks))
            .attr("cy", (d) => y(parseInt(d.Sales)))
            .attr("r", 4)
            .style("fill", "steelblue");*/
        
    });

}

function createDualAxisLineChart(id){
    const svg = d3
    .select(id)
    .attr("width", (width + margin.left + margin.right)/2 + 70)
    .attr("height", (height + margin.top + margin.bottom) / 2);

    d3.json("final.json").then(function(data){

        const x = d3
            .scalePoint()
            .domain(data.filter(d => d.Year % 5 == 0).map(d => d.Year))
            .range([0, (width + margin.right)/2 + 70]);
        
        //console.log(data)

        svg
        .append("g")
        .attr("id", "gXAxis")
        .attr("transform", `translate(25, ${height/2})`)
        .call(d3.axisBottom(x).ticks(10));
        
        //First y-axis
        const y = d3
            .scaleLinear() //TODO change scale
            .domain([5,0])
            .range([0, height/2 - margin.top]);
      
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("transform", `translate(20 ,20)`)
            .call(d3.axisLeft(y));

        //Second y-axis
        const y2 = d3
            .scaleLinear()
            .domain([50,0])
            .range([0, height/2 - margin.top]);
            
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("transform", `translate(${(width + margin.left + margin.right)/2 + 50} ,20)`)
            .call(d3.axisRight(y2));
        
        //TODO no hardcoding
        var map = new Map()
        var list = [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021]
        list.forEach(e => map.set(e, d3.mean(data.filter(d => d.Year == e).map(d => d.AvgSongLength))))

        /*svg
            .append("path")
            .datum(???) //TODO create a json array with the map
            .attr("class", "pathValue") 
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr(
              "d",
              d3
                .line()
                .x((d) => x(d.Year))
                .y((d) => y(d.AvgSongLength))
            );*/
        });
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