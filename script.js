const margin = { top: 40, right: 40, bottom: 40, left: 40 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

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
    .attr("height", height + margin.top + margin.bottom);


    d3.json("final.json").then(function(data){

        const x = d3
            .scaleLinear()
            .domain([0,45])
            .range([0, width]);
        
        //console.log(data)

        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(20, ${height + 20})`)
            .call(d3.axisBottom(x).tickFormat(function(d, i) {
                return d + " - " + (d + 5)
            }));

        const y = d3
            .scaleLinear() //TODO change scale
            .domain([50,0])
            .range([0, height]);
      
        svg
            .append("g")
            .attr("id", "gYAxis").attr("transform", `translate(20,20)`)
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal().domain([0,5]).range(['red','blue', 'yellow','green', 'black', 'orange'])
    
        var listOfGenre = ["Pop", "Rock", "R&B", "Hip Hop", "Country"]
        var tmp = []
        //TODO no hardcoding
        var list = [5,10,15,20,25,30,35,40,45]
        var map = new Map()

        listOfGenre.forEach(elem => {
            tmp = data.filter(d => d.Genre == elem).sort((a, b) => a.Tracks - b.Tracks)

            map = new Map()
            list.forEach(e => {
                mean = d3.mean(tmp.filter(d => Math.ceil(d.Tracks/5)*5 == e).map(z => parseInt(z.Sales.replace(/,/g, ''))))
                if(mean == undefined){
                    mean = 0
                }
                map.set(e, mean / 1000000)
            })

            svg
                .append("path")
                .datum(map)
                .attr("fill", "none")
                .attr("stroke", color(listOfGenre.indexOf(elem)))
                .attr("stroke-width", 1.5)
                .attr("d", d3.line().curve(d3.curveNatural)
                    .x(function(d) { return x(d[0]) })
                    .y(function(d) { return y(d[1])}));//TODO parseInt not working

            //plot the circles
            svg
                .selectAll("circle")
                .append("g")
                .data(map)
                .enter()
                .append("circle")
                .attr("cx", (d) => x(d[0]))
                .attr("cy", (d) => y(d[1]))
                .attr("r", 4)
                .style("fill", color(listOfGenre.indexOf(elem))); //TODO arrange colors fo circles + plot every circle

        });

    });
    

}

function createDualAxisLineChart(id){
    const svg = d3
    .select(id)
    .attr("width", (width + margin.left + margin.right))
    .attr("height", (height + margin.top + margin.bottom));

    d3.json("final.json").then(function(data){

        const x = d3
            .scalePoint()
            .domain(data.filter(d => d.Year % 5 == 0).map(d => d.Year))
            .range([0, width]);
        
        //console.log(data)

        svg
        .append("g")
        .attr("id", "gXAxis")
        .attr("transform", `translate(25, ${height + 20})`)
        .call(d3.axisBottom(x).ticks(10));
        
        //First y-axis
        const y = d3
            .scaleLinear() //TODO change scale
            .domain([8, 0])
            .range([0, height]);
      
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("stroke", "#c71585")
            .attr("transform", `translate(25 ,20)`)
            .call(d3.axisLeft(y));

        //TODO change color axis

        //Second y-axis
        const y2 = d3
            .scaleLinear()
            .domain([50,0])
            .range([0, height]);
            
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("transform", `translate(${width + 25} ,20)`)
            .attr("stroke", "#008b8b")
            .attr("fill", "red")
            .call(d3.axisRight(y2));
        
        //TODO no hardcoding
        var map = new Map()
        var list = [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021]
        list.forEach(e => {
            mean = d3.mean(data.filter(d => d.Year == e).map(d => d.AvgSongLength))
            map.set(e, mean)
        })
        console.log(map)

        svg
            .append("path")
            .datum(map)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                    .x(function(d) { return x(d[0])})
                    .y(function(d) { return y(d[1])}));
    });

}

function createHeatmap(id){
    const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
}

function createSankeyDiagram(id){
    const svg = d3
    .select(id)
    .attr("width", width/3)
    .attr("height", height + margin.top + margin.bottom);
}